import React, { useState, useMemo } from 'react';
import { 
  User, 
  Calendar, 
  DollarSign, 
  FileText, 
  Send, 
  Check, 
  X, 
  Clock, 
  Briefcase, 
  Phone, 
  Mail, 
  Plus, 
  Award, 
  AlertCircle, 
  MapPin, 
  LogOut, 
  Printer, 
  Download, 
  ShieldCheck,
  ClipboardList,
  Fingerprint,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Info
} from 'lucide-react';
import { Employee, AttendanceRecord, LeaveRequest, SalarySlip } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface EmployeePortalProps {
  employee: Employee;
  attendanceRecords: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  salarySlips: SalarySlip[];
  onLogout: () => void;
  onAddAttendanceRecord: (record: AttendanceRecord) => void;
  onApplyLeave: (leave: Omit<LeaveRequest, 'id' | 'employeeId' | 'employeeName' | 'status' | 'dateApplied'>) => void;
}

export default function EmployeePortal({
  employee,
  attendanceRecords,
  leaveRequests,
  salarySlips = [],
  onLogout,
  onAddAttendanceRecord,
  onApplyLeave
}: EmployeePortalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'attendance' | 'salary' | 'leave'>('profile');
  
  // Leave Form State
  const [leaveType, setLeaveType] = useState<LeaveRequest['type']>('Annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveSuccess, setLeaveSuccess] = useState(false);

  // Salary Slip Selection State
  const [selectedMonth, setSelectedMonth] = useState('June 2026');
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  // Month-wise Attendance Calendar State (Initialized to June 2026 for consistency with workspace records)
  const [selectedCalendarMonth, setSelectedCalendarMonth] = useState<number>(5); // June is index 5
  const [selectedCalendarYear, setSelectedCalendarYear] = useState<number>(2026);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (selectedCalendarMonth === 0) {
      setSelectedCalendarMonth(11);
      setSelectedCalendarYear(prev => prev - 1);
    } else {
      setSelectedCalendarMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedCalendarMonth === 11) {
      setSelectedCalendarMonth(0);
      setSelectedCalendarYear(prev => prev + 1);
    } else {
      setSelectedCalendarMonth(prev => prev + 1);
    }
  };

  // Helper to determine status for each calendar day
  const getDayStatusDetails = (dayNum: number) => {
    const monthStr = String(selectedCalendarMonth + 1).padStart(2, '0');
    const dayStr = String(dayNum).padStart(2, '0');
    const dateStr = `${selectedCalendarYear}-${monthStr}-${dayStr}`;

    // 1. Check Approved Leave Requests covering this date
    const approvedLeave = leaveRequests.find(l => 
      l.employeeId === employee.id && 
      l.status === 'Approved' && 
      dateStr >= l.startDate && 
      dateStr <= l.endDate
    );
    if (approvedLeave) {
      return { 
        status: 'Leave', 
        label: `${approvedLeave.type} Leave`, 
        color: 'bg-amber-500/10 border-amber-500/20 text-amber-400', 
        indicator: 'bg-amber-400'
      };
    }

    // 2. Check explicit attendance records
    const record = attendanceRecords.find(r => r.employeeId === employee.id && r.date === dateStr);
    if (record) {
      if (record.status === 'Present') {
        return { 
          status: 'Present', 
          label: 'Present', 
          color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', 
          indicator: 'bg-emerald-400' 
        };
      }
      if (record.status === 'Half-Day') {
        return { 
          status: 'Half-Day', 
          label: 'Half-Day', 
          color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400', 
          indicator: 'bg-indigo-400' 
        };
      }
      if (record.status === 'Absent') {
        return { 
          status: 'Absent', 
          label: 'Absent', 
          color: 'bg-rose-500/10 border-rose-500/20 text-rose-400', 
          indicator: 'bg-rose-400' 
        };
      }
      if (record.status === 'Leave') {
        return { 
          status: 'Leave', 
          label: 'Leave / Rest Day', 
          color: 'bg-amber-500/10 border-amber-500/20 text-amber-400', 
          indicator: 'bg-amber-400' 
        };
      }
    }

    // 3. Weekend Check
    const dayOfWeek = new Date(selectedCalendarYear, selectedCalendarMonth, dayNum).getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { 
        status: 'Weekend', 
        label: 'Weekend / Rest', 
        color: 'bg-slate-500/5 border-slate-800/40 text-slate-500', 
        indicator: 'bg-slate-500' 
      };
    }

    // 4. Future Check
    const todayStr = new Date().toISOString().split('T')[0];
    if (dateStr > todayStr) {
      return { 
        status: 'Future', 
        label: 'Scheduled', 
        color: 'bg-slate-900/20 border-slate-800/20 text-slate-600', 
        indicator: 'bg-slate-800' 
      };
    }

    // 5. Default past working days: Assume Present if no explicit absent/leave record exists
    return { 
      status: 'Present', 
      label: 'Present', 
      color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', 
      indicator: 'bg-emerald-400' 
    };
  };

  // Compute stats dynamically for the selected month
  const daysInMonth = new Date(selectedCalendarYear, selectedCalendarMonth + 1, 0).getDate();
  const firstDayOffset = new Date(selectedCalendarYear, selectedCalendarMonth, 1).getDay();

  const calendarStats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let leave = 0;
    let halfDay = 0;
    let weekend = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const details = getDayStatusDetails(d);
      if (details.status === 'Present') present++;
      else if (details.status === 'Absent') absent++;
      else if (details.status === 'Leave') leave++;
      else if (details.status === 'Half-Day') halfDay++;
      else if (details.status === 'Weekend') weekend++;
    }

    return { present, absent, leave, halfDay, weekend };
  }, [selectedCalendarMonth, selectedCalendarYear, attendanceRecords, leaveRequests, employee.id]);

  // Attendance Clock-in State
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = attendanceRecords.find(r => r.employeeId === employee.id && r.date === todayStr);
  const [isClocking, setIsClocking] = useState(false);

  // Filter records for this employee
  const myAttendance = attendanceRecords.filter(r => r.employeeId === employee.id);
  const myLeaves = leaveRequests.filter(l => l.employeeId === employee.id);

  // Clock In Helper
  const handleClockIn = () => {
    if (todayRecord) return;
    setIsClocking(true);
    setTimeout(() => {
      onAddAttendanceRecord({
        id: `att-emp-${Date.now()}`,
        employeeId: employee.id,
        date: todayStr,
        status: 'Present'
      });
      setIsClocking(false);
    }, 800);
  };

  // Submit Leave Helper
  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) return;

    onApplyLeave({
      startDate,
      endDate,
      type: leaveType,
      reason: reason.trim()
    });

    setLeaveSuccess(true);
    setStartDate('');
    setEndDate('');
    setReason('');

    setTimeout(() => {
      setLeaveSuccess(false);
    }, 4000);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('payslip-print-canvas-employee');
    if (!element) return;

    setIsPdfGenerating(true);

    const styleElements = Array.from(document.querySelectorAll('style'));
    const styleBackups = new Map<HTMLStyleElement, string>();
    
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
      styleElements.forEach((styleEl) => {
        const text = styleEl.textContent;
        if (text && (text.includes('oklch(') || text.includes('oklab(') || text.includes('color-mix(') || text.includes('light-dark('))) {
          styleBackups.set(styleEl, text);
          styleEl.textContent = replaceModernColors(text);
        }
      });

      if (tempDiv.parentNode) {
        tempDiv.parentNode.removeChild(tempDiv);
      }

      const options = {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc: Document) => {
          const clonedElement = clonedDoc.getElementById('payslip-print-canvas-employee');
          if (clonedElement) {
            clonedElement.style.backgroundColor = '#ffffff';
            clonedElement.style.color = '#0f172a';
            clonedElement.style.padding = '32px';

            const alertBoxes = Array.from(clonedElement.getElementsByTagName('div')).filter(div => 
              div.className.includes('bg-amber-500/10') || div.className.includes('bg-indigo-500/10') || div.className.includes('bg-teal-500/10') || div.className.includes('no-print')
            );
            alertBoxes.forEach(box => {
              if (box.parentNode) box.parentNode.removeChild(box);
            });

            // Handle the print preview elements
            const tables = Array.from(clonedElement.getElementsByTagName('table'));
            tables.forEach(table => {
              table.style.borderColor = '#94a3b8';
              table.style.backgroundColor = '#ffffff';
            });

            const trs = Array.from(clonedElement.getElementsByTagName('tr'));
            trs.forEach(tr => {
              tr.style.backgroundColor = '#ffffff';
            });

            const tds = Array.from(clonedElement.getElementsByTagName('td'));
            tds.forEach(td => {
              td.style.borderColor = '#94a3b8';
              td.style.color = '#0f172a';
              td.style.backgroundColor = '#ffffff';
            });

            const allNested = Array.from(clonedElement.querySelectorAll('div, span, p, strong, h2, h3, h4')) as HTMLElement[];
            allNested.forEach(el => {
              el.style.backgroundColor = 'transparent';
              el.style.color = '#0f172a';
            });
          }
        }
      };

      const canvas = await html2canvas(element, options);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
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

      const formattedName = employee.name.replace(/\s+/g, '_');
      const cleanMonth = selectedMonth.replace(/\s+/g, '_');
      pdf.save(`payslip_${formattedName}_${cleanMonth}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      styleBackups.forEach((originalText, styleEl) => {
        styleEl.textContent = originalText;
      });
      setIsPdfGenerating(false);
    }
  };

  // Calculate Salary Breakdown
  const baseSalary = employee.salary / 12;
  const allowances = {
    hra: Math.round(baseSalary * 0.15), // 15% HRA
    da: Math.round(baseSalary * 0.10),  // 10% DA
    special: Math.round(baseSalary * 0.05) // 5% Special
  };
  const deductions = {
    pf: Math.round(baseSalary * 0.12), // 12% PF
    tax: 150, // Professional tax
    health: 200 // Health Insurance premium
  };
  const totalAllowances = allowances.hra + allowances.da + allowances.special;
  const totalDeductions = deductions.pf + deductions.tax + deductions.health;
  const netPaid = baseSalary + totalAllowances - totalDeductions;

  return (
    <div className="min-h-screen bg-[#0b1329] text-slate-100 flex flex-col font-sans relative">
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Identity Nav */}
      <header className="border-b border-slate-800/80 bg-slate-950/45 backdrop-blur-xl relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-sky-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-md shadow-sky-500/10">
              <ShieldCheck className="h-5 w-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base tracking-tight text-white uppercase">CRM PORTAL</h1>
                <span className="text-[9px] bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 px-1.5 py-0.5 rounded font-black tracking-widest uppercase">Employee Workspace</span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wide">Enterprise Digital Access Point</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-200">{employee.name}</p>
              <p className="text-[9px] text-sky-400/80 font-mono font-bold uppercase">{employee.role}</p>
            </div>
            <button
              onClick={onLogout}
              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Secure Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Workspace Wrapper */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column - Employee Greeting & Sidebar Navigation */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Quick Info Profile Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="w-16 h-16 bg-gradient-to-tr from-sky-400/25 to-indigo-500/25 border border-sky-400/30 rounded-full mx-auto flex items-center justify-center text-2xl font-black text-sky-400 mb-3.5 shadow-xl">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </div>

            <h3 className="text-base font-black text-slate-100">{employee.name}</h3>
            <span className="text-[10px] text-sky-400 font-mono uppercase tracking-wider block mt-0.5">{employee.role}</span>
            <div className="mt-1.5 flex justify-center">
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                employee.status === 'Active' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                employee.status === 'On Leave' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
                'bg-slate-500/10 border border-slate-500/20 text-slate-400'
              }`}>
                {employee.status || 'Active'}
              </span>
            </div>

            <div className="h-px bg-slate-800/60 my-4" />

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 text-left">
              <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">ID Code</span>
                <span className="text-xs font-mono font-extrabold text-slate-300">{employee.id.toUpperCase()}</span>
              </div>
              <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Department</span>
                <span className="text-xs font-extrabold text-slate-300 truncate block">{employee.department}</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation Menu */}
          <nav className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-2.5 space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full px-4 py-3 rounded-xl text-xs font-bold tracking-wide flex items-center gap-3 transition ${
                activeTab === 'profile' 
                  ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/10 border border-sky-500/20 text-sky-400' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <User className="h-4 w-4" />
              <span>Personnel details</span>
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`w-full px-4 py-3 rounded-xl text-xs font-bold tracking-wide flex items-center gap-3 transition ${
                activeTab === 'attendance' 
                  ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/10 border border-sky-500/20 text-sky-400' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Attendance History</span>
            </button>

            <button
              onClick={() => setActiveTab('salary')}
              className={`w-full px-4 py-3 rounded-xl text-xs font-bold tracking-wide flex items-center gap-3 transition ${
                activeTab === 'salary' 
                  ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/10 border border-sky-500/20 text-sky-400' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <DollarSign className="h-4 w-4" />
              <span>Salary Pay Slips</span>
            </button>

            <button
              onClick={() => setActiveTab('leave')}
              className={`w-full px-4 py-3 rounded-xl text-xs font-bold tracking-wide flex items-center gap-3 transition ${
                activeTab === 'leave' 
                  ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/10 border border-sky-500/20 text-sky-400' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <Plus className="h-4 w-4" />
              <span>Apply for Leave</span>
            </button>
          </nav>

          {/* Quick system status */}
          <div className="bg-slate-950/40 p-4 border border-slate-900 rounded-2xl text-[10px] text-slate-500 font-medium">
            <span className="text-slate-400 font-bold block mb-1">Security Audit Status</span>
            <p className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Authorized connection encrypted</span>
            </p>
            <p className="mt-1">Last Sync: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Right column - Tab Views */}
        <div className="lg:col-span-9 space-y-6">

          {/* 1. PROFILE / DETAILED INFO VIEW */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              {/* Main Banner Greeting */}
              <div className="bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-transparent border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <h2 className="text-xl font-black text-slate-100 tracking-tight flex items-center gap-2">
                  <span>Welcome back,</span>
                  <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">{employee.name}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xl">
                  Welcome to your unified workspace portal. Here, you can review secure profile data, manage clock-in checkpoints, check generated pay structures, or request time-off.
                </p>

                {/* Active/Pending Leave Status Alert */}
                {myLeaves.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
                    {myLeaves.slice(0, 2).map((leave) => (
                      <div 
                        key={leave.id} 
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                          leave.status === 'Approved' 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                            : leave.status === 'Rejected'
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="font-extrabold flex items-center gap-1.5 uppercase tracking-wider text-[9px]">
                            {leave.status === 'Approved' ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : leave.status === 'Rejected' ? (
                              <X className="h-3 w-3 text-rose-400" />
                            ) : (
                              <Clock className="h-3 w-3 text-amber-400 animate-pulse" />
                            )}
                            <span>{leave.type} Leave Status</span>
                          </p>
                          <p className="text-[10px] text-slate-300 font-medium leading-normal">
                            Period: {leave.startDate} to {leave.endDate}
                          </p>
                          {leave.adminNotes ? (
                            <p className="text-[9px] text-slate-300 bg-slate-950/40 px-1.5 py-0.5 rounded border border-white/5 mt-1 font-mono italic">
                              Admin: "{leave.adminNotes}"
                            </p>
                          ) : (
                            <p className="text-[9px] text-slate-400 italic">Reason: "{leave.reason}"</p>
                          )}
                        </div>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-lg border ${
                          leave.status === 'Approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                          leave.status === 'Rejected' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                          'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}>
                          {leave.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Secure Compliance Roster Block (Read-Only) */}
                <div className="mt-5 pt-5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Biometric Checkpoint System</p>
                    <p className="text-xs text-slate-300 font-medium mt-1 leading-normal max-w-xl">
                      Your daily attendance state is certified automatically by your company's digital roster and security checkpoints. Individual manual modifications are not permitted.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">Today's Status:</span>
                    <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase border ${
                      todayRecord?.status === 'Present' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                      todayRecord?.status === 'Leave' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                      todayRecord?.status === 'Half-Day' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                      todayRecord?.status === 'Absent' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                      'bg-slate-800/50 border-slate-700/50 text-slate-400'
                    }`}>
                      {todayRecord?.status || 'Rest Day / Weekend'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comprehensive Details Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Contact & Contract Card */}
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-800/60">
                    <Briefcase className="h-4.5 w-4.5 text-sky-400" />
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-200">Contract & Corporate Role</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Department</span>
                      <p className="font-extrabold text-slate-300 mt-0.5">{employee.department}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Job Designation</span>
                      <p className="font-extrabold text-slate-300 mt-0.5">{employee.role}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Employment Segment</span>
                      <p className="font-extrabold text-slate-300 mt-0.5">{employee.employmentType || 'Full-Time'}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Joining Date</span>
                      <p className="font-extrabold text-slate-300 mt-0.5">{employee.joiningDate || '2024-01-10'}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Current Annual Wage</span>
                      <p className="font-extrabold text-emerald-400 mt-0.5">${employee.salary.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Monthly Gross</span>
                      <p className="font-extrabold text-slate-300 mt-0.5">${Math.round(employee.salary / 12).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Personal Contact Details */}
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-800/60">
                    <User className="h-4.5 w-4.5 text-indigo-400" />
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-200">Personal Contact</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
                    <div className="col-span-2">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Registered Email</span>
                      <p className="font-bold text-slate-300 mt-0.5 flex items-center gap-1.5 font-mono">
                        <Mail className="h-3 w-3 text-slate-500" />
                        <span>{employee.email}</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Contact Phone</span>
                      <p className="font-bold text-slate-300 mt-0.5 flex items-center gap-1.5 font-mono">
                        <Phone className="h-3 w-3 text-slate-500" />
                        <span>{employee.phone || '+1 (555) 012-3456'}</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Emergency Contact</span>
                      <p className="font-bold text-slate-300 mt-0.5 font-mono">
                        {employee.emergencyContact || 'Not Specified'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Notes / Workspace Bio</span>
                      <p className="text-slate-400 text-[11px] leading-relaxed mt-1">
                        {employee.notes || 'Secure personnel database segment registered under local HRMS compliance protocols.'}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 2. ATTENDANCE HISTORY VIEW */}
          {activeTab === 'attendance' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Calendar Month Navigation Header */}
              <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-widest flex items-center gap-2 justify-center sm:justify-start">
                    <Calendar className="h-4 w-4 text-sky-400" />
                    <span>Monthly Roster Timeline</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Interactive digital calendar showing audited active working states for the entire month.
                  </p>
                </div>
                
                {/* Month/Year Controller */}
                <div className="flex items-center gap-3 bg-slate-950 border border-slate-800/80 p-1.5 rounded-xl">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition active:scale-90 cursor-pointer"
                    title="Previous Month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-200 min-w-[120px] text-center font-mono uppercase tracking-wider">
                    {monthNames[selectedCalendarMonth]} {selectedCalendarYear}
                  </span>
                  <button
                    onClick={handleNextMonth}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition active:scale-90 cursor-pointer"
                    title="Next Month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Statistics Grid for Selected Month */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-slate-900/50 border border-slate-800/60 p-3.5 rounded-2xl flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Present Days</span>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <p className="text-xl font-black text-emerald-400 font-mono leading-none">
                      {calendarStats.present}
                    </p>
                    <span className="text-[9px] text-slate-500 font-bold">days</span>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800/60 p-3.5 rounded-2xl flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Half-Day</span>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <p className="text-xl font-black text-indigo-400 font-mono leading-none">
                      {calendarStats.halfDay}
                    </p>
                    <span className="text-[9px] text-slate-500 font-bold">shifts</span>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800/60 p-3.5 rounded-2xl flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">On Leave</span>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <p className="text-xl font-black text-amber-400 font-mono leading-none">
                      {calendarStats.leave}
                    </p>
                    <span className="text-[9px] text-slate-500 font-bold">days</span>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800/60 p-3.5 rounded-2xl flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Absences</span>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <p className="text-xl font-black text-rose-400 font-mono leading-none">
                      {calendarStats.absent}
                    </p>
                    <span className="text-[9px] text-slate-500 font-bold">days</span>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800/60 p-3.5 rounded-2xl col-span-2 sm:col-span-1 flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Rest / Weekend</span>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <p className="text-xl font-black text-slate-400 font-mono leading-none">
                      {calendarStats.weekend}
                    </p>
                    <span className="text-[9px] text-slate-500 font-bold">days</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Calendar Grid Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
                
                {/* Grid Weekday Headers */}
                <div className="grid grid-cols-7 gap-2 text-center">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, index) => (
                    <div 
                      key={d} 
                      className={`text-[10px] font-extrabold uppercase tracking-widest py-1.5 rounded-lg ${
                        index === 0 || index === 6 ? 'text-rose-400/70 bg-rose-500/5' : 'text-slate-400 bg-slate-950/40'
                      }`}
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Grid Day Cells */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Empty cells for offset */}
                  {Array.from({ length: firstDayOffset }).map((_, index) => (
                    <div 
                      key={`empty-${index}`} 
                      className="aspect-square bg-slate-950/10 border border-transparent rounded-xl opacity-30"
                    />
                  ))}

                  {/* Days of the month */}
                  {Array.from({ length: daysInMonth }).map((_, index) => {
                    const dNum = index + 1;
                    const details = getDayStatusDetails(dNum);
                    
                    return (
                      <div 
                        key={`day-${dNum}`} 
                        className={`aspect-square rounded-xl p-2 border flex flex-col justify-between transition group hover:scale-[1.02] hover:-translate-y-0.5 relative cursor-default ${details.color}`}
                      >
                        {/* Day Number and Indicator */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold font-mono text-slate-200">{dNum}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${details.indicator}`} />
                        </div>

                        {/* Status Icon */}
                        <div className="flex justify-center my-0.5">
                          {details.status === 'Present' && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
                          {details.status === 'Absent' && <X className="h-4 w-4 text-rose-400 shrink-0" />}
                          {details.status === 'Half-Day' && <Clock className="h-4 w-4 text-indigo-400 shrink-0" />}
                          {details.status === 'Leave' && <Calendar className="h-4 w-4 text-amber-400 shrink-0" />}
                          {details.status === 'Weekend' && <Coffee className="h-4 w-4 text-slate-500 shrink-0" />}
                          {details.status === 'Future' && <Clock className="h-4 w-4 text-slate-700 shrink-0 opacity-60" />}
                        </div>

                        {/* Day label */}
                        <span className="text-[8px] font-black uppercase tracking-wider text-center truncate font-mono block opacity-80 group-hover:opacity-100">
                          {details.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Calendar Legend */}
                <div className="pt-4 border-t border-slate-800/50 flex flex-wrap gap-x-5 gap-y-2 justify-center text-[9px] font-semibold text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Present</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span>Half-Day</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Leave / Approved Out</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span>Absent</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-500" />
                    <span>Weekend / Rest Day</span>
                  </div>
                </div>
              </div>

              {/* Log Table of recent days (Read-Only Audit Trail) */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-widest">Attendance Audit Trail</h3>
                  <span className="text-[9px] text-slate-500 font-mono font-bold uppercase">All registered logs</span>
                </div>

                <div className="overflow-x-auto">
                  {myAttendance.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs font-semibold">
                      No attendance records found for your account.
                    </div>
                  ) : (
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-slate-950/40 text-slate-400 border-b border-slate-800/40">
                          <th className="px-5 py-3 font-extrabold uppercase tracking-wider text-[9px]">Checkpoint Date</th>
                          <th className="px-5 py-3 font-extrabold uppercase tracking-wider text-[9px]">Logged State</th>
                          <th className="px-5 py-3 font-extrabold uppercase tracking-wider text-[9px]">Record Verification ID</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40 font-medium">
                        {myAttendance.slice().reverse().map((rec) => (
                          <tr key={rec.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-5 py-3 text-slate-200 font-bold font-mono">{rec.date}</td>
                            <td className="px-5 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                rec.status === 'Present' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                                rec.status === 'Leave' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
                                rec.status === 'Half-Day' ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400' :
                                'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                              }`}>
                                {rec.status}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-slate-500 font-mono text-[10px]">{rec.id.toUpperCase()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* 3. SALARY PAY SLIPS VIEW */}
          {activeTab === 'salary' && (() => {
            const [selMonthName, selYear] = selectedMonth.split(' ');
            const approvedSlip = salarySlips?.find(
              s => s.employeeId === employee.id && s.month === selMonthName && s.year === selYear
            );
            const isApproved = !!approvedSlip;

            // Define values based on approval or provisional estimates
            const displayCompanyName = approvedSlip ? approvedSlip.companyName : "Enterprise Systems Inc.";
            const displayPayDate = approvedSlip ? `${approvedSlip.payDateDay} ${approvedSlip.month} ${approvedSlip.year}` : `Pending ${selectedMonth}`;
            
            const displayBasicSalary = approvedSlip ? approvedSlip.baseSalary : Math.round(baseSalary);
            const displayHra = approvedSlip ? approvedSlip.hra : allowances.hra;
            const displayDa = approvedSlip ? approvedSlip.da : allowances.da;
            const displayConveyance = approvedSlip ? approvedSlip.conveyance : 0;
            const displayMedical = approvedSlip ? approvedSlip.medical : 0;
            const displaySpecial = approvedSlip ? approvedSlip.specialAllowance : allowances.special;
            
            const displayGross = approvedSlip ? approvedSlip.totalEarnings : Math.round(baseSalary + totalAllowances);
            
            const displayPf = approvedSlip ? approvedSlip.pf : deductions.pf;
            const displayTax = approvedSlip ? approvedSlip.taxDeduction : deductions.tax;
            const displayHealth = approvedSlip ? 0 : deductions.health; // Only in draft estimate
            const displayLopDays = approvedSlip ? approvedSlip.lopDays : 0;
            const displayLopDeduction = approvedSlip ? approvedSlip.lopDeduction : 0;
            
            const displayTotalDeductions = approvedSlip ? approvedSlip.totalDeductions : totalDeductions;
            const displayNetPaid = approvedSlip ? approvedSlip.netPay : Math.round(netPaid);
            const currencySymbol = approvedSlip ? "₹" : "$";
            const currencyLabel = approvedSlip ? "INR (INDIAN RUPEE)" : "USD (UNITED STATES DOLLAR)";

            return (
              <div className="space-y-6 animate-fade-in">
                {/* Slip Control header */}
                <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-widest">Select Statement Period</h3>
                    <p className="text-[10px] text-slate-400 leading-normal">Choose the statement cycle to view and download your official approved payslip.</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs font-mono font-bold rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none"
                    >
                      <option value="June 2026">June 2026</option>
                      <option value="May 2026">May 2026</option>
                      <option value="April 2026">April 2026</option>
                      <option value="March 2026">March 2026</option>
                    </select>

                    <button
                      onClick={handleDownloadPDF}
                      disabled={isPdfGenerating}
                      className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:scale-105 border border-transparent text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <Download className="h-3.5 w-3.5 text-slate-950" />
                      <span>{isPdfGenerating ? 'Generating...' : 'Download PDF Form'}</span>
                    </button>

                    <button
                      onClick={() => window.print()}
                      className="bg-slate-800 hover:bg-slate-750 border border-slate-700/50 text-slate-200 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>Print Statement</span>
                    </button>
                  </div>
                </div>

                {/* Status Indicator Banner */}
                {!isApproved ? (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-[11px] text-amber-300 flex items-start gap-2.5">
                    <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-amber-400" />
                    <div>
                      <span className="font-extrabold uppercase tracking-wider text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono mr-1.5 font-sans">PROVISIONAL ESTIMATE</span>
                      <span>The salary slip for <strong>{selectedMonth}</strong> has not yet been approved or finalized by HR Admin. Showing provisional/draft estimates based on contract records.</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-[11px] text-emerald-300 flex items-start gap-2.5">
                    <ShieldCheck className="w-4.5 h-4.5 shrink-0 mt-0.5 text-emerald-400" />
                    <div>
                      <span className="font-extrabold uppercase tracking-wider text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono mr-1.5 font-sans">APPROVED BY HR</span>
                      <span>The official salary slip for <strong>{selectedMonth}</strong> has been successfully approved, verified, and published by the Admin. Reference ID is active.</span>
                    </div>
                  </div>
                )}

                {/* Printable Pay Slip Container */}
                <div 
                  className="bg-white text-slate-950 rounded-2xl p-8 shadow-2xl relative border border-slate-200 font-sans print:m-0 print:p-0"
                  id="payslip-print-canvas-employee"
                >
                  
                  {/* Security Logo Stamp */}
                  <div className={`absolute top-6 right-6 border-2 border-dashed rounded px-3 py-1 font-mono text-[10px] font-black tracking-widest rotate-12 select-none pointer-events-none ${
                    isApproved ? 'border-emerald-600/20 text-emerald-700/20' : 'border-amber-600/20 text-amber-700/20'
                  }`}>
                    {isApproved ? 'VERIFIED & PAID' : 'PROVISIONAL DRAFT'}
                  </div>

                  {/* Slip Header */}
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-6 border-b border-slate-200">
                    <div className="space-y-1">
                      <h2 className="text-xl font-black tracking-tight text-slate-900">{displayCompanyName}</h2>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Enterprise Systems Inc.</p>
                      <p className="text-[9px] text-slate-400">100 Corporate Parkway, Tech District</p>
                    </div>
                    <div className="text-right sm:text-right text-xs">
                      <h3 className="font-extrabold text-slate-900 uppercase tracking-widest text-[10px]">PAYSLIP STATEMENT</h3>
                      <p className="font-mono text-slate-600 font-bold mt-1">Ref: PSL-2026-{employee.id.toUpperCase()}</p>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Pay Period: <strong className="text-slate-800">{selectedMonth}</strong></p>
                    </div>
                  </div>

                  {/* Roster & Contract info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6 border-b border-slate-200 text-xs">
                    <div className="space-y-1.5">
                      <div className="flex"><span className="text-slate-400 font-bold w-24">Employee ID:</span> <span className="font-mono font-bold text-slate-900">{employee.id.toUpperCase()}</span></div>
                      <div className="flex"><span className="text-slate-400 font-bold w-24">Name:</span> <span className="font-bold text-slate-900">{employee.name}</span></div>
                      <div className="flex"><span className="text-slate-400 font-bold w-24">Role:</span> <span className="font-bold text-slate-900">{employee.role}</span></div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex"><span className="text-slate-400 font-bold w-28">Department:</span> <span className="font-bold text-slate-900">{employee.department}</span></div>
                      <div className="flex"><span className="text-slate-400 font-bold w-28">Email:</span> <span className="font-mono font-bold text-slate-900">{employee.email}</span></div>
                      <div className="flex"><span className="text-slate-400 font-bold w-28">Pay Date:</span> <span className="font-bold text-slate-900">{displayPayDate}</span></div>
                    </div>
                  </div>

                  {/* Earnings & Deductions Tables */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 py-6 text-xs">
                    {/* Earnings */}
                    <div className="space-y-3">
                      <h4 className="font-black text-slate-900 border-b border-slate-300 pb-1 uppercase text-[10px] tracking-wider">Earnings breakdown</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between font-medium">
                          <span className="text-slate-600">Basic Wage Salary (Monthly)</span>
                          <span className="font-mono text-slate-900 font-bold">{currencySymbol}{displayBasicSalary.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span className="text-slate-600">House Rent Allowance (HRA)</span>
                          <span className="font-mono text-slate-900">{currencySymbol}{displayHra.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span className="text-slate-600">Dearness Allowance (DA)</span>
                          <span className="font-mono text-slate-900">{currencySymbol}{displayDa.toLocaleString()}</span>
                        </div>
                        {displayConveyance > 0 && (
                          <div className="flex justify-between font-medium">
                            <span className="text-slate-600">Conveyance Allowance</span>
                            <span className="font-mono text-slate-900">{currencySymbol}{displayConveyance.toLocaleString()}</span>
                          </div>
                        )}
                        {displayMedical > 0 && (
                          <div className="flex justify-between font-medium">
                            <span className="text-slate-600">Medical Allowance</span>
                            <span className="font-mono text-slate-900">{currencySymbol}{displayMedical.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-medium">
                          <span className="text-slate-600">Special Incentives</span>
                          <span className="font-mono text-slate-900">{currencySymbol}{displaySpecial.toLocaleString()}</span>
                        </div>
                        <div className="border-t border-slate-200 pt-2 flex justify-between font-extrabold text-slate-900">
                          <span>Gross Salary</span>
                          <span className="font-mono font-black">{currencySymbol}{displayGross.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Deductions */}
                    <div className="space-y-3 mt-6 md:mt-0">
                      <h4 className="font-black text-slate-900 border-b border-slate-300 pb-1 uppercase text-[10px] tracking-wider">Deductions breakdown</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between font-medium">
                          <span className="text-slate-600">Provident Fund (PF) Contribution</span>
                          <span className="font-mono text-slate-900 font-bold">{currencySymbol}{displayPf.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span className="text-slate-600">Professional State Tax</span>
                          <span className="font-mono text-slate-900">{currencySymbol}{displayTax.toLocaleString()}</span>
                        </div>
                        {displayHealth > 0 && (
                          <div className="flex justify-between font-medium">
                            <span className="text-slate-600">Health Insurance Premium</span>
                            <span className="font-mono text-slate-900">{currencySymbol}{displayHealth.toLocaleString()}</span>
                          </div>
                        )}
                        {displayLopDays > 0 && (
                          <div className="flex justify-between font-medium text-rose-600 font-bold">
                            <span>LOP Absences ({displayLopDays} Days)</span>
                            <span className="font-mono">-{currencySymbol}{displayLopDeduction.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="border-t border-slate-200 pt-2 flex justify-between font-extrabold text-slate-900">
                          <span>Total Deductions</span>
                          <span className="font-mono font-black">{currencySymbol}{displayTotalDeductions.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Net Disbursed Take-Home</span>
                      <p className="text-xs text-slate-500 mt-0.5">Amount credited directly into your registered bank profile.</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-mono block">{currencyLabel}</span>
                      <p className="text-xl font-black text-slate-950 font-mono mt-0.5">{currencySymbol}{displayNetPaid.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Footer notes */}
                  <div className="mt-8 pt-4 border-t border-slate-200 text-[9px] text-slate-400 leading-normal text-center font-mono">
                    This payslip statement is automatically generated and does not require a physical signature. Under local compliance rules.
                  </div>
                </div>

              </div>
            );
          })()}

          {/* 4. APPLY FOR LEAVE VIEW */}
          {activeTab === 'leave' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Apply Form Card */}
                <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
                    <Plus className="h-4 w-4 text-sky-400" />
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-200">Request Leave</h3>
                  </div>

                  {leaveSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      <span>Leave application submitted successfully!</span>
                    </div>
                  )}

                  <form onSubmit={handleLeaveSubmit} className="space-y-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Leave Classification</label>
                      <select
                        value={leaveType}
                        onChange={(e) => setLeaveType(e.target.value as LeaveRequest['type'])}
                        className="w-full bg-slate-950 border border-slate-800/60 focus:border-sky-400 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none"
                      >
                        <option value="Annual">Annual Leave</option>
                        <option value="Sick">Sick Leave</option>
                        <option value="Maternity/Paternity">Maternity / Paternity</option>
                        <option value="Casual">Casual Leave</option>
                        <option value="Unpaid">Unpaid Leave</option>
                        <option value="Other">Other Reasons</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Start Date</label>
                        <input
                          type="date"
                          required
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800/60 focus:border-sky-400 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">End Date</label>
                        <input
                          type="date"
                          required
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800/60 focus:border-sky-400 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Reason / Description</label>
                      <textarea
                        required
                        placeholder="Please state the specific reason for your leave request..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-950 border border-slate-800/60 focus:border-sky-400 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-black py-2.5 rounded-xl uppercase tracking-wider text-[10px] flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Transmit Application</span>
                    </button>
                  </form>
                </div>

                {/* Applications Table Card */}
                <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-indigo-400" />
                      <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-200">Leave Logs</h3>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono font-bold uppercase">Status monitoring</span>
                  </div>

                  <div className="overflow-x-auto">
                    {myLeaves.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-xs font-semibold">
                        No leave applications registered.
                      </div>
                    ) : (
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="bg-slate-950/40 text-slate-400 border-b border-slate-800/40">
                            <th className="px-3 py-2.5 font-extrabold uppercase tracking-wider text-[9px]">Period</th>
                            <th className="px-3 py-2.5 font-extrabold uppercase tracking-wider text-[9px]">Classification</th>
                            <th className="px-3 py-2.5 font-extrabold uppercase tracking-wider text-[9px]">Status</th>
                            <th className="px-3 py-2.5 font-extrabold uppercase tracking-wider text-[9px]">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40 font-medium">
                          {myLeaves.map((leave) => (
                            <tr key={leave.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-3 py-2.5 font-mono text-[10px] text-slate-200">
                                {leave.startDate} to {leave.endDate}
                              </td>
                              <td className="px-3 py-2.5">
                                <span className="font-extrabold text-slate-300">{leave.type}</span>
                              </td>
                              <td className="px-3 py-2.5">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                  leave.status === 'Approved' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                                  leave.status === 'Rejected' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' :
                                  'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                                }`}>
                                  {leave.status}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-slate-500 text-[10px] truncate max-w-[120px]" title={leave.reason}>
                                {leave.adminNotes || leave.reason}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
