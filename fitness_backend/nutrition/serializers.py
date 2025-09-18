from rest_framework import serializers
from .models import (
    FoodCategory, Food, Recipe, RecipeIngredient, MealEntry, WaterIntake, NutritionGoal
)

class FoodCategorySerializer(serializers.ModelSerializer):
    foods_count = serializers.SerializerMethodField()

    class Meta:
        model = FoodCategory
        fields = '__all__'

    def get_foods_count(self, obj):
        return obj.food_set.count()

class FoodSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    nutrition_per_serving = serializers.SerializerMethodField()

    class Meta:
        model = Food
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at', 'updated_at')

    def get_nutrition_per_serving(self, obj):
        return obj.get_nutrition_per_serving()

class RecipeIngredientSerializer(serializers.ModelSerializer):
    food = FoodSerializer(read_only=True)
    food_id = serializers.UUIDField(write_only=True)
    food_name = serializers.CharField(source='food.name', read_only=True)

    class Meta:
        model = RecipeIngredient
        fields = '__all__'

class RecipeSerializer(serializers.ModelSerializer):
    ingredients = RecipeIngredientSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    nutrition_per_serving = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        fields = '__all__'
        read_only_fields = (
            'created_by', 'total_calories', 'total_protein', 'total_carbs', 'total_fats',
            'rating', 'times_made', 'created_at', 'updated_at'
        )

    def get_nutrition_per_serving(self, obj):
        return obj.get_nutrition_per_serving()

class RecipeCreateSerializer(serializers.ModelSerializer):
    ingredients = RecipeIngredientSerializer(many=True, write_only=True)

    class Meta:
        model = Recipe
        fields = (
            'name', 'description', 'servings', 'prep_time_minutes', 'cook_time_minutes',
            'instructions', 'is_public', 'image', 'ingredients'
        )

    def create(self, validated_data):
        ingredients_data = validated_data.pop('ingredients')
        validated_data['created_by'] = self.context['request'].user
        recipe = Recipe.objects.create(**validated_data)

        for ingredient_data in ingredients_data:
            ingredient_data['recipe'] = recipe
            RecipeIngredient.objects.create(**ingredient_data)

        recipe.calculate_nutrition()
        return recipe

class MealEntrySerializer(serializers.ModelSerializer):
    food_name = serializers.CharField(source='food.name', read_only=True)
    recipe_name = serializers.CharField(source='recipe.name', read_only=True)

    class Meta:
        model = MealEntry
        fields = '__all__'
        read_only_fields = ('user', 'calories', 'protein', 'carbs', 'fats', 'created_at')

class WaterIntakeSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.ReadOnlyField()
    glasses_consumed = serializers.ReadOnlyField()

    class Meta:
        model = WaterIntake
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')

class NutritionGoalSerializer(serializers.ModelSerializer):
    macro_goals = serializers.SerializerMethodField()

    class Meta:
        model = NutritionGoal
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')

    def get_macro_goals(self, obj):
        return obj.get_macro_goals()

class DailyNutritionSummarySerializer(serializers.Serializer):
    """Serializer for daily nutrition summary"""
    date = serializers.DateField()
    total_calories = serializers.DecimalField(max_digits=8, decimal_places=2)
    total_protein = serializers.DecimalField(max_digits=8, decimal_places=2)
    total_carbs = serializers.DecimalField(max_digits=8, decimal_places=2)
    total_fats = serializers.DecimalField(max_digits=8, decimal_places=2)
    calorie_goal = serializers.IntegerField()
    protein_goal = serializers.IntegerField()
    carbs_goal = serializers.IntegerField()
    fats_goal = serializers.IntegerField()
    water_intake = serializers.IntegerField()
    water_goal = serializers.IntegerField()
    meals_by_type = serializers.DictField()
