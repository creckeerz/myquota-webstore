class API {
    // ✅ URL Google Apps Script Anda
    static BASE_URL = 'https://script.google.com/macros/s/AKfycbzb4jGhEYh6FRsLepy72Dq2RB3bXwlC6HhcYLgeiJ_95znlXZxKtX58N6cgGJrgObxQ1Q/exec';
    
    static async request(endpoint, method = 'GET', data = null) {
        try {
            console.log('🔄 API Request:', { endpoint, method, data });
            
            // Sesuaikan dengan format yang diharapkan Google Apps Script Anda
            const url = new URL(this.BASE_URL);
            url.searchParams.append('path', endpoint);
            url.searchParams.append('method', method);
            
            const options = {
                method: 'POST', // Selalu POST untuk Google Apps Script
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                cache: 'no-cache',
                mode: 'cors'
            };
            
            // Tambahkan data sebagai form data jika ada
            if (data && method !== 'GET') {
                const formData = new URLSearchParams();
                formData.append('postData', JSON.stringify(data));
                options.body = formData;
            }
            
            console.log('📤 Request URL:', url.toString());
            console.log('📤 Request options:', options);
            
            const response = await fetch(url, options);
            console.log('📥 Response status:', response.status, response.statusText);
            
            // Handle redirect responses
            if (response.status === 302 || response.redirected) {
                console.warn('⚠️ Redirect detected to:', response.url);
                throw new Error('Script tidak dapat diakses. Periksa deployment dan permissions.');
            }
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const contentType = response.headers.get('content-type');
            console.log('📋 Content-Type:', contentType);
            
            let result;
            try {
                const text = await response.text();
                console.log('📄 Raw response:', text.substring(0, 200) + '...');
                result = JSON.parse(text);
            } catch (parseError) {
                console.error('❌ JSON parse error:', parseError);
                throw new Error('Invalid JSON response from server');
            }
            
            console.log('✅ API Response:', result);
            
            // Handle Apps Script response format
            if (result.error && !result.success) {
                throw new Error(result.error);
            }
            
            return result;
            
        } catch (error) {
            console.error('❌ API Error details:', {
                message: error.message,
                endpoint,
                method,
                data
            });
            
            // Provide more specific error messages
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Koneksi ke server gagal. Periksa koneksi internet Anda.');
            } else if (error.message.includes('302') || error.message.includes('redirect')) {
                throw new Error('Masalah deployment script. Pastikan script di-deploy sebagai web app dengan akses "Anyone".');
            } else {
                throw new Error('Network error: ' + error.message);
            }
        }
    }
    
    // Categories
    static async getCategories() {
        return this.request('categories', 'GET');
    }
    
    static async createCategory(categoryData) {
        return this.request('categories', 'POST', categoryData);
    }
    
    // Packages
    static async getPackages(categorySlug = null) {
        const endpoint = categorySlug ? `packages?category=${categorySlug}` : 'packages';
        return this.request(endpoint, 'GET');
    }
    
    static async createPackage(packageData) {
        console.log('📦 Creating package:', packageData);
        return this.request('packages', 'POST', packageData);
    }
    
    static async updatePackage(id, packageData) {
        console.log('📝 Updating package:', id, packageData);
        return this.request(`packages?id=${id}`, 'PUT', packageData);
    }
    
    static async deletePackage(id) {
        console.log('🗑️ Deleting package:', id);
        return this.request(`packages?id=${id}`, 'DELETE');
    }
    
    // Transactions
    static async createTransaction(transactionData) {
        return this.request('transactions', 'POST', transactionData);
    }
    
    static async getTransactions() {
        return this.request('transactions', 'GET');
    }
    
    // Authentication
    static async login(email, password) {
        return this.request('auth?action=login', 'POST', { email, password });
    }
    
    static async checkAuth(token) {
        return this.request(`auth?action=check&token=${token}`, 'GET');
    }
    
    static async logout() {
        return this.request('auth?action=logout', 'POST');
    }
}

// Enhanced test functions
API.testConnection = async function() {
    try {
        console.log('🧪 Testing API connection...');
        const result = await this.request('packages', 'GET');
        console.log('✅ API Connection successful:', result);
        return { success: true, data: result };
    } catch (error) {
        console.error('❌ API Connection failed:', error);
        return { success: false, error: error.message };
    }
};

API.testAuth = async function() {
    try {
        console.log('🔐 Testing admin login...');
        const result = await this.login('admin@myquota.com', 'admin123');
        console.log('✅ Login test result:', result);
        return result;
    } catch (error) {
        console.error('❌ Login test failed:', error);
        return { success: false, error: error.message };
    }
};

// Test create package
API.testCreatePackage = async function() {
    try {
        console.log('📦 Testing package creation...');
        const testPackage = {
            name: 'Test Package',
            category_id: 1,
            quota: '10GB',
            price: 50000,
            validity: '30 hari',
            description: 'Test package untuk debugging',
            status: 'active',
            is_popular: false
        };
        
        const result = await this.createPackage(testPackage);
        console.log('✅ Package creation test result:', result);
        return result;
    } catch (error) {
        console.error('❌ Package creation test failed:', error);
        return { success: false, error: error.message };
    }
};

// Debug function untuk troubleshooting
API.debug = async function() {
    console.log('🔍 Starting comprehensive API debug...');
    
    const results = {
        basicFetch: null,
        connection: null,
        createPackage: null
    };
    
    // Test 1: Basic fetch
    try {
        console.log('🌐 Test 1: Basic fetch to script URL...');
        const response = await fetch(this.BASE_URL, { 
            method: 'GET',
            cache: 'no-cache'
        });
        results.basicFetch = {
            success: true,
            status: response.status,
            statusText: response.statusText,
            redirected: response.redirected,
            finalUrl: response.url,
            headers: Object.fromEntries(response.headers.entries())
        };
        console.log('✅ Basic fetch successful:', results.basicFetch);
    } catch (error) {
        results.basicFetch = { success: false, error: error.message };
        console.error('❌ Basic fetch failed:', error);
    }
    
    // Test 2: API connection
    try {
        console.log('🔗 Test 2: API connection test...');
        results.connection = await this.testConnection();
    } catch (error) {
        results.connection = { success: false, error: error.message };
    }
    
    // Test 3: Create package
    try {
        console.log('📦 Test 3: Create package test...');
        results.createPackage = await this.testCreatePackage();
    } catch (error) {
        results.createPackage = { success: false, error: error.message };
    }
    
    console.log('📊 Complete debug results:', results);
    
    // Generate summary
    const summary = {
        allTestsPassed: Object.values(results).every(r => r?.success),
        recommendations: []
    };
    
    if (!results.basicFetch?.success) {
        summary.recommendations.push('Script URL tidak dapat diakses. Periksa deployment Google Apps Script.');
    }
    
    if (results.basicFetch?.success && !results.connection?.success) {
        summary.recommendations.push('Script dapat diakses tetapi endpoint tidak berfungsi. Periksa handleRequest function.');
    }
    
    if (results.connection?.success && !results.createPackage?.success) {
        summary.recommendations.push('GET request berhasil tetapi POST gagal. Periksa PackageService.handleRequest.');
    }
    
    if (summary.allTestsPassed) {
        summary.recommendations.push('Semua test berhasil! API siap digunakan.');
    }
    
    console.log('📋 Debug summary:', summary);
    return { results, summary };
};

// Auto-retry wrapper for critical operations
API.withRetry = async function(operation, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🔄 Attempt ${attempt}/${maxRetries}`);
            return await operation();
        } catch (error) {
            console.error(`❌ Attempt ${attempt} failed:`, error.message);
            
            if (attempt === maxRetries) {
                throw error;
            }
            
            // Wait before retry (exponential backoff)
            const delay = Math.pow(2, attempt) * 1000;
            console.log(`⏳ Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};
