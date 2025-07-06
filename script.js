// Configuration
const CONFIG = {
    SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID', // Ganti dengan ID spreadsheet Anda
    API_KEY: 'YOUR_API_KEY', // Ganti dengan API key Google Sheets Anda
    DANA_API_URL: 'https://link.dana.id/qr/YOUR_DANA_ID', // Ganti dengan URL DANA Anda
    DANA_PHONE: '081234567890', // Ganti dengan nomor DANA admin
    QRIS_IMAGE_URL: 'https://via.placeholder.com/200x200/000000/FFFFFF?text=QRIS+CODE' // Ganti dengan URL gambar QRIS
};

// Global variables
let categories = [];
let packages = [];
let transactions = [];
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
        await loadCategories();
        await loadPackages();
        await loadSettings();
        setupEventListeners();
        renderCategories();
        renderPackages();
        showLoading(false);
    } catch (error) {
        console.error('Error initializing app:', error);
        showToast('Gagal memuat aplikasi', 'error');
        showLoading(false);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchQuery = this.value.toLowerCase();
            filterPackages();
        });
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

// Load categories from Google Sheets
async function loadCategories() {
    try {
        // For now, using simulated data. Replace with Google Sheets API call
        // const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SPREADSHEET_ID}/values/Categories!A:G?key=${CONFIG.API_KEY}`);
        // const data = await response.json();
        
        // Simulated data - replace with actual API response processing
        categories = [
            {
                id: 1,
                name: 'Official XL / AXIS',
                slug: 'official-xl-axis',
                description: 'Paket resmi XL dan AXIS dengan kualitas terjamin',
                icon: 'fas fa-star',
                status: 'active',
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                name: 'XL Circle',
                slug: 'xl-circle',
                description: 'Paket premium XL Circle untuk pengguna VIP',
                icon: 'fas fa-users',
                status: 'active',
                created_at: new Date().toISOString()
            },
            {
                id: 3,
                name: 'Paket Harian',
                slug: 'paket-harian',
                description: 'Paket internet harian untuk kebutuhan sehari-hari',
                icon: 'fas fa-calendar-day',
                status: 'active',
                created_at: new Date().toISOString()
            },
            {
                id: 4,
                name: 'Perpanjangan Masa Aktif',
                slug: 'perpanjangan-masa-aktif',
                description: 'Perpanjangan masa aktif kartu tanpa kuota internet',
                icon: 'fas fa-clock',
                status: 'active',
                created_at: new Date().toISOString()
            }
        ];
        
        console.log('Categories loaded:', categories.length);
    } catch (error) {
        console.error('Error loading categories:', error);
        throw error;
    }
}

// Load packages from Google Sheets
async function loadPackages() {
    try {
        // For now, using simulated data. Replace with Google Sheets API call
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
                status: 'active',
                created_at: new Date().toISOString()
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
                status: 'active',
                created_at: new Date().toISOString()
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
                status: 'active',
                created_at: new Date().toISOString()
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
                status: 'active',
                created_at: new Date().toISOString()
            },
            {
                id: 5,
                category_id: 3,
                name: 'Paket Harian 2GB',
                quota: '2GB',
                price: 8000,
                validity: '1 hari',
                description: 'Paket internet harian 2GB dengan kecepatan 4G penuh',
                is_popular: true,
                status: 'active',
                created_at: new Date().toISOString()
            },
            {
                id: 6,
                category_id: 4,
                name: 'Perpanjangan 30 Hari',
                quota: 'Masa Aktif',
                price: 10000,
                validity: '30 hari',
                description: 'Perpanjangan masa aktif kartu tanpa kuota internet',
                is_popular: false,
                status: 'active',
                created_at: new Date().toISOString()
            },
            {
                id: 7,
                category_id: 1,
                name: 'XL HotRod 20GB',
                quota: '20GB',
                price: 85000,
                validity: '30 hari',
                description: 'Paket internet XL HotRod 20GB dengan kecepatan 4G+ dan bonus aplikasi',
                is_popular: true,
                status: 'active',
                created_at: new Date().toISOString()
            },
            {
                id: 8,
                category_id: 2,
                name: 'XL Circle 30GB',
                quota: '30GB',
                price: 120000,
                validity: '30 hari',
                description: 'Paket premium XL Circle 30GB dengan layanan prioritas dan bonus entertainment',
                is_popular: false,
                status: 'active',
                created_at: new Date().toISOString()
            }
        ];
        
        console.log('Packages loaded:', packages.length);
    } catch (error) {
        console.error('Error loading packages:', error);
        throw error;
    }
}

// Load settings from Google Sheets
async function loadSettings() {
    try {
        // Simulated settings data
        settings = {
            app_name: 'MyQuota',
            app_version: '1.0.0',
            maintenance_mode: false,
            min_transaction: 5000,
            max_transaction: 1000000,
            admin_phone: '081234567890',
            qris_image: CONFIG.QRIS_IMAGE_URL,
            dana_link: CONFIG.DANA_API_URL
        };
        
        console.log('Settings loaded:', settings);
    } catch (error) {
        console.error('Error loading settings:', error);
        throw error;
    }
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
                    <div class="price-amount">Rp ${pkg.price.toLocaleString('id-ID')}</div>
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
        filteredPackages = filteredPackages.filter(pkg => pkg.category_id === selectedCategory);
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
            return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
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
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return;
    
    const category = categories.find(c => c.id === pkg.category_id);
    
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
                <span class="value price">Rp ${pkg.price.toLocaleString('id-ID')}</span>
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
    selectedPackage = packages.find(p => p.id === packageId);
    if (!selectedPackage) return;
    
    const selectedPackageInfo = document.getElementById('selectedPackageInfo');
    selectedPackageInfo.innerHTML = `
        <h4>${selectedPackage.name}</h4>
        <p>Kuota: ${selectedPackage.quota}</p>
        <p>Masa Berlaku: ${selectedPackage.validity}</p>
        <div class="price">Rp ${selectedPackage.price.toLocaleString('id-ID')}</div>
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
        // Update QRIS image if needed
        const qrisImg = document.querySelector('#qrisImage img');
        if (qrisImg && settings.qris_image) {
            qrisImg.src = settings.qris_image;
        }
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
        
        // Generate transaction ID
        const transactionId = generateTransactionId();
        
        // Create transaction object
        const transaction = {
            id: Date.now(),
            transaction_id: transactionId,
            package_id: selectedPackage.id,
            phone_number: phoneNumber,
            amount: selectedPackage.price,
            status: 'pending',
            payment_method: selectedPayment,
            created_at: new Date().toISOString()
        };
        
        // Save transaction (simulate API call)
        await saveTransaction(transaction);
        
        // Handle payment method
        if (selectedPayment === 'qris') {
            showToast('Scan QR Code untuk melanjutkan pembayaran', 'warning');
        } else if (selectedPayment === 'dana') {
            // Redirect to DANA
            const danaUrl = `${settings.dana_link}?amount=${selectedPackage.price}&phone=${phoneNumber}&package=${selectedPackage.name}`;
            window.open(danaUrl, '_blank');
            showToast('Dialihkan ke DANA...', 'success');
        }
        
        // Reset button
        buyButton.textContent = originalText;
        buyButton.disabled = false;
        
        // Close modal after delay if QRIS
        if (selectedPayment === 'qris') {
            setTimeout(() => {
                closeModal();
                showToast('Transaksi berhasil dibuat. Menunggu pembayaran...', 'success');
            }, 2000);
        } else {
            closeModal();
        }
        
    } catch (error) {
        console.error('Error processing purchase:', error);
        showToast('Gagal memproses transaksi', 'error');
        
        // Reset button
        const buyButton = document.querySelector('#purchaseModal .btn-primary');
        buyButton.textContent = 'Beli Sekarang';
        buyButton.disabled = false;
    }
}

// Save transaction to Google Sheets
async function saveTransaction(transaction) {
    try {
        // Simulate API call to save transaction
        // In real implementation, this would call Google Sheets API
        console.log('Saving transaction:', transaction);
        
        // Add to local transactions array
        transactions.push(transaction);
        
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return transaction;
    } catch (error) {
        console.error('Error saving transaction:', error);
        throw error;
    }
}

// Generate transaction ID
function generateTransactionId() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8);
    return `TRX${timestamp.slice(-6)}${random.toUpperCase()}`;
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

// Filter packages (called from search input)
function filterPackages() {
    renderPackages();
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

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatPhoneNumber(phone) {
    // Remove non-digits
    phone = phone.replace(/\D/g, '');
    
    // Add country code if not present
    if (phone.startsWith('8')) {
        phone = '62' + phone;
    } else if (phone.startsWith('08')) {
        phone = '62' + phone.substring(1);
    }
    
    return phone;
}

// Service Worker Registration (for PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Add CSS for detail modal styles
const detailStyles = document.createElement('style');
detailStyles.textContent = `
    .package-detail {
        margin-bottom: 20px;
    }
    
    .package-detail h3 {
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 15px;
        color: #333;
    }
    
    .detail-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;
    }
    
    .detail-row .label {
        font-weight: 600;
        color: #666;
    }
    
    .detail-row .value {
        color: #333;
    }
    
    .detail-row .value.price {
        color: #ec008c;
        font-weight: 700;
        font-size: 16px;
    }
    
    .detail-description {
        margin-top: 15px;
    }
    
    .detail-description h4 {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 8px;
        color: #333;
    }
    
    .detail-description p {
        font-size: 13px;
        line-height: 1.5;
        color: #666;
    }
    
    .popular-badge {
        background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
        color: white;
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 12px;
        font-weight: 600;
        display: inline-block;
        margin-top: 10px;
    }
`;

document.head.appendChild(detailStyles);
