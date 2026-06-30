/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  AlertCircle, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  Plus, 
  X, 
  ChevronRight, 
  Filter, 
  Wrench, 
  HelpCircle, 
  Briefcase, 
  ShieldAlert, 
  Search,
  CheckCircle2,
  AlertOctagon,
  FileSpreadsheet,
  Laptop,
  Tv,
  Package,
  Trash2,
  Plug
} from 'lucide-react';
import { AssistsIssue, Employee, EquipmentAssignment } from '../types';

interface IssueViewProps {
  employees: Employee[];
  issues: AssistsIssue[];
  equipment?: EquipmentAssignment[];
  onAddIssue: (issue: Omit<AssistsIssue, 'id'>) => void;
  onUpdateIssueStatus: (id: string, status: AssistsIssue['status'], adminNotes?: string, assignedToId?: string) => void;
  onDeleteIssue: (id: string) => void;
  selectedEmpId?: string;
  onAddEquipment: (eq: Omit<EquipmentAssignment, 'id'>) => void;
  onUpdateEquipment: (eq: EquipmentAssignment) => void;
  onDeleteEquipment: (id: string) => void;
}

export default function IssueView({ 
  employees, 
  issues, 
  equipment = [],
  onAddIssue, 
  onUpdateIssueStatus, 
  onDeleteIssue,
  selectedEmpId,
  onAddEquipment,
  onUpdateEquipment,
  onDeleteEquipment
}: IssueViewProps) {
  // Modal / Form States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<AssistsIssue | null>(null);

  // Filter states
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Equipment specific sub-tab & modal states
  const [activeSubTab, setActiveSubTab] = useState<'tickets' | 'equipment'>('tickets');
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [selectedEqForEdit, setSelectedEqForEdit] = useState<EquipmentAssignment | null>(null);

  // New Equipment fields
  const [eqEmployeeId, setEqEmployeeId] = useState('');
  const [eqItemName, setEqItemName] = useState('');
  const [eqSerialNumber, setEqSerialNumber] = useState('');
  const [eqType, setEqType] = useState<EquipmentAssignment['type']>('Laptop');
  const [eqCondition, setEqCondition] = useState<EquipmentAssignment['condition']>('New');
  const [eqNotes, setEqNotes] = useState('');
  const [eqStatus, setEqStatus] = useState<EquipmentAssignment['status']>('Assigned');

  // Equipment filtering
  const [eqSearchQuery, setEqSearchQuery] = useState('');
  const [eqFilterType, setEqFilterType] = useState<string>('All');
  const [eqFilterCondition, setEqFilterCondition] = useState<string>('All');

  // Interactive Allotment Guide State
  const [activeGuideStep, setActiveGuideStep] = useState<number>(0);

  // Auto-focus deep-linked employee
  React.useEffect(() => {
    if (selectedEmpId) {
      const emp = employees.find(e => e.id === selectedEmpId);
      if (emp) {
        setSearchQuery(emp.name);
        setEmployeeId(selectedEmpId);
      }
    }
  }, [selectedEmpId, employees]);

  // New Issue Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<AssistsIssue['category']>('IT Support');
  const [severity, setSeverity] = useState<AssistsIssue['severity']>('Medium');
  const [description, setDescription] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [dateCreated, setDateCreated] = useState(() => new Date().toISOString().split('T')[0]);

  // Admin notes for details modal follow-up
  const [tempAdminNotes, setTempAdminNotes] = useState('');

  // Calculations for Filtered Issues
  const filteredIssues = issues.filter(iss => {
    const matchesCategory = filterCategory === 'All' || iss.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || iss.status === filterStatus;
    const matchesSearch = 
      iss.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      iss.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
      iss.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Category and Status Options
  const categories = ['IT Support', 'HR Query', 'Assets & Equipment', 'Facilities', 'Finance'];

  // Submission handler
  const handleSubmitIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      alert('Please select an employee creating this issue ticket.');
      return;
    }
    if (!title.trim() || !description.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    onAddIssue({
      title,
      category,
      severity,
      description,
      employeeId,
      employeeName: employee.name,
      status: 'Pending',
      dateCreated,
      adminNotes: ''
    });

    // Reset Form Fields
    setTitle('');
    setCategory('IT Support');
    setSeverity('Medium');
    setDescription('');
    setEmployeeId('');
    setShowCreateModal(false);
  };

  // Status transitions
  const handleStatusChange = (id: string, nextStatus: AssistsIssue['status']) => {
    const is = issues.find(x => x.id === id);
    if (!is) return;
    onUpdateIssueStatus(id, nextStatus, is.adminNotes || '');
    // Update active details overlay state as well
    if (selectedIssue && selectedIssue.id === id) {
      setSelectedIssue(prev => prev ? { ...prev, status: nextStatus } : null);
    }
  };

  // Submit response comments
  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue) return;
    onUpdateIssueStatus(selectedIssue.id, selectedIssue.status, tempAdminNotes);
    setSelectedIssue(prev => prev ? { ...prev, adminNotes: tempAdminNotes } : null);
    alert('Administrative response logged successfully.');
  };

  // Submit new/edited equipment
  const handleSubmitEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eqEmployeeId) {
      alert('Please select an employee.');
      return;
    }
    if (!eqItemName.trim() || !eqSerialNumber.trim()) {
      alert('Please fill out item name and serial number.');
      return;
    }

    const employee = employees.find(emp => emp.id === eqEmployeeId);
    if (!employee) return;

    if (selectedEqForEdit) {
      // Edit mode
      onUpdateEquipment({
        id: selectedEqForEdit.id,
        employeeId: eqEmployeeId,
        employeeName: employee.name,
        itemName: eqItemName,
        serialNumber: eqSerialNumber,
        type: eqType,
        condition: eqCondition,
        status: eqStatus,
        assignedDate: selectedEqForEdit.assignedDate,
        notes: eqNotes.trim() || undefined
      });
    } else {
      // Add mode
      onAddEquipment({
        employeeId: eqEmployeeId,
        employeeName: employee.name,
        itemName: eqItemName,
        serialNumber: eqSerialNumber,
        type: eqType,
        condition: eqCondition,
        status: eqStatus,
        assignedDate: new Date().toISOString().split('T')[0],
        notes: eqNotes.trim() || undefined
      });
    }

    // Reset Form Fields
    setEqEmployeeId('');
    setEqItemName('');
    setEqSerialNumber('');
    setEqType('Laptop');
    setEqCondition('New');
    setEqNotes('');
    setEqStatus('Assigned');
    setSelectedEqForEdit(null);
    setShowEquipmentModal(false);
  };

  const handleOpenEditEquipment = (eq: EquipmentAssignment) => {
    setSelectedEqForEdit(eq);
    setEqEmployeeId(eq.employeeId);
    setEqItemName(eq.itemName);
    setEqSerialNumber(eq.serialNumber);
    setEqType(eq.type);
    setEqCondition(eq.condition);
    setEqStatus(eq.status);
    setEqNotes(eq.notes || '');
    setShowEquipmentModal(true);
  };

  // Active status details helper
  const totalTickets = issues.length;
  const pendingTickets = issues.filter(i => i.status === 'Pending').length;
  const progressTickets = issues.filter(i => i.status === 'In Progress').length;
  const resolvedTickets = issues.filter(i => i.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Total Tickets */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between h-28">
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Total Helpdesk Tickets</span>
            <span className="text-2xl font-black text-slate-100 font-mono tracking-tight block mt-1.5">{totalTickets}</span>
          </div>
          <span className="text-[10px] text-sky-400 font-bold tracking-wider">Workspace SLA support files</span>
        </div>

        {/* Pending Tickets */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between h-28">
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Pending / Unassigned</span>
            <span className="text-2xl font-black text-rose-400 font-mono tracking-tight block mt-1.5">{pendingTickets}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-rose-400 font-bold tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            <span>Awaiting administrative triaging</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between h-28">
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Active In-Progress</span>
            <span className="text-2xl font-black text-amber-400 font-mono tracking-tight block mt-1.5">{progressTickets}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold tracking-wider">
            <Wrench className="w-3.5 h-3.5" />
            <span>Currently being engineered / answered</span>
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between h-28">
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Resolved Tickets</span>
            <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight block mt-1.5">{resolvedTickets}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>SLA resolved & documented</span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex border-b border-slate-800/80 mb-2 gap-4">
        <button
          onClick={() => setActiveSubTab('tickets')}
          className={`px-6 py-3.5 text-xs font-extrabold uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'tickets'
              ? 'border-sky-500 text-sky-400 font-black'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Helpdesk Support Tickets ({issues.length})
        </button>
        <button
          onClick={() => setActiveSubTab('equipment')}
          className={`px-6 py-3.5 text-xs font-extrabold uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'equipment'
              ? 'border-teal-500 text-teal-400 font-black'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Assigned Property & Equipment ({equipment.length})
        </button>
      </div>

      {activeSubTab === 'tickets' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main List Column */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl flex flex-col">
          {/* Header Controls */}
          <div className="p-6 border-b border-slate-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-200">Employee Helpdesk & Support Issues</h3>
                <p className="text-xs text-slate-400 mt-1">Settle HR questions, IT requests, and equipment provisioning requests.</p>
              </div>
              <button
                id="btn-issue-create-trigger"
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-extrabold px-4.5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                <span>Log Support Issue</span>
              </button>
            </div>

            {/* Filter Toolbars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1.5">
              {/* Category selector */}
              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700/50 text-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Status selector */}
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700/50 text-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              {/* Search text */}
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500">
                  <Search className="h-3.5 w-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Search tickets, logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700/50 text-slate-300 rounded-xl pl-9 pr-3.5 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Issue Cards Stack */}
          <div className="p-6 divide-y divide-slate-800/60 space-y-4 max-h-[500px] overflow-y-auto">
            {filteredIssues.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-semibold text-xs">
                No tickets matching current filter criteria.
              </div>
            ) : (
              filteredIssues.map((iss) => (
                <div 
                  key={iss.id} 
                  id={`issue-card-${iss.id}`}
                  onClick={() => {
                    setSelectedIssue(iss);
                    setTempAdminNotes(iss.adminNotes || '');
                  }}
                  className={`pt-4 first:pt-0 group flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-800/10 p-2.5 rounded-xl transition duration-150 ${
                    selectedIssue?.id === iss.id ? 'bg-white/5 border border-white/5 shadow-inner' : ''
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold tracking-wider ${
                        iss.severity === 'High' 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                          : iss.severity === 'Medium' 
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {iss.severity} Priority
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{iss.category}</span>
                    </div>
                    <h4 className="text-xs font-extrabold text-slate-200 group-hover:text-sky-400 transition-colors">
                      {iss.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 pr-4">{iss.description}</p>
                    <div className="flex items-center gap-2.5 text-[10px] text-slate-500">
                      <span>Logged by: <span className="text-slate-300 font-bold">{iss.employeeName}</span></span>
                      <span>•</span>
                      <span className="font-mono">{iss.dateCreated}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2.5 shrink-0">
                    <select
                      id={`select-status-${iss.id}`}
                      value={iss.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleStatusChange(iss.id, e.target.value as AssistsIssue['status'])}
                      className={`px-2 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider border outline-none bg-slate-900 cursor-pointer transition-all duration-200 ${
                        iss.status === 'Resolved'
                          ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 focus:ring-1 focus:ring-emerald-500'
                          : iss.status === 'In Progress'
                          ? 'text-amber-400 border-amber-500/30 bg-amber-500/10 focus:ring-1 focus:ring-amber-500'
                          : 'text-rose-400 border-rose-500/30 bg-rose-500/10 focus:ring-1 focus:ring-rose-500'
                      }`}
                    >
                      <option value="Pending" className="bg-slate-900 text-rose-400 font-extrabold">Pending</option>
                      <option value="In Progress" className="bg-slate-900 text-amber-400 font-extrabold">In Progress</option>
                      <option value="Resolved" className="bg-slate-900 text-emerald-400 font-extrabold">Resolved</option>
                    </select>
                    <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Detail Inspection Panel */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl h-fit">
          {selectedIssue ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Ticket Inspector</span>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Status Change Toolbar */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Set SLA Status</span>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-950/40 border border-slate-800/60 p-1.5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedIssue.id, 'Pending')}
                    className={`px-1 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition cursor-pointer text-center ${
                      selectedIssue.status === 'Pending'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedIssue.id, 'In Progress')}
                    className={`px-1 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition cursor-pointer text-center ${
                      selectedIssue.status === 'In Progress'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedIssue.id, 'Resolved')}
                    className={`px-1 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition cursor-pointer text-center ${
                      selectedIssue.status === 'Resolved'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Resolved
                  </button>
                </div>
              </div>

              {/* Ticket full content */}
              <div className="space-y-3 bg-slate-950/20 border border-slate-800/40 p-4.5 rounded-2xl">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ticket Category & ID</div>
                  <div className="text-xs text-sky-400 font-mono font-bold mt-0.5">{selectedIssue.category} • {selectedIssue.id}</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Title</div>
                  <div className="text-xs font-black text-slate-100 mt-0.5">{selectedIssue.title}</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Description</div>
                  <div className="text-xs text-slate-300 mt-1.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800/40 leading-relaxed font-sans">{selectedIssue.description}</div>
                </div>

                <div className="flex justify-between text-xs pt-1 border-t border-slate-800/40">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Applicant Employee:</span>
                  <span className="text-slate-300 font-bold">{selectedIssue.employeeName}</span>
                </div>
              </div>

              {/* Response follow up form */}
              <form onSubmit={handleSaveNotes} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Administrator Response / Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Type diagnostic notes, HR responses, or action milestones here..."
                    value={tempAdminNotes}
                    onChange={(e) => setTempAdminNotes(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-700/50 focus:border-sky-400 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none placeholder-slate-500"
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this helpdesk ticket?')) {
                        onDeleteIssue(selectedIssue.id);
                        setSelectedIssue(null);
                      }
                    }}
                    className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Scrub Ticket</span>
                  </button>
                  <button
                    id="btn-save-issue-notes"
                    type="submit"
                    className="flex-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black py-2 rounded-xl text-xs active:scale-95 transition cursor-pointer text-center"
                  >
                    Log Response Notes
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="text-center py-24 space-y-3.5 text-slate-500">
              <ShieldAlert className="h-10 w-10 text-slate-600 mx-auto animate-pulse" />
              <div>
                <h4 className="text-xs font-extrabold text-slate-400">Inspector Panel Idle</h4>
                <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] mx-auto">Select any employee assistance ticket from the list to audit logs or log resolution comments.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      ) : (
        /* Equipment Allocation Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Main List Column */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl flex flex-col">
            {/* Header Controls */}
            <div className="p-6 border-b border-slate-800/80 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-200">Company Property & Equipment Directory</h3>
                  <p className="text-xs text-slate-400 mt-1">Track corporate laptops, monitors, mobile devices, and ergonomic tools assigned to personnel.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEqForEdit(null);
                    setEqEmployeeId('');
                    setEqItemName('');
                    setEqSerialNumber('');
                    setEqType('Laptop');
                    setEqCondition('New');
                    setEqNotes('');
                    setEqStatus('Assigned');
                    setShowEquipmentModal(true);
                  }}
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black px-4.5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Plus className="h-4 w-4" />
                  <span>Allocate Equipment</span>
                </button>
              </div>

              {/* Filter Toolbars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1.5">
                {/* Search */}
                <div className="relative sm:col-span-1">
                  <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search equipment or personnel..."
                    value={eqSearchQuery}
                    onChange={(e) => setEqSearchQuery(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-700/50 text-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-teal-400 placeholder-slate-500 transition-all"
                  />
                </div>

                {/* Type selector */}
                <div className="relative">
                  <select
                    value={eqFilterType}
                    onChange={(e) => setEqFilterType(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-700/50 text-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="All">All Types</option>
                    <option value="Laptop">Laptops</option>
                    <option value="Monitor">Monitors</option>
                    <option value="Keyboard/Mouse">Keyboards & Mice</option>
                    <option value="Headset">Headsets</option>
                    <option value="Mobile Device">Mobile Devices</option>
                    <option value="Ergonomic Desk/Chair">Ergonomic furniture</option>
                    <option value="Charger/Power Adapter">Chargers & Adapters</option>
                    <option value="Accessory">Accessories</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Condition selector */}
                <div className="relative">
                  <select
                    value={eqFilterCondition}
                    onChange={(e) => setEqFilterCondition(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-700/50 text-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="All">All Conditions</option>
                    <option value="New">New</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
              </div>
            </div>

            {/* List Content */}
            <div className="p-6 divide-y divide-slate-800/50 space-y-4 max-h-[600px] overflow-y-auto">
              {equipment.filter(eq => {
                const matchesSearch = 
                  eq.itemName.toLowerCase().includes(eqSearchQuery.toLowerCase()) ||
                  eq.serialNumber.toLowerCase().includes(eqSearchQuery.toLowerCase()) ||
                  eq.employeeName.toLowerCase().includes(eqSearchQuery.toLowerCase());
                const matchesType = eqFilterType === 'All' || eq.type === eqFilterType;
                const matchesCondition = eqFilterCondition === 'All' || eq.condition === eqFilterCondition;
                return matchesSearch && matchesType && matchesCondition;
              }).length === 0 ? (
                <div className="text-center py-16 text-slate-500 space-y-3">
                  <Package className="w-10 h-10 mx-auto text-slate-600 animate-bounce" />
                  <p className="text-xs italic">No matching equipment or assets found in records.</p>
                </div>
              ) : (
                equipment
                  .filter(eq => {
                    const matchesSearch = 
                      eq.itemName.toLowerCase().includes(eqSearchQuery.toLowerCase()) ||
                      eq.serialNumber.toLowerCase().includes(eqSearchQuery.toLowerCase()) ||
                      eq.employeeName.toLowerCase().includes(eqSearchQuery.toLowerCase());
                    const matchesType = eqFilterType === 'All' || eq.type === eqFilterType;
                    const matchesCondition = eqFilterCondition === 'All' || eq.condition === eqFilterCondition;
                    return matchesSearch && matchesType && matchesCondition;
                  })
                  .map(eq => (
                    <div key={eq.id} className="pt-4 first:pt-0 flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          {eq.type === 'Laptop' ? (
                            <Laptop className="w-4 h-4 text-sky-400 shrink-0" />
                          ) : eq.type === 'Monitor' ? (
                            <Tv className="w-4 h-4 text-teal-400 shrink-0" />
                          ) : eq.type === 'Charger/Power Adapter' ? (
                            <Plug className="w-4 h-4 text-amber-400 shrink-0" />
                          ) : eq.type === 'Keyboard/Mouse' || eq.type === 'Headset' ? (
                            <Wrench className="w-4 h-4 text-indigo-400 shrink-0" />
                          ) : (
                            <Package className="w-4 h-4 text-purple-400 shrink-0" />
                          )}
                          <h4 className="text-sm font-bold text-slate-200">{eq.itemName}</h4>
                        </div>
                        <p className="text-xs text-slate-400">
                          Assigned to: <span className="text-teal-400 font-bold">{eq.employeeName}</span>
                        </p>
                        <div className="text-[11px] text-slate-500 font-mono flex flex-wrap gap-x-3 gap-y-0.5">
                          <span>Serial: <span className="text-slate-300">{eq.serialNumber}</span></span>
                          <span>•</span>
                          <span>Assigned On: <span className="text-slate-300">{eq.assignedDate}</span></span>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-lg">
                            {eq.type}
                          </span>
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg ${
                            eq.condition === 'New' || eq.condition === 'Excellent'
                              ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/10'
                              : eq.condition === 'Good'
                              ? 'text-sky-400 bg-sky-500/10 border border-sky-500/10'
                              : 'text-amber-400 bg-amber-500/10 border border-amber-500/10'
                          }`}>
                            Condition: {eq.condition}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold bg-slate-850 px-2 py-0.5 rounded-lg">
                            Status: {eq.status}
                          </span>
                        </div>
                        {eq.notes && (
                          <p className="text-xs text-slate-400 italic bg-slate-950/20 border border-slate-800/40 p-2 rounded-lg mt-1">
                            "{eq.notes}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditEquipment(eq)}
                          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition cursor-pointer hover:scale-105 active:scale-95"
                          title="Edit Assignment details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteEquipment(eq.id)}
                          className="p-1.5 hover:bg-rose-500/10 rounded-lg text-slate-500 hover:text-rose-400 transition cursor-pointer hover:scale-105 active:scale-95"
                          title="Deassign & Return Asset"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Side Info / Asset Allocation Stats */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-md font-extrabold text-slate-200">Asset Audits & SLA Metrics</h3>
              <p className="text-xs text-slate-400 mt-1">Global corporate property overview and allocation statistics.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Total Allocated</span>
                <span className="text-xl font-mono font-black text-slate-100 block mt-1">
                  {equipment.length}
                </span>
              </div>
              <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Laptops Active</span>
                <span className="text-xl font-mono font-black text-sky-400 block mt-1">
                  {equipment.filter(eq => eq.type === 'Laptop').length}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block border-b border-slate-800 pb-1.5">Condition Distribution</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Pristine / New / Excellent</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {equipment.filter(eq => eq.condition === 'New' || eq.condition === 'Excellent').length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Good condition</span>
                  <span className="font-mono font-bold text-sky-400">
                    {equipment.filter(eq => eq.condition === 'Good').length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Fair / Needs check</span>
                  <span className="font-mono font-bold text-amber-400">
                    {equipment.filter(eq => eq.condition === 'Fair').length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Damaged / Repair queue</span>
                  <span className="font-mono font-bold text-rose-400">
                    {equipment.filter(eq => eq.condition === 'Damaged').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Allotment Guide */}
            <div className="bg-slate-950/45 border border-slate-800/80 rounded-2xl p-4.5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-teal-400" />
                  <span>How to Allot Property</span>
                </h4>
                <span className="text-[9px] font-extrabold text-teal-400 bg-teal-500/10 border border-teal-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Quick Guide
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Learn how corporate assets are distributed and assigned to employees across our active directory.
              </p>

              {/* Step Tabs */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800/50">
                {[
                  { label: 'Direct Form', desc: 'Direct allocation form' },
                  { label: 'Profile Way', desc: 'Pre-filled employee profile' },
                  { label: 'Support Way', desc: 'Ticket resolutions' }
                ].map((step, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveGuideStep(idx)}
                    className={`flex-1 text-center py-1.5 px-2 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      activeGuideStep === idx
                        ? 'bg-teal-500 text-slate-950 font-black shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    {step.label}
                  </button>
                ))}
              </div>

              {/* Step Content */}
              <div className="bg-slate-900/40 border border-slate-850 p-3.5 rounded-xl space-y-3 min-h-[140px] flex flex-col justify-between">
                {activeGuideStep === 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2">
                      <span className="bg-teal-500/20 text-teal-400 w-5 h-5 rounded-full flex items-center justify-center font-mono font-black text-[11px] shrink-0 mt-0.5">1</span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Use the <strong className="text-teal-400 font-bold">"Allocate Equipment"</strong> wizard at the top of this directory to quickly assign an asset to any active company employee in one consolidated workflow.
                      </p>
                    </div>
                    <div className="pt-1.5 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEqForEdit(null);
                          setEqEmployeeId('');
                          setEqItemName('');
                          setEqSerialNumber('');
                          setEqType('Laptop');
                          setEqCondition('New');
                          setEqNotes('');
                          setEqStatus('Assigned');
                          setShowEquipmentModal(true);
                        }}
                        className="bg-teal-500/10 hover:bg-teal-500/25 text-teal-400 border border-teal-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wide uppercase transition active:scale-95 cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Launch Form Wizard</span>
                      </button>
                    </div>
                  </div>
                )}

                {activeGuideStep === 1 && (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="bg-teal-500/20 text-teal-400 w-5 h-5 rounded-full flex items-center justify-center font-mono font-black text-[11px] shrink-0 mt-0.5">2</span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Switch to the <strong className="text-teal-400 font-bold">Employees</strong> tab. Select an employee to trigger the detailed side drawer profile, scroll to the <strong className="text-slate-200">Company Property & Equipment</strong> card and click <strong className="text-slate-200">"Allocate Asset"</strong>. This pre-fills the assignment for that individual.
                      </p>
                    </div>
                    <div className="text-[10px] text-slate-500 italic font-medium pt-1">
                      💡 Tip: Great for onboarding new hires with structured computer equipment bundles.
                    </div>
                  </div>
                )}

                {activeGuideStep === 2 && (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="bg-teal-500/20 text-teal-400 w-5 h-5 rounded-full flex items-center justify-center font-mono font-black text-[11px] shrink-0 mt-0.5">3</span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        When employees submit hardware support requests (e.g. *need a laptop replacement* or *broken keyboard*), you can allot the item here, note down the new serial number, and update the original IT support ticket details in the <strong className="text-sky-400">Support Tickets</strong> section.
                      </p>
                    </div>
                    <div className="text-[10px] text-slate-500 italic font-medium pt-1">
                      💡 Tip: Use the search bar to locate specific item allocations and track down serial numbers quickly.
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 bg-teal-500/5 border border-teal-500/10 p-4.5 rounded-2xl">
              <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Asset Stewardship</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Assigned corporate assets and property remain property of the corporation. Damaged or faulty devices should have a support ticket logged in the first tab to initiate the maintenance cycle.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Allocation / Equipment Assignment Modal */}
      {showEquipmentModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#1e293b] border border-slate-700 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-700/60 flex items-center justify-between sticky top-0 bg-[#1e293b] z-10">
              <div className="flex items-center gap-2.5">
                <div className="bg-teal-500/10 p-2 rounded-xl border border-teal-500/20 text-teal-400">
                  <Laptop className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-md font-extrabold text-slate-100">
                    {selectedEqForEdit ? 'Edit Equipment Assignment' : 'Allocate Equipment / Asset'}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Assign corporate assets or assistive tools to personnel.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEquipmentModal(false)}
                className="p-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Content Form */}
            <form onSubmit={handleSubmitEquipment} className="p-6 space-y-4">
              
              {/* Employee selecting */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Employee</label>
                <select
                  required
                  value={eqEmployeeId}
                  onChange={(e) => setEqEmployeeId(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="" disabled>Select personnel...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.department} - {emp.role})</option>
                  ))}
                </select>
              </div>

              {/* Item Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Asset / Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dell Latitude 7440, LG UltraFine 4K"
                  value={eqItemName}
                  onChange={(e) => setEqItemName(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                />
              </div>

              {/* Serial Number */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Serial Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DELL-7894-S"
                  value={eqSerialNumber}
                  onChange={(e) => setEqSerialNumber(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                />
              </div>

              {/* Type & Condition */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Type</label>
                  <select
                    value={eqType}
                    onChange={(e) => setEqType(e.target.value as any)}
                    className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="Laptop">Laptop</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Keyboard/Mouse">Keyboard/Mouse</option>
                    <option value="Headset">Headset</option>
                    <option value="Mobile Device">Mobile Device</option>
                    <option value="Ergonomic Desk/Chair">Ergonomic Desk/Chair</option>
                    <option value="Charger/Power Adapter">Charger/Power Adapter</option>
                    <option value="Accessory">Accessory</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Condition</label>
                  <select
                    value={eqCondition}
                    onChange={(e) => setEqCondition(e.target.value as any)}
                    className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="New">New</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
              </div>

              {/* Status & Allocation Notes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</label>
                  <select
                    value={eqStatus}
                    onChange={(e) => setEqStatus(e.target.value as any)}
                    className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="Assigned">Assigned</option>
                    <option value="Under Repair">Under Repair</option>
                    <option value="Returned">Returned</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Allocation Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. customized screen layout"
                    value={eqNotes}
                    onChange={(e) => setEqNotes(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center gap-3.5 border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setShowEquipmentModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold py-2.5 rounded-xl text-xs active:scale-95 transition cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black py-2.5 rounded-xl text-xs active:scale-95 transition cursor-pointer text-center"
                >
                  {selectedEqForEdit ? 'Save Changes' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logging Support Issue Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1e293b] border border-slate-700 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-700/60 flex items-center justify-between sticky top-0 bg-[#1e293b] z-10">
              <div className="flex items-center gap-2.5">
                <div className="bg-sky-500/10 p-2 rounded-xl border border-sky-500/20 text-sky-400">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-md font-extrabold text-slate-100">Log Helpdesk Ticket</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">SLA-bound workflow for workspace, HR, or IT queries.</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Content Form */}
            <form onSubmit={handleSubmitIssue} className="p-6 space-y-4">
              
              {/* Employee reporting */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reporting Employee</label>
                <select
                  id="iss-form-employee"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700/50 focus:border-sky-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="" disabled>Select employee...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.department} - {emp.role})</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Issue Summary / Title</label>
                <input
                  id="iss-form-title"
                  type="text"
                  required
                  placeholder="e.g. Broken monitor stand, Payroll calculation error"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700/50 focus:border-sky-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                />
              </div>

              {/* Category & Severity Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category</label>
                  <select
                    id="iss-form-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as AssistsIssue['category'])}
                    className="w-full bg-slate-850 border border-slate-700/50 focus:border-sky-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all cursor-pointer"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Severity */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SLA Severity</label>
                  <select
                    id="iss-form-severity"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as AssistsIssue['severity'])}
                    className="w-full bg-slate-850 border border-slate-700/50 focus:border-sky-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Detailed Statement</label>
                <textarea
                  id="iss-form-desc"
                  required
                  rows={4}
                  placeholder="Elaborate details about the ticket, symptoms of IT failures, or specific HR queries..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700/50 focus:border-sky-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all placeholder-slate-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-700/60 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs border border-slate-700/50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-issue-submit"
                  type="submit"
                  className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-black px-4.5 py-2.5 rounded-xl text-xs shadow-lg shadow-sky-500/15 cursor-pointer"
                >
                  Log Ticket
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </div>
  );
}

// Inline fallback for Lucide icon
function Trash2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}
