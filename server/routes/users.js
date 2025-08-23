import express from 'express';
import User from '../models/User.js';
import Role from '../models/Role.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all users (simplified for chat)
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, roleId } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (roleId) {
      query.roleId = roleId;
    }

    const users = await User.find(query)
      .populate('roleId', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('roleId')
      .populate('createdBy', 'name');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// Create user
router.post('/', authenticate, authorize(['users.create']), async (req, res) => {
  try {
    const { name, email, password, roleId, status = 'active' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Get role details
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    const user = new User({
      name,
      email,
      password,
      role: role.name,
      roleId,
      status,
      createdBy: req.user._id
    });

    await user.save();
    await user.populate('roleId', 'name');

    res.status(201).json({
      message: 'User created successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', authenticate, authorize(['users.edit']), async (req, res) => {
  try {
    const { name, email, password, roleId, status } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Update role name if roleId is changed
    if (roleId && roleId !== user.roleId.toString()) {
      const role = await Role.findById(roleId);
      if (!role) {
        return res.status(400).json({ message: 'Invalid role selected' });
      }
      user.role = role.name;
      user.roleId = roleId;
    }

    // Update other fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;
    if (status) user.status = status;

    await user.save();
    await user.populate('roleId', 'name');

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', authenticate, authorize(['users.delete']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Toggle user status
router.patch('/:id/toggle-status', authenticate, authorize(['users.edit']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent changing own status
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot change your own status' });
    }

    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();

    res.json({
      message: 'User status updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

export default router;