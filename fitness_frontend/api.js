// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

class FitnessAPI {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    }

    // Set authentication token and user data
    setAuth(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    // Remove authentication token and user data
    clearAuth() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
    }

    // Get headers with authentication
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (includeAuth && this.token) {
            headers['Authorization'] = `Token ${this.token}`;
        }
        
        return headers;
    }

    // Make API request
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: this.getHeaders(options.includeAuth !== false),
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || errorData.detail || `HTTP ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // ====================
    // AUTHENTICATION APIs
    // ====================

    async login(email, password) {
        const response = await this.request('/auth/login/', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            includeAuth: false
        });
        
        if (response.token && response.user) {
            this.setAuth(response.token, response.user);
        }
        
        return response;
    }

    async register(userData) {
        const response = await this.request('/auth/register/', {
            method: 'POST',
            body: JSON.stringify(userData),
            includeAuth: false
        });
        
        if (response.token && response.user) {
            this.setAuth(response.token, response.user);
        }
        
        return response;
    }

    async logout() {
        try {
            await this.request('/auth/logout/', {
                method: 'POST'
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearAuth();
        }
    }

    async getProfile() {
        const response = await this.request('/auth/profile/');
        if (response) {
            this.user = response;
            localStorage.setItem('currentUser', JSON.stringify(response));
        }
        return response;
    }

    async updateProfile(profileData) {
        const response = await this.request('/auth/profile/', {
            method: 'PATCH',
            body: JSON.stringify(profileData)
        });
        
        if (response) {
            this.user = response;
            localStorage.setItem('currentUser', JSON.stringify(response));
        }
        
        return response;
    }

    // ====================
    // WORKOUT APIs
    // ====================

    async getWorkouts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/workouts/${queryString ? '?' + queryString : ''}`;
        return this.request(endpoint);
    }

    async addWorkout(workoutData) {
        return this.request('/workouts/', {
            method: 'POST',
            body: JSON.stringify(workoutData)
        });
    }

    async updateWorkout(workoutId, workoutData) {
        return this.request(`/workouts/${workoutId}/`, {
            method: 'PATCH',
            body: JSON.stringify(workoutData)
        });
    }

    async deleteWorkout(workoutId) {
        return this.request(`/workouts/${workoutId}/`, {
            method: 'DELETE'
        });
    }

    async getWorkoutStats(period = 'week') {
        return this.request(`/workouts/stats/?period=${period}`);
    }

    // ====================
    // NUTRITION APIs
    // ====================

    async getMeals(date = null) {
        const endpoint = date ? `/nutrition/meals/?date=${date}` : '/nutrition/meals/';
        return this.request(endpoint);
    }

    async addMeal(mealData) {
        return this.request('/nutrition/meals/', {
            method: 'POST',
            body: JSON.stringify(mealData)
        });
    }

    async updateMeal(mealId, mealData) {
        return this.request(`/nutrition/meals/${mealId}/`, {
            method: 'PATCH',
            body: JSON.stringify(mealData)
        });
    }

    async deleteMeal(mealId) {
        return this.request(`/nutrition/meals/${mealId}/`, {
            method: 'DELETE'
        });
    }

    async searchFoods(query) {
        return this.request(`/nutrition/foods/search/?q=${encodeURIComponent(query)}`);
    }

    async getNutritionStats(date = null) {
        const endpoint = date ? `/nutrition/stats/?date=${date}` : '/nutrition/stats/';
        return this.request(endpoint);
    }

    async getWaterIntake(date = null) {
        const endpoint = date ? `/nutrition/water/?date=${date}` : '/nutrition/water/';
        return this.request(endpoint);
    }

    async updateWaterIntake(glasses) {
        return this.request('/nutrition/water/', {
            method: 'POST',
            body: JSON.stringify({ glasses })
        });
    }

    // ====================
    // GOALS APIs
    // ====================

    async getGoals() {
        return this.request('/goals/');
    }

    async addGoal(goalData) {
        return this.request('/goals/', {
            method: 'POST',
            body: JSON.stringify(goalData)
        });
    }

    async updateGoal(goalId, goalData) {
        return this.request(`/goals/${goalId}/`, {
            method: 'PATCH',
            body: JSON.stringify(goalData)
        });
    }

    async deleteGoal(goalId) {
        return this.request(`/goals/${goalId}/`, {
            method: 'DELETE'
        });
    }

    async updateGoalProgress(goalId, progressData) {
        return this.request(`/goals/${goalId}/progress/`, {
            method: 'POST',
            body: JSON.stringify(progressData)
        });
    }

    // ====================
    // COMMUNITY APIs
    // ====================

    async getChallenges() {
        return this.request('/community/challenges/');
    }

    async joinChallenge(challengeId) {
        return this.request(`/community/challenges/${challengeId}/join/`, {
            method: 'POST'
        });
    }

    async getFriends() {
        return this.request('/community/friends/');
    }

    async addFriend(identifier) {
        return this.request('/community/friends/', {
            method: 'POST',
            body: JSON.stringify({ identifier })
        });
    }

    async removeFriend(friendId) {
        return this.request(`/community/friends/${friendId}/`, {
            method: 'DELETE'
        });
    }

    async getLeaderboard() {
        return this.request('/community/leaderboard/');
    }

    // ====================
    // DASHBOARD APIs
    // ====================

    async getDashboardStats() {
        return this.request('/dashboard/stats/');
    }

    async getWeeklyProgress() {
        return this.request('/dashboard/weekly-progress/');
    }

    // ====================
    // UTILITY METHODS
    // ====================

    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    getCurrentUser() {
        return this.user;
    }

    // Calculate BMI
    calculateBMI(weight, height) {
        if (!weight || !height) return null;
        const heightInMeters = height / 100;
        return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
    }

    // Calculate daily calorie goal
    calculateDailyCalorieGoal(user) {
        if (!user.age || !user.height || !user.weight || !user.gender) {
            return 2000; // Default value
        }

        // Harris-Benedict equation
        let bmr;
        if (user.gender === 'M') {
            bmr = 88.362 + (13.397 * user.weight) + (4.799 * user.height) - (5.677 * user.age);
        } else {
            bmr = 447.593 + (9.247 * user.weight) + (3.098 * user.height) - (4.330 * user.age);
        }

        // Activity level multipliers
        const multipliers = {
            'sedentary': 1.2,
            'lightly_active': 1.375,
            'moderately_active': 1.55,
            'very_active': 1.725,
            'extra_active': 1.9
        };

        return Math.round(bmr * (multipliers[user.activity_level] || 1.55));
    }

    // Format date for API calls
    formatDate(date = new Date()) {
        return date.toISOString().split('T')[0];
    }

    // Handle API errors gracefully
    handleError(error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            this.clearAuth();
            window.location.reload();
        }
        return error;
    }
}

// Global API instance
const api = new FitnessAPI();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FitnessAPI;
}
