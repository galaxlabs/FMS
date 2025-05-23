import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Truck, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  Bell
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  isActive: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, to, isActive }) => {
  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
        isActive
          ? 'bg-primary-100 text-primary-800 font-medium'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className={isActive ? 'text-primary-700' : 'text-gray-500'}>
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get the base path for active state comparison
  const getBasePath = (path: string) => {
    const parts = path.split('/');
    return parts.length > 1 ? `/${parts[1]}` : path;
  };

  const basePath = getBasePath(location.pathname);

  // Navigation items based on user role
  const getNavItems = () => {
    // Items for all users
    const items = [
      {
        icon: <LayoutDashboard size={20} />,
        label: 'Dashboard',
        to: '/dashboard',
      },
    ];

    // Role-specific items
    if (user?.role === 'admin' || user?.role === 'company') {
      items.push(
        {
          icon: <Users size={20} />,
          label: 'Drivers',
          to: '/drivers',
        },
        {
          icon: <Truck size={20} />,
          label: 'Vehicles',
          to: '/vehicles',
        }
      );
    }

    // For all users
    items.push({
      icon: <FileText size={20} />,
      label: 'Reports',
      to: '/reports',
    });

    // Settings only for admin and company
    if (user?.role === 'admin' || user?.role === 'company') {
      items.push({
        icon: <Settings size={20} />,
        label: 'Settings',
        to: '/settings',
      });
    }

    return items;
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            <Menu size={24} />
          </button>
          <h1 className="ml-3 text-lg font-semibold text-gray-900">
            Transport System
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100">
            <Bell size={20} />
          </button>
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-1 p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-medium">
                {user?.name.charAt(0) || 'U'}
              </div>
              <ChevronDown size={16} />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 py-1 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
      >
        <div className="fixed inset-0 bg-gray-900/50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed top-0 left-0 bottom-0 w-72 bg-white flex flex-col">
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-primary-900">Transport System</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map((item, index) => (
              <SidebarItem
                key={index}
                icon={item.icon}
                label={item.label}
                to={item.to}
                isActive={getBasePath(item.to) === basePath}
              />
            ))}
          </div>
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="outline"
              fullWidth
              leftIcon={<LogOut size={16} />}
              onClick={handleLogout}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r border-gray-200 bg-white">
          <div className="px-6 py-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-primary-900">Transport System</h1>
          </div>
          <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            {navItems.map((item, index) => (
              <SidebarItem
                key={index}
                icon={item.icon}
                label={item.label}
                to={item.to}
                isActive={getBasePath(item.to) === basePath}
              />
            ))}
          </div>
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center text-lg font-medium">
                {user?.name.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              fullWidth
              leftIcon={<LogOut size={16} />}
              onClick={handleLogout}
            >
              Sign out
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Desktop header */}
          <header className="hidden lg:flex h-16 border-b border-gray-200 bg-white items-center justify-between px-6">
            <h2 className="text-xl font-semibold text-gray-800 capitalize">
              {basePath.substring(1) || 'Dashboard'}
            </h2>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                <Bell size={20} />
              </button>
            </div>
          </header>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto p-6 pt-16 lg:pt-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};