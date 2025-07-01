import { ApiClient } from '../http/ApiClient';

const apiClient = new ApiClient();

export interface ActivityLog {
  logId: string;
  userId: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  oldValues: any | null;
  newValues: any | null;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string;
  userInfo?: {
    nombre: string;
    email: string;
    role: string;
  };
  metadata?: any;
}

export interface ActivityStats {
  totalActivities: number;
  todayActivities: number;
  weekActivities: number;
  topActions: Array<{ action: string; formattedAction: string; count: number }>;
  topUsers: Array<{ userId: string; userName: string; count: number }>;
}

export interface DashboardActivityData {
  recentActivities: ActivityLog[];
  stats: ActivityStats;
}

export interface PaginatedActivities {
  activities: ActivityLog[];
  total: number;
}

export interface ActivityResponse {
  data: ActivityLog[];
  total: number;
  page: number;
  limit: number;
}

export interface ActivityFilters {
  search?: string;
  entityType?: string;
  action?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface UserSuggestion {
  userId: string;
  userName: string;
  userEmail: string;
}

export class ActivityService {
  private static readonly BASE_URL = '/v1/activities';

  /**
   * MÉTODO OPTIMIZADO - Búsqueda avanzada con filtros
   */
  static async searchWithFilters(
    filters: ActivityFilters, 
    page = 1, 
    limit = 20
  ): Promise<PaginatedActivities> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      )
    });

    return await apiClient.get<PaginatedActivities>(`${this.BASE_URL}/search?${queryParams}`);
  }

  /**
   * Autocompletado de usuarios
   */
  static async getUserSuggestions(search?: string): Promise<UserSuggestion[]> {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return await apiClient.get<UserSuggestion[]>(`${this.BASE_URL}/autocomplete/users${params}`);
  }

  /**
   * Obtener tipos de entidad disponibles
   */
  static async getEntityTypeSuggestions(): Promise<string[]> {
    return await apiClient.get<string[]>(`${this.BASE_URL}/autocomplete/entity-types`);
  }

  /**
   * Obtener acciones disponibles
   */
  static async getActionSuggestions(): Promise<string[]> {
    return await apiClient.get<string[]>(`${this.BASE_URL}/autocomplete/actions`);
  }

  /**
   * Obtiene todas las actividades con filtros y paginación (compatible con ActivitiesPage)
   */
  static async getAll(queryString?: string): Promise<ActivityResponse> {
    let url = this.BASE_URL;
    
    // Si hay parámetros de consulta, usar el endpoint optimizado
    if (queryString) {
      url = `${this.BASE_URL}/search?${queryString}`;
    }
    
    const response = await apiClient.get<PaginatedActivities>(url);
    
    return {
      data: response.activities || [],
      total: response.total || 0,
      page: 1,
      limit: 20
    };
  }

  /**
   * Obtiene todas las actividades con paginación
   */
  static async findAll(page = 1, limit = 20): Promise<PaginatedActivities> {
    return await apiClient.get<PaginatedActivities>(`${this.BASE_URL}?page=${page}&limit=${limit}`);
  }

  /**
   * Obtiene actividades recientes
   */
  static async findRecent(limit = 10): Promise<ActivityLog[]> {
    return await apiClient.get<ActivityLog[]>(`${this.BASE_URL}/recent?limit=${limit}`);
  }

  /**
   * Obtiene estadísticas de actividades
   */
  static async getStats(): Promise<ActivityStats> {
    return await apiClient.get<ActivityStats>(`${this.BASE_URL}/stats`);
  }

  /**
   * Obtiene datos para el dashboard de actividades
   */
  static async getDashboardData(): Promise<DashboardActivityData> {
    return await apiClient.get<DashboardActivityData>(`${this.BASE_URL}/dashboard`);
  }

  /**
   * Obtiene actividades por usuario
   */
  static async findByUserId(userId: string, page = 1, limit = 20): Promise<PaginatedActivities> {
    return await apiClient.get<PaginatedActivities>(`${this.BASE_URL}/user/${userId}?page=${page}&limit=${limit}`);
  }

  /**
   * Obtiene actividades por tipo de acción
   */
  static async findByAction(action: string, page = 1, limit = 20): Promise<PaginatedActivities> {
    return await apiClient.get<PaginatedActivities>(`${this.BASE_URL}/action/${action}?page=${page}&limit=${limit}`);
  }

  /**
   * Obtiene actividades por tipo de entidad
   */
  static async findByEntityType(entityType: string, page = 1, limit = 20): Promise<PaginatedActivities> {
    return await apiClient.get<PaginatedActivities>(`${this.BASE_URL}/entity/${entityType}?page=${page}&limit=${limit}`);
  }

  /**
   * Obtiene actividades en un rango de fechas
   */
  static async findByDateRange(
    startDate: Date,
    endDate: Date,
    page = 1,
    limit = 20
  ): Promise<PaginatedActivities> {
    const start = startDate.toISOString();
    const end = endDate.toISOString();
    return await apiClient.get<PaginatedActivities>(`${this.BASE_URL}/date-range?startDate=${start}&endDate=${end}&page=${page}&limit=${limit}`);
  }

  /**
   * Obtiene actividades del usuario actual
   */
  static async findMyActivities(page = 1, limit = 20): Promise<PaginatedActivities> {
    return await apiClient.get<PaginatedActivities>(`${this.BASE_URL}/my-activities?page=${page}&limit=${limit}`);
  }

  /**
   * Obtiene una actividad por ID
   */
  static async findById(id: string): Promise<ActivityLog | null> {
    try {
      return await apiClient.get<ActivityLog>(`${this.BASE_URL}/${id}`);
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Formatea una actividad para mostrar en la UI
   */
  static formatActivityForUI(activity: ActivityLog): {
    action: string;
    user: string;
    time: string;
    type: string;
    status: 'success' | 'warning' | 'info' | 'error';
  } {
    const formattedAction = this.getFormattedAction(activity.action);
    const userName = activity.userInfo?.nombre || 'Usuario';
    const userRole = activity.userInfo?.role || '';
    const user = userRole ? `${userName} - ${userRole}` : userName;
    const time = this.getRelativeTime(new Date(activity.timestamp));
    const type = this.getActionType(activity.action);
    const status = this.getActionStatus(activity.action);

    return {
      action: formattedAction,
      user,
      time,
      type,
      status,
    };
  }

  private static getFormattedAction(action: string): string {
    const actionMap: Record<string, string> = {
      'USER_CREATED': 'Usuario creado',
      'USER_UPDATED': 'Usuario actualizado',
      'USER_DELETED': 'Usuario eliminado',
      'USER_LOGIN': 'Inicio de sesión',
      'USER_LOGOUT': 'Cierre de sesión',
      'EFFECTOR_REQUEST_CREATED': 'Pedido de efector creado',
      'EFFECTOR_REQUEST_UPDATED': 'Pedido de efector actualizado',
      'EFFECTOR_REQUEST_APPROVED': 'Pedido de efector aprobado',
      'EFFECTOR_REQUEST_REJECTED': 'Pedido de efector rechazado',
      'MEDICAL_ORDER_CREATED': 'Pedido médico creado',
      'MEDICAL_ORDER_AUTHORIZED': 'Pedido médico autorizado',
      'MEDICAL_ORDER_REJECTED': 'Pedido médico rechazado',
      'MEDICAL_ORDER_AI_ANALYZED': 'Pedido médico analizado por IA',
      'PROVIDER_CREATED': 'Proveedor creado',
      'PROVIDER_UPDATED': 'Proveedor actualizado',
      'QUOTATION_CREATED': 'Cotización creada',
      'QUOTATION_UPDATED': 'Cotización actualizada',
      'AUDIT_COMPLETED': 'Auditoría completada',
      'SYSTEM_MAINTENANCE': 'Mantenimiento del sistema',
    };

    return actionMap[action] || action;
  }

  private static getActionType(action: string): string {
    if (action.includes('CREATED')) return 'create';
    if (action.includes('UPDATED')) return 'update';
    if (action.includes('DELETED')) return 'delete';
    if (action.includes('LOGIN') || action.includes('LOGOUT')) return 'auth';
    if (action.includes('APPROVED') || action.includes('REJECTED') || action.includes('AUTHORIZED')) return 'approval';
    return 'system';
  }

  private static getActionStatus(action: string): 'success' | 'warning' | 'info' | 'error' {
    if (action.includes('APPROVED') || action.includes('AUTHORIZED') || action.includes('CREATED')) return 'success';
    if (action.includes('REJECTED') || action.includes('DELETED')) return 'warning';
    if (action.includes('LOGIN') || action.includes('UPDATED')) return 'info';
    return 'info';
  }

  private static getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Hace menos de un minuto';
    if (diffMinutes < 60) return `Hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-ES');
  }
} 