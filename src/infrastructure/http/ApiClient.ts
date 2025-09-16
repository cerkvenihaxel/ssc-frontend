import { API_BASE_URL } from '../../shared/utils/constants';

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('accessToken');
    console.log(`🏗️ ApiClient initialized with baseURL: ${this.baseURL}`);
    console.log(`🔐 Token from localStorage: ${this.token ? this.token.substring(0, 20) + '...' : 'No token found'}`);
  }

  setToken(token: string | null): void {
    this.token = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  getToken(): string | null {
    // Siempre consultar localStorage para obtener el token más actualizado
    const currentToken = localStorage.getItem('accessToken');
    if (currentToken !== this.token) {
      this.token = currentToken;
    }
    return this.token;
  }

  getBaseURL(): string {
    return this.baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    console.log(`🔧 Base URL: ${this.baseURL}`);
    console.log(`🔧 Endpoint: ${endpoint}`);
    console.log(`🔧 Full URL: ${url}`);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const currentToken = this.getToken();
    if (currentToken) {
      headers.Authorization = `Bearer ${currentToken}`;
      console.log(`🔑 Authorization header set: Bearer ${currentToken.substring(0, 20)}...`);
    } else {
      console.log(`⚠️ No token available for authorization`);
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      console.log(`📡 API Response: ${response.status} ${response.statusText}`);
      
      let data;
      try {
        // Verificar si la respuesta tiene contenido para parsear
        const text = await response.text();
        if (text.trim()) {
          data = JSON.parse(text);
        } else {
          // Respuesta vacía (como cuando devuelve void)
          data = null;
        }
      } catch (parseError) {
        console.error('❌ Error parsing JSON response:', parseError);
        throw {
          message: 'Error al procesar la respuesta del servidor',
          status: response.status,
        } as ApiError;
      }

      if (!response.ok) {
        console.error('❌ API Error Response:', data);
        throw {
          message: data.message || `Error ${response.status}: ${response.statusText}`,
          status: response.status,
          errors: data.errors,
        } as ApiError;
      }

      console.log('✅ API Success Response:', data);
      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('🔌 Network Error:', error);
        throw {
          message: 'Error de conexión. Verifica que el backend esté funcionando.',
          status: 0,
        } as ApiError;
      }
      
      if (error instanceof Error && !('status' in error)) {
        console.error('💥 Unknown Error:', error);
        throw {
          message: error.message,
          status: 0,
        } as ApiError;
      }
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
} 