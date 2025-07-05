class AdminPanel {
    constructor() {
        this.currentCategory = 'official';
        this.categories = [];
        this.packages = [];
        this.editingPackage = null;
        this.apiRetryCount = 0;
        this.maxRetries = 3;
        
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
        console.log('🔐 Skipping auth check for demo');
        return true;
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
            const result = await this.safeApiCall(() => API.getCategories());
            this.categories = result.data || result || this.getDefaultCategories();
            this.renderCategoryTabs();
            this.populateCategorySelect();
            console.log('✅ Categories loaded:', this.categories.length);
        } catch (error) {
            console.error('❌ Failed to load categories:', error);
            this.categories = this.getDefaultCategories();
            this.renderCategoryTabs();
            this.populateCategorySelect();
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
            const result = await this.safeApiCall(() => API.getPackages(categorySlug || this.currentCategory));
            this.packages = result.data || result || [];
            this.renderPackageTable();
            console.log('✅ Packages loaded:', this.packages.length);
        } catch (error) {
            console.error('❌ Failed to load packages:', error);
            this.packages = [];
            this.renderPackageTable();
            // Show user-friendly error
            this.showApiError('Gagal memuat paket. Silakan coba lagi.');
        }
    }
    
    // Enhanced API call with retry mechanism
    async safeApiCall(apiFunction, retryCount = 0) {
        try {
            const result = await apiFunction();
            this.apiRetryCount = 0; // Reset retry count on success
            return result;
        } catch (error) {
            console.error(`API call failed (attempt ${retryCount + 1}):`, error);
            
            if (retryCount < this.maxRetries) {
                console.log(`Retrying in ${(retryCount + 1) * 1000}ms...`);
                await this.delay((retryCount + 1) * 1000);
                return this.safeApiCall(apiFunction, retryCount + 1);
            }
            
            throw error;
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    showApiError(message) {
        Utils.showToast(message, 'error');
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
            const result = await this.safeApiCall(() => API.getPackages());
            const packages = result.data || result || [];
            
            const stats = {
                total: packages.length,
                active: packages.filter(pkg => pkg.status === 'active').length,
                transactions: Math.floor(Math.random() * 1000) + 100,
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
                const element = document.getElementById(key === 'revenue' ? 'revenue' : key === 'transactions' ? 'totalTransactions' : key + 'Packages');
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
            Utils.showToast('Paket tidak ditemukan', 'error');
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
            const result = await this.safeApiCall(() => API.deletePackage(packageId));
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
        
        // Validate form data
        const packageName = document.getElementById('packageName')?.value?.trim();
        const packagePrice = document.getElementById('packagePrice')?.value;
        
        if (!packageName) {
            Utils.showToast('Nama paket wajib diisi', 'error');
            return;
        }
        
        if (!packagePrice || isNaN(packagePrice) || parseInt(packagePrice) <= 0) {
            Utils.showToast('Harga paket harus berupa angka yang valid', 'error');
            return;
        }
        
        const packageData = {
            name: packageName,
            category_id: this.getCategoryIdBySlug(document.getElementById('packageCategory')?.value || this.currentCategory),
            quota: document.getElementById('packageQuota')?.value?.trim() || '',
            price: parseInt(packagePrice),
            validity: document.getElementById('packageValidity')?.value?.trim() || '',
            description: document.getElementById('packageDescription')?.value?.trim() || '',
            status: document.getElementById('packageStatus')?.value || 'active',
            is_popular: document.getElementById('packagePopular')?.checked || false
        };
        
        console.log('Package data to save:', packageData);
        
        try {
            // Show loading state
            const submitBtn = document.querySelector('#packageForm button[type="submit"]');
            const originalText = submitBtn?.textContent;
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Menyimpan...';
            }
            
            let result;
            if (this.editingPackage) {
                result = await this.safeApiCall(() => API.updatePackage(this.editingPackage.id, packageData));
            } else {
                result = await this.safeApiCall(() => API.createPackage(packageData));
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
            let errorMessage = 'Gagal menyimpan paket';
            
            if (error.message.includes('Network')) {
                errorMessage = 'Koneksi bermasalah. Silakan periksa koneksi internet Anda.';
            } else if (error.message.includes('not found')) {
                errorMessage = 'Endpoint API tidak ditemukan. Silakan hubungi administrator.';
            } else if (error.message.includes('302')) {
                errorMessage = 'Terjadi pengalihan yang tidak diharapkan. Silakan coba lagi.';
            }
            
            Utils.showToast(errorMessage + ': ' + error.message, 'error');
        } finally {
            // Restore button state
            const submitBtn = document.querySelector('#packageForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText || 'Simpan';
            }
        }
    }
    
    getCategoryIdBySlug(slug) {
        const category = this.categories.find(cat => cat.slug === slug);
        return category ? category.id : 1;
    }
    
    logout() {
        console.log('👋 Logging out...');
        window.location.href = '/login';
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
