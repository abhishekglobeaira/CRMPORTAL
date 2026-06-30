/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Building2, 
  Mail, 
  User, 
  FileText, 
  Edit2, 
  Trash2, 
  X 
} from 'lucide-react';
import { Client } from '../types';

interface ClientViewProps {
  clients: Client[];
  onAddClient: (client: Omit<Client, 'id'>) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
}

export default function ClientView({
  clients,
  onAddClient,
  onEditClient,
  onDeleteClient
}: ClientViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [requirements, setRequirements] = useState('');

  const resetForm = () => {
    setCompanyName('');
    setContactPerson('');
    setEmail('');
    setRequirements('');
    setEditingClient(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setCompanyName(client.companyName);
    setContactPerson(client.contactPerson);
    setEmail(client.email);
    setRequirements(client.requirements);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim() || !contactPerson.trim() || !email.trim() || !requirements.trim()) {
      alert('Please fill out all client details.');
      return;
    }

    if (editingClient) {
      onEditClient({
        id: editingClient.id,
        companyName,
        contactPerson,
        email,
        requirements
      });
    } else {
      onAddClient({
        companyName,
        contactPerson,
        email,
        requirements
      });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const filteredClients = clients.filter(client => 
    client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.requirements.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between bg-slate-900/30 p-5 rounded-2xl border border-slate-800/40">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            id="client-search"
            type="text"
            placeholder="Search clients by company, contact or requirements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/40 border border-slate-700/40 focus:border-teal-400 rounded-xl py-2 px-10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all"
          />
        </div>

        <button
          id="btn-add-client-trigger"
          onClick={handleOpenAdd}
          className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-teal-500/10 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Register Client</span>
        </button>
      </div>

      {/* Grid List layout instead of boring raw tables for Clients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
            <div className="flex flex-col items-center justify-center text-slate-500">
              <Building2 className="h-10 w-10 text-slate-600 mb-3" />
              <p className="font-bold text-sm text-slate-300">No client accounts registered</p>
              <p className="text-[11px] text-slate-500 mt-1">Ready to sync contracts? Click register above.</p>
            </div>
          </div>
        ) : (
          filteredClients.map((client) => (
            <div 
              key={client.id}
              id={`client-card-${client.id}`}
              className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 flex flex-col justify-between hover:border-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/5 transition-all duration-300 group"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-800/60 pb-3.5 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-500/10 to-teal-400/20 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-teal-400" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-slate-100 text-sm truncate group-hover:text-teal-400 transition-colors">
                        {client.companyName}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {client.id.toUpperCase()}</p>
                    </div>
                  </div>
                  
                  {/* Action controls */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      id={`btn-edit-client-${client.id}`}
                      onClick={() => handleOpenEdit(client)}
                      className="p-1 text-slate-500 hover:text-slate-200 hover:bg-slate-850 rounded transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`btn-delete-client-${client.id}`}
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete client: "${client.companyName}"?`)) {
                          onDeleteClient(client.id);
                        }
                      }}
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Info block */}
                <div className="space-y-2.5">
                  {/* Representative */}
                  <div className="flex items-center gap-2.5 text-xs text-slate-300 font-semibold">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>{client.contactPerson}</span>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-2.5 text-xs text-slate-400 font-mono">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{client.email}</span>
                  </div>

                  {/* Requirements spec */}
                  <div className="mt-4 p-3 bg-slate-950/30 rounded-xl border border-slate-800/60 flex items-start gap-2.5">
                    <FileText className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium italic">
                      "{client.requirements}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Status indicator */}
              <div className="mt-5 pt-3.5 border-t border-slate-800/40 flex items-center justify-between text-[10px] text-slate-500 font-bold">
                <span className="text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">Active Enterprise Contract</span>
                <span>Verified B2B</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Register Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-teal-500/10 rounded-lg text-teal-400">
                  <Building2 className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-bold text-slate-100 text-base">
                  {editingClient ? 'Modify Enterprise Partner' : 'Register Corporate Client'}
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
              {/* Company Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Company Name</label>
                <input
                  id="client-form-company"
                  type="text"
                  required
                  placeholder="e.g. Apex Technology Solutions"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                />
              </div>

              {/* Contact Person */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Account Contact / Representative</label>
                <input
                  id="client-form-contact"
                  type="text"
                  required
                  placeholder="e.g. Robert Downey Jr."
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Billing / Liaison Email</label>
                <input
                  id="client-form-email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                />
              </div>

              {/* Requirements */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Project Requirements Specification</label>
                <textarea
                  id="client-form-reqs"
                  required
                  rows={4}
                  placeholder="Detail expected deliverables, engineering resources requested, contract durations..."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
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
                  id="client-form-submit"
                  type="submit"
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs shadow-lg shadow-teal-500/10 active:scale-95 transition cursor-pointer"
                >
                  {editingClient ? 'Confirm Changes' : 'Register Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
