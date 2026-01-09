import axios from 'axios';

const API_URL = import.meta.env['VITE_API_URL'] || 'http://localhost:3000';


export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

// Callback to notify about token expiration
let onTokenExpiredCallback: (() => void) | null = null;

class AuthService {
  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Response interceptor to catch 401 errors (token expired)
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          const errorMessage = error.response?.data?.error || error.response?.data?.message || '';
          
          // Check if it's a token expiration error
          if (
            errorMessage.includes('Token expired') ||
            errorMessage.includes('expired token') ||
            error.response?.data?.code === 'TOKEN_EXPIRED' ||
            errorMessage.includes('Invalid token') ||
            errorMessage.includes('Unauthorized')
          ) {
            console.log('🔐 Token expired, logging out...');
            this.handleTokenExpiration();
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private handleTokenExpiration() {
    // Clear local storage
    this.logout();
    
    // Notify the auth context to update state and redirect
    if (onTokenExpiredCallback) {
      onTokenExpiredCallback();
    }
  }

  setOnTokenExpired(callback: () => void) {
    onTokenExpiredCallback = callback;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/api/admin/auth/login`, credentials);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/api/admin/auth/signup`, credentials);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();