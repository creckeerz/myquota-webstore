class API {
    // ✅ URL Google Apps Script Anda yang sudah benar
    static BASE_URL = 'https://script.google.com/macros/s/AKfycbwfhVXKZzRtGTld4XcWf1SGJqxtB-4c1G5gnXBpl9oy_U2HaDVjuRnNnMVK8_4AAeNTHw/exec';
    
    static async request(endpoint, method = 'GET', data = null) {
        const url = new URL(this.BASE_URL);
        url.searchParams.append('path', endpoint);
        url.searchParams.append('method', method);
        
        const options = {
            method: 'POST', // Always POST for Google Apps Script
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        };
        
        if (data) {
            const formData = new URLSearchParams();
            if (method !== 'GET') {
                formData.append('postData', JSON.stringify(data));
            }
            options.body = formData;
        }
        
        try {
            console.log('🔄 API Request:', endpoint, method, data);
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
            throw new Error('Network error: ' + error.message);
        }
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
        const endpoint = categorySlug ? `packages?category=${categorySlug}` : 'packages';
        return this.request(endpoint);
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
    
    static async logout() {
        return this.request('auth?action=logout', 'POST');
    }
}

// Test connection function
API.testConnection = async function() {
    try {
        console.log('🧪 Testing API connection...');
        const result = await this.request('packages');
        console.log('✅ API Connection successful:', result);
        return true;
    } catch (error) {
        console.error('❌ API Connection failed:', error);
        return false;
    }
};

// Test auth
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
