import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FolderArchive, AlertCircle, ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      console.error('[DocuKeep Login Failure]', err);
      let message = 'Invalid email or password. Please try again.';

      if (err.response) {
        if (err.response.data && typeof err.response.data === 'object' && err.response.data.message) {
          message = err.response.data.message;
        } else if (err.response.status === 401) {
          message = 'Invalid email or password. Please check your credentials.';
        } else if (err.response.status === 404) {
          message = 'Login endpoint not found (404). Please verify backend server URL.';
        } else if (err.response.status === 502 || err.response.status === 503 || err.response.status === 504) {
          message = `Backend service temporarily unavailable (${err.response.status}).`;
        }
      } else if (err.request) {
        message = 'Unable to reach backend server. Please verify the server is running.';
      } else if (err.message) {
        message = err.message;
      }

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-accent-lime selection:text-bg-main">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-accent-lime-dim border border-accent-lime/30 flex items-center justify-center text-accent-lime font-bold">
            <FolderArchive className="w-5 h-5" />
          </div>
          <span className="font-semibold text-xl tracking-tight text-text-primary">
            DocuKeep
          </span>
        </Link>
        <h2 className="text-center text-2xl font-bold tracking-tight text-text-primary">
          Log in to your account
        </h2>
        <p className="mt-2 text-center text-xs text-text-secondary">
          Manage your personal records and stay ahead of expiry dates.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-bg-surface border border-bg-border py-8 px-6 sm:px-10 rounded-xl shadow-xl">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-lg bg-status-expired-bg border border-status-expired/30 text-status-expired text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-bg-main border border-bg-border text-sm text-text-primary placeholder:text-text-muted focus:border-accent-lime focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-bg-main border border-bg-border text-sm text-text-primary placeholder:text-text-muted focus:border-accent-lime focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent-lime text-bg-main font-semibold text-sm hover:bg-accent-lime-hover transition-colors disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-bg-border text-center">
            <p className="text-xs text-text-secondary">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-accent-lime hover:underline font-medium">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
