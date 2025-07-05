class API {
    static BASE_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
    
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
            const response = await fetch(url, options);
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('API Error:', error);
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

// Configuration - Update this with your actual Google Apps Script URL
API.BASE_URL = 'https://script.google.com/macros/s/YOUR_ACTUAL_SCRIPT_ID/exec';
