export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Vada Health';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';
export const IS_DEV = import.meta.env.VITE_DEV_MODE === 'true';

export const ROUTES = {
  // Public routes
  LOGIN: '/login',
  AUTH_VERIFY: '/auth/verify',
  UNAUTHORIZED: '/unauthorized',
  
  // Admin routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_REQUESTS: '/admin/requests',
  ADMIN_ANALYTICS: '/admin/analytics',
  
  // Auditor routes
  AUDITOR_REQUESTS: '/auditor/requests',
  
  // Efector routes
  EFECTOR_REQUESTS: '/efector/requests',
  
  // Proveedor routes
  PROVEEDOR_QUOTATIONS: '/proveedor/quotations',
  
  // Médico routes
  MEDICO_SOLICITUDES: '/medico/solicitudes',
  
  // Afiliado routes
  AFILIADO_PROFILE: '/afiliado/profile',
} as const; 