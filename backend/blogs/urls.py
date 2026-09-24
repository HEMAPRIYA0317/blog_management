from django.urls import path
from .views import (
    BlogListCreateView, BlogDetailView, MyBlogsView,
    BlogLikeToggleView, CategoryListCreateView,
    CommentListCreateView, CommentDetailView
)

urlpatterns = [
    path('', BlogListCreateView.as_view(), name='blog-list-create'),
    path('my-blogs/', MyBlogsView.as_view(), name='my-blogs'),
    path('categories/', CategoryListCreateView.as_view(), name='category-list'),
    path('<int:pk>/', BlogDetailView.as_view(), name='blog-detail'),
    path('<int:pk>/like/', BlogLikeToggleView.as_view(), name='blog-like'),
    path('<int:blog_id>/comments/', CommentListCreateView.as_view(), name='comment-list-create'),
    path('comments/<int:pk>/', CommentDetailView.as_view(), name='comment-detail'),
]
