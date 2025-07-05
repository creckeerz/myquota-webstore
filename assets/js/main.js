class MyQuotaApp {
    constructor() {
        this.selectedPackage = null;
        this.currentCategory = 'official';
        this.categories = [];
        this.packages = [];
        this.currentTransaction = null; // Add this for payment system
        
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
    
    // ===== UPDATED PAYMENT SYSTEM =====
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
        
        // Store transaction data
        this.currentTransaction = {
            package_id: this.selectedPackage.id,
            phone_number: phoneNumber,
            amount: this.selectedPackage.price,
            package_name: this.selectedPackage.name || this.selectedPackage.quota,
            package_quota: this.selectedPackage.quota
        };
        
        // Show payment method selection popup
        this.showPaymentMethodModal();
    }
    
    showPaymentMethodModal() {
        const modal = this.createPaymentMethodModal();
        document.body.appendChild(modal);
        
        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
    
    createPaymentMethodModal() {
        const modal = document.createElement('div');
        modal.className = 'payment-modal';
        modal.innerHTML = `
            <div class="payment-modal-content">
                <div class="payment-header">
                    <h3>💳 Pilih Metode Pembayaran</h3>
                    <button class="payment-close" onclick="this.closest('.payment-modal').remove()">&times;</button>
                </div>
                
                <div class="payment-summary">
                    <div class="payment-item">
                        <strong>${this.currentTransaction.package_quota}</strong>
                    </div>
                    <div class="payment-amount">
                        ${this.formatPrice(this.currentTransaction.amount)}
                    </div>
                    <div class="payment-phone">
                        ${this.currentTransaction.phone_number}
                    </div>
                </div>
                
                <div class="payment-methods">
                    <button class="payment-method qris-btn" onclick="app.payWithQRIS()">
                        <div class="payment-icon">📱</div>
                        <div class="payment-info">
                            <div class="payment-name">QRIS</div>
                            <div class="payment-desc">Scan QR Code dengan aplikasi e-wallet</div>
                        </div>
                        <div class="payment-arrow">→</div>
                    </button>
                    
                    <button class="payment-method dana-btn" onclick="app.payWithDANA()">
                        <div class="payment-icon">💸</div>
                        <div class="payment-info">
                            <div class="payment-name">Via DANA</div>
                            <div class="payment-desc">Transfer langsung ke nomor DANA admin</div>
                        </div>
                        <div class="payment-arrow">→</div>
                    </button>
                </div>
                
                <div class="payment-footer">
                    <small>🔒 Transaksi aman dan terenkripsi</small>
                </div>
            </div>
        `;
        
        return modal;
    }
    
    async payWithQRIS() {
        console.log('📱 Processing QRIS payment...');
        this.closePaymentModal();
        
        try {
            // Create transaction record
            const result = await API.createTransaction({
                ...this.currentTransaction,
                payment_method: 'qris'
            });
            
            if (result.success) {
                // Show QRIS modal with QR Code
                this.showQRISModal(result.transaction_id || 'TXN' + Date.now());
            } else {
                throw new Error(result.error || 'Gagal membuat transaksi');
            }
            
        } catch (error) {
            console.error('❌ QRIS payment failed:', error);
            this.showToast('Gagal memproses pembayaran QRIS: ' + error.message, 'error');
        }
    }
    
    async payWithDANA() {
        console.log('💸 Processing DANA payment...');
        this.closePaymentModal();
        
        try {
            // Create transaction record
            const result = await API.createTransaction({
                ...this.currentTransaction,
                payment_method: 'dana'
            });
            
            if (result.success) {
                // Show DANA transfer modal
                this.showDANATransferModal(result.transaction_id || 'TXN' + Date.now());
            } else {
                throw new Error(result.error || 'Gagal membuat transaksi');
            }
            
        } catch (error) {
            console.error('❌ DANA payment failed:', error);
            this.showToast('Gagal memproses pembayaran DANA: ' + error.message, 'error');
        }
    }
    
    showQRISModal(transactionId) {
        // Generate QR Code URL
        const qrData = JSON.stringify({
            merchant: 'MyQuota',
            amount: this.currentTransaction.amount,
            description: this.currentTransaction.package_quota,
            transaction_id: transactionId,
            phone: this.currentTransaction.phone_number
        });
        
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;
        
        const modal = document.createElement('div');
        modal.className = 'payment-modal';
        modal.innerHTML = `
            <div class="payment-modal-content qris-modal">
                <div class="qris-header">
                    <div class="qris-logo">📱</div>
                    <h3>Scan QR Code untuk Pembayaran</h3>
                    <button class="payment-close" onclick="this.closest('.payment-modal').remove()">&times;</button>
                </div>
                
                <div class="qris-content">
                    <div class="qris-amount">${this.formatPrice(this.currentTransaction.amount)}</div>
                    <div class="qris-package">${this.currentTransaction.package_quota}</div>
                    
                    <div class="qr-code-container">
                        <img src="${qrCodeUrl}" alt="QR Code" class="qr-code-image" />
                    </div>
                    
                    <div class="qris-instructions">
                        <h4>Cara Pembayaran:</h4>
                        <ol>
                            <li>Buka aplikasi e-wallet (DANA, OVO, GoPay, ShopeePay)</li>
                            <li>Pilih menu "Scan QR" atau "Bayar"</li>
                            <li>Arahkan kamera ke QR Code di atas</li>
                            <li>Konfirmasi pembayaran di aplikasi</li>
                            <li>Screenshot bukti pembayaran</li>
                        </ol>
                    </div>
                    
                    <div class="transaction-info">
                        <small><strong>ID Transaksi:</strong> ${transactionId}</small><br>
                        <small><strong>Nomor HP:</strong> ${this.currentTransaction.phone_number}</small>
                    </div>
                </div>
                
                <div class="qris-footer">
                    <div class="qris-timer">
                        <span id="qrTimer">15:00</span> tersisa
                    </div>
                    <button class="btn-confirm-payment" onclick="app.confirmPayment('${transactionId}')">
                        ✅ Sudah Bayar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.classList.add('show');
        
        // Start countdown timer
        this.startQRTimer(modal);
    }
    
    showDANATransferModal(transactionId) {
        // Nomor DANA admin - GANTI DENGAN NOMOR DANA ANDA
        const adminDANANumber = '081234567890'; // ⚠️ GANTI INI!
        
        const modal = document.createElement('div');
        modal.className = 'payment-modal';
        modal.innerHTML = `
            <div class="payment-modal-content dana-modal">
                <div class="dana-header">
                    <div class="dana-logo">💸</div>
                    <h3>Transfer via DANA</h3>
                    <button class="payment-close" onclick="this.closest('.payment-modal').remove()">&times;</button>
                </div>
                
                <div class="dana-content">
                    <div class="dana-amount">${this.formatPrice(this.currentTransaction.amount)}</div>
                    <div class="dana-package">${this.currentTransaction.package_quota}</div>
                    
                    <div class="dana-number-container">
                        <div class="dana-label">Nomor DANA Admin:</div>
                        <div class="dana-number" id="danaNumber">${adminDANANumber}</div>
                        <button class="btn-copy-number" onclick="app.copyDANANumber('${adminDANANumber}')">
                            📋 Copy Nomor
                        </button>
                    </div>
                    
                    <div class="dana-instructions">
                        <h4>Langkah-langkah:</h4>
                        <ol>
                            <li>Buka aplikasi DANA</li>
                            <li>Pilih menu "Kirim" atau "Transfer"</li>
                            <li>Masukkan nomor DANA: <strong>${adminDANANumber}</strong></li>
                            <li>Masukkan nominal: <strong>${this.formatPrice(this.currentTransaction.amount)}</strong></li>
                            <li>Catatan: <strong>${this.currentTransaction.package_quota} - ${this.currentTransaction.phone_number}</strong></li>
                            <li>Konfirmasi dan kirim transfer</li>
                            <li>Screenshot bukti transfer</li>
                        </ol>
                    </div>
                    
                    <div class="transaction-info">
                        <small><strong>ID Transaksi:</strong> ${transactionId}</small><br>
                        <small><strong>Nomor HP:</strong> ${this.currentTransaction.phone_number}</small>
                    </div>
                </div>
                
                <div class="dana-footer">
                    <button class="btn-open-dana" onclick="app.openDANAApp('${adminDANANumber}')">
                        🚀 Buka Aplikasi DANA
                    </button>
                    <button class="btn-confirm-payment" onclick="app.confirmPayment('${transactionId}')">
                        ✅ Sudah Transfer
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.classList.add('show');
    }
    
    openDANAApp(danaNumber) {
        // Try to open DANA app with deep link
        const danaUrl = `dana://transfer?number=${danaNumber}&amount=${this.currentTransaction.amount}`;
        
        // Attempt to open DANA app
        window.location.href = danaUrl;
        
        // Fallback: show manual instruction
        setTimeout(() => {
            this.showToast('Jika aplikasi DANA tidak terbuka, buka manual dan transfer ke: ' + danaNumber, 'info');
        }, 1000);
    }
    
    copyDANANumber(number) {
        // Copy to clipboard
        if (navigator.clipboard) {
            navigator.clipboard.writeText(number).then(() => {
                this.showToast('Nomor DANA berhasil disalin!', 'success');
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = number;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('Nomor DANA berhasil disalin!', 'success');
        }
    }
    
    confirmPayment(transactionId) {
        this.closePaymentModal();
        
        // Show confirmation message
        this.showPaymentConfirmation(transactionId);
        
        // Reset selection
        this.resetSelection();
    }
    
    showPaymentConfirmation(transactionId) {
        const modal = document.createElement('div');
        modal.className = 'payment-modal';
        modal.innerHTML = `
            <div class="payment-modal-content success-modal">
                <div class="success-header">
                    <div class="success-icon">✅</div>
                    <h3>Pembayaran Dikonfirmasi</h3>
                </div>
                
                <div class="success-content">
                    <div class="success-package">${this.currentTransaction.package_quota}</div>
                    <div class="success-amount">${this.formatPrice(this.currentTransaction.amount)}</div>
                    <div class="success-phone">${this.currentTransaction.phone_number}</div>
                    
                    <div class="success-message">
                        <p>Terima kasih! Pembayaran Anda sedang diproses.</p>
                        <p><strong>Kuota akan aktif dalam 5-15 menit</strong> setelah pembayaran dikonfirmasi admin.</p>
                    </div>
                    
                    <div class="transaction-id">
                        <small><strong>ID Transaksi:</strong> ${transactionId}</small>
                    </div>
                </div>
                
                <div class="success-actions">
                    <button class="btn-success-ok" onclick="this.closest('.payment-modal').remove()">
                        OK, Mengerti
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.classList.add('show');
        
        // Auto close after 8 seconds
        setTimeout(() => {
            modal.remove();
        }, 8000);
    }
    
    startQRTimer(modal) {
        let timeLeft = 15 * 60; // 15 minutes
        const timerElement = modal.querySelector('#qrTimer');
        
        const countdown = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                clearInterval(countdown);
                modal.querySelector('.qris-content').innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #e17055;">
                        <div style="font-size: 48px; margin-bottom: 20px;">⏰</div>
                        <div>QR Code sudah kedaluwarsa</div>
                        <button onclick="app.payWithQRIS()" style="margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px;">
                            Generate QR Baru
                        </button>
                    </div>
                `;
            }
            
            timeLeft--;
        }, 1000);
    }
    
    closePaymentModal() {
        const modals = document.querySelectorAll('.payment-modal');
        modals.forEach(modal => modal.remove());
    }
    // ===== END PAYMENT SYSTEM =====
    
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
                this.closePaymentModal(); // Add this for escape modal
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
        console.log('- Current Transaction:', this.currentTransaction);
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
