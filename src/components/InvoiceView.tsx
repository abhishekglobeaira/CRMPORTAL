/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, 
  Plus, 
  Trash2, 
  Download, 
  CheckCircle, 
  FileText, 
  Calendar, 
  Eye, 
  X, 
  ArrowLeft, 
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Invoice, Client, InvoiceItem } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface InvoiceViewProps {
  clients: Client[];
  invoices: Invoice[];
  onAddInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  onUpdateInvoiceStatus: (id: string, status: Invoice['status']) => void;
  onDeleteInvoice: (id: string) => void;
}

export default function InvoiceView({ 
  clients, 
  invoices, 
  onAddInvoice, 
  onUpdateInvoiceStatus, 
  onDeleteInvoice 
}: InvoiceViewProps) {
  // Modal / Form States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Form Fields State
  const [clientId, setClientId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [items, setItems] = useState<Omit<InvoiceItem, 'total'>[]>([
    { description: '', quantity: 1, rate: 0 }
  ]);
  const [taxRate, setTaxRate] = useState(18); // Default 18% GST
  const [discount, setDiscount] = useState(0);

  // PDF generation state
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  // Generate next Invoice Number on mount or when invoices list changes
  useEffect(() => {
    const nextNum = invoices.length + 1;
    setInvoiceNumber(`INV-2026-${String(nextNum).padStart(3, '0')}`);
  }, [invoices, showCreateModal]);

  // Form Calculations
  const calculatedItems = items.map(item => ({
    ...item,
    total: item.quantity * item.rate
  }));

  const subtotal = calculatedItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = Math.round((subtotal * taxRate) / 100);
  const grandTotal = subtotal + taxAmount - discount;

  // Add Item Row
  const handleAddItemRow = () => {
    setItems(prev => [...prev, { description: '', quantity: 1, rate: 0 }]);
  };

  // Remove Item Row
  const handleRemoveItemRow = (index: number) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Update Item Fields
  const handleUpdateItem = (index: number, field: keyof Omit<InvoiceItem, 'total'>, value: string | number) => {
    setItems(prev => prev.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Submit Invoice Form
  const handleSubmitInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      alert('Please select a client.');
      return;
    }
    if (items.some(item => !item.description.trim() || item.rate <= 0 || item.quantity <= 0)) {
      alert('Please fill out all item lines with valid descriptions, quantities, and rates.');
      return;
    }

    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    onAddInvoice({
      clientId,
      clientName: client.companyName,
      invoiceNumber,
      issueDate,
      dueDate,
      items: calculatedItems,
      subtotal,
      taxRate,
      taxAmount,
      discount,
      grandTotal,
      status: 'Unpaid'
    });

    // Reset Form
    setClientId('');
    setItems([{ description: '', quantity: 1, rate: 0 }]);
    setTaxRate(18);
    setDiscount(0);
    setShowCreateModal(false);
  };

  // PDF Generator with compatibility mode for oklch colors
  const handleGeneratePdf = async () => {
    const element = document.getElementById('printable-invoice-canvas');
    if (!element || !selectedInvoice) return;

    setIsPdfGenerating(true);

    // Backup and temporarily modify all style tags containing modern CSS color functions
    const styleElements = Array.from(document.querySelectorAll('style'));
    const styleBackups = new Map<HTMLStyleElement, string>();
    
    const tempDiv = document.createElement('div');
    tempDiv.style.display = 'none';
    document.body.appendChild(tempDiv);
    const resolvedColorCache = new Map<string, string>();

    const convertColorToRgb = (colorStr: string): string => {
      if (resolvedColorCache.has(colorStr)) {
        return resolvedColorCache.get(colorStr)!;
      }
      try {
        tempDiv.style.color = colorStr;
        const resolved = window.getComputedStyle(tempDiv).color;
        if (resolved && (resolved.startsWith('rgb') || resolved.startsWith('#'))) {
          resolvedColorCache.set(colorStr, resolved);
          return resolved;
        }
      } catch (e) {
        // ignore
      }
      return 'rgb(15, 23, 42)'; // Safe fallback
    };

    const replaceModernColors = (text: string): string => {
      const targets = ['oklch(', 'oklab(', 'color-mix(', 'light-dark('];
      let result = text;
      let found = true;
      
      while (found) {
        found = false;
        let lastIdx = -1;
        let selectedTarget = '';
        
        for (const target of targets) {
          const idx = result.lastIndexOf(target);
          if (idx > lastIdx) {
            lastIdx = idx;
            selectedTarget = target;
          }
        }
        
        if (lastIdx !== -1) {
          let parenCount = 1;
          let endIdx = -1;
          for (let i = lastIdx + selectedTarget.length; i < result.length; i++) {
            if (result[i] === '(') parenCount++;
            else if (result[i] === ')') parenCount--;
            
            if (parenCount === 0) {
              endIdx = i;
              break;
            }
          }
          
          if (endIdx !== -1) {
            const fullMatch = result.substring(lastIdx, endIdx + 1);
            const resolvedColor = convertColorToRgb(fullMatch);
            result = result.substring(0, lastIdx) + resolvedColor + result.substring(endIdx + 1);
            found = true;
          } else {
            break;
          }
        }
      }
      return result;
    };

    try {
      // Find and rewrite all style tags containing modern colors
      styleElements.forEach((styleEl) => {
        const text = styleEl.textContent;
        if (text && (text.includes('oklch(') || text.includes('oklab(') || text.includes('color-mix(') || text.includes('light-dark('))) {
          styleBackups.set(styleEl, text);
          styleEl.textContent = replaceModernColors(text);
        }
      });

      if (tempDiv.parentNode) {
        tempDiv.parentNode.removeChild(tempDiv);
      }

      const options = {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff', // Clean white theme for invoice download
        windowWidth: 1024
      };

      const canvas = await html2canvas(element, options);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2.5, canvas.height / 2.5]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2.5, canvas.height / 2.5);
      pdf.save(`Invoice_${selectedInvoice.invoiceNumber}.pdf`);
    } catch (err) {
      console.error('Failed to generate Invoice PDF:', err);
    } finally {
      styleBackups.forEach((originalText, styleEl) => {
        styleEl.textContent = originalText;
      });
      if (tempDiv.parentNode) {
        tempDiv.parentNode.removeChild(tempDiv);
      }
      setIsPdfGenerating(false);
    }
  };

  // Financial Stats Counters
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalPaid = invoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalUnpaid = invoices.filter(inv => inv.status === 'Unpaid').reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalOverdue = invoices.filter(inv => inv.status === 'Overdue').reduce((sum, inv) => sum + inv.grandTotal, 0);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Total Invoiced */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between h-28">
          <div className="absolute top-0 right-0 p-5 opacity-10">
            <TrendingUp className="h-16 w-16 text-sky-400" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Total Revenue Invoiced</span>
            <span className="text-2xl font-black text-slate-100 font-mono tracking-tight block mt-1.5">
              ₹{totalInvoiced.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-sky-400/80 font-bold tracking-wider">All cumulative enterprise files</span>
        </div>

        {/* Total Paid */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between h-28">
          <div className="absolute top-0 right-0 p-5 opacity-10">
            <CheckCircle className="h-16 w-16 text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Settled / Paid Revenue</span>
            <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight block mt-1.5">
              ₹{totalPaid.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-emerald-400/80 font-bold tracking-wider">Cleared & credited to balance sheet</span>
        </div>

        {/* Unpaid Outstanding */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between h-28">
          <div className="absolute top-0 right-0 p-5 opacity-10">
            <Clock className="h-16 w-16 text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Unpaid Outstanding</span>
            <span className="text-2xl font-black text-amber-400 font-mono tracking-tight block mt-1.5">
              ₹{totalUnpaid.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-amber-400/80 font-bold tracking-wider">Pending client approval cycles</span>
        </div>

        {/* Overdue */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between h-28">
          <div className="absolute top-0 right-0 p-5 opacity-10">
            <AlertTriangle className="h-16 w-16 text-rose-400" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Overdue Invoices</span>
            <span className="text-2xl font-black text-rose-400 font-mono tracking-tight block mt-1.5">
              ₹{totalOverdue.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-rose-400/80 font-bold tracking-wider">Past terms SLA. Action needed.</span>
        </div>
      </div>

      {/* Main List Grid or Detail View split */}
      {!selectedInvoice ? (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
          {/* Header Controls */}
          <div className="p-6 border-b border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-200">Billing & Invoice System</h3>
              <p className="text-xs text-slate-400 mt-1">Configure invoices, audit items, and track enterprise corporate billing states.</p>
            </div>
            <button
              id="btn-invoice-create-trigger"
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-extrabold px-4.5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-sky-500/10 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Invoice</span>
            </button>
          </div>

          {/* Table list */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/40 text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-800/60">
                  <th className="px-6 py-4">Invoice No</th>
                  <th className="px-6 py-4">Client Company</th>
                  <th className="px-6 py-4">Issue Date</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-xs text-slate-500 font-semibold">
                      No invoices found. Generate a new invoice to get started.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-white/2 transition duration-150">
                      <td className="px-6 py-4 text-xs font-mono font-bold text-sky-400">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-slate-200">{inv.clientName}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-300">
                        {inv.issueDate}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">
                        {inv.dueDate}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono font-black text-slate-100">
                        ₹{inv.grandTotal.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          id={`select-status-${inv.id}`}
                          value={inv.status}
                          onChange={(e) => onUpdateInvoiceStatus(inv.id, e.target.value as Invoice['status'])}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border outline-none bg-slate-900 cursor-pointer transition-all duration-200 ${
                            inv.status === 'Paid'
                              ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 focus:ring-1 focus:ring-emerald-500'
                              : inv.status === 'Overdue'
                              ? 'text-rose-400 border-rose-500/30 bg-rose-500/10 focus:ring-1 focus:ring-rose-500'
                              : inv.status === 'Draft'
                              ? 'text-slate-400 border-slate-700 bg-slate-800/40 focus:ring-1 focus:ring-slate-500'
                              : 'text-amber-400 border-amber-500/30 bg-amber-500/10 focus:ring-1 focus:ring-amber-500'
                          }`}
                        >
                          <option value="Paid" className="bg-slate-900 text-emerald-400 font-extrabold">Paid</option>
                          <option value="Unpaid" className="bg-slate-900 text-amber-400 font-extrabold">Unpaid</option>
                          <option value="Overdue" className="bg-slate-900 text-rose-400 font-extrabold">Overdue</option>
                          <option value="Draft" className="bg-slate-900 text-slate-400 font-extrabold">Draft</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            id={`btn-view-invoice-${inv.id}`}
                            onClick={() => setSelectedInvoice(inv)}
                            className="bg-sky-500/10 hover:bg-sky-500/25 text-sky-400 border border-sky-500/20 p-2 rounded-lg text-xs transition cursor-pointer"
                            title="View / Print Invoice"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {inv.status !== 'Paid' && (
                            <button
                              id={`btn-mark-paid-${inv.id}`}
                              onClick={() => onUpdateInvoiceStatus(inv.id, 'Paid')}
                              className="bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 p-2 rounded-lg text-xs transition cursor-pointer"
                              title="Mark as Paid"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            id={`btn-delete-invoice-${inv.id}`}
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete invoice ${inv.invoiceNumber}?`)) {
                                onDeleteInvoice(inv.id);
                              }
                            }}
                            className="bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20 p-2 rounded-lg text-xs transition cursor-pointer"
                            title="Delete Invoice"
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
      ) : (
        /* Detailed Invoice View Card */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Invoice List</span>
            </button>
            <button
              id="btn-invoice-download-pdf"
              onClick={handleGeneratePdf}
              disabled={isPdfGenerating}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4.5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>{isPdfGenerating ? 'Compiling PDF...' : 'Download Invoice PDF'}</span>
            </button>
          </div>

          {/* Actual Invoice template canvas rendered for print */}
          <div 
            id="printable-invoice-canvas"
            className="bg-white p-12 rounded-2xl max-w-3xl mx-auto shadow-2xl relative text-slate-800 font-sans border border-slate-200"
          >
            {/* Header Branding Row */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-150">
              <div>
                <h1 className="text-3xl font-bold text-[#b1722d] tracking-wide font-sans">
                  GlobeAlra Tech Private Limited
                </h1>
              </div>
              <div>
                <span className="text-3xl font-light text-[#c29b6e] tracking-widest uppercase">
                  INVOICE
                </span>
              </div>
            </div>

            {/* Dark Gray Horizontal Bar */}
            <div className="bg-[#4a4b4d] text-white px-5 py-2.5 flex items-center justify-between text-xs font-bold tracking-wider my-6 rounded-sm">
              <span>INVOICE # {selectedInvoice.invoiceNumber}</span>
              <span>DATE {selectedInvoice.issueDate}</span>
            </div>

            {/* Double Column Box (Billed To / Payable To) with Gold Border */}
            <div className="grid grid-cols-2 border border-[#b1722d]/70 rounded-sm mb-6 text-[11px] overflow-hidden">
              {/* Left Column: Billed To */}
              <div className="p-4 border-r border-[#b1722d]/70 bg-white">
                <div className="text-slate-800 mb-2">
                  <span className="font-extrabold text-[12px] uppercase tracking-wider text-slate-900 block mb-1">Billed To</span>
                  <span className="font-black text-sm text-slate-950">{selectedInvoice.clientName}</span>
                </div>
                <div className="italic text-slate-500 font-semibold mb-2">
                  Customer ID: GA/2026-27/B-{(selectedInvoice.clientId || '01').substring(0, 4).toUpperCase()}
                </div>
                <div className="text-slate-700 leading-relaxed space-y-0.5">
                  <p>208 Summer St., Floor 07</p>
                  <p>City, ST ZIP: Boston MA 02110</p>
                </div>
              </div>

              {/* Right Column: Payable To */}
              <div className="p-4 bg-slate-50/40">
                <div className="text-slate-800 mb-2">
                  <span className="font-extrabold text-[12px] uppercase tracking-wider text-slate-900 block mb-1">Payable To</span>
                  <span className="font-black text-sm text-slate-950">GlobeAlra Tech Private Limited</span>
                </div>
                <p className="text-slate-700 font-semibold mb-2">India</p>
                <div className="space-y-1 text-slate-700">
                  <p className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">Account Details</p>
                  <p><span className="font-semibold text-slate-600">Account Number-</span> 925020044362199</p>
                  <p><span className="font-semibold text-slate-600">IFSC Code-</span> UTIB0000503</p>
                  <p><span className="font-semibold text-slate-600">Swift Code-</span> AXISINBB503</p>
                </div>
              </div>
            </div>

            {/* Itemized Table matching sample layout */}
            <div className="mb-6 overflow-hidden">
              <table className="w-full text-left border-collapse border-b border-[#b1722d]">
                <thead>
                  <tr className="border-t border-b border-[#b1722d] bg-slate-50/50">
                    <th className="py-2.5 px-3 text-[#b1722d] text-[10px] uppercase font-black tracking-wider">Description</th>
                    <th className="py-2.5 px-3 text-center w-24 text-[#b1722d] text-[10px] uppercase font-black tracking-wider border-l border-slate-200">Quantity</th>
                    <th className="py-2.5 px-3 text-right w-32 text-[#b1722d] text-[10px] uppercase font-black tracking-wider border-l border-slate-200">Service Fee</th>
                    <th className="py-2.5 px-3 text-right w-36 text-[#b1722d] text-[10px] uppercase font-black tracking-wider border-l border-slate-200">AMOUNT</th>
                  </tr>
                </thead>
                <tbody className="text-[11px]">
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-200/80 hover:bg-slate-50/30">
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {idx + 1} {item.description}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-700 font-bold border-l border-slate-200">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-700 font-mono font-semibold border-l border-slate-200">
                        ₹{item.rate.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-slate-950 font-mono border-l border-slate-200">
                        ₹{item.total.toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Side-by-Side Calculations Aligned underneath */}
            <div className="flex justify-end text-[11px] mb-4">
              <div className="w-72 border border-[#b1722d]/40 rounded-sm overflow-hidden divide-y divide-slate-200">
                <div className="flex justify-between bg-slate-50/80 px-3.5 py-2">
                  <span className="font-extrabold text-slate-600 uppercase tracking-wider">SUBTOTAL</span>
                  <span className="font-black text-slate-900 font-mono">₹{selectedInvoice.subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between bg-white px-3.5 py-2">
                  <span className="font-extrabold text-slate-600 uppercase tracking-wider">TAX RATE</span>
                  <span className="font-black text-slate-900 font-mono">{(selectedInvoice.taxRate || 18).toFixed(3)}%</span>
                </div>
              </div>
            </div>

            {/* Note block matching image footer exactly */}
            <div className="text-[11px] text-slate-600 italic mb-8 leading-relaxed border-l-2 border-[#b1722d] pl-4">
              Note-Service Fee Calculated as 1/12th of the Annual Salary as a One time Fee for the Recruit.
            </div>

            {/* Bottom Slogans, Other Comments & Totals Row */}
            <div className="grid grid-cols-2 gap-6 pt-5 border-t border-slate-200">
              {/* Left Column: Comments */}
              <div className="flex flex-col justify-between space-y-6">
                <div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-1 mb-2">
                    OTHER COMMENTS
                  </div>
                  <ol className="list-decimal list-inside text-[11px] text-slate-700 font-medium space-y-1">
                    <li>Total payment due in 7 days</li>
                  </ol>
                </div>
                <div>
                  <span className="text-[#b1722d] font-bold text-[12px] italic leading-relaxed block">
                    We are committed to serve and keep up the pace for any further requirements.
                  </span>
                </div>
              </div>

              {/* Right Column: Tax, Grand Total & Signoff */}
              <div className="flex flex-col items-end justify-between space-y-6">
                <div className="w-72 space-y-2">
                  <div className="flex justify-between text-xs text-slate-600 px-3.5">
                    <span className="font-bold uppercase tracking-wider text-[10px]">TOTAL TAX</span>
                    <span className="font-mono font-black text-slate-900">₹{selectedInvoice.taxAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black bg-slate-100/90 p-3 rounded-sm border border-slate-200">
                    <span className="text-slate-800">TOTAL</span>
                    <span className="text-slate-950 font-mono text-[15px]">₹{selectedInvoice.grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                </div>

                <div className="text-right pt-2">
                  <p className="text-[10px] text-slate-500 mb-0.5">Make all Payments payable to:</p>
                  <p className="text-xs font-black text-[#b1722d] tracking-wide">GlobeAlra Tech Private Limited</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1e293b] border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-700/60 flex items-center justify-between sticky top-0 bg-[#1e293b] z-10">
              <div className="flex items-center gap-2.5">
                <div className="bg-sky-500/10 p-2 rounded-xl border border-sky-500/20 text-sky-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-md font-extrabold text-slate-100">Compile Corporate Client Invoice</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Formulate itemized billing schedules for active client projects.</p>
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
            <form onSubmit={handleSubmitInvoice} className="p-6 space-y-5 flex-1">
              
              {/* Top Row Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client Company */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Client</label>
                  <select
                    id="inv-form-client"
                    required
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-700/50 focus:border-sky-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="" disabled>Select Client Company...</option>
                    {clients.map(cli => (
                      <option key={cli.id} value={cli.id}>{cli.companyName} (Liaison: {cli.contactPerson})</option>
                    ))}
                  </select>
                </div>

                {/* Invoice Number */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Invoice ID Reference</label>
                  <input
                    id="inv-form-number"
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-700/50 focus:border-sky-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all font-mono"
                  />
                </div>
              </div>

              {/* Date Row Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Issue Date */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Issue Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
                    <input
                      id="inv-form-issue"
                      type="date"
                      required
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full bg-slate-850 border border-slate-700/50 focus:border-sky-400 rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Due Date */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Due Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
                    <input
                      id="inv-form-due"
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-slate-850 border border-slate-700/50 focus:border-sky-400 rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Line Items Container */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Itemized Billing Lines</span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="flex items-center gap-1 bg-sky-500/10 hover:bg-sky-500/25 text-sky-400 font-bold px-2.5 py-1 rounded-lg text-[10px] transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Line Row</span>
                  </button>
                </div>

                {/* Row inputs */}
                <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-900/40 border border-slate-800/60 p-2.5 rounded-xl">
                      {/* Description */}
                      <div className="flex-1">
                        <input
                          type="text"
                          required
                          placeholder="Line item description (e.g. Consulting, UI Assets)"
                          value={item.description}
                          onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                          className="w-full bg-slate-850 border border-slate-700/30 focus:border-sky-400 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>
                      
                      {/* Qty */}
                      <div className="w-16">
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full bg-slate-850 border border-slate-700/30 focus:border-sky-400 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none text-center font-mono"
                        />
                      </div>

                      {/* Rate */}
                      <div className="w-24 relative">
                        <span className="absolute left-2.5 top-2 text-slate-400 text-xs font-semibold">₹</span>
                        <input
                          type="number"
                          required
                          min="0"
                          placeholder="Rate"
                          value={item.rate === 0 ? '' : item.rate}
                          onChange={(e) => handleUpdateItem(idx, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-850 border border-slate-700/30 focus:border-sky-400 rounded-lg pl-6 pr-2.5 py-1.5 text-xs text-slate-200 focus:outline-none font-mono"
                        />
                      </div>

                      {/* Amount Output */}
                      <div className="w-20 text-right font-mono font-bold text-slate-400 text-xs px-1">
                        ₹{(item.quantity * item.rate).toLocaleString()}
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        disabled={items.length === 1}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 rounded-lg border border-rose-500/10 disabled:opacity-30 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Taxes & totals inputs */}
              <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  {/* Tax percentage */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Tax Surcharge / GST (%)</span>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseInt(e.target.value) || 0)}
                      className="w-16 bg-slate-850 border border-slate-700/50 focus:border-sky-400 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none text-center font-mono"
                    />
                  </div>

                  {/* Discount */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Apply Flat Discount (₹)</span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={discount}
                      onChange={(e) => setDiscount(parseInt(e.target.value) || 0)}
                      className="w-28 bg-slate-850 border border-slate-700/50 focus:border-sky-400 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none text-right font-mono"
                    />
                  </div>
                </div>

                {/* Subtotals display */}
                <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-800/80 pt-3 md:pt-0 md:pl-5 flex flex-col justify-center">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-mono text-slate-200">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>GST ({taxRate}%):</span>
                    <span className="font-mono text-slate-200">₹{taxAmount.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-xs text-rose-400">
                      <span>Discount:</span>
                      <span className="font-mono">-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-slate-100 border-t border-slate-800/80 pt-2.5">
                    <span>GRAND TOTAL (₹):</span>
                    <span className="font-mono text-sky-400">₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-700/60 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4.5 py-2.5 rounded-xl text-xs border border-slate-700/50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-invoice-submit"
                  type="submit"
                  className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-black px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-sky-500/15 cursor-pointer"
                >
                  Confirm & Save Invoice
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </div>
  );
}
