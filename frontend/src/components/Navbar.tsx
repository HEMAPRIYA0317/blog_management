'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    setShowUserMenu(false);
  };

  const getInitials = (u: typeof user) => {
    if (!u) return '?';
    if (u.first_name && u.last_name) {
      return `${u.first_name[0]}${u.last_name[0]}`.toUpperCase();
    }
    return u.username[0].toUpperCase();
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-brand">
          <span className="navbar-brand-icon">✦</span>
          BlogVerse
        </Link>

        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          <Link
            href="/"
            className={`navbar-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            ✦ Home
          </Link>
          <Link
            href="/blogs"
            className={`navbar-link ${isActive('/blogs') ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            📝 Explore
          </Link>
          <Link
            href="/test-supabase"
            className={`navbar-link ${isActive('/test-supabase') ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            ⚡ Supabase
          </Link>
          {user && (
            <>
              <Link
                href="/blogs/create"
                className={`navbar-link ${isActive('/blogs/create') ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                ✍️ Write
              </Link>
              <Link
                href="/dashboard"
                className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                📊 Dashboard
              </Link>
            </>
          )}
        </div>

        <div className="navbar-user">
          {user ? (
            <div style={{ position: 'relative' }}>
              <div
                className="navbar-avatar"
                onClick={() => setShowUserMenu(!showUserMenu)}
                title={user.username}
              >
                {getInitials(user)}
              </div>
              {showUserMenu && (
                <>
                  <div
                    style={{
                      position: 'fixed',
                      inset: 0,
                      zIndex: 99,
                    }}
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '0.5rem',
                      width: '200px',
                      background: 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '0.5rem',
                      zIndex: 100,
                      animation: 'scaleIn 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        padding: '0.75rem',
                        borderBottom: '1px solid var(--color-border)',
                        marginBottom: '0.25rem',
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        {user.first_name || user.username}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                        @{user.username}
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      className="navbar-link"
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                      onClick={() => setShowUserMenu(false)}
                    >
                      👤 Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      className="navbar-link"
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                      onClick={() => setShowUserMenu(false)}
                    >
                      📊 Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="navbar-link"
                      style={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        color: 'var(--color-error)',
                      }}
                    >
                      🚪 Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost">
                Sign In
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </>
          )}

          <button
            className="navbar-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </nav>
  );
}
