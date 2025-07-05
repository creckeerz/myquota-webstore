class API {
    // ✅ URL Google Apps Script Anda
    static BASE_URL = 'https://script.google.com/macros/s/AKfycbzvG5UhV2VtUjl7mo9xa4-qMukmUb2LzsWVIx-P0P85TxLbCgY2Ao_PELU-oikhOXcjgA/exec';
    
    static async request(endpoint, method = 'GET', data = null) {
        try {
            console.log('🔄 API Request:', { endpoint, method, data });
            
            // Untuk Google Apps Script, semua request harus menggunakan POST
            const url = this.BASE_URL;
            
            // Prepare request body
            const requestBody = {
                path: endpoint,
                method: method
            };
            
            // Add data for non-GET requests
            if (data && method !== 'GET') {
                requestBody.data = data;
            }
            
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
                // Prevent caching issues
                cache: 'no-cache',
                mode: 'cors'
            };
            
            console.log('📤 Request options:', options);
            
            const response = await fetch(url, options);
            console.log('📥 Response status:', response.status, response.statusText);
            
            // Handle redirect responses
            if (response.status === 302 || response.redirected) {
                console.warn('⚠️ Redirect detected, this might indicate an authentication issue');
                // For Google Apps Script, redirects usually mean authentication problems
                throw new Error('Authentication required or script not properly deployed');
            }
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const contentType = response.headers.get('content-type');
            console.log('📋 Content-Type:', contentType);
            
            let result;
            if (contentType && contentType.includes('application/json')) {
                result = await response.json();
            } else {
                // Sometimes Google Apps Script returns HTML instead of JSON
                const text = await response.text();
                console.log('📄 Response text:', text.substring(0, 200));
                
                try {
                    result = JSON.parse(text);
                } catch (e) {
                    throw new Error('Invalid JSON response from server: ' + text.substring(0, 100));
                }
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
                throw new Error('Masalah autentikasi atau deployment script. Periksa URL dan permissions.');
            } else if (error.message.includes('Authentication required')) {
                throw new Error('Script memerlukan autentikasi. Pastikan script sudah di-deploy dengan benar.');
            } else {
                throw new Error('Network error: ' + error.message);
            }
        }
    }
    
    // Alternative request method using URLSearchParams (fallback)
    static async requestFormData(endpoint, method = 'GET', data = null) {
        try {
            console.log('🔄 API Request (FormData):', { endpoint, method, data });
            
            const url = this.BASE_URL;
            const formData = new URLSearchParams();
            
            formData.append('path', endpoint);
            formData.append('method', method);
            
            if (data && method !== 'GET') {
                formData.append('data', JSON.stringify(data));
            }
            
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
                cache: 'no-cache'
            };
            
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('✅ API Response (FormData):', result);
            
            return result;
            
        } catch (error) {
            console.error('❌ API Error (FormData):', error);
            throw error;
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
        const endpoint = categorySlug ? `packages/${categorySlug}` : 'packages';
        return this.request(endpoint, 'GET');
    }
    
    static async createPackage(packageData) {
        console.log('📦 Creating package:', packageData);
        return this.request('packages', 'POST', packageData);
    }
    
    static async updatePackage(id, packageData) {
        console.log('📝 Updating package:', id, packageData);
        return this.request(`packages/${id}`, 'PUT', packageData);
    }
    
    static async deletePackage(id) {
        console.log('🗑️ Deleting package:', id);
        return this.request(`packages/${id}`, 'DELETE');
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
        return this.request('auth/login', 'POST', { email, password });
    }
    
    static async checkAuth(token) {
        return this.request(`auth/check`, 'GET', { token });
    }
    
    static async logout() {
        return this.request('auth/logout', 'POST');
    }
}

// Enhanced test functions
API.testConnection = async function() {
    try {
        console.log('🧪 Testing API connection...');
        
        // Test dengan method yang berbeda jika yang pertama gagal
        let result;
        try {
            result = await this.request('packages', 'GET');
        } catch (error) {
            console.log('⚠️ JSON request failed, trying FormData...');
            result = await this.requestFormData('packages', 'GET');
        }
        
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

// Debug function untuk troubleshooting
API.debug = async function() {
    console.log('🔍 Starting API Debug...');
    
    // Test basic connectivity
    try {
        const response = await fetch(this.BASE_URL, { 
            method: 'GET',
            cache: 'no-cache'
        });
        console.log('🌐 Basic fetch response:', {
            status: response.status,
            statusText: response.statusText,
            redirected: response.redirected,
            url: response.url,
            headers: Object.fromEntries(response.headers.entries())
        });
    } catch (error) {
        console.error('🌐 Basic fetch failed:', error);
    }
    
    // Test API methods
    const testResults = {
        connection: await this.testConnection(),
        auth: await this.testAuth()
    };
    
    console.log('📊 Debug results:', testResults);
    return testResults;
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
