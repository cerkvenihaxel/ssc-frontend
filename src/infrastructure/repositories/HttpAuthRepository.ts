import type { AuthRepository } from '../../domain/repositories/AuthRepository';
import type { LoginResponse, User } from '../../domain/entities/User';
import { ApiClient } from '../http/ApiClient';

export class HttpAuthRepository implements AuthRepository {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async login(email: string): Promise<{ message: string }> {
    return this.apiClient.post('/v1/auth/login', { email });
  }

  async verifyMagicLink(token: string): Promise<LoginResponse> {
    const response = await this.apiClient.get<LoginResponse>(`/v1/auth/verify?token=${token}`);
    // Set the token for future requests
    console.log(`🎟️ Setting access token from magic link verification: ${response.accessToken.substring(0, 20)}...`);
    this.apiClient.setToken(response.accessToken);
    console.log(`✅ Token set successfully in ApiClient`);
    return response;
  }

  async getCurrentUser(): Promise<User> {
    return this.apiClient.get<User>('/v1/auth/me');
  }

  async refreshToken(): Promise<{ accessToken: string; expiresIn: number }> {
    const response = await this.apiClient.post<{ accessToken: string; expiresIn: number }>('/v1/auth/refresh');
    // Update the token
    this.apiClient.setToken(response.accessToken);
    return response;
  }

  async logout(): Promise<{ message: string }> {
    const response = await this.apiClient.post<{ message: string }>('/v1/auth/logout');
    // Clear the token
    this.apiClient.setToken(null);
    return response;
  }

  async validateToken(): Promise<{ valid: boolean; user: User }> {
    return this.apiClient.get<{ valid: boolean; user: User }>('/v1/auth/validate');
  }
} 