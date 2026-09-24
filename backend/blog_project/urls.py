"""
URL configuration for blog_project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from django.http import JsonResponse

def health_check(request):
    return JsonResponse({'status': 'alive', 'message': 'Server is awake'}, status=200)

urlpatterns = [
    path('health/', health_check, name='health-check-root'),
    path('api/health/', health_check, name='health-check-api'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/blogs/', include('blogs.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
