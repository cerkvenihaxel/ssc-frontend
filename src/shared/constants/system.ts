// Estados de Peticiones de Efectores
export enum EffectorRequestState {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
  CANCELADO = 'CANCELADO',
  EN_COTIZACION = 'EN_COTIZACION',
  COTIZADO = 'COTIZADO',
  ADJUDICADO = 'ADJUDICADO'
}

// Estados de Órdenes Médicas
export enum MedicalOrderState {
  DRAFT = 'draft',
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PARTIALLY_APPROVED = 'partially_approved',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Niveles de Prioridad
export enum Priority {
  BAJA = 'BAJA',
  NORMAL = 'NORMAL',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE'
}

// Roles del Sistema
export enum UserRole {
  ADMINISTRADOR = 'Administrador',
  EFECTOR = 'Efector',
  PROVEEDOR = 'Proveedor',
  AUDITOR = 'Auditor',
  MEDICO = 'Médico',
  EMPLEADO = 'Empleado'
}

// IDs de Roles (según base de datos)
export enum RoleId {
  ADMINISTRADOR = 1,
  EFECTOR = 2,
  PROVEEDOR = 3,
  AUDITOR = 4,
  MEDICO = 5,
  EMPLEADO = 6
}

// Estados de Entrega de Material
export enum DeliveryStatus {
  PENDING = 'pending',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

// Estados de Auditoría
export enum AuditStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  NEEDS_REVIEW = 'needs_review'
}

// Configuración de la Aplicación
export const APP_CONFIG = {
  API: {
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
  },
  UI: {
    DEBOUNCE_DELAY: 300,
    PAGINATION_SIZE: 10,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  },
  POLLING: {
    DASHBOARD_REFRESH: 30000,
    REALTIME_UPDATE: 5000,
  }
};

// Mapas de Colores para Estados
export const STATE_COLORS = {
  // Estados de Efectores
  [EffectorRequestState.PENDIENTE]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  [EffectorRequestState.APROBADO]: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  [EffectorRequestState.RECHAZADO]: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  [EffectorRequestState.CANCELADO]: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
  [EffectorRequestState.EN_COTIZACION]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  [EffectorRequestState.COTIZADO]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
  [EffectorRequestState.ADJUDICADO]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',

  // Estados de Órdenes Médicas
  [MedicalOrderState.DRAFT]: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
  [MedicalOrderState.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  [MedicalOrderState.UNDER_REVIEW]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  [MedicalOrderState.APPROVED]: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  [MedicalOrderState.REJECTED]: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  [MedicalOrderState.PARTIALLY_APPROVED]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
  [MedicalOrderState.PROCESSING]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  [MedicalOrderState.COMPLETED]: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  [MedicalOrderState.CANCELLED]: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',

  // Prioridades
  [Priority.BAJA]: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
  [Priority.NORMAL]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  [Priority.ALTA]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
  [Priority.URGENTE]: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
};

// Mapas de Iconos para Estados
export const STATE_ICONS = {
  [EffectorRequestState.PENDIENTE]: 'Clock',
  [EffectorRequestState.APROBADO]: 'CheckCircle',
  [EffectorRequestState.RECHAZADO]: 'XCircle',
  [EffectorRequestState.CANCELADO]: 'XCircle',
  [EffectorRequestState.EN_COTIZACION]: 'TrendingUp',
  [EffectorRequestState.COTIZADO]: 'FileText',
  [EffectorRequestState.ADJUDICADO]: 'CheckCircle',

  [MedicalOrderState.DRAFT]: 'Edit',
  [MedicalOrderState.PENDING]: 'Clock',
  [MedicalOrderState.UNDER_REVIEW]: 'Search',
  [MedicalOrderState.APPROVED]: 'CheckCircle',
  [MedicalOrderState.REJECTED]: 'XCircle',
  [MedicalOrderState.PARTIALLY_APPROVED]: 'AlertTriangle',
  [MedicalOrderState.PROCESSING]: 'Package',
  [MedicalOrderState.COMPLETED]: 'CheckCircle',
  [MedicalOrderState.CANCELLED]: 'XCircle'
};

// Textos descriptivos para estados
export const STATE_DESCRIPTIONS = {
  [EffectorRequestState.PENDIENTE]: 'Pedido pendiente de auditoría',
  [EffectorRequestState.APROBADO]: 'Pedido aprobado por auditoría',
  [EffectorRequestState.RECHAZADO]: 'Pedido rechazado por auditoría',
  [EffectorRequestState.CANCELADO]: 'Pedido cancelado',
  [EffectorRequestState.EN_COTIZACION]: 'Pedido en proceso de cotización',
  [EffectorRequestState.COTIZADO]: 'Pedido cotizado por proveedores',
  [EffectorRequestState.ADJUDICADO]: 'Pedido adjudicado a proveedor'
};

// Utilidades para verificación de permisos
export const PERMISSIONS = {
  CAN_AUTHORIZE: [RoleId.ADMINISTRADOR, RoleId.AUDITOR],
  CAN_CREATE_MEDICAL_ORDER: [RoleId.ADMINISTRADOR, RoleId.MEDICO, RoleId.AUDITOR],
  CAN_CREATE_EFFECTOR_REQUEST: [RoleId.ADMINISTRADOR, RoleId.EFECTOR],
  CAN_QUOTE: [RoleId.PROVEEDOR],
  CAN_MANAGE_USERS: [RoleId.ADMINISTRADOR],
  CAN_VIEW_ALL_REQUESTS: [RoleId.ADMINISTRADOR, RoleId.AUDITOR]
};

// Función helper para verificar permisos
export const hasPermission = (userRoleId: number, permission: number[]): boolean => {
  return permission.includes(userRoleId);
};

// Función helper para obtener color del estado
export const getStateColor = (state: string): string => {
  return STATE_COLORS[state as keyof typeof STATE_COLORS] || 'bg-gray-100 text-gray-800';
};

// Función helper para verificar si el usuario puede autorizar
export const canUserAuthorize = (userRoleId?: number): boolean => {
  if (!userRoleId) return false;
  return hasPermission(userRoleId, PERMISSIONS.CAN_AUTHORIZE);
};