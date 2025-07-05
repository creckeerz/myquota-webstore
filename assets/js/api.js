class API {
    // URL Google Apps Script Anda
    static BASE_URL = 'https://script.google.com/macros/s/AKfycbyD11JWOX45UPYsstn4XJRSy73ngi9wTj69Am4D_ftM4XVm9RD8An478olbVlY6CgcHUA/exec';
    
    static async request(endpoint, method = 'GET', data = null) {
        try {
            const url = new URL(this.BASE_URL);
            
            // Parse endpoint to extract path and query parameters
            const [path, queryString] = endpoint.split('?');
            url.searchParams.append('path', path);
            url.searchParams.append('method', method);
            
            // Add query parameters if they exist
            if (queryString) {
                const queryParams = new URLSearchParams(queryString);
                for (const [key, value] of queryParams) {
                    url.searchParams.append(key, value);
                }
            }
            
            const options = {
                method: 'POST', // Always POST for Google Apps Script
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            };
            
            // Add POST data if provided
            if (data && method !== 'GET') {
                const formData = new URLSearchParams();
                formData.append('postData', JSON.stringify(data));
                options.body = formData;
            }
            
            console.log('🔄 API Request:', {
                url: url.toString(),
                method: method,
                data: data,
                options: options
            });
            
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('✅ API Response:', result);
            
            // Handle Apps Script response format
            if (result.error && !result.success) {
                throw new Error(result.error);
            }
            
            return result;
            
        } catch (error) {
            console.error('❌ API Error:', error);
            throw new Error('API request failed: ' + error.message);
        }
    }
    
    // Test endpoint
    static async test() {
        return this.request('test');
    }
    
    // Categories
    static async getCategories() {
        return this.request('categories');
    }
    
    static async createCategory(categoryData) {
        return this.request('categories', 'POST', categoryData);
    }
    
    // Packages
    static async getPackages(categorySlug = null) {
        if (categorySlug) {
            return this.request(`packages?category=${categorySlug}`);
        }
        return this.request('packages');
    }
    
    static async createPackage(packageData) {
        return this.request('packages', 'POST', packageData);
    }
    
    static async updatePackage(id, packageData) {
        return this.request(`packages?id=${id}`, 'PUT', packageData);
    }
    
    static async deletePackage(id) {
        return this.request(`packages?id=${id}`, 'DELETE');
    }
    
    // Transactions
    static async createTransaction(transactionData) {
        return this.request('transactions', 'POST', transactionData);
    }
    
    static async getTransactions() {
        return this.request('transactions');
    }
    
    // Authentication
    static async login(email, password) {
        return this.request('auth?action=login', 'POST', { email, password });
    }
    
    static async checkAuth(token) {
        return this.request(`auth?action=check&token=${token}`);
    }
    
    static async logout(token) {
        return this.request(`auth?action=logout&token=${token}`, 'POST');
    }
}

// Test functions
API.testConnection = async function() {
    try {
        console.log('🧪 Testing API connection...');
        const result = await this.test();
        console.log('✅ API Connection successful:', result);
        return true;
    } catch (error) {
        console.error('❌ API Connection failed:', error);
        return false;
    }
};

API.testPackages = async function() {
    try {
        console.log('📦 Testing packages endpoint...');
        const result = await this.getPackages();
        console.log('✅ Packages test successful:', result);
        return result;
    } catch (error) {
        console.error('❌ Packages test failed:', error);
        return false;
    }
};

API.testCategories = async function() {
    try {
        console.log('🗂️ Testing categories endpoint...');
        const result = await this.getCategories();
        console.log('✅ Categories test successful:', result);
        return result;
    } catch (error) {
        console.error('❌ Categories test failed:', error);
        return false;
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
        return false;
    }
};

// Helper function to test all endpoints
API.testAll = async function() {
    console.log('🚀 Running comprehensive API tests...');
    
    const tests = [
        { name: 'Connection', fn: () => this.testConnection() },
        { name: 'Categories', fn: () => this.testCategories() },
        { name: 'Packages', fn: () => this.testPackages() },
        { name: 'Auth', fn: () => this.testAuth() }
    ];
    
    const results = {};
    
    for (const test of tests) {
        try {
            console.log(`\n--- Testing ${test.name} ---`);
            results[test.name] = await test.fn();
            console.log(`✅ ${test.name} test completed`);
        } catch (error) {
            console.error(`❌ ${test.name} test failed:`, error);
            results[test.name] = { error: error.message };
        }
    }
    
    console.log('\n📊 Test Results Summary:', results);
    return results;
};
