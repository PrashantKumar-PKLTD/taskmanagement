import express from 'express';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all projects
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, priority } = req.query;
    
    const query = {};
    
    // Filter by user access - users can only see projects they're assigned to
    if (req.user.role !== 'Super Admin' && req.user.role !== 'Admin' && req.user.role !== 'Project Manager') {
      query.teamMembers = req.user._id;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { client: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (priority) {
      query.priority = priority;
    }

    const projects = await Project.find(query)
      .populate('teamMembers', 'name email role')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Calculate progress for each project
    for (let project of projects) {
      await project.calculateProgress();
    }

    const total = await Project.countDocuments(query);

    res.json({
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// Get project by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('teamMembers', 'name email role')
      .populate('assignedBy', 'name email');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check access permissions
    if (req.user.role !== 'Super Admin' && req.user.role !== 'Admin' && req.user.role !== 'Project Manager') {
      const isTeamMember = project.teamMembers.some(member => 
        member._id.toString() === req.user._id.toString()
      );
      
      if (!isTeamMember) {
        return res.status(403).json({ message: 'Access denied to this project' });
      }
    }

    // Get project tasks
    const tasks = await Task.find({ projectId: project._id })
      .populate('assignee', 'name email')
      .sort({ createdAt: -1 });

    res.json({ ...project.toObject(), tasks });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Failed to fetch project' });
  }
});

// Create project - Allow Super Admin, Admin, and Project Manager
router.post('/', authenticate, async (req, res) => {
  try {
    // Check if user can create projects
    const canCreate = req.user.role === 'Super Admin' || 
                     req.user.role === 'Admin' || 
                     req.user.role === 'Project Manager';

    if (!canCreate) {
      return res.status(403).json({ message: 'Insufficient permissions to create projects' });
    }

    const {
      name,
      description,
      status = 'active',
      priority = 'medium',
      startDate,
      dueDate,
      budget,
      client,
      teamMembers = [],
      tags = [],
      objectives = [],
      deliverables = []
    } = req.body;

    const project = new Project({
      name,
      description,
      status,
      priority,
      startDate,
      dueDate,
      budget,
      client,
      teamMembers,
      assignedBy: req.user._id,
      tags,
      objectives,
      deliverables
    });

    await project.save();
    await project.populate('teamMembers', 'name email role');
    await project.populate('assignedBy', 'name email');

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Failed to create project' });
  }
});

// Update project
router.put('/:id', authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check permissions
    const canEdit = req.user.role === 'Super Admin' || 
                   req.user.role === 'Admin' ||
                   req.user.role === 'Project Manager' ||
                   project.assignedBy.toString() === req.user._id.toString();

    if (!canEdit) {
      return res.status(403).json({ message: 'You can only edit projects you created' });
    }

    const {
      name,
      description,
      status,
      priority,
      startDate,
      dueDate,
      budget,
      client,
      teamMembers,
      tags,
      objectives,
      deliverables
    } = req.body;

    // Update fields
    if (name) project.name = name;
    if (description) project.description = description;
    if (status) project.status = status;
    if (priority) project.priority = priority;
    if (startDate) project.startDate = startDate;
    if (dueDate) project.dueDate = dueDate;
    if (budget !== undefined) project.budget = budget;
    if (client !== undefined) project.client = client;
    if (teamMembers) project.teamMembers = teamMembers;
    if (tags) project.tags = tags;
    if (objectives) project.objectives = objectives;
    if (deliverables) project.deliverables = deliverables;

    await project.save();
    await project.populate('teamMembers', 'name email role');
    await project.populate('assignedBy', 'name email');

    res.json({
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // Check if user can delete projects
    const canDelete = req.user.role === 'Super Admin' || req.user.role === 'Admin';

    if (!canDelete) {
      return res.status(403).json({ message: 'Insufficient permissions to delete projects' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if project has tasks
    const taskCount = await Task.countDocuments({ projectId: project._id });
    if (taskCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete project. It has ${taskCount} associated task(s).` 
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Failed to delete project' });
  }
});

// Assign users to project
router.post('/:id/assign', authenticate, async (req, res) => {
  try {
    // Check if user can assign users to projects
    const canAssign = req.user.role === 'Super Admin' || 
                     req.user.role === 'Admin' || 
                     req.user.role === 'Project Manager';

    if (!canAssign) {
      return res.status(403).json({ message: 'Insufficient permissions to assign users to projects' });
    }

    const { userIds } = req.body;
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Validate users exist
    const users = await User.find({ _id: { $in: userIds }, status: 'active' });
    if (users.length !== userIds.length) {
      return res.status(400).json({ message: 'Some users not found or inactive' });
    }

    project.teamMembers = userIds;
    
    await project.save();
    await project.populate('teamMembers', 'name email role');

    res.json({
      message: 'Users assigned successfully',
      project
    });
  } catch (error) {
    console.error('Error assigning users:', error);
    res.status(500).json({ message: 'Failed to assign users' });
  }
});

export default router;