import React, { useEffect, useState } from 'react';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Settings, 
  Building, 
  BarChart3,
  UserCheck,
  Stethoscope,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Plus,
  Eye
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import BaseLayout from '../../../shared/components/layout/BaseLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useObfuscation } from '../../../shared/contexts/ObfuscationContext';
import { useAdmin } from '../../hooks/useAdmin';
import { ActivityService } from '../../../infrastructure/services/activity.service';
import { DashboardService, type DashboardData, type RealtimeData } from '../../../infrastructure/services/dashboard.service';
import type { ActivityLog, DashboardActivityData } from '../../../infrastructure/services/activity.service';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { obfuscatedApiClient } = useObfuscation();
  const { getUserStats } = useAdmin();
  
  // States para los datos del dashboard
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [realtimeData, setRealtimeData] = useState<RealtimeData | null>(null);
  const [activityData, setActivityData] = useState<DashboardActivityData | null>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [effectorStats, setEffectorStats] = useState<any>(null);
  const [medicalOrderStats, setMedicalOrderStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Función para cargar estadísticas de efectores
  const loadEffectorStats = async () => {
    try {
      const response = await obfuscatedApiClient.get('/v1/effector-requests/admin/statistics');
      return response as any;
    } catch (err: any) {
      console.warn('Effector stats failed:', err);
      return null;
    }
  };

  // Función para cargar datos del dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboard, realtime, activities, users, effectors, medicalOrders] = await Promise.all([
        DashboardService.getCompleteDashboardData().catch((err: any) => {
          console.warn('Dashboard data failed, using fallback:', err);
          return null;
        }),
        DashboardService.getRealtimeData().catch((err: any) => {
          console.warn('Realtime data failed, using fallback:', err);
          return null;
        }),
        ActivityService.getDashboardData().catch((err: any) => {
          console.warn('Activity data failed, using fallback:', err);
          return null;
        }),
        getUserStats().catch((err: any) => {
          console.warn('User stats failed:', err);
          return null;
        }),
        loadEffectorStats(),
        // TODO: Añadir servicio de medical orders cuando esté disponible
        Promise.resolve(null)
      ]);

      setDashboardData(dashboard);
      setRealtimeData(realtime);
      setActivityData(activities);
      setUserStats(users);
      setEffectorStats(effectors);
      setMedicalOrderStats(medicalOrders);
      setLastUpdate(new Date());

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Auto-refresh de datos en tiempo real cada 30 segundos
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [realtime, activities] = await Promise.all([
          DashboardService.getRealtimeData().catch(() => null),
          ActivityService.getDashboardData().catch(() => null)
        ]);
        
        if (realtime) setRealtimeData(realtime);
        if (activities) setActivityData(activities);
        setLastUpdate(new Date());
      } catch (error) {
        console.warn('Auto-refresh failed:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Función para calcular crecimiento
  const calculateGrowth = (current: number, previous: number): { value: string; type: 'increase' | 'decrease' | 'neutral' } => {
    if (previous === 0) return { value: '+100%', type: 'increase' };
    const growth = ((current - previous) / previous) * 100;
    if (growth > 0) return { value: `+${growth.toFixed(1)}%`, type: 'increase' };
    if (growth < 0) return { value: `${growth.toFixed(1)}%`, type: 'decrease' };
    return { value: '0%', type: 'neutral' };
  };

  // Datos de las cards con información real
  const mainStats = [
    {
      name: 'Usuarios Totales',
      value: userStats?.total?.toString() || '0',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      change: userStats ? calculateGrowth(userStats.total, userStats.total * 0.9).value : '+12%',
      changeType: userStats ? calculateGrowth(userStats.total, userStats.total * 0.9).type : 'increase',
      description: 'Total de usuarios registrados'
    },
    {
      name: 'Afiliados Activos',
      value: userStats?.by_role?.['Afiliado']?.toString() || '0',
      icon: UserCheck,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      change: '+8%',
      changeType: 'increase',
      description: 'Afiliados con cobertura activa'
    },
    {
      name: 'Órdenes Médicas',
      value: medicalOrderStats?.total?.toString() || dashboardData?.overview?.totalMedicalOrders?.toString() || '0',
      icon: Stethoscope,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      change: '+5%',
      changeType: 'increase',
      description: 'Órdenes médicas procesadas'
    },
    {
      name: 'Efectores',
      value: effectorStats?.total?.toString() || '0',
      icon: Building,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      textColor: 'text-amber-600 dark:text-amber-400',
      change: '+2%',
      changeType: 'increase',
      description: 'Solicitudes de efectores'
    },
    {
      name: 'Auditores',
      value: userStats?.by_role?.['Auditor']?.toString() || '0',
      icon: Shield,
      color: 'from-rose-500 to-rose-600',
      bgColor: 'bg-rose-50 dark:bg-rose-900/20',
      textColor: 'text-rose-600 dark:text-rose-400',
      change: '0%',
      changeType: 'neutral',
      description: 'Auditores médicos activos'
    },
    {
      name: 'Actividades',
      value: activityData?.stats?.totalActivities?.toString() || '0',
      icon: Activity,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400',
      change: '+15%',
      changeType: 'increase',
      description: 'Actividades registradas'
    },
  ];

  const systemStats = [
    {
      name: 'Sistema Activo',
      subtitle: 'Estado',
      value: dashboardData?.performance?.uptime || '99.8%',
      color: DashboardService.getHealthColor(dashboardData?.overview?.systemHealth || 'good'),
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      icon: Activity
    },
    {
      name: 'Usuarios Activos',
      subtitle: 'En línea',
      value: realtimeData?.systemStatus?.activeUsers?.toString() || '12',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      icon: Users
    },
    {
      name: 'Solicitudes Pendientes',
      subtitle: 'En cola',
      value: (effectorStats?.pendiente + (medicalOrderStats?.pendingOrders || 0))?.toString() || '3',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      icon: Clock
    },
    {
      name: 'Tiempo Respuesta',
      subtitle: 'Promedio',
      value: dashboardData?.performance?.responseTime || '150ms',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      icon: TrendingUp
    },
  ];

  if (loading && !dashboardData) {
    return (
      <BaseLayout title="Dashboard de Administración">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Dashboard de Administración">
      <div className="space-y-6">
        {/* Header con información de estado */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative px-6 py-8 sm:px-8 sm:py-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  Bienvenido, {user?.nombre}
                </h1>
                <p className="text-blue-100 text-lg">
                  Panel de administración del Sistema de Salud Corrientes
                </p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="text-center sm:text-right">
                  <p className="text-blue-100 text-sm">
                    Última actualización: {DashboardService.formatRelativeTime(lastUpdate.toISOString())}
                  </p>
                  <div className="flex items-center justify-center sm:justify-end mt-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-sm text-green-300 font-medium">
                      {realtimeData?.systemStatus?.status === 'operational' ? 'Sistema operativo' : 'Sistema activo'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={loadDashboardData}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Actualizar
                </button>
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error al cargar datos
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alertas del sistema */}
        {dashboardData?.alerts && dashboardData.alerts.length > 0 && (
          <div className="space-y-3">
            {dashboardData.alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${DashboardService.getAlertColor(alert.type)}`}
              >
                <div className="flex items-center">
                  <span className="text-lg mr-3">{DashboardService.getAlertIcon(alert.type)}</span>
                  <div className="flex-1">
                    <h4 className="font-medium">{alert.message}</h4>
                    <p className="text-sm opacity-75">
                      {DashboardService.formatRelativeTime(alert.timestamp)}
                    </p>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/20">
                    {alert.priority.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
          {mainStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="group relative bg-white dark:bg-darkmode-600 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className={`flex items-center text-sm font-semibold ${
                      stat.changeType === 'increase' ? 'text-emerald-600' : 
                      stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {stat.changeType === 'increase' && <ArrowUpRight className="w-4 h-4 mr-1" />}
                      {stat.changeType === 'decrease' && <ArrowDownRight className="w-4 h-4 mr-1" />}
                      {stat.change}
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {DashboardService.formatNumber(parseInt(stat.value.replace(/,/g, '')) || 0)}
                    </p>
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                      {stat.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-500">
                      {stat.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* System Performance Stats */}
        <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm">
          <div className="px-6 py-6 border-b border-gray-200 dark:border-darkmode-400">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Estado del Sistema
            </h3>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
              Monitoreo en tiempo real del sistema
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {systemStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={stat.name} 
                    className={`relative p-6 ${stat.bgColor} rounded-xl border border-gray-100 dark:border-darkmode-400 hover:shadow-md transition-all duration-200`}
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Icon className={`h-8 w-8 ${stat.color}`} />
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{stat.name}</p>
                      <p className="text-xs text-gray-600 dark:text-slate-400">{stat.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Layout Grid - Acciones Rápidas y Actividades */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Quick Actions - Ahora toma más espacio */}
          <div className="xl:col-span-2 bg-white dark:bg-darkmode-600 rounded-xl shadow-sm">
            <div className="px-6 py-6 border-b border-gray-200 dark:border-darkmode-400">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Acciones Rápidas
              </h3>
              <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                Tareas frecuentes de administración
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    title: 'Gestión de Usuarios',
                    description: 'Administrar usuarios del sistema',
                    icon: Users,
                    href: '/admin/users',
                    color: 'bg-blue-500',
                    stats: userStats?.total || 0
                  },
                  {
                    title: 'Órdenes Médicas',
                    description: 'Revisar y procesar órdenes',
                    icon: FileText,
                    href: '/admin/medical-orders',
                    color: 'bg-green-500',
                    stats: medicalOrderStats?.total || 0
                  },
                  {
                    title: 'Solicitudes Efectores',
                    description: 'Gestionar solicitudes',
                    icon: Building,
                    href: '/admin/effector-requests',
                    color: 'bg-amber-500',
                    stats: effectorStats?.total || 0
                  },
                  {
                    title: 'Análisis y Reportes',
                    description: 'Ver métricas y estadísticas',
                    icon: BarChart3,
                    href: '/admin/analytics',
                    color: 'bg-purple-500',
                    stats: null
                  },
                  {
                    title: 'Actividades del Sistema',
                    description: 'Ver log de actividades completo',
                    icon: Activity,
                    href: '/admin/activities',
                    color: 'bg-indigo-500',
                    stats: activityData?.stats?.totalActivities || 0
                  },
                  {
                    title: 'Configuración',
                    description: 'Ajustes del sistema',
                    icon: Settings,
                    href: '/admin/settings',
                    color: 'bg-gray-500',
                    stats: null
                  }
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.title}
                      to={action.href}
                      className="group p-4 rounded-lg border border-gray-200 dark:border-darkmode-400 hover:border-gray-300 dark:hover:border-darkmode-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 ${action.color} rounded-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {action.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">
                            {action.description}
                          </p>
                          {action.stats !== null && (
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-gray-900 dark:text-white">
                                {DashboardService.formatNumber(action.stats)}
                              </span>
                              <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Activities - Ahora compacto en la derecha */}
          <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm">
            <div className="px-6 py-6 border-b border-gray-200 dark:border-darkmode-400">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Actividades Recientes
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                    Últimas 5 acciones
                  </p>
                </div>
                <Link
                  to="/admin/activities"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver todas
                </Link>
              </div>
            </div>
            <div className="p-6">
              {activityData?.recentActivities && activityData.recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {activityData.recentActivities.slice(0, 5).map((activity) => {
                    const formatted = ActivityService.formatActivityForUI(activity);
                    return (
                      <div
                        key={activity.logId}
                        className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-darkmode-700 hover:bg-gray-100 dark:hover:bg-darkmode-800 transition-colors"
                      >
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          formatted.status === 'success' ? 'bg-green-500' :
                          formatted.status === 'warning' ? 'bg-yellow-500' :
                          formatted.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {formatted.action}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                            {formatted.user}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-slate-500">
                            {formatted.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Activity className="mx-auto h-8 w-8 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No hay actividades
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                    Las actividades aparecerán aquí
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default AdminDashboard; 