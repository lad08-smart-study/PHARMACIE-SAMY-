// ============================================
// PHARMACIE SAMY - Configuration
// ============================================

const CONFIG = {
    // Supabase Configuration - REPLACE THESE VALUES
    SUPABASE_URL: 'https://your-project.supabase.co',
    SUPABASE_ANON_KEY: 'your-anon-key-here',
    
    // Site Info
    SITE_NAME: 'PHARMACIE SAMY',
    SITE_URL: 'https://pharmacie-samy.vercel.app',
    
    // Contact Links
    WHATSAPP_NUMBER: '213770762987',
    WHATSAPP_URL: 'https://wa.me/213770762987',
    INSTAGRAM_URL: 'https://www.instagram.com/pharmaciesamy/',
    TIKTOK_URL: 'https://www.tiktok.com/@pharmacie.samy',
    
    // Google Maps - Pharmacie AMAROUAYACHE Samy Les sources
    MAPS_EMBED_URL: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3198.1234567890123!2d2.9351234567890123!3d36.75312345678901!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128faff123456789%3A0xcdf511b151908618!2sPharmacie%20AMAROUAYACHE%20Samy%20Les%20sources!5e0!3m2!1sfr!2sdz!4v1234567890123!5m2!1sfr!2sdz',
    MAPS_DIRECTIONS_URL: 'https://www.google.com/maps/dir//Pharmacie+AMAROUAYACHE+Samy+Les+sources,+Cit%C3%A9+400+logements,+Bir+Mourad+Rais',
    
    // Business Hours
    HOURS: '7/7 — 08:00 à 00:00',
    
    // Currency
    CURRENCY: 'DZD',
    
    // Pagination
    ITEMS_PER_PAGE: 12,
    
    // Storage Bucket
    STORAGE_BUCKET: 'product-images',
    
    // Default Language
    DEFAULT_LANG: 'fr',
    
    // Supported Languages
    LANGUAGES: ['fr', 'en', 'ar']
};

// Make available globally
window.CONFIG = CONFIG;
