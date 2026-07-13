/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Users, 
  KeyRound, 
  Mail, 
  Plus, 
  Search, 
  Trash2, 
  Lock, 
  Briefcase, 
  CheckCircle, 
  AlertCircle,
  Database,
  Terminal,
  Activity,
  ArrowRight,
  ShieldAlert,
  UserCheck,
  Phone,
  DollarSign,
  UserCheck2,
  LockOpen,
  Edit2
} from 'lucide-react';
import { Candidate, Employee } from '../types';
import { dbGetCollection, dbSaveItem, dbDeleteItem } from '../firebase';

interface AdminAccount {
  name: string;
  email: string;
  password?: string;
  isPrimary?: boolean;
}

interface CandidateAccount {
  candidateId: string;
  candidateName: string;
  email: string;
  password?: string;
  grantedAt: string;
}

interface AdminManageViewProps {
  candidates: Candidate[];
  employees: Employee[];
  onAddEmployee: (
    newEmp: Omit<Employee, 'id'>,
    initialEquipment?: any
  ) => void;
  onEditEmployee: (modifiedEmp: Employee) => void;
  currentAdminEmail: string;
  onTriggerToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  onLogActivity: (type: any, action: string, details: string) => void;
}

export default function AdminManageView({
  candidates,
  employees,
  onAddEmployee,
  onEditEmployee,
  currentAdminEmail,
  onTriggerToast,
  onLogActivity
}: AdminManageViewProps) {
  // Navigation tabs within control panel
  const [activeSubTab, setActiveSubTab] = useState<'admins' | 'employees' | 'candidates'>('admins');

  // Admin section states
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [adminSearch, setAdminSearch] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');

  // Employee portal states
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [newEmpDept, setNewEmpDept] = useState('Engineering');
  const [newEmpRole, setNewEmpRole] = useState('Software Engineer');
  const [newEmpSalary, setNewEmpSalary] = useState('65000');
  const [newEmpPassword, setNewEmpPassword] = useState('');
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
  const [editingEmpPassword, setEditingEmpPassword] = useState('');

  // Candidate gateway states
  const [candidateAccounts, setCandidateAccounts] = useState<CandidateAccount[]>([]);
  const [candidateSearch, setCandidateSearch] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [candidatePortalPassword, setCandidatePortalPassword] = useState('');
  const [isProvisioning, setIsProvisioning] = useState(false);

  // Terminal Console Logs
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] [SYSTEM] Access control subsystem connected.`,
    `[${new Date().toLocaleTimeString()}] [AUTH] Synced with crm_registered_admins collection.`
  ]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 15));
  };

  // Fetch admin and candidate credential profiles
  useEffect(() => {
    const loadAccessData = async () => {
      try {
        // Load Admins
        const dbAdmins = await dbGetCollection<AdminAccount>('crm_registered_admins');
        const primaryAdmin: AdminAccount = {
          name: 'Primary Admin',
          email: 'admin@crm.com',
          isPrimary: true
        };
        const allAdmins = [primaryAdmin, ...dbAdmins.filter(a => a.email !== 'admin@crm.com')];
        setAdmins(allAdmins);

        // Load Candidate Portals
        const dbCandAccounts = await dbGetCollection<CandidateAccount>('crm_candidate_accounts');
        setCandidateAccounts(dbCandAccounts);
        addLog(`Successfully parsed ${allAdmins.length} administrators & ${dbCandAccounts.length} candidate portal logins.`);
      } catch (err) {
        console.error('Error loading credentials datastore:', err);
        addLog(`[ERROR] Security handshake timed out during schema load.`);
      }
    };
    loadAccessData();
  }, []);

  // Handle adding a sub-administrator
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newAdminEmail.trim().toLowerCase();
    const name = newAdminName.trim();
    const password = newAdminPassword.trim();

    if (!name || !email || !password) {
      onTriggerToast('All administrator fields are strictly required.', 'error');
      return;
    }

    if (admins.some(a => a.email === email) || email === 'admin@crm.com') {
      onTriggerToast('An administrator with this email is already registered.', 'error');
      return;
    }

    const newAdmin: AdminAccount = { name, email, password };

    try {
      await dbSaveItem('crm_registered_admins', email, newAdmin);
      setAdmins(prev => [...prev, newAdmin]);
      setIsAddingAdmin(false);
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPassword('');
      
      onTriggerToast(`Admin account created for ${name}!`, 'success');
      onLogActivity('payroll', 'Admin Sub-account Spawned', `Privileges granted to ${name} (${email})`);
      addLog(`[SUCCESS] Registered administrator: ${name} (${email}). Encryption active.`);
    } catch (err) {
      onTriggerToast('Failed to write credentials to local persistent datastore.', 'error');
      addLog(`[DB-FAIL] Write aborted for sub-admin: ${email}.`);
    }
  };

  // Revoke administrator privileges
  const handleRevokeAdmin = async (email: string) => {
    if (email === 'admin@crm.com') {
      onTriggerToast('Primary Administrator access cannot be revoked.', 'error');
      return;
    }

    try {
      await dbDeleteItem('crm_registered_admins', email);
      setAdmins(prev => prev.filter(a => a.email !== email));
      onTriggerToast('Administrator credentials revoked successfully.', 'info');
      onLogActivity('payroll', 'Admin Account Revoked', `Privileged access removed for ${email}`);
      addLog(`[REVOKE] Revoked all administrative permissions for ${email}.`);
    } catch (err) {
      onTriggerToast('Failed to delete security credential from database.', 'error');
    }
  };

  // Create new Employee directly from Access Control with custom portal password
  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newEmpName.trim();
    const email = newEmpEmail.trim().toLowerCase();
    const phone = newEmpPhone.trim();
    const password = newEmpPassword.trim() || '123456';

    if (!name || !email || !phone) {
      onTriggerToast('Employee name, email, and phone fields are required.', 'error');
      return;
    }

    if (employees.some(emp => emp.email.toLowerCase() === email)) {
      onTriggerToast('An employee with this email is already registered.', 'error');
      return;
    }

    // Call state update in parent App.tsx which handles saving to db and mappings
    onAddEmployee({
      name,
      email,
      phone,
      department: newEmpDept,
      role: newEmpRole,
      salary: Number(newEmpSalary) || 50000,
      status: 'Active',
      joiningDate: new Date().toISOString().split('T')[0],
      password
    });

    setIsAddingEmployee(false);
    setNewEmpName('');
    setNewEmpEmail('');
    setNewEmpPhone('');
    setNewEmpDept('Engineering');
    setNewEmpRole('Software Engineer');
    setNewEmpSalary('65000');
    setNewEmpPassword('');

    onTriggerToast(`Registered and granted portal access to ${name}!`, 'success');
    addLog(`[SUCCESS] Created new employee ${name} with password "${password}".`);
  };

  // Save updated password for existing employee to grant / modify access keys
  const handleSaveEmployeePassword = (emp: Employee) => {
    const password = editingEmpPassword.trim();
    if (!password) {
      onTriggerToast('Please enter a valid password key.', 'error');
      return;
    }

    const modified: Employee = {
      ...emp,
      password
    };
    onEditEmployee(modified);
    setEditingEmpId(null);
    setEditingEmpPassword('');
    onTriggerToast(`Portal login updated for ${emp.name}.`, 'success');
    addLog(`[PASSWORD] Set login password to "${password}" for employee ${emp.name}.`);
  };

  // Revoke employee portal access (set password to empty string)
  const handleRevokeEmployeeAccess = (emp: Employee) => {
    const modified: Employee = {
      ...emp,
      password: ''
    };
    onEditEmployee(modified);
    onTriggerToast(`Portal access revoked for ${emp.name}.`, 'warning');
    addLog(`[REVOKE] Terminated Employee Portal access keys for ${emp.name} (${emp.email}).`);
  };

  // Provision access for candidate
  const handleProvisionCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidateId) {
      onTriggerToast('Please select a target candidate from the recruitment list.', 'error');
      return;
    }
    if (!candidatePortalPassword.trim()) {
      onTriggerToast('Please enter a secure password for the candidate account.', 'error');
      return;
    }

    const matchedCand = candidates.find(c => c.id === selectedCandidateId);
    if (!matchedCand) {
      onTriggerToast('Candidate profile could not be verified.', 'error');
      return;
    }

    const candEmail = matchedCand.email || `${matchedCand.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@crm-candidate.com`;
    
    // Create candidate credentials
    const newAccount: CandidateAccount = {
      candidateId: matchedCand.id,
      candidateName: matchedCand.name,
      email: candEmail.toLowerCase(),
      password: candidatePortalPassword.trim(),
      grantedAt: new Date().toISOString().split('T')[0]
    };

    try {
      await dbSaveItem('crm_candidate_accounts', candEmail.toLowerCase(), newAccount);
      
      // Update local candidate record to verify email is stored
      if (!matchedCand.email) {
        matchedCand.email = candEmail;
      }

      setCandidateAccounts(prev => {
        const filtered = prev.filter(acc => acc.candidateId !== selectedCandidateId);
        return [...filtered, newAccount];
      });

      setIsProvisioning(false);
      setSelectedCandidateId('');
      setCandidatePortalPassword('');

      onTriggerToast(`Portal login granted for candidate ${matchedCand.name}!`, 'success');
      onLogActivity('candidate', 'Candidate Portal Configured', `Login access granted to ${matchedCand.name} (${candEmail})`);
      addLog(`[PROVISION] Candidate ${matchedCand.name} assigned portal access keys. Email: ${candEmail}.`);
    } catch (err) {
      onTriggerToast('Failed to record portal permissions.', 'error');
      addLog(`[DB-FAIL] Portal mapping failed for ${candEmail}.`);
    }
  };

  // Revoke candidate access
  const handleRevokeCandidate = async (candidateId: string, email: string) => {
    try {
      await dbDeleteItem('crm_candidate_accounts', email.toLowerCase());
      setCandidateAccounts(prev => prev.filter(acc => acc.candidateId !== candidateId));
      onTriggerToast('Candidate portal workspace access terminated.', 'info');
      onLogActivity('candidate', 'Candidate Portal Revoked', `Login access disabled for ${email}`);
      addLog(`[TERMINATED] Terminated workspace access keys for candidate login: ${email}.`);
    } catch (err) {
      onTriggerToast('Could not delete credentials from cache.', 'error');
    }
  };

  // Auto-generate safe passwords
  const handleGeneratePassword = (type: 'admin' | 'employee' | 'candidate') => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (type === 'admin') {
      setNewAdminPassword(pass);
    } else if (type === 'employee') {
      setNewEmpPassword(pass);
    } else {
      setCandidatePortalPassword(pass);
    }
    onTriggerToast('Random security password key generated!', 'info');
  };

  // Filter lists based on searches
  const filteredAdmins = admins.filter(a => 
    a.name.toLowerCase().includes(adminSearch.toLowerCase()) || 
    a.email.toLowerCase().includes(adminSearch.toLowerCase())
  );

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.email.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    (emp.department && emp.department.toLowerCase().includes(employeeSearch.toLowerCase()))
  );

  const filteredCandidatePortals = candidateAccounts.filter(c => 
    c.candidateName.toLowerCase().includes(candidateSearch.toLowerCase()) || 
    c.email.toLowerCase().includes(candidateSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in" id="access-control-container">
      {/* Intro Header */}
      <div className="bg-[#0e1629] border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl" id="access-header">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-sky-500 via-indigo-500 to-purple-500" />
        <div className="flex items-center gap-4">
          <div className="bg-sky-500/10 text-sky-400 p-3 rounded-xl border border-sky-500/20">
            <ShieldCheck className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-100 uppercase tracking-wider">Unified Access Control</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Provision administrative authorization, manage secure credentials for active corporate employees, and establish sandbox portal workspaces for job candidates.
            </p>
          </div>
        </div>
      </div>

      {/* Main Tab Controls */}
      <div className="flex bg-slate-950/40 p-1 border border-slate-800/80 rounded-2xl max-w-xl" id="access-subtabs">
        <button
          type="button"
          id="tab-admins"
          onClick={() => setActiveSubTab('admins')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'admins'
              ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Admin Portal</span>
        </button>
        <button
          type="button"
          id="tab-employees"
          onClick={() => setActiveSubTab('employees')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'employees'
              ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Employee Portal</span>
        </button>
        <button
          type="button"
          id="tab-candidates"
          onClick={() => setActiveSubTab('candidates')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'candidates'
              ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Candidate Workspaces</span>
        </button>
      </div>

      {/* Grid: Main Controls & Terminal Logs */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Management Panels */}
        <div className="xl:col-span-8 space-y-6">
          
          {activeSubTab === 'admins' && (
            /* System Administrators Section */
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-5" id="pane-admins">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4.5 h-4.5 text-sky-400" />
                    <span>Administrator Directory ({admins.length})</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Sub-admins share organizational metrics and enjoy complete administrative control.</p>
                </div>

                <button
                  type="button"
                  id="btn-spawn-admin"
                  onClick={() => setIsAddingAdmin(!isAddingAdmin)}
                  className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-sky-500/15 cursor-pointer active:scale-95 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isAddingAdmin ? 'Close Form' : 'Register Sub-Admin'}</span>
                </button>
              </div>

              {/* Spawn Admin Form */}
              {isAddingAdmin && (
                <form onSubmit={handleCreateAdmin} className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4 animate-scale-up" id="form-add-admin">
                  <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-indigo-400" />
                    <span>Provision Sub-Administrator Identity</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Full Legal Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Marcus Vance"
                        value={newAdminName}
                        onChange={(e) => setNewAdminName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none placeholder-slate-600 transition"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Corporate Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-600" />
                        <input
                          type="email"
                          required
                          placeholder="e.g. marcus@company.com"
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-slate-200 focus:outline-none placeholder-slate-600 transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Security Authentication Password</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-600" />
                        <input
                          type="text"
                          required
                          placeholder="Assign security key or generate..."
                          value={newAdminPassword}
                          onChange={(e) => setNewAdminPassword(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-slate-200 focus:outline-none placeholder-slate-600 transition font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleGeneratePassword('admin')}
                        className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs transition cursor-pointer active:scale-95"
                      >
                        Generate Safe Key
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingAdmin(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-lg text-xs uppercase tracking-wide transition active:scale-95 cursor-pointer"
                    >
                      Establish Identity
                    </button>
                  </div>
                </form>
              )}

              {/* Admin Search bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter admin accounts by email or name..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 rounded-xl pl-11 pr-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                />
              </div>

              {/* Admin Table */}
              <div className="overflow-x-auto border border-slate-800/60 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/50 text-slate-400 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-4">Administrator Profile</th>
                      <th className="px-5 py-4">Scoped Email</th>
                      <th className="px-5 py-4">Security Level</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {filteredAdmins.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-slate-500 italic">No administrative accounts found matching search parameters.</td>
                      </tr>
                    ) : (
                      filteredAdmins.map((adm) => (
                        <tr key={adm.email} className="hover:bg-slate-800/10 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-400/20 to-indigo-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                                {adm.name.substring(0, 2).toUpperCase()}
                              </div>
                              <span className="font-bold text-slate-200">{adm.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-slate-400 select-all">{adm.email}</td>
                          <td className="px-5 py-3.5">
                            {adm.isPrimary ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                Master Key (Primary)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                Co-Administrator
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            {!adm.isPrimary ? (
                              <button
                                type="button"
                                onClick={() => handleRevokeAdmin(adm.email)}
                                className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition active:scale-95 cursor-pointer"
                                title="Revoke Admin Access"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-600 font-mono">Protected</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSubTab === 'employees' && (
            /* Employee Portals Section */
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-5" id="pane-employees">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <UserCheck className="w-4.5 h-4.5 text-indigo-400" />
                    <span>Employee Portal Management ({employees.length})</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Assign, modify, or terminate portal access passwords for your employee roster, or provision new entries.
                  </p>
                </div>

                <button
                  type="button"
                  id="btn-register-employee"
                  onClick={() => setIsAddingEmployee(!isAddingEmployee)}
                  className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-indigo-500 hover:bg-indigo-400 text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/15 cursor-pointer active:scale-95 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isAddingEmployee ? 'Close Form' : 'Register New Employee'}</span>
                </button>
              </div>

              {/* Add Employee with Password Form */}
              {isAddingEmployee && (
                <form onSubmit={handleCreateEmployee} className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4 animate-scale-up" id="form-add-employee">
                  <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-indigo-400" />
                    <span>Provision Employee Profile & Portal Credentials</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Elena Rostova"
                        value={newEmpName}
                        onChange={(e) => setNewEmpName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none placeholder-slate-600 transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Corporate Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-600" />
                        <input
                          type="email"
                          required
                          placeholder="e.g. elena@company.com"
                          value={newEmpEmail}
                          onChange={(e) => setNewEmpEmail(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-slate-200 focus:outline-none placeholder-slate-600 transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-600" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. +1 (555) 019-2834"
                          value={newEmpPhone}
                          onChange={(e) => setNewEmpPhone(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-slate-200 focus:outline-none placeholder-slate-600 transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Department</label>
                      <select
                        value={newEmpDept}
                        onChange={(e) => setNewEmpDept(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition"
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Sales">Sales</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Finance">Finance</option>
                        <option value="HR & Admin">HR & Admin</option>
                        <option value="Support">Support</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Job Role Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Senior Frontend Engineer"
                        value={newEmpRole}
                        onChange={(e) => setNewEmpRole(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none placeholder-slate-600 transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Annual Base Salary ($)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-600" />
                        <input
                          type="number"
                          required
                          placeholder="e.g. 75000"
                          value={newEmpSalary}
                          onChange={(e) => setNewEmpSalary(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-slate-200 focus:outline-none placeholder-slate-600 transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Portal Password (Required for Employee Portal Access)</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-600" />
                        <input
                          type="text"
                          required
                          placeholder="Assign workspace password..."
                          value={newEmpPassword}
                          onChange={(e) => setNewEmpPassword(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-slate-200 focus:outline-none placeholder-slate-600 transition font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleGeneratePassword('employee')}
                        className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs transition cursor-pointer active:scale-95"
                      >
                        Generate Safe Key
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingEmployee(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-black rounded-lg text-xs uppercase tracking-wide transition active:scale-95 cursor-pointer"
                    >
                      Create & Grant Portal
                    </button>
                  </div>
                </form>
              )}

              {/* Employee search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter employees by name, email, or department..."
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 rounded-xl pl-11 pr-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                />
              </div>

              {/* Employee Portal Access Control Table */}
              <div className="overflow-x-auto border border-slate-800/60 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/50 text-slate-400 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-4">Employee Profile</th>
                      <th className="px-5 py-4">Login Identifier / Phone</th>
                      <th className="px-5 py-4">Portal Key Password</th>
                      <th className="px-5 py-4">Portal Status</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-slate-500 italic">No employees found in the corporate registry.</td>
                      </tr>
                    ) : (
                      filteredEmployees.map((emp) => {
                        const hasPortalAccess = emp.password && emp.password.trim().length > 0;
                        const isCurrentlyEditing = editingEmpId === emp.id;

                        return (
                          <tr key={emp.id} className="hover:bg-slate-800/10 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold text-xs">
                                  {emp.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-200 block">{emp.name}</span>
                                  <span className="text-[10px] text-slate-400 uppercase tracking-widest">{emp.department} • {emp.role}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="font-mono text-slate-300 block select-all">{emp.email}</span>
                              {emp.phone && <span className="text-[10px] text-slate-500 block">{emp.phone}</span>}
                            </td>
                            <td className="px-5 py-3.5 font-mono">
                              {isCurrentlyEditing ? (
                                <div className="flex items-center gap-1.5 max-w-[150px]">
                                  <input
                                    type="text"
                                    value={editingEmpPassword}
                                    onChange={(e) => setEditingEmpPassword(e.target.value)}
                                    className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none w-full"
                                    placeholder="Enter key..."
                                  />
                                </div>
                              ) : hasPortalAccess ? (
                                <span className="bg-slate-950 border border-white/5 px-2 py-1 rounded text-xs text-sky-400 font-extrabold select-all">
                                  {emp.password}
                                </span>
                              ) : (
                                <span className="text-slate-600 italic">None assigned</span>
                              )}
                            </td>
                            <td className="px-5 py-3.5">
                              {hasPortalAccess ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Access Enabled
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-800 text-slate-500 border border-slate-700">
                                  Portal Disabled
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              {isCurrentlyEditing ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEmployeePassword(emp)}
                                    className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded text-[10px] uppercase transition"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingEmpId(null);
                                      setEditingEmpPassword('');
                                    }}
                                    className="px-2 py-1 bg-slate-800 text-slate-400 hover:text-slate-200 font-bold rounded text-[10px] uppercase"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingEmpId(emp.id);
                                      setEditingEmpPassword(emp.password || '');
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                                    title="Edit Portal Password"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  {hasPortalAccess && (
                                    <button
                                      type="button"
                                      onClick={() => handleRevokeEmployeeAccess(emp)}
                                      className="p-1.5 text-amber-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                                      title="Revoke Portal Access"
                                    >
                                      <Lock className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSubTab === 'candidates' && (
            /* Candidate Workspaces Section */
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-5" id="pane-candidates">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="w-4.5 h-4.5 text-sky-400" />
                    <span>Candidate Portals & Credentials ({filteredCandidatePortals.length})</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Empower candidates to securely review status, timeline, schedules, and complete documentation.</p>
                </div>

                <button
                  type="button"
                  id="btn-provision-candidate"
                  onClick={() => setIsProvisioning(!isProvisioning)}
                  className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-sky-500/15 cursor-pointer active:scale-95 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isProvisioning ? 'Close Form' : 'Grant Portal Access'}</span>
                </button>
              </div>

              {/* Provision Candidate Workspace Form */}
              {isProvisioning && (
                <form onSubmit={handleProvisionCandidate} className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4 animate-scale-up" id="form-add-candidate">
                  <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4.5 h-4.5 text-teal-400" />
                    <span>Authorize Candidate Workspace Credentials</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Candidate Dropdown selection */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Select Target Candidate</label>
                      <select
                        required
                        value={selectedCandidateId}
                        onChange={(e) => {
                          setSelectedCandidateId(e.target.value);
                          const matched = candidates.find(c => c.id === e.target.value);
                          if (matched) {
                            // Pre-fill randomized password for comfort
                            const email = matched.email || `${matched.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@crm-candidate.com`;
                            addLog(`Selected candidate: ${matched.name}. Provisional login: ${email}`);
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 text-slate-200 text-xs rounded-lg px-3.5 py-2.5 focus:outline-none transition"
                      >
                        <option value="" disabled>-- Choose Candidate Profile --</option>
                        {candidates.map(c => {
                          const hasAcc = candidateAccounts.some(acc => acc.candidateId === c.id);
                          return (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.status}) {hasAcc ? ' [ALREADY HAS ACCESS]' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Show email status */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Assigned login Email ID</label>
                      <div className="bg-slate-900/40 border border-slate-800/80 px-3.5 py-2.5 rounded-lg text-xs text-slate-400 font-mono truncate">
                        {selectedCandidateId ? (
                          candidates.find(c => c.id === selectedCandidateId)?.email || 
                          `${candidates.find(c => c.id === selectedCandidateId)?.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@crm-candidate.com`
                        ) : (
                          'No candidate selected.'
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Password fields */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Candidate Password Access Key</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-600" />
                        <input
                          type="text"
                          required
                          placeholder="Create or generate secure key..."
                          value={candidatePortalPassword}
                          onChange={(e) => setCandidatePortalPassword(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-slate-200 focus:outline-none placeholder-slate-600 transition font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleGeneratePassword('candidate')}
                        className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs transition cursor-pointer active:scale-95"
                      >
                        Generate Safe Key
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsProvisioning(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-lg text-xs uppercase tracking-wide transition active:scale-95 cursor-pointer"
                    >
                      Grant Workspace Credentials
                    </button>
                  </div>
                </form>
              )}

              {/* Candidate search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter portal accounts by name or email..."
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 rounded-xl pl-11 pr-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                />
              </div>

              {/* Active candidate portals list */}
              <div className="overflow-x-auto border border-slate-800/60 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/50 text-slate-400 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-4">Candidate Profile</th>
                      <th className="px-5 py-4">Granted Access Email</th>
                      <th className="px-5 py-4">Provisioned Date</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {filteredCandidatePortals.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-slate-500 italic">No candidates have active login portals configured. Click "Grant Portal Access" above to spawn credentials.</td>
                      </tr>
                    ) : (
                      filteredCandidatePortals.map((acc) => (
                        <tr key={acc.candidateId} className="hover:bg-slate-800/10 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs">
                                {acc.candidateName.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-slate-200 block">{acc.candidateName}</span>
                                <span className="text-[10px] text-slate-400 font-mono">ID: {acc.candidateId}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-slate-400 select-all">{acc.email}</td>
                          <td className="px-5 py-3.5 text-slate-500 font-mono">{acc.grantedAt}</td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleRevokeCandidate(acc.candidateId, acc.email)}
                              className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition active:scale-95 cursor-pointer"
                              title="Revoke Portal Access"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Terminal Stream Logs & Security Information */}
        <div className="xl:col-span-4 space-y-6">
          {/* Dispatch Terminal logs */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col" id="logs-container">
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] uppercase tracking-widest font-black text-slate-300 font-mono">Access Security Feed</span>
              </div>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38bdf8] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0284c7]"></span>
              </span>
            </div>

            <div className="p-4 font-mono text-[10px] text-teal-400 space-y-2 overflow-y-auto max-h-[300px] bg-slate-950 leading-relaxed shadow-inner">
              {logs.map((log, index) => {
                let color = 'text-slate-400';
                if (log.includes('[SUCCESS]')) color = 'text-emerald-400 font-bold';
                if (log.includes('[PASSWORD]')) color = 'text-indigo-400 font-bold';
                if (log.includes('[PROVISION]')) color = 'text-sky-400 font-bold';
                if (log.includes('[REVOKE]')) color = 'text-amber-400';
                if (log.includes('[ERROR]')) color = 'text-rose-400 font-extrabold';
                if (log.includes('[SYSTEM]')) color = 'text-purple-400';

                return (
                  <div key={index} className={`flex items-start gap-1 ${color}`}>
                    <span className="text-slate-700 select-none font-bold">❯</span>
                    <span>{log}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-3" id="protocol-guidelines">
            <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4.5 h-4.5 text-indigo-400" />
              <span>Security Protocols</span>
            </h4>
            
            <ul className="space-y-2 text-[11px] text-slate-400 leading-relaxed list-none pl-0">
              <li className="flex items-start gap-2">
                <span className="text-sky-400 select-none">✦</span>
                <span><strong>Admin Portal Access:</strong> Enables master authorization across all bookkeeping, HR resources, and system panels.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-400 select-none">✦</span>
                <span><strong>Employee Portal Access:</strong> Assigns workspace logins allowing personnel to view payslips, record attendance, and submit leave requests.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-400 select-none">✦</span>
                <span><strong>Candidate Workspaces:</strong> Coordinates sandbox logins allowing candidates to review status and coordinate interviews.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
