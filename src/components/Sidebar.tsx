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

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentPage = 'dashboard', onNavigate }) => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard', active: currentPage === 'dashboard' },
    { icon: Layers, label: 'Layouts', page: 'layouts' },
    { icon: FileText, label: 'Front Pages', page: 'front-pages' },
  ];

  const appsPages = [
    { icon: Mail, label: 'Email', page: 'email' },
    { icon: MessageCircle, label: 'Chat', page: 'chat', active: currentPage === 'chat' },
    { icon: Calendar, label: 'Calendar', page: 'calendar' },
    { icon: Kanban, label: 'Kanban', page: 'kanban', active: currentPage === 'kanban' },
    { icon: FolderOpen, label: 'Projects', page: 'projects', active: currentPage === 'projects' },
    { icon: CheckSquare, label: 'Tasks', page: 'tasks', active: currentPage === 'tasks' },
    { icon: Receipt, label: 'Invoice', page: 'invoice' },
    { icon: Users, label: 'Users', page: 'users' },
    { icon: Shield, label: 'Roles & Permissions', page: 'roles' },
  ];

  const analytics = [
    { icon: BarChart3, label: 'Reports', page: 'reports' },
    { icon: TrendingUp, label: 'Analytics', page: 'analytics' },
    { icon: Zap, label: 'Performance', page: 'performance' },
    { icon: Database, label: 'Data Management', page: 'data' },
  ];

  const system = [
    { icon: Settings, label: 'Settings', page: 'settings' },
    { icon: Bell, label: 'Notifications', page: 'notifications' },
    { icon: Shield, label: 'Security', page: 'security' },
    { icon: HelpCircle, label: 'Help & Support', page: 'help' },
  ];

  const handleNavigation = (page: string) => {
    // Define pages that don't require permission checks
    const publicPages = ['dashboard', 'chat', 'profile', 'projects', 'tasks', 'kanban'];
    
    // Check permissions for restricted pages only
    if (!publicPages.includes(page)) {
      const permissionMap: { [key: string]: string } = {
        'users': 'users.view',
        'roles': 'roles.view',
        'email': 'email.view',
        'calendar': 'calendar.view',
        'invoice': 'invoice.view',
        'reports': 'reports.view',
        'analytics': 'analytics.view',
        'performance': 'performance.view',
        'data': 'data.view',
        'settings': 'settings.view',
        'notifications': 'notifications.view',
        'security': 'security.view',
        'help': 'help.view'
      };

      const requiredPermission = permissionMap[page];
      if (requiredPermission) {
        // Note: You'll need to implement permission checking here
        // For now, we'll allow navigation to all pages
      }
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
  <img src="./logo.png" alt="Logo" className="h-4 w-auto" />
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
          {/* Main Menu */}
          <nav className="px-4 py-4 space-y-1">
            {menuItems.map(renderNavItem)}
          </nav>

          {/* Apps & Pages */}
          <div className="px-4 pb-4">
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-gray-500 uppercase tracking-wider mb-4">
              APPS & PAGES
            </h3>
            <nav className="space-y-1">
              {appsPages.map(renderNavItem)}
            </nav>
          </div>

          {/* Analytics */}
          <div className="px-4 pb-4">
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-gray-500 uppercase tracking-wider mb-4">
              ANALYTICS
            </h3>
            <nav className="space-y-1">
              {analytics.map(renderNavItem)}
            </nav>
          </div>

          {/* System */}
          <div className="px-4 pb-6">
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-gray-500 uppercase tracking-wider mb-4">
              SYSTEM
            </h3>
            <nav className="space-y-1">
              {system.map(renderNavItem)}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;