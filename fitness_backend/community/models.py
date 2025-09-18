from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid
from datetime import date, timedelta

class Friendship(models.Model):
    """User friendships/connections"""
    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='friend_requests_sent')
    addressee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='friend_requests_received')

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('blocked', 'Blocked'),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'friendships'
        unique_together = ['requester', 'addressee']

    def __str__(self):
        return f"{self.requester.email} -> {self.addressee.email} ({self.status})"


class Challenge(models.Model):
    """Fitness challenges and competitions"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=100)
    description = models.TextField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_challenges')

    # Challenge type and metrics
    CHALLENGE_TYPES = [
        ('steps', 'Daily Steps'),
        ('distance', 'Total Distance'),
        ('calories', 'Calories Burned'),
        ('workouts', 'Workout Count'),
        ('weight_loss', 'Weight Loss'),
        ('consistency', 'Workout Consistency'),
        ('time_based', 'Time-Based Exercise'),
        ('custom', 'Custom Challenge'),
    ]
    challenge_type = models.CharField(max_length=15, choices=CHALLENGE_TYPES)

    # Target and rules
    target_value = models.DecimalField(max_digits=10, decimal_places=2)
    target_unit = models.CharField(max_length=20)
    rules = models.TextField(blank=True)

    # Timeline
    start_date = models.DateField()
    end_date = models.DateField()
    registration_deadline = models.DateField(null=True, blank=True)

    # Entry and rewards
    entry_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0, help_text="Entry fee in currency")
    is_free = models.BooleanField(default=True)
    prize_description = models.TextField(blank=True)
    max_participants = models.PositiveIntegerField(null=True, blank=True)

    # Challenge settings
    is_public = models.BooleanField(default=True)
    requires_approval = models.BooleanField(default=False)
    is_team_challenge = models.BooleanField(default=False)
    allow_late_join = models.BooleanField(default=False)

    # Status
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('open_registration', 'Open for Registration'),
        ('registration_closed', 'Registration Closed'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')

    # Media and promotion
    image = models.ImageField(upload_to='challenge_images/', null=True, blank=True)
    featured = models.BooleanField(default=False)

    # Analytics
    total_participants = models.PositiveIntegerField(default=0)
    total_prize_pool = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'challenges'
        ordering = ['-featured', '-created_at']
        indexes = [
            models.Index(fields=['status', 'start_date']),
            models.Index(fields=['challenge_type']),
        ]

    def __str__(self):
        return self.title

    @property
    def is_registration_open(self):
        """Check if registration is still open"""
        today = date.today()
        if self.registration_deadline:
            return today <= self.registration_deadline and self.status == 'open_registration'
        return today < self.start_date and self.status == 'open_registration'

    @property
    def days_remaining(self):
        """Days remaining in challenge"""
        if self.status == 'active':
            return max((self.end_date - date.today()).days, 0)
        return 0

    @property
    def duration_days(self):
        """Total duration of challenge"""
        return (self.end_date - self.start_date).days + 1


class ChallengeParticipant(models.Model):
    """Users participating in challenges"""
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='challenge_participations')

    # Registration info
    joined_at = models.DateTimeField(auto_now_add=True)
    payment_status = models.CharField(max_length=20, default='pending', choices=[
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('free', 'Free'),
        ('refunded', 'Refunded'),
    ])

    # Performance tracking
    current_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    target_reached = models.BooleanField(default=False)
    completion_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    # Rankings
    current_rank = models.PositiveIntegerField(null=True, blank=True)
    final_rank = models.PositiveIntegerField(null=True, blank=True)

    # Status
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('dropped_out', 'Dropped Out'),
        ('disqualified', 'Disqualified'),
    ]
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='active')

    # Notifications
    notifications_enabled = models.BooleanField(default=True)

    class Meta:
        db_table = 'challenge_participants'
        unique_together = ['challenge', 'user']
        ordering = ['current_rank', '-current_value']

    def __str__(self):
        return f"{self.user.email} in {self.challenge.title}"


class ChallengeProgress(models.Model):
    """Daily progress tracking for challenge participants"""
    participant = models.ForeignKey(ChallengeParticipant, on_delete=models.CASCADE, related_name='progress_entries')
    date = models.DateField()
    daily_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    cumulative_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # Verification
    verified = models.BooleanField(default=False)
    proof_image = models.ImageField(upload_to='challenge_proof/', null=True, blank=True)
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'challenge_progress'
        unique_together = ['participant', 'date']
        ordering = ['-date']

    def __str__(self):
        return f"{self.participant.user.email} - {self.daily_value} on {self.date}"


class Leaderboard(models.Model):
    """Leaderboards for different metrics and time periods"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    # Leaderboard type
    LEADERBOARD_TYPES = [
        ('global_steps', 'Global Steps'),
        ('global_calories', 'Global Calories Burned'),
        ('global_workouts', 'Global Workout Count'),
        ('friends_steps', 'Friends Steps'),
        ('friends_calories', 'Friends Calories'),
        ('challenge_specific', 'Challenge Specific'),
        ('weekly_active', 'Weekly Most Active'),
        ('monthly_consistent', 'Monthly Most Consistent'),
    ]
    leaderboard_type = models.CharField(max_length=20, choices=LEADERBOARD_TYPES)

    # Time period
    TIME_PERIODS = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('all_time', 'All Time'),
    ]
    time_period = models.CharField(max_length=10, choices=TIME_PERIODS)

    # Settings
    is_active = models.BooleanField(default=True)
    max_entries = models.PositiveIntegerField(default=100)

    # Associated challenge (if challenge-specific)
    challenge = models.OneToOneField(Challenge, on_delete=models.CASCADE, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'leaderboards'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.time_period})"


class LeaderboardEntry(models.Model):
    """Individual entries in leaderboards"""
    leaderboard = models.ForeignKey(Leaderboard, on_delete=models.CASCADE, related_name='entries')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    # Ranking
    rank = models.PositiveIntegerField()
    score = models.DecimalField(max_digits=10, decimal_places=2)

    # Period this entry represents
    period_start = models.DateField()
    period_end = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'leaderboard_entries'
        unique_together = ['leaderboard', 'user', 'period_start']
        ordering = ['rank']

    def __str__(self):
        return f"#{self.rank} {self.user.email} - {self.score}"


class SocialPost(models.Model):
    """Social posts and activity feed"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='social_posts')

    # Post content
    content = models.TextField(max_length=500)
    image = models.ImageField(upload_to='social_posts/', null=True, blank=True)

    # Post type
    POST_TYPES = [
        ('workout', 'Workout Achievement'),
        ('goal', 'Goal Achievement'),
        ('challenge', 'Challenge Update'),
        ('general', 'General Post'),
        ('milestone', 'Milestone Reached'),
    ]
    post_type = models.CharField(max_length=10, choices=POST_TYPES, default='general')

    # Associated objects
    workout_id = models.UUIDField(null=True, blank=True)
    goal_id = models.UUIDField(null=True, blank=True)
    challenge_id = models.UUIDField(null=True, blank=True)

    # Engagement
    likes_count = models.PositiveIntegerField(default=0)
    comments_count = models.PositiveIntegerField(default=0)

    # Privacy
    is_public = models.BooleanField(default=True)
    friends_only = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'social_posts'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.post_type} post"


class PostLike(models.Model):
    """Likes on social posts"""
    post = models.ForeignKey(SocialPost, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'post_likes'
        unique_together = ['post', 'user']

    def __str__(self):
        return f"{self.user.email} likes post {self.post.id}"


class PostComment(models.Model):
    """Comments on social posts"""
    post = models.ForeignKey(SocialPost, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField(max_length=300)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'post_comments'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} commented on post {self.post.id}"
