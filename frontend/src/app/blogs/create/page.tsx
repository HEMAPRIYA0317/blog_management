'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api, { Category } from '@/lib/api';

export default function CreateBlogPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    status: 'published' as 'published' | 'draft',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Protect route
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/blogs/create');
    }
  }, [user, authLoading, router]);

  // Fetch categories
  useEffect(() => {
    api.getCategories()
      .then(setCategories)
      .catch((err) => console.error('Failed to fetch categories:', err));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required (minimum 5 characters).');
      return;
    }
    if (formData.title.trim().length < 5) {
      setError('Title must be at least 5 characters long.');
      return;
    }
    if (!formData.content.trim()) {
      setError('Content is required (minimum 20 characters).');
      return;
    }
    if (formData.content.trim().length < 20) {
      setError('Content must be at least 20 characters long.');
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim() || formData.title.trim(),
        content: formData.content.trim(),
        tags: formData.tags.trim(),
        status: formData.status,
      };

      if (formData.category) {
        payload.category = Number(formData.category);
      }

      const createdBlog = await api.createBlog(payload);
      router.push(`/blogs/${createdBlog.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish blog.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="loading-page">
        <div className="spinner spinner-lg" />
        <p>Verifying authentication...</p>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '840px', paddingBottom: 'var(--space-3xl)' }}>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <Link href="/blogs" className="btn btn-ghost btn-sm" style={{ paddingLeft: 0 }}>
          ← Back to blogs
        </Link>
        <h1 className="hero-title" style={{ fontSize: '2.5rem', marginTop: 'var(--space-sm)' }}>
          Write a New Story
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Share your expertise, experiences, and thoughts with the community.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ padding: 'var(--space-2xl)' }}>
        {/* Title */}
        <div className="form-group">
          <label className="form-label" htmlFor="title">
            Title <span style={{ color: 'var(--color-error)' }}>*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className="form-input"
            placeholder="e.g., Understanding Microservices Architecture in 2026"
            value={formData.title}
            onChange={handleChange}
            required
            autoFocus
          />
          <span className="form-help">Make it catchy and descriptive (min 5 characters)</span>
        </div>

        {/* Category & Status */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-md)' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              className="form-select"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Select a Category (Optional)</option>
              {Array.isArray(categories) && categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="status">Publish Status</label>
            <select
              id="status"
              name="status"
              className="form-select"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="published">🚀 Published (Visible to all)</option>
              <option value="draft">📝 Draft (Visible only to you)</option>
            </select>
          </div>
        </div>

        {/* Excerpt */}
        <div className="form-group">
          <label className="form-label" htmlFor="excerpt">Excerpt / Summary</label>
          <textarea
            id="excerpt"
            name="excerpt"
            className="form-textarea"
            style={{ minHeight: '80px' }}
            placeholder="Brief 1-2 sentence preview for feed listings..."
            value={formData.excerpt}
            onChange={handleChange}
          />
        </div>

        {/* Content */}
        <div className="form-group">
          <label className="form-label" htmlFor="content">
            Content <span style={{ color: 'var(--color-error)' }}>*</span>
          </label>
          <textarea
            id="content"
            name="content"
            className="form-textarea"
            style={{ minHeight: '320px', fontFamily: 'inherit', fontSize: '1rem' }}
            placeholder="Write your story here... Supports Markdown headers (##), blockquotes (>), lists (-), and code snippets (```)."
            value={formData.content}
            onChange={handleChange}
            required
          />
          <span className="form-help">
            Formatting tips: Use <code>## Header</code> for sections, <code>- item</code> for bullet points, <code>&gt; quote</code> for callouts, <code>```code```</code> for code snippets.
          </span>
        </div>

        {/* Tags */}
        <div className="form-group">
          <label className="form-label" htmlFor="tags">Tags</label>
          <input
            id="tags"
            name="tags"
            type="text"
            className="form-input"
            placeholder="e.g., react, python, architecture, beginners (comma separated)"
            value={formData.tags}
            onChange={handleChange}
          />
          <span className="form-help">Separate multiple tags with commas</span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
          <Link href="/blogs" className="btn btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" /> Publishing...
              </>
            ) : formData.status === 'published' ? (
              'Publish Story 🚀'
            ) : (
              'Save as Draft 📝'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
