/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Send, 
  Phone, 
  FileText, 
  LogOut, 
  Sparkles, 
  Sliders, 
  MessageSquare,
  HelpCircle,
  Laptop,
  CheckSquare,
  BookOpen,
  Mail,
  Copy
} from 'lucide-react';
import { Candidate, Interview, AssistsIssue } from '../types';
import { dbGetCollection, dbSaveItem, dbSaveCollection } from '../firebase';

interface CandidatePortalProps {
  candidateEmail: string;
  onLogout: () => void;
  triggerToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export default function CandidatePortal({
  candidateEmail,
  onLogout,
  triggerToast
}: CandidatePortalProps) {
  const [candidateProfile, setCandidateProfile] = useState<Candidate | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [prepChecklist, setPrepChecklist] = useState<{ id: string; text: string; done: boolean; category: string }[]>([
    { id: 'prep-1', text: 'Upload latest resume / CV copy', done: false, category: 'Documents' },
    { id: 'prep-2', text: 'Prepare software development slide portfolio', done: false, category: 'Technical' },
    { id: 'prep-3', text: 'Review company tech stack and system architecture', done: false, category: 'General' },
    { id: 'prep-4', text: 'Configure camera, mic, and IDE for coding challenge', done: false, category: 'Setup' },
    { id: 'prep-5', text: 'Submit initial reference details', done: false, category: 'Documents' }
  ]);

  // Profile fields editing
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // HR Question submission
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'candidate' | 'system' | 'hr'; text: string; timestamp: string }[]>([
    { sender: 'hr', text: 'Welcome to your candidate command dashboard! If you have questions regarding remote setups, equipment allotment, joining dates, or salary structures, type them below to contact our HR support nodes.', timestamp: 'Just now' }
  ]);

  // Sync with MongoDB-backed collections
  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        const allCandidates = await dbGetCollection<Candidate>('crm_candidates');
        const targetCandidate = allCandidates.find(c => c.email?.toLowerCase() === candidateEmail.toLowerCase()) ?? null;

        if (targetCandidate) {
          setCandidateProfile(targetCandidate);
          setName(targetCandidate.name);
          setSkills(targetCandidate.skills);
          setExperience(targetCandidate.experience);

          const allInterviews = await dbGetCollection<Interview>('crm_interviews');
          setInterviews(allInterviews.filter(int => int.candidateId === targetCandidate.id));
        } else {
          const mockProfile: Candidate = {
            id: 'cand-fallback',
            name: 'Hired Candidate',
            email: candidateEmail,
            skills: 'React, Node.js, TypeScript',
            experience: '4 years',
            status: 'Interview'
          };
          setCandidateProfile(mockProfile);
          setName(mockProfile.name);
          setSkills(mockProfile.skills);
          setExperience(mockProfile.experience);
        }
      } catch (err) {
        console.error('Failed to resolve candidate portal state:', err);
      }
    };

    fetchCandidateData();
  }, [candidateEmail]);

  // Handle saving profile refinements
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateProfile) return;

    const updatedProfile = {
      ...candidateProfile,
      name,
      skills,
      experience
    };

    try {
      await dbSaveItem('crm_candidates', candidateProfile.id, updatedProfile);
      setCandidateProfile(updatedProfile);
      setIsEditingProfile(false);
      triggerToast('Application profile updated successfully!', 'success');
    } catch (err) {
      triggerToast('Failed to sync profile updates to recruitment file.', 'error');
    }
  };

  // Toggle prep checks
  const handleToggleCheck = (id: string) => {
    const updated = prepChecklist.map(item => 
      item.id === id ? { ...item, done: !item.done } : item
    );
    setPrepChecklist(updated);
    triggerToast('Onboarding milestone checklist updated.', 'success');
  };

  // Handle HR chat or question submission
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage.trim();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatHistory(prev => [...prev, { sender: 'candidate', text: userMsg, timestamp }]);
    setChatMessage('');

    // Trigger instant simulated reply
    setTimeout(async () => {
      let reply = "Your request has been received by HR operations. We will contact you shortly.";
      
      const lower = userMsg.toLowerCase();
      if (lower.includes('salary') || lower.includes('compensation') || lower.includes('payroll')) {
        reply = "Compensation structures are determined during selection evaluations. Once selected, your formal offer letter outlining HRA, Medical, PF, and Special Allowances will be dispatched directly to your inbox.";
      } else if (lower.includes('laptop') || lower.includes('computer') || lower.includes('equipment') || lower.includes('hardware')) {
        reply = "Every selected candidate receives high-end workspace allotment (e.g. MacBook Pro or Dell Latitude) during their day 1 onboarding sequence. We also cover ergonomic setups and secondary monitors.";
      } else if (lower.includes('interview') || lower.includes('round') || lower.includes('date')) {
        reply = "Your interview itinerary is managed live by our Talent Acquisition coordinators. Review your 'Schedules' tab to trace active timings and interviewer bios.";
      } else if (lower.includes('status') || lower.includes('result') || lower.includes('offer')) {
        reply = `Your application status is currently marked as [${candidateProfile?.status || 'Active'}]. Once the interview panel files their feedback, the system will update this status immediately.`;
      }

      setChatHistory(prev => [...prev, { sender: 'hr', text: reply, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);

      try {
        const currentIssues = await dbGetCollection<AssistsIssue>('crm_issues');
        const newIssue: AssistsIssue = {
          id: `cand-query-${Date.now()}`,
          title: `Candidate Portal Query: ${candidateProfile?.name || 'Candidate'}`,
          category: 'HR Query',
          severity: 'Medium',
          description: `Query submitted via Candidate Portal: "${userMsg}". Access Email: ${candidateEmail}`,
          employeeId: candidateProfile?.id || 'candidate',
          employeeName: candidateProfile?.name || 'Candidate Portal User',
          status: 'Pending',
          dateCreated: new Date().toISOString().split('T')[0]
        };
        await dbSaveItem('crm_issues', newIssue.id, newIssue);
        await dbSaveCollection('crm_issues', [...currentIssues, newIssue]);
      } catch (err) {
        console.error('Failed to sync candidate portal query to system issues database:', err);
      }
    }, 1000);
  };

  // Status tracking helper
  const getStatusStepClass = (step: 'applied' | 'interview' | 'decision') => {
    const currentStatus = candidateProfile?.status || 'New';
    
    if (step === 'applied') {
      return 'bg-emerald-500 border-emerald-500 text-slate-950 font-bold';
    }
    if (step === 'interview') {
      if (currentStatus === 'Interview' || currentStatus === 'Selected' || currentStatus === 'Rejected') {
        return 'bg-emerald-500 border-emerald-500 text-slate-950 font-bold';
      }
      return 'bg-slate-800 border-slate-700 text-slate-400';
    }
    if (step === 'decision') {
      if (currentStatus === 'Selected') {
        return 'bg-amber-500 border-amber-500 text-slate-950 font-bold';
      }
      if (currentStatus === 'Rejected') {
        return 'bg-rose-500 border-rose-500 text-white font-bold';
      }
      return 'bg-slate-800 border-slate-700 text-slate-400';
    }
    return '';
  };

  if (!candidateProfile) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-sky-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Background glowing blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top portal header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 py-4 px-8 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-sky-400 to-indigo-500 p-2 rounded-xl text-slate-950 font-bold shadow-md shadow-sky-500/10">
            <Briefcase className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              CRM Candidate Workspace
            </h1>
            <span className="text-[9px] uppercase font-bold tracking-widest text-sky-400 block mt-0.5">Application Pipeline</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 bg-white/5 px-3.5 py-1.5 rounded-xl border border-white/5">
            <div className="h-7 w-7 rounded-lg bg-sky-400 text-slate-900 flex items-center justify-center font-extrabold text-xs">
              {candidateProfile.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-200">{candidateProfile.name}</p>
              <p className="text-[9px] text-slate-500 truncate">{candidateEmail}</p>
            </div>
          </div>

          <button
            id="btn-logout"
            onClick={onLogout}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10 hover:border-rose-500/20 transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Exit Portal</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Scrollport */}
      <main className="flex-1 overflow-y-auto max-w-7xl w-full mx-auto px-6 sm:px-8 py-8 space-y-8 relative z-10">
        
        {/* Welcome Section & Milestones */}
        <div className="bg-[#121c33]/40 border border-slate-800/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                <span>Application Active</span>
              </div>
              <h2 className="text-2xl font-black text-slate-100 tracking-tight">
                Hello, {candidateProfile.name}!
              </h2>
              <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                Thank you for applying. This portal allows you to coordinate interview timelines, upload required materials, refine application records, and trace your progress through the corporate pipeline.
              </p>
            </div>

            {/* Main Application Status display */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 text-center min-w-[200px]">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-1">Active Status</span>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-black font-mono">
                {candidateProfile.status === 'New' && (
                  <span className="text-blue-400 bg-blue-500/15 border border-blue-500/35 px-3 py-1 rounded-lg">Applied & Screening</span>
                )}
                {candidateProfile.status === 'Interview' && (
                  <span className="text-sky-400 bg-sky-500/15 border border-sky-500/35 px-3 py-1 rounded-lg">Interview Stage</span>
                )}
                {candidateProfile.status === 'Selected' && (
                  <span className="text-emerald-400 bg-emerald-500/15 border border-emerald-500/35 px-3 py-1 rounded-lg">Candidate Selected 🎉</span>
                )}
                {candidateProfile.status === 'Rejected' && (
                  <span className="text-rose-400 bg-rose-500/15 border border-rose-500/35 px-3 py-1 rounded-lg">Application Closed</span>
                )}
              </div>
            </div>
          </div>

          {/* Recruitment Funnel Timeline */}
          <div className="pt-6 border-t border-slate-800/60">
            <div className="text-[10px] font-black tracking-widest uppercase text-slate-500 mb-6">Recruitment Funnel Progress</div>
            <div className="relative">
              {/* Connector line */}
              <div className="absolute top-5 left-4 right-4 sm:left-10 sm:right-10 h-0.5 bg-slate-800 z-0" />
              
              <div className="grid grid-cols-3 relative z-10 text-center gap-4">
                {/* Step 1: Applied */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition shadow-lg ${getStatusStepClass('applied')}`}>
                    <CheckCircle className="w-5 h-5 text-slate-950" />
                  </div>
                  <span className="text-xs font-bold text-slate-200 mt-3 block">Applied</span>
                  <span className="text-[9px] text-slate-500 font-mono mt-0.5">Profile Submitted</span>
                </div>

                {/* Step 2: Interviews */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition shadow-lg ${getStatusStepClass('interview')}`}>
                    {candidateProfile.status === 'Interview' || candidateProfile.status === 'Selected' || candidateProfile.status === 'Rejected' ? (
                      <CheckCircle className="w-5 h-5 text-slate-950" />
                    ) : (
                      <Calendar className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-200 mt-3 block">Interviews</span>
                  <span className="text-[9px] text-slate-500 font-mono mt-0.5">Panels & Assessments</span>
                </div>

                {/* Step 3: Selection */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition shadow-lg ${getStatusStepClass('decision')}`}>
                    {candidateProfile.status === 'Selected' ? (
                      <CheckCircle className="w-5 h-5 text-slate-950" />
                    ) : candidateProfile.status === 'Rejected' ? (
                      <AlertCircle className="w-5 h-5 text-white" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-200 mt-3 block">Final Status</span>
                  <span className="text-[9px] text-slate-500 font-mono mt-0.5">Decision Completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Column Left: Interviews & Prep Checklist (Span 7) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Scheduled Interviews Card */}
            <div className="bg-[#0f172a] border border-slate-800/80 rounded-2xl p-6 space-y-5">
              <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/60 pb-3">
                <Calendar className="w-4.5 h-4.5 text-sky-400" />
                <span>My Interview Agenda ({interviews.length})</span>
              </h3>

              {interviews.length === 0 ? (
                <div className="text-center p-8 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                  <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2 animate-bounce" />
                  <p className="text-xs text-slate-400 italic">No panel interviews scheduled currently.</p>
                  <p className="text-[10px] text-slate-500 mt-1">HR coordinators will schedule a session if your application passes initial evaluations.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {interviews.map(int => (
                    <div key={int.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3.5 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-slate-200 uppercase tracking-wide">
                            Round with: {int.interviewer}
                          </h4>
                          <div className="flex flex-wrap gap-4 text-[10px] text-slate-400 font-mono">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-sky-400" />
                              {int.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-sky-400" />
                              {int.time}
                            </span>
                          </div>
                        </div>

                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          int.status === 'Scheduled' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          int.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          'bg-rose-500/10 text-rose-400'
                        }`}>
                          {int.status}
                        </span>
                      </div>

                      {/* feedback review */}
                      {int.feedback && (
                        <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed font-mono">
                          <div className="text-[9px] uppercase font-black tracking-widest text-indigo-400 mb-1">Session Notes & Guidelines</div>
                          {int.feedback}
                        </div>
                      )}

                      {int.status === 'Completed' && int.result && (
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[10px] text-slate-500 uppercase font-black font-sans">Evaluation Decision:</span>
                          <span className={`text-[10px] font-extrabold uppercase font-mono px-2 py-0.5 rounded ${
                            int.result === 'Passed' ? 'bg-emerald-500/15 text-emerald-400' :
                            int.result === 'Failed' ? 'bg-rose-500/15 text-rose-400' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {int.result}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Preparation Milestone Checklist */}
            <div className="bg-[#0f172a] border border-slate-800/80 rounded-2xl p-6 space-y-5">
              <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/60 pb-3">
                <CheckSquare className="w-4.5 h-4.5 text-sky-400" />
                <span>Onboarding Preparation Checklist</span>
              </h3>

              <div className="space-y-2.5">
                {prepChecklist.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => handleToggleCheck(item.id)}
                    className="flex items-center gap-4 p-3 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/60 rounded-xl transition cursor-pointer active:scale-[0.99]"
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition shrink-0 ${
                      item.done ? 'bg-sky-500 border-sky-500 text-slate-950' : 'border-slate-700'
                    }`}>
                      {item.done && <CheckCircle className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs ${item.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>{item.text}</p>
                    </div>
                    <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 select-none">
                      {item.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Column Right: Profile Edit & HR Communication Box (Span 5) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* My Application File */}
            <div className="bg-[#0f172a] border border-slate-800/80 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4.5 h-4.5 text-sky-400" />
                  <span>My Recruitment File</span>
                </h3>

                <button
                  type="button"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="text-xs text-sky-400 hover:text-sky-300 font-bold transition cursor-pointer"
                >
                  {isEditingProfile ? 'Cancel' : 'Refine File'}
                </button>
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Registered Skills</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. React, Docker, SQL"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Relevant Experience</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 5 Years"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-wider bg-sky-500 hover:bg-sky-400 text-slate-950 transition active:scale-95 cursor-pointer"
                  >
                    Commit Refinements
                  </button>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800 space-y-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm">
                        C
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-200">{candidateProfile.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{candidateEmail}</div>
                      </div>
                    </div>

                    <div className="border-t border-slate-800/60 pt-3.5 space-y-2.5">
                      <div>
                        <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 block">Technical Competencies</span>
                        <p className="text-xs text-slate-300 font-mono mt-0.5 leading-normal">{candidateProfile.skills || 'Not declared'}</p>
                      </div>

                      <div>
                        <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 block">Experience Level</span>
                        <p className="text-xs text-slate-300 font-mono mt-0.5">{candidateProfile.experience || 'Not declared'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-4 border border-slate-800 rounded-xl flex items-center gap-3">
                    <Laptop className="w-5 h-5 text-indigo-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-300">Smart Pre-onboarding Enabled</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Your refinements will update the talent metrics dashboard instantly for reviews.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* HR Communications Terminal */}
            <div className="bg-[#0f172a] border border-slate-800/80 rounded-2xl p-6 space-y-4 flex flex-col">
              <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/60 pb-3">
                <MessageSquare className="w-4.5 h-4.5 text-sky-400" />
                <span>HR Communications Portal</span>
              </h3>

              {/* Chat screen feed */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 h-64 overflow-y-auto space-y-4 custom-scrollbar shadow-inner">
                {chatHistory.map((msg, i) => {
                  const isHr = msg.sender === 'hr';
                  return (
                    <div key={i} className={`flex flex-col ${isHr ? 'items-start' : 'items-end'}`}>
                      <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                        isHr 
                          ? 'bg-slate-900 text-slate-300 border border-slate-800 rounded-tl-none' 
                          : 'bg-indigo-500 text-white rounded-tr-none'
                      }`}>
                        <div className="text-[8px] uppercase tracking-wider font-extrabold mb-1 opacity-60">
                          {isHr ? 'HR Support Officer' : 'My Query'}
                        </div>
                        {msg.text}
                      </div>
                      <span className="text-[8px] text-slate-600 font-mono mt-1 px-1">{msg.timestamp}</span>
                    </div>
                  );
                })}
              </div>

              {/* Chat submission bar */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a pre-onboarding HR question..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none placeholder-slate-600 transition"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl transition active:scale-95 cursor-pointer"
                  title="Submit Query"
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </form>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
