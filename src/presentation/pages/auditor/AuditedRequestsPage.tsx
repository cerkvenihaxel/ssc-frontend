import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuditRequestCard } from '../../../shared/components/audit';
import type { AuditRequest } from '../../../domain/models';
import BaseLayout from '../../../shared/components/layout/BaseLayout';
import { useAuditor } from '../../../shared/hooks/useAuditor';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import { Pagination } from '../../../shared/components/ui/Pagination';

export const AuditedRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { getAuditedRequests, loading } = useAuditor();
  const [requests, setRequests] = useState<AuditRequest[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    provider_id: '',
    date_from: '',
    date_to: '',
    audit_type: ''
  });

  useEffect(() => {
    loadAuditedRequests();
  }, []);

  const loadAuditedRequests = async (page = pagination.page, limit = pagination.limit) => {
    try {
      const result = await getAuditedRequests({
        ...filters,
        page,
        limit
      });
      
      setRequests(result.data);
      const newPagination = {
        page: result.page || page,
        limit: result.limit || limit,
        total: result.total || 0,
        total_pages: result.total_pages || Math.ceil((result.total || 0) / (result.limit || limit))
      };
      
      setPagination(newPagination);
    } catch (error) {
      console.error('Error loading audited requests:', error);
      setRequests([]);
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        total_pages: 1
      });
    }
  };

  const handleView = (id: string) => {
    navigate(`/auditor/audit-requests/${id}`);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
    loadAuditedRequests(page, pagination.limit);
  };

  const handlePageSizeChange = (limit: number) => {
    setPagination(prev => ({ ...prev, page: 1, limit }));
    loadAuditedRequests(1, limit);
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      provider_id: '',
      date_from: '',
      date_to: '',
      audit_type: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'approved', label: 'Aprobadas' },
    { value: 'rejected', label: 'Rechazadas' },
    { value: 'completed', label: 'Completadas' }
  ];

  const auditTypeOptions = [
    { value: '', label: 'Todos los tipos' },
    { value: 'manual', label: 'Manual' },
    { value: 'ai', label: 'IA' },
    { value: 'hybrid', label: 'Híbrida' }
  ];

  return (
    <BaseLayout title="Historial de Auditorías">
      <div className="space-y-6">
          {/* Header */}
          <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400">
            <div className="px-6 py-6 border-b border-gray-200 dark:border-darkmode-400">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Historial de Auditorías
                  </h1>
                  <p className="text-gray-600 dark:text-slate-400 mt-1">
                    Revisa todas las auditorías realizadas
                  </p>
                </div>
                <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadAuditedRequests()}
                    disabled={loading}
                    className="flex items-center"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Actualizar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {}} // TODO: Implementar exportación
                    className="flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/auditor/audit-requests/7d879f22-b683-424d-88f9-3288f214cf87')}
                    className="flex items-center"
                  >
                    Test Detail
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="flex items-center"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Limpiar
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estado
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-darkmode-700 dark:text-white"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Auditoría
                  </label>
                  <select
                    value={filters.audit_type}
                    onChange={(e) => handleFilterChange('audit_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-darkmode-700 dark:text-white"
                  >
                    {auditTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Proveedor
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={filters.provider_id}
                      onChange={(e) => handleFilterChange('provider_id', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-darkmode-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-darkmode-700 dark:text-white"
                      placeholder="Buscar por proveedor..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha Desde
                  </label>
                  <input
                    type="date"
                    value={filters.date_from}
                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-darkmode-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha Hasta
                  </label>
                  <input
                    type="date"
                    value={filters.date_to}
                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-darkmode-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Auditorías Realizadas ({requests.length})
                </h2>
                <div className="text-sm text-gray-500 dark:text-slate-400">
                  Última actualización: {new Date().toLocaleString('es-AR')}
                </div>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-slate-400">Cargando auditorías...</span>
                </div>
              ) : requests.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {requests.map((request) => (
                    <AuditRequestCard
                      key={request.audit_request_id}
                      auditRequest={request}
                      onView={handleView}
                      onEdit={() => {}} // No edit for audited requests
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-darkmode-700 rounded-full flex items-center justify-center">
                    <div className="text-2xl">📊</div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No hay auditorías realizadas
                  </h3>
                  <p className="text-gray-600 dark:text-slate-400">
                    No se encontraron auditorías con los filtros aplicados.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.total_pages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            itemLabel="auditorías"
          />
        </div>
      </BaseLayout>
  );
}; 