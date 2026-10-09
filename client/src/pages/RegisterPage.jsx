import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FolderArchive, AlertCircle, ArrowRight, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide your name.');
      return;
    }

    if (!email.trim()) {
      setError('Please provide your email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      await register(name.trim(), email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      console.error('[DocuKeep Registration Failure]', err);
      let message = 'Registration failed. Please check your details and try again.';

      if (err.response) {
        // Server returned an HTTP response
        if (err.response.data && typeof err.response.data === 'object' && err.response.data.message) {
          message = err.response.data.message;
        } else if (typeof err.response.data === 'string' && err.response.data.length < 150) {
          message = err.response.data;
        } else if (err.response.status === 404) {
          message = 'Registration endpoint was not found (404). Please verify backend server URL and routing.';
        } else if (err.response.status === 502 || err.response.status === 503 || err.response.status === 504) {
          message = `Backend service temporarily unavailable (${err.response.status}). Please verify that MongoDB and backend server are running.`;
        } else {
          message = `Server returned error (${err.response.status}). Please try again.`;
        }
      } else if (err.request) {
        // Request made but no response (server offline, CORS blocked, or wrong host)
        message = 'Unable to reach backend server. Please verify the server is running on port 5000 and CORS / network settings are configured.';
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
          Create your account
        </h2>
        <p className="mt-2 text-center text-xs text-text-secondary">
          Start organizing your documents and expiry schedules today.
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
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-bg-main border border-bg-border text-sm text-text-primary placeholder:text-text-muted focus:border-accent-lime focus:outline-none"
                />
              </div>
            </div>

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
                Password <span className="text-text-muted font-normal">(min 6 characters)</span>
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
                <span>{isSubmitting ? 'Creating account...' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-bg-border text-center">
            <p className="text-xs text-text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-accent-lime hover:underline font-medium">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
