import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Files,
  Tags,
  Clock,
  CalendarX2,
  Settings,
  LogOut,
  FolderArchive,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose, expiringSoonCount = 0, expiredCount = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    {
      label: 'Overview',
      to: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'All Documents',
      to: '/documents',
      icon: Files,
    },
    {
      label: 'Categories',
      to: '/categories',
      icon: Tags,
    },
    {
      label: 'Expiring Soon',
      to: '/expiring-soon',
      icon: Clock,
      badge: expiringSoonCount > 0 ? expiringSoonCount : null,
      badgeVariant: 'warning',
    },
    {
      label: 'Expired Documents',
      to: '/expired',
      icon: CalendarX2,
      badge: expiredCount > 0 ? expiredCount : null,
      badgeVariant: 'danger',
    },
    {
      label: 'Settings',
      to: '/settings',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-bg-surface border-r border-bg-border flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-bg-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-lime-dim border border-accent-lime/30 flex items-center justify-center text-accent-lime font-bold">
              <FolderArchive className="w-4 h-4" />
            </div>
            <span className="font-semibold text-base tracking-tight text-text-primary">
              DocuKeep
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-text-secondary hover:text-text-primary lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-bg-hover text-accent-lime border border-accent-lime/20'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover/60 border border-transparent'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                      item.badgeVariant === 'warning'
                        ? 'bg-status-urgent-bg text-status-urgent border border-status-urgent/30'
                        : 'bg-status-expired-bg text-status-expired border border-status-expired/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Mini Profile & Logout */}
        <div className="p-3 border-t border-bg-border">
          <div className="p-2.5 rounded-lg bg-bg-main/60 border border-bg-border/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-accent-emerald-dim border border-accent-emerald/30 text-accent-emerald flex items-center justify-center font-medium text-xs flex-shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-text-primary truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-[11px] text-text-secondary truncate">
                  {user?.email || ''}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-md text-text-muted hover:text-status-expired hover:bg-status-expired-bg transition-colors flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
