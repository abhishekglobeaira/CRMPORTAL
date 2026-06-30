import React, { useState } from 'react';
import { 
  Calendar, 
  Check, 
  X, 
  Search, 
  User, 
  ClipboardList, 
  FileText, 
  UserCheck, 
  Clock, 
  AlertCircle
} from 'lucide-react';
import { LeaveRequest, Employee } from '../types';

interface LeavesViewProps {
  leaveRequests: LeaveRequest[];
  employees: Employee[];
  onApproveLeave: (id: string, notes?: string) => void;
  onRejectLeave: (id: string, notes?: string) => void;
}

export default function LeavesView({
  leaveRequests,
  employees,
  onApproveLeave,
  onRejectLeave
}: LeavesViewProps) {
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Note inputs for individual leave reviews
  const [adminNotes, setAdminNotes] = useState<{ [id: string]: string }>({});

  // Filter & Search Logic
  const filteredRequests = leaveRequests.filter(req => {
    const matchesStatus = filterStatus === 'All' || req.status === filterStatus;
    const matchesSearch = req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // KPI Calculations
  const totalApplied = leaveRequests.length;
  const pendingCount = leaveRequests.filter(r => r.status === 'Pending').length;
  const approvedCount = leaveRequests.filter(r => r.status === 'Approved').length;
  const rejectedCount = leaveRequests.filter(r => r.status === 'Rejected').length;

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 tracking-tight uppercase flex items-center gap-2">
            <Calendar className="h-5.5 w-5.5 text-sky-400" />
            <span>Leave Applications Manager</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review, authorize, and track employee time-off and medical leave applications.
          </p>
        </div>
      </div>

      {/* Corporate Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Total Applications</span>
            <p className="text-xl font-black text-slate-100 font-mono mt-0.5">{totalApplied}</p>
          </div>
          <div className="p-2 bg-slate-800 text-slate-400 rounded-xl">
            <ClipboardList className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Pending Review</span>
            <p className="text-xl font-black text-amber-400 font-mono mt-0.5">{pendingCount}</p>
          </div>
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl animate-pulse">
            <Clock className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Approved Leaves</span>
            <p className="text-xl font-black text-emerald-400 font-mono mt-0.5">{approvedCount}</p>
          </div>
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <UserCheck className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Rejected / Denied</span>
            <p className="text-xl font-black text-rose-400 font-mono mt-0.5">{rejectedCount}</p>
          </div>
          <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
            <AlertCircle className="h-4.5 w-4.5" />
          </div>
        </div>
      </div>

      {/* Interactive Controls & Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by employee or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800/60 focus:border-sky-400 rounded-xl py-2 pl-11 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto">
          {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filterStatus === status
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/10'
                  : 'bg-slate-950/50 text-slate-400 border border-slate-800/80 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Applications list table */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs font-bold">
              No leave requests matching the filters found.
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-950/50 border-b border-slate-800 text-slate-400">
                  <th className="px-6 py-4 font-black uppercase tracking-wider text-[9px]">Employee</th>
                  <th className="px-6 py-4 font-black uppercase tracking-wider text-[9px]">Type & Duration</th>
                  <th className="px-6 py-4 font-black uppercase tracking-wider text-[9px]">Reason Statement</th>
                  <th className="px-6 py-4 font-black uppercase tracking-wider text-[9px]">Submission Date</th>
                  <th className="px-6 py-4 font-black uppercase tracking-wider text-[9px]">Approval Status</th>
                  <th className="px-6 py-4 font-black uppercase tracking-wider text-[9px] text-right">Actions / Decisions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-semibold">
                {filteredRequests.map((req) => {
                  const emp = employees.find(e => e.id === req.employeeId);
                  return (
                    <tr key={req.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-sky-400/10 to-indigo-500/10 border border-sky-400/20 flex items-center justify-center font-bold text-sky-400 text-[10px]">
                            {req.employeeName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-200 text-xs">{req.employeeName}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{emp?.department || 'Roster staff'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-extrabold text-slate-200">{req.type} Leave</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">{req.startDate} to {req.endDate}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-slate-300 leading-normal line-clamp-2" title={req.reason}>
                          {req.reason}
                        </p>
                        {req.adminNotes && (
                          <p className="text-[10px] text-indigo-400 mt-1 leading-normal">
                            <span className="font-bold">Admin Remark:</span> {req.adminNotes}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-500 text-[10px]">{req.dateApplied}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          req.status === 'Approved' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                          req.status === 'Rejected' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' :
                          'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {req.status === 'Pending' ? (
                          <div className="space-y-2 max-w-[200px] ml-auto">
                            {/* Notes Input */}
                            <input
                              type="text"
                              placeholder="Write optional admin remark..."
                              value={adminNotes[req.id] || ''}
                              onChange={(e) => setAdminNotes({ ...adminNotes, [req.id]: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800/80 focus:border-sky-400 rounded-lg px-2 py-1 text-[10px] text-slate-300 placeholder-slate-600 focus:outline-none"
                            />
                            
                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onApproveLeave(req.id, adminNotes[req.id])}
                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1 transition active:scale-95 cursor-pointer"
                              >
                                <Check className="h-3 w-3" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => onRejectLeave(req.id, adminNotes[req.id])}
                                className="bg-rose-500 hover:bg-rose-400 text-white font-black px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1 transition active:scale-95 cursor-pointer"
                              >
                                <X className="h-3 w-3" />
                                <span>Reject</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 font-mono uppercase">Reviewed & Finalized</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
