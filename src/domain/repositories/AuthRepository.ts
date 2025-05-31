import type { LoginResponse, User } from '../entities/User';

export interface AuthRepository {
  login(email: string): Promise<{ message: string }>;
  verifyMagicLink(token: string): Promise<LoginResponse>;
  getCurrentUser(): Promise<User>;
  refreshToken(): Promise<{ accessToken: string; expiresIn: number }>;
  logout(): Promise<{ message: string }>;
  validateToken(): Promise<{ valid: boolean; user: User }>;
} 