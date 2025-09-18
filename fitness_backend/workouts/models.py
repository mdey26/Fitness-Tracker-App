from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class ExerciseCategory(models.Model):
    """Categories for exercises (Cardio, Strength, etc.)"""
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text="Font Awesome icon class")
    color = models.CharField(max_length=7, default="#007bff", help_text="Hex color code")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'exercise_categories'
        verbose_name_plural = 'Exercise Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Exercise(models.Model):
    """Exercise database with MET values and instructions"""
    name = models.CharField(max_length=100)
    category = models.ForeignKey(ExerciseCategory, on_delete=models.CASCADE, related_name='exercises')
    description = models.TextField(blank=True)
    instructions = models.TextField(blank=True)

    # MET (Metabolic Equivalent of Task) value for calorie calculation
    met_value = models.DecimalField(max_digits=4, decimal_places=2, validators=[MinValueValidator(0.1)])

    # Equipment needed
    equipment_needed = models.CharField(max_length=200, blank=True)

    # Difficulty level
    DIFFICULTY_LEVELS = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    difficulty_level = models.CharField(max_length=12, choices=DIFFICULTY_LEVELS, default='beginner')

    # Muscle groups targeted
    muscle_groups = models.CharField(max_length=200, blank=True, help_text="Comma-separated muscle groups")

    # Media
    image = models.ImageField(upload_to='exercise_images/', null=True, blank=True)
    video_url = models.URLField(blank=True, help_text="YouTube or other video URL")

    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'exercises'
        ordering = ['category', 'name']
        unique_together = ['name', 'category']

    def __str__(self):
        return f"{self.name} ({self.category.name})"

    def calculate_calories(self, weight_kg, duration_minutes):
        """Calculate calories burned based on MET value, weight, and duration"""
        return round((float(self.met_value) * weight_kg * duration_minutes) / 60, 0)


class WorkoutTemplate(models.Model):
    """Pre-defined workout templates"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    category = models.ForeignKey(ExerciseCategory, on_delete=models.CASCADE)

    # Template settings
    estimated_duration = models.PositiveIntegerField(help_text="Estimated duration in minutes")
    difficulty_level = models.CharField(max_length=12, choices=Exercise.DIFFICULTY_LEVELS, default='beginner')

    # Access control
    is_public = models.BooleanField(default=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='workout_templates')

    # Popularity metrics
    times_used = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'workout_templates'
        ordering = ['-times_used', 'name']

    def __str__(self):
        return self.name


class WorkoutTemplateExercise(models.Model):
    """Exercises within a workout template"""
    template = models.ForeignKey(WorkoutTemplate, on_delete=models.CASCADE, related_name='exercises')
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)

    # Exercise parameters
    sets = models.PositiveIntegerField(default=1)
    reps = models.PositiveIntegerField(null=True, blank=True)
    duration_seconds = models.PositiveIntegerField(null=True, blank=True)
    rest_seconds = models.PositiveIntegerField(default=60)
    weight_kg = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    distance_meters = models.PositiveIntegerField(null=True, blank=True)

    # Order in the workout
    order = models.PositiveIntegerField(default=0)

    # Notes for this exercise in the template
    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'workout_template_exercises'
        ordering = ['order']
        unique_together = ['template', 'exercise', 'order']

    def __str__(self):
        return f"{self.template.name} - {self.exercise.name}"


class Workout(models.Model):
    """User workout sessions"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='workouts')

    # Workout details
    name = models.CharField(max_length=100)
    date = models.DateField()
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)

    # Workout metadata
    template = models.ForeignKey(WorkoutTemplate, on_delete=models.SET_NULL, null=True, blank=True)
    category = models.ForeignKey(ExerciseCategory, on_delete=models.SET_NULL, null=True, blank=True)

    # Calculated fields
    total_duration_minutes = models.PositiveIntegerField(default=0)
    total_calories_burned = models.PositiveIntegerField(default=0)

    # Workout rating and notes
    rating = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    notes = models.TextField(blank=True)

    # Status
    STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='planned')

    # Social features
    is_public = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'workouts'
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['user', 'status']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.name} on {self.date}"

    def calculate_totals(self):
        """Calculate total duration and calories from exercises"""
        exercises = self.exercises.all()
        total_duration = sum(ex.duration_minutes or 0 for ex in exercises)
        total_calories = sum(ex.calories_burned or 0 for ex in exercises)

        self.total_duration_minutes = total_duration
        self.total_calories_burned = total_calories
        self.save()


class WorkoutExercise(models.Model):
    """Individual exercises within a workout session"""
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE, related_name='exercises')
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)

    # Exercise performance
    sets = models.PositiveIntegerField(default=1)
    reps = models.PositiveIntegerField(null=True, blank=True)
    duration_minutes = models.PositiveIntegerField(null=True, blank=True)
    weight_kg = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    distance_meters = models.PositiveIntegerField(null=True, blank=True)

    # Calculated calories
    calories_burned = models.PositiveIntegerField(default=0)

    # Order in workout
    order = models.PositiveIntegerField(default=0)

    # Performance notes
    notes = models.TextField(blank=True)
    personal_record = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'workout_exercises'
        ordering = ['order']

    def __str__(self):
        return f"{self.workout.name} - {self.exercise.name}"

    def save(self, *args, **kwargs):
        # Calculate calories if not set
        if not self.calories_burned and self.duration_minutes:
            user_weight = float(self.workout.user.weight or 70)  # Default 70kg
            self.calories_burned = self.exercise.calculate_calories(user_weight, self.duration_minutes)
        super().save(*args, **kwargs)


class WorkoutLike(models.Model):
    """Likes for public workouts"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'workout_likes'
        unique_together = ['user', 'workout']

    def __str__(self):
        return f"{self.user.email} likes {self.workout.name}"


class WorkoutComment(models.Model):
    """Comments on public workouts"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'workout_comments'
        ordering = ['-created_at']

    def __str__(self):
        return f"Comment by {self.user.email} on {self.workout.name}"

