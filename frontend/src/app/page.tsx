'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api, { Blog } from '@/lib/api';
import BlogCard from '@/components/BlogCard';

export default function HomePage() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await api.getBlogs({ ordering: '-created_at' });
        setBlogs((data?.results || []).slice(0, 6));
      } catch (err) {
        console.error('Failed to fetch blogs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <span className="hero-badge">✨ Welcome to BlogVerse</span>
          <h1 className="hero-title">
            Where Ideas Come<br />To Life
          </h1>
          <p className="hero-description">
            Discover stories, thinking, and expertise from writers on any topic.
            Share your knowledge, ideas, and experiences with the world.
          </p>
          <div className="hero-actions">
            {user ? (
              <>
                <Link href="/blogs/create" className="btn btn-primary btn-lg">
                  ✍️ Start Writing
                </Link>
                <Link href="/blogs" className="btn btn-secondary btn-lg">
                  📖 Explore Blogs
                </Link>
              </>
            ) : (
              <>
                <Link href="/register" className="btn btn-primary btn-lg">
                  🚀 Get Started — It&apos;s Free
                </Link>
                <Link href="/blogs" className="btn btn-secondary btn-lg">
                  📖 Read Blogs
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Featured Stats */}
      <section className="container" style={{ marginBottom: 'var(--space-3xl)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-lg)',
          }}
        >
          {[
            { icon: '📝', label: 'Blog Posts', value: blogs.length + '+' },
            { icon: '👥', label: 'Active Writers', value: '2+' },
            { icon: '❤️', label: 'Interactions', value: '100+' },
            { icon: '🌍', label: 'Categories', value: '5' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="card"
              style={{
                textAlign: 'center',
                padding: 'var(--space-xl)',
                cursor: 'default',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-sm)' }}>
                {stat.icon}
              </div>
              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  background: 'var(--color-accent-gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {stat.value}
              </div>
              <div style={{ color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Posts */}
      <section className="container">
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Latest Stories</h2>
          <Link href="/blogs" className="btn btn-ghost">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="loading-page">
            <div className="spinner spinner-lg" />
            <p>Loading stories...</p>
          </div>
        ) : blogs.length > 0 ? (
          <div className="blog-grid">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h3 className="empty-state-title">No stories yet</h3>
            <p className="empty-state-description">
              Be the first to share your thoughts with the world.
            </p>
            {user && (
              <Link href="/blogs/create" className="btn btn-primary">
                Write Your First Blog
              </Link>
            )}
          </div>
        )}
      </section>

      {/* CTA Section */}
      {!user && (
        <section
          className="container"
          style={{
            marginTop: 'var(--space-3xl)',
            marginBottom: 'var(--space-2xl)',
          }}
        >
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: 'var(--space-3xl)',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              cursor: 'default',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2rem',
                fontWeight: 700,
                marginBottom: 'var(--space-md)',
              }}
            >
              Ready to share your story?
            </h2>
            <p
              style={{
                color: 'var(--color-text-tertiary)',
                maxWidth: '500px',
                margin: '0 auto var(--space-xl)',
                fontSize: '1.0625rem',
              }}
            >
              Join our community of writers and readers. Create your free account and start publishing today.
            </p>
            <Link href="/register" className="btn btn-primary btn-lg">
              Create Free Account
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
