/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building, 
  Users, 
  CheckSquare, 
  CreditCard, 
  LayoutGrid, 
  Briefcase, 
  Calendar, 
  ShieldCheck, 
  ArrowRight, 
  Server, 
  Activity,
  Heart,
  Search,
  Sparkles,
  TrendingUp,
  Coins,
  ChevronRight,
  Plus,
  HelpCircle,
  Check,
  Lock,
  Shield,
  Globe,
  RefreshCw,
  Play,
  Sliders,
  Database,
  ExternalLink
} from 'lucide-react';

interface FrontPageProps {
  employeeCount: number;
  candidateCount: number;
  taskCount: number;
  clientCount: number;
  onLaunchPortal: () => void;
}

// Mock database for the interactive Sandbox Demo
const initialSandboxEmployees = [
  { id: 'se-1', name: 'Elena Rostova', role: 'Principal Engineer', dept: 'Engineering', salary: 145000, status: 'Active', avatar: '👩‍💻' },
  { id: 'se-2', name: 'Marcus Chen', role: 'Product Architect', dept: 'Product', salary: 138000, status: 'Remote', avatar: '👨‍💻' },
  { id: 'se-3', name: 'Sarah Jenkins', role: 'Talent Director', dept: 'HR & Ops', salary: 115000, status: 'Active', avatar: '👩‍💼' },
  { id: 'se-4', name: 'Devon Vance', role: 'Liaison Lead', dept: 'Client Success', salary: 98000, status: 'On Leave', avatar: '👨‍💼' }
];

const initialSandboxTasks = [
  { id: 'st-1', title: 'Compile Security Blueprint v4', col: 'todo', owner: 'Elena R.' },
  { id: 'st-2', title: 'Validate Payroll PDF compliance', col: 'progress', owner: 'Sarah J.' },
  { id: 'st-3', title: 'Ship Portal SSO dashboard', col: 'done', owner: 'Marcus C.' }
];

export default function FrontPage({
  employeeCount,
  candidateCount,
  taskCount,
  clientCount,
  onLaunchPortal
}: FrontPageProps) {
  // --- States ---
  const [scaleMode, setScaleMode] = useState<'startup' | 'growth' | 'enterprise'>('growth');
  const [activeDemoTab, setActiveDemoTab] = useState<'personnel' | 'roster' | 'payroll' | 'kanban'>('personnel');
  
  // Interactive background chart hover states
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  
  // Personnel Demo State
  const [searchQuery, setSearchQuery] = useState('');
  const [sandboxEmployees, setSandboxEmployees] = useState(initialSandboxEmployees);
  const [sandboxToast, setSandboxToast] = useState<string | null>(null);

  // Attendance Demo State
  const [selectedDay, setSelectedDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'>('Wed');

  // Payroll Calculator State
  const [selectedEmpId, setSelectedEmpId] = useState('se-1');
  const [payrollHours, setPayrollHours] = useState(40);
  const [payrollBonus, setPayrollBonus] = useState(500);
  const [taxExemption, setTaxExemption] = useState(false);

  // Kanban Demo State
  const [sandboxTasks, setSandboxTasks] = useState(initialSandboxTasks);

  // Blueprint Planner State
  const [customNeedSSO, setCustomNeedSSO] = useState(true);
  const [customNeedSlack, setCustomNeedSlack] = useState(false);
  const [customNeedDB, setCustomNeedDB] = useState(true);
  const [customNeedBackup, setCustomNeedBackup] = useState(false);

  // FAQ State
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // System Logs Simulator
  const [simLogs, setSimLogs] = useState<string[]>([]);

  // Trigger mini toast for sandbox
  const triggerSandboxToast = (msg: string) => {
    setSandboxToast(msg);
    setTimeout(() => setSandboxToast(null), 3000);
  };

  // Add sample log helper
  const addSimLog = (action: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setSimLogs(prev => [`[${timestamp}] ${action}`, ...prev.slice(0, 4)]);
  };

  useEffect(() => {
    // Populate initial logs
    setSimLogs([
      `[${new Date().toLocaleTimeString()}] System loaded: Encrypted sandbox initialized.`,
      `[${new Date().toLocaleTimeString()}] LocalStorage integrity checks completed.`
    ]);
  }, []);

  // --- Handlers ---
  const handleSimulatePromotion = (empId: string) => {
    setSandboxEmployees(prev => 
      prev.map(emp => {
        if (emp.id === empId) {
          const raisedSalary = emp.salary + 12000;
          triggerSandboxToast(`🎉 Promoted ${emp.name}! Salary increased to $${raisedSalary.toLocaleString()}/yr.`);
          addSimLog(`Security Node: Upgraded credentials & base compensation file of ${emp.name}.`);
          return { ...emp, salary: raisedSalary, role: 'Senior ' + emp.role };
        }
        return emp;
      })
    );
  };

  const handleMoveTask = (taskId: string) => {
    setSandboxTasks(prev => 
      prev.map(task => {
        if (task.id === taskId) {
          let nextCol: 'todo' | 'progress' | 'done' = 'todo';
          if (task.col === 'todo') nextCol = 'progress';
          else if (task.col === 'progress') nextCol = 'done';
          else nextCol = 'todo';
          
          triggerSandboxToast(`Moved "${task.title}" to ${nextCol === 'progress' ? 'In Progress' : nextCol === 'done' ? 'Done' : 'To Do'}`);
          addSimLog(`Kanban Update: "${task.title}" shifted to ${nextCol.toUpperCase()}`);
          return { ...task, col: nextCol };
        }
        return task;
      })
    );
  };

  const handleAddDemoTask = () => {
    const randomTitles = [
      'Refactor API middleware pipeline',
      'Audit client ledger balances',
      'Optimize database shard queries',
      'Generate regional payroll slips'
    ];
    const newTitle = randomTitles[Math.floor(Math.random() * randomTitles.length)];
    const newId = `st-${Date.now()}`;
    setSandboxTasks(prev => [...prev, { id: newId, title: newTitle, col: 'todo', owner: 'Elena R.' }]);
    triggerSandboxToast(`Added "${newTitle}" to Kanban board!`);
    addSimLog(`Kanban Insertion: Appended objective "${newTitle}"`);
  };

  // Metrics with Scale Multipliers
  const getMultiplier = () => {
    if (scaleMode === 'startup') return 1;
    if (scaleMode === 'growth') return 3.5;
    return 12;
  };

  const currentScaleInfo = {
    employee: Math.round(employeeCount * getMultiplier()),
    candidate: Math.round(candidateCount * getMultiplier()),
    task: Math.round(taskCount * getMultiplier()),
    client: Math.round(clientCount * getMultiplier()),
    revenue: Math.round(clientCount * 14200 * getMultiplier()).toLocaleString(),
    utilization: scaleMode === 'startup' ? '92%' : scaleMode === 'growth' ? '97.4%' : '99.98%',
    compliance: '100% SEC-COMPLIANT'
  };

  // Attendance rosters for each day demo
  const dayRosters: Record<string, Array<{ name: string; status: 'Present' | 'Remote' | 'Sick' | 'Vacation' }>> = {
    Mon: [
      { name: 'Elena Rostova', status: 'Present' },
      { name: 'Marcus Chen', status: 'Remote' },
      { name: 'Sarah Jenkins', status: 'Present' },
      { name: 'Devon Vance', status: 'Vacation' }
    ],
    Tue: [
      { name: 'Elena Rostova', status: 'Present' },
      { name: 'Marcus Chen', status: 'Present' },
      { name: 'Sarah Jenkins', status: 'Present' },
      { name: 'Devon Vance', status: 'Present' }
    ],
    Wed: [
      { name: 'Elena Rostova', status: 'Remote' },
      { name: 'Marcus Chen', status: 'Remote' },
      { name: 'Sarah Jenkins', status: 'Present' },
      { name: 'Devon Vance', status: 'Sick' }
    ],
    Thu: [
      { name: 'Elena Rostova', status: 'Present' },
      { name: 'Marcus Chen', status: 'Remote' },
      { name: 'Sarah Jenkins', status: 'Present' },
      { name: 'Devon Vance', status: 'Present' }
    ],
    Fri: [
      { name: 'Elena Rostova', status: 'Remote' },
      { name: 'Marcus Chen', status: 'Remote' },
      { name: 'Sarah Jenkins', status: 'Vacation' },
      { name: 'Devon Vance', status: 'Present' }
    ]
  };

  // Payroll slip computed variables
  const currentCalcEmp = sandboxEmployees.find(e => e.id === selectedEmpId) || sandboxEmployees[0];
  const hourlyRate = Math.round(currentCalcEmp.salary / 2000);
  const baseEarnings = hourlyRate * Math.min(payrollHours, 40);
  const overtimeHours = Math.max(0, payrollHours - 40);
  const overtimeEarnings = overtimeHours * Math.round(hourlyRate * 1.5);
  const bonus = payrollBonus;
  const grossPay = baseEarnings + overtimeEarnings + bonus;
  const taxRate = taxExemption ? 0.05 : 0.22;
  const taxes = Math.round(grossPay * taxRate);
  const netEarnings = grossPay - taxes;

  // Blueprints parameters
  const blueprintEstBuild = (customNeedSSO ? 4 : 0) + (customNeedSlack ? 2 : 0) + (customNeedDB ? 6 : 0) + (customNeedBackup ? 3 : 0);
  const blueprintSecurityScore = 90 + (customNeedSSO ? 5 : 0) + (customNeedBackup ? 3 : 0) - (customNeedSlack ? 2 : 0);

  // Features List
  const systemModules = [
    {
      icon: <Users className="h-5 w-5 text-sky-400" />,
      title: "Personnel Directory",
      badge: "CRUD PERSISTENCE",
      desc: "Robust employee lifecycle tracking, complete professional profiles, and historical activity logs securely persisted to isolated memory grids."
    },
    {
      icon: <CheckSquare className="h-5 w-5 text-indigo-400" />,
      title: "Roster & Presence",
      badge: "CALENDAR MATRIX",
      desc: "A unified roster system to plan and log daily attendance, remote states, sick leave, and digital checkpoints for your entire roster."
    },
    {
      icon: <CreditCard className="h-5 w-5 text-emerald-400" />,
      title: "Financial Ledger",
      badge: "PDF BILLING & PAYSLIPS",
      desc: "Automated calculation of base hours, overtime rates, tax withholding, and instant digital slips complete with PDF generators."
    },
    {
      icon: <LayoutGrid className="h-5 w-5 text-amber-400" />,
      title: "Agile Kanban Automation",
      badge: "WORKFLOW TILES",
      desc: "Interactive whiteboard grids with drag transitions to plan project sprints, track tickets, assign task owners, and manage velocity."
    },
    {
      icon: <Briefcase className="h-5 w-5 text-pink-400" />,
      title: "Talent Pipeline",
      badge: "RECRUITING FUNNEL",
      desc: "Streamlined applicant tracking with custom candidate statuses, evaluation markers, and resume logging pipelines."
    },
    {
      icon: <Calendar className="h-5 w-5 text-teal-400" />,
      title: "Interview Co-ordination",
      badge: "PANEL ASSIGNMENTS",
      desc: "Coordinate interview rooms, set time bounds, assign internal engineering panels, and aggregate interviewer scores."
    }
  ];

  const faqs = [
    {
      question: "Is my business data shared outside of this browser sandbox?",
      answer: "No. CRM PORTAL is designed with absolute privacy in mind. It executes 100% on the client side using structured local persistence schemas. No third-party servers, diagnostic scripts, or telemetric packages can eavesdrop on your operations."
    },
    {
      question: "Can I print and export real financial summaries or payslips?",
      answer: "Absolutely! The financial module is integrated with html2canvas and jspdf. You can dynamically configure salaries, review overtime math, and print high-fidelity physical documents or download validated PDF ledgers with a single click."
    },
    {
      question: "How does deep-linking help our workflow?",
      answer: "Our system features full transient-state deep-linking. If you are reviewing an employee profile, you can click 'Generate Payslip' or 'Report Absence' and the portal automatically carries their state straight into the relevant screen, bypassing tedious manual search."
    }
  ];

  // --- Beautiful Decorative Dashboard Widgets ---
  const renderBarGraphWidget = (isDesktop: boolean) => {
    const bars = [
      { id: 'hr', name: 'HR', value: 45, color: 'from-amber-600 to-yellow-400', tooltipVal: '45% Active HR' },
      { id: 'eng', name: 'ENG', value: 85, color: 'from-sky-600 to-teal-400', tooltipVal: '85% Eng Capacity' },
      { id: 'fin', name: 'FIN', value: 65, color: 'from-emerald-600 to-emerald-400', tooltipVal: '65% Profit Target' },
      { id: 'ops', name: 'OPS', value: 90, color: 'from-indigo-600 to-violet-400', tooltipVal: '90% Server Load' },
      { id: 'mkt', name: 'MKT', value: 55, color: 'from-pink-600 to-rose-400', tooltipVal: '55% Ad Capture' }
    ];

    return (
      <div 
        className={`bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 shadow-2xl select-none group transition-all duration-500 pointer-events-auto ${
          isDesktop 
            ? 'rotate-3 hover:rotate-0 hover:scale-[1.03] hover:border-sky-500/30 shadow-sky-500/5' 
            : 'border-white/10 hover:border-slate-700 shadow-sky-500/5'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-sky-500/10 text-sky-400 rounded-lg">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Performance Matrix</p>
              <h4 className="text-xs font-extrabold text-slate-200">Growth Load Factor</h4>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-mono text-emerald-400 font-bold">LIVE</span>
          </div>
        </div>

        {/* Bar Graph Area */}
        <div className="h-40 flex items-end justify-between gap-3 px-2 pt-6 pb-2 border-b border-slate-800/60 relative">
          {/* Background Grid Lines */}
          <div className="absolute inset-x-0 top-6 border-t border-slate-800/40 pointer-events-none" />
          <div className="absolute inset-x-0 top-16 border-t border-slate-800/40 pointer-events-none" />
          <div className="absolute inset-x-0 top-26 border-t border-slate-800/40 pointer-events-none" />

          {bars.map((bar, idx) => {
            const isHovered = hoveredBar === bar.id;
            return (
              <div 
                key={bar.id} 
                className="flex-1 flex flex-col items-center h-full justify-end relative group/bar"
                onMouseEnter={() => setHoveredBar(bar.id)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Tooltip */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div 
                      initial={{ opacity: 0, y: 4, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.9 }}
                      className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-950 text-slate-100 border border-slate-700/60 rounded font-mono text-[9px] font-bold shadow-xl z-20 whitespace-nowrap"
                    >
                      {bar.tooltipVal}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Animated Column */}
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${bar.value}%` }}
                  transition={{ type: "spring", stiffness: 70, damping: 15, delay: idx * 0.08 }}
                  className={`w-full rounded-t-md bg-gradient-to-t ${bar.color} transition-all duration-300 relative overflow-hidden ${
                    isHovered ? 'shadow-[0_0_15px_rgba(56,189,248,0.3)] brightness-110' : 'opacity-90'
                  }`}
                >
                  {/* Subtle inner reflection shine */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent w-[30%]" />
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Labels Footer */}
        <div className="flex justify-between text-center mt-3 px-2">
          {bars.map((bar) => (
            <span 
              key={bar.id} 
              className={`text-[9px] font-mono font-bold transition-colors ${
                hoveredBar === bar.id ? 'text-sky-400' : 'text-slate-500'
              }`}
            >
              {bar.name}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderPieChartWidget = (isDesktop: boolean) => {
    const sectors = [
      { id: 'staff', value: 40, offset: 0, dash: 100.5, color: 'stroke-sky-500', fill: 'bg-sky-500', label: 'Staff Allocation', detail: '40% Roster' },
      { id: 'capital', value: 30, offset: -100.5, dash: 75.4, color: 'stroke-indigo-500', fill: 'bg-indigo-500', label: 'Capital Ops', detail: '30% Budget' },
      { id: 'infra', value: 20, offset: -175.9, dash: 50.3, color: 'stroke-emerald-500', fill: 'bg-emerald-500', label: 'System Infra', detail: '20% Cloud' },
      { id: 'buffer', value: 10, offset: -226.2, dash: 25.1, color: 'stroke-amber-500', fill: 'bg-amber-500', label: 'Liquidity Reserve', detail: '10% Cash' }
    ];

    return (
      <div 
        className={`bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 shadow-2xl select-none group transition-all duration-500 pointer-events-auto ${
          isDesktop 
            ? '-rotate-3 hover:rotate-0 hover:scale-[1.03] hover:border-indigo-500/30 shadow-indigo-500/5' 
            : 'border-white/10 hover:border-slate-700 shadow-indigo-500/5'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Activity className="h-4 w-4" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resource Share</p>
              <h4 className="text-xs font-extrabold text-slate-200">Corporate Assets</h4>
            </div>
          </div>
          <span className="text-[9px] font-mono font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 px-2 py-0.5 rounded-full uppercase">99.4% Eff</span>
        </div>

        {/* SVG Donut / Legend flex */}
        <div className="flex flex-col sm:flex-row items-center gap-5 pt-2">
          {/* Donut Chart Visualizer */}
          <div className="relative w-28 h-28 shrink-0">
            <svg width="100%" height="100%" viewBox="0 0 100 100" className="transform -rotate-90">
              {/* Under-ring */}
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1e293b" strokeWidth="9" />
              {/* Data Segments */}
              {sectors.map((s) => {
                const isHovered = hoveredSegment === s.id;
                return (
                  <circle
                    key={s.id}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    className={`${s.color} transition-all duration-300 cursor-pointer`}
                    strokeWidth={isHovered ? "14" : "10"}
                    strokeDasharray={`${s.dash} 251.3`}
                    strokeDashoffset={s.offset}
                    strokeLinecap="round"
                    onMouseEnter={() => setHoveredSegment(s.id)}
                    onMouseLeave={() => setHoveredSegment(null)}
                  />
                );
              })}
            </svg>

            {/* Centered Indicator Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-mono font-extrabold text-emerald-400 tracking-wider">SECURE</span>
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Verified</span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="flex-1 w-full space-y-2 text-left">
            {sectors.map((s) => {
              const isHovered = hoveredSegment === s.id;
              return (
                <div 
                  key={s.id}
                  onMouseEnter={() => setHoveredSegment(s.id)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  className={`p-1.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2.5 ${
                    isHovered ? 'bg-white/5 border border-white/5 pl-2.5' : 'border border-transparent'
                  }`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.fill} ${isHovered ? 'scale-110 shadow-lg' : ''}`} />
                  <div>
                    <p className={`text-[10px] font-bold leading-none ${isHovered ? 'text-slate-100' : 'text-slate-400'}`}>
                      {s.label}
                    </p>
                    <p className="text-[8px] font-mono text-slate-500 mt-0.5 leading-none">
                      {s.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="landing-front-page" className="min-h-screen bg-[#020617] text-slate-100 font-sans relative overflow-x-hidden flex flex-col justify-between selection:bg-sky-500/30 selection:text-sky-300">
      
      {/* Dynamic Background Mesh Grids */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(56,189,248,0.08)_0%,_transparent_45%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(129,140,248,0.08)_0%,_transparent_45%)] pointer-events-none" />
      
      {/* Decorative Dotted Grid Accent */}
      <div className="absolute top-0 left-0 w-full h-[800px] bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      {/* --- DESKTOP FLOATING DASHBOARD GRAPHICS (Bar Graph & Pie Chart) --- */}
      {/* Centered within max-w-7xl relative bounding box to prevent overlapping the central hero text */}
      <div className="hidden lg:block absolute inset-x-0 top-[220px] max-w-7xl mx-auto w-full h-0 pointer-events-none z-0">
        <div className="absolute left-[-10px] xl:left-[-60px] top-[40px] w-72 xl:w-80 pointer-events-auto opacity-35 hover:opacity-100 transition-all duration-500 hover:scale-[1.03]">
          {renderBarGraphWidget(true)}
        </div>
        <div className="absolute right-[-10px] xl:right-[-60px] top-[70px] w-72 xl:w-80 pointer-events-auto opacity-35 hover:opacity-100 transition-all duration-500 hover:scale-[1.03]">
          {renderPieChartWidget(true)}
        </div>
      </div>

      {/* Top Banner Alert */}
      <div className="relative z-30 bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-sky-500/10 border-b border-sky-500/20 py-2.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 bg-sky-500/20 text-sky-400 text-[10px] font-extrabold tracking-widest rounded-full uppercase">NEW UPDATE</span>
          <span className="text-xs text-slate-300 font-medium">Interactive sandbox playground launched below. Try before signing in!</span>
          <button 
            onClick={() => {
              const element = document.getElementById('sandbox-playground');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-xs text-sky-400 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            Go to Playground <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Header / Navigation */}
      <header className="relative z-20 max-w-7xl mx-auto w-full px-6 sm:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3 group">
          <div className="bg-gradient-to-tr from-sky-500 to-indigo-600 p-2.5 rounded-2xl shadow-xl shadow-sky-500/10 group-hover:scale-105 transition-transform">
            <Building className="h-5.5 w-5.5 text-slate-950 font-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white">CRM PORTAL</h1>
              <span className="text-[9px] bg-sky-500/10 border border-sky-500/30 text-sky-400 px-1.5 py-0.5 rounded font-extrabold uppercase">PRO</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mt-0.5">Unified HRMS & Operations</span>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 border border-white/5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase">Active Client Sandbox Node</span>
          </div>
          
          <button 
            id="btn-nav-launch"
            onClick={onLaunchPortal}
            className="px-5 py-2.5 bg-white/5 hover:bg-sky-500/15 border border-white/10 hover:border-sky-500/40 text-sky-300 hover:text-white text-xs font-black rounded-xl active:scale-95 transition-all cursor-pointer shadow-lg hover:shadow-sky-500/5"
          >
            Launch System Portal
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-8 pt-12 pb-24 flex-1 flex flex-col items-center text-center">
        
        {/* Animated Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-sky-500/20 rounded-full mb-8 cursor-pointer group"
          onClick={() => {
            const el = document.getElementById('system-features');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <Sparkles className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
          <span className="text-[10px] text-sky-300 font-extrabold uppercase tracking-widest">Enterprise Roster & Client Hub</span>
          <ChevronRight className="h-3 w-3 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
        </motion.div>

        {/* Hero Title */}
        <motion.h2 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05] max-w-5xl"
        >
          The Intelligent Center for <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 drop-shadow-sm">
            Modern CRM & Operations
          </span>
        </motion.h2>

        {/* Hero Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-sm sm:text-lg text-slate-400 max-w-3xl leading-relaxed font-medium"
        >
          An beautifully designed, all-in-one personnel directory, attendance tracker, dynamic payroll calculator, and sprint Kanban board. All secured locally and engineered with deep state transitions.
        </motion.p>

        {/* Call To Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto"
        >
          <button
            id="btn-hero-launch"
            onClick={onLaunchPortal}
            className="w-full sm:w-auto bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold px-10 py-4 rounded-2xl text-xs flex items-center justify-center gap-2.5 shadow-2xl shadow-sky-500/20 active:scale-95 transition-all cursor-pointer hover:shadow-sky-500/30 border border-white/10"
          >
            <span>Enter Workspace Portal</span>
            <ArrowRight className="h-4.5 w-4.5 text-white" />
          </button>
          
          <button
            onClick={() => {
              const element = document.getElementById('sandbox-playground');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto bg-slate-900/80 hover:bg-slate-900 border border-white/10 hover:border-sky-500/30 text-slate-200 hover:text-white font-extrabold px-10 py-4 rounded-2xl text-xs active:scale-95 transition-all cursor-pointer"
          >
            Play Interactive Sandbox
          </button>
        </motion.div>

        {/* Mobile/Tablet Inline Dashboard Graphics (Bar Graph & Pie Chart) */}
        <div className="mt-12 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 lg:hidden">
          {renderBarGraphWidget(false)}
          {renderPieChartWidget(false)}
        </div>

        {/* Dynamic Scale & Numbers Showcase */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 w-full max-w-5xl bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/5">
            <div className="text-left">
              <span className="text-[10px] text-sky-400 font-extrabold uppercase tracking-widest block mb-1">Corporate Scale Simulator</span>
              <h3 className="text-md font-bold text-slate-100">Toggle Firm Dimension to Project Scale</h3>
            </div>
            
            {/* Scale Buttons */}
            <div className="bg-black/40 border border-white/5 p-1 rounded-xl flex items-center gap-1.5">
              {(['startup', 'growth', 'enterprise'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setScaleMode(mode);
                    addSimLog(`Scale Simulator: Adjusted target projection size to [${mode.toUpperCase()}].`);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-widest uppercase transition-all cursor-pointer ${
                    scaleMode === mode 
                      ? 'bg-sky-500/25 text-sky-300 border border-sky-500/30' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode === 'startup' ? '🌱 Start-up' : mode === 'growth' ? '📈 Medium SME' : '🏢 Enterprise'}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 text-left">
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 text-sky-500/10 group-hover:scale-110 transition-transform">
                <Users className="h-10 w-10" />
              </div>
              <div className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-1">Staff Files</div>
              <div className="text-2xl font-black text-sky-400 tracking-tight">
                {currentScaleInfo.employee} Profiles
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-semibold">Verified Active Roster</p>
            </div>

            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 text-indigo-500/10 group-hover:scale-110 transition-transform">
                <Briefcase className="h-10 w-10" />
              </div>
              <div className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-1">Talent Funnel</div>
              <div className="text-2xl font-black text-indigo-400 tracking-tight">
                {currentScaleInfo.candidate} Live
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-semibold">Active Recruitment Pipeline</p>
            </div>

            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 text-emerald-500/10 group-hover:scale-110 transition-transform">
                <CheckSquare className="h-10 w-10" />
              </div>
              <div className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-1">Active Objectives</div>
              <div className="text-2xl font-black text-emerald-400 tracking-tight">
                {currentScaleInfo.task} Goals
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-semibold">Kanban Board Items</p>
            </div>

            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 text-amber-500/10 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-10 w-10" />
              </div>
              <div className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-1">Est. ARR Pool</div>
              <div className="text-2xl font-black text-amber-400 tracking-tight">
                ${currentScaleInfo.revenue}
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-semibold">Active Contract Volume</p>
            </div>
          </div>
        </motion.div>

        {/* INTERACTIVE PLAYGROUND / SANDBOX SECTION */}
        <section 
          id="sandbox-playground" 
          className="mt-28 pt-12 border-t border-white/5 w-full max-w-6xl text-left"
        >
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="px-3 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-extrabold tracking-widest rounded-full uppercase">
              INTERACTIVE SANDBOX
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-100 mt-3 tracking-tight">
              Test-Drive the Core System Modules
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              No account, no setup. Interact with simulated live profiles, roster planners, payslip calculators, and cards right inside our sandbox container below.
            </p>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
            
            {/* Playground Tab bar */}
            <div className="flex flex-wrap items-center justify-between border-b border-white/5 bg-black/35 px-6 py-4 gap-4">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'personnel', label: 'Personnel', icon: <Users className="h-3.5 w-3.5" /> },
                  { id: 'roster', label: 'Roster Scheduler', icon: <CheckSquare className="h-3.5 w-3.5" /> },
                  { id: 'payroll', label: 'Payslip Ledger', icon: <CreditCard className="h-3.5 w-3.5" /> },
                  { id: 'kanban', label: 'Kanban Board', icon: <LayoutGrid className="h-3.5 w-3.5" /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveDemoTab(tab.id as any);
                      addSimLog(`Sandbox Viewport: Activated component preview [${tab.label}].`);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      activeDemoTab === tab.id 
                        ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/10 border border-sky-500/30 text-sky-300' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 text-[10px] font-mono text-sky-400 font-semibold bg-sky-500/10 border border-sky-500/20 px-3 py-1.5 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                <span>SANDBOX SECURE-MODE ACTIVE</span>
              </div>
            </div>

            {/* Simulated Workspace Viewport */}
            <div className="p-6 sm:p-8 min-h-[380px] flex flex-col justify-between relative">
              
              {/* Internal absolute Toast Alert */}
              <AnimatePresence>
                {sandboxToast && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: -20, x: '-50%' }}
                    className="absolute top-4 left-1/2 bg-sky-500/90 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{sandboxToast}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 1. Personnel Tab Sandbox */}
              {activeDemoTab === 'personnel' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h4 className="text-sm font-black text-slate-100">Live Profiles Sandbox</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Filter mock directory logs and test real state changes.</p>
                    </div>
                    {/* Search Field */}
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search name, department..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          addSimLog(`Sandbox Directory: Searched keyword "${e.target.value}"`);
                        }}
                        className="w-full bg-black/30 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/50"
                      />
                    </div>
                  </div>

                  {/* Employees Table */}
                  <div className="overflow-x-auto border border-white/5 rounded-2xl bg-black/20">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-white/5 text-[10px] text-slate-400 uppercase tracking-widest border-b border-white/5">
                          <th className="p-3.5 font-extrabold">Employee</th>
                          <th className="p-3.5 font-extrabold">Department</th>
                          <th className="p-3.5 font-extrabold">Base Compensation</th>
                          <th className="p-3.5 font-extrabold">Roster Status</th>
                          <th className="p-3.5 font-extrabold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sandboxEmployees
                          .filter(emp => 
                            emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            emp.dept.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((emp) => (
                            <tr key={emp.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                              <td className="p-3.5">
                                <div className="flex items-center gap-3">
                                  <span className="text-lg bg-white/5 p-1 rounded-lg">{emp.avatar}</span>
                                  <div>
                                    <div className="font-extrabold text-slate-200">{emp.name}</div>
                                    <div className="text-[10px] text-slate-500 font-medium">{emp.role}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3.5">
                                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 font-bold text-[10px] rounded-md uppercase tracking-wider">{emp.dept}</span>
                              </td>
                              <td className="p-3.5 text-slate-300 font-mono font-semibold">${emp.salary.toLocaleString()}/yr</td>
                              <td className="p-3.5">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${
                                  emp.status === 'Active' 
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                                    : emp.status === 'Remote' 
                                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20' 
                                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                                }`}>
                                  {emp.status}
                                </span>
                              </td>
                              <td className="p-3.5 text-right">
                                <button
                                  onClick={() => handleSimulatePromotion(emp.id)}
                                  className="px-3 py-1 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 font-extrabold text-[10px] uppercase rounded-lg border border-sky-500/20 hover:border-sky-500/40 active:scale-95 transition-all cursor-pointer"
                                >
                                  Promote
                                </button>
                              </td>
                            </tr>
                          ))}
                        {sandboxEmployees.filter(emp => 
                          emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.dept.toLowerCase().includes(searchQuery.toLowerCase())
                        ).length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-500 text-xs">No matching sandbox profiles found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 2. Roster Scheduler Sandbox */}
              {activeDemoTab === 'roster' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h4 className="text-sm font-black text-slate-100">Weekly Attendance Scheduler</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Toggle days of the week to audit custom presence grids.</p>
                    </div>

                    {/* Day select */}
                    <div className="bg-black/30 border border-white/5 p-1 rounded-xl flex gap-1">
                      {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const).map((day) => (
                        <button
                          key={day}
                          onClick={() => {
                            setSelectedDay(day);
                            addSimLog(`Roster Viewport: Switched active attendance sheet to [${day.toUpperCase()}].`);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            selectedDay === day 
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Presence Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {dayRosters[selectedDay].map((person, idx) => (
                      <div 
                        key={idx}
                        className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col justify-between hover:border-white/10 transition-all"
                      >
                        <div>
                          <div className="font-extrabold text-slate-200 text-xs">{person.name}</div>
                          <span className="text-[10px] text-slate-500">Scheduler Log</span>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-widest ${
                            person.status === 'Present' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : person.status === 'Remote' 
                              ? 'bg-sky-500/10 text-sky-400' 
                              : person.status === 'Sick'
                              ? 'bg-rose-500/10 text-rose-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {person.status}
                          </span>

                          <button
                            onClick={() => {
                              triggerSandboxToast(`Registered simulated Check-in for ${person.name}`);
                              addSimLog(`Security Checkpoint: Authorized manual check-in signature for ${person.name}.`);
                            }}
                            className="p-1 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-slate-200 border border-white/10 cursor-pointer active:scale-90 transition-all"
                            title="Simulate checkin override"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Visual Presence Bar */}
                  <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center justify-between text-xs flex-wrap gap-4">
                    <span className="text-slate-400 font-medium">Daily Attendance Level:</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-sky-400 h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: selectedDay === 'Tue' ? '100%' : selectedDay === 'Wed' ? '50%' : '75%' 
                          }}
                        />
                      </div>
                      <span className="font-mono font-bold text-sky-300">
                        {selectedDay === 'Tue' ? '100%' : selectedDay === 'Wed' ? '50%' : '75%'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Payslip Ledger Sandbox */}
              {activeDemoTab === 'payroll' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h4 className="text-sm font-black text-slate-100">Payslip Ledger Calculator</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Adjust sliders to re-calculate taxes and net pay in real-time.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest">Select Target:</span>
                      <select
                        value={selectedEmpId}
                        onChange={(e) => {
                          setSelectedEmpId(e.target.value);
                          addSimLog(`Payroll Ledger: Target employee profile changed.`);
                        }}
                        className="bg-black/40 border border-white/10 rounded-lg py-1 px-3 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
                      >
                        {sandboxEmployees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Interactive Sliders & Live Payslip Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    
                    {/* Controls */}
                    <div className="md:col-span-5 space-y-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-400">Hours Recorded:</span>
                          <span className="text-sky-400 font-mono font-bold">{payrollHours} hrs</span>
                        </div>
                        <input
                          type="range"
                          min="30"
                          max="60"
                          value={payrollHours}
                          onChange={(e) => {
                            setPayrollHours(Number(e.target.value));
                            if (Number(e.target.value) > 40) {
                              addSimLog(`Payroll Ledger: Overtime recorded (${Number(e.target.value) - 40}h) for ${currentCalcEmp.name}.`);
                            }
                          }}
                          className="w-full accent-sky-500 bg-slate-800 rounded-lg appearance-none h-1.5"
                        />
                        <span className="text-[9px] text-slate-500 block">40h Base. Overtime multiplier: 1.5x</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-400">Simulated Discretionary Bonus:</span>
                          <span className="text-sky-400 font-mono font-bold">${payrollBonus}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="2000"
                          step="100"
                          value={payrollBonus}
                          onChange={(e) => setPayrollBonus(Number(e.target.value))}
                          className="w-full accent-sky-500 bg-slate-800 rounded-lg appearance-none h-1.5"
                        />
                      </div>

                      <div className="flex items-center justify-between py-2 border-t border-white/5">
                        <div>
                          <span className="text-xs font-semibold text-slate-300 block">Exempt Status Overlay</span>
                          <span className="text-[9px] text-slate-500">Enable tax relief overrides (22% to 5%)</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={taxExemption}
                          onChange={(e) => {
                            setTaxExemption(e.target.checked);
                            addSimLog(`Payroll Ledger: Toggled special tax exemptions.`);
                            triggerSandboxToast(e.target.checked ? 'Tax exemption rate applied (5%)' : 'Standard tax rate applied (22%)');
                          }}
                          className="h-4 w-4 accent-sky-500 rounded cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* High Fidelity Glass Slip Preview */}
                    <div className="md:col-span-7 bg-black/45 border border-sky-500/10 p-5 rounded-2xl font-mono text-[10px] text-slate-300 space-y-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-sky-500/10 text-sky-400 text-[8px] font-bold px-3 py-1 rounded-bl-xl tracking-widest">PREVIEW SLIP</div>
                      
                      <div className="border-b border-white/10 pb-2 flex justify-between items-center">
                        <div>
                          <div className="font-extrabold text-slate-100 text-xs">{currentCalcEmp.name}</div>
                          <span className="text-[8px] text-slate-500">Dept: {currentCalcEmp.dept} | ID: {currentCalcEmp.id}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] text-slate-500 block">Ledger Stamp</span>
                          <span className="text-emerald-400 font-bold">✓ MATH-VALID</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span>Base Compensation Rate:</span>
                          <span>${hourlyRate}/hr</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Base Earnings ({Math.min(payrollHours, 40)}h):</span>
                          <span>${baseEarnings.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Overtime Earnings ({overtimeHours}h @ 1.5x):</span>
                          <span>${overtimeEarnings.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-emerald-400">
                          <span>Discretionary Bonus:</span>
                          <span>+${bonus.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-rose-400">
                          <span>Withholding Tax ({Math.round(taxRate * 100)}%):</span>
                          <span>-${taxes.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="border-t border-dashed border-white/15 pt-2 flex justify-between text-xs font-bold text-slate-100">
                        <span>ESTIMATED NET EARNINGS:</span>
                        <span className="text-emerald-400 font-mono">${netEarnings.toLocaleString()}</span>
                      </div>

                      <div className="pt-2 text-center">
                        <button
                          onClick={() => {
                            triggerSandboxToast(`PDF Slip exported to simulated local cache!`);
                            addSimLog(`PDF Dispatcher: Synthesized digital payslip file for ${currentCalcEmp.name}.`);
                          }}
                          className="w-full py-2 bg-sky-500 text-slate-950 hover:bg-sky-400 font-extrabold rounded-lg text-[9px] uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Simulate Print PDF Slip
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* 4. Kanban Board Sandbox */}
              {activeDemoTab === 'kanban' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h4 className="text-sm font-black text-slate-100">Interactive Kanban Workspace</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Click tasks to transition them through development cycles.</p>
                    </div>

                    <button
                      onClick={handleAddDemoTask}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-sky-500/20 text-slate-300 hover:text-white font-extrabold text-[10px] uppercase rounded-xl flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Formulate Goal</span>
                    </button>
                  </div>

                  {/* Kanban Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Column 1: To Do */}
                    <div className="p-3 bg-black/30 border border-white/5 rounded-2xl min-h-[160px] flex flex-col gap-2">
                      <div className="flex items-center justify-between px-1 mb-1">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">To Do</span>
                        <span className="bg-white/5 px-2 py-0.5 rounded-md text-[9px] font-mono">{sandboxTasks.filter(t => t.col === 'todo').length}</span>
                      </div>
                      
                      {sandboxTasks.filter(t => t.col === 'todo').map(task => (
                        <div 
                          key={task.id}
                          onClick={() => handleMoveTask(task.id)}
                          className="p-3 bg-white/[0.02] hover:bg-white/5 border border-white/10 hover:border-sky-500/30 rounded-xl cursor-pointer transition-all hover:scale-[1.02] group"
                        >
                          <div className="text-xs font-bold text-slate-200 group-hover:text-sky-300">{task.title}</div>
                          <div className="mt-2.5 flex justify-between items-center">
                            <span className="text-[8px] text-slate-500">Owner: {task.owner}</span>
                            <span className="text-[8px] text-sky-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center">Start →</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Column 2: In Progress */}
                    <div className="p-3 bg-black/30 border border-white/5 rounded-2xl min-h-[160px] flex flex-col gap-2">
                      <div className="flex items-center justify-between px-1 mb-1">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">In Progress</span>
                        <span className="bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-md text-[9px] font-mono">{sandboxTasks.filter(t => t.col === 'progress').length}</span>
                      </div>
                      
                      {sandboxTasks.filter(t => t.col === 'progress').map(task => (
                        <div 
                          key={task.id}
                          onClick={() => handleMoveTask(task.id)}
                          className="p-3 bg-white/[0.02] hover:bg-white/5 border border-sky-500/10 hover:border-sky-500/30 rounded-xl cursor-pointer transition-all hover:scale-[1.02] group"
                        >
                          <div className="text-xs font-bold text-slate-200 group-hover:text-sky-300">{task.title}</div>
                          <div className="mt-2.5 flex justify-between items-center">
                            <span className="text-[8px] text-slate-500">Owner: {task.owner}</span>
                            <span className="text-[8px] text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center">Finish →</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Column 3: Done */}
                    <div className="p-3 bg-black/30 border border-white/5 rounded-2xl min-h-[160px] flex flex-col gap-2">
                      <div className="flex items-center justify-between px-1 mb-1">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Done</span>
                        <span className="bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-md text-[9px] font-mono">{sandboxTasks.filter(t => t.col === 'done').length}</span>
                      </div>
                      
                      {sandboxTasks.filter(t => t.col === 'done').map(task => (
                        <div 
                          key={task.id}
                          onClick={() => handleMoveTask(task.id)}
                          className="p-3 bg-white/[0.02] hover:bg-white/5 border border-emerald-500/10 hover:border-emerald-500/35 rounded-xl cursor-pointer transition-all hover:scale-[1.02] group"
                        >
                          <div className="text-xs font-bold text-slate-300 line-through group-hover:text-emerald-300">{task.title}</div>
                          <div className="mt-2.5 flex justify-between items-center">
                            <span className="text-[8px] text-slate-500">Owner: {task.owner}</span>
                            <span className="text-[8px] text-emerald-400 font-extrabold flex items-center gap-0.5">✓ Reset</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* simulated console stream footer */}
              <div className="mt-6 pt-4 border-t border-white/5 bg-black/40 p-3 rounded-2xl flex items-center gap-3">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest shrink-0">Live Sandbox Console Log:</span>
                <div className="flex-1 overflow-hidden h-4 text-[9px] font-mono text-sky-400/80 truncate">
                  {simLogs[0] || 'Awaiting console transactions...'}
                </div>
                <button
                  onClick={() => {
                    setSandboxEmployees(initialSandboxEmployees);
                    setSandboxTasks(initialSandboxTasks);
                    setSearchQuery('');
                    setPayrollHours(40);
                    setPayrollBonus(500);
                    setSelectedDay('Wed');
                    triggerSandboxToast('Restored default sandbox parameters!');
                    addSimLog('Sandbox Core: Rolled back state variables to baseline constants.');
                  }}
                  className="px-2 py-1 bg-white/5 hover:bg-white/10 text-[9px] text-slate-400 hover:text-slate-200 rounded border border-white/5 cursor-pointer active:scale-95"
                >
                  Clear Sandbox State
                </button>
              </div>

            </div>
          </div>
        </section>

        {/* Technical Blueprint Configurator Section */}
        <section className="mt-28 w-full max-w-5xl bg-gradient-to-br from-slate-950 via-slate-900/60 to-slate-950 border border-white/10 p-8 rounded-3xl text-left relative overflow-hidden">
          <div className="absolute top-[-30%] right-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-[10px] uppercase tracking-widest">
                <Activity className="h-4.5 w-4.5 animate-pulse" />
                <span>Enterprise Blueprint Configurator</span>
              </div>
              <h3 className="text-2xl font-black text-slate-100 tracking-tight">Design Your Custom Operational Blueprint</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                CRM PORTAL can scale dynamically based on your enterprise security blueprints. Select security layers and integration modules below to see real-time performance predictions.
              </p>

              {/* Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <label className="flex items-start gap-3 p-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={customNeedSSO}
                    onChange={(e) => {
                      setCustomNeedSSO(e.target.checked);
                      addSimLog(e.target.checked ? 'SSO Guard layer activated in blueprint.' : 'SSO Guard layer excluded from blueprint.');
                    }}
                    className="mt-0.5 accent-sky-500 h-4 w-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Encrypted SSO Gateway</span>
                    <span className="text-[9px] text-slate-500">Security +5% | Est. Build +4d</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={customNeedSlack}
                    onChange={(e) => {
                      setCustomNeedSlack(e.target.checked);
                      addSimLog(e.target.checked ? 'Slack trigger layer activated in blueprint.' : 'Slack trigger layer excluded from blueprint.');
                    }}
                    className="mt-0.5 accent-sky-500 h-4 w-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Slack Operational Hooks</span>
                    <span className="text-[9px] text-slate-500">Est. Build +2d</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={customNeedDB}
                    onChange={(e) => {
                      setCustomNeedDB(e.target.checked);
                      addSimLog(e.target.checked ? 'Persistent Database sync activated in blueprint.' : 'Persistent Database sync excluded.');
                    }}
                    className="mt-0.5 accent-sky-500 h-4 w-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Structured Database Sync</span>
                    <span className="text-[9px] text-slate-500">Security +2% | Est. Build +6d</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={customNeedBackup}
                    onChange={(e) => {
                      setCustomNeedBackup(e.target.checked);
                      addSimLog(e.target.checked ? 'Failover replica activated in blueprint.' : 'Failover replica excluded.');
                    }}
                    className="mt-0.5 accent-sky-500 h-4 w-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Encrypted Cold Backups</span>
                    <span className="text-[9px] text-slate-500">Security +3% | Est. Build +3d</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Simulated Architecture Board Outputs */}
            <div className="lg:col-span-5 bg-black/60 border border-white/5 p-6 rounded-2xl text-xs space-y-4 font-mono text-slate-300">
              <div className="flex items-center gap-2 pb-2.5 border-b border-white/5 text-[10px] text-slate-400">
                <Database className="h-4 w-4 text-indigo-400" />
                <span className="uppercase font-bold tracking-widest">Active Architecture Blueprint</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Computed Security rating:</span>
                  <span className="text-emerald-400 font-bold">{blueprintSecurityScore}% Class A</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full transition-all duration-300" style={{ width: `${blueprintSecurityScore}%` }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Deployment Cycle Estimate:</span>
                  <span className="text-sky-300 font-bold">{blueprintEstBuild} working days</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-sky-400 h-full rounded-full transition-all duration-300" style={{ width: `${(blueprintEstBuild / 15) * 100}%` }} />
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 space-y-1 text-[10px] text-slate-500">
                <div>✓ Sandbox Isolation validated</div>
                <div>✓ Roster algorithms ready for pipeline compilation</div>
                <div>✓ Active nodes online</div>
              </div>

              <button
                onClick={onLaunchPortal}
                className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 border border-white/10"
              >
                <span>Launch Configured Workspace</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        </section>

        {/* Feature Cards Directory */}
        <section id="system-features" className="mt-28 pt-16 border-t border-white/5 w-full max-w-6xl text-left">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-extrabold tracking-widest rounded-full uppercase">
              SYSTEM CAPABILITIES
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight mt-3">
              Comprehensive Operational Framework
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Every tool within CRM PORTAL is engineered with absolute pixel precision, offline LocalStorage persistence, and stunning micro-interactions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systemModules.map((feat, index) => (
              <div 
                key={index}
                className="bg-slate-900/40 backdrop-blur-md border border-white/10 hover:border-sky-500/40 p-6 rounded-2xl transition-all duration-300 group hover:-translate-y-1 shadow-xl hover:shadow-sky-500/5 cursor-default"
              >
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl w-fit group-hover:bg-sky-500/10 group-hover:border-sky-500/20 transition-all">
                  {feat.icon}
                </div>
                <div className="flex items-center gap-2.5 mt-4">
                  <h4 className="text-sm font-extrabold text-slate-200 group-hover:text-sky-300 transition-colors">{feat.title}</h4>
                  <span className="text-[8px] font-black tracking-widest px-1.5 py-0.5 bg-white/5 rounded text-slate-500 uppercase">{feat.badge}</span>
                </div>
                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Fictional Premium Enterprise Client Logos */}
        <section className="mt-28 py-10 border-y border-white/5 w-full max-w-6xl">
          <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block text-center mb-6">SUPPORTING NEXT-GENERATION ENTERPRISES</span>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-40 hover:opacity-60 transition-opacity">
            <div className="flex items-center gap-2 text-sm font-black tracking-tight text-white font-mono">
              <div className="w-3 h-3 rounded bg-sky-500" />
              <span>AETHER_SYSTEMS</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-black tracking-tight text-white font-mono">
              <div className="w-3 h-3 rounded-full bg-indigo-500" />
              <span>NEURALINK.IO</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-black tracking-tight text-white font-mono">
              <div className="w-3 h-3 bg-teal-500 rotate-45" />
              <span>SPECTRA_CO</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-black tracking-tight text-white font-mono">
              <div className="w-3 h-3 rounded bg-amber-500" />
              <span>CHRONOS_INC</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-black tracking-tight text-white font-mono">
              <div className="w-3 h-3 rounded-full bg-pink-500" />
              <span>APEX_DIGITAL</span>
            </div>
          </div>
        </section>

        {/* Interactive FAQ Section */}
        <section className="mt-28 w-full max-w-4xl text-left">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="px-3 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-extrabold tracking-widest rounded-full uppercase">
              SYSTEM INTELLIGENCE
            </span>
            <h3 className="text-2xl font-black text-slate-100 mt-3 tracking-tight">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-xs text-slate-200 hover:text-white cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="h-4.5 w-4.5 text-sky-400 shrink-0" />
                    <span>{faq.question}</span>
                  </span>
                  <span className="text-slate-500 text-lg">{activeFaq === index ? '−' : '+'}</span>
                </button>
                
                <AnimatePresence>
                  {activeFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-5 pb-5 pt-0 text-xs text-slate-400 leading-relaxed border-t border-white/5 mt-1">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* Security Trust Callout Badge */}
        <div className="mt-24 inline-flex items-center gap-3 px-5 py-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-left max-w-md">
          <ShieldCheck className="h-7 w-7 text-emerald-400 shrink-0" />
          <div>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">Validated Client Privacy</span>
            <p className="text-[10px] text-slate-400 leading-normal font-medium mt-0.5">This platform does not track cookies, telemetry, or user diagnostics. Your enterprise roster is 100% private.</p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-10 border-t border-white/5 text-center text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-semibold">© 2026 CRM PORTAL Enterprise Systems. Designed with Frosted Glass UI.</p>
        <div className="flex items-center gap-1.5 font-medium">
          <span>Engineered with precision for secure corporate operations</span>
          <Heart className="h-3 w-3 text-sky-500 fill-sky-500" />
        </div>
      </footer>

    </div>
  );
}
