// Configuration file for MyQuota WebStore
const CONFIG = {
    // Google Sheets Configuration
    SPREADSHEET_ID: '17nzzFZwcFDUu-ywZGrp-d7_jIuohPv4N1dB_qpCls6Y', // Ganti dengan ID Google Spreadsheet Anda
    API_KEY: 'AIzaSyBiRSNnRLRYO5sUIaQdqAYLreSM2nQoG1E', // Ganti dengan API Key Google Sheets Anda
    
    // Spreadsheet ranges for each sheet
    SHEETS: {
        CATEGORIES: 'Categories!A:G',
        PACKAGES: 'Packages!A:J', 
        TRANSACTIONS: 'Transactions!A:H',
        SETTINGS: 'Settings!A:C'
    },
    
    // Payment Configuration
    PAYMENT: {
        QRIS_IMAGE_URL: 'https://your-domain.com/qris-code.png', // URL gambar QRIS
        DANA_API_URL: 'https://link.dana.id/qr/YOUR_DANA_QR_CODE', // Link DANA QR
        DANA_PHONE: '081234567890', // Nomor telepon DANA admin
        ADMIN_WHATSAPP: '6281234567890', // Nomor WhatsApp admin untuk konfirmasi
    },
    
    // App Settings
    APP: {
        NAME: 'MyQuota',
        VERSION: '1.0.0',
        DEBUG: true, // Set false untuk production
        AUTO_REFRESH: 30000, // Auto refresh data setiap 30 detik
        CACHE_DURATION: 300000, // Cache duration 5 menit
    },
    
    // API Endpoints
    API: {
        BASE_URL: 'https://sheets.googleapis.com/v4/spreadsheets',
        TIMEOUT: 10000, // 10 seconds timeout
    },
    
    // UI Configuration
    UI: {
        ITEMS_PER_PAGE: 20,
        ANIMATION_DURATION: 300,
        TOAST_DURATION: 3000,
        SEARCH_DEBOUNCE: 500,
    },
    
    // Validation Rules
    VALIDATION: {
        PHONE_MIN_LENGTH: 10,
        PHONE_MAX_LENGTH: 13,
        MIN_TRANSACTION: 5000,
        MAX_TRANSACTION: 1000000,
    },
    
    // Feature Flags
    FEATURES: {
        ENABLE_SEARCH: true,
        ENABLE_FILTER: true,
        ENABLE_SORT: true,
        ENABLE_CATEGORIES: true,
        ENABLE_PWA: true,
        ENABLE_OFFLINE: false,
    }
};

// Google Sheets API Helper Functions
const SheetsAPI = {
    // Build API URL for reading data
    buildReadURL: (range) => {
        return `${CONFIG.API.BASE_URL}/${CONFIG.SPREADSHEET_ID}/values/${range}?key=${CONFIG.API_KEY}`;
    },
    
    // Build API URL for writing data
    buildWriteURL: (range) => {
        return `${CONFIG.API.BASE_URL}/${CONFIG.SPREADSHEET_ID}/values/${range}?valueInputOption=USER_ENTERED&key=${CONFIG.API_KEY}`;
    },
    
    // Read data from spreadsheet
    async readData(range) {
        try {
            const response = await fetch(this.buildReadURL(range), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.values || [];
        } catch (error) {
            console.error('Error reading data from sheets:', error);
            throw error;
        }
    },
    
    // Write data to spreadsheet
    async writeData(range, values) {
        try {
            const response = await fetch(this.buildWriteURL(range), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    values: values
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error writing data to sheets:', error);
            throw error;
        }
    },
    
    // Append data to spreadsheet
    async appendData(range, values) {
        try {
            const appendURL = `${CONFIG.API.BASE_URL}/${CONFIG.SPREADSHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED&key=${CONFIG.API_KEY}`;
            
            const response = await fetch(appendURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    values: [values]
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error appending data to sheets:', error);
            throw error;
        }
    }
};

// Cache Management
const CacheManager = {
    // Set cache with expiration
    set(key, data, ttl = CONFIG.APP.CACHE_DURATION) {
        const expiration = Date.now() + ttl;
        const cacheData = {
            data: data,
            expiration: expiration
        };
        
        try {
            localStorage.setItem(`myquota_${key}`, JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Unable to set cache:', error);
        }
    },
    
    // Get cache if not expired
    get(key) {
        try {
            const cached = localStorage.getItem(`myquota_${key}`);
            if (!cached) return null;
            
            const cacheData = JSON.parse(cached);
            
            if (Date.now() > cacheData.expiration) {
                this.remove(key);
                return null;
            }
            
            return cacheData.data;
        } catch (error) {
            console.warn('Unable to get cache:', error);
            return null;
        }
    },
    
    // Remove cache
    remove(key) {
        try {
            localStorage.removeItem(`myquota_${key}`);
        } catch (error) {
            console.warn('Unable to remove cache:', error);
        }
    },
    
    // Clear all cache
    clear() {
        try {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('myquota_')) {
                    localStorage.removeItem(key);
                }
