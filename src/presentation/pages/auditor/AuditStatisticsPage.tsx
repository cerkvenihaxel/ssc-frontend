import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuditStatistics } from '../../../domain/models';
import BaseLayout from '../../../shared/components/layout/BaseLayout';
import { ArrowLeft, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, DollarSign, BarChart3, Calendar, Users } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import { AuditorService } from '../../../application/services/AuditorService';
import { AuditorRepository } from '../../../infrastructure/repositories/AuditorRepository';
import { ApiClient } from '../../../infrastructure/http/ApiClient';

export const AuditStatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<AuditStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    loadStatistics();
  }, [selectedPeriod]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const apiClient = new ApiClient();
      const auditorRepository = new AuditorRepository(apiClient);
      const auditorService = new AuditorService(auditorRepository);
      
      const result = await auditorService.getAuditStatistics();
      setStatistics(result);
      
    } catch (error) {
      console.error('Error loading audit statistics:', error);
      alert(`Error al cargar estadísticas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };



  if (loading) {
    return (
      <BaseLayout title="Estadísticas de Auditoría">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </BaseLayout>
    );
  }

  if (!statistics) {
    return (
      <BaseLayout title="Estadísticas de Auditoría">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No se pudieron cargar las estadísticas
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Hubo un error al cargar los datos estadísticos.
          </p>
          <Button onClick={loadStatistics}>
            Reintentar
          </Button>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Estadísticas de Auditoría">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400">
          <div className="px-6 py-6 border-b border-gray-200 dark:border-darkmode-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/auditor-services/pending-quotations')}
                  className="flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Estadísticas de Auditoría
                  </h1>
                  <p className="text-gray-600 dark:text-slate-400 mt-1">
                    Métricas y análisis del módulo de auditoría
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'quarter' | 'year')}
                  className="px-3 py-1 border border-gray-300 dark:border-darkmode-400 rounded-md dark:bg-darkmode-700 dark:text-white"
                >
                  <option value="week">Última Semana</option>
                  <option value="month">Último Mes</option>
                  <option value="quarter">Último Trimestre</option>
                  <option value="year">Último Año</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadStatistics}
                  className="flex items-center"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Actualizar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total de Solicitudes */}
          <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Solicitudes
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statistics.total_requests.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 dark:text-green-400">
                  +12.5% vs mes anterior
                </span>
              </div>
            </div>
          </div>

          {/* Solicitudes Aprobadas */}
          <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Aprobadas
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {statistics.approved_requests.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatPercentage(statistics.approved_requests, statistics.total_requests)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 dark:text-green-400">
                  +8.3% vs mes anterior
                </span>
              </div>
            </div>
          </div>

          {/* Solicitudes Rechazadas */}
          <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Rechazadas
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {statistics.rejected_requests.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatPercentage(statistics.rejected_requests, statistics.total_requests)}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-red-600 dark:text-red-400">
                  -2.1% vs mes anterior
                </span>
              </div>
            </div>
          </div>

          {/* Ahorro de Costos */}
          <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Ahorro Total
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(statistics.cost_savings)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 dark:text-green-400">
                  +15.2% vs mes anterior
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tiempo Promedio de Procesamiento */}
          <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Tiempo Promedio de Procesamiento
            </h3>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {statistics.average_processing_time.toFixed(1)}
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                días promedio
              </p>
              
              {/* Barra de progreso */}
              <div className="w-full bg-gray-200 dark:bg-darkmode-700 rounded-full h-3 mb-4">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((statistics.average_processing_time / 7) * 100, 100)}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Meta</p>
                  <p className="font-semibold text-gray-900 dark:text-white">7 días</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Actual</p>
                  <p className="font-semibold text-blue-600 dark:text-blue-400">
                    {statistics.average_processing_time.toFixed(1)} días
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Eficiencia</p>
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    {Math.max(0, ((7 - statistics.average_processing_time) / 7) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Distribución de Estados */}
          <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Distribución de Estados
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Aprobadas
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {statistics.approved_requests}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({formatPercentage(statistics.approved_requests, statistics.total_requests)})
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Rechazadas
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {statistics.rejected_requests}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({formatPercentage(statistics.rejected_requests, statistics.total_requests)})
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Pendientes
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {statistics.pending_requests}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({formatPercentage(statistics.pending_requests, statistics.total_requests)})
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    En Progreso
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {statistics.in_progress_requests}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({formatPercentage(statistics.in_progress_requests, statistics.total_requests)})
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Completadas
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {statistics.completed_requests}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({formatPercentage(statistics.completed_requests, statistics.total_requests)})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tendencias Mensuales */}
        <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Tendencias Mensuales
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-darkmode-400">
              <thead className="bg-gray-50 dark:bg-darkmode-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Mes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total Solicitudes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Aprobadas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rechazadas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tasa de Aprobación
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-darkmode-600 divide-y divide-gray-200 dark:divide-darkmode-400">
                {statistics.monthly_trends.map((trend, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-darkmode-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {trend.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {trend.requests.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                      {trend.approved.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                      {trend.rejected.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (trend.approved / trend.requests) >= 0.8 ? 'bg-green-100 text-green-800' :
                        (trend.approved / trend.requests) >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {formatPercentage(trend.approved, trend.requests)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumen de KPIs */}
        <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Resumen de KPIs
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {formatPercentage(statistics.approved_requests, statistics.total_requests)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tasa de Aprobación
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                {formatCurrency(statistics.cost_savings / statistics.total_requests)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ahorro Promedio por Solicitud
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {statistics.average_processing_time.toFixed(1)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Días Promedio de Procesamiento
              </p>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}; 