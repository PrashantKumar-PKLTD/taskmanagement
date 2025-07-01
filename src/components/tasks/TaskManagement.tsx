import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Play, 
  Pause,
  Calendar,
  User,
  FolderOpen,
  Tag,
  StickyNote,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Star,
  Target,
  Users,
  FileText,
  Bookmark,
  UserCheck,
  Shield
} from 'lucide-react';
import TaskForm from './TaskForm';
import TaskDetails from './TaskDetails';
import TaskCard from './TaskCard';
import NotesPanel from './NotesPanel';
import { useTaskStore } from '../../store/taskStore';
import { useProjectStore } from '../../store/projectStore';
import { useUserStore } from '../../store/userStore';

const TaskManagement: React.FC = () => {
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit' | 'details'>('list');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed' | 'cancelled'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showNotesPanel, setShowNotesPanel] = useState(false);

  const {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    searchTasks,
    filterTasksByStatus,
    filterTasksByPriority,
    filterTasksByProject,
    getTasksForUser
  } = useTaskStore();

  const { projects, fetchProjects } = useProjectStore();
  const { currentUser, getActiveUsers, hasPermission } = useUserStore();
  const activeUsers = getActiveUsers();

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  const filteredTasks = React.useMemo(() => {
    let result = tasks;
    
    if (searchTerm) {
      result = searchTasks(searchTerm);
    }
    
    if (statusFilter !== 'all') {
      result = filterTasksByStatus(statusFilter);
    }
    
    if (priorityFilter !== 'all') {
      result = filterTasksByPriority(priorityFilter);
    }
    
    if (projectFilter !== 'all') {
      result = filterTasksByProject(projectFilter);
    }

    if (assigneeFilter !== 'all') {
      if (assigneeFilter === 'me') {
        result = result.filter(task => task.assignee === currentUser?.id);
      } else if (assigneeFilter === 'unassigned') {
        result = result.filter(task => !task.assignee);
      } else {
        result = result.filter(task => task.assignee === assigneeFilter);
      }
    }
    
    return result;
  }, [tasks, searchTerm, statusFilter, priorityFilter, projectFilter, assigneeFilter, currentUser?.id, searchTasks, filterTasksByStatus, filterTasksByPriority, filterTasksByProject]);

  const handleCreateTask = () => {
    setSelectedTask(null);
    setCurrentView('create');
  };

  const handleEditTask = (task: any) => {
    setSelectedTask(task);
    setCurrentView('edit');
  };

  const handleViewTask = (task: any) => {
    console.log('Viewing task:', task); // Debug log
    setSelectedTask(task);
    setCurrentView('details');
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  const handleSubmitTask = async (taskData: any) => {
    try {
      if (selectedTask) {
        await updateTask(selectedTask.id, taskData);
      } else {
        await createTask(taskData);
      }
      setCurrentView('list');
      setSelectedTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleQuickStatusUpdate = async (taskId: string, newStatus: string) => {
    await updateTaskStatus(taskId, newStatus, currentUser?.id || '');
  };

  const getStatusStats = () => {
    const userTasks = currentUser ? getTasksForUser(currentUser.id) : [];
    const allTasks = tasks;
    
    return {
      total: allTasks.length,
      pending: allTasks.filter(t => t.status === 'pending').length,
      inProgress: allTasks.filter(t => t.status === 'in-progress').length,
      completed: allTasks.filter(t => t.status === 'completed').length,
      cancelled: allTasks.filter(t => t.status === 'cancelled').length,
      myTasks: userTasks.length
    };
  };

  const stats = getStatusStats();

  // SIMPLIFIED PERMISSION CHECKS - ALLOW ALL LOGGED IN USERS
  const canCreateTasks = () => {
    // If user is logged in, they can create tasks
    return !!currentUser;
  };

  const canEditTask = (task: any) => {
    // If user is logged in, they can edit tasks
    return !!currentUser;
  };

  const canDeleteTask = (task: any) => {
    // Only Super Admin and Admin can delete tasks
    if (currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin') {
      return true;
    }
    
    return false;
  };

  const canViewTask = (task: any) => {
    // If user is logged in, they can view tasks
    return !!currentUser;
  };

  if (currentView === 'create' || currentView === 'edit') {
    return (
      <TaskForm
        task={selectedTask}
        projects={projects}
        onSubmit={handleSubmitTask}
        onCancel={() => setCurrentView('list')}
      />
    );
  }

  if (currentView === 'details') {
    if (!selectedTask) {
      console.error('No task selected for details view');
      setCurrentView('list');
      return null;
    }

    return (
      <TaskDetails
        task={selectedTask}
        projects={projects}
        onEdit={() => handleEditTask(selectedTask)}
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
            <h1 className="text-3xl font-bold text-white mb-2">Task Management</h1>
            <p className="text-slate-400">Organize and track tasks across all your projects</p>
          </div>
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <button
              onClick={() => setShowNotesPanel(!showNotesPanel)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                showNotesPanel 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              <StickyNote className="w-4 h-4" />
              Notes
            </button>
            {/* ALWAYS SHOW CREATE BUTTON FOR LOGGED IN USERS */}
            {currentUser && (
              <button
                onClick={handleCreateTask}
                className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                New Task
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Main Content */}
          <div className={`${showNotesPanel ? 'flex-1' : 'w-full'} transition-all duration-300`}>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Tasks</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <CheckSquare className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">My Tasks</p>
                    <p className="text-2xl font-bold text-white">{stats.myTasks}</p>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <UserCheck className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Pending</p>
                    <p className="text-2xl font-bold text-white">{stats.pending}</p>
                  </div>
                  <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">In Progress</p>
                    <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
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
                      placeholder="Search tasks by title, description, or assignee..."
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
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
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

                  <select
                    value={projectFilter}
                    onChange={(e) => setProjectFilter(e.target.value)}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-slate-300 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  >
                    <option value="all">All Projects</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>

                  <select
                    value={assigneeFilter}
                    onChange={(e) => setAssigneeFilter(e.target.value)}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-slate-300 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  >
                    <option value="all">All Assignees</option>
                    <option value="me">My Tasks</option>
                    <option value="unassigned">Unassigned</option>
                    {activeUsers.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>

                  <div className="flex items-center bg-slate-700 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      <Target className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      <CheckSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Task List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
                <p className="text-red-400">{error}</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
                <CheckSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No tasks found</h3>
                <p className="text-slate-400 mb-6">
                  {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all' || assigneeFilter !== 'all'
                    ? 'Try adjusting your search filters'
                    : 'Get started by creating your first task'
                  }
                </p>
                {currentUser && (
                  <button
                    onClick={handleCreateTask}
                    className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Create Task
                  </button>
                )}
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    projects={projects}
                    viewMode={viewMode}
                    onView={() => handleViewTask(task)}
                    onEdit={() => handleEditTask(task)}
                    onDelete={() => handleDeleteTask(task.id)}
                    canView={canViewTask(task)}
                    canEdit={canEditTask(task)}
                    canDelete={canDeleteTask(task)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Notes Panel */}
          {showNotesPanel && (
            <div className="w-80 transition-all duration-300">
              <NotesPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskManagement;