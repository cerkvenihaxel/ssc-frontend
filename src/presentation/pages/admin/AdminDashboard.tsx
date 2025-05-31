import React from 'react';
import { Users, FileText, TrendingUp, Settings, Building, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import BaseLayout from '../../../shared/components/layout/BaseLayout';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      name: 'Usuarios Totales',
      value: '156',
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase',
    },
    {
      name: 'Pedidos Activos',
      value: '23',
      icon: FileText,
      color: 'bg-green-500',
      change: '+5%',
      changeType: 'increase',
    },
    {
      name: 'Proveedores',
      value: '45',
      icon: Building,
      color: 'bg-yellow-500',
      change: '+2%',
      changeType: 'increase',
    },
    {
      name: 'Configuraciones',
      value: '8',
      icon: Settings,
      color: 'bg-purple-500',
      change: '0%',
      changeType: 'neutral',
    },
  ];

  const quickActions = [
    {
      title: 'Gestionar Usuarios',
      description: 'Administrar usuarios del sistema',
      href: '/admin/users',
      color: 'bg-primary',
      icon: '👥',
    },
    {
      title: 'Estadísticas de Usuarios',
      description: 'Ver estadísticas y distribución',
      href: '/admin/users/stats',
      color: 'bg-info',
      icon: '📊',
    },
    {
      title: 'Gestionar Proveedores',
      description: 'Administrar proveedores',
      href: '/admin/users/providers',
      color: 'bg-warning',
      icon: '🏢',
    },
    {
      title: 'Ver Pedidos',
      description: 'Revisar pedidos pendientes',
      href: '/admin/requests',
      color: 'bg-success',
      icon: '📋',
    },
    {
      title: 'Analytics',
      description: 'Ver reportes y métricas',
      href: '/admin/analytics',
      color: 'bg-danger',
      icon: '📈',
    },
    {
      title: 'Configuración',
      description: 'Configurar el sistema',
      href: '/admin/settings',
      color: 'bg-secondary',
      icon: '⚙️',
    },
  ];

  return (
    <BaseLayout title="Dashboard Administrativo">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bienvenido, {user?.nombre}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
            Panel de administración del Vada Health
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="bg-white dark:bg-darkmode-600 overflow-hidden shadow rounded-lg"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`${stat.color} p-3 rounded-md`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                          {stat.name}
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {stat.value}
                          </div>
                          <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                            stat.changeType === 'increase' ? 'text-green-600' : 
                            stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {stat.change}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Acciones Rápidas
            </h3>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  to={action.href}
                  className="group relative bg-white dark:bg-darkmode-700 p-6 rounded-lg border border-gray-200 dark:border-darkmode-400 hover:shadow-md transition-shadow duration-200"
                >
                  <div className={`${action.color} w-10 h-10 rounded-md flex items-center justify-center mb-4`}>
                    <span className="text-white text-lg">{action.icon}</span>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-primary">
                    {action.title}
                  </h4>
                  <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                    {action.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Actividad Reciente
            </h3>
            <div className="mt-5">
              <div className="flow-root">
                <ul className="-mb-8">
                  {[
                    { action: 'Usuario creado', user: 'Dr. Juan Pérez', time: 'Hace 2 horas' },
                    { action: 'Pedido aprobado', user: 'Hospital Central', time: 'Hace 4 horas' },
                    { action: 'Proveedor registrado', user: 'Farmacia Nueva', time: 'Hace 1 día' },
                  ].map((item, index) => (
                    <li key={index}>
                      <div className="relative pb-8">
                        {index !== 2 && (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-darkmode-400"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-primary flex items-center justify-center ring-8 ring-white dark:ring-darkmode-600">
                              <span className="text-white text-sm">•</span>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-slate-400">
                                {item.action} - <span className="font-medium text-gray-900 dark:text-white">{item.user}</span>
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-slate-400">
                              {item.time}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default AdminDashboard; 