import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginResponse } from '../../domain/entities/User';
import { AuthService } from '../../application/services/AuthService';
import { HttpAuthRepository } from '../../infrastructure/repositories/HttpAuthRepository';
import { ApiClient } from '../../infrastructure/http/ApiClient';
import type { ApiError } from '../../infrastructure/http/ApiClient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string) => Promise<void>;
  verifyMagicLink: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize services
  const apiClient = new ApiClient();
  const authRepository = new HttpAuthRepository(apiClient);
  const authService = new AuthService(authRepository);

  // Debug: Log API configuration
  console.log('🔧 API Configuration:', {
    baseURL: apiClient.getBaseURL(),
    token: apiClient.getToken() || 'No token'
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = apiClient.getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const currentUser = await authService.getCurrentUser();
      console.log('👤 Usuario autenticado:', currentUser);
      console.log('🔑 Permisos del usuario:', currentUser.permissions);
      console.log('🎭 Rol del usuario:', currentUser.role);
      console.log('📋 Permisos específicos:');
      console.log('  - ADMIN_ACCESS:', currentUser.permissions?.includes('ADMIN_ACCESS'));
      console.log('  - VIEW_ALL_USERS:', currentUser.permissions?.includes('VIEW_ALL_USERS'));
      console.log('  - CREATE_USERS:', currentUser.permissions?.includes('CREATE_USERS'));
      console.log('  - VIEW_ANALYTICS:', currentUser.permissions?.includes('VIEW_ANALYTICS'));
      setUser(currentUser);
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Clear invalid token
      apiClient.setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string): Promise<void> => {
    try {
      await authService.requestMagicLink(email);
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message);
    }
  };

  const verifyMagicLink = async (token: string): Promise<void> => {
    try {
      setLoading(true);
      const response: LoginResponse = await authService.verifyMagicLink(token);
      console.log('🎉 Magic link verificado exitosamente:', response);
      console.log('👤 Usuario obtenido:', response.user);
      console.log('🔑 Permisos obtenidos:', response.user.permissions);
      console.log('🎯 Ruta por defecto:', response.user.defaultRoute);
      setUser(response.user);
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setUser(null);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) {
      console.log('❌ hasPermission: No hay usuario autenticado');
      return false;
    }
    
    const hasIt = authService.hasPermission(user.permissions, permission);
    console.log(`🔍 hasPermission("${permission}"):`, hasIt);
    console.log(`📋 Permisos disponibles:`, user.permissions);
    return hasIt;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) {
      console.log('❌ hasAnyPermission: No hay usuario autenticado');
      return false;
    }
    
    const hasAny = authService.hasAnyPermission(user.permissions, permissions);
    console.log(`🔍 hasAnyPermission([${permissions.join(', ')}]):`, hasAny);
    console.log(`📋 Permisos disponibles:`, user.permissions);
    return hasAny;
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    verifyMagicLink,
    logout,
    hasPermission,
    hasAnyPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}; 