/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Clock, Search, Bell, ShieldCheck, Sun, User, Type } from 'lucide-react';
import { ActiveView } from '../types';
import { dbGetCollection, dbSaveItem } from '../firebase';

interface NavbarProps {
  activeView: ActiveView;
  userEmail: string;
}

export default function Navbar({ activeView, userEmail }: NavbarProps) {
  const [time, setTime] = useState(new Date());
  const [fontSize, setFontSize] = useState<string>('md');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadSavedFontSize = async () => {
      if (!userEmail) {
        setFontSize('md');
        return;
      }

      try {
        const preferences = await dbGetCollection<{ email: string; fontSize: string }>('crm_user_preferences');
        const savedPreference = preferences.find((pref) => pref.email?.toLowerCase() === userEmail.toLowerCase());
        if (savedPreference?.fontSize) {
          setFontSize(savedPreference.fontSize);
        } else {
          setFontSize('md');
        }
      } catch (error) {
        console.error('Failed to load UI font preference from database:', error);
        setFontSize('md');
      }
    };

    loadSavedFontSize();
  }, [userEmail]);

  useEffect(() => {
    const root = document.documentElement;
    const sizeMap: Record<string, string> = {
      sm: '14px',
      md: '16px',
      lg: '18.5px',
      xl: '21px',
    };
    root.style.fontSize = sizeMap[fontSize] || '16px';
  }, [fontSize]);

  useEffect(() => {
    if (!userEmail) return;

    const timer = setTimeout(() => {
      dbSaveItem('crm_user_preferences', userEmail, {
        email: userEmail,
        fontSize,
      }).catch((error) => {
        console.error('Failed to save UI font preference to database:', error);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [fontSize, userEmail]);

  const formatViewName = (view: ActiveView) => {
    switch (view) {
      case 'dashboard': return 'Dashboard Overview';
      case 'employees': return 'Employee Management';
      case 'attendance': return 'Attendance Tracker';
      case 'payroll': return 'Payroll & Compensation';
      case 'tasks': return 'Kanban Board Tasks';
      case 'candidates': return 'Candidate Pipelines';
      case 'interviews': return 'Scheduled Interviews';
      case 'clients': return 'Client Portfolios';
      case 'invoices': return 'Billing & Invoices';
      case 'issues': return 'Employee Helpdesk Tickets';
      case 'leaves': return 'Leave Requests';
      case 'admin-manage': return 'Credentials & Access Control';
      default: return 'Workspace';
    }
  };

  const getFormattedDate = () => {
    return time.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFormattedTime = () => {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return (
    <header 
      id="app-navbar"
      className="bg-white/2 backdrop-blur-md border-b border-white/10 px-8 py-4 flex items-center justify-between sticky top-0 z-30 transition-all duration-300"
    >
      {/* Title & Path */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2 text-xs font-bold text-sky-400 tracking-widest uppercase">
          <span>WORKSPACE</span>
          <span>/</span>
          <span className="text-slate-300">{activeView}</span>
        </div>
        <h2 className="text-2xl font-black text-slate-100 tracking-tight mt-0.5">
          {formatViewName(activeView)}
        </h2>
      </div>

      {/* Center Clock Widget (Glassmorphism Accent) */}
      <div className="hidden lg:flex items-center gap-3 px-5 py-2 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
        <Clock className="h-4 w-4 text-sky-400 animate-pulse" />
        <div className="flex items-baseline gap-1.5 font-mono text-sm font-semibold">
          <span className="text-slate-100">{getFormattedTime()}</span>
          <span className="text-[10px] text-slate-400">|</span>
          <span className="text-xs text-slate-300">{getFormattedDate()}</span>
        </div>
      </div>

      {/* Right User Bar */}
      <div className="flex items-center gap-4">
        {/* Active Session Status Badge */}
        <div className="hidden sm:flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>ADMIN SECURE</span>
        </div>

        {/* Font Size Accessibility Controller */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl shadow-inner">
          <Type className="h-3.5 w-3.5 text-slate-400 mx-1 hidden md:block" />
          <button 
            onClick={() => setFontSize('sm')}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all duration-300 cursor-pointer ${
              fontSize === 'sm' 
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' 
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
            title="Small Font"
          >
            A-
          </button>
          <button 
            onClick={() => setFontSize('md')}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all duration-300 cursor-pointer ${
              fontSize === 'md' 
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' 
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
            title="Medium Font (Default)"
          >
            A
          </button>
          <button 
            onClick={() => setFontSize('lg')}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all duration-300 cursor-pointer ${
              fontSize === 'lg' 
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' 
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
            title="Large Font"
          >
            A+
          </button>
          <button 
            onClick={() => setFontSize('xl')}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all duration-300 cursor-pointer ${
              fontSize === 'xl' 
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' 
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
            title="Extra Large Font"
          >
            A++
          </button>
        </div>

        {/* Notifications Button */}
        <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-all duration-300 relative group cursor-pointer">
          <Bell className="h-4 w-4 text-slate-300 group-hover:scale-110" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-400 ring-2 ring-[#0f172a] animate-bounce" />
        </button>

        {/* User Detail Segment */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
          <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-100">
            <User className="h-4 w-4 text-slate-300" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-slate-200">System Admin</p>
            <p className="text-[10px] text-slate-400 font-medium truncate w-28">{userEmail}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
