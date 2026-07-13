/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Employee, 
  Candidate, 
  Task, 
  Interview, 
  Client, 
  AttendanceRecord, 
  ActivityLog, 
  ToastMessage, 
  ActiveView,
  Invoice,
  AssistsIssue,
  EquipmentAssignment,
  LeaveRequest,
  SalarySlip
} from './types';
import { 
  initialEmployees, 
  initialCandidates, 
  initialTasks, 
  initialInterviews, 
  initialClients, 
  initialAttendance, 
  initialActivities,
  initialInvoices,
  initialIssues,
  initialEquipment
} from './dummyData';

import { 
  dbGetCollection, 
  dbSaveItem, 
  dbDeleteItem, 
  dbSaveCollection,
  listMongoCollections,
  signInWithGoogle
} from './firebase';


import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import EmployeeView from './components/EmployeeView';
import AttendanceView from './components/AttendanceView';
import PayrollView from './components/PayrollView';
import KanbanView from './components/KanbanView';
import CandidateView from './components/CandidateView';
import InterviewView from './components/InterviewView';
import ClientView from './components/ClientView';
import InvoiceView from './components/InvoiceView';
import IssueView from './components/IssueView';
import LeavesView from './components/LeavesView';
import EmployeePortal from './components/EmployeePortal';
import Toast from './components/Toast';
import FrontPage from './components/FrontPage';
import AdminManageView from './components/AdminManageView';
import CandidatePortal from './components/CandidatePortal';

import { ShieldAlert, Mail, Lock, LogIn, Building, LayoutGrid, Chrome, Briefcase, User, Phone, KeyRound, Coins, CheckCircle2, Terminal, ArrowLeft, Copy } from 'lucide-react';

const initialLeaveRequests: LeaveRequest[] = [
  {
    id: 'leave-1',
    employeeId: 'emp-4',
    employeeName: 'Devon Vance',
    startDate: '2026-06-25',
    endDate: '2026-07-02',
    reason: 'Approved annual personal travel and time off for summer holiday.',
    type: 'Annual',
    status: 'Approved',
    dateApplied: '2026-06-20',
    adminNotes: 'Fully approved by Admin'
  },
  {
    id: 'leave-2',
    employeeId: 'emp-2',
    employeeName: 'Elena Rostova',
    startDate: '2026-07-05',
    endDate: '2026-07-10',
    reason: 'Attending regional cybersecurity research conference in Berlin.',
    type: 'Casual',
    status: 'Pending',
    dateApplied: '2026-06-24'
  }
];

export default function App() {
  // 1. Session Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<'admin' | 'employee' | 'candidate'>('admin');
  const [loggedInEmployee, setLoggedInEmployee] = useState<Employee | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // 1b. Leaves state
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

  // 1c. Login/Register Form States
  const [loginRole, setLoginRole] = useState<'admin' | 'employee' | 'candidate'>('admin');
  const [isSignUp, setIsSignUp] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDept, setRegDept] = useState('Engineering');
  const [regRole, setRegRole] = useState('Software Engineer');
  const [regSalary, setRegSalary] = useState('75000');

  // 1d. Forgot Password States
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<'idle' | 'checking' | 'sending' | 'success' | 'error'>('idle');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [smtpLogs, setSmtpLogs] = useState<string[]>([]);

  // 2. Main Data Collections State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [issues, setIssues] = useState<AssistsIssue[]>([]);
  const [equipment, setEquipment] = useState<EquipmentAssignment[]>([]);
  const [salarySlips, setSalarySlips] = useState<SalarySlip[]>([]);

  // 3. Navigation & Deep Linking States
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [transientData, setTransientData] = useState<any>(null);

  // Derived current active employee from global employees collection to keep data in sync
  const currentEmployee = employees.find(e => e.id === loggedInEmployee?.id || e.email.toLowerCase() === loggedInEmployee?.email?.toLowerCase()) || loggedInEmployee;

  // 4. Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast dispatch helper
  const triggerToast = (message: string, type: ToastMessage['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Tenant Scoping State and Helpers
  const [currentAdminEmail, setCurrentAdminEmail] = useState<string>(() => {
    const session = localStorage.getItem('crm_user_session');
    const role = localStorage.getItem('crm_user_role') || 'admin';
    if (session && role === 'admin') {
      return session;
    }
    return localStorage.getItem('crm_associated_admin') || 'admin@crm.com';
  });

  const getScopedCollectionName = (baseName: string, adminEmail: string) => {
    if (baseName === 'crm_registered_admins' || baseName === 'crm_employee_mappings') {
      return baseName;
    }
    const safeEmail = (adminEmail || 'admin@crm.com').replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    return `${baseName}_${safeEmail}`;
  };

  const loadTenantData = async (adminEmail: string, sessionEmail?: string, sessionRole?: string) => {
    try {
      setIsLoading(true);

      const collectionsToLoad: Array<{
        key: string;
        defaultData: any[];
        setter: React.Dispatch<React.SetStateAction<any[]>>;
      }> = [
        { key: 'crm_employees', defaultData: initialEmployees, setter: setEmployees as unknown as React.Dispatch<React.SetStateAction<any[]>> },
        { key: 'crm_candidates', defaultData: initialCandidates, setter: setCandidates as unknown as React.Dispatch<React.SetStateAction<any[]>> },
        { key: 'crm_tasks', defaultData: initialTasks, setter: setTasks as unknown as React.Dispatch<React.SetStateAction<any[]>> },
        { key: 'crm_interviews', defaultData: initialInterviews, setter: setInterviews as unknown as React.Dispatch<React.SetStateAction<any[]>> },
        { key: 'crm_clients', defaultData: initialClients, setter: setClients as unknown as React.Dispatch<React.SetStateAction<any[]>> },
        { key: 'crm_attendance', defaultData: initialAttendance, setter: setAttendance as unknown as React.Dispatch<React.SetStateAction<any[]>> },
        { key: 'crm_activities', defaultData: initialActivities, setter: setActivities as unknown as React.Dispatch<React.SetStateAction<any[]>> },
        { key: 'crm_invoices', defaultData: initialInvoices, setter: setInvoices as unknown as React.Dispatch<React.SetStateAction<any[]>> },
        { key: 'crm_issues', defaultData: initialIssues, setter: setIssues as unknown as React.Dispatch<React.SetStateAction<any[]>> },
        { key: 'crm_equipment', defaultData: initialEquipment, setter: setEquipment as unknown as React.Dispatch<React.SetStateAction<any[]>> },
        { key: 'crm_leaves', defaultData: initialLeaveRequests, setter: setLeaveRequests as unknown as React.Dispatch<React.SetStateAction<any[]>> },
        { key: 'crm_salary_slips', defaultData: [] as SalarySlip[], setter: setSalarySlips as unknown as React.Dispatch<React.SetStateAction<any[]>> }
      ];

      for (const col of collectionsToLoad) {
        try {
          const scopedKey = getScopedCollectionName(col.key, adminEmail);
          const data = await dbGetCollection<any>(scopedKey);
          if (data && data.length > 0) {
            col.setter(data);
          } else {
            if (col.defaultData.length > 0) {
              await dbSaveCollection(scopedKey, col.defaultData as any[]);
              if (col.key === 'crm_employees') {
                for (const emp of col.defaultData as Employee[]) {
                  await dbSaveItem('crm_employee_mappings', emp.email.toLowerCase(), {
                    employeeEmail: emp.email.toLowerCase(),
                    adminEmail: adminEmail
                  });
                }
              }
            }
            col.setter(col.defaultData);
          }
        } catch (e) {
          console.error(`Failed to load/seed collection ${col.key}:`, e);
          col.setter(col.defaultData);
        }
      }

      if (sessionEmail && sessionRole === 'employee') {
        const savedEmpId = localStorage.getItem('crm_logged_in_employee_id');
        const scopedEmpKey = getScopedCollectionName('crm_employees', adminEmail);
        const employeesList = await dbGetCollection<Employee>(scopedEmpKey);
        const found = employeesList.find((e: any) => e.id === savedEmpId || e.email.toLowerCase() === sessionEmail.toLowerCase());
        if (found) {
          setLoggedInEmployee(found);
        }
      }
    } catch (err) {
      console.error('Failed to load tenant data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Activity logger helper
  const logActivity = (type: ActivityLog['type'], action: string, details: string) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      type,
      action,
      details,
      timestamp: 'Just now'
    };
    setActivities(prev => [newLog, ...prev]);

    const scopedActKey = getScopedCollectionName('crm_activities', currentAdminEmail);
    dbSaveItem(scopedActKey, newLog.id, newLog).catch(e => {
      console.error('Failed to sync new log to MongoDB:', e);
    });
  };

  // 5. Initial Seed & Session Load
  useEffect(() => {
    // Start from the public landing experience on first open.
    // Persisted session data is used only after the user explicitly launches the portal.
    const session = localStorage.getItem('crm_user_session');
    const role = localStorage.getItem('crm_user_role') || 'admin';

    const initTenant = async () => {
      let resolvedAdminEmail = 'admin@crm.com';
      if (session) {
        if (role === 'admin') {
          resolvedAdminEmail = session;
        } else {
          try {
            const mappings = await dbGetCollection<any>('crm_employee_mappings');
            const found = mappings.find((m: any) => m.employeeEmail.toLowerCase() === session.toLowerCase());
            if (found) {
              resolvedAdminEmail = found.adminEmail;
              localStorage.setItem('crm_associated_admin', found.adminEmail);
            } else {
              resolvedAdminEmail = localStorage.getItem('crm_associated_admin') || 'admin@crm.com';
            }
          } catch (e) {
            console.error('Failed to get employee admin mapping:', e);
            resolvedAdminEmail = localStorage.getItem('crm_associated_admin') || 'admin@crm.com';
          }
        }
      }

      setCurrentAdminEmail(resolvedAdminEmail);
      await loadTenantData(resolvedAdminEmail, undefined, undefined);
    };

    initTenant();
  }, []);

  // 6. Login / Logout Handlers
  const handleLogin = async (e: React.FormEvent, role: 'admin' | 'employee' | 'candidate', isRegister: boolean, signupData?: any) => {
    e.preventDefault();
    setLoginError('');

    if (isRegister) {
      // Sign Up: Use the selected signup role (Admin or Employee)
      if (role === 'admin') {
        const { name, email, password } = signupData;
        if (!name || !email || !password) {
          setLoginError('All fields are required.');
          return;
        }
        const trimmedEmail = email.trim().toLowerCase();
        
        let registeredAdmins: any[] = [];
        try {
          registeredAdmins = await dbGetCollection<any>('crm_registered_admins');
        } catch (e) {
          console.error('Failed to fetch registered admins from database:', e);
        }

        if (registeredAdmins.find((a: any) => a.email === trimmedEmail) || trimmedEmail === 'admin@crm.com') {
          setLoginError('Admin email already exists.');
          return;
        }
        
        const newAdmin = { name, email: trimmedEmail, password };
        try {
          await dbSaveItem('crm_registered_admins', trimmedEmail, newAdmin);
        } catch (e) {
          console.error('Failed to save new admin to database:', e);
        }
        
        localStorage.setItem('crm_user_session', trimmedEmail);
        localStorage.setItem('crm_user_role', 'admin');
        localStorage.setItem('crm_associated_admin', trimmedEmail);
        setIsAuthenticated(true);
        setUserEmail(trimmedEmail);
        setUserType('admin');
        setCurrentAdminEmail(trimmedEmail);
        await loadTenantData(trimmedEmail, trimmedEmail, 'admin');

        triggerToast(`Admin registration successful! Welcome ${name}`, 'success');
        logActivity('payroll', 'Admin Registered & Logged In', `Admin profile created for ${name}.`);
      } else {
        // Employee Sign Up
        const { name, email, phone, password, department, role: empRole, salary } = signupData;
        if (!name || !email || !phone || !password || !department || !empRole || !salary) {
          setLoginError('Please fill out all required employee parameters including password.');
          return;
        }
        
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedPhone = phone.trim();
        
        if (employees.find(emp => emp.email.toLowerCase() === trimmedEmail || emp.phone === trimmedPhone)) {
          setLoginError('An employee with this email or phone number is already registered.');
          return;
        }

        const employeeId = `emp-${Date.now()}`;
        const newEmployee: Employee = {
          id: employeeId,
          name,
          email: trimmedEmail,
          phone: trimmedPhone,
          password,
          department,
          role: empRole,
          salary: parseFloat(salary) || 60000,
          status: 'Active',
          joiningDate: new Date().toISOString().split('T')[0]
        };

        // Save global employee mapping
        try {
          await dbSaveItem('crm_employee_mappings', trimmedEmail, {
            employeeEmail: trimmedEmail,
            adminEmail: currentAdminEmail
          });
        } catch (e) {
          console.error('Failed to save employee admin mapping:', e);
        }

        const updated = [...employees, newEmployee];
        await syncAndSave('crm_employees', updated, setEmployees);
        
        localStorage.setItem('crm_user_session', trimmedEmail);
        localStorage.setItem('crm_user_role', 'employee');
        localStorage.setItem('crm_logged_in_employee_id', employeeId);
        
        setIsAuthenticated(true);
        setUserEmail(trimmedEmail);
        setUserType('employee');
        setLoggedInEmployee(newEmployee);
        
        triggerToast(`Welcome to the portal, ${name}!`, 'success');
        logActivity('employee', 'Employee Self-Registered', `${name} registered & logged in as ${empRole}.`);
      }
    } else {
      // Simple Unified Sign In - Auto Detect Role dynamically!
      const trimmedEmail = loginEmail.trim().toLowerCase();
      if (!trimmedEmail) {
        setLoginError('Please enter your email or phone number.');
        return;
      }
      if (!loginPassword) {
        setLoginError('Please enter your password.');
        return;
      }

      // 1. Check Admin matches
      let isAdmin = false;
      let registeredAdmins: any[] = [];
      try {
        registeredAdmins = await dbGetCollection<any>('crm_registered_admins');
      } catch (e) {
        console.error('Failed to fetch registered admins from database:', e);
      }
      const customAdmin = registeredAdmins.find((a: any) => a.email === trimmedEmail && a.password === loginPassword);

      if ((trimmedEmail === 'admin@crm.com' && loginPassword === '123456') || customAdmin) {
        localStorage.setItem('crm_user_session', trimmedEmail);
        localStorage.setItem('crm_user_role', 'admin');
        localStorage.setItem('crm_associated_admin', trimmedEmail);
        setIsAuthenticated(true);
        setUserEmail(trimmedEmail);
        setUserType('admin');
        setCurrentAdminEmail(trimmedEmail);
        await loadTenantData(trimmedEmail, trimmedEmail, 'admin');

        triggerToast('Secure Administrator session authenticated!', 'success');
        logActivity('payroll', 'Admin Logged In', 'Admin session successfully initiated.');
        
        setLoginEmail('');
        setLoginPassword('');
        return;
      }

      // 2. Check Candidate matches
      try {
        const candidateAccounts = await dbGetCollection<any>('crm_candidate_accounts');
        const foundCandidate = candidateAccounts.find((acc: any) => acc.email.toLowerCase() === trimmedEmail && acc.password === loginPassword);

        if (foundCandidate) {
          localStorage.setItem('crm_user_session', trimmedEmail);
          localStorage.setItem('crm_user_role', 'candidate');
          
          setIsAuthenticated(true);
          setUserEmail(trimmedEmail);
          setUserType('candidate');
          
          triggerToast(`Welcome to your recruitment workspace, ${foundCandidate.candidateName}!`, 'success');
          
          setLoginEmail('');
          setLoginPassword('');
          return;
        }
      } catch (err) {
        console.error('Candidate login check failed:', err);
      }

      // 3. Check Employee matches
      let targetAdminEmail = 'admin@crm.com';
      try {
        const mappings = await dbGetCollection<any>('crm_employee_mappings');
        const foundMap = mappings.find((m: any) => m.employeeEmail.toLowerCase() === trimmedEmail);
        if (foundMap) {
          targetAdminEmail = foundMap.adminEmail;
        }
      } catch (e) {
        console.error('Failed lookup for employee mapping on sign-in:', e);
      }

      const scopedEmpKey = getScopedCollectionName('crm_employees', targetAdminEmail);
      const employeesList = await dbGetCollection<Employee>(scopedEmpKey);

      const foundEmployee = employeesList.find(emp => 
        emp.email.toLowerCase() === trimmedEmail || 
        (emp.phone && emp.phone.replace(/[^0-9+]/g, '') === trimmedEmail.replace(/[^0-9+]/g, ''))
      );

      if (foundEmployee) {
        if (foundEmployee.password && foundEmployee.password !== loginPassword) {
          setLoginError('Incorrect password. Please verify and try again.');
          triggerToast('Authentication failed. Incorrect password.', 'error');
          return;
        }

        localStorage.setItem('crm_user_session', foundEmployee.email);
        localStorage.setItem('crm_user_role', 'employee');
        localStorage.setItem('crm_logged_in_employee_id', foundEmployee.id);
        localStorage.setItem('crm_associated_admin', targetAdminEmail);
        
        setIsAuthenticated(true);
        setUserEmail(foundEmployee.email);
        setUserType('employee');
        setCurrentAdminEmail(targetAdminEmail);
        setLoggedInEmployee(foundEmployee);

        await loadTenantData(targetAdminEmail, foundEmployee.email, 'employee');
        
        triggerToast(`Welcome back, ${foundEmployee.name}!`, 'success');
        logActivity('employee', 'Employee Logged In', `${foundEmployee.name} initiated self-service session.`);
        
        setLoginEmail('');
        setLoginPassword('');
        return;
      }

      // 4. Fallback search across MongoDB employee collections in case mapping is missing
      try {
        let foundEmployeeAnywhere: Employee | null = null;
        let matchedAdminEmailAnywhere = 'admin@crm.com';

        const collectionNames = await listMongoCollections();
        const employeeCollections = collectionNames.filter(name => name === 'crm_employees' || name.startsWith('crm_employees_'));

        for (const collectionName of employeeCollections) {
          const list = await dbGetCollection<Employee>(collectionName);
          const found = list.find(emp => emp.email.toLowerCase() === trimmedEmail || (emp.phone && emp.phone.replace(/[^0-9+]/g, '') === trimmedEmail.replace(/[^0-9+]/g, '')));

          if (found) {
            foundEmployeeAnywhere = found;
            if (collectionName !== 'crm_employees') {
              matchedAdminEmailAnywhere = collectionName.replace('crm_employees_', '').replace(/_/g, '@');
            }
            break;
          }
        }

        if (foundEmployeeAnywhere) {
          if (foundEmployeeAnywhere.password && foundEmployeeAnywhere.password !== loginPassword) {
            setLoginError('Incorrect password. Please verify and try again.');
            triggerToast('Authentication failed. Incorrect password.', 'error');
            return;
          }

          localStorage.setItem('crm_user_session', foundEmployeeAnywhere.email);
          localStorage.setItem('crm_user_role', 'employee');
          localStorage.setItem('crm_logged_in_employee_id', foundEmployeeAnywhere.id);
          localStorage.setItem('crm_associated_admin', matchedAdminEmailAnywhere);
          
          setIsAuthenticated(true);
          setUserEmail(foundEmployeeAnywhere.email);
          setUserType('employee');
          setCurrentAdminEmail(matchedAdminEmailAnywhere);
          setLoggedInEmployee(foundEmployeeAnywhere);

          await loadTenantData(matchedAdminEmailAnywhere, foundEmployeeAnywhere.email, 'employee');
          
          triggerToast(`Welcome back, ${foundEmployeeAnywhere.name}!`, 'success');
          return;
        }
      } catch (err) {
        console.error('Backup scan failed:', err);
      }

      setLoginError('No registered Admin, Employee, or Candidate profile matches these credentials.');
      triggerToast('Authentication failed. Check credentials.', 'error');
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = resetEmail.trim().toLowerCase();
    if (!trimmedEmail) {
      setLoginError('Please enter a valid email address.');
      setResetStatus('error');
      return;
    }

    setLoginError('');
    setResetStatus('checking');
    setSmtpLogs(['[INFO] Querying database records for: ' + trimmedEmail]);

    // Simulate database lookup delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    let foundTargetName = '';
    let isSuccess = false;
    let newPassword = '';

    // Helper to generate a random password
    const generateRandomPass = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
      let res = '';
      for (let i = 0; i < 8; i++) {
        res += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return res;
    };

    // Auto-detect role for forgot password
    let resetRole: 'admin' | 'employee' = 'admin';
    let matchedAdmin = false;
    try {
      if (trimmedEmail === 'admin@crm.com') {
        matchedAdmin = true;
      } else {
        const registeredAdmins = await dbGetCollection<any>('crm_registered_admins');
        if (registeredAdmins.some((a: any) => a.email === trimmedEmail)) {
          matchedAdmin = true;
        }
      }
    } catch (err) {
      console.error('Password reset admin check error:', err);
    }

    if (matchedAdmin) {
      resetRole = 'admin';
    } else {
      resetRole = 'employee';
    }

    if (resetRole === 'admin') {
      let registeredAdmins: any[] = [];
      try {
        registeredAdmins = await dbGetCollection<any>('crm_registered_admins');
      } catch (err) {
        console.error('Failed fetching registered admins:', err);
      }

      const customAdmin = registeredAdmins.find((a: any) => a.email === trimmedEmail);
      if (trimmedEmail === 'admin@crm.com' || customAdmin) {
        foundTargetName = customAdmin?.name || 'Primary Administrator';
        newPassword = generateRandomPass();
        
        // Save back to db
        await dbSaveItem('crm_registered_admins', trimmedEmail, {
          name: foundTargetName,
          email: trimmedEmail,
          password: newPassword
        });
        isSuccess = true;
      }
    } else {
      // Employee Reset
      let targetAdminEmail = 'admin@crm.com';
      try {
        const mappings = await dbGetCollection<any>('crm_employee_mappings');
        const foundMap = mappings.find((m: any) => m.employeeEmail.toLowerCase() === trimmedEmail);
        if (foundMap) {
          targetAdminEmail = foundMap.adminEmail;
        }
      } catch (err) {
        console.error('Error on employee mapping lookup:', err);
      }

      const scopedEmpKey = getScopedCollectionName('crm_employees', targetAdminEmail);
      let employeesList: Employee[] = [];
      try {
        employeesList = await dbGetCollection<Employee>(scopedEmpKey);
      } catch (err) {
        console.error('Error fetching employees list:', err);
      }

      const empIndex = employeesList.findIndex(emp => emp.email.toLowerCase() === trimmedEmail);
      if (empIndex !== -1) {
        foundTargetName = employeesList[empIndex].name;
        newPassword = generateRandomPass();
        
        // Update password and save back
        employeesList[empIndex].password = newPassword;
        await dbSaveCollection(scopedEmpKey, employeesList);
        isSuccess = true;
      }
    }

    if (!isSuccess) {
      setResetStatus('error');
      setLoginError(`No registered profile found matching email: ${trimmedEmail}`);
      triggerToast(`Account lookup failed. Verify email.`, 'error');
      return;
    }

    // Process secure SMTP simulation logs
    setResetStatus('sending');
    setGeneratedPassword(newPassword);

    const logSteps = [
      `[SUCCESS] Record verified for: "${foundTargetName}"`,
      `[SECURE] Initializing cryptographic credential regeneration...`,
      `[SMTP] Querying MX records for target domain: mail.${trimmedEmail.split('@')[1] || 'domain.com'}`,
      `[SMTP] Found mail server: mail.${trimmedEmail.split('@')[1] || 'domain.com'} [Port 587]`,
      `[SMTP] Initiating secure connection via STARTTLS handshake...`,
      `[SECURE] TLS connection established with AES-256 cipher encryption.`,
      `[SMTP] Authenticating with platform dispatch credentials (noreply@crm.com)...`,
      `[SMTP] Sender authorized. Constructing Transactional Reset MIME Payload...`,
      `[SMTP] Sending: Subject: "Security Key Update Confirmation Notification" to <${trimmedEmail}>`,
      `[SMTP] Payload delivered. Server response: 250 OK - Message queued for transit.`,
      `[SUCCESS] Confirmation mail successfully transmitted.`
    ];

    for (let i = 0; i < logSteps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      setSmtpLogs((prev) => [...prev, logSteps[i]]);
    }

    setResetStatus('success');
    triggerToast('Password reset & email confirmation simulated!', 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('crm_user_session');
    localStorage.removeItem('crm_user_role');
    localStorage.removeItem('crm_logged_in_employee_id');
    localStorage.removeItem('crm_associated_admin');
    setIsAuthenticated(false);
    setUserEmail('');
    setUserType('admin');
    setLoggedInEmployee(null);
    setCurrentAdminEmail('admin@crm.com');
    loadTenantData('admin@crm.com');
    triggerToast('Session securely terminated.', 'info');
    setActiveView('dashboard');
  };

  const handleGoogleLogin = async () => {
    setLoginError('');
    try {
      const user = await signInWithGoogle();
      if (!user || !user.email) {
        setLoginError('Could not retrieve Google profile details.');
        return;
      }
      const googleEmail = user.email.trim().toLowerCase();
      const displayName = user.displayName || googleEmail.split('@')[0];

      // Auto-Detect Role for Google Sign In
      let isAdmin = false;
      let registeredAdmins: any[] = [];
      try {
        registeredAdmins = await dbGetCollection<any>('crm_registered_admins');
      } catch (e) {
        console.error('Failed to fetch registered admins from database:', e);
      }

      let customAdmin = registeredAdmins.find((a: any) => a.email === googleEmail);
      if (googleEmail === 'admin@crm.com' || customAdmin) {
        isAdmin = true;
      }

      if (isAdmin) {
        localStorage.setItem('crm_user_session', googleEmail);
        localStorage.setItem('crm_user_role', 'admin');
        localStorage.setItem('crm_associated_admin', googleEmail);
        setIsAuthenticated(true);
        setUserEmail(googleEmail);
        setUserType('admin');
        setCurrentAdminEmail(googleEmail);
        await loadTenantData(googleEmail, googleEmail, 'admin');

        triggerToast(`Admin Google session authenticated! Welcome ${displayName}`, 'success');
        logActivity('payroll', 'Admin Google Logged In', `Admin logged in with Google: ${displayName}.`);
        return;
      }

      // Check Candidate
      try {
        const candidateAccounts = await dbGetCollection<any>('crm_candidate_accounts');
        const foundCandidate = candidateAccounts.find((acc: any) => acc.email.toLowerCase() === googleEmail);
        if (foundCandidate) {
          localStorage.setItem('crm_user_session', googleEmail);
          localStorage.setItem('crm_user_role', 'candidate');
          
          setIsAuthenticated(true);
          setUserEmail(googleEmail);
          setUserType('candidate');
          
          triggerToast(`Welcome back to your workspace, ${foundCandidate.candidateName}!`, 'success');
          return;
        }
      } catch (err) {
        console.error('Candidate Google auth check failed:', err);
      }

      // Check Employee
      let targetAdminEmail = 'admin@crm.com';
      let foundEmployeeMapping = false;
      try {
        const mappings = await dbGetCollection<any>('crm_employee_mappings');
        const foundMap = mappings.find((m: any) => m.employeeEmail.toLowerCase() === googleEmail);
        if (foundMap) {
          targetAdminEmail = foundMap.adminEmail;
          foundEmployeeMapping = true;
        }
      } catch (e) {
        console.error('Failed lookup for employee mapping in Google sign-in:', e);
      }

      const scopedEmpKey = getScopedCollectionName('crm_employees', targetAdminEmail);
      const employeesList = await dbGetCollection<Employee>(scopedEmpKey);
      const foundEmployee = employeesList.find(emp => emp.email.toLowerCase() === googleEmail);

      if (foundEmployee || foundEmployeeMapping) {
        const employeeRecord = foundEmployee || {
          id: `emp-${Date.now()}`,
          name: displayName,
          email: googleEmail,
          phone: '+1-555-0199',
          department: 'Engineering',
          role: 'Software Engineer',
          salary: 60000,
          status: 'Active',
          joiningDate: new Date().toISOString().split('T')[0]
        } as Employee;

        if (!foundEmployee) {
          const updated = [...employeesList, employeeRecord];
          await dbSaveCollection(scopedEmpKey, updated);
        }

        localStorage.setItem('crm_user_session', employeeRecord.email);
        localStorage.setItem('crm_user_role', 'employee');
        localStorage.setItem('crm_logged_in_employee_id', employeeRecord.id);
        localStorage.setItem('crm_associated_admin', targetAdminEmail);
        
        setIsAuthenticated(true);
        setUserEmail(employeeRecord.email);
        setUserType('employee');
        setCurrentAdminEmail(targetAdminEmail);
        setLoggedInEmployee(employeeRecord);

        await loadTenantData(targetAdminEmail, employeeRecord.email, 'employee');
        
        triggerToast(`Welcome back, ${employeeRecord.name}!`, 'success');
        logActivity('employee', 'Employee Google Logged In', `${employeeRecord.name} initiated Google self-service session.`);
        return;
      }

      // Default fallback: Create a new corporate Admin workspace
      const newAdmin = { name: displayName, email: googleEmail, password: 'GoogleAuth' };
      try {
        await dbSaveItem('crm_registered_admins', googleEmail, newAdmin);
      } catch (e) {
        console.error('Failed to save default admin profile:', e);
      }

      localStorage.setItem('crm_user_session', googleEmail);
      localStorage.setItem('crm_user_role', 'admin');
      localStorage.setItem('crm_associated_admin', googleEmail);
      setIsAuthenticated(true);
      setUserEmail(googleEmail);
      setUserType('admin');
      setCurrentAdminEmail(googleEmail);
      await loadTenantData(googleEmail, googleEmail, 'admin');

      triggerToast(`Created a new corporate Admin workspace! Welcome, ${displayName}`, 'success');
      logActivity('payroll', 'Admin Registered via Google', `Admin registered with Google: ${displayName}.`);
    } catch (error: any) {
      console.error('Google sign in error:', error);
      if (error && error.code !== 'auth/popup-closed-by-user') {
        setLoginError(error.message || 'An error occurred during Google sign in.');
        triggerToast('Google authentication failed.', 'error');
      }
    }
  };

  const handleApproveLeave = (id: string, notes?: string) => {
    const updated = leaveRequests.map(req => {
      if (req.id === id) {
        const emp = employees.find(e => e.id === req.employeeId);
        if (emp) {
          const modifiedEmp = { ...emp, status: 'On Leave' as const };
          const updatedEmployees = employees.map(e => e.id === emp.id ? modifiedEmp : e);
          syncAndSave('crm_employees', updatedEmployees, setEmployees);
        }
        return { ...req, status: 'Approved' as const, adminNotes: notes };
      }
      return req;
    });
    syncAndSave('crm_leaves', updated, setLeaveRequests);
    triggerToast('Leave application approved.', 'success');
    logActivity('attendance', 'Leave Approved', `Approved leave for request ${id}`);
  };

  const handleRejectLeave = (id: string, notes?: string) => {
    const updated = leaveRequests.map(req => {
      if (req.id === id) {
        return { ...req, status: 'Rejected' as const, adminNotes: notes };
      }
      return req;
    });
    syncAndSave('crm_leaves', updated, setLeaveRequests);
    triggerToast('Leave application declined.', 'warning');
    logActivity('attendance', 'Leave Rejected', `Rejected leave for request ${id}`);
  };

  const handleApplyLeave = (leave: Omit<LeaveRequest, 'id' | 'employeeId' | 'employeeName' | 'status' | 'dateApplied'>) => {
    if (!currentEmployee) return;
    const newLeave: LeaveRequest = {
      ...leave,
      id: `leave-${Date.now()}`,
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      status: 'Pending',
      dateApplied: new Date().toISOString().split('T')[0]
    };
    const updated = [newLeave, ...leaveRequests];
    syncAndSave('crm_leaves', updated, setLeaveRequests);
    triggerToast('Leave request submitted successfully.', 'success');
    logActivity('attendance', 'Leave Applied', `${currentEmployee.name} submitted a new leave application`);
  };

  const handleAddAttendanceRecord = (record: AttendanceRecord) => {
    const updated = [record, ...attendance];
    syncAndSave('crm_attendance', updated, setAttendance);
    triggerToast('Attendance clock-in registered.', 'success');
    logActivity('attendance', 'Clock In', `Logged attendance checkpoint on ${record.date}`);
  };

  // 7. Navigation with transient state (for Deep-linking Action routes)
  const navigateToViewWithData = (view: ActiveView, extraData?: any) => {
    setTransientData(extraData);
    setActiveView(view);
  };

  // 8. CRUD Callback Handlers & Storage Sync
  const syncAndSave = async <T extends { id?: string; email?: string }>(
    key: string,
    updatedList: T[],
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    let previousList: T[] = [];
    setter(prev => {
      previousList = prev;
      return updatedList;
    });

    try {
      const scopedKey = getScopedCollectionName(key, currentAdminEmail);
      const removedItems = previousList.filter(prevItem => {
        const idField = prevItem.id || prevItem.email;
        return !updatedList.some(currItem => (currItem.id || currItem.email) === idField);
      });

      for (const item of removedItems) {
        const idField = item.id || item.email;
        if (idField) {
          await dbDeleteItem(scopedKey, idField);
        }
      }

      await dbSaveCollection(scopedKey, updatedList);
    } catch (e) {
      console.error(`Failed to sync changes for ${key} to MongoDB:`, e);
    }
  };

  // --- Employees CRUD ---
  const handleAddEmployee = (
    newEmp: Omit<Employee, 'id'>,
    initialEquipment?: Omit<EquipmentAssignment, 'id' | 'employeeId' | 'employeeName'>
  ) => {
    const employeeId = `emp-${Date.now()}`;
    const employeeWithId: Employee = {
      password: '123456',
      ...newEmp,
      id: employeeId
    };

    // Save the global employee to admin mapping
    dbSaveItem('crm_employee_mappings', newEmp.email.toLowerCase(), {
      employeeEmail: newEmp.email.toLowerCase(),
      adminEmail: currentAdminEmail
    }).catch(e => console.error('Failed to save employee to admin mapping:', e));

    const updated = [...employees, employeeWithId];
    syncAndSave('crm_employees', updated, setEmployees);
    triggerToast(`Employee ${newEmp.name} registered successfully.`, 'success');
    logActivity('employee', 'Employee Registered', `Full profile created for ${newEmp.name} in ${newEmp.department}.`);

    if (initialEquipment && initialEquipment.itemName.trim()) {
      const eqWithId: EquipmentAssignment = {
        ...initialEquipment,
        id: `eq-${Date.now() + 5}`,
        employeeId,
        employeeName: newEmp.name,
      };
      const updatedEq = [...equipment, eqWithId];
      syncAndSave('crm_equipment', updatedEq, setEquipment);
      logActivity('attendance', 'Equipment Assigned', `Assigned "${initialEquipment.itemName}" to ${newEmp.name} on onboarding.`);
    }
  };

  const handleEditEmployee = (modifiedEmp: Employee) => {
    const updated = employees.map(emp => emp.id === modifiedEmp.id ? modifiedEmp : emp);
    syncAndSave('crm_employees', updated, setEmployees);
    triggerToast(`Employee profile for ${modifiedEmp.name} modified.`, 'success');
    logActivity('employee', 'Employee Modified', `Updated job parameters for ${modifiedEmp.name}.`);
  };

  const handleDeleteEmployee = (id: string) => {
    const targetName = employees.find(e => e.id === id)?.name || 'Unknown';
    const updated = employees.filter(emp => emp.id !== id);
    syncAndSave('crm_employees', updated, setEmployees);
    triggerToast(`Employee records deleted.`, 'warning');
    logActivity('employee', 'Employee Removed', `Decommissioned records of ${targetName} from core systems.`);
  };

  // --- Attendance Records ---
  const handleSaveAttendance = (date: string, records: { employeeId: string; status: AttendanceRecord['status'] }[]) => {
    // Filter out old records for the exact date
    const cleared = attendance.filter(r => r.date !== date);
    
    // Add new batch
    const newBatch: AttendanceRecord[] = records.map((rec, i) => ({
      id: `att-${Date.now()}-${i}`,
      employeeId: rec.employeeId,
      date,
      status: rec.status
    }));

    const updated = [...cleared, ...newBatch];
    syncAndSave('crm_attendance', updated, setAttendance);
    triggerToast(`Roster logs saved for ${date}.`, 'success');
    logActivity('attendance', 'Attendance Confirmed', `Submitted daily roster checks for ${records.length} active employee files.`);
  };

  const handleApproveSalarySlip = (slip: SalarySlip) => {
    const exists = salarySlips.some(s => s.employeeId === slip.employeeId && s.month === slip.month && s.year === slip.year);
    let updated: SalarySlip[];
    if (exists) {
      updated = salarySlips.map(s => (s.employeeId === slip.employeeId && s.month === slip.month && s.year === slip.year) ? slip : s);
    } else {
      updated = [...salarySlips, slip];
    }
    syncAndSave('crm_salary_slips', updated, setSalarySlips);
    triggerToast(`Salary slip approved & published for ${slip.employeeName} (${slip.month} ${slip.year}).`, 'success');
    logActivity('payroll', 'Salary Slip Approved', `Approved and published monthly payslip for employee ${slip.employeeName} for ${slip.month} ${slip.year}.`);
  };

  // --- Kanban Tasks CRUD ---
  const handleAddTask = (newTask: Omit<Task, 'id'>) => {
    const taskWithId: Task = {
      ...newTask,
      id: `task-${Date.now()}`
    };
    const updated = [...tasks, taskWithId];
    syncAndSave('crm_tasks', updated, setTasks);
    triggerToast(`Kanban task "${newTask.title}" formulated.`, 'success');
    logActivity('task', 'Task Formulated', `Launched Kanban objective: "${newTask.title}" and assigned to internal staff.`);
  };

  const handleUpdateTaskStatus = (id: string, status: Task['status']) => {
    const matched = tasks.find(t => t.id === id);
    if (!matched) return;

    const updated = tasks.map(t => t.id === id ? { ...t, status } : t);
    syncAndSave('crm_tasks', updated, setTasks);
    
    triggerToast(`Task moved to ${status}.`, 'info');
    logActivity('task', 'Task State Shift', `Shifted objective "${matched.title}" state to ${status}.`);
  };

  const handleDeleteTask = (id: string) => {
    const matched = tasks.find(t => t.id === id);
    const updated = tasks.filter(t => t.id !== id);
    syncAndSave('crm_tasks', updated, setTasks);
    triggerToast('Objective removed from board.', 'warning');
    logActivity('task', 'Task Scrubbed', `Removed Kanban file of objective: "${matched?.title || 'Unknown'}".`);
  };

  // --- Candidates CRUD ---
  const handleAddCandidate = (newCand: Omit<Candidate, 'id'>) => {
    const candidateWithId: Candidate = {
      ...newCand,
      id: `cand-${Date.now()}`
    };
    const updated = [...candidates, candidateWithId];
    syncAndSave('crm_candidates', updated, setCandidates);
    triggerToast(`Candidate ${newCand.name} registered.`, 'success');
    logActivity('candidate', 'Candidate Added', `Added recruiting prospect ${newCand.name} to recruitment pipelines.`);
  };

  const handleEditCandidate = (modifiedCand: Candidate) => {
    const updated = candidates.map(c => c.id === modifiedCand.id ? modifiedCand : c);
    syncAndSave('crm_candidates', updated, setCandidates);
    triggerToast(`Prospect file updated.`, 'success');
    logActivity('candidate', 'Candidate Modified', `Modified skills portfolio and status details of ${modifiedCand.name}.`);
  };

  const handleDeleteCandidate = (id: string) => {
    const targetName = candidates.find(c => c.id === id)?.name || 'Unknown';
    const updated = candidates.filter(c => c.id !== id);
    syncAndSave('crm_candidates', updated, setCandidates);
    triggerToast('Prospect records deleted.', 'warning');
    logActivity('candidate', 'Candidate Removed', `Purged candidate profile logs of ${targetName}.`);
  };

  // --- Interviews Schedule CRUD ---
  const handleScheduleInterview = (newInt: Omit<Interview, 'id'>) => {
    const intWithId: Interview = {
      ...newInt,
      id: `int-${Date.now()}`
    };
    const updated = [...interviews, intWithId];
    syncAndSave('crm_interviews', updated, setInterviews);
    triggerToast(`Interview coordinated for ${newInt.candidateName}.`, 'success');
    logActivity('interview', 'Interview Scheduled', `Coordinated evaluation session for ${newInt.candidateName} with ${newInt.interviewer}.`);
  };

  const handleEditInterview = (modifiedInt: Interview) => {
    const updated = interviews.map(i => i.id === modifiedInt.id ? modifiedInt : i);
    syncAndSave('crm_interviews', updated, setInterviews);
    triggerToast('Evaluation assessment updated.', 'success');
    logActivity('interview', 'Interview Evaluation Modified', `Logged examiner results and feedback for prospect ${modifiedInt.candidateName}.`);
  };

  const handleDeleteInterview = (id: string) => {
    const matched = interviews.find(i => i.id === id);
    const updated = interviews.filter(i => i.id !== id);
    syncAndSave('crm_interviews', updated, setInterviews);
    triggerToast('Schedule entry cancelled.', 'warning');
    logActivity('interview', 'Schedule Removed', `Cancelled coordinated session for candidate ${matched?.candidateName || 'prospect'}.`);
  };

  // --- Clients CRUD ---
  const handleAddClient = (newCli: Omit<Client, 'id'>) => {
    const clientWithId: Client = {
      ...newCli,
      id: `cli-${Date.now()}`
    };
    const updated = [...clients, clientWithId];
    syncAndSave('crm_clients', updated, setClients);
    triggerToast(`Corporate client ${newCli.companyName} registered.`, 'success');
    logActivity('client', 'Client Registered', `Registered Enterprise Client profile for "${newCli.companyName}".`);
  };

  const handleEditClient = (modifiedCli: Client) => {
    const updated = clients.map(c => c.id === modifiedCli.id ? modifiedCli : c);
    syncAndSave('crm_clients', updated, setClients);
    triggerToast(`Corporate partner details modified.`, 'success');
    logActivity('client', 'Client Modified', `Modified liaison parameters and requirements for partner "${modifiedCli.companyName}".`);
  };

  const handleDeleteClient = (id: string) => {
    const targetName = clients.find(c => c.id === id)?.companyName || 'Unknown Partner';
    const updated = clients.filter(c => c.id !== id);
    syncAndSave('crm_clients', updated, setClients);
    triggerToast('Corporate partner profile removed.', 'warning');
    logActivity('client', 'Client Removed', `Removed company file and contracts for "${targetName}".`);
  };

  // --- Invoices CRUD ---
  const handleAddInvoice = (newInv: Omit<Invoice, 'id'>) => {
    const invoiceWithId: Invoice = {
      ...newInv,
      id: `inv-${Date.now()}`
    };
    const updated = [...invoices, invoiceWithId];
    syncAndSave('crm_invoices', updated, setInvoices);
    triggerToast(`Invoice ${newInv.invoiceNumber} drafted successfully.`, 'success');
    logActivity('client', 'Invoice Created', `Generated itemized Tax Invoice ${newInv.invoiceNumber} for client "${newInv.clientName}".`);
  };

  const handleUpdateInvoiceStatus = (id: string, status: Invoice['status']) => {
    const matched = invoices.find(inv => inv.id === id);
    if (!matched) return;
    const updated = invoices.map(inv => inv.id === id ? { ...inv, status } : inv);
    syncAndSave('crm_invoices', updated, setInvoices);
    triggerToast(`Invoice ${matched.invoiceNumber} status is now ${status}.`, 'info');
    logActivity('client', 'Invoice Status Shift', `Set billing invoice ${matched.invoiceNumber} status to ${status}.`);
  };

  const handleDeleteInvoice = (id: string) => {
    const matched = invoices.find(inv => inv.id === id);
    const updated = invoices.filter(inv => inv.id !== id);
    syncAndSave('crm_invoices', updated, setInvoices);
    triggerToast(`Invoice deleted.`, 'warning');
    logActivity('client', 'Invoice Scrubbed', `Permanently deleted Invoice ${matched?.invoiceNumber || 'Unknown'} from files.`);
  };

  // --- Issues CRUD ---
  const handleAddIssue = (newIssue: Omit<AssistsIssue, 'id'>) => {
    const issueWithId: AssistsIssue = {
      ...newIssue,
      id: `iss-${Date.now()}`
    };
    const updated = [...issues, issueWithId];
    syncAndSave('crm_issues', updated, setIssues);
    triggerToast(`Support ticket logged successfully.`, 'success');
    logActivity('attendance', 'Ticket Logged', `Logged support ticket regarding "${newIssue.title}" for employee ${newIssue.employeeName}.`);
  };

  const handleUpdateIssueStatus = (id: string, status: AssistsIssue['status'], adminNotes?: string) => {
    const matched = issues.find(is => is.id === id);
    if (!matched) return;
    const updated = issues.map(is => is.id === id ? { ...is, status, adminNotes } : is);
    syncAndSave('crm_issues', updated, setIssues);
    triggerToast(`Ticket updated.`, 'info');
    logActivity('attendance', 'Ticket Updated', `Updated helpdesk ticket regarding "${matched.title}" to status ${status}.`);
  };

  const handleDeleteIssue = (id: string) => {
    const matched = issues.find(is => is.id === id);
    const updated = issues.filter(is => is.id !== id);
    syncAndSave('crm_issues', updated, setIssues);
    triggerToast(`Ticket scrubbed.`, 'warning');
    logActivity('attendance', 'Ticket Removed', `Purged helpdesk ticket regarding "${matched?.title || 'Unknown'}" from archives.`);
  };

  // --- Equipment Assignments CRUD ---
  const handleAddEquipment = (newEq: Omit<EquipmentAssignment, 'id'>) => {
    const eqWithId: EquipmentAssignment = {
      ...newEq,
      id: `eq-${Date.now()}`
    };
    const updated = [...equipment, eqWithId];
    syncAndSave('crm_equipment', updated, setEquipment);
    triggerToast(`Equipment assigned successfully.`, 'success');
    logActivity('attendance', 'Equipment Assigned', `Assigned "${newEq.itemName}" to ${newEq.employeeName}.`);
  };

  const handleUpdateEquipment = (modifiedEq: EquipmentAssignment) => {
    const updated = equipment.map(eq => eq.id === modifiedEq.id ? modifiedEq : eq);
    syncAndSave('crm_equipment', updated, setEquipment);
    triggerToast(`Equipment assignment updated.`, 'info');
    logActivity('attendance', 'Equipment Modified', `Modified allocation parameters for ${modifiedEq.itemName}.`);
  };

  const handleDeleteEquipment = (id: string) => {
    const matched = equipment.find(eq => eq.id === id);
    const updated = equipment.filter(eq => eq.id !== id);
    syncAndSave('crm_equipment', updated, setEquipment);
    triggerToast(`Equipment record removed.`, 'warning');
    logActivity('attendance', 'Equipment Deassigned', `Decommissioned assignment of ${matched?.itemName || 'asset'} for ${matched?.employeeName || 'employee'}.`);
  };

  // 9. Core View Router
  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardView 
            employees={employees}
            candidates={candidates}
            tasks={tasks}
            interviews={interviews}
            clients={clients}
            activities={activities}
            onNavigateToView={(view) => navigateToViewWithData(view)}
          />
        );
      case 'employees':
        return (
          <EmployeeView 
            employees={employees}
            issues={issues}
            equipment={equipment}
            onAddIssue={handleAddIssue}
            onUpdateIssueStatus={handleUpdateIssueStatus}
            onAddEmployee={handleAddEmployee}
            onEditEmployee={handleEditEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onNavigateToView={navigateToViewWithData}
            onAddEquipment={handleAddEquipment}
            onUpdateEquipment={handleUpdateEquipment}
            onDeleteEquipment={handleDeleteEquipment}
            onboardCandidate={transientData?.onboardCandidate}
          />
        );
      case 'attendance':
        return (
          <AttendanceView 
            employees={employees}
            attendance={attendance}
            onSaveAttendance={handleSaveAttendance}
            selectedEmpIdFromNavigation={transientData?.employeeId}
          />
        );
      case 'payroll':
        return (
          <PayrollView 
            employees={employees}
            attendance={attendance}
            selectedEmpId={transientData?.employeeId}
            salarySlips={salarySlips}
            onApproveSalarySlip={handleApproveSalarySlip}
          />
        );
      case 'tasks':
        return (
          <KanbanView 
            tasks={tasks}
            employees={employees}
            onAddTask={handleAddTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onDeleteTask={handleDeleteTask}
          />
        );
      case 'candidates':
        return (
          <CandidateView 
            candidates={candidates}
            onAddCandidate={handleAddCandidate}
            onEditCandidate={handleEditCandidate}
            onDeleteCandidate={handleDeleteCandidate}
            onNavigateToView={navigateToViewWithData}
          />
        );
      case 'interviews':
        return (
          <InterviewView 
            interviews={interviews}
            candidates={candidates}
            employees={employees}
            onScheduleInterview={handleScheduleInterview}
            onEditInterview={handleEditInterview}
            onDeleteInterview={handleDeleteInterview}
            deepLinkedCandidateId={transientData?.candidateId}
          />
        );
      case 'clients':
        return (
          <ClientView 
            clients={clients}
            onAddClient={handleAddClient}
            onEditClient={handleEditClient}
            onDeleteClient={handleDeleteClient}
          />
        );
      case 'invoices':
        return (
          <InvoiceView 
            clients={clients}
            invoices={invoices}
            onAddInvoice={handleAddInvoice}
            onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
            onDeleteInvoice={handleDeleteInvoice}
          />
        );
      case 'issues':
        return (
          <IssueView 
            employees={employees}
            issues={issues}
            equipment={equipment}
            onAddIssue={handleAddIssue}
            onUpdateIssueStatus={handleUpdateIssueStatus}
            onDeleteIssue={handleDeleteIssue}
            selectedEmpId={transientData?.employeeId}
            onAddEquipment={handleAddEquipment}
            onUpdateEquipment={handleUpdateEquipment}
            onDeleteEquipment={handleDeleteEquipment}
          />
        );
      case 'leaves':
        return (
          <LeavesView 
            leaveRequests={leaveRequests}
            employees={employees}
            onApproveLeave={handleApproveLeave}
            onRejectLeave={handleRejectLeave}
          />
        );
      case 'admin-manage':
        return (
          <AdminManageView 
            candidates={candidates}
            employees={employees}
            onAddEmployee={handleAddEmployee}
            onEditEmployee={handleEditEmployee}
            currentAdminEmail={currentAdminEmail}
            onTriggerToast={triggerToast}
            onLogActivity={logActivity}
          />
        );
      default:
        return <div className="text-slate-100 font-bold">Workspace Loading...</div>;
    }
  };

  // 10. Master Layout Render
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col items-center justify-center font-sans relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(56,189,248,0.15)_0%,_transparent_50%),radial-gradient(circle_at_10%_20%,_rgba(139,92,246,0.18)_0%,_transparent_40%)] pointer-events-none z-0" />
        <div className="text-center space-y-4 z-10 max-w-sm px-6">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-teal-500/10" />
            <div className="absolute inset-0 rounded-full border-4 border-teal-400 border-t-transparent animate-spin" />
          </div>
          <h2 className="text-sm font-extrabold tracking-widest text-slate-300 uppercase">Synchronizing Workspace</h2>
          <p className="text-[11px] text-slate-500 leading-normal font-mono">Connecting to high-integrity cloud-persistent database...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (!showLogin) {
      return (
        <FrontPage 
          employeeCount={employees.length}
          candidateCount={candidates.length}
          taskCount={tasks.filter(t => t.status !== 'Completed').length}
          clientCount={clients.length}
          onLaunchPortal={() => setShowLogin(true)}
        />
      );
    }

    // Stunning Ambient Glassmorphic Security Login Gateway
    return (
      <div 
        id="login-gateway"
        className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden font-sans"
      >
        {/* Background glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-full max-w-lg relative z-10 my-8">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative">
            
            {/* Header Identity */}
            <div className="text-center mb-6">
              <div className="mx-auto bg-gradient-to-tr from-sky-400 to-indigo-500 p-3 rounded-2xl w-14 h-14 flex items-center justify-center shadow-lg shadow-sky-500/20 mb-4">
                <Building className="h-7 w-7 text-slate-950 font-bold" />
              </div>
              <h2 className="text-2xl font-black text-slate-100 tracking-tight uppercase">
                CRM Portal Security Gateway
              </h2>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                Establish a secure authenticated session to access the platform.
              </p>
            </div>

            {/* Error Prompt */}
            {loginError && (
              <div 
                id="login-error-alert"
                className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2.5"
              >
                <ShieldAlert className="h-4.5 w-4.5 text-rose-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {isForgotPassword ? (
              // Forgot Password Layout
              <div className="space-y-5 animate-fade-in">
                <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-5 text-slate-300 space-y-3.5">
                  <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-sky-400" />
                    <span>Credentials Recovery Protocol</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Enter your registered workspace email address below. The security system will verify our records and simulate generating a secure access key sent to your inbox.
                  </p>
                </div>

                {resetStatus === 'checking' || resetStatus === 'sending' ? (
                  // SMTP dispatch console logs
                  <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 font-mono text-[10px] text-sky-400 space-y-3 shadow-inner">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2 text-slate-500 uppercase tracking-widest text-[9px] font-bold">
                      <Terminal className="h-3 w-3 text-sky-400 animate-pulse" />
                      <span>SMTP Secure Transit Log</span>
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {smtpLogs.map((log, index) => (
                        <div key={index} className="leading-relaxed flex items-start gap-1">
                          <span className="text-slate-600 select-none font-bold">❯</span>
                          <span>{log}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 pt-1 text-[9px] text-slate-500 font-sans">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                      </span>
                      <span>Processing secure dispatch pipeline...</span>
                    </div>
                  </div>
                ) : resetStatus === 'success' ? (
                  // Success status screen
                  <div className="space-y-4 animate-scale-up">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-center space-y-3">
                      <div className="mx-auto bg-emerald-500/20 text-emerald-400 rounded-full h-12 w-12 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-slate-100 uppercase tracking-wider">Reset Dispatched Successfully</h4>
                        <p className="text-xs text-slate-400">Secure access key has been transmitted to target inbox:</p>
                        <p className="text-xs text-sky-400 font-bold font-mono select-all break-all">{resetEmail}</p>
                      </div>
                    </div>

                    <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-3.5">
                      <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block text-center">
                        Regenerated Security Access Key
                      </div>
                      <div className="flex items-center justify-between bg-slate-950 border border-white/15 rounded-xl p-3.5">
                        <code className="text-base font-black text-amber-400 tracking-wider font-mono select-all">{generatedPassword}</code>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(generatedPassword);
                            triggerToast('Security key copied to clipboard!', 'success');
                          }}
                          className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition active:scale-95 cursor-pointer"
                          title="Copy Code"
                        >
                          <Copy className="h-4.5 w-4.5 text-sky-400" />
                        </button>
                      </div>
                      <div className="text-[10px] text-center text-slate-500 font-mono leading-relaxed">
                        Copy and use this newly generated key to authenticate into your workspace.
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(false);
                        setResetStatus('idle');
                        setResetEmail('');
                        setLoginEmail(resetEmail);
                        setLoginPassword(generatedPassword);
                      }}
                      className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 font-black py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/10 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Authenticate Session with New Key</span>
                    </button>
                  </div>
                ) : (
                  // Entry form
                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                        Registered Workspace Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                        <input
                          type="email"
                          required
                          placeholder="e.g. employee@company.com"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="w-full bg-slate-950/60 border border-white/10 focus:border-sky-400 rounded-xl py-2.5 pl-11 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 font-black py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/10 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <KeyRound className="h-4 w-4" />
                      <span>Dispatch Security Reset Key</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(false);
                        setResetStatus('idle');
                        setResetEmail('');
                        setLoginError('');
                      }}
                      className="w-full bg-slate-950/20 hover:bg-slate-950/40 text-slate-400 hover:text-slate-300 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-white/5 hover:border-white/10 transition active:scale-95 cursor-pointer"
                    >
                      <ArrowLeft className="h-3.5 w-3.5 text-slate-400" />
                      <span>Return to Authenticator</span>
                    </button>
                  </form>
                )}
              </div>
            ) : (
              // Standard Login / Signup Block
              <div className="space-y-4">
                <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-5 mb-6 text-slate-300 space-y-3.5">
                  <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase flex items-center gap-2">
                    <Building className="h-4 w-4 text-sky-400" />
                    <span>Unified CRM & HRM Gateway</span>
                  </h3>
                  
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Sign in to your account. The security system automatically identifies whether you are an Administrator, Employee, or Candidate and logs you into the correct dashboard scope.
                  </p>

                  <div className="pt-2.5 border-t border-white/5 flex items-start gap-2 text-[10px] text-slate-500 font-mono">
                    <span className="text-sky-400 font-black shrink-0">❖</span>
                    <span>
                      First-time Administrator sign-ups automatically generate an isolated corporate workspace on the cloud.
                    </span>
                  </div>
                </div>

                {/* Primary Action Button */}
                <button
                  type="button"
                  id="btn-google-login"
                  onClick={handleGoogleLogin}
                  className="w-full bg-gradient-to-r from-sky-500/10 to-indigo-500/10 hover:from-sky-500/20 hover:to-indigo-500/20 text-white font-extrabold py-4 rounded-2xl text-xs flex items-center justify-center gap-3 border border-sky-500/30 hover:border-sky-400/60 shadow-lg shadow-sky-500/5 hover:shadow-sky-500/10 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Chrome className="h-5 w-5 text-sky-400" />
                  <span className="tracking-wide">Authenticate securely with Google</span>
                </button>

                {/* Email and Password Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#101726] px-4 text-slate-500 font-mono font-bold text-[10px] tracking-widest">
                      Or use Email & Password
                    </span>
                  </div>
                </div>

                {/* Form Mode Tabs */}
                <div className="flex items-center justify-center gap-4 mb-4 border-b border-white/5 pb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setLoginError('');
                    }}
                    className={`text-[11px] font-black uppercase tracking-wider pb-1 px-2.5 transition-all border-b-2 cursor-pointer ${
                      !isSignUp
                        ? 'border-sky-400 text-sky-400 font-extrabold'
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setLoginError('');
                      setLoginRole('admin'); // default registration as admin
                    }}
                    className={`text-[11px] font-black uppercase tracking-wider pb-1 px-2.5 transition-all border-b-2 cursor-pointer ${
                      isSignUp
                        ? 'border-sky-400 text-sky-400 font-extrabold'
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Sign Up / Register
                  </button>
                </div>

                {/* Login / Signup Form */}
                <form 
                  onSubmit={(e) => handleLogin(e, loginRole, isSignUp, {
                    name: regName,
                    email: regEmail,
                    phone: regPhone,
                    password: regPassword,
                    department: regDept,
                    role: regRole,
                    salary: regSalary
                  })} 
                  className="space-y-4 mb-4"
                >
                  {isSignUp ? (
                    // Sign Up Fields
                    <div className="space-y-4">
                      {/* Register type choice inside Sign Up */}
                      <div className="space-y-1.5 mb-2">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Register Profile Type</label>
                        <div className="grid grid-cols-2 gap-1.5 bg-slate-950/60 p-1 rounded-2xl border border-white/5">
                          <button
                            type="button"
                            onClick={() => setLoginRole('admin')}
                            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              loginRole === 'admin'
                                ? 'bg-sky-500 text-slate-950 font-black shadow-md'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Administrator
                          </button>
                          <button
                            type="button"
                            onClick={() => setLoginRole('employee')}
                            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              loginRole === 'employee'
                                ? 'bg-indigo-500 text-white font-black shadow-md'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Employee
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Full Legal Name</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Elena Rostova"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            className="w-full bg-slate-950/60 border border-white/10 focus:border-sky-400 rounded-xl py-2.5 pl-11 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                          <input
                            type="email"
                            required
                            placeholder="e.g. elena@crm.com"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            className="w-full bg-slate-950/60 border border-white/10 focus:border-sky-400 rounded-xl py-2.5 pl-11 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      {loginRole === 'employee' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Phone Number</label>
                            <div className="relative">
                              <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                              <input
                                type="text"
                                required
                                placeholder="+1-555-0102"
                                value={regPhone}
                                onChange={(e) => setRegPhone(e.target.value)}
                                className="w-full bg-slate-950/60 border border-white/10 focus:border-indigo-400 rounded-xl py-2.5 pl-11 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Annual Salary ($)</label>
                            <div className="relative">
                              <Coins className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                              <input
                                type="number"
                                required
                                placeholder="75000"
                                value={regSalary}
                                onChange={(e) => setRegSalary(e.target.value)}
                                className="w-full bg-slate-950/60 border border-white/10 focus:border-indigo-400 rounded-xl py-2.5 pl-11 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {loginRole === 'employee' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Department</label>
                            <select
                              value={regDept}
                              onChange={(e) => setRegDept(e.target.value)}
                              className="w-full bg-slate-950/60 border border-white/10 focus:border-indigo-400 rounded-xl py-2.5 px-4 text-xs text-slate-200 focus:outline-none transition-all"
                            >
                              <option value="Engineering">Engineering</option>
                              <option value="Product">Product Management</option>
                              <option value="Sales">Sales & Account Management</option>
                              <option value="Marketing">Growth & Marketing</option>
                              <option value="HR">Human Resources</option>
                              <option value="Support">Customer Support</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Job Designation</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Software Engineer"
                              value={regRole}
                              onChange={(e) => setRegRole(e.target.value)}
                              className="w-full bg-slate-950/60 border border-white/10 focus:border-indigo-400 rounded-xl py-2.5 px-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                            />
                          </div>
                        </div>
                      ) : null}

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Secure Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                          <input
                            type="password"
                            required
                            placeholder="Choose security password..."
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            className="w-full bg-slate-950/60 border border-white/10 focus:border-sky-400 rounded-xl py-2.5 pl-11 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Sign In Fields - Totally Unified!
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                          Email Address or Phone Number
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                          <input
                            id="login-email"
                            type="text"
                            required
                            placeholder="e.g. admin@crm.com, elena@crm.com, or Phone Number"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="w-full bg-slate-950/60 border border-white/10 focus:border-sky-400 rounded-xl py-2.5 pl-11 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Access Password</label>
                          <button
                            type="button"
                            onClick={() => {
                              setIsForgotPassword(true);
                              setResetEmail(loginEmail);
                              setResetStatus('idle');
                              setLoginError('');
                            }}
                            className="text-[10px] text-sky-400 hover:text-sky-300 font-bold tracking-wide transition-all cursor-pointer"
                          >
                            Forgot Password?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                          <input
                            id="login-password"
                            type="password"
                            required
                            placeholder="••••••"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full bg-slate-950/60 border border-white/10 focus:border-sky-400 rounded-xl py-2.5 pl-11 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    id="btn-login-submit"
                    type="submit"
                    className="w-full mt-2 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/10 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>{isSignUp ? 'Create Workspace Account' : 'Authenticate Session'}</span>
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => {
                    setShowLogin(false);
                    setLoginError('');
                  }}
                  className="w-full bg-slate-950/20 hover:bg-slate-950/40 text-slate-400 hover:text-slate-300 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-white/5 hover:border-white/10 transition active:scale-95 cursor-pointer"
                >
                  <span>← Return to Front Page</span>
                </button>
              </div>
            )}

          </div>
        </div>
        <Toast toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  // Fully Authorized Dashboard Workspace Layout
  if (userType === 'employee') {
    return (
      <EmployeePortal 
        employee={currentEmployee!}
        attendanceRecords={attendance}
        leaveRequests={leaveRequests}
        salarySlips={salarySlips}
        onLogout={handleLogout}
        onAddAttendanceRecord={handleAddAttendanceRecord}
        onApplyLeave={handleApplyLeave}
      />
    );
  }

  if (userType === 'candidate') {
    return (
      <CandidatePortal 
        candidateEmail={userEmail}
        onLogout={handleLogout}
        triggerToast={triggerToast}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex overflow-hidden font-sans relative">
      {/* Absolute Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(56,189,248,0.15)_0%,_transparent_50%),radial-gradient(circle_at_10%_20%,_rgba(139,92,246,0.18)_0%,_transparent_40%)] pointer-events-none z-0" />
      
      {/* Sidebar navigation */}
      <Sidebar 
        activeView={activeView} 
        setActiveView={(view) => navigateToViewWithData(view)} 
        onLogout={handleLogout}
        userEmail={userEmail}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        
        {/* Navbar */}
        <Navbar activeView={activeView} userEmail={userEmail} />

        {/* Dynamic View Scrollport */}
        <main 
          id="app-workspace-body"
          className="flex-1 overflow-y-auto px-8 py-6 bg-transparent"
        >
          {renderActiveView()}
        </main>
      </div>

      {/* Global Toast Manager alerts */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
