// food-suggestions.js
class FoodSuggestions {
    constructor(apiKey) {
      this.apiKey = apiKey;
      this.baseUrl = 'https://api.spoonacular.com/recipes';
      this.cache = new Map();
      this.currentPage = 1;
      this.totalResults = 0;
      this.pageSize = 12;
    }
  
    async searchRecipes(params) {
      const cacheKey = JSON.stringify(params);
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }
  
      try {
        const query = new URLSearchParams({
          apiKey: this.apiKey,
          cuisine: 'indian',
          addRecipeInformation: true,
          instructionsRequired: true,
          fillIngredients: true,
          ...params,
          number: this.pageSize,
          offset: (this.currentPage - 1) * this.pageSize
        });
  
        const response = await fetch(`${this.baseUrl}/complexSearch?${query}`);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        
        const data = await response.json();
        this.totalResults = data.totalResults;
        this.cache.set(cacheKey, data);
        return data;
      } catch (error) {
        console.error('API Error:', error);
        return { results: [], totalResults: 0 };
      }
    }
  
    async getRecipeDetails(id) {
      try {
        const response = await fetch(
          `${this.baseUrl}/${id}/information?apiKey=${this.apiKey}`
        );
        return await response.json();
      } catch (error) {
        console.error('Details Error:', error);
        return null;
      }
    }
  }
  
  class FoodUI {
    constructor() {
      this.foodApi = new FoodSuggestions('c2d1544978b140ddaf69fbd965048dc7');
      this.mealGrid = document.getElementById('meal-grid');
      this.searchInput = document.getElementById('food-search');
      this.sortSelect = document.getElementById('sort-select');
      this.resultsCount = document.getElementById('results-count');
      this.loadingSpinner = document.getElementById('loading-spinner');
      this.prevPageBtn = document.getElementById('prev-page');
      this.nextPageBtn = document.getElementById('next-page');
      this.currentPageEl = document.getElementById('current-page');
      this.recipeModal = document.getElementById('recipe-modal');
      
      this.currentDiet = 'all';
      this.currentQuery = '';
      this.currentSort = 'popularity';
      this.debounceTimeout = null;
  
      this.initialize();
    }
  
    initialize() {
      // Event Listeners
      document.querySelectorAll('.filter-btn').forEach(btn => 
        btn.addEventListener('click', () => this.handleFilterClick(btn))
      );
  
      this.searchInput.addEventListener('input', e => 
        this.handleSearchInput(e.target.value)
      );
  
      this.sortSelect.addEventListener('change', e => 
        this.handleSortChange(e.target.value)
      );
  
      this.prevPageBtn.addEventListener('click', () => 
        this.handlePagination(-1)
      );
  
      this.nextPageBtn.addEventListener('click', () => 
        this.handlePagination(1)
      );
  
      this.recipeModal.querySelector('.close-modal').addEventListener('click', () => 
        this.closeModal()
      );
  
      this.loadRecipes();
    }
  
    async loadRecipes() {
      this.showLoading();
      
      const params = {
        diet: this.currentDiet === 'all' ? '' : this.currentDiet,
        query: this.currentQuery,
        sort: this.currentSort,
        sortDirection: this.currentSort === 'time' ? 'asc' : 'desc'
      };
  
      const { results, totalResults } = await this.foodApi.searchRecipes(params);
      
      this.totalResults = totalResults;
      this.updatePagination();
      this.displayRecipes(results);
      this.hideLoading();
    }
  
    displayRecipes(recipes) {
      this.mealGrid.innerHTML = recipes.map(recipe => `
        <div class="meal-card" data-id="${recipe.id}">
          <div class="meal-image" 
               style="background-image: url(${recipe.image})">
            <div class="meal-tags">
              ${recipe.vegetarian ? '<span class="meal-tag veg">🟢 Veg</span>' : ''}
              ${recipe.vegan ? '<span class="meal-tag vegan">🌱 Vegan</span>' : ''}
              ${recipe.glutenFree ? '<span class="meal-tag gf">🌾 GF</span>' : ''}
            </div>
          </div>
          <div class="meal-info">
            <h3 class="meal-title">${recipe.title}</h3>
            <div class="meal-details">
              <span>⏱ ${recipe.readyInMinutes} mins</span>
              <span>👥 ${recipe.servings} servings</span>
            </div>
            <div class="meal-stats">
              <span>🔥 ${recipe.nutrition?.nutrients.find(n => n.name === 'Calories')?.amount || 'N/A'} kcal</span>
              <span>💪 ${recipe.nutrition?.nutrients.find(n => n.name === 'Protein')?.amount || 'N/A'}g protein</span>
            </div>
          </div>
        </div>
      `).join('');
  
      this.resultsCount.textContent = `Showing ${recipes.length} of ${this.totalResults} results`;
    }
  
    async showRecipeDetails(recipeId) {
      const details = await this.foodApi.getRecipeDetails(recipeId);
      if (!details) return;
  
      this.recipeModal.querySelector('.modal-body').innerHTML = `
        <h2>${details.title}</h2>
        <img src="${details.image}" alt="${details.title}">
        <div class="recipe-meta">
          <p>🍴 ${details.servings} servings | ⏱ ${details.readyInMinutes} mins</p>
          <p>📅 ${new Date(details.date).toLocaleDateString()}</p>
        </div>
        
        <div class="ingredients">
          <h3>Ingredients</h3>
          <ul>
            ${details.extendedIngredients.map(i => `
              <li>${i.original}</li>
            `).join('')}
          </ul>
        </div>
        
        <div class="instructions">
          <h3>Instructions</h3>
          ${details.analyzedInstructions[0]?.steps.map(step => `
            <p>${step.number}. ${step.step}</p>
          `).join('')}
        </div>
      `;
  
      this.recipeModal.style.display = 'block';
    }
  
    // Event Handlers
    handleFilterClick(btn) {
      document.querySelectorAll('.filter-btn').forEach(b => 
        b.classList.remove('active')
      );
      btn.classList.add('active');
      this.currentDiet = btn.dataset.diet;
      this.currentPage = 1;
      this.loadRecipes();
    }
  
    handleSearchInput(query) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.currentQuery = query;
        this.currentPage = 1;
        this.loadRecipes();
      }, 500);
    }
  
    handleSortChange(sort) {
      this.currentSort = sort;
      this.loadRecipes();
    }
  
    handlePagination(direction) {
      const totalPages = Math.ceil(this.totalResults / this.foodApi.pageSize);
      this.currentPage = Math.max(1, Math.min(totalPages, this.currentPage + direction));
      this.currentPageEl.textContent = this.currentPage;
      this.loadRecipes();
    }
  
    // Helper Methods
    updatePagination() {
      const totalPages = Math.ceil(this.totalResults / this.foodApi.pageSize);
      this.prevPageBtn.disabled = this.currentPage === 1;
      this.nextPageBtn.disabled = this.currentPage === totalPages;
    }
  
    showLoading() {
      this.loadingSpinner.style.display = 'block';
      this.mealGrid.innerHTML = '';
    }
  
    hideLoading() {
      this.loadingSpinner.style.display = 'none';
    }
  
    closeModal() {
      this.recipeModal.style.display = 'none';
    }
  }
  
  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    const foodUI = new FoodUI();
    
    // Delegate meal card clicks
    document.getElementById('meal-grid').addEventListener('click', (e) => {
      const card = e.target.closest('.meal-card');
      if (card) foodUI.showRecipeDetails(card.dataset.id);
    });
  });