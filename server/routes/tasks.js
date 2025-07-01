import express from 'express';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all tasks
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, priority, projectId, assignee } = req.query;
    
    const query = {};
    
    // Filter by user access - users can only see tasks assigned to them or in their projects
    if (req.user.role !== 'Super Admin' && req.user.role !== 'Admin' && req.user.role !== 'Project Manager') {
      // Get user's projects
      const userProjects = await Project.find({ teamMembers: req.user._id });
      const projectIds = userProjects.map(p => p._id);
      
      query.$or = [
        { assignee: req.user._id },
        { projectId: { $in: projectIds } }
      ];
    }
    
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ]
      });
    }
    
    if (status) {
      query.status = status;
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    if (projectId) {
      query.projectId = projectId;
    }
    
    if (assignee) {
      if (assignee === 'unassigned') {
        query.assignee = { $exists: false };
      } else {
        query.assignee = assignee;
      }
    }

    const tasks = await Task.find(query)
      .populate('assignee', 'name email role')
      .populate('assignedBy', 'name email')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
});

// Get task by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email role')
      .populate('assignedBy', 'name email')
      .populate('projectId', 'name description');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check access permissions
    if (req.user.role !== 'Super Admin' && req.user.role !== 'Admin' && req.user.role !== 'Project Manager') {
      const isAssignee = task.assignee && task.assignee._id.toString() === req.user._id.toString();
      const project = await Project.findById(task.projectId);
      const isTeamMember = project && project.teamMembers.some(member => 
        member.toString() === req.user._id.toString()
      );
      
      if (!isAssignee && !isTeamMember) {
        return res.status(403).json({ message: 'Access denied to this task' });
      }
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Failed to fetch task' });
  }
});

// Create task - Allow Super Admin, Admin, and Project Manager
router.post('/', authenticate, async (req, res) => {
  try {
    // Check if user can create tasks
    const canCreate = req.user.role === 'Super Admin' || 
                     req.user.role === 'Admin' || 
                     req.user.role === 'Project Manager';

    if (!canCreate) {
      return res.status(403).json({ message: 'Insufficient permissions to create tasks' });
    }

    const {
      title,
      description,
      status = 'pending',
      priority = 'medium',
      projectId,
      assignee,
      dueDate,
      estimatedHours,
      tags = [],
      notes = ''
    } = req.body;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Verify assignee exists if provided
    if (assignee) {
      const user = await User.findById(assignee);
      if (!user) {
        return res.status(404).json({ message: 'Assignee not found' });
      }
    }

    const task = new Task({
      title,
      description,
      status,
      priority,
      projectId,
      assignee,
      assignedBy: req.user._id,
      dueDate,
      estimatedHours,
      tags,
      notes
    });

    await task.save();
    await task.populate('assignee', 'name email role');
    await task.populate('assignedBy', 'name email');
    await task.populate('projectId', 'name');

    // Update project progress
    await project.calculateProgress();

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Failed to create task' });
  }
});

// Update task
router.put('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check permissions
    const canEdit = req.user.role === 'Super Admin' || 
                   req.user.role === 'Admin' ||
                   req.user.role === 'Project Manager' ||
                   (task.assignee && task.assignee.toString() === req.user._id.toString()) ||
                   task.assignedBy.toString() === req.user._id.toString();

    if (!canEdit) {
      return res.status(403).json({ message: 'You can only edit tasks assigned to you or that you created' });
    }

    const {
      title,
      description,
      status,
      priority,
      assignee,
      dueDate,
      estimatedHours,
      tags,
      notes
    } = req.body;

    // Update fields
    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (assignee !== undefined) task.assignee = assignee;
    if (dueDate) task.dueDate = dueDate;
    if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
    if (tags) task.tags = tags;
    if (notes !== undefined) task.notes = notes;

    await task.save();
    await task.populate('assignee', 'name email role');
    await task.populate('assignedBy', 'name email');
    await task.populate('projectId', 'name');

    // Update project progress if status changed
    if (status) {
      const project = await Project.findById(task.projectId);
      if (project) {
        await project.calculateProgress();
      }
    }

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // Check if user can delete tasks
    const canDelete = req.user.role === 'Super Admin' || req.user.role === 'Admin';

    if (!canDelete) {
      return res.status(403).json({ message: 'Insufficient permissions to delete tasks' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const projectId = task.projectId;
    await Task.findByIdAndDelete(req.params.id);

    // Update project progress
    const project = await Project.findById(projectId);
    if (project) {
      await project.calculateProgress();
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Failed to delete task' });
  }
});

// Update task status
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check permissions
    const canEdit = req.user.role === 'Super Admin' || 
                   req.user.role === 'Admin' ||
                   req.user.role === 'Project Manager' ||
                   (task.assignee && task.assignee.toString() === req.user._id.toString());

    if (!canEdit) {
      return res.status(403).json({ message: 'You can only update status of tasks assigned to you' });
    }

    task.status = status;
    await task.save();

    // Update project progress
    const project = await Project.findById(task.projectId);
    if (project) {
      await project.calculateProgress();
    }

    res.json({
      message: 'Task status updated successfully',
      task
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Failed to update task status' });
  }
});

// Add time entry to task
router.post('/:id/time', authenticate, async (req, res) => {
  try {
    const { hours, description } = req.body;
    
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.addTimeEntry(req.user._id, hours, description);

    res.json({
      message: 'Time entry added successfully',
      task
    });
  } catch (error) {
    console.error('Error adding time entry:', error);
    res.status(500).json({ message: 'Failed to add time entry' });
  }
});

// Add comment to task
router.post('/:id/comment', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.addComment(req.user._id, content);

    res.json({
      message: 'Comment added successfully',
      task
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
});

export default router;