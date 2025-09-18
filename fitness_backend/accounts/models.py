
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class User(AbstractUser):
    """Custom User model for fitness tracker"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)

    # Profile fields
    age = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(13), MaxValueValidator(120)])
    height = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Height in cm")
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Weight in kg")

    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
        ('N', 'Prefer not to say'),
    ]
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)

    ACTIVITY_LEVELS = [
        ('sedentary', 'Sedentary (little or no exercise)'),
        ('lightly_active', 'Lightly active (light exercise/sports 1-3 days/week)'),
        ('moderately_active', 'Moderately active (moderate exercise/sports 3-5 days/week)'),
        ('very_active', 'Very active (hard exercise/sports 6-7 days a week)'),
        ('extra_active', 'Super active (very hard exercise/sports & physical job)'),
    ]
    activity_level = models.CharField(max_length=20, choices=ACTIVITY_LEVELS, default='moderately_active')

    FITNESS_GOALS = [
        ('weight_loss', 'Weight Loss'),
        ('weight_gain', 'Weight Gain'),
        ('muscle_gain', 'Muscle Gain'),
        ('maintenance', 'Maintenance'),
        ('endurance', 'Endurance'),
        ('strength', 'Strength'),
    ]
    fitness_goal = models.CharField(max_length=15, choices=FITNESS_GOALS, default='maintenance')

    # Profile picture
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)

    # Preferences
    units_metric = models.BooleanField(default=True, help_text="True for metric, False for imperial")
    timezone = models.CharField(max_length=50, default='Asia/Kolkata')

    # Privacy settings
    profile_public = models.BooleanField(default=True)
    show_achievements = models.BooleanField(default=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_active = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']

    def __str__(self):
        return self.email

    def get_full_name(self):
        """Return the full name for the user"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        else:
            return self.username or self.email

    def get_bmi(self):
        """Calculate BMI if height and weight are available"""
        if self.height and self.weight:
            height_m = float(self.height) / 100  # Convert cm to meters
            return round(float(self.weight) / (height_m ** 2), 1)
        return None

    def get_daily_calorie_goal(self):
        """Calculate daily calorie goal based on user profile"""
        if not all([self.age, self.weight, self.height, self.gender]):
            return 2000  # Default

        # Mifflin-St Jeor Equation
        weight_kg = float(self.weight)
        height_cm = float(self.height)
        age = self.age

        if self.gender == 'M':
            bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
        else:
            bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161

        # Activity level multipliers
        multipliers = {
            'sedentary': 1.2,
            'lightly_active': 1.375,
            'moderately_active': 1.55,
            'very_active': 1.725,
            'extra_active': 1.9,
        }

        daily_calories = bmr * multipliers.get(self.activity_level, 1.55)

        # Adjust based on fitness goal
        if self.fitness_goal == 'weight_loss':
            daily_calories -= 500  # 500 calorie deficit
        elif self.fitness_goal == 'weight_gain':
            daily_calories += 500  # 500 calorie surplus

        return round(daily_calories)


class UserProfile(models.Model):
    """Extended user profile information"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')

    # Additional health metrics
    body_fat_percentage = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    muscle_mass = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    resting_heart_rate = models.PositiveIntegerField(null=True, blank=True)

    # Medical information
    medical_conditions = models.TextField(blank=True, help_text="Any medical conditions or notes")
    medications = models.TextField(blank=True, help_text="Current medications")
    allergies = models.TextField(blank=True, help_text="Food allergies or intolerances")

    # Preferences
    preferred_workout_time = models.TimeField(null=True, blank=True)
    workout_days_per_week = models.PositiveIntegerField(default=3, validators=[MinValueValidator(1), MaxValueValidator(7)])

    # Emergency contact
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_profiles'

    def __str__(self):
        return f"Profile for {self.user.email}"


class UserSettings(models.Model):
    """User notification and privacy settings"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='settings')

    # Notification preferences
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    workout_reminders = models.BooleanField(default=True)
    goal_reminders = models.BooleanField(default=True)
    social_notifications = models.BooleanField(default=True)

    # Privacy settings
    share_workouts = models.BooleanField(default=True)
    share_progress = models.BooleanField(default=True)
    allow_friend_requests = models.BooleanField(default=True)
    show_in_leaderboards = models.BooleanField(default=True)

    # Data preferences
    data_retention_days = models.PositiveIntegerField(default=365, help_text="Days to retain user data")
    allow_data_analytics = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_settings'

    def __str__(self):
        return f"Settings for {self.user.email}"
