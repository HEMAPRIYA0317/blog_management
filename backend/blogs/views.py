from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q

from .models import Blog, Category, Comment, Like
from .serializers import (
    BlogListSerializer, BlogDetailSerializer, BlogCreateUpdateSerializer,
    CategorySerializer, CommentSerializer
)
from .permissions import IsAuthorOrReadOnly, IsCommentAuthorOrReadOnly


class CategoryListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/blogs/categories/ - List all categories
    POST /api/blogs/categories/ - Create a new category (authenticated)
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    pagination_class = None


class BlogListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/blogs/ - List all published blogs with search/filter
    POST /api/blogs/ - Create a new blog (authenticated)
    """
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content', 'tags', 'author__username']
    ordering_fields = ['created_at', 'updated_at', 'likes_count', 'views_count', 'title']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BlogCreateUpdateSerializer
        return BlogListSerializer

    def get_queryset(self):
        queryset = Blog.objects.select_related('author', 'category').prefetch_related('comments', 'likes')

        # Show all blogs to their authors, only published to others
        if self.request.user.is_authenticated:
            queryset = queryset.filter(
                Q(status='published') | Q(author=self.request.user)
            )
        else:
            queryset = queryset.filter(status='published')

        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__slug=category)

        # Filter by author
        author = self.request.query_params.get('author')
        if author:
            queryset = queryset.filter(author__username=author)

        # Filter by tag
        tag = self.request.query_params.get('tag')
        if tag:
            queryset = queryset.filter(tags__icontains=tag)

        return queryset.distinct()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        blog = serializer.save(author=request.user)
        # Return the detail serializer for the created blog
        detail_serializer = BlogDetailSerializer(blog, context={'request': request})
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)


class BlogDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/blogs/<id>/ - Retrieve a blog post
    PUT    /api/blogs/<id>/ - Update a blog post (author only)
    DELETE /api/blogs/<id>/ - Delete a blog post (author only)
    """
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly)

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return BlogCreateUpdateSerializer
        return BlogDetailSerializer

    def get_queryset(self):
        queryset = Blog.objects.select_related('author', 'category').prefetch_related('comments', 'likes')
        if self.request.user.is_authenticated:
            return queryset.filter(
                Q(status='published') | Q(author=self.request.user)
            )
        return queryset.filter(status='published')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        blog = serializer.save()
        detail_serializer = BlogDetailSerializer(blog, context={'request': request})
        return Response(detail_serializer.data)


class MyBlogsView(generics.ListAPIView):
    """
    GET /api/blogs/my-blogs/ - List current user's blogs (including drafts)
    """
    serializer_class = BlogListSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Blog.objects.filter(author=self.request.user).select_related('author', 'category')


class BlogLikeToggleView(APIView):
    """
    POST /api/blogs/<id>/like/ - Toggle like on a blog post
    """
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            blog = Blog.objects.get(pk=pk)
        except Blog.DoesNotExist:
            return Response(
                {'error': 'Blog not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        like, created = Like.objects.get_or_create(blog=blog, user=request.user)
        if not created:
            # Unlike - remove the like
            like.delete()
            blog.likes_count = max(0, blog.likes_count - 1)
            blog.save(update_fields=['likes_count'])
            return Response({
                'message': 'Blog unliked.',
                'is_liked': False,
                'likes_count': blog.likes_count
            })
        else:
            # Like
            blog.likes_count += 1
            blog.save(update_fields=['likes_count'])
            return Response({
                'message': 'Blog liked!',
                'is_liked': True,
                'likes_count': blog.likes_count
            })


class CommentListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/blogs/<blog_id>/comments/ - List comments for a blog
    POST /api/blogs/<blog_id>/comments/ - Add a comment (authenticated)
    """
    serializer_class = CommentSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    pagination_class = None

    def get_queryset(self):
        return Comment.objects.filter(
            blog_id=self.kwargs['blog_id']
        ).select_related('author')

    def perform_create(self, serializer):
        serializer.save(
            author=self.request.user,
            blog_id=self.kwargs['blog_id']
        )


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    PUT    /api/blogs/comments/<id>/ - Update a comment (author only)
    DELETE /api/blogs/comments/<id>/ - Delete a comment (author only)
    """
    serializer_class = CommentSerializer
    permission_classes = (permissions.IsAuthenticated, IsCommentAuthorOrReadOnly)
    queryset = Comment.objects.all()
