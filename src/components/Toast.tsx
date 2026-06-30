/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function Toast({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        return (
          <ToastItem 
            key={toast.id} 
            toast={toast} 
            onDismiss={() => onDismiss(toast.id)} 
          />
        );
      })}
    </div>
  );
}

interface ToastItemProps {
  key?: string;
  toast: ToastMessage;
  onDismiss: () => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  // Auto dismiss after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return {
          border: 'border-emerald-500/30',
          bg: 'bg-slate-900/90 backdrop-blur-md shadow-emerald-500/5',
          icon: <CheckCircle className="h-5 w-5 text-emerald-400" />,
          progress: 'bg-emerald-400'
        };
      case 'error':
        return {
          border: 'border-rose-500/30',
          bg: 'bg-slate-900/90 backdrop-blur-md shadow-rose-500/5',
          icon: <AlertCircle className="h-5 w-5 text-rose-400" />,
          progress: 'bg-rose-400'
        };
      case 'warning':
        return {
          border: 'border-amber-500/30',
          bg: 'bg-slate-900/90 backdrop-blur-md shadow-amber-500/5',
          icon: <AlertTriangle className="h-5 w-5 text-amber-400" />,
          progress: 'bg-amber-400'
        };
      default:
        return {
          border: 'border-teal-500/30',
          bg: 'bg-slate-900/90 backdrop-blur-md shadow-teal-500/5',
          icon: <Info className="h-5 w-5 text-teal-400" />,
          progress: 'bg-teal-400'
        };
    }
  };

  const style = getStyles(toast.type);

  return (
    <div 
      className={`pointer-events-auto flex flex-col overflow-hidden rounded-2xl border ${style.border} ${style.bg} shadow-2xl p-4.5 transition-all duration-300 animate-slide-in`}
    >
      <div className="flex items-start gap-3.5">
        <div className="shrink-0">{style.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-200 capitalize tracking-tight">{toast.type} Alert</p>
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-1">{toast.message}</p>
        </div>
        <button 
          onClick={onDismiss}
          className="shrink-0 text-slate-500 hover:text-slate-300 p-0.5 hover:bg-slate-800 rounded transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Decorative dynamic timeout progress bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-slate-800 w-full">
        <div 
          className={`h-full ${style.progress} animate-toast-progress`}
          style={{ animationDuration: '4000ms' }}
        />
      </div>
    </div>
  );
}
