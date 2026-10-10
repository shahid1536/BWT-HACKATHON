import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FolderArchive, ArrowLeft, Home, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NotFoundPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-main text-text-primary flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 selection:bg-accent-lime selection:text-bg-main">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Brand Header */}
        <Link to="/" className="inline-flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-lg bg-accent-lime-dim border border-accent-lime/30 flex items-center justify-center text-accent-lime font-bold">
            <FolderArchive className="w-5 h-5" />
          </div>
          <span className="font-semibold text-xl tracking-tight text-text-primary">
            DocuKeep
          </span>
        </Link>

        {/* 404 Graphic Card */}
        <div className="p-8 rounded-2xl bg-bg-surface border border-bg-border shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-lime/5 blur-[50px] pointer-events-none rounded-full" />
          
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-bg-elevated border border-bg-border text-xs font-semibold text-accent-lime mb-4">
            404 Error
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Page Not Found
          </h1>

          <p className="mt-3 text-xs sm:text-sm text-text-secondary leading-relaxed">
            The page or document route you are looking for does not exist, has been moved, or may have expired.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-bg-border bg-bg-secondary text-text-secondary hover:text-text-primary hover:border-zinc-700 font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-accent-lime text-bg-main font-semibold text-xs sm:text-sm hover:bg-accent-lime-hover transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/"
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-accent-lime text-bg-main font-semibold text-xs sm:text-sm hover:bg-accent-lime-hover transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Home className="w-4 h-4" />
                <span>Homepage</span>
              </Link>
            )}
          </div>
        </div>

        <p className="text-[11px] text-text-muted">
          DocuKeep &mdash; Personal Document Organizer
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;
