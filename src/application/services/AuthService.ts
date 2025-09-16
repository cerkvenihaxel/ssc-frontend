import type { AuthRepository } from '../../domain/repositories/AuthRepository';
import type { LoginResponse, User } from '../../domain/entities/User';

export class AuthService {
  private authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async requestMagicLink(email: string): Promise<{ message: string }> {
    if (!email || !this.isValidEmail(email)) {
      throw new Error('Email inválido');
    }
    return this.authRepository.login(email);
  }

  async verifyMagicLink(token: string): Promise<LoginResponse> {
    if (!token) {
      throw new Error('Token requerido');
    }
    return this.authRepository.verifyMagicLink(token);
  }

  async getCurrentUser(): Promise<User> {
    return this.authRepository.getCurrentUser();
  }

  async refreshToken(): Promise<{ accessToken: string; expiresIn: number }> {
    return this.authRepository.refreshToken();
  }

  async logout(): Promise<{ message: string }> {
    return this.authRepository.logout();
  }

  async validateToken(): Promise<{ valid: boolean; user: User }> {
    return this.authRepository.validateToken();
  }

  hasPermission(userPermissions: string[], requiredPermission: string): boolean {
    return userPermissions.includes(requiredPermission);
  }

  hasAnyPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
    return requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
} 