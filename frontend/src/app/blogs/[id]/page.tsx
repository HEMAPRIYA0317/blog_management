'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api, { BlogDetail, Comment } from '@/lib/api';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Simple markdown/text formatter for rich content rendering
function renderContent(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={key++}>
            <code>{codeBuffer.join('\n')}</code>
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    if (line.startsWith('## ')) {
      elements.push(<h2 key={key++}>{line.replace('## ', '')}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={key++}>{line.replace('### ', '')}</h3>);
    } else if (line.startsWith('> ')) {
      elements.push(<blockquote key={key++}>{line.replace('> ', '')}</blockquote>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(<li key={key++}>{line.substring(2)}</li>);
    } else if (line.trim() === '') {
      // Empty line spacing
      elements.push(<div key={key++} style={{ height: '0.75rem' }} />);
    } else {
      elements.push(<p key={key++}>{line}</p>);
    }
  }

  if (inCodeBlock && codeBuffer.length > 0) {
    elements.push(
      <pre key={key++}>
        <code>{codeBuffer.join('\n')}</code>
      </pre>
    );
  }

  return elements;
}

export default function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const blogId = Number(resolvedParams.id);
  const router = useRouter();
  const { user } = useAuth();

  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchBlogAndComments = async () => {
      try {
        setLoading(true);
        const data = await api.getBlog(blogId);
        setBlog(data);
        setLiked(data.is_liked);
        setLikesCount(data.likes_count);
        setComments(data.comments || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load blog.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogAndComments();
  }, [blogId]);

  const handleLike = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (isLiking) return;

    setIsLiking(true);
    // Optimistic update
    const prevLiked = liked;
    const prevCount = likesCount;
    setLiked(!prevLiked);
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const res = await api.toggleLike(blogId);
      setLiked(res.is_liked);
      setLikesCount(res.likes_count);
    } catch {
      // Revert if error
      setLiked(prevLiked);
      setLikesCount(prevCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setCommentSubmitting(true);
    try {
      const addedComment = await api.createComment(blogId, newComment.trim());
      setComments((prev) => [addedComment, ...prev]);
      setNewComment('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to post comment.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await api.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete comment.');
    }
  };

  const handleDeleteBlog = async () => {
    setDeleting(true);
    try {
      await api.deleteBlog(blogId);
      router.push('/dashboard');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete blog.');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner spinner-lg" />
        <p>Loading blog post...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="container empty-state">
        <div className="empty-state-icon">⚠️</div>
        <h2 className="empty-state-title">Post Not Found</h2>
        <p className="empty-state-description">{error || 'This blog post does not exist or has been removed.'}</p>
        <Link href="/blogs" className="btn btn-primary">
          Back to Explore
        </Link>
      </div>
    );
  }

  const isOwner = user && (blog.is_owner || user.username === blog.author.username);

  return (
    <article className="container animate-fade-in" style={{ paddingBottom: 'var(--space-3xl)' }}>
      <div className="blog-detail">
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <Link href="/blogs" className="btn btn-ghost btn-sm" style={{ paddingLeft: 0 }}>
            ← Back to all posts
          </Link>
        </div>

        {/* Header */}
        <header className="blog-detail-header">
          {blog.category && (
            <span className="blog-card-category" style={{ marginBottom: 'var(--space-md)', display: 'inline-block' }}>
              {blog.category.name}
            </span>
          )}
          <h1 className="blog-detail-title">{blog.title}</h1>

          <div className="blog-detail-meta">
            <div className="blog-detail-meta-item">
              <span>✍️</span>
              <strong>{blog.author.first_name ? `${blog.author.first_name} ${blog.author.last_name || ''}` : blog.author.username}</strong>
            </div>
            <div className="blog-detail-meta-item">
              <span>📅</span>
              <span>Published: {formatDate(blog.created_at)}</span>
            </div>
            {blog.updated_at && blog.updated_at !== blog.created_at && (
              <div className="blog-detail-meta-item">
                <span>🔄</span>
                <span>Updated: {formatDate(blog.updated_at)}</span>
              </div>
            )}
            <div className="blog-detail-meta-item">
              <span>👁️</span>
              <span>{blog.views_count} views</span>
            </div>
          </div>
        </header>

        {/* Tags */}
        {blog.tags_list && blog.tags_list.length > 0 && (
          <div className="tags" style={{ justifyContent: 'center', marginBottom: 'var(--space-2xl)' }}>
            {blog.tags_list.map((tag) => (
              <Link key={tag} href={`/blogs?search=${encodeURIComponent(tag)}`} className="tag">
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className="blog-detail-content">
          {renderContent(blog.content)}
        </div>

        {/* Action bar: Likes, Views, Edit/Delete for author */}
        <div className="blog-detail-actions">
          <div className="blog-detail-actions-left">
            <button
              onClick={handleLike}
              className={`like-btn ${liked ? 'liked' : ''}`}
              disabled={isLiking}
            >
              <span>{liked ? '❤️' : '🤍'}</span>
              <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
            </button>
            <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>
              💬 {comments.length} Comments
            </span>
          </div>

          <div className="blog-detail-actions-right">
            {isOwner && (
              <>
                <Link href={`/blogs/${blog.id}/edit`} className="btn btn-secondary btn-sm">
                  ✏️ Edit Post
                </Link>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="btn btn-danger btn-sm"
                >
                  🗑️ Delete Post
                </button>
              </>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <section className="comments-section">
          <h2 className="comments-title">Discussion ({comments.length})</h2>

          {/* Add comment */}
          {user ? (
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <div className="form-group">
                <label className="form-label" htmlFor="comment-text">
                  Leave a thought as <strong>{user.username}</strong>
                </label>
                <textarea
                  id="comment-text"
                  className="form-textarea"
                  rows={3}
                  placeholder="Share your perspective, feedback or questions..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={commentSubmitting || !newComment.trim()}
              >
                {commentSubmitting ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          ) : (
            <div
              className="card"
              style={{
                padding: 'var(--space-lg)',
                marginBottom: 'var(--space-xl)',
                textAlign: 'center',
                background: 'var(--color-bg-tertiary)',
              }}
            >
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
                Want to join the conversation? Sign in to leave a comment.
              </p>
              <Link href="/login" className="btn btn-primary btn-sm">
                Sign In to Comment
              </Link>
            </div>
          )}

          {/* Comments List */}
          {comments.length > 0 ? (
            <div>
              {comments.map((comment) => (
                <div key={comment.id} className="comment">
                  <div className="comment-header">
                    <div className="comment-author">
                      <div
                        className="blog-card-avatar"
                        style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}
                      >
                        {comment.author.username[0].toUpperCase()}
                      </div>
                      <span className="comment-author-name">
                        {comment.author.first_name
                          ? `${comment.author.first_name} ${comment.author.last_name || ''}`
                          : comment.author.username}
                      </span>
                      <span className="comment-date">
                        • {formatDate(comment.created_at)} at {formatTime(comment.created_at)}
                      </span>
                    </div>

                    {user && (comment.is_owner || user.username === comment.author.username) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--color-error)', padding: '0.2rem 0.5rem' }}
                        title="Delete comment"
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                  <p className="comment-content">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--color-text-tertiary)' }}>
              No comments yet. Be the first to share your thoughts!
            </div>
          )}
        </section>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Delete this blog post?</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>
              Are you sure you want to delete &ldquo;<strong>{blog.title}</strong>&rdquo;? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteBlog}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
