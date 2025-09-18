from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid
from datetime import date

class Goal(models.Model):
    """User fitness and health goals"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='goals')

    # Goal details
    GOAL_TYPES = [
        ('weight_loss', 'Weight Loss'),
        ('weight_gain', 'Weight Gain'),
        ('muscle_gain', 'Muscle Gain'),
        ('strength', 'Strength Training'),
        ('endurance', 'Endurance'),
        ('steps', 'Daily Steps'),
        ('calories_burn', 'Calories Burned'),
        ('workout_frequency', 'Workout Frequency'),
        ('water_intake', 'Water Intake'),
        ('sleep', 'Sleep Duration'),
        ('custom', 'Custom Goal'),
    ]
    goal_type = models.CharField(max_length=20, choices=GOAL_TYPES)
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    # Target values
    target_value = models.DecimalField(max_digits=10, decimal_places=2)
    current_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    unit = models.CharField(max_length=20, help_text="kg, steps, calories, etc.")

    # Timeline
    start_date = models.DateField(default=date.today)
    target_date = models.DateField()

    # Status
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('paused', 'Paused'),
        ('cancelled', 'Cancelled'),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')

    # Progress tracking
    is_daily_goal = models.BooleanField(default=False)
    reminder_enabled = models.BooleanField(default=True)
    reminder_time = models.TimeField(null=True, blank=True)

    # Motivation
    reward_description = models.CharField(max_length=200, blank=True)
    motivation_quote = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'goals'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['user', 'goal_type']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.title}"

    @property
    def progress_percentage(self):
        """Calculate progress as percentage"""
        if self.target_value == 0:
            return 0
        progress = min((float(self.current_value) / float(self.target_value)) * 100, 100)
        return round(progress, 1)

    @property
    def days_remaining(self):
        """Calculate days remaining to target date"""
        remaining = (self.target_date - date.today()).days
        return max(remaining, 0)

    @property
    def is_overdue(self):
        """Check if goal is overdue"""
        return date.today() > self.target_date and self.status == 'active'


class GoalProgress(models.Model):
    """Daily progress tracking for goals"""
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name='progress_entries')
    date = models.DateField(default=date.today)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'goal_progress'
        unique_together = ['goal', 'date']
        ordering = ['-date']

    def __str__(self):
        return f"{self.goal.title} - {self.value} on {self.date}"


class Achievement(models.Model):
    """System-wide achievements and badges"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    icon = models.CharField(max_length=50, help_text="Font Awesome icon or emoji")

    # Achievement criteria
    ACHIEVEMENT_TYPES = [
        ('workout_streak', 'Workout Streak'),
        ('total_workouts', 'Total Workouts'),
        ('calories_burned', 'Calories Burned'),
        ('weight_loss', 'Weight Loss'),
        ('steps_milestone', 'Steps Milestone'),
        ('goal_completion', 'Goal Completion'),
        ('social_engagement', 'Social Engagement'),
        ('consistency', 'Consistency'),
        ('personal_record', 'Personal Record'),
        ('special_event', 'Special Event'),
    ]
    achievement_type = models.CharField(max_length=20, choices=ACHIEVEMENT_TYPES)

    # Criteria values
    required_value = models.PositiveIntegerField(help_text="Required value to unlock achievement")
    unit = models.CharField(max_length=20, blank=True)

    # Badge properties
    RARITY_LEVELS = [
        ('bronze', 'Bronze'),
        ('silver', 'Silver'),
        ('gold', 'Gold'),
        ('platinum', 'Platinum'),
        ('legendary', 'Legendary'),
    ]
    rarity = models.CharField(max_length=10, choices=RARITY_LEVELS, default='bronze')
    points = models.PositiveIntegerField(default=10, help_text="Points awarded for this achievement")

    # Visibility
    is_active = models.BooleanField(default=True)
    is_hidden = models.BooleanField(default=False, help_text="Hidden until unlocked")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'achievements'
        ordering = ['rarity', 'name']

    def __str__(self):
        return f"{self.name} ({self.rarity})"


class UserAchievement(models.Model):
    """User-earned achievements"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)

    earned_at = models.DateTimeField(auto_now_add=True)
    notified = models.BooleanField(default=False)

    # Context when earned
    earned_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    context_data = models.JSONField(blank=True, null=True, help_text="Additional context about achievement")

    class Meta:
        db_table = 'user_achievements'
        unique_together = ['user', 'achievement']
        ordering = ['-earned_at']

    def __str__(self):
        return f"{self.user.email} - {self.achievement.name}"

