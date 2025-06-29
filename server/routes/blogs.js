import express from 'express';
import Blog from '../models/Blog.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all blogs
router.get('/', authenticate, authorize(['blogs.view']), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, author } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (author) {
      query.authorId = author;
    }

    const blogs = await Blog.find(query)
      .populate('authorId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch blogs' });
  }
});

// Get blog by ID
router.get('/:id', authenticate, authorize(['blogs.view']), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('authorId', 'name email');
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch blog' });
  }
});

// Create blog
router.post('/', authenticate, authorize(['blogs.create']), async (req, res) => {
  try {
    const { title, content, tags, imageUrl, publishDate, status = 'draft' } = req.body;

    const blog = new Blog({
      title,
      content,
      author: req.user.name,
      authorId: req.user._id,
      tags,
      imageUrl,
      publishDate,
      status
    });

    // Set published date if status is published
    if (status === 'published') {
      blog.publishedAt = new Date();
    }

    await blog.save();
    await blog.populate('authorId', 'name email');

    res.status(201).json({
      message: 'Blog created successfully',
      blog
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create blog' });
  }
});

// Update blog
router.put('/:id', authenticate, authorize(['blogs.edit']), async (req, res) => {
  try {
    const { title, content, tags, imageUrl, publishDate, status } = req.body;
    
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if user can edit this blog
    if (blog.authorId.toString() !== req.user._id.toString() && req.user.role !== 'Super Admin' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'You can only edit your own blogs' });
    }

    // Update fields
    if (title) blog.title = title;
    if (content) blog.content = content;
    if (tags) blog.tags = tags;
    if (imageUrl !== undefined) blog.imageUrl = imageUrl;
    if (publishDate) blog.publishDate = publishDate;
    
    // Handle status change
    if (status && status !== blog.status) {
      blog.status = status;
      if (status === 'published' && !blog.publishedAt) {
        blog.publishedAt = new Date();
      }
    }

    await blog.save();
    await blog.populate('authorId', 'name email');

    res.json({
      message: 'Blog updated successfully',
      blog
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update blog' });
  }
});

// Delete blog
router.delete('/:id', authenticate, authorize(['blogs.delete']), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if user can delete this blog
    if (blog.authorId.toString() !== req.user._id.toString() && req.user.role !== 'Super Admin' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'You can only delete your own blogs' });
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete blog' });
  }
});

// Publish/Approve blog (Admin only)
router.patch('/:id/publish', authenticate, authorize(['blogs.publish']), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    blog.status = 'published';
    blog.publishedAt = new Date();
    
    await blog.save();

    res.json({
      message: 'Blog published successfully',
      blog
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to publish blog' });
  }
});

// Reject blog (Admin only)
router.patch('/:id/reject', authenticate, authorize(['blogs.publish']), async (req, res) => {
  try {
    const { reason } = req.body;
    
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    blog.status = 'rejected';
    blog.rejectionReason = reason;
    
    await blog.save();

    res.json({
      message: 'Blog rejected',
      blog
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject blog' });
  }
});

export default router;