import { ApiClient } from '../http/ApiClient';

const apiClient = new ApiClient();

export interface DashboardData {
  timestamp: string;
  overview: {
    totalUsers: number;
    totalMedicalOrders: number;
    totalEffectorRequests: number;
    totalActivities: number;
    systemHealth: string;
  };
  users: any;
  medicalOrders: any;
  effectorRequests: any;
  activities: any;
  performance: {
    avgProcessingTime: number;
    successRate: number;
    uptime: string;
    responseTime: string;
  };
  alerts: Array<{
    type: string;
    message: string;
    priority: string;
    timestamp: string;
  }>;
  trends: any;
}

export interface RealtimeData {
  timestamp: string;
  recentActivities: any[];
  liveStats: {
    activeUsers: number;
    pendingRequests: number;
    processingQueue: number;
    responseTime: number;
    errorRate: number;
  };
  systemStatus: {
    status: string;
    activeUsers: number;
    pendingRequests: number;
    processingQueue: number;
  };
}

export interface ExecutiveSummary {
  period: {
    from: string;
    to: string;
  };
  kpis: {
    totalUsers: number;
    newUsers: number;
    totalOrders: number;
    approvedOrders: number;
    totalActivity: number;
    systemUptime: number;
  };
  growth: {
    users: number;
    orders: number;
    activity: number;
    efficiency: number;
  };
  priorities: string[];
}

export class DashboardService {
  private static readonly BASE_URL = '/v1/dashboard';

  /**
   * Obtiene todos los datos del dashboard principal
   */
  static async getCompleteDashboardData(): Promise<DashboardData> {
    return await apiClient.get<DashboardData>(this.BASE_URL);
  }

  /**
   * Obtiene datos en tiempo real del dashboard
   */
  static async getRealtimeData(): Promise<RealtimeData> {
    return await apiClient.get<RealtimeData>(`${this.BASE_URL}/realtime`);
  }

  /**
   * Obtiene resumen ejecutivo del dashboard
   */
  static async getExecutiveSummary(): Promise<ExecutiveSummary> {
    return await apiClient.get<ExecutiveSummary>(`${this.BASE_URL}/summary`);
  }

  /**
   * Formatea un valor numérico para mostrar en la UI
   */
  static formatNumber(value: number, locale: string = 'es-AR'): string {
    return new Intl.NumberFormat(locale).format(value);
  }

  /**
   * Formatea un porcentaje para mostrar en la UI
   */
  static formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
  }

  /**
   * Formatea una fecha relativa (hace X tiempo)
   */
  static formatRelativeTime(timestamp: string, locale: string = 'es'): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'hace unos segundos';
    if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)} días`;
    
    return date.toLocaleDateString(locale);
  }

  /**
   * Obtiene el color CSS para el estado de salud del sistema
   */
  static getHealthColor(health: string): string {
    const colors = {
      'excellent': 'text-green-600',
      'good': 'text-blue-600',
      'fair': 'text-yellow-600',
      'needs_attention': 'text-red-600'
    };
    return colors[health as keyof typeof colors] || 'text-gray-600';
  }

  /**
   * Obtiene el icono para el tipo de alerta
   */
  static getAlertIcon(type: string): string {
    const icons = {
      'error': '❌',
      'warning': '⚠️',
      'info': 'ℹ️',
      'success': '✅'
    };
    return icons[type as keyof typeof icons] || 'ℹ️';
  }

  /**
   * Obtiene el color CSS para el tipo de alerta
   */
  static getAlertColor(type: string): string {
    const colors = {
      'error': 'bg-red-50 border-red-200 text-red-800',
      'warning': 'bg-yellow-50 border-yellow-200 text-yellow-800',
      'info': 'bg-blue-50 border-blue-200 text-blue-800',
      'success': 'bg-green-50 border-green-200 text-green-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-50 border-gray-200 text-gray-800';
  }
} 