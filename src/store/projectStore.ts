import { create } from 'zustand';
import { API_ENDPOINTS, apiRequest } from '../config/api';

interface Project {
  _id: string;
  id: string; // Add for compatibility
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: string;
  dueDate: string;
  budget?: number;
  client?: string;
  teamMembers: any[]; // Full user objects
  assignedBy?: any; // Full user object
  tags: string[];
  objectives: string[];
  deliverables: string[];
  progress: number;
  tasks?: any[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectStore {
  projects: Project[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchProjects: () => Promise<void>;
  createProject: (projectData: any) => Promise<void>;
  updateProject: (id: string, projectData: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  assignUsersToProject: (projectId: string, userIds: string[]) => Promise<void>;
  searchProjects: (searchTerm: string) => Project[];
  filterProjectsByStatus: (status: string) => Project[];
  filterProjectsByPriority: (priority: string) => Project[];
  getProjectsForUser: (userId: string) => Project[];
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiRequest(API_ENDPOINTS.PROJECTS.BASE);
      const projects = (response.projects || response).map((project: any) => ({
        ...project,
        id: project._id || project.id
      }));
      set({ projects, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createProject: async (projectData) => {
    set({ loading: true, error: null });
    try {
      const response = await apiRequest(API_ENDPOINTS.PROJECTS.BASE, {
        method: 'POST',
        body: JSON.stringify(projectData),
      });
      
      const newProject = {
        ...response.project,
        id: response.project._id || response.project.id
      };
      
      set(state => ({ 
        projects: [newProject, ...state.projects], 
        loading: false 
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateProject: async (id, projectData) => {
    set({ loading: true, error: null });
    try {
      const response = await apiRequest(API_ENDPOINTS.PROJECTS.BY_ID(id), {
        method: 'PUT',
        body: JSON.stringify(projectData),
      });
      
      const updatedProject = {
        ...response.project,
        id: response.project._id || response.project.id
      };
      
      set(state => ({
        projects: state.projects.map(project => 
          (project._id === id || project.id === id) ? updatedProject : project
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteProject: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiRequest(API_ENDPOINTS.PROJECTS.BY_ID(id), {
        method: 'DELETE',
      });
      
      set(state => ({
        projects: state.projects.filter(project => project._id !== id && project.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  assignUsersToProject: async (projectId, userIds) => {
    set({ loading: true, error: null });
    try {
      const response = await apiRequest(API_ENDPOINTS.PROJECTS.ASSIGN(projectId), {
        method: 'POST',
        body: JSON.stringify({ userIds }),
      });
      
      const updatedProject = {
        ...response.project,
        id: response.project._id || response.project.id
      };
      
      set(state => ({
        projects: state.projects.map(project => 
          (project._id === projectId || project.id === projectId) ? updatedProject : project
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  searchProjects: (searchTerm) => {
    const { projects } = get();
    return projects.filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.teamMembers?.some(member => 
        member?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      project.tags.some(tag => 
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  },

  filterProjectsByStatus: (status) => {
    const { projects } = get();
    return projects.filter(project => project.status === status);
  },

  filterProjectsByPriority: (priority) => {
    const { projects } = get();
    return projects.filter(project => project.priority === priority);
  },

  getProjectsForUser: (userId) => {
    const { projects } = get();
    return projects.filter(project => 
      project.teamMembers?.some(member => member._id === userId || member.id === userId)
    );
  }
}));