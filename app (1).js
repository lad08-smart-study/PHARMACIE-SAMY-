// ============================================
// PHARMACIE SAMY - Main Application
// ============================================

// Global state
let currentLang = localStorage.getItem('lang') || 'fr';
let currentPage = 1;
let currentFilters = {
    category: '',
    brand: '',
    search: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
};

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

async function initApp() {
    // Initialize Supabase
    initSupabase();
    
    // Set initial language
    setLanguage(currentLang, false);
    
    // Setup navigation
    setupNavigation();
    
    // Setup language switcher
    setupLanguageSwitcher();
    
    // Load page-specific content
    await loadPageContent();
}

// ============================================
// Language & RTL
// ============================================

function setLanguage(lang, save = true) {
    currentLang = lang;
    
    if (save) {
        localStorage.setItem('lang', lang);
    }
    
    // Set dir attribute for RTL
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    // Update language switcher buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    
    // Update all translatable elements
    updatePageText();
    
    // Update meta tags
    updateMetaTags();
}

function updatePageText() {
    // Update elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        const text = t(key, currentLang);
        if (text && text !== key) {
            el.textContent = text;
        }
    });
    
    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.dataset.i18nPlaceholder;
        const text = t(key, currentLang);
        if (text && text !== key) {
            el.placeholder = text;
        }
    });
}

function updateMetaTags() {
    const title = t('hero_title', currentLang);
    const description = t('hero_subtitle', currentLang);
    
    document.title = `${title} - ${t('hero_subtitle', currentLang)}`;
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.content = description;
    }
}

function setupLanguageSwitcher() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.dataset.lang;
            setLanguage(lang);
            // Reload page content with new language
            loadPageContent();
        });
    });
}

// ============================================
// Navigation
// ============================================

function setupNavigation() {
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            this.setAttribute('aria-expanded', nav.classList.contains('active'));
        });
    }
    
    // Set active nav link
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// ============================================
// Page Content Loading
// ============================================

async function loadPageContent() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    
    switch(page) {
        case 'index.html':
        case '':
            await loadHomePage();
            break;
        case 'catalogue.html':
            await loadCataloguePage();
            break;
        case 'category.html':
            await loadCategoryPage();
            break;
        case 'brand.html':
            await loadBrandPage();
            break;
        case 'product.html':
            await loadProductPage();
            break;
        case 'contact.html':
            loadContactPage();
            break;
    }
}

// ============================================
// Home Page
// ============================================

async function loadHomePage() {
    await loadCategoriesSection();
    await loadFeaturedProducts();
}

async function loadCategoriesSection() {
    const container = document.getElementById('categories-grid');
    if (!container) return;
    
    container.innerHTML = '<div class="spinner" style="margin: 2rem auto;"></div>';
    
    const { data: categories, error } = await getCategories();
    
    if (error) {
        container.innerHTML = `<p class="text-center">${t('msg_error', currentLang)}</p>`;
        return;
    }
    
    if (!categories || categories.length === 0) {
        container.innerHTML = `<p class="text-center">${t('msg_no_products', currentLang)}</p>`;
        return;
    }
    
    container.innerHTML = categories.map(cat => {
        const name = cat[`name_${currentLang}`] || cat.name_fr;
        const imageUrl = cat.image_url || `https://placehold.co/400x250/0d7377/ffffff?text=${encodeURIComponent(name)}`;
        
        return `
            <a href="category.html?slug=${cat.slug}" class="card category-card">
                <div class="card-image">
                    <img src="${imageUrl}" alt="${name}" loading="lazy">
                </div>
                <div class="card-content">
                    <h3 class="card-title">${name}</h3>
                </div>
            </a>
        `;
    }).join('');
}

async function loadFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;
    
    container.innerHTML = '<div class="spinner" style="margin: 2rem auto;"></div>';
    
    const { data: products, error } = await getProducts({ limit: 8 });
    
    if (error) {
        container.innerHTML = `<p class="text-center">${t('msg_error', currentLang)}</p>`;
        return;
    }
    
    if (!products || products.length === 0) {
        container.innerHTML = `<p class="text-center">${t('msg_no_products', currentLang)}</p>`;
        return;
    }
    
    container.innerHTML = products.map(product => renderProductCard(product)).join('');
}

// ============================================
// Catalogue Page
// ============================================

async function loadCataloguePage() {
    // Setup filters
    setupCatalogueFilters();
    
    // Load filter options
    await loadFilterOptions();
    
    // Load products
    await loadCatalogueProducts();
}

async function loadFilterOptions() {
    // Load categories
    const { data: categories } = await getCategories();
    const categorySelect = document.getElementById('filter-category');
    if (categorySelect && categories) {
        const currentValue = categorySelect.value;
        categorySelect.innerHTML = `
            <option value="">${t('filter_all', currentLang)}</option>
            ${categories.map(c => {
                const name = c[`name_${currentLang}`] || c.name_fr;
                return `<option value="${c.id}" ${c.id === currentValue ? 'selected' : ''}>${name}</option>`;
            }).join('')}
        `;
    }
    
    // Load brands
    const { data: brands } = await getBrands();
    const brandSelect = document.getElementById('filter-brand');
    if (brandSelect && brands) {
        const currentValue = brandSelect.value;
        brandSelect.innerHTML = `
            <option value="">${t('filter_all', currentLang)}</option>
            ${brands.map(b => `<option value="${b.id}" ${b.id === currentValue ? 'selected' : ''}>${b.name}</option>`).join('')}
        `;
    }
}

function setupCatalogueFilters() {
    // Search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            currentFilters.search = this.value;
            currentPage = 1;
            loadCatalogueProducts();
        }, 300));
    }
    
    // Category filter
    const categorySelect = document.getElementById('filter-category');
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            currentFilters.category = this.value;
            currentPage = 1;
            loadCatalogueProducts();
        });
    }
    
    // Brand filter
    const brandSelect = document.getElementById('filter-brand');
    if (brandSelect) {
        brandSelect.addEventListener('change', function() {
            currentFilters.brand = this.value;
            currentPage = 1;
            loadCatalogueProducts();
        });
    }
    
    // Sort
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const [sortBy, sortOrder] = this.value.split(':');
            currentFilters.sortBy = sortBy;
            currentFilters.sortOrder = sortOrder;
            loadCatalogueProducts();
        });
    }
    
    // Price filters
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    
    if (minPriceInput) {
        minPriceInput.addEventListener('change', function() {
            currentFilters.minPrice = this.value;
            currentPage = 1;
            loadCatalogueProducts();
        });
    }
    
    if (maxPriceInput) {
        maxPriceInput.addEventListener('change', function() {
            currentFilters.maxPrice = this.value;
            currentPage = 1;
            loadCatalogueProducts();
        });
    }
}

async function loadCatalogueProducts() {
    const container = document.getElementById('products-grid');
    const paginationContainer = document.getElementById('pagination');
    
    if (!container) return;
    
    container.innerHTML = '<div class="spinner" style="margin: 2rem auto;"></div>';
    
    const options = {
        page: currentPage,
        limit: CONFIG.ITEMS_PER_PAGE,
        sortBy: currentFilters.sortBy,
        sortOrder: currentFilters.sortOrder
    };
    
    if (currentFilters.category) options.categoryId = currentFilters.category;
    if (currentFilters.brand) options.brandId = currentFilters.brand;
    if (currentFilters.search) options.search = currentFilters.search;
    if (currentFilters.minPrice) options.minPrice = parseFloat(currentFilters.minPrice);
    if (currentFilters.maxPrice) options.maxPrice = parseFloat(currentFilters.maxPrice);
    
    const { data: products, error, pagination } = await getProducts(options);
    
    if (error) {
        container.innerHTML = `<p class="text-center">${t('msg_error', currentLang)}</p>`;
        return;
    }
    
    if (!products || products.length === 0) {
        container.innerHTML = `<p class="text-center">${t('msg_no_products', currentLang)}</p>`;
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }
    
    container.innerHTML = products.map(product => renderProductCard(product)).join('');
    
    // Render pagination
    if (paginationContainer && pagination && pagination.totalPages > 1) {
        renderPagination(paginationContainer, pagination);
    } else if (paginationContainer) {
        paginationContainer.innerHTML = '';
    }
}

function renderPagination(container, pagination) {
    const { page, totalPages } = pagination;
    
    let html = `
        <button class="pagination-btn" ${page === 1 ? 'disabled' : ''} onclick="changePage(${page - 1})">
            ${t('pagination_prev', currentLang)}
        </button>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
            html += `
                <button class="pagination-btn ${i === page ? 'active' : ''}" onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        } else if (i === page - 2 || i === page + 2) {
            html += `<span>...</span>`;
        }
    }
    
    html += `
        <button class="pagination-btn" ${page === totalPages ? 'disabled' : ''} onclick="changePage(${page + 1})">
            ${t('pagination_next', currentLang)}
        </button>
    `;
    
    html += `<span class="pagination-info">${t('pagination_page', currentLang)} ${page} ${t('pagination_of', currentLang)} ${totalPages}</span>`;
    
    container.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    loadCatalogueProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// Category Page
// ============================================

async function loadCategoryPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    
    if (!slug) {
        window.location.href = 'catalogue.html';
        return;
    }
    
    const { data: category, error } = await getCategoryBySlug(slug);
    
    if (error || !category) {
        document.getElementById('category-title').textContent = t('msg_error', currentLang);
        return;
    }
    
    const categoryName = category[`name_${currentLang}`] || category.name_fr;
    
    // Update page title
    document.getElementById('category-title').textContent = categoryName;
    
    // Update breadcrumb
    const breadcrumbCurrent = document.getElementById('breadcrumb-current');
    if (breadcrumbCurrent) {
        breadcrumbCurrent.textContent = categoryName;
    }
    
    // Load products in this category
    const container = document.getElementById('products-grid');
    if (container) {
        container.innerHTML = '<div class="spinner" style="margin: 2rem auto;"></div>';
        
        const { data: products, error: prodError } = await getProducts({ 
            categoryId: category.id,
            limit: 100
        });
        
        if (prodError || !products || products.length === 0) {
            container.innerHTML = `<p class="text-center">${t('msg_no_products', currentLang)}</p>`;
        } else {
            container.innerHTML = products.map(product => renderProductCard(product)).join('');
        }
    }
    
    // Load brands in this category
    await loadCategoryBrands(category.id);
}

async function loadCategoryBrands(categoryId) {
    const container = document.getElementById('brands-grid');
    if (!container) return;
    
    const { data: products } = await getProducts({ categoryId, limit: 100 });
    
    if (!products || products.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    // Extract unique brands
    const brandsMap = new Map();
    products.forEach(p => {
        if (p.brand && !brandsMap.has(p.brand.id)) {
            brandsMap.set(p.brand.id, p.brand);
        }
    });
    const brands = Array.from(brandsMap.values());
    
    if (brands.length === 0) {
        container.innerHTML = '<p class="text-center">Aucune marque dans cette catégorie</p>';
        return;
    }
    
    container.innerHTML = brands.map(brand => `
        <a href="brand.html?slug=${brand.slug}" class="card">
            <div class="card-content text-center">
                <h4 class="card-title">${brand.name}</h4>
            </div>
        </a>
    `).join('');
}

// ============================================
// Brand Page
// ============================================

async function loadBrandPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    
    if (!slug) {
        window.location.href = 'catalogue.html';
        return;
    }
    
    const { data: brand, error } = await getBrandBySlug(slug);
    
    if (error || !brand) {
        document.getElementById('brand-title').textContent = t('msg_error', currentLang);
        return;
    }
    
    // Update page title
    document.getElementById('brand-title').textContent = brand.name;
    
    // Update breadcrumb
    const breadcrumbCurrent = document.getElementById('breadcrumb-current');
    if (breadcrumbCurrent) {
        breadcrumbCurrent.textContent = brand.name;
    }
    
    // Load products for this brand
    const container = document.getElementById('products-grid');
    if (container) {
        container.innerHTML = '<div class="spinner" style="margin: 2rem auto;"></div>';
        
        const { data: products, error: prodError } = await getProducts({ 
            brandId: brand.id,
            limit: 100
        });
        
        if (prodError || !products || products.length === 0) {
            container.innerHTML = `<p class="text-center">${t('msg_no_products', currentLang)}</p>`;
        } else {
            container.innerHTML = products.map(product => renderProductCard(product)).join('');
        }
    }
}

// ============================================
// Product Page
// ============================================

async function loadProductPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    
    if (!slug) {
        window.location.href = 'catalogue.html';
        return;
    }
    
    const { data: product, error } = await getProductBySlug(slug);
    
    if (error || !product) {
        document.getElementById('product-detail').innerHTML = `<p class="text-center">${t('msg_error', currentLang)}</p>`;
        return;
    }
    
    const name = product[`name_${currentLang}`] || product.name_fr;
    const description = product[`description_${currentLang}`] || product.description_fr || '';
    
    // Update page title
    document.title = `${name} | ${CONFIG.SITE_NAME}`;
    
    // Update breadcrumb
    const breadcrumbCategory = document.getElementById('breadcrumb-category');
    const breadcrumbCurrent = document.getElementById('breadcrumb-current');
    const categorySeparator = document.getElementById('category-separator');
    
    if (breadcrumbCategory && product.category) {
        const catName = product.category[`name_${currentLang}`] || product.category.name_fr;
        breadcrumbCategory.textContent = catName;
        breadcrumbCategory.href = `category.html?slug=${product.category.slug}`;
        breadcrumbCategory.style.display = 'inline';
        if (categorySeparator) categorySeparator.style.display = 'inline';
    }
    
    if (breadcrumbCurrent) {
        breadcrumbCurrent.textContent = name;
    }
    
    // Render product detail
    renderProductDetail(product);
}

function renderProductDetail(product) {
    const container = document.getElementById('product-detail');
    if (!container) return;
    
    const name = product[`name_${currentLang}`] || product.name_fr;
    const description = product[`description_${currentLang}`] || product.description_fr || '';
    const categoryName = product.category ? (product.category[`name_${currentLang}`] || product.category.name_fr) : '';
    const brandName = product.brand ? product.brand.name : '';
    
    // Get images
    let images = [];
    if (product.images && product.images.length > 0) {
        images = product.images.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    } else {
        images = [{ image_url: `https://placehold.co/600x600/0d7377/ffffff?text=${encodeURIComponent(name)}` }];
    }
    
    // WhatsApp message
    const whatsappMessage = t('whatsapp_inquiry', currentLang, {
        name: name,
        price: product.price,
        url: window.location.href
    });
    const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;
    
    container.innerHTML = `
        <div class="product-gallery">
            <div class="product-gallery-main">
                <img id="main-image" src="${images[0].image_url}" alt="${name}">
            </div>
            ${images.length > 1 ? `
                <div class="product-gallery-thumbs">
                    ${images.map((img, idx) => `
                        <div class="product-gallery-thumb ${idx === 0 ? 'active' : ''}" onclick="changeMainImage('${img.image_url}', this)">
                            <img src="${img.image_url}" alt="${name} - ${idx + 1}">
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
        
        <div class="product-info">
            <h1>${name}</h1>
            <div class="price">${product.price} ${CONFIG.CURRENCY}</div>
            
            ${description ? `<div class="description">${description}</div>` : ''}
            
            <div class="product-meta">
                ${categoryName ? `
                    <div class="product-meta-item">
                        <span class="product-meta-label">${t('filter_category', currentLang)}:</span>
                        <span>${categoryName}</span>
                    </div>
                ` : ''}
                ${brandName ? `
                    <div class="product-meta-item">
                        <span class="product-meta-label">${t('filter_brand', currentLang)}:</span>
                        <span>${brandName}</span>
                    </div>
                ` : ''}
            </div>
            
            <a href="${whatsappUrl}" target="_blank" rel="noopener" class="btn btn-whatsapp btn-lg btn-block">
                <i class="fab fa-whatsapp"></i>
                ${t('product_inquiry', currentLang)}
            </a>
        </div>
    `;
}

function changeMainImage(src, thumb) {
    const mainImage = document.getElementById('main-image');
    if (mainImage) {
        mainImage.src = src;
    }
    
    document.querySelectorAll('.product-gallery-thumb').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
}

// ============================================
// Contact Page
// ============================================

function loadContactPage() {
    // Update map iframe with correct pharmacy location
    const mapIframe = document.querySelector('.contact-map iframe');
    if (mapIframe && typeof CONFIG !== 'undefined') {
        mapIframe.src = CONFIG.MAPS_EMBED_URL;
    }
}

// ============================================
// Product Card Component
// ============================================

function renderProductCard(product) {
    const name = product[`name_${currentLang}`] || product.name_fr;
    let imageUrl = 'https://placehold.co/400x300/0d7377/ffffff?text=No+Image';
    
    if (product.images && product.images.length > 0) {
        const sortedImages = product.images.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        imageUrl = sortedImages[0].image_url;
    }
    
    return `
        <a href="product.html?slug=${product.slug}" class="card product-card">
            <div class="card-image">
                <img src="${imageUrl}" alt="${name}" loading="lazy">
                <span class="product-price">${product.price} ${CONFIG.CURRENCY}</span>
            </div>
            <div class="card-content">
                <h3 class="card-title">${name}</h3>
                ${product.brand ? `<p class="card-text" style="color: var(--text-secondary); font-size: 0.875rem;">${product.brand.name}</p>` : ''}
            </div>
        </a>
    `;
}

// ============================================
// Utilities
// ============================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function generateSlug(str) {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// Make functions available globally
window.setLanguage = setLanguage;
window.changePage = changePage;
window.changeMainImage = changeMainImage;
window.generateSlug = generateSlug;
