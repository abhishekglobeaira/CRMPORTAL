/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  salary: number;
  department: string;
  phone?: string;
  joiningDate?: string;
  status?: 'Active' | 'On Leave' | 'Terminated';
  employmentType?: 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';
  emergencyContact?: string;
  notes?: string;
  password?: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Leave' | 'Half-Day';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
}

export type TaskStatus = 'To Do' | 'In Progress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedEmployeeId: string; // References Employee.id
  priority: TaskPriority;
  dueDate: string;
}

export type CandidateStatus = 'New' | 'Interview' | 'Selected' | 'Rejected';

export interface Candidate {
  id: string;
  name: string;
  email?: string;
  skills: string; // Comma separated or text
  experience: string; // e.g. "3 years"
  status: CandidateStatus;
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  date: string;
  time: string;
  interviewer: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  feedback: string;
  result: 'Passed' | 'Failed' | 'Pending';
}

export interface Client {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  requirements: string;
}

export interface ActivityLog {
  id: string;
  type: 'employee' | 'candidate' | 'interview' | 'task' | 'client' | 'payroll' | 'attendance';
  action: string;
  details: string;
  timestamp: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  total: number;
}

export interface Invoice {
  id: string;
  clientId: string; // References Client.id
  clientName: string;
  invoiceNumber: string; // e.g., INV-2026-001
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number; // percentage
  taxAmount: number;
  discount: number; // amount
  grandTotal: number;
  status: 'Paid' | 'Unpaid' | 'Overdue' | 'Draft';
}

export interface AssistsIssue {
  id: string;
  title: string;
  category: 'IT Support' | 'HR Query' | 'Assets & Equipment' | 'Facilities' | 'Finance';
  severity: 'Low' | 'Medium' | 'High';
  description: string;
  employeeId: string; // References Employee.id
  employeeName: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  dateCreated: string;
  adminNotes?: string;
  assignedToId?: string;
  assignedToName?: string;
}

export interface EquipmentAssignment {
  id: string;
  employeeId: string;
  employeeName: string;
  itemName: string;
  serialNumber: string;
  type: 'Laptop' | 'Monitor' | 'Keyboard/Mouse' | 'Headset' | 'Mobile Device' | 'Ergonomic Desk/Chair' | 'Charger/Power Adapter' | 'Accessory' | 'Other';
  status: 'Assigned' | 'Returned' | 'Under Repair' | 'Pending Setup';
  assignedDate: string;
  returnDate?: string;
  condition: 'New' | 'Excellent' | 'Good' | 'Fair' | 'Damaged';
  notes?: string;
}

export type ActiveView = 
  | 'dashboard'
  | 'employees'
  | 'attendance'
  | 'payroll'
  | 'tasks'
  | 'candidates'
  | 'interviews'
  | 'clients'
  | 'invoices'
  | 'issues'
  | 'leaves';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  reason: string;
  type: 'Annual' | 'Sick' | 'Maternity/Paternity' | 'Casual' | 'Unpaid' | 'Other';
  status: 'Pending' | 'Approved' | 'Rejected';
  dateApplied: string;
  adminNotes?: string;
}

export interface SalarySlip {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string; // e.g. "06" for June, or month name
  year: string;  // e.g. "2026"
  baseSalary: number;
  hra: number;
  da: number;
  conveyance: number;
  medical: number;
  specialAllowance: number;
  pf: number;
  lopDays: number;
  lopDeduction: number;
  taxDeduction: number;
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
  approvedDate: string;
  companyName: string;
  payDateDay: string;
  status: 'Approved' | 'Paid';
}

