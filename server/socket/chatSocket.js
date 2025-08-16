import Chat from '../models/Chat.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const connectedUsers = new Map();
const recentMessages = new Map(); // Track recent messages to prevent duplicates

export const handleChatSocket = (io) => {
  // Make io available to routes
  global.connectedUsers = connectedUsers;
  
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id, 'Total connections:', io.engine.clientsCount);

    // Authenticate socket connection
    socket.on('authenticate', async (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (user) {
          socket.userId = user._id.toString();
          socket.userName = user.name;
          connectedUsers.set(socket.userId, socket.id);
          
          // Join user to their chat rooms
          const userChats = await Chat.find({ participants: user._id });
          userChats.forEach(chat => {
            socket.join(chat._id.toString());
          });
          
          // Broadcast online status
          io.emit('user_online', { userId: socket.userId, userName: socket.userName });
          
          // Send current online users
          socket.emit('online_users', Array.from(connectedUsers.keys()));
        }
      } catch (error) {
        socket.emit('auth_error', 'Invalid token');
      }
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { chatId, content, type = 'text' } = data;
        console.log('Server received message from:', socket.userName, 'Content:', content, 'at:', new Date().toISOString());
        
        // Create a unique key for this message to prevent duplicates
        const messageKey = `${socket.userId}-${chatId}-${content}`;
        
        // Check if we've processed this message recently (within 2 seconds)
        const now = Date.now();
        const recentTime = recentMessages.get(messageKey);
        if (recentTime && (now - recentTime) < 2000) {
          console.log('Duplicate message detected, ignoring');
          return;
        }
        
        // Store this message key with timestamp
        recentMessages.set(messageKey, now);
        
        // Clean up old entries (older than 5 seconds)
        for (const [key, timestamp] of recentMessages.entries()) {
          if (now - timestamp > 5000) {
            recentMessages.delete(key);
          }
        }
        
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.participants.includes(socket.userId)) {
          return socket.emit('error', 'Chat not found or access denied');
        }

        const message = {
          senderId: socket.userId,
          content,
          type,
          readBy: [{ userId: socket.userId, readAt: new Date() }],
          createdAt: new Date(),
          updatedAt: new Date()
        };

        chat.messages.push(message);
        chat.lastMessage = {
          content,
          senderId: socket.userId,
          timestamp: new Date()
        };
        
        await chat.save();
        
        const newMessage = chat.messages[chat.messages.length - 1];
        
        console.log('Emitting message with ID:', newMessage._id);
        
        // Emit to all participants including sender
        io.to(chatId).emit('new_message', {
          _id: newMessage._id,
          chatId: chatId,
          senderId: socket.userId,
          senderName: socket.userName,
          content: newMessage.content,
          type: newMessage.type,
          createdAt: newMessage.createdAt,
          readBy: newMessage.readBy
        });
        
        // Update chat list for all participants
        const updatedChat = await Chat.findById(chatId).populate('participants', 'name email role avatar status');
        io.to(chatId).emit('chat_updated', {
          id: updatedChat._id,
          name: updatedChat.name,
          type: updatedChat.type,
          participants: updatedChat.participants,
          lastMessage: {
            id: newMessage._id,
            content: newMessage.content,
            timestamp: newMessage.createdAt,
            senderId: socket.userId
          },
          unreadCount: 0,
          createdAt: updatedChat.createdAt,
          updatedAt: newMessage.createdAt
        });
        
      } catch (error) {
        socket.emit('error', error.message);
      }
    });

    // Join chat room
    socket.on('join_chat', (chatId) => {
      socket.join(chatId);
    });

    // Leave chat room
    socket.on('leave_chat', (chatId) => {
      socket.leave(chatId);
    });

    // Mark messages as read
    socket.on('mark_read', async (data) => {
      try {
        const { chatId } = data;
        
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.participants.includes(socket.userId)) {
          return;
        }

        // Mark all messages as read by this user
        let updated = false;
        chat.messages.forEach(message => {
          if (!message.readBy.find(r => r.userId.toString() === socket.userId)) {
            message.readBy.push({
              userId: socket.userId,
              readAt: new Date()
            });
            updated = true;
          }
        });

        if (updated) {
          await chat.save();
          
          // Emit read receipt to all participants
          io.to(chatId).emit('messages_read', {
            chatId,
            userId: socket.userId,
            userName: socket.userName
          });
        }
      } catch (error) {
        console.error('Mark read error:', error);
      }
    });

    // Mark single message as read when viewed
    socket.on('mark_message_read', async (data) => {
      try {
        const { chatId, messageId } = data;
        
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.participants.includes(socket.userId)) {
          return;
        }

        const message = chat.messages.id(messageId);
        if (message && !message.readBy.find(r => r.userId.toString() === socket.userId)) {
          message.readBy.push({
            userId: socket.userId,
            readAt: new Date()
          });
          
          await chat.save();
          
          // Emit read receipt for this specific message
          io.to(chatId).emit('message_read', {
            chatId,
            messageId,
            userId: socket.userId,
            userName: socket.userName
          });
        }
      } catch (error) {
        console.error('Mark message read error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        io.emit('user_offline', { userId: socket.userId });
      }
      console.log('User disconnected:', socket.id);
    });
  });
};