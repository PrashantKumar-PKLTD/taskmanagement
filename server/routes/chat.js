import express from 'express';
import Chat from '../models/Chat.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get user's chats
router.get('/', authenticate, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id
    })
    .populate('participants', 'name email role avatar status')
    .populate('lastMessage.senderId', 'name')
    .sort({ updatedAt: -1 });

    const chatsWithUnread = chats.map(chat => {
      const unreadCount = chat.messages.filter(msg => 
        !msg.readBy.some(read => read.userId.toString() === req.user._id.toString())
      ).length;
      
      return {
        ...chat.toObject(),
        unreadCount
      };
    });

    res.json(chatsWithUnread);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get chat messages
router.get('/:chatId/messages', authenticate, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: req.user._id
    }).populate('messages.senderId', 'name');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json(chat.messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new chat
router.post('/', authenticate, async (req, res) => {
  try {
    const { participants, name, type = 'direct' } = req.body;
    
    const allParticipants = [...participants, req.user._id];
    
    // For direct chats, set name as the other participant's name
    let chatName = name || 'New Chat';
    if (type === 'direct' && participants.length === 1) {
      const otherUser = await User.findById(participants[0]);
      if (otherUser) {
        chatName = otherUser.name;
      }
    }

    const chat = new Chat({
      name: chatName,
      type,
      participants: allParticipants,
      createdBy: req.user._id
    });

    await chat.save();
    await chat.populate('participants', 'name email role avatar status');
    
    // Emit new chat to all participants via WebSocket
    const io = req.app.get('io');
    if (io && global.connectedUsers) {
      allParticipants.forEach(participantId => {
        const socketId = global.connectedUsers.get(participantId.toString());
        if (socketId) {
          io.to(socketId).emit('new_chat', {
            id: chat._id,
            name: chat.name,
            type: chat.type,
            participants: chat.participants,
            unreadCount: 0,
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt
          });
        }
      });
    }
    
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark messages as read
router.put('/:chatId/read', authenticate, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Mark all messages as read by this user
    chat.messages.forEach(message => {
      if (!message.readBy.find(r => r.userId.toString() === req.user._id.toString())) {
        message.readBy.push({
          userId: req.user._id,
          readAt: new Date()
        });
      }
    });

    await chat.save();
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;