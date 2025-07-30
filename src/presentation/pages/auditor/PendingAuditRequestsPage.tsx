import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuditRequestCard } from '../../../shared/components/audit';
import type { AuditRequest } from '../../../domain/models';
import BaseLayout from '../../../shared/components/layout/BaseLayout';

export const PendingAuditRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<AuditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'pending',
    provider_id: '',
    date_from: '',
    date_to: ''
  });

  useEffect(() => {
    loadPendingRequests();
  }, [filters]);

  const loadPendingRequests = async () => {
    try {
      setLoading(true);
      // TODO: Implementar llamada al servicio
      // const auditorService = new AuditorService();
      // const result = await auditorService.getPendingAuditRequests(filters);
      // setRequests(result.data);
      
      // Mock data para desarrollo
      setRequests([]);
    } catch (error) {
      console.error('Error loading pending requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id: string) => {
    navigate(`/auditor/audit-requests/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/auditor/audit-requests/${id}/edit`);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <BaseLayout title="Solicitudes Pendientes de Auditoría">
      <div className="space-y-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Solicitudes Pendientes de Auditoría
                </h1>
                <p className="mt-2 text-gray-600">
                  Revisa y audita las cotizaciones pendientes
                </p>
              </div>
              <button
                onClick={() => navigate('/auditor/dashboard')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Volver al Dashboard
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proveedor
                </label>
                <input
                  type="text"
                  value={filters.provider_id}
                  onChange={(e) => handleFilterChange('provider_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Buscar por proveedor..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Desde
                </label>
                <input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Hasta
                </label>
                <input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={loadPendingRequests}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Filtrar
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          ) : requests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((request) => (
                <AuditRequestCard
                  key={request.audit_request_id}
                  auditRequest={request}
                  onView={handleView}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay solicitudes pendientes
              </h3>
              <p className="text-gray-600">
                Todas las cotizaciones han sido auditadas o no hay solicitudes pendientes.
              </p>
            </div>
          )}
        </div>
      </BaseLayout>
  );
}; 