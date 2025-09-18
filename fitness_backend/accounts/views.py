from django.shortcuts import render
from rest_framework import generics, status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.db.models import Count, Sum, Q
from datetime import date, timedelta
from .models import User, UserProfile, UserSettings
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer,
    UserProfileUpdateSerializer, ExtendedUserProfileSerializer, UserSettingsSerializer,
    UserStatsSerializer
)

class UserRegistrationView(generics.CreateAPIView):
    """User registration endpoint"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Create authentication token
        token, created = Token.objects.get_or_create(user=user)

        # Return user data with token
        user_serializer = UserProfileSerializer(user)
        return Response({
            'user': user_serializer.data,
            'token': token.key,
            'message': 'Registration successful'
        }, status=status.HTTP_201_CREATED)

class UserLoginView(generics.GenericAPIView):
    """User login endpoint"""
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        # Update last active
        user.last_active = timezone.now()
        user.save(update_fields=['last_active'])

        # Get or create token
        token, created = Token.objects.get_or_create(user=user)

        # Return user data with token
        user_serializer = UserProfileSerializer(user)
        return Response({
            'user': user_serializer.data,
            'token': token.key,
            'message': 'Login successful'
        })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """User logout endpoint"""
    try:
        # Delete the user's token
        request.user.auth_token.delete()
        return Response({'message': 'Logged out successfully'})
    except Token.DoesNotExist:
        return Response({'message': 'Already logged out'})

class UserProfileViewSet(viewsets.ModelViewSet):
    """User profile management"""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return UserProfileUpdateSerializer
        return UserProfileSerializer

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get user dashboard statistics"""
        user = request.user
        today = date.today()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)

        # Calculate statistics
        from workouts.models import Workout
        from goals.models import Goal
        from community.models import Friendship

        stats = {
            'total_workouts': user.workouts.filter(status='completed').count(),
            'total_calories_burned': user.workouts.filter(status='completed').aggregate(
                total=Sum('total_calories_burned')
            )['total'] or 0,
            'current_streak': self._calculate_workout_streak(user),
            'achievements_count': user.achievements.count(),
            'friends_count': Friendship.objects.filter(
                Q(requester=user) | Q(addressee=user),
                status='accepted'
            ).count(),
            'active_goals': user.goals.filter(status='active').count(),
            'weekly_workout_minutes': user.workouts.filter(
                date__gte=week_ago,
                status='completed'
            ).aggregate(total=Sum('total_duration_minutes'))['total'] or 0,
            'monthly_calories': user.workouts.filter(
                date__gte=month_ago,
                status='completed'
            ).aggregate(total=Sum('total_calories_burned'))['total'] or 0,
        }

        serializer = UserStatsSerializer(stats)
        return Response(serializer.data)

    def _calculate_workout_streak(self, user):
        """Calculate current workout streak"""
        from workouts.models import Workout

        current_date = date.today()
        streak = 0

        while True:
            if user.workouts.filter(date=current_date, status='completed').exists():
                streak += 1
                current_date -= timedelta(days=1)
            else:
                break

        return streak

class ExtendedUserProfileView(generics.RetrieveUpdateAPIView):
    """Extended user profile management"""
    serializer_class = ExtendedUserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

class UserSettingsView(generics.RetrieveUpdateAPIView):
    """User settings management"""
    serializer_class = UserSettingsSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        settings, created = UserSettings.objects.get_or_create(user=self.request.user)
        return settings

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change user password"""
    from django.contrib.auth import update_session_auth_hash

    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')

    if not all([current_password, new_password, confirm_password]):
        return Response({
            'error': 'All fields are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    if new_password != confirm_password:
        return Response({
            'error': 'New passwords do not match'
        }, status=status.HTTP_400_BAD_REQUEST)

    if not request.user.check_password(current_password):
        return Response({
            'error': 'Current password is incorrect'
        }, status=status.HTTP_400_BAD_REQUEST)

    if len(new_password) < 8:
        return Response({
            'error': 'Password must be at least 8 characters long'
        }, status=status.HTTP_400_BAD_REQUEST)

    request.user.set_password(new_password)
    request.user.save()

    # Update session
    update_session_auth_hash(request, request.user)

    return Response({'message': 'Password changed successfully'})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    """Delete user account"""
    password = request.data.get('password')

    if not password:
        return Response({
            'error': 'Password is required to delete account'
        }, status=status.HTTP_400_BAD_REQUEST)

    if not request.user.check_password(password):
        return Response({
            'error': 'Incorrect password'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Delete user account
    request.user.delete()

    return Response({'message': 'Account deleted successfully'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users(request):
    """Search users for adding friends"""
    query = request.GET.get('q', '').strip()

    if len(query) < 2:
        return Response({
            'error': 'Search query must be at least 2 characters'
        }, status=status.HTTP_400_BAD_REQUEST)

    users = User.objects.filter(
        Q(email__icontains=query) | 
        Q(first_name__icontains=query) | 
        Q(last_name__icontains=query) |
        Q(username__icontains=query),
        profile_public=True
    ).exclude(id=request.user.id)[:20]

    serializer = UserProfileSerializer(users, many=True)
    return Response(serializer.data)
