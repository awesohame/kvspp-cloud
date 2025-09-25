export interface StoreKV {
  autosave?: boolean;
  [key: string]: string | number | boolean | undefined;
}
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Store {
  token: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
  store: StoreKV;
}

export interface StoreData {
  [key: string]: string | number | boolean | object | null;
}

export interface ApiToken {
  id: string;
  name: string;
  token: string;
  createdAt: string;
  lastUsed?: string;
}

export interface AccessUser {
  email: string;
  role: 'owner' | 'viewer' | 'editor';
  addedAt: string;
}

export interface LogEntry {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  ip?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}