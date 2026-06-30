/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  UserPlus, 
  IndianRupee, 
  CalendarCheck,
  Mail,
  Briefcase,
  Layers,
  X,
  Phone,
  Calendar,
  Shield,
  FileText,
  User,
  Info,
  CheckCircle2,
  Clock,
  Eye,
  AlertCircle,
  Laptop,
  Tv,
  Wrench,
  Package,
  Plug
} from 'lucide-react';
import { Employee, ActiveView, AssistsIssue, EquipmentAssignment } from '../types';

interface EmployeeViewProps {
  employees: Employee[];
  issues: AssistsIssue[];
  equipment?: EquipmentAssignment[];
  onAddIssue: (issue: Omit<AssistsIssue, 'id'>) => void;
  onUpdateIssueStatus: (id: string, status: AssistsIssue['status'], adminNotes?: string, assignedToId?: string) => void;
  onAddEmployee: (emp: Omit<Employee, 'id'>, initialEquipment?: Omit<EquipmentAssignment, 'id' | 'employeeId' | 'employeeName'>) => void;
  onEditEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  onNavigateToView: (view: ActiveView, extraData?: any) => void;
  onAddEquipment: (eq: Omit<EquipmentAssignment, 'id'>) => void;
  onUpdateEquipment: (eq: EquipmentAssignment) => void;
  onDeleteEquipment: (id: string) => void;
  onboardCandidate?: any;
}

export default function EmployeeView({
  employees,
  issues,
  equipment = [],
  onAddIssue,
  onUpdateIssueStatus,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onNavigateToView,
  onAddEquipment,
  onUpdateEquipment,
  onDeleteEquipment,
  onboardCandidate
}: EmployeeViewProps) {
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  
  // Slide-over Detail Drawer State
  const [selectedEmpDetail, setSelectedEmpDetail] = useState<Employee | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [salary, setSalary] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [phone, setPhone] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [status, setStatus] = useState<'Active' | 'On Leave' | 'Terminated'>('Active');
  const [employmentType, setEmploymentType] = useState<'Full-Time' | 'Part-Time' | 'Contract' | 'Intern'>('Full-Time');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [notes, setNotes] = useState('');

  // Local state for Drawer Issue creation
  const [showDrawerIssueForm, setShowDrawerIssueForm] = useState(false);
  const [drawerIssueTitle, setDrawerIssueTitle] = useState('');
  const [drawerIssueCategory, setDrawerIssueCategory] = useState<'IT Support' | 'HR Query' | 'Assets & Equipment' | 'Facilities' | 'Finance'>('IT Support');
  const [drawerIssueSeverity, setDrawerIssueSeverity] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [drawerIssueDescription, setDrawerIssueDescription] = useState('');
  const [drawerIssueAssignedToId, setDrawerIssueAssignedToId] = useState('');

  // Local state for Drawer Equipment Assignment
  const [showDrawerEquipmentForm, setShowDrawerEquipmentForm] = useState(false);
  const [drawerEquipmentName, setDrawerEquipmentName] = useState('');
  const [drawerEquipmentSerialNumber, setDrawerEquipmentSerialNumber] = useState('');
  const [drawerEquipmentType, setDrawerEquipmentType] = useState<EquipmentAssignment['type']>('Laptop');
  const [drawerEquipmentCondition, setDrawerEquipmentCondition] = useState<'New' | 'Excellent' | 'Good' | 'Fair' | 'Damaged'>('New');
  const [drawerEquipmentNotes, setDrawerEquipmentNotes] = useState('');

  // Initial Equipment setup for New Employee Onboarding / Candidate Conversion
  const [isInitialEquipmentEnabled, setIsInitialEquipmentEnabled] = useState(false);
  const [initialEquipmentName, setInitialEquipmentName] = useState('');
  const [initialEquipmentSerialNumber, setInitialEquipmentSerialNumber] = useState('');
  const [initialEquipmentType, setInitialEquipmentType] = useState<EquipmentAssignment['type']>('Laptop');
  const [initialEquipmentCondition, setInitialEquipmentCondition] = useState<'New' | 'Excellent' | 'Good' | 'Fair' | 'Damaged'>('New');
  const [initialEquipmentNotes, setInitialEquipmentNotes] = useState('');

  // Mini form for allocating equipment while modifying existing employee
  const [showModalNewEquipmentForm, setShowModalNewEquipmentForm] = useState(false);
  const [modalNewEquipmentName, setModalNewEquipmentName] = useState('');
  const [modalNewEquipmentSerialNumber, setModalNewEquipmentSerialNumber] = useState('');
  const [modalNewEquipmentType, setModalNewEquipmentType] = useState<EquipmentAssignment['type']>('Laptop');
  const [modalNewEquipmentCondition, setModalNewEquipmentCondition] = useState<'New' | 'Excellent' | 'Good' | 'Fair' | 'Damaged'>('New');
  const [modalNewEquipmentNotes, setModalNewEquipmentNotes] = useState('');

  const handleCreateDrawerEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpDetail) return;
    if (!drawerEquipmentName.trim() || !drawerEquipmentSerialNumber.trim()) {
      alert('Please fill out all equipment fields.');
      return;
    }

    onAddEquipment({
      employeeId: selectedEmpDetail.id,
      employeeName: selectedEmpDetail.name,
      itemName: drawerEquipmentName,
      serialNumber: drawerEquipmentSerialNumber,
      type: drawerEquipmentType,
      condition: drawerEquipmentCondition,
      status: 'Assigned',
      assignedDate: new Date().toISOString().split('T')[0],
      notes: drawerEquipmentNotes.trim() || undefined
    });

    // Reset fields
    setDrawerEquipmentName('');
    setDrawerEquipmentSerialNumber('');
    setDrawerEquipmentType('Laptop');
    setDrawerEquipmentCondition('New');
    setDrawerEquipmentNotes('');
    setShowDrawerEquipmentForm(false);
  };

  // Local state for Standalone Create Issue Modal from Header Controls
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueEmployeeId, setIssueEmployeeId] = useState('');
  const [issueTitle, setIssueTitle] = useState('');
  const [issueCategory, setIssueCategory] = useState<'IT Support' | 'HR Query' | 'Assets & Equipment' | 'Facilities' | 'Finance'>('IT Support');
  const [issueSeverity, setIssueSeverity] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [issueDescription, setIssueDescription] = useState('');
  const [issueAssignedToId, setIssueAssignedToId] = useState('');

  const handleCreateHeaderIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueEmployeeId) {
      alert('Please select an employee.');
      return;
    }
    if (!issueTitle.trim() || !issueDescription.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    const selectedEmp = employees.find(emp => emp.id === issueEmployeeId);
    if (!selectedEmp) return;

    const assignedEmp = employees.find(emp => emp.id === issueAssignedToId);

    onAddIssue({
      title: issueTitle,
      category: issueCategory,
      severity: issueSeverity,
      description: issueDescription,
      employeeId: issueEmployeeId,
      employeeName: selectedEmp.name,
      status: 'Pending',
      dateCreated: new Date().toISOString().split('T')[0],
      adminNotes: '',
      assignedToId: issueAssignedToId || undefined,
      assignedToName: assignedEmp ? assignedEmp.name : undefined
    });

    // Reset fields
    setIssueEmployeeId('');
    setIssueTitle('');
    setIssueCategory('IT Support');
    setIssueSeverity('Medium');
    setIssueDescription('');
    setIssueAssignedToId('');
    setIsIssueModalOpen(false);
  };

  const handleCreateDrawerIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpDetail) return;
    if (!drawerIssueTitle.trim() || !drawerIssueDescription.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    const assignedEmp = employees.find(emp => emp.id === drawerIssueAssignedToId);

    onAddIssue({
      title: drawerIssueTitle,
      category: drawerIssueCategory,
      severity: drawerIssueSeverity,
      description: drawerIssueDescription,
      employeeId: selectedEmpDetail.id,
      employeeName: selectedEmpDetail.name,
      status: 'Pending',
      dateCreated: new Date().toISOString().split('T')[0],
      adminNotes: '',
      assignedToId: drawerIssueAssignedToId || undefined,
      assignedToName: assignedEmp ? assignedEmp.name : undefined
    });

    // Reset fields
    setDrawerIssueTitle('');
    setDrawerIssueCategory('IT Support');
    setDrawerIssueSeverity('Medium');
    setDrawerIssueDescription('');
    setDrawerIssueAssignedToId('');
    setShowDrawerIssueForm(false);
  };

  // Reset form helper
  const resetForm = () => {
    setName('');
    setEmail('');
    setRole('');
    setSalary('');
    setDepartment('Engineering');
    setPhone('');
    setJoiningDate(new Date().toISOString().split('T')[0]);
    setStatus('Active');
    setEmploymentType('Full-Time');
    setEmergencyContact('');
    setNotes('');
    setEditingEmp(null);

    // Reset onboarding property allocation states
    setIsInitialEquipmentEnabled(false);
    setInitialEquipmentName('');
    setInitialEquipmentSerialNumber('');
    setInitialEquipmentType('Laptop');
    setInitialEquipmentCondition('New');
    setInitialEquipmentNotes('');
  };

  // Automated Candidate Onboarding Trigger
  useEffect(() => {
    if (onboardCandidate) {
      resetForm();
      setName(onboardCandidate.name);
      
      // Attempt to guess department or role
      const skillsLower = (onboardCandidate.skills || '').toLowerCase();
      let guessedDept = 'Engineering';
      if (skillsLower.includes('design') || skillsLower.includes('ui') || skillsLower.includes('ux')) {
        guessedDept = 'Design';
      } else if (skillsLower.includes('hr') || skillsLower.includes('recruit') || skillsLower.includes('people')) {
        guessedDept = 'Human Resources';
      } else if (skillsLower.includes('sales') || skillsLower.includes('client') || skillsLower.includes('market')) {
        guessedDept = 'Sales';
      } else if (skillsLower.includes('product') || skillsLower.includes('manage')) {
        guessedDept = 'Product';
      }
      setDepartment(guessedDept);

      const firstSkill = (onboardCandidate.skills || '').split(',')[0] || 'Software';
      setRole(`${firstSkill.trim()} Developer`);
      setSalary('850000'); // Standard onboard template salary
      setNotes(`Onboarded from recruiting pipeline. Experience profile: ${onboardCandidate.experience}. Core expertise: ${onboardCandidate.skills}.`);
      
      // Auto-enable company property assignment with smart defaults
      setIsInitialEquipmentEnabled(true);
      setInitialEquipmentName('Standard Corporate Laptop (M-Series)');
      setInitialEquipmentType('Laptop');
      setInitialEquipmentCondition('New');
      setInitialEquipmentNotes('Allotted automatically during candidate onboarding process.');
      
      // Open the modal
      setIsModalOpen(true);

      // Instantly clear the parent's navigation state so it doesn't re-trigger on subsequent clicks
      onNavigateToView('employees', null);
    }
  }, [onboardCandidate]);

  // Open modal for adding
  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setName(emp.name);
    setEmail(emp.email);
    setRole(emp.role);
    setSalary(emp.salary.toString());
    setDepartment(emp.department);
    setPhone(emp.phone || '');
    setJoiningDate(emp.joiningDate || new Date().toISOString().split('T')[0]);
    setStatus(emp.status || 'Active');
    setEmploymentType(emp.employmentType || 'Full-Time');
    setEmergencyContact(emp.emergencyContact || '');
    setNotes(emp.notes || '');
    setIsModalOpen(true);
  };

  // Handle submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !role.trim() || !salary.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    const numericSalary = parseFloat(salary);
    if (isNaN(numericSalary) || numericSalary <= 0) {
      alert('Please enter a valid salary amount.');
      return;
    }

    const updatedEmployeeData = {
      name,
      email,
      role,
      salary: numericSalary,
      department,
      phone: phone.trim() || '+1 (555) 123-4567',
      joiningDate: joiningDate || new Date().toISOString().split('T')[0],
      status,
      employmentType,
      emergencyContact: emergencyContact.trim() || 'N/A',
      notes: notes.trim() || 'No additional records.'
    };

    if (editingEmp) {
      onEditEmployee({
        id: editingEmp.id,
        ...updatedEmployeeData
      });
      
      // If the currently viewed detail profile is edited, update it live in the detail view
      if (selectedEmpDetail && selectedEmpDetail.id === editingEmp.id) {
        setSelectedEmpDetail({
          id: editingEmp.id,
          ...updatedEmployeeData
        });
      }
    } else {
      let initialEq = undefined;
      if (isInitialEquipmentEnabled && initialEquipmentName.trim()) {
        initialEq = {
          itemName: initialEquipmentName.trim(),
          serialNumber: initialEquipmentSerialNumber.trim() || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
          type: initialEquipmentType,
          status: 'Assigned' as const,
          assignedDate: new Date().toISOString().split('T')[0],
          condition: initialEquipmentCondition,
          notes: initialEquipmentNotes.trim() || undefined
        };
      }
      onAddEmployee(updatedEmployeeData, initialEq);
    }

    setIsModalOpen(false);
    resetForm();
  };

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
    
    // Status filter
    const empStatus = emp.status || 'Active';
    const matchesStatus = selectedStatusFilter === 'All' || empStatus === selectedStatusFilter;
    
    // Employment Type filter
    const empType = emp.employmentType || 'Full-Time';
    const matchesType = selectedTypeFilter === 'All' || empType === selectedTypeFilter;

    return matchesSearch && matchesDept && matchesStatus && matchesType;
  });

  const departments = ['Engineering', 'Design', 'Human Resources', 'Product', 'Sales', 'IT', 'Infrastructure'];
  const statuses = ['Active', 'On Leave', 'Terminated'];
  const employmentTypes = ['Full-Time', 'Part-Time', 'Contract', 'Intern'];

  const getStatusStyle = (statusStr?: string) => {
    switch (statusStr || 'Active') {
      case 'Active':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'On Leave':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Terminated':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getTypeStyle = (typeStr?: string) => {
    switch (typeStr || 'Full-Time') {
      case 'Full-Time':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      case 'Part-Time':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'Contract':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'Intern':
        return 'text-teal-400 bg-teal-500/10 border-teal-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Controls */}
      <div className="flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between bg-slate-900/30 p-5 rounded-2xl border border-slate-800/40">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            id="emp-search-input"
            type="text"
            placeholder="Search by name, email, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/40 border border-slate-700/40 focus:border-teal-400 rounded-xl py-2 px-10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all"
          />
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Department Filter */}
          <div className="flex items-center gap-2 bg-slate-800/40 px-3 py-2 rounded-xl border border-slate-700/40">
            <Filter className="w-3.5 h-3.5 text-teal-400" />
            <select
              id="emp-dept-filter"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer font-medium"
            >
              <option value="All" className="bg-slate-900 text-slate-200">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept} className="bg-slate-900 text-slate-200">{dept}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-slate-800/40 px-3 py-2 rounded-xl border border-slate-700/40">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <select
              id="emp-status-filter"
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer font-medium"
            >
              <option value="All" className="bg-slate-900 text-slate-200">All Statuses</option>
              {statuses.map(st => (
                <option key={st} value={st} className="bg-slate-900 text-slate-200">{st}</option>
              ))}
            </select>
          </div>

          {/* Employment Type Filter */}
          <div className="flex items-center gap-2 bg-slate-800/40 px-3 py-2 rounded-xl border border-slate-700/40">
            <Briefcase className="w-3.5 h-3.5 text-sky-400" />
            <select
              id="emp-type-filter"
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer font-medium"
            >
              <option value="All" className="bg-slate-900 text-slate-200">All Types</option>
              {employmentTypes.map(type => (
                <option key={type} value={type} className="bg-slate-900 text-slate-200">{type}</option>
              ))}
            </select>
          </div>

          <button
            id="btn-add-issue-trigger"
            onClick={() => setIsIssueModalOpen(true)}
            className="bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-400 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Log Property/Assist Issue</span>
          </button>

          <button
            id="btn-add-employee-trigger"
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-teal-500/10 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Employee Grid/Table */}
      <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-900/50 text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">
                <th className="px-6 py-4.5">Employee Info</th>
                <th className="px-6 py-4.5">Department & Role</th>
                <th className="px-6 py-4.5">Company Assets & Issues</th>
                <th className="px-6 py-4.5">Type & Status</th>
                <th className="px-6 py-4.5">Salary (Annual)</th>
                <th className="px-6 py-4.5">Quick Actions</th>
                <th className="px-6 py-4.5 text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <UserPlus className="h-10 w-10 text-slate-600 mb-3" />
                      <p className="font-bold text-sm text-slate-300">No active employees found</p>
                      <p className="text-[11px] text-slate-500 mt-1">Try resetting the search filters or add a new record.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr 
                    key={emp.id}
                    id={`employee-row-${emp.id}`}
                    className="hover:bg-slate-800/20 transition-all duration-200"
                  >
                    {/* Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600/30 flex items-center justify-center font-bold text-slate-200 text-xs shadow-inner">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-slate-200 text-sm">{emp.name}</p>
                          <div className="flex flex-col gap-0.5 mt-0.5 font-mono text-[10px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Mail className="h-2.5 w-2.5 text-slate-500" />
                              {emp.email}
                            </span>
                            {emp.phone && (
                              <span className="flex items-center gap-1 text-slate-400">
                                <Phone className="h-2.5 w-2.5 text-slate-500" />
                                {emp.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department & Role */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-200 text-sm">{emp.role}</p>
                        <span className="inline-block text-[10px] font-bold text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full mt-1 border border-teal-500/10">
                          {emp.department}
                        </span>
                      </div>
                    </td>

                    {/* Company Assets & Issues */}
                    <td className="px-6 py-4 text-xs">
                      {(() => {
                        const empEquipment = (equipment || []).filter(eq => eq.employeeId === emp.id);
                        const empIssues = (issues || []).filter(is => is.employeeId === emp.id);
                        const activeIssues = empIssues.filter(is => is.status !== 'Resolved');
                        
                        return (
                          <div className="space-y-2 max-w-[190px]">
                            {/* Equipment counter & preview */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Property:</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                empEquipment.length > 0 ? 'bg-teal-500/10 text-teal-400 font-extrabold border border-teal-500/20' : 'bg-slate-800 text-slate-500'
                              }`}>
                                {empEquipment.length} asset{empEquipment.length !== 1 ? 's' : ''}
                              </span>
                            </div>

                            {/* Mini tags of equipment if any */}
                            {empEquipment.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {empEquipment.slice(0, 3).map(eq => {
                                  let emoji = '📦';
                                  if (eq.type === 'Laptop') emoji = '💻';
                                  else if (eq.type === 'Monitor') emoji = '🖥️';
                                  else if (eq.type === 'Charger/Power Adapter') emoji = '🔌';
                                  else if (eq.type === 'Keyboard/Mouse') emoji = '🖱️';
                                  else if (eq.type === 'Headset') emoji = '🎧';
                                  else if (eq.type === 'Mobile Device') emoji = '📱';
                                  else if (eq.type === 'Ergonomic Desk/Chair') emoji = '🪑';
                                  
                                  return (
                                    <span 
                                      key={eq.id} 
                                      className="inline-flex items-center gap-1 text-[9px] font-semibold text-slate-300 bg-slate-800/40 border border-slate-700/50 px-1 py-0.5 rounded cursor-help"
                                      title={`${eq.itemName} (${eq.condition} condition, Serial: ${eq.serialNumber})`}
                                    >
                                      <span>{emoji}</span>
                                      <span className="truncate max-w-[55px]">{eq.itemName.replace(/^(MacBook Pro|MacBook Air|Dell Latitude|Dell UltraSharp|Keychron|Sony|Satechi|Apple)\s+/i, '')}</span>
                                    </span>
                                  );
                                })}
                                {empEquipment.length > 3 && (
                                  <span className="text-[9px] font-black text-slate-500 self-center">
                                    +{empEquipment.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Support issues counter */}
                            <div className="flex items-center gap-1.5 pt-0.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tickets:</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                activeIssues.length > 0 
                                  ? 'bg-rose-500/10 text-rose-400 font-extrabold border border-rose-500/20' 
                                  : empIssues.length > 0
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-slate-800 text-slate-500'
                              }`}>
                                {activeIssues.length > 0 ? `${activeIssues.length} active` : empIssues.length > 0 ? 'All resolved' : 'None'}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Type & Status */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        <select
                          id={`select-type-${emp.id}`}
                          value={emp.employmentType || 'Full-Time'}
                          onChange={(e) => onEditEmployee({ ...emp, employmentType: e.target.value as any })}
                          className={`inline-block text-[9px] font-extrabold px-1.5 py-0.5 rounded border outline-none bg-slate-900 cursor-pointer transition-all duration-200 ${getTypeStyle(emp.employmentType)}`}
                        >
                          <option value="Full-Time" className="bg-slate-900 text-sky-400 font-extrabold text-[10px]">Full-Time</option>
                          <option value="Part-Time" className="bg-slate-900 text-indigo-400 font-extrabold text-[10px]">Part-Time</option>
                          <option value="Contract" className="bg-slate-900 text-purple-400 font-extrabold text-[10px]">Contract</option>
                          <option value="Intern" className="bg-slate-900 text-teal-400 font-extrabold text-[10px]">Intern</option>
                        </select>
                        <select
                          id={`select-status-${emp.id}`}
                          value={emp.status || 'Active'}
                          onChange={(e) => onEditEmployee({ ...emp, status: e.target.value as any })}
                          className={`inline-block text-[9px] font-extrabold px-1.5 py-0.5 rounded border outline-none bg-slate-900 cursor-pointer transition-all duration-200 ${getStatusStyle(emp.status)}`}
                        >
                          <option value="Active" className="bg-slate-900 text-emerald-400 font-extrabold text-[10px]">Active</option>
                          <option value="On Leave" className="bg-slate-900 text-amber-400 font-extrabold text-[10px]">On Leave</option>
                          <option value="Terminated" className="bg-slate-900 text-rose-400 font-extrabold text-[10px]">Terminated</option>
                        </select>
                      </div>
                    </td>

                    {/* Salary */}
                    <td className="px-6 py-4 font-mono font-bold text-slate-200 text-sm">
                      ₹{emp.salary.toLocaleString()}
                    </td>

                    {/* Actions links */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 w-max">
                        <button
                          id={`btn-payroll-${emp.id}`}
                          onClick={() => onNavigateToView('payroll', { employeeId: emp.id })}
                          className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-400 font-bold px-2.5 py-1 rounded-lg text-[10px] transition cursor-pointer"
                        >
                          <IndianRupee className="w-3 h-3" />
                          <span>Payslip</span>
                        </button>
                        <button
                          id={`btn-attendance-${emp.id}`}
                          onClick={() => onNavigateToView('attendance', { employeeId: emp.id })}
                          className="flex items-center gap-1 bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/20 text-indigo-400 font-bold px-2.5 py-1 rounded-lg text-[10px] transition cursor-pointer"
                        >
                          <CalendarCheck className="w-3 h-3" />
                          <span>Attendance</span>
                        </button>
                        <button
                          id={`btn-issues-${emp.id}`}
                          onClick={() => onNavigateToView('issues', { employeeId: emp.id })}
                          className="flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/20 text-amber-400 font-bold px-2.5 py-1 rounded-lg text-[10px] transition cursor-pointer"
                        >
                          <AlertCircle className="w-3 h-3" />
                          <span>Issues ({(issues || []).filter(is => is.employeeId === emp.id).length})</span>
                        </button>
                      </div>
                    </td>

                    {/* Settings/Modify */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          id={`btn-view-emp-${emp.id}`}
                          onClick={() => setSelectedEmpDetail(emp)}
                          className="p-1.5 hover:bg-slate-700/40 rounded-lg text-slate-400 hover:text-teal-400 border border-transparent hover:border-teal-500/10 transition cursor-pointer"
                          title="View complete employee profile details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          id={`btn-edit-emp-${emp.id}`}
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 hover:bg-slate-700/40 rounded-lg text-slate-400 hover:text-slate-200 transition cursor-pointer"
                          title="Edit Employee details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`btn-delete-emp-${emp.id}`}
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${emp.name}?`)) {
                              onDeleteEmployee(emp.id);
                            }
                          }}
                          className="p-1.5 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-400 transition cursor-pointer"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Elegant slide-over detail Drawer to view "ALL DETAILS OF EMPLOYEE" */}
      {selectedEmpDetail && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full overflow-y-auto shadow-2xl relative flex flex-col">
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-slate-800/60 flex items-center justify-between bg-slate-950/20">
              <div className="flex items-center gap-2">
                <Info className="h-4.5 w-4.5 text-teal-400" />
                <h3 className="font-extrabold text-slate-100 text-sm uppercase tracking-wider">Employee Dossier</h3>
              </div>
              <button 
                onClick={() => setSelectedEmpDetail(null)}
                className="text-slate-400 hover:text-slate-200 p-1.5 hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Profile Core Banner */}
            <div className="p-6 text-center border-b border-slate-800/40 bg-gradient-to-b from-slate-950/40 to-transparent">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-tr from-teal-500/20 to-emerald-500/20 border border-teal-500/30 flex items-center justify-center font-extrabold text-teal-400 text-xl shadow-lg mb-3">
                {selectedEmpDetail.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h4 className="font-extrabold text-slate-100 text-lg">{selectedEmpDetail.name}</h4>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{selectedEmpDetail.role}</p>
              
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="inline-block text-[10px] font-bold text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/15">
                  {selectedEmpDetail.department}
                </span>
                <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded border ${getTypeStyle(selectedEmpDetail.employmentType)}`}>
                  {selectedEmpDetail.employmentType || 'Full-Time'}
                </span>
                <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded border ${getStatusStyle(selectedEmpDetail.status)}`}>
                  {selectedEmpDetail.status || 'Active'}
                </span>
              </div>

              {/* Company Assets & Support Tickets Overview Panel */}
              <div className="grid grid-cols-2 gap-3.5 mt-5 max-w-xs mx-auto">
                <div className="bg-slate-950/45 border border-slate-800/60 rounded-2xl p-3 text-center flex flex-col justify-between shadow-inner">
                  <span className="text-[9px] text-slate-500 block uppercase font-black tracking-widest">Allocated Property</span>
                  <div className="flex items-center justify-center gap-1.5 mt-1.5">
                    <span className="text-xl font-mono font-black text-teal-400">
                      {(equipment || []).filter(eq => eq.employeeId === selectedEmpDetail.id).length}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">assets</span>
                  </div>
                </div>
                <div className="bg-slate-950/45 border border-slate-800/60 rounded-2xl p-3 text-center flex flex-col justify-between shadow-inner">
                  <span className="text-[9px] text-slate-500 block uppercase font-black tracking-widest">Active Tickets</span>
                  <div className="flex items-center justify-center gap-1.5 mt-1.5">
                    <span className="text-xl font-mono font-black text-amber-400">
                      {(issues || []).filter(is => is.employeeId === selectedEmpDetail.id && is.status !== 'Resolved').length}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">pending</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Complete Profile Details Fields */}
            <div className="p-6 space-y-6 flex-1">
              {/* Contact Information */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block border-b border-slate-800/40 pb-1">Personal Contact Info</h5>
                
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Email Address</span>
                      <a href={`mailto:${selectedEmpDetail.email}`} className="text-xs font-semibold text-slate-200 hover:text-teal-400 transition break-all">
                        {selectedEmpDetail.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Phone Number</span>
                      <span className="text-xs font-mono font-bold text-slate-200">
                        {selectedEmpDetail.phone || '+1 (555) 123-4567'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Emergency Contact</span>
                      <span className="text-xs font-semibold text-slate-200">
                        {selectedEmpDetail.emergencyContact || 'Not Registered'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Employment Details */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block border-b border-slate-800/40 pb-1">Corporate Details</h5>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-2.5">
                    <Calendar className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Date of Joining</span>
                      <span className="text-xs font-mono font-bold text-slate-200">
                        {selectedEmpDetail.joiningDate || '2023-01-01'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <IndianRupee className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Base Salary</span>
                      <span className="text-xs font-mono font-extrabold text-emerald-400">
                        ₹{selectedEmpDetail.salary.toLocaleString()}/yr
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Notes */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block border-b border-slate-800/40 pb-1">Biographical & Performance Notes</h5>
                <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl">
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{selectedEmpDetail.notes || 'No notes currently recorded in this employee\'s file.'}"
                  </p>
                </div>
              </div>

              {/* Assigned Property & Equipment for this employee */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/40 pb-1">
                  <h5 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">Assigned Property & Equipment</h5>
                  <button
                    type="button"
                    onClick={() => setShowDrawerEquipmentForm(!showDrawerEquipmentForm)}
                    className="text-[10px] font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>{showDrawerEquipmentForm ? 'Cancel' : 'Assign Equipment'}</span>
                  </button>
                </div>

                {/* Form to assign equipment directly inside the drawer */}
                {showDrawerEquipmentForm && (
                  <form onSubmit={handleCreateDrawerEquipment} className="bg-slate-950/60 border border-teal-500/15 p-4 rounded-xl space-y-3 animate-fade-in">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assign equipment or assistive tools to {selectedEmpDetail.name}</p>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Asset/Item Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. MacBook Pro M3, iPad Pro"
                        value={drawerEquipmentName}
                        onChange={(e) => setDrawerEquipmentName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/60 focus:border-teal-400 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Serial Number</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. SN-89102-X"
                          value={drawerEquipmentSerialNumber}
                          onChange={(e) => setDrawerEquipmentSerialNumber(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/60 focus:border-teal-400 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Type</label>
                        <select
                          value={drawerEquipmentType}
                          onChange={(e) => setDrawerEquipmentType(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-700/60 focus:border-teal-400 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
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
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Initial Condition</label>
                        <select
                          value={drawerEquipmentCondition}
                          onChange={(e) => setDrawerEquipmentCondition(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-700/60 focus:border-teal-400 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
                        >
                          <option value="New">New</option>
                          <option value="Excellent">Excellent</option>
                          <option value="Good">Good</option>
                          <option value="Fair">Fair</option>
                          <option value="Damaged">Damaged</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Allocation Notes</label>
                        <input
                          type="text"
                          placeholder="e.g. standard developer kit"
                          value={drawerEquipmentNotes}
                          onChange={(e) => setDrawerEquipmentNotes(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/60 focus:border-teal-400 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold py-1.5 rounded-lg text-xs hover:from-teal-400 hover:to-emerald-400 transition cursor-pointer"
                    >
                      Allocate & Assign Asset
                    </button>
                  </form>
                )}

                {/* List of existing assigned equipment */}
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {equipment.filter(eq => eq.employeeId === selectedEmpDetail.id).length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic py-1">No company property or assistive tools assigned to this employee.</p>
                  ) : (
                    equipment
                      .filter(eq => eq.employeeId === selectedEmpDetail.id)
                      .map(eq => (
                        <div key={eq.id} className="bg-slate-950/40 border border-slate-800/60 p-3 rounded-xl flex items-start justify-between gap-3">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              {eq.type === 'Laptop' ? (
                                <Laptop className="w-3.5 h-3.5 text-sky-400" />
                              ) : eq.type === 'Monitor' ? (
                                <Tv className="w-3.5 h-3.5 text-teal-400" />
                              ) : eq.type === 'Charger/Power Adapter' ? (
                                <Plug className="w-3.5 h-3.5 text-amber-400" />
                              ) : eq.type === 'Keyboard/Mouse' || eq.type === 'Headset' ? (
                                <Wrench className="w-3.5 h-3.5 text-indigo-400" />
                              ) : (
                                <Package className="w-3.5 h-3.5 text-purple-400" />
                              )}
                              <span className="text-[11px] font-bold text-slate-200">{eq.itemName}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono flex flex-wrap gap-x-2 gap-y-0.5">
                              <span>SN: {eq.serialNumber}</span>
                              <span className="text-slate-500">•</span>
                              <span>Assigned: {eq.assignedDate}</span>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider bg-slate-800/50 px-1.5 py-0.5 rounded">
                                Type: {eq.type}
                              </span>
                              <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                eq.condition === 'New' || eq.condition === 'Excellent'
                                  ? 'text-emerald-400 bg-emerald-500/10'
                                  : eq.condition === 'Good'
                                  ? 'text-sky-400 bg-sky-500/10'
                                  : 'text-amber-400 bg-amber-500/10'
                              }`}>
                                {eq.condition}
                              </span>
                            </div>
                            {eq.notes && (
                              <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800/30">
                                "{eq.notes}"
                              </p>
                            )}
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => onDeleteEquipment(eq.id)}
                            className="text-slate-500 hover:text-rose-400 p-1 hover:bg-rose-500/10 rounded transition cursor-pointer"
                            title="Deassign and Return Equipment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Company Assist & Property Issues for this employee */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/40 pb-1">
                  <h5 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">Company Assist & Property Issues</h5>
                  <button
                    type="button"
                    onClick={() => setShowDrawerIssueForm(!showDrawerIssueForm)}
                    className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>{showDrawerIssueForm ? 'Cancel' : 'Log Property/Assist Issue'}</span>
                  </button>
                </div>

                {/* Form to log issue directly inside the drawer */}
                {showDrawerIssueForm && (
                  <form onSubmit={handleCreateDrawerIssue} className="bg-slate-950/60 border border-teal-500/15 p-4 rounded-xl space-y-3 animate-fade-in">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Log support ticket or property issue for {selectedEmpDetail.name}</p>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Issue Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Laptop replacement or screen issues"
                        value={drawerIssueTitle}
                        onChange={(e) => setDrawerIssueTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/60 focus:border-teal-400 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
                        <select
                          value={drawerIssueCategory}
                          onChange={(e) => setDrawerIssueCategory(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-700/60 focus:border-teal-400 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
                        >
                          <option value="IT Support">IT Support</option>
                          <option value="HR Query">HR Query</option>
                          <option value="Assets & Equipment">Assets & Company Property</option>
                          <option value="Facilities">Facilities</option>
                          <option value="Finance">Finance</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Severity</label>
                        <select
                          value={drawerIssueSeverity}
                          onChange={(e) => setDrawerIssueSeverity(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-700/60 focus:border-teal-400 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Detailed Description</label>
                      <textarea
                        required
                        placeholder="Describe the issue in details..."
                        value={drawerIssueDescription}
                        onChange={(e) => setDrawerIssueDescription(e.target.value)}
                        rows={2}
                        className="w-full bg-slate-900 border border-slate-700/60 focus:border-teal-400 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Assign Handler (Optional)</label>
                      <select
                        value={drawerIssueAssignedToId}
                        onChange={(e) => setDrawerIssueAssignedToId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/60 focus:border-teal-400 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
                      >
                        <option value="">Leave Unassigned</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold py-1.5 rounded-lg text-xs hover:from-teal-400 hover:to-emerald-400 transition cursor-pointer"
                    >
                      Save Ticket
                    </button>
                  </form>
                )}

                {/* List of existing issues */}
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {issues.filter(is => is.employeeId === selectedEmpDetail.id).length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic py-1">No active support issues or queries logged for this employee.</p>
                  ) : (
                    issues
                      .filter(is => is.employeeId === selectedEmpDetail.id)
                      .map(iss => (
                        <div key={iss.id} className="bg-slate-950/40 border border-slate-800/60 p-3 rounded-xl space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-slate-300 font-mono tracking-tight">{iss.title}</span>
                            <span className={`text-[8px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                              iss.severity === 'High' 
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/10' 
                                : iss.severity === 'Medium' 
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10' 
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                            }`}>
                              {iss.severity}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-2">{iss.description}</p>
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/40 text-[9px]">
                            <span className="text-slate-500">{iss.category} • <span className="font-mono">{iss.dateCreated}</span></span>
                            
                            <select
                              id={`select-status-drawer-${iss.id}`}
                              value={iss.status}
                              onChange={(e) => onUpdateIssueStatus(iss.id, e.target.value as any, iss.adminNotes || '')}
                              className={`px-1.5 py-0.5 rounded font-extrabold uppercase outline-none bg-slate-900 border cursor-pointer transition-all ${
                                iss.status === 'Resolved'
                                  ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                                  : iss.status === 'In Progress'
                                  ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                                  : 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                              }`}
                            >
                              <option value="Pending" className="text-rose-400 font-bold bg-slate-900">Pending</option>
                              <option value="In Progress" className="text-amber-400 font-bold bg-slate-900">In Progress</option>
                              <option value="Resolved" className="text-emerald-400 font-bold bg-slate-900">Resolved</option>
                            </select>
                          </div>
                          {iss.adminNotes && (
                            <div className="text-[10px] bg-teal-500/5 border border-teal-500/10 text-teal-300 p-2 rounded-lg italic">
                              <span className="font-extrabold not-italic text-teal-400 block mb-0.5 text-[9px] uppercase tracking-wider">Administrative Response:</span>
                              "{iss.adminNotes}"
                            </div>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* Quick action buttons footer */}
            <div className="p-6 border-t border-slate-800 bg-slate-950/20 flex gap-3">
              <button
                onClick={() => {
                  handleOpenEdit(selectedEmpDetail);
                }}
                className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={() => {
                  setSelectedEmpDetail(null);
                  onNavigateToView('payroll', { employeeId: selectedEmpDetail.id });
                }}
                className="flex-1 bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/20 text-teal-400 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <IndianRupee className="w-3.5 h-3.5 text-teal-400" />
                <span>Payslip Logs</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Elegant glassmorphism CRUD Modal with ALL properties */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl relative">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-teal-500/10 rounded-lg text-teal-400">
                  <UserPlus className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-bold text-slate-100 text-base">
                  {editingEmp ? 'Modify Employee Profile' : 'Register New Employee'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1.5 hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                  <input
                    id="emp-form-name"
                    type="text"
                    required
                    placeholder="Sarah Jenkins"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
                  <input
                    id="emp-form-email"
                    type="email"
                    required
                    placeholder="sarah.j@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number</label>
                  <input
                    id="emp-form-phone"
                    type="text"
                    placeholder="+1 (555) 234-5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                  />
                </div>

                {/* Date of Joining */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date of Joining</label>
                  <input
                    id="emp-form-joining"
                    type="date"
                    required
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all cursor-pointer font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Department */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Department</label>
                  <select
                    id="emp-form-dept"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all cursor-pointer"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Role */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Job Title / Role</label>
                  <input
                    id="emp-form-role"
                    type="text"
                    required
                    placeholder="e.g. Lead Software Engineer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Employment Type */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Employment Type</label>
                  <select
                    id="emp-form-type"
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value as any)}
                    className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all cursor-pointer"
                  >
                    {employmentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Employment Status</label>
                  <select
                    id="emp-form-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all cursor-pointer"
                  >
                    {statuses.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Salary */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Annual Base Salary (INR ₹)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 text-xs font-semibold">₹</span>
                  <input
                    id="emp-form-salary"
                    type="number"
                    required
                    placeholder="850000"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all font-mono"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Emergency Contact Info</label>
                <input
                  id="emp-form-emergency"
                  type="text"
                  placeholder="e.g. John Jenkins (Spouse) - +1 (555) 234-5679"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                />
              </div>

              {/* Biographical Notes */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Biographical / Personnel Notes</label>
                <textarea
                  id="emp-form-notes"
                  placeholder="Additional background notes, certifications, or career milestones..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all resize-none"
                />
              </div>

              {/* --- 1. NEW EMPLOYEE ONBOARDING PROPERTY ALLOTMENT --- */}
              {!editingEmp && (
                <div className="bg-slate-950/45 border border-slate-800/80 p-4.5 rounded-2xl space-y-3.5 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-teal-500/10 text-teal-400 rounded-lg">
                        <Laptop className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-black text-slate-200 uppercase tracking-wider">Initial Asset Assignment (Optional)</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={isInitialEquipmentEnabled}
                        onChange={(e) => setIsInitialEquipmentEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-slate-950 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div>
                      <span className="ml-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {isInitialEquipmentEnabled ? "Active" : "Disabled"}
                      </span>
                    </label>
                  </div>

                  {isInitialEquipmentEnabled && (
                    <div className="space-y-3.5 pt-1.5 border-t border-slate-800/50 animate-fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Property Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Dell Latitude 5440"
                            value={initialEquipmentName}
                            onChange={(e) => setInitialEquipmentName(e.target.value)}
                            className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                            required={isInitialEquipmentEnabled}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Serial Number (Optional)</label>
                          <input
                            type="text"
                            placeholder="Auto-generated if blank"
                            value={initialEquipmentSerialNumber}
                            onChange={(e) => setInitialEquipmentSerialNumber(e.target.value)}
                            className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Asset Category</label>
                          <select
                            value={initialEquipmentType}
                            onChange={(e) => setInitialEquipmentType(e.target.value as any)}
                            className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none transition-all cursor-pointer"
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
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Current Condition</label>
                          <select
                            value={initialEquipmentCondition}
                            onChange={(e) => setInitialEquipmentCondition(e.target.value as any)}
                            className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none transition-all cursor-pointer"
                          >
                            <option value="New">New / Sealed</option>
                            <option value="Excellent">Excellent</option>
                            <option value="Good">Good</option>
                            <option value="Fair">Fair / Used</option>
                            <option value="Damaged">Damaged</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Setup Notes / Comments</label>
                        <input
                          type="text"
                          placeholder="e.g. Delivered with carry case and warranty card"
                          value={initialEquipmentNotes}
                          onChange={(e) => setInitialEquipmentNotes(e.target.value)}
                          className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- 2. EXISTING EMPLOYEE EDIT MODAL PROPERTY MANAGER --- */}
              {editingEmp && (
                <div className="bg-slate-950/45 border border-slate-800/80 p-4.5 rounded-2xl space-y-4 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-amber-500/10 text-amber-400 rounded-lg">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-black text-slate-200 uppercase tracking-wider">Assigned Corporate Property</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-md">
                      {equipment.filter(eq => eq.employeeId === editingEmp.id).length} Active
                    </span>
                  </div>

                  {/* Property List */}
                  <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                    {equipment.filter(eq => eq.employeeId === editingEmp.id).length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic py-2 text-center bg-slate-900/30 border border-slate-850/50 rounded-xl">
                        No property items currently allocated to this profile.
                      </p>
                    ) : (
                      equipment.filter(eq => eq.employeeId === editingEmp.id).map(eq => (
                        <div key={eq.id} className="flex items-center justify-between bg-slate-900/60 border border-slate-800/40 p-2.5 rounded-xl hover:border-slate-750 transition">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-slate-300">{eq.itemName}</span>
                              <span className="text-[8px] font-extrabold uppercase bg-teal-500/10 text-teal-400 px-1.5 py-0.2 rounded-md">
                                {eq.type}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] text-slate-500 font-mono mt-0.5">
                              <span>SN: {eq.serialNumber}</span>
                              <span>•</span>
                              <span className="capitalize text-slate-400">{eq.condition} Cond</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onDeleteEquipment(eq.id)}
                            className="p-1.5 hover:bg-rose-500/15 rounded-lg text-slate-500 hover:text-rose-400 transition cursor-pointer"
                            title="Return / Remove Asset"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add New Equipment Quick Form inside Edit modal */}
                  <div className="border-t border-slate-800/60 pt-3">
                    {!showModalNewEquipmentForm ? (
                      <button
                        type="button"
                        onClick={() => setShowModalNewEquipmentForm(true)}
                        className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-wider py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-teal-400" />
                        <span>Allocate New Property</span>
                      </button>
                    ) : (
                      <div className="bg-slate-900/60 border border-slate-850 p-3.5 rounded-xl space-y-3.5 animate-fade-in">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest block">Allocate Property Item</span>
                          <button
                            type="button"
                            onClick={() => setShowModalNewEquipmentForm(false)}
                            className="text-slate-500 hover:text-slate-300 transition"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Item Name</label>
                            <input
                              type="text"
                              placeholder="e.g. ThinkPad T14"
                              value={modalNewEquipmentName}
                              onChange={(e) => setModalNewEquipmentName(e.target.value)}
                              className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Serial Number</label>
                            <input
                              type="text"
                              placeholder="Auto-generated if empty"
                              value={modalNewEquipmentSerialNumber}
                              onChange={(e) => setModalNewEquipmentSerialNumber(e.target.value)}
                              className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Asset Category</label>
                            <select
                              value={modalNewEquipmentType}
                              onChange={(e) => setModalNewEquipmentType(e.target.value as any)}
                              className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none cursor-pointer"
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
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Current Condition</label>
                            <select
                              value={modalNewEquipmentCondition}
                              onChange={(e) => setModalNewEquipmentCondition(e.target.value as any)}
                              className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none cursor-pointer"
                            >
                              <option value="New">New / Sealed</option>
                              <option value="Excellent">Excellent</option>
                              <option value="Good">Good</option>
                              <option value="Fair">Fair / Used</option>
                              <option value="Damaged">Damaged</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Setup Notes / Comments</label>
                          <input
                            type="text"
                            placeholder="e.g. Delivered with carry case and charger"
                            value={modalNewEquipmentNotes}
                            onChange={(e) => setModalNewEquipmentNotes(e.target.value)}
                            className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                          />
                        </div>

                        <div className="pt-1 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setShowModalNewEquipmentForm(false)}
                            className="bg-slate-800 hover:bg-slate-750 text-slate-400 border border-slate-700/40 text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!modalNewEquipmentName.trim()) {
                                alert('Please provide an asset item name.');
                                return;
                              }
                              onAddEquipment({
                                employeeId: editingEmp.id,
                                employeeName: editingEmp.name,
                                itemName: modalNewEquipmentName.trim(),
                                serialNumber: modalNewEquipmentSerialNumber.trim() || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
                                type: modalNewEquipmentType,
                                condition: modalNewEquipmentCondition,
                                status: 'Assigned',
                                assignedDate: new Date().toISOString().split('T')[0],
                                notes: modalNewEquipmentNotes.trim() || undefined
                              });
                              // Reset mini fields
                              setModalNewEquipmentName('');
                              setModalNewEquipmentSerialNumber('');
                              setModalNewEquipmentType('Laptop');
                              setModalNewEquipmentCondition('New');
                              setModalNewEquipmentNotes('');
                              setShowModalNewEquipmentForm(false);
                            }}
                            className="bg-teal-500 hover:bg-teal-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-lg shadow-md transition active:scale-95 cursor-pointer"
                          >
                            Assign Asset Now
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800/60 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-750 border border-slate-700/40 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs active:scale-95 transition"
                >
                  Cancel
                </button>
                <button
                  id="emp-form-submit"
                  type="submit"
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs shadow-lg shadow-teal-500/10 active:scale-95 transition cursor-pointer"
                >
                  {editingEmp ? 'Save Changes' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Standalone 'Log Assist / Property Issue' modal for any employee */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400">
                  <AlertCircle className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-bold text-slate-100 text-base">
                  Log Company Property / Assist Issue
                </h3>
              </div>
              <button 
                onClick={() => setIsIssueModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1.5 hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateHeaderIssue} className="p-6 space-y-4">
              {/* Employee Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Employee</label>
                <select
                  required
                  value={issueEmployeeId}
                  onChange={(e) => setIssueEmployeeId(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="" disabled className="bg-slate-900 text-slate-500">Select an employee...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id} className="bg-slate-900 text-slate-200">
                      {emp.name} ({emp.role} - {emp.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Issue Title / Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Laptop charger damaged, desk key lost, or query regarding insurance"
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category</label>
                  <select
                    value={issueCategory}
                    onChange={(e) => setIssueCategory(e.target.value as any)}
                    className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="IT Support">IT Support</option>
                    <option value="HR Query">HR Query</option>
                    <option value="Assets & Equipment">Assets & Company Property</option>
                    <option value="Facilities">Facilities</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                {/* Severity */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Severity Level</label>
                  <select
                    value={issueSeverity}
                    onChange={(e) => setIssueSeverity(e.target.value as any)}
                    className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {/* Detailed Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Detailed Description</label>
                <textarea
                  required
                  placeholder="Please specify full description of the issue, including serial numbers, asset tags, or important details..."
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-800/60 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-750 border border-slate-700/40 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs active:scale-95 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs shadow-lg shadow-amber-500/10 active:scale-95 transition cursor-pointer"
                >
                  Log Ticket / Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
