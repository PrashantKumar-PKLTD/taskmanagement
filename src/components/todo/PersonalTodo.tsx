import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Check, 
  X, 
  Edit, 
  Trash2, 
  Calendar, 
  Star, 
  Clock,
  CheckCircle,
  Circle,
  AlertCircle,
  Filter,
  Target,
  Save
} from 'lucide-react';
import { useTodoStore } from '../../store/todoStore';
import { useUserStore } from '../../store/userStore';

const PersonalTodo: React.FC = () => {
  const [newTodo, setNewTodo] = useState('');
  const [newTodoDescription, setNewTodoDescription] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTodoDueDate, setNewTodoDueDate] = useState('');
  const [editingTodo, setEditingTodo] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  const { currentUser } = useUserStore();
  const {
    todos,
    loading,
    error,
    fetchTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
    clearCompleted
  } = useTodoStore();

  useEffect(() => {
    if (currentUser) {
      fetchTodos();
    }
  }, [currentUser, fetchTodos]);

  const filteredTodos = React.useMemo(() => {
    let result = todos;
    
    if (filter === 'pending') {
      result = result.filter(todo => !todo.completed);
    } else if (filter === 'completed') {
      result = result.filter(todo => todo.completed);
    }
    
    if (priorityFilter !== 'all') {
      result = result.filter(todo => todo.priority === priorityFilter);
    }
    
    // Sort by priority and due date
    return result.sort((a, b) => {
      // Completed items go to bottom
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      // Sort by priority
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // Sort by due date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [todos, filter, priorityFilter]);

  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;
    
    try {
      await addTodo(newTodo, newTodoDescription, newTodoPriority, newTodoDueDate || undefined);
      setNewTodo('');
      setNewTodoDescription('');
      setNewTodoPriority('medium');
      setNewTodoDueDate('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const handleEditTodo = (todo: any) => {
    setEditingTodo(todo.id);
    setEditText(todo.title);
    setEditDescription(todo.description || '');
  };

  const handleSaveEdit = async () => {
    if (!editText.trim() || !editingTodo) return;
    
    try {
      await updateTodo(editingTodo, { 
        title: editText.trim(),
        description: editDescription.trim()
      });
      setEditingTodo(null);
      setEditText('');
      setEditDescription('');
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingTodo(null);
    setEditText('');
    setEditDescription('');
  };

  const handleToggleTodo = async (id: string) => {
    try {
      await toggleTodo(id);
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        await deleteTodo(id);
      } catch (error) {
        console.error('Error deleting todo:', error);
      }
    }
  };

  const handleClearCompleted = async () => {
    if (window.confirm('Are you sure you want to clear all completed todos?')) {
      try {
        await clearCompleted();
      } catch (error) {
        console.error('Error clearing completed todos:', error);
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'low': return 'text-green-400 bg-green-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return AlertCircle;
      case 'medium': return Star;
      case 'low': return Circle;
      default: return Circle;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  const stats = {
    total: todos.length,
    pending: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
    overdue: todos.filter(t => t.dueDate && !t.completed && isOverdue(t.dueDate)).length
  };

  if (!currentUser) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-6">
          <Target className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Please log in to view your todos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Target className="w-5 h-5" />
          Personal Todos
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            showAddForm 
              ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Cancel' : 'Add Todo'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-700/50 rounded-lg p-4 text-center">
          <div className="text-white font-bold text-xl">{stats.total}</div>
          <div className="text-slate-400 text-sm">Total</div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4 text-center">
          <div className="text-yellow-400 font-bold text-xl">{stats.pending}</div>
          <div className="text-slate-400 text-sm">Pending</div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4 text-center">
          <div className="text-green-400 font-bold text-xl">{stats.completed}</div>
          <div className="text-slate-400 text-sm">Completed</div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4 text-center">
          <div className="text-red-400 font-bold text-xl">{stats.overdue}</div>
          <div className="text-slate-400 text-sm">Overdue</div>
        </div>
      </div>

      {/* Add Todo Form */}
      {showAddForm && (
        <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
          <div className="space-y-3">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAddTodo()}
            />
            
            <textarea
              value={newTodoDescription}
              onChange={(e) => setNewTodoDescription(e.target.value)}
              placeholder="Add description (optional)"
              rows={2}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
            
            <div className="grid grid-cols-2 gap-3">
              <select
                value={newTodoPriority}
                onChange={(e) => setNewTodoPriority(e.target.value as any)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              
              <input
                type="date"
                value={newTodoDueDate}
                onChange={(e) => setNewTodoDueDate(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>
            
            <button
              onClick={handleAddTodo}
              disabled={!newTodo.trim() || loading}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors"
            >
              Add Todo
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
        >
          <option value="all">All Todos</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
        
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as any)}
          className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
        >
          <option value="all">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Todo List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-400 text-sm mb-3">
              {filter === 'completed' ? 'No completed todos' : 'No todos yet'}
            </p>
            {filter !== 'completed' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="text-red-400 hover:text-red-300 text-sm font-medium"
              >
                Add your first todo
              </button>
            )}
          </div>
        ) : (
          filteredTodos.map((todo) => {
            const PriorityIcon = getPriorityIcon(todo.priority);
            const isEditing = editingTodo === todo.id;
            const isOverdueItem = todo.dueDate && !todo.completed && isOverdue(todo.dueDate);
            
            return (
              <div
                key={todo.id}
                className={`bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition-colors ${
                  todo.completed ? 'opacity-60' : ''
                } ${isOverdueItem ? 'ring-1 ring-red-500/30' : ''}`}
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSaveEdit()}
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description (optional)"
                      rows={2}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 bg-slate-600 hover:bg-slate-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleTodo(todo.id)}
                      className={`mt-1 p-1 rounded transition-colors ${
                        todo.completed 
                          ? 'text-green-400 hover:text-green-300' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {todo.completed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`font-medium ${
                            todo.completed 
                              ? 'text-slate-400 line-through' 
                              : 'text-white'
                          }`}>
                            {todo.title}
                          </p>
                          {todo.description && (
                            <p className={`text-sm mt-1 ${
                              todo.completed 
                                ? 'text-slate-500 line-through' 
                                : 'text-slate-300'
                            }`}>
                              {todo.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 ml-3">
                          <button
                            onClick={() => handleEditTodo(todo)}
                            className="p-1 text-slate-400 hover:text-blue-400 rounded"
                            title="Edit todo"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTodo(todo.id)}
                            className="p-1 text-slate-400 hover:text-red-400 rounded"
                            title="Delete todo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(todo.priority)}`}>
                          <PriorityIcon className="w-3 h-3" />
                          {todo.priority}
                        </div>
                        
                        {todo.dueDate && (
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            isOverdueItem 
                              ? 'text-red-400 bg-red-400/10' 
                              : 'text-blue-400 bg-blue-400/10'
                          }`}>
                            <Calendar className="w-3 h-3" />
                            {formatDate(todo.dueDate)}
                            {isOverdueItem && ' (Overdue)'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {todos.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-700">
          <div className="flex items-center justify-between text-sm">
            <div className="text-slate-400">
              {stats.pending} pending • {stats.completed} completed
              {stats.overdue > 0 && (
                <span className="text-red-400 ml-2">
                  • {stats.overdue} overdue
                </span>
              )}
            </div>
            {stats.completed > 0 && (
              <button
                onClick={handleClearCompleted}
                className="text-red-400 hover:text-red-300 text-sm font-medium"
              >
                Clear completed
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalTodo;