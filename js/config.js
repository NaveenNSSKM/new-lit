/**
 * App Configuration & Database Seed Manager
 */

// Retrieve stored configs or fall back to defaults
const getStoredConfig = (key, defaultValue = "") => {
  return localStorage.getItem(`FASHION_CONFIG_${key}`) || defaultValue;
};

// Application Config Keys
window.FASHION_CONFIG = {
  SUPABASE_URL: getStoredConfig("SUPABASE_URL", "https://csbgpspugpsjkjqdckcm.supabase.co"),
  SUPABASE_ANON_KEY: getStoredConfig("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYmdwc3B1Z3BzamtqcWRja2NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNTczMzQsImV4cCI6MjA5NjYzMzMzNH0.RSTuaDOYbAZha2p9FzBZHlD_kYRSY_hkSQwsWAjulw4"),
  RAZORPAY_KEY_ID: getStoredConfig("RAZORPAY_KEY_ID", "rzp_test_demo12345"), // Default test key
  
  // Set credentials helper
  updateConfig: (supabaseUrl, supabaseKey, razorpayKey) => {
    localStorage.setItem("FASHION_CONFIG_SUPABASE_URL", supabaseUrl);
    localStorage.setItem("FASHION_CONFIG_SUPABASE_ANON_KEY", supabaseKey);
    localStorage.setItem("FASHION_CONFIG_RAZORPAY_KEY_ID", razorpayKey);
    window.location.reload();
  },
  
  // Clear config helper
  clearConfig: () => {
    localStorage.removeItem("FASHION_CONFIG_SUPABASE_URL");
    localStorage.removeItem("FASHION_CONFIG_SUPABASE_ANON_KEY");
    localStorage.removeItem("FASHION_CONFIG_RAZORPAY_KEY_ID");
    window.location.reload();
  },

  // Check if we are running in Demo mode (offline fallback mode)
  isDemoMode: () => {
    return false;
  }
};

// =========================================================================
// OFFLINE HIGH-FIDELITY MOCK DATABASE FOR DEMO MODE
// =========================================================================

const MOCK_CATEGORIES = [
  { id: 'c0000000-0000-0000-0000-000000000001', name: 'New Arrival', slug: 'new-arrival', image_url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop' },
  { id: 'c0000000-0000-0000-0000-000000000002', name: 'T-Shirt', slug: 't-shirt', image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop' },
  { id: 'c0000000-0000-0000-0000-000000000003', name: 'Hoodies', slug: 'hoodies', image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop' },
  { id: 'c0000000-0000-0000-0000-000000000004', name: 'Custom T-Shirt', slug: 'custom-t-shirt', image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop' }
];

const MOCK_PRODUCTS = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000002',
    name: 'Heavyweight Boxy Tee',
    description: 'Crafted from 240GSM combed cotton, this heavyweight tee features a drop-shoulder boxy fit that holds its shape perfectly. Designed for everyday premium layering.',
    price: 35.00,
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop',
    stock: 50,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Charcoal', 'Off-White', 'Sage', 'Sand'],
    featured: true,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    category_id: 'c0000000-0000-0000-0000-000000000002',
    name: 'Classic Pima Cotton Tee',
    description: 'An ultra-soft everyday crewneck knitted with 100% long-staple Pima cotton. Breathable, durable, and naturally smooth to the skin.',
    price: 32.00,
    image_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop',
    stock: 75,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Onyx Black', 'Pure White', 'Sage'],
    featured: false,
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    category_id: 'c0000000-0000-0000-0000-000000000002',
    name: 'Organic Cotton Pocket Tee',
    description: 'Minimalist detailing meets organic sustainability. Features a single chest pocket, relaxed ribbed collar, and pre-shrunk wash.',
    price: 28.00,
    image_url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=1000&auto=format&fit=crop',
    stock: 40,
    sizes: ['S', 'M', 'L'],
    colors: ['Natural Raw', 'Clay', 'Olive'],
    featured: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'a0000000-0000-0000-0000-000000000004',
    category_id: 'c0000000-0000-0000-0000-000000000003',
    name: 'Oversized Heavyweight Hoodie',
    description: 'Made of 450GSM loopback French terry cotton. A generous hood with no drawcords for a clean aesthetic. Perfect streetwear drape.',
    price: 68.00,
    image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop',
    stock: 30,
    sizes: ['M', 'L', 'XL'],
    colors: ['Espresso', 'Onyx Black', 'Heather Grey'],
    featured: true,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'a0000000-0000-0000-0000-000000000005',
    category_id: 'c0000000-0000-0000-0000-000000000003',
    name: 'Distressed Acid-Wash Hoodie',
    description: 'Each piece is uniquely hand-dyed and custom acid-washed. Micro-distressed ribbing at cuffs and hem. Standard vintage comfort.',
    price: 75.00,
    image_url: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?q=80&w=1000&auto=format&fit=crop',
    stock: 25,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Acid Grey', 'Vintage Plum'],
    featured: false,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'a0000000-0000-0000-0000-000000000006',
    category_id: 'c0000000-0000-0000-0000-000000000004',
    name: 'Custom Typographic Tee',
    description: 'Create your own style. Type up to 20 characters of custom text to be precision printed on our heavyweight 100% cotton crewneck.',
    price: 39.00,
    image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop',
    stock: 99,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Vintage Black', 'Milk White'],
    featured: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'a0000000-0000-0000-0000-000000000007',
    category_id: 'c0000000-0000-0000-0000-000000000001',
    name: 'Signature Embroidered Tee',
    description: 'A limited-run item. Highlights a micro embroidered brand signature logo at center-chest. Soft brushed midweight cotton.',
    price: 34.00,
    image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop',
    stock: 45,
    sizes: ['S', 'M', 'L'],
    colors: ['Eggshell', 'Sage', 'Navy Blue'],
    featured: true,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const MOCK_REVIEWS = {
  'a0000000-0000-0000-0000-000000000001': [
    { name: 'Sarah M.', rating: 5, comment: 'Perfect boxy fit. Heavy fabric feels like a high-end designer piece. Will buy more.', date: '2026-06-05' },
    { name: 'David K.', rating: 4, comment: 'Very nice quality. A bit oversized, so size down if you want a snug fit.', date: '2026-05-28' }
  ],
  'a0000000-0000-0000-0000-000000000004': [
    { name: 'Alex L.', rating: 5, comment: 'Incredible weight and no drawstrings makes it look so clean. Truly premium.', date: '2026-06-02' }
  ],
  'a0000000-0000-0000-0000-000000000006': [
    { name: 'Jessica P.', rating: 5, comment: 'The typography was printed beautifully and fabric quality is outstanding.', date: '2026-06-07' }
  ]
};

// Initialize Demo Data in localStorage if not exists or if it contains old IDs
const initDemoLocalStorage = () => {
  const cachedProducts = localStorage.getItem("DEMO_PRODUCTS");
  const cachedCategories = localStorage.getItem("DEMO_CATEGORIES");

  const needsReset = !cachedProducts || 
                      !cachedCategories || 
                      cachedProducts.includes('"p01"') || 
                      cachedCategories.includes('"c01"');

  if (needsReset) {
    localStorage.setItem("DEMO_PRODUCTS", JSON.stringify(MOCK_PRODUCTS));
    localStorage.setItem("DEMO_CATEGORIES", JSON.stringify(MOCK_CATEGORIES));
    localStorage.setItem("DEMO_REVIEWS", JSON.stringify(MOCK_REVIEWS));
    localStorage.setItem("DEMO_ORDERS", JSON.stringify([]));
    localStorage.setItem("DEMO_WISHLIST", JSON.stringify([]));
    
    // Reset initial demo profile
    localStorage.setItem("DEMO_USERS", JSON.stringify({
      id: "demo_user_id",
      full_name: "Valued Customer",
      email: "customer@luxurybrand.com",
      phone: "+1 555-0199",
      profile_image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop",
      address: "128 Minimalist Boulevard, Apt 4B, New York, NY 10001"
    }));
  }
};

initDemoLocalStorage();
