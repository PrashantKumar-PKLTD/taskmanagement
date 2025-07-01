import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  FolderOpen, 
  Users, 
  Calendar, 
  Clock, 
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Star,
  GitBranch,
  Activity,
  BarChart3
} from 'lucide-react';
import ProjectForm from './ProjectForm';
import ProjectDetails from './ProjectDetails';
import ProjectCard from './ProjectCard';
import { useProjectStore } from '../../store/projectStore';
import { useUserStore } from '../../store/userStore';

const ProjectManagement: React.FC = () => {
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit' | 'details'>('list');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'on-hold' | 'cancelled'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    searchProjects,
    filterProjectsByStatus,
    filterProjectsByPriority
  } = useProjectStore();

  const { currentUser } = useUserStore();

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = React.useMemo(() => {
    let result = projects;
    
    if (searchTerm) {
      result = searchProjects(searchTerm);
    }
    
    if (statusFilter !== 'all') {
      result = filterProjectsByStatus(statusFilter);
    }
    
    if (priorityFilter !== 'all') {
      result = filterProjectsByPriority(priorityFilter);
    }
    
    return result;
  }, [projects, searchTerm, statusFilter, priorityFilter, searchProjects, filterProjectsByStatus, filterProjectsByPriority]);

  const handleCreateProject = () => {
    setSelectedProject(null);
    setCurrentView('create');
  };

  const handleEditProject = (project: any) => {
    setSelectedProject(project);
    setCurrentView('edit');
  };

  const handleViewProject = (project: any) => {
    setSelectedProject(project);
    setCurrentView('details');
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await deleteProject(projectId);
    }
  };

  const handleSubmitProject = async (projectData: any) => {
    try {
      if (selectedProject) {
        await updateProject(selectedProject.id, projectData);
      } else {
        await createProject(projectData);
      }
      setCurrentView('list');
      setSelectedProject(null);
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const getStatusStats = () => {
    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      onHold: projects.filter(p => p.status === 'on-hold').length,
      cancelled: projects.filter(p => p.status === 'cancelled').length
    };
  };

  const stats = getStatusStats();

  // Check if user can create projects (Admin, Super Admin, or Project Manager)
  const canCreateProjects = currentUser?.role === 'Super Admin' || 
                           currentUser?.role === 'Admin' || 
                           currentUser?.role === 'Project Manager';

  if (currentView === 'create' || currentView === 'edit') {
    return (
      <ProjectForm
        project={selectedProject}
        onSubmit={handleSubmitProject}
        onCancel={() => setCurrentView('list')}
      />
    );
  }

  if (currentView === 'details') {
    return (
      <ProjectDetails
        project={selectedProject}
        onEdit={() => handleEditProject(selectedProject)}
        onBack={() => setCurrentView('list')}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Project Management</h1>
            <p className="text-slate-400">Organize, track, and manage your projects efficiently</p>
          </div>
          {canCreateProjects && (
            <button
              onClick={handleCreateProject}
              className="mt-4 sm:mt-0 inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Project
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Projects</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <FolderOpen className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active</p>
                <p className="text-2xl font-bold text-white">{stats.active}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Play className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Completed</p>
                <p className="text-2xl font-bold text-white">{stats.completed}</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">On Hold</p>
                <p className="text-2xl font-bold text-white">{stats.onHold}</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Pause className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Cancelled</p>
                <p className="text-2xl font-bold text-white">{stats.cancelled}</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search projects by name, description, or team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-slate-300 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-slate-300 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-slate-300 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>

              <div className="flex items-center bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <Activity className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Project List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
            <FolderOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
            <p className="text-slate-400 mb-6">Get started by creating your first project</p>
            {canCreateProjects && (
              <button
                onClick={handleCreateProject}
                className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Project
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                viewMode={viewMode}
                onView={() => handleViewProject(project)}
                onEdit={() => handleEditProject(project)}
                onDelete={() => handleDeleteProject(project.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectManagement;