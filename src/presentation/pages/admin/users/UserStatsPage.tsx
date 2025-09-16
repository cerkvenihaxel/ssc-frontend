import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, BarChart3, AlertCircle, RefreshCw } from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import LoadingSpinner from '../../../../shared/components/ui/LoadingSpinner';
import { useAdmin } from '../../../hooks/useAdmin';
import type { AdminUserStats } from '../../../../infrastructure/repositories/HttpAdminRepository';

const UserStatsPage: React.FC = () => {
  const [stats, setStats] = useState<AdminUserStats | null>(null);
  const { loading, error, setError, getUserStats } = useAdmin();

  const loadStats = async () => {
    const result = await getUserStats();
    if (result) {
      setStats(result);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const getRoleColor = (role: string) => {
    const colors = {
      'Administrador': 'bg-purple-500',
      'Auditor': 'bg-blue-500',
      'Efector': 'bg-green-500',
      'Proveedor': 'bg-yellow-500',
      'Médico': 'bg-indigo-500',
      'Afiliado': 'bg-gray-500'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-500';
  };

  if (loading && !stats) {
    return (
      <BaseLayout title="Estadísticas de Usuarios">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Estadísticas de Usuarios">
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Estadísticas de Usuarios
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              Vista general de la distribución de usuarios en el sistema
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={loadStats}
              disabled={loading}
              className="inline-flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error al cargar estadísticas
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
                <div className="mt-3">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => {
                      setError(null);
                      loadStats();
                    }}
                  >
                    Reintentar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <>
            {/* Total Users Card */}
            <div className="bg-white dark:bg-darkmode-600 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                        Total de Usuarios
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {stats.total}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-darkmode-700 px-5 py-3">
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-slate-400">
                    {stats.message || 'Usuarios registrados en el sistema'}
                  </span>
                </div>
              </div>
            </div>

            {/* Users by Role */}
            <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Distribución por Rol
                  </h3>
                  <BarChart3 className="h-5 w-5 text-gray-400" />
                </div>
                
                <div className="space-y-4">
                  {Object.entries(stats.by_role).map(([role, count]) => {
                    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    
                    return (
                      <div key={role} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full ${getRoleColor(role)} mr-2`}></div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {role}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500 dark:text-slate-400">
                              {count} usuarios
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-darkmode-400 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getRoleColor(role)}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {Object.keys(stats.by_role).length === 0 && (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      No hay datos disponibles
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                      No se encontraron usuarios por rol.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Acciones Rápidas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button
                    onClick={() => window.location.href = '/admin/users'}
                    variant="outline-primary"
                    className="w-full"
                  >
                    Ver Todos los Usuarios
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/admin/users/create'}
                    variant="primary"
                    className="w-full"
                  >
                    Crear Nuevo Usuario
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/admin/users/providers'}
                    variant="outline-primary"
                    className="w-full"
                  >
                    Ver Proveedores
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </BaseLayout>
  );
};

export default UserStatsPage; 