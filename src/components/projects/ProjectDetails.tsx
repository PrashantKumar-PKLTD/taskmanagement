import React from 'react';
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  Users, 
  Target, 
  DollarSign,
  Clock,
  CheckCircle,
  Play,
  Pause,
  AlertCircle,
  Star,
  Tag,
  User,
  FileText,
  TrendingUp
} from 'lucide-react';

interface ProjectDetailsProps {
  project: any;
  onEdit: () => void;
  onBack: () => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  project,
  onEdit,
  onBack
}) => {
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateProgress = () => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter((task: any) => task.status === 'completed').length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  const getDaysRemaining = () => {
    const today = new Date();
    const dueDate = new Date(project.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const StatusIcon = getStatusIcon(project.status);
  const progress = calculateProgress();
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
              <h1 className="text-3xl font-bold text-white">{project.name}</h1>
              <p className="text-slate-400 mt-1">Project details and progress tracking</p>
            </div>
          </div>
          
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Project
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Overview */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{project.name}</h2>
                    <div className="flex items-center gap-3">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                        <StatusIcon className="w-4 h-4" />
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </div>
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(project.priority)}`}>
                        <Star className="w-4 h-4" />
                        {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)} Priority
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rich Text Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Project Description</h3>
                <div 
                  className="prose prose-invert prose-slate max-w-none prose-headings:text-white prose-p:text-slate-300 prose-a:text-red-400 prose-strong:text-white prose-blockquote:border-red-500 prose-blockquote:bg-slate-700/50 prose-code:bg-slate-700 prose-code:text-slate-300 prose-ul:text-slate-300 prose-ol:text-slate-300 prose-li:text-slate-300"
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-300 font-medium">Overall Progress</span>
                  <span className="text-white font-bold text-lg">{progress}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-slate-700 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-white font-bold">{daysRemaining}</div>
                  <div className="text-slate-400 text-sm">Days Left</div>
                </div>
                <div className="text-center p-4 bg-slate-700 rounded-lg">
                  <Users className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <div className="text-white font-bold">{project.teamMembers?.length || 0}</div>
                  <div className="text-slate-400 text-sm">Team Members</div>
                </div>
                <div className="text-center p-4 bg-slate-700 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-white font-bold">{project.tasks?.filter((t: any) => t.status === 'completed').length || 0}</div>
                  <div className="text-slate-400 text-sm">Completed Tasks</div>
                </div>
                <div className="text-center p-4 bg-slate-700 rounded-lg">
                  <DollarSign className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <div className="text-white font-bold">{project.budget ? `$${project.budget.toLocaleString()}` : 'N/A'}</div>
                  <div className="text-slate-400 text-sm">Budget</div>
                </div>
              </div>
            </div>

            {/* Objectives */}
            {project.objectives && project.objectives.length > 0 && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Project Objectives
                </h3>
                <div className="space-y-3">
                  {project.objectives.map((objective: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <p className="text-slate-300">{objective}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deliverables */}
            {project.deliverables && project.deliverables.length > 0 && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Deliverables
                </h3>
                <div className="space-y-3">
                  {project.deliverables.map((deliverable: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                      <p className="text-slate-300">{deliverable}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Project Details */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Project Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Start Date</span>
                  <span className="text-white">{formatDate(project.startDate)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Due Date</span>
                  <span className="text-white">{formatDate(project.dueDate)}</span>
                </div>
                
                {project.client && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Client</span>
                    <span className="text-white">{project.client}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Created</span>
                  <span className="text-white">{formatDate(project.createdAt)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Last Updated</span>
                  <span className="text-white">{formatDate(project.updatedAt)}</span>
                </div>
              </div>
            </div>

            {/* Team Members */}
            {project.teamMembers && project.teamMembers.length > 0 && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Members ({project.teamMembers.length})
                </h3>
                
                <div className="space-y-3">
                  {project.teamMembers.map((member: string, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-slate-300">{member}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Tags
                </h3>
                
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag: string) => (
                    <span key={tag} className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                  <TrendingUp className="w-4 h-4" />
                  View Analytics
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                  <FileText className="w-4 h-4" />
                  Generate Report
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                  <Users className="w-4 h-4" />
                  Manage Team
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;