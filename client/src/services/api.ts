import { User, Store } from '../types/api';

// Use environment variable with fallback for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('auth_token');
    console.log('API Request - Endpoint:', endpoint);
    console.log('API Request - Token exists:', !!token);
    console.log('API Request - Token (first 50 chars):', token?.substring(0, 50));
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('API Request - Authorization header set:', headers['Authorization'].substring(0, 70));
    }

    // Merge with any existing headers from options
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    console.log('API Request - Full URL:', `${API_BASE_URL}${endpoint}`);
    console.log('API Request - Headers:', headers);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include',
      headers,
      ...options,
    });

    console.log('API Response - Status:', response.status);

    if (!response.ok) {
      // If unauthorized, clear token and throw error
      if (response.status === 401) {
        console.error('API Request - 401 Unauthorized, clearing token');
        localStorage.removeItem('auth_token');
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Auth endpoints
  async getUser(): Promise<User> {
    return this.request<User>('/account/me');
  }

  async logout(): Promise<void> {
    await this.request('/account/logout', { method: 'POST' });
    // Clear token after successful logout
    localStorage.removeItem('auth_token');
  }

  async deleteAccount(): Promise<void> {
    await this.request('/account/delete', { method: 'DELETE' });
    // Clear token after account deletion
    localStorage.removeItem('auth_token');
  }

  // Store management
  async createStore(name: string, description: string): Promise<{ status: string; message: string; data: Store }> {
    return this.request<{ status: string; message: string; data: Store }>('/store', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  }

  async getStores(): Promise<{ status: string; message: string; data: Store[] }> {
    const result = await this.request<{ status: string; message: string; data: Store[] }>('/store');
    // console.log('Fetched stores:', result.data);
    return result;
  }

  async getStore(token: string): Promise<{ status: string; message: string; data: Store }> {
    const result = await this.request<{ status: string; message: string; data: Store }>(`/store/${token}`);
    // console.log('Fetched store:', result.data);
    return result;
  }

  async updateStore(token: string, name: string, description: string): Promise<Store> {
    return this.request<Store>(`/store/${token}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description }),
    });
  }

  async deleteStore(token: string): Promise<void> {
    await this.request(`/store/${token}`, { method: 'DELETE' });
  }

  async addStoreOwner(token: string, email: string): Promise<void> {
    await this.request(`/store/${token}/owners`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Store data operations
  async getValue(token: string, key: string): Promise<string | number | boolean | object | null> {
    return this.request(`/store/${token}/${key}`);
  }

  async setValue(token: string, key: string, value: string | number | boolean | object | null): Promise<void> {
    await this.request(`/store/${token}/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  }

  async deleteValue(token: string, key: string): Promise<void> {
    await this.request(`/store/${token}/${key}`, { method: 'DELETE' });
  }

  // Store file operations
  async saveStore(token: string): Promise<void> {
    await this.request(`/store/${token}/save`, { method: 'POST' });
  }

  async loadStore(token: string): Promise<void> {
    await this.request(`/store/${token}/load`, { method: 'POST' });
  }

  // Store utility
  async setAutosave(token: string, autosave: boolean): Promise<void> {
    await this.request(`/store/${token}/autosave`, {
      method: 'POST',
      body: JSON.stringify({ autosave: autosave ? true : 'off' }),
    });
  }

  async getHelp(): Promise<string | number | boolean | object | null> {
    return this.request('/store/help');
  }
}

export const apiService = new ApiService();