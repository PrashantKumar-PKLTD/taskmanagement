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
  Hexagon,
  Target,
  X
} from 'lucide-react';
import { useUserStore } from '../store/userStore';
import PersonalTodo from './todo/PersonalTodo';

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

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      page: 'dashboard', 
      active: currentPage === 'dashboard'
    },
  ];

  const appsPages = [
    { 
      icon: Mail, 
      label: 'Email', 
      page: 'email',
      visible: hasPermission('email.view')
    },
    { 
      icon: MessageCircle, 
      label: 'Chat', 
      page: 'chat', 
      active: currentPage === 'chat'
    },
    { 
      icon: Calendar, 
      label: 'Calendar', 
      page: 'calendar',
      active: currentPage === 'calendar'
    },
    { 
      icon: Kanban, 
      label: 'Kanban', 
      page: 'kanban', 
      active: currentPage === 'kanban'
    },
    { 
      icon: FolderOpen, 
      label: 'Projects', 
      page: 'projects', 
      active: currentPage === 'projects'
    },
    { 
      icon: CheckSquare, 
      label: 'Tasks', 
      page: 'tasks', 
      active: currentPage === 'tasks'
    },
    { 
      icon: Target, 
      label: 'My Todo', 
      page: 'my-todo', 
      active: currentPage === 'my-todo'
    },
    { 
      icon: Receipt, 
      label: 'Invoice', 
      page: 'invoice',
      visible: hasPermission('invoice.view')
    },
    { 
      icon: Users, 
      label: 'Users', 
      page: 'users',
      visible: hasPermission('users.view')
    },
    { 
      icon: Shield, 
      label: 'Roles & Permissions', 
      page: 'roles',
      visible: hasPermission('roles.view')
    },
  ].filter(item => item.visible !== false);

  const analytics = [
    { 
      icon: BarChart3, 
      label: 'Reports', 
      page: 'reports',
      visible: hasPermission('reports.view')
    },
    { 
      icon: TrendingUp, 
      label: 'Analytics', 
      page: 'analytics',
      visible: hasPermission('analytics.view')
    },
    { 
      icon: Zap, 
      label: 'Performance', 
      page: 'performance',
      visible: hasPermission('performance.view')
    },
    { 
      icon: Database, 
      label: 'Data Management', 
      page: 'data',
      visible: hasPermission('data.view')
    },
  ].filter(item => item.visible !== false);

  const system = [
    { 
      icon: Settings, 
      label: 'Settings', 
      page: 'settings',
      visible: hasPermission('settings.view')
    },
    { 
      icon: Bell, 
      label: 'Notifications', 
      page: 'notifications',
      visible: hasPermission('notifications.view')
    },
    { 
      icon: Shield, 
      label: 'Security', 
      page: 'security',
      visible: hasPermission('security.view')
    },
    { 
      icon: HelpCircle, 
      label: 'Help & Support', 
      page: 'help',
      visible: hasPermission('help.view')
    },
  ].filter(item => item.visible !== false);

  const handleNavigation = (page: string) => {
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
        fixed lg:static inset-y-0 left-0 z-50 w-80 bg-slate-800 dark:bg-slate-800 light:bg-white 
        border-r border-slate-700 dark:border-slate-700 light:border-gray-200 
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-screen
      `}>
        {/* Header */}
        <div className="p-4 border-b border-slate-700 dark:border-slate-700 light:border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
             
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-40 "   
                />
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg text-slate-400 dark:text-slate-400 light:text-gray-500 hover:text-white dark:hover:text-white light:hover:text-gray-900 hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {/* Main Menu */}
          <nav className="px-4 py-4 space-y-1">
            {menuItems.map(renderNavItem)}
          </nav>

          {/* Apps & Pages */}
          <div className="px-4 pb-4">
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-gray-500 uppercase tracking-wider mb-4">
              APPS and PAGES
            </h3>
            <nav className="space-y-1">
              {appsPages.map(renderNavItem)}
            </nav>
          </div>

          {/* Analytics */}
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

          {/* System */}
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
        </div>
      </div>
    </>
  );
};

export default Sidebar;