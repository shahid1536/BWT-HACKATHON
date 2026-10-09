import React, { useState, useEffect } from 'react';
import { User, Lock, Check, AlertCircle, Shield, Calendar, HardDrive } from 'lucide-react';
import { profileApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/dateUtils';

const SettingsPage = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileData, setProfileData] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }

    const fetchProfile = async () => {
      try {
        const res = await profileApi.getProfile();
        if (res.data.success) {
          setProfileData(res.data.user);
          setName(res.data.user.name || '');
          setEmail(res.data.user.email || '');
        }
      } catch (e) {
        console.error('Failed to fetch detailed profile:', e);
      }
    };

    fetchProfile();
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }

    if (!email.trim()) {
      setError('Email cannot be empty.');
      return;
    }

    if (newPassword) {
      if (!currentPassword) {
        setError('Please enter your current password to set a new password.');
        return;
      }
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('New passwords do not match.');
        return;
      }
    }

    try {
      setIsUpdating(true);
      const payload = {
        name: name.trim(),
        email: email.trim(),
      };

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await profileApi.updateProfile(payload);
      if (res.data.success) {
        updateUser(res.data.user);
        setSuccess('Profile updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to update profile settings.'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Account Overview Card */}
      <div className="bg-bg-surface border border-bg-border rounded-xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent-lime-dim border border-accent-lime/30 text-accent-lime flex items-center justify-center font-bold text-lg">
            {name ? name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">{name || 'User'}</h2>
            <p className="text-xs text-text-secondary">{email || ''}</p>
            <p className="text-[11px] text-text-muted mt-1">
              Member since {formatDate(profileData?.createdAt || user?.createdAt)}
            </p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-xs text-text-muted block">Total Tracked</span>
          <span className="text-sm font-semibold text-text-primary">
            {profileData?.documentCount ?? '—'} documents
          </span>
        </div>
      </div>

      {/* Profile & Security Form */}
      <div className="bg-bg-surface border border-bg-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-1">
          Account & Security Settings
        </h3>
        <p className="text-xs text-text-muted mb-6">
          Update your profile information and login credentials.
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-status-expired-bg border border-status-expired/30 text-status-expired text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 mb-4 rounded-lg bg-status-valid-bg border border-accent-emerald/30 text-accent-emerald text-xs flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-bg-main border border-bg-border text-sm text-text-primary focus:border-accent-lime focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-bg-main border border-bg-border text-sm text-text-primary focus:border-accent-lime focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-bg-border space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-text-primary">
                Change Password
              </h4>
              <p className="text-[11px] text-text-muted mt-0.5">
                Leave password fields blank if you do not want to change your password.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                placeholder="Required only if changing password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-bg-main border border-bg-border text-sm text-text-primary placeholder:text-text-muted focus:border-accent-lime focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-bg-main border border-bg-border text-sm text-text-primary placeholder:text-text-muted focus:border-accent-lime focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-bg-main border border-bg-border text-sm text-text-primary placeholder:text-text-muted focus:border-accent-lime focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-bg-border flex justify-end">
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2 rounded-lg bg-accent-lime text-bg-main hover:bg-accent-lime-hover text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {isUpdating ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
