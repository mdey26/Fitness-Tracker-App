"""
URL configuration for fitness_tracker project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter

# API version prefix
API_VERSION = 'v1'

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # Authentication URLs
    path(f'api/{API_VERSION}/auth/', include('dj_rest_auth.urls')),
    path(f'api/{API_VERSION}/auth/registration/', include('dj_rest_auth.registration.urls')),
    path(f'api/{API_VERSION}/auth/accounts/', include('allauth.urls')),

    # App URLs
    path(f'api/{API_VERSION}/accounts/', include('accounts.urls')),
    path(f'api/{API_VERSION}/workouts/', include('workouts.urls')),
    path(f'api/{API_VERSION}/nutrition/', include('nutrition.urls')),
    path(f'api/{API_VERSION}/goals/', include('goals.urls')),
    path(f'api/{API_VERSION}/community/', include('community.urls')),
    path(f'api/{API_VERSION}/analytics/', include('analytics.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
