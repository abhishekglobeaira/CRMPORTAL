/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  DollarSign, 
  Trello, 
  Briefcase, 
  Video, 
  Building2, 
  LogOut,
  Building,
  Receipt,
  LifeBuoy,
  Calendar
} from 'lucide-react';
import { ActiveView } from '../types';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onLogout: () => void;
  userEmail: string;
}

export default function Sidebar({ activeView, setActiveView, onLogout, userEmail }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as ActiveView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees' as ActiveView, label: 'Employees', icon: Users },
    { id: 'attendance' as ActiveView, label: 'Attendance', icon: CalendarCheck },
    { id: 'payroll' as ActiveView, label: 'Payroll & Payslips', icon: DollarSign },
    { id: 'tasks' as ActiveView, label: 'Kanban Tasks', icon: Trello },
    { id: 'candidates' as ActiveView, label: 'Candidates', icon: Briefcase },
    { id: 'interviews' as ActiveView, label: 'Interviews', icon: Video },
    { id: 'clients' as ActiveView, label: 'Clients', icon: Building2 },
    { id: 'invoices' as ActiveView, label: 'Invoices', icon: Receipt },
    { id: 'issues' as ActiveView, label: 'Helpdesk Tickets', icon: LifeBuoy },
    { id: 'leaves' as ActiveView, label: 'Leave Requests', icon: Calendar },
  ];

  return (
    <aside 
      id="app-sidebar"
      className="w-72 bg-white/5 backdrop-blur-xl border-r border-white/10 text-slate-100 flex flex-col h-screen shrink-0 sticky top-0 z-40 transition-all duration-300 shadow-2xl"
    >
      {/* Brand Logo Header */}
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <div className="bg-sky-500 p-2.5 rounded-xl shadow-lg shadow-sky-500/20">
          <Building className="h-6 w-6 text-slate-950 font-bold" />
        </div>
        <div>
          <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          CRM Portal
          </h1>
          <span className="text-[10px] uppercase font-bold tracking-widest text-sky-400/80 block">
            HRMS & WORKSPACE
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative ${
                isActive
                  ? 'bg-white/10 text-sky-400 border-l-4 border-sky-400 shadow-inner'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <Icon 
                className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${
                  isActive ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-200'
                }`} 
              />
              <span>{item.label}</span>
              
              {/* Tooltip background effect */}
              <span className={`absolute right-3 w-1.5 h-1.5 rounded-full bg-sky-400 opacity-0 transition-opacity duration-300 ${
                isActive ? 'opacity-100' : ''
              }`} />
            </button>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-white/10 bg-white/2">
        {/* System Status Alert from Design */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
          <div className="text-[10px] text-slate-400 mb-1 uppercase tracking-wider font-bold">System Status</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs text-slate-300 font-medium">All Systems Operational</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 mb-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center font-bold text-slate-900 shadow-md">
            AD
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-200 truncate">Administrator</p>
            <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
          </div>
        </div>

        <button
          id="btn-logout"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/30 transition-all duration-300 active:scale-95 shadow-lg shadow-rose-500/5 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Log Out Securely</span>
        </button>
      </div>
    </aside>
  );
}
