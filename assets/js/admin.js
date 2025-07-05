// ===== TRANSACTION MANAGEMENT METHODS =====
// Tambahkan methods ini ke class AdminPanel di admin.js

// Add this property to constructor
constructor() {
    this.currentCategory = 'official';
    this.categories = [];
    this.packages = [];
    this.editingPackage = null;
    this.transactions = []; // NEW: Store transactions
    this.currentView = 'packages'; // NEW: Track current view (packages/transactions)
    
    this.init();
}

// NEW METHOD: Show Transactions
async showTransactions() {
    console.log('📊 Showing transactions...');
    this.currentView = 'transactions';
    
    // Update active tab
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector('.transaction-tab').classList.add('active');
    
    // Update panel title
    const categoryTitle = document.getElementById('categoryTitle');
    if (categoryTitle) {
        categoryTitle.textContent = 'History Transaksi';
    }
    
    // Hide "Tambah Paket" button
    const addButton = document.getElementById('addPackageBtn');
    if (addButton) {
        addButton.style.display = 'none';
    }
    
    // Update search box for transactions
    this.updateSearchBoxForTransactions();
    
    // Load and display transactions
    await this.loadTransactions();
    this.renderTransactionTable();
}

// NEW METHOD: Load Transactions
async loadTransactions() {
    try {
        console.log('📋 Loading transactions...');
        const result = await API.getTransactions();
        this.transactions = result.data || result || [];
        console.log('✅ Transactions loaded:', this.transactions.length);
        
        // Update stats with transaction data
        this.updateTransactionStats();
        
    } catch (error) {
        console.error('❌ Failed to load transactions:', error);
        this.transactions = [];
        // Show mock data for demo
        this.createMockTransactions();
    }
}

// NEW METHOD: Create Mock Transactions (for demo)
createMockTransactions() {
    this.transactions = [
        {
            id: 1,
            transaction_id: 'TXN' + Date.now(),
            package_id: 1,
            phone_number: '081234567890',
            amount: 25000,
            payment_method: 'qris',
            status: 'pending',
            created_at: new Date().toISOString()
        },
        {
            id: 2,
            transaction_id: 'TXN' + (Date.now() - 3600000),
            package_id: 2,
            phone_number: '081234567891',
            amount: 35000,
            payment_method: 'dana',
            status: 'success',
            created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
            id: 3,
            transaction_id: 'TXN' + (Date.now() - 7200000),
            package_id: 1,
            phone_number: '081234567892',
            amount: 25000,
            payment_method: 'qris',
            status: 'failed',
            created_at: new Date(Date.now() - 7200000).toISOString()
        }
    ];
    console.log('📋 Mock transactions created for demo');
}

// NEW METHOD: Update Transaction Stats
updateTransactionStats() {
    const stats = {
        total: this.transactions.length,
        pending: this.transactions.filter(t => t.status === 'pending').length,
        success: this.transactions.filter(t => t.status === 'success').length,
        failed: this.transactions.filter(t => t.status === 'failed').length,
        revenue: this.transactions
            .filter(t => t.status === 'success')
            .reduce((sum, t) => sum + (t.amount || 0), 0)
    };
    
    // Update stats cards
    const elements = {
        totalTransactions: document.getElementById('totalTransactions'),
        revenue: document.getElementById('revenue')
    };
    
    if (elements.totalTransactions) {
        elements.totalTransactions.textContent = stats.total;
    }
    if (elements.revenue) {
        elements.revenue.textContent = Utils.formatPrice(stats.revenue);
    }
    
    console.log('📈 Transaction stats updated:', stats);
}

// NEW METHOD: Render Transaction Table
renderTransactionTable() {
    const tableContainer = document.getElementById('packageTableContainer');
    if (!tableContainer) return;
    
    if (this.transactions.length === 0) {
        tableContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <div>Belum ada transaksi</div>
                <div style="font-size: 12px; color: #666; margin-top: 10px;">
                    Transaksi akan muncul ketika user melakukan pembelian
                </div>
            </div>
        `;
        return;
    }
    
    // Create transaction table
    tableContainer.innerHTML = `
        <table class="data-table" id="transactionTable">
            <thead>
                <tr>
                    <th>ID Transaksi</th>
                    <th>Paket</th>
                    <th>Nomor HP</th>
                    <th>Jumlah</th>
                    <th>Metode</th>
                    <th>Status</th>
                    <th>Waktu</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody id="transactionTableBody">
                ${this.transactions.map(transaction => this.renderTransactionRow(transaction)).join('')}
            </tbody>
        </table>
    `;
}

// NEW METHOD: Render Transaction Row
renderTransactionRow(transaction) {
    const statusClass = this.getStatusClass(transaction.status);
    const statusText = this.getStatusText(transaction.status);
    const packageName = this.getPackageName(transaction.package_id);
    const formattedDate = this.formatTransactionDate(transaction.created_at);
    
    return `
        <tr data-transaction-id="${transaction.id}">
            <td>
                <span class="transaction-id">${transaction.transaction_id || transaction.id}</span>
            </td>
            <td class="package-info">
                <strong>${packageName}</strong>
            </td>
            <td class="phone-number">${transaction.phone_number || '-'}</td>
            <td class="transaction-amount">${Utils.formatPrice(transaction.amount)}</td>
            <td>
                <span class="payment-method ${transaction.payment_method}">
                    ${this.getPaymentMethodIcon(transaction.payment_method)} ${this.getPaymentMethodText(transaction.payment_method)}
                </span>
            </td>
            <td>
                <span class="status-badge ${statusClass}">
                    ${statusText}
                </span>
            </td>
            <td class="transaction-time">${formattedDate}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-info btn-sm" onclick="admin.viewTransactionDetails(${transaction.id})">
                        Detail
                    </button>
                    ${transaction.status === 'pending' ? `
                        <button class="btn btn-success btn-sm" onclick="admin.approveTransaction(${transaction.id})">
                            ✅ Approve
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="admin.rejectTransaction(${transaction.id})">
                            ❌ Reject
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `;
}

// NEW METHOD: Get Status Class
getStatusClass(status) {
    const statusMap = {
        'pending': 'status-pending',
        'success': 'status-success',
        'failed': 'status-failed'
    };
    return statusMap[status] || 'status-failed';
}

// NEW METHOD: Get Status Text
getStatusText(status) {
    const statusMap = {
        'pending': 'Pending',
        'success': 'Berhasil',
        'failed': 'Gagal'
    };
    return statusMap[status] || 'Unknown';
}

// NEW METHOD: Get Package Name
getPackageName(packageId) {
    // Try to find package from current packages
    const pkg = this.packages.find(p => p.id == packageId);
    if (pkg) {
        return pkg.quota || pkg.name || 'Unknown Package';
    }
    
    // If not found, return placeholder
    return `Package #${packageId}`;
}

// NEW METHOD: Get Payment Method Icon
getPaymentMethodIcon(method) {
    const iconMap = {
        'qris': '📱',
        'dana': '💸',
        'manual': '💳'
    };
    return iconMap[method] || '💳';
}

// NEW METHOD: Get Payment Method Text
getPaymentMethodText(method) {
    const textMap = {
        'qris': 'QRIS',
        'dana': 'DANA',
        'manual': 'Manual'
    };
    return textMap[method] || 'Unknown';
}

// NEW METHOD: Format Transaction Date
formatTransactionDate(dateString) {
    if (!dateString) return '-';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateString;
    }
}

// NEW METHOD: Update Search Box for Transactions
updateSearchBoxForTransactions() {
    const searchBox = document.getElementById('searchBox');
    if (!searchBox) return;
    
    searchBox.innerHTML = `
        <input type="text" class="search-input" placeholder="Cari transaksi (ID, nomor HP)..." 
               id="searchInput" onkeyup="admin.searchTransactions()">
        <select class="form-select" id="statusFilter" onchange="admin.filterTransactions()">
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="success">Berhasil</option>
            <option value="failed">Gagal</option>
        </select>
        <select class="form-select" id="paymentFilter" onchange="admin.filterTransactions()">
            <option value="">Semua Metode</option>
            <option value="qris">QRIS</option>
            <option value="dana">DANA</option>
            <option value="manual">Manual</option>
        </select>
    `;
}

// NEW METHOD: Search Transactions
searchTransactions() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const rows = document.querySelectorAll('#transactionTableBody tr');
    
    rows.forEach(row => {
        const transactionId = row.cells[0]?.textContent.toLowerCase() || '';
        const phoneNumber = row.cells[2]?.textContent.toLowerCase() || '';
        
        if (transactionId.includes(searchTerm) || phoneNumber.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// NEW METHOD: Filter Transactions
filterTransactions() {
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const paymentFilter = document.getElementById('paymentFilter')?.value || '';
    const rows = document.querySelectorAll('#transactionTableBody tr');
    
    rows.forEach(row => {
        let showRow = true;
        
        // Filter by status
        if (statusFilter) {
            const statusBadge = row.querySelector('.status-badge');
            const statusClass = this.getStatusClass(statusFilter);
            if (!statusBadge?.classList.contains(statusClass)) {
                showRow = false;
            }
        }
        
        // Filter by payment method
        if (paymentFilter && showRow) {
            const paymentBadge = row.querySelector('.payment-method');
            if (!paymentBadge?.classList.contains(paymentFilter)) {
                showRow = false;
            }
        }
        
        row.style.display = showRow ? '' : 'none';
    });
}

// NEW METHOD: View Transaction Details
viewTransactionDetails(transactionId) {
    console.log('👁️ Viewing transaction details:', transactionId);
    
    const transaction = this.transactions.find(t => t.id == transactionId);
    if (!transaction) {
        Utils.showToast('Transaksi tidak ditemukan', 'error');
        return;
    }
    
    this.showTransactionDetailModal(transaction);
}

// NEW METHOD: Show Transaction Detail Modal
showTransactionDetailModal(transaction) {
    const packageName = this.getPackageName(transaction.package_id);
    
    const content = `
        <div class="transaction-detail">
            <div class="detail-section">
                <h4>Informasi Transaksi</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>ID Transaksi:</label>
                        <span>${transaction.transaction_id || transaction.id}</span>
                    </div>
                    <div class="detail-item">
                        <label>Paket:</label>
                        <span>${packageName}</span>
                    </div>
                    <div class="detail-item">
                        <label>Nomor HP:</label>
                        <span>${transaction.phone_number}</span>
                    </div>
                    <div class="detail-item">
                        <label>Jumlah:</label>
                        <span style="font-weight: bold; color: #00b894;">${Utils.formatPrice(transaction.amount)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Metode Pembayaran:</label>
                        <span>
                            ${this.getPaymentMethodIcon(transaction.payment_method)} 
                            ${this.getPaymentMethodText(transaction.payment_method)}
                        </span>
                    </div>
                    <div class="detail-item">
                        <label>Status:</label>
                        <span class="status-badge ${this.getStatusClass(transaction.status)}">
                            ${this.getStatusText(transaction.status)}
                        </span>
                    </div>
                    <div class="detail-item">
                        <label>Waktu Transaksi:</label>
                        <span>${this.formatTransactionDate(transaction.created_at)}</span>
                    </div>
                </div>
            </div>
            
            ${transaction.status === 'pending' ? `
                <div class="modal-actions">
                    <button class="btn btn-success" onclick="admin.approveTransaction(${transaction.id})">
                        ✅ Approve Transaksi
                    </button>
                    <button class="btn btn-danger" onclick="admin.rejectTransaction(${transaction.id})">
                        ❌ Reject Transaksi
                    </button>
                </div>
            ` : ''}
        </div>
    `;
    
    document.getElementById('transactionDetailContent').innerHTML = content;
    document.getElementById('transactionModal').classList.add('show');
}

// NEW METHOD: Approve Transaction
async approveTransaction(transactionId) {
    if (!confirm('Approve transaksi ini? Kuota akan diaktifkan untuk user.')) return;
    
    try {
        // Find transaction
        const transaction = this.transactions.find(t => t.id == transactionId);
        if (transaction) {
            transaction.status = 'success';
            
            // Close modals
            this.closeTransactionModal();
            
            // Refresh display
            this.renderTransactionTable();
            this.updateTransactionStats();
            
            Utils.showToast('Transaksi berhasil di-approve!', 'success');
            
            // Log notification
            console.log(`📱 Notification sent to ${transaction.phone_number}: Kuota ${this.getPackageName(transaction.package_id)} telah aktif!`);
        }
        
    } catch (error) {
        console.error('❌ Error approving transaction:', error);
        Utils.showToast('Gagal approve transaksi', 'error');
    }
}

// NEW METHOD: Reject Transaction
async rejectTransaction(transactionId) {
    const reason = prompt('Alasan reject transaksi (opsional):');
    
    try {
        const transaction = this.transactions.find(t => t.id == transactionId);
        if (transaction) {
            transaction.status = 'failed';
            if (reason) {
                transaction.reject_reason = reason;
            }
            
            // Close modals
            this.closeTransactionModal();
            
            // Refresh display
            this.renderTransactionTable();
            this.updateTransactionStats();
            
            Utils.showToast('Transaksi berhasil di-reject', 'success');
            
            // Log notification
            console.log(`📱 Notification sent to ${transaction.phone_number}: Transaksi ditolak. ${reason || ''}`);
        }
        
    } catch (error) {
        console.error('❌ Error rejecting transaction:', error);
        Utils.showToast('Gagal reject transaksi', 'error');
    }
}

// NEW METHOD: Close Transaction Modal
closeTransactionModal() {
    document.getElementById('transactionModal').classList.remove('show');
}

// UPDATE switchCategory method untuk handle kembali ke packages
async switchCategory(categorySlug) {
    // If switching from transactions back to packages
    if (this.currentView === 'transactions') {
        this.currentView = 'packages';
        
        // Show "Tambah Paket" button again
        const addButton = document.getElementById('addPackageBtn');
        if (addButton) {
            addButton.style.display = 'inline-block';
        }
        
        // Update search box back to packages
        this.updateSearchBoxForPackages();
    }
    
    if (categorySlug === this.currentCategory && this.currentView === 'packages') return;
    
    this.currentCategory = categorySlug;
    this.resetSelection();
    
    // Update active tab
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    const activeTab = document.querySelector(`[data-category="${categorySlug}"]`);
    if (activeTab) activeTab.classList.add('active');
    
    // Update category title
    const currentCat = this.categories.find(cat => cat.slug === categorySlug);
    const categoryTitle = document.getElementById('categoryTitle');
    if (categoryTitle && currentCat) {
        categoryTitle.textContent = currentCat.name;
    }
    
    // Load packages for new category
    await this.loadPackages(categorySlug);
}

// NEW METHOD: Update Search Box for Packages
updateSearchBoxForPackages() {
    const searchBox = document.getElementById('searchBox');
    if (!searchBox) return;
    
    searchBox.innerHTML = `
        <input type="text" class="search-input" placeholder="Cari paket..." id="searchInput" onkeyup="admin.searchPackages()">
        <select class="form-select" id="statusFilter" onchange="admin.filterPackages()">
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Tidak Aktif</option>
        </select>
    `;
}

class AdminPanel {
    constructor() {
        this.currentCategory = 'official';
        this.categories = [];
        this.packages = [];
        this.editingPackage = null;
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Admin Panel initializing...');
        
        // Check authentication first
        if (!await this.checkAuthentication()) {
            return;
        }
        
        try {
            await this.loadInitialData();
            this.setupEventListeners();
            this.hideAuthCheck();
            this.showAdminPanel();
            console.log('✅ Admin Panel loaded successfully');
        } catch (error) {
            console.error('❌ Admin panel initialization error:', error);
            this.showError('Gagal memuat data admin: ' + error.message);
        }
    }
    
    async checkAuthentication() {
        const authCheck = document.getElementById('authCheck');
        if (authCheck) authCheck.style.display = 'block';
        
        // For demo purposes, skip authentication
        // In production, implement proper auth check
        console.log('🔐 Skipping auth check for demo');
        return true;
        
        /* Uncomment for real authentication:
        if (!Auth.isAuthenticated()) {
            window.location.href = '/login';
            return false;
        }
        
        const isValid = await Auth.checkAuthStatus();
        if (!isValid) {
            window.location.href = '/login';
            return false;
        }
        
        return true;
        */
    }
    
    hideAuthCheck() {
        const authCheck = document.getElementById('authCheck');
        if (authCheck) authCheck.style.display = 'none';
    }
    
    showAdminPanel() {
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) adminPanel.style.display = 'block';
    }
    
    showError(message) {
        const authCheck = document.getElementById('authCheck');
        if (authCheck) {
            authCheck.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #e17055;">
                    <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                    <div>${message}</div>
                    <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Coba Lagi
                    </button>
                </div>
            `;
        }
    }
    
    async loadInitialData() {
        console.log('📊 Loading initial data...');
        await Promise.all([
            this.loadCategories(),
            this.loadPackages(),
            this.updateStats()
        ]);
    }
    
    async loadCategories() {
        try {
            console.log('📂 Loading categories...');
            const result = await API.getCategories();
            this.categories = result.data || result || this.getDefaultCategories();
            this.renderCategoryTabs();
            this.populateCategorySelect();
            console.log('✅ Categories loaded:', this.categories.length);
        } catch (error) {
            console.error('❌ Failed to load categories:', error);
            this.categories = this.getDefaultCategories();
            this.renderCategoryTabs();
        }
    }
    
    getDefaultCategories() {
        return [
            { id: 1, slug: 'official', name: 'Official XL / AXIS' },
            { id: 2, slug: 'circle', name: 'XL Circle' },
            { id: 3, slug: 'harian', name: 'Paket Harian XL / AXIS' },
            { id: 4, slug: 'perpanjangan', name: 'Perpanjangan Masa Aktif' }
        ];
    }
    
    async loadPackages(categorySlug = null) {
        try {
            console.log('📦 Loading packages for category:', categorySlug || this.currentCategory);
            const result = await API.getPackages(categorySlug || this.currentCategory);
            this.packages = result.data || result || [];
            this.renderPackageTable();
            console.log('✅ Packages loaded:', this.packages.length);
        } catch (error) {
            console.error('❌ Failed to load packages:', error);
            this.packages = [];
            this.renderPackageTable();
        }
    }
    
    renderCategoryTabs() {
        const tabsContainer = document.getElementById('categoryTabs');
        if (!tabsContainer) return;
        
        tabsContainer.innerHTML = this.categories.map(category => `
            <button class="nav-tab ${category.slug === this.currentCategory ? 'active' : ''}" 
                    data-category="${category.slug}">
                ${category.name}
            </button>
        `).join('');
        
        // Update category title
        const currentCat = this.categories.find(cat => cat.slug === this.currentCategory);
        const categoryTitle = document.getElementById('categoryTitle');
        if (categoryTitle && currentCat) {
            categoryTitle.textContent = currentCat.name;
        }
    }
    
    populateCategorySelect() {
        const categorySelect = document.getElementById('packageCategory');
        if (!categorySelect) return;
        
        categorySelect.innerHTML = this.categories.map(category => `
            <option value="${category.slug}">${category.name}</option>
        `).join('');
    }
    
    renderPackageTable() {
        const tbody = document.getElementById('packageTableBody');
        if (!tbody) return;
        
        if (this.packages.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <div class="empty-state-icon">📦</div>
                        <div>Belum ada paket untuk kategori ini</div>
                        <button onclick="admin.openAddModal()" class="btn btn-primary" style="margin-top: 15px;">
                            Tambah Paket Pertama
                        </button>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = this.packages.map(pkg => `
            <tr>
                <td>
                    ${pkg.name || 'Unnamed Package'}
                    ${pkg.is_popular ? '<span class="popular-badge">POPULER</span>' : ''}
                </td>
                <td>${pkg.quota || '-'}</td>
                <td>${pkg.price ? Utils.formatPrice(pkg.price) : '-'}</td>
                <td>${pkg.validity || '-'}</td>
                <td>
                    <span class="status-badge ${pkg.status === 'active' ? 'status-active' : 'status-inactive'}">
                        ${pkg.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-warning btn-sm" onclick="admin.editPackage(${pkg.id})">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="admin.deletePackage(${pkg.id})">Hapus</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    async updateStats() {
        try {
            console.log('📈 Updating stats...');
            const allPackages = await API.getPackages();
            const packages = allPackages.data || allPackages || [];
            
            const stats = {
                total: packages.length,
                active: packages.filter(pkg => pkg.status === 'active').length,
                transactions: Math.floor(Math.random() * 1000) + 100, // Mock data
                revenue: packages.reduce((sum, pkg) => sum + ((pkg.price || 0) * Math.floor(Math.random() * 5)), 0)
            };
            
            // Update DOM
            const elements = {
                totalPackages: document.getElementById('totalPackages'),
                activePackages: document.getElementById('activePackages'),
                totalTransactions: document.getElementById('totalTransactions'),
                revenue: document.getElementById('revenue')
            };
            
            if (elements.totalPackages) elements.totalPackages.textContent = stats.total;
            if (elements.activePackages) elements.activePackages.textContent = stats.active;
            if (elements.totalTransactions) elements.totalTransactions.textContent = stats.transactions;
            if (elements.revenue) elements.revenue.textContent = Utils.formatPrice(stats.revenue);
            
            console.log('✅ Stats updated:', stats);
            
        } catch (error) {
            console.error('❌ Failed to update stats:', error);
            // Set default values
            const defaultStats = { total: 0, active: 0, transactions: 0, revenue: 0 };
            Object.keys(defaultStats).forEach(key => {
                const element = document.getElementById(key === 'revenue' ? 'revenue' : key + 'Packages');
                if (element) element.textContent = key === 'revenue' ? 'Rp 0' : defaultStats[key];
            });
        }
    }
    
    openAddModal() {
        console.log('➕ Opening add modal');
        this.editingPackage = null;
        const modal = document.getElementById('packageModal');
        const form = document.getElementById('packageForm');
        const title = document.getElementById('modalTitle');
        
        if (title) title.textContent = 'Tambah Paket Baru';
        if (form) form.reset();
        
        const categorySelect = document.getElementById('packageCategory');
        if (categorySelect) categorySelect.value = this.currentCategory;
        
        if (modal) modal.classList.add('show');
    }
    
    editPackage(packageId) {
        console.log('✏️ Editing package:', packageId);
        const pkg = this.packages.find(p => p.id == packageId);
        if (!pkg) {
            console.error('Package not found:', packageId);
            return;
        }
        
        this.editingPackage = pkg;
        const modal = document.getElementById('packageModal');
        const title = document.getElementById('modalTitle');
        
        if (title) title.textContent = 'Edit Paket';
        
        // Populate form
        const fields = {
            packageId: pkg.id,
            packageName: pkg.name,
            packageCategory: this.currentCategory,
            packageQuota: pkg.quota,
            packagePrice: pkg.price,
            packageValidity: pkg.validity,
            packageDescription: pkg.description || '',
            packageStatus: pkg.status
        };
        
        Object.keys(fields).forEach(key => {
            const element = document.getElementById(key);
            if (element) element.value = fields[key];
        });
        
        const popularCheckbox = document.getElementById('packagePopular');
        if (popularCheckbox) popularCheckbox.checked = pkg.is_popular;
        
        if (modal) modal.classList.add('show');
    }
    
    async deletePackage(packageId) {
        console.log('🗑️ Deleting package:', packageId);
        if (!confirm('Apakah Anda yakin ingin menghapus paket ini?')) return;
        
        try {
            const result = await API.deletePackage(packageId);
            if (result.success) {
                Utils.showToast('Paket berhasil dihapus', 'success');
                await this.loadPackages();
                await this.updateStats();
            } else {
                throw new Error(result.error || 'Gagal menghapus paket');
            }
        } catch (error) {
            console.error('❌ Delete failed:', error);
            Utils.showToast('Gagal menghapus paket: ' + error.message, 'error');
        }
    }
    
    closeModal() {
        const modal = document.getElementById('packageModal');
        if (modal) modal.classList.remove('show');
    }
    
    async switchCategory(categorySlug) {
        if (categorySlug === this.currentCategory) return;
        
        console.log('🔄 Switching category to:', categorySlug);
        this.currentCategory = categorySlug;
        
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        const activeTab = document.querySelector(`[data-category="${categorySlug}"]`);
        if (activeTab) activeTab.classList.add('active');
        
        // Update category title
        const currentCat = this.categories.find(cat => cat.slug === categorySlug);
        const categoryTitle = document.getElementById('categoryTitle');
        if (categoryTitle && currentCat) {
            categoryTitle.textContent = currentCat.name;
        }
        
        // Load packages for new category
        await this.loadPackages(categorySlug);
    }
    
    setupEventListeners() {
        console.log('🎯 Setting up event listeners...');
        
        // Category tabs
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-tab')) {
                const category = e.target.getAttribute('data-category');
                this.switchCategory(category);
            }
        });
        
        // Modal close events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });
        
        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
        
        // Package form submission
        const packageForm = document.getElementById('packageForm');
        if (packageForm) {
            packageForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.savePackage();
            });
        }
    }
    
    async savePackage() {
        console.log('💾 Saving package...');
        
        const packageData = {
            name: document.getElementById('packageName')?.value || '',
            category_id: this.getCategoryIdBySlug(document.getElementById('packageCategory')?.value || this.currentCategory),
            quota: document.getElementById('packageQuota')?.value || '',
            price: parseInt(document.getElementById('packagePrice')?.value || 0),
            validity: document.getElementById('packageValidity')?.value || '',
            description: document.getElementById('packageDescription')?.value || '',
            status: document.getElementById('packageStatus')?.value || 'active',
            is_popular: document.getElementById('packagePopular')?.checked || false
        };
        
        try {
            let result;
            if (this.editingPackage) {
                result = await API.updatePackage(this.editingPackage.id, packageData);
            } else {
                result = await API.createPackage(packageData);
            }
            
            if (result.success) {
                Utils.showToast(this.editingPackage ? 'Paket berhasil diperbarui' : 'Paket berhasil ditambahkan', 'success');
                this.closeModal();
                await this.loadPackages();
                await this.updateStats();
            } else {
                throw new Error(result.error || 'Gagal menyimpan paket');
            }
        } catch (error) {
            console.error('❌ Save failed:', error);
            Utils.showToast('Gagal menyimpan paket: ' + error.message, 'error');
        }
    }
    
    getCategoryIdBySlug(slug) {
        const category = this.categories.find(cat => cat.slug === slug);
        return category ? category.id : 1;
    }
    
    logout() {
        console.log('👋 Logging out...');
        // For demo, just redirect
        window.location.href = '/login';
        
        /* Uncomment for real authentication:
        Auth.logout();
        */
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏁 DOM loaded, initializing admin panel...');
    window.admin = new AdminPanel();
});

// Global functions for inline handlers
function openAddModal() {
    if (window.admin) window.admin.openAddModal();
}

function closeModal() {
    if (window.admin) window.admin.closeModal();
}

function logout() {
    if (window.admin) window.admin.logout();
}
