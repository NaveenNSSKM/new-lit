/**
 * Supabase client wrapper & Demo Mode Database engine
 * Auto-fallback safe wrapper
 */

let supabaseClient = null;

// Initialize Supabase client
const initSupabase = async () => {
  if (window.supabase) {
    try {
      supabaseClient = window.supabase.createClient(
        window.FASHION_CONFIG.SUPABASE_URL,
        window.FASHION_CONFIG.SUPABASE_ANON_KEY
      );
      console.log("Supabase Client initialized successfully in Live Mode.");
    } catch (e) {
      console.error("Failed to initialize Supabase client:", e);
    }
  } else {
    console.error("Supabase script CDN dependency not loaded.");
  }
};

// =========================================================================
// DATABASE UTILITIES (DIRECT SUPABASE EXECUTION ONLY)
// =========================================================================

// Execution helper for Database APIs
const runQuery = async (supabasePromise, fallbackFunc) => {
  if (supabaseClient) {
    try {
      return await supabasePromise();
    } catch (err) {
      console.error("Supabase Database error:", err);
      return { data: null, error: err };
    }
  }
  return { data: null, error: { message: "Supabase client not initialized." } };
};

// Execution helper for Auth APIs
const runAuth = async (supabasePromise, fallbackFunc) => {
  if (supabaseClient) {
    try {
      return await supabasePromise();
    } catch (err) {
      console.error("Supabase Auth error:", err);
      return { data: null, error: err };
    }
  }
  return { data: null, error: { message: "Supabase client not initialized." } };
};

// =========================================================================
// AUTHENTICATION INTERFACES
// =========================================================================
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const authAPI = {
  signUp: async (email, password, fullName, phone) => {
    return runAuth(
      async () => {
        // Check if user already exists
        const { data: existingUser, error: checkError } = await supabaseClient
          .from('users')
          .select('id')
          .eq('email', email)
          .maybeSingle();

        if (checkError) {
          return { data: null, error: checkError };
        }
        if (existingUser) {
          return { data: null, error: { message: "User already exists with this email address." } };
        }

        const userId = generateUUID();
        const newUserProfile = {
          id: userId,
          full_name: fullName,
          email: email,
          password: password,
          phone: phone,
          profile_image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop",
          address: ""
        };

        const { data, error } = await supabaseClient
          .from('users')
          .insert(newUserProfile)
          .select()
          .single();

        if (error) {
          return { data: null, error };
        }

        // Store user profile locally to maintain session
        localStorage.setItem("SUPABASE_USER_PROFILE", JSON.stringify(data));
        return { data: { user: data }, error: null };
      },
      async () => {
        const users = getDemoData("DEMO_USERS_AUTH") || [];
        if (users.find(u => u.email === email)) {
          return { data: null, error: { message: "User already exists with this email address." } };
        }
        
        const userId = "user_" + Math.random().toString(36).substr(2, 9);
        const newUser = { id: userId, email, password, full_name: fullName, phone };
        users.push(newUser);
        setDemoData("DEMO_USERS_AUTH", users);
        
        const profiles = getDemoData("DEMO_USERS") || {};
        const newProfile = {
          id: userId,
          full_name: fullName,
          email,
          phone,
          profile_image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop",
          address: ""
        };
        setDemoData("DEMO_USERS", newProfile);
        
        localStorage.setItem("DEMO_SESSION_USER", JSON.stringify(newProfile));
        return { data: { user: newProfile }, error: null };
      }
    );
  },

  signIn: async (email, password) => {
    return runAuth(
      async () => {
        // Query users table for matching email and password
        const { data: profile, error } = await supabaseClient
          .from('users')
          .select('*')
          .eq('email', email)
          .eq('password', password)
          .maybeSingle();

        if (error) {
          return { data: null, error };
        }
        if (!profile) {
          return { data: null, error: { message: "Invalid email or password." } };
        }

        localStorage.setItem("SUPABASE_USER_PROFILE", JSON.stringify(profile));
        return { data: { user: profile }, error: null };
      },
      async () => {
        const users = getDemoData("DEMO_USERS_AUTH") || [];
        
        if (!users.find(u => u.email === "customer@luxurybrand.com")) {
          users.push({
            id: "demo_user_id",
            email: "customer@luxurybrand.com",
            password: "password123",
            full_name: "Valued Customer",
            phone: "+1 555-0199"
          });
          setDemoData("DEMO_USERS_AUTH", users);
        }

        const match = users.find(u => u.email === email && u.password === password);
        if (match) {
          const userProfile = match.id === "demo_user_id" ? getDemoData("DEMO_USERS") : {
            id: match.id,
            full_name: match.full_name,
            email: match.email,
            phone: match.phone,
            profile_image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=150&auto=format&fit=crop",
            address: ""
          };
          localStorage.setItem("DEMO_SESSION_USER", JSON.stringify(userProfile));
          return { data: { user: userProfile }, error: null };
        } else {
          return { data: null, error: { message: "Invalid email or password." } };
        }
      }
    );
  },

  signOut: async () => {
    return runAuth(
      async () => {
        localStorage.removeItem("SUPABASE_USER_PROFILE");
        return { error: null };
      },
      async () => {
        localStorage.removeItem("DEMO_SESSION_USER");
        return { error: null };
      }
    );
  },

  getUser: async () => {
    return runAuth(
      async () => {
        let profile = JSON.parse(localStorage.getItem("SUPABASE_USER_PROFILE"));
        return profile || null;
      },
      async () => {
        return JSON.parse(localStorage.getItem("DEMO_SESSION_USER")) || null;
      }
    );
  },

  updateProfile: async (fullName, phone, address, profileImage) => {
    const user = await authAPI.getUser();
    if (!user) return { error: { message: "User session not found." } };

    return runAuth(
      async () => {
        const { data, error } = await supabaseClient
          .from('users')
          .update({ full_name: fullName, phone, address, profile_image: profileImage })
          .eq('id', user.id)
          .select()
          .single();
        if (!error && data) {
          localStorage.setItem("SUPABASE_USER_PROFILE", JSON.stringify(data));
        }
        return { data, error };
      },
      async () => {
        const profile = getDemoData("DEMO_USERS") || {};
        profile.full_name = fullName;
        profile.phone = phone;
        profile.address = address;
        if (profileImage) profile.profile_image = profileImage;
        setDemoData("DEMO_USERS", profile);
        localStorage.setItem("DEMO_SESSION_USER", JSON.stringify(profile));
        return { data: profile, error: null };
      }
    );
  },

  changePassword: async (newPassword) => {
    const user = await authAPI.getUser();
    if (!user) return { error: { message: "User session not found." } };

    return runAuth(
      async () => {
        const { data, error } = await supabaseClient
          .from('users')
          .update({ password: newPassword })
          .eq('id', user.id)
          .select()
          .single();
        if (!error && data) {
          localStorage.setItem("SUPABASE_USER_PROFILE", JSON.stringify(data));
        }
        return { data, error };
      },
      async () => {
        const activeUser = JSON.parse(localStorage.getItem("DEMO_SESSION_USER"));
        if (!activeUser) return { error: { message: "Not logged in." } };
        
        const authList = getDemoData("DEMO_USERS_AUTH") || [];
        const match = authList.find(u => u.id === activeUser.id);
        if (match) {
          match.password = newPassword;
          setDemoData("DEMO_USERS_AUTH", authList);
        }
        return { data: true, error: null };
      }
    );
  }
};

// =========================================================================
// DATABASE FUNCTIONS (PRODUCTS, CATEGORIES, WISHLIST, ORDERS)
// =========================================================================
const dbAPI = {
  // --- Categories ---
  getCategories: async () => {
    return runQuery(
      () => supabaseClient.from('categories').select('*').order('name'),
      async () => ({ data: getDemoData("DEMO_CATEGORIES"), error: null })
    );
  },

  addCategory: async (name, image_url) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return runQuery(
      () => supabaseClient.from('categories').insert({ name, slug, image_url }).select().single(),
      async () => {
        const categories = getDemoData("DEMO_CATEGORIES") || [];
        const newCat = { id: 'c_' + Date.now(), name, slug, image_url, created_at: new Date().toISOString() };
        categories.push(newCat);
        setDemoData("DEMO_CATEGORIES", categories);
        return { data: newCat, error: null };
      }
    );
  },

  deleteCategory: async (id) => {
    return runQuery(
      () => supabaseClient.from('categories').delete().eq('id', id),
      async () => {
        let categories = getDemoData("DEMO_CATEGORIES") || [];
        categories = categories.filter(c => c.id !== id);
        setDemoData("DEMO_CATEGORIES", categories);
        return { error: null };
      }
    );
  },

  // --- Products ---
  getProducts: async () => {
    return runQuery(
      () => supabaseClient.from('products').select('*, categories(name)').order('created_at', { ascending: false }),
      async () => {
        const products = getDemoData("DEMO_PRODUCTS") || [];
        const categories = getDemoData("DEMO_CATEGORIES") || [];
        const populated = products.map(p => {
          const cat = categories.find(c => c.id === p.category_id);
          return { ...p, categories: cat ? { name: cat.name } : { name: "Uncategorized" } };
        });
        return { data: populated, error: null };
      }
    );
  },

  getProductById: async (id) => {
    return runQuery(
      () => supabaseClient.from('products').select('*, categories(name)').eq('id', id).single(),
      async () => {
        const products = getDemoData("DEMO_PRODUCTS") || [];
        const categories = getDemoData("DEMO_CATEGORIES") || [];
        const match = products.find(p => p.id === id);
        if (match) {
          const cat = categories.find(c => c.id === match.category_id);
          return { data: { ...match, categories: cat ? { name: cat.name } : { name: "Uncategorized" } }, error: null };
        }
        return { data: null, error: { message: "Product not found." } };
      }
    );
  },

  addProduct: async (productData) => {
    return runQuery(
      () => supabaseClient.from('products').insert(productData).select().single(),
      async () => {
        const products = getDemoData("DEMO_PRODUCTS") || [];
        const newProd = {
          id: 'p_' + Date.now(),
          ...productData,
          created_at: new Date().toISOString()
        };
        products.push(newProd);
        setDemoData("DEMO_PRODUCTS", products);
        return { data: newProd, error: null };
      }
    );
  },

  updateProduct: async (id, productData) => {
    return runQuery(
      () => supabaseClient.from('products').update(productData).eq('id', id).select().single(),
      async () => {
        const products = getDemoData("DEMO_PRODUCTS") || [];
        const idx = products.findIndex(p => p.id === id);
        if (idx !== -1) {
          products[idx] = { ...products[idx], ...productData };
          setDemoData("DEMO_PRODUCTS", products);
          return { data: products[idx], error: null };
        }
        return { data: null, error: { message: "Product not found." } };
      }
    );
  },

  deleteProduct: async (id) => {
    return runQuery(
      () => supabaseClient.from('products').delete().eq('id', id),
      async () => {
        let products = getDemoData("DEMO_PRODUCTS") || [];
        products = products.filter(p => p.id !== id);
        setDemoData("DEMO_PRODUCTS", products);
        return { error: null };
      }
    );
  },

  // --- Reviews ---
  getProductReviews: async (productId) => {
    const reviews = getDemoData("DEMO_REVIEWS") || {};
    return { data: reviews[productId] || [], error: null };
  },

  addProductReview: async (productId, reviewerName, rating, comment) => {
    const reviews = getDemoData("DEMO_REVIEWS") || {};
    if (!reviews[productId]) reviews[productId] = [];
    
    const newRev = {
      name: reviewerName,
      rating: parseInt(rating),
      comment,
      date: new Date().toISOString().split('T')[0]
    };
    reviews[productId].unshift(newRev);
    setDemoData("DEMO_REVIEWS", reviews);
    return { data: newRev, error: null };
  },

  // Wishlist functions removed

  // --- Orders ---
  getOrders: async (userId) => {
    return runQuery(
      () => supabaseClient.from('order_details').select('*, products(*)').eq('user_id', userId).order('created_at', { ascending: false }),
      async () => {
        const orders = getDemoData("DEMO_ORDERS") || [];
        const userOrders = orders.filter(o => o.user_id === userId);
        const products = getDemoData("DEMO_PRODUCTS") || [];
        const populated = userOrders.map(o => {
          return { ...o, products: products.find(p => p.id === o.product_id) };
        }).filter(o => o.products !== undefined);
        return { data: populated, error: null };
      }
    );
  },

  getAllOrders: async () => {
    return runQuery(
      () => supabaseClient.from('order_details').select('*, products(*), users(*)').order('created_at', { ascending: false }),
      async () => {
        const orders = getDemoData("DEMO_ORDERS") || [];
        const products = getDemoData("DEMO_PRODUCTS") || [];
        const activeUserProfile = getDemoData("DEMO_USERS");
        const populated = orders.map(o => {
          return { 
            ...o, 
            products: products.find(p => p.id === o.product_id),
            users: activeUserProfile 
          };
        });
        return { data: populated, error: null };
      }
    );
  },

  createOrder: async (orderData) => {
    return runQuery(
      async () => {
        let resolvedUserId = null;
        let userEmail = null;

        // Parse email address from shipping_address string to find correct UUID
        if (orderData.shipping_address && orderData.shipping_address.includes('Email: ')) {
          const parts = orderData.shipping_address.split('Email: ');
          if (parts.length > 1) {
            userEmail = parts[1].split('\n')[0].trim();
          }
        }

        if (userEmail) {
          const { data: dbProfile } = await supabaseClient
            .from('users')
            .select('*')
            .eq('email', userEmail)
            .maybeSingle();
          if (dbProfile) {
            resolvedUserId = dbProfile.id;
            // Update active local session to correct profile from database
            localStorage.setItem("SUPABASE_USER_PROFILE", JSON.stringify(dbProfile));
          }
        }

        // Apply resolved user ID or fall back to original
        orderData.user_id = resolvedUserId || orderData.user_id;

        // Verify that the user ID exists in the database and is a valid UUID format
        const isUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
        if (orderData.user_id && !isUUID(orderData.user_id)) {
          orderData.user_id = null;
        }

        if (orderData.user_id) {
          const { data: userRecord } = await supabaseClient
            .from('users')
            .select('id')
            .eq('id', orderData.user_id)
            .maybeSingle();
          if (!userRecord) {
            orderData.user_id = null;
          }
        }
        
        const response = await supabaseClient.from('order_details').insert(orderData).select().single();
        if (response.error) {
          console.warn("Order insertion failed:", response.error);
          if (orderData.user_id !== null) {
            console.warn("Retrying order insertion as guest due to error...");
            orderData.user_id = null;
            return supabaseClient.from('order_details').insert(orderData).select().single();
          }
        }
        return response;
      },
      async () => {
        const orders = getDemoData("DEMO_ORDERS") || [];
        const newOrder = {
          id: 'ord_' + Math.floor(100000 + Math.random() * 900000),
          ...orderData,
          order_status: 'Processing',
          created_at: new Date().toISOString()
        };
        
        const products = getDemoData("DEMO_PRODUCTS") || [];
        const match = products.find(p => p.id === orderData.product_id);
        if (match && match.stock >= orderData.quantity) {
          match.stock -= orderData.quantity;
          setDemoData("DEMO_PRODUCTS", products);
        }

        orders.unshift(newOrder);
        setDemoData("DEMO_ORDERS", orders);
        return { data: newOrder, error: null };
      }
    );
  },

  updateOrderStatus: async (orderId, orderStatus) => {
    return runQuery(
      () => supabaseClient.from('order_details').update({ order_status: orderStatus }).eq('id', orderId).select().single(),
      async () => {
        const orders = getDemoData("DEMO_ORDERS") || [];
        const idx = orders.findIndex(o => o.id === orderId);
        if (idx !== -1) {
          orders[idx].order_status = orderStatus;
          setDemoData("DEMO_ORDERS", orders);
          return { data: orders[idx], error: null };
        }
        return { data: null, error: { message: "Order not found." } };
      }
    );
  },

  updateOrderPaymentStatus: async (orderId, paymentId, paymentStatus) => {
    return runQuery(
      () => supabaseClient.from('order_details').update({ payment_id: paymentId, payment_status: paymentStatus }).eq('id', orderId).select().single(),
      async () => {
        const orders = getDemoData("DEMO_ORDERS") || [];
        const idx = orders.findIndex(o => o.id === orderId);
        if (idx !== -1) {
          orders[idx].payment_id = paymentId;
          orders[idx].payment_status = paymentStatus;
          setDemoData("DEMO_ORDERS", orders);
          return { data: orders[idx], error: null };
        }
        return { data: null, error: { message: "Order not found." } };
      }
    );
  },

  // --- Admin Dashboard Stats ---
  getAdminStats: async () => {
    return runQuery(
      async () => {
        const { data: o } = await supabaseClient.from('order_details').select('*');
        const { data: p } = await supabaseClient.from('products').select('*');
        const orders = o || [];
        const products = p || [];
        const totalSales = orders.filter(o => o.payment_status === 'Paid').reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
        const itemsSold = orders.filter(o => o.payment_status === 'Paid').reduce((sum, o) => sum + o.quantity, 0);
        const pendingOrders = orders.filter(o => o.order_status === 'Processing').length;
        const lowStockItems = products.filter(p => p.stock <= 5).length;
        return { totalSales, itemsSold, pendingOrders, lowStockItems };
      },
      async () => {
        const orders = getDemoData("DEMO_ORDERS") || [];
        const products = getDemoData("DEMO_PRODUCTS") || [];
        const totalSales = orders.filter(o => o.payment_status === 'Paid').reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
        const itemsSold = orders.filter(o => o.payment_status === 'Paid').reduce((sum, o) => sum + o.quantity, 0);
        const pendingOrders = orders.filter(o => o.order_status === 'Processing').length;
        const lowStockItems = products.filter(p => p.stock <= 5).length;
        return { totalSales, itemsSold, pendingOrders, lowStockItems };
      }
    );
  }
};

// Expose APIs globally
window.authAPI = authAPI;
window.dbAPI = dbAPI;

// Auto-run client initializer
document.addEventListener("DOMContentLoaded", initSupabase);
