class MyQuotaApp {
    constructor() {
        this.selectedPackage = null;
        this.currentCategory = 'official';
        this.categories = [];
        this.packages = [];
        this.currentTransaction = null;
        
        this.init();
    }
    
    // ... (kode sebelumnya sama)
    
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
            package_name: this.selectedPackage.name || this.selectedPackage.quota
        };
        
        // Show payment method selection
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
                        <strong>${this.currentTransaction.package_name}</strong>
                    </div>
                    <div class="payment-amount">
                        ${this.formatPrice(this.currentTransaction.amount)}
                    </div>
                    <div class="payment-phone">
                        ${this.currentTransaction.phone_number}
                    </div>
                </div>
                
                <div class="payment-methods">
                    <button class="payment-method dana-btn" onclick="app.payWithDANA()">
                        <div class="payment-icon">💸</div>
                        <div class="payment-info">
                            <div class="payment-name">DANA</div>
                            <div class="payment-desc">Bayar langsung via aplikasi DANA</div>
                        </div>
                        <div class="payment-arrow">→</div>
                    </button>
                    
                    <button class="payment-method qris-btn" onclick="app.payWithQRIS()">
                        <div class="payment-icon">📱</div>
                        <div class="payment-info">
                            <div class="payment-name">QRIS</div>
                            <div class="payment-desc">Scan QR Code dengan aplikasi apapun</div>
                        </div>
                        <div class="payment-arrow">→</div>
                    </button>
                </div>
                
                <div class="payment-footer">
                    <small>Transaksi aman dan terenkripsi</small>
                </div>
            </div>
        `;
        
        return modal;
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
                // Generate DANA deep link
                const danaUrl = this.generateDANAUrl(
                    this.currentTransaction.amount,
                    this.currentTransaction.package_name,
                    result.transaction_id
                );
                
                // Show DANA redirect modal
                this.showDANARedirectModal(danaUrl);
                
            } else {
                throw new Error(result.error || 'Gagal membuat transaksi');
            }
            
        } catch (error) {
            console.error('❌ DANA payment failed:', error);
            this.showToast('Gagal memproses pembayaran DANA: ' + error.message, 'error');
        }
    }
    
    generateDANAUrl(amount, description, transactionId) {
        // DANA deep link format (adjust sesuai dengan DANA API yang tersedia)
        const baseUrl = 'dana://pay';
        const params = new URLSearchParams({
            amount: amount,
            description: description,
            reference: transactionId,
            callback_url: window.location.origin + '/payment-callback'
        });
        
        return `${baseUrl}?${params.toString()}`;
    }
    
    showDANARedirectModal(danaUrl) {
        const modal = document.createElement('div');
        modal.className = 'payment-modal';
        modal.innerHTML = `
            <div class="payment-modal-content dana-redirect">
                <div class="dana-header">
                    <div class="dana-logo">💸</div>
                    <h3>Redirect ke DANA</h3>
                </div>
                
                <div class="dana-content">
                    <p>Anda akan diarahkan ke aplikasi DANA untuk menyelesaikan pembayaran.</p>
                    <div class="dana-amount">${this.formatPrice(this.currentTransaction.amount)}</div>
                </div>
                
                <div class="dana-actions">
                    <button class="btn-dana-open" onclick="window.open('${danaUrl}', '_blank')">
                        🚀 Buka DANA
                    </button>
                    <button class="btn-dana-manual" onclick="app.showManualDANA()">
                        📋 Cara Manual
                    </button>
                </div>
                
                <div class="dana-footer">
                    <small>Jika aplikasi DANA tidak terbuka otomatis, silakan buka manual</small>
                </div>
                
                <button class="payment-close" onclick="this.closest('.payment-modal').remove()">&times;</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.classList.add('show');
        
        // Auto redirect after 2 seconds
        setTimeout(() => {
            window.open(danaUrl, '_blank');
        }, 2000);
        
        // Auto close modal after payment
        setTimeout(() => {
            modal.remove();
            this.showPaymentSuccess();
        }, 10000);
    }
    
    showManualDANA() {
        alert(`Cara pembayaran manual DANA:
        
1. Buka aplikasi DANA
2. Pilih "Transfer" atau "Bayar"
3. Masukkan nomor tujuan: 081234567890
4. Nominal: ${this.formatPrice(this.currentTransaction.amount)}
5. Catatan: ${this.currentTransaction.package_name}
6. Konfirmasi pembayaran`);
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
                // Generate QR Code URL
                const qrCodeUrl = this.generateQRISUrl(
                    this.currentTransaction.amount,
                    this.currentTransaction.package_name,
                    result.transaction_id
                );
                
                // Show QRIS modal
                this.showQRISModal(qrCodeUrl);
                
            } else {
                throw new Error(result.error || 'Gagal membuat transaksi');
            }
            
        } catch (error) {
            console.error('❌ QRIS payment failed:', error);
            this.showToast('Gagal memproses pembayaran QRIS: ' + error.message, 'error');
        }
    }
    
    generateQRISUrl(amount, description, transactionId) {
        // Generate QR Code menggunakan service online
        // Ini contoh menggunakan QR Server API
        const qrData = JSON.stringify({
            merchant: 'MyQuota',
            amount: amount,
            description: description,
            transaction_id: transactionId,
            timestamp: Date.now()
        });
        
        // Encode untuk QR Code
        const encodedData = encodeURIComponent(qrData);
        
        // Generate QR Code image URL
        return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedData}`;
    }
    
    showQRISModal(qrCodeUrl) {
        const modal = document.createElement('div');
        modal.className = 'payment-modal';
        modal.innerHTML = `
            <div class="payment-modal-content qris-modal">
                <div class="qris-header">
                    <div class="qris-logo">📱</div>
                    <h3>Scan QR Code</h3>
                    <button class="payment-close" onclick="this.closest('.payment-modal').remove()">&times;</button>
                </div>
                
                <div class="qris-content">
                    <div class="qris-amount">${this.formatPrice(this.currentTransaction.amount)}</div>
                    <div class="qris-package">${this.currentTransaction.package_name}</div>
                    
                    <div class="qr-code-container">
                        <img src="${qrCodeUrl}" alt="QR Code" class="qr-code-image" />
                        <div class="qr-loading" style="display: none;">
                            <div class="spinner"></div>
                            <div>Generating QR Code...</div>
                        </div>
                    </div>
                    
                    <div class="qris-instructions">
                        <h4>Cara Pembayaran:</h4>
                        <ol>
                            <li>Buka aplikasi e-wallet (DANA, OVO, GoPay, dll)</li>
                            <li>Pilih "Scan QR" atau "Bayar"</li>
                            <li>Arahkan kamera ke QR Code di atas</li>
                            <li>Konfirmasi pembayaran</li>
                        </ol>
                    </div>
                </div>
                
                <div class="qris-footer">
                    <div class="qris-timer">
                        <span id="qrTimer">15:00</span> tersisa
                    </div>
                    <button class="btn-refresh-qr" onclick="app.refreshQRCode()">
                        🔄 Refresh QR
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.classList.add('show');
        
        // Handle QR code loading
        const qrImage = modal.querySelector('.qr-code-image');
        const qrLoading = modal.querySelector('.qr-loading');
        
        qrImage.onload = () => {
            qrLoading.style.display = 'none';
            qrImage.style.display = 'block';
        };
        
        qrImage.onerror = () => {
            qrLoading.innerHTML = `
                <div style="color: #e17055;">❌ Gagal memuat QR Code</div>
                <button onclick="app.refreshQRCode()" style="margin-top: 10px; padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 5px;">
                    Coba Lagi
                </button>
            `;
        };
        
        // Start countdown timer
        this.startQRTimer(modal);
        
        // Auto close and show success after 30 seconds (simulate payment)
        setTimeout(() => {
            modal.remove();
            this.showPaymentSuccess();
        }, 30000);
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
    
    refreshQRCode() {
        // Refresh QR code
        this.closePaymentModal();
        this.payWithQRIS();
    }
    
    closePaymentModal() {
        const modals = document.querySelectorAll('.payment-modal');
        modals.forEach(modal => modal.remove());
    }
    
    showPaymentSuccess() {
        this.showSuccessMessage();
        this.resetSelection();
        
        // Show detailed success modal
        const modal = document.createElement('div');
        modal.className = 'payment-modal';
        modal.innerHTML = `
            <div class="payment-modal-content success-modal">
                <div class="success-header">
                    <div class="success-icon">✅</div>
                    <h3>Pembayaran Berhasil!</h3>
                </div>
                
                <div class="success-content">
                    <div class="success-package">${this.currentTransaction.package_name}</div>
                    <div class="success-amount">${this.formatPrice(this.currentTransaction.amount)}</div>
                    <div class="success-phone">${this.currentTransaction.phone_number}</div>
                    
                    <div class="success-message">
                        Kuota akan aktif dalam 5-10 menit
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
        
        // Auto close after 5 seconds
        setTimeout(() => {
            modal.remove();
        }, 5000);
    }
    
    // ... (kode lainnya sama)
}
