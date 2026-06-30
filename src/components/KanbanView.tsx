/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  User, 
  ArrowLeftRight,
  ClipboardList,
  AlertCircle,
  X,
  Search,
  CheckCircle2,
  Trello
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority, Employee } from '../types';

interface KanbanViewProps {
  tasks: Task[];
  employees: Employee[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onUpdateTaskStatus: (id: string, status: TaskStatus) => void;
  onDeleteTask: (id: string) => void;
}

export default function KanbanView({
  tasks,
  employees,
  onAddTask,
  onUpdateTaskStatus,
  onDeleteTask
}: KanbanViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedEmployeeId, setAssignedEmployeeId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [dueDate, setDueDate] = useState('');

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onUpdateTaskStatus(taskId, status);
    }
  };

  // Reset form helper
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAssignedEmployeeId(employees[0]?.id || '');
    setPriority('Medium');
    setDueDate('');
  };

  // Open modal
  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !assignedEmployeeId || !dueDate) {
      alert('Please fill out all task details.');
      return;
    }

    onAddTask({
      title,
      description,
      status: 'To Do',
      assignedEmployeeId,
      priority,
      dueDate
    });

    setIsModalOpen(false);
    resetForm();
  };

  // Filter tasks based on search
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    task.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: { id: TaskStatus; label: string; countColor: string; bgCol: string }[] = [
    { id: 'To Do', label: 'To Do Pool', countColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20', bgCol: 'bg-slate-900/20' },
    { id: 'In Progress', label: 'In Progress', countColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20', bgCol: 'bg-slate-900/30' },
    { id: 'Completed', label: 'Completed Log', countColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', bgCol: 'bg-slate-900/40' }
  ];

  const getPriorityStyles = (p: TaskPriority) => {
    switch (p) {
      case 'High': return 'text-rose-400 bg-rose-500/10 border border-rose-500/20';
      case 'Medium': return 'text-amber-400 bg-amber-500/10 border border-amber-500/20';
      case 'Low': return 'text-blue-400 bg-blue-500/10 border border-blue-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border border-slate-500/20';
    }
  };

  const getEmployeeName = (id: string) => {
    return employees.find(e => e.id === id)?.name || 'Unassigned';
  };

  const getEmployeeInitials = (id: string) => {
    const name = getEmployeeName(id);
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Board controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/30 p-5 rounded-2xl border border-slate-800/40">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            id="task-search-input"
            type="text"
            placeholder="Search task board contents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/40 border border-slate-700/40 focus:border-teal-400 rounded-xl py-2 px-10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all"
          />
        </div>

        <button
          id="btn-add-task-trigger"
          onClick={handleOpenAdd}
          className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-teal-500/10 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Formulate Task</span>
        </button>
      </div>

      {/* Board Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {columns.map((col) => {
          const columnTasks = filteredTasks.filter(t => t.status === col.id);

          return (
            <div
              key={col.id}
              id={`kanban-col-${col.id.replace(/\s+/g, '-').toLowerCase()}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`rounded-2xl border border-slate-800/80 p-5 min-h-[550px] flex flex-col ${col.bgCol}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-5">
                <span className="font-extrabold text-sm text-slate-200 tracking-tight">{col.label}</span>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${col.countColor} font-mono`}>
                  {columnTasks.length}
                </span>
              </div>

              {/* Column Cards Pool */}
              <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px] pr-1.5 custom-scrollbar">
                {columnTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-800 rounded-xl text-slate-600 bg-slate-950/10">
                    <ClipboardList className="h-8 w-8 text-slate-700 mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Column Empty</span>
                    <span className="text-[9px] text-slate-600 mt-1">Drag items here or formulate tasks</span>
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <div
                      key={task.id}
                      id={`task-card-${task.id}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800/70 hover:border-slate-700/80 p-4.5 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-300 group shadow-lg"
                    >
                      {/* Priority and delete row */}
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md ${getPriorityStyles(task.priority)}`}>
                          {task.priority} Priority
                        </span>
                        <button
                          id={`btn-delete-task-${task.id}`}
                          onClick={() => {
                            if (confirm(`Delete task: "${task.title}"?`)) {
                              onDeleteTask(task.id);
                            }
                          }}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Content */}
                      <h4 className="font-bold text-slate-200 text-sm mt-3 group-hover:text-teal-400 transition-colors">
                        {task.title}
                      </h4>
                      <p className="text-slate-400 text-xs font-medium mt-1 leading-relaxed">
                        {task.description}
                      </p>

                      {/* Info bottom row */}
                      <div className="flex items-center justify-between mt-4.5 pt-3 border-t border-slate-800/50">
                        {/* Assignee Avatar */}
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6.5 h-6.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/10 font-bold text-[10px] flex items-center justify-center"
                            title={`Assigned to: ${getEmployeeName(task.assignedEmployeeId)}`}
                          >
                            {getEmployeeInitials(task.assignedEmployeeId)}
                          </div>
                          <span className="text-[10px] text-slate-400 truncate w-24 font-semibold">
                            {getEmployeeName(task.assignedEmployeeId)}
                          </span>
                        </div>

                        {/* Due Date */}
                        <div className="text-[9px] text-slate-500 flex items-center gap-1 font-mono font-semibold">
                          <Calendar className="w-3 h-3 text-slate-600" />
                          <span>{task.dueDate}</span>
                        </div>
                      </div>

                      {/* Mobile friendly click indicators */}
                      <div className="mt-3.5 pt-2 border-t border-slate-800/30 flex items-center justify-end gap-1.5 lg:hidden">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mr-auto">Fast Relocate</span>
                        {task.status !== 'To Do' && (
                          <button
                            onClick={() => onUpdateTaskStatus(task.id, task.status === 'Completed' ? 'In Progress' : 'To Do')}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold px-1.5 py-0.5 rounded text-[9px]"
                          >
                            ← Prev
                          </button>
                        )}
                        {task.status !== 'Completed' && (
                          <button
                            onClick={() => onUpdateTaskStatus(task.id, task.status === 'To Do' ? 'In Progress' : 'Completed')}
                            className="bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500/25 font-extrabold px-1.5 py-0.5 rounded text-[9px]"
                          >
                            Next →
                          </button>
                        )}
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Formulate Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-teal-500/10 rounded-lg text-teal-400">
                  <Trello className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-bold text-slate-100 text-base">Formulate Kanban Task</h3>
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
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Task Title</label>
                <input
                  id="task-form-title"
                  type="text"
                  required
                  placeholder="e.g. Redesign Onboarding Panel"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Detailed Specifications</label>
                <textarea
                  id="task-form-desc"
                  required
                  rows={3}
                  placeholder="Summarize instructions and expected deliverables..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Assignee & Priority */}
              <div className="grid grid-cols-2 gap-4">
                {/* Assignee select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Assign Employee</label>
                  <select
                    id="task-form-assignee"
                    value={assignedEmployeeId}
                    onChange={(e) => setAssignedEmployeeId(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="" disabled>Select Employee</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Priority</label>
                  <select
                    id="task-form-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Deadline Date</label>
                <input
                  id="task-form-duedate"
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700/50 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none font-mono cursor-pointer"
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
                  id="task-form-submit"
                  type="submit"
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs shadow-lg shadow-teal-500/10 active:scale-95 transition cursor-pointer"
                >
                  Launch Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
