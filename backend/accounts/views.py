from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User

from .serializers import RegisterSerializer, UserSerializer, ChangePasswordSerializer


class RegisterView(generics.CreateAPIView):
    """
    API endpoint for user registration.
    POST /api/auth/register/
    """
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate tokens for immediate login after registration
        refresh = RefreshToken.for_user(user)

        return Response({
            'message': 'Registration successful!',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    """
    API endpoint for user login.
    POST /api/auth/login/
    Returns JWT access and refresh tokens along with user data.
    """
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            # Get the user to include in response
            from django.contrib.auth import authenticate
            user = authenticate(
                username=request.data.get('username'),
                password=request.data.get('password')
            )
            if user:
                response.data['user'] = UserSerializer(user).data
                response.data['message'] = 'Login successful!'
        return response


class LogoutView(APIView):
    """
    API endpoint for user logout.
    POST /api/auth/logout/
    Blacklists the refresh token.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response(
                {'message': 'Logout successful!'},
                status=status.HTTP_200_OK
            )
        except Exception:
            return Response(
                {'error': 'Invalid token.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    API endpoint to get/update current user profile.
    GET /api/auth/profile/
    PUT/PATCH /api/auth/profile/
    """
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.UpdateAPIView):
    """
    API endpoint for changing password.
    PUT /api/auth/change-password/
    """
    serializer_class = ChangePasswordSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response(
            {'message': 'Password changed successfully!'},
            status=status.HTTP_200_OK
        )
