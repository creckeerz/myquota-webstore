// =================== KONFIGURASI API - UPDATED ===================
// URL sudah di-update dengan URL Google Apps Script Anda
const API_CONFIG = {
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyZrXoIqE27I-893nCt5FrxfWHmCy6M7B56vPT-hgp_HShUhLPMZFDDP1HSlkvcoSg7Kg/exec',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3
};

// Test koneksi
console.log('🔧 API Configuration:', {
    url: API_CONFIG.APPS_SCRIPT_URL,
    configured: true,
    timestamp: new Date()
});

// =================== API CLIENT CLASS ===================
class MyQuotaAPI {
// =================== KONFIGURASI API - UPDATED ===================
// URL sudah di-update dengan URL Google Apps Script Anda
const API_CONFIG = {
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyZrXoIqE27I-893nCt5FrxfWHmCy6M7B56vPT-hgp_HShUhLPMZFDDP1HSlkvcoSg7Kg/exec',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3
};

// Test koneksi
console.log('🔧 API Configuration:', {
    url: API_CONFIG.APPS_SCRIPT_URL,
    configured: true,
    timestamp: new Date()
});

// =================== API CLIENT CLASS ===================
class MyQuotaAPI {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.isConfigured = true; // Always true now since URL is configured
    }
    
    async callAPI(action, data = null, id = null) {
        try {
            const url = new URL(this.baseUrl);
            url.searchParams.append('action', action);
            
            if (data) {
                url.searchParams.append('data', JSON.stringify(data));
            }
            
            if (id) {
                url.searchParams.append('id', id);
            }
            
            console.log('🔄 API Call:', action, data ? 'with data' : 'no data');
            
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'API call failed');
            }
            
            console.log('✅ API Success:', action, result.data ? `${result.data.length || 'data'} received` : 'success');
            return result;
            
        } catch (error) {
            console.error('❌ API Error:', action, error.message);
            throw error;
        }
    }
    
    // Categories API
    async getCategories() {
        return this.callAPI('getCategories');
    }
    
    // Packages API
    async getPackages() {
        return this.callAPI('getPackages');
    }
    
    // Transactions API
    async addTransaction(transactionData) {
        return this.callAPI('addTransaction', transactionData);
    }
    
    // Settings API
    async getSettings() {
        return this.callAPI('getSettings');
    }
    
    // Health check
    async healthCheck() {
        return this.callAPI('healthCheck');
    }
}

// =================== GLOBAL API INSTANCE ===================
const API = new MyQuotaAPI(API_CONFIG.APPS_SCRIPT_URL);

// =================== MAIN APPLICATION ===================
// Global variables
let categories = [];
let packages = [];
let settings = {};
let selectedCategory = null;
let selectedPackage = null;
let selectedPayment = null;
let currentSort = 'price';
let sortOrder = 'asc';
let searchQuery = '';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize application
async function initializeApp() {
    try {
        showLoading(true);
        
        // Load real data from Apps Script
        await loadDataFromAPI();
        showToast('✅ Data berhasil dimuat dari server!', 'success');
        
        setupEventListeners();
        renderCategories();
        renderPackages();
        showLoading(false);
        
        // Start auto refresh
        startAutoRefresh();
        
        console.log('✅ App initialized successfully');
        
    } catch (error) {
        console.error('❌ Error loading from API, using demo data:', error);
        showToast('⚠️ Gagal terhubung ke server. Menggunakan data demo.', 'warning');
        
        await loadDemoData();
        setupEventListeners();
        renderCategories();
        renderPackages();
        showLoading(false);
    }
}

// Load data from Google Apps Script
async function loadDataFromAPI() {
    try {
        console.log('🔄 Loading data from API...');
        
        // Test API connection first
        const healthCheck = await API.healthCheck();
        console.log('✅ API Health Check:', healthCheck.message);
        
        // Load categories, packages, and settings
        const [categoriesResult, packagesResult, settingsResult] = await Promise.all([
            API.getCategories(),
            API.getPackages(),
            API.getSettings()
        ]);
        
        categories = categoriesResult.data || [];
        packages = packagesResult.data || [];
        settings = settingsResult.data || {};
        
        console.log('✅ Data loaded from API:', { 
            categories: categories.length, 
            packages: packages.length,
            settings: Object.keys(settings).length
        });
        
        // Update payment settings if available
        if (settings.qris_image_url) {
            updateQRISImage(settings.qris_image_url);
        }
        
    } catch (error) {
        console.error('❌ Error loading data from API:', error);
        throw error;
    }
}

// Load demo data (fallback)
async function loadDemoData() {
    console.log('📋 Loading demo data...');
    
    categories = [
        {
            id: 1,
            name: 'Official XL / AXIS',
            slug: 'official-xl-axis',
            description: 'Paket resmi XL dan AXIS dengan kualitas terjamin',
            icon: 'fas fa-star',
            status: 'active'
        },
        {
            id: 2,
            name: 'XL Circle',
            slug: 'xl-circle',
            description: 'Paket premium XL Circle untuk pengguna VIP',
            icon: 'fas fa-users',
            status: 'active'
        },
        {
            id: 3,
            name: 'Paket Harian',
            slug: 'paket-harian',
            description: 'Paket internet harian untuk kebutuhan sehari-hari',
            icon: 'fas fa-calendar-day',
            status: 'active'
        },
        {
            id: 4,
            name: 'Perpanjangan Masa Aktif',
            slug: 'perpanjangan-masa-aktif',
            description: 'Perpanjangan masa aktif kartu tanpa kuota internet',
            icon: 'fas fa-clock',
            status: 'active'
        }
    ];
    
    packages = [
        {
            id: 1,
            category_id: 1,
            name: 'XL Combo 10GB',
            quota: '10GB',
            price: 50000,
            validity: '30 hari',
            description: 'Paket internet 10GB dengan bonus telpon dan SMS unlimited ke sesama XL',
            is_popular: true,
            status: 'active'
        },
        {
            id: 2,
            category_id: 1,
            name: 'AXIS Bronet 5GB',
            quota: '5GB',
            price: 25000,
            validity: '30 hari',
            description: 'Paket internet 5GB untuk kebutuhan browsing dan media sosial',
            is_popular: false,
            status: 'active'
        },
        {
            id: 3,
            category_id: 2,
            name: 'XL Circle 15GB',
            quota: '15GB',
            price: 75000,
            validity: '30 hari',
            description: 'Paket premium XL Circle dengan kuota besar dan kecepatan tinggi',
            is_popular: true,
            status: 'active'
        },
        {
            id: 4,
            category_id: 3,
            name: 'Paket Harian 1GB',
            quota: '1GB',
            price: 5000,
            validity: '1 hari',
            description: 'Paket internet harian 1GB untuk kebutuhan sehari-hari',
            is_popular: false,
            status: 'active'
        },
        {
            id: 5,
            category_id: 4,
            name: 'Perpanjangan 30 Hari',
            quota: 'Masa Aktif',
            price: 10000,
            validity: '30 hari',
            description: 'Perpanjangan masa aktif kartu tanpa kuota internet',
            is_popular: false,
            status: 'active'
        }
    ];
    
    settings = {
        qris_image_url: 'https://via.placeholder.com/200x200/000000/FFFFFF?text=QRIS+DEMO',
        dana_link: 'https://link.dana.id/qr/demo',
        admin_whatsapp: '6281234567890'
    };
    
    console.log('📋 Demo data loaded');
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            searchQuery = this.value.toLowerCase();
            renderPackages();
        }, 300));
    }

    // Phone number input formatting
    const phoneInput = document.getElementById('phoneNumber');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 13) value = value.substring(0, 13);
            this.value = value;
        });
    }

    // Modal close on outside click
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal();
            closeDetailModal();
        }
    });

    // Navigation items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Render categories
function renderCategories() {
    const categoryGrid = document.getElementById('categoryGrid');
    if (!categoryGrid) return;
    
    categoryGrid.innerHTML = '';
    
    categories.forEach((category, index) => {
        if (category.status === 'active') {
            const categoryCard = document.createElement('div');
            categoryCard.className = `category-card ${selectedCategory === category.id ? 'active' : ''}`;
            categoryCard.onclick = () => selectCategory(category.id);
            categoryCard.style.animationDelay = `${index * 0.1}s`;
            
            categoryCard.innerHTML = `
                <div class="category-icon">
                    <i class="${category.icon}"></i>
                </div>
                <div class="category-name">${category.name}</div>
            `;
            
            categoryGrid.appendChild(categoryCard);
        }
    });
}

// Render packages
function renderPackages() {
    const packageList = document.getElementById('packageList');
    if (!packageList) return;
    
    packageList.innerHTML = '';
    
    let filteredPackages = getFilteredPackages();
    
    if (filteredPackages.length === 0) {
        packageList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>Paket tidak ditemukan</h3>
                <p>Coba ubah kata kunci pencarian atau pilih kategori lain</p>
            </div>
        `;
        return;
    }
    
    filteredPackages.forEach((pkg, index) => {
        const packageCard = document.createElement('div');
        packageCard.className = `package-card ${pkg.is_popular ? 'popular' : ''}`;
        packageCard.style.animationDelay = `${index * 0.1}s`;
        
        packageCard.innerHTML = `
            <div class="package-header">
                <div class="package-info">
                    <h3>${pkg.name}</h3>
                    <div class="package-quota">${pkg.quota}</div>
                    <div class="package-validity">Berlaku ${pkg.validity}</div>
                </div>
                <div class="package-price">
                    <div class="price-amount">Rp ${Number(pkg.price).toLocaleString('id-ID')}</div>
                </div>
            </div>
            <div class="package-description">${pkg.description}</div>
            <div class="package-actions">
                <button class="btn btn-secondary" onclick="viewPackageDetails(${pkg.id})">Detail</button>
                <button class="btn btn-primary" onclick="buyPackage(${pkg.id})">Beli</button>
            </div>
        `;
        
        packageList.appendChild(packageCard);
    });
}

// Get filtered packages based on category and search
function getFilteredPackages() {
    let filteredPackages = packages.filter(pkg => pkg.status === 'active');
    
    // Filter by category
    if (selectedCategory) {
        filteredPackages = filteredPackages.filter(pkg => pkg.category_id == selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
        filteredPackages = filteredPackages.filter(pkg => 
            pkg.name.toLowerCase().includes(searchQuery) ||
            pkg.description.toLowerCase().includes(searchQuery) ||
            pkg.quota.toLowerCase().includes(searchQuery)
        );
    }
    
    // Sort packages
    filteredPackages.sort((a, b) => {
        if (currentSort === 'price') {
            return sortOrder === 'asc' ? Number(a.price) - Number(b.price) : Number(b.price) - Number(a.price);
        } else if (currentSort === 'name') {
            return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        } else if (currentSort === 'popular') {
            return sortOrder === 'asc' ? (a.is_popular ? -1 : 1) : (a.is_popular ? 1 : -1);
        }
        return 0;
    });
    
    return filteredPackages;
}

// Select category
function selectCategory(categoryId) {
    selectedCategory = selectedCategory === categoryId ? null : categoryId;
    renderCategories();
    renderPackages();
    
    // Scroll to packages section
    document.querySelector('.packages').scrollIntoView({ behavior: 'smooth' });
}

// View package details
function viewPackageDetails(packageId) {
    const pkg = packages.find(p => p.id == packageId);
    if (!pkg) return;
    
    const category = categories.find(c => c.id == pkg.category_id);
    
    const detailContent = document.getElementById('packageDetailContent');
    detailContent.innerHTML = `
        <div class="package-detail">
            <h3>${pkg.name}</h3>
            <div class="detail-row">
                <span class="label">Kategori:</span>
                <span class="value">${category ? category.name : 'Unknown'}</span>
            </div>
            <div class="detail-row">
                <span class="label">Kuota:</span>
                <span class="value">${pkg.quota}</span>
            </div>
            <div class="detail-row">
                <span class="label">Masa Berlaku:</span>
                <span class="value">${pkg.validity}</span>
            </div>
            <div class="detail-row">
                <span class="label">Harga:</span>
                <span class="value price">Rp ${Number(pkg.price).toLocaleString('id-ID')}</span>
            </div>
            <div class="detail-description">
                <h4>Deskripsi:</h4>
                <p>${pkg.description}</p>
            </div>
            ${pkg.is_popular ? '<div class="popular-badge">Paket Populer</div>' : ''}
        </div>
        <button class="btn btn-primary" onclick="buyPackage(${pkg.id}); closeDetailModal();" style="width: 100%; margin-top: 20px;">
            Beli Paket Ini
        </button>
    `;
    
    document.getElementById('detailModal').classList.add('active');
}

// Buy package
function buyPackage(packageId) {
    selectedPackage = packages.find(p => p.id == packageId);
    if (!selectedPackage) return;
    
    const selectedPackageInfo = document.getElementById('selectedPackageInfo');
    selectedPackageInfo.innerHTML = `
        <h4>${selectedPackage.name}</h4>
        <p>Kuota: ${selectedPackage.quota}</p>
        <p>Masa Berlaku: ${selectedPackage.validity}</p>
        <div class="price">Rp ${Number(selectedPackage.price).toLocaleString('id-ID')}</div>
    `;
    
    // Reset form
    document.getElementById('phoneNumber').value = '';
    selectedPayment = null;
    document.querySelectorAll('.payment-method').forEach(method => {
        method.classList.remove('active');
    });
    document.getElementById('qrisImage').classList.remove('active');
    
    document.getElementById('purchaseModal').classList.add('active');
}

// Select payment method
function selectPayment(method) {
    selectedPayment = method;
    
    // Update UI
    document.querySelectorAll('.payment-method').forEach(paymentMethod => {
        paymentMethod.classList.remove('active');
    });
    
    event.currentTarget.classList.add('active');
    
    if (method === 'qris') {
        document.getElementById('qrisImage').classList.add('active');
    } else {
        document.getElementById('qrisImage').classList.remove('active');
    }
}

// Process purchase
async function processPurchase() {
    const phoneNumber = document.getElementById('phoneNumber').value;
    
    // Validation
    if (!phoneNumber) {
        showToast('Masukkan nomor telepon', 'error');
        return;
    }
    
    if (phoneNumber.length < 10) {
        showToast('Nomor telepon tidak valid', 'error');
        return;
    }
    
    if (!selectedPayment) {
        showToast('Pilih metode pembayaran', 'error');
        return;
    }
    
    if (!selectedPackage) {
        showToast('Paket tidak dipilih', 'error');
        return;
    }
    
    try {
        // Show loading
        const buyButton = document.querySelector('#purchaseModal .btn-primary');
        const originalText = buyButton.textContent;
        buyButton.textContent = 'Memproses...';
        buyButton.disabled = true;
        
        // Create transaction object
        const transactionData = {
            package_id: selectedPackage.id,
            phone_number: phoneNumber,
            amount: selectedPackage.price,
            status: 'pending',
            payment_method: selectedPayment
        };
        
        // Save to backend
        const transactionResult = await API.addTransaction(transactionData);
        console.log('✅ Transaction saved to backend:', transactionResult);
        showToast('✅ Transaksi berhasil disimpan ke database!', 'success');
        
        // Handle payment method
        if (selectedPayment === 'qris') {
            showToast('📱 Scan QR Code untuk melanjutkan pembayaran', 'warning');
        } else if (selectedPayment === 'dana') {
            // Redirect to DANA
            const danaUrl = settings.dana_link || `https://link.dana.id/qr/demo?amount=${selectedPackage.price}&phone=${phoneNumber}&package=${encodeURIComponent(selectedPackage.name)}`;
            window.open(danaUrl, '_blank');
            showToast('🔗 Dialihkan ke DANA...', 'success');
        }
        
        // Reset button
        buyButton.textContent = originalText;
        buyButton.disabled = false;
        
        // Close modal
        setTimeout(() => {
            closeModal();
            if (selectedPayment === 'qris') {
                showToast('📝 Transaksi berhasil dibuat. Menunggu pembayaran...', 'success');
            }
        }, selectedPayment === 'qris' ? 2000 : 500);
        
        // Send WhatsApp notification to admin
        if (transactionResult && transactionResult.data) {
            sendWhatsAppNotification(transactionData, transactionResult.data.transaction_id);
        }
        
    } catch (error) {
        console.error('❌ Error processing purchase:', error);
        showToast('❌ Gagal memproses transaksi: ' + error.message, 'error');
        
        // Reset button
        const buyButton = document.querySelector('#purchaseModal .btn-primary');
        buyButton.textContent = 'Beli Sekarang';
        buyButton.disabled = false;
    }
}

// Send WhatsApp notification to admin
function sendWhatsAppNotification(transactionData, transactionId) {
    try {
        const adminWhatsApp = settings.admin_whatsapp || '6281234567890';
        
        const message = `
*TRANSAKSI BARU - MyQuota*

📦 *Paket:* ${selectedPackage.name}
📱 *No. HP:* ${transactionData.phone_number}
💰 *Harga:* Rp ${Number(transactionData.amount).toLocaleString('id-ID')}
💳 *Pembayaran:* ${transactionData.payment_method.toUpperCase()}
🔗 *ID:* ${transactionId}
⏰ *Waktu:* ${new Date().toLocaleString('id-ID')}

Silakan cek panel admin untuk approve transaksi.
        `.trim();
        
        const whatsappUrl = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(message)}`;
        
        // Optional: Open WhatsApp in new tab
        setTimeout(() => {
            if (confirm('Kirim notifikasi ke admin via WhatsApp?')) {
                window.open(whatsappUrl, '_blank');
            }
        }, 1000);
        
    } catch (error) {
        console.error('Failed to send WhatsApp notification:', error);
    }
}

// Auto refresh data every 30 seconds
function startAutoRefresh() {
    setInterval(async () => {
        try {
            await loadDataFromAPI();
            renderCategories();
            renderPackages();
            console.log('🔄 Auto refresh completed');
        } catch (error) {
            console.error('❌ Auto refresh failed:', error);
        }
    }, 30000); // 30 seconds
}

// Manual refresh function
async function refreshData() {
    try {
        showLoading(true);
        await loadDataFromAPI();
        renderCategories();
        renderPackages();
        showToast('✅ Data berhasil diperbarui dari server!', 'success');
    } catch (error) {
        console.error('❌ Error refreshing data:', error);
        showToast('❌ Gagal memperbarui data', 'error');
    } finally {
        showLoading(false);
    }
}

// Update QRIS image
function updateQRISImage(imageUrl) {
    const qrisImg = document.querySelector('#qrisImage img');
    if (qrisImg && imageUrl) {
        qrisImg.src = imageUrl;
    }
}

// Toggle sort
function toggleSort() {
    // Cycle through sort options
    if (currentSort === 'price') {
        currentSort = 'name';
        sortOrder = 'asc';
    } else if (currentSort === 'name') {
        currentSort = 'popular';
        sortOrder = 'desc';
    } else {
        currentSort = 'price';
        sortOrder = 'asc';
    }
    
    renderPackages();
    
    // Show toast with current sort
    const sortText = {
        price: 'Harga',
        name: 'Nama',
        popular: 'Popularitas'
    };
    
    showToast(`Diurutkan berdasarkan ${sortText[currentSort]}`, 'success');
}

// Toggle filter (placeholder)
function toggleFilter() {
    showToast('Filter sedang dalam pengembangan', 'warning');
}

// Close modals
function closeModal() {
    document.getElementById('purchaseModal').classList.remove('active');
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.remove('active');
}

// Show/hide loading
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.toggle('active', show);
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;
    
    // Set message and type
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Connection status indicator
function addConnectionStatusIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'connection-status';
    indicator.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 12px;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        cursor: pointer;
    `;
    indicator.textContent = '🟢 Server';
    indicator.onclick = () => {
        API.healthCheck()
            .then(() => showToast('🟢 Terhubung ke server', 'success'))
            .catch(() => showToast('🔴 Gagal terhubung ke server', 'error'));
    };
    document.body.appendChild(indicator);
}

// Add refresh button to header
function addRefreshButton() {
    const header = document.querySelector('.header-content');
    if (header && !header.querySelector('.refresh-btn')) {
        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'refresh-btn';
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
        refreshBtn.onclick = refreshData;
        refreshBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            padding: 8px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 14px;
            transition: transform 0.3s ease;
        `;
        
        refreshBtn.addEventListener('mouseover', function() {
            this.style.transform = 'scale(1.1) rotate(180deg)';
        });
        
        refreshBtn.addEventListener('mouseout', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
        });
        
        header.appendChild(refreshBtn);
    }
}

// Utility functions
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

// Initialize UI enhancements
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        addConnectionStatusIndicator();
        addRefreshButton();
    }, 1000);
});

// Export functions for global access
window.selectCategory = selectCategory;
window.viewPackageDetails = viewPackageDetails;
window.buyPackage = buyPackage;
window.selectPayment = selectPayment;
window.processPurchase = processPurchase;
window.toggleSort = toggleSort;
window.toggleFilter = toggleFilter;
window.closeModal = closeModal;
window.closeDetailModal = closeDetailModal;
window.refreshData = refreshData;
