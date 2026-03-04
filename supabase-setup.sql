-- ============================================
-- PHARMACIE SAMY - Supabase Database Setup
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: categories
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    ordre INTEGER DEFAULT 0,
    actif BOOLEAN DEFAULT true,
    name_fr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_actif ON categories(actif);
CREATE INDEX IF NOT EXISTS idx_categories_ordre ON categories(ordre);

-- ============================================
-- TABLE: brands
-- ============================================
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    actif BOOLEAN DEFAULT true,
    name TEXT NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);
CREATE INDEX IF NOT EXISTS idx_brands_actif ON brands(actif);

-- ============================================
-- TABLE: products
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    actif BOOLEAN DEFAULT true,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    name_fr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description_fr TEXT,
    description_en TEXT,
    description_ar TEXT,
    price NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'DZD',
    stock_status TEXT DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_actif ON products(actif);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- ============================================
-- TABLE: product_images
-- ============================================
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_order ON product_images(sort_order);

-- ============================================
-- TABLE: admin_users
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: categories
-- ============================================

-- SELECT: Public can read active categories only
DROP POLICY IF EXISTS "Public can view active categories" ON categories;
CREATE POLICY "Public can view active categories"
    ON categories FOR SELECT
    USING (actif = true);

-- INSERT: Only admins
DROP POLICY IF EXISTS "Only admins can insert categories" ON categories;
CREATE POLICY "Only admins can insert categories"
    ON categories FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- UPDATE: Only admins
DROP POLICY IF EXISTS "Only admins can update categories" ON categories;
CREATE POLICY "Only admins can update categories"
    ON categories FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- DELETE: Only admins
DROP POLICY IF EXISTS "Only admins can delete categories" ON categories;
CREATE POLICY "Only admins can delete categories"
    ON categories FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- ============================================
-- RLS POLICIES: brands
-- ============================================

-- SELECT: Public can read active brands only
DROP POLICY IF EXISTS "Public can view active brands" ON brands;
CREATE POLICY "Public can view active brands"
    ON brands FOR SELECT
    USING (actif = true);

-- INSERT: Only admins
DROP POLICY IF EXISTS "Only admins can insert brands" ON brands;
CREATE POLICY "Only admins can insert brands"
    ON brands FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- UPDATE: Only admins
DROP POLICY IF EXISTS "Only admins can update brands" ON brands;
CREATE POLICY "Only admins can update brands"
    ON brands FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- DELETE: Only admins
DROP POLICY IF EXISTS "Only admins can delete brands" ON brands;
CREATE POLICY "Only admins can delete brands"
    ON brands FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- ============================================
-- RLS POLICIES: products
-- ============================================

-- SELECT: Public can read active products only
DROP POLICY IF EXISTS "Public can view active products" ON products;
CREATE POLICY "Public can view active products"
    ON products FOR SELECT
    USING (actif = true);

-- INSERT: Only admins
DROP POLICY IF EXISTS "Only admins can insert products" ON products;
CREATE POLICY "Only admins can insert products"
    ON products FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- UPDATE: Only admins
DROP POLICY IF EXISTS "Only admins can update products" ON products;
CREATE POLICY "Only admins can update products"
    ON products FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- DELETE: Only admins
DROP POLICY IF EXISTS "Only admins can delete products" ON products;
CREATE POLICY "Only admins can delete products"
    ON products FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- ============================================
-- RLS POLICIES: product_images
-- ============================================

-- SELECT: Public can read all product images (for active products)
DROP POLICY IF EXISTS "Public can view product images" ON product_images;
CREATE POLICY "Public can view product images"
    ON product_images FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = product_images.product_id 
            AND products.actif = true
        )
    );

-- INSERT: Only admins
DROP POLICY IF EXISTS "Only admins can insert product images" ON product_images;
CREATE POLICY "Only admins can insert product images"
    ON product_images FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- UPDATE: Only admins
DROP POLICY IF EXISTS "Only admins can update product images" ON product_images;
CREATE POLICY "Only admins can update product images"
    ON product_images FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- DELETE: Only admins
DROP POLICY IF EXISTS "Only admins can delete product images" ON product_images;
CREATE POLICY "Only admins can delete product images"
    ON product_images FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- ============================================
-- RLS POLICIES: admin_users
-- ============================================

-- Only admins can see admin_users table
DROP POLICY IF EXISTS "Only admins can view admin users" ON admin_users;
CREATE POLICY "Only admins can view admin users"
    ON admin_users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_users AS au
            WHERE au.user_id = auth.uid()
        )
    );

-- ============================================
-- STORAGE: product-images bucket
-- ============================================

-- Create bucket (run this in Supabase Dashboard > Storage > New bucket)
-- Bucket name: product-images
-- Public: true

-- Storage policies (run after creating bucket)
-- Allow public read
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'product-images');

-- Allow admins to upload
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'product-images'
        AND EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- Allow admins to update
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'product-images'
        AND EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- Allow admins to delete
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'product-images'
        AND EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample categories
INSERT INTO categories (slug, ordre, name_fr, name_en, name_ar) VALUES
('dermocosmetique', 1, 'Dermocosmétique', 'Dermocosmetics', 'العناية بالبشرة'),
('complements-alimentaires', 2, 'Compléments alimentaires', 'Food Supplements', 'المكملات الغذائية'),
('maman-bebe', 3, 'Maman & Bébé', 'Mom & Baby', 'الأم والطفل'),
('hygiene-bucco-dentaire', 4, 'Hygiène bucco-dentaire', 'Oral Hygiene', 'نظافة الفم والأسنان')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- HOW TO ADD FIRST ADMIN
-- ============================================
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Create a user (via Google OAuth or email)
-- 3. Copy the user's UUID
-- 4. Run this SQL (replace with actual UUID and email):
--
-- INSERT INTO admin_users (user_id, email, role)
-- VALUES ('USER_UUID_HERE', 'admin@example.com', 'admin');
--
-- ============================================
