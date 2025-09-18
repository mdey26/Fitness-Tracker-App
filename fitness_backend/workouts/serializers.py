from rest_framework import serializers
from .models import (
    ExerciseCategory, Exercise, WorkoutTemplate, WorkoutTemplateExercise,
    Workout, WorkoutExercise, WorkoutLike, WorkoutComment
)

class ExerciseCategorySerializer(serializers.ModelSerializer):
    exercises_count = serializers.SerializerMethodField()

    class Meta:
        model = ExerciseCategory
        fields = '__all__'

    def get_exercises_count(self, obj):
        return obj.exercises.count()

class ExerciseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Exercise
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at')

class WorkoutTemplateExerciseSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer(read_only=True)
    exercise_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = WorkoutTemplateExercise
        fields = '__all__'

class WorkoutTemplateSerializer(serializers.ModelSerializer):
    exercises = WorkoutTemplateExerciseSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = WorkoutTemplate
        fields = '__all__'
        read_only_fields = ('created_by', 'times_used', 'average_rating', 'created_at', 'updated_at')

class WorkoutExerciseSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer(read_only=True)
    exercise_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = WorkoutExercise
        fields = '__all__'

class WorkoutSerializer(serializers.ModelSerializer):
    exercises = WorkoutExerciseSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    template_name = serializers.CharField(source='template.name', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Workout
        fields = '__all__'
        read_only_fields = ('user', 'total_duration_minutes', 'total_calories_burned', 'created_at', 'updated_at')

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False

class WorkoutCreateSerializer(serializers.ModelSerializer):
    exercises = WorkoutExerciseSerializer(many=True, write_only=True, required=False)

    class Meta:
        model = Workout
        fields = (
            'name', 'date', 'start_time', 'end_time', 'template', 'category',
            'notes', 'rating', 'status', 'is_public', 'exercises'
        )

    def create(self, validated_data):
        exercises_data = validated_data.pop('exercises', [])
        validated_data['user'] = self.context['request'].user
        workout = Workout.objects.create(**validated_data)

        for exercise_data in exercises_data:
            exercise_data['workout'] = workout
            WorkoutExercise.objects.create(**exercise_data)

        workout.calculate_totals()
        return workout

class WorkoutLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutLike
        fields = '__all__'
        read_only_fields = ('user', 'created_at')

class WorkoutCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_profile_picture = serializers.ImageField(source='user.profile_picture', read_only=True)

    class Meta:
        model = WorkoutComment
        fields = '__all__'
        read_only_fields = ('user', 'created_at')
