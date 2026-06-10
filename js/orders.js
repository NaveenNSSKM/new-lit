/**
 * Orders Page Controller
 */

let activeUser = null;

// Initialize Orders page
const initOrders = async () => {
  activeUser = await window.authAPI.getUser();
  
  const lockScreen = document.getElementById('orders-lock-screen');
  const dashboard = document.getElementById('orders-dashboard-content');

  if (!activeUser) {
    if (lockScreen) lockScreen.style.display = 'block';
    if (dashboard) dashboard.style.display = 'none';
    
    document.getElementById('lock-orders-login-btn')?.addEventListener('click', () => {
      document.getElementById('auth-modal')?.classList.add('show');
    });
    return;
  }

  if (lockScreen) lockScreen.style.display = 'none';
  if (dashboard) dashboard.style.display = 'grid';

  // Update sidebar info
  const nameEl = document.getElementById('orders-user-name');
  const avatarEl = document.getElementById('orders-avatar-large');
  if (nameEl) nameEl.textContent = activeUser.full_name;
  if (avatarEl && activeUser.profile_image) avatarEl.src = activeUser.profile_image;

  // Bind logout
  document.getElementById('orders-logout-sidebar-btn')?.addEventListener('click', async () => {
    await window.authAPI.signOut();
    window.showToast("Signed out successfully.");
    setTimeout(() => { window.location.href = "index.html"; }, 1000);
  });

  loadUserOrders();
};

// Fetch and Render User Orders
const loadUserOrders = async () => {
  const container = document.getElementById('orders-list-container');
  if (!container) return;

  const { data: orders, error } = await window.dbAPI.getOrders(activeUser.id);

  if (error) {
    container.innerHTML = `<p style="text-align:center; padding: 2rem 0; color:var(--status-danger)">Failed to load orders: ${error.message}</p>`;
    return;
  }

  if (!orders || orders.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 4rem 0;">
        <p style="color:var(--text-secondary); margin-bottom: 2rem;">You haven't placed any orders yet.</p>
        <a href="shop.html" class="btn btn-primary">Browse T-Shirts & Hoodies</a>
      </div>
    `;
    return;
  }

  container.innerHTML = orders.map(ord => {
    const orderDate = new Date(ord.created_at).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Status color badge selector
    const status = ord.order_status.toLowerCase();
    const cleanId = ord.id.replace('ord_', '').substring(0, 8).toUpperCase();
    
    // Try to extract Custom Engraving text from shipping address if available
    let customPrintHTML = '';
    if (ord.shipping_address.includes('PRINT: "')) {
      const parts = ord.shipping_address.split('PRINT: "');
      if (parts.length > 1) {
        const text = parts[1].split('"')[0];
        customPrintHTML = `<span style="font-size:0.75rem; background-color:var(--accent-light); color:var(--accent-color); padding:0.2rem 0.5rem; border-radius:var(--border-radius-sm); font-weight:600; display:inline-block; margin-top:0.4rem; font-family:var(--font-display);">CUSTOM PRINT: "${text}"</span>`;
      }
    }

    return `
      <article class="order-card">
        <div class="order-card-header">
          <div class="order-header-info">
            <div>
              <span>ORDER PLACED</span>
              <strong>${orderDate}</strong>
            </div>
            <div>
              <span>TOTAL PAID</span>
              <strong>$${parseFloat(ord.total_amount).toFixed(2)}</strong>
            </div>
            <div>
              <span>SHIP TO</span>
              <strong>${ord.shipping_address.split('\n')[0]}</strong>
            </div>
          </div>
          <div style="text-align:right;">
            <span>ORDER ID: <strong>#AURA-${cleanId}</strong></span>
          </div>
        </div>
        <div class="order-card-body">
          <div class="order-product-info">
            <img src="${ord.products?.image_url}" alt="${ord.products?.name}" class="order-product-img">
            <div>
              <h3 style="font-size:1rem; font-weight:500; margin-bottom:0.25rem;">${ord.products?.name}</h3>
              <p style="font-size:0.813rem; color:var(--text-secondary); margin-bottom:0.25rem;">Size: ${ord.selected_size} | Color: ${ord.selected_color}</p>
              <p style="font-size:0.813rem; color:var(--text-secondary);">Quantity: ${ord.quantity} | Price: $${parseFloat(ord.products?.price).toFixed(2)}</p>
              ${customPrintHTML}
            </div>
          </div>
          <div>
            <span class="order-status-badge ${status}">${ord.order_status}</span>
          </div>
        </div>
      </article>
    `;
  }).join('');
};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  initOrders();
});
