// ===========================
// GLOBAL STATE & VARIABLES
// ===========================

let currentUser = null;
let currentScreen = 'dashboard';
let workoutChart = null;
let userData = {
    workouts: [],
    meals: {},
    goals: [],
    friends: [],
    challenges: [],
    waterIntake: 0,
    stats: {
        totalCalories: 0,
        totalWorkouts: 0,
        stepsToday: 0,
        waterGlasses: 0
    }
};

// ===========================
// APP INITIALIZATION
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    initializeTheme();
});

async function initializeApp() {
    // Check if user is already logged in
    if (api.isAuthenticated()) {
        try {
            currentUser = await api.getProfile();
            showAppContainer();
            await loadInitialData();
        } catch (error) {
            console.error('Failed to get user profile:', error);
            showLoginScreen();
        }
    } else {
        showLoginScreen();
    }
}

// ===========================
// EVENT LISTENERS SETUP
// ===========================

function setupEventListeners() {
    // Authentication
    setupAuthListeners();
    
    // Navigation
    setupNavigationListeners();
    
    // Theme Toggle
    setupThemeListeners();
    
    // Workout
    setupWorkoutListeners();
    
    // Nutrition
    setupNutritionListeners();
    
    // Goals
    setupGoalsListeners();
    
    // Community
    setupCommunityListeners();
    
    // Profile
    setupProfileListeners();
    
    // Modals
    setupModalListeners();
}

// Authentication Event Listeners
function setupAuthListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchAuthTab(tab);
        });
    });

    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register form  
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

// Navigation Event Listeners
function setupNavigationListeners() {
    // Bottom navigation
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const screen = e.target.closest('.nav-item').dataset.screen;
            showScreen(screen);
        });
    });

    // FAB
    const fab = document.getElementById('fab');
    if (fab) {
        fab.addEventListener('click', handleFabClick);
    }
}

// Theme Event Listeners
function setupThemeListeners() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', (e) => {
            setTheme(e.target.checked ? 'dark' : 'light');
        });
    }
}

// Workout Event Listeners
function setupWorkoutListeners() {
    // Workout type selection
    document.querySelectorAll('.workout-type-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            selectWorkoutType(e.target.closest('.workout-type-btn').dataset.type);
        });
    });

    // Workout form submission
    const workoutForm = document.getElementById('workout-form');
    if (workoutForm) {
        workoutForm.addEventListener('submit', handleWorkoutSubmit);
    }

    // Workout tabs
    document.querySelectorAll('[data-tab]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchWorkoutTab(e.target.dataset.tab);
        });
    });
}

// Nutrition Event Listeners
function setupNutritionListeners() {
    // Add food buttons
    document.querySelectorAll('.add-food-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mealType = e.target.dataset.meal;
            openAddFoodModal(mealType);
        });
    });

    // Water glasses
    document.querySelectorAll('.glass').forEach(glass => {
        glass.addEventListener('click', (e) => {
            const glassNumber = parseInt(e.target.dataset.glass);
            updateWaterIntake(glassNumber);
        });
    });

    // Add food form submission
    const addFoodSubmit = document.getElementById('add-food-submit');
    if (addFoodSubmit) {
        addFoodSubmit.addEventListener('click', handleAddFood);
    }
}

// Goals Event Listeners
function setupGoalsListeners() {
    const addGoalBtn = document.getElementById('add-goal-btn');
    if (addGoalBtn) {
        addGoalBtn.addEventListener('click', () => openModal('add-goal-modal'));
    }

    // Goal type selection
    const goalTypeSelect = document.getElementById('goal-type');
    if (goalTypeSelect) {
        goalTypeSelect.addEventListener('change', handleGoalTypeChange);
    }

    const addGoalSubmit = document.getElementById('add-goal-submit');
    if (addGoalSubmit) {
        addGoalSubmit.addEventListener('click', handleAddGoal);
    }
}

// Community Event Listeners
function setupCommunityListeners() {
    const addFriendBtn = document.getElementById('add-friend-btn');
    if (addFriendBtn) {
        addFriendBtn.addEventListener('click', () => openModal('add-friend-modal'));
    }

    const addFriendSubmit = document.getElementById('add-friend-submit');
    if (addFriendSubmit) {
        addFriendSubmit.addEventListener('click', handleAddFriend);
    }

    // Community tabs
    document.querySelectorAll('.screen-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchCommunityTab(e.target.dataset.tab);
        });
    });
}

// Profile Event Listeners
function setupProfileListeners() {
    const editProfileBtn = document.getElementById('edit-personal-info');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => openEditProfileModal());
    }

    const notificationSettingsBtn = document.getElementById('notification-settings');
    if (notificationSettingsBtn) {
        notificationSettingsBtn.addEventListener('click', () => openModal('notification-modal'));
    }

    const logoutBtnProfile = document.getElementById('logout-btn-profile');
    if (logoutBtnProfile) {
        logoutBtnProfile.addEventListener('click', handleLogout);
    }

    const saveProfileBtn = document.getElementById('save-profile-btn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', handleSaveProfile);
    }

    // Notification toggles
    document.querySelectorAll('#notification-modal input[type="checkbox"]').forEach(toggle => {
        toggle.addEventListener('change', handleNotificationToggle);
    });
}

// Modal Event Listeners
function setupModalListeners() {
    // Close modal buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal.id);
        });
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // Cancel buttons
    document.querySelectorAll('.modal-footer .btn--outline').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal.id);
        });
    });
}

// ===========================
// AUTHENTICATION FUNCTIONS
// ===========================

function switchAuthTab(tab) {
    // Update tab buttons
    document.querySelectorAll('#login-screen .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

    // Update forms
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    document.getElementById(`${tab}-form`).classList.add('active');
}

async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    try {
        showLoading(true);
        const response = await api.login(email, password);
        currentUser = response.user;
        showToast('Login successful!', 'success');
        showAppContainer();
        await loadInitialData();
    } catch (error) {
        showToast(`Login failed: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = {
        email: formData.get('email'),
        username: formData.get('username'),
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        password: formData.get('password'),
        password_confirm: formData.get('password_confirm')
    };

    // Basic validation
    if (!userData.email || !userData.password || !userData.password_confirm) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    if (userData.password !== userData.password_confirm) {
        showToast('Passwords do not match', 'error');
        return;
    }

    try {
        showLoading(true);
        const response = await api.register(userData);
        currentUser = response.user;
        showToast('Registration successful!', 'success');
        showAppContainer();
        await loadInitialData();
    } catch (error) {
        showToast(`Registration failed: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

async function handleLogout() {
    try {
        await api.logout();
        currentUser = null;
        userData = {
            workouts: [],
            meals: {},
            goals: [],
            friends: [],
            challenges: [],
            waterIntake: 0,
            stats: {
                totalCalories: 0,
                totalWorkouts: 0,
                stepsToday: 0,
                waterGlasses: 0
            }
        };
        showLoginScreen();
        showToast('Logged out successfully', 'success');
    } catch (error) {
        console.error('Logout error:', error);
        // Force logout even if API call fails
        api.clearAuth();
        showLoginScreen();
        showToast('Logged out', 'info');
    }
}

// ===========================
// SCREEN MANAGEMENT
// ===========================

function showLoginScreen() {
    document.getElementById('login-screen').classList.add('active');
    document.getElementById('app-container').classList.remove('active');
}

function showAppContainer() {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('app-container').classList.add('active');
    updateUserInterface();
}

function showScreen(screenName) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-screen="${screenName}"]`).classList.add('active');

    // Update header title
    const screenTitle = document.getElementById('screen-title');
    if (screenTitle) {
        screenTitle.textContent = screenName.charAt(0).toUpperCase() + screenName.slice(1);
    }

    // Update current screen
    currentScreen = screenName;

    // Load screen-specific data
    loadScreenData(screenName);
}

async function loadScreenData(screenName) {
    switch (screenName) {
        case 'dashboard':
            await loadDashboardData();
            break;
        case 'workouts':
            await loadWorkoutData();
            break;
        case 'nutrition':
            await loadNutritionData();
            break;
        case 'goals':
            await loadGoalsData();
            break;
        case 'community':
            await loadCommunityData();
            break;
        case 'profile':
            updateProfileDisplay();
            break;
    }
}

// ===========================
// DATA LOADING FUNCTIONS
// ===========================

async function loadInitialData() {
    try {
        showLoading(true);
        
        // Load dashboard data first (most important)
        await loadDashboardData();
        
        // Load other data in background
        Promise.all([
            loadWorkoutData(),
            loadNutritionData(),
            loadGoalsData(),
            loadCommunityData()
        ]).catch(error => {
            console.error('Error loading background data:', error);
        });
        
    } catch (error) {
        console.error('Error loading initial data:', error);
        showToast('Failed to load some data', 'error');
    } finally {
        showLoading(false);
    }
}

async function loadDashboardData() {
    try {
        // Load dashboard stats - start with zeros if no data
        userData.stats = {
            totalCalories: 0,
            totalWorkouts: 0,
            stepsToday: 0,
            waterGlasses: 0
        };

        // Try to get real data from API (when implemented)
        try {
            const stats = await api.getDashboardStats();
            if (stats) {
                userData.stats = stats;
            }
        } catch (error) {
            // API not implemented yet, use default zeros
            console.log('Dashboard API not implemented yet, using defaults');
        }

        // Update dashboard display
        updateDashboardStats();
        updateWelcomeMessage();
        
        // Load and update chart
        await loadWeeklyChart();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Still show default empty state
        updateDashboardStats();
        updateWelcomeMessage();
    }
}

async function loadWorkoutData() {
    try {
        // Start with empty workouts
        userData.workouts = [];
        
        // Try to get real workouts from API (when implemented)
        try {
            const workouts = await api.getWorkouts();
            if (workouts && workouts.length > 0) {
                userData.workouts = workouts;
            }
        } catch (error) {
            // API not implemented yet, use empty array
            console.log('Workouts API not implemented yet, using empty state');
        }
        
        // Update workout display
        updateWorkoutDisplay();
        
    } catch (error) {
        console.error('Error loading workout data:', error);
        updateWorkoutDisplay(); // Show empty state
    }
}

async function loadNutritionData() {
    try {
        // Start with empty meals and zero water
        userData.meals = {
            breakfast: [],
            lunch: [],
            dinner: [],
            snacks: []
        };
        userData.waterIntake = 0;
        
        // Try to get real nutrition data from API (when implemented)
        try {
            const today = api.formatDate();
            const meals = await api.getMeals(today);
            if (meals) {
                userData.meals = meals;
            }
            
            const waterData = await api.getWaterIntake(today);
            if (waterData) {
                userData.waterIntake = waterData.glasses || 0;
            }
        } catch (error) {
            // API not implemented yet, use defaults
            console.log('Nutrition API not implemented yet, using defaults');
        }
        
        // Update nutrition display
        updateNutritionDisplay();
        updateWaterDisplay();
        
    } catch (error) {
        console.error('Error loading nutrition data:', error);
        updateNutritionDisplay(); // Show empty state
        updateWaterDisplay();
    }
}

async function loadGoalsData() {
    try {
        // Start with empty goals
        userData.goals = [];
        
        // Try to get real goals from API (when implemented)
        try {
            const goals = await api.getGoals();
            if (goals && goals.length > 0) {
                userData.goals = goals;
            }
        } catch (error) {
            // API not implemented yet, use empty array
            console.log('Goals API not implemented yet, using empty state');
        }
        
        // Update goals display
        updateGoalsDisplay();
        
    } catch (error) {
        console.error('Error loading goals data:', error);
        updateGoalsDisplay(); // Show empty state
    }
}

async function loadCommunityData() {
    try {
        // Start with empty community data
        userData.friends = [];
        userData.challenges = [];
        
        // Try to get real community data from API (when implemented)
        try {
            const [friends, challenges] = await Promise.all([
                api.getFriends(),
                api.getChallenges()
            ]);
            
            if (friends && friends.length > 0) {
                userData.friends = friends;
            }
            
            if (challenges && challenges.length > 0) {
                userData.challenges = challenges;
            }
        } catch (error) {
            // API not implemented yet, use empty arrays
            console.log('Community API not implemented yet, using empty state');
        }
        
        // Update community display
        updateCommunityDisplay();
        
    } catch (error) {
        console.error('Error loading community data:', error);
        updateCommunityDisplay(); // Show empty state
    }
}

// ===========================
// UI UPDATE FUNCTIONS
// ===========================

function updateUserInterface() {
    if (!currentUser) return;
    
    // Update user name in header
    updateWelcomeMessage();
    
    // Update profile info
    updateProfileDisplay();
    
    // Update notification badge (start with 0)
    updateNotificationBadge(0);
}

function updateWelcomeMessage() {
    const welcomeMessage = document.getElementById('welcome-message');
    if (welcomeMessage && currentUser) {
        const name = currentUser.first_name || currentUser.username || 'User';
        welcomeMessage.textContent = `Welcome back, ${name}!`;
    }
}

function updateDashboardStats() {
    // Update stat cards with real or zero values
    const elements = {
        'steps-count': userData.stats.stepsToday,
        'calories-count': userData.stats.totalCalories,
        'workouts-count': userData.stats.totalWorkouts,
        'water-count': userData.stats.waterGlasses
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value || '0';
        }
    });
    
    // Update progress bars (start at 0% for clean state)
    updateProgressBars();
}

function updateProgressBars() {
    const progressElements = {
        'steps-progress': 0,
        'calories-progress': 0,
        'workouts-progress': 0,
        'water-progress': 0
    };
    
    // Calculate actual progress if we have goals
    if (userData.stats.stepsToday > 0) {
        const stepsGoal = 10000; // Default goal
        progressElements['steps-progress'] = Math.min((userData.stats.stepsToday / stepsGoal) * 100, 100);
    }
    
    if (userData.stats.totalCalories > 0 && currentUser) {
        const calorieGoal = api.calculateDailyCalorieGoal(currentUser);
        progressElements['calories-progress'] = Math.min((userData.stats.totalCalories / calorieGoal) * 100, 100);
    }
    
    if (userData.stats.totalWorkouts > 0) {
        const workoutGoal = 1; // Daily goal
        progressElements['workouts-progress'] = Math.min((userData.stats.totalWorkouts / workoutGoal) * 100, 100);
    }
    
    if (userData.stats.waterGlasses > 0) {
        const waterGoal = 8; // 8 glasses
        progressElements['water-progress'] = Math.min((userData.stats.waterGlasses / waterGoal) * 100, 100);
    }
    
    // Update progress bar elements
    Object.entries(progressElements).forEach(([id, percentage]) => {
        const element = document.getElementById(id);
        if (element) {
            element.style.width = `${percentage}%`;
        }
        
        // Update percentage text
        const percentageId = id.replace('-progress', '-percentage');
        const percentageElement = document.getElementById(percentageId);
        if (percentageElement) {
            const roundedPercentage = Math.round(percentage);
            if (roundedPercentage === 100) {
                percentageElement.textContent = 'Goal achieved!';
            } else {
                percentageElement.textContent = `${roundedPercentage}% of goal`;
            }
        }
    });
}

function updateWorkoutDisplay() {
    const workoutList = document.getElementById('workout-list');
    if (!workoutList) return;
    
    if (userData.workouts.length === 0) {
        workoutList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-dumbbell"></i>
                <h3>No workouts yet</h3>
                <p>Start your fitness journey by logging your first workout!</p>
            </div>
        `;
    } else {
        // Display actual workouts
        workoutList.innerHTML = userData.workouts.map(workout => `
            <div class="workout-item">
                <div class="workout-info">
                    <h4>${workout.name}</h4>
                    <p>${workout.category} • ${workout.date}</p>
                    <p>${workout.duration_minutes} min • ${workout.calories_burned} cal</p>
                </div>
                <div class="workout-actions">
                    <button class="btn btn--sm btn--outline" onclick="editWorkout('${workout.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn--sm btn--outline" onclick="deleteWorkout('${workout.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

function updateNutritionDisplay() {
    // Update calorie counter
    const caloriesConsumed = document.getElementById('calories-consumed');
    const caloriesGoal = document.getElementById('calories-goal');
    
    if (caloriesConsumed) {
        const totalCalories = Object.values(userData.meals).flat().reduce((sum, meal) => sum + (meal.calories || 0), 0);
        caloriesConsumed.textContent = totalCalories;
    }
    
    if (caloriesGoal && currentUser) {
        const dailyGoal = api.calculateDailyCalorieGoal(currentUser);
        caloriesGoal.textContent = `/ ${dailyGoal}`;
    }
    
    // Update macro breakdown (start at 0)
    updateMacroDisplay();
    
    // Update meal sections
    Object.entries(userData.meals).forEach(([mealType, meals]) => {
        updateMealSection(mealType, meals);
    });
}

function updateMacroDisplay() {
    const allMeals = Object.values(userData.meals).flat();
    const totals = {
        carbs: 0,
        protein: 0,
        fats: 0
    };
    
    allMeals.forEach(meal => {
        totals.carbs += meal.carbs || 0;
        totals.protein += meal.protein || 0;
        totals.fats += meal.fats || 0;
    });
    
    // Update macro text
    document.getElementById('carbs-text').textContent = `Carbs: ${totals.carbs}g`;
    document.getElementById('protein-text').textContent = `Protein: ${totals.protein}g`;
    document.getElementById('fats-text').textContent = `Fats: ${totals.fats}g`;
    
    // Update macro bars (calculate percentage based on typical daily values)
    const maxValues = { carbs: 250, protein: 150, fats: 70 }; // Typical daily maximums
    
    Object.entries(totals).forEach(([macro, amount]) => {
        const percentage = Math.min((amount / maxValues[macro]) * 100, 100);
        const fillElement = document.getElementById(`${macro}-fill`);
        if (fillElement) {
            fillElement.style.width = `${percentage}%`;
        }
    });
}

function updateMealSection(mealType, meals) {
    const mealItems = document.getElementById(`${mealType}-items`);
    if (!mealItems) return;
    
    if (meals.length === 0) {
        mealItems.innerHTML = `
            <div class="empty-meal">
                <p>No foods added yet</p>
            </div>
        `;
    } else {
        mealItems.innerHTML = meals.map(meal => `
            <div class="meal-item">
                <div class="meal-info">
                    <h4>${meal.name}</h4>
                    <p>${meal.calories} cal • ${meal.time || 'No time set'}</p>
                </div>
                <div class="meal-macros">
                    <span>C: ${meal.carbs || 0}g</span>
                    <span>P: ${meal.protein || 0}g</span>
                    <span>F: ${meal.fats || 0}g</span>
                </div>
            </div>
        `).join('');
    }
}

function updateWaterDisplay() {
    const waterGlasses = document.querySelectorAll('.glass');
    const waterStatus = document.getElementById('water-status');
    
    waterGlasses.forEach((glass, index) => {
        const glassNumber = index + 1;
        if (glassNumber <= userData.waterIntake) {
            glass.classList.add('filled');
        } else {
            glass.classList.remove('filled');
        }
    });
    
    if (waterStatus) {
        waterStatus.textContent = `${userData.waterIntake}/8 glasses today`;
    }
}

function updateGoalsDisplay() {
    const goalsList = document.getElementById('goals-list');
    if (!goalsList) return;
    
    if (userData.goals.length === 0) {
        goalsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-target"></i>
                <h3>No goals set</h3>
                <p>Set your first fitness goal to start tracking your progress!</p>
            </div>
        `;
    } else {
        goalsList.innerHTML = userData.goals.map(goal => `
            <div class="goal-card">
                <div class="goal-header">
                    <div class="goal-info">
                        <h4>${goal.title}</h4>
                        <p>${goal.description}</p>
                    </div>
                    <div class="goal-progress">
                        <h3>${goal.progress_percentage}%</h3>
                        <small>Complete</small>
                    </div>
                </div>
                <div class="goal-bar">
                    <div class="goal-bar-fill" style="width: ${goal.progress_percentage}%"></div>
                </div>
                <div class="goal-meta">
                    <span>Current: ${goal.current_value} ${goal.unit}</span>
                    <span>Target: ${goal.target_value} ${goal.unit}</span>
                </div>
            </div>
        `).join('');
    }
}

function updateCommunityDisplay() {
    updateChallengesDisplay();
    updateFriendsDisplay();
    updateLeaderboardDisplay();
}

function updateChallengesDisplay() {
    const challengesList = document.getElementById('challenges-list');
    if (!challengesList) return;
    
    if (userData.challenges.length === 0) {
        challengesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-flag"></i>
                <h3>No challenges available</h3>
                <p>Check back later for new community challenges!</p>
            </div>
        `;
    } else {
        challengesList.innerHTML = userData.challenges.map(challenge => `
            <div class="challenge-card">
                <div class="challenge-header">
                    <div class="challenge-info">
                        <h4>${challenge.title}</h4>
                        <p>${challenge.description}</p>
                    </div>
                </div>
                <div class="challenge-meta">
                    <span><i class="fas fa-users"></i> ${challenge.participants} participants</span>
                    <span><i class="fas fa-clock"></i> ${challenge.days_left} days left</span>
                    <span><i class="fas fa-trophy"></i> ${challenge.reward}</span>
                </div>
                <div class="challenge-actions">
                    <button class="btn btn--primary btn--sm" onclick="joinChallenge('${challenge.id}')">
                        Join Challenge
                    </button>
                </div>
            </div>
        `).join('');
    }
}

function updateFriendsDisplay() {
    const friendsList = document.getElementById('friends-list');
    if (!friendsList) return;
    
    if (userData.friends.length === 0) {
        friendsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h3>No friends yet</h3>
                <p>Add friends to see their progress and stay motivated together!</p>
            </div>
        `;
    } else {
        friendsList.innerHTML = userData.friends.map(friend => `
            <div class="friend-item">
                <div class="friend-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="friend-info">
                    <h4>${friend.name}</h4>
                    <p>Last active: ${friend.last_active || 'Recently'}</p>
                </div>
                <div class="friend-points">${friend.points || 0} pts</div>
            </div>
        `).join('');
    }
}

function updateLeaderboardDisplay() {
    const leaderboardList = document.getElementById('leaderboard-list');
    if (!leaderboardList) return;
    
    // For now, show empty state since we don't have real leaderboard data
    leaderboardList.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-medal"></i>
            <h3>No leaderboard data</h3>
            <p>Complete workouts and goals to appear on the leaderboard!</p>
        </div>
    `;
}

function updateProfileDisplay() {
    if (!currentUser) return;
    
    // Update profile name and email
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    
    if (profileName) {
        profileName.textContent = currentUser.full_name || 
            `${currentUser.first_name} ${currentUser.last_name}`.trim() || 
            currentUser.username || 'User Name';
    }
    
    if (profileEmail) {
        profileEmail.textContent = currentUser.email || 'user@email.com';
    }
    
    // Update profile stats
    const profileAge = document.getElementById('profile-age');
    const profileHeight = document.getElementById('profile-height');
    const profileWeight = document.getElementById('profile-weight');
    
    if (profileAge) {
        profileAge.textContent = currentUser.age || '-';
    }
    
    if (profileHeight) {
        profileHeight.textContent = currentUser.height ? `${currentUser.height} cm` : '-';
    }
    
    if (profileWeight) {
        profileWeight.textContent = currentUser.weight ? `${currentUser.weight} kg` : '-';
    }
    
    // Update fitness goal
    const profileGoal = document.getElementById('profile-goal');
    if (profileGoal) {
        const goalText = currentUser.fitness_goal ? 
            `Goal: ${currentUser.fitness_goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}` : 
            'Goal: Not set';
        profileGoal.textContent = goalText;
    }
    
    // Update activity level (calculate dynamically)
    const activityLevel = document.getElementById('activity-level');
    if (activityLevel) {
        const level = calculateActivityLevel();
        activityLevel.textContent = level;
    }
}

function calculateActivityLevel() {
    const workoutCount = userData.workouts.length;
    const daysInWeek = 7;
    
    // Calculate based on recent workout history
    if (workoutCount >= 6) {
        return 'Active';
    } else if (workoutCount >= 3) {
        return 'Moderately Active';
    } else {
        return 'Less Active';
    }
}

function updateNotificationBadge(count) {
    const badge = document.getElementById('notification-count');
    if (badge) {
        badge.textContent = count;
        if (count === 0) {
            badge.classList.add('hidden');
        } else {
            badge.classList.remove('hidden');
        }
    }
}

// ===========================
// WORKOUT FUNCTIONS
// ===========================

function selectWorkoutType(type) {
    // Update button states
    document.querySelectorAll('.workout-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('active');
    
    // Update form label based on workout type
    const label = document.getElementById('workout-name-label');
    if (label) {
        switch (type) {
            case 'yoga':
                label.textContent = 'Yoga Pose Name';
                break;
            case 'sports':
                label.textContent = 'Sport Name';
                break;
            default:
                label.textContent = 'Exercise Name';
        }
    }
}

async function handleWorkoutSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const workoutData = {
        name: formData.get('name') || document.getElementById('workout-name').value,
        duration_minutes: parseInt(document.getElementById('workout-duration').value),
        calories_burned: parseInt(document.getElementById('workout-calories').value),
        notes: document.getElementById('workout-notes').value,
        date: api.formatDate(),
        category: document.querySelector('.workout-type-btn.active').dataset.type
    };
    
    // Basic validation
    if (!workoutData.name || !workoutData.duration_minutes || !workoutData.calories_burned) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        // For now, add to local data (API call would go here)
        const newWorkout = {
            id: Date.now().toString(),
            ...workoutData,
            created_at: new Date().toISOString()
        };
        
        userData.workouts.unshift(newWorkout);
        userData.stats.totalWorkouts += 1;
        userData.stats.totalCalories += workoutData.calories_burned;
        
        // Try to save to API (when implemented)
        try {
            await api.addWorkout(workoutData);
        } catch (error) {
            console.log('Workout API not implemented yet, using local storage');
        }
        
        // Update displays
        updateWorkoutDisplay();
        updateDashboardStats();
        
        // Reset form
        e.target.reset();
        document.querySelector('.workout-type-btn.active').classList.remove('active');
        document.querySelector('.workout-type-btn[data-type="cardio"]').classList.add('active');
        selectWorkoutType('cardio');
        
        showToast('Workout logged successfully!', 'success');
        
    } catch (error) {
        showToast(`Failed to log workout: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

function switchWorkoutTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('#workouts .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('#workouts .tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
}

// ===========================
// NUTRITION FUNCTIONS
// ===========================

let currentMealType = null;

function openAddFoodModal(mealType) {
    currentMealType = mealType;
    
    // Update modal title
    const modalTitle = document.querySelector('#add-food-modal .modal-header h3');
    if (modalTitle) {
        modalTitle.textContent = `Add Food to ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`;
    }
    
    // Reset form
    document.getElementById('add-food-modal').querySelectorAll('input').forEach(input => {
        input.value = '';
    });
    document.getElementById('food-quantity').value = '1';
    
    openModal('add-food-modal');
}

async function handleAddFood() {
    if (!currentMealType) {
        showToast('No meal type selected', 'error');
        return;
    }
    
    const foodName = document.getElementById('food-name').value.trim();
    const quantity = parseFloat(document.getElementById('food-quantity').value);
    const calories = parseInt(document.getElementById('food-calories').value);
    const protein = parseFloat(document.getElementById('food-protein').value) || 0;
    const carbs = parseFloat(document.getElementById('food-carbs').value) || 0;
    const fats = parseFloat(document.getElementById('food-fats').value) || 0;
    
    if (!foodName || !quantity || !calories) {
        showToast('Please fill in required fields (name, quantity, calories)', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        const mealData = {
            name: foodName,
            quantity: quantity,
            calories: calories,
            protein: protein,
            carbs: carbs,
            fats: fats,
            meal_type: currentMealType,
            time: new Date().toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit' 
            }),
            date: api.formatDate()
        };
        
        // Add to local data
        if (!userData.meals[currentMealType]) {
            userData.meals[currentMealType] = [];
        }
        userData.meals[currentMealType].push({
            id: Date.now().toString(),
            ...mealData
        });
        
        // Try to save to API (when implemented)
        try {
            await api.addMeal(mealData);
        } catch (error) {
            console.log('Nutrition API not implemented yet, using local storage');
        }
        
        // Update displays
        updateNutritionDisplay();
        updateDashboardStats();
        
        // Close modal
        closeModal('add-food-modal');
        currentMealType = null;
        
        showToast('Food added successfully!', 'success');
        
    } catch (error) {
        showToast(`Failed to add food: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

async function updateWaterIntake(glassNumber) {
    // Toggle water intake up to the clicked glass
    if (glassNumber <= userData.waterIntake) {
        // Clicking on filled glass - reduce intake
        userData.waterIntake = glassNumber - 1;
    } else {
        // Clicking on empty glass - increase intake
        userData.waterIntake = glassNumber;
    }
    
    // Update display immediately
    updateWaterDisplay();
    
    // Update stats
    userData.stats.waterGlasses = userData.waterIntake;
    updateDashboardStats();
    
    // Try to save to API (when implemented)
    try {
        await api.updateWaterIntake(userData.waterIntake);
    } catch (error) {
        console.log('Water API not implemented yet, using local storage');
    }
    
    showToast(`Water intake updated: ${userData.waterIntake}/8 glasses`, 'info');
}

// ===========================
// GOALS FUNCTIONS
// ===========================

function handleGoalTypeChange(e) {
    const goalType = e.target.value;
    const specificFields = document.getElementById('goal-specific-fields');
    
    if (!specificFields) return;
    
    let fieldsHTML = '';
    
    switch (goalType) {
        case 'daily_steps':
            fieldsHTML = `
                <div class="form-group">
                    <label class="form-label">Daily Steps Target</label>
                    <input type="number" class="form-control" id="steps-target" placeholder="10000" required>
                </div>
            `;
            break;
            
        case 'weight_loss':
            fieldsHTML = `
                <div class="form-group">
                    <label class="form-label">Current Weight (kg)</label>
                    <input type="number" class="form-control" id="current-weight" step="0.1" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Target Weight (kg)</label>
                    <input type="number" class="form-control" id="target-weight" step="0.1" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Target Date</label>
                    <input type="date" class="form-control" id="target-date" required>
                </div>
            `;
            break;
            
        case 'weekly_workouts':
            fieldsHTML = `
                <div class="form-group">
                    <label class="form-label">Workouts per Week</label>
                    <input type="number" class="form-control" id="weekly-target" min="1" max="7" placeholder="3" required>
                </div>
            `;
            break;
            
        default:
            fieldsHTML = '';
    }
    
    specificFields.innerHTML = fieldsHTML;
}

async function handleAddGoal() {
    const goalType = document.getElementById('goal-type').value;
    
    if (!goalType) {
        showToast('Please select a goal type', 'error');
        return;
    }
    
    let goalData = {
        goal_type: goalType,
        created_at: new Date().toISOString(),
        status: 'active'
    };
    
    try {
        switch (goalType) {
            case 'daily_steps':
                const stepsTarget = parseInt(document.getElementById('steps-target').value);
                if (!stepsTarget) {
                    showToast('Please enter steps target', 'error');
                    return;
                }
                goalData = {
                    ...goalData,
                    title: 'Daily Steps Goal',
                    description: `Walk ${stepsTarget.toLocaleString()} steps daily`,
                    target_value: stepsTarget,
                    current_value: userData.stats.stepsToday || 0,
                    unit: 'steps'
                };
                break;
                
            case 'weight_loss':
                const currentWeight = parseFloat(document.getElementById('current-weight').value);
                const targetWeight = parseFloat(document.getElementById('target-weight').value);
                const targetDate = document.getElementById('target-date').value;
                
                if (!currentWeight || !targetWeight || !targetDate) {
                    showToast('Please fill in all weight loss fields', 'error');
                    return;
                }
                
                if (targetWeight >= currentWeight) {
                    showToast('Target weight should be less than current weight', 'error');
                    return;
                }
                
                goalData = {
                    ...goalData,
                    title: 'Weight Loss Goal',
                    description: `Lose ${currentWeight - targetWeight} kg by ${new Date(targetDate).toLocaleDateString()}`,
                    target_value: targetWeight,
                    current_value: currentWeight,
                    unit: 'kg',
                    target_date: targetDate
                };
                break;
                
            case 'weekly_workouts':
                const weeklyTarget = parseInt(document.getElementById('weekly-target').value);
                if (!weeklyTarget) {
                    showToast('Please enter weekly workout target', 'error');
                    return;
                }
                goalData = {
                    ...goalData,
                    title: 'Weekly Workouts Goal',
                    description: `Complete ${weeklyTarget} workouts per week`,
                    target_value: weeklyTarget,
                    current_value: Math.min(userData.workouts.filter(w => {
                        const workoutDate = new Date(w.date || w.created_at);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return workoutDate >= weekAgo;
                    }).length, weeklyTarget),
                    unit: 'workouts'
                };
                break;
                
            default:
                showToast('Invalid goal type', 'error');
                return;
        }
        
        // Calculate progress percentage
        goalData.progress_percentage = goalData.target_value > 0 ? 
            Math.min(Math.round((goalData.current_value / goalData.target_value) * 100), 100) : 0;
        
        showLoading(true);
        
        // Add to local data
        const newGoal = {
            id: Date.now().toString(),
            ...goalData
        };
        userData.goals.unshift(newGoal);
        
        // Try to save to API (when implemented)
        try {
            await api.addGoal(goalData);
        } catch (error) {
            console.log('Goals API not implemented yet, using local storage');
        }
        
        // Update display
        updateGoalsDisplay();
        
        // Close modal and reset form
        closeModal('add-goal-modal');
        document.getElementById('goal-type').value = '';
        document.getElementById('goal-specific-fields').innerHTML = '';
        
        showToast('Goal added successfully!', 'success');
        
    } catch (error) {
        showToast(`Failed to add goal: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

// ===========================
// COMMUNITY FUNCTIONS
// ===========================

async function handleAddFriend() {
    const identifier = document.getElementById('friend-identifier').value.trim();
    
    if (!identifier) {
        showToast('Please enter a username or email', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        // For now, add to local data (API call would go here)
        const newFriend = {
            id: Date.now().toString(),
            name: identifier.includes('@') ? identifier.split('@')[0] : identifier,
            email: identifier.includes('@') ? identifier : null,
            username: identifier.includes('@') ? null : identifier,
            points: 0,
            last_active: 'Just added',
            added_at: new Date().toISOString()
        };
        
        userData.friends.push(newFriend);
        
        // Try to save to API (when implemented)
        try {
            await api.addFriend(identifier);
        } catch (error) {
            console.log('Friends API not implemented yet, using local storage');
        }
        
        // Update display
        updateFriendsDisplay();
        
        // Close modal and reset form
        closeModal('add-friend-modal');
        document.getElementById('friend-identifier').value = '';
        
        showToast(`Friend "${newFriend.name}" added successfully!`, 'success');
        
    } catch (error) {
        showToast(`Failed to add friend: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

function switchCommunityTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('#community .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`#community [data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('#community .tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
}

async function joinChallenge(challengeId) {
    try {
        showLoading(true);
        
        // Try to join challenge via API (when implemented)
        try {
            await api.joinChallenge(challengeId);
            showToast('Successfully joined challenge!', 'success');
        } catch (error) {
            console.log('Challenge API not implemented yet');
            showToast('Challenge joining will be available soon!', 'info');
        }
        
        // Update local data
        const challenge = userData.challenges.find(c => c.id === challengeId);
        if (challenge) {
            challenge.joined = true;
            challenge.participants += 1;
        }
        
        updateChallengesDisplay();
        
    } catch (error) {
        showToast(`Failed to join challenge: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

// ===========================
// PROFILE FUNCTIONS
// ===========================

function openEditProfileModal() {
    // Pre-fill form with current user data
    if (currentUser) {
        const editAge = document.getElementById('edit-age');
        const editHeight = document.getElementById('edit-height');
        const editWeight = document.getElementById('edit-weight');
        const editFitnessGoal = document.getElementById('edit-fitness-goal');
        
        if (editAge) editAge.value = currentUser.age || '';
        if (editHeight) editHeight.value = currentUser.height || '';
        if (editWeight) editWeight.value = currentUser.weight || '';
        if (editFitnessGoal) editFitnessGoal.value = currentUser.fitness_goal || 'weight_loss';
    }
    
    openModal('edit-profile-modal');
}

async function handleSaveProfile() {
    const profileData = {
        age: parseInt(document.getElementById('edit-age').value) || null,
        height: parseFloat(document.getElementById('edit-height').value) || null,
        weight: parseFloat(document.getElementById('edit-weight').value) || null,
        fitness_goal: document.getElementById('edit-fitness-goal').value
    };
    
    // Basic validation
    if (profileData.age && (profileData.age < 13 || profileData.age > 120)) {
        showToast('Please enter a valid age (13-120)', 'error');
        return;
    }
    
    if (profileData.height && (profileData.height < 50 || profileData.height > 300)) {
        showToast('Please enter a valid height (50-300 cm)', 'error');
        return;
    }
    
    if (profileData.weight && (profileData.weight < 20 || profileData.weight > 500)) {
        showToast('Please enter a valid weight (20-500 kg)', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        // Update local user data
        Object.assign(currentUser, profileData);
        
        // Try to save to API (when implemented)
        try {
            await api.updateProfile(profileData);
        } catch (error) {
            console.log('Profile API not implemented yet, using local storage');
        }
        
        // Update displays
        updateProfileDisplay();
        updateDashboardStats(); // May affect calorie goals
        
        // Close modal
        closeModal('edit-profile-modal');
        
        showToast('Profile updated successfully!', 'success');
        
    } catch (error) {
        showToast(`Failed to update profile: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

function handleNotificationToggle(e) {
    const setting = e.target.id;
    const enabled = e.target.checked;
    
    // Store notification preferences (would save to API in real app)
    const notificationSettings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
    notificationSettings[setting] = enabled;
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
    
    showToast(`${setting.replace('-', ' ')} ${enabled ? 'enabled' : 'disabled'}`, 'info');
}

// ===========================
// CHART FUNCTIONS
// ===========================

async function loadWeeklyChart() {
    const chartCanvas = document.getElementById('weeklyChart');
    if (!chartCanvas) return;
    
    try {
        // Destroy existing chart
        if (workoutChart) {
            workoutChart.destroy();
        }
        
        // Get weekly data (mock data for now)
        let weeklyData;
        try {
            weeklyData = await api.getWeeklyProgress();
        } catch (error) {
            // Use mock data when API is not available
            weeklyData = {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                calories: [0, 0, 0, 0, 0, 0, 0],
                workouts: [0, 0, 0, 0, 0, 0, 0]
            };
        }
        
        // Create chart
        const ctx = chartCanvas.getContext('2d');
        workoutChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: weeklyData.labels,
                datasets: [
                    {
                        label: 'Calories Burned',
                        data: weeklyData.calories,
                        borderColor: 'rgba(45, 166, 178, 1)',
                        backgroundColor: 'rgba(45, 166, 178, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Workouts',
                        data: weeklyData.workouts,
                        borderColor: 'rgba(168, 75, 47, 1)',
                        backgroundColor: 'rgba(168, 75, 47, 0.1)',
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Calories'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Workouts'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Error loading weekly chart:', error);
        
        // Show empty chart state
        const chartContainer = chartCanvas.parentElement;
        chartContainer.innerHTML = `
            <div class="chart-empty">
                <i class="fas fa-chart-line"></i>
                <h4>No data available</h4>
                <p>Start logging workouts to see your progress chart!</p>
            </div>
        `;
    }
}

// ===========================
// THEME FUNCTIONS
// ===========================

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Update dark mode toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.checked = savedTheme === 'dark';
    }
}

function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-color-scheme', theme);
    localStorage.setItem('theme', theme);
    
    // Update theme toggle icon
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
    
    // Update dark mode toggle in settings
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.checked = theme === 'dark';
    }
}

// ===========================
// MODAL FUNCTIONS
// ===========================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// ===========================
// UTILITY FUNCTIONS
// ===========================

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        console.log(`Toast: ${message} (${type})`);
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${getToastIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Hide and remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function getToastIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        case 'info':
        default: return 'info-circle';
    }
}

function showLoading(show = true) {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        if (show) {
            loadingOverlay.classList.remove('hidden');
        } else {
            loadingOverlay.classList.add('hidden');
        }
    }
}

function handleFabClick() {
    // Show quick action menu or navigate based on current screen
    switch (currentScreen) {
        case 'workouts':
            // Focus on workout form
            const workoutNameInput = document.getElementById('workout-name');
            if (workoutNameInput) {
                workoutNameInput.focus();
                workoutNameInput.scrollIntoView({ behavior: 'smooth' });
            }
            break;
        case 'nutrition':
            // Open add food modal for lunch (most common meal)
            openAddFoodModal('lunch');
            break;
        case 'goals':
            // Open add goal modal
            openModal('add-goal-modal');
            break;
        case 'community':
            // Open add friend modal
            openModal('add-friend-modal');
            break;
        default:
            // Navigate to workouts
            showScreen('workouts');
    }
}

// ===========================
// GLOBAL ERROR HANDLER
// ===========================

window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showToast('Something went wrong. Please try again.', 'error');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showToast('Network error. Please check your connection.', 'error');
});

// ===========================
// EXPORT FOR TESTING
// ===========================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeApp,
        handleLogin,
        handleRegister,
        updateDashboardStats,
        updateNutritionDisplay,
        calculateActivityLevel
    };
}
