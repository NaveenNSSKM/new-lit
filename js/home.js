/**
 * AURA - Home Page Controller (2026 Edition)
 * Manages Awwwards-inspired motion designs and custom interactive elements:
 * 1. Smooth custom follow-cursor trail
 * 2. Perspective 3D card tilt reflection effects
 * 3. Scroll-reveal triggers (IntersectionObservers)
 * 4. Interactive Brand Story progress timeline
 * 5. Horizontal featured products carousel
 * 6. Dynamic database loaders & configurator lab
 */

// Configuration Mapping for Materials & Colorways
const CONFIG_MAP = {
  'cyber-mesh': {
    name: 'AURA Cyber-Mesh Tee',
    price: 35.00,
    productId: 'a0000000-0000-0000-0000-000000000001', // Heavyweight Boxy Tee
    colors: {
      'neon-void': {
        name: 'Neon Void',
        imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800'
      },
      'vapor-cyan': {
        name: 'Vapor Cyan',
        imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800'
      },
      'aurora-sunset': {
        name: 'Aurora Sunset',
        imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800'
      }
    }
  },
  'bio-leather': {
    name: 'AURA Bio-Leather Jacket',
    price: 85.00,
    productId: 'a0000000-0000-0000-0000-000000000006', // Custom Typographic Tee mapping
    colors: {
      'neon-void': {
        name: 'Neon Void',
        imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800'
      },
      'vapor-cyan': {
        name: 'Vapor Cyan',
        imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800'
      },
      'aurora-sunset': {
        name: 'Aurora Sunset',
        imageUrl: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=800'
      }
    }
  },
  'nano-knit': {
    name: 'AURA Nano-Knit Hoodie',
    price: 68.00,
    productId: 'a0000000-0000-0000-0000-000000000004', // Oversized Heavyweight Hoodie
    colors: {
      'neon-void': {
        name: 'Neon Void',
        imageUrl: 'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=800'
      },
      'vapor-cyan': {
        name: 'Vapor Cyan',
        imageUrl: 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=800'
      },
      'aurora-sunset': {
        name: 'Aurora Sunset',
        imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=800'
      }
    }
  }
};

const AI_STYLIST_RECS = {
  'cyber-mesh': {
    'neon-void': 'Neural Style Engine: Translucent mesh structure detected. Recommend pairing this Neon Void layering piece with matte black cargo trousers and metallic technical footwear for high-contrast sensory depth.',
    'vapor-cyan': 'Neural Style Engine: Cyan intensity active (490nm wavelength). Layer this technical mesh tee over a dark charcoal compression layer. Best suited with clean, technical reflective hardware.',
    'aurora-sunset': 'Neural Style Engine: Sunset chromatic spectrum compiled. High-voltage magenta tone. We recommend balancing the saturation by styling with minimal, structured modular black accessories.'
  },
  'bio-leather': {
    'neon-void': 'Neural Style Engine: Deep-space dark leather shell configured. A timeless structural statement. Style with loose-fit dark loopback knit pants and chunky cyber-luxury high-tops.',
    'vapor-cyan': 'Neural Style Engine: Cyberpunk aesthetic synthesis. Cyan-treated custom leather overlay requires simple neutral foundations. Layer with a grey micro-knit mockup tee and chrome shades.',
    'aurora-sunset': 'Neural Style Engine: Hyper-reflective warm sunset hue configured. Treat as a single focal display. Minimize patterns across other garments. Keep background silhouettes dark.'
  },
  'nano-knit': {
    'neon-void': 'Neural Style Engine: Heavyweight 450GSM technical knitway. Ideal for low-temperature transit zones. Style with raw denim, silver jewelry accents, and a structured crossbody sling bag.',
    'vapor-cyan': 'Neural Style Engine: Vapor Cyan knit microfibers active. Pairs beautifully with off-white relaxed track pants and minimalist low-top sneakers. Dynamic street presence optimized.',
    'aurora-sunset': 'Neural Style Engine: Aurora Sunset knit spectrum active. Warm gradient notes. Combine with dark graphite utility shorts and high-ankle socks for an archive-modern athletic aesthetic.'
  }
};

// State trackers
let selectedMaterial = 'cyber-mesh';
let selectedColor = 'neon-void';
let typewriterTimeout = null;

// =========================================================================
// 1. CUSTOM TRAILING CURSOR IMPLEMENTATION
// =========================================================================
const initCustomCursor = () => {
  const dot = document.getElementById('custom-cursor-dot');
  const circle = document.getElementById('custom-cursor-circle');
  if (!dot || !circle) return;

  let mouseX = 0, mouseY = 0;
  let dotX = 0, dotY = 0;
  let circleX = 0, circleY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  const updateCursorPosition = () => {
    dotX += (mouseX - dotX) * 0.25;
    dotY += (mouseY - dotY) * 0.25;
    circleX += (mouseX - circleX) * 0.12;
    circleY += (mouseY - circleY) * 0.12;

    dot.style.left = `${dotX}px`;
    dot.style.top = `${dotY}px`;
    circle.style.left = `${circleX}px`;
    circle.style.top = `${circleY}px`;

    requestAnimationFrame(updateCursorPosition);
  };
  requestAnimationFrame(updateCursorPosition);

  // Mouse hover expansion handlers
  const onEnterHover = () => document.body.classList.add('custom-cursor-hover');
  const onLeaveHover = () => document.body.classList.remove('custom-cursor-hover');

  const bindHoverTargets = () => {
    const interactives = document.querySelectorAll('a, button, .btn, .color-option-btn, .config-swatch-btn, .buy-now-card-btn, .btn-icon');
    interactives.forEach(el => {
      el.removeEventListener('mouseenter', onEnterHover);
      el.removeEventListener('mouseleave', onLeaveHover);
      el.addEventListener('mouseenter', onEnterHover);
      el.addEventListener('mouseleave', onLeaveHover);
    });
  };

  bindHoverTargets();
  window.bindCursorHoverTargets = bindHoverTargets; // Expose globally for dynamic components
};

// =========================================================================
// 2. PERSPECTIVE 3D CARD TILT & SHINE EFFECTS
// =========================================================================
const initCardTilts = (container = document) => {
  const tiltCards = container.querySelectorAll('.tilt-card');
  
  tiltCards.forEach(card => {
    // Add inner shine element if missing
    if (!card.querySelector('.card-shine')) {
      const shine = document.createElement('div');
      shine.className = 'card-shine';
      card.appendChild(shine);
    }

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const width = rect.width;
      const height = rect.height;
      
      // Multiplier limits max tilt angle in degrees
      const tiltX = -10 * ((y - height / 2) / (height / 2));
      const tiltY = 10 * ((x - width / 2) / (width / 2));
      
      card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
      
      // Pass coordinates to CSS custom properties for radial gradients
      const shineX = (x / width) * 100;
      const shineY = (y / height) * 100;
      card.style.setProperty('--shine-x', `${shineX}%`);
      card.style.setProperty('--shine-y', `${shineY}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
};

// =========================================================================
// 3. SCROLL-REVEAL OBSERVER (FRAMER MOTION REPLICAS)
// =========================================================================
const initScrollReveals = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right').forEach(el => {
    observer.observe(el);
  });
};

// =========================================================================
// 4. BRAND STORY TIMELINE PROGRESS
// =========================================================================
const initTimelineProgress = () => {
  const timeline = document.querySelector('.brand-timeline');
  const nodes = document.querySelectorAll('.timeline-node');
  const progressBar = document.getElementById('brand-timeline-progress');

  if (!timeline || !progressBar) return;

  const updateTimeline = () => {
    const rect = timeline.getBoundingClientRect();
    const startPoint = window.innerHeight * 0.8;
    const scrollDepth = -rect.top + startPoint;
    const totalHeight = rect.height;

    let progressFraction = 0;
    if (scrollDepth > 0) {
      progressFraction = Math.min(100, Math.max(0, (scrollDepth / totalHeight) * 100));
    }

    timeline.style.setProperty('--timeline-height', `${progressFraction}%`);

    // Highlight milestones as scroll triggers
    nodes.forEach(node => {
      const nodeRect = node.getBoundingClientRect();
      if (nodeRect.top < window.innerHeight * 0.65) {
        node.classList.add('active');
      } else {
        node.classList.remove('active');
      }
    });
  };

  window.addEventListener('scroll', updateTimeline, { passive: true });
  updateTimeline(); // run initial calculation
};

// =========================================================================
// 5. HORIZONTAL SCROLL CAROUSEL
// =========================================================================
const initCarousel = () => {
  const prevBtn = document.getElementById('carousel-prev-btn');
  const nextBtn = document.getElementById('carousel-next-btn');
  const track = document.getElementById('carousel-track');

  if (!track || !prevBtn || !nextBtn) return;

  prevBtn.addEventListener('click', () => {
    const scrollAmount = track.offsetWidth * 0.6;
    track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    const scrollAmount = track.offsetWidth * 0.6;
    track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });

  // Hide scroll buttons if container is not scrollable
  const toggleButtons = () => {
    const isScrollable = track.scrollWidth > track.clientWidth;
    prevBtn.style.display = isScrollable ? 'inline-flex' : 'none';
    nextBtn.style.display = isScrollable ? 'inline-flex' : 'none';
  };

  window.addEventListener('resize', toggleButtons);
  setTimeout(toggleButtons, 500); // Wait for items load
};

// =========================================================================
// 6. DYNAMIC PRODUCTS LOADERS & CUSTOM LAB CONFIGURATION
// =========================================================================

// Load New Arrivals Showcase
const loadNewArrivals = async () => {
  const grid = document.getElementById('new-arrivals-grid');
  if (!grid) return;

  const { data: products, error } = await window.dbAPI.getProducts();

  if (error || !products || products.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1; text-align:center;">Failed to retrieve new arrivals.</p>';
    return;
  }

  // Display first 3 products
  const arrivals = products.slice(0, 3);

  grid.innerHTML = arrivals.map(p => `
    <article class="product-card tilt-card" style="background-color: var(--bg-secondary); border-radius: var(--border-radius-md);">
      <div class="card-shine"></div>
      <div class="product-image-container">
        <a href="product-details.html?id=${p.id}">
          <img src="${p.image_url}" alt="${p.name}" class="product-img" loading="lazy">
        </a>
      </div>
      <div class="product-info" style="padding: 1.5rem;">
        <span class="product-category" style="font-size: 0.688rem; text-transform: uppercase; color: var(--text-tertiary); letter-spacing: 0.05em;">${p.categories?.name || 'Collection'}</span>
        <a href="product-details.html?id=${p.id}"><h3 class="product-title" style="font-size: 1.15rem; font-weight: 500; margin: 0.25rem 0 0.5rem 0; color: var(--text-primary);">${p.name}</h3></a>
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top: 1.25rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
          <strong style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 600; color: var(--text-primary);">$${parseFloat(p.price).toFixed(2)}</strong>
          <button class="buy-now-card-btn" data-id="${p.id}" style="font-size: 0.75rem; letter-spacing:0.05em; color: var(--aurora-cyan); font-weight:600; display:flex; align-items:center; gap:0.25rem; background:none; border:none; cursor:pointer;">
            PRE-ORDER 
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </article>
  `).join('');

  // Bind pre-order click pipeline to checkout session
  grid.querySelectorAll('.buy-now-card-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const pId = btn.getAttribute('data-id');
      const prod = arrivals.find(p => p.id === pId);
      if (prod) {
        const checkoutItem = {
          product_id: prod.id,
          name: prod.name,
          price: prod.price,
          image_url: prod.image_url,
          selected_size: 'M',
          selected_color: prod.colors[0] || 'Default',
          quantity: 1
        };
        sessionStorage.setItem("AURA_CHECKOUT_ITEM", JSON.stringify(checkoutItem));
        window.location.href = "checkout.html";
      }
    });
  });

  // Re-bind tilts and cursor listeners
  initCardTilts(grid);
  if (window.bindCursorHoverTargets) window.bindCursorHoverTargets();
};

// Load Horizontal Featured Products Carousel
const loadFeaturedCarousel = async () => {
  const track = document.getElementById('carousel-track');
  if (!track) return;

  const { data: products, error } = await window.dbAPI.getProducts();

  if (error || !products || products.length === 0) {
    track.innerHTML = '<p style="text-align:center;">Failed to retrieve featured highlights.</p>';
    return;
  }

  // Filter products where featured is true
  const featured = products.filter(p => p.featured === true);
  const displayItems = featured.length > 0 ? featured : products.slice(3, 8);

  track.innerHTML = displayItems.map(p => `
    <div class="tilt-card" style="flex: 0 0 280px; background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); overflow: hidden; position: relative;">
      <div class="card-shine"></div>
      <div style="aspect-ratio: 3/4; background-color: var(--bg-secondary); overflow: hidden;">
        <a href="product-details.html?id=${p.id}">
          <img src="${p.image_url}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover; transition: transform var(--transition-slow);" onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'" loading="lazy">
        </a>
      </div>
      <div style="padding: 1.25rem;">
        <span style="font-size: 0.625rem; text-transform: uppercase; color: var(--text-tertiary); letter-spacing: 0.05em;">Featured Drop</span>
        <a href="product-details.html?id=${p.id}"><h4 style="font-size: 1rem; font-weight: 500; margin: 0.25rem 0 0.5rem 0; color: var(--text-primary); text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${p.name}</h4></a>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 0.75rem; margin-top: 0.75rem;">
          <strong style="font-family: var(--font-display); font-size: 1.15rem; font-weight: 600; color: var(--text-primary);">$${parseFloat(p.price).toFixed(2)}</strong>
          <button class="buy-now-card-btn" data-id="${p.id}" style="font-size: 0.688rem; font-weight: 600; color: var(--aurora-cyan); display: flex; align-items: center; gap: 0.25rem; background:none; border:none; cursor:pointer;">
            PRE-ORDER <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  // Bind pre-order click pipeline to checkout session
  track.querySelectorAll('.buy-now-card-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const pId = btn.getAttribute('data-id');
      const prod = displayItems.find(p => p.id === pId);
      if (prod) {
        const checkoutItem = {
          product_id: prod.id,
          name: prod.name,
          price: prod.price,
          image_url: prod.image_url,
          selected_size: 'M',
          selected_color: prod.colors[0] || 'Default',
          quantity: 1
        };
        sessionStorage.setItem("AURA_CHECKOUT_ITEM", JSON.stringify(checkoutItem));
        window.location.href = "checkout.html";
      }
    });
  });

  // Re-bind tilts and cursor listeners
  initCardTilts(track);
  if (window.bindCursorHoverTargets) window.bindCursorHoverTargets();
};

// Update Configurator Previews
const updateConfigPreview = () => {
  const imgEl = document.getElementById('config-preview-img');
  const priceEl = document.getElementById('config-price-display');
  const aiTextEl = document.getElementById('ai-response-text');
  const aiTerminalDot = document.querySelector('.ai-terminal-dot');

  const configInfo = CONFIG_MAP[selectedMaterial];
  const colorInfo = configInfo.colors[selectedColor];

  if (!configInfo || !colorInfo) return;

  // 1. Update Preview Image & Price details
  if (imgEl) {
    imgEl.src = colorInfo.imageUrl;
    imgEl.alt = `${configInfo.name} in ${colorInfo.name}`;
  }
  if (priceEl) {
    priceEl.textContent = `$${parseFloat(configInfo.price).toFixed(2)}`;
  }

  // 2. Trigger simulated AI recommendation typewriter effect
  if (aiTextEl) {
    const textRecommendation = AI_STYLIST_RECS[selectedMaterial][selectedColor];
    
    // Add pulsing indicator on typing start
    if (aiTerminalDot) {
      aiTerminalDot.style.animation = 'pulse 0.4s infinite alternate';
      aiTerminalDot.style.background = '#00e5ff';
      aiTerminalDot.style.boxShadow = '0 0 10px #00e5ff';
    }

    typewriterEffect(aiTextEl, textRecommendation, () => {
      // Revert indicator to normal breathing rhythm when complete
      if (aiTerminalDot) {
        aiTerminalDot.style.animation = 'pulse 2s infinite alternate';
        aiTerminalDot.style.background = 'var(--status-success)';
        aiTerminalDot.style.boxShadow = '0 0 8px var(--status-success)';
      }
    });
  }
};

// Typewriter Text Animator
const typewriterEffect = (element, text, callback) => {
  if (typewriterTimeout) {
    clearTimeout(typewriterTimeout);
  }
  
  element.textContent = '';
  let index = 0;

  const type = () => {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
      typewriterTimeout = setTimeout(type, 15); // Speed tweak
    } else if (callback) {
      callback();
    }
  };

  type();
};

// Initialize Custom Lab Designer Swatches
const initConfigurator = () => {
  const materialBtns = document.querySelectorAll('#material-options [data-material]');
  const colorBtns = document.querySelectorAll('#color-options [data-color]');
  const preorderBtn = document.getElementById('config-preorder-btn');

  // Set default initial view
  updateConfigPreview();

  // Material selection listeners
  materialBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      materialBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedMaterial = btn.getAttribute('data-material');
      updateConfigPreview();
    });
  });

  // Color selection listeners
  colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      colorBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedColor = btn.getAttribute('data-color');
      updateConfigPreview();
    });
  });

  // Direct checkout setup
  if (preorderBtn) {
    preorderBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const configInfo = CONFIG_MAP[selectedMaterial];
      const colorInfo = configInfo.colors[selectedColor];
      
      const checkoutItem = {
        product_id: configInfo.productId,
        name: `${configInfo.name} - ${colorInfo.name}`,
        price: configInfo.price,
        image_url: colorInfo.imageUrl,
        selected_size: 'M', // default guest/homepage size
        selected_color: colorInfo.name,
        quantity: 1
      };
      
      sessionStorage.setItem("AURA_CHECKOUT_ITEM", JSON.stringify(checkoutItem));
      window.location.href = "checkout.html";
    });
  }
};

// =========================================================================
// 7. INITIALIZE PAGE HANDLERS
// =========================================================================
document.addEventListener("DOMContentLoaded", async () => {
  // Parallel asynchronous loaders
  await Promise.all([
    loadNewArrivals(),
    loadFeaturedCarousel()
  ]);

  // Run dynamic features
  initCustomCursor();
  initCardTilts();
  initScrollReveals();
  initTimelineProgress();
  initCarousel();
  initConfigurator();
});
