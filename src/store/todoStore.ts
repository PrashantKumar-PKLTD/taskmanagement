import { create } from 'zustand';
import { API_ENDPOINTS, apiRequest } from '../config/api';

interface TodoItem {
  _id: string;
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags: string[];
  author: any;
  projectId?: string;
  taskId?: string;
  createdAt: string;
  updatedAt: string;
}

interface TodoStore {
  todos: TodoItem[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchTodos: () => Promise<void>;
  addTodo: (title: string, description?: string, priority?: 'low' | 'medium' | 'high', dueDate?: string, tags?: string[]) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  updateTodo: (id: string, updates: Partial<TodoItem>) => Promise<void>;
  clearCompleted: () => Promise<void>;
  searchTodos: (searchTerm: string) => TodoItem[];
  filterTodosByPriority: (priority: string) => TodoItem[];
  filterTodosByStatus: (completed: boolean) => TodoItem[];
}

export const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],
  loading: false,
  error: null,

  fetchTodos: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiRequest(API_ENDPOINTS.TODOS.BASE);
      const todos = (response.todos || response).map((todo: any) => ({
        ...todo,
        id: todo._id || todo.id
      }));
      set({ todos, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addTodo: async (title: string, description = '', priority = 'medium', dueDate, tags = []) => {
    set({ loading: true, error: null });
    try {
      const todoData = {
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate || undefined,
        tags
      };

      const response = await apiRequest(API_ENDPOINTS.TODOS.BASE, {
        method: 'POST',
        body: JSON.stringify(todoData),
      });

      const newTodo = {
        ...response.todo,
        id: response.todo._id || response.todo.id
      };

      set(state => ({
        todos: [newTodo, ...state.todos],
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  toggleTodo: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await apiRequest(API_ENDPOINTS.TODOS.TOGGLE(id), {
        method: 'PATCH',
      });

      const updatedTodo = {
        ...response.todo,
        id: response.todo._id || response.todo.id
      };

      set(state => ({
        todos: state.todos.map(todo =>
          (todo._id === id || todo.id === id) ? updatedTodo : todo
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteTodo: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await apiRequest(API_ENDPOINTS.TODOS.BY_ID(id), {
        method: 'DELETE',
      });

      set(state => ({
        todos: state.todos.filter(todo => todo._id !== id && todo.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateTodo: async (id: string, updates: Partial<TodoItem>) => {
    set({ loading: true, error: null });
    try {
      const response = await apiRequest(API_ENDPOINTS.TODOS.BY_ID(id), {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      const updatedTodo = {
        ...response.todo,
        id: response.todo._id || response.todo.id
      };

      set(state => ({
        todos: state.todos.map(todo =>
          (todo._id === id || todo.id === id) ? updatedTodo : todo
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearCompleted: async () => {
    set({ loading: true, error: null });
    try {
      await apiRequest(API_ENDPOINTS.TODOS.CLEAR_COMPLETED, {
        method: 'DELETE',
      });

      set(state => ({
        todos: state.todos.filter(todo => !todo.completed),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  searchTodos: (searchTerm: string) => {
    const { todos } = get();
    return todos.filter(todo =>
      todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      todo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      todo.tags.some(tag => 
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  },

  filterTodosByPriority: (priority: string) => {
    const { todos } = get();
    if (priority === 'all') return todos;
    return todos.filter(todo => todo.priority === priority);
  },

  filterTodosByStatus: (completed: boolean) => {
    const { todos } = get();
    return todos.filter(todo => todo.completed === completed);
  }
}));