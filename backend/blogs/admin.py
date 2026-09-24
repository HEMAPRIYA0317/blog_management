from django.contrib import admin
from .models import Blog, Category, Comment, Like


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_at')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'status', 'likes_count', 'views_count', 'created_at')
    list_filter = ('status', 'category', 'created_at')
    search_fields = ('title', 'content', 'author__username')
    date_hierarchy = 'created_at'


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('blog', 'author', 'created_at')
    list_filter = ('created_at',)


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ('blog', 'user', 'created_at')
