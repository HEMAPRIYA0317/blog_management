from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    """Blog category model for organizing posts."""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Blog(models.Model):
    """Blog post model with full CRUD support."""
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('published', 'Published'),
    )

    title = models.CharField(max_length=255)
    content = models.TextField()
    excerpt = models.TextField(max_length=500, blank=True, help_text="Brief summary of the blog post")
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blogs')
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='blogs'
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='published')
    featured_image = models.ImageField(upload_to='blog_images/', null=True, blank=True)
    tags = models.CharField(max_length=500, blank=True, help_text="Comma-separated tags")
    likes_count = models.PositiveIntegerField(default=0)
    views_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def get_tags_list(self):
        """Returns tags as a list."""
        if self.tags:
            return [tag.strip() for tag in self.tags.split(',') if tag.strip()]
        return []


class Comment(models.Model):
    """Comment model for blog posts."""
    blog = models.ForeignKey(Blog, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Comment by {self.author.username} on {self.blog.title}"


class Like(models.Model):
    """Like model to track which users liked which blogs."""
    blog = models.ForeignKey(Blog, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('blog', 'user')

    def __str__(self):
        return f"{self.user.username} likes {self.blog.title}"
