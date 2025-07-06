// Admin Panel Configuration
const ADMIN_CONFIG = {
    USERNAME: 'admin', // Ganti dengan username yang diinginkan
    PASSWORD: 'admin123', // Ganti dengan password yang aman
    SESSION_DURATION: 3600000, // 1 jam dalam milliseconds
};



// =================== ADMIN PANEL SCRIPT ===================

// Global variables
let adminData = {
    categories: [],
    packages: [],
    transactions: [],
    settings: {}
};

let currentEditingId = null;
let currentEditingType = null;

// API Configuration
const ADMIN_API_CONFIG = {
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbx8S_ZfWfrFzKd8LnSOJ7DK4B-DMsF-ZuK71Ab_Ohdc1xnNBezVSSs6N_iU4HNCuUwWug/exec',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3
};

// API Client for Admin
class AdminAPI {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    
    async callAPI(action, data = null, id = null) {
        try {
            // Use POST method with FormData for better CORS compatibility
            const formData = new FormData();
            formData.append('action', action);
            
            if (data) {
                formData.append('data', JSON.stringify(data));
            }
            
            if (id) {
                formData.append('id', id);
            }
            
            console.log('🔄 Admin API Call (POST):', action, data ? 'with data' : 'no data');
            
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                body: formData,
                mode: 'cors',
                credentials: 'omit'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'API call failed');
            }
            
            console.log('✅ Admin API Success:', action);
            return result;
            
        } catch (error) {
            console.error('❌ Admin API Error:', action, error.message);
            
            // Fallback to GET method if POST fails
            if (error.message.includes('CORS') || error.message.includes('fetch')) {
                console.log('🔄 Trying GET fallback...');
                return this.callAPIWithGET(action, data, id);
            }
            
            throw error;
        }
    }
    
    // Fallback GET method
    async callAPIWithGET(action, data = null, id = null) {
        try {
            const url = new URL(this.baseUrl);
            url.searchParams.append('action', action);
            
            if (data) {
                url.searchParams.append('data', JSON.stringify(data));
            }
            
            if (id) {
                url.searchParams.append('id', id);
            }
            
            console.log('🔄 Admin API Call (GET fallback):', action);
            
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
            
            console.log('✅ Admin API Success (GET):', action);
            return result;
            
        } catch (error) {
            console.error('❌ Admin API GET Error:', action, error.message);
            throw error;
        }
    }
    
    // Categories API
    async getCategories() {
        return this.callAPI('getCategories');
    }
    
    async addCategory(categoryData) {
        return this.callAPI('addCategory', categoryData);
    }
    
    async updateCategory(id, categoryData) {
        return this.callAPI('updateCategory', categoryData, id);
    }
    
    async deleteCategory(id) {
        return this.callAPI('deleteCategory', null, id);
    }
    
    // Packages API
    async getPackages() {
        return this.callAPI('getPackages');
    }
    
    async addPackage(packageData) {
        return this.callAPI('addPackage', packageData);
    }
    
    async updatePackage(id, packageData) {
        return this.callAPI('updatePackage', packageData, id);
    }
    
    async deletePackage(id) {
        return this.callAPI('deletePackage', null, id);
    }
    
    // Transactions API
    async getTransactions() {
        return this.callAPI('getTransactions');
    }
    
    async updateTransactionStatus(id, status) {
        return this.callAPI('updateTransactionStatus', { status }, id);
    }
    
    // Settings API
    async getSettings() {
        return this.callAPI('getSettings');
    }
    
    async updateSettings(settingsData) {
        return this.callAPI('updateSettings', settingsData);
    }
}

// Initialize API
const adminAPI = new AdminAPI(ADMIN_API_CONFIG.APPS_SCRIPT_URL);

// =================== INITIALIZATION ===================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Admin Panel Initializing...');
    
    // Check if already logged in
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
        showAdminPanel();
        loadAllData();
    }
});

// =================== AUTHENTICATION ===================

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Simple authentication
    if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('adminLoggedIn', 'true');
        showAdminPanel();
        loadAllData();
        showToast('Login berhasil!', 'success');
    } else {
        showToast('Username atau password salah!', 'error');
    }
}

function logout() {
    localStorage.removeItem('adminLoggedIn');
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('adminContainer').style.display = 'none';
    showToast('Logout berhasil!', 'success');
}

function showAdminPanel() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('adminContainer').style.display = 'flex';
}

// =================== DATA LOADING ===================

async function loadAllData() {
    try {
        showLoading(true);
        console.log('🔄 Loading all admin data...');
        
        // Load all data simultaneously with individual error handling
        const results = await Promise.allSettled([
            adminAPI.getCategories(),
            adminAPI.getPackages(),
            adminAPI.getTransactions(),
            adminAPI.getSettings()
        ]);
        
        // Process categories
        if (results[0].status === 'fulfilled') {
            adminData.categories = results[0].value.data || [];
            console.log('✅ Categories loaded:', adminData.categories.length);
        } else {
            console.error('❌ Failed to load categories:', results[0].reason);
            adminData.categories = [];
        }
        
        // Process packages
        if (results[1].status === 'fulfilled') {
            adminData.packages = results[1].value.data || [];
            console.log('✅ Packages loaded:', adminData.packages.length);
        } else {
            console.error('❌ Failed to load packages:', results[1].reason);
            adminData.packages = [];
        }
        
        // Process transactions
        if (results[2].status === 'fulfilled') {
            adminData.transactions = results[2].value.data || [];
            console.log('✅ Transactions loaded:', adminData.transactions.length);
        } else {
            console.error('❌ Failed to load transactions:', results[2].reason);
            adminData.transactions = [];
        }
        
        // Process settings
        if (results[3].status === 'fulfilled') {
            adminData.settings = results[3].value.data || {};
            console.log('✅ Settings loaded:', Object.keys(adminData.settings).length, 'keys');
        } else {
            console.error('❌ Failed to load settings:', results[3].reason);
            adminData.settings = {};
        }
        
        // Check if any data was loaded successfully
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        
        if (successCount === 0) {
            console.log('⚠️ No data loaded from API, using demo data');
            loadDemoAdminData();
            showToast('Menggunakan data demo (tidak terhubung ke server)', 'warning');
        } else {
            console.log(`✅ Loaded ${successCount}/4 data types from server`);
            
            // Render all sections
            renderDashboard();
            renderCategories();
            renderPackages();
            renderTransactions();
            renderSettings();
            
            showToast('Data berhasil dimuat dari server!', 'success');
        }
        
    } catch (error) {
        console.error('❌ Critical error loading admin data:', error);
        showToast('Error loading data: ' + error.message, 'error');
        
        // Load demo data as fallback
        loadDemoAdminData();
    } finally {
        showLoading(false);
    }
}

function loadDemoAdminData() {
    console.log('📋 Loading demo admin data...');
    
    adminData = {
        categories: [
            { id: 1, name: 'Official XL / AXIS', slug: 'official-xl-axis', description: 'Paket resmi XL dan AXIS', icon: 'fas fa-star', status: 'active' },
            { id: 2, name: 'XL Circle', slug: 'xl-circle', description: 'Paket premium XL Circle', icon: 'fas fa-users', status: 'active' }
        ],
        packages: [
            { id: 1, category_id: 1, name: 'XL Combo 10GB', quota: '10GB', price: 50000, validity: '30 hari', description: 'Paket internet 10GB', is_popular: true, status: 'active' }
        ],
        transactions: [
            { id: 1, package_id: 1, phone_number: '081234567890', amount: 50000, payment_method: 'qris', status: 'pending', created_at: new Date().toISOString() }
        ],
        settings: {
            app_name: 'MyQuota',
            maintenance_mode: false,
            admin_whatsapp: '6281234567890',
            qris_image_url: '',
            dana_link: ''
        }
    };
    
    renderDashboard();
    renderCategories();
    renderPackages();
    renderTransactions();
    renderSettings();
}

// =================== DASHBOARD ===================

function renderDashboard() {
    // Update statistics
    document.getElementById('totalCategories').textContent = adminData.categories.length;
    document.getElementById('totalPackages').textContent = adminData.packages.length;
    document.getElementById('totalTransactions').textContent = adminData.transactions.length;
    
    // Calculate total revenue
    const totalRevenue = adminData.transactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + Number(t.amount), 0);
    document.getElementById('totalRevenue').textContent = `Rp ${totalRevenue.toLocaleString('id-ID')}`;
    
    // Render recent activities
    renderRecentActivities();
    renderPopularPackages();
}

function renderRecentActivities() {
    const container = document.getElementById('recentActivities');
    const recentTransactions = adminData.transactions
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
    
    if (recentTransactions.length === 0) {
        container.innerHTML = '<p class="empty-message">Belum ada aktivitas terbaru</p>';
        return;
    }
    
    container.innerHTML = recentTransactions.map(transaction => {
        const package_ = adminData.packages.find(p => p.id === transaction.package_id);
        const packageName = package_ ? package_.name : 'Unknown Package';
        
        return `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <div class="activity-details">
                    <h4>Transaksi Baru</h4>
                    <p>${packageName} - ${transaction.phone_number}</p>
                    <small>${new Date(transaction.created_at).toLocaleString('id-ID')}</small>
                </div>
                <div class="activity-status status-${transaction.status}">
                    ${transaction.status}
                </div>
            </div>
        `;
    }).join('');
}

function renderPopularPackages() {
    const container = document.getElementById('popularPackages');
    const popularPackages = adminData.packages
        .filter(p => p.is_popular)
        .slice(0, 5);
    
    if (popularPackages.length === 0) {
        container.innerHTML = '<p class="empty-message">Belum ada paket populer</p>';
        return;
    }
    
    container.innerHTML = popularPackages.map(package_ => `
        <div class="popular-package-item">
            <div class="package-name">${package_.name}</div>
            <div class="package-price">Rp ${Number(package_.price).toLocaleString('id-ID')}</div>
        </div>
    `).join('');
}

// =================== CATEGORIES MANAGEMENT ===================

function renderCategories() {
    const tbody = document.getElementById('categoriesTable');
    
    if (adminData.categories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-message">Belum ada kategori</td></tr>';
        return;
    }
    
    tbody.innerHTML = adminData.categories.map(category => {
        const categoryId = category.id;
        
        return `
            <tr>
                <td>${categoryId}</td>
                <td>${category.name}</td>
                <td>${category.slug}</td>
                <td><i class="${category.icon}"></i></td>
                <td><span class="status-badge status-${category.status}">${category.status}</span></td>
                <td>
                    <button class="btn-icon" onclick="editCategory('${categoryId}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="deleteCategory('${categoryId}')" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Update package category options
    updatePackageCategoryOptions();
    console.log('🏷️ Rendered categories table with', adminData.categories.length, 'categories');
}

function showAddCategoryModal() {
    currentEditingId = null;
    currentEditingType = 'category';
    
    document.getElementById('categoryModalTitle').textContent = 'Tambah Kategori';
    document.getElementById('categoryForm').reset();
    document.getElementById('addCategoryModal').classList.add('active');
}

function editCategory(id) {
    const category = adminData.categories.find(c => c.id == id);
    if (!category) {
        console.error('❌ Category not found with ID:', id);
        showToast('Kategori tidak ditemukan!', 'error');
        return;
    }
    
    console.log('✏️ Editing category:', category);
    
    currentEditingId = id;
    currentEditingType = 'category';
    
    document.getElementById('categoryModalTitle').textContent = 'Edit Kategori';
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categorySlug').value = category.slug;
    document.getElementById('categoryDescription').value = category.description || '';
    document.getElementById('categoryIcon').value = category.icon;
    document.getElementById('categoryStatus').value = category.status;
    
    document.getElementById('addCategoryModal').classList.add('active');
}

async function saveCategory(event) {
    event.preventDefault();
    
    const categoryData = {
        name: document.getElementById('categoryName').value,
        slug: document.getElementById('categorySlug').value,
        description: document.getElementById('categoryDescription').value,
        icon: document.getElementById('categoryIcon').value,
        status: document.getElementById('categoryStatus').value
    };
    
    console.log('💾 Saving category:', categoryData);
    
    try {
        showLoading(true);
        
        let result;
        
        if (currentEditingId) {
            // Update existing category
            console.log('📝 Updating category ID:', currentEditingId);
            result = await adminAPI.updateCategory(currentEditingId, categoryData);
            
            // Update local data
            const index = adminData.categories.findIndex(c => c.id == currentEditingId);
            if (index !== -1) {
                adminData.categories[index] = { ...adminData.categories[index], ...categoryData };
                console.log('✅ Local data updated for category:', currentEditingId);
            }
            
            showToast('Kategori berhasil diperbarui!', 'success');
        } else {
            // Add new category
            console.log('➕ Adding new category');
            result = await adminAPI.addCategory(categoryData);
            
            // Add to local data
            const newCategory = { 
                id: result.data?.id || Date.now(), 
                ...categoryData 
            };
            adminData.categories.push(newCategory);
            console.log('✅ New category added to local data:', newCategory);
            
            showToast('Kategori berhasil ditambahkan!', 'success');
        }
        
        console.log('🔄 Refreshing UI...');
        renderCategories();
        renderDashboard();
        closeModal('addCategoryModal');
        
    } catch (error) {
        console.error('❌ Error saving category:', error);
        showToast('Gagal menyimpan kategori: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function deleteCategory(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return;
    
    console.log('🗑️ Deleting category ID:', id);
    
    try {
        showLoading(true);
        
        const result = await adminAPI.deleteCategory(id);
        console.log('✅ Category deleted from server:', result);
        
        // Remove from local data
        adminData.categories = adminData.categories.filter(c => c.id != id);
        console.log('✅ Category removed from local data');
        
        renderCategories();
        renderDashboard();
        showToast('Kategori berhasil dihapus!', 'success');
        
    } catch (error) {
        console.error('❌ Error deleting category:', error);
        showToast('Gagal menghapus kategori: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// =================== PACKAGES MANAGEMENT ===================

function renderPackages() {
    const tbody = document.getElementById('packagesTable');
    
    if (adminData.packages.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-message">Belum ada paket</td></tr>';
        return;
    }
    
    tbody.innerHTML = adminData.packages.map(package_ => {
        const category = adminData.categories.find(c => c.id == package_.category_id);
        const categoryName = category ? category.name : 'Unknown';
        const packageId = package_.id;
        
        return `
            <tr>
                <td>${packageId}</td>
                <td>${package_.name}</td>
                <td>${categoryName}</td>
                <td>${package_.quota}</td>
                <td>Rp ${Number(package_.price).toLocaleString('id-ID')}</td>
                <td>${package_.validity}</td>
                <td><span class="status-badge status-${package_.status}">${package_.status}</span></td>
                <td>
                    <button class="btn-icon" onclick="editPackage('${packageId}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="deletePackage('${packageId}')" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    console.log('📦 Rendered packages table with', adminData.packages.length, 'packages');
}

function updatePackageCategoryOptions() {
    const select = document.getElementById('packageCategory');
    if (select) {
        select.innerHTML = '<option value="">Pilih Kategori</option>' +
            adminData.categories.map(category => 
                `<option value="${category.id}">${category.name}</option>`
            ).join('');
    }
}

function showAddPackageModal() {
    currentEditingId = null;
    currentEditingType = 'package';
    
    document.getElementById('packageModalTitle').textContent = 'Tambah Paket';
    document.getElementById('packageForm').reset();
    updatePackageCategoryOptions();
    document.getElementById('addPackageModal').classList.add('active');
}

function editPackage(id) {
    const package_ = adminData.packages.find(p => p.id == id);
    if (!package_) {
        console.error('❌ Package not found with ID:', id);
        showToast('Paket tidak ditemukan!', 'error');
        return;
    }
    
    console.log('✏️ Editing package:', package_);
    
    currentEditingId = id;
    currentEditingType = 'package';
    
    document.getElementById('packageModalTitle').textContent = 'Edit Paket';
    document.getElementById('packageCategory').value = package_.category_id;
    document.getElementById('packageName').value = package_.name;
    document.getElementById('packageQuota').value = package_.quota;
    document.getElementById('packagePrice').value = package_.price;
    document.getElementById('packageValidity').value = package_.validity;
    document.getElementById('packageDescription').value = package_.description;
    document.getElementById('packagePopular').checked = package_.is_popular;
    document.getElementById('packageStatus').value = package_.status;
    
    updatePackageCategoryOptions();
    document.getElementById('addPackageModal').classList.add('active');
}

async function savePackage(event) {
    event.preventDefault();
    
    const packageData = {
        category_id: parseInt(document.getElementById('packageCategory').value),
        name: document.getElementById('packageName').value,
        quota: document.getElementById('packageQuota').value,
        price: parseInt(document.getElementById('packagePrice').value),
        validity: document.getElementById('packageValidity').value,
        description: document.getElementById('packageDescription').value,
        is_popular: document.getElementById('packagePopular').checked,
        status: document.getElementById('packageStatus').value
    };
    
    console.log('💾 Saving package:', packageData);
    
    try {
        showLoading(true);
        
        let result;
        
        if (currentEditingId) {
            // Update existing package
            console.log('📝 Updating package ID:', currentEditingId);
            result = await adminAPI.updatePackage(currentEditingId, packageData);
            
            // Update local data
            const index = adminData.packages.findIndex(p => p.id == currentEditingId);
            if (index !== -1) {
                adminData.packages[index] = { ...adminData.packages[index], ...packageData };
                console.log('✅ Local data updated for package:', currentEditingId);
            }
            
            showToast('Paket berhasil diperbarui!', 'success');
        } else {
            // Add new package
            console.log('➕ Adding new package');
            result = await adminAPI.addPackage(packageData);
            
            // Add to local data
            const newPackage = { 
                id: result.data?.id || Date.now(), 
                ...packageData 
            };
            adminData.packages.push(newPackage);
            console.log('✅ New package added to local data:', newPackage);
            
            showToast('Paket berhasil ditambahkan!', 'success');
        }
        
        console.log('🔄 Refreshing UI...');
        renderPackages();
        renderDashboard();
        closeModal('addPackageModal');
        
    } catch (error) {
        console.error('❌ Error saving package:', error);
        showToast('Gagal menyimpan paket: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function deletePackage(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus paket ini?')) return;
    
    console.log('🗑️ Deleting package ID:', id);
    
    try {
        showLoading(true);
        
        const result = await adminAPI.deletePackage(id);
        console.log('✅ Package deleted from server:', result);
        
        // Remove from local data
        adminData.packages = adminData.packages.filter(p => p.id != id);
        console.log('✅ Package removed from local data');
        
        renderPackages();
        renderDashboard();
        showToast('Paket berhasil dihapus!', 'success');
        
    } catch (error) {
        console.error('❌ Error deleting package:', error);
        showToast('Gagal menghapus paket: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// =================== TRANSACTIONS MANAGEMENT ===================

function renderTransactions() {
    const tbody = document.getElementById('transactionsTable');
    
    if (adminData.transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-message">Belum ada transaksi</td></tr>';
        return;
    }
    
    tbody.innerHTML = adminData.transactions.map(transaction => {
        const package_ = adminData.packages.find(p => p.id === transaction.package_id);
        const packageName = package_ ? package_.name : 'Unknown Package';
        
        return `
            <tr>
                <td>${transaction.id}</td>
                <td>${packageName}</td>
                <td>${transaction.phone_number}</td>
                <td>Rp ${Number(transaction.amount).toLocaleString('id-ID')}</td>
                <td>${transaction.payment_method}</td>
                <td><span class="status-badge status-${transaction.status}">${transaction.status}</span></td>
                <td>${new Date(transaction.created_at).toLocaleString('id-ID')}</td>
                <td>
                    <select onchange="updateTransactionStatus('${transaction.id}', this.value)">
                        <option value="pending" ${transaction.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="completed" ${transaction.status === 'completed' ? 'selected' : ''}>Selesai</option>
                        <option value="failed" ${transaction.status === 'failed' ? 'selected' : ''}>Gagal</option>
                    </select>
                </td>
            </tr>
        `;
    }).join('');
}

async function updateTransactionStatus(id, newStatus) {
    console.log('🔄 Updating transaction status:', id, 'to', newStatus);
    
    try {
        showLoading(true);
        
        const result = await adminAPI.updateTransactionStatus(id, newStatus);
        console.log('✅ Transaction status updated on server:', result);
        
        // Update local data
        const transaction = adminData.transactions.find(t => t.id === id);
        if (transaction) {
            transaction.status = newStatus;
            console.log('✅ Transaction status updated in local data');
        }
        
        renderTransactions();
        renderDashboard();
        showToast('Status transaksi berhasil diperbarui!', 'success');
        
    } catch (error) {
        console.error('❌ Error updating transaction status:', error);
        showToast('Gagal memperbarui status transaksi: ' + error.message, 'error');
        
        // Revert the select value
        renderTransactions();
    } finally {
        showLoading(false);
    }
}

function filterTransactions() {
    // This function would implement client-side filtering
    // For now, just render all transactions
    renderTransactions();
}

// =================== SETTINGS MANAGEMENT ===================

function renderSettings() {
    const settings = adminData.settings;
    
    document.getElementById('appName').value = settings.app_name || 'MyQuota';
    document.getElementById('maintenanceMode').checked = settings.maintenance_mode || false;
    document.getElementById('adminWhatsapp').value = settings.admin_whatsapp || '';
    document.getElementById('qrisImageUrl').value = settings.qris_image_url || '';
    document.getElementById('danaLink').value = settings.dana_link || '';
    document.getElementById('danaPhone').value = settings.dana_phone || '';
}

async function saveSettings() {
    const settingsData = {
        app_name: document.getElementById('appName').value,
        maintenance_mode: document.getElementById('maintenanceMode').checked,
        admin_whatsapp: document.getElementById('adminWhatsapp').value,
        qris_image_url: document.getElementById('qrisImageUrl').value,
        dana_link: document.getElementById('danaLink').value,
        dana_phone: document.getElementById('danaPhone').value
    };
    
            console.log('✅ Settings updated in local data');
        
        showToast('Pengaturan berhasil disimpan!', 'success');
        
    } catch (error) {
        console.error('❌ Error saving settings:', error);
        showToast('Gagal menyimpan pengaturan: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function resetSettings() {
    if (!confirm('Apakah Anda yakin ingin reset pengaturan ke default?')) return;
    
    document.getElementById('appName').value = 'MyQuota';
    document.getElementById('maintenanceMode').checked = false;
    document.getElementById('adminWhatsapp').value = '';
    document.getElementById('qrisImageUrl').value = '';
    document.getElementById('danaLink').value = '';
    document.getElementById('danaPhone').value = '';
    
    showToast('Pengaturan telah direset!', 'success');
}

// =================== UI HELPERS ===================

function showSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        categories: 'Kelola Kategori',
        packages: 'Kelola Paket',
        transactions: 'Kelola Transaksi',
        settings: 'Pengaturan Aplikasi'
    };
    document.getElementById('pageTitle').textContent = titles[sectionName] || sectionName;
    
    // Show section
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    currentEditingId = null;
    currentEditingType = null;
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

async function refreshData() {
    showToast('Memperbarui data...', 'info');
    await loadAllData();
}

// =================== GLOBAL EXPORTS ===================

// Make functions globally accessible
window.handleLogin = handleLogin;
window.logout = logout;
window.showSection = showSection;
window.refreshData = refreshData;

// Category functions
window.showAddCategoryModal = showAddCategoryModal;
window.editCategory = editCategory;
window.saveCategory = saveCategory;
window.deleteCategory = deleteCategory;

// Package functions
window.showAddPackageModal = showAddPackageModal;
window.editPackage = editPackage;
window.savePackage = savePackage;
window.deletePackage = deletePackage;

// Transaction functions
window.updateTransactionStatus = updateTransactionStatus;
window.filterTransactions = filterTransactions;

// Settings functions
window.saveSettings = saveSettings;
window.resetSettings = resetSettings;

// Modal functions
window.closeModal = closeModal;

console.log('✅ Admin panel script loaded successfully');
