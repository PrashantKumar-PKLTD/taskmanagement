import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  User,
  Calendar,
  Clock,
  Tag,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  Star,
  FolderOpen,
  Users,
  Target,
  Settings,
  RefreshCw
} from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import { useProjectStore } from '../../store/projectStore';
import { useUserStore } from '../../store/userStore';
import TaskForm from '../tasks/TaskForm';
import TaskDetails from '../tasks/TaskDetails';

interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  color: string;
  icon: React.ComponentType<any>;
  tasks: any[];
}

const KanbanBoard: React.FC = () => {
  const [currentView, setCurrentView] = useState<'board' | 'create' | 'edit' | 'details'>('board');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [draggedTask, setDraggedTask] = useState<any>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus
  } = useTaskStore();

  const { projects, fetchProjects } = useProjectStore();
  const { currentUser, getActiveUsers } = useUserStore();
  const activeUsers = getActiveUsers();

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  // Define Kanban columns
  const columns: KanbanColumn[] = [
    {
      id: 'pending',
      title: 'To Do',
      status: 'pending',
      color: 'bg-yellow-500',
      icon: Clock,
      tasks: []
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      status: 'in-progress',
      color: 'bg-blue-500',
      icon: Play,
      tasks: []
    },
    {
      id: 'completed',
      title: 'Completed',
      status: 'completed',
      color: 'bg-green-500',
      icon: CheckCircle,
      tasks: []
    },
    {
      id: 'cancelled',
      title: 'Cancelled',
      status: 'cancelled',
      color: 'bg-red-500',
      icon: AlertCircle,
      tasks: []
    }
  ];

  // Filter and organize tasks
  const filteredTasks = React.useMemo(() => {
    let result = tasks;
    
    if (searchTerm) {
      result = result.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (projectFilter !== 'all') {
      result = result.filter(task => 
        task.projectId === projectFilter || task.projectId?._id === projectFilter
      );
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
  }, [tasks, searchTerm, projectFilter, assigneeFilter, currentUser?.id]);

  // Organize tasks by status
  const columnsWithTasks = columns.map(column => ({
    ...column,
    tasks: filteredTasks.filter(task => task.status === column.status)
  }));

  const handleCreateTask = () => {
    setSelectedTask(null);
    setCurrentView('create');
  };

  const handleEditTask = (task: any) => {
    setSelectedTask(task);
    setCurrentView('edit');
  };

  const handleViewTask = (task: any) => {
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
      setCurrentView('board');
      setSelectedTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, task: any) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (draggedTask && draggedTask.status !== columnId) {
      await updateTaskStatus(draggedTask.id, columnId);
    }
    
    setDraggedTask(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-slate-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getAssigneeName = (task: any) => {
    if (task.assigneeDetails) {
      return task.assigneeDetails.name;
    }
    if (task.assignee === currentUser?.id) {
      return 'You';
    }
    return 'Unassigned';
  };

  const getProject = (task: any) => {
    return projects.find(p => p.id === task.projectId || p._id === task.projectId);
  };

  if (currentView === 'create' || currentView === 'edit') {
    return (
      <TaskForm
        task={selectedTask}
        projects={projects}
        onSubmit={handleSubmitTask}
        onCancel={() => setCurrentView('board')}
      />
    );
  }

  if (currentView === 'details') {
    return (
      <TaskDetails
        task={selectedTask}
        projects={projects}
        onEdit={() => handleEditTask(selectedTask)}
        onBack={() => setCurrentView('board')}
      />
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="max-w-full mx-auto flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Kanban Board</h1>
            <p className="text-slate-400">Visualize and manage your tasks with drag & drop</p>
          </div>
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <button
              onClick={() => fetchTasks()}
              className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
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

        {/* Filters */}
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
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
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-slate-300 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                >
                  <option value="all">All Projects</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>

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
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-6 min-w-max pb-6">
              {columnsWithTasks.map((column) => (
                <div
                  key={column.id}
                  className={`w-80 bg-slate-800 rounded-xl border border-slate-700 flex flex-col ${
                    dragOverColumn === column.id ? 'ring-2 ring-red-500 ring-opacity-50' : ''
                  }`}
                  onDragOver={(e) => handleDragOver(e, column.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  {/* Column Header */}
                  <div className="p-4 border-b border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 ${column.color} rounded-full`}></div>
                        <h3 className="text-lg font-semibold text-white">{column.title}</h3>
                        <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded-full text-sm font-medium">
                          {column.tasks.length}
                        </span>
                      </div>
                      <button className="p-1 text-slate-400 hover:text-white rounded">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Column Content */}
                  <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-300px)]">
                    {column.tasks.length === 0 ? (
                      <div className="text-center py-8">
                        <column.icon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm">No tasks in {column.title.toLowerCase()}</p>
                        {column.id === 'pending' && currentUser && (
                          <button
                            onClick={handleCreateTask}
                            className="mt-3 text-red-400 hover:text-red-300 text-sm font-medium"
                          >
                            Create your first task
                          </button>
                        )}
                      </div>
                    ) : (
                      column.tasks.map((task) => {
                        const project = getProject(task);
                        const isAssignedToCurrentUser = task.assignee === currentUser?.id;
                        
                        return (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task)}
                            className={`bg-slate-700 rounded-lg p-4 border-l-4 ${getPriorityColor(task.priority)} cursor-move hover:bg-slate-600 transition-colors group ${
                              isAssignedToCurrentUser ? 'ring-1 ring-blue-500/30' : ''
                            }`}
                          >
                            {/* Task Header */}
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="text-white font-medium text-sm line-clamp-2 flex-1">
                                {task.title}
                              </h4>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                <button
                                  onClick={() => handleViewTask(task)}
                                  className="p-1 text-slate-400 hover:text-blue-400 rounded"
                                  title="View Details"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleEditTask(task)}
                                  className="p-1 text-slate-400 hover:text-green-400 rounded"
                                  title="Edit Task"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin') && (
                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="p-1 text-slate-400 hover:text-red-400 rounded"
                                    title="Delete Task"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Task Description */}
                            {task.description && (
                              <p className="text-slate-400 text-xs mb-3 line-clamp-2">
                                {task.description.replace(/<[^>]*>/g, '')}
                              </p>
                            )}

                            {/* Task Meta */}
                            <div className="space-y-2">
                              {/* Project */}
                              {project && (
                                <div className="flex items-center gap-2">
                                  <FolderOpen className="w-3 h-3 text-slate-400" />
                                  <span className="text-slate-400 text-xs truncate">{project.name}</span>
                                </div>
                              )}

                              {/* Assignee */}
                              <div className="flex items-center gap-2">
                                <User className="w-3 h-3 text-slate-400" />
                                <span className={`text-xs truncate ${isAssignedToCurrentUser ? 'text-blue-400 font-medium' : 'text-slate-400'}`}>
                                  {getAssigneeName(task)}
                                </span>
                              </div>

                              {/* Due Date */}
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span className="text-slate-400 text-xs">
                                  {formatDate(task.dueDate)}
                                </span>
                              </div>

                              {/* Priority Badge */}
                              <div className="flex items-center justify-between">
                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                  task.priority === 'critical' ? 'text-red-400 bg-red-400/10' :
                                  task.priority === 'high' ? 'text-orange-400 bg-orange-400/10' :
                                  task.priority === 'medium' ? 'text-yellow-400 bg-yellow-400/10' :
                                  'text-green-400 bg-green-400/10'
                                }`}>
                                  <Star className="w-3 h-3" />
                                  {task.priority}
                                </div>

                                {/* Tags */}
                                {task.tags && task.tags.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Tag className="w-3 h-3 text-slate-400" />
                                    <span className="text-slate-400 text-xs">
                                      {task.tags.length}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Assigned to you indicator */}
                            {isAssignedToCurrentUser && (
                              <div className="mt-3 pt-3 border-t border-slate-600">
                                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                                  <Users className="w-3 h-3" />
                                  Assigned to you
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanBoard;