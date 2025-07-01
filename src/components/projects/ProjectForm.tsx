import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Calendar, Users, Target, AlertCircle, UserPlus } from 'lucide-react';
import { useUserStore } from '../../store/userStore';

interface ProjectFormProps {
  project?: any;
  onSubmit: (projectData: any) => Promise<void>;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  onSubmit,
  onCancel
}) => {
  const { getActiveUsers, currentUser } = useUserStore();
  const activeUsers = getActiveUsers();
  
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'active',
    priority: project?.priority || 'medium',
    startDate: project?.startDate || new Date().toISOString().split('T')[0],
    dueDate: project?.dueDate || '',
    budget: project?.budget || '',
    client: project?.client || '',
    teamMembers: project?.teamMembers || [],
    tags: project?.tags || [],
    objectives: project?.objectives || [''],
    deliverables: project?.deliverables || ['']
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showUserAssignment, setShowUserAssignment] = useState(false);

  // Allow admins and project managers to assign users
  const canAssignUsers = currentUser?.role === 'Super Admin' || 
                        currentUser?.role === 'Admin' || 
                        currentUser?.role === 'Project Manager';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (!formData.dueDate) {
      alert('Please set a due date for the project');
      return;
    }

    setIsSubmitting(true);
    try {
      const projectData = {
        ...formData,
        objectives: formData.objectives.filter(obj => obj.trim()),
        deliverables: formData.deliverables.filter(del => del.trim()),
        budget: formData.budget ? parseFloat(formData.budget) : null,
        assignedBy: currentUser?.id,
        createdAt: project?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await onSubmit(projectData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const toggleUserAssignment = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(userId)
        ? prev.teamMembers.filter(id => id !== userId)
        : [...prev.teamMembers, userId]
    }));
  };

  const addObjective = () => {
    setFormData(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }));
  };

  const updateObjective = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => i === index ? value : obj)
    }));
  };

  const removeObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  };

  const addDeliverable = () => {
    setFormData(prev => ({
      ...prev,
      deliverables: [...prev.deliverables, '']
    }));
  };

  const updateDeliverable = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.map((del, i) => i === index ? value : del)
    }));
  };

  const removeDeliverable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onCancel}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {project ? 'Edit Project' : 'Create New Project'}
            </h1>
            <p className="text-slate-400 mt-1">
              {project ? 'Update project details and settings' : 'Set up a new project with goals and timeline'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Project Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the project goals, scope, and key requirements in detail..."
                  rows={6}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  required
                />
                <p className="text-slate-400 text-sm mt-2">
                  Provide a detailed description of the project scope, goals, and requirements.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                >
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
                  <Calendar className="w-4 h-4" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
                  <Target className="w-4 h-4" />
                  Due Date *
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Budget
                </label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Client
                </label>
                <input
                  type="text"
                  value={formData.client}
                  onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                  placeholder="Client name or organization"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* Team Assignment */}
          {canAssignUsers && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Team Assignment</h2>
                <button
                  type="button"
                  onClick={() => setShowUserAssignment(!showUserAssignment)}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  {showUserAssignment ? 'Hide Users' : 'Assign Users'}
                </button>
              </div>
              
              {showUserAssignment && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                    {activeUsers.map((user) => (
                      <label
                        key={user.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          formData.teamMembers.includes(user.id)
                            ? 'bg-red-500/20 border border-red-500/30'
                            : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.teamMembers.includes(user.id)}
                          onChange={() => toggleUserAssignment(user.id)}
                          className="w-4 h-4 text-red-500 bg-slate-600 border-slate-500 rounded focus:ring-red-500 focus:ring-2"
                        />
                        <div className="flex-1">
                          <div className="text-white font-medium text-sm">{user.name}</div>
                          <div className="text-slate-400 text-xs">{user.role}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  
                  <div className="text-sm text-slate-400">
                    {formData.teamMembers.length} user(s) selected
                  </div>
                </div>
              )}

              {/* Selected Team Members Display */}
              {formData.teamMembers.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-slate-300 mb-3">Selected Team Members:</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.teamMembers.map((userId) => {
                      const user = activeUsers.find(u => u.id === userId);
                      return user ? (
                        <span key={userId} className="inline-flex items-center gap-1 bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm">
                          <Users className="w-3 h-3" />
                          {user.name}
                          <button
                            type="button"
                            onClick={() => toggleUserAssignment(userId)}
                            className="text-slate-400 hover:text-red-400 ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Admin Notice for Non-Admins */}
          {!canAssignUsers && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-yellow-400 font-medium text-sm mb-1">Team Assignment</h3>
                  <p className="text-yellow-300 text-xs leading-relaxed">
                    Only administrators can assign team members to projects. Contact your admin to assign users to this project.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Tags</h2>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add project tag"
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                >
                  Add
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-slate-400 hover:text-red-400 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Objectives */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Project Objectives</h2>
            
            <div className="space-y-4">
              {formData.objectives.map((objective, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => updateObjective(index, e.target.value)}
                    placeholder={`Objective ${index + 1}`}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeObjective(index)}
                    className="px-3 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addObjective}
                className="text-red-400 hover:text-red-300 text-sm font-medium"
              >
                + Add Objective
              </button>
            </div>
          </div>

          {/* Deliverables */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Deliverables</h2>
            
            <div className="space-y-4">
              {formData.deliverables.map((deliverable, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={deliverable}
                    onChange={(e) => updateDeliverable(index, e.target.value)}
                    placeholder={`Deliverable ${index + 1}`}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeDeliverable(index)}
                    className="px-3 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addDeliverable}
                className="text-red-400 hover:text-red-300 text-sm font-medium"
              >
                + Add Deliverable
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-slate-700">
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {project ? 'Update Project' : 'Create Project'}
              </button>
              
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-300 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;