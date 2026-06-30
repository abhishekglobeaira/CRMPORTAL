/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Employee, Candidate, Task, Interview, Client, AttendanceRecord, ActivityLog, Invoice, AssistsIssue, EquipmentAssignment } from './types';

export const initialEmployees: Employee[] = [
  {
    id: 'emp-1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@company.com',
    role: 'Lead Software Engineer',
    salary: 115000,
    department: 'Engineering',
    phone: '+1 (555) 234-5678',
    joiningDate: '2023-03-15',
    status: 'Active',
    employmentType: 'Full-Time',
    emergencyContact: 'John Jenkins (Spouse) - +1 (555) 234-5679',
    notes: 'Primary architect for the core cloud architecture. Outstanding contributor with strong leadership skills.'
  },
  {
    id: 'emp-2',
    name: 'Marcus Chen',
    email: 'm.chen@company.com',
    role: 'Senior UI/UX Designer',
    salary: 95000,
    department: 'Design',
    phone: '+1 (555) 345-6789',
    joiningDate: '2024-01-10',
    status: 'Active',
    employmentType: 'Full-Time',
    emergencyContact: 'Linda Chen (Mother) - +1 (555) 345-6780',
    notes: 'Leads the brand experience team. Extremely creative and has a great eye for detail.'
  },
  {
    id: 'emp-3',
    name: 'Elena Rostova',
    email: 'elena.r@company.com',
    role: 'HR Director',
    salary: 88000,
    department: 'Human Resources',
    phone: '+1 (555) 456-7890',
    joiningDate: '2022-08-01',
    status: 'Active',
    employmentType: 'Full-Time',
    emergencyContact: 'Dmitri Rostov (Brother) - +1 (555) 456-7891',
    notes: 'Manages global personnel, benefits enrollment, and organizational compliance matrices.'
  },
  {
    id: 'emp-4',
    name: 'David Kim',
    email: 'd.kim@company.com',
    role: 'Product Manager',
    salary: 105000,
    department: 'Product',
    phone: '+1 (555) 567-8901',
    joiningDate: '2023-11-20',
    status: 'Active',
    employmentType: 'Full-Time',
    emergencyContact: 'Soo-Min Kim (Wife) - +1 (555) 567-8902',
    notes: 'Orchestrates agile product releases and gathers enterprise telemetry metrics.'
  },
  {
    id: 'emp-5',
    name: 'Aisha Bello',
    email: 'aisha.b@company.com',
    role: 'Sales Representative',
    salary: 72000,
    department: 'Sales',
    phone: '+1 (555) 678-9012',
    joiningDate: '2025-02-15',
    status: 'On Leave',
    employmentType: 'Full-Time',
    emergencyContact: 'Ibrahim Bello (Father) - +1 (555) 678-9013',
    notes: 'Focuses on regional mid-market CRM subscriptions. Currently on approved personal leave.'
  },
  {
    id: 'emp-6',
    name: 'Rohan Sharma',
    email: 'rohan.s@company.com',
    role: 'IT Support Administrator',
    salary: 80000,
    department: 'IT',
    phone: '+1 (555) 789-0123',
    joiningDate: '2024-05-10',
    status: 'Active',
    employmentType: 'Full-Time',
    emergencyContact: 'Asha Sharma (Mother) - +1 (555) 789-0124',
    notes: 'Manages workspace identity systems, network firewalls, and employee laptops provisioning.'
  },
  {
    id: 'emp-7',
    name: 'Vikram Singh',
    email: 'v.singh@company.com',
    role: 'Infrastructure Engineer',
    salary: 85000,
    department: 'Infrastructure',
    phone: '+1 (555) 890-1234',
    joiningDate: '2023-09-01',
    status: 'Active',
    employmentType: 'Full-Time',
    emergencyContact: 'Kiran Singh (Wife) - +1 (555) 890-1235',
    notes: 'Manages physical site operations, hardware equipment racks, cooling grids, and utility servers.'
  }
];

export const initialCandidates: Candidate[] = [
  {
    id: 'cand-1',
    name: 'Liam Neeson',
    skills: 'React, TypeScript, Node.js, AWS',
    experience: '5 years',
    status: 'Interview'
  },
  {
    id: 'cand-2',
    name: 'Sophia Martinez',
    skills: 'Figma, Adobe XD, Prototyping, User Research',
    experience: '3 years',
    status: 'Selected'
  },
  {
    id: 'cand-3',
    name: 'Oliver Vance',
    skills: 'B2B Sales, Cold Calling, Salesforce, Negotiation',
    experience: '4 years',
    status: 'New'
  },
  {
    id: 'cand-4',
    name: 'Emily Watson',
    skills: 'Technical Recruiting, Payroll Administration, Conflict Resolution',
    experience: '6 years',
    status: 'Rejected'
  }
];

export const initialInterviews: Interview[] = [
  {
    id: 'int-1',
    candidateId: 'cand-1',
    candidateName: 'Liam Neeson',
    date: '2026-06-26',
    time: '10:00',
    interviewer: 'Sarah Jenkins',
    status: 'Scheduled',
    feedback: 'Scheduled technical round with Sarah.',
    result: 'Pending'
  },
  {
    id: 'int-2',
    candidateId: 'cand-2',
    candidateName: 'Sophia Martinez',
    date: '2026-06-24',
    time: '14:30',
    interviewer: 'Marcus Chen',
    status: 'Completed',
    feedback: 'Excellent portfolio review. Strong aesthetic sense and solid interaction design skills.',
    result: 'Passed'
  },
  {
    id: 'int-3',
    candidateId: 'cand-3',
    candidateName: 'Oliver Vance',
    date: '2026-06-28',
    time: '11:00',
    interviewer: 'Elena Rostova',
    status: 'Scheduled',
    feedback: 'Initial HR screening to discuss company culture and expectations.',
    result: 'Pending'
  }
];

export const initialClients: Client[] = [
  {
    id: 'cli-1',
    companyName: 'Apex Technology Solutions',
    contactPerson: 'Robert Downey',
    email: 'robert@apextech.com',
    requirements: 'Needs a full team of 3 React developers and 1 DevOps engineer for a 6-month contract.'
  },
  {
    id: 'cli-2',
    companyName: 'Vanguard Creative Group',
    contactPerson: 'Scarlett Johansson',
    email: 'scarlett@vanguard.studio',
    requirements: 'UI/UX Redesign for their primary e-commerce web platform and mobile app.'
  },
  {
    id: 'cli-3',
    companyName: 'Nova Health Services',
    contactPerson: 'Bruce Banner',
    email: 'bruce@novahealth.org',
    requirements: 'Secure HIPAA-compliant data pipeline and dashboard development for patient records.'
  }
];

// Helper to generate attendance for the past 3 days
const getPastDateStr = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const initialAttendance: AttendanceRecord[] = [
  // DaysAgo = 2
  { id: 'att-1', employeeId: 'emp-1', date: getPastDateStr(2), status: 'Present' },
  { id: 'att-2', employeeId: 'emp-2', date: getPastDateStr(2), status: 'Present' },
  { id: 'att-3', employeeId: 'emp-3', date: getPastDateStr(2), status: 'Present' },
  { id: 'att-4', employeeId: 'emp-4', date: getPastDateStr(2), status: 'Leave' },
  { id: 'att-5', employeeId: 'emp-5', date: getPastDateStr(2), status: 'Present' },

  // DaysAgo = 1
  { id: 'att-6', employeeId: 'emp-1', date: getPastDateStr(1), status: 'Present' },
  { id: 'att-7', employeeId: 'emp-2', date: getPastDateStr(1), status: 'Absent' },
  { id: 'att-8', employeeId: 'emp-3', date: getPastDateStr(1), status: 'Present' },
  { id: 'att-9', employeeId: 'emp-4', date: getPastDateStr(1), status: 'Present' },
  { id: 'att-10', employeeId: 'emp-5', date: getPastDateStr(1), status: 'Present' },

  // Today
  { id: 'att-11', employeeId: 'emp-1', date: getPastDateStr(0), status: 'Present' },
  { id: 'att-12', employeeId: 'emp-2', date: getPastDateStr(0), status: 'Present' },
  { id: 'att-13', employeeId: 'emp-3', date: getPastDateStr(0), status: 'Present' },
  { id: 'att-14', employeeId: 'emp-4', date: getPastDateStr(0), status: 'Present' },
  { id: 'att-15', employeeId: 'emp-5', date: getPastDateStr(0), status: 'Present' }
];

export const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Design Client CRM Flowcharts',
    description: 'Map out the user experience flowcharts for Apex Technology CRM onboarding portal.',
    status: 'In Progress',
    assignedEmployeeId: 'emp-2',
    priority: 'High',
    dueDate: '2026-06-29'
  },
  {
    id: 'task-2',
    title: 'Update Q2 Employee Handbook',
    description: 'Refine policies on remote work, health benefits, and equipment allocation budgets.',
    status: 'To Do',
    assignedEmployeeId: 'emp-3',
    priority: 'Medium',
    dueDate: '2026-07-05'
  },
  {
    id: 'task-3',
    title: 'Migrate DB to Cloud Production',
    description: 'Complete final backup and transfer patient records database to secure VPC container.',
    status: 'Completed',
    assignedEmployeeId: 'emp-1',
    priority: 'High',
    dueDate: '2026-06-24'
  },
  {
    id: 'task-4',
    title: 'Prepare Sales Pitch Deck',
    description: 'Create slide content and pricing models for the Vanguard Creative pitch next Tuesday.',
    status: 'To Do',
    assignedEmployeeId: 'emp-5',
    priority: 'Low',
    dueDate: '2026-06-30'
  },
  {
    id: 'task-5',
    title: 'Define MVP Feature Spec',
    description: 'Collaborate with Sarah to outline technical milestones for medical registry UI draft.',
    status: 'In Progress',
    assignedEmployeeId: 'emp-4',
    priority: 'Medium',
    dueDate: '2026-06-28'
  }
];

export const initialActivities: ActivityLog[] = [
  {
    id: 'act-1',
    type: 'employee',
    action: 'Employee Added',
    details: 'Sarah Jenkins was added to the Engineering department.',
    timestamp: '2 hours ago'
  },
  {
    id: 'act-2',
    type: 'interview',
    action: 'Interview Scheduled',
    details: 'Scheduled Technical Interview for candidate Liam Neeson with Sarah Jenkins.',
    timestamp: '4 hours ago'
  },
  {
    id: 'act-3',
    type: 'task',
    action: 'Task Status Updated',
    details: 'Task "Migrate DB to Cloud Production" was marked as Completed by Sarah Jenkins.',
    timestamp: '1 day ago'
  },
  {
    id: 'act-4',
    type: 'client',
    action: 'New Client Registered',
    details: 'Apex Technology Solutions was registered by Aisha Bello.',
    timestamp: '2 days ago'
  },
  {
    id: 'act-5',
    type: 'attendance',
    action: 'Attendance Confirmed',
    details: 'Attendance record submitted for all 5 active employees.',
    timestamp: 'Today, 09:00 AM'
  }
];

export const initialInvoices: Invoice[] = [
  {
    id: 'inv-1',
    clientId: 'cli-1',
    clientName: 'Apex Technology Solutions',
    invoiceNumber: 'INV-2026-001',
    issueDate: '2026-06-01',
    dueDate: '2026-07-01',
    items: [
      { description: 'React Developer Resource (3 staff - Contract)', quantity: 3, rate: 85000, total: 255000 },
      { description: 'DevOps Engineer Infrastructure Provisioning', quantity: 1, rate: 95000, total: 95000 }
    ],
    subtotal: 350000,
    taxRate: 18,
    taxAmount: 63000,
    discount: 5000,
    grandTotal: 408000,
    status: 'Unpaid'
  },
  {
    id: 'inv-2',
    clientId: 'cli-2',
    clientName: 'Vanguard Creative Group',
    invoiceNumber: 'INV-2026-002',
    issueDate: '2026-05-15',
    dueDate: '2026-06-15',
    items: [
      { description: 'UI/UX E-Commerce Redesign Phase 1', quantity: 1, rate: 120000, total: 120000 },
      { description: 'Mobile App Wireframes & Figma Prototypes', quantity: 1, rate: 80000, total: 80000 }
    ],
    subtotal: 200000,
    taxRate: 18,
    taxAmount: 36000,
    discount: 10000,
    grandTotal: 226000,
    status: 'Paid'
  },
  {
    id: 'inv-3',
    clientId: 'cli-3',
    clientName: 'Nova Health Services',
    invoiceNumber: 'INV-2026-003',
    issueDate: '2026-06-10',
    dueDate: '2026-07-10',
    items: [
      { description: 'HIPAA Data Pipeline Auditing & Setup', quantity: 1, rate: 150000, total: 150000 }
    ],
    subtotal: 150000,
    taxRate: 18,
    taxAmount: 27000,
    discount: 0,
    grandTotal: 177000,
    status: 'Overdue'
  }
];

export const initialIssues: AssistsIssue[] = [
  {
    id: 'iss-1',
    title: 'Workspace VPN Connection Issues',
    category: 'IT Support',
    severity: 'High',
    description: 'Unable to connect to security container nodes from home workstation. DNS error timed out.',
    employeeId: 'emp-1',
    employeeName: 'Sarah Jenkins',
    status: 'Pending',
    dateCreated: '2026-06-24',
    adminNotes: 'Checking remote firewall and IP whitelisting rules.'
  },
  {
    id: 'iss-2',
    title: 'Health Insurance Card Enrollment Confirmation',
    category: 'HR Query',
    severity: 'Medium',
    description: 'Enrolled for family dental and health package last week, need official ID copy for medical center.',
    employeeId: 'emp-2',
    employeeName: 'Marcus Chen',
    status: 'In Progress',
    dateCreated: '2026-06-23',
    adminNotes: 'HR team is contacting provider for digital PDF cards.'
  },
  {
    id: 'iss-3',
    title: 'Faulty Monitor Screen Flickering',
    category: 'Assets & Equipment',
    severity: 'Low',
    description: 'The second 4K monitor issued last month has severe vertical lines and flickering issues.',
    employeeId: 'emp-4',
    employeeName: 'David Kim',
    status: 'Resolved',
    dateCreated: '2026-06-20',
    adminNotes: 'Replaced with a brand new unit from storage inventory.'
  }
];

export const initialEquipment: EquipmentAssignment[] = [
  {
    id: 'eq-1',
    employeeId: 'emp-1',
    employeeName: 'Sarah Jenkins',
    itemName: 'MacBook Pro M3 Max (16-inch, 64GB)',
    serialNumber: 'C02F89DKMD6T',
    type: 'Laptop',
    status: 'Assigned',
    assignedDate: '2024-11-12',
    condition: 'Excellent',
    notes: 'Main work laptop. Upgraded memory spec for dockerized VM testing.'
  },
  {
    id: 'eq-2',
    employeeId: 'emp-1',
    employeeName: 'Sarah Jenkins',
    itemName: 'Dell UltraSharp 32" 4K Video Conferencing Monitor',
    serialNumber: 'MX-98321-48A',
    type: 'Monitor',
    status: 'Assigned',
    assignedDate: '2024-11-15',
    condition: 'Good',
    notes: 'Includes integrated webcam and speaker bar.'
  },
  {
    id: 'eq-3',
    employeeId: 'emp-2',
    employeeName: 'Marcus Chen',
    itemName: 'iPad Pro 12.9" with Apple Pencil',
    serialNumber: 'DLX-8392-AP',
    type: 'Mobile Device',
    status: 'Assigned',
    assignedDate: '2025-02-01',
    condition: 'Excellent',
    notes: 'For hand-drawn interface wires and visual design prototypes.'
  },
  {
    id: 'eq-4',
    employeeId: 'emp-4',
    employeeName: 'David Kim',
    itemName: 'Keychron Q6 Pro Mechanical Keyboard',
    serialNumber: 'KC-Q6-8291',
    type: 'Keyboard/Mouse',
    status: 'Assigned',
    assignedDate: '2024-12-05',
    condition: 'Excellent',
    notes: 'Ergonomic input hardware. Requested due to repetitive strain prevention.'
  },
  {
    id: 'eq-5',
    employeeId: 'emp-6',
    employeeName: 'Rohan Sharma',
    itemName: 'Sony WH-1000XM5 Active Noise Cancelling Headphones',
    serialNumber: 'SNY-XM5-9922',
    type: 'Headset',
    status: 'Under Repair',
    assignedDate: '2024-06-18',
    condition: 'Fair',
    notes: 'Bluetooth pairing chip failing occasionally. Handed to IT service shelf.'
  },
  {
    id: 'eq-6',
    employeeId: 'emp-1',
    employeeName: 'Sarah Jenkins',
    itemName: 'Apple 140W USB-C Power Adapter & MagSafe 3 Cable',
    serialNumber: 'APL-140W-9823',
    type: 'Charger/Power Adapter',
    status: 'Assigned',
    assignedDate: '2024-11-12',
    condition: 'New',
    notes: 'Secondary charger for travel & home office setups.'
  },
  {
    id: 'eq-7',
    employeeId: 'emp-4',
    employeeName: 'David Kim',
    itemName: 'Satechi USB4 Multi-Port Adapter with 8K HDMI',
    serialNumber: 'SAT-HUB-8492',
    type: 'Accessory',
    status: 'Assigned',
    assignedDate: '2024-12-05',
    condition: 'Excellent',
    notes: 'Thunderbolt 4 docking hub.'
  }
];

