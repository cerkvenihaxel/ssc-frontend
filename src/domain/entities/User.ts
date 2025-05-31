export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface Route {
  path: string;
  title: string;
  icon: string;
  description?: string;
  order?: number;
  children?: Route[];
}

export interface User {
  userId: string;
  email: string;
  nombre: string;
  role: Role;
  status: 'active' | 'inactive' | 'pending';
  permissions: string[];
  defaultRoute: string;
  availableRoutes: Route[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  sessionId: string;
  user: User;
  message: string;
  expiresIn: number;
} 