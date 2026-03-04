// ============================================
// PHARMACIE SAMY - Supabase Client
// ============================================

let supabaseClient = null;

// Initialize Supabase
function initSupabase() {
    if (typeof CONFIG === 'undefined') {
        console.error('CONFIG not loaded');
        return null;
    }
    
    if (typeof supabase === 'undefined' || !supabase.createClient) {
        console.error('Supabase library not loaded');
        return null;
    }
    
    try {
        supabaseClient = supabase.createClient(
            CONFIG.SUPABASE_URL,
            CONFIG.SUPABASE_ANON_KEY
        );
        console.log('Supabase initialized successfully');
        return supabaseClient;
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        return null;
    }
}

// Get Supabase client
function getSupabase() {
    if (!supabaseClient) {
        return initSupabase();
    }
    return supabaseClient;
}

// Check if user is authenticated
async function isAuthenticated() {
    const client = getSupabase();
    if (!client) return false;
    
    try {
        const { data: { session } } = await client.auth.getSession();
        return !!session;
    } catch (error) {
        console.error('Auth check error:', error);
        return false;
    }
}

// Get current user
async function getCurrentUser() {
    const client = getSupabase();
    if (!client) return null;
    
    try {
        const { data: { user } } = await client.auth.getUser();
        return user;
    } catch (error) {
        console.error('Get user error:', error);
        return null;
    }
}

// Check if user is admin
async function checkIsAdmin() {
    const client = getSupabase();
    if (!client) return false;
    
    const user = await getCurrentUser();
    if (!user) return false;
    
    try {
        const { data, error } = await client
            .from('admin_users')
            .select('*')
            .eq('user_id', user.id)
            .single();
        
        return !!data && !error;
    } catch (error) {
        console.error('Admin check error:', error);
        return false;
    }
}

// Sign in with Google
async function signInWithGoogle() {
    const client = getSupabase();
    if (!client) {
        return { error: { message: 'Supabase not initialized' } };
    }
    
    try {
        const { data, error } = await client.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/admin.html'
            }
        });
        
        return { data, error };
    } catch (error) {
        console.error('Google sign in error:', error);
        return { error: { message: error.message } };
    }
}

// Sign out
async function signOut() {
    const client = getSupabase();
    if (!client) return { error: { message: 'Supabase not initialized' } };
    
    try {
        const { error } = await client.auth.signOut();
        return { error };
    } catch (error) {
        console.error('Sign out error:', error);
        return { error: { message: error.message } };
    }
}

// ============================================
// Categories API
// ============================================

async function getCategories() {
    const client = getSupabase();
    if (!client) return { data: [], error: 'Supabase not initialized' };
    
    try {
        const { data, error } = await client
            .from('categories')
            .select('*')
            .eq('actif', true)
            .order('ordre', { ascending: true });
        
        return { data: data || [], error };
    } catch (error) {
        console.error('Get categories error:', error);
        return { data: [], error };
    }
}

async function getCategoryBySlug(slug) {
    const client = getSupabase();
    if (!client) return { data: null, error: 'Supabase not initialized' };
    
    try {
        const { data, error } = await client
            .from('categories')
            .select('*')
            .eq('slug', slug)
            .eq('actif', true)
            .single();
        
        return { data, error };
    } catch (error) {
        console.error('Get category error:', error);
        return { data: null, error };
    }
}

// ============================================
// Brands API
// ============================================

async function getBrands() {
    const client = getSupabase();
    if (!client) return { data: [], error: 'Supabase not initialized' };
    
    try {
        const { data, error } = await client
            .from('brands')
            .select('*')
            .eq('actif', true)
            .order('name', { ascending: true });
        
        return { data: data || [], error };
    } catch (error) {
        console.error('Get brands error:', error);
        return { data: [], error };
    }
}

async function getBrandBySlug(slug) {
    const client = getSupabase();
    if (!client) return { data: null, error: 'Supabase not initialized' };
    
    try {
        const { data, error } = await client
            .from('brands')
            .select('*')
            .eq('slug', slug)
            .eq('actif', true)
            .single();
        
        return { data, error };
    } catch (error) {
        console.error('Get brand error:', error);
        return { data: null, error };
    }
}

// ============================================
// Products API
// ============================================

async function getProducts(options = {}) {
    const client = getSupabase();
    if (!client) return { data: [], error: 'Supabase not initialized', pagination: null };
    
    const {
        categoryId = null,
        brandId = null,
        search = null,
        minPrice = null,
        maxPrice = null,
        sortBy = 'created_at',
        sortOrder = 'desc',
        page = 1,
        limit = 12
    } = options;
    
    try {
        let query = client
            .from('products')
            .select(`
                *,
                category:categories(*),
                brand:brands(*),
                images:product_images(*)
            `, { count: 'exact' })
            .eq('actif', true);
        
        if (categoryId) {
            query = query.eq('category_id', categoryId);
        }
        
        if (brandId) {
            query = query.eq('brand_id', brandId);
        }
        
        if (search) {
            query = query.or(`name_fr.ilike.%${search}%,name_en.ilike.%${search}%,name_ar.ilike.%${search}%`);
        }
        
        if (minPrice !== null) {
            query = query.gte('price', minPrice);
        }
        
        if (maxPrice !== null) {
            query = query.lte('price', maxPrice);
        }
        
        // Apply sorting
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
        
        // Apply pagination
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
        
        const { data, error, count } = await query;
        
        return { 
            data: data || [], 
            error, 
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            }
        };
    } catch (error) {
        console.error('Get products error:', error);
        return { data: [], error, pagination: null };
    }
}

async function getProductBySlug(slug) {
    const client = getSupabase();
    if (!client) return { data: null, error: 'Supabase not initialized' };
    
    try {
        const { data, error } = await client
            .from('products')
            .select(`
                *,
                category:categories(*),
                brand:brands(*),
                images:product_images(*)
            `)
            .eq('slug', slug)
            .eq('actif', true)
            .single();
        
        return { data, error };
    } catch (error) {
        console.error('Get product error:', error);
        return { data: null, error };
    }
}

// ============================================
// Storage API
// ============================================

async function uploadImage(file, folder = 'products') {
    const client = getSupabase();
    if (!client) return { data: null, error: 'Supabase not initialized' };
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;
    
    try {
        const { data, error } = await client
            .storage
            .from(CONFIG.STORAGE_BUCKET)
            .upload(filePath, file);
        
        if (error) {
            return { data: null, error };
        }
        
        // Get public URL
        const { data: { publicUrl } } = client
            .storage
            .from(CONFIG.STORAGE_BUCKET)
            .getPublicUrl(filePath);
        
        return { data: { path: filePath, url: publicUrl }, error: null };
    } catch (error) {
        console.error('Upload error:', error);
        return { data: null, error: { message: error.message } };
    }
}

// Make functions available globally
window.initSupabase = initSupabase;
window.getSupabase = getSupabase;
window.isAuthenticated = isAuthenticated;
window.getCurrentUser = getCurrentUser;
window.checkIsAdmin = checkIsAdmin;
window.signInWithGoogle = signInWithGoogle;
window.signOut = signOut;
window.getCategories = getCategories;
window.getCategoryBySlug = getCategoryBySlug;
window.getBrands = getBrands;
window.getBrandBySlug = getBrandBySlug;
window.getProducts = getProducts;
window.getProductBySlug = getProductBySlug;
window.uploadImage = uploadImage;
