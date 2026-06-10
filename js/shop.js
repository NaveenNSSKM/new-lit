/**
 * Shop Page Controller
 */

// Filter state
let allProducts = [];
let allCategories = [];
let activeFilters = {
  categories: [],
  sizes: [],
  colors: [],
  maxPrice: 80,
  search: ""
};
let sortBy = "newest";

// Parse URL Parameters on Init
const parseUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  const categorySlug = params.get('category');
  const searchQuery = params.get('search');
  
  if (categorySlug) {
    activeFilters.categories = [categorySlug];
  }
  if (searchQuery) {
    activeFilters.search = searchQuery.toLowerCase();
    // Update header search input value
    const searchInput = document.getElementById('header-search-input');
    if (searchInput) searchInput.value = searchQuery;
  }
};

// Initialize Shop Page
const initShop = async () => {
  parseUrlParams();
  
  // Fetch data
  const catRes = await window.dbAPI.getCategories();
  const prodRes = await window.dbAPI.getProducts();

  allCategories = catRes.data || [];
  allProducts = prodRes.data || [];

  // Render static components
  renderCategoryFilters();
  setupFilterEventListeners();
  
  // Apply filtering and render
  applyFiltersAndRender();
};

// Render category filter buttons
const renderCategoryFilters = () => {
  const container = document.getElementById('filter-categories-list');
  if (!container) return;

  container.innerHTML = allCategories.map(cat => {
    const isActive = activeFilters.categories.includes(cat.slug) ? 'active' : '';
    return `
      <button class="category-tab-btn ${isActive}" data-slug="${cat.slug}">
        ${cat.name}
      </button>
    `;
  }).join('');
};

// Event Listeners setup
const setupFilterEventListeners = () => {
  // Category tabs click
  document.getElementById('filter-categories-list')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.category-tab-btn');
    if (btn) {
      const slug = btn.getAttribute('data-slug');
      btn.classList.toggle('active');
      if (btn.classList.contains('active')) {
        activeFilters.categories.push(slug);
      } else {
        activeFilters.categories = activeFilters.categories.filter(c => c !== slug);
      }
      applyFiltersAndRender();
      renderCategoryFilters(); // Refresh active tab UI state
    }
  });

  // Sort Selection
  document.getElementById('shop-sort-select')?.addEventListener('change', (e) => {
    sortBy = e.target.value;
    applyFiltersAndRender();
  });
};

// Main Filter, Sort and Render pipeline
const applyFiltersAndRender = async () => {
  let filtered = [...allProducts];

  // 1. Category Filter
  if (activeFilters.categories.length > 0) {
    filtered = filtered.filter(p => {
      // Find category slug
      const cat = allCategories.find(c => c.id === p.category_id);
      return cat && activeFilters.categories.includes(cat.slug);
    });
  }

  // 2. Search text filter
  if (activeFilters.search) {
    const q = activeFilters.search;
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q)
    );
  }

  // 3. Sorting
  if (sortBy === 'price-asc') {
    filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  } else if (sortBy === 'price-desc') {
    filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
  } else {
    // Newest: sort by date
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // Render Count
  const countEl = document.getElementById('shop-results-count');
  if (countEl) countEl.textContent = `Showing ${filtered.length} products`;

  // Render Grid
  renderProductsGrid(filtered);
};

// Render matching products to page grid
const renderProductsGrid = async (products) => {
  const container = document.getElementById('shop-products-grid');
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 4rem 0; color: var(--text-secondary);">No products match your active filters.</p>`;
    return;
  }

  container.innerHTML = products.map(p => {
    const cat = allCategories.find(c => c.id === p.category_id);
    
    return `
      <article class="product-card">
        <div class="product-image-container">
          <a href="product-details.html?id=${p.id}" aria-label="View ${p.name}">
            <img src="${p.image_url}" alt="${p.name}" class="product-img" loading="lazy">
          </a>
        </div>
        <div class="product-info">
          <span class="product-category">${cat ? cat.name : 'Essentials'}</span>
          <a href="product-details.html?id=${p.id}"><h3 class="product-title">${p.name}</h3></a>
          
          <!-- Card selectors for Size and Qty -->
          <div class="card-selectors" style="display:flex; flex-direction:column; gap:0.5rem; margin:0.75rem 0; padding-top:0.5rem; border-top:1px solid var(--border-color);">
            <!-- Size selector -->
            <div style="display:flex; align-items:center; justify-content:space-between; gap:0.5rem;">
              <span style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-secondary); font-weight:500;">Size</span>
              <div class="card-size-list" style="display:flex; gap:0.25rem; flex-wrap:wrap;">
                ${p.sizes.map((size, idx) => `
                  <button class="card-size-btn ${idx === 0 ? 'active' : ''}" data-size="${size}" style="padding:0.2rem 0.4rem; border:1px solid var(--border-color); border-radius:var(--border-radius-sm); font-size:0.688rem; font-weight:600; cursor:pointer; background:transparent; color:var(--text-primary); transition:all var(--transition-fast);" type="button">${size}</button>
                `).join('')}
              </div>
            </div>
            <!-- Quantity selector -->
            <div style="display:flex; align-items:center; justify-content:space-between; gap:0.5rem;">
              <span style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-secondary); font-weight:500;">Quantity</span>
              <div style="display:flex; align-items:center; gap:0.5rem;">
                <button class="card-qty-btn minus" style="width:1.5rem; height:1.5rem; padding:0; display:flex; align-items:center; justify-content:center; border:1px solid var(--border-color); border-radius:var(--border-radius-sm); background:transparent; color:var(--text-primary); cursor:pointer; font-size:0.875rem;" type="button" ${p.stock === 0 ? 'disabled' : ''}>-</button>
                <span class="card-qty-val" data-stock="${p.stock}" style="width:1.5rem; text-align:center; font-size:0.813rem; font-weight:600;">${p.stock === 0 ? 0 : 1}</span>
                <button class="card-qty-btn plus" style="width:1.5rem; height:1.5rem; padding:0; display:flex; align-items:center; justify-content:center; border:1px solid var(--border-color); border-radius:var(--border-radius-sm); background:transparent; color:var(--text-primary); cursor:pointer; font-size:0.875rem;" type="button" ${p.stock === 0 ? 'disabled' : ''}>+</button>
              </div>
            </div>
          </div>

          <div class="product-price-row">
            <span class="product-price">$${parseFloat(p.price).toFixed(2)}</span>
            <button class="buy-now-card-btn" data-id="${p.id}" aria-label="Buy ${p.name} Now">
              Buy Now
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Bind actions
  if (typeof window.bindProductCardActions === 'function') {
    // If defined elsewhere, but let's re-define here to ensure it works completely stand-alone
    bindShopCardActions(container);
  } else {
    bindShopCardActions(container);
  }
};

const bindShopCardActions = (container) => {

  // Card Size selection toggle
  container.querySelectorAll('.card-size-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const parent = btn.closest('.card-size-list');
      parent.querySelectorAll('.card-size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Card Quantity +/- Click Listeners
  container.querySelectorAll('.card-qty-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const parent = btn.closest('.card-selectors');
      const valEl = parent.querySelector('.card-qty-val');
      const maxStock = parseInt(valEl.getAttribute('data-stock')) || 0;
      let qty = parseInt(valEl.textContent) || 0;
      
      if (btn.classList.contains('minus')) {
        if (qty > 1) {
          qty--;
          valEl.textContent = qty;
        }
      } else if (btn.classList.contains('plus')) {
        if (qty < maxStock) {
          qty++;
          valEl.textContent = qty;
        }
      }
    });
  });

  container.querySelectorAll('.buy-now-card-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const prodId = btn.getAttribute('data-id');
      
      // Locate current card context elements
      const card = btn.closest('.product-card');
      const activeSizeBtn = card.querySelector('.card-size-btn.active');
      const qtyVal = card.querySelector('.card-qty-val');
      
      const selectedSize = activeSizeBtn ? activeSizeBtn.getAttribute('data-size') : 'M';
      const selectedQty = qtyVal ? parseInt(qtyVal.textContent) : 1;

      if (selectedQty <= 0) {
        window.showToast("Product is out of stock.", "warning");
        return;
      }

      const { data: product } = await window.dbAPI.getProductById(prodId);
      
      if (product) {
        const checkoutItem = {
          product_id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          selected_size: selectedSize,
          selected_color: product.colors[0] || 'Default',
          quantity: selectedQty
        };
        sessionStorage.setItem("AURA_CHECKOUT_ITEM", JSON.stringify(checkoutItem));
        window.location.href = "checkout.html";
      } else {
        window.showToast("Product not found.", "danger");
      }
    });
  });
};

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  initShop();
});
