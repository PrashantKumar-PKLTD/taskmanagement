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
  // Error handling for invalid or missing project data
  if (!project) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">Project Not Found</h1>
                <p className="text-slate-400 mt-1">Unable to load project details</p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-400 mb-2">Project Data Unavailable</h3>
            <p className="text-slate-300 mb-6">
              The project you're trying to view could not be loaded. This might be due to:
            </p>
            <ul className="text-slate-400 text-left max-w-md mx-auto mb-6 space-y-2">
              <li>• The project may have been deleted</li>
              <li>• Network connectivity issues</li>
              <li>• Insufficient permissions to view this project</li>
              <li>• Server error while fetching project data</li>
            </ul>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Projects
              </button>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Validate required project fields
  const hasValidData = project.name && project.status && project.priority;
  if (!hasValidData) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">Invalid Project Data</h1>
                <p className="text-slate-400 mt-1">Project information is incomplete</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-yellow-400 mb-2">Incomplete Project Information</h3>
            <p className="text-slate-300 mb-6">
              The project data appears to be corrupted or incomplete. Some required fields are missing.
            </p>
            <div className="bg-slate-800 rounded-lg p-4 mb-6">
              <h4 className="text-white font-medium mb-2">Available Data:</h4>
              <pre className="text-slate-400 text-sm text-left overflow-auto">
                {JSON.stringify(project, null, 2)}
              </pre>
            </div>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Projects
              </button>
              <button
                onClick={() => onEdit()}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Edit className="w-5 h-5" />
                Try to Edit
              </button>
            </div>
          </div>
        </div>
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
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const calculateProgress = () => {
    try {
      if (!project.tasks || project.tasks.length === 0) return 0;
      const completedTasks = project.tasks.filter((task: any) => task.status === 'completed').length;
      return Math.round((completedTasks / project.tasks.length) * 100);
    } catch (error) {
      console.error('Error calculating progress:', error);
      return 0;
    }
  };

  const getDaysRemaining = () => {
    try {
      if (!project.dueDate) return 0;
      const today = new Date();
      const dueDate = new Date(project.dueDate);
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      console.error('Error calculating days remaining:', error);
      return 0;
    }
  };

  const StatusIcon = getStatusIcon(project.status);
  const progress = calculateProgress();
  const daysRemaining = getDaysRemaining();

  try {
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
                    <h2 className="text-2xl font-bold text-white mb-2">{String(project.name || 'Unnamed Project')}</h2>
                    <div className="flex items-center gap-3">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status || 'unknown')}`}>
                        <StatusIcon className="w-4 h-4" />
                        {(project.status || 'unknown').charAt(0).toUpperCase() + (project.status || 'unknown').slice(1)}
                      </div>
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(project.priority || 'unknown')}`}>
                        <Star className="w-4 h-4" />
                        {(project.priority || 'unknown').charAt(0).toUpperCase() + (project.priority || 'unknown').slice(1)} Priority
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
                  dangerouslySetInnerHTML={{ __html: String(project.description || 'No description available.') }}
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
                  <div className="text-white font-bold">{Array.isArray(project.teamMembers) ? project.teamMembers.length : 0}</div>
                  <div className="text-slate-400 text-sm">Team Members</div>
                </div>
                <div className="text-center p-4 bg-slate-700 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-white font-bold">{Array.isArray(project.tasks) ? project.tasks.filter((t: any) => t?.status === 'completed').length : 0}</div>
                  <div className="text-slate-400 text-sm">Completed Tasks</div>
                </div>
                <div className="text-center p-4 bg-slate-700 rounded-lg">
                  <DollarSign className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <div className="text-white font-bold">{project.budget ? `$${Number(project.budget).toLocaleString()}` : 'N/A'}</div>
                  <div className="text-slate-400 text-sm">Budget</div>
                </div>
              </div>
            </div>

            {/* Objectives */}
            {Array.isArray(project.objectives) && project.objectives.length > 0 && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Project Objectives
                </h3>
                <div className="space-y-3">
                  {project.objectives.map((objective: any, index: number) => {
                    const objectiveText = typeof objective === 'string' ? objective : String(objective || 'No objective specified');
                    return (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <p className="text-slate-300">{objectiveText}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Deliverables */}
            {Array.isArray(project.deliverables) && project.deliverables.length > 0 && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Deliverables
                </h3>
                <div className="space-y-3">
                  {project.deliverables.map((deliverable: any, index: number) => {
                    const deliverableText = typeof deliverable === 'string' ? deliverable : String(deliverable || 'No deliverable specified');
                    return (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                        <p className="text-slate-300">{deliverableText}</p>
                      </div>
                    );
                  })}
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
                    <span className="text-white">{String(project.client)}</span>
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
            {Array.isArray(project.teamMembers) && project.teamMembers.length > 0 && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Members ({project.teamMembers.length})
                </h3>
                
                <div className="space-y-3">
                  {project.teamMembers.map((member: any, index: number) => {
                    const memberName = typeof member === 'string' 
                      ? member 
                      : (member?.name || member?.email || `Member ${index + 1}`);
                    
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-slate-300">{memberName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tags */}
            {Array.isArray(project.tags) && project.tags.length > 0 && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Tags
                </h3>
                
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag: any, index: number) => {
                    const tagText = typeof tag === 'string' ? tag : String(tag || 'No tag');
                    return (
                      <span key={index} className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm">
                        {tagText}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button 
                  onClick={() => alert('Analytics feature coming soon!')}
                  className="w-full flex items-center gap-3 p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  View Analytics
                </button>
                <button 
                  onClick={() => alert('Report generation feature coming soon!')}
                  className="w-full flex items-center gap-3 p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Generate Report
                </button>
                <button 
                  onClick={() => alert('Team management feature coming soon!')}
                  className="w-full flex items-center gap-3 p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
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
  } catch (error) {
    console.error('Error rendering ProjectDetails:', error);
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">Render Error</h1>
                <p className="text-slate-400 mt-1">Failed to display project details</p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-400 mb-2">Rendering Error</h3>
            <p className="text-slate-300 mb-6">
              An unexpected error occurred while trying to display this project. The project data may be corrupted or incompatible.
            </p>
            <div className="bg-slate-800 rounded-lg p-4 mb-6">
              <h4 className="text-white font-medium mb-2">Error Details:</h4>
              <p className="text-red-400 text-sm">{error instanceof Error ? error.message : 'Unknown rendering error'}</p>
            </div>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Projects
              </button>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default ProjectDetails;