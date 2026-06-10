/**
 * Global App Controller
 * Injects shared layouts, manages sessions, theme toggles, search, and dialog overlays.
 */

// Global Toast System
window.showToast = (message, type = 'success') => {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="toast-close-btn" aria-label="Close Notification">
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
    </button>
  `;

  container.appendChild(toast);

  // Close click
  toast.querySelector('.toast-close-btn').addEventListener('click', () => {
    toast.remove();
  });

  // Self destruct
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};

// Toggle Mobile Menu
const toggleMobileMenu = (open) => {
  const drawer = document.getElementById('mobile-nav-drawer');
  const overlay = document.getElementById('mobile-nav-overlay');
  if (!drawer || !overlay) return;

  if (open) {
    drawer.classList.add('open');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  } else {
    drawer.classList.remove('open');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }
};

// Render Shared Layout Components
const renderLayout = async () => {
  // 1. Render Header
  const headerHTML = `
    <div class="container header-container">
      <a href="index.html" class="brand-logo">AURA</a>
      
      <nav class="nav-menu" aria-label="Desktop Navigation">
        <a href="index.html" class="nav-link" id="nav-home">Home</a>
        <a href="shop.html" class="nav-link" id="nav-shop">Shop</a>
        <a href="categories.html" class="nav-link" id="nav-categories">Categories</a>
        <a href="about.html" class="nav-link" id="nav-about">About Us</a>
        <a href="contact.html" class="nav-link" id="nav-contact">Contact</a>
      </nav>

      <div class="header-actions">
        <button class="theme-toggle-btn btn-icon" id="theme-toggle-btn" aria-label="Toggle Theme">
          <svg class="sun-icon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="display:none;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"/></svg>
          <svg class="moon-icon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
        </button>

        <div class="user-menu-container" id="user-menu-container">
          <!-- Populated dynamically by auth state -->
          <button class="btn btn-secondary" id="header-login-btn">Login</button>
        </div>

        <button class="menu-toggle-btn btn-icon" id="menu-toggle-btn" aria-label="Open Mobile Menu">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>
    </div>
  `;
  
  const headerEl = document.createElement('header');
  headerEl.className = 'site-header';
  headerEl.id = 'site-header';
  headerEl.innerHTML = headerHTML;
  document.body.prepend(headerEl);

  // Set Active Nav Link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  if (currentPath.includes('index.html')) document.getElementById('nav-home')?.classList.add('active');
  else if (currentPath.includes('shop.html')) document.getElementById('nav-shop')?.classList.add('active');
  else if (currentPath.includes('categories.html')) document.getElementById('nav-categories')?.classList.add('active');
  else if (currentPath.includes('about.html')) document.getElementById('nav-about')?.classList.add('active');
  else if (currentPath.includes('contact.html')) document.getElementById('nav-contact')?.classList.add('active');

  // 2. Render Mobile Side Drawer Navigation
  const drawerEl = document.createElement('div');
  drawerEl.id = 'mobile-nav-drawer';
  drawerEl.className = 'mobile-nav-drawer';
  drawerEl.innerHTML = `
    <div class="mobile-nav-header">
      <span class="brand-logo">AURA</span>
      <button class="btn-icon" id="mobile-menu-close" aria-label="Close Menu">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="mobile-nav-menu">
      <a href="index.html" class="mobile-nav-link">Home</a>
      <a href="shop.html" class="mobile-nav-link">Shop</a>
      <a href="categories.html" class="mobile-nav-link">Categories</a>
      <a href="about.html" class="mobile-nav-link">About Us</a>
      <a href="contact.html" class="mobile-nav-link">Contact</a>
    </div>
    <div class="mobile-nav-footer" id="mobile-nav-footer-actions">
      <!-- Dynamic login status in mobile drawer -->
    </div>
  `;
  document.body.appendChild(drawerEl);

  const overlayEl = document.createElement('div');
  overlayEl.id = 'mobile-nav-overlay';
  overlayEl.className = 'mobile-nav-overlay';
  document.body.appendChild(overlayEl);

  // 3. Render Footer
  const footerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <h3>AURA</h3>
          <p>Designing modern minimal garments with a deep focus on premium materials, boxy relaxed fit silhouettes, and ecological sustainability.</p>
          <div class="footer-socials">
            <a href="#" class="btn-icon" aria-label="Instagram"><svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
            <a href="#" class="btn-icon" aria-label="Pinterest"><svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.993 3.995-.283 1.195.597 2.17 1.777 2.17 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.164 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg></a>
            <a href="#" class="btn-icon" aria-label="Twitter"><svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg></a>
          </div>
        </div>

        <div class="footer-links-col">
          <h4>Collection</h4>
          <ul>
            <li><a href="shop.html?category=new-arrival">New Arrival</a></li>
            <li><a href="shop.html?category=t-shirt">T-Shirts</a></li>
            <li><a href="shop.html?category=hoodies">Hoodies</a></li>
            <li><a href="shop.html?category=custom-t-shirt">Custom T-Shirt</a></li>
          </ul>
        </div>

        <div class="footer-links-col">
          <h4>Customer Service</h4>
          <ul>
            <li><a href="about.html">About Us</a></li>
            <li><a href="contact.html">Contact Us</a></li>
            <li><a href="privacy.html">Privacy Policy</a></li>
            <li><a href="terms.html">Terms & Conditions</a></li>
          </ul>
        </div>

        <div class="footer-newsletter">
          <h4>Newsletter</h4>
          <p>Subscribe to receive notifications of exclusive curated releases and seasonal sales.</p>
          <form class="newsletter-form" id="newsletter-form">
            <input type="email" placeholder="YOUR EMAIL ADDRESS" class="newsletter-input" required aria-label="Email Address">
            <button type="submit" class="newsletter-btn">Join</button>
          </form>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2026 AURA. All rights reserved.</p>
        <div class="footer-bottom-links">
          <a href="privacy.html">Privacy Policy</a>
          <a href="terms.html">Terms & Conditions</a>
        </div>
      </div>
    </div>
  `;

  const footerEl = document.createElement('footer');
  footerEl.className = 'site-footer';
  footerEl.innerHTML = footerHTML;
  document.body.appendChild(footerEl);

  // 4. Ingest Global Toast Container
  const toastContainer = document.createElement('div');
  toastContainer.id = 'toast-container';
  toastContainer.className = 'toast-container';
  document.body.appendChild(toastContainer);

  // 6. Ingest Auth Modal
  renderAuthModal();

  // Attach Layout Interactivity Event Listeners
  attachLayoutListeners();
  updateAuthHeader();
};

// Render Signin/Signup Auth Modal overlay
const renderAuthModal = () => {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'auth-modal';
  modal.innerHTML = `
    <div class="modal-container" style="max-width: 420px;">
      <div class="modal-header">
        <h3 class="modal-title" id="auth-modal-title">Sign In</h3>
        <button class="modal-close-btn" id="auth-close-btn" aria-label="Close modal">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="modal-body">
        <!-- Sign In View -->
        <form id="signin-form">
          <div class="form-group">
            <label class="form-label" for="login-email">Email Address</label>
            <input type="email" id="login-email" required class="form-input" placeholder="name@domain.com">
          </div>
          <div class="form-group">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
              <label class="form-label" for="login-password" style="margin-bottom:0;">Password</label>
              <a href="forgot-password.html" class="form-label" style="text-transform:none; margin-bottom:0; color:var(--accent-color);">Forgot?</a>
            </div>
            <input type="password" id="login-password" required class="form-input" placeholder="••••••••">
          </div>
          <div class="form-group" style="display:flex; align-items:center; gap:0.5rem;">
            <input type="checkbox" id="login-remember" style="cursor:pointer">
            <label for="login-remember" style="font-size:0.813rem; color:var(--text-secondary); cursor:pointer;">Remember Me</label>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%; margin-top:1rem;">Sign In</button>
          <p style="text-align:center; font-size:0.813rem; margin-top:1.5rem; color:var(--text-secondary);">
            Don't have an account? <a href="#" id="go-to-signup" style="color:var(--text-primary); font-weight:500;">Create One</a>
          </p>
        </form>

        <!-- Sign Up View (Hidden by default) -->
        <form id="signup-form" style="display:none;">
          <div class="form-group">
            <label class="form-label" for="reg-name">Full Name</label>
            <input type="text" id="reg-name" required class="form-input" placeholder="Jane Doe">
          </div>
          <div class="form-group">
            <label class="form-label" for="reg-email">Email Address</label>
            <input type="email" id="reg-email" required class="form-input" placeholder="jane@domain.com">
          </div>
          <div class="form-group">
            <label class="form-label" for="reg-phone">Phone Number</label>
            <input type="tel" id="reg-phone" class="form-input" placeholder="+1 555-0000">
          </div>
          <div class="form-group">
            <label class="form-label" for="reg-password">Password</label>
            <input type="password" id="reg-password" required class="form-input" placeholder="Min. 8 characters">
          </div>
          <div class="form-group">
            <label class="form-label" for="reg-confirm">Confirm Password</label>
            <input type="password" id="reg-confirm" required class="form-input" placeholder="Re-enter password">
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%; margin-top:1rem;">Register</button>
          <p style="text-align:center; font-size:0.813rem; margin-top:1.5rem; color:var(--text-secondary);">
            Already have an account? <a href="#" id="go-to-signin" style="color:var(--text-primary); font-weight:500;">Login</a>
          </p>
        </form>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Close bindings
  modal.querySelector('#auth-close-btn').addEventListener('click', () => modal.classList.remove('show'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('show');
  });

  // Switch tabs inside modal
  const signInForm = modal.querySelector('#signin-form');
  const signUpForm = modal.querySelector('#signup-form');
  const title = modal.querySelector('#auth-modal-title');

  modal.querySelector('#go-to-signup').addEventListener('click', (e) => {
    e.preventDefault();
    signInForm.style.display = 'none';
    signUpForm.style.display = 'block';
    title.textContent = 'Create Account';
  });

  modal.querySelector('#go-to-signin').addEventListener('click', (e) => {
    e.preventDefault();
    signUpForm.style.display = 'none';
    signInForm.style.display = 'block';
    title.textContent = 'Sign In';
  });
};

// Update Header navigation when logged in / out
const updateAuthHeader = async () => {
  const container = document.getElementById('user-menu-container');
  const mobileFooter = document.getElementById('mobile-nav-footer-actions');
  if (!container) return;

  const user = await window.authAPI.getUser();
  
  if (user) {
    // User is logged in: show mini profile picture + dropdown
    container.innerHTML = `
      <button class="user-profile-btn" id="user-profile-btn" aria-label="Open profile dropdown" aria-haspopup="true">
        <img src="${user.profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop'}" alt="" class="user-avatar-mini">
        <span style="display:none; md-block:inline">${user.full_name.split(' ')[0]}</span>
      </button>
      <div class="user-dropdown" id="user-dropdown">
        <a href="profile.html" class="dropdown-item">My Profile</a>
        <a href="orders.html" class="dropdown-item">My Orders</a>
        <div class="dropdown-divider"></div>
        <button class="dropdown-item" id="header-logout-btn" style="text-align:left; width:100%;">Sign Out</button>
      </div>
    `;

    // Dropdown toggle binding
    const userBtn = container.querySelector('#user-profile-btn');
    const dropdown = container.querySelector('#user-dropdown');
    userBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      dropdown.classList.remove('show');
    });

    // Logout trigger
    container.querySelector('#header-logout-btn').addEventListener('click', async () => {
      await window.authAPI.signOut();
      window.showToast("Signed out successfully.");
      setTimeout(() => window.location.reload(), 1000);
    });

    // Mobile Navigation Drawer actions update
    if (mobileFooter) {
      mobileFooter.innerHTML = `
        <a href="profile.html" class="btn btn-secondary" style="width:100%;">My Profile</a>
        <a href="orders.html" class="btn btn-secondary" style="width:100%;">My Orders</a>
        <button class="btn btn-primary" id="mobile-logout-btn" style="width:100%;">Sign Out</button>
      `;
      mobileFooter.querySelector('#mobile-logout-btn').addEventListener('click', async () => {
        await window.authAPI.signOut();
        window.location.reload();
      });
    }
  } else {
    // User is logged out: show standard buttons
    container.innerHTML = `
      <button class="btn btn-secondary" id="header-login-btn">Login</button>
      <button class="btn btn-primary" id="header-signup-btn" style="display:none; lg-inline-flex:inline-flex;">Sign Up</button>
    `;

    // Bind triggers to open Modal
    const modal = document.getElementById('auth-modal');
    container.querySelector('#header-login-btn').addEventListener('click', () => {
      modal.classList.add('show');
      modal.querySelector('#signin-form').style.display = 'block';
      modal.querySelector('#signup-form').style.display = 'none';
      modal.querySelector('#auth-modal-title').textContent = 'Sign In';
    });

    const signupBtn = container.querySelector('#header-signup-btn');
    if (signupBtn) {
      signupBtn.addEventListener('click', () => {
        modal.classList.add('show');
        modal.querySelector('#signin-form').style.display = 'none';
        modal.querySelector('#signup-form').style.display = 'block';
        modal.querySelector('#auth-modal-title').textContent = 'Create Account';
      });
    }

    // Mobile Navigation Drawer actions update
    if (mobileFooter) {
      mobileFooter.innerHTML = `
        <button class="btn btn-secondary" id="mobile-login-btn" style="width:100%;">Login</button>
        <button class="btn btn-primary" id="mobile-signup-btn" style="width:100%;">Sign Up</button>
      `;
      mobileFooter.querySelector('#mobile-login-btn').addEventListener('click', () => {
        toggleMobileMenu(false);
        modal.classList.add('show');
        modal.querySelector('#signin-form').style.display = 'block';
        modal.querySelector('#signup-form').style.display = 'none';
      });
      mobileFooter.querySelector('#mobile-signup-btn').addEventListener('click', () => {
        toggleMobileMenu(false);
        modal.classList.add('show');
        modal.querySelector('#signin-form').style.display = 'none';
        modal.querySelector('#signup-form').style.display = 'block';
      });
    }
  }
};

// Bind UI actions
const attachLayoutListeners = () => {
  // Theme Switching
  const themeToggle = document.getElementById('theme-toggle-btn');
  if (themeToggle) {
    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');

    const setTheme = (theme) => {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('AURA_THEME', theme);
      if (theme === 'dark') {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
      } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
      }
    };

    // Initialize Theme
    const savedTheme = localStorage.getItem('AURA_THEME') || 'light';
    setTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
  }

  // Mobile drawer controls
  document.getElementById('menu-toggle-btn')?.addEventListener('click', () => toggleMobileMenu(true));
  document.getElementById('mobile-menu-close')?.addEventListener('click', () => toggleMobileMenu(false));
  document.getElementById('mobile-nav-overlay')?.addEventListener('click', () => toggleMobileMenu(false));



  // Newsletter submission mock
  document.getElementById('newsletter-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.querySelector('.newsletter-input').value;
    window.showToast(`Thank you! Subscription email sent for: ${email}`);
    e.target.reset();
  });

  // Auth Form validation submissions
  const authModal = document.getElementById('auth-modal');
  
  document.getElementById('signin-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-password').value;
    
    const { data, error } = await window.authAPI.signIn(email, pass);
    if (error) {
      window.showToast(error.message, 'danger');
    } else {
      window.showToast("Welcome back, " + data.user.full_name);
      authModal.classList.remove('show');
      updateAuthHeader();
      
      // If we are on checkout or auth required pages, refresh to update content
      const path = window.location.pathname.split('/').pop();
      if (path === 'checkout.html' || path === 'profile.html' || path === 'orders.html') {
        window.location.reload();
      }
    }
  });

  document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const pass = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;

    if (pass.length < 8) {
      window.showToast("Password must be at least 8 characters.", "danger");
      return;
    }
    if (pass !== confirm) {
      window.showToast("Passwords do not match.", "danger");
      return;
    }

    const { data, error } = await window.authAPI.signUp(email, pass, name, phone);
    if (error) {
      window.showToast(error.message, 'danger');
    } else {
      window.showToast("Account created successfully! Welcome to AURA.");
      authModal.classList.remove('show');
      updateAuthHeader();
    }
  });

  // Inject Scroll to Top Button
  const scrollBtn = document.createElement('button');
  scrollBtn.id = 'scroll-to-top-btn';
  scrollBtn.className = 'scroll-to-top-btn';
  scrollBtn.setAttribute('aria-label', 'Scroll to Top');
  scrollBtn.innerHTML = `
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"/>
    </svg>
  `;
  document.body.appendChild(scrollBtn);

  // Click scroll to top smoothly
  scrollBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Premium Header Scroll & Scroll-to-Top Button Toggle
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Toggle header shadow on scroll
    if (scrollTop > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Toggle Scroll to Top Button visibility
    if (scrollTop > 300) {
      scrollBtn.classList.add('show');
    } else {
      scrollBtn.classList.remove('show');
    }
  }, { passive: true });
};

// Kick off initialization
document.addEventListener("DOMContentLoaded", () => {
  renderLayout();
});
