/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  FileText, 
  IndianRupee, 
  Percent, 
  TrendingDown, 
  User, 
  CheckCircle2, 
  Download, 
  Printer,
  X,
  CalendarDays,
  Clock
} from 'lucide-react';
import { Employee, AttendanceRecord, SalarySlip } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface PayrollViewProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  selectedEmpId?: string; // Deep-linked employee ID from navigation
  salarySlips: SalarySlip[];
  onApproveSalarySlip: (slip: SalarySlip) => void;
}

export default function PayrollView({
  employees,
  attendance,
  selectedEmpId,
  salarySlips = [],
  onApproveSalarySlip
}: PayrollViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('06'); // June as default
  const [selectedYear, setSelectedYear] = useState('2026');

  // Payslip Modal State
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  // Customized Payslip Fields mimicking Excel Sample
  const [companyName, setCompanyName] = useState('GlobeAlra Tech Private Limited');
  const [payDateDay, setPayDateDay] = useState('25');
  const [employeePF, setEmployeePF] = useState<number | null>(null);

  // Deep-link trigger if employee ID is passed
  useEffect(() => {
    if (selectedEmpId) {
      const match = employees.find(e => e.id === selectedEmpId);
      if (match) {
        setActiveEmployee(match);
        setIsPayslipOpen(true);
      }
    }
  }, [selectedEmpId, employees]);

  // Helper lists
  const months = [
    { value: '01', name: 'January' },
    { value: '02', name: 'February' },
    { value: '03', name: 'March' },
    { value: '04', name: 'April' },
    { value: '05', name: 'May' },
    { value: '06', name: 'June' },
    { value: '07', name: 'July' },
    { value: '08', name: 'August' },
    { value: '09', name: 'September' },
    { value: '10', name: 'October' },
    { value: '11', name: 'November' },
    { value: '12', name: 'December' },
  ];

  const years = ['2025', '2026', '2027'];

  // Helper to get total days in a selected month & year
  const getDaysInMonth = (monthStr: string, yearStr: string) => {
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10); // 1-12
    return new Date(year, month, 0).getDate();
  };

  // Basic logic to calculate payroll for a given employee and month
  const calculatePayroll = (emp: Employee) => {
    const monthlyBase = Math.round(emp.salary / 12);
    const totalDays = getDaysInMonth(selectedMonth, selectedYear);
    
    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;
    let halfDayCount = 0;

    const targetPrefix = `${selectedYear}-${selectedMonth}`;

    // Loop through each day of the month to build day-by-day roster history
    for (let day = 1; day <= totalDays; day++) {
      const dayStr = String(day).padStart(2, '0');
      const dateStr = `${targetPrefix}-${dayStr}`;

      // Check if we have a saved attendance record
      const match = attendance.find(
        record => record.employeeId === emp.id && record.date === dateStr
      );

      let status: string;
      if (match) {
        status = match.status;
      } else {
        // Fall back to department weekly policies for this calendar day
        const parts = dateStr.split('-');
        const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const dept = (emp.department || '').toLowerCase();

        if (dept === 'it' || dept === 'engineering') {
          if (dayOfWeek === 6 || dayOfWeek === 0) {
            status = 'Leave';
          } else {
            status = 'Present';
          }
        } else if (dept === 'infrastructure' || dept === 'infra') {
          if (dayOfWeek === 6) {
            status = 'Half-Day';
          } else if (dayOfWeek === 0) {
            status = 'Leave';
          } else {
            status = 'Present';
          }
        } else {
          if (dayOfWeek === 0) {
            status = 'Leave';
          } else {
            status = 'Present';
          }
        }
      }

      // Count status
      if (status === 'Present') presentCount++;
      else if (status === 'Absent') absentCount++;
      else if (status === 'Leave') leaveCount++;
      else if (status === 'Half-Day') halfDayCount++;
    }

    // Days worked calculations (Present + Paid Leaves + 0.5 * Half-Day)
    const paidDays = presentCount + leaveCount + (halfDayCount * 0.5);
    const unpaidDays = absentCount + (halfDayCount * 0.5);

    // Day-wise rate calculation
    const dailyRate = monthlyBase / totalDays;
    const earnedBase = Math.round(paidDays * dailyRate);
    
    // Allowance (15% on earned base)
    const allowances = Math.round(earnedBase * 0.15);

    // Loss of Pay Deduction for unpaid days
    const lopDeduction = Math.round(unpaidDays * dailyRate);

    // Tax/Insurance deduction (12% of earned base)
    const taxDeduction = Math.round(earnedBase * 0.12);

    const totalDeductions = lopDeduction + taxDeduction;
    const netSalary = earnedBase + allowances - taxDeduction;

    return {
      monthlyBase,
      totalDays,
      presentCount,
      absentCount,
      leaveCount,
      halfDayCount,
      paidDays,
      unpaidDays,
      dailyRate,
      earnedBase,
      allowances,
      lopDeduction,
      taxDeduction,
      totalDeductions,
      netSalary
    };
  };

  const filteredEmployees = employees.filter(
    emp => emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
           emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenPayslip = (emp: Employee) => {
    setActiveEmployee(emp);
    setIsPayslipOpen(true);
    setEmployeePF(null); // Reset overrides
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('payslip-print-canvas');
    if (!element || !activeEmployee) return;

    setIsPdfGenerating(true);

    // Backup and temporarily modify all style tags containing modern CSS color functions
    const styleElements = Array.from(document.querySelectorAll('style'));
    const styleBackups = new Map<HTMLStyleElement, string>();
    
    // Create temporary div to resolve colors using the browser's engine
    const tempDiv = document.createElement('div');
    tempDiv.style.display = 'none';
    document.body.appendChild(tempDiv);
    const resolvedColorCache = new Map<string, string>();

    const convertColorToRgb = (colorStr: string): string => {
      if (resolvedColorCache.has(colorStr)) {
        return resolvedColorCache.get(colorStr)!;
      }
      try {
        tempDiv.style.color = colorStr;
        const resolved = window.getComputedStyle(tempDiv).color;
        if (resolved && (resolved.startsWith('rgb') || resolved.startsWith('#'))) {
          resolvedColorCache.set(colorStr, resolved);
          return resolved;
        }
      } catch (e) {
        // ignore
      }
      return 'rgb(15, 23, 42)'; // Safe fallback
    };

    const replaceModernColors = (text: string): string => {
      const targets = ['oklch(', 'oklab(', 'color-mix(', 'light-dark('];
      let result = text;
      let found = true;
      
      while (found) {
        found = false;
        let lastIdx = -1;
        let selectedTarget = '';
        
        for (const target of targets) {
          const idx = result.lastIndexOf(target);
          if (idx > lastIdx) {
            lastIdx = idx;
            selectedTarget = target;
          }
        }
        
        if (lastIdx !== -1) {
          let parenCount = 1;
          let endIdx = -1;
          for (let i = lastIdx + selectedTarget.length; i < result.length; i++) {
            if (result[i] === '(') parenCount++;
            else if (result[i] === ')') parenCount--;
            
            if (parenCount === 0) {
              endIdx = i;
              break;
            }
          }
          
          if (endIdx !== -1) {
            const fullMatch = result.substring(lastIdx, endIdx + 1);
            const resolvedColor = convertColorToRgb(fullMatch);
            result = result.substring(0, lastIdx) + resolvedColor + result.substring(endIdx + 1);
            found = true;
          } else {
            break;
          }
        }
      }
      return result;
    };

    try {
      // Find and rewrite all style tags containing modern colors
      styleElements.forEach((styleEl) => {
        const text = styleEl.textContent;
        if (text && (text.includes('oklch(') || text.includes('oklab(') || text.includes('color-mix(') || text.includes('light-dark('))) {
          styleBackups.set(styleEl, text);
          styleEl.textContent = replaceModernColors(text);
        }
      });

      // Clean up the temporary helper div
      if (tempDiv.parentNode) {
        tempDiv.parentNode.removeChild(tempDiv);
      }

      const options = {
        scale: 2.5, // Crisp high-definition scale
        useCORS: true,
        backgroundColor: '#ffffff', // Force high-contrast white background for downloaded PDF
        logging: false,
        onclone: (clonedDoc: Document) => {
          const clonedElement = clonedDoc.getElementById('payslip-print-canvas');
          if (clonedElement) {
            // Force container styling for light theme
            clonedElement.style.backgroundColor = '#ffffff';
            clonedElement.style.color = '#0f172a'; // Deep slate text
            clonedElement.style.padding = '32px';

            // Find and remove the interactive HR tip box from the PDF
            const tipBox = Array.from(clonedElement.getElementsByTagName('div')).find(div => 
              div.className.includes('bg-indigo-500/10') || div.textContent?.includes('HR TIP')
            );
            if (tipBox && tipBox.parentNode) {
              tipBox.parentNode.removeChild(tipBox);
            }

            const tables = Array.from(clonedElement.getElementsByTagName('table'));
            tables.forEach(table => {
              table.style.borderColor = '#94a3b8'; // slate-400
              table.style.backgroundColor = '#ffffff';
            });

            // Clean up the table wrapper card
            const wrappers = Array.from(clonedElement.getElementsByTagName('div')).filter(div =>
              div.className.includes('border-slate-700') || div.className.includes('bg-slate-950/25')
            );
            wrappers.forEach(wrap => {
              wrap.style.backgroundColor = '#ffffff';
              wrap.style.borderColor = '#94a3b8';
            });

            // Force all table rows to have white background
            const trs = Array.from(clonedElement.getElementsByTagName('tr'));
            trs.forEach(tr => {
              tr.style.backgroundColor = '#ffffff';
            });

            const tds = Array.from(clonedElement.getElementsByTagName('td'));
            tds.forEach(td => {
              td.style.borderColor = '#94a3b8'; // crisp slate border
              td.style.color = '#0f172a'; // crisp slate text
              td.style.backgroundColor = '#ffffff'; // Force pure white background as requested

              // Set text colors for highlights in printer-safe dark shades
              if (td.className.includes('text-emerald-400') || td.className.includes('text-teal-300') || td.className.includes('text-teal-400')) {
                td.style.color = '#15803d'; // strong green
              } else if (td.className.includes('text-rose-400') || td.className.includes('text-rose-300')) {
                td.style.color = '#b91c1c'; // strong red
              } else if (td.className.includes('text-slate-400') || td.className.includes('text-slate-500')) {
                td.style.color = '#475569'; // dark labels
              }
            });

            // Ensure any divs or spans inside cells also have transparent bg and crisp high-contrast dark text
            const allNested = Array.from(clonedElement.querySelectorAll('div, span, p, strong')) as HTMLElement[];
            allNested.forEach(el => {
              el.style.backgroundColor = 'transparent';
              if (el.className.includes('text-emerald-400') || el.className.includes('text-teal-300') || el.className.includes('text-teal-400')) {
                el.style.color = '#15803d';
              } else if (el.className.includes('text-rose-400') || el.className.includes('text-rose-300')) {
                el.style.color = '#b91c1c';
              } else if (el.className.includes('text-slate-400') || el.className.includes('text-slate-500')) {
                el.style.color = '#475569';
              } else {
                el.style.color = '#0f172a';
              }
            });

            // Convert inputs (which are interactive) into flat printable text spans
            const inputs = Array.from(clonedElement.getElementsByTagName('input'));
            inputs.forEach(input => {
              const span = clonedDoc.createElement('span');
              span.innerText = input.value;
              span.style.fontFamily = "inherit";
              span.style.fontWeight = "bold";
              span.style.color = "#0f172a"; // dark slate text
              span.style.border = "none";
              span.style.backgroundColor = "transparent";
              if (input.parentNode) {
                input.parentNode.replaceChild(span, input);
              }
            });
          }
        }
      };

      const canvas = await html2canvas(element, options);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width
      const pageHeight = 297; // A4 height
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      const formattedName = activeEmployee.name.replace(/\s+/g, '_');
      pdf.save(`payslip_${formattedName}_${activeMonthName}_${selectedYear}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      // ALWAYS restore original stylesheets to avoid styling changes to the app
      styleBackups.forEach((originalText, styleEl) => {
        styleEl.textContent = originalText;
      });
      // Make sure tempDiv is removed if it wasn't already
      if (tempDiv.parentNode) {
        tempDiv.parentNode.removeChild(tempDiv);
      }
      setIsPdfGenerating(false);
    }
  };

  const activePayroll = activeEmployee ? calculatePayroll(activeEmployee) : null;
  const activeMonthName = months.find(m => m.value === selectedMonth)?.name || 'June';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/30 p-5 rounded-2xl border border-slate-800/40">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            id="payroll-search"
            type="text"
            placeholder="Search employee or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/40 border border-slate-700/40 focus:border-teal-400 rounded-xl py-2 px-10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Month select */}
          <div className="flex items-center gap-1.5 bg-slate-800/40 px-3.5 py-2 rounded-xl border border-slate-700/40">
            <CalendarDays className="w-3.5 h-3.5 text-teal-400" />
            <select
              id="payroll-month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer font-bold"
            >
              {months.map(m => (
                <option key={m.value} value={m.value} className="bg-slate-900 text-slate-200">{m.name}</option>
              ))}
            </select>
          </div>

          {/* Year select */}
          <div className="bg-slate-800/40 px-3 py-2 rounded-xl border border-slate-700/40">
            <select
              id="payroll-year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer font-bold"
            >
              {years.map(y => (
                <option key={y} value={y} className="bg-slate-900 text-slate-200">{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-900/50 text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">
                <th className="px-6 py-4.5">Employee Details</th>
                <th className="px-6 py-4.5">Base Salary (INR ₹)</th>
                <th className="px-6 py-4.5">Allowances (15%)</th>
                <th className="px-6 py-4.5">Absences / LOP Deduction</th>
                <th className="px-6 py-4.5">Net Est. Pay ({activeMonthName})</th>
                <th className="px-6 py-4.5">Approval Status</th>
                <th className="px-6 py-4.5 text-right">Statement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No active employees matching search parameters.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const pay = calculatePayroll(emp);
                  return (
                    <tr 
                      key={emp.id}
                      id={`payroll-row-${emp.id}`}
                      className="hover:bg-slate-800/20 transition-all duration-200"
                    >
                      {/* Name/Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-slate-800 border border-slate-700/30 flex items-center justify-center font-bold text-slate-300">
                            {emp.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-bold text-slate-200">{emp.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{emp.role} • <span className="text-teal-400">{emp.department}</span></p>
                          </div>
                        </div>
                      </td>

                      {/* Monthly Base */}
                      <td className="px-6 py-4 font-mono font-bold text-slate-300">
                        ₹{pay.monthlyBase.toLocaleString()}
                      </td>

                      {/* Allowances */}
                      <td className="px-6 py-4 font-mono text-emerald-400 font-semibold">
                        +₹{pay.allowances.toLocaleString()}
                      </td>

                      {/* Absences / LOP */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-rose-400">-₹{pay.lopDeduction.toLocaleString()}</span>
                            {pay.absentCount > 0 && (
                              <span className="text-[8px] bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold px-1.5 py-0.2 rounded font-mono">
                                {pay.absentCount}d absent
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium">
                            Paid Workdays: <span className="font-bold text-slate-200">{pay.paidDays}</span> / {pay.totalDays}
                          </p>
                          {pay.halfDayCount > 0 && (
                            <p className="text-[9px] text-indigo-400 font-semibold">
                              ({pay.halfDayCount} half-days)
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Net Pay */}
                      <td className="px-6 py-4 font-mono text-slate-100 font-black text-sm bg-teal-500/5">
                        ₹{pay.netSalary.toLocaleString()}
                      </td>

                      {/* Approval Status */}
                      <td className="px-6 py-4">
                        {(() => {
                          const isApproved = salarySlips?.some(
                            s => s.employeeId === emp.id && s.month === activeMonthName && s.year === selectedYear
                          );
                          return isApproved ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-lg">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-slate-800 border border-slate-700/50 text-slate-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-lg">
                              <Clock className="w-3 h-3 text-slate-500" /> Draft
                            </span>
                          );
                        })()}
                      </td>

                      {/* Payslip trigger */}
                      <td className="px-6 py-4 text-right">
                        <button
                          id={`btn-generate-slip-${emp.id}`}
                          onClick={() => handleOpenPayslip(emp)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/40 hover:border-slate-700/80 transition-all duration-200 flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-teal-400" />
                          <span>Generate Payslip</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Corporate Payslip Modal */}
      {isPayslipOpen && activeEmployee && activePayroll && (() => {
        const approvedSlip = salarySlips?.find(
          s => s.employeeId === activeEmployee.id && s.month === activeMonthName && s.year === selectedYear
        );
        const isApproved = !!approvedSlip;

        // Excel layout calculations
        const totalEarnedGross = approvedSlip ? approvedSlip.totalEarnings : (activePayroll.earnedBase + activePayroll.allowances);
        
        // Split total Gross Earnings using exact ratios from the 10000-Gross sample:
        // Basic: 61.88%, HRA: 20.63%, DA: 9.38%, Conveyance: 1.88%, Medical: 1.88%, Special: Rest
        const basicSalary = approvedSlip ? approvedSlip.baseSalary : Math.round(totalEarnedGross * 0.6188);
        const hra = approvedSlip ? approvedSlip.hra : Math.round(totalEarnedGross * 0.2063);
        const da = approvedSlip ? approvedSlip.da : Math.round(totalEarnedGross * 0.0938);
        const conveyance = approvedSlip ? approvedSlip.conveyance : Math.round(totalEarnedGross * 0.0188);
        const medical = approvedSlip ? approvedSlip.medical : Math.round(totalEarnedGross * 0.0188);
        const specialAllowance = approvedSlip ? approvedSlip.specialAllowance : (totalEarnedGross - (basicSalary + hra + da + conveyance + medical));

        const currentPF = approvedSlip ? approvedSlip.pf : (employeePF !== null ? employeePF : activePayroll.taxDeduction);
        const lopDaysCount = approvedSlip ? approvedSlip.lopDays : activePayroll.unpaidDays;
        const totalDeductionsAmount = currentPF;
        const netPayableAmount = totalEarnedGross - currentPF;

        const companyNameVal = approvedSlip ? approvedSlip.companyName : companyName;
        const payDateDayVal = approvedSlip ? approvedSlip.payDateDay : payDateDay;

        return (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-8">
              
              {/* Modal Controls Bar */}
              <div className="bg-slate-950/30 px-6 py-4 border-b border-slate-800/60 flex items-center justify-between no-print">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" /> SECURE EXCEL PAYSLIP GENERATION
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => window.print()}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition cursor-pointer"
                    title="Print Payslip"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setIsPayslipOpen(false)}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition cursor-pointer"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Print Area Canvas */}
              <div className="p-6 md:p-8 space-y-6 text-slate-300 select-text" id="payslip-print-canvas">
                
                {/* Print Styles Overrides Injection */}
                <style>{`
                  @media print {
                    body * {
                      visibility: hidden;
                    }
                    #payslip-print-canvas, #payslip-print-canvas * {
                      visibility: visible;
                    }
                    #payslip-print-canvas {
                      position: absolute;
                      left: 0;
                      top: 0;
                      width: 100%;
                      background: white !important;
                      color: black !important;
                      padding: 10px !important;
                    }
                    /* Ensure table borders print nicely */
                    #payslip-print-canvas table {
                      border-collapse: collapse !important;
                      width: 100% !important;
                      border: 1.5px solid #000000 !important;
                      background-color: transparent !important;
                    }
                    #payslip-print-canvas td {
                      border: 1px solid #000000 !important;
                      color: #000000 !important;
                      background-color: transparent !important;
                      font-family: sans-serif !important;
                    }
                    /* Convert editable inputs to clean printed text */
                    #payslip-print-canvas input {
                      border: none !important;
                      background: transparent !important;
                      color: black !important;
                      box-shadow: none !important;
                      padding: 0 !important;
                      margin: 0 !important;
                      text-align: inherit !important;
                      font-weight: bold !important;
                      width: auto !important;
                    }
                    .no-print {
                      display: none !important;
                    }
                  }
                `}</style>

                {/* Subtitle / Tip explaining Interactive Edit */}
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[11px] text-indigo-300 flex items-start gap-2 no-print">
                  <span className="font-bold bg-indigo-500/20 px-1 py-0.5 rounded text-[9px] uppercase mt-0.5 font-mono">HR TIP</span>
                  <p>You can **click and edit** the **Company Name**, **Pay Date Day**, and **Employee PF** amounts directly on this slip. When you hit **Print / Save**, they will display beautifully!</p>
                </div>

                {/* Main Excel Structure Table */}
                <div className="border border-slate-700 rounded-2xl overflow-hidden bg-slate-950/25">
                  <table className="w-full border-collapse border border-slate-700 text-slate-100 text-xs">
                    <tbody>
                      {/* Row 1: Company Header */}
                      <tr>
                        <td colSpan={4} className="border border-slate-700 p-4 text-center bg-slate-900/60 font-black tracking-tight text-base text-slate-100">
                          <input 
                            type="text"
                            value={companyNameVal}
                            onChange={e => setCompanyName(e.target.value)}
                            disabled={isApproved}
                            className={`bg-transparent border-b border-dashed border-slate-700 hover:border-slate-500 focus:border-teal-400 focus:outline-none text-center w-full max-w-lg font-black text-slate-100 ${isApproved ? '' : 'cursor-edit'}`}
                            placeholder="Company Name"
                            title={isApproved ? "Approved Company Name" : "Click to edit Company Name"}
                          />
                        </td>
                      </tr>

                      {/* Row 2: Payslip Title */}
                      <tr>
                        <td colSpan={4} className="border border-slate-700 p-2.5 text-center bg-slate-900/40 text-sm font-bold text-slate-200">
                          Payslip for the month of {activeMonthName} {selectedYear}
                        </td>
                      </tr>

                      {/* Row 3: Subtitle */}
                      <tr>
                        <td colSpan={4} className="border border-slate-700 p-1.5 text-center bg-slate-900/10 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                          Pay Summary
                        </td>
                      </tr>

                      {/* Spacer Row */}
                      <tr className="h-2.5 bg-slate-950/40">
                        <td colSpan={4} className="border border-slate-700"></td>
                      </tr>

                      {/* Row 4: Employee ID / Name */}
                      <tr>
                        <td className="border border-slate-700 px-4 py-2 bg-slate-900/20 text-slate-400 font-semibold w-1/4">Employee ID</td>
                        <td className="border border-slate-700 px-4 py-2 font-mono font-bold text-slate-200 w-1/4">{activeEmployee.id}</td>
                        <td className="border border-slate-700 px-4 py-2 bg-slate-900/20 text-slate-400 font-semibold w-1/4">Employee Name</td>
                        <td className="border border-slate-700 px-4 py-2 font-bold text-slate-200 w-1/4">{activeEmployee.name}</td>
                      </tr>

                      {/* Row 5: Designation / Pay Period */}
                      <tr>
                        <td className="border border-slate-700 px-4 py-2 bg-slate-900/20 text-slate-400 font-semibold">Designation</td>
                        <td className="border border-slate-700 px-4 py-2 text-slate-300">{activeEmployee.role}</td>
                        <td className="border border-slate-700 px-4 py-2 bg-slate-900/20 text-slate-400 font-semibold">Pay Period</td>
                        <td className="border border-slate-700 px-4 py-2 text-slate-300 font-bold">{activeMonthName} {selectedYear}</td>
                      </tr>

                      {/* Row 6: Pay Date */}
                      <tr>
                        <td className="border border-slate-700 px-4 py-2 bg-slate-900/20 text-slate-400 font-semibold">Pay Date</td>
                        <td colSpan={3} className="border border-slate-700 px-4 py-2 text-slate-300 font-mono">
                          <div className="flex items-center gap-1">
                            <input 
                              type="text"
                              value={payDateDayVal}
                              onChange={e => setPayDateDay(e.target.value)}
                              disabled={isApproved}
                              className="w-10 bg-transparent border-b border-dashed border-slate-700 hover:border-slate-500 focus:border-teal-400 focus:outline-none text-center font-bold text-slate-200 disabled:opacity-80"
                              title={isApproved ? "Approved Pay Date Day" : "Edit Pay Date Day"}
                            />
                            <span>{activeMonthName} {selectedYear}</span>
                          </div>
                        </td>
                      </tr>

                      {/* Spacer Row */}
                      <tr className="h-3 bg-slate-950/40">
                        <td colSpan={4} className="border border-slate-700"></td>
                      </tr>

                      {/* Row 7: Columns Headers */}
                      <tr className="bg-slate-900/50 text-[10px] uppercase font-extrabold tracking-wider text-slate-300">
                        <td className="border border-slate-700 px-4 py-2.5">Earnings</td>
                        <td className="border border-slate-700 px-4 py-2.5 text-right">Amount (₹)</td>
                        <td className="border border-slate-700 px-4 py-2.5">Deductions</td>
                        <td className="border border-slate-700 px-4 py-2.5 text-right">Amount (₹)</td>
                      </tr>

                      {/* Spacer Row */}
                      <tr className="h-2 bg-slate-950/40">
                        <td colSpan={4} className="border border-slate-700"></td>
                      </tr>

                      {/* Row 8: Basic Salary & Deductions Header */}
                      <tr>
                        <td className="border border-slate-700 px-4 py-2 text-slate-400 font-medium">Basic Salary</td>
                        <td className="border border-slate-700 px-4 py-2 text-right font-mono text-slate-200">₹{basicSalary.toLocaleString()}</td>
                        <td className="border border-slate-700 px-4 py-2 bg-slate-900/10 text-slate-400 font-bold">Deductions</td>
                        <td className="border border-slate-700 px-4 py-2 bg-slate-900/10 text-right text-slate-400 font-bold">Amount (₹)</td>
                      </tr>

                      {/* Row 9: HRA & PF */}
                      <tr>
                        <td className="border border-slate-700 px-4 py-2 text-slate-400 font-medium">HRA</td>
                        <td className="border border-slate-700 px-4 py-2 text-right font-mono text-slate-200">₹{hra.toLocaleString()}</td>
                        <td className="border border-slate-700 px-4 py-2 text-slate-400 font-medium">Employee PF</td>
                        <td className="border border-slate-700 px-4 py-2 text-right font-mono">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-slate-500 text-[10px] no-print">(₹)</span>
                            <input 
                              type="number"
                              value={currentPF}
                              onChange={e => setEmployeePF(e.target.value === '' ? null : Number(e.target.value))}
                              disabled={isApproved}
                              className="w-16 bg-transparent border-b border-dashed border-slate-700 hover:border-slate-500 focus:border-teal-400 focus:outline-none text-right font-mono text-slate-200 font-bold disabled:opacity-80"
                              title={isApproved ? "Approved Employee PF" : "Edit PF Deduction Override"}
                            />
                          </div>
                        </td>
                      </tr>

                      {/* Row 10: DA & LOP Days */}
                      <tr>
                        <td className="border border-slate-700 px-4 py-2 text-slate-400 font-medium">DA</td>
                        <td className="border border-slate-700 px-4 py-2 text-right font-mono text-slate-200">₹{da.toLocaleString()}</td>
                        <td className="border border-slate-700 px-4 py-2 text-slate-400 font-medium">LOP Days</td>
                        <td className="border border-slate-700 px-4 py-2 text-right font-mono font-bold text-rose-400">{lopDaysCount}</td>
                      </tr>

                      {/* Row 11: Conveyance */}
                      <tr>
                        <td className="border border-slate-700 px-4 py-2 text-slate-400 font-medium">Conveyance</td>
                        <td className="border border-slate-700 px-4 py-2 text-right font-mono text-slate-200">₹{conveyance.toLocaleString()}</td>
                        <td className="border border-slate-700 px-4 py-2"></td>
                        <td className="border border-slate-700 px-4 py-2"></td>
                      </tr>

                      {/* Row 12: Medical */}
                      <tr>
                        <td className="border border-slate-700 px-4 py-2 text-slate-400 font-medium">Medical</td>
                        <td className="border border-slate-700 px-4 py-2 text-right font-mono text-slate-200">₹{medical.toLocaleString()}</td>
                        <td className="border border-slate-700 px-4 py-2"></td>
                        <td className="border border-slate-700 px-4 py-2"></td>
                      </tr>

                      {/* Row 13: Special Allowance */}
                      <tr>
                        <td className="border border-slate-700 px-4 py-2 text-slate-400 font-medium">Special Allowance</td>
                        <td className="border border-slate-700 px-4 py-2 text-right font-mono text-slate-200">₹{specialAllowance.toLocaleString()}</td>
                        <td className="border border-slate-700 px-4 py-2"></td>
                        <td className="border border-slate-700 px-4 py-2"></td>
                      </tr>

                      {/* Spacer Row */}
                      <tr className="h-2 bg-slate-950/40">
                        <td colSpan={4} className="border border-slate-700"></td>
                      </tr>

                      {/* Row 14: Totals Row */}
                      <tr className="bg-slate-900/30 font-bold text-slate-200">
                        <td className="border border-slate-700 px-4 py-2.5 text-slate-300">Gross Earnings</td>
                        <td className="border border-slate-700 px-4 py-2.5 text-right font-mono text-slate-100">₹{totalEarnedGross.toLocaleString()}</td>
                        <td className="border border-slate-700 px-4 py-2.5 text-slate-300">Total Deductions</td>
                        <td className="border border-slate-700 px-4 py-2.5 text-right font-mono text-rose-400">₹{totalDeductionsAmount.toLocaleString()}</td>
                      </tr>

                      {/* Spacer Row */}
                      <tr className="h-3 bg-slate-950/40">
                        <td colSpan={4} className="border border-slate-700"></td>
                      </tr>

                      {/* Row 15: Net Payable Row */}
                      <tr className="bg-teal-500/10 text-sm font-extrabold text-teal-300">
                        <td colSpan={2} className="border border-slate-700 px-4 py-3.5 text-center uppercase tracking-widest text-teal-300">
                          Total Net Payable
                        </td>
                        <td colSpan={2} className="border border-slate-700 px-4 py-3.5 text-right font-mono text-lg text-teal-200">
                          ₹{netPayableAmount.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Footnotes / Seal */}
                <div className="flex items-center justify-between pt-2 text-[10px] text-slate-500">
                  <div>
                    <p className="font-bold text-slate-400">Generated securely from Cloud HR Roster Panel</p>
                    <p className="mt-0.5">Reference Verification ID: {activeEmployee.id.toUpperCase()}-{selectedMonth}{selectedYear}</p>
                  </div>
                  <div className="text-right italic">
                    <div className="h-6 w-24 border-b border-slate-700 mx-auto" />
                    <p className="mt-1">Authorized HR Signatory</p>
                  </div>
                </div>

              </div>

              {/* Footer buttons */}
              <div className="bg-slate-950/30 px-6 py-4 border-t border-slate-800/60 flex items-center justify-end gap-3 no-print">
                <button
                  onClick={() => setIsPayslipOpen(false)}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs active:scale-95 transition cursor-pointer"
                  disabled={isPdfGenerating}
                >
                  Close Statement
                </button>
                {!isApproved ? (
                  <button
                    onClick={() => {
                      const slip: SalarySlip = {
                        id: `slp-${activeEmployee.id}-${selectedMonth}${selectedYear}`,
                        employeeId: activeEmployee.id,
                        employeeName: activeEmployee.name,
                        month: activeMonthName,
                        year: selectedYear,
                        baseSalary: basicSalary,
                        hra: hra,
                        da: da,
                        conveyance: conveyance,
                        medical: medical,
                        specialAllowance: specialAllowance,
                        pf: currentPF,
                        lopDays: lopDaysCount,
                        lopDeduction: activePayroll.lopDeduction,
                        taxDeduction: activePayroll.taxDeduction,
                        totalEarnings: totalEarnedGross,
                        totalDeductions: totalDeductionsAmount,
                        netPay: netPayableAmount,
                        approvedDate: new Date().toISOString().split('T')[0],
                        companyName: companyNameVal,
                        payDateDay: payDateDayVal,
                        status: 'Approved'
                      };
                      onApproveSalarySlip(slip);
                    }}
                    className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs hover:scale-105 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
                    disabled={isPdfGenerating}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Publish Slip</span>
                  </button>
                ) : (
                  <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>APPROVED & PUBLISHED</span>
                  </span>
                )}
                <button
                  onClick={handleDownloadPDF}
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 hover:scale-105 active:scale-95 transition cursor-pointer disabled:opacity-50"
                  disabled={isPdfGenerating}
                  title="Download high-quality PDF of your payslip"
                >
                  <Download className="w-3.5 h-3.5 text-slate-950" />
                  <span>{isPdfGenerating ? 'Generating...' : 'Download PDF Form'}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 hover:scale-105 active:scale-95 transition cursor-pointer border border-slate-700/60"
                  disabled={isPdfGenerating}
                >
                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                  <span>Print or Save PDF</span>
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}
