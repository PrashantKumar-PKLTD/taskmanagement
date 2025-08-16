import React from 'react';
import { 
  Calendar, 
  Users, 
  Target, 
  Clock, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Star,
  AlertCircle,
  CheckCircle,
  Play,
  Pause
} from 'lucide-react';

interface ProjectCardProps {
  project: any;
  viewMode: 'grid' | 'list';
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  viewMode,
  onView,
  onEdit,
  onDelete
}) => {
  // Error handling for invalid project data
  if (!project) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Invalid Project Data</span>
        </div>
        <p className="text-red-300 text-sm mt-2">This project could not be loaded due to missing data.</p>
      </div>
    );
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'completed': return 'text-purple-400 bg-purple-400/10';
      case 'on-hold': return 'text-yellow-400 bg-yellow-400/10';
      case 'cancelled': return 'text-red-400 bg-red-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return Play;
      case 'completed': return CheckCircle;
      case 'on-hold': return Pause;
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
    if (!dateString) return 'No date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const calculateProgress = () => {
    try {
      if (!Array.isArray(project.tasks) || project.tasks.length === 0) return 0;
      const completedTasks = project.tasks.filter((task: any) => task?.status === 'completed').length;
      return Math.round((completedTasks / project.tasks.length) * 100);
    } catch (error) {
      console.error('Error calculating progress:', error);
      return 0;
    }
  };

  const StatusIcon = getStatusIcon(project.status || 'unknown');
  const progress = calculateProgress();
  
  // Safe access to project properties
  const projectName = String(project.name || 'Unnamed Project');
  const projectStatus = String(project.status || 'unknown');
  const projectPriority = String(project.priority || 'unknown');
  const projectDescription = String(project.description || 'No description available');
  const teamMembersCount = Array.isArray(project.teamMembers) ? project.teamMembers.length : 0;
  const dueDate = project.dueDate || null;

  if (viewMode === 'list') {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-slate-600 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-white">{projectName}</h3>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(projectStatus)}`}>
                  <StatusIcon className="w-3 h-3" />
                  {projectStatus.charAt(0).toUpperCase() + projectStatus.slice(1)}
                </div>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(projectPriority)}`}>
                  {projectPriority.charAt(0).toUpperCase() + projectPriority.slice(1)}
                </div>
              </div>
              <p className="text-slate-400 text-sm line-clamp-1">{projectDescription}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {teamMembersCount}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(dueDate)}
              </div>
              <div className="flex items-center gap-2">
                <span>Progress:</span>
                <div className="w-20 bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="text-white font-medium">{progress}%</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  try {
                    onView();
                  } catch (error) {
                    console.error('Error viewing project:', error);
                    alert('Error loading project details. Please try again.');
                  }
                }}
                className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  try {
                    onEdit();
                  } catch (error) {
                    console.error('Error editing project:', error);
                    alert('Error opening project editor. Please try again.');
                  }
                }}
                className="p-2 text-slate-400 hover:text-green-400 hover:bg-slate-700 rounded-lg transition-colors"
                title="Edit Project"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  try {
                    onDelete();
                  } catch (error) {
                    console.error('Error deleting project:', error);
                    alert('Error deleting project. Please try again.');
                  }
                }}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                title="Delete Project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{projectName}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(projectStatus)}`}>
                <StatusIcon className="w-3 h-3" />
                {projectStatus.charAt(0).toUpperCase() + projectStatus.slice(1)}
              </div>
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(projectPriority)}`}>
                {projectPriority.charAt(0).toUpperCase() + projectPriority.slice(1)}
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

      <p className="text-slate-400 text-sm mb-4 line-clamp-2">{projectDescription}</p>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-slate-400">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {teamMembersCount} members
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(dueDate)}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-400">Progress</span>
            <span className="text-white font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => {
              try {
                onView();
              } catch (error) {
                console.error('Error viewing project:', error);
                alert('Error loading project details. Please try again.');
              }
            }}
            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-medium transition-colors"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          <button
            onClick={() => {
              try {
                onEdit();
              } catch (error) {
                console.error('Error editing project:', error);
                alert('Error opening project editor. Please try again.');
              }
            }}
            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => {
              try {
                onDelete();
              } catch (error) {
                console.error('Error deleting project:', error);
                alert('Error deleting project. Please try again.');
              }
            }}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
            title="Delete Project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;