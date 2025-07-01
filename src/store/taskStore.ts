import { create } from 'zustand';
import { API_ENDPOINTS, apiRequest } from '../config/api';

interface Task {
  _id: string;
  id: string; // Add for compatibility
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  projectId: any; // Full project object or ID
  assignee?: any; // Full user object
  assignedBy?: any; // Full user object
  dueDate: string;
  estimatedHours?: number;
  actualHours: number;
  tags: string[];
  notes: string;
  attachments: any[];
  timeEntries: any[];
  comments: any[];
  createdAt: string;
  updatedAt: string;
}

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchTasks: () => Promise<void>;
  createTask: (taskData: any) => Promise<void>;
  updateTask: (id: string, taskData: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  assignTaskToUser: (taskId: string, userId: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: string) => Promise<void>;
  addTimeEntry: (taskId: string, hours: number, description?: string) => Promise<void>;
  addComment: (taskId: string, content: string) => Promise<void>;
  searchTasks: (searchTerm: string) => Task[];
  filterTasksByStatus: (status: string) => Task[];
  filterTasksByPriority: (priority: string) => Task[];
  filterTasksByProject: (projectId: string) => Task[];
  getTasksForUser: (userId: string) => Task[];
  getTasksAssignedByUser: (userId: string) => Task[];
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiRequest(API_ENDPOINTS.TASKS.BASE);
      const tasks = (response.tasks || response).map((task: any) => ({
        ...task,
        id: task._id || task.id,
        assigneeDetails: task.assignee // For compatibility
      }));
      set({ tasks, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createTask: async (taskData) => {
    set({ loading: true, error: null });
    try {
      const response = await apiRequest(API_ENDPOINTS.TASKS.BASE, {
        method: 'POST',
        body: JSON.stringify(taskData),
      });
      
      const newTask = {
        ...response.task,
        id: response.task._id || response.task.id,
        assigneeDetails: response.task.assignee
      };
      
      set(state => ({ 
        tasks: [newTask, ...state.tasks], 
        loading: false 
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateTask: async (id, taskData) => {
    set({ loading: true, error: null });
    try {
      const response = await apiRequest(API_ENDPOINTS.TASKS.BY_ID(id), {
        method: 'PUT',
        body: JSON.stringify(taskData),
      });
      
      const updatedTask = {
        ...response.task,
        id: response.task._id || response.task.id,
        assigneeDetails: response.task.assignee
      };
      
      set(state => ({
        tasks: state.tasks.map(task => 
          (task._id === id || task.id === id) ? updatedTask : task
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteTask: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiRequest(API_ENDPOINTS.TASKS.BY_ID(id), {
        method: 'DELETE',
      });
      
      set(state => ({
        tasks: state.tasks.filter(task => task._id !== id && task.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  assignTaskToUser: async (taskId, userId) => {
    try {
      await get().updateTask(taskId, { assignee: userId });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateTaskStatus: async (taskId, status) => {
    set({ loading: true, error: null });
    try {
      const response = await apiRequest(API_ENDPOINTS.TASKS.STATUS(taskId), {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      
      const updatedTask = {
        ...response.task,
        id: response.task._id || response.task.id,
        assigneeDetails: response.task.assignee
      };
      
      set(state => ({
        tasks: state.tasks.map(task => 
          (task._id === taskId || task.id === taskId) ? updatedTask : task
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  addTimeEntry: async (taskId, hours, description = '') => {
    try {
      const response = await apiRequest(API_ENDPOINTS.TASKS.TIME(taskId), {
        method: 'POST',
        body: JSON.stringify({ hours, description }),
      });
      
      const updatedTask = {
        ...response.task,
        id: response.task._id || response.task.id,
        assigneeDetails: response.task.assignee
      };
      
      set(state => ({
        tasks: state.tasks.map(task => 
          (task._id === taskId || task.id === taskId) ? updatedTask : task
        )
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  addComment: async (taskId, content) => {
    try {
      const response = await apiRequest(API_ENDPOINTS.TASKS.COMMENT(taskId), {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      
      const updatedTask = {
        ...response.task,
        id: response.task._id || response.task.id,
        assigneeDetails: response.task.assignee
      };
      
      set(state => ({
        tasks: state.tasks.map(task => 
          (task._id === taskId || task.id === taskId) ? updatedTask : task
        )
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  searchTasks: (searchTerm) => {
    const { tasks } = get();
    return tasks.filter(task =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.tags.some(tag => 
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  },

  filterTasksByStatus: (status) => {
    const { tasks } = get();
    return tasks.filter(task => task.status === status);
  },

  filterTasksByPriority: (priority) => {
    const { tasks } = get();
    return tasks.filter(task => task.priority === priority);
  },

  filterTasksByProject: (projectId) => {
    const { tasks } = get();
    return tasks.filter(task => 
      (task.projectId?._id === projectId || task.projectId?.id === projectId || task.projectId === projectId)
    );
  },

  getTasksForUser: (userId) => {
    const { tasks } = get();
    return tasks.filter(task => 
      task.assignee?._id === userId || task.assignee?.id === userId
    );
  },

  getTasksAssignedByUser: (userId) => {
    const { tasks } = get();
    return tasks.filter(task => 
      task.assignedBy?._id === userId || task.assignedBy?.id === userId
    );
  }
}));