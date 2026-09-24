'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import api, { Blog, Category, PaginatedResponse } from '@/lib/api';
import BlogCard from '@/components/BlogCard';

function BlogsPageContent() {
  const searchParams = useSearchParams();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [ordering, setOrdering] = useState(searchParams.get('ordering') || '-created_at');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  // Fetch categories
  useEffect(() => {
    api.getCategories()
      .then(setCategories)
      .catch((err) => console.error('Failed to fetch categories:', err));
  }, []);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        ordering,
        page: currentPage.toString(),
      };
      if (search.trim()) params.search = search.trim();
      if (selectedCategory) params.category = selectedCategory;

      const data: PaginatedResponse<Blog> = await api.getBlogs(params);
      setBlogs(data?.results || []);
      setTotalCount(data?.count || 0);
      setHasNext(Boolean(data?.next));
      setHasPrev(Boolean(data?.previous));
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, ordering, currentPage]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBlogs();
  };

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory((prev) => (prev === slug ? '' : slug));
    setCurrentPage(1);
  };

  return (
    <div className="container animate-fade-in">
      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <h1 className="hero-title" style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>
          Explore Stories
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>
          Discover insightful perspectives, tutorials, and deep dives.
        </p>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search by title, content, author, or tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      {/* Categories & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
        <div className="filter-bar" style={{ marginBottom: 0 }}>
          <button
            type="button"
            className={`filter-chip ${selectedCategory === '' ? 'active' : ''}`}
            onClick={() => handleCategorySelect('')}
          >
            All Topics
          </button>
          {Array.isArray(categories) && categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`filter-chip ${selectedCategory === cat.slug ? 'active' : ''}`}
              onClick={() => handleCategorySelect(cat.slug)}
            >
              {cat.name} ({cat.blog_count})
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <label htmlFor="sort-select" style={{ fontSize: '0.875rem', color: 'var(--color-text-tertiary)' }}>
            Sort by:
          </label>
          <select
            id="sort-select"
            className="form-select"
            style={{ width: 'auto', padding: '0.4rem 2rem 0.4rem 0.8rem', fontSize: '0.85rem' }}
            value={ordering}
            onChange={(e) => {
              setOrdering(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="-created_at">Newest First</option>
            <option value="created_at">Oldest First</option>
            <option value="-likes_count">Most Liked</option>
            <option value="-views_count">Most Viewed</option>
            <option value="title">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Blog Cards Grid */}
      {loading ? (
        <div className="loading-page">
          <div className="spinner spinner-lg" />
          <p>Fetching articles...</p>
        </div>
      ) : blogs.length > 0 ? (
        <>
          <div className="blog-grid">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={!hasPrev || currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              ← Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {Math.max(1, Math.ceil(totalCount / 10))} ({totalCount} total)
            </span>
            <button
              className="pagination-btn"
              disabled={!hasNext}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h2 className="empty-state-title">No blogs found</h2>
          <p className="empty-state-description">
            We couldn&apos;t find any posts matching your criteria. Try adjusting your search or category filter.
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setSearch('');
              setSelectedCategory('');
              setOrdering('-created_at');
              setCurrentPage(1);
            }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default function BlogsPage() {
  return (
    <Suspense
      fallback={
        <div className="loading-page">
          <div className="spinner spinner-lg" />
          <p>Loading stories...</p>
        </div>
      }
    >
      <BlogsPageContent />
    </Suspense>
  );
}
