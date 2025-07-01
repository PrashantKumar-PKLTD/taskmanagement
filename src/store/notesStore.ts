import { create } from 'zustand';

interface Note {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'task' | 'project' | 'meeting' | 'idea' | 'important';
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotesStore {
  notes: Note[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchNotes: () => Promise<void>;
  createNote: (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNote: (id: string, noteData: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  searchNotes: (searchTerm: string) => Note[];
  filterNotesByCategory: (category: string) => Note[];
}

// Mock data for demonstration
const generateMockNotes = (): Note[] => [
  {
    id: '1',
    title: 'Project Kickoff Meeting Notes',
    content: '<h3>Website Redesign Kickoff</h3><p><strong>Date:</strong> January 15, 2024</p><p><strong>Attendees:</strong> John, Jane, Mike, Client Team</p><h4>Key Points:</h4><ul><li>Timeline: 3 months</li><li>Budget: $25,000</li><li>Focus on mobile-first design</li><li>Modern, clean aesthetic</li></ul><h4>Action Items:</h4><ul><li>Jane: Create wireframes by Jan 20</li><li>Mike: Set up development environment</li><li>John: Schedule weekly check-ins</li></ul>',
    category: 'meeting',
    tags: ['website', 'kickoff', 'client'],
    isPinned: true,
    createdAt: '2024-01-15T14:30:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    title: 'Mobile App Feature Ideas',
    content: '<h3>New Feature Brainstorm</h3><p>Ideas for the mobile app enhancement:</p><ul><li><strong>Dark Mode:</strong> User-requested feature for better night usage</li><li><strong>Offline Sync:</strong> Allow users to work offline and sync when connected</li><li><strong>Push Notifications:</strong> Smart notifications for important updates</li><li><strong>Voice Commands:</strong> Hands-free operation for accessibility</li></ul><p><em>Priority: Dark mode seems to be the most requested feature from user feedback.</em></p>',
    category: 'idea',
    tags: ['mobile', 'features', 'brainstorm'],
    isPinned: false,
    createdAt: '2024-01-18T10:15:00Z',
    updatedAt: '2024-01-20T16:45:00Z'
  },
  {
    id: '3',
    title: 'Database Schema Updates',
    content: '<h3>Required Schema Changes</h3><p>For the analytics dashboard project:</p><h4>New Tables:</h4><ul><li><code>user_sessions</code> - Track user activity</li><li><code>dashboard_widgets</code> - Customizable widgets</li><li><code>data_exports</code> - Export history</li></ul><h4>Modifications:</h4><ul><li>Add <code>last_active</code> column to users table</li><li>Index on <code>created_at</code> for better query performance</li></ul><p><strong>Note:</strong> Need to coordinate with DevOps for migration timing.</p>',
    category: 'task',
    tags: ['database', 'schema', 'analytics'],
    isPinned: false,
    createdAt: '2024-01-22T09:30:00Z',
    updatedAt: '2024-01-22T09:30:00Z'
  },
  {
    id: '4',
    title: 'Client Feedback Summary',
    content: '<h3>TechCorp Feedback - Round 1</h3><p><strong>Overall:</strong> Very positive response to initial designs</p><h4>Requested Changes:</h4><ul><li>Make the header more prominent</li><li>Add company logo in multiple places</li><li>Simplify the navigation menu</li><li>Include a testimonials section</li></ul><h4>Approved Elements:</h4><ul><li>Color scheme ✅</li><li>Typography choices ✅</li><li>Mobile layout ✅</li><li>Contact form design ✅</li></ul><p><em>Next steps: Implement changes and schedule review meeting for Feb 1st.</em></p>',
    category: 'important',
    tags: ['client', 'feedback', 'design'],
    isPinned: true,
    createdAt: '2024-01-25T11:20:00Z',
    updatedAt: '2024-01-25T15:10:00Z'
  },
  {
    id: '5',
    title: 'Performance Optimization Checklist',
    content: '<h3>Website Performance Tasks</h3><p>Optimization checklist for the new website:</p><h4>Images:</h4><ul><li>Compress all images using WebP format</li><li>Implement lazy loading</li><li>Add responsive image sizes</li></ul><h4>Code:</h4><ul><li>Minify CSS and JavaScript</li><li>Remove unused code</li><li>Implement code splitting</li></ul><h4>Server:</h4><ul><li>Enable gzip compression</li><li>Set up CDN</li><li>Optimize database queries</li></ul><p><strong>Target:</strong> Achieve 90+ Lighthouse score</p>',
    category: 'task',
    tags: ['performance', 'optimization', 'website'],
    isPinned: false,
    createdAt: '2024-01-28T13:45:00Z',
    updatedAt: '2024-01-28T13:45:00Z'
  },
  {
    id: '6',
    title: 'Team Standup Notes',
    content: '<h3>Daily Standup - Feb 1, 2024</h3><h4>Jane (Designer):</h4><ul><li>✅ Completed homepage wireframes</li><li>🔄 Working on mobile layouts</li><li>🚫 Blocked: Waiting for client logo files</li></ul><h4>Mike (Developer):</h4><ul><li>✅ Set up development environment</li><li>✅ Created project structure</li><li>🔄 Starting homepage implementation</li></ul><h4>Alex (Backend):</h4><ul><li>✅ Database schema designed</li><li>🔄 API endpoints in progress</li><li>📅 Planning: Authentication system next</li></ul>',
    category: 'meeting',
    tags: ['standup', 'team', 'progress'],
    isPinned: false,
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-02-01T09:00:00Z'
  }
];

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  loading: false,
  error: null,

  fetchNotes: async () => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      const notes = generateMockNotes();
      set({ notes, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createNote: async (noteData) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const newNote: Note = {
        ...noteData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      set(state => ({ 
        notes: [newNote, ...state.notes], 
        loading: false 
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateNote: async (id, noteData) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 400));
      
      set(state => ({
        notes: state.notes.map(note => 
          note.id === id 
            ? { ...note, ...noteData, updatedAt: new Date().toISOString() }
            : note
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteNote: async (id) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set(state => ({
        notes: state.notes.filter(note => note.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  searchNotes: (searchTerm) => {
    const { notes } = get();
    return notes.filter(note =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some(tag => 
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  },

  filterNotesByCategory: (category) => {
    const { notes } = get();
    return notes.filter(note => note.category === category);
  }
}));