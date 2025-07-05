class Utils {
    static formatPrice(price) {
        if (!price || isNaN(price)) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    }
    
    static formatDate(date) {
        return new Intl.DateTimeFormat('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }
    
    static showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('show');
        }
    }
    
    static hideLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('show');
        }
    }
    
    static showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.className = `toast toast-${type} show`;
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        } else {
            // Fallback to alert if toast element not found
            alert(message);
        }
    }
    
    static validatePhoneNumber(phone) {
        const regex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
        return regex.test(phone);
    }
    
    static validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    static generateTransactionId() {
        return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 5);
    }
    
    static debounce(func, wait) {
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
    
    static copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('Copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('Copied to clipboard!');
        }
    }
    
    static scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    Utils.showToast('Terjadi kesalahan. Silakan coba lagi.', 'error');
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    Utils.showToast('Terjadi kesalahan jaringan.', 'error');
});
