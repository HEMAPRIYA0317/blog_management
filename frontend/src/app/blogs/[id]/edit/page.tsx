'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api, { Category, BlogDetail } from '@/lib/api';

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const blogId = Number(resolvedParams.id);
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(true);

  // Fetch blog data and categories
  useEffect(() => {
    Promise.all([
      api.getBlog(blogId),
      api.getCategories(),
    ])
      .then(([blogData, categoriesData]: [BlogDetail, Category[]]) => {
        setCategories(categoriesData);

        // Check ownership
        if (user && !blogData.is_owner && user.username !== blogData.author.username) {
          setIsOwner(false);
          setLoading(false);
          return;
        }

        setFormData({
          title: blogData.title,
          excerpt: blogData.excerpt || '',
          content: blogData.content,
          category: blogData.category ? blogData.category.id.toString() : '',
          tags: blogData.tags || '',
          status: blogData.status,
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load blog for editing.');
        setLoading(false);
      });
  }, [blogId, user]);

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
      setError('Title is required.');
      return;
    }
    if (formData.title.trim().length < 5) {
      setError('Title must be at least 5 characters long.');
      return;
    }
    if (!formData.content.trim()) {
      setError('Content is required.');
      return;
    }
    if (formData.content.trim().length < 20) {
      setError('Content must be at least 20 characters long.');
      return;
    }

    setSaving(true);
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
      } else {
        payload.category = null;
      }

      await api.updateBlog(blogId, payload);
      router.push(`/blogs/${blogId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update blog.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="loading-page">
        <div className="spinner spinner-lg" />
        <p>Loading editor...</p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="container empty-state">
        <div className="empty-state-icon">🚫</div>
        <h2 className="empty-state-title">Permission Denied</h2>
        <p className="empty-state-description">
          You are not authorized to edit this blog post. You can only edit your own blogs.
        </p>
        <Link href={`/blogs/${blogId}`} className="btn btn-primary">
          Back to Story
        </Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '840px', paddingBottom: 'var(--space-3xl)' }}>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <Link href={`/blogs/${blogId}`} className="btn btn-ghost btn-sm" style={{ paddingLeft: 0 }}>
          ← Cancel and return to story
        </Link>
        <h1 className="hero-title" style={{ fontSize: '2.5rem', marginTop: 'var(--space-sm)' }}>
          Edit Story
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Update your thoughts and keep your content fresh.
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
            value={formData.title}
            onChange={handleChange}
            required
          />
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
              <option value="">Select a Category</option>
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
            value={formData.content}
            onChange={handleChange}
            required
          />
          <span className="form-help">
            Supports Markdown headers (##), blockquotes (&gt;), lists (-), and code snippets (```).
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
            value={formData.tags}
            onChange={handleChange}
          />
          <span className="form-help">Comma-separated</span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
          <Link href={`/blogs/${blogId}`} className="btn btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner" /> Saving Changes...
              </>
            ) : (
              'Save Changes 💾'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
