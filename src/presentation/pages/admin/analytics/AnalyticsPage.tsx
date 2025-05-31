import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Users, FileText, DollarSign, Calendar, Download, Filter } from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import LoadingSpinner from '../../../../shared/components/ui/LoadingSpinner';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalRequests: number;
    totalProviders: number;
    totalRevenue: number;
    userGrowth: number;
    requestGrowth: number;
    providerGrowth: number;
    revenueGrowth: number;
  };
  usersByRole: Array<{ role: string; count: number; percentage: number }>;
  requestsByStatus: Array<{ status: string; count: number; percentage: number }>;
  monthlyRequests: Array<{ month: string; requests: number; amount: number }>;
  topProviders: Array<{ name: string; requests: number; amount: number }>;
  recentActivity: Array<{ 
    id: string; 
    action: string; 
    user: string; 
    timestamp: string; 
    type: 'user' | 'request' | 'provider' | 'system';
  }>;
}

const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('last30days');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setData({
        overview: {
          totalUsers: 156,
          totalRequests: 342,
          totalProviders: 45,
          totalRevenue: 2850000,
          userGrowth: 12.5,
          requestGrowth: 8.3,
          providerGrowth: 4.2,
          revenueGrowth: 15.7
        },
        usersByRole: [
          { role: 'Médicos', count: 45, percentage: 28.8 },
          { role: 'Afiliados', count: 38, percentage: 24.4 },
          { role: 'Proveedores', count: 35, percentage: 22.4 },
          { role: 'Efectores', count: 28, percentage: 17.9 },
          { role: 'Auditores', count: 8, percentage: 5.1 },
          { role: 'Administradores', count: 2, percentage: 1.3 }
        ],
        requestsByStatus: [
          { status: 'Completados', count: 145, percentage: 42.4 },
          { status: 'En Proceso', count: 78, percentage: 22.8 },
          { status: 'Pendientes', count: 65, percentage: 19.0 },
          { status: 'Aprobados', count: 34, percentage: 9.9 },
          { status: 'Rechazados', count: 20, percentage: 5.8 }
        ],
        monthlyRequests: [
          { month: 'Ene', requests: 28, amount: 450000 },
          { month: 'Feb', requests: 32, amount: 520000 },
          { month: 'Mar', requests: 41, amount: 680000 },
          { month: 'Abr', requests: 38, amount: 590000 },
          { month: 'May', requests: 45, amount: 720000 },
          { month: 'Jun', requests: 52, amount: 830000 }
        ],
        topProviders: [
          { name: 'Farmacia Central', requests: 45, amount: 580000 },
          { name: 'Laboratorio San José', requests: 38, amount: 520000 },
          { name: 'Equipos Médicos SA', requests: 32, amount: 480000 },
          { name: 'Insumos Hospitalarios', requests: 28, amount: 390000 },
          { name: 'Farmacia Nueva Vida', requests: 25, amount: 350000 }
        ],
        recentActivity: [
          { id: '1', action: 'Usuario creado', user: 'Dr. Carlos Méndez', timestamp: '2024-01-15T14:30:00Z', type: 'user' },
          { id: '2', action: 'Pedido aprobado', user: 'Hospital Regional', timestamp: '2024-01-15T13:45:00Z', type: 'request' },
          { id: '3', action: 'Proveedor registrado', user: 'Farmacia Norte', timestamp: '2024-01-15T12:20:00Z', type: 'provider' },
          { id: '4', action: 'Cotización enviada', user: 'Laboratorio Central', timestamp: '2024-01-15T11:15:00Z', type: 'request' },
          { id: '5', action: 'Usuario desactivado', user: 'Enf. María López', timestamp: '2024-01-15T10:30:00Z', type: 'user' }
        ]
      });
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="w-4 h-4" />;
      case 'request': return <FileText className="w-4 h-4" />;
      case 'provider': return <BarChart3 className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300';
      case 'request': return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300';
      case 'provider': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <BaseLayout title="Reportes y Analytics">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </BaseLayout>
    );
  }

  if (!data) return null;

  return (
    <BaseLayout title="Reportes y Analytics">
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Reportes y Analytics
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              Análisis completo del sistema y métricas de rendimiento
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-darkmode-400 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-darkmode-800 dark:text-white"
            >
              <option value="last7days">Últimos 7 días</option>
              <option value="last30days">Últimos 30 días</option>
              <option value="last90days">Últimos 90 días</option>
              <option value="last12months">Últimos 12 meses</option>
            </select>
            <Button className="inline-flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Total Usuarios',
              value: data.overview.totalUsers,
              growth: data.overview.userGrowth,
              icon: Users,
              color: 'bg-blue-500'
            },
            {
              title: 'Total Pedidos',
              value: data.overview.totalRequests,
              growth: data.overview.requestGrowth,
              icon: FileText,
              color: 'bg-green-500'
            },
            {
              title: 'Proveedores',
              value: data.overview.totalProviders,
              growth: data.overview.providerGrowth,
              icon: BarChart3,
              color: 'bg-yellow-500'
            },
            {
              title: 'Ingresos',
              value: data.overview.totalRevenue,
              growth: data.overview.revenueGrowth,
              icon: DollarSign,
              color: 'bg-purple-500',
              isCurrency: true
            }
          ].map((metric, index) => {
            const Icon = metric.icon;
            const isPositive = metric.growth > 0;
            
            return (
              <div key={index} className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">
                      {metric.title}
                    </p>
                    <div className="flex items-baseline mt-2">
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {metric.isCurrency 
                          ? formatCurrency(metric.value)
                          : metric.value.toLocaleString()
                        }
                      </p>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isPositive ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        {Math.abs(metric.growth)}%
                      </div>
                    </div>
                  </div>
                  <div className={`${metric.color} p-3 rounded-md`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users by Role */}
          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Usuarios por Rol
              </h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {data.usersByRole.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ 
                        backgroundColor: [
                          '#3B82F6', '#10B981', '#F59E0B', 
                          '#EF4444', '#8B5CF6', '#6B7280'
                        ][index % 6] 
                      }}
                    />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {item.role}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-white mr-2">
                      {item.count}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Requests by Status */}
          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Pedidos por Estado
              </h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {data.requestsByStatus.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ 
                        backgroundColor: [
                          '#10B981', '#3B82F6', '#F59E0B', 
                          '#8B5CF6', '#EF4444'
                        ][index % 5] 
                      }}
                    />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-white mr-2">
                      {item.count}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Tendencias Mensuales
            </h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Requests Chart */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-4">
                Pedidos por Mes
              </h4>
              <div className="space-y-3">
                {data.monthlyRequests.map((item, index) => {
                  const maxRequests = Math.max(...data.monthlyRequests.map(r => r.requests));
                  const width = (item.requests / maxRequests) * 100;
                  
                  return (
                    <div key={index} className="flex items-center">
                      <div className="w-8 text-xs text-gray-500 dark:text-slate-400">
                        {item.month}
                      </div>
                      <div className="flex-1 ml-3">
                        <div className="bg-gray-200 dark:bg-darkmode-400 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-8 text-xs text-gray-900 dark:text-white text-right">
                        {item.requests}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Revenue Chart */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-4">
                Ingresos por Mes
              </h4>
              <div className="space-y-3">
                {data.monthlyRequests.map((item, index) => {
                  const maxAmount = Math.max(...data.monthlyRequests.map(r => r.amount));
                  const width = (item.amount / maxAmount) * 100;
                  
                  return (
                    <div key={index} className="flex items-center">
                      <div className="w-8 text-xs text-gray-500 dark:text-slate-400">
                        {item.month}
                      </div>
                      <div className="flex-1 ml-3">
                        <div className="bg-gray-200 dark:bg-darkmode-400 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-16 text-xs text-gray-900 dark:text-white text-right">
                        ${(item.amount / 1000)}k
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Providers */}
          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Top Proveedores
              </h3>
              <Button variant="outline-primary" size="sm">
                Ver todos
              </Button>
            </div>
            <div className="space-y-4">
              {data.topProviders.map((provider, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-darkmode-700 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {provider.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">
                      {provider.requests} pedidos
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(provider.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Actividad Reciente
              </h3>
              <Button variant="outline-primary" size="sm">
                Ver todas
              </Button>
            </div>
            <div className="space-y-4">
              {data.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.action} - <span className="font-medium">{activity.user}</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {new Date(activity.timestamp).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default AnalyticsPage; 