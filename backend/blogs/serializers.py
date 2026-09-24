from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Blog, Category, Comment, Like


class AuthorSerializer(serializers.ModelSerializer):
    """Lightweight serializer for blog author info."""
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name')


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for blog categories."""
    blog_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'description', 'blog_count')

    def get_blog_count(self, obj):
        return obj.blogs.filter(status='published').count()


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for blog comments."""
    author = AuthorSerializer(read_only=True)
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ('id', 'content', 'author', 'created_at', 'updated_at', 'is_owner')
        read_only_fields = ('id', 'author', 'created_at', 'updated_at')

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.author == request.user
        return False


class BlogListSerializer(serializers.ModelSerializer):
    """Serializer for blog listing (lightweight, no full content)."""
    author = AuthorSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    comment_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    tags_list = serializers.SerializerMethodField()

    class Meta:
        model = Blog
        fields = (
            'id', 'title', 'excerpt', 'author', 'category',
            'status', 'featured_image', 'tags', 'tags_list',
            'likes_count', 'views_count', 'comment_count',
            'is_liked', 'is_owner', 'created_at', 'updated_at'
        )

    def get_comment_count(self, obj):
        return obj.comments.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.author == request.user
        return False

    def get_tags_list(self, obj):
        return obj.get_tags_list()


class BlogDetailSerializer(serializers.ModelSerializer):
    """Full serializer for blog detail view (includes content and comments)."""
    author = AuthorSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True,
        required=False,
        allow_null=True
    )
    comments = CommentSerializer(many=True, read_only=True)
    comment_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    tags_list = serializers.SerializerMethodField()

    class Meta:
        model = Blog
        fields = (
            'id', 'title', 'content', 'excerpt', 'author',
            'category', 'category_id', 'status', 'featured_image',
            'tags', 'tags_list', 'likes_count', 'views_count',
            'comments', 'comment_count', 'is_liked', 'is_owner',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'author', 'likes_count', 'views_count', 'created_at', 'updated_at')

    def get_comment_count(self, obj):
        return obj.comments.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.author == request.user
        return False

    def get_tags_list(self, obj):
        return obj.get_tags_list()

    def validate_title(self, value):
        if len(value.strip()) < 5:
            raise serializers.ValidationError("Title must be at least 5 characters long.")
        return value.strip()

    def validate_content(self, value):
        if len(value.strip()) < 20:
            raise serializers.ValidationError("Content must be at least 20 characters long.")
        return value.strip()


class BlogCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating blog posts."""
    class Meta:
        model = Blog
        fields = ('title', 'content', 'excerpt', 'category', 'status', 'featured_image', 'tags')

    def validate_title(self, value):
        if len(value.strip()) < 5:
            raise serializers.ValidationError("Title must be at least 5 characters long.")
        return value.strip()

    def validate_content(self, value):
        if len(value.strip()) < 20:
            raise serializers.ValidationError("Content must be at least 20 characters long.")
        return value.strip()
