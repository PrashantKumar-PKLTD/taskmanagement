import React, { useState } from 'react';
import { Save, Send, Trash2, Calendar, Tag, ArrowLeft } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import ImageUpload from './ImageUpload';

interface BlogFormProps {
  blog?: any;
  currentUser: any;
  onSubmit: (formData: any, status: string) => Promise<void>;
  onDelete?: (blogId: string) => void;
  onCancel: () => void;
}

const BlogForm: React.FC<BlogFormProps> = ({ 
  blog, 
  currentUser, 
  onSubmit, 
  onDelete, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    title: blog?.title || '',
    content: blog?.content || '',
    publishDate: blog?.publishDate || '',
    tags: blog?.tags || [],
    imageUrl: blog?.imageUrl || '',
  });
  
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user can publish directly (Admin or Super Admin)
  const canPublishDirectly = currentUser?.role === 'Super Admin' || 
                            currentUser?.role === 'Admin';

  const handleSubmit = async (status: string) => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData, status);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (blog && confirm('Are you sure you want to delete this blog post?')) {
      onDelete?.(blog.id);
    }
  };

  const handlePublish = () => {
    if (canPublishDirectly) {
      handleSubmit('published');
    } else {
      handleSubmit('pending');
      alert('Your blog has been submitted for admin approval.');
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((tag: string) => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onCancel}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {blog ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h1>
            <p className="text-slate-400 mt-1">
              {canPublishDirectly ? 'Publish immediately or save as draft' : 'Submit for approval or save as draft'}
            </p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
          {/* Admin Status Indicator */}
          {canPublishDirectly && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400 font-medium text-sm">
                  Administrator Mode - You can publish blogs directly
                </span>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Blog Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter an engaging blog title..."
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-lg"
            />
          </div>

          {/* Content Editor */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Blog Content *
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={(content) => setFormData(prev => ({ ...prev, content }))}
              placeholder="Write your blog content here..."
            />
          </div>

          {/* Image Upload and Date */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Featured Image
              </label>
              <ImageUpload
                onImageSelect={(imageUrl) => setFormData(prev => ({ ...prev, imageUrl: imageUrl || '' }))}
                currentImage={formData.imageUrl}
              />
            </div>

            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
                  <Calendar className="w-4 h-4" />
                  Publish Date
                </label>
                <input
                  type="date"
                  value={formData.publishDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
                  <Tag className="w-4 h-4" />
                  Tags
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    placeholder="Add a tag..."
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag: string) => (
                    <span key={tag} className="inline-flex items-center gap-1 bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-slate-400 hover:text-red-400 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-slate-700">
            <div className="flex gap-3">
              <button
                onClick={() => handleSubmit('draft')}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-300 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>
              
              <button
                onClick={handlePublish}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {canPublishDirectly ? 'Publish Now' : 'Submit for Review'}
              </button>
            </div>

            <div className="flex gap-3">
              {blog && onDelete && (
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogForm;