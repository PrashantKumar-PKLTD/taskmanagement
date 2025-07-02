const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3005/api';






// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    ME: `${API_BASE_URL}/auth/me`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    PROFILE: `${API_BASE_URL}/auth/profile`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
    PREFERENCES: `${API_BASE_URL}/auth/preferences`,
    ACTIVITY: `${API_BASE_URL}/auth/activity`,
    AVATAR: `${API_BASE_URL}/auth/avatar`,
  },
  



  // Users
  USERS: {
    BASE: `${API_BASE_URL}/users`,
    BY_ID: (id: string) => `${API_BASE_URL}/users/${id}`,
    TOGGLE_STATUS: (id: string) => `${API_BASE_URL}/users/${id}/toggle-status`,
  },
  

  
  // Roles
  ROLES: {
    BASE: `${API_BASE_URL}/roles`,
    BY_ID: (id: string) => `${API_BASE_URL}/roles/${id}`,
  },
  
  // Projects
  PROJECTS: {
    BASE: `${API_BASE_URL}/projects`,
    BY_ID: (id: string) => `${API_BASE_URL}/projects/${id}`,
    ASSIGN: (id: string) => `${API_BASE_URL}/projects/${id}/assign`,
  },
  
  // Tasks
  TASKS: {
    BASE: `${API_BASE_URL}/tasks`,
    BY_ID: (id: string) => `${API_BASE_URL}/tasks/${id}`,
    STATUS: (id: string) => `${API_BASE_URL}/tasks/${id}/status`,
    TIME: (id: string) => `${API_BASE_URL}/tasks/${id}/time`,
    COMMENT: (id: string) => `${API_BASE_URL}/tasks/${id}/comment`,
  },
  
  // Permissions
  PERMISSIONS: {
    BASE: `${API_BASE_URL}/permissions`,
    BY_CATEGORY: (category: string) => `${API_BASE_URL}/permissions/category/${category}`,
  },
  
  // Upload
  UPLOAD: {
    IMAGE: `${API_BASE_URL}/upload/image`,
    IMAGES: `${API_BASE_URL}/upload/images`,
  },
  
  // Health
  HEALTH: `${API_BASE_URL}/health`,
};

// API client configuration
export const apiClient = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Get auth token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Set auth token in localStorage
export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

// Remove auth token from localStorage
export const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

// Create authenticated headers
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// API request helper
export const apiRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<any> => {
  const config: RequestInit = {
    ...options,
    headers: {
      ...apiClient.headers,
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export default API_ENDPOINTS;