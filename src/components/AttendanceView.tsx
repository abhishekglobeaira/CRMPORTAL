/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Check, 
  X, 
  Calendar, 
  UserCheck, 
  UserX, 
  Coffee, 
  Save, 
  ChevronLeft, 
  ChevronRight,
  Info,
  Download,
  FileSpreadsheet,
  Fingerprint,
  Wifi,
  WifiOff,
  Activity,
  Play,
  Square,
  RefreshCw,
  Cpu,
  Database,
  Terminal,
  ArrowRight
} from 'lucide-react';
import { Employee, AttendanceRecord, AttendanceStatus } from '../types';

interface AttendanceViewProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  onSaveAttendance: (date: string, records: { employeeId: string; status: AttendanceStatus }[]) => void;
  selectedEmpIdFromNavigation?: string; // Optional direct deep-linking
}

export default function AttendanceView({
  employees,
  attendance,
  onSaveAttendance,
  selectedEmpIdFromNavigation
}: AttendanceViewProps) {
  // Date State - default to today
  const getTodayStr = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getTodayStr());

  // Temp local attendance state for the selected date
  const [localRecords, setLocalRecords] = useState<Record<string, AttendanceStatus>>({});

  // Biometric Machine States
  const [isBiometricConnected, setIsBiometricConnected] = useState(true);
  const [autoCommitBiometric, setAutoCommitBiometric] = useState(true);
  const [isAutomatedScanning, setIsAutomatedScanning] = useState(false);
  const [selectedBiometricEmpId, setSelectedBiometricEmpId] = useState('');
  const [manualPunchType, setManualPunchType] = useState<'IN' | 'OUT'>('IN');
  const [isManualScanningAnim, setIsManualScanningAnim] = useState(false);
  const [biometricAuthStatus, setBiometricAuthStatus] = useState<'idle' | 'scanning' | 'authorized' | 'failed'>('idle');
  const [biometricLogs, setBiometricLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] [SYSTEM] Biometric Machine API Gateway Initialized.`,
    `[${new Date().toLocaleTimeString()}] [TERMINAL-01] IP 192.168.1.185 connected successfully.`,
    `[${new Date().toLocaleTimeString()}] [COM5] ZKTeco USB Handshake initialized via START_ACK.`
  ]);

  // Set default biometric target employee
  useEffect(() => {
    if (employees.length > 0 && !selectedBiometricEmpId) {
      setSelectedBiometricEmpId(employees[0].id);
    }
  }, [employees, selectedBiometricEmpId]);

  // Biometric log helper
  const addBiometricLog = (message: string) => {
    const time = new Date().toLocaleTimeString();
    setBiometricLogs(prev => [`[${time}] ${message}`, ...prev].slice(0, 40));
  };

  // Biometric Punch Core Action
  const handleBiometricPunch = (empId: string, type: 'IN' | 'OUT') => {
    if (!isBiometricConnected) {
      addBiometricLog(`[ERROR] Scan aborted. Biometric Terminal is OFFLINE.`);
      return;
    }

    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    // Biometric scanner logic
    addBiometricLog(`[BIO-SCANNER-01] Fingerprint read initiated for ${emp.name} (${emp.id}).`);
    
    // Set status to Present on clock-in
    const statusToSet: AttendanceStatus = 'Present';

    setLocalRecords(prev => {
      const updated = {
        ...prev,
        [empId]: statusToSet
      };

      // Trigger automatic save if autoCommit is active
      if (autoCommitBiometric) {
        const submission = Object.entries(updated).map(([id, stat]) => ({
          employeeId: id,
          status: stat as AttendanceStatus
        }));
        onSaveAttendance(selectedDate, submission);
        addBiometricLog(`[CLOUD-SYNC] Auto-committed attendance status [Present] for ${emp.name} to Firestore db.`);
      } else {
        addBiometricLog(`[LOCAL-MEM] Updated local status to [Present] for ${emp.name}. State is uncommitted.`);
      }

      return updated;
    });

    addBiometricLog(`[SUCCESS] Fingerprint authorized. Match: 99.8%. Action: CLOCK-${type}.`);
  };

  // Automated Biometric Traffic Generator (Interval Loop)
  useEffect(() => {
    if (!isAutomatedScanning || !isBiometricConnected || employees.length === 0) return;

    addBiometricLog(`[SYSTEM] Automated foot-traffic simulator started. Periodic biometric polling active.`);

    const interval = setInterval(() => {
      // Pick random employee
      const randomEmp = employees[Math.floor(Math.random() * employees.length)];
      const randomType = Math.random() > 0.45 ? 'IN' : 'OUT';
      
      addBiometricLog(`[AUTO-POLL] Simulated office entrance sensor triggered.`);
      handleBiometricPunch(randomEmp.id, randomType);
    }, 6000); // Poll/Punch every 6 seconds for beautiful visible feedback

    return () => {
      clearInterval(interval);
      addBiometricLog(`[SYSTEM] Automated foot-traffic simulator deactivated.`);
    };
  }, [isAutomatedScanning, isBiometricConnected, employees, onSaveAttendance, selectedDate, autoCommitBiometric]);

  // Helper to determine default status based on department weekly policies
  const getDefaultStatus = (emp: Employee, dateStr: string): AttendanceStatus => {
    const parts = dateStr.split('-');
    const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const dept = (emp.department || '').toLowerCase();

    if (dept === 'it' || dept === 'engineering') {
      if (dayOfWeek === 6 || dayOfWeek === 0) { // Saturday or Sunday
        return 'Leave';
      }
    } else if (dept === 'infrastructure' || dept === 'infra') {
      if (dayOfWeek === 6) { // Saturday
        return 'Half-Day';
      } else if (dayOfWeek === 0) { // Sunday
        return 'Leave';
      }
    } else {
      if (dayOfWeek === 0) { // Sunday is default leave for everyone
        return 'Leave';
      }
    }
    return 'Present';
  };

  // When date or master attendance list changes, load the data
  useEffect(() => {
    const recordsForDate = attendance.filter(r => r.date === selectedDate);
    const initialLocal: Record<string, AttendanceStatus> = {};

    employees.forEach(emp => {
      const match = recordsForDate.find(r => r.employeeId === emp.id);
      initialLocal[emp.id] = match ? match.status : getDefaultStatus(emp, selectedDate);
    });

    setLocalRecords(initialLocal);
  }, [selectedDate, attendance, employees]);

  // Handle single status change
  const handleStatusChange = (employeeId: string, status: AttendanceStatus) => {
    setLocalRecords(prev => ({
      ...prev,
      [employeeId]: status
    }));
  };

  // Quick mark all helpers
  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    employees.forEach(emp => {
      updated[emp.id] = status;
    });
    setLocalRecords(updated);
  };

  // Submit/Save attendance for the active date
  const handleSave = () => {
    const submission = Object.entries(localRecords).map(([employeeId, status]) => ({
      employeeId,
      status: status as AttendanceStatus
    }));
    onSaveAttendance(selectedDate, submission);
  };

  // Export to Excel / CSV
  const handleExportCSV = (allDates: boolean = false) => {
    let headers = ["Date", "Day of Week", "Employee ID", "Employee Name", "Email", "Department", "Role", "Status"];
    let rows: any[][] = [];

    if (allDates) {
      attendance.forEach(r => {
        const emp = employees.find(e => e.id === r.employeeId);
        if (emp) {
          rows.push([
            r.date,
            getWeekdayName(r.date),
            emp.id,
            emp.name,
            emp.email,
            emp.department,
            emp.role,
            r.status
          ]);
        }
      });
    } else {
      employees.forEach(emp => {
        const status = localRecords[emp.id] || 'Present';
        rows.push([
          selectedDate,
          getWeekdayName(selectedDate),
          emp.id,
          emp.name,
          emp.email,
          emp.department,
          emp.role,
          status
        ]);
      });
    }

    const csvRows = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ];
    
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const filename = allDates 
      ? `all_attendance_logs_${new Date().toISOString().split('T')[0]}.csv`
      : `attendance_roster_${selectedDate}.csv`;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export as a calendar-grid matrix (dates with weekday as columns, employees as rows)
  const handleExportMatrixCSV = () => {
    // Gather all unique dates recorded in the history plus the selected/current date
    const uniqueDates = Array.from(new Set([
      ...attendance.map(r => r.date),
      selectedDate
    ])).sort();
    
    // Format headers to display "YYYY-MM-DD (Weekday)"
    const dateHeaders = uniqueDates.map(date => {
      const parts = date.split('-');
      const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' }); // "Mon", "Tue", etc.
      return `${date} (${dayName})`;
    });

    // Header Row: Employee metadata + sorted date columns + summary stats
    const headers = [
      "Employee ID", 
      "Employee Name", 
      "Email", 
      "Department", 
      "Role", 
      ...dateHeaders, 
      "Total Presents", 
      "Total Half-Days", 
      "Total Leaves", 
      "Total Absents", 
      "Total Working Days (Presents + 0.5 * Half-Days)"
    ];
    
    const rows: any[][] = [];
    
    employees.forEach(emp => {
      const row: (string | number)[] = [
        emp.id, 
        emp.name, 
        emp.email, 
        emp.department, 
        emp.role
      ];
      
      let presentCount = 0;
      let halfDayCount = 0;
      let leaveCount = 0;
      let absentCount = 0;
      
      uniqueDates.forEach(date => {
        // Find existing record in master state
        const record = attendance.find(r => r.employeeId === emp.id && r.date === date);
        let status: AttendanceStatus;
        
        if (record) {
          status = record.status;
        } else if (date === selectedDate) {
          // Fallback to active local state for the currently displayed date
          status = localRecords[emp.id] || 'Present';
        } else {
          // Fallback to default weekly policy status
          status = getDefaultStatus(emp, date);
        }
        
        row.push(status);
        
        if (status === 'Present') presentCount++;
        else if (status === 'Half-Day') halfDayCount++;
        else if (status === 'Leave') leaveCount++;
        else if (status === 'Absent') absentCount++;
      });
      
      const paidDays = presentCount + leaveCount + (halfDayCount * 0.5);
      
      // Append statistics
      row.push(
        presentCount, 
        halfDayCount, 
        leaveCount, 
        absentCount, 
        paidDays
      );
      
      rows.push(row);
    });
    
    const csvRows = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ];
    
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_calendar_matrix_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Date Navigator Helpers
  const shiftDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  // Summary Metrics for the Selected Date
  const totalEmployees = employees.length;
  const listRecords = Object.values(localRecords);
  const presentCount = listRecords.filter(s => s === 'Present').length;
  const absentCount = listRecords.filter(s => s === 'Absent').length;
  const leaveCount = listRecords.filter(s => s === 'Leave').length;
  const halfDayCount = listRecords.filter(s => s === 'Half-Day').length;

  const presentPercentage = totalEmployees > 0 ? Math.round(((presentCount + halfDayCount * 0.5) / totalEmployees) * 100) : 0;

  // Weekday Name Helper
  const getWeekdayName = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Get active month and year from selectedDate
  const getActiveMonthYear = (dateStr: string) => {
    if (!dateStr) return { yearStr: '2026', monthStr: '06' };
    const parts = dateStr.split('-');
    const yearStr = parts[0];
    const monthStr = parts[1];
    return { yearStr, monthStr };
  };

  const { yearStr: activeYear, monthStr: activeMonth } = getActiveMonthYear(selectedDate);
  const activeMonthName = new Date(parseInt(activeYear, 10), parseInt(activeMonth, 10) - 1, 1)
    .toLocaleString('default', { month: 'long', year: 'numeric' });

  // Calculate month-wise stats for all employees
  const employeeMonthlyStats = useMemo(() => {
    const targetPrefix = `${activeYear}-${activeMonth}`;
    
    // Get total days in this active month
    const totalDays = new Date(parseInt(activeYear, 10), parseInt(activeMonth, 10), 0).getDate();
    
    const stats: Record<string, {
      totalDays: number;
      presentCount: number;
      halfDayCount: number;
      leaveCount: number;
      absentCount: number;
      totalWorkingDays: number; // Present + 0.5 * Half-Day
    }> = {};

    employees.forEach(emp => {
      let present = 0;
      let half = 0;
      let leave = 0;
      let absent = 0;

      for (let d = 1; d <= totalDays; d++) {
        const dayStr = String(d).padStart(2, '0');
        const dateStr = `${targetPrefix}-${dayStr}`;

        let status: AttendanceStatus;

        if (dateStr === selectedDate) {
          // Current selected day uses the local modifications
          status = localRecords[emp.id] || 'Present';
        } else {
          // Check saved attendance array
          const savedMatch = attendance.find(r => r.employeeId === emp.id && r.date === dateStr);
          if (savedMatch) {
            status = savedMatch.status;
          } else {
            // Policy fallback
            status = getDefaultStatus(emp, dateStr);
          }
        }

        if (status === 'Present') present++;
        else if (status === 'Half-Day') half++;
        else if (status === 'Leave') leave++;
        else if (status === 'Absent') absent++;
      }

      const totalWorkingDays = present + (half * 0.5);

      stats[emp.id] = {
        totalDays,
        presentCount: present,
        halfDayCount: half,
        leaveCount: leave,
        absentCount: absent,
        totalWorkingDays
      };
    });

    return stats;
  }, [employees, attendance, localRecords, selectedDate, activeYear, activeMonth]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Policy Notice Box */}
      <div className="bg-slate-900/40 p-4.5 rounded-2xl border border-slate-800/80 flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-4.5 h-4.5 text-teal-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-extrabold text-slate-200">Department Weekly Schedule Policies:</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400 text-[11px]">
            <li><strong className="text-teal-400 font-bold">IT & Engineering Departments:</strong> Saturday and Sunday are marked as default weekend <span className="text-amber-400">Leave</span>.</li>
            <li><strong className="text-sky-400 font-bold">Infrastructure Department:</strong> Monday–Friday are 5 full working days, Saturday is a default <span className="text-indigo-400">Half-Day</span>, and Sunday is <span className="text-amber-400">Leave</span>.</li>
            <li><strong className="text-slate-300 font-bold">Other Departments:</strong> Sunday is a default <span className="text-amber-400">Leave</span> day.</li>
          </ul>
        </div>
      </div>

      {/* Date Navigation & Controls */}
      <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between bg-slate-900/30 p-5 rounded-2xl border border-slate-800/40">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => shiftDate(-1)}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 border border-slate-700/20 active:scale-95 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-800/40 border border-slate-700/40 rounded-xl">
            <Calendar className="w-4 h-4 text-teal-400" />
            <input
              id="attendance-date-picker"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
            />
          </div>

          <span className="text-[11px] bg-teal-500/10 border border-teal-500/20 text-teal-300 font-extrabold px-3 py-2 rounded-xl font-mono">
            {getWeekdayName(selectedDate)}
          </span>

          <button 
            onClick={() => shiftDate(1)}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 border border-slate-700/20 active:scale-95 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Batch Tools */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            id="btn-mark-all-present"
            onClick={() => handleMarkAll('Present')}
            className="px-3 py-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-xl transition cursor-pointer"
          >
            Mark All Present
          </button>
          <button
            id="btn-mark-all-leave"
            onClick={() => handleMarkAll('Leave')}
            className="px-3 py-2 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 rounded-xl transition cursor-pointer"
          >
            Mark All On Leave
          </button>
          
          {/* Excel Export Buttons */}
          <button
            id="btn-export-matrix-csv"
            onClick={handleExportMatrixCSV}
            className="px-3 py-2 text-[10px] font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            title="Export date-wise complete calendar grid matrix to Excel CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export Calendar Grid (Excel)</span>
          </button>
          
          <button
            id="btn-export-today-csv"
            onClick={() => handleExportCSV(false)}
            className="px-3 py-2 text-[10px] font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            title="Export selected date's roster to Excel CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
            <span>Export Roster (Excel)</span>
          </button>
          
          <button
            id="btn-export-all-csv"
            onClick={() => handleExportCSV(true)}
            className="px-3 py-2 text-[10px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            title="Export all historical logs to Excel CSV"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Export All Logs</span>
          </button>
          
          <button
            id="btn-save-attendance-main"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 rounded-xl shadow-lg shadow-teal-500/10 hover:shadow-teal-500/25 flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Attendance</span>
          </button>
        </div>
      </div>

      {/* Date Stat Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/80 flex items-center gap-4">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Present</span>
            <p className="text-xl font-extrabold text-slate-100 font-mono mt-0.5">{presentCount} / {totalEmployees}</p>
          </div>
        </div>

        <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/80 flex items-center gap-4">
          <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-lg">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Absent</span>
            <p className="text-xl font-extrabold text-slate-100 font-mono mt-0.5">{absentCount} / {totalEmployees}</p>
          </div>
        </div>

        <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/80 flex items-center gap-4">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">On Leave</span>
            <p className="text-xl font-extrabold text-slate-100 font-mono mt-0.5">{leaveCount} / {totalEmployees}</p>
          </div>
        </div>

        <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/80 flex items-center gap-4">
          <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-lg">
            <Save className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Daily Compliance</span>
            <p className="text-xl font-extrabold text-slate-100 font-mono mt-0.5">{presentPercentage}% Worked</p>
          </div>
        </div>
      </div>

      {/* Biometric & RFID Machine Integration Hub */}
      <div className="bg-[#0e1629] border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-teal-500 via-sky-500 to-indigo-500" />
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isBiometricConnected ? 'bg-teal-500/10 text-teal-400' : 'bg-rose-500/10 text-rose-400'}`}>
              <Fingerprint className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">Enterprise Biometric Terminal (ZKTeco SF300)</h3>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  isBiometricConnected 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${isBiometricConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`} />
                  {isBiometricConnected ? 'Online / Connected' : 'Disconnected'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Simulate hardware fingerprint punches & automated synchronization for remote or local hardware terminals.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const nextState = !isBiometricConnected;
                setIsBiometricConnected(nextState);
                if (nextState) {
                  addBiometricLog(`[SYSTEM] Biometric terminal linked successfully via TCP/IP Socket.`);
                } else {
                  addBiometricLog(`[SYSTEM] Connection closed by remote endpoint.`);
                  setIsAutomatedScanning(false);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                isBiometricConnected
                  ? 'border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10'
                  : 'border-teal-500/20 bg-teal-500/5 text-teal-400 hover:bg-teal-500/10'
              }`}
            >
              {isBiometricConnected ? (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>Disconnect Machine</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Connect Machine</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Console Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Column 1: Control & Fingerprint Scanner */}
          <div className="lg:col-span-7 bg-slate-950/40 border border-slate-800/40 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-black text-slate-300 uppercase tracking-wider pb-1.5 border-b border-slate-800/60">
              <Cpu className="w-4 h-4 text-teal-400" />
              <span>Biometric Punch Emulator Panel</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Employee Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Select Employee Profile</label>
                <select
                  value={selectedBiometricEmpId}
                  onChange={(e) => setSelectedBiometricEmpId(e.target.value)}
                  disabled={!isBiometricConnected}
                  className="w-full bg-slate-905 border border-slate-800 focus:border-teal-500 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none transition disabled:opacity-50"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.department})</option>
                  ))}
                </select>
              </div>

              {/* Punch Type */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Simulation Mode</label>
                <div className="flex bg-slate-900 p-1 border border-slate-800 rounded-lg">
                  <button
                    type="button"
                    disabled={!isBiometricConnected}
                    onClick={() => setManualPunchType('IN')}
                    className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition cursor-pointer ${
                      manualPunchType === 'IN'
                        ? 'bg-teal-505 text-slate-950 font-bold bg-teal-400'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Clock In / Punch In
                  </button>
                  <button
                    type="button"
                    disabled={!isBiometricConnected}
                    onClick={() => setManualPunchType('OUT')}
                    className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition cursor-pointer ${
                      manualPunchType === 'OUT'
                        ? 'bg-teal-505 text-slate-950 font-bold bg-teal-400'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Clock Out / Punch Out
                  </button>
                </div>
              </div>
            </div>

            {/* Simulated Finger Scanner Bed */}
            <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <div className="relative shrink-0">
                {/* Visual Glass Finger Bed */}
                <button
                  type="button"
                  disabled={!isBiometricConnected || isManualScanningAnim}
                  onClick={async () => {
                    if (!selectedBiometricEmpId) return;
                    setIsManualScanningAnim(true);
                    setBiometricAuthStatus('scanning');
                    addBiometricLog(`[HARDWARE] Placed finger on ZKTeco active glass scanner.`);
                    
                    // Trigger visual scanning timeline
                    await new Promise(r => setTimeout(r, 1200));
                    handleBiometricPunch(selectedBiometricEmpId, manualPunchType);
                    setBiometricAuthStatus('authorized');
                    setIsManualScanningAnim(false);
                    
                    await new Promise(r => setTimeout(r, 1500));
                    setBiometricAuthStatus('idle');
                  }}
                  className={`w-28 h-28 bg-slate-900 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden group focus:outline-none ${
                    !isBiometricConnected 
                      ? 'border-slate-800 opacity-40 cursor-not-allowed' 
                      : isManualScanningAnim
                        ? 'border-sky-400 shadow-lg shadow-sky-500/20 bg-slate-850'
                        : 'border-teal-500/30 hover:border-teal-400 shadow-md shadow-teal-500/5 hover:shadow-teal-500/10 active:scale-95'
                  }`}
                >
                  {/* Glowing Scanner Line (sweep animation) */}
                  {isManualScanningAnim && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_8px_rgba(56,189,248,0.8)] animate-bounce z-10" />
                  )}

                  <Fingerprint className={`w-12 h-12 transition ${
                    isManualScanningAnim 
                      ? 'text-sky-400 scale-110 animate-pulse' 
                      : biometricAuthStatus === 'authorized'
                        ? 'text-emerald-400 scale-105'
                        : 'text-teal-500 group-hover:text-teal-400'
                  }`} />

                  <span className="text-[9px] uppercase tracking-wider font-extrabold mt-2 text-slate-500 font-mono">
                    {isManualScanningAnim 
                      ? 'Reading...' 
                      : biometricAuthStatus === 'authorized' 
                        ? 'SUCCESS' 
                        : 'TAP SENSOR'}
                  </span>
                </button>
              </div>

              <div className="space-y-3 flex-1">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-200">Interactive Glass Scanner Module</h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Select any employee above, choose the direction, and click or tap the finger bed. The simulator will scan, decrypt the fingerprint hash, match it against database profiles, and instantly log attendance status!
                  </p>
                </div>

                {/* DB sync control */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoCommitBiometric}
                      onChange={(e) => setAutoCommitBiometric(e.target.checked)}
                      className="rounded border-slate-800 text-teal-500 focus:ring-teal-500/20 bg-slate-900 w-4.5 h-4.5 cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-300 font-bold flex items-center gap-1">
                      <Database className="w-3.5 h-3.5 text-indigo-400" />
                      Auto-Commit directly to Database
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Automated Sync / Foot-traffic control */}
            <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 max-w-md">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">Automated Live Sync (Auto-Pilot)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Enable this mode to let employees check in/out automatically as they arrive at the virtual office. Simulates automated real-time foot-traffic syncing!
                </p>
              </div>

              <button
                type="button"
                disabled={!isBiometricConnected}
                onClick={() => {
                  const state = !isAutomatedScanning;
                  setIsAutomatedScanning(state);
                }}
                className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer ${
                  isAutomatedScanning
                    ? 'bg-rose-500 text-slate-100 hover:bg-rose-400'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/15'
                }`}
              >
                {isAutomatedScanning ? (
                  <>
                    <Square className="w-4 h-4 text-slate-100" />
                    <span>Stop Auto-Sync</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-slate-950 fill-slate-950" />
                    <span>Start Auto-Sync</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Column 2: Terminal Logs Stream */}
          <div className="lg:col-span-5 flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden min-h-[300px] lg:h-auto">
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-teal-400" />
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-300 font-mono">Terminal Dispatch Feed</span>
              </div>
              <button
                type="button"
                onClick={() => setBiometricLogs([])}
                className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500 hover:text-slate-300 transition flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Clear Logs</span>
              </button>
            </div>

            <div className="p-4 flex-1 font-mono text-[10px] text-teal-400 space-y-2 overflow-y-auto max-h-[320px] bg-slate-950 leading-relaxed shadow-inner scrollbar-thin">
              {biometricLogs.length === 0 ? (
                <p className="text-slate-600 italic">No activity registered. Initiate a simulated fingerprint scan above...</p>
              ) : (
                biometricLogs.map((log, i) => {
                  let logColor = 'text-teal-400';
                  if (log.includes('[ERROR]')) logColor = 'text-rose-400 font-bold';
                  if (log.includes('[SUCCESS]')) logColor = 'text-emerald-400 font-bold';
                  if (log.includes('[SYSTEM]')) logColor = 'text-amber-400';
                  if (log.includes('[CLOUD-SYNC]')) logColor = 'text-sky-400 font-bold';

                  return (
                    <div key={i} className={`flex items-start gap-1 ${logColor}`}>
                      <span className="text-slate-600 select-none font-bold font-mono">❯</span>
                      <span className="font-mono">{log}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Roster Check List for {selectedDate}</h4>
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-teal-400" /> State updates are local until you click save.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-900/20 text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">
                <th className="px-6 py-4">Employee Info</th>
                <th className="px-6 py-4">Department & Job Title</th>
                <th className="px-6 py-4 text-center">Total Working Days ({activeMonthName})</th>
                <th className="px-6 py-4 text-center">Roster Status Selection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    Register employees before marking attendance.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const status = localRecords[emp.id] || 'Present';
                  const isHighlighted = selectedEmpIdFromNavigation === emp.id;
                  const monthStats = employeeMonthlyStats[emp.id] || {
                    totalDays: 30,
                    presentCount: 0,
                    halfDayCount: 0,
                    leaveCount: 0,
                    absentCount: 0,
                    totalWorkingDays: 0
                  };

                  return (
                    <tr 
                      key={emp.id}
                      id={`attendance-row-${emp.id}`}
                      className={`hover:bg-slate-800/10 transition-all duration-200 ${
                        isHighlighted ? 'bg-teal-500/5 border-l-4 border-teal-400' : ''
                      }`}
                    >
                      {/* Info */}
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8.5 w-8.5 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center font-bold text-slate-300">
                            {emp.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-bold text-slate-200 text-sm">
                              {emp.name}
                              {isHighlighted && (
                                <span className="ml-2 inline-block bg-teal-400 text-slate-950 font-bold px-1.5 py-0.2 rounded text-[8px] uppercase tracking-wider animate-pulse">
                                  Selected
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{emp.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Dept & Job */}
                      <td className="px-6 py-4.5">
                        <div>
                          <p className="font-semibold text-slate-300">{emp.role}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{emp.department}</p>
                        </div>
                      </td>

                      {/* Total Working Days Statistics for Active Month */}
                      <td className="px-6 py-4.5 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-sm font-extrabold text-slate-200 font-mono">
                            {monthStats.totalWorkingDays} <span className="text-slate-500 font-normal text-xs">/ {monthStats.totalDays} Days</span>
                          </span>
                          <div className="flex items-center gap-1.5 mt-1 text-[9px] font-bold text-slate-400">
                            <span className="text-emerald-400" title="Present">P: {monthStats.presentCount}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-indigo-400" title="Half-Day">H: {monthStats.halfDayCount}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-amber-400" title="Leave">L: {monthStats.leaveCount}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-rose-400" title="Absent">A: {monthStats.absentCount}</span>
                          </div>
                        </div>
                      </td>

                       {/* Status select buttons */}
                      <td className="px-6 py-4.5 text-center">
                        <div className="inline-flex p-1.5 bg-slate-950/40 border border-slate-800/50 rounded-2xl gap-2">
                          {/* Present Button */}
                          <button
                            id={`attendance-present-${emp.id}`}
                            onClick={() => handleStatusChange(emp.id, 'Present')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all duration-300 cursor-pointer ${
                              status === 'Present'
                                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10 scale-105'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Present</span>
                          </button>

                          {/* Half-Day Button */}
                          <button
                            id={`attendance-halfday-${emp.id}`}
                            onClick={() => handleStatusChange(emp.id, 'Half-Day')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all duration-300 cursor-pointer ${
                              status === 'Half-Day'
                                ? 'bg-indigo-500 text-slate-100 shadow-md shadow-indigo-500/10 scale-105'
                                : 'text-slate-400 hover:text-indigo-400'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            <span>Half Day</span>
                          </button>

                          {/* Absent Button */}
                          <button
                            id={`attendance-absent-${emp.id}`}
                            onClick={() => handleStatusChange(emp.id, 'Absent')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all duration-300 cursor-pointer ${
                              status === 'Absent'
                                ? 'bg-rose-500 text-slate-100 shadow-md shadow-rose-500/10 scale-105'
                                : 'text-slate-400 hover:text-rose-400'
                            }`}
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Absent</span>
                          </button>

                          {/* Leave Button */}
                          <button
                            id={`attendance-leave-${emp.id}`}
                            onClick={() => handleStatusChange(emp.id, 'Leave')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all duration-300 cursor-pointer ${
                              status === 'Leave'
                                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 scale-105'
                                : 'text-slate-400 hover:text-amber-400'
                            }`}
                          >
                            <Coffee className="w-3.5 h-3.5" />
                            <span>On Leave</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
