from rest_framework import permissions


class IsAuthorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow authors of a blog to edit or delete it.
    Read permissions are allowed to any request (GET, HEAD, OPTIONS).
    Write permissions are only allowed to the author of the blog.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions for any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions only for the author
        return obj.author == request.user


class IsCommentAuthorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow authors of a comment to edit or delete it.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user
