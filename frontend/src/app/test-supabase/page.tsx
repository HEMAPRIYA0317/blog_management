import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function TestSupabasePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch todos and blogs from Supabase
  const { data: todos, error: todosError } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: blogs, error: blogsError } = await supabase
    .from('blogs')
    .select('*, categories(name)')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '800px', paddingBottom: 'var(--space-3xl)' }}>
      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <Link href="/" className="btn btn-ghost btn-sm" style={{ paddingLeft: 0 }}>
          ← Back to Home
        </Link>
        <h1 className="hero-title" style={{ fontSize: '2.5rem', marginTop: 'var(--space-sm)' }}>
          ⚡ Supabase Connection Test
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          This page tests the live connection to your Supabase project (<code>wkagmlwcbhzwohxmmeox</code>).
        </p>
      </div>

      {/* Todos Connection Test Card */}
      <div className="card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
          📋 Supabase Todos Table
        </h2>

        {todosError ? (
          <div className="alert alert-error">
            <span>⚠️</span> Error reading &apos;todos&apos; table: {todosError.message}
            <div style={{ fontSize: '0.8rem', marginTop: '0.25rem', color: 'var(--color-text-secondary)' }}>
              Make sure you have run the SQL script in your Supabase SQL Editor.
            </div>
          </div>
        ) : todos && todos.length > 0 ? (
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {todos.map((todo) => (
              <li
                key={todo.id}
                style={{
                  padding: 'var(--space-sm) var(--space-md)',
                  background: 'var(--color-bg-glass)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                }}
              >
                <span>{todo.is_complete ? '✅' : '⏳'}</span>
                <span style={{ textDecoration: todo.is_complete ? 'line-through' : 'none', color: todo.is_complete ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)' }}>
                  {todo.name}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: 'var(--color-text-tertiary)' }}>
            No todos found. Run the provided SQL migration in Supabase SQL editor to seed initial items.
          </p>
        )}
      </div>

      {/* Blogs Connection Test Card */}
      <div className="card" style={{ padding: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
          📚 Supabase Blogs Table
        </h2>

        {blogsError ? (
          <div className="alert alert-error">
            <span>⚠️</span> Error reading &apos;blogs&apos; table: {blogsError.message}
          </div>
        ) : blogs && blogs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {blogs.map((b) => (
              <div
                key={b.id}
                style={{
                  padding: 'var(--space-md)',
                  background: 'var(--color-bg-glass)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                  {b.title}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                  By {b.author_name} • Status: <span style={{ color: 'var(--color-success)' }}>{b.status}</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-tertiary)' }}>
                  {b.excerpt}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--color-text-tertiary)' }}>
            No blogs found yet in Supabase.
          </p>
        )}
      </div>
    </div>
  );
}
