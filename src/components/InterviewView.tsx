/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Video, 
  User, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Trash2, 
  Edit,
  X,
  CheckCircle,
  XCircle,
  HelpCircle,
  Mail,
  Send,
  Check,
  Sparkles,
  Copy
} from 'lucide-react';
import { Interview, Candidate, Employee } from '../types';

interface InterviewViewProps {
  interviews: Interview[];
  candidates: Candidate[];
  employees: Employee[];
  onScheduleInterview: (interview: Omit<Interview, 'id'>) => void;
  onEditInterview: (interview: Interview) => void;
  onDeleteInterview: (id: string) => void;
  deepLinkedCandidateId?: string; // Optional direct candidate from routing
}

export default function InterviewView({
  interviews,
  candidates,
  employees,
  onScheduleInterview,
  onEditInterview,
  onDeleteInterview,
  deepLinkedCandidateId
}: InterviewViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);

  // Form States
  const [candidateId, setCandidateId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [interviewer, setInterviewer] = useState('');
  const [status, setStatus] = useState<'Scheduled' | 'Completed' | 'Cancelled'>('Scheduled');
  const [feedback, setFeedback] = useState('');
  const [result, setResult] = useState<'Passed' | 'Failed' | 'Pending'>('Pending');

  // Automated Email Dispatch States
  const [sentEmailPreview, setSentEmailPreview] = useState<{ toName: string; toEmail: string; subject: string; body: string } | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Trigger scheduling deep-link if candidate ID is provided
  useEffect(() => {
    if (deepLinkedCandidateId) {
      setCandidateId(deepLinkedCandidateId);
      setDate('');
      setTime('');
      setInterviewer(employees[0]?.name || '');
      setStatus('Scheduled');
      setFeedback('Scheduled interview review.');
      setResult('Pending');
      setIsModalOpen(true);
    }
  }, [deepLinkedCandidateId, employees]);

  const resetForm = () => {
    setCandidateId(candidates[0]?.id || '');
    setDate('');
    setTime('');
    setInterviewer(employees[0]?.name || '');
    setStatus('Scheduled');
    setFeedback('');
    setResult('Pending');
    setEditingInterview(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (interview: Interview) => {
    setEditingInterview(interview);
    setCandidateId(interview.candidateId);
    setDate(interview.date);
    setTime(interview.time);
    setInterviewer(interview.interviewer);
    setStatus(interview.status);
    setFeedback(interview.feedback);
    setResult(interview.result);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!candidateId || !date || !time || !interviewer) {
      alert('Please fill out all scheduler fields.');
      return;
    }

    const matchedCandidate = candidates.find(c => c.id === candidateId);
    const matchedCandName = matchedCandidate?.name || 'Unknown Candidate';
    const matchedCandEmail = matchedCandidate?.email || `${matchedCandName.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`;

    if (editingInterview) {
      onEditInterview({
        id: editingInterview.id,
        candidateId,
        candidateName: matchedCandName,
        date,
        time,
        interviewer,
        status,
        feedback,
        result
      });
    } else {
      onScheduleInterview({
        candidateId,
        candidateName: matchedCandName,
        date,
        time,
        interviewer,
        status,
        feedback,
        result
      });

      // Automatically construct and display the dispatched email text to candidate
      const mailBody = `Dear ${matchedCandName},

We are pleased to invite you for an interview with Globeaira for your application. Below are the coordinated evaluation session details:

📅 Date: ${date}
⏰ Time: ${time} (Standard Time)
👤 Interviewer: ${interviewer}
💻 Format: Interactive Video Conference / Online Technical Evaluation
📝 Additional Candidate Brief: ${feedback.trim() || "Please review our core system architecture and prepare to discuss your expertise."}

A secure video link will be activated 5 minutes prior to the session. If you have any questions or need to request a reschedule, please contact careers@globeaira.com.

We look forward to speaking with you!

Best regards,
Globeaira Talent Acquisition Team
careers@globeaira.com`;

      setSentEmailPreview({
        toName: matchedCandName,
        toEmail: matchedCandEmail,
        subject: `Interview Invitation: Technical Interview with Globeaira`,
        body: mailBody
      });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const filteredInterviews = interviews.filter(i => 
    i.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.interviewer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.feedback.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getResultBadge = (res: 'Passed' | 'Failed' | 'Pending') => {
    switch (res) {
      case 'Passed': return 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20';
      case 'Failed': return 'text-rose-400 bg-rose-500/10 border border-rose-500/20';
      case 'Pending': return 'text-amber-400 bg-amber-500/10 border border-amber-500/20';
    }
  };

  const getResultIcon = (res: 'Passed' | 'Failed' | 'Pending') => {
    switch (res) {
      case 'Passed': return <CheckCircle className="w-3.5 h-3.5" />;
      case 'Failed': return <XCircle className="w-3.5 h-3.5" />;
      case 'Pending': return <HelpCircle className="w-3.5 h-3.5 animate-pulse" />;
    }
  };

  const getStatusBadge = (st: 'Scheduled' | 'Completed' | 'Cancelled') => {
    switch (st) {
      case 'Scheduled': return 'text-sky-400 bg-sky-500/10 border border-sky-500/20';
      case 'Completed': return 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20';
      case 'Cancelled': return 'text-slate-400 bg-slate-500/10 border border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/30 p-5 rounded-2xl border border-slate-800/40">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            id="interview-search"
            type="text"
            placeholder="Search candidates, interviewers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/40 border border-slate-700/40 focus:border-teal-400 rounded-xl py-2 px-10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all"
          />
        </div>

        <button
          id="btn-schedule-interview-trigger"
          onClick={handleOpenAdd}
          className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-teal-500/10 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Schedule Interview</span>
        </button>
      </div>

      {/* Roster list */}
      <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-900/50 text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">
                <th className="px-6 py-4.5">Candidate</th>
                <th className="px-6 py-4.5">Schedule Period</th>
                <th className="px-6 py-4.5">Interviewer</th>
                <th className="px-6 py-4.5">Status</th>
                <th className="px-6 py-4.5">Hiring Result</th>
                <th className="px-6 py-4.5">Notes & Feedback</th>
                <th className="px-6 py-4.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs">
              {filteredInterviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Video className="h-10 w-10 text-slate-600 mb-3" />
                      <p className="font-bold text-sm text-slate-300">No scheduled interviews found</p>
                      <p className="text-[11px] text-slate-500 mt-1">Ready to coordinate a review? Click schedule above.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInterviews.map((int) => (
                  <tr 
                    key={int.id}
                    id={`int-row-${int.id}`}
                    className="hover:bg-slate-800/20 transition-all duration-200 text-slate-300 font-medium"
                  >
                    {/* Candidate */}
                    <td className="px-6 py-4.5 font-bold text-slate-200">
                      {int.candidateName}
                    </td>

                    {/* Schedule */}
                    <td className="px-6 py-4.5">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-200 font-mono flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" /> {int.date}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" /> {int.time}
                        </p>
                      </div>
                    </td>

                    {/* Interviewer */}
                    <td className="px-6 py-4.5 font-semibold text-slate-300">
                      {int.interviewer}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4.5">
                      <select
                        id={`select-status-${int.id}`}
                        value={int.status}
                        onChange={(e) => onEditInterview({ ...int, status: e.target.value as any })}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border outline-none bg-slate-900 cursor-pointer transition-all duration-200 ${getStatusBadge(int.status)}`}
                      >
                        <option value="Scheduled" className="bg-slate-900 text-sky-400 font-bold">Scheduled</option>
                        <option value="Completed" className="bg-slate-900 text-emerald-400 font-bold">Completed</option>
                        <option value="Cancelled" className="bg-slate-900 text-slate-400 font-bold">Cancelled</option>
                      </select>
                    </td>

                    {/* Result */}
                    <td className="px-6 py-4.5">
                      <select
                        id={`select-result-${int.id}`}
                        value={int.result}
                        onChange={(e) => onEditInterview({ ...int, result: e.target.value as any })}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border outline-none bg-slate-900 cursor-pointer transition-all duration-200 ${getResultBadge(int.result)}`}
                      >
                        <option value="Pending" className="bg-slate-900 text-amber-400 font-bold">Pending</option>
                        <option value="Passed" className="bg-slate-900 text-emerald-400 font-bold">Passed</option>
                        <option value="Failed" className="bg-slate-900 text-rose-400 font-bold">Failed</option>
                      </select>
                    </td>

                    {/* Feedback */}
                    <td className="px-6 py-4.5 max-w-xs truncate text-[11px] text-slate-400">
                      {int.feedback || <span className="italic text-slate-600">Pending review completion...</span>}
                    </td>

                    {/* Settings */}
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          id={`btn-edit-int-${int.id}`}
                          onClick={() => handleOpenEdit(int)}
                          className="p-1.5 hover:bg-slate-750 border border-transparent hover:border-slate-700/50 rounded-lg text-slate-400 hover:text-slate-200 transition cursor-pointer"
                          title="Edit review results & details"
                        >
                          <Edit className="w-3.5 h-3.5 text-teal-400" />
                        </button>
                        <button
                          id={`btn-delete-int-${int.id}`}
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this interview schedule?')) {
                              onDeleteInterview(int.id);
                            }
                          }}
                          className="p-1.5 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-400 transition cursor-pointer"
                          title="Remove Schedule"
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

      {/* Form Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-teal-500/10 rounded-lg text-teal-400">
                  <Video className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-bold text-slate-100 text-base">
                  {editingInterview ? 'Record Assessment / Edit Schedule' : 'Schedule Assessment Interview'}
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
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Select Candidate */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Candidate Target</label>
                <select
                  id="int-form-candidate"
                  value={candidateId}
                  onChange={(e) => setCandidateId(e.target.value)}
                  disabled={!!editingInterview}
                  className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none cursor-pointer disabled:opacity-50"
                >
                  <option value="" disabled>Select Candidate</option>
                  {candidates.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.skills.split(',')[0]})</option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Interview Date</label>
                  <input
                    id="int-form-date"
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none font-mono cursor-pointer"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Time Slot</label>
                  <input
                    id="int-form-time"
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none font-mono cursor-pointer"
                  />
                </div>
              </div>

              {/* Interviewer select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Interviewer / Examiner</label>
                <select
                  id="int-form-interviewer"
                  value={interviewer}
                  onChange={(e) => setInterviewer(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="" disabled>Select Employee</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.name}>{e.name} ({e.role})</option>
                  ))}
                </select>
              </div>

              {/* Status and Result */}
              {editingInterview && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Log Status</label>
                    <select
                      id="int-form-status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Hiring Decision</label>
                    <select
                      id="int-form-result"
                      value={result}
                      onChange={(e) => setResult(e.target.value as any)}
                      className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
                    >
                      <option value="Pending">Pending Decision</option>
                      <option value="Passed">Passed (Recommend Hire)</option>
                      <option value="Failed">Failed (Decline)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Feedback */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Feedback / Assessment Notes</label>
                <textarea
                  id="int-form-feedback"
                  rows={3}
                  placeholder="Record interview notes, technical feedback, strengths or concerns..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all resize-none"
                />
              </div>

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
                  id="int-form-submit"
                  type="submit"
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs shadow-lg shadow-teal-500/10 active:scale-95 transition cursor-pointer"
                >
                  {editingInterview ? 'Record Assessment' : 'Coordinate Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- AUTOMATED OUTGOING E-MAIL DISPATCHED POPUP --- */}
      {sentEmailPreview && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative shadow-emerald-500/5">
            {/* Success Banner */}
            <div className="bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-transparent border-b border-emerald-500/20 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/15 text-emerald-400 rounded-lg animate-pulse">
                  <Send className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-100 text-sm tracking-wide">Automated Email Dispatched</h3>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">● SMTP Delivery Status: Sent Successfully</p>
                </div>
              </div>
              <button 
                onClick={() => setSentEmailPreview(null)}
                className="text-slate-400 hover:text-slate-200 p-1.5 hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Email Client Container */}
            <div className="p-6 space-y-4">
              {/* Envelope Fields */}
              <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-extrabold w-12 text-right uppercase tracking-wider text-[9px]">From:</span>
                  <span className="text-slate-300 font-semibold">Globeaira Recruitment <span className="text-teal-400 font-mono">&lt;careers@globeaira.com&gt;</span></span>
                </div>
                <div className="h-px bg-slate-800/40" />
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-extrabold w-12 text-right uppercase tracking-wider text-[9px]">To:</span>
                  <span className="text-slate-200 font-bold">
                    {sentEmailPreview.toName} <span className="text-teal-400 font-mono font-medium">&lt;{sentEmailPreview.toEmail}&gt;</span>
                  </span>
                </div>
                <div className="h-px bg-slate-800/40" />
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-extrabold w-12 text-right uppercase tracking-wider text-[9px]">Subject:</span>
                  <span className="text-slate-200 font-black">{sentEmailPreview.subject}</span>
                </div>
              </div>

              {/* Email Content Body */}
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block">Dispatched Email Content</label>
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4.5 max-h-[220px] overflow-y-auto custom-scrollbar font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed select-text">
                  {sentEmailPreview.body}
                </div>
              </div>

              {/* Info Accent */}
              <div className="flex items-start gap-2.5 bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-xl">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-400 leading-normal">
                  <strong className="text-indigo-300">Smart Recruiting Automation active.</strong> Candidate has been notified instantly via automated pipeline templates. All session variables and scheduler parameters were mapped correctly.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(sentEmailPreview.body);
                    setCopiedEmail(true);
                    setTimeout(() => setCopiedEmail(false), 2000);
                  }}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/50 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-black">Copied Email Text</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Invitation Text</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSentEmailPreview(null)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-wider px-5 py-2 rounded-xl text-xs active:scale-95 transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
