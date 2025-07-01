import React from 'react';
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  User, 
  Clock, 
  Target,
  CheckCircle,
  Play,
  Pause,
  AlertCircle,
  Star,
  Tag,
  FolderOpen,
  FileText,
  MessageSquare
} from 'lucide-react';

interface TaskDetailsProps {
  task: any;
  projects: any[];
  onEdit: () => void;
  onBack: () => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({
  task,
  projects,
  onEdit,
  onBack
}) => {
  // Safety check
  if (!task) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Task Not Found</h1>
              <p className="text-slate-400 mt-1">The requested task could not be found</p>
            </div>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
            <p className="text-red-400">Task data is not available. Please go back and try again.</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'in-progress': return 'text-green-400 bg-green-400/10';
      case 'completed': return 'text-purple-400 bg-purple-400/10';
      case 'cancelled': return 'text-red-400 bg-red-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'in-progress': return Play;
      case 'completed': return CheckCircle;
      case 'cancelled': return AlertCircle;
      default: return Clock;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-400/10';
      case 'high': return 'text-orange-400 bg-orange-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'low': return 'text-green-400 bg-green-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = () => {
    if (!task.dueDate) return 0;
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProject = () => {
    return projects.find(p => p.id === task.projectId || p._id === task.projectId);
  };

  const getAssigneeName = () => {
    if (task.assigneeDetails) {
      return task.assigneeDetails.name;
    }
    return 'Unassigned';
  };

  const StatusIcon = getStatusIcon(task.status);
  const project = getProject();
  const daysRemaining = getDaysRemaining();

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">{task.title || 'Untitled Task'}</h1>
              <p className="text-slate-400 mt-1">Task details and progress tracking</p>
            </div>
          </div>
          
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Task
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Task Overview */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{task.title || 'Untitled Task'}</h2>
                    <div className="flex items-center gap-3">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                        <StatusIcon className="w-4 h-4" />
                        {task.status ? task.status.charAt(0).toUpperCase() + task.status.slice(1) : 'Unknown'}
                      </div>
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                        <Star className="w-4 h-4" />
                        {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium'} Priority
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Task Description</h3>
                {task.description ? (
                  <div 
                    className="prose prose-invert prose-slate max-w-none prose-headings:text-white prose-p:text-slate-300 prose-a:text-red-400 prose-strong:text-white prose-blockquote:border-red-500 prose-blockquote:bg-slate-700/50 prose-code:bg-slate-700 prose-code:text-slate-300 prose-ul:text-slate-300 prose-ol:text-slate-300 prose-li:text-slate-300"
                    dangerouslySetInnerHTML={{ __html: task.description }}
                  />
                ) : (
                  <p className="text-slate-400">No description provided</p>
                )}
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-slate-700 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-white font-bold">{daysRemaining}</div>
                  <div className="text-slate-400 text-sm">Days Left</div>
                </div>
                {task.estimatedHours && (
                  <div className="text-center p-4 bg-slate-700 rounded-lg">
                    <Clock className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <div className="text-white font-bold">{task.estimatedHours}h</div>
                    <div className="text-slate-400 text-sm">Estimated</div>
                  </div>
                )}
                {project && (
                  <div className="text-center p-4 bg-slate-700 rounded-lg">
                    <FolderOpen className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-white font-bold text-sm">{project.name}</div>
                    <div className="text-slate-400 text-sm">Project</div>
                  </div>
                )}
                <div className="text-center p-4 bg-slate-700 rounded-lg">
                  <User className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <div className="text-white font-bold text-sm">{getAssigneeName()}</div>
                  <div className="text-slate-400 text-sm">Assignee</div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {task.notes && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Additional Notes
                </h3>
                <div 
                  className="prose prose-invert prose-slate max-w-none prose-headings:text-white prose-p:text-slate-300 prose-a:text-red-400 prose-strong:text-white prose-blockquote:border-red-500 prose-blockquote:bg-slate-700/50 prose-code:bg-slate-700 prose-code:text-slate-300 prose-ul:text-slate-300 prose-ol:text-slate-300 prose-li:text-slate-300"
                  dangerouslySetInnerHTML={{ __html: task.notes }}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Task Details */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Task Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Due Date</span>
                  <span className="text-white">{formatDate(task.dueDate)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Assignee</span>
                  <span className="text-white">{getAssigneeName()}</span>
                </div>
                
                {task.estimatedHours && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Estimated Hours</span>
                    <span className="text-white">{task.estimatedHours}h</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Created</span>
                  <span className="text-white">{formatDate(task.createdAt)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Last Updated</span>
                  <span className="text-white">{formatDate(task.updatedAt)}</span>
                </div>
              </div>
            </div>

            {/* Project Info */}
            {project && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  Project
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-white font-medium">{project.name}</h4>
                    <p className="text-slate-400 text-sm mt-1">{project.status}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Due Date</span>
                    <span className="text-white">{formatDate(project.dueDate)}</span>
                  </div>
                  {project.client && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Client</span>
                      <span className="text-white">{project.client}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Tags
                </h3>
                
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag: string) => (
                    <span key={tag} className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
          
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;