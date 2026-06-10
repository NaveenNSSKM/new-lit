-- Suppress standard notices
SET client_min_messages TO warning;

-- =========================================================================
-- DROP TABLES IF THEY EXIST (For clean setup)
-- =========================================================================
-- wishlist dropped
DROP TABLE IF EXISTS order_details CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =========================================================================
-- CREATE TABLES
-- =========================================================================

-- 1. Users Profile Table (Extends Supabase Auth users)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255), -- Storing password
  phone VARCHAR(50),
  profile_image TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  sizes VARCHAR(10)[] NOT NULL DEFAULT ARRAY['S', 'M', 'L', 'XL'],
  colors VARCHAR(50)[] NOT NULL DEFAULT ARRAY['White', 'Black'],
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Order Details Table
CREATE TABLE order_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  selected_size VARCHAR(10) NOT NULL,
  selected_color VARCHAR(50) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_id VARCHAR(255), -- Razorpay Payment ID
  payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Paid', 'Failed'
  order_status VARCHAR(50) NOT NULL DEFAULT 'Processing', -- 'Processing', 'Shipped', 'Delivered', 'Cancelled'
  shipping_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Wishlist Table removed

-- =========================================================================
-- CREATE MOCK DATA SEED
-- =========================================================================

-- Insert Categories
INSERT INTO categories (id, name, slug, image_url) VALUES
('c0000000-0000-0000-0000-000000000001', 'New Arrival', 'new-arrival', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop'),
('c0000000-0000-0000-0000-000000000002', 'T-Shirt', 't-shirt', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop'),
('c0000000-0000-0000-0000-000000000003', 'Hoodies', 'hoodies', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop'),
('c0000000-0000-0000-0000-000000000004', 'Custom T-Shirt', 'custom-t-shirt', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop');

-- Insert Products
INSERT INTO products (id, category_id, name, description, price, image_url, stock, sizes, colors, featured) VALUES
-- T-Shirts
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Heavyweight Boxy Tee', 'Crafted from 240GSM combed cotton, this heavyweight tee features a drop-shoulder boxy fit that holds its shape perfectly. Designed for everyday premium layering.', 35.00, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop', 50, ARRAY['S', 'M', 'L', 'XL'], ARRAY['Charcoal', 'Off-White', 'Sage', 'Sand'], true),
('a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'Classic Pima Cotton Tee', 'An ultra-soft everyday crewneck knitted with 100% long-staple Pima cotton. Breathable, durable, and naturally smooth to the skin.', 32.00, 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop', 75, ARRAY['S', 'M', 'L', 'XL'], ARRAY['Onyx Black', 'Pure White', 'Sage'], false),
('a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'Organic Cotton Pocket Tee', 'Minimalist detailing meets organic sustainability. Features a single chest pocket, relaxed ribbed collar, and pre-shrunk wash.', 28.00, 'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=1000&auto=format&fit=crop', 40, ARRAY['S', 'M', 'L'], ARRAY['Natural Raw', 'Clay', 'Olive'], true),

-- Hoodies
('a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003', 'Oversized Heavyweight Hoodie', 'Made of 450GSM loopback French terry cotton. A generous hood with no drawcords for a clean aesthetic. Perfect streetwear drape.', 68.00, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop', 30, ARRAY['M', 'L', 'XL'], ARRAY['Espresso', 'Onyx Black', 'Heather Grey'], true),
('a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000003', 'Distressed Acid-Wash Hoodie', 'Each piece is uniquely hand-dyed and custom acid-washed. Micro-distressed ribbing at cuffs and hem. Standard vintage comfort.', 75.00, 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?q=80&w=1000&auto=format&fit=crop', 25, ARRAY['S', 'M', 'L', 'XL'], ARRAY['Acid Grey', 'Vintage Plum'], false),

-- Custom T-Shirt
('a0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000004', 'Custom Typographic Tee', 'Create your own style. Type up to 20 characters of custom text to be precision printed on our heavyweight 100% cotton crewneck.', 39.00, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop', 99, ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Vintage Black', 'Milk White'], true),

-- New Arrival
('a0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000001', 'Signature Embroidered Tee', 'A limited-run item. Highlights a micro embroidered brand signature logo at center-chest. Soft brushed midweight cotton.', 34.00, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop', 45, ARRAY['S', 'M', 'L'], ARRAY['Eggshell', 'Sage', 'Navy Blue'], true);

-- =========================================================================
-- CREATE TRIGGERS FOR NEW USERS FROM AUTH
-- =========================================================================
-- Note: This trigger automatically syncs auth.users created by supabase authentication
-- into our public.users table.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, phone, profile_image, address)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Valued Customer'),
    new.email,
    COALESCE(new.phone, new.raw_user_meta_data->>'phone'),
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop',
    ''
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution (will only fire if table exists in schemas)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =========================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_details ENABLE ROW LEVEL SECURITY;
-- wishlist RLS disabled

-- =========================================================================
-- RLS POLICIES
-- =========================================================================

-- 1. Users Profile Policies
CREATE POLICY "Allow public read access to profiles" ON public.users
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Allow anyone to insert user profiles" ON public.users
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Allow anyone to update profiles" ON public.users
  FOR UPDATE TO public
  USING (true)
  WITH CHECK (true);

-- 2. Categories Policies
CREATE POLICY "Allow public read access to categories" ON public.categories
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert categories" ON public.categories
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update categories" ON public.categories
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete categories" ON public.categories
  FOR DELETE TO authenticated
  USING (true);

-- 3. Products Policies
CREATE POLICY "Allow public read access to products" ON public.products
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert products" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update products" ON public.products
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete products" ON public.products
  FOR DELETE TO authenticated
  USING (true);

-- 4. Order Details Policies
DROP POLICY IF EXISTS "Allow users to read their own orders" ON public.order_details;
DROP POLICY IF EXISTS "Allow anyone to insert orders" ON public.order_details;
DROP POLICY IF EXISTS "Allow users to update their own orders" ON public.order_details;

CREATE POLICY "Allow anyone to read orders" ON public.order_details
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Allow anyone to insert orders" ON public.order_details
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Allow anyone to update orders" ON public.order_details
  FOR UPDATE TO public
  USING (true)
  WITH CHECK (true);

-- Wishlist Policies removed

