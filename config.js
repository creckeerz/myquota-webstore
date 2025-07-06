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




// Configuration file for MyQuota WebStore
const CONFIG = {
    // Google Sheets Configuration
    SPREADSHEET_ID: '17nzzFZwcFDUu-ywZGrp-d7_jIuohPv4N1dB_qpCls6Y',
    API_KEY: 'AIzaSyBiRSNnRLRYO5sUIaQdqAYLreSM2nQoG1E',
    
    // Spreadsheet ranges for each sheet
    SHEETS: {
        CATEGORIES: 'Categories!A:G',
        PACKAGES: 'Packages!A:J', 
        TRANSACTIONS: 'Transactions!A:H',
        SETTINGS: 'Settings!A:C'
    },
    
    // Payment Configuration
    PAYMENT: {
        QRIS_IMAGE_URL: 'https://your-domain.com/qris-code.png',
        DANA_API_URL: 'https://link.dana.id/qr/YOUR_DANA_QR_CODE',
        DANA_PHONE: '081234567890',
        ADMIN_WHATSAPP: '6281234567890',
    },
    
    // App Settings
    APP: {
        NAME: 'MyQuota',
        VERSION: '1.0.0',
        DEBUG: true,
        AUTO_REFRESH: 30000,
        CACHE_DURATION: 300000,
    },
    
    // API Endpoints
    API: {
        BASE_URL: 'https://sheets.googleapis.com/v4/spreadsheets',
        TIMEOUT: 10000,
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
            });
        } catch (error) {
            console.warn('Unable to clear cache:', error);
        }
    }
};

// Data Service for Google Sheets integration
const DataService = {
    // Get Categories
    async getCategories() {
        try {
            // Check cache first
            const cached = CacheManager.get('categories');
            if (cached) {
                console.log('📋 Categories loaded from cache');
                return cached;
            }
            
            console.log('🔄 Loading categories from Google Sheets...');
            const rawData = await SheetsAPI.readData(CONFIG.SHEETS.CATEGORIES);
            
            if (rawData.length <= 1) {
                // Return demo data if no data in sheets
                const demoData = [
                    { id: 1, name: 'Official XL / AXIS', slug: 'official-xl-axis', description: 'Paket resmi XL dan AXIS', icon: 'fas fa-star', status: 'active' },
                    { id: 2, name: 'XL Circle', slug: 'xl-circle', description: 'Paket premium XL Circle', icon: 'fas fa-users', status: 'active' },
                    { id: 3, name: 'Paket Harian', slug: 'paket-harian', description: 'Paket internet harian', icon: 'fas fa-calendar-day', status: 'active' },
                    { id: 4, name: 'Perpanjangan Masa Aktif', slug: 'perpanjangan-masa-aktif', description: 'Perpanjangan masa aktif kartu', icon: 'fas fa-clock', status: 'active' }
                ];
                CacheManager.set('categories', demoData);
                return demoData;
            }
            
            // Convert raw data to objects (skip header row)
            const categories = rawData.slice(1).map(row => ({
                id: parseInt(row[0]) || 0,
                name: row[1] || '',
                slug: row[2] || '',
                description: row[3] || '',
                icon: row[4] || 'fas fa-star',
                status: row[5] || 'active'
            })).filter(cat => cat.id > 0);
            
            // Cache the result
            CacheManager.set('categories', categories);
            console.log('✅ Categories loaded:', categories.length);
            return categories;
            
        } catch (error) {
            console.error('❌ Error loading categories:', error);
            
            // Return demo data on error
            const demoData = [
                { id: 1, name: 'Official XL / AXIS', slug: 'official-xl-axis', description: 'Paket resmi XL dan AXIS', icon: 'fas fa-star', status: 'active' },
                { id: 2, name: 'XL Circle', slug: 'xl-circle', description: 'Paket premium XL Circle', icon: 'fas fa-users', status: 'active' }
            ];
            return demoData;
        }
    },
    
    // Get Packages
    async getPackages() {
        try {
            // Check cache first
            const cached = CacheManager.get('packages');
            if (cached) {
                console.log('📋 Packages loaded from cache');
                return cached;
            }
            
            console.log('🔄 Loading packages from Google Sheets...');
            const rawData = await SheetsAPI.readData(CONFIG.SHEETS.PACKAGES);
            
            if (rawData.length <= 1) {
                // Return demo data if no data in sheets
                const demoData = [
                    { id: 1, category_id: 1, name: 'XL Combo 10GB', quota: '10GB', price: 50000, validity: '30 hari', description: 'Paket internet 10GB dengan bonus telpon dan SMS unlimited', is_popular: true, status: 'active' },
                    { id: 2, category_id: 1, name: 'AXIS Bronet 5GB', quota: '5GB', price: 25000, validity: '30 hari', description: 'Paket internet 5GB untuk browsing dan media sosial', is_popular: false, status: 'active' },
                    { id: 3, category_id: 2, name: 'XL Circle 15GB', quota: '15GB', price: 75000, validity: '30 hari', description: 'Paket premium XL Circle dengan kuota besar', is_popular: true, status: 'active' }
                ];
                CacheManager.set('packages', demoData);
                return demoData;
            }
            
            // Convert raw data to objects (skip header row)
            const packages = rawData.slice(1).map(row => ({
                id: parseInt(row[0]) || 0,
                category_id: parseInt(row[1]) || 1,
                name: row[2] || '',
                quota: row[3] || '',
                price: parseInt(row[4]) || 0,
                validity: row[5] || '',
                description: row[6] || '',
                is_popular: row[7] === 'TRUE' || row[7] === true || row[7] === '1',
                status: row[8] || 'active'
            })).filter(pkg => pkg.id > 0);
            
            // Cache the result
            CacheManager.set('packages', packages);
            console.log('✅ Packages loaded:', packages.length);
            return packages;
            
        } catch (error) {
            console.error('❌ Error loading packages:', error);
            
            // Return demo data on error
            const demoData = [
                { id: 1, category_id: 1, name: 'XL Combo 10GB', quota: '10GB', price: 50000, validity: '30 hari', description: 'Paket internet 10GB', is_popular: true, status: 'active' }
            ];
            return demoData;
        }
    },
    
    // Get Transactions
    async getTransactions() {
        try {
            // Check cache first
            const cached = CacheManager.get('transactions');
            if (cached) {
                console.log('📋 Transactions loaded from cache');
                return cached;
            }
            
            console.log('🔄 Loading transactions from Google Sheets...');
            const rawData = await SheetsAPI.readData(CONFIG.SHEETS.TRANSACTIONS);
            
            if (rawData.length <= 1) {
                // Return demo data if no data in sheets
                const demoData = [
                    { id: 'TXN_001', package_id: 1, phone_number: '081234567890', amount: 50000, payment_method: 'qris', status: 'pending', created_at: new Date().toISOString() },
                    { id: 'TXN_002', package_id: 2, phone_number: '081987654321', amount: 25000, payment_method: 'dana', status: 'completed', created_at: new Date(Date.now() - 86400000).toISOString() }
                ];
                CacheManager.set('transactions', demoData);
                return demoData;
            }
            
            // Convert raw data to objects (skip header row)
            const transactions = rawData.slice(1).map(row => ({
                id: row[0] || '',
                package_id: parseInt(row[1]) || 0,
                phone_number: row[2] || '',
                amount: parseInt(row[3]) || 0,
                payment_method: row[4] || '',
                status: row[5] || 'pending',
                created_at: row[6] || new Date().toISOString()
            })).filter(txn => txn.id);
            
            // Cache the result  
            CacheManager.set('transactions', transactions);
            console.log('✅ Transactions loaded:', transactions.length);
            return transactions;
            
        } catch (error) {
            console.error('❌ Error loading transactions:', error);
            return [];
        }
    },
    
    // Get Settings
    async getSettings() {
        try {
            console.log('🔄 Loading settings from Google Sheets...');
            const rawData = await SheetsAPI.readData(CONFIG.SHEETS.SETTINGS);
            
            const defaultSettings = {
                app_name: 'MyQuota',
                maintenance_mode: false,
                admin_whatsapp: '6281234567890',
                qris_image_url: CONFIG.PAYMENT.QRIS_IMAGE_URL,
                dana_link: CONFIG.PAYMENT.DANA_API_URL,
                dana_phone: CONFIG.PAYMENT.DANA_PHONE
            };
            
            if (rawData.length <= 1) {
                return defaultSettings;
            }
            
            // Convert raw data to settings object (skip header row)
            const settings = { ...defaultSettings };
            rawData.slice(1).forEach(row => {
                if (row[0]) {
                    const key = row[0];
                    const value = row[1];
                    
                    if (key === 'maintenance_mode') {
                        settings[key] = value === 'TRUE' || value === true || value === '1';
                    } else {
                        settings[key] = value || '';
                    }
                }
            });
            
            console.log('✅ Settings loaded');
            return settings;
            
        } catch (error) {
            console.error('❌ Error loading settings:', error);
            return {
                app_name: 'MyQuota',
                maintenance_mode: false,
                admin_whatsapp: '6281234567890',
                qris_image_url: '',
                dana_link: ''
            };
        }
    },
    
    // Add Transaction
    async addTransaction(transactionData) {
        try {
            const transactionId = 'TXN_' + Date.now();
            const values = [
                transactionId,
                transactionData.package_id,
                transactionData.phone_number,
                transactionData.amount,
                transactionData.payment_method,
                transactionData.status || 'pending',
                new Date().toISOString()
            ];
            
            await SheetsAPI.appendData('Transactions', values);
            
            // Clear cache to force refresh
            CacheManager.remove('transactions');
            
            console.log('✅ Transaction added:', transactionId);
            return { transaction_id: transactionId };
            
        } catch (error) {
            console.error('❌ Error adding transaction:', error);
            throw error;
        }
    }
};

// Make everything globally available
window.CONFIG = CONFIG;
window.SheetsAPI = SheetsAPI;
window.CacheManager = CacheManager;
window.DataService = DataService;

console.log('✅ Configuration loaded successfully');
