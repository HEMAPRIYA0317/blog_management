'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await login(formData.username, formData.password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page animate-fade-in">
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your BlogVerse account</p>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              className="form-input"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
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
                <span className="spinner" /> Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-divider">or</div>

        <p className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link href="/register">Create one for free</Link>
        </p>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-md)' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            Demo: <strong>alice</strong> / <strong>SecurePass123!</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
