'use client';

import React from 'react';
import Link from 'next/link';
import { Blog } from '@/lib/api';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getInitials(author: Blog['author']): string {
  if (author.first_name && author.last_name) {
    return `${author.first_name[0]}${author.last_name[0]}`.toUpperCase();
  }
  return author.username[0].toUpperCase();
}

interface BlogCardProps {
  blog: Blog;
  showActions?: boolean;
  onDelete?: (id: number) => void;
}

export default function BlogCard({ blog, showActions, onDelete }: BlogCardProps) {
  return (
    <article className="card blog-card animate-slide-up">
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="blog-card-header">
          {blog.category && (
            <span className="blog-card-category">{blog.category.name}</span>
          )}
          {showActions && (
            <span className={`blog-card-status ${blog.status}`}>
              {blog.status === 'draft' ? '📝 Draft' : '✅ Published'}
            </span>
          )}
        </div>

        <Link href={`/blogs/${blog.id}`} style={{ textDecoration: 'none' }}>
          <h2 className="blog-card-title">{blog.title}</h2>
        </Link>

        <p className="blog-card-excerpt">
          {blog.excerpt || blog.title}
        </p>

        {blog.tags_list && blog.tags_list.length > 0 && (
          <div className="tags" style={{ marginBottom: 'var(--space-md)' }}>
            {blog.tags_list.slice(0, 3).map((tag) => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
            {blog.tags_list.length > 3 && (
              <span className="tag">+{blog.tags_list.length - 3}</span>
            )}
          </div>
        )}

        <div className="blog-card-footer" style={{ marginTop: 'auto' }}>
          <div className="blog-card-author">
            <div className="blog-card-avatar">{getInitials(blog.author)}</div>
            <div>
              <div className="blog-card-author-name">
                {blog.author.first_name || blog.author.username}
              </div>
              <div className="blog-card-date">{formatDate(blog.created_at)}</div>
            </div>
          </div>

          <div className="blog-card-stats">
            <span className="blog-card-stat" title="Likes">
              ❤️ {blog.likes_count}
            </span>
            <span className="blog-card-stat" title="Comments">
              💬 {blog.comment_count}
            </span>
            <span className="blog-card-stat" title="Views">
              👁️ {blog.views_count}
            </span>
          </div>
        </div>

        {showActions && blog.is_owner && (
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-sm)',
              marginTop: 'var(--space-md)',
              paddingTop: 'var(--space-md)',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <Link href={`/blogs/${blog.id}/edit`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
              ✏️ Edit
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                onDelete?.(blog.id);
              }}
              className="btn btn-danger btn-sm"
              style={{ flex: 1 }}
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
