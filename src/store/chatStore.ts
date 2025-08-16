import { create } from 'zustand';
import { API_ENDPOINTS, apiRequest } from '../config/api';
import { io, Socket } from 'socket.io-client';

interface ChatParticipant {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
}

interface Chat {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'channel';
  participants: ChatParticipant[];
  lastMessage?: {
    id: string;
    content: string;
    timestamp: string;
    senderId: string;
  };
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  timestamp: string;
  readBy: string[];
  editedAt?: string;
}

interface ChatStore {
  chats: Chat[];
  messages: { [chatId: string]: Message[] };
  onlineUsers: string[];
  availableUsers: ChatParticipant[];
  loading: boolean;
  error: string | null;
  socket: Socket | null;
  
  // Actions
  fetchChats: () => Promise<void>;
  fetchAvailableUsers: () => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, content: string, type?: string) => Promise<void>;
  createChat: (participants: string[], name?: string, type?: string) => Promise<string>;
  markAsRead: (chatId: string) => Promise<void>;
  startRealTimeUpdates: () => void;
  stopRealTimeUpdates: () => void;
}



export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  messages: {},
  onlineUsers: [],
  availableUsers: [],
  loading: false,
  error: null,
  socket: null,

  fetchAvailableUsers: async () => {
    try {
      const response = await apiRequest(API_ENDPOINTS.USERS.BASE);
      const users = (response.users || response).map((user: any) => ({
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        status: user.status
      }));
      
      set({ availableUsers: users });
      return users;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      set({ error: error.message });
      return [];
    }
  },

  fetchChats: async () => {
    set({ loading: true, error: null });
    try {
      await get().fetchAvailableUsers();
      const response = await apiRequest(API_ENDPOINTS.CHAT.BASE);
      const chats = response.map((chat: any) => ({
        id: chat._id,
        name: chat.name,
        type: chat.type,
        participants: chat.participants.map((p: any) => ({
          id: p._id || p.id,
          name: p.name,
          email: p.email,
          role: p.role,
          avatar: p.avatar,
          status: p.status
        })),
        lastMessage: chat.lastMessage,
        unreadCount: chat.unreadCount || 0,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      }));
      
      set({ chats, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchMessages: async (chatId: string) => {
    try {
      const response = await apiRequest(`${API_ENDPOINTS.CHAT.BASE}/${chatId}/messages`);
      const messages = response.map((msg: any) => ({
        id: msg._id,
        chatId: msg.chatId,
        senderId: msg.senderId._id || msg.senderId,
        senderName: msg.senderId.name || 'Unknown',
        content: msg.content,
        type: msg.type,
        timestamp: msg.createdAt,
        readBy: msg.readBy.map((r: any) => r.userId)
      }));
      
      set(state => ({
        ...state,
        messages: {
          ...state.messages,
          [chatId]: messages
        }
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  sendMessage: async (chatId: string, content: string, type = 'text') => {
    try {
      const { socket } = get();
      if (socket && socket.connected) {
        console.log('Sending message:', content, 'to chat:', chatId);
        socket.emit('send_message', { chatId, content, type });
        // Don't add message here - wait for WebSocket confirmation
      } else {
        console.error('Socket not connected');
        set({ error: 'Connection lost. Please refresh the page.' });
      }
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  createChat: async (participantIds: string[], name?: string, type = 'group') => {
    try {
      const response = await apiRequest(API_ENDPOINTS.CHAT.BASE, {
        method: 'POST',
        body: JSON.stringify({
          participants: participantIds,
          name,
          type
        })
      });
      
      const newChat = {
        id: response._id,
        name: response.name,
        type: response.type,
        participants: response.participants,
        unreadCount: 0,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt
      };

      set(state => ({
        chats: [newChat, ...state.chats]
      }));
      
      return newChat.id;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  markAsRead: async (chatId: string) => {
    try {
      const { socket } = get();
      if (socket && socket.connected) {
        socket.emit('mark_read', { chatId });
      }
      
      set(state => ({
        chats: state.chats.map(chat => 
          chat.id === chatId 
            ? { ...chat, unreadCount: 0 }
            : chat
        )
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  startRealTimeUpdates: () => {
    const { socket: existingSocket } = get();
    if (existingSocket) {
      existingSocket.disconnect();
    }

    const token = localStorage.getItem('authToken');
    if (!token) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3005');
    set({ socket });

    socket.emit('authenticate', token);

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('auth_error', (error: string) => {
      console.error('Auth error:', error);
      set({ error: 'Authentication failed' });
    });

    socket.on('online_users', (users: string[]) => {
      set({ onlineUsers: users });
    });

    socket.on('user_online', ({ userId }: { userId: string }) => {
      set(state => ({
        onlineUsers: [...new Set([...state.onlineUsers, userId])]
      }));
    });

    socket.on('user_offline', ({ userId }: { userId: string }) => {
      set(state => ({
        onlineUsers: state.onlineUsers.filter(id => id !== userId)
      }));
    });

    socket.on('new_message', (message: any) => {
      console.log('WebSocket message received at:', new Date().toISOString(), message);
      const formattedMessage = {
        id: message._id,
        chatId: message.chatId,
        senderId: message.senderId,
        senderName: message.senderName,
        content: message.content,
        type: message.type,
        timestamp: message.createdAt,
        readBy: message.readBy ? message.readBy.map((r: any) => r.userId || r) : []
      };

      console.log('Adding message via WebSocket:', formattedMessage.content, 'ID:', formattedMessage.id);
      
      set(state => ({
        ...state,
        messages: {
          ...state.messages,
          [message.chatId]: [...(state.messages[message.chatId] || []), formattedMessage]
        },
        chats: state.chats.map(chat => 
          chat.id === message.chatId 
            ? {
                ...chat,
                lastMessage: {
                  id: formattedMessage.id,
                  content: formattedMessage.content,
                  timestamp: formattedMessage.timestamp,
                  senderId: formattedMessage.senderId
                },
                updatedAt: formattedMessage.timestamp
              }
            : chat
        )
      }));
    });

    socket.on('messages_read', (data: any) => {
      const { chatId, userId } = data;
      
      set(state => ({
        ...state,
        messages: {
          ...state.messages,
          [chatId]: (state.messages[chatId] || []).map(msg => ({
            ...msg,
            readBy: msg.readBy.includes(userId) ? msg.readBy : [...msg.readBy, userId]
          }))
        }
      }));
    });

    socket.on('message_read', (data: any) => {
      const { chatId, messageId, userId } = data;
      
      set(state => ({
        ...state,
        messages: {
          ...state.messages,
          [chatId]: (state.messages[chatId] || []).map(msg => 
            msg.id === messageId
              ? {
                  ...msg,
                  readBy: msg.readBy.includes(userId) ? msg.readBy : [...msg.readBy, userId]
                }
              : msg
          )
        }
      }));
    });

    socket.on('new_chat', (chat: any) => {
      const formattedChat = {
        id: chat.id,
        name: chat.name,
        type: chat.type,
        participants: chat.participants.map((p: any) => ({
          id: p._id || p.id,
          name: p.name,
          email: p.email,
          role: p.role,
          avatar: p.avatar,
          status: p.status
        })),
        lastMessage: chat.lastMessage,
        unreadCount: chat.unreadCount || 0,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      };
      
      set(state => ({
        ...state,
        chats: [formattedChat, ...state.chats]
      }));
    });

    socket.on('chat_updated', (chat: any) => {
      const formattedChat = {
        id: chat.id,
        name: chat.name,
        type: chat.type,
        participants: chat.participants.map((p: any) => ({
          id: p._id || p.id,
          name: p.name,
          email: p.email,
          role: p.role,
          avatar: p.avatar,
          status: p.status
        })),
        lastMessage: chat.lastMessage,
        unreadCount: chat.unreadCount || 0,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      };
      
      set(state => {
        const existingChatIndex = state.chats.findIndex(c => c.id === chat.id);
        if (existingChatIndex >= 0) {
          // Update existing chat
          const updatedChats = [...state.chats];
          updatedChats[existingChatIndex] = formattedChat;
          // Move to top
          updatedChats.unshift(updatedChats.splice(existingChatIndex, 1)[0]);
          return { ...state, chats: updatedChats };
        } else {
          // Add new chat
          return { ...state, chats: [formattedChat, ...state.chats] };
        }
      });
    });
  },

  stopRealTimeUpdates: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  }
}));