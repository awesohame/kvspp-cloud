import { User, Store } from '../types/api';

// Use environment variable with fallback for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async getUser(): Promise<User> {
    return this.request<User>('/account/me');
  }

  async logout(): Promise<void> {
    await this.request('/account/logout', { method: 'POST' });
  }

  async deleteAccount(): Promise<void> {
    await this.request('/account/delete', { method: 'DELETE' });
  }

  // Store management
  async createStore(name: string, description: string): Promise<{ status: string; message: string; data: Store }> {
    return this.request<{ status: string; message: string; data: Store }>('/store', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  }

  async getStores(): Promise<{ status: string; message: string; data: Store[] }> {
    return this.request<{ status: string; message: string; data: Store[] }>('/store');
  }

  async getStore(token: string): Promise<Store> {
    return this.request<Store>(`/store/${token}`);
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