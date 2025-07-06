// =================== CONFIGURATION FILE ===================

// API Configuration
const CONFIG = {
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbx8S_ZfWfrFzKd8LnSOJ7DK4B-DMsF-ZuK71Ab_Ohdc1xnNBezVSSs6N_iU4HNCuUwWug/exec',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    ADMIN: {
        USERNAME: 'admin',
        PASSWORD: 'admin123'
    }
};

// Make CONFIG globally available
window.CONFIG = CONFIG;

console.log('✅ Configuration loaded successfully');


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

console.log('🔧 Admin API URL:', ADMIN_API_CONFIG.APPS_SCRIPT_URL);

// =================== INITIALIZATION ===================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Admin Panel DOM Loaded');
    
    // Check if already logged in
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    console.log('📋 Login status from localStorage:', isLoggedIn);
    
    if (isLoggedIn === 'true') {
        console.log('✅ User already logged in, showing admin panel');
        showAdminPanel();
        loadDemoAdminData(); // Start with demo data first
    } else {
        console.log('❌ User not logged in, showing login form');
        showLoginForm();
    }
});

// =================== AUTHENTICATION ===================

function handleLogin(event) {
    event.preventDefault();
    console.log('🔐 Login attempt started');
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    console.log('📝 Username:', username);
    console.log('📝 Password length:', password.length);
    
    // Simple authentication
    if (username === 'admin' && password === 'admin123') {
        console.log('✅ Login successful');
        localStorage.setItem('adminLoggedIn', 'true');
        showAdminPanel();
        loadDemoAdminData();
        showToast('Login berhasil!', 'success');
    } else {
        console.log('❌ Login failed');
        showToast('Username atau password salah!', 'error');
    }
}

function logout() {
    console.log('🚪 Logout initiated');
    localStorage.removeItem('adminLoggedIn');
    showLoginForm();
    showToast('Logout berhasil!', 'success');
}

function showLoginForm() {
    console.log('📋 Showing login form');
    const loginContainer = document.getElementById('loginContainer');
    const adminContainer = document.getElementById('adminContainer');
    
    if (loginContainer) loginContainer.style.display = 'flex';
    if (adminContainer) adminContainer.style.display = 'none';
}

function showAdminPanel() {
    console.log('🏢 Showing admin panel');
    const loginContainer = document.getElementById('loginContainer');
    const adminContainer = document.getElementById('adminContainer');
    
    if (loginContainer) loginContainer.style.display = 'none';
    if (adminContainer) adminContainer.style.display = 'flex';
}

// =================== DATA MANAGEMENT ===================

function loadDemoAdminData() {
    console.log('📋 Loading demo admin data...');
    
    adminData = {
        categories: [
            { id: 1, name: 'Official XL / AXIS', slug: 'official-xl-axis', description: 'Paket resmi XL dan AXIS', icon: 'fas fa-star', status: 'active' },
            { id: 2, name: 'XL Circle', slug: 'xl-circle', description: 'Paket premium XL Circle', icon: 'fas fa-users', status: 'active' },
            { id: 3, name: 'Paket Harian', slug: 'paket-harian', description: 'Paket internet harian', icon: 'fas fa-calendar-day', status: 'active' },
            { id: 4, name: 'Perpanjangan Masa Aktif', slug: 'perpanjangan-masa-aktif', description: 'Perpanjangan masa aktif kartu', icon: 'fas fa-clock', status: 'active' }
        ],
        packages: [
            { id: 1, category_id: 1, name: 'XL Combo 10GB', quota: '10GB', price: 50000, validity: '30 hari', description: 'Paket internet 10GB dengan bonus telpon dan SMS unlimited', is_popular: true, status: 'active' },
            { id: 2, category_id: 1, name: 'AXIS Bronet 5GB', quota: '5GB', price: 25000, validity: '30 hari', description: 'Paket internet 5GB untuk browsing dan media sosial', is_popular: false, status: 'active' },
            { id: 3, category_id: 2, name: 'XL Circle 15GB', quota: '15GB', price: 75000, validity: '30 hari', description: 'Paket premium XL Circle dengan kuota besar', is_popular: true, status: 'active' }
        ],
        transactions: [
            { id: 'TXN_001', package_id: 1, phone_number: '081234567890', amount: 50000, payment_method: 'qris', status: 'pending', created_at: new Date().toISOString() },
            { id: 'TXN_002', package_id: 2, phone_number: '081987654321', amount: 25000, payment_method: 'dana', status: 'completed', created_at: new Date(Date.now() - 86400000).toISOString() }
        ],
        settings: {
            app_name: 'MyQuota',
            maintenance_mode: false,
            admin_whatsapp: '6281234567890',
            qris_image_url: 'https://via.placeholder.com/200x200/000000/FFFFFF?text=QRIS+DEMO',
            dana_link: 'https://link.dana.id/qr/demo'
        }
    };
    
    console.log('✅ Demo data loaded:', {
        categories: adminData.categories.length,
        packages: adminData.packages.length,
        transactions: adminData.transactions.length
    });
    
    // Render all sections
    renderDashboard();
    renderCategories();
    renderPackages();
    renderTransactions();
    renderSettings();
}

// =================== DASHBOARD ===================

function renderDashboard() {
    console.log('📊 Rendering dashboard...');
    
    // Update statistics
    const totalCategories = document.getElementById('totalCategories');
    const totalPackages = document.getElementById('totalPackages');
    const totalTransactions = document.getElementById('totalTransactions');
    const totalRevenue = document.getElementById('totalRevenue');
    
    if (totalCategories) totalCategories.textContent = adminData.categories.length;
    if (totalPackages) totalPackages.textContent = adminData.packages.length;
    if (totalTransactions) totalTransactions.textContent = adminData.transactions.length;
    
    // Calculate total revenue
    const revenue = adminData.transactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + Number(t.amount), 0);
    
    if (totalRevenue) totalRevenue.textContent = `Rp ${revenue.toLocaleString('id-ID')}`;
    
    // Render recent activities
    renderRecentActivities();
    renderPopularPackages();
}

function renderRecentActivities() {
    const container = document.getElementById('recentActivities');
    if (!container) return;
    
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
    if (!container) return;
    
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
    console.log('🏷️ Rendering categories...');
    const tbody = document.getElementById('categoriesTable');
    if (!tbody) return;
    
    if (adminData.categories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-message">Belum ada kategori</td></tr>';
        return;
    }
    
    tbody.innerHTML = adminData.categories.map(category => `
        <tr>
            <td>${category.id}</td>
            <td>${category.name}</td>
            <td>${category.slug}</td>
            <td><i class="${category.icon}"></i></td>
            <td><span class="status-badge status-${category.status}">${category.status}</span></td>
            <td>
                <button class="btn-icon" onclick="editCategory('${category.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-danger" onclick="deleteCategory('${category.id}')" title="Hapus">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    updatePackageCategoryOptions();
}

function showAddCategoryModal() {
    currentEditingId = null;
    currentEditingType = 'category';
    
    const modal = document.getElementById('addCategoryModal');
    const title = document.getElementById('categoryModalTitle');
    const form = document.getElementById('categoryForm');
    
    if (title) title.textContent = 'Tambah Kategori';
    if (form) form.reset();
    if (modal) modal.classList.add('active');
}

function editCategory(id) {
    const category = adminData.categories.find(c => c.id == id);
    if (!category) {
        showToast('Kategori tidak ditemukan!', 'error');
        return;
    }
    
    currentEditingId = id;
    currentEditingType = 'category';
    
    const title = document.getElementById('categoryModalTitle');
    const nameInput = document.getElementById('categoryName');
    const slugInput = document.getElementById('categorySlug');
    const descInput = document.getElementById('categoryDescription');
    const iconInput = document.getElementById('categoryIcon');
    const statusInput = document.getElementById('categoryStatus');
    const modal = document.getElementById('addCategoryModal');
    
    if (title) title.textContent = 'Edit Kategori';
    if (nameInput) nameInput.value = category.name;
    if (slugInput) slugInput.value = category.slug;
    if (descInput) descInput.value = category.description || '';
    if (iconInput) iconInput.value = category.icon;
    if (statusInput) statusInput.value = category.status;
    if (modal) modal.classList.add('active');
}

function saveCategory(event) {
    event.preventDefault();
    
    const categoryData = {
        name: document.getElementById('categoryName').value,
        slug: document.getElementById('categorySlug').value,
        description: document.getElementById('categoryDescription').value,
        icon: document.getElementById('categoryIcon').value,
        status: document.getElementById('categoryStatus').value
    };
    
    console.log('💾 Saving category:', categoryData);
    
    if (currentEditingId) {
        // Update existing category
        const index = adminData.categories.findIndex(c => c.id == currentEditingId);
        if (index !== -1) {
            adminData.categories[index] = { ...adminData.categories[index], ...categoryData };
            showToast('Kategori berhasil diperbarui!', 'success');
        }
    } else {
        // Add new category
        const newCategory = { 
            id: Date.now(), 
            ...categoryData 
        };
        adminData.categories.push(newCategory);
        showToast('Kategori berhasil ditambahkan!', 'success');
    }
    
    renderCategories();
    renderDashboard();
    closeModal('addCategoryModal');
}

function deleteCategory(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return;
    
    adminData.categories = adminData.categories.filter(c => c.id != id);
    renderCategories();
    renderDashboard();
    showToast('Kategori berhasil dihapus!', 'success');
}

// =================== PACKAGES MANAGEMENT ===================

function renderPackages() {
    console.log('📦 Rendering packages...');
    const tbody = document.getElementById('packagesTable');
    if (!tbody) return;
    
    if (adminData.packages.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-message">Belum ada paket</td></tr>';
        return;
    }
    
    tbody.innerHTML = adminData.packages.map(package_ => {
        const category = adminData.categories.find(c => c.id == package_.category_id);
        const categoryName = category ? category.name : 'Unknown';
        
        return `
            <tr>
                <td>${package_.id}</td>
                <td>${package_.name}</td>
                <td>${categoryName}</td>
                <td>${package_.quota}</td>
                <td>Rp ${Number(package_.price).toLocaleString('id-ID')}</td>
                <td>${package_.validity}</td>
                <td><span class="status-badge status-${package_.status}">${package_.status}</span></td>
                <td>
                    <button class="btn-icon" onclick="editPackage('${package_.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="deletePackage('${package_.id}')" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function updatePackageCategoryOptions() {
    const select = document.getElementById('packageCategory');
    if (!select) return;
    
    select.innerHTML = '<option value="">Pilih Kategori</option>' +
        adminData.categories.map(category => 
            `<option value="${category.id}">${category.name}</option>`
        ).join('');
}

function showAddPackageModal() {
    currentEditingId = null;
    currentEditingType = 'package';
    
    const modal = document.getElementById('addPackageModal');
    const title = document.getElementById('packageModalTitle');
    const form = document.getElementById('packageForm');
    
    if (title) title.textContent = 'Tambah Paket';
    if (form) form.reset();
    updatePackageCategoryOptions();
    if (modal) modal.classList.add('active');
}

function editPackage(id) {
    const package_ = adminData.packages.find(p => p.id == id);
    if (!package_) {
        showToast('Paket tidak ditemukan!', 'error');
        return;
    }
    
    currentEditingId = id;
    currentEditingType = 'package';
    
    const title = document.getElementById('packageModalTitle');
    const categorySelect = document.getElementById('packageCategory');
    const nameInput = document.getElementById('packageName');
    const quotaInput = document.getElementById('packageQuota');
    const priceInput = document.getElementById('packagePrice');
    const validityInput = document.getElementById('packageValidity');
    const descInput = document.getElementById('packageDescription');
    const popularInput = document.getElementById('packagePopular');
    const statusInput = document.getElementById('packageStatus');
    const modal = document.getElementById('addPackageModal');
    
    if (title) title.textContent = 'Edit Paket';
    updatePackageCategoryOptions();
    if (categorySelect) categorySelect.value = package_.category_id;
    if (nameInput) nameInput.value = package_.name;
    if (quotaInput) quotaInput.value = package_.quota;
    if (priceInput) priceInput.value = package_.price;
    if (validityInput) validityInput.value = package_.validity;
    if (descInput) descInput.value = package_.description;
    if (popularInput) popularInput.checked = package_.is_popular;
    if (statusInput) statusInput.value = package_.status;
    if (modal) modal.classList.add('active');
}

function savePackage(event) {
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
    
    if (currentEditingId) {
        // Update existing package
        const index = adminData.packages.findIndex(p => p.id == currentEditingId);
        if (index !== -1) {
            adminData.packages[index] = { ...adminData.packages[index], ...packageData };
            showToast('Paket berhasil diperbarui!', 'success');
        }
    } else {
        // Add new package
        const newPackage = { 
            id: Date.now(), 
            ...packageData 
        };
        adminData.packages.push(newPackage);
        showToast('Paket berhasil ditambahkan!', 'success');
    }
    
    renderPackages();
    renderDashboard();
    closeModal('addPackageModal');
}

function deletePackage(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus paket ini?')) return;
    
    adminData.packages = adminData.packages.filter(p => p.id != id);
    renderPackages();
    renderDashboard();
    showToast('Paket berhasil dihapus!', 'success');
}

// =================== TRANSACTIONS MANAGEMENT ===================

function renderTransactions() {
    console.log('💳 Rendering transactions...');
    const tbody = document.getElementById('transactionsTable');
    if (!tbody) return;
    
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

function updateTransactionStatus(id, newStatus) {
    const transaction = adminData.transactions.find(t => t.id === id);
    if (transaction) {
        transaction.status = newStatus;
        renderTransactions();
        renderDashboard();
        showToast('Status transaksi berhasil diperbarui!', 'success');
    }
}

function filterTransactions() {
    renderTransactions();
}

// =================== SETTINGS MANAGEMENT ===================

function renderSettings() {
    console.log('⚙️ Rendering settings...');
    const settings = adminData.settings;
    
    const appNameInput = document.getElementById('appName');
    const maintenanceInput = document.getElementById('maintenanceMode');
    const whatsappInput = document.getElementById('adminWhatsapp');
    const qrisInput = document.getElementById('qrisImageUrl');
    const danaInput = document.getElementById('danaLink');
    const danaPhoneInput = document.getElementById('danaPhone');
    
    if (appNameInput) appNameInput.value = settings.app_name || 'MyQuota';
    if (maintenanceInput) maintenanceInput.checked = settings.maintenance_mode || false;
    if (whatsappInput) whatsappInput.value = settings.admin_whatsapp || '';
    if (qrisInput) qrisInput.value = settings.qris_image_url || '';
    if (danaInput) danaInput.value = settings.dana_link || '';
    if (danaPhoneInput) danaPhoneInput.value = settings.dana_phone || '';
}

function saveSettings() {
    const settingsData = {
        app_name: document.getElementById('appName').value,
        maintenance_mode: document.getElementById('maintenanceMode').checked,
        admin_whatsapp: document.getElementById('adminWhatsapp').value,
        qris_image_url: document.getElementById('qrisImageUrl').value,
        dana_link: document.getElementById('danaLink').value,
        dana_phone: document.getElementById('danaPhone').value
    };
    
    adminData.settings = { ...adminData.settings, ...settingsData };
    showToast('Pengaturan berhasil disimpan!', 'success');
}

function resetSettings() {
    if (!confirm('Apakah Anda yakin ingin reset pengaturan ke default?')) return;
    
    const appNameInput = document.getElementById('appName');
    const maintenanceInput = document.getElementById('maintenanceMode');
    const whatsappInput = document.getElementById('adminWhatsapp');
    const qrisInput = document.getElementById('qrisImageUrl');
    const danaInput = document.getElementById('danaLink');
    const danaPhoneInput = document.getElementById('danaPhone');
    
    if (appNameInput) appNameInput.value = 'MyQuota';
    if (maintenanceInput) maintenanceInput.checked = false;
    if (whatsappInput) whatsappInput.value = '';
    if (qrisInput) qrisInput.value = '';
    if (danaInput) danaInput.value = '';
    if (danaPhoneInput) danaPhoneInput.value = '';
    
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
    
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = titles[sectionName] || sectionName;
    
    // Show section
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionName);
    if (targetSection) targetSection.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
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
    
    if (!toast || !toastMessage) {
        console.log('Toast:', message);
        return;
    }
    
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function refreshData() {
    showToast('Memperbarui data...', 'info');
    loadDemoAdminData();
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
