/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  UserPlus, 
  Briefcase, 
  Calendar,
  X,
  SlidersHorizontal,
  CheckCircle,
  HelpCircle,
  XCircle,
  AlertCircle,
  UserCheck
} from 'lucide-react';
import { Candidate, CandidateStatus } from '../types';

interface CandidateViewProps {
  candidates: Candidate[];
  onAddCandidate: (cand: Omit<Candidate, 'id'>) => void;
  onEditCandidate: (cand: Candidate) => void;
  onDeleteCandidate: (id: string) => void;
  onNavigateToView: (view: any, extraData?: any) => void;
}

export default function CandidateView({
  candidates,
  onAddCandidate,
  onEditCandidate,
  onDeleteCandidate,
  onNavigateToView
}: CandidateViewProps) {
  // Search and filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCand, setEditingCand] = useState<Candidate | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [status, setStatus] = useState<CandidateStatus>('New');

  const resetForm = () => {
    setName('');
    setEmail('');
    setSkills('');
    setExperience('');
    setStatus('New');
    setEditingCand(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cand: Candidate) => {
    setEditingCand(cand);
    setName(cand.name);
    setEmail(cand.email || '');
    setSkills(cand.skills);
    setExperience(cand.experience);
    setStatus(cand.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !skills.trim() || !experience.trim() || !status) {
      alert('Please fill out all fields.');
      return;
    }

    if (editingCand) {
      onEditCandidate({
        id: editingCand.id,
        name,
        email: email.trim() || undefined,
        skills,
        experience,
        status
      });
    } else {
      onAddCandidate({
        name,
        email: email.trim() || undefined,
        skills,
        experience,
        status
      });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const filteredCandidates = candidates.filter(cand => {
    const matchesSearch = 
      cand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cand.skills.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cand.experience.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'All' || cand.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusStyles = (s: CandidateStatus) => {
    switch (s) {
      case 'New': return 'text-sky-400 bg-sky-500/10 border border-sky-500/20';
      case 'Interview': return 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20';
      case 'Selected': return 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20';
      case 'Rejected': return 'text-rose-400 bg-rose-500/10 border border-rose-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border border-slate-500/20';
    }
  };

  const getStatusIcon = (s: CandidateStatus) => {
    switch (s) {
      case 'New': return <AlertCircle className="w-3.5 h-3.5" />;
      case 'Interview': return <Calendar className="w-3.5 h-3.5" />;
      case 'Selected': return <CheckCircle className="w-3.5 h-3.5" />;
      case 'Rejected': return <XCircle className="w-3.5 h-3.5" />;
    }
  };

  const candidateStatuses = ['New', 'Interview', 'Selected', 'Rejected'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header filter & controls */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between bg-slate-900/30 p-5 rounded-2xl border border-slate-800/40">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            id="candidate-search"
            type="text"
            placeholder="Search candidates by name or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/40 border border-slate-700/40 focus:border-teal-400 rounded-xl py-2 px-10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800/40 px-3 py-2 rounded-xl border border-slate-700/40">
            <SlidersHorizontal className="w-3.5 h-3.5 text-teal-400" />
            <select
              id="candidate-status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer font-medium"
            >
              <option value="All" className="bg-slate-900 text-slate-200">All Pipelines</option>
              {candidateStatuses.map(st => (
                <option key={st} value={st} className="bg-slate-900 text-slate-200">{st} Candidates</option>
              ))}
            </select>
          </div>

          <button
            id="btn-add-candidate-trigger"
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-teal-500/10 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-900/50 text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">
                <th className="px-6 py-4.5">Candidate Details</th>
                <th className="px-6 py-4.5">Skills Expertise</th>
                <th className="px-6 py-4.5">Experience</th>
                <th className="px-6 py-4.5">Pipeline Status</th>
                <th className="px-6 py-4.5">Quick Actions</th>
                <th className="px-6 py-4.5 text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Briefcase className="h-10 w-10 text-slate-600 mb-3" />
                      <p className="font-bold text-sm text-slate-300">No active candidates found</p>
                      <p className="text-[11px] text-slate-500 mt-1">Try relaxing filters or register a candidate.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((cand) => (
                  <tr 
                    key={cand.id}
                    id={`cand-row-${cand.id}`}
                    className="hover:bg-slate-800/20 transition-all duration-200"
                  >
                    {/* Details */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600/30 flex items-center justify-center font-bold text-slate-200">
                          {cand.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-slate-200 text-sm">{cand.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-mono">ID: {cand.id.toUpperCase()}</span>
                            {cand.email && (
                              <>
                                <span className="text-slate-600 text-[10px] font-mono">•</span>
                                <span className="text-[10px] text-teal-400 font-mono">{cand.email}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Skills */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {cand.skills.split(',').map((skill, index) => (
                          <span 
                            key={index}
                            className="bg-slate-800/60 border border-slate-700/50 text-slate-300 text-[9px] font-semibold px-2 py-0.5 rounded-md"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Experience */}
                    <td className="px-6 py-4 font-mono font-bold text-slate-300">
                      {cand.experience}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <select
                        id={`select-status-${cand.id}`}
                        value={cand.status}
                        onChange={(e) => onEditCandidate({ ...cand, status: e.target.value as CandidateStatus })}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border outline-none bg-slate-900 cursor-pointer transition-all duration-200 ${
                          cand.status === 'Selected'
                            ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 focus:ring-1 focus:ring-emerald-500'
                            : cand.status === 'Interview'
                            ? 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10 focus:ring-1 focus:ring-indigo-500'
                            : cand.status === 'Rejected'
                            ? 'text-rose-400 border-rose-500/30 bg-rose-500/10 focus:ring-1 focus:ring-rose-500'
                            : 'text-sky-400 border-sky-500/30 bg-sky-500/10 focus:ring-1 focus:ring-sky-500'
                        }`}
                      >
                        <option value="New" className="bg-slate-900 text-sky-400 font-extrabold">New</option>
                        <option value="Interview" className="bg-slate-900 text-indigo-400 font-extrabold">Interview</option>
                        <option value="Selected" className="bg-slate-900 text-emerald-400 font-extrabold">Selected</option>
                        <option value="Rejected" className="bg-slate-900 text-rose-400 font-extrabold">Rejected</option>
                      </select>
                    </td>

                    {/* Inter-Module Links */}
                    <td className="px-6 py-4">
                      {cand.status === 'Selected' ? (
                        <button
                          id={`btn-onboard-cand-${cand.id}`}
                          onClick={() => onNavigateToView('employees', { onboardCandidate: cand })}
                          className="flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 font-extrabold px-3 py-1 rounded-lg text-[10px] transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md shadow-emerald-500/5"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Onboard & Allot Property</span>
                        </button>
                      ) : (
                        <button
                          id={`btn-schedule-cand-${cand.id}`}
                          onClick={() => onNavigateToView('interviews', { candidateId: cand.id })}
                          className="flex items-center gap-1 bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/20 text-indigo-400 font-bold px-2.5 py-1 rounded-lg text-[10px] transition cursor-pointer"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Schedule Interview</span>
                        </button>
                      )}
                    </td>

                    {/* Settings/Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          id={`btn-edit-cand-${cand.id}`}
                          onClick={() => handleOpenEdit(cand)}
                          className="p-1.5 hover:bg-slate-700/40 rounded-lg text-slate-400 hover:text-slate-200 transition cursor-pointer"
                          title="Edit Candidate Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`btn-delete-cand-${cand.id}`}
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${cand.name}?`)) {
                              onDeleteCandidate(cand.id);
                            }
                          }}
                          className="p-1.5 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-400 transition cursor-pointer"
                          title="Delete Candidate"
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

      {/* Elegant glassmorphism CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-teal-500/10 rounded-lg text-teal-400">
                  <UserPlus className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-bold text-slate-100 text-base">
                  {editingCand ? 'Modify Candidate Info' : 'Register New Candidate'}
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
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                <input
                  id="cand-form-name"
                  type="text"
                  required
                  placeholder="e.g. Liam Neeson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
                <input
                  id="cand-form-email"
                  type="email"
                  placeholder="e.g. liam@neeson.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                />
              </div>

              {/* Skills (Comma separated) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Skills (Comma separated list)</label>
                <input
                  id="cand-form-skills"
                  type="text"
                  required
                  placeholder="React, TypeScript, Node, AWS"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                />
              </div>

              {/* Experience */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Experience Duration</label>
                <input
                  id="cand-form-exp"
                  type="text"
                  required
                  placeholder="e.g. 4 years, 6 months"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pipeline Status</label>
                <select
                  id="cand-form-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CandidateStatus)}
                  className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="New">New</option>
                  <option value="Interview">Interview</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                </select>
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
                  id="cand-form-submit"
                  type="submit"
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs shadow-lg shadow-teal-500/10 active:scale-95 transition cursor-pointer"
                >
                  {editingCand ? 'Save Changes' : 'Register Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
