from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
import uuid

class FoodCategory(models.Model):
    """Categories for foods (Protein, Carbs, etc.)"""
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default="#28a745", help_text="Hex color code")

    class Meta:
        db_table = 'food_categories'
        verbose_name_plural = 'Food Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Food(models.Model):
    """Food database with nutritional information"""
    name = models.CharField(max_length=100)
    category = models.ForeignKey(FoodCategory, on_delete=models.SET_NULL, null=True, blank=True)
    brand = models.CharField(max_length=100, blank=True)

    # Nutritional information per 100g
    calories_per_100g = models.DecimalField(max_digits=6, decimal_places=2, validators=[MinValueValidator(0)])
    protein_per_100g = models.DecimalField(max_digits=6, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    carbs_per_100g = models.DecimalField(max_digits=6, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    fats_per_100g = models.DecimalField(max_digits=6, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    fiber_per_100g = models.DecimalField(max_digits=6, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    sugar_per_100g = models.DecimalField(max_digits=6, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    sodium_per_100g = models.DecimalField(max_digits=8, decimal_places=2, default=0, validators=[MinValueValidator(0)], help_text="in mg")

    # Additional nutrients
    calcium_per_100g = models.DecimalField(max_digits=8, decimal_places=2, default=0, validators=[MinValueValidator(0)], help_text="in mg")
    iron_per_100g = models.DecimalField(max_digits=8, decimal_places=2, default=0, validators=[MinValueValidator(0)], help_text="in mg")
    vitamin_c_per_100g = models.DecimalField(max_digits=8, decimal_places=2, default=0, validators=[MinValueValidator(0)], help_text="in mg")

    # Serving information
    default_serving_size = models.DecimalField(max_digits=6, decimal_places=2, default=100, help_text="Default serving size in grams")
    serving_unit = models.CharField(max_length=20, default="g", help_text="Unit for serving (g, ml, piece, etc.)")

    # Barcode for scanning
    barcode = models.CharField(max_length=50, blank=True, unique=True, null=True)

    # Verification
    is_verified = models.BooleanField(default=False, help_text="Verified by admin")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    # Media
    image = models.ImageField(upload_to='food_images/', null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'foods'
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['barcode']),
        ]

    def __str__(self):
        return f"{self.name}" + (f" ({self.brand})" if self.brand else "")

    def get_nutrition_per_serving(self, serving_size_g=None):
        """Calculate nutrition values for a specific serving size"""
        if serving_size_g is None:
            serving_size_g = float(self.default_serving_size)

        multiplier = serving_size_g / 100

        return {
            'calories': round(float(self.calories_per_100g) * multiplier, 1),
            'protein': round(float(self.protein_per_100g) * multiplier, 1),
            'carbs': round(float(self.carbs_per_100g) * multiplier, 1),
            'fats': round(float(self.fats_per_100g) * multiplier, 1),
            'fiber': round(float(self.fiber_per_100g) * multiplier, 1),
            'sugar': round(float(self.sugar_per_100g) * multiplier, 1),
            'sodium': round(float(self.sodium_per_100g) * multiplier, 1),
        }


class Recipe(models.Model):
    """User-created recipes"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recipes')

    # Recipe details
    servings = models.PositiveIntegerField(default=1)
    prep_time_minutes = models.PositiveIntegerField(null=True, blank=True)
    cook_time_minutes = models.PositiveIntegerField(null=True, blank=True)

    # Instructions
    instructions = models.TextField(blank=True)

    # Nutritional totals (calculated from ingredients)
    total_calories = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    total_protein = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    total_carbs = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    total_fats = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    # Social features
    is_public = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    times_made = models.PositiveIntegerField(default=0)

    # Media
    image = models.ImageField(upload_to='recipe_images/', null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'recipes'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    def calculate_nutrition(self):
        """Calculate total nutrition from ingredients"""
        ingredients = self.ingredients.all()

        total_calories = sum(
            float(ing.food.calories_per_100g) * float(ing.quantity_g) / 100
            for ing in ingredients
        )
        total_protein = sum(
            float(ing.food.protein_per_100g) * float(ing.quantity_g) / 100
            for ing in ingredients
        )
        total_carbs = sum(
            float(ing.food.carbs_per_100g) * float(ing.quantity_g) / 100
            for ing in ingredients
        )
        total_fats = sum(
            float(ing.food.fats_per_100g) * float(ing.quantity_g) / 100
            for ing in ingredients
        )

        self.total_calories = Decimal(str(round(total_calories, 2)))
        self.total_protein = Decimal(str(round(total_protein, 2)))
        self.total_carbs = Decimal(str(round(total_carbs, 2)))
        self.total_fats = Decimal(str(round(total_fats, 2)))
        self.save()

    def get_nutrition_per_serving(self):
        """Get nutrition values per serving"""
        return {
            'calories': round(float(self.total_calories) / self.servings, 1),
            'protein': round(float(self.total_protein) / self.servings, 1),
            'carbs': round(float(self.total_carbs) / self.servings, 1),
            'fats': round(float(self.total_fats) / self.servings, 1),
        }


class RecipeIngredient(models.Model):
    """Ingredients in a recipe"""
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='ingredients')
    food = models.ForeignKey(Food, on_delete=models.CASCADE)
    quantity_g = models.DecimalField(max_digits=8, decimal_places=2, validators=[MinValueValidator(0)])
    notes = models.CharField(max_length=100, blank=True, help_text="e.g., 'chopped', 'diced'")

    class Meta:
        db_table = 'recipe_ingredients'
        unique_together = ['recipe', 'food']

    def __str__(self):
        return f"{self.recipe.name} - {self.food.name}"


class MealEntry(models.Model):
    """Individual meal/food entries"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='meal_entries')

    # Meal information
    MEAL_TYPES = [
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('dinner', 'Dinner'),
        ('snacks', 'Snacks'),
    ]
    meal_type = models.CharField(max_length=10, choices=MEAL_TYPES)
    date = models.DateField()
    time = models.TimeField(null=True, blank=True)

    # Food or recipe
    food = models.ForeignKey(Food, on_delete=models.CASCADE, null=True, blank=True)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, null=True, blank=True)

    # Quantity consumed
    quantity_g = models.DecimalField(max_digits=8, decimal_places=2, validators=[MinValueValidator(0)])

    # Calculated nutrition (stored for historical accuracy)
    calories = models.DecimalField(max_digits=8, decimal_places=2)
    protein = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    carbs = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    fats = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    # Notes
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'meal_entries'
        ordering = ['-date', '-time', '-created_at']
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['user', 'meal_type']),
        ]

    def __str__(self):
        food_name = self.food.name if self.food else self.recipe.name
        return f"{self.user.email} - {food_name} ({self.meal_type})"

    def save(self, *args, **kwargs):
        # Calculate nutrition when saving
        if self.food:
            nutrition = self.food.get_nutrition_per_serving(float(self.quantity_g))
        elif self.recipe:
            nutrition = self.recipe.get_nutrition_per_serving()
            # Adjust for quantity if not a full serving
            serving_multiplier = float(self.quantity_g) / (float(self.recipe.total_calories) or 1)
            nutrition = {k: v * serving_multiplier for k, v in nutrition.items()}
        else:
            nutrition = {'calories': 0, 'protein': 0, 'carbs': 0, 'fats': 0}

        self.calories = Decimal(str(nutrition['calories']))
        self.protein = Decimal(str(nutrition['protein']))
        self.carbs = Decimal(str(nutrition['carbs']))
        self.fats = Decimal(str(nutrition['fats']))

        super().save(*args, **kwargs)


class WaterIntake(models.Model):
    """Daily water intake tracking"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='water_intake')
    date = models.DateField()
    amount_ml = models.PositiveIntegerField(default=0, help_text="Water consumed in milliliters")

    # Goal for the day
    daily_goal_ml = models.PositiveIntegerField(default=2000, help_text="Daily water goal in ml")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'water_intake'
        unique_together = ['user', 'date']
        indexes = [
            models.Index(fields=['user', 'date']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.amount_ml}ml on {self.date}"

    @property
    def progress_percentage(self):
        """Calculate progress as percentage of daily goal"""
        return min(round((self.amount_ml / self.daily_goal_ml) * 100, 1), 100)

    @property
    def glasses_consumed(self):
        """Convert ml to standard glasses (250ml each)"""
        return round(self.amount_ml / 250, 1)


class NutritionGoal(models.Model):
    """User nutrition goals"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='nutrition_goals')

    # Daily goals
    daily_calories = models.PositiveIntegerField()
    daily_protein_g = models.PositiveIntegerField(null=True, blank=True)
    daily_carbs_g = models.PositiveIntegerField(null=True, blank=True)
    daily_fats_g = models.PositiveIntegerField(null=True, blank=True)
    daily_fiber_g = models.PositiveIntegerField(null=True, blank=True)
    daily_water_ml = models.PositiveIntegerField(default=2000)

    # Meal distribution (as percentages)
    breakfast_percentage = models.PositiveIntegerField(default=25, validators=[MinValueValidator(0), MaxValueValidator(100)])
    lunch_percentage = models.PositiveIntegerField(default=35, validators=[MinValueValidator(0), MaxValueValidator(100)])
    dinner_percentage = models.PositiveIntegerField(default=30, validators=[MinValueValidator(0), MaxValueValidator(100)])
    snacks_percentage = models.PositiveIntegerField(default=10, validators=[MinValueValidator(0), MaxValueValidator(100)])

    # Macronutrient distribution
    protein_percentage = models.PositiveIntegerField(default=25, validators=[MinValueValidator(5), MaxValueValidator(50)])
    carbs_percentage = models.PositiveIntegerField(default=50, validators=[MinValueValidator(20), MaxValueValidator(70)])
    fats_percentage = models.PositiveIntegerField(default=25, validators=[MinValueValidator(10), MaxValueValidator(40)])

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'nutrition_goals'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.daily_calories} cal goal"

    def get_macro_goals(self):
        """Calculate macro goals in grams based on percentages"""
        calories = self.daily_calories

        protein_calories = calories * (self.protein_percentage / 100)
        carbs_calories = calories * (self.carbs_percentage / 100)
        fats_calories = calories * (self.fats_percentage / 100)

        return {
            'protein_g': round(protein_calories / 4, 0),  # 4 cal per gram
            'carbs_g': round(carbs_calories / 4, 0),     # 4 cal per gram
            'fats_g': round(fats_calories / 9, 0),       # 9 cal per gram
        }
