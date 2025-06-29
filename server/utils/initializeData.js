import User from '../models/User.js';
import Role from '../models/Role.js';
import Permission from '../models/Permission.js';

// Default permissions
const defaultPermissions = [
  // Dashboard
  { id: 'dashboard.view', name: 'View Dashboard', description: 'Access to main dashboard', category: 'Dashboard' },
  
  // Apps & Pages
  { id: 'email.view', name: 'View Email', description: 'Access to email section', category: 'Apps & Pages' },
  { id: 'chat.view', name: 'View Chat', description: 'Access to chat section', category: 'Apps & Pages' },
  { id: 'calendar.view', name: 'View Calendar', description: 'Access to calendar section', category: 'Apps & Pages' },
  { id: 'kanban.view', name: 'View Kanban', description: 'Access to kanban section', category: 'Apps & Pages' },
  { id: 'blogs.view', name: 'View Blogs', description: 'Access to blog section', category: 'Apps & Pages' },
  { id: 'blogs.create', name: 'Create Blogs', description: 'Create new blog posts', category: 'Apps & Pages' },
  { id: 'blogs.edit', name: 'Edit Blogs', description: 'Edit existing blog posts', category: 'Apps & Pages' },
  { id: 'blogs.delete', name: 'Delete Blogs', description: 'Delete blog posts', category: 'Apps & Pages' },
  { id: 'blogs.publish', name: 'Publish Blogs', description: 'Publish blog posts', category: 'Apps & Pages' },
  { id: 'tasks.view', name: 'View Tasks', description: 'Access to tasks section', category: 'Apps & Pages' },
  { id: 'invoice.view', name: 'View Invoice', description: 'Access to invoice section', category: 'Apps & Pages' },
  { id: 'users.view', name: 'View Users', description: 'Access to user management', category: 'Apps & Pages' },
  { id: 'users.create', name: 'Create Users', description: 'Create new users', category: 'Apps & Pages' },
  { id: 'users.edit', name: 'Edit Users', description: 'Edit existing users', category: 'Apps & Pages' },
  { id: 'users.delete', name: 'Delete Users', description: 'Delete users', category: 'Apps & Pages' },
  { id: 'roles.view', name: 'View Roles', description: 'Access to roles & permissions', category: 'Apps & Pages' },
  { id: 'roles.manage', name: 'Manage Roles', description: 'Create and edit roles', category: 'Apps & Pages' },
  
  // Analytics
  { id: 'reports.view', name: 'View Reports', description: 'Access to reports section', category: 'Analytics' },
  { id: 'analytics.view', name: 'View Analytics', description: 'Access to analytics section', category: 'Analytics' },
  { id: 'performance.view', name: 'View Performance', description: 'Access to performance section', category: 'Analytics' },
  { id: 'data.view', name: 'View Data Management', description: 'Access to data management', category: 'Analytics' },
  
  // System
  { id: 'settings.view', name: 'View Settings', description: 'Access to system settings', category: 'System' },
  { id: 'notifications.view', name: 'View Notifications', description: 'Access to notifications', category: 'System' },
  { id: 'security.view', name: 'View Security', description: 'Access to security settings', category: 'System' },
  { id: 'help.view', name: 'View Help', description: 'Access to help & support', category: 'System' },
  
  // News Portal
  { id: 'news.view', name: 'View News Portal', description: 'Access to news portal', category: 'News Portal' },
  { id: 'news.manage', name: 'Manage News', description: 'Manage news content', category: 'News Portal' },
];

// Default roles
const defaultRoles = [
  {
    name: 'Super Admin',
    description: 'Full access to all features and settings',
    permissions: defaultPermissions.map(p => p.id),
    isDefault: true
  },
  {
    name: 'Admin',
    description: 'Administrative access with user management',
    permissions: [
      'dashboard.view', 'blogs.view', 'blogs.create', 'blogs.edit', 'blogs.delete', 'blogs.publish',
      'users.view', 'users.create', 'users.edit', 'roles.view', 'reports.view', 'analytics.view',
      'settings.view', 'notifications.view'
    ],
    isDefault: true
  },
  {
    name: 'Editor',
    description: 'Content management and editing capabilities',
    permissions: [
      'dashboard.view', 'blogs.view', 'blogs.create', 'blogs.edit',
      'reports.view', 'news.view', 'news.manage'
    ],
    isDefault: true
  },
  {
    name: 'Author',
    description: 'Basic content creation capabilities',
    permissions: [
      'dashboard.view', 'blogs.view', 'blogs.create'
    ],
    isDefault: true
  },
  {
    name: 'Viewer',
    description: 'Read-only access to content',
    permissions: [
      'dashboard.view', 'blogs.view', 'reports.view'
    ],
    isDefault: true
  }
];

export const initializeDefaultData = async () => {
  try {
    // Initialize permissions
    const existingPermissions = await Permission.countDocuments();
    if (existingPermissions === 0) {
      await Permission.insertMany(defaultPermissions);
      console.log('✅ Default permissions initialized');
    }

    // Initialize roles
    const existingRoles = await Role.countDocuments();
    if (existingRoles === 0) {
      await Role.insertMany(defaultRoles);
      console.log('✅ Default roles initialized');
    }

    // Initialize super admin user
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!existingAdmin) {
      const superAdminRole = await Role.findOne({ name: 'Super Admin' });
      
      const adminUser = new User({
        name: process.env.ADMIN_NAME || 'Super Admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'Super Admin',
        roleId: superAdminRole._id,
        status: 'active'
      });

      await adminUser.save();
      console.log('✅ Super Admin user created');
      console.log(`📧 Email: ${process.env.ADMIN_EMAIL}`);
      console.log(`🔑 Password: ${process.env.ADMIN_PASSWORD}`);
    }

  } catch (error) {
    console.error('❌ Error initializing default data:', error);
  }
};