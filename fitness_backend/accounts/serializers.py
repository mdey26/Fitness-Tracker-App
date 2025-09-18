from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, UserProfile, UserSettings

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'username', 'first_name', 'last_name', 'password', 'password_confirm')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def create(self, validated_data):
        validated_data.pop('password_confirm', None)
        password = validated_data.pop('password')
        # Create user
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(style={'input_type': 'password'})
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
            return attrs
        raise serializers.ValidationError('Email and password are required.')

class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField(source='get_full_name')
    bmi = serializers.ReadOnlyField(source='get_bmi')
    daily_calorie_goal = serializers.ReadOnlyField(source='get_daily_calorie_goal')
   

    class Meta:
        model = User
        fields = (
            'id', 'email', 'username', 'first_name', 'last_name', 'full_name',
            'age', 'height', 'weight', 'gender', 'activity_level', 'fitness_goal',
            'profile_picture', 'units_metric', 'timezone', 'profile_public',
            'show_achievements', 'bmi', 'daily_calorie_goal', 'created_at', 'last_active'
        )
        read_only_fields = ('id', 'email', 'created_at')

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'first_name', 'last_name', 'age', 'height', 'weight', 'gender',
            'activity_level', 'fitness_goal', 'profile_picture', 'units_metric',
            'timezone', 'profile_public', 'show_achievements'
        )

class ExtendedUserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')

class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')

class UserStatsSerializer(serializers.Serializer):
    """Serializer for user dashboard statistics"""
    total_workouts = serializers.IntegerField()
    total_calories_burned = serializers.IntegerField()
    current_streak = serializers.IntegerField()
    achievements_count = serializers.IntegerField()
    friends_count = serializers.IntegerField()
    active_goals = serializers.IntegerField()
    weekly_workout_minutes = serializers.IntegerField()
    monthly_calories = serializers.IntegerField()
