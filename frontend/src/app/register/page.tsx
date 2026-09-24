'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password || !formData.password2) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password !== formData.password2) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page animate-fade-in">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join BlogVerse and start sharing your stories</p>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="first_name">First Name</label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                className="form-input"
                placeholder="John"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="last_name">Last Name</label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                className="form-input"
                placeholder="Doe"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <input
              id="username"
              name="username"
              type="text"
              className="form-input"
              placeholder="Choose a unique username"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Min. 8 characters"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password2">
              Confirm Password <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <input
              id="password2"
              name="password2"
              type="password"
              className="form-input"
              placeholder="Re-enter your password"
              value={formData.password2}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 'var(--space-sm)' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" /> Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
