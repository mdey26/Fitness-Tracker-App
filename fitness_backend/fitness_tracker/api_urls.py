from django.urls import path, include

urlpatterns = [
    path('auth/', include('accounts.api_urls')),
    path('workouts/', include('workouts.api_urls')), 
    path('nutrition/', include('nutrition.api_urls')),
    path('goals/', include('goals.api_urls')),
    path('community/', include('community.api_urls')),
] 
