import express from 'express';
import Note from '../models/Note.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all notes for current user
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category } = req.query;
    
    const query = { author: req.user._id };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }

    const notes = await Note.find(query)
      .populate('author', 'name email')
      .populate('projectId', 'name')
      .populate('taskId', 'title')
      .sort({ isPinned: -1, updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Note.countDocuments(query);

    res.json({
      notes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Failed to fetch notes' });
  }
});

// Get note by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('author', 'name email')
      .populate('projectId', 'name')
      .populate('taskId', 'title');
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check if user owns the note
    if (note.author._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied to this note' });
    }

    res.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ message: 'Failed to fetch note' });
  }
});

// Create note
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      title,
      content,
      category = 'general',
      tags = [],
      isPinned = false,
      projectId,
      taskId
    } = req.body;

    const note = new Note({
      title,
      content,
      category,
      tags,
      isPinned,
      author: req.user._id,
      projectId,
      taskId
    });

    await note.save();
    await note.populate('author', 'name email');
    await note.populate('projectId', 'name');
    await note.populate('taskId', 'title');

    res.status(201).json({
      message: 'Note created successfully',
      note
    });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: 'Failed to create note' });
  }
});

// Update note
router.put('/:id', authenticate, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check if user owns the note
    if (note.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own notes' });
    }

    const {
      title,
      content,
      category,
      tags,
      isPinned,
      projectId,
      taskId
    } = req.body;

    // Update fields
    if (title) note.title = title;
    if (content) note.content = content;
    if (category) note.category = category;
    if (tags) note.tags = tags;
    if (isPinned !== undefined) note.isPinned = isPinned;
    if (projectId !== undefined) note.projectId = projectId;
    if (taskId !== undefined) note.taskId = taskId;

    await note.save();
    await note.populate('author', 'name email');
    await note.populate('projectId', 'name');
    await note.populate('taskId', 'title');

    res.json({
      message: 'Note updated successfully',
      note
    });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Failed to update note' });
  }
});

// Delete note
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check if user owns the note
    if (note.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own notes' });
    }

    await Note.findByIdAndDelete(req.params.id);

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Failed to delete note' });
  }
});

export default router;