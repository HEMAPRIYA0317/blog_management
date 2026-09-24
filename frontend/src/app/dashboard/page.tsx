'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api, { Blog } from '@/lib/api';
import BlogCard from '@/components/BlogCard';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [deleteBlogId, setDeleteBlogId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Auth protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/dashboard');
    }
  }, [user, authLoading, router]);

  const fetchMyBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getMyBlogs();
      setBlogs(data.results || []);
    } catch (err) {
      console.error('Failed to load user blogs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchMyBlogs();
    }
  }, [user, fetchMyBlogs]);

  const handleDelete = async () => {
    if (!deleteBlogId) return;
    setDeleting(true);
    try {
      await api.deleteBlog(deleteBlogId);
      setBlogs((prev) => prev.filter((b) => b.id !== deleteBlogId));
      setDeleteBlogId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete blog.');
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || (!user && loading)) {
    return (
      <div className="loading-page">
        <div className="spinner spinner-lg" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  // Calculate statistics
  const publishedCount = blogs.filter((b) => b.status === 'published').length;
  const draftCount = blogs.filter((b) => b.status === 'draft').length;
  const totalViews = blogs.reduce((acc, curr) => acc + (curr.views_count || 0), 0);
  const totalLikes = blogs.reduce((acc, curr) => acc + (curr.likes_count || 0), 0);

  const filteredBlogs = blogs.filter((b) => {
    if (statusFilter === 'all') return true;
    return b.status === statusFilter;
  });

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: 'var(--space-3xl)' }}>
      {/* Top Welcome Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-2xl)',
        }}
      >
        <div>
          <h1 className="hero-title" style={{ fontSize: '2.5rem', marginBottom: 'var(--space-xs)' }}>
            Author Dashboard
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Welcome back, <strong>{user?.first_name || user?.username}</strong>! Manage your stories and track their impact.
          </p>
        </div>
        <Link href="/blogs/create" className="btn btn-primary btn-lg">
          ✍️ Write New Story
        </Link>
      </div>

      {/* Analytics Overview Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-2xl)',
        }}
      >
        <div className="card" style={{ padding: 'var(--space-lg)' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', marginBottom: '0.25rem' }}>
            Total Stories
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{blogs.length}</div>
        </div>
        <div className="card" style={{ padding: 'var(--space-lg)' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', marginBottom: '0.25rem' }}>
            Published
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-success)' }}>
            {publishedCount}
          </div>
        </div>
        <div className="card" style={{ padding: 'var(--space-lg)' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', marginBottom: '0.25rem' }}>
            Drafts
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-warning)' }}>
            {draftCount}
          </div>
        </div>
        <div className="card" style={{ padding: 'var(--space-lg)' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', marginBottom: '0.25rem' }}>
            Total Views
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{totalViews}</div>
        </div>
        <div className="card" style={{ padding: 'var(--space-lg)' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', marginBottom: '0.25rem' }}>
            Total Likes
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-like)' }}>
            {totalLikes}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)' }}>
        <button
          className={`filter-chip ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          All ({blogs.length})
        </button>
        <button
          className={`filter-chip ${statusFilter === 'published' ? 'active' : ''}`}
          onClick={() => setStatusFilter('published')}
        >
          Published ({publishedCount})
        </button>
        <button
          className={`filter-chip ${statusFilter === 'draft' ? 'active' : ''}`}
          onClick={() => setStatusFilter('draft')}
        >
          Drafts ({draftCount})
        </button>
      </div>

      {/* Blog Cards Grid */}
      {loading ? (
        <div className="loading-page">
          <div className="spinner spinner-lg" />
          <p>Loading your stories...</p>
        </div>
      ) : filteredBlogs.length > 0 ? (
        <div className="blog-grid">
          {filteredBlogs.map((blog) => (
            <BlogCard
              key={blog.id}
              blog={blog}
              showActions={true}
              onDelete={(id) => setDeleteBlogId(id)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <h2 className="empty-state-title">
            {statusFilter === 'all'
              ? 'You have not written any stories yet'
              : `No ${statusFilter} stories found`}
          </h2>
          <p className="empty-state-description">
            Start sharing your thoughts, guides, and stories with the world today.
          </p>
          <Link href="/blogs/create" className="btn btn-primary">
            Create Your First Story
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteBlogId && (
        <div className="modal-overlay" onClick={() => setDeleteBlogId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Delete this story?</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>
              Are you sure you want to permanently delete this story? This action cannot be reversed.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeleteBlogId(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Story'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
