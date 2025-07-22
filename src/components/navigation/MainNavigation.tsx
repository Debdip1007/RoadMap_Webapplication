import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { signOut } from '../../lib/supabase';
import { 
  Home, 
  Target, 
  Settings, 
  Upload, 
  Plus,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

interface MainNavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function MainNavigation({ currentView, onViewChange }: MainNavigationProps) {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const confirmSignOut = () => {
    setShowSignOutConfirm(true);
  };

  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="h-5 w-5" />,
      active: currentView === 'home'
    },
    {
      id: 'my-goals',
      label: 'My Goals',
      icon: <Target className="h-5 w-5" />,
      active: currentView === 'my-goals'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      active: currentView === 'settings'
    },
    {
      id: 'import-roadmap',
      label: 'Import Roadmap',
      icon: <Upload className="h-5 w-5" />,
      active: currentView === 'import-roadmap'
    },
    {
      id: 'create-roadmap',
      label: 'Create New Roadmap',
      icon: <Plus className="h-5 w-5" />,
      active: currentView === 'create-roadmap'
    },
    {
      id: 'sign-out',
      label: 'Sign Out',
      icon: <LogOut className="h-5 w-5" />,
      active: false,
      action: confirmSignOut
    }
  ];

  return (
    <>
      {/* Main Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Goal Tracker</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => item.action ? item.action() : onViewChange(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    item.active
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* User Info */}
            <div className="hidden md:flex items-center space-x-3 text-sm text-gray-600">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="font-medium">{user?.email}</span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
          <div className="px-4 py-4 space-y-2">
            {/* Mobile User Info */}
            <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-lg">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{user?.email}</p>
                <p className="text-sm text-gray-500">Logged in</p>
              </div>
            </div>

            {/* Mobile Navigation Items */}
            <nav className="space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else {
                      onViewChange(item.id);
                    }
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 w-full px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    item.active
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowSignOutConfirm(false)} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="text-center">
                <LogOut className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sign Out Confirmation
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to sign out of your account?
                </p>
                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowSignOutConfirm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      handleSignOut();
                      setShowSignOutConfirm(false);
                    }}
                    className="flex-1"
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}