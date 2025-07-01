import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  StickyNote, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Calendar,
  Tag,
  Star,
  Clock,
  Bookmark,
  FileText,
  MessageSquare
} from 'lucide-react';
import { useNotesStore } from '../../store/notesStore';

const NotesPanel: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: [],
    isPinned: false
  });
  const [newTag, setNewTag] = useState('');

  const {
    notes,
    loading,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    searchNotes,
    filterNotesByCategory
  } = useNotesStore();

  useEffect(() => {
    fetchNotes();
  }, []);

  const filteredNotes = React.useMemo(() => {
    let result = notes;
    
    if (searchTerm) {
      result = searchNotes(searchTerm);
    }
    
    if (categoryFilter !== 'all') {
      result = filterNotesByCategory(categoryFilter);
    }
    
    // Sort by pinned first, then by updated date
    return result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, searchTerm, categoryFilter, searchNotes, filterNotesByCategory]);

  const handleCreateNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    try {
      await createNote(newNote);
      setNewNote({
        title: '',
        content: '',
        category: 'general',
        tags: [],
        isPinned: false
      });
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote.title.trim() || !editingNote.content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    try {
      await updateNote(editingNote.id, editingNote);
      setEditingNote(null);
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteNote(noteId);
    }
  };

  const addTag = (noteData: any, setNoteData: any) => {
    if (newTag.trim() && !noteData.tags.includes(newTag.trim())) {
      setNoteData((prev: any) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string, noteData: any, setNoteData: any) => {
    setNoteData((prev: any) => ({
      ...prev,
      tags: prev.tags.filter((t: string) => t !== tag)
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'task': return 'text-blue-400 bg-blue-400/10';
      case 'project': return 'text-purple-400 bg-purple-400/10';
      case 'meeting': return 'text-green-400 bg-green-400/10';
      case 'idea': return 'text-yellow-400 bg-yellow-400/10';
      case 'important': return 'text-red-400 bg-red-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const categories = ['general', 'task', 'project', 'meeting', 'idea', 'important'];

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <StickyNote className="w-5 h-5" />
            Notes
          </h3>
          <button
            onClick={() => setIsCreating(true)}
            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            title="Add new note"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-8">
            <StickyNote className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No notes found</p>
            <button
              onClick={() => setIsCreating(true)}
              className="mt-3 text-red-400 hover:text-red-300 text-sm font-medium"
            >
              Create your first note
            </button>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`bg-slate-700 rounded-lg p-3 hover:bg-slate-600 transition-colors cursor-pointer ${
                note.isPinned ? 'ring-1 ring-yellow-400/30' : ''
              }`}
              onClick={() => setEditingNote(note)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-white font-medium text-sm line-clamp-1">{note.title}</h4>
                  {note.isPinned && <Star className="w-3 h-3 text-yellow-400 fill-current" />}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingNote(note);
                    }}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}
                    className="p-1 text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              <div className="text-slate-300 text-xs line-clamp-2 mb-2">
                {note.content.replace(/<[^>]*>/g, '')}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(note.category)}`}>
                    {note.category}
                  </div>
                  {note.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-400 text-xs">{note.tags.length}</span>
                    </div>
                  )}
                </div>
                <span className="text-slate-400 text-xs">{formatDate(note.updatedAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Note Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Create New Note</h3>
                <button
                  onClick={() => setIsCreating(false)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newNote.title}
                    onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter note title"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Category
                    </label>
                    <select
                      value={newNote.category}
                      onChange={(e) => setNewNote(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                      <Bookmark className="w-4 h-4" />
                      Pin Note
                    </label>
                    <label className="flex items-center gap-2 mt-3">
                      <input
                        type="checkbox"
                        checked={newNote.isPinned}
                        onChange={(e) => setNewNote(prev => ({ ...prev, isPinned: e.target.checked }))}
                        className="w-4 h-4 text-red-500 bg-slate-700 border-slate-600 rounded focus:ring-red-500 focus:ring-2"
                      />
                      <span className="text-slate-300 text-sm">Pin to top</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tag"
                      className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(newNote, setNewNote))}
                    />
                    <button
                      type="button"
                      onClick={() => addTag(newNote, setNewNote)}
                      className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {newNote.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag, newNote, setNewNote)}
                          className="text-slate-400 hover:text-red-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your note content here..."
                    rows={8}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreateNote}
                  className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Note
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {editingNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Edit Note</h3>
                <button
                  onClick={() => setEditingNote(null)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={editingNote.title}
                    onChange={(e) => setEditingNote(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter note title"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Category
                    </label>
                    <select
                      value={editingNote.category}
                      onChange={(e) => setEditingNote(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                      <Bookmark className="w-4 h-4" />
                      Pin Note
                    </label>
                    <label className="flex items-center gap-2 mt-3">
                      <input
                        type="checkbox"
                        checked={editingNote.isPinned}
                        onChange={(e) => setEditingNote(prev => ({ ...prev, isPinned: e.target.checked }))}
                        className="w-4 h-4 text-red-500 bg-slate-700 border-slate-600 rounded focus:ring-red-500 focus:ring-2"
                      />
                      <span className="text-slate-300 text-sm">Pin to top</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tag"
                      className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(editingNote, setEditingNote))}
                    />
                    <button
                      type="button"
                      onClick={() => addTag(editingNote, setEditingNote)}
                      className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {editingNote.tags.map((tag: string) => (
                      <span key={tag} className="inline-flex items-center gap-1 bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag, editingNote, setEditingNote)}
                          className="text-slate-400 hover:text-red-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={editingNote.content}
                    onChange={(e) => setEditingNote(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your note content here..."
                    rows={8}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleUpdateNote}
                  className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Update Note
                </button>
                <button
                  onClick={() => setEditingNote(null)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPanel;