document.addEventListener('DOMContentLoaded', function() {
    // First show loading state
    document.querySelector('.container').style.opacity = '0';
    
    // DOM Elements
    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginContent = document.querySelector('.login-content');
    const registerContent = document.getElementById('register-content');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    const usernameDisplay = document.getElementById('username');
    const userAvatar = document.getElementById('user-avatar');
    const tabLinks = document.querySelectorAll('.sidebar li');
    const tabContents = document.querySelectorAll('.tab-content');
    const waterProgress = document.getElementById('water-progress');
    const caloriesProgress = document.getElementById('calories-progress');
    const activityMeter = document.getElementById('activity-meter');
    const waterAmountInput = document.getElementById('water-amount');
    const addWaterBtn = document.getElementById('add-water');
    const waterLog = document.getElementById('water-log');
    const mealTypeSelect = document.getElementById('meal-type');
    const mealNameInput = document.getElementById('meal-name');
    const mealCaloriesInput = document.getElementById('meal-calories');
    const addMealBtn = document.getElementById('add-meal');
    const mealLog = document.getElementById('meal-log');
    const mealTabs = document.querySelectorAll('.meal-tab');
    const workoutPlan = document.getElementById('workout-plan');
    const startWorkoutBtn = document.getElementById('start-workout');
    const workoutLog = document.getElementById('workout-log');
    const profileForm = document.querySelector('.profile-form');
    const aiButton = document.getElementById('ai-button');
    const aiChat = document.getElementById('ai-chat');
    const closeChat = document.getElementById('close-chat');
    const aiMessages = document.getElementById('ai-messages');
    const aiQuestion = document.getElementById('ai-question');
    const aiSend = document.getElementById('ai-send');
    const saveProfileBtn = document.getElementById('save-profile');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // User data
    let currentUser = null;
    let userData = {
        name: 'Guest',
        age: 30,
        weight: 75,
        height: 175,
        activityLevel: 'moderate',
        waterGoal: 8,
        calorieGoal: 2000,
        waterConsumed: 0,
        caloriesConsumed: 0,
        activityMinutes: 30
    };

    // Application data
    let hydrationData = [];
    let nutritionData = [];
    let workoutData = [];
    let isLoading = false;

    // Initialize localStorage users if not exists
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }

    function initializeUI() {
        // Set up avatar error handling
        if (userAvatar) {
            userAvatar.onerror = function() {
                this.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJzNC40NzcgMTAgMTAgMTAgMTAtNC40NzcgMTAtMTBTMTcuNTIzIDIgMTIgMnptMCAyYzQuNDE4IDAgOCAzLjU4MiA4IDhzLTMuNTgyIDgtOCA4LTgtMy41ODItOC04IDMuNTgyLTggOC04eiIvPjxwYXRoIGQ9Ik0xMiA1Yy0xLjY1NyAwLTMgMS4zNDMtMyAzczEuMzQzIDMgMyAzIDMtMS4zNDMgMy0zLTEuMzQzLTMtMy0zeiIvPjxwYXRoIGQ9Ik0xMiAxM2MtMy42IDAtNi44IDEuODktNi44IDQuMlYxOWgxMy42di0xLjhjMC0yLjMxLTMuMi00LjItNi44LTQuMnoiLz48L3N2Zz4=';
            };
        }

        // Show content
        document.querySelector('.container').classList.add('loaded');
        
        // Hide loading overlay after a short delay
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            setTimeout(() => {
                loadingOverlay.style.opacity = '0';
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                    document.querySelector('.container').style.opacity = '1';
                }, 500);
            }, 300);
        }
    }

    function init() {
        console.log('Initializing app...');
        
        // Verify critical elements exist
        const criticalElements = [
            'login-modal', 'login-form', 'register-form',
            'water-progress', 'calories-progress', 'activity-meter',
            'login-btn', 'logout-btn'
        ];
        
        criticalElements.forEach(id => {
            if (!document.getElementById(id)) {
                console.error(`Critical element #${id} not found!`);
            }
        });

        checkAuthStatus();
        setupEventListeners();
        generateWorkoutPlan();
    }

    // Check authentication status
    function checkAuthStatus() {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                currentUser = JSON.parse(localStorage.getItem('userData'));
                if (currentUser) {
                    showAppContent();
                    loadUserData();
                    if (loginBtn) loginBtn.style.display = 'none';
                    if (logoutBtn) logoutBtn.style.display = 'block';
                } else {
                    showLoginModal();
                    if (loginBtn) loginBtn.style.display = 'block';
                    if (logoutBtn) logoutBtn.style.display = 'none';
                }
            } catch (e) {
                console.error('Error parsing user data:', e);
                showLoginModal();
                if (loginBtn) loginBtn.style.display = 'block';
                if (logoutBtn) logoutBtn.style.display = 'none';
            }
        } else {
            if (loginBtn) loginBtn.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            showLoginModal();
        }
    }

    // Show login modal
    function showLoginModal() {
        if (loginModal) loginModal.style.display = 'flex';
        if (document.querySelector('.container')) document.querySelector('.container').style.display = 'none';
        if (loginContent) loginContent.style.display = 'block';
        if (registerContent) registerContent.style.display = 'none';
    }

    function showAppContent() {
        if (loginModal) loginModal.style.display = 'none';
        if (document.querySelector('.container')) document.querySelector('.container');
        if (usernameDisplay) usernameDisplay.textContent = currentUser ? currentUser.name : 'Guest';
        if (loginBtn) loginBtn.style.display = currentUser ? 'none' : 'block';
        if (logoutBtn) logoutBtn.style.display = currentUser ? 'block' : 'none';
        updateDashboard();
    }

    // Login user
    async function loginUser(email, password) {
        if (isLoading) return;
        isLoading = true;
        
        try {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                currentUser = user;
                localStorage.setItem('authToken', 'mock-token');
                localStorage.setItem('userData', JSON.stringify(user));
                
                // Initialize user data if not exists
                if (!localStorage.getItem(`user_${user.id}_data`)) {
                    localStorage.setItem(`user_${user.id}_data`, JSON.stringify({
                        name: user.name,
                        age: 30,
                        weight: 75,
                        height: 175,
                        activityLevel: 'moderate',
                        waterGoal: 8,
                        calorieGoal: 2000,
                        waterConsumed: 0,
                        caloriesConsumed: 0,
                        activityMinutes: 30
                    }));
                }
                
                showAppContent();
                loadUserData();
            } else {
                showError('Invalid email or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Login failed. Please try again.');
        } finally {
            isLoading = false;
        }
    }

    // Register new user
    async function registerUser(name, email, password) {
        if (isLoading) return;
        isLoading = true;
        
        try {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            
            if (users.some(u => u.email === email)) {
                showError('Email already registered');
                return;
            }
            
            const newUser = {
                id: Date.now().toString(),
                name,
                email,
                password, // Note: In production, never store plain text passwords
                createdAt: new Date().toISOString()
            };
            
            // Save to localStorage
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            localStorage.setItem('authToken', 'mock-token');
            localStorage.setItem('userData', JSON.stringify(newUser));
            currentUser = newUser;
            
            // Initialize user data
            userData = { 
                name: newUser.name,
                age: 30,
                weight: 75,
                height: 175,
                activityLevel: 'moderate',
                waterGoal: 8,
                calorieGoal: 2000,
                waterConsumed: 0,
                caloriesConsumed: 0,
                activityMinutes: 30
            };
            localStorage.setItem(`user_${newUser.id}_data`, JSON.stringify(userData));
            
            showAppContent();
            showSuccess('Registration successful! Please set up your profile.');
            activateTab('profile');
        } catch (error) {
            console.error('Registration error:', error);
            showError('Registration failed. Please try again.');
        } finally {
            isLoading = false;
        }
    }

    // Logout user
    function logoutUser() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            currentUser = null;
            resetUserData();
            if (loginBtn) loginBtn.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            showLoginModal();
        }
    }

    // Reset user data
    function resetUserData() {
        userData = {
            name: 'Guest',
            age: 30,
            weight: 75,
            height: 175,
            activityLevel: 'moderate',
            waterGoal: 8,
            calorieGoal: 2000,
            waterConsumed: 0,
            caloriesConsumed: 0,
            activityMinutes: 30
        };
        hydrationData = [];
        nutritionData = [];
        workoutData = [];
        updateDashboard();
        updateProfileForm();
    }

    // Load user data
    function loadUserData() {
        if (!currentUser) return;
        
        try {
            // Load user profile data
            const userProfileData = JSON.parse(localStorage.getItem(`user_${currentUser.id}_data`));
            if (userProfileData) {
                userData = { ...userData, ...userProfileData };
                updateProfileForm();
                updateDashboard();
            }
            
            // Load hydration data
            const hydrationEntries = JSON.parse(localStorage.getItem(`user_${currentUser.id}_hydration`)) || [];
            hydrationData = hydrationEntries;
            updateHydrationLog();
            
            // Load nutrition data
            const nutritionEntries = JSON.parse(localStorage.getItem(`user_${currentUser.id}_nutrition`)) || [];
            nutritionData = nutritionEntries;
            updateNutritionLog();
            
            // Load workout data
            const workoutEntries = JSON.parse(localStorage.getItem(`user_${currentUser.id}_workouts`)) || [];
            workoutData = workoutEntries;
            updateWorkoutLog();
            
        } catch (error) {
            console.error('Error loading user data:', error);
            showError('Failed to load user data');
        }
    }

    // Setup event listeners
    function setupEventListeners() {
        // Auth events
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                if (!email || !password) {
                    showError('Please fill in all fields');
                    return;
                }
                loginUser(email, password);
            });
        }
        
        if (registerForm) {
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const name = document.getElementById('register-name').value;
                const email = document.getElementById('register-email').value;
                const password = document.getElementById('register-password').value;
                if (!name || !email || !password) {
                    showError('Please fill in all fields');
                    return;
                }
                registerUser(name, email, password);
            });
        }
        
        if (showRegister) {
            showRegister.addEventListener('click', function(e) {
                e.preventDefault();
                if (loginContent) loginContent.style.display = 'none';
                if (registerContent) registerContent.style.display = 'block';
            });
        }
        
        if (showLogin) {
            showLogin.addEventListener('click', function(e) {
                e.preventDefault();
                if (registerContent) registerContent.style.display = 'none';
                if (loginContent) loginContent.style.display = 'block';
            });
        }
        
        if (loginBtn) {
            loginBtn.addEventListener('click', showLoginModal);
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logoutUser);
        }
        
        // User avatar click
        if (userAvatar) {
            userAvatar.addEventListener('click', function() {
                if (currentUser) {
                    logoutUser();
                } else {
                    showLoginModal();
                }
            });
        }

        // Tab navigation
        tabLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = link.getAttribute('data-tab');
                activateTab(tabId);
            });
        });

        // Hydration
        if (addWaterBtn) {
            addWaterBtn.addEventListener('click', addWaterIntake);
        }

        // Nutrition
        if (addMealBtn) {
            addMealBtn.addEventListener('click', addMeal);
        }
        
        mealTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                mealTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                updateNutritionLog();
            });
        });

        // Workouts
        if (startWorkoutBtn) {
            startWorkoutBtn.addEventListener('click', startWorkout);
        }

        // Profile
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', saveProfile);
        }

        // AI Assistant
        if (aiButton) {
            aiButton.addEventListener('click', toggleAIChat);
        }
        
        if (closeChat) {
            closeChat.addEventListener('click', toggleAIChat);
        }
        
        if (aiSend) {
            aiSend.addEventListener('click', sendAIQuestion);
        }
        
        if (aiQuestion) {
            aiQuestion.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendAIQuestion();
            });
        }
    }

    // Activate tab
    function activateTab(tabId) {
        tabLinks.forEach(link => link.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        const activeLink = document.querySelector(`.sidebar li[data-tab="${tabId}"]`);
        const activeContent = document.getElementById(tabId);
        
        if (activeLink) activeLink.classList.add('active');
        if (activeContent) activeContent.classList.add('active');
        
        // Special handling for certain tabs
        if (tabId === 'workouts') {
            generateWorkoutPlan();
        }
    }

    // Update dashboard
    function updateDashboard() {
        // Update water progress
        if (waterProgress) {
            const waterPercentage = Math.min((userData.waterConsumed / userData.waterGoal) * 100, 100);
            waterProgress.style.background = `conic-gradient(var(--accent-color) ${waterPercentage}%, #e0e0e0 ${waterPercentage}%)`;
            if (waterProgress.querySelector('span')) {
                waterProgress.querySelector('span').textContent = `${Math.round(waterPercentage)}%`;
            }
            if (document.getElementById('water-consumed')) {
                document.getElementById('water-consumed').textContent = userData.waterConsumed;
            }
            if (document.getElementById('water-goal')) {
                document.getElementById('water-goal').textContent = userData.waterGoal;
            }
        }
        
        // Update calories progress
        if (caloriesProgress) {
            const caloriesPercentage = Math.min((userData.caloriesConsumed / userData.calorieGoal) * 100, 100);
            caloriesProgress.style.width = `${caloriesPercentage}%`;
            if (document.getElementById('calories-consumed')) {
                document.getElementById('calories-consumed').textContent = userData.caloriesConsumed;
            }
            if (document.getElementById('calories-goal')) {
                document.getElementById('calories-goal').textContent = userData.calorieGoal;
            }
        }
        
        // Update activity level
        if (activityMeter) {
            const activityPercentage = Math.min((userData.activityMinutes / 60) * 100, 100);
            activityMeter.style.width = `${activityPercentage}%`;
            if (document.getElementById('activity-text')) {
                document.getElementById('activity-text').textContent = 
                    activityPercentage < 25 ? 'Sedentary' : 
                    activityPercentage < 50 ? 'Lightly Active' : 
                    activityPercentage < 75 ? 'Moderately Active' : 'Very Active';
            }
        }
        
        // Update recommendations
        updateRecommendations();
        
        // Update profile stats
        updateProfileStats();
    }

    // Update recommendations
    function updateRecommendations() {
        const hydrationRec = document.getElementById('hydration-recommendation');
        const nutritionRec = document.getElementById('nutrition-recommendation');
        const workoutRec = document.getElementById('workout-recommendation');
        
        if (!hydrationRec || !nutritionRec || !workoutRec) return;
        
        hydrationRec.textContent = `Drink at least ${userData.waterGoal} cups of water today`;
        
        if (userData.caloriesConsumed < userData.calorieGoal * 0.5) {
            nutritionRec.textContent = 'You need to eat more to reach your daily goal';
        } else if (userData.caloriesConsumed < userData.calorieGoal * 0.8) {
            nutritionRec.textContent = 'Include more protein and vegetables in your meals';
        } else {
            nutritionRec.textContent = 'Great job! You\'re close to your calorie goal';
        }
        
        if (userData.activityMinutes < 30) {
            workoutRec.textContent = 'Try to get at least 30 minutes of activity today';
        } else if (userData.activityMinutes < 60) {
            workoutRec.textContent = 'Good progress! Aim for 60 minutes today';
        } else {
            workoutRec.textContent = 'Excellent activity level! Keep it up';
        }
    }

    // Add water intake
    function addWaterIntake() {
        if (!currentUser) {
            showError('Please login to track water intake');
            return;
        }
        
        const amount = parseInt(waterAmountInput.value) || 1;
        if (amount <= 0) {
            showError('Please enter a positive amount');
            return;
        }
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        try {
            const newEntry = {
                amount: amount,
                time: timestamp,
                date: new Date().toISOString()
            };
            
            // Save to localStorage
            hydrationData.push(newEntry);
            localStorage.setItem(`user_${currentUser.id}_hydration`, JSON.stringify(hydrationData));
            
            userData.waterConsumed += amount;
            localStorage.setItem(`user_${currentUser.id}_data`, JSON.stringify(userData));
            
            updateHydrationLog();
            updateDashboard();
            if (waterAmountInput) waterAmountInput.value = '1';
        } catch (error) {
            console.error('Error adding water intake:', error);
            showError('Failed to add water intake');
        }
    }

    // Update hydration log
    function updateHydrationLog() {
        if (!waterLog) return;
        
        waterLog.innerHTML = '';
        
        const today = new Date().toDateString();
        const todayHydration = hydrationData.filter(entry => 
            new Date(entry.date).toDateString() === today);
        
        if (todayHydration.length === 0) {
            waterLog.innerHTML = '<li>No water intake recorded today</li>';
            return;
        }
        
        todayHydration.forEach(entry => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${entry.amount} cups</span>
                <span>${entry.time}</span>
            `;
            waterLog.appendChild(li);
        });
    }

    // Add meal
    function addMeal() {
        if (!currentUser) {
            showError('Please login to track meals');
            return;
        }
        
        const type = mealTypeSelect ? mealTypeSelect.value : 'meal';
        const name = mealNameInput ? mealNameInput.value.trim() : '';
        const calories = parseInt(mealCaloriesInput ? mealCaloriesInput.value : 0) || 0;
        
        if (!name) {
            showError('Please enter a meal name');
            return;
        }
        
        if (calories <= 0) {
            showError('Please enter valid calories');
            return;
        }
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        try {
            const newEntry = {
                type: type,
                name: name,
                calories: calories,
                time: timestamp,
                date: new Date().toISOString()
            };
            
            // Save to localStorage
            nutritionData.push(newEntry);
            localStorage.setItem(`user_${currentUser.id}_nutrition`, JSON.stringify(nutritionData));
            
            userData.caloriesConsumed += calories;
            localStorage.setItem(`user_${currentUser.id}_data`, JSON.stringify(userData));
            
            updateNutritionLog();
            updateDashboard();
            
            if (mealNameInput) mealNameInput.value = '';
            if (mealCaloriesInput) mealCaloriesInput.value = '';
        } catch (error) {
            console.error('Error adding meal:', error);
            showError('Failed to add meal');
        }
    }

    // Update nutrition log
    function updateNutritionLog() {
        if (!mealLog) return;
        
        mealLog.innerHTML = '';
        
        const today = new Date().toDateString();
        const todayNutrition = nutritionData.filter(entry => 
            new Date(entry.date).toDateString() === today);
        
        const activeTab = document.querySelector('.meal-tab.active')?.getAttribute('data-meal') || 'all';
        const filteredNutrition = activeTab === 'all' ? 
            todayNutrition : 
            todayNutrition.filter(entry => entry.type === activeTab);
        
        if (filteredNutrition.length === 0) {
            mealLog.innerHTML = '<li>No meals recorded</li>';
            return;
        }
        
        filteredNutrition.forEach(entry => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="meal-type">${entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}</span>
                <span>${entry.name}</span>
                <span class="meal-calories">${entry.calories} kcal</span>
                <span>${entry.time}</span>
            `;
            mealLog.appendChild(li);
        });
    }

    // Generate workout plan
    function generateWorkoutPlan() {
        if (!workoutPlan) return;
        
        workoutPlan.innerHTML = '';
        
        let workoutExercises = [];
        const intensity = userData.activityLevel || 'moderate';
        
        switch (intensity) {
            case 'sedentary':
                workoutExercises = [
                    '10-minute warm-up walk',
                    '3 sets of 10 bodyweight squats',
                    '3 sets of 5 push-ups (knees if needed)',
                    '1-minute plank',
                    '10-minute cool-down walk'
                ];
                break;
            case 'light':
                workoutExercises = [
                    '5-minute dynamic stretching',
                    '3 sets of 12 bodyweight squats',
                    '3 sets of 8 push-ups',
                    '3 sets of 10 lunges (each leg)',
                    '2 sets of 30-second planks',
                    '5-minute cool-down stretching'
                ];
                break;
            case 'moderate':
                workoutExercises = [
                    '5-minute jump rope',
                    '4 sets of 15 squats',
                    '4 sets of 10 push-ups',
                    '3 sets of 12 lunges (each leg)',
                    '3 sets of 10 dumbbell rows (if available)',
                    '2-minute plank',
                    '5-minute cool-down stretching'
                ];
                break;
            default:
                workoutExercises = [
                    '10-minute HIIT warm-up',
                    '5 sets of 20 squats',
                    '5 sets of 15 push-ups',
                    '4 sets of 15 lunges (each leg)',
                    '4 sets of 12 dumbbell rows',
                    '3 sets of 1-minute planks',
                    '10-minute cool-down stretching'
                ];
        }
        
        workoutExercises.forEach(exercise => {
            const li = document.createElement('li');
            li.textContent = exercise;
            workoutPlan.appendChild(li);
        });
    }

    // Start workout
    function startWorkout() {
        if (!currentUser) {
            showError('Please login to track workouts');
            return;
        }
        
        try {
            const workout = {
                type: 'recommended',
                duration: 30,
                intensity: userData.activityLevel,
                date: new Date().toISOString()
            };
            
            // Save to localStorage
            workoutData.push(workout);
            localStorage.setItem(`user_${currentUser.id}_workouts`, JSON.stringify(workoutData));
            
            userData.activityMinutes += 30;
            localStorage.setItem(`user_${currentUser.id}_data`, JSON.stringify(userData));
            
            updateWorkoutLog();
            updateDashboard();
            showSuccess('Workout started! Track your progress for 30 minutes.');
        } catch (error) {
            console.error('Error starting workout:', error);
            showError('Failed to start workout');
        }
    }

    // Update workout log
    function updateWorkoutLog() {
        if (!workoutLog) return;
        
        workoutLog.innerHTML = '';
        
        if (workoutData.length === 0) {
            workoutLog.innerHTML = '<li>No workouts recorded yet</li>';
            return;
        }
        
        // Show only the last 5 workouts
        const recentWorkouts = workoutData.slice(-5).reverse();
        
        recentWorkouts.forEach(workout => {
            const li = document.createElement('li');
            const workoutDate = new Date(workout.date);
            li.innerHTML = `
                <span>${workoutDate.toLocaleDateString()}</span>
                <span>${workout.type} workout</span>
                <span>${workout.duration} minutes</span>
                <span>${workout.intensity} intensity</span>
            `;
            workoutLog.appendChild(li);
        });
    }

    // Update profile form
    function updateProfileForm() {
        if (!profileForm) return;
        
        if (document.getElementById('profile-name')) {
            document.getElementById('profile-name').value = userData.name || '';
        }
        if (document.getElementById('profile-age')) {
            document.getElementById('profile-age').value = userData.age || '';
        }
        if (document.getElementById('profile-weight')) {
            document.getElementById('profile-weight').value = userData.weight || '';
        }
        if (document.getElementById('profile-height')) {
            document.getElementById('profile-height').value = userData.height || '';
        }
        if (document.getElementById('profile-activity')) {
            document.getElementById('profile-activity').value = userData.activityLevel || 'moderate';
        }
    }

    // Save profile
    function saveProfile() {
        if (!currentUser) {
            showError('Please login to save profile');
            return;
        }
        
        try {
            const updatedData = {
                name: document.getElementById('profile-name') ? document.getElementById('profile-name').value || userData.name : userData.name,
                age: parseInt(document.getElementById('profile-age') ? document.getElementById('profile-age').value : userData.age) || userData.age,
                weight: parseFloat(document.getElementById('profile-weight') ? document.getElementById('profile-weight').value : userData.weight) || userData.weight,
                height: parseInt(document.getElementById('profile-height') ? document.getElementById('profile-height').value : userData.height) || userData.height,
                activityLevel: document.getElementById('profile-activity') ? document.getElementById('profile-activity').value || userData.activityLevel : userData.activityLevel
            };
            
            // Calculate water goal (0.033 * weight in kg)
            updatedData.waterGoal = Math.round(updatedData.weight * 0.033 * 4) / 4;
            
            // Calculate calorie goal using Harris-Benedict equation
            const bmr = 88.362 + (13.397 * updatedData.weight) + 
                        (4.799 * updatedData.height) - (5.677 * updatedData.age);
            
            const activityFactors = {
                'sedentary': 1.2,
                'light': 1.375,
                'moderate': 1.55,
                'active': 1.725,
                'very-active': 1.9
            };
            
            updatedData.calorieGoal = Math.round(bmr * activityFactors[updatedData.activityLevel]);
            
            // Save to user data
            userData = { ...userData, ...updatedData };
            localStorage.setItem(`user_${currentUser.id}_data`, JSON.stringify(userData));
            
            updateDashboard();
            generateWorkoutPlan();
            showSuccess('Profile saved successfully!');
        } catch (error) {
            console.error('Error saving profile:', error);
            showError('Failed to save profile');
        }
    }

    // Update profile stats
    function updateProfileStats() {
        // Calculate BMI
        const heightInMeters = userData.height / 100;
        const bmi = userData.weight / (heightInMeters * heightInMeters);
        if (document.getElementById('bmi-value')) {
            document.getElementById('bmi-value').textContent = bmi.toFixed(1);
        }
        
        // Update other stats
        if (document.getElementById('calorie-goal-value')) {
            document.getElementById('calorie-goal-value').textContent = userData.calorieGoal;
        }
        if (document.getElementById('water-goal-value')) {
            document.getElementById('water-goal-value').textContent = `${userData.waterGoal} cups`;
        }
    }

  // Get DOM elements
// const aiButton = document.getElementById('ai-button');
// const closeChat = document.getElementById('close-chat');
// const aiChat = document.getElementById('ai-chat');
// const aiMessages = document.getElementById('ai-messages');
// const aiQuestion = document.getElementById('ai-question');
// const aiSend = document.getElementById('ai-send');

// Toggle AI Chat visibility
function toggleAIChat() {
    aiChat.classList.toggle('active');
    if (aiChat.classList.contains('active') && aiQuestion) {
        aiQuestion.focus();
    }
}

// Close AI Chat
function closeAIChat() {
    aiChat.classList.remove('active');
}

// Send AI Question
function sendAIQuestion() {
    const question = aiQuestion.value.trim().toLowerCase();
    if (!question) return;

    addAIMessage(question, 'user');
    aiQuestion.value = '';

    setTimeout(() => {
        const response = getAIResponse(question);
        addAIMessage(response, 'bot');
    }, 1000);
}

// Add message to chat window
function addAIMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('ai-message', sender);

    if (typeof text === 'object') {
        // Format meal-wise responses if it's an object (i.e., disease match)
        messageDiv.innerHTML = `
            <strong>Morning:</strong> ${text.morning}<br>
            <strong>Afternoon:</strong> ${text.afternoon}<br>
            <strong>Evening:</strong> ${text.evening}
        `;
    } else {
        // Simple text message
        messageDiv.textContent = text;
    }

    aiMessages.appendChild(messageDiv);
    aiMessages.scrollTop = aiMessages.scrollHeight;
}

// AI Response logic
function getAIResponse(question) {
    for (const disease in diseaseFoodSuggestions) {
        if (question.includes(disease)) {
            return diseaseFoodSuggestions[disease];
        }
    }
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}

// Event listeners
aiButton.addEventListener('click', toggleAIChat);
closeChat.addEventListener('click', closeAIChat);
aiSend.addEventListener('click', sendAIQuestion);
aiQuestion.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        sendAIQuestion();
    }
});

// Disease-to-Food mapping (keep your existing mapping here)
const diseaseFoodSuggestions = {
    // your full dictionary (already well-structured)
    "sugar": {
        morning: "Start with methi (fenugreek) water, oats porridge with nuts, and a boiled egg.",
        afternoon: "Brown rice with sambar, bitter gourd curry, and a small bowl of curd.",
        evening: "Sprouted green gram salad with lemon, or a handful of nuts.",
      "workout_exercises": "Jump squats: low intensity, avoid if neuropathy present. Push-ups: modified push-ups if wrist or neuropathy issues. Triceps dips: use chair with support, avoid overstress."
    
      },
    "diabetes": {
        morning: "Whole wheat dosa or multigrain chapati with low-oil chutney.",
        afternoon: "Millet rice, vegetable kurma with high-fiber vegetables like beans or bottle gourd.",
        evening: "Roasted chana, a cup of green tea, or low-GI fruit like guava.",
        "workout_exercises": "Jump squats: start slow, watch blood sugar response. Push-ups: good for upper body strength; monitor any cramps. Triceps dips: gentle reps, avoid excessive strain."
    },
     "pressure": {
    morning: "Banana smoothie without sugar, whole wheat bread with peanut butter.",
    afternoon: "Brown rice, beetroot poriyal, garlic rasam, and buttermilk.",
    evening: "Steamed sweet potato or boiled corn with lemon and pepper."
  },
  "cholesterol": {
    morning: "Oats with almond milk and chia seeds.",
    afternoon: "Grilled vegetables with quinoa or broken wheat and olive oil dressing.",
    evening: "Handful of almonds or walnuts, green tea with lemon."
  },
  "obesity": {
    morning: "Boiled moong dal chilla, cucumber slices, and a fruit.",
    afternoon: "Boiled veggies with chapati (no ghee), mixed dal, and green salad.",
    evening: "Clear soup or roasted chickpeas with lemon juice."
  },
  "gastric": {
    morning: "Warm water with honey, soft-cooked idli with coconut chutney.",
    afternoon: "Rice with curd, boiled banana stem or ash gourd curry.",
    evening: "Mashed banana, or a cup of warm milk with turmeric."
  },
  "constipation": {
    morning: "Papaya or figs, and oats porridge with flax seeds.",
    afternoon: "Brown rice, spinach curry, and dal with ghee.",
    evening: "Warm water, fruit salad with banana and orange slices."
  },
  "thyroid": {
    morning: "Eggs, whole grain toast, and a glass of milk with iodized salt.",
    afternoon: "Fish curry (not fried), rice, and stir-fried greens.",
    evening: "Boiled sweet potato or nuts and seeds trail mix."
  },
  "anemia": {
    morning: "Dates and jaggery with soaked almonds, spinach omelet.",
    afternoon: "Beetroot rice with lemon, palak paneer (less oil).",
    evening: "Pomegranate or orange juice with roasted groundnuts.",
    },
  "ulcer": {
    morning: "Banana smoothie with boiled rice water.",
    afternoon: "Rice gruel with coconut milk and steamed vegetables.",
    evening: "Tender coconut water and soft mashed rice."
  },
  "liver problem": {
    morning: "Leafy green smoothie with turmeric and lemon.",
    afternoon: "Steamed veggies, rice, and dhal without spices.",
    evening: "Fruit salad (apple, pear), or herbal tea."
  },
  "kidney problem": {
    morning: "Apple slices, upma with cauliflower and carrots.",
    afternoon: "Rice with bottle gourd curry, and low-salt rasam.",
    evening: "Roasted makhana (fox nuts) or fruit like guava."
  },
  "fever": {
    morning: "Rice kanji (porridge) with salt and cumin.",
    afternoon: "Khichdi with ghee and soft-cooked veggies.",
    evening: "Warm herbal tea or jeera water with plain toast."
  },
  "cold": {
    morning: "Turmeric milk and pepper rasam with idli.",
    afternoon: "Hot tomato soup with rice and ginger thuvayal.",
    evening: "Ginger tea and a boiled egg or steamed veggies."
  },
  "cough": {
    morning: "Honey and tulsi leaves, warm water, and idli.",
    afternoon: "Rice, ginger rasam, and cooked greens.",
    evening: "Tulsi tea, roasted garlic, and dry fruits like raisins."
  },
  "acidity": {
    morning: "Oatmeal with banana and warm milk.",
    afternoon: "Soft rice with ghee, coconut chutney, and vegetables.",
    evening: "Coconut water or a glass of buttermilk."
  },
  "weakness": {
    morning: "Dry fruits, boiled eggs, and banana.",
    afternoon: "Rice, dal, paneer curry, and a glass of milk.",
    evening: "Milk with honey or protein-rich snack (like chana)."
  },
  "depression": {
    morning: "Banana and walnut smoothie with flax seeds.",
    afternoon: "Omega-3 rich fish curry with red rice and green salad.",
    evening: "Dark chocolate or warm milk with saffron."
  },
  "stress": {
    morning: "Green tea with oats and berries.",
    afternoon: "Brown rice, dal, and spinach sabzi.",
    evening: "Chamomile tea or banana with almonds."
  },
  "skin problem": {
    morning: "Aloe vera juice, soaked almonds, and cucumber slices.",
    afternoon: "Brown rice, ridge gourd curry, and dal.",
    evening: "Coconut water and fruit salad with oranges and pomegranate."
  },
  "hair fall": {
    morning: "Amla juice, curry leaves in warm water, and egg white.",
    afternoon: "Ragi balls or chapati with sprouts curry.",
    evening: "Boiled sweet corn or pumpkin seeds."
  },
  "eye problem": {
    morning: "Smoothie with spinach, kale, and orange juice, oatmeal topped with blueberries, and a handful of walnuts.",
    afternoon: "Quinoa salad with carrots, bell peppers, and a lemon vinaigrette, and a side of mixed greens.",
    evening: "Baked salmon with a side of steamed broccoli and sweet potatoes, and a small serving of dark chocolate."
  },
  "heat problem": {
    morning: "Chilled fruit salad with watermelon, cucumber, and mint, overnight oats with yogurt and berries, and a glass of coconut water.",
    afternoon: "Quinoa salad with mixed greens, cherry tomatoes, and a light vinaigrette, and a side of chilled cucumber soup.",
    evening: "Grilled chicken with a side of steamed vegetables and brown rice, and a refreshing herbal iced tea."
  },
  "hypertension": {
    morning: "Oatmeal with berries and a sprinkle of cinnamon, whole grain toast with avocado, boiled egg, and a glass of low-fat milk.",
    afternoon: "Quinoa salad with chickpeas, cucumber, lemon dressing, steamed broccoli, grilled chicken, and mixed vegetable stir-fry.",
    evening: "Baked fish with asparagus, small sweet potato, herbal tea, fruit salad, and a handful of nuts."
  },
  "pcos": {
    morning: "Smoothie with spinach, flaxseeds, almond milk, and chia seeds, boiled eggs, and green tea.",
    afternoon: "Quinoa salad with cucumber, tomatoes, avocado, grilled chicken, and steamed vegetables.",
    evening: "Roasted makhana, herbal tea, fruit salad with berries, and a handful of nuts."
  },
  "heart disease": {
    morning: "Oatmeal with blueberries, flaxseeds, walnuts, and green tea.",
    afternoon: "Steamed vegetables with brown rice, grilled salmon, and mixed salad.",
    evening: "Handful of almonds, herbal tea, quinoa salad with veggies, and apples."
  },
  "pcod": {
    morning: "Smoothie with kale, chia seeds, banana, and almond milk, boiled eggs, and herbal tea.",
    afternoon: "Whole wheat chapati, lentil curry, cucumber salad, and curved rice.",
    evening: "Mixed nuts, fruit salad with orange and pomegranate, and warm milk with turmeric."
  },
   "tooth_pain": {
    morning: "Warm milk with turmeric, oatmeal with mashed banana, honey, and cinnamon.",
    afternoon: "Soft cooked khichdi, mashed vegetables, curd rice, and steamed carrots.",
    evening: "Chamomile tea, fruit juice without sugar, and soft fruit salad."
  },
  "workout": {
    morning: "Protein smoothie with banana, spinach, and protein powder, and a slice of whole grain toast.",
    afternoon: "Grilled chicken or tofu salad with mixed greens, cherry tomatoes, and a light vinaigrette.",
    evening: "Quinoa bowl with black beans, corn, avocado, and salsa, and a handful of nuts."
  }



    // ... (include the rest of your data here)
};

// Fallback generic messages
const fallbackResponses = [
    "I'm still learning. Please try asking about a specific health condition.",
    "Sorry, I didn't understand that. Could you rephrase?",
    "Let me know your health issue so I can suggest relevant foods."
];

// Get BMI Category
function getBMICategory(weight, height) {
    const bmi = weight / ((height / 100) ** 2);
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'healthy';
    if (bmi < 30) return 'overweight';
    return 'obese';
}

// Show error message
function showError(message) {
    alert(message); // Can be replaced with toast/notification
}

// Show success message
function showSuccess(message) {
    alert(message); // Can be replaced with toast/notification
}

// Initialization
try {
    initializeUI();
    init();
} catch (error) {
    console.error('Initialization error:', error);
    alert('Failed to initialize the app. Please check the console for details.');
}
});