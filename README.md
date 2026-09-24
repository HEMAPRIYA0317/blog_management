# ✦ BlogVerse — Full-Stack Blog Management Application

A full-stack, responsive Blog Application built with **Next.js (App Router, TypeScript)** on the frontend and **Django + Django REST Framework** on the backend, complete with JWT authentication, CRUD operations, permission controls, and interactive community features.

---

## 🌟 Key Features

### 🔐 Authentication & Authorization
- **User Registration**: Custom serializer with email uniqueness check and password validation.
- **JWT Authentication**: Access & Refresh token rotation with SimpleJWT (`/api/auth/login/`, `/api/auth/token/refresh/`).
- **Logout**: Secure token blacklisting (`/api/auth/logout/`).
- **Author Permissions**: Custom `IsAuthorOrReadOnly` permissions — users can only update or delete their own posts and comments.
- **Profile Management**: Update user profile information and change passwords.

### 📝 Blog Management (Full CRUD)
- **Create**: Write posts with title, excerpt, content, category, tags, and draft/published status.
- **Read**: Explore all published blogs with search, category filtering chips, and multiple sorting options.
- **Update**: Edit existing posts with pre-filled forms (restricted to author).
- **Delete**: Soft/hard delete with confirmation modal (restricted to author).
- **Drafts & Published**: Authors can save works in progress as drafts, only visible to themselves in their dashboard.

### 💡 Additional Features
- **Like / Unlike System**: Toggle likes with instant optimistic UI update.
- **Comments System**: Authenticated users can discuss and leave comments; comment authors can delete their own comments.
- **View Counter**: Automatically increments views when a blog post is viewed.
- **Author Dashboard**: Centralized dashboard showing author analytics (Total Stories, Published, Drafts, Total Views, Total Likes) with status filtering.
- **Category System**: Filter articles by Technology, Travel, Lifestyle, Science, and Design.
- **Responsive Dark Design**: Modern glassmorphism aesthetic with tailored gradient accents, micro-interactions, and mobile navigation.

---

## 🏗️ Architecture

```
blog_management/
├── backend/                  # Django REST Framework
│   ├── blog_project/         # Settings, URLs, WSGI/ASGI
│   ├── accounts/             # Auth views, serializers, JWT
│   ├── blogs/                # Blog, Category, Comment, Like models, views & permissions
│   ├── manage.py
│   ├── requirements.txt
│   └── seed_data.py          # Script with demo users, blogs & comments
│
├── frontend/                 # Next.js 15+ (App Router, TypeScript)
│   ├── src/
│   │   ├── app/              # Routes: /, /blogs, /blogs/[id], /blogs/create, /blogs/[id]/edit, /dashboard, /profile, /login, /register
│   │   ├── components/       # Navbar, Footer, BlogCard
│   │   ├── context/          # AuthContext with token refresh
│   │   └── lib/              # Centralized API service with TypeScript types
│   ├── package.json
│   └── .env.local
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

### 2. Backend Setup (Django)

```bash
# Navigate to project directory
cd c:\Users\Hema\Desktop\blog_management

# Activate the virtual environment
.\venv\Scripts\Activate.ps1

# Navigate to backend
cd backend

# Apply migrations
python manage.py migrate

# Seed database with sample data (creates alice & bob users and 5 blog posts)
Get-Content seed_data.py | python manage.py shell

# Start Django development server (runs on http://127.0.0.1:8000)
python manage.py runserver 8000
```

### 3. Frontend Setup (Next.js)

```bash
# In a new terminal, navigate to frontend
cd c:\Users\Hema\Desktop\blog_management\frontend

# Install dependencies (if not already installed)
npm install

# Start Next.js development server (runs on http://localhost:3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Credentials

| Username | Password | Role |
| :--- | :--- | :--- |
| **alice** | `SecurePass123!` | Author of 3 blogs & comments |
| **bob** | `SecurePass123!` | Author of 2 blogs & comments |

*You can also register a new account through the `/register` page.*

---

## 📡 REST API Reference

### Authentication (`/api/auth/`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register/` | Register new user | No |
| `POST` | `/api/auth/login/` | Obtain JWT token pair | No |
| `POST` | `/api/auth/token/refresh/` | Refresh access token | No |
| `POST` | `/api/auth/logout/` | Blacklist refresh token | Yes |
| `GET/PATCH` | `/api/auth/profile/` | View or update profile | Yes |
| `PUT` | `/api/auth/change-password/` | Change password | Yes |

### Blogs (`/api/blogs/`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/blogs/` | List published blogs (search/filter/order) | No |
| `POST` | `/api/blogs/` | Create a new blog | Yes |
| `GET` | `/api/blogs/<id>/` | View blog detail (increments views) | No |
| `PUT/PATCH` | `/api/blogs/<id>/` | Update blog | Yes (Author only) |
| `DELETE` | `/api/blogs/<id>/` | Delete blog | Yes (Author only) |
| `GET` | `/api/blogs/my-blogs/` | List current user's blogs (inc. drafts) | Yes |
| `POST` | `/api/blogs/<id>/like/` | Toggle like/unlike | Yes |
| `GET` | `/api/blogs/categories/` | List categories with blog count | No |
| `GET/POST`| `/api/blogs/<blog_id>/comments/` | List or create comments | GET: No / POST: Yes |
| `DELETE` | `/api/blogs/comments/<id>/` | Delete comment | Yes (Author only) |
