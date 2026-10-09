import React from 'react';
import { Menu, Plus, User, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Topbar = ({ title, subtitle, onOpenSidebar, onOpenUpload }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 px-4 sm:px-6 lg:px-8 border-b border-bg-border bg-bg-surface/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
      {/* Left Title and Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-semibold text-text-primary leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-text-muted hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {onOpenUpload && (
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-lime text-bg-main hover:bg-accent-lime-hover font-semibold text-xs sm:text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Upload Document</span>
          </button>
        )}

        <Link
          to="/settings"
          className="p-1.5 rounded-lg border border-bg-border hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
          title="Profile settings"
        >
          <div className="w-6 h-6 rounded-full bg-accent-emerald-dim text-accent-emerald border border-accent-emerald/30 flex items-center justify-center text-xs font-semibold">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Topbar;
