class MyQuotaApp {
    constructor() {
        this.selectedPackage = null;
        this.currentCategory = 'official';
        this.categories = [];
        this.packages = [];
        
        this.init();
    }
    
    async init() {
        console.log('🚀 MyQuota Customer App initializing...');
        
        try {
            // Test API connection first
            console.log('🧪 Testing API connection...');
            const connected = await API.testConnection();
            if (!connected) {
                throw new Error('Failed to connect to API');
            }
            console.log('✅ API connection successful');
            
            // Load categories and initial packages
            await this.loadCategories();
            await this.loadPackages(this.currentCategory);
            
            this.setupEventListeners();
            console.log('✅ MyQuota Customer App loaded successfully');
        } catch (error) {
            console.error('❌ Initialization error:', error);
            this.showError('Gagal memuat data: ' + error.message);
        } finally {
            // Always hide loading
            this.hideLoading('loading');
        }
    }
    
    async loadCategories() {
        try {
            console.log('📂 Loading categories...');
            const result = await API.getCategories();
            this.categories = result.data || result || this.getDefaultCategories();
            this.renderCategoryTabs();
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
            { id: 3, slug: 'harian', name: 'Paket Harian' },
            { id: 4, slug: 'perpanjangan', name: 'Perpanjangan' }
        ];
    }
    
    async loadPackages(categorySlug) {
        try {
            console.log('📦 Loading packages for category:', categorySlug);
            this.showPackageLoading();
            
            const result = await API.getPackages(categorySlug);
            console.log('📋 Raw API Response:', result);
            
            // Handle different response formats
            let packages = [];
            if (result && result.success && result.data) {
                packages = result.data;
            } else if (result && Array.isArray(result)) {
                packages = result;
            } else if (result && result.data && Array.isArray(result.data)) {
                packages = result.data;
            } else {
                console.warn('⚠️ Unexpected API response format:', result);
                packages = [];
            }
            
            this.packages = packages;
            console.log('📊 Final packages array:', this.packages);
            console.log('📊 Package count:', this.packages.length);
            
            // Force render packages
            this.renderPackages();
            
        } catch (error) {
            console.error('❌ Failed to load packages:', error);
            this.showPackageError('Gagal memuat paket: ' + error.message);
        }
    }
    
    renderCategoryTabs() {
        const tabsContainer = document.getElementById('categoryTabs');
        if (!tabsContainer) {
            console.warn('⚠️ Category tabs container not found');
            return;
        }
        
        tabsContainer.innerHTML = this.categories.map(category => `
            <button class="nav-tab ${category.slug === this.currentCategory ? 'active' : ''}" 
                    data-category="${category.slug}">
                ${category.name}
            </button>
        `).join('');
        
        console.log('✅ Category tabs rendered');
    }
    
    showPackageLoading() {
        const packageGrid = document.getElementById('packageGrid');
        if (packageGrid) {
            packageGrid.innerHTML = `
                <div class="loading show">
                    <div class="spinner"></div>
                    <div>Memuat paket...</div>
                </div>
            `;
        }
    }
    
    showPackageError(message) {
        const packageGrid = document.getElementById('packageGrid');
        if (packageGrid) {
            packageGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">⚠️</div>
                    <div>${message}</div>
                    <button onclick="app.debugReload()" 
                            style="margin-top: 15px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Coba Lagi
                    </button>
                </div>
            `;
        }
    }
    
    renderPackages() {
        console.log('🎨 Rendering packages, count:', this.packages ? this.packages.length : 'undefined');
        
        const packageGrid = document.getElementById('packageGrid');
        if (!packageGrid) {
            console.error('❌ Package grid element not found');
            return;
        }
        
        // Clear loading state first
        packageGrid.innerHTML = '';
        
        if (!this.packages || this.packages.length === 0) {
            console.log('📦 No packages to render, showing empty state');
            packageGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📦</div>
                    <div>Belum ada paket untuk kategori: ${this.currentCategory}</div>
                    <div style="font-size: 12px; color: #666; margin-top: 10px;">
                        Tambahkan paket melalui panel admin
                    </div>
                    <button onclick="app.debugReload()" 
                            style="margin-top: 15px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        🔄 Refresh
                    </button>
                </div>
            `;
            return;
        }
        
        console.log('✅ Rendering', this.packages.length, 'packages');
        
        try {
            const packageCards = this.packages.map((pkg, index) => {
                console.log(`📄 Rendering package ${index + 1}:`, pkg);
                
                // Ensure all values are defined
                const id = pkg.id || index;
                const quota = pkg.quota || 'N/A';
                const price = pkg.price || 0;
                const name = pkg.name || pkg.description || 'Paket Kuota';
                const validity = pkg.validity || '30 hari';
                const isPopular = pkg.is_popular || false;
                
                return `
                    <div class="package-card" data-package-id="${id}" onclick="app.selectPackage(${id})">
                        ${isPopular ? '<div class="popular-badge">POPULER</div>' : ''}
                        <div class="package-header">
                            <div class="package-quota">${quota}</div>
                            <div class="package-price">${this.formatPrice(price)}</div>
                        </div>
                        <div class="package-details">${name}</div>
                        <div class="package-validity">Berlaku ${validity}</div>
                    </div>
                `;
            }).join('');
            
            packageGrid.innerHTML = packageCards;
            console.log('✅ Packages rendered successfully in DOM');
            
        } catch (error) {
            console.error('❌ Error rendering packages:', error);
            packageGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">⚠️</div>
                    <div>Error rendering packages: ${error.message}</div>
                </div>
            `;
        }
        
        // Reset selection
        this.resetSelection();
    }
    
    formatPrice(price) {
        if (!price || isNaN(price)) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    }
    
    selectPackage(packageId) {
        console.log('📱 Selecting package:', packageId);
        
        // Remove previous selection
        document.querySelectorAll('.package-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Select new package
        const packageCard = document.querySelector(`[data-package-id="${packageId}"]`);
        if (packageCard) {
            packageCard.classList.add('selected');
            this.selectedPackage = this.packages.find(pkg => pkg.id == packageId);
            
            // Update buy button
            this.updateBuyButton();
            
            // Add visual feedback
            packageCard.style.transform = 'scale(0.98)';
            setTimeout(() => {
                packageCard.style.transform = '';
            }, 100);
        }
    }
    
    updateBuyButton() {
        const buyButton = document.getElementById('buyButton');
        if (!buyButton) return;
        
        if (this.selectedPackage) {
            buyButton.disabled = false;
            buyButton.innerHTML = `<span>Beli ${this.selectedPackage.quota} - ${this.formatPrice(this.selectedPackage.price)}</span>`;
        } else {
            buyButton.disabled = true;
            buyButton.innerHTML = '<span>Pilih Paket Terlebih Dahulu</span>';
        }
    }
    
    async buyPackage() {
        if (!this.selectedPackage) {
            this.showToast('Silakan pilih paket terlebih dahulu', 'error');
            return;
        }
        
        console.log('💳 Processing purchase for:', this.selectedPackage);
        
        // Get phone number
        const phoneNumber = prompt('Masukkan nomor HP (contoh: 081234567890):');
        if (!phoneNumber) return;
        
        if (!this.validatePhoneNumber(phoneNumber)) {
            this.showToast('Nomor HP tidak valid. Gunakan format: 081234567890', 'error');
            return;
        }
        
        this.showLoading('loading');
        
        try {
            const transactionData = {
                package_id: this.selectedPackage.id,
                phone_number: phoneNumber,
                amount: this.selectedPackage.price,
                payment_method: 'manual'
            };
            
            console.log('💳 Sending transaction:', transactionData);
            const result = await API.createTransaction(transactionData);
            
            if (result.success) {
                this.hideLoading('loading');
                this.showSuccessMessage();
                this.resetSelection();
                console.log('✅ Transaction successful:', result);
            } else {
                throw new Error(result.error || 'Transaksi gagal');
            }
            
        } catch (error) {
            this.hideLoading('loading');
            console.error('❌ Transaction failed:', error);
            this.showToast('Transaksi gagal: ' + error.message, 'error');
        }
    }
    
    validatePhoneNumber(phone) {
        // Indonesian phone number validation
        const regex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
        return regex.test(phone);
    }
    
    showSuccessMessage() {
        const successMessage = document.getElementById('successMessage');
        if (successMessage) {
            successMessage.classList.add('show');
            setTimeout(() => {
                successMessage.classList.remove('show');
            }, 5000);
        }
    }
    
    resetSelection() {
        this.selectedPackage = null;
        document.querySelectorAll('.package-card').forEach(card => {
            card.classList.remove('selected');
        });
        this.updateBuyButton();
    }
    
    async switchCategory(categorySlug) {
        if (categorySlug === this.currentCategory) return;
        
        console.log('🔄 Switching category from', this.currentCategory, 'to', categorySlug);
        this.currentCategory = categorySlug;
        this.resetSelection();
        
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        const activeTab = document.querySelector(`[data-category="${categorySlug}"]`);
        if (activeTab) activeTab.classList.add('active');
        
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
        
        // Buy button
        const buyButton = document.getElementById('buyButton');
        if (buyButton) {
            buyButton.addEventListener('click', () => this.buyPackage());
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.resetSelection();
            }
        });
    }
    
    showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('show');
        }
    }
    
    hideLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('show');
        }
    }
    
    showToast(message, type = 'success') {
        // Try to use Utils class if available
        if (typeof Utils !== 'undefined' && Utils.showToast) {
            Utils.showToast(message, type);
        } else {
            // Fallback
            alert(message);
        }
    }
    
    showError(message) {
        const packageGrid = document.getElementById('packageGrid');
        if (packageGrid) {
            packageGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">⚠️</div>
                    <div>${message}</div>
                    <button onclick="location.reload()" 
                            style="margin-top: 15px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Refresh Halaman
                    </button>
                </div>
            `;
        }
    }
    
    // Debug functions
    async debugReload() {
        console.log('🔧 Debug reload triggered');
        await this.loadPackages(this.currentCategory);
    }
    
    showDebugInfo() {
        console.log('🔧 Debug Info:');
        console.log('- Current Category:', this.currentCategory);
        console.log('- Categories:', this.categories);
        console.log('- Packages:', this.packages);
        console.log('- Selected Package:', this.selectedPackage);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏁 DOM loaded, initializing customer app...');
    window.app = new MyQuotaApp();
});

// Global functions for inline onclick handlers
function selectPackage(packageId) {
    if (window.app) {
        window.app.selectPackage(packageId);
    }
}

function buyPackage() {
    if (window.app) {
        window.app.buyPackage();
    }
}

// Debug functions
window.debugApp = {
    showInfo: () => {
        if (window.app) window.app.showDebugInfo();
    },
    reloadPackages: () => {
        if (window.app) window.app.debugReload();
    },
    testAPI: async () => {
        const result = await API.testConnection();
        console.log('🧪 API Test Result:', result);
        return result;
    }
};
