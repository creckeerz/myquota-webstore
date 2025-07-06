// Admin Panel Configuration
const ADMIN_CONFIG = {
    USERNAME: 'admin', // Ganti dengan username yang diinginkan
    PASSWORD: 'admin123', // Ganti dengan password yang aman
    SESSION_DURATION: 3600000, // 1 jam dalam milliseconds
};

// Global variables
let currentSection = 'dashboard';
let categories = [];
let packages = [];
let transactions = [];
let settings = {};
let isEditMode = false;
let editingId = null;

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
});

// Authentication functions
function checkAuthStatus() {
    const session = getSession();
    if (session && session.expiry > Date.now()) {
        showAdminPanel();
        loadDashboardData();
    } else {
        showLogin();
    }
}

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === ADMIN_CONFIG.USERNAME && password === ADMIN_CONFIG.PASSWORD) {
        // Create session
        const session = {
            username: username,
            loginTime: Date.now(),
            expiry: Date.now() + ADMIN_CONFIG.SESSION_DURATION
        };
        
        localStorage.setItem('admin_session', JSON.stringify(session));
        showAdminPanel();
        loadDashboardData();
        showToast('Login berhasil!', 'success');
    } else {
        showToast('Username atau password salah!', 'error');
    }
}

function logout() {
    localStorage.removeItem('admin_session');
    showLogin();
    showToast('Logout berhasil!', 'success');
}

function getSession() {
    try {
        const session = localStorage.getItem('admin_session');
        return session ? JSON.parse(session) : null;
    } catch (error) {
        return null;
    }
}

function showLogin() {
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('adminContainer').style.display = 'none';
}

function showAdminPanel() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('adminContainer').style.display = 'flex';
}

// Navigation functions
function showSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    event.target.closest('.nav-item').classList.add('active');
    
    // Update content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.getElementById(sectionName).classList.add('active');
    
    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        categories: 'Kelola Kategori',
        packages: 'Kelola Paket',
        transactions: 'Kelola Transaksi',
        settings: 'Pengaturan Aplikasi'
    };
    
    document.getElementById('pageTitle').textContent = titles[sectionName];
    currentSection = sectionName;
    
    // Load section data
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'categories':
            loadCategories();
            break;
        case 'packages':
            loadPackages();
            break;
        case 'transactions':
            loadTransactions();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Dashboard functions
async function loadDashboardData() {
    try {
        showLoading(true);
        
        // Load all data
        await Promise.all([
            loadCategories(),
            loadPackages(),
            loadTransactions(),
            loadSettings()
        ]);
        
        updateDashboardStats();
        updateDashboardCharts();
        updateRecentActivities();
        
        showLoading(false);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Gagal memuat data dashboard', 'error');
        showLoading(false);
    }
}

function updateDashboardStats() {
    // Update statistics
    document.getElementById('totalCategories').textContent = categories.filter(c => c.status === 'active').length;
    document.getElementById('totalPackages').textContent = packages.filter(p => p.status === 'active').length;
    document.getElementById('totalTransactions').textContent = transactions.length;
    
    // Calculate total revenue
    const totalRevenue = transactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
}

function updateDashboardCharts() {
    // Update popular packages
    const packageStats = packages.map(pkg => {
        const transactionCount = transactions.filter(t => t.package_id === pkg.id).length;
        return {
            name: pkg.name,
            count: transactionCount,
            quota: pkg.quota
        };
    }).sort((a, b) => b.count - a.count).slice(0, 5);
    
    const popularPackagesDiv = document.getElementById('popularPackages');
    popularPackagesDiv.innerHTML = '';
    
    if (packageStats.length === 0) {
        popularPackagesDiv.innerHTML = '<p class="text-muted">Belum ada data transaksi</p>';
        return;
    }
    
    packageStats.forEach(pkg => {
        const item = document.createElement('div');
        item.className = 'popular-item';
        item.innerHTML = `
            <div>
                <h4>${pkg.name}</h4>
                <p>${pkg.quota}</p>
            </div>
            <div class="popular-count">${pkg.count}</div>
        `;
        popularPackagesDiv.appendChild(item);
    });
}

function updateRecentActivities() {
    const recentActivitiesDiv = document.getElementById('recentActivities');
    
    // Get recent transactions
    const recentTransactions = transactions
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
    
    recentActivitiesDiv.innerHTML = '';
    
    if (recentTransactions.length === 0) {
        recentActivitiesDiv.innerHTML = '<p class="text-muted">Belum ada aktivitas terbaru</p>';
        return;
    }
    
    recentTransactions.forEach(transaction => {
        const pkg = packages.find(p => p.id === transaction.package_id);
        const activity = document.createElement('div');
        activity.className = 'activity-item';
        
        const iconClass = transaction.status === 'completed' ? 'fas fa-check' : 
                         transaction.status === 'pending' ? 'fas fa-clock' : 'fas fa-times';
        const iconColor = transaction.status === 'completed' ? '#28a745' : 
                         transaction.status === 'pending' ? '#ffc107' : '#dc3545';
        
        activity.innerHTML = `
            <div class="activity-icon" style="background: ${iconColor}">
                <i class="${iconClass}"></i>
            </div>
            <div class="activity-info">
                <h4>Transaksi ${pkg ? pkg.name : 'Unknown'}</h4>
                <p>${transaction.phone_number} - ${formatCurrency(transaction.amount)}</p>
            </div>
            <div class="activity-time">
                ${formatTimeAgo(transaction.created_at)}
            </div>
        `;
        
        recentActivitiesDiv.appendChild(activity);
    });
}

// Categories management
async function loadCategories() {
    try {
        // Simulate loading from Google Sheets
        // In real implementation, use SheetsAPI.readData(CONFIG.SHEETS.CATEGORIES)
        
        if (categories.length === 0) {
            // Load default categories
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
        }
        
        if (currentSection === 'categories') {
            renderCategoriesTable();
        }
        
        // Update package category dropdown
        updatePackageCategoryDropdown();
        
    } catch (error) {
        console.error('Error loading categories:', error);
        throw error;
    }
}

function renderCategoriesTable() {
    const tbody = document.getElementById('categoriesTable');
    tbody.innerHTML = '';
    
    categories.forEach(category => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${category.id}</td>
            <td>${category.name}</td>
            <td>${category.slug}</td>
            <td><i class="${category.icon}"></i></td>
            <td><span class="status-badge status-${category.status}">${category.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-warning" onclick="editCategory(${category.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCategory(${category.id})">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showAddCategoryModal() {
    isEditMode = false;
    editingId = null;
    
    document.getElementById('categoryModalTitle').textContent = 'Tambah Kategori';
    document.getElementById('categoryForm').reset();
    document.getElementById('addCategoryModal').classList.add('active');
}

function editCategory(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    isEditMode = true;
    editingId = categoryId;
    
    document.getElementById('categoryModalTitle').textContent = 'Edit Kategori';
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categorySlug').value = category.slug;
    document.getElementById('categoryDescription').value = category.description;
    document.getElementById('categoryIcon').value = category.icon;
    document.getElementById('categoryStatus').value = category.status;
    
    document.getElementById('addCategoryModal').classList.add('active');
}

async function saveCategory(event) {
    event.preventDefault();
    
    try {
        showLoading(true);
        
        const formData = {
            name: document.getElementById('categoryName').value,
            slug: document.getElementById('categorySlug').value,
            description: document.getElementById('categoryDescription').value,
            icon: document.getElementById('categoryIcon').value,
            status: document.getElementById('categoryStatus').value
        };
        
        if (isEditMode) {
            // Update existing category
            const categoryIndex = categories.findIndex(c => c.id === editingId);
            if (categoryIndex !== -1) {
                categories[categoryIndex] = {
                    ...categories[categoryIndex],
                    ...formData,
                    updated_at: new Date().toISOString()
                };
            }
            
            showToast('Kategori berhasil diperbarui!', 'success');
        } else {
            // Add new category
            const newCategory = {
                id: Math.max(...categories.map(c => c.id), 0) + 1,
                ...formData,
                created_at: new Date().toISOString()
            };
            
            categories.push(newCategory);
            showToast('Kategori berhasil ditambahkan!', 'success');
        }
        
        // In real implementation, save to Google Sheets here
        // await SheetsAPI.writeData(CONFIG.SHEETS.CATEGORIES, categoriesToSheetData(categories));
        
        renderCategoriesTable();
        updatePackageCategoryDropdown();
        closeModal('addCategoryModal');
        showLoading(false);
        
    } catch (error) {
        console.error('Error saving category:', error);
        showToast('Gagal menyimpan kategori', 'error');
        showLoading(false);
    }
}

function deleteCategory(categoryId) {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return;
    
    try {
        const categoryIndex = categories.findIndex(c => c.id === categoryId);
        if (categoryIndex !== -1) {
            categories.splice(categoryIndex, 1);
            renderCategoriesTable();
            updatePackageCategoryDropdown();
            showToast('Kategori berhasil dihapus!', 'success');
            
            // In real implementation, update Google Sheets here
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        showToast('Gagal menghapus kategori', 'error');
    }
}

// Packages management
async function loadPackages() {
    try {
        if (packages.length === 0) {
            // Load default packages
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
                    category_id: 4,
                    name: 'Perpanjangan 30 Hari',
                    quota: 'Masa Aktif',
                    price: 10000,
                    validity: '30 hari',
                    description: 'Perpanjangan masa aktif kartu tanpa kuota internet',
                    is_popular: false,
                    status: 'active',
                    created_at: new Date().toISOString()
                }
            ];
        }
        
        if (currentSection === 'packages') {
            renderPackagesTable();
        }
        
    } catch (error) {
        console.error('Error loading packages:', error);
        throw error;
    }
}

function renderPackagesTable() {
    const tbody = document.getElementById('packagesTable');
    tbody.innerHTML = '';
    
    packages.forEach(pkg => {
        const category = categories.find(c => c.id === pkg.category_id);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${pkg.id}</td>
            <td>${pkg.name}</td>
            <td>${category ? category.name : 'Unknown'}</td>
            <td>${pkg.quota}</td>
            <td>${formatCurrency(pkg.price)}</td>
            <td>${pkg.validity}</td>
            <td>
                <span class="status-badge status-${pkg.status}">${pkg.status}</span>
                ${pkg.is_popular ? '<span class="status-badge" style="background: #ffc107; color: #333; margin-left: 5px;">Popular</span>' : ''}
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-warning" onclick="editPackage(${pkg.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deletePackage(${pkg.id})">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updatePackageCategoryDropdown() {
    const dropdown = document.getElementById('packageCategory');
    if (!dropdown) return;
    
    dropdown.innerHTML = '<option value="">Pilih Kategori</option>';
    
    categories.filter(c => c.status === 'active').forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        dropdown.appendChild(option);
    });
}

function showAddPackageModal() {
    isEditMode = false;
    editingId = null;
    
    document.getElementById('packageModalTitle').textContent = 'Tambah Paket';
    document.getElementById('packageForm').reset();
    document.getElementById('addPackageModal').classList.add('active');
}

function editPackage(packageId) {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return;
    
    isEditMode = true;
    editingId = packageId;
    
    document.getElementById('packageModalTitle').textContent = 'Edit Paket';
    document.getElementById('packageCategory').value = pkg.category_id;
    document.getElementById('packageName').value = pkg.name;
    document.getElementById('packageQuota').value = pkg.quota;
    document.getElementById('packagePrice').value = pkg.price;
    document.getElementById('packageValidity').value = pkg.validity;
    document.getElementById('packageDescription').value = pkg.description;
    document.getElementById('packagePopular').checked = pkg.is_popular;
    document.getElementById('packageStatus').value = pkg.status;
    
    document.getElementById('addPackageModal').classList.add('active');
}

async function savePackage(event) {
    event.preventDefault();
    
    try {
        showLoading(true);
        
        const formData = {
            category_id: parseInt(document.getElementById('packageCategory').value),
            name: document.getElementById('packageName').value,
            quota: document.getElementById('packageQuota').value,
            price: parseInt(document.getElementById('packagePrice').value),
            validity: document.getElementById('packageValidity').value,
            description: document.getElementById('packageDescription').value,
            is_popular: document.getElementById('packagePopular').checked,
            status: document.getElementById('packageStatus').value
        };
        
        if (isEditMode) {
            // Update existing package
            const packageIndex = packages.findIndex(p => p.id === editingId);
            if (packageIndex !== -1) {
                packages[packageIndex] = {
                    ...packages[packageIndex],
                    ...formData,
                    updated_at: new Date().toISOString()
                };
            }
            
            showToast('Paket berhasil diperbarui!', 'success');
        } else {
            // Add new package
            const newPackage = {
                id: Math.max(...packages.map(p => p.id), 0) + 1,
                ...formData,
                created_at: new Date().toISOString()
            };
            
            packages.push(newPackage);
            showToast('Paket berhasil ditambahkan!', 'success');
        }
        
        // In real implementation, save to Google Sheets here
        renderPackagesTable();
        closeModal('addPackageModal');
        showLoading(false);
        
    } catch (error) {
        console.error('Error saving package:', error);
        showToast('Gagal menyimpan paket', 'error');
        showLoading(false);
    }
}

function deletePackage(packageId) {
    if (!confirm('Apakah Anda yakin ingin menghapus paket ini?')) return;
    
    try {
        const packageIndex = packages.findIndex(p => p.id === packageId);
        if (packageIndex !== -1) {
            packages.splice(packageIndex, 1);
            renderPackagesTable();
            showToast('Paket berhasil dihapus!', 'success');
        }
    } catch (error) {
        console.error('Error deleting package:', error);
        showToast('Gagal menghapus paket', 'error');
    }
}

// Transactions management
async function loadTransactions() {
    try {
        if (transactions.length === 0) {
            // Load sample transactions
            transactions = [
                {
                    id: 1,
                    transaction_id: 'TRX001',
                    package_id: 1,
                    phone_number: '081234567890',
                    amount: 50000,
                    status: 'completed',
                    payment_method: 'qris',
                    created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
                },
                {
                    id: 2,
                    transaction_id: 'TRX002',
                    package_id: 2,
                    phone_number: '081234567891',
                    amount: 25000,
                    status: 'pending',
                    payment_method: 'dana',
                    created_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
                },
                {
                    id: 3,
                    transaction_id: 'TRX003',
                    package_id: 3,
                    phone_number: '081234567892',
                    amount: 75000,
                    status: 'completed',
                    payment_method: 'qris',
                    created_at: new Date().toISOString()
                }
            ];
        }
        
        if (currentSection === 'transactions') {
            renderTransactionsTable();
        }
        
    } catch (error) {
        console.error('Error loading transactions:', error);
        throw error;
    }
}

function renderTransactionsTable() {
    const tbody = document.getElementById('transactionsTable');
    tbody.innerHTML = '';
    
    let filteredTransactions = [...transactions];
    
    // Apply filters
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    if (statusFilter) {
        filteredTransactions = filteredTransactions.filter(t => t.status === statusFilter);
    }
    
    if (dateFilter) {
        const filterDate = new Date(dateFilter).toDateString();
        filteredTransactions = filteredTransactions.filter(t => 
            new Date(t.created_at).toDateString() === filterDate
        );
    }
    
    filteredTransactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    filteredTransactions.forEach(transaction => {
        const pkg = packages.find(p => p.id === transaction.package_id);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.transaction_id}</td>
            <td>${pkg ? pkg.name : 'Unknown Package'}</td>
            <td>${transaction.phone_number}</td>
            <td>${formatCurrency(transaction.amount)}</td>
            <td>${transaction.payment_method.toUpperCase()}</td>
            <td><span class="status-badge status-${transaction.status}">${transaction.status}</span></td>
            <td>${formatDate(transaction.created_at)}</td>
            <td>
                <div class="action-buttons">
                    ${transaction.status === 'pending' ? `
                        <button class="btn btn-sm btn-success" onclick="updateTransactionStatus(${transaction.id}, 'completed')">
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="updateTransactionStatus(${transaction.id}, 'failed')">
                            <i class="fas fa-times"></i> Reject
                        </button>
                    ` : `
                        <button class="btn btn-sm btn-outline" onclick="viewTransactionDetails(${transaction.id})">
                            <i class="fas fa-eye"></i> Detail
                        </button>
                    `}
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    if (filteredTransactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Tidak ada transaksi ditemukan</td></tr>';
    }
}

function filterTransactions() {
    renderTransactionsTable();
}

function updateTransactionStatus(transactionId, newStatus) {
    try {
        const transactionIndex = transactions.findIndex(t => t.id === transactionId);
        if (transactionIndex !== -1) {
            transactions[transactionIndex].status = newStatus;
            transactions[transactionIndex].updated_at = new Date().toISOString();
            
            renderTransactionsTable();
            updateDashboardStats();
            
            const statusText = newStatus === 'completed' ? 'disetujui' : 'ditolak';
            showToast(`Transaksi berhasil ${statusText}!`, 'success');
            
            // In real implementation, update Google Sheets and send notification to customer
        }
    } catch (error) {
        console.error('Error updating transaction status:', error);
        showToast('Gagal mengupdate status transaksi', 'error');
    }
}

function viewTransactionDetails(transactionId) {
    const transaction = transactions.find(t => t.id === transactionId);
    const pkg = packages.find(p => p.id === transaction.package_id);
    
    if (!transaction) return;
    
    alert(`Detail Transaksi:
ID: ${transaction.transaction_id}
Paket: ${pkg ? pkg.name : 'Unknown'}
No. Telepon: ${transaction.phone_number}
Jumlah: ${formatCurrency(transaction.amount)}
Status: ${transaction.status}
Metode Pembayaran: ${transaction.payment_method}
Tanggal: ${formatDate(transaction.created_at)}`);
}

// Settings management
async function loadSettings() {
    try {
        if (Object.keys(settings).length === 0) {
            // Load default settings
            settings = {
                app_name: 'MyQuota',
                app_version: '1.0.0',
                maintenance_mode: false,
                admin_whatsapp: '6281234567890',
                qris_image_url: 'https://via.placeholder.com/200x200/000000/FFFFFF?text=QRIS+CODE',
                dana_link: 'https://link.dana.id/qr/sample',
                dana_phone: '081234567890'
            };
        }
        
        if (currentSection === 'settings') {
            populateSettingsForm();
        }
        
    } catch (error) {
        console.error('Error loading settings:', error);
        throw error;
    }
}

function populateSettingsForm() {
    document.getElementById('appName').value = settings.app_name || '';
    document.getElementById('maintenanceMode').checked = settings.maintenance_mode || false;
    document.getElementById('adminWhatsapp').value = settings.admin_whatsapp || '';
    document.getElementById('qrisImageUrl').value = settings.qris_image_url || '';
    document.getElementById('danaLink').value = settings.dana_link || '';
    document.getElementById('danaPhone').value = settings.dana_phone || '';
}

async function saveSettings() {
    try {
        showLoading(true);
        
        settings = {
            ...settings,
            app_name: document.getElementById('appName').value,
            maintenance_mode: document.getElementById('maintenanceMode').checked,
            admin_whatsapp: document.getElementById('adminWhatsapp').value,
            qris_image_url: document.getElementById('qrisImageUrl').value,
            dana_link: document.getElementById('danaLink').value,
            dana_phone: document.getElementById('danaPhone').value,
            updated_at: new Date().toISOString()
        };
        
        // In real implementation, save to Google Sheets here
        showToast('Pengaturan berhasil disimpan!', 'success');
        showLoading(false);
        
    } catch (error) {
        console.error('Error saving settings:', error);
        showToast('Gagal menyimpan pengaturan', 'error');
        showLoading(false);
    }
}

function resetSettings() {
    if (!confirm('Apakah Anda yakin ingin mereset pengaturan ke default?')) return;
    
    settings = {
        app_name: 'MyQuota',
        maintenance_mode: false,
        admin_whatsapp: '6281234567890',
        qris_image_url: 'https://via.placeholder.com/200x200/000000/FFFFFF?text=QRIS+CODE',
        dana_link: 'https://link.dana.id/qr/sample',
        dana_phone: '081234567890'
    };
    
    populateSettingsForm();
    showToast('Pengaturan berhasil direset!', 'success');
}

// Utility functions
function refreshData() {
    loadDashboardData();
    showToast('Data berhasil direfresh!', 'success');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showLoading(show) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.toggle('active', show);
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

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Baru saja';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
    return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
}

// Auto-generate slug from name
document.addEventListener('DOMContentLoaded', function() {
    const categoryNameInput = document.getElementById('categoryName');
    const categorySlugInput = document.getElementById('categorySlug');
    
    if (categoryNameInput && categorySlugInput) {
        categoryNameInput.addEventListener('input', function() {
            if (!isEditMode) {
                const slug = this.value
                    .toLowerCase()
                    .replace(/[^a-z0-9 ]/g, '')
                    .replace(/\s+/g, '-');
                categorySlugInput.value = slug;
            }
        });
    }
});

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Export functions for global access
window.showSection = showSection;
window.handleLogin = handleLogin;
window.logout = logout;
window.refreshData = refreshData;
window.showAddCategoryModal = showAddCategoryModal;
window.showAddPackageModal = showAddPackageModal;
window.editCategory = editCategory;
window.editPackage = editPackage;
window.deleteCategory = deleteCategory;
window.deletePackage = deletePackage;
window.saveCategory = saveCategory;
window.savePackage = savePackage;
window.filterTransactions = filterTransactions;
window.updateTransactionStatus = updateTransactionStatus;
window.viewTransactionDetails = viewTransactionDetails;
window.saveSettings = saveSettings;
window.resetSettings = resetSettings;
window.closeModal = closeModal;
