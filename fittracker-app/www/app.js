// Fitness Tracker Application

// Application State
const AppState = {
    currentUser: null,
    currentPage: 'welcome',
    selectedMeal: null,
    selectedFood: null,
    selectedExercise: null,
    dailyData: null,
    weightHistory: [],
    exerciseHistory: []
};

// Food and Exercise Database
const DATABASE = {
    foods: [
        {"id": 1, "name": "Apple", "calories": 95, "carbs": 25, "protein": 0, "fat": 0, "sodium": 2, "sugar": 19, "serving": "1 medium"},
        {"id": 2, "name": "Banana", "calories": 105, "carbs": 27, "protein": 1, "fat": 0, "sodium": 1, "sugar": 14, "serving": "1 medium"},
        {"id": 3, "name": "Chicken Breast", "calories": 165, "carbs": 0, "protein": 31, "fat": 4, "sodium": 74, "sugar": 0, "serving": "100g"},
        {"id": 4, "name": "Brown Rice", "calories": 216, "carbs": 45, "protein": 5, "fat": 2, "sodium": 10, "sugar": 1, "serving": "1 cup cooked"},
        {"id": 5, "name": "Almonds", "calories": 164, "carbs": 6, "protein": 6, "fat": 14, "sodium": 0, "sugar": 1, "serving": "1 oz"},
        {"id": 6, "name": "Greek Yogurt", "calories": 100, "carbs": 6, "protein": 17, "fat": 0, "sodium": 65, "sugar": 6, "serving": "1 cup"},
        {"id": 7, "name": "Oatmeal", "calories": 154, "carbs": 28, "protein": 5, "fat": 3, "sodium": 2, "sugar": 1, "serving": "1 cup cooked"},
        {"id": 8, "name": "Salmon", "calories": 208, "carbs": 0, "protein": 28, "fat": 12, "sodium": 56, "sugar": 0, "serving": "100g"},
        {"id": 9, "name": "Sweet Potato", "calories": 112, "carbs": 26, "protein": 2, "fat": 0, "sodium": 7, "sugar": 5, "serving": "1 medium"},
        {"id": 10, "name": "Broccoli", "calories": 31, "carbs": 6, "protein": 3, "fat": 0, "sodium": 41, "sugar": 2, "serving": "1 cup"},
        {"id": 11, "name": "Eggs", "calories": 155, "carbs": 1, "protein": 13, "fat": 11, "sodium": 124, "sugar": 1, "serving": "2 large"},
        {"id": 12, "name": "Quinoa", "calories": 222, "carbs": 39, "protein": 8, "fat": 4, "sodium": 13, "sugar": 2, "serving": "1 cup cooked"},
        {"id": 13, "name": "Avocado", "calories": 234, "carbs": 12, "protein": 3, "fat": 21, "sodium": 11, "sugar": 1, "serving": "1 medium"},
        {"id": 14, "name": "Spinach", "calories": 7, "carbs": 1, "protein": 1, "fat": 0, "sodium": 24, "sugar": 0, "serving": "1 cup"},
        {"id": 15, "name": "Tuna", "calories": 154, "carbs": 0, "protein": 25, "fat": 5, "sodium": 247, "sugar": 0, "serving": "100g"},
        {"id": 16, "name": "Whole Wheat Bread", "calories": 81, "carbs": 14, "protein": 4, "fat": 1, "sodium": 144, "sugar": 1, "serving": "1 slice"},
        {"id": 17, "name": "Milk (2%)", "calories": 122, "carbs": 12, "protein": 8, "fat": 5, "sodium": 115, "sugar": 12, "serving": "1 cup"},
        {"id": 18, "name": "Turkey Breast", "calories": 135, "carbs": 0, "protein": 30, "fat": 1, "sodium": 54, "sugar": 0, "serving": "100g"},
        {"id": 19, "name": "Orange", "calories": 62, "carbs": 15, "protein": 1, "fat": 0, "sodium": 0, "sugar": 12, "serving": "1 medium"},
        {"id": 20, "name": "Peanut Butter", "calories": 190, "carbs": 8, "protein": 8, "fat": 16, "sodium": 136, "sugar": 3, "serving": "2 tbsp"}
    ],
    exercises: [
        {"id": 1, "name": "Running", "type": "cardio", "calories_per_min": 10, "category": "Running"},
        {"id": 2, "name": "Walking", "type": "cardio", "calories_per_min": 4, "category": "Walking"},
        {"id": 3, "name": "Cycling", "type": "cardio", "calories_per_min": 8, "category": "Cycling"},
        {"id": 4, "name": "Swimming", "type": "cardio", "calories_per_min": 11, "category": "Swimming"},
        {"id": 5, "name": "Jump Rope", "type": "cardio", "calories_per_min": 12, "category": "HIIT"},
        {"id": 6, "name": "Rowing", "type": "cardio", "calories_per_min": 9, "category": "Cardio"},
        {"id": 7, "name": "Elliptical", "type": "cardio", "calories_per_min": 7, "category": "Cardio"},
        {"id": 8, "name": "Push Ups", "type": "strength", "muscle_group": "Chest", "category": "Upper Body"},
        {"id": 9, "name": "Pull Ups", "type": "strength", "muscle_group": "Back", "category": "Upper Body"},
        {"id": 10, "name": "Squats", "type": "strength", "muscle_group": "Legs", "category": "Lower Body"},
        {"id": 11, "name": "Deadlifts", "type": "strength", "muscle_group": "Full Body", "category": "Compound"},
        {"id": 12, "name": "Bench Press", "type": "strength", "muscle_group": "Chest", "category": "Upper Body"},
        {"id": 13, "name": "Lunges", "type": "strength", "muscle_group": "Legs", "category": "Lower Body"},
        {"id": 14, "name": "Planks", "type": "strength", "muscle_group": "Core", "category": "Core"},
        {"id": 15, "name": "Burpees", "type": "cardio", "calories_per_min": 15, "category": "HIIT"}
    ],
    healthTips: [
        {"id": 1, "title": "Stay Hydrated", "content": "Drink at least 8 glasses of water daily for optimal health.", "category": "Nutrition"},
        {"id": 2, "title": "Regular Exercise", "content": "Aim for at least 150 minutes of moderate exercise per week.", "category": "Fitness"},
        {"id": 3, "title": "Balanced Diet", "content": "Include a variety of fruits, vegetables, and whole grains in your diet.", "category": "Nutrition"},
        {"id": 4, "title": "Quality Sleep", "content": "Get 7-9 hours of quality sleep each night for recovery.", "category": "Wellness"},
        {"id": 5, "title": "Portion Control", "content": "Use smaller plates and be mindful of portion sizes.", "category": "Nutrition"}
    ],
    communityPosts: [
        {"id": 1, "author": "FitnessFan", "content": "Down 10 pounds this month! Consistency is key!", "likes": 45, "timestamp": "2 hours ago"},
        {"id": 2, "author": "HealthyEater", "content": "Just discovered quinoa recipes - game changer for meal prep!", "likes": 32, "timestamp": "5 hours ago"},
        {"id": 3, "author": "RunnerLife", "content": "Completed my first 10K race today! Next goal: half marathon", "likes": 67, "timestamp": "1 day ago"},
        {"id": 4, "author": "YogaLover", "content": "Morning yoga session complete ✨ Starting the day right!", "likes": 28, "timestamp": "1 day ago"}
    ],
    blogArticles: [
        {"id": 1, "title": "The Health Benefits of Chocolate", "excerpt": "Not all chocolate is created equal. Here's how to satisfy your craving and enjoy some health benefits, too.", "readTime": "5 min"},
        {"id": 2, "title": "5 Strategies to Boost Heart Health", "excerpt": "Our registered dietitian is sharing 5 strategies for a heart-healthy diet to help prevent cardiovascular disease.", "readTime": "7 min"},
        {"id": 3, "title": "10 Sugar Swaps for Better Heart Health", "excerpt": "February is Heart Health month. While many wish to cut back on sweets, you might not know that cutting back is good for your heart, too.", "readTime": "6 min"}
    ]
};

// Utility Functions
const Utils = {
    generateId: () => Date.now() + Math.random(),
    
    getCurrentDate: () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    },
    
    formatDate: (date) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString('en-US', options);
    },
    
    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    checkPasswordStrength: (password) => {
        const strength = {
            score: 0,
            message: ''
        };
        
        if (password.length >= 8) strength.score += 1;
        if (/[A-Z]/.test(password)) strength.score += 1;
        if (/[a-z]/.test(password)) strength.score += 1;
        if (/[0-9]/.test(password)) strength.score += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength.score += 1;
        
        switch (strength.score) {
            case 0:
            case 1:
                strength.message = 'Weak password';
                break;
            case 2:
            case 3:
                strength.message = 'Medium strength';
                break;
            case 4:
            case 5:
                strength.message = 'Strong password';
                break;
        }
        
        return strength;
    },
    
    showMessage: (message, type = 'success') => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message`;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 3000);
    }
};

// Local Storage Management
const Storage = {
    getUser: (email) => {
        const users = JSON.parse(localStorage.getItem('fittracker_users') || '{}');
        return users[email] || null;
    },
    
    saveUser: (user) => {
        const users = JSON.parse(localStorage.getItem('fittracker_users') || '{}');
        users[user.email] = user;
        localStorage.setItem('fittracker_users', JSON.stringify(users));
    },
    
    getCurrentUser: () => {
        const email = localStorage.getItem('fittracker_current_user');
        return email ? Storage.getUser(email) : null;
    },
    
    setCurrentUser: (email) => {
        localStorage.setItem('fittracker_current_user', email);
    },
    
    clearCurrentUser: () => {
        localStorage.removeItem('fittracker_current_user');
    },
    
    getDailyData: (email, date) => {
        const key = `fittracker_daily_${email}_${date}`;
        return JSON.parse(localStorage.getItem(key)) || {
            date,
            meals: {
                breakfast: [],
                lunch: [],
                dinner: [],
                snacks: []
            },
            exercises: [],
            water: 0,
            weight: null
        };
    },
    
    saveDailyData: (email, date, data) => {
        const key = `fittracker_daily_${email}_${date}`;
        localStorage.setItem(key, JSON.stringify(data));
    },
    
    getWeightHistory: (email) => {
        const key = `fittracker_weight_${email}`;
        return JSON.parse(localStorage.getItem(key)) || [];
    },
    
    saveWeightHistory: (email, history) => {
        const key = `fittracker_weight_${email}`;
        localStorage.setItem(key, JSON.stringify(history));
    }
};

// Authentication Functions
function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    
    document.querySelector(`.auth-tab:nth-child(${tab === 'login' ? '1' : '2'})`).classList.add('active');
    document.getElementById(`${tab}-form`).classList.add('active');
}

function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!Utils.validateEmail(email)) {
        Utils.showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    const user = Storage.getUser(email);
    if (!user || user.password !== password) {
        Utils.showMessage('Invalid email or password', 'error');
        return;
    }
    
    AppState.currentUser = user;
    Storage.setCurrentUser(email);
    initializeApp();
}

function signup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const goal = parseInt(document.getElementById('signup-goal').value);
    
    if (!Utils.validateEmail(email)) {
        Utils.showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    const passwordStrength = Utils.checkPasswordStrength(password);
    if (passwordStrength.score < 2) {
        Utils.showMessage('Password is too weak', 'error');
        return;
    }
    
    if (Storage.getUser(email)) {
        Utils.showMessage('User already exists', 'error');
        return;
    }
    
    const user = {
        name,
        email,
        password,
        calorieGoal: goal,
        targetWeight: null,
        createdAt: new Date().toISOString(),
        streak: 0,
        totalDaysLogged: 0
    };
    
    Storage.saveUser(user);
    AppState.currentUser = user;
    Storage.setCurrentUser(email);
    initializeApp();
    Utils.showMessage('Account created successfully!');
}

function logout() {
    AppState.currentUser = null;
    Storage.clearCurrentUser();
    showPage('welcome');
    document.getElementById('navbar').classList.add('hidden');
    document.getElementById('bottom-nav').classList.add('hidden');
}

// Password strength checker
document.getElementById('signup-password')?.addEventListener('input', (e) => {
    const strength = Utils.checkPasswordStrength(e.target.value);
    document.getElementById('password-strength').textContent = strength.message;
});

// Navigation Functions
function showPage(pageId) {
    // Update active page
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(`${pageId}-page`).classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-link, .bottom-nav-item').forEach(link => {
        link.classList.remove('active');
    });
    
    document.querySelectorAll(`[onclick="showPage('${pageId}')"]`).forEach(link => {
        link.classList.add('active');
    });
    
    AppState.currentPage = pageId;
    
    // Initialize page-specific data
    switch (pageId) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'food':
            loadFoodDatabase();
            break;
        case 'exercise':
            loadExerciseDatabase();
            break;
        case 'progress':
            loadProgressCharts();
            break;
        case 'community':
            loadCommunity();
            break;
        case 'profile':
            loadProfile();
            break;
    }
}

// Dashboard Functions
function loadDashboard() {
    const today = Utils.getCurrentDate();
    document.getElementById('current-date').textContent = Utils.formatDate(today);
    
    AppState.dailyData = Storage.getDailyData(AppState.currentUser.email, today);
    
    updateCalorieSummary();
    updateMacronutrients();
    updateMeals();
    updateWaterTracker();
}

function updateCalorieSummary() {
    const goal = AppState.currentUser.calorieGoal;
    const consumed = calculateTotalCalories();
    const exercised = calculateExerciseCalories();
    const remaining = goal - consumed + exercised;
    
    document.getElementById('calorie-goal').textContent = goal;
    document.getElementById('goal-display').textContent = goal;
    document.getElementById('calories-consumed').textContent = consumed;
    document.getElementById('food-calories').textContent = consumed;
    document.getElementById('exercise-calories').textContent = exercised;
    document.getElementById('remaining-calories').textContent = Math.max(0, remaining);
    
    // Update calorie chart
    updateCalorieChart(consumed, goal);
}

function calculateTotalCalories() {
    let total = 0;
    Object.values(AppState.dailyData.meals).forEach(meal => {
        meal.forEach(food => {
            total += food.calories * food.servings;
        });
    });
    return Math.round(total);
}

function calculateExerciseCalories() {
    let total = 0;
    AppState.dailyData.exercises.forEach(exercise => {
        total += exercise.calories;
    });
    return Math.round(total);
}

function updateCalorieChart(consumed, goal) {
    const canvas = document.getElementById('calorie-chart');
    const ctx = canvas.getContext('2d');
    
    if (window.calorieChart) {
        window.calorieChart.destroy();
    }
    
    const percentage = Math.min((consumed / goal) * 100, 100);
    
    window.calorieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [consumed, Math.max(0, goal - consumed)],
                backgroundColor: ['#85c400', '#f0f0f0'],
                borderWidth: 0
            }]
        },
        options: {
            cutout: '70%',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function updateMacronutrients() {
    const macros = calculateMacronutrients();
    
    // Update macro values
    document.getElementById('carbs-value').textContent = `${macros.carbs}g`;
    document.getElementById('protein-value').textContent = `${macros.protein}g`;
    document.getElementById('fat-value').textContent = `${macros.fat}g`;
    
    // Update macro progress bars
    const carbsGoal = Math.round(AppState.currentUser.calorieGoal * 0.5 / 4);
    const proteinGoal = Math.round(AppState.currentUser.calorieGoal * 0.25 / 4);
    const fatGoal = Math.round(AppState.currentUser.calorieGoal * 0.25 / 9);
    
    updateProgressBar('carbs-progress', macros.carbs / carbsGoal);
    updateProgressBar('protein-progress', macros.protein / proteinGoal);
    updateProgressBar('fat-progress', macros.fat / fatGoal);
}

function calculateMacronutrients() {
    const macros = { carbs: 0, protein: 0, fat: 0 };
    
    Object.values(AppState.dailyData.meals).forEach(meal => {
        meal.forEach(food => {
            macros.carbs += food.carbs * food.servings;
            macros.protein += food.protein * food.servings;
            macros.fat += food.fat * food.servings;
        });
    });
    
    return {
        carbs: Math.round(macros.carbs),
        protein: Math.round(macros.protein),
        fat: Math.round(macros.fat)
    };
}

function updateProgressBar(elementId, percentage) {
    const progressBar = document.getElementById(elementId);
    const width = Math.min(percentage * 100, 100);
    progressBar.style.width = `${width}%`;
}

function updateMeals() {
    const meals = ['breakfast', 'lunch', 'dinner', 'snacks'];
    
    meals.forEach(meal => {
        const mealData = AppState.dailyData.meals[meal];
        const totalCalories = mealData.reduce((sum, food) => sum + (food.calories * food.servings), 0);
        
        document.getElementById(`${meal}-calories`).textContent = Math.round(totalCalories);
        
        const mealContainer = document.getElementById(`${meal}-foods`);
        mealContainer.innerHTML = '';
        
        mealData.forEach(food => {
            const foodItem = document.createElement('div');
            foodItem.className = 'food-item';
            foodItem.innerHTML = `
                <div>
                    <div class="food-name">${food.name} (${food.servings}x)</div>
                    <div class="food-calories">${Math.round(food.calories * food.servings)} cal</div>
                </div>
                <button class="remove-food" onclick="removeFood('${meal}', '${food.id}')">×</button>
            `;
            mealContainer.appendChild(foodItem);
        });
    });
}

function updateWaterTracker() {
    const waterContainer = document.getElementById('water-glasses');
    waterContainer.innerHTML = '';
    
    for (let i = 0; i < 8; i++) {
        const glass = document.createElement('div');
        glass.className = `water-glass ${i < AppState.dailyData.water ? 'filled' : ''}`;
        glass.innerHTML = '💧';
        glass.onclick = () => setWaterLevel(i + 1);
        waterContainer.appendChild(glass);
    }
}

function addWater() {
    if (AppState.dailyData.water < 8) {
        AppState.dailyData.water++;
        saveDailyData();
        updateWaterTracker();
    }
}

function resetWater() {
    AppState.dailyData.water = 0;
    saveDailyData();
    updateWaterTracker();
}

function setWaterLevel(level) {
    AppState.dailyData.water = level;
    saveDailyData();
    updateWaterTracker();
}

// Food Functions
function loadFoodDatabase() {
    searchFoods();
}

function showFoodSearch(meal) {
    AppState.selectedMeal = meal;
    showPage('food');
}

function searchFoods() {
    const query = document.getElementById('food-search')?.value.toLowerCase() || '';
    const results = DATABASE.foods.filter(food => 
        food.name.toLowerCase().includes(query)
    );
    
    displayFoodResults(results);
}

function displayFoodResults(foods) {
    const container = document.getElementById('food-results');
    container.innerHTML = '';
    
    foods.forEach(food => {
        const foodItem = document.createElement('div');
        foodItem.className = 'food-result-item';
        foodItem.onclick = () => selectFood(food);
        foodItem.innerHTML = `
            <div class="food-result-header">
                <div class="food-result-name">${food.name}</div>
                <div class="food-result-calories">${food.calories} cal</div>
            </div>
            <div class="food-result-serving">${food.serving}</div>
            <div class="food-result-macros">
                <span>Carbs: ${food.carbs}g</span>
                <span>Protein: ${food.protein}g</span>
                <span>Fat: ${food.fat}g</span>
            </div>
        `;
        container.appendChild(foodItem);
    });
}

function selectFood(food) {
    AppState.selectedFood = food;
    document.getElementById('selected-food-info').innerHTML = `
        <h4>${food.name}</h4>
        <p>Per ${food.serving}: ${food.calories} calories</p>
    `;
    updateFoodNutrition();
    openModal('add-food-modal');
}

function updateFoodNutrition() {
    if (!AppState.selectedFood) return;
    
    const servings = parseFloat(document.getElementById('food-servings').value) || 1;
    const food = AppState.selectedFood;
    
    const calories = Math.round(food.calories * servings);
    const carbs = Math.round(food.carbs * servings);
    const protein = Math.round(food.protein * servings);
    const fat = Math.round(food.fat * servings);
    
    document.getElementById('nutrition-preview').innerHTML = `
        <div><strong>Nutrition for ${servings} serving(s):</strong></div>
        <div>Calories: ${calories}</div>
        <div>Carbs: ${carbs}g | Protein: ${protein}g | Fat: ${fat}g</div>
    `;
}

function addFoodToMeal() {
    if (!AppState.selectedFood || !AppState.selectedMeal) return;
    
    const servings = parseFloat(document.getElementById('food-servings').value) || 1;
    const foodEntry = {
        id: Utils.generateId(),
        ...AppState.selectedFood,
        servings
    };
    
    AppState.dailyData.meals[AppState.selectedMeal].push(foodEntry);
    saveDailyData();
    closeModal('add-food-modal');
    showPage('dashboard');
    Utils.showMessage(`${AppState.selectedFood.name} added to ${AppState.selectedMeal}!`);
}

function removeFood(meal, foodId) {
    AppState.dailyData.meals[meal] = AppState.dailyData.meals[meal].filter(food => food.id != foodId);
    saveDailyData();
    updateMeals();
    updateCalorieSummary();
    updateMacronutrients();
}

// Exercise Functions
function loadExerciseDatabase() {
    switchExerciseTab('cardio');
}

function switchExerciseTab(type) {
    document.querySelectorAll('.exercise-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.exercise-tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[onclick="switchExerciseTab('${type}')"]`).classList.add('active');
    document.getElementById(`${type}-tab`).classList.add('active');
    
    searchExercises(type);
}

function searchExercises(type) {
    const query = document.getElementById(`${type}-search`)?.value.toLowerCase() || '';
    const exercises = DATABASE.exercises.filter(exercise => 
        exercise.type === type && exercise.name.toLowerCase().includes(query)
    );
    
    displayExerciseResults(exercises, type);
}

function displayExerciseResults(exercises, type) {
    const container = document.getElementById(`${type}-results`);
    container.innerHTML = '';
    
    exercises.forEach(exercise => {
        const exerciseItem = document.createElement('div');
        exerciseItem.className = 'exercise-result-item';
        exerciseItem.onclick = () => selectExercise(exercise);
        exerciseItem.innerHTML = `
            <div class="exercise-result-name">${exercise.name}</div>
            <div class="exercise-result-type">${exercise.category || exercise.muscle_group || 'Exercise'}</div>
        `;
        container.appendChild(exerciseItem);
    });
    
    loadExerciseLog();
}

function selectExercise(exercise) {
    AppState.selectedExercise = exercise;
    document.getElementById('selected-exercise-info').innerHTML = `
        <h4>${exercise.name}</h4>
        <p>Type: ${exercise.type}</p>
        <p>${exercise.category || exercise.muscle_group || ''}</p>
    `;
    
    const inputsContainer = document.getElementById('exercise-inputs');
    if (exercise.type === 'cardio') {
        inputsContainer.innerHTML = `
            <div class="form-group">
                <label class="form-label">Duration (minutes)</label>
                <input type="number" class="form-control" id="exercise-duration" min="1" value="30" onchange="updateExerciseCalories()">
            </div>
        `;
    } else {
        inputsContainer.innerHTML = `
            <div class="form-group">
                <label class="form-label">Sets</label>
                <input type="number" class="form-control" id="exercise-sets" min="1" value="3" onchange="updateExerciseCalories()">
            </div>
            <div class="form-group">
                <label class="form-label">Reps</label>
                <input type="number" class="form-control" id="exercise-reps" min="1" value="10" onchange="updateExerciseCalories()">
            </div>
            <div class="form-group">
                <label class="form-label">Weight (lbs)</label>
                <input type="number" class="form-control" id="exercise-weight" min="0" value="0" step="5" onchange="updateExerciseCalories()">
            </div>
        `;
    }
    
    updateExerciseCalories();
    openModal('add-exercise-modal');
}

function updateExerciseCalories() {
    if (!AppState.selectedExercise) return;
    
    let calories = 0;
    const exercise = AppState.selectedExercise;
    
    if (exercise.type === 'cardio') {
        const duration = parseInt(document.getElementById('exercise-duration').value) || 0;
        calories = exercise.calories_per_min * duration;
    } else {
        const sets = parseInt(document.getElementById('exercise-sets').value) || 0;
        const reps = parseInt(document.getElementById('exercise-reps.value')) || 0;
        calories = Math.round(sets * reps * 0.5); // Rough estimate
    }
    
    document.getElementById('calories-preview').innerHTML = `
        <div><strong>Estimated calories burned: ${calories}</strong></div>
    `;
}

function addExerciseToLog() {
    if (!AppState.selectedExercise) return;
    
    const exercise = AppState.selectedExercise;
    let exerciseEntry = {
        id: Utils.generateId(),
        name: exercise.name,
        type: exercise.type,
        calories: 0,
        details: ''
    };
    
    if (exercise.type === 'cardio') {
        const duration = parseInt(document.getElementById('exercise-duration').value) || 0;
        exerciseEntry.calories = exercise.calories_per_min * duration;
        exerciseEntry.details = `${duration} minutes`;
    } else {
        const sets = parseInt(document.getElementById('exercise-sets').value) || 0;
        const reps = parseInt(document.getElementById('exercise-reps').value) || 0;
        const weight = parseInt(document.getElementById('exercise-weight').value) || 0;
        exerciseEntry.calories = Math.round(sets * reps * 0.5);
        exerciseEntry.details = `${sets} sets × ${reps} reps${weight > 0 ? ` @ ${weight} lbs` : ''}`;
    }
    
    AppState.dailyData.exercises.push(exerciseEntry);
    saveDailyData();
    closeModal('add-exercise-modal');
    loadExerciseLog();
    updateCalorieSummary();
    Utils.showMessage(`${exercise.name} added to workout!`);
}

function loadExerciseLog() {
    const container = document.getElementById('exercise-log');
    container.innerHTML = '';
    
    AppState.dailyData.exercises.forEach(exercise => {
        const exerciseItem = document.createElement('div');
        exerciseItem.className = 'exercise-log-item';
        exerciseItem.innerHTML = `
            <div class="exercise-log-header">
                <div class="exercise-log-name">${exercise.name}</div>
                <div class="exercise-log-calories">${exercise.calories} cal</div>
            </div>
            <div class="exercise-log-details">${exercise.details}</div>
        `;
        container.appendChild(exerciseItem);
    });
}

// Progress Functions
function loadProgressCharts() {
    switchProgressTab('weight');
}

function switchProgressTab(tab) {
    document.querySelectorAll('.progress-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.progress-tab-content').forEach(c => c.classList.remove('active'));
    
    document.querySelector(`[onclick="switchProgressTab('${tab}')"]`).classList.add('active');
    document.getElementById(`${tab}-tab`).classList.add('active');
    
    switch (tab) {
        case 'weight':
            loadWeightChart();
            break;
        case 'nutrition':
            loadNutritionChart();
            break;
        case 'exercise':
            loadExerciseChart();
            break;
    }
}

function loadWeightChart() {
    const weightHistory = Storage.getWeightHistory(AppState.currentUser.email);
    const canvas = document.getElementById('weight-chart');
    const ctx = canvas.getContext('2d');
    
    if (window.weightChart) {
        window.weightChart.destroy();
    }
    
    const labels = weightHistory.map(entry => new Date(entry.date).toLocaleDateString());
    const data = weightHistory.map(entry => entry.weight);
    
    window.weightChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Weight (lbs)',
                data,
                borderColor: '#85c400',
                backgroundColor: 'rgba(133, 196, 0, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Weight Progress'
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

function addWeightEntry() {
    const weight = parseFloat(document.getElementById('weight-input').value);
    if (!weight) return;
    
    const weightHistory = Storage.getWeightHistory(AppState.currentUser.email);
    const today = Utils.getCurrentDate();
    
    // Remove existing entry for today if any
    const filteredHistory = weightHistory.filter(entry => entry.date !== today);
    filteredHistory.push({ date: today, weight });
    
    Storage.saveWeightHistory(AppState.currentUser.email, filteredHistory);
    document.getElementById('weight-input').value = '';
    loadWeightChart();
    Utils.showMessage('Weight recorded!');
}

function loadNutritionChart() {
    const canvas = document.getElementById('nutrition-chart');
    const ctx = canvas.getContext('2d');
    
    if (window.nutritionChart) {
        window.nutritionChart.destroy();
    }
    
    const macros = calculateMacronutrients();
    
    window.nutritionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Carbs', 'Protein', 'Fat'],
            datasets: [{
                data: [macros.carbs, macros.protein, macros.fat],
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Today\'s Macronutrient Breakdown'
                }
            }
        }
    });
}

function loadExerciseChart() {
    const canvas = document.getElementById('exercise-chart');
    const ctx = canvas.getContext('2d');
    
    if (window.exerciseChart) {
        window.exerciseChart.destroy();
    }
    
    // Get last 7 days of exercise data
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dailyData = Storage.getDailyData(AppState.currentUser.email, dateStr);
        const totalCalories = dailyData.exercises.reduce((sum, ex) => sum + ex.calories, 0);
        
        last7Days.push({
            date: dateStr,
            calories: totalCalories
        });
    }
    
    const labels = last7Days.map(day => new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }));
    const data = last7Days.map(day => day.calories);
    
    window.exerciseChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Calories Burned',
                data,
                backgroundColor: '#85c400'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Exercise Calories - Last 7 Days'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Community Functions
function loadCommunity() {
    switchCommunityTab('feed');
}

function switchCommunityTab(tab) {
    document.querySelectorAll('.community-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.community-tab-content').forEach(c => c.classList.remove('active'));
    
    document.querySelector(`[onclick="switchCommunityTab('${tab}')"]`).classList.add('active');
    document.getElementById(`${tab}-tab`).classList.add('active');
    
    switch (tab) {
        case 'feed':
            loadCommunityFeed();
            break;
        case 'tips':
            loadHealthTips();
            break;
        case 'articles':
            loadBlogArticles();
            break;
    }
}

function loadCommunityFeed() {
    const container = document.getElementById('community-posts');
    container.innerHTML = '';
    
    DATABASE.communityPosts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'community-post';
        postElement.innerHTML = `
            <div class="post-header">
                <div class="post-author">${post.author}</div>
                <div class="post-time">${post.timestamp}</div>
            </div>
            <div class="post-content">${post.content}</div>
            <div class="post-likes">❤️ ${post.likes} likes</div>
        `;
        container.appendChild(postElement);
    });
}

function loadHealthTips() {
    const container = document.getElementById('health-tips');
    container.innerHTML = '';
    
    DATABASE.healthTips.forEach(tip => {
        const tipElement = document.createElement('div');
        tipElement.className = 'health-tip';
        tipElement.innerHTML = `
            <div class="tip-category">${tip.category}</div>
            <div class="tip-title">${tip.title}</div>
            <div class="tip-content">${tip.content}</div>
        `;
        container.appendChild(tipElement);
    });
}

function loadBlogArticles() {
    const container = document.getElementById('blog-articles');
    container.innerHTML = '';
    
    DATABASE.blogArticles.forEach(article => {
        const articleElement = document.createElement('div');
        articleElement.className = 'blog-article';
        articleElement.innerHTML = `
            <div class="article-title">${article.title}</div>
            <div class="article-excerpt">${article.excerpt}</div>
            <div class="article-read-time">📖 ${article.readTime} read</div>
        `;
        container.appendChild(articleElement);
    });
}

// Profile Functions
function loadProfile() {
    if (!AppState.currentUser) return;
    
    document.getElementById('user-name').textContent = AppState.currentUser.name;
    document.getElementById('user-email').textContent = AppState.currentUser.email;
    document.getElementById('streak-count').textContent = AppState.currentUser.streak || 0;
    document.getElementById('total-logged').textContent = AppState.currentUser.totalDaysLogged || 0;
    document.getElementById('calorie-goal-input').value = AppState.currentUser.calorieGoal;
    document.getElementById('target-weight-input').value = AppState.currentUser.targetWeight || '';
}

function updateCalorieGoal() {
    const newGoal = parseInt(document.getElementById('calorie-goal-input').value);
    if (newGoal && newGoal > 0) {
        AppState.currentUser.calorieGoal = newGoal;
        Storage.saveUser(AppState.currentUser);
        Utils.showMessage('Calorie goal updated!');
    }
}

function updateTargetWeight() {
    const newWeight = parseFloat(document.getElementById('target-weight-input').value);
    AppState.currentUser.targetWeight = newWeight || null;
    Storage.saveUser(AppState.currentUser);
    Utils.showMessage('Target weight updated!');
}

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// Data Persistence
function saveDailyData() {
    if (!AppState.currentUser || !AppState.dailyData) return;
    
    const today = Utils.getCurrentDate();
    Storage.saveDailyData(AppState.currentUser.email, today, AppState.dailyData);
}

// Responsive Navigation
function updateNavigation() {
    const isMobile = window.innerWidth <= 768;
    const navbar = document.getElementById('navbar');
    const bottomNav = document.getElementById('bottom-nav');
    
    if (AppState.currentUser) {
        if (isMobile) {
            navbar.classList.add('hidden');
            bottomNav.classList.remove('hidden');
        } else {
            navbar.classList.remove('hidden');
            bottomNav.classList.add('hidden');
        }
    }
}

// Initialize Application
function initializeApp() {
    const currentUser = Storage.getCurrentUser();
    
    if (currentUser) {
        AppState.currentUser = currentUser;
        document.getElementById('navbar').classList.remove('hidden');
        updateNavigation();
        showPage('dashboard');
    } else {
        showPage('welcome');
    }
}

// Event Listeners
window.addEventListener('resize', updateNavigation);

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.add('hidden');
    }
});

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);