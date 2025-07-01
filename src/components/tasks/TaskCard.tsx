import React from 'react';
import { 
  Calendar, 
  User, 
  Clock, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Star,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  FolderOpen,
  Tag,
  UserCheck
} from 'lucide-react';
import { useUserStore } from '../../store/userStore';

interface TaskCardProps {
  task: any;
  projects: any[];
  viewMode: 'grid' | 'list';
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canView?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  projects,
  viewMode,
  onView,
  onEdit,
  onDelete,
  canView = true,
  canEdit = true,
  canDelete = true
}) => {
  const { currentUser } = useUserStore();
  const isAssignedToCurrentUser = task.assignee === currentUser?.id;

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
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getProject = () => {
    return projects.find(p => p.id === task.projectId || p._id === task.projectId);
  };

  const getAssigneeName = () => {
    if (task.assigneeDetails) {
      return task.assigneeDetails.name;
    }
    if (task.assignee === currentUser?.id) {
      return 'You';
    }
    return 'Unassigned';
  };

  const StatusIcon = getStatusIcon(task.status);
  const project = getProject();

  if (viewMode === 'list') {
    return (
      <div className={`bg-slate-800 rounded-xl border p-6 hover:border-slate-600 transition-colors ${
        isAssignedToCurrentUser ? 'border-blue-500/30 bg-blue-500/5' : 'border-slate-700'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                {isAssignedToCurrentUser && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                    <UserCheck className="w-3 h-3" />
                    Assigned to you
                  </div>
                )}
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  <StatusIcon className="w-3 h-3" />
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </div>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </div>
              </div>
              <p className="text-slate-400 text-sm line-clamp-1">
                {task.description ? task.description.replace(/<[^>]*>/g, '') : 'No description'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-sm text-slate-400">
              {project && (
                <div className="flex items-center gap-1">
                  <FolderOpen className="w-4 h-4" />
                  {project.name}
                </div>
              )}
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {getAssigneeName()}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(task.dueDate)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canView && (
                <button
                  onClick={onView}
                  className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              {canEdit && (
                <button
                  onClick={onEdit}
                  className="p-2 text-slate-400 hover:text-green-400 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Edit Task"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {canDelete && (
                <button
                  onClick={onDelete}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800 rounded-xl border p-6 hover:border-slate-600 transition-colors ${
      isAssignedToCurrentUser ? 'border-blue-500/30 bg-blue-500/5' : 'border-slate-700'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{task.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              {isAssignedToCurrentUser && (
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                  <UserCheck className="w-3 h-3" />
                  Assigned to you
                </div>
              )}
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                <StatusIcon className="w-3 h-3" />
                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </div>
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-slate-400 text-sm mb-4 line-clamp-2">
        {task.description ? task.description.replace(/<[^>]*>/g, '') : 'No description'}
      </p>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-slate-400">
            {project && (
              <div className="flex items-center gap-1">
                <FolderOpen className="w-4 h-4" />
                {project.name}
              </div>
            )}
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {getAssigneeName()}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Due: {formatDate(task.dueDate)}
          </div>
          {task.estimatedHours && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {task.estimatedHours}h
            </div>
          )}
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-slate-400" />
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 2).map((tag: string) => (
                <span key={tag} className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">
                  {tag}
                </span>
              ))}
              {task.tags.length > 2 && (
                <span className="text-slate-400 text-xs">
                  +{task.tags.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          {canView && (
            <button
              onClick={onView}
              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-medium transition-colors"
            >
              <Eye className="w-4 h-4" />
              View
            </button>
          )}
          {canEdit && (
            <button
              onClick={onEdit}
              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={onDelete}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;