import express from 'express';
import Todo from '../models/Todo.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all todos for current user
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 50, search, priority, completed } = req.query;
    
    const query = { author: req.user._id };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (completed !== undefined) {
      query.completed = completed === 'true';
    }

    const todos = await Todo.find(query)
      .populate('author', 'name email')
      .populate('projectId', 'name')
      .populate('taskId', 'title')
      .sort({ completed: 1, priority: -1, dueDate: 1, updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Todo.countDocuments(query);

    res.json({
      todos,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ message: 'Failed to fetch todos' });
  }
});

// Get todo by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id)
      .populate('author', 'name email')
      .populate('projectId', 'name')
      .populate('taskId', 'title');
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // Check if user owns the todo
    if (todo.author._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied to this todo' });
    }

    res.json(todo);
  } catch (error) {
    console.error('Error fetching todo:', error);
    res.status(500).json({ message: 'Failed to fetch todo' });
  }
});

// Create todo
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      title,
      description,
      priority = 'medium',
      dueDate,
      tags = [],
      projectId,
      taskId
    } = req.body;

    const todo = new Todo({
      title,
      description,
      priority,
      dueDate,
      tags,
      author: req.user._id,
      projectId,
      taskId
    });

    await todo.save();
    await todo.populate('author', 'name email');
    await todo.populate('projectId', 'name');
    await todo.populate('taskId', 'title');

    res.status(201).json({
      message: 'Todo created successfully',
      todo
    });
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ message: 'Failed to create todo' });
  }
});

// Update todo
router.put('/:id', authenticate, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // Check if user owns the todo
    if (todo.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own todos' });
    }

    const {
      title,
      description,
      completed,
      priority,
      dueDate,
      tags,
      projectId,
      taskId
    } = req.body;

    // Update fields
    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description;
    if (completed !== undefined) todo.completed = completed;
    if (priority !== undefined) todo.priority = priority;
    if (dueDate !== undefined) todo.dueDate = dueDate;
    if (tags !== undefined) todo.tags = tags;
    if (projectId !== undefined) todo.projectId = projectId;
    if (taskId !== undefined) todo.taskId = taskId;

    await todo.save();
    await todo.populate('author', 'name email');
    await todo.populate('projectId', 'name');
    await todo.populate('taskId', 'title');

    res.json({
      message: 'Todo updated successfully',
      todo
    });
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ message: 'Failed to update todo' });
  }
});

// Toggle todo completion
router.patch('/:id/toggle', authenticate, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // Check if user owns the todo
    if (todo.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only modify your own todos' });
    }

    todo.completed = !todo.completed;
    await todo.save();
    await todo.populate('author', 'name email');

    res.json({
      message: 'Todo updated successfully',
      todo
    });
  } catch (error) {
    console.error('Error toggling todo:', error);
    res.status(500).json({ message: 'Failed to update todo' });
  }
});

// Delete todo
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // Check if user owns the todo
    if (todo.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own todos' });
    }

    await Todo.findByIdAndDelete(req.params.id);

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ message: 'Failed to delete todo' });
  }
});

// Clear completed todos
router.delete('/completed/clear', authenticate, async (req, res) => {
  try {
    const result = await Todo.deleteMany({ 
      author: req.user._id, 
      completed: true 
    });

    res.json({ 
      message: 'Completed todos cleared successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing completed todos:', error);
    res.status(500).json({ message: 'Failed to clear completed todos' });
  }
});

export default router;