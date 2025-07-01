import React, { useState } from 'react';
import { Save, ArrowLeft, Calendar, User, Clock, Target, AlertCircle, UserPlus } from 'lucide-react';
import { useUserStore } from '../../store/userStore';

interface TaskFormProps {
  task?: any;
  projects: any[];
  onSubmit: (taskData: any) => Promise<void>;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  projects,
  onSubmit,
  onCancel
}) => {
  const { getActiveUsers, currentUser } = useUserStore();
  const activeUsers = getActiveUsers();
  
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'pending',
    priority: task?.priority || 'medium',
    projectId: task?.projectId || '',
    assignee: task?.assignee || '',
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
    estimatedHours: task?.estimatedHours || '',
    tags: task?.tags || [],
    notes: task?.notes || '',
    attachments: task?.attachments || []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showUserSelection, setShowUserSelection] = useState(false);

  // SIMPLIFIED PERMISSION CHECKS - ALLOW ALL LOGGED IN USERS
  const canAssignUsers = () => {
    // All logged in users can assign tasks
    return !!currentUser;
  };

  const canCreateTasks = () => {
    // All logged in users can create tasks
    return !!currentUser;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (!formData.dueDate) {
      alert('Please set a due date for the task');
      return;
    }

    if (!formData.projectId) {
      alert('Please select a project for this task');
      return;
    }

    // If no assignee is set, assign to current user
    if (!formData.assignee) {
      formData.assignee = currentUser?.id || '';
    }

    setIsSubmitting(true);
    try {
      const taskData = {
        ...formData,
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
        assignedBy: currentUser?.id,
        createdAt: task?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await onSubmit(taskData);
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

  const getSelectedUser = () => {
    return activeUsers.find(user => user.id === formData.assignee);
  };

  // ALLOW ALL USERS TO SEE ALL PROJECTS
  const availableProjects = projects;

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
              {task ? 'Edit Task' : 'Create New Task'}
            </h1>
            <p className="text-slate-400 mt-1">
              {task ? 'Update task details and settings' : 'Create a new task and assign it to a project'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Task Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Task Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the task requirements, acceptance criteria, and any important details..."
                  rows={6}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  required
                />
                <p className="text-slate-400 text-sm mt-2">
                  Provide detailed requirements and acceptance criteria for this task.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Project *
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  required
                >
                  <option value="">Select a project</option>
                  {availableProjects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
                {availableProjects.length === 0 && (
                  <p className="text-yellow-400 text-sm mt-2">
                    No projects available. Contact your administrator to create a project.
                  </p>
                )}
              </div>

              {/* User Assignment */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
                  <User className="w-4 h-4" />
                  Assignee
                  <button
                    type="button"
                    onClick={() => setShowUserSelection(!showUserSelection)}
                    className="ml-2 p-1 text-blue-400 hover:text-blue-300"
                    title="Select user"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                </label>
                
                <div className="space-y-3">
                  {/* Selected User Display */}
                  <div className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white min-h-[48px] flex items-center">
                    {getSelectedUser() ? (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {getSelectedUser()?.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-white font-medium">{getSelectedUser()?.name}</div>
                          <div className="text-slate-400 text-sm">{getSelectedUser()?.role}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, assignee: '' }))}
                          className="ml-auto text-slate-400 hover:text-red-400"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {currentUser?.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-white font-medium">{currentUser?.name} (You)</div>
                          <div className="text-slate-400 text-sm">Default assignee</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Selection Dropdown */}
                  {showUserSelection && (
                    <div className="border border-slate-600 rounded-lg bg-slate-700 max-h-48 overflow-y-auto">
                      {activeUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, assignee: user.id }));
                            setShowUserSelection(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-slate-600 transition-colors text-left"
                        >
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-white font-medium">{user.name}</div>
                            <div className="text-slate-400 text-sm">{user.role}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
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
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
                  <Clock className="w-4 h-4" />
                  Estimated Hours
                </label>
                <input
                  type="number"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                  placeholder="0"
                  step="0.5"
                  min="0"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Tags</h2>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add task tag"
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

          {/* Notes */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Additional Notes</h2>
            
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any additional notes, comments, or important information about this task..."
              rows={6}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
            <p className="text-slate-400 text-sm mt-2">
              Use this section for meeting notes, progress updates, or any other relevant information.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-slate-700">
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting || !canCreateTasks()}
                className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {task ? 'Update Task' : 'Create Task'}
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

export default TaskForm;