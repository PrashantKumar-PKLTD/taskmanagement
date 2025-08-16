import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  FileText, 
  Mail, 
  MessageCircle, 
  Calendar, 
  Kanban, 
  CheckSquare, 
  Receipt, 
  Users, 
  Shield, 
  BarChart3, 
  TrendingUp, 
  Zap,
  Database,
  Search,
  Settings,
  Bell,
  HelpCircle,
  FolderOpen,
  Hexagon
} from 'lucide-react';
import { useUserStore } from '../store/userStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentPage = 'dashboard', onNavigate }) => {
  const { currentUser, hasPermission } = useUserStore();

  // Define role-based access control
  const isRestrictedUser = () => {
    if (!currentUser) return false;
    return currentUser.role === 'Editor' || currentUser.role === 'Author';
  };

  // Define allowed modules for restricted users (Editor/Author)
  const allowedModulesForRestrictedUsers = [
    'dashboard',
    'kanban', 
    'chat',
    'calendar',
    'projects',
    'tasks',
    'reports',
    'analytics',
    'performance',
    'data'
  ];

  // Check if a menu item should be visible
  const isMenuItemVisible = (page: string, requiredPermission?: string) => {
    // If user is restricted (Editor/Author), only show allowed modules
    if (isRestrictedUser()) {
      return allowedModulesForRestrictedUsers.includes(page);
    }
    
    // For other roles, check permissions if specified
    if (requiredPermission) {
      return hasPermission(requiredPermission);
    }
    
    // Default: show all items for unrestricted users
    return true;
  };

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      page: 'dashboard', 
      active: currentPage === 'dashboard',
      visible: isMenuItemVisible('dashboard')
    },
  ].filter(item => item.visible);

  const appsPages = [
    { 
      icon: Mail, 
      label: 'Email', 
      page: 'email',
      visible: isMenuItemVisible('email', 'email.view')
    },
    { 
      icon: MessageCircle, 
      label: 'Chat', 
      page: 'chat', 
      active: currentPage === 'chat',
      visible: isMenuItemVisible('chat')
    },
    { 
      icon: Calendar, 
      label: 'Calendar', 
      page: 'calendar',
      visible: isMenuItemVisible('calendar', 'calendar.view')
    },
    { 
      icon: Kanban, 
      label: 'Kanban', 
      page: 'kanban', 
      active: currentPage === 'kanban',
      visible: isMenuItemVisible('kanban')
    },
    { 
      icon: FolderOpen, 
      label: 'Projects', 
      page: 'projects', 
      active: currentPage === 'projects',
      visible: isMenuItemVisible('projects')
    },
    { 
      icon: CheckSquare, 
      label: 'Tasks', 
      page: 'tasks', 
      active: currentPage === 'tasks',
      visible: isMenuItemVisible('tasks')
    },
    { 
      icon: Receipt, 
      label: 'Invoice', 
      page: 'invoice',
      visible: isMenuItemVisible('invoice', 'invoice.view')
    },
    { 
      icon: Users, 
      label: 'Users', 
      page: 'users',
      visible: isMenuItemVisible('users', 'users.view')
    },
    { 
      icon: Shield, 
      label: 'Roles & Permissions', 
      page: 'roles',
      visible: isMenuItemVisible('roles', 'roles.view')
    },
  ].filter(item => item.visible);

  const analytics = [
    { 
      icon: BarChart3, 
      label: 'Reports', 
      page: 'reports',
      visible: isMenuItemVisible('reports')
    },
    { 
      icon: TrendingUp, 
      label: 'Analytics', 
      page: 'analytics',
      visible: isMenuItemVisible('analytics')
    },
    { 
      icon: Zap, 
      label: 'Performance', 
      page: 'performance',
      visible: isMenuItemVisible('performance')
    },
    { 
      icon: Database, 
      label: 'Data Management', 
      page: 'data',
      visible: isMenuItemVisible('data')
    },
  ].filter(item => item.visible);

  const system = [
    { 
      icon: Settings, 
      label: 'Settings', 
      page: 'settings',
      visible: isMenuItemVisible('settings', 'settings.view')
    },
    { 
      icon: Bell, 
      label: 'Notifications', 
      page: 'notifications',
      visible: isMenuItemVisible('notifications', 'notifications.view')
    },
    { 
      icon: Shield, 
      label: 'Security', 
      page: 'security',
      visible: isMenuItemVisible('security', 'security.view')
    },
    { 
      icon: HelpCircle, 
      label: 'Help & Support', 
      page: 'help',
      visible: isMenuItemVisible('help', 'help.view')
    },
  ].filter(item => item.visible);

  const handleNavigation = (page: string) => {
    // Additional security check before navigation
    if (isRestrictedUser() && !allowedModulesForRestrictedUsers.includes(page)) {
      alert('Access denied. You do not have permission to access this section.');
      return;
    }

    // Check permissions for restricted pages
    const permissionMap: { [key: string]: string } = {
      'users': 'users.view',
      'roles': 'roles.view',
      'email': 'email.view',
      'calendar': 'calendar.view',
      'invoice': 'invoice.view',
      'settings': 'settings.view',
      'notifications': 'notifications.view',
      'security': 'security.view',
      'help': 'help.view'
    };

    const requiredPermission = permissionMap[page];
    if (requiredPermission && !hasPermission(requiredPermission)) {
      alert('You don\'t have permission to access this section.');
      return;
    }

    if (onNavigate) {
      onNavigate(page);
    }
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const renderNavItem = (item: any, index: number) => (
    <button
      key={index}
      onClick={() => handleNavigation(item.page)}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left
        ${item.active 
          ? 'bg-red-500 text-white' 
          : 'text-slate-300 dark:text-slate-300 light:text-gray-600 hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-gray-100 hover:text-white dark:hover:text-white light:hover:text-gray-900'
        }
      `}
    >
      <item.icon className="w-4 h-4" />
      {item.label}
    </button>
  );

  // Don't render sidebar if user is not authenticated
  if (!currentUser) {
    return null;
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-screen w-64 bg-slate-800 dark:bg-slate-800 light:bg-white border-r border-slate-700 dark:border-slate-700 light:border-gray-200 z-50 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Fixed Header Section */}
        <div className="flex-shrink-0">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-slate-700 dark:border-slate-700 light:border-gray-200">
            {/* Modern Logo Design */}
            <div className="relative">
              {/* Main Logo Container */}
              <div className=" h-5 flex items-center justify-center shadow-lg relative overflow-hidden">
            
                 <img src="/logo.png" alt="Logo" className="object-cover" />
               
                
              
              </div>
              
             
            </div>
            
         
          </div>

          {/* Search */}
          <div className="p-4 border-b border-slate-700 dark:border-slate-700 light:border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-400 light:text-gray-400" />
              <input
                type="text"
                placeholder="Search (CTRL + K)"
                className="w-full bg-slate-700 dark:bg-slate-700 light:bg-gray-50 border border-slate-600 dark:border-slate-600 light:border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-300 dark:text-slate-300 light:text-gray-700 placeholder-slate-400 dark:placeholder-slate-400 light:placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {/* Main Menu - Only show if there are visible items */}
          {menuItems.length > 0 && (
            <nav className="px-4 py-4 space-y-1">
              {menuItems.map(renderNavItem)}
            </nav>
          )}

          {/* Apps & Pages - Only show if there are visible items */}
          {appsPages.length > 0 && (
            <div className="px-4 pb-4">
              <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-gray-500 uppercase tracking-wider mb-4">
                APPS and PAGES
              </h3>
              <nav className="space-y-1">
                {appsPages.map(renderNavItem)}
              </nav>
            </div>
          )}

          {/* Analytics - Only show if there are visible items */}
          {analytics.length > 0 && (
            <div className="px-4 pb-4">
              <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-gray-500 uppercase tracking-wider mb-4">
                ANALYTICS
              </h3>
              <nav className="space-y-1">
                {analytics.map(renderNavItem)}
              </nav>
            </div>
          )}

          {/* System - Only show if there are visible items */}
          {system.length > 0 && (
            <div className="px-4 pb-6">
              <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-gray-500 uppercase tracking-wider mb-4">
                SYSTEM
              </h3>
              <nav className="space-y-1">
                {system.map(renderNavItem)}
              </nav>
            </div>
          )}

          {/* Role-based access indicator for restricted users */}
          {isRestrictedUser() && (
            <div className="px-4 pb-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <div>
                    <p className="text-blue-400 text-xs font-medium">Limited Access</p>
                    <p className="text-blue-300 text-xs">
                      Your {currentUser.role} role has access to core modules only.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
