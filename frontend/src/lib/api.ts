const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

interface TokenPair {
  access: string;
  refresh: string;
}

class ApiService {
  private getTokens(): TokenPair | null {
    if (typeof window === 'undefined') return null;
    const access = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');
    if (access && refresh) return { access, refresh };
    return null;
  }

  private setTokens(tokens: TokenPair): void {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
  }

  private clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  private async refreshAccessToken(): Promise<string | null> {
    const tokens = this.getTokens();
    if (!tokens?.refresh) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: tokens.refresh }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens({ access: data.access, refresh: data.refresh || tokens.refresh });
        return data.access;
      }
    } catch {
      // Refresh failed
    }

    this.clearTokens();
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retry = true
  ): Promise<T> {
    const tokens = this.getTokens();
    const headers: Record<string, string> = {};

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (tokens?.access) {
      headers['Authorization'] = `Bearer ${tokens.access}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });

    // Token expired — try refresh
    if (response.status === 401 && retry && tokens?.refresh) {
      const newAccess = await this.refreshAccessToken();
      if (newAccess) {
        return this.request<T>(endpoint, options, false);
      }
      this.clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = this.extractErrorMessage(errorData);
      throw new Error(errorMessage || `Request failed with status ${response.status}`);
    }

    if (response.status === 204) return {} as T;
    return response.json();
  }

  private extractErrorMessage(errorData: Record<string, unknown>): string {
    if (typeof errorData === 'string') return errorData;
    if (errorData.detail) return String(errorData.detail);
    if (errorData.message) return String(errorData.message);
    if (errorData.error) return String(errorData.error);

    const messages: string[] = [];
    for (const [key, value] of Object.entries(errorData)) {
      if (Array.isArray(value)) {
        messages.push(`${key}: ${value.join(', ')}`);
      } else if (typeof value === 'string') {
        messages.push(`${key}: ${value}`);
      }
    }
    return messages.join('. ') || 'An error occurred';
  }

  // ─── Auth ────────────────────────────────────────

  async register(data: {
    username: string;
    email: string;
    password: string;
    password2: string;
    first_name?: string;
    last_name?: string;
  }) {
    const result = await this.request<{
      message: string;
      user: User;
      tokens: TokenPair;
    }>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setTokens(result.tokens);
    localStorage.setItem('user', JSON.stringify(result.user));
    return result;
  }

  async login(username: string, password: string) {
    const result = await this.request<{
      access: string;
      refresh: string;
      user: User;
      message: string;
    }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.setTokens({ access: result.access, refresh: result.refresh });
    localStorage.setItem('user', JSON.stringify(result.user));
    return result;
  }

  async logout() {
    const tokens = this.getTokens();
    try {
      if (tokens?.refresh) {
        await this.request('/auth/logout/', {
          method: 'POST',
          body: JSON.stringify({ refresh: tokens.refresh }),
        });
      }
    } finally {
      this.clearTokens();
    }
  }

  async getProfile() {
    return this.request<User>('/auth/profile/');
  }

  async updateProfile(data: Partial<User>) {
    return this.request<User>('/auth/profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async changePassword(oldPassword: string, newPassword: string) {
    return this.request<{ message: string }>('/auth/change-password/', {
      method: 'PUT',
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    });
  }

  // ─── Blogs ───────────────────────────────────────

  async getBlogs(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<PaginatedResponse<Blog>>(`/blogs/${query}`);
  }

  async getBlog(id: number) {
    return this.request<BlogDetail>(`/blogs/${id}/`);
  }

  async createBlog(data: FormData | Record<string, unknown>) {
    const isFormData = data instanceof FormData;
    return this.request<BlogDetail>('/blogs/', {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  async updateBlog(id: number, data: FormData | Record<string, unknown>) {
    const isFormData = data instanceof FormData;
    return this.request<BlogDetail>(`/blogs/${id}/`, {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  async deleteBlog(id: number) {
    return this.request<void>(`/blogs/${id}/`, { method: 'DELETE' });
  }

  async getMyBlogs() {
    return this.request<PaginatedResponse<Blog>>('/blogs/my-blogs/');
  }

  async toggleLike(id: number) {
    return this.request<{ message: string; is_liked: boolean; likes_count: number }>(
      `/blogs/${id}/like/`,
      { method: 'POST' }
    );
  }

  // ─── Comments ────────────────────────────────────

  async getComments(blogId: number): Promise<Comment[]> {
    const res = await this.request<Comment[] | { results: Comment[] }>(`/blogs/${blogId}/comments/`);
    if (Array.isArray(res)) return res;
    if (res && Array.isArray((res as { results: Comment[] }).results)) {
      return (res as { results: Comment[] }).results;
    }
    return [];
  }

  async createComment(blogId: number, content: string) {
    return this.request<Comment>(`/blogs/${blogId}/comments/`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async deleteComment(commentId: number) {
    return this.request<void>(`/blogs/comments/${commentId}/`, { method: 'DELETE' });
  }

  // ─── Categories ──────────────────────────────────

  async getCategories(): Promise<Category[]> {
    const res = await this.request<Category[] | { results: Category[] }>('/blogs/categories/');
    if (Array.isArray(res)) return res;
    if (res && Array.isArray((res as { results: Category[] }).results)) {
      return (res as { results: Category[] }).results;
    }
    return [];
  }
}

// ─── Types ─────────────────────────────────────────

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined?: string;
}

export interface Author {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  blog_count: number;
}

export interface Blog {
  id: number;
  title: string;
  excerpt: string;
  author: Author;
  category: Category | null;
  status: 'draft' | 'published';
  featured_image: string | null;
  tags: string;
  tags_list: string[];
  likes_count: number;
  views_count: number;
  comment_count: number;
  is_liked: boolean;
  is_owner: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogDetail extends Blog {
  content: string;
  comments: Comment[];
}

export interface Comment {
  id: number;
  content: string;
  author: Author;
  created_at: string;
  updated_at: string;
  is_owner: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const api = new ApiService();
export default api;
