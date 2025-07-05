class Auth {
    static TOKEN_KEY = 'myquota_auth_token';
    static USER_KEY = 'myquota_user_data';
    
    static setToken(token) {
        localStorage.setItem(this.TOKEN_KEY, token);
    }
    
    static getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    }
    
    static setUser(userData) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    }
    
    static getUser() {
        const userData = localStorage.getItem(this.USER_KEY);
        return userData ? JSON.parse(userData) : null;
    }
    
    static isAuthenticated() {
        return !!this.getToken();
    }
    
    static async checkAuthStatus() {
        const token = this.getToken();
        if (!token) return false;
        
        try {
            const result = await API.checkAuth(token);
            if (result.authenticated) {
                this.setUser(result.user);
                return true;
            } else {
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            this.logout();
            return false;
        }
    }
    
    static logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        window.location.href = '/login';
    }
    
    static requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login';
            return false;
        }
        return true;
    }
}
