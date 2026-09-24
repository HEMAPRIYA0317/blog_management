'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, updateUser } = useAuth();

  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password change state
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Auth protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/profile');
    } else if (user) {
      setProfileData({
        username: user.username,
        email: user.email,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      });
    }
  }, [user, authLoading, router]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
    setProfileError('');
    setProfileSuccess('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      const updated = await api.updateProfile({
        email: profileData.email,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
      });
      updateUser(updated);
      setProfileSuccess('Profile updated successfully!');
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (passwordData.new_password.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    setPasswordSaving(true);
    setPasswordError('');
    setPasswordSuccess('');
    try {
      const res = await api.changePassword(passwordData.old_password, passwordData.new_password);
      setPasswordSuccess(res.message || 'Password changed successfully!');
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="loading-page">
        <div className="spinner spinner-lg" />
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '720px', paddingBottom: 'var(--space-3xl)' }}>
      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <h1 className="hero-title" style={{ fontSize: '2.5rem', marginBottom: 'var(--space-xs)' }}>
          Account Settings
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Manage your personal information and security credentials.
        </p>
      </div>

      {/* Profile Details Card */}
      <div className="card" style={{ padding: 'var(--space-2xl)', marginBottom: 'var(--space-2xl)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>
          Profile Information
        </h2>

        {profileSuccess && (
          <div className="alert alert-success">
            <span>✅</span> {profileSuccess}
          </div>
        )}
        {profileError && (
          <div className="alert alert-error">
            <span>⚠️</span> {profileError}
          </div>
        )}

        <form onSubmit={handleProfileSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="form-input"
              value={profileData.username}
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
            <span className="form-help">Username cannot be changed</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="first_name">First Name</label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                className="form-input"
                value={profileData.first_name}
                onChange={handleProfileChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="last_name">Last Name</label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                className="form-input"
                value={profileData.last_name}
                onChange={handleProfileChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              value={profileData.email}
              onChange={handleProfileChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={profileSaving}
          >
            {profileSaving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* Password Change Card */}
      <div className="card" style={{ padding: 'var(--space-2xl)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>
          Change Password
        </h2>

        {passwordSuccess && (
          <div className="alert alert-success">
            <span>✅</span> {passwordSuccess}
          </div>
        )}
        {passwordError && (
          <div className="alert alert-error">
            <span>⚠️</span> {passwordError}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="old_password">Current Password</label>
            <input
              id="old_password"
              name="old_password"
              type="password"
              className="form-input"
              value={passwordData.old_password}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="new_password">New Password</label>
            <input
              id="new_password"
              name="new_password"
              type="password"
              className="form-input"
              placeholder="Minimum 8 characters"
              value={passwordData.new_password}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm_password">Confirm New Password</label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              className="form-input"
              placeholder="Re-type new password"
              value={passwordData.confirm_password}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-secondary"
            disabled={passwordSaving}
          >
            {passwordSaving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
