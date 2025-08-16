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
  
  // Chat
  CHAT: {
    BASE: `${API_BASE_URL}/chat`,
    BY_ID: (id: string) => `${API_BASE_URL}/chat/${id}`,
    MESSAGES: (id: string) => `${API_BASE_URL}/chat/${id}/messages`,
    READ: (id: string) => `${API_BASE_URL}/chat/${id}/read`,
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
      let errorMessage = `Request failed with status ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        // If we can't parse the error response, use status-based messages
        switch (response.status) {
          case 400:
            errorMessage = 'Bad request. Please check your input and try again.';
            break;
          case 401:
            errorMessage = 'Authentication failed. Please log in again.';
            break;
          case 403:
            errorMessage = 'Access denied. You don\'t have permission to perform this action.';
            break;
          case 404:
            errorMessage = 'The requested resource was not found.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          case 502:
          case 503:
          case 504:
            errorMessage = 'Service temporarily unavailable. Please try again later.';
            break;
          default:
            errorMessage = `Request failed with status ${response.status}. Please try again.`;
        }
      }
      
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    
    // Handle timeout errors
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    
    // Re-throw the error if it's already a custom error
    throw error;
  }
};

export default API_ENDPOINTS;