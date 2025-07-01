import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Shield, 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Globe,
  Server,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Download,
  Share,
  Settings,
  Bell,
  Search,
  Star,
  Award,
  Briefcase,
  FileText,
  MessageSquare,
  Heart,
  Bookmark
} from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';
import { useUserStore } from '../../store/userStore';
import { useTaskStore } from '../../store/taskStore';
import { useProjectStore } from '../../store/projectStore';

const ModernDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [activeMetric, setActiveMetric] = useState('users');
  const [showNotifications, setShowNotifications] = useState(false);
  
  const { stats, systemMetrics, recentActivities, lastUpdated } = useDashboardStore();
  const { currentUser, users } = useUserStore();
  const { tasks } = useTaskStore();
  const { projects } = useProjectStore();

  // Calculate advanced metrics
  const advancedMetrics = React.useMemo(() => {
    const myTasks = tasks.filter(task => task.assignee === currentUser?.id);
    const completedTasks = myTasks.filter(task => task.status === 'completed');
    const overdueTasks = myTasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return dueDate < new Date() && task.status !== 'completed';
    });
    
    const activeProjects = projects.filter(project => project.status === 'active');
    const completedProjects = projects.filter(project => project.status === 'completed');
    
    return {
      myTasks: myTasks.length,
      completedTasks: completedTasks.length,
      overdueTasks: overdueTasks.length,
      activeProjects: activeProjects.length,
      completedProjects: completedProjects.length,
      completionRate: myTasks.length > 0 ? Math.round((completedTasks.length / myTasks.length) * 100) : 0
    };
  }, [tasks, projects, currentUser]);

  const formatLastUpdated = (timestamp: string) => {
    const now = new Date();
    const updated = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - updated.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  const quickActions = [
    { icon: Plus, label: 'New Task', color: 'bg-blue-500', action: () => {} },
    { icon: Briefcase, label: 'New Project', color: 'bg-purple-500', action: () => {} },
    { icon: Users, label: 'Add User', color: 'bg-green-500', action: () => {} },
    { icon: FileText, label: 'Generate Report', color: 'bg-orange-500', action: () => {} }
  ];

  const recentNotifications = [
    { id: 1, type: 'task', message: 'New task assigned to you', time: '2m ago', unread: true },
    { id: 2, type: 'project', message: 'Project deadline approaching', time: '1h ago', unread: true },
    { id: 3, type: 'system', message: 'System maintenance scheduled', time: '3h ago', unread: false },
    { id: 4, type: 'user', message: 'New team member joined', time: '1d ago', unread: false }
  ];

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-6 lg:mb-0">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Welcome back, {currentUser?.name?.split(' ')[0] || 'User'}! 👋
                </h1>
                <p className="text-slate-400 mt-1">Here's what's happening with your projects today</p>
              </div>
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Last updated {formatLastUpdated(lastUpdated)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Time Range Selector */}
            <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
              {['24h', '7d', '30d', '90d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors">
                <Download className="w-4 h-4" />
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors relative"
                >
                  <Bell className="w-4 h-4" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                </button>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-12 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50">
                    <div className="p-4 border-b border-slate-700">
                      <h3 className="text-white font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {recentNotifications.map((notification) => (
                        <div key={notification.id} className={`p-4 border-b border-slate-700 hover:bg-slate-700 transition-colors ${notification.unread ? 'bg-slate-700/30' : ''}`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${notification.unread ? 'bg-red-500' : 'bg-slate-600'}`}></div>
                            <div className="flex-1">
                              <p className="text-white text-sm">{notification.message}</p>
                              <p className="text-slate-400 text-xs mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4">
                      <button className="w-full text-center text-red-400 hover:text-red-300 text-sm font-medium">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{advancedMetrics.myTasks}</div>
                <div className="text-blue-400 text-sm font-medium">My Tasks</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(advancedMetrics.completionRate, 100)}%` }}
                ></div>
              </div>
              <span className="text-blue-400 text-sm font-medium">{advancedMetrics.completionRate}%</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-2xl p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{advancedMetrics.completedTasks}</div>
                <div className="text-green-400 text-sm font-medium">Completed</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+12% this week</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-2xl p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <Clock className="w-6 h-6 text-orange-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{advancedMetrics.overdueTasks}</div>
                <div className="text-orange-400 text-sm font-medium">Overdue</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-orange-400 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Needs attention</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-2xl p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Briefcase className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{advancedMetrics.activeProjects}</div>
                <div className="text-purple-400 text-sm font-medium">Active Projects</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-purple-400 text-sm">
              <Activity className="w-4 h-4" />
              <span>In progress</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Performance Chart */}
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Performance Overview</h3>
                <p className="text-slate-400 text-sm">Task completion trends over time</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chart Area */}
            <div className="relative h-64 mb-4">
              <svg className="w-full h-full" viewBox="0 0 400 200">
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Grid Lines */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <line
                    key={i}
                    x1="0"
                    y1={i * 50}
                    x2="400"
                    y2={i * 50}
                    stroke="#374151"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                ))}
                
                {/* Chart Line */}
                <path
                  d="M 0 150 Q 50 120 100 100 T 200 80 T 300 60 T 400 40"
                  fill="url(#chartGradient)"
                  stroke="#ef4444"
                  strokeWidth="3"
                  fillOpacity="0.3"
                />
                
                {/* Data Points */}
                {[0, 100, 200, 300, 400].map((x, i) => (
                  <circle
                    key={i}
                    cx={x}
                    cy={150 - i * 25}
                    r="4"
                    fill="#ef4444"
                    className="hover:r-6 transition-all cursor-pointer"
                  />
                ))}
              </svg>
              
              {/* Chart Labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-slate-400 px-4">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
              </div>
            </div>

            {/* Chart Legend */}
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-slate-400 text-sm">Tasks Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-slate-400 text-sm">Tasks Created</span>
              </div>
            </div>
          </div>

          {/* Quick Actions & System Status */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className="flex flex-col items-center gap-2 p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors group"
                  >
                    <div className={`p-3 ${action.color} rounded-lg group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-slate-300 text-sm font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">System Status</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">All Systems Operational</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {systemMetrics && [
                  { label: 'CPU Usage', value: systemMetrics.cpu, color: 'bg-blue-500', icon: Cpu },
                  { label: 'Memory', value: systemMetrics.memory, color: 'bg-green-500', icon: Database },
                  { label: 'Storage', value: systemMetrics.storage, color: 'bg-yellow-500', icon: HardDrive },
                ].map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <metric.icon className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300 text-sm">{metric.label}</span>
                      </div>
                      <span className="text-white font-medium text-sm">{metric.value}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className={`${metric.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${metric.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Recent Activity</h3>
              <button className="text-red-400 hover:text-red-300 text-sm font-medium">
                View all
              </button>
            </div>
            
            <div className="space-y-4">
              {recentActivities.slice(0, 5).map((activity, index) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {activity.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">
                      <span className="text-red-400">{activity.user.name}</span> {activity.description.toLowerCase()}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-400 text-xs">{activity.user.role}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400 text-xs">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Overview */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Team Overview</h3>
              <button className="text-red-400 hover:text-red-300 text-sm font-medium">
                Manage team
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Team Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-slate-700/30 rounded-xl">
                  <div className="text-2xl font-bold text-white">{users.filter(u => u.status === 'active').length}</div>
                  <div className="text-slate-400 text-sm">Active</div>
                </div>
                <div className="text-center p-4 bg-slate-700/30 rounded-xl">
                  <div className="text-2xl font-bold text-white">{users.filter(u => u.role === 'Admin').length}</div>
                  <div className="text-slate-400 text-sm">Admins</div>
                </div>
                <div className="text-center p-4 bg-slate-700/30 rounded-xl">
                  <div className="text-2xl font-bold text-white">{users.filter(u => u.lastLogin && new Date(u.lastLogin) > new Date(Date.now() - 24*60*60*1000)).length}</div>
                  <div className="text-slate-400 text-sm">Online</div>
                </div>
              </div>

              {/* Top Performers */}
              <div>
                <h4 className="text-white font-medium mb-3">Top Performers</h4>
                <div className="space-y-3">
                  {users.slice(0, 3).map((user, index) => (
                    <div key={user.id} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                      <div className="relative">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Award className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm">{user.name}</div>
                        <div className="text-slate-400 text-xs">{user.role}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium text-sm">98%</div>
                        <div className="text-slate-400 text-xs">Score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8 z-50">
          <button className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-200 flex items-center justify-center group">
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModernDashboard;