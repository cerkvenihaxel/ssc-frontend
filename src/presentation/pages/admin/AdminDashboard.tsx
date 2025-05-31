import React from 'react';
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
  ArrowDownRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import BaseLayout from '../../../shared/components/layout/BaseLayout';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const mainStats = [
    {
      name: 'Usuarios Totales',
      value: '2,456',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      change: '+12%',
      changeType: 'increase',
      description: 'Total de usuarios registrados'
    },
    {
      name: 'Afiliados Activos',
      value: '1,892',
      icon: UserCheck,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      change: '+8%',
      changeType: 'increase',
      description: 'Afiliados con cobertura activa'
    },
    {
      name: 'Médicos Registrados',
      value: '324',
      icon: Stethoscope,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      change: '+5%',
      changeType: 'increase',
      description: 'Profesionales de la salud'
    },
    {
      name: 'Efectores',
      value: '78',
      icon: Building,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      textColor: 'text-amber-600 dark:text-amber-400',
      change: '+2%',
      changeType: 'increase',
      description: 'Instituciones de salud'
    },
    {
      name: 'Auditores',
      value: '45',
      icon: Shield,
      color: 'from-rose-500 to-rose-600',
      bgColor: 'bg-rose-50 dark:bg-rose-900/20',
      textColor: 'text-rose-600 dark:text-rose-400',
      change: '0%',
      changeType: 'neutral',
      description: 'Auditores médicos activos'
    },
    {
      name: 'Pedidos Pendientes',
      value: '156',
      icon: FileText,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400',
      change: '-3%',
      changeType: 'decrease',
      description: 'Autorizaciones pendientes'
    },
  ];

  const systemStats = [
    {
      name: 'Pedidos Aprobados',
      subtitle: 'Hoy',
      value: '89',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      icon: CheckCircle
    },
    {
      name: 'Tiempo Promedio',
      subtitle: 'Respuesta',
      value: '2.4h',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      icon: Clock
    },
    {
      name: 'Alertas Críticas',
      subtitle: 'Activas',
      value: '3',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      icon: AlertTriangle
    },
    {
      name: 'Sistema Activo',
      subtitle: 'Uptime',
      value: '99.8%',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      icon: Activity
    },
  ];

  const quickActions = [
    {
      title: 'Gestionar Usuarios',
      description: 'Administrar usuarios del sistema',
      href: '/admin/users',
      gradient: 'from-blue-500 to-blue-600',
      icon: Users,
    },
    {
      title: 'Estadísticas',
      description: 'Ver estadísticas y distribución',
      href: '/admin/users/stats',
      gradient: 'from-indigo-500 to-indigo-600',
      icon: BarChart3,
    },
    {
      title: 'Proveedores',
      description: 'Administrar proveedores',
      href: '/admin/users/providers',
      gradient: 'from-amber-500 to-amber-600',
      icon: Building,
    },
    {
      title: 'Ver Pedidos',
      description: 'Revisar pedidos pendientes',
      href: '/admin/requests',
      gradient: 'from-emerald-500 to-emerald-600',
      icon: FileText,
    },
    {
      title: 'Analytics Médicos',
      description: 'Ver reportes y métricas médicas',
      href: '/admin/analytics',
      gradient: 'from-red-500 to-red-600',
      icon: TrendingUp,
    },
    {
      title: 'Auditoría',
      description: 'Gestionar procesos de auditoría',
      href: '/admin/audit',
      gradient: 'from-purple-500 to-purple-600',
      icon: Shield,
    },
    {
      title: 'Efectores',
      description: 'Administrar instituciones de salud',
      href: '/admin/users/effectors',
      gradient: 'from-teal-500 to-teal-600',
      icon: Building,
    },
    {
      title: 'Configuración',
      description: 'Configurar el sistema',
      href: '/admin/settings',
      gradient: 'from-gray-500 to-gray-600',
      icon: Settings,
    },
  ];

  const recentActivities = [
    { 
      action: 'Autorización médica aprobada', 
      user: 'Dr. Juan Pérez - Hospital Central', 
      time: 'Hace 5 min',
      type: 'approval',
      status: 'success'
    },
    { 
      action: 'Nuevo médico registrado', 
      user: 'Dra. María González - Clínica San Luis', 
      time: 'Hace 15 min',
      type: 'registration',
      status: 'info'
    },
    { 
      action: 'Auditoría completada', 
      user: 'Lic. Carlos Rodríguez - Auditoria Médica', 
      time: 'Hace 1 hora',
      type: 'audit',
      status: 'success'
    },
    { 
      action: 'Pedido rechazado por documentación', 
      user: 'Hospital Regional Norte', 
      time: 'Hace 2 horas',
      type: 'rejection',
      status: 'warning'
    },
    { 
      action: 'Nuevo efector registrado', 
      user: 'Centro de Salud La Esperanza', 
      time: 'Hace 4 horas',
      type: 'registration',
      status: 'info'
    },
  ];

  return (
    <BaseLayout title="Dashboard Administrativo">
      <div className="min-h-screen bg-gray-50 dark:bg-darkmode-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          {/* Welcome Section */}
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
                      Último acceso: {new Date().toLocaleDateString('es-AR')}
                    </p>
                    <div className="flex items-center justify-center sm:justify-end mt-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-sm text-green-300 font-medium">Sistema operativo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          </div>

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
                        {stat.value}
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

          {/* Quick Actions */}
          <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm">
            <div className="px-6 py-6 border-b border-gray-200 dark:border-darkmode-400">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Acciones Rápidas
              </h3>
              <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                Acceso directo a las funciones principales
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.title}
                      to={action.href}
                      className="group relative bg-gray-50 dark:bg-darkmode-700 rounded-xl p-6 border border-gray-200 dark:border-darkmode-400 hover:shadow-lg hover:border-transparent transition-all duration-300 transform hover:-translate-y-1"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex flex-col h-full">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors duration-200">
                          {action.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mt-2 flex-1">
                          {action.description}
                        </p>
                        <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          Acceder
                          <ArrowUpRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Grid - Activity and Alerts */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="xl:col-span-2 bg-white dark:bg-darkmode-600 rounded-xl shadow-sm">
              <div className="px-6 py-6 border-b border-gray-200 dark:border-darkmode-400">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Actividad Reciente
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                      Últimas acciones en el sistema
                    </p>
                  </div>
                  <Link 
                    to="/admin/activity" 
                    className="text-sm text-primary hover:text-primary-dark font-medium flex items-center group"
                  >
                    Ver todas
                    <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
              </div>
              <div className="p-6">
                <div className="flow-root">
                  <ul className="space-y-6">
                    {recentActivities.map((item, index) => (
                      <li key={index} className="relative flex space-x-4">
                        <div className="flex-shrink-0">
                          <span className={`h-10 w-10 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-darkmode-600 ${
                            item.status === 'success' ? 'bg-emerald-500' :
                            item.status === 'warning' ? 'bg-amber-500' :
                            item.status === 'info' ? 'bg-blue-500' : 'bg-gray-500'
                          }`}>
                            <span className="text-white text-sm font-medium">
                              {item.status === 'success' ? '✓' :
                               item.status === 'warning' ? '!' :
                               item.status === 'info' ? 'i' : '•'}
                            </span>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {item.action}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                                {item.user}
                              </p>
                            </div>
                            <time className="text-xs text-gray-500 dark:text-slate-500 whitespace-nowrap">
                              {item.time}
                            </time>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Alerts Section */}
            <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm">
              <div className="px-6 py-6 border-b border-gray-200 dark:border-darkmode-400">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Alertas Críticas
                </h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                  Requieren atención inmediata
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="relative p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                        3 pedidos críticos
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                        Requieren atención inmediata
                      </p>
                      <Link 
                        to="/admin/requests?priority=critical" 
                        className="text-xs text-red-700 hover:text-red-900 font-medium mt-2 inline-flex items-center"
                      >
                        Revisar ahora
                        <ArrowUpRight className="w-3 h-3 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
                
                <div className="relative p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                        15 autorizaciones próximas a vencer
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">
                        En los próximos 7 días
                      </p>
                      <Link 
                        to="/admin/authorizations?status=expiring" 
                        className="text-xs text-amber-700 hover:text-amber-900 font-medium mt-2 inline-flex items-center"
                      >
                        Ver detalles
                        <ArrowUpRight className="w-3 h-3 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="relative p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <div className="flex items-start">
                    <Activity className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                        Mantenimiento programado
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                        Domingo 2:00 AM - 4:00 AM
                      </p>
                      <Link 
                        to="/admin/maintenance" 
                        className="text-xs text-blue-700 hover:text-blue-900 font-medium mt-2 inline-flex items-center"
                      >
                        Ver programación
                        <ArrowUpRight className="w-3 h-3 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default AdminDashboard; 