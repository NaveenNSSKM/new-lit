/**
 * Product Details Page Controller
 */

let productId = null;
let currentProduct = null;
let selectedSize = "";
let selectedColor = "";
let customText = "";
let selectedQuantity = 1;

// Get Product ID from URL
const parseProductId = () => {
  const params = new URLSearchParams(window.location.search);
  productId = params.get('id');
  if (!productId) {
    window.location.href = "shop.html";
  }
};

// Initialize Details Page
const initProductDetails = async () => {
  parseProductId();
  if (!productId) return;

  const { data, error } = await window.dbAPI.getProductById(productId);
  if (error || !data) {
    window.showToast("Product not found.", "danger");
    setTimeout(() => { window.location.href = "shop.html"; }, 2000);
    return;
  }

  currentProduct = data;
  selectedSize = currentProduct.sizes[0] || 'M';
  selectedColor = currentProduct.colors[0] || 'White';
  selectedQuantity = 1;

  // Update page title
  document.title = `${currentProduct.name} | AURA`;
  document.getElementById('breadcrumb-active').textContent = currentProduct.name;

  renderDetails();
  loadRelatedProducts();
  loadReviews();
  setupReviewForm();
};

// Render main product layout info
const renderDetails = async () => {
  const container = document.getElementById('product-details-container');
  if (!container) return;

  const user = await window.authAPI.getUser();
  
  // Heart/wishlist state disabled

  // Check if Custom T-Shirt
  const isCustomTShirt = currentProduct.category_id === 'c0000000-0000-0000-0000-000000000004' || currentProduct.categories?.name === 'Custom T-Shirt';

  // Prepare colors swatches HTML
  const colorSwatchesHTML = currentProduct.colors.map(col => {
    const hex = getColorHex(col);
    const isLight = ['white', 'eggshell', 'milk white', 'natural raw'].includes(col.toLowerCase());
    const activeClass = col === selectedColor ? 'active' : '';
    return `<button class="color-swatch-btn ${activeClass}" data-color="${col}" style="background-color: ${hex}; border: 1px solid ${isLight ? 'var(--text-tertiary)' : 'transparent'};" title="${col}" aria-label="Select color ${col}"></button>`;
  }).join('');

  // Prepare size pills HTML
  const sizePillsHTML = currentProduct.sizes.map(size => {
    const activeClass = size === selectedSize ? 'active' : '';
    return `<button class="size-pill-btn ${activeClass}" data-size="${size}" aria-label="Select size ${size}">${size}</button>`;
  }).join('');

  // Custom shirt text field HTML
  const customTextFieldHTML = isCustomTShirt ? `
    <div class="custom-text-wrapper">
      <label class="form-label" for="custom-shirt-text">Custom Text (Max 20 Characters)</label>
      <input type="text" id="custom-shirt-text" maxlength="20" class="form-input" placeholder="TYPE YOUR TEXT HERE" style="text-transform: uppercase; letter-spacing:0.05em;">
      <div class="custom-text-preview" id="custom-text-preview">
        PREVIEW TEXT
      </div>
    </div>
  ` : '';

  // Stock status text
  let stockStatusHTML = `<span style="color:var(--status-success); font-size:0.875rem; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; display:flex; align-items:center; gap:0.25rem;">
    <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg> In Stock
  </span>`;
  if (currentProduct.stock === 0) {
    stockStatusHTML = `<span style="color:var(--status-danger); font-size:0.875rem; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; display:flex; align-items:center; gap:0.25rem;">
      <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg> Out of Stock
    </span>`;
  } else if (currentProduct.stock <= 5) {
    stockStatusHTML = `<span style="color:var(--status-warning); font-size:0.875rem; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; display:flex; align-items:center; gap:0.25rem;">
      <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg> Only ${currentProduct.stock} items left
    </span>`;
  }

  container.innerHTML = `
    <!-- Left column: Gallery -->
    <div class="product-gallery">
      <div class="main-image-viewport" id="zoom-viewport">
        <img src="${currentProduct.image_url}" id="main-product-img" alt="${currentProduct.name}" style="width:100%; height:100%; object-fit:cover;">
      </div>
      <div class="gallery-thumbs" id="gallery-thumbs">
        <button class="thumb-btn active" data-img="${currentProduct.image_url}">
          <img src="${currentProduct.image_url}" alt="">
        </button>
        <!-- Generates standard closeups using Unsplash variations to simulate photoshoot detail slides -->
        <button class="thumb-btn" data-img="${currentProduct.image_url}&auto=format&fit=crop&q=60&w=600">
          <img src="${currentProduct.image_url}" alt="" style="transform: scale(1.5);">
        </button>
        <button class="thumb-btn" data-img="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop">
          <img src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop" alt="">
        </button>
      </div>
    </div>

    <!-- Right column: Specs and purchase -->
    <div>
      <span class="detail-category">${currentProduct.categories?.name || 'Essentials'}</span>
      <h1 class="detail-title">${currentProduct.name}</h1>
      <div class="detail-price">$${parseFloat(currentProduct.price).toFixed(2)}</div>
      
      <!-- Stock -->
      <div style="margin-bottom:2rem;">
        ${stockStatusHTML}
      </div>

      <!-- Details Description -->
      <p style="margin-bottom:2rem; font-size:0.938rem; line-height:1.7;">${currentProduct.description}</p>

      <!-- Customization Form -->
      ${customTextFieldHTML}

      <!-- Color Selection -->
      <div style="margin-bottom: 2rem;">
        <h3 class="form-label">Select Color: <span id="color-label-val" style="color:var(--text-primary); text-transform:none; font-weight:500;">${selectedColor}</span></h3>
        <div class="color-swatch-list" id="detail-colors-list">
          ${colorSwatchesHTML}
        </div>
      </div>

      <!-- Size Selection -->
      <div style="margin-bottom: 2.5rem;">
        <h3 class="form-label">Select Size</h3>
        <div class="size-pill-list" id="detail-sizes-list">
          ${sizePillsHTML}
        </div>
      </div>

      <!-- Quantity Selection -->
      <div style="margin-bottom: 2.5rem;">
        <h3 class="form-label">Quantity</h3>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <button class="btn btn-secondary" id="qty-minus-btn" style="width: 3rem; height: 3rem; min-width: auto; padding: 0; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; border-color: var(--border-color); background: transparent;" type="button" ${currentProduct.stock === 0 ? 'disabled' : ''} aria-label="Decrease quantity">-</button>
          <input type="number" id="qty-input" value="${currentProduct.stock === 0 ? 0 : 1}" min="${currentProduct.stock === 0 ? 0 : 1}" max="${currentProduct.stock}" style="width: 4rem; height: 3rem; text-align: center; border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); font-size: 1rem; font-weight: 600; background: var(--bg-secondary); color: var(--text-primary); -moz-appearance: textfield;" readonly>
          <button class="btn btn-secondary" id="qty-plus-btn" style="width: 3rem; height: 3rem; min-width: auto; padding: 0; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; border-color: var(--border-color); background: transparent;" type="button" ${currentProduct.stock === 0 ? 'disabled' : ''} aria-label="Increase quantity">+</button>
        </div>
      </div>

      <!-- Call to Action -->
      <div class="detail-action-row">
        <button class="btn btn-primary" id="buy-now-btn" ${currentProduct.stock === 0 ? 'disabled' : ''} style="width: 100%;">
          ${currentProduct.stock === 0 ? 'Out of Stock' : 'Buy Now'}
        </button>
      </div>

      <!-- Collapsible panels (Details Accordion) -->
      <div style="margin-top: 3.5rem; border-top: 1px solid var(--border-color);">
        <details style="padding: 1.25rem 0; border-bottom: 1px solid var(--border-color); cursor:pointer;">
          <summary style="font-size:0.875rem; font-weight:500; text-transform:uppercase; letter-spacing:0.05em; display:flex; justify-content:space-between; align-items:center;">
            Product Fit & Materials
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </summary>
          <div style="margin-top: 1rem; font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6;">
            <ul>
              <li style="margin-bottom:0.4rem;">• Heavyweight Drop Shoulder fit (Size down for a standard true-to-size look).</li>
              <li style="margin-bottom:0.4rem;">• 100% pre-shrunk combed organic cotton loops.</li>
              <li style="margin-bottom:0.4rem;">• Ribbed high collar detailing to resist stretching.</li>
              <li>• Machine wash cold inside-out, hang dry to maintain perfect structure.</li>
            </ul>
          </div>
        </details>
        
        <details style="padding: 1.25rem 0; border-bottom: 1px solid var(--border-color); cursor:pointer;">
          <summary style="font-size:0.875rem; font-weight:500; text-transform:uppercase; letter-spacing:0.05em; display:flex; justify-content:space-between; align-items:center;">
            Shipping & Returns
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </summary>
          <div style="margin-top: 1rem; font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6;">
            <p>Enjoy free worldwide standard shipping on all orders. Dispatch runs within 24-48 business hours. Return window is 14 days from package receipt. Items must be unworn and in original tags.</p>
          </div>
        </details>
      </div>

    </div>
  `;

  // Attach Detail Event Listeners
  attachDetailsListeners(isCustomTShirt);
};

// Attach detail actions
const attachDetailsListeners = (isCustom) => {
  // Gallery thumb clicks
  const thumbsContainer = document.getElementById('gallery-thumbs');
  const mainImg = document.getElementById('main-product-img');
  
  thumbsContainer?.addEventListener('click', (e) => {
    const btn = e.target.closest('.thumb-btn');
    if (btn) {
      thumbsContainer.querySelectorAll('.thumb-btn').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      const newImg = btn.getAttribute('data-img');
      if (mainImg) mainImg.src = newImg;
    }
  });

  // Zoom magnifier effect on hover
  const viewport = document.getElementById('zoom-viewport');
  if (viewport && mainImg) {
    viewport.addEventListener('mousemove', (e) => {
      const { left, top, width, height } = viewport.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      mainImg.style.transformOrigin = `${x}% ${y}%`;
      mainImg.style.transform = 'scale(1.8)';
    });

    viewport.addEventListener('mouseleave', () => {
      mainImg.style.transform = 'scale(1)';
      mainImg.style.transformOrigin = 'center center';
    });
  }

  // Size pill clicks
  const sizesContainer = document.getElementById('detail-sizes-list');
  sizesContainer?.addEventListener('click', (e) => {
    const btn = e.target.closest('.size-pill-btn');
    if (btn) {
      sizesContainer.querySelectorAll('.size-pill-btn').forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      selectedSize = btn.getAttribute('data-size');
    }
  });

  // Color Swatches clicks
  const colorsContainer = document.getElementById('detail-colors-list');
  const colorLabel = document.getElementById('color-label-val');
  colorsContainer?.addEventListener('click', (e) => {
    const btn = e.target.closest('.color-swatch-btn');
    if (btn) {
      colorsContainer.querySelectorAll('.color-swatch-btn').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      selectedColor = btn.getAttribute('data-color');
      if (colorLabel) colorLabel.textContent = selectedColor;
    }
  });

  // Live Typography text preview listener
  if (isCustom) {
    const input = document.getElementById('custom-shirt-text');
    const preview = document.getElementById('custom-text-preview');
    input?.addEventListener('input', (e) => {
      customText = e.target.value.toUpperCase();
      if (preview) {
        preview.textContent = customText === "" ? "PREVIEW TEXT" : customText;
      }
    });
  }

  // Wishlist details click listener removed

  // Quantity Selector Listeners
  const qtyMinusBtn = document.getElementById('qty-minus-btn');
  const qtyPlusBtn = document.getElementById('qty-plus-btn');
  const qtyInput = document.getElementById('qty-input');

  qtyMinusBtn?.addEventListener('click', () => {
    if (selectedQuantity > 1) {
      selectedQuantity--;
      if (qtyInput) qtyInput.value = selectedQuantity;
    }
  });

  qtyPlusBtn?.addEventListener('click', () => {
    if (selectedQuantity < currentProduct.stock) {
      selectedQuantity++;
      if (qtyInput) qtyInput.value = selectedQuantity;
    }
  });

  // Buy Now click
  document.getElementById('buy-now-btn')?.addEventListener('click', () => {
    // If Custom Text Tee, validate if custom text is provided
    if (isCustom && !customText.trim()) {
      window.showToast("Please enter your custom engraving print text.", "warning");
      document.getElementById('custom-shirt-text')?.focus();
      return;
    }

    const checkoutItem = {
      product_id: currentProduct.id,
      name: currentProduct.name,
      price: currentProduct.price,
      image_url: currentProduct.image_url,
      selected_size: selectedSize,
      selected_color: selectedColor,
      custom_text: isCustom ? customText.trim() : null,
      quantity: selectedQuantity
    };

    sessionStorage.setItem("AURA_CHECKOUT_ITEM", JSON.stringify(checkoutItem));
    window.location.href = "checkout.html";
  });
};

// Fetch and render Related items
const loadRelatedProducts = async () => {
  const grid = document.getElementById('related-products-grid');
  if (!grid) return;

  const { data: products } = await window.dbAPI.getProducts();
  if (!products) return;

  const related = products
    .filter(p => p.category_id === currentProduct.category_id && p.id !== currentProduct.id)
    .slice(0, 3);

  if (related.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1/-1; color: var(--text-secondary);">No similar products found.</p>`;
    return;
  }

  const user = await window.authAPI.getUser();
  let wishlistIds = [];
  if (user) {
    const { data: wish } = await window.dbAPI.getWishlist(user.id);
    if (wish) wishlistIds = wish.map(w => w.product_id);
  }

  grid.innerHTML = related.map(p => {
    const isWishlisted = wishlistIds.includes(p.id) ? 'active' : '';
    return `
      <article class="product-card">
        <div class="product-image-container">
          <a href="product-details.html?id=${p.id}" aria-label="View Details">
            <img src="${p.image_url}" alt="${p.name}" class="product-img" loading="lazy">
          </a>
          <button class="wishlist-btn-card ${isWishlisted}" data-id="${p.id}" aria-label="Save to wishlist">
            <svg width="18" height="18" fill="${isWishlisted ? 'currentColor' : 'none'}" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
          </button>
        </div>
        <div class="product-info">
          <span class="product-category">${p.categories?.name || 'Essentials'}</span>
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
            <button class="buy-now-card-btn" data-id="${p.id}">Buy Now</button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Bind actions
  grid.querySelectorAll('.wishlist-btn-card').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const user = await window.authAPI.getUser();
      if (!user) {
        document.getElementById('auth-modal')?.classList.add('show');
        window.showToast("Please sign in.", "warning");
        return;
      }
      const pId = btn.getAttribute('data-id');
      const { action } = await window.dbAPI.toggleWishlist(user.id, pId);
      const svg = btn.querySelector('svg');
      if (action === 'added') {
        btn.classList.add('active');
        svg.setAttribute('fill', 'currentColor');
      } else {
        btn.classList.remove('active');
        svg.setAttribute('fill', 'none');
      }
    });
  });

  // Card Quantity +/- Click Listeners
  grid.querySelectorAll('.card-qty-btn').forEach(btn => {
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

  // Card Size selection toggle
  grid.querySelectorAll('.card-size-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const parent = btn.closest('.card-size-list');
      parent.querySelectorAll('.card-size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  grid.querySelectorAll('.buy-now-card-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const pId = btn.getAttribute('data-id');
      
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

      const { data: product } = await window.dbAPI.getProductById(pId);
      if (product) {
        const item = {
          product_id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          selected_size: selectedSize,
          selected_color: product.colors[0] || 'Default',
          quantity: selectedQty
        };
        sessionStorage.setItem("AURA_CHECKOUT_ITEM", JSON.stringify(item));
        window.location.href = "checkout.html";
      }
    });
  });
};

// Fetch and Render Reviews list
const loadReviews = async () => {
  const listContainer = document.getElementById('reviews-list-container');
  const avgNum = document.getElementById('avg-rating-num');
  const avgStars = document.getElementById('avg-rating-stars');
  const totalCount = document.getElementById('total-reviews-count');
  
  if (!listContainer) return;

  const { data: reviews } = await window.dbAPI.getProductReviews(productId);
  
  if (!reviews || reviews.length === 0) {
    listContainer.innerHTML = `<p style="color:var(--text-secondary); padding:2rem 0;">No reviews yet. Be the first to write one!</p>`;
    if (avgNum) avgNum.textContent = "0.0";
    if (avgStars) avgStars.innerHTML = getStarsHTML(0);
    if (totalCount) totalCount.textContent = "Based on 0 reviews";
    return;
  }

  // Calculate Averages
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avg = (sum / reviews.length).toFixed(1);

  if (avgNum) avgNum.textContent = avg;
  if (avgStars) avgStars.innerHTML = getStarsHTML(Math.round(avg));
  if (totalCount) totalCount.textContent = `Based on ${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'}`;

  listContainer.innerHTML = reviews.map(r => `
    <article class="review-card">
      <div class="review-card-header">
        <span class="review-reviewer">${r.name}</span>
        <span class="review-stars">${getStarsHTML(r.rating)}</span>
      </div>
      <div class="review-date" style="margin-bottom:0.75rem;">${r.date}</div>
      <p style="font-size:0.938rem; line-height:1.6; color:var(--text-secondary);">${r.comment}</p>
    </article>
  `).join('');
};

// Helper for generating gold stars SVG/UTF strings
const getStarsHTML = (rating) => {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars += '★';
    } else {
      stars += '☆';
    }
  }
  return stars;
};

// Review submission setup
const setupReviewForm = () => {
  const form = document.getElementById('add-review-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('review-name').value.trim();
    const rating = document.getElementById('review-rating').value;
    const comment = document.getElementById('review-comment').value.trim();

    const { error } = await window.dbAPI.addProductReview(productId, name, rating, comment);
    
    if (error) {
      window.showToast("Failed to submit review.", "danger");
    } else {
      window.showToast("Review submitted successfully! Thank you.");
      form.reset();
      loadReviews();
    }
  });
};

// Local helper to fetch colors hex
const getColorHex = (name) => {
  const colors = {
    'Charcoal': '#36454F',
    'Off-White': '#F5F5F0',
    'Sage': '#9CAF88',
    'Sand': '#C2B280',
    'Onyx Black': '#1C1C1C',
    'Pure White': '#FFFFFF',
    'Natural Raw': '#F9F6EE',
    'Clay': '#C46D52',
    'Olive': '#556B2F',
    'Espresso': '#3E2723',
    'Heather Grey': '#D3D3D3',
    'Acid Grey': '#708090',
    'Vintage Plum': '#4B0082',
    'Vintage Black': '#2F2F2F',
    'Milk White': '#FCFAF2',
    'Eggshell': '#F0EAD6',
    'Navy Blue': '#000080'
  };
  return colors[name] || '#CCCCCC';
};

// Run details loading
document.addEventListener("DOMContentLoaded", () => {
  initProductDetails();
});
