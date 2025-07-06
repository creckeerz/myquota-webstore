// Updated Configuration untuk menggunakan Google Apps Script Backend
const CONFIG = {
    // Google Apps Script Web App URL (akan didapat setelah deploy)
    // Format: https://script.google.com/macros/s/{SCRIPT_ID}/exec
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbx_6e_bO5NXW6efuBDF-qeV1bP3lqwj2cz0sk0EI8R3IOEH-ys1lrTfYUxu78pp0FQmOQ/exec',
    
    // Timeout untuk API calls
    API_TIMEOUT: 10000,
    
    // Cache settings
    CACHE_DURATION: 300000, // 5 minutes
    
    // App settings
    APP: {
        NAME: 'MyQuota',
        VERSION: '1.0.0',
        DEBUG: false, // Set true untuk development
    }
};

/**
 * API Helper class untuk komunikasi dengan Google Apps Script
 */
class AppsScriptAPI {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.cache = new Map();
    }
    
    /**
     * Generic method untuk memanggil Apps Script endpoint
     */
    async call(action, method = 'GET', data = null, useCache = false) {
        try {
            // Check cache first
            const cacheKey = `${action}_${JSON.stringify(data)}`;
            if (useCache && this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < CONFIG.CACHE_DURATION) {
                    return cached.data;
                }
            }
            
            const url = new URL(this.baseUrl);
            url.searchParams.append('action', action);
            url.searchParams.append('method', method);
            
            if (data) {
                url.searchParams.append('data', JSON.stringify(data));
            }
            
            const requestOptions = {
                method: 'GET', // Apps Script always uses GET for doGet
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            
            // Add timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);
            requestOptions.signal = controller.signal;
            
            const response = await fetch(url.toString(), requestOptions);
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
// Updated Configuration untuk menggunakan Google Apps Script Backend
const CONFIG = {
    // Google Apps Script Web App URL (akan didapat setelah deploy)
    // Format: https://script.google.com/macros/s/{SCRIPT_ID}/exec
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbx_6e_bO5NXW6efuBDF-qeV1bP3lqwj2cz0sk0EI8R3IOEH-ys1lrTfYUxu78pp0FQmOQ/exec',
    
    // Timeout untuk API calls
    API_TIMEOUT: 10000,
    
    // Cache settings
    CACHE_DURATION: 300000, // 5 minutes
    
    // App settings
    APP: {
        NAME: 'MyQuota',
        VERSION: '1.0.0',
        DEBUG: false, // Set true untuk development
    },
    
    // Payment Configuration
    PAYMENT: {
        QRIS_IMAGE_URL: 'https://your-domain.com/qris-code.png',
        DANA_API_URL: 'https://link.dana.id/qr/YOUR_DANA_QR_CODE',
        DANA_PHONE: '081234567890',
        ADMIN_WHATSAPP: '6281234567890',
    }
};

/**
 * API Helper class untuk komunikasi dengan Google Apps Script
 */
class AppsScriptAPI {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.cache = new Map();
    }
    
    /**
     * Generic method untuk memanggil Apps Script endpoint
     */
    async call(action, method = 'GET', data = null, useCache = false) {
        try {
            // Check cache first
            const cacheKey = `${action}_${JSON.stringify(data)}`;
            if (useCache && this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < CONFIG.CACHE_DURATION) {
                    return cached.data;
                }
            }
            
            const url = new URL(this.baseUrl);
            url.searchParams.append('action', action);
            url.searchParams.append('method', method);
            
            if (data) {
                url.searchParams.append('data', JSON.stringify(data));
            }
            
            const requestOptions = {
                method: 'GET', // Apps Script always uses GET for doGet
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            
            // Add timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);
            requestOptions.signal = controller.signal;
            
            const response = await fetch(url.toString(), requestOptions);
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'API call failed');
            }
            
            // Cache successful results
            if (useCache) {
                this.cache.set(cacheKey, {
                    data: result,
                    timestamp: Date.now()
                });
            }
            
            return result;
            
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    // Specific API methods
    
    // Categories
    async getCategories(useCache = true) {
        return this.call('getCategories', 'GET', null, useCache);
    }
    
    async addCategory(categoryData) {
        return this.call('addCategory', 'POST', categoryData);
    }
    
    async updateCategory(id, categoryData) {
        return this.call('updateCategory', 'PUT', categoryData, false, { id });
    }
    
    async deleteCategory(id) {
        return this.call('deleteCategory', 'DELETE', null, false, { id });
    }
    
    // Packages
    async getPackages(useCache = true) {
        return this.call('getPackages', 'GET', null, useCache);
    }
    
    async addPackage(packageData) {
        return this.call('addPackage', 'POST', packageData);
    }
    
    async updatePackage(id, packageData) {
        return this.call('updatePackage', 'PUT', packageData, false, { id });
    }
    
    async deletePackage(id) {
        return this.call('deletePackage', 'DELETE', null, false, { id });
    }
    
    // Transactions
    async getTransactions(useCache = false) {
        return this.call('getTransactions', 'GET', null, useCache);
    }
    
    async addTransaction(transactionData) {
        return this.call('addTransaction', 'POST', transactionData);
    }
    
    async updateTransaction(id, transactionData) {
        return this.call('updateTransaction', 'PUT', transactionData, false, { id });
    }
    
    // Settings
    async getSettings(useCache = true) {
        return this.call('getSettings', 'GET', null, useCache);
    }
    
    async updateSettings(settingsData) {
        return this.call('updateSettings', 'PUT', settingsData);
    }
    
    // Admin
    async adminLogin(credentials) {
        return this.call('adminLogin', 'POST', credentials);
    }
    
    // Statistics
    async getStats(useCache = false) {
        return this.call('getStats', 'GET', null, useCache);
    }
    
    // Helper method with ID parameter
    async callWithId(action, method, id, data = null) {
        const url = new URL(this.baseUrl);
        url.searchParams.append('action', action);
        url.searchParams.append('method', method);
        url.searchParams.append('id', id);
        
        if (data) {
            url.searchParams.append('data', JSON.stringify(data));
        }
        
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'API call failed');
        }
        
        return result;
    }
    
    // Clear cache
    clearCache() {
        this.cache.clear();
    }
    
    // Get cache stats
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Create global API instance
const API = new AppsScriptAPI(CONFIG.APPS_SCRIPT_URL);

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, AppsScriptAPI, API };
}

// Global error handler untuk API calls
window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.message && event.reason.message.includes('API')) {
        console.error('Unhandled API Error:', event.reason);
        
        // Show user-friendly error message
        if (typeof showToast === 'function') {
            showToast('Terjadi kesalahan koneksi. Silakan coba lagi.', 'error');
        }
        
        event.preventDefault();
    }
});

// Utility functions for API integration
const APIUtils = {
    // Retry failed API calls
    async retry(apiCall, maxRetries = 3, delay = 1000) {
        let lastError;
        
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await apiCall();
            } catch (error) {
                lastError = error;
                
                if (i < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
                }
            }
        }
        
        throw lastError;
    },
    
    // Batch API calls
    async batch(apiCalls) {
        const results = await Promise.allSettled(apiCalls);
        
        return results.map((result, index) => ({
            index,
            success: result.status === 'fulfilled',
            data: result.status === 'fulfilled' ? result.value : null,
            error: result.status === 'rejected' ? result.reason : null
        }));
    },
    
    // Format error messages for users
    formatError(error) {
        if (error.message.includes('timeout')) {
            return 'Koneksi timeout. Silakan coba lagi.';
        } else if (error.message.includes('network')) {
            return 'Tidak ada koneksi internet. Periksa koneksi Anda.';
        } else if (error.message.includes('CORS')) {
            return 'Terjadi kesalahan konfigurasi. Hubungi administrator.';
        } else {
            return 'Terjadi kesalahan. Silakan coba lagi.';
        }
    },
    
    // Check if API is available
    async healthCheck() {
        try {
            const response = await fetch(CONFIG.APPS_SCRIPT_URL + '?action=healthCheck');
            return response.ok;
        } catch (error) {
            return false;
        }
    }
};

// Auto-detect if Apps Script URL is configured
if (CONFIG.APPS_SCRIPT_URL.includes('https://script.google.com/macros/s/AKfycbx_6e_bO5NXW6efuBDF-qeV1bP3lqwj2cz0sk0EI8R3IOEH-ys1lrTfYUxu78pp0FQmOQ/exec')) {
    console.warn('⚠️ Apps Script URL belum dikonfigurasi! Silakan update CONFIG.APPS_SCRIPT_URL');
    
    if (typeof showToast === 'function') {
        showToast('Konfigurasi backend belum lengkap. Hubungi administrator.', 'warning');
    }
}
