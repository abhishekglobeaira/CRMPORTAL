/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Briefcase, 
  Building2, 
  Clock, 
  Calendar, 
  TrendingUp, 
  CheckCircle,
  AlertTriangle,
  User,
  Activity,
  ArrowUpRight,
  Receipt,
  LifeBuoy
} from 'lucide-react';
import { Employee, Candidate, Task, Interview, Client, ActivityLog } from '../types';

interface DashboardViewProps {
  employees: Employee[];
  candidates: Candidate[];
  tasks: Task[];
  interviews: Interview[];
  clients: Client[];
  activities: ActivityLog[];
  onNavigateToView: (view: any) => void;
}

export default function DashboardView({
  employees,
  candidates,
  tasks,
  interviews,
  clients,
  activities,
  onNavigateToView
}: DashboardViewProps) {
  // 1. Dynamic Calculations
  const totalEmployees = employees.length;
  const totalCandidates = candidates.length;
  const totalClients = clients.length;
  const pendingTasks = tasks.filter(t => t.status !== 'Completed').length;

  // Department counts
  const departments = ['Engineering', 'Design', 'Human Resources', 'Product', 'Sales'];
  const deptCounts = departments.map(dept => ({
    name: dept,
    count: employees.filter(e => e.department === dept).length
  }));
  const maxDeptCount = Math.max(...deptCounts.map(d => d.count), 1);

  // Candidate Status counts
  const candidateStatuses = ['New', 'Interview', 'Selected', 'Rejected'] as const;
  const statusCounts = candidateStatuses.map(status => ({
    name: status,
    count: candidates.filter(c => c.status === status).length
  }));
  const totalCandidatesWithStatus = candidates.length || 1;

  // Upcoming scheduled interviews
  const upcomingInterviews = interviews
    .filter(i => i.status === 'Scheduled')
    .slice(0, 4);

  // Task Priority distribution for pending tasks
  const highPriorityTasks = tasks.filter(t => t.status !== 'Completed' && t.priority === 'High').length;
  const medPriorityTasks = tasks.filter(t => t.status !== 'Completed' && t.priority === 'Medium').length;
  const lowPriorityTasks = tasks.filter(t => t.status !== 'Completed' && t.priority === 'Low').length;

  // Helper colors for activities
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'employee': return 'from-teal-500 to-emerald-500 text-teal-300';
      case 'candidate': return 'from-amber-500 to-orange-500 text-amber-300';
      case 'interview': return 'from-indigo-500 to-violet-500 text-indigo-300';
      case 'task': return 'from-blue-500 to-cyan-500 text-blue-300';
      case 'client': return 'from-purple-500 to-pink-500 text-purple-300';
      case 'payroll': return 'from-emerald-500 to-teal-600 text-emerald-300';
      default: return 'from-slate-500 to-slate-600 text-slate-300';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950/40 p-8 border border-slate-700/30 shadow-xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-16 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-black text-slate-100 tracking-tight leading-none">
            Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Chief Admin</span>
          </h1>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-xl">
            You have full system authorization. Managing <span className="text-teal-300 font-semibold">{totalEmployees} employees</span> across {departments.length} departments, handling <span className="text-emerald-300 font-semibold">{totalClients} client contracts</span>, and supervising {pendingTasks} ongoing tasks.
          </p>
          
          <div className="flex flex-wrap gap-3 mt-6">
            <button 
              id="dash-quick-add-emp"
              onClick={() => onNavigateToView('employees')}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-teal-400 text-slate-950 hover:bg-teal-300 transition-all duration-300 flex items-center gap-1.5 shadow-lg shadow-teal-400/20 active:scale-95 cursor-pointer"
            >
              <Users className="h-3.5 w-3.5" />
              <span>Manage Employees</span>
            </button>
            <button 
              id="dash-quick-schedule-int"
              onClick={() => onNavigateToView('interviews')}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800/80 text-slate-200 hover:bg-slate-700 border border-slate-700/50 hover:border-slate-700 transition-all duration-300 flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Calendar className="h-3.5 w-3.5 text-teal-400" />
              <span>Schedule Interviews</span>
            </button>
            <button 
              id="dash-quick-invoices"
              onClick={() => onNavigateToView('invoices')}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800/80 text-slate-200 hover:bg-slate-700 border border-slate-700/50 hover:border-slate-700 transition-all duration-300 flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Receipt className="h-3.5 w-3.5 text-teal-400" />
              <span>Generate Invoices</span>
            </button>
            <button 
              id="dash-quick-issues"
              onClick={() => onNavigateToView('issues')}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800/80 text-slate-200 hover:bg-slate-700 border border-slate-700/50 hover:border-slate-700 transition-all duration-300 flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <LifeBuoy className="h-3.5 w-3.5 text-teal-400" />
              <span>Support Helpdesk</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Employees */}
        <div 
          id="stat-employees"
          onClick={() => onNavigateToView('employees')}
          className="group relative overflow-hidden bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 hover:border-teal-500/30 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/5 hover:-translate-y-1 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="bg-teal-500/10 group-hover:bg-teal-500/20 p-3 rounded-xl transition-all duration-300">
              <Users className="h-6 w-6 text-teal-400" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
          </div>
          <div className="mt-5">
            <span className="text-xs font-semibold text-slate-400 tracking-wider block uppercase">Total Employees</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-100 font-mono">{totalEmployees}</span>
              <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-md">Live</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-2">Active full-time database</span>
          </div>
        </div>

        {/* Card 2: Candidates */}
        <div 
          id="stat-candidates"
          onClick={() => onNavigateToView('candidates')}
          className="group relative overflow-hidden bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 hover:border-indigo-500/30 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="bg-indigo-500/10 group-hover:bg-indigo-500/20 p-3 rounded-xl transition-all duration-300">
              <Briefcase className="h-6 w-6 text-indigo-400" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          </div>
          <div className="mt-5">
            <span className="text-xs font-semibold text-slate-400 tracking-wider block uppercase">Active Candidates</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-100 font-mono">{totalCandidates}</span>
              <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-1.5 py-0.5 rounded-md">
                {candidates.filter(c => c.status === 'Selected').length} Selected
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-2">Recruitment funnel status</span>
          </div>
        </div>

        {/* Card 3: Clients */}
        <div 
          id="stat-clients"
          onClick={() => onNavigateToView('clients')}
          className="group relative overflow-hidden bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 hover:border-purple-500/30 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/5 hover:-translate-y-1 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="bg-purple-500/10 group-hover:bg-purple-500/20 p-3 rounded-xl transition-all duration-300">
              <Building2 className="h-6 w-6 text-purple-400" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
          </div>
          <div className="mt-5">
            <span className="text-xs font-semibold text-slate-400 tracking-wider block uppercase">Total Clients</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-100 font-mono">{totalClients}</span>
              <span className="text-xs text-purple-400 font-medium bg-purple-500/10 px-1.5 py-0.5 rounded-md">Active</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-2">B2B enterprise partners</span>
          </div>
        </div>

        {/* Card 4: Tasks Pending */}
        <div 
          id="stat-tasks"
          onClick={() => onNavigateToView('tasks')}
          className="group relative overflow-hidden bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 hover:border-amber-500/30 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/5 hover:-translate-y-1 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="bg-amber-500/10 group-hover:bg-amber-500/20 p-3 rounded-xl transition-all duration-300">
              <Clock className="h-6 w-6 text-amber-400" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
          <div className="mt-5">
            <span className="text-xs font-semibold text-slate-400 tracking-wider block uppercase">Tasks Pending</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-100 font-mono">{pendingTasks}</span>
              <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                {highPriorityTasks} Urgent
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-2">Kanban board incomplete</span>
          </div>
        </div>
      </div>

      {/* Visual Charts section (Custom Interactive SVG) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution (Horizontal Bar Chart) */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-100 tracking-tight">Employees by Department</h3>
              <p className="text-xs text-slate-400">Headcount distribution in the workspace</p>
            </div>
            <div className="text-[10px] text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md font-bold tracking-wider uppercase">HR Distribution</div>
          </div>

          <div className="space-y-4.5">
            {deptCounts.map((dept) => {
              const percentage = (dept.count / maxDeptCount) * 100;
              return (
                <div key={dept.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-200">{dept.name}</span>
                    <span className="text-teal-400 font-mono">{dept.count} {dept.count === 1 ? 'employee' : 'employees'}</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/10">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-1000 ease-out shadow-sm shadow-teal-500/20"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800/50 flex items-center justify-between text-[11px] text-slate-400">
            <span>Total Workforce Strength: {totalEmployees}</span>
            <span>Target Capacity: 25 max</span>
          </div>
        </div>

        {/* Candidates Recruiting Pipeline (Donut Chart representation) */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-100 tracking-tight">Recruitment Pipeline</h3>
              <p className="text-xs text-slate-400">Candidate status breakdown in funnel</p>
            </div>
            <div className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md font-bold tracking-wider uppercase">CRM Pipeline</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* SVG Visual Representing Pipeline */}
            <div className="flex justify-center py-2">
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {/* Background Circle */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1e293b" strokeWidth="8" />
                  
                  {/* We will map status percentages as circle segments */}
                  {(() => {
                    let accumulatedPercent = 0;
                    const colors = ['#38bdf8', '#818cf8', '#34d399', '#f87171']; // New (blue), Interview (indigo), Selected (green), Rejected (red)
                    const radius = 40;
                    const circumference = 2 * Math.PI * radius;

                    return statusCounts.map((status, index) => {
                      const count = status.count;
                      const percent = (count / totalCandidatesWithStatus) * 100;
                      if (percent === 0) return null;

                      const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
                      const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                      accumulatedPercent += percent;

                      return (
                        <circle
                          key={status.name}
                          cx="50"
                          cy="50"
                          r={radius}
                          fill="transparent"
                          stroke={colors[index]}
                          strokeWidth="8.5"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      );
                    });
                  })()}
                </svg>
                {/* Center Core Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-100 font-mono">{totalCandidates}</span>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Total</span>
                </div>
              </div>
            </div>

            {/* Legend Breakdown */}
            <div className="space-y-3">
              {statusCounts.map((status, i) => {
                const colors = ['bg-sky-400', 'bg-indigo-400', 'bg-emerald-400', 'bg-rose-400'];
                const percent = Math.round((status.count / totalCandidatesWithStatus) * 100);
                return (
                  <div key={status.name} className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${colors[i]}`} />
                      <span className="text-slate-300">{status.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-slate-100">{status.count}</span>
                      <span className="text-slate-500 text-[10px]">({percent}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-5 border-t border-slate-800/50 flex items-center justify-between text-[11px] text-slate-400">
            <span>Successful Hirings: {candidates.filter(c => c.status === 'Selected').length}</span>
            <span>Selected Ratio: {Math.round((candidates.filter(c => c.status === 'Selected').length / totalCandidatesWithStatus) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Interviews and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upcoming Interviews (Lg span 5) */}
        <div className="lg:col-span-5 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 tracking-tight">Upcoming Interviews</h3>
              <p className="text-xs text-slate-400">Next scheduled client candidate reviews</p>
            </div>
            <button 
              onClick={() => onNavigateToView('interviews')} 
              className="text-xs text-teal-400 hover:text-teal-300 transition-colors font-semibold"
            >
              View All
            </button>
          </div>

          <div className="space-y-3.5 flex-1 overflow-y-auto max-h-80 pr-1">
            {upcomingInterviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-800/20 rounded-xl border border-dashed border-slate-700/50">
                <CheckCircle className="h-8 w-8 text-slate-500 mb-2" />
                <p className="text-xs font-bold text-slate-300">No interviews scheduled</p>
                <p className="text-[10px] text-slate-500 mt-1">Everything looks clear today!</p>
              </div>
            ) : (
              upcomingInterviews.map((interview) => (
                <div 
                  key={interview.id} 
                  className="p-3.5 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 border border-slate-700/30 hover:border-slate-700/60 transition-all duration-300 flex items-start gap-3 group"
                >
                  <div className="p-2 bg-indigo-500/10 group-hover:bg-indigo-500/20 rounded-lg text-indigo-400 shrink-0 transition-colors">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-200 truncate">{interview.candidateName}</h4>
                      <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                        {interview.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Interviewer: {interview.interviewer}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                        <Calendar className="h-3 w-3 text-slate-500" />
                        {interview.date}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activities (Lg span 7) */}
        <div className="lg:col-span-7 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 tracking-tight">Recent Activities</h3>
              <p className="text-xs text-slate-400">Stream of portal CRUD logs and events</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
              <Activity className="h-3.5 w-3.5 text-teal-400" />
              <span>Real-time logger</span>
            </div>
          </div>

          <div className="space-y-3.5 flex-1 overflow-y-auto max-h-80 pr-1">
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-800/20 rounded-xl border border-dashed border-slate-700/50">
                <Activity className="h-8 w-8 text-slate-500 mb-2" />
                <p className="text-xs font-bold text-slate-300">No activity logs recorded</p>
                <p className="text-[10px] text-slate-500 mt-1">Actions on this dashboard will log here.</p>
              </div>
            ) : (
              activities.slice(0, 5).map((log) => (
                <div 
                  key={log.id} 
                  className="p-3 rounded-xl bg-slate-800/20 border border-slate-800/40 hover:border-slate-700/60 transition-all duration-300 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-10 rounded-lg bg-gradient-to-b ${getActivityColor(log.type)}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-200">{log.action}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium">{log.details}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold whitespace-nowrap">{log.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
