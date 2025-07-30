import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuditRequestCard } from '../../../shared/components/audit';
import type { AuditRequest } from '../../../domain/models';
import BaseLayout from '../../../shared/components/layout/BaseLayout';
import { Search, Filter, Download, Archive } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import { Pagination } from '../../../shared/components/ui/Pagination';
import { useAuditor } from '../../../shared/hooks/useAuditor';

export const CompletedRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { loading } = useAuditor();
  const [requests, setRequests] = useState<AuditRequest[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  });
  const [filters, setFilters] = useState({
    status: 'completed',
    provider: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  useEffect(() => {
    loadCompletedRequests();
  }, []);

  const loadCompletedRequests = async (page = pagination.page, limit = pagination.limit) => {
    try {
      // Mock data para demostración
      const mockCompletedRequests: AuditRequest[] = [
        {
          audit_request_id: 'AR-2025-001',
          quotation_id: 'Q-2025-001',
          medical_order_id: 'MO-2025-000001',
          provider_id: 'P-001',
          audit_status: 'completed',
          auditor_notes: 'Cotización aprobada después de revisión detallada de costos y calidad',
          rejection_reason: undefined,
          original_order_cost: 85000,
          quoted_cost: 82000,
          approved_cost: 80000,
          audit_criteria: {
            price_reasonable: true,
            quality_adequate: true,
            delivery_time_acceptable: true,
            provider_reliable: true,
            documentation_complete: true
          },
          audit_type: 'manual',
          auditor_id: 'AUD-001',
          audited_at: '2025-01-15T10:30:00Z',
          completed_at: '2025-01-15T11:00:00Z',
          created_at: '2025-01-15T09:00:00Z',
          updated_at: '2025-01-15T11:00:00Z',
          quotation: {
            quotation_id: 'Q-2025-001',
            quotation_number: 'COT-2025-001',
            patient_name: 'María González',
            total_cost: 82000,
            status: 'completed'
          },
          medicalOrder: {
            medical_order_id: 'MO-2025-000001',
            order_number: 'MO-2025-000001',
            patient_name: 'María González',
            urgency: 'medium'
          }
        },
        {
          audit_request_id: 'AR-2025-002',
          quotation_id: 'Q-2025-002',
          medical_order_id: 'MO-2025-000002',
          provider_id: 'P-002',
          audit_status: 'completed',
          auditor_notes: 'Material de alta calidad aprobado con descuento del 5%',
          rejection_reason: undefined,
          original_order_cost: 120000,
          quoted_cost: 115000,
          approved_cost: 110000,
          audit_criteria: {
            price_reasonable: true,
            quality_adequate: true,
            delivery_time_acceptable: true,
            provider_reliable: true,
            documentation_complete: true
          },
          audit_type: 'hybrid',
          auditor_id: 'AUD-002',
          audited_at: '2025-01-14T14:20:00Z',
          completed_at: '2025-01-14T15:00:00Z',
          created_at: '2025-01-14T13:00:00Z',
          updated_at: '2025-01-14T15:00:00Z',
          quotation: {
            quotation_id: 'Q-2025-002',
            quotation_number: 'COT-2025-002',
            patient_name: 'Carlos Rodríguez',
            total_cost: 115000,
            status: 'completed'
          },
          medicalOrder: {
            medical_order_id: 'MO-2025-000002',
            order_number: 'MO-2025-000002',
            patient_name: 'Carlos Rodríguez',
            urgency: 'high'
          }
        },
        {
          audit_request_id: 'AR-2025-003',
          quotation_id: 'Q-2025-003',
          medical_order_id: 'MO-2025-000003',
          provider_id: 'P-003',
          audit_status: 'completed',
          auditor_notes: 'Cotización rechazada por exceder el presupuesto asignado',
          rejection_reason: 'Precio excede el presupuesto máximo permitido',
          original_order_cost: 95000,
          quoted_cost: 98000,
          approved_cost: undefined,
          audit_criteria: {
            price_reasonable: false,
            quality_adequate: true,
            delivery_time_acceptable: true,
            provider_reliable: true,
            documentation_complete: true
          },
          audit_type: 'manual',
          auditor_id: 'AUD-001',
          audited_at: '2025-01-13T16:45:00Z',
          completed_at: '2025-01-13T17:00:00Z',
          created_at: '2025-01-13T15:00:00Z',
          updated_at: '2025-01-13T17:00:00Z',
          quotation: {
            quotation_id: 'Q-2025-003',
            quotation_number: 'COT-2025-003',
            patient_name: 'Ana Martínez',
            total_cost: 98000,
            status: 'completed'
          },
          medicalOrder: {
            medical_order_id: 'MO-2025-000003',
            order_number: 'MO-2025-000003',
            patient_name: 'Ana Martínez',
            urgency: 'low'
          }
        },
        {
          audit_request_id: 'AR-2025-004',
          quotation_id: 'Q-2025-004',
          medical_order_id: 'MO-2025-000004',
          provider_id: 'P-001',
          audit_status: 'completed',
          auditor_notes: 'Aprobada con condiciones de entrega especiales',
          rejection_reason: undefined,
          original_order_cost: 75000,
          quoted_cost: 72000,
          approved_cost: 70000,
          audit_criteria: {
            price_reasonable: true,
            quality_adequate: true,
            delivery_time_acceptable: true,
            provider_reliable: true,
            documentation_complete: true
          },
          audit_type: 'ai',
          auditor_id: 'AUD-003',
          audited_at: '2025-01-12T11:15:00Z',
          completed_at: '2025-01-12T11:45:00Z',
          created_at: '2025-01-12T10:00:00Z',
          updated_at: '2025-01-12T11:45:00Z',
          quotation: {
            quotation_id: 'Q-2025-004',
            quotation_number: 'COT-2025-004',
            patient_name: 'Luis Pérez',
            total_cost: 72000,
            status: 'completed'
          },
          medicalOrder: {
            medical_order_id: 'MO-2025-000004',
            order_number: 'MO-2025-000004',
            patient_name: 'Luis Pérez',
            urgency: 'medium'
          }
        },
        {
          audit_request_id: 'AR-2025-005',
          quotation_id: 'Q-2025-005',
          medical_order_id: 'MO-2025-000005',
          provider_id: 'P-004',
          audit_status: 'completed',
          auditor_notes: 'Material de emergencia aprobado con prioridad máxima',
          rejection_reason: undefined,
          original_order_cost: 150000,
          quoted_cost: 145000,
          approved_cost: 140000,
          audit_criteria: {
            price_reasonable: true,
            quality_adequate: true,
            delivery_time_acceptable: true,
            provider_reliable: true,
            documentation_complete: true
          },
          audit_type: 'manual',
          auditor_id: 'AUD-002',
          audited_at: '2025-01-11T08:30:00Z',
          completed_at: '2025-01-11T09:00:00Z',
          created_at: '2025-01-11T07:00:00Z',
          updated_at: '2025-01-11T09:00:00Z',
          quotation: {
            quotation_id: 'Q-2025-005',
            quotation_number: 'COT-2025-005',
            patient_name: 'Sofía López',
            total_cost: 145000,
            status: 'completed'
          },
          medicalOrder: {
            medical_order_id: 'MO-2025-000005',
            order_number: 'MO-2025-000005',
            patient_name: 'Sofía López',
            urgency: 'high'
          }
        },
        {
          audit_request_id: 'AR-2025-006',
          quotation_id: 'Q-2025-006',
          medical_order_id: 'MO-2025-000006',
          provider_id: 'P-002',
          audit_status: 'completed',
          auditor_notes: 'Rechazada por documentación incompleta',
          rejection_reason: 'Faltan especificaciones técnicas requeridas',
          original_order_cost: 68000,
          quoted_cost: 65000,
          approved_cost: undefined,
          audit_criteria: {
            price_reasonable: true,
            quality_adequate: false,
            delivery_time_acceptable: true,
            provider_reliable: true,
            documentation_complete: false
          },
          audit_type: 'hybrid',
          auditor_id: 'AUD-001',
          audited_at: '2025-01-10T13:20:00Z',
          completed_at: '2025-01-10T13:45:00Z',
          created_at: '2025-01-10T12:00:00Z',
          updated_at: '2025-01-10T13:45:00Z',
          quotation: {
            quotation_id: 'Q-2025-006',
            quotation_number: 'COT-2025-006',
            patient_name: 'Roberto Silva',
            total_cost: 65000,
            status: 'completed'
          },
          medicalOrder: {
            medical_order_id: 'MO-2025-000006',
            order_number: 'MO-2025-000006',
            patient_name: 'Roberto Silva',
            urgency: 'low'
          }
        },
        {
          audit_request_id: 'AR-2025-007',
          quotation_id: 'Q-2025-007',
          medical_order_id: 'MO-2025-000007',
          provider_id: 'P-003',
          audit_status: 'completed',
          auditor_notes: 'Aprobada con descuento por volumen',
          rejection_reason: undefined,
          original_order_cost: 110000,
          quoted_cost: 105000,
          approved_cost: 100000,
          audit_criteria: {
            price_reasonable: true,
            quality_adequate: true,
            delivery_time_acceptable: true,
            provider_reliable: true,
            documentation_complete: true
          },
          audit_type: 'ai',
          auditor_id: 'AUD-003',
          audited_at: '2025-01-09T15:10:00Z',
          completed_at: '2025-01-09T15:40:00Z',
          created_at: '2025-01-09T14:00:00Z',
          updated_at: '2025-01-09T15:40:00Z',
          quotation: {
            quotation_id: 'Q-2025-007',
            quotation_number: 'COT-2025-007',
            patient_name: 'Carmen Ruiz',
            total_cost: 105000,
            status: 'completed'
          },
          medicalOrder: {
            medical_order_id: 'MO-2025-000007',
            order_number: 'MO-2025-000007',
            patient_name: 'Carmen Ruiz',
            urgency: 'medium'
          }
        },
        {
          audit_request_id: 'AR-2025-008',
          quotation_id: 'Q-2025-008',
          medical_order_id: 'MO-2025-000008',
          provider_id: 'P-001',
          audit_status: 'completed',
          auditor_notes: 'Cotización aprobada para material de laboratorio',
          rejection_reason: undefined,
          original_order_cost: 92000,
          quoted_cost: 88000,
          approved_cost: 85000,
          audit_criteria: {
            price_reasonable: true,
            quality_adequate: true,
            delivery_time_acceptable: true,
            provider_reliable: true,
            documentation_complete: true
          },
          audit_type: 'manual',
          auditor_id: 'AUD-002',
          audited_at: '2025-01-08T12:00:00Z',
          completed_at: '2025-01-08T12:30:00Z',
          created_at: '2025-01-08T11:00:00Z',
          updated_at: '2025-01-08T12:30:00Z',
          quotation: {
            quotation_id: 'Q-2025-008',
            quotation_number: 'COT-2025-008',
            patient_name: 'Diego Morales',
            total_cost: 88000,
            status: 'completed'
          },
          medicalOrder: {
            medical_order_id: 'MO-2025-000008',
            order_number: 'MO-2025-000008',
            patient_name: 'Diego Morales',
            urgency: 'high'
          }
        },
        {
          audit_request_id: 'AR-2025-009',
          quotation_id: 'Q-2025-009',
          medical_order_id: 'MO-2025-000009',
          provider_id: 'P-004',
          audit_status: 'completed',
          auditor_notes: 'Rechazada por tiempo de entrega inaceptable',
          rejection_reason: 'Tiempo de entrega excede los 30 días permitidos',
          original_order_cost: 78000,
          quoted_cost: 75000,
          approved_cost: undefined,
          audit_criteria: {
            price_reasonable: true,
            quality_adequate: true,
            delivery_time_acceptable: false,
            provider_reliable: true,
            documentation_complete: true
          },
          audit_type: 'hybrid',
          auditor_id: 'AUD-001',
          audited_at: '2025-01-07T10:45:00Z',
          completed_at: '2025-01-07T11:15:00Z',
          created_at: '2025-01-07T09:00:00Z',
          updated_at: '2025-01-07T11:15:00Z',
          quotation: {
            quotation_id: 'Q-2025-009',
            quotation_number: 'COT-2025-009',
            patient_name: 'Elena Vargas',
            total_cost: 75000,
            status: 'completed'
          },
          medicalOrder: {
            medical_order_id: 'MO-2025-000009',
            order_number: 'MO-2025-000009',
            patient_name: 'Elena Vargas',
            urgency: 'low'
          }
        },
        {
          audit_request_id: 'AR-2025-010',
          quotation_id: 'Q-2025-010',
          medical_order_id: 'MO-2025-000010',
          provider_id: 'P-002',
          audit_status: 'completed',
          auditor_notes: 'Aprobada para equipamiento de terapia intensiva',
          rejection_reason: undefined,
          original_order_cost: 180000,
          quoted_cost: 175000,
          approved_cost: 170000,
          audit_criteria: {
            price_reasonable: true,
            quality_adequate: true,
            delivery_time_acceptable: true,
            provider_reliable: true,
            documentation_complete: true
          },
          audit_type: 'manual',
          auditor_id: 'AUD-003',
          audited_at: '2025-01-06T14:30:00Z',
          completed_at: '2025-01-06T15:00:00Z',
          created_at: '2025-01-06T13:00:00Z',
          updated_at: '2025-01-06T15:00:00Z',
          quotation: {
            quotation_id: 'Q-2025-010',
            quotation_number: 'COT-2025-010',
            patient_name: 'Fernando Torres',
            total_cost: 175000,
            status: 'completed'
          },
          medicalOrder: {
            medical_order_id: 'MO-2025-000010',
            order_number: 'MO-2025-000010',
            patient_name: 'Fernando Torres',
            urgency: 'high'
          }
        }
      ];

      // Simular paginación
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = mockCompletedRequests.slice(startIndex, endIndex);
      
      setRequests(paginatedData);
      setPagination({
        page: page,
        limit: limit,
        total: mockCompletedRequests.length,
        total_pages: Math.ceil(mockCompletedRequests.length / limit)
      });
    } catch (error) {
      console.error('Error loading completed requests:', error);
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
    loadCompletedRequests(page, pagination.limit);
  };

  const handlePageSizeChange = (limit: number) => {
    setPagination(prev => ({ ...prev, page: 1, limit }));
    loadCompletedRequests(1, limit);
  };

  const handleClearFilters = () => {
    setFilters({
      status: 'completed',
      provider: '',
      dateFrom: '',
      dateTo: '',
      search: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleExport = () => {
    // TODO: Implementar exportación de datos
    console.log('Exporting completed requests...');
  };

  return (
    <BaseLayout title="Solicitudes Finalizadas">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400">
          <div className="px-6 py-6 border-b border-gray-200 dark:border-darkmode-400">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Solicitudes Finalizadas
                </h1>
                <p className="text-gray-600 dark:text-slate-400 mt-1">
                  Historial de auditorías completadas y procesadas
                </p>
              </div>
              <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar solicitudes..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-darkmode-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-darkmode-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Proveedor
                </label>
                <input
                  type="text"
                  placeholder="Filtrar por proveedor"
                  value={filters.provider}
                  onChange={(e) => handleFilterChange('provider', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-darkmode-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-darkmode-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Desde
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-darkmode-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-darkmode-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hasta
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-darkmode-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-darkmode-700 dark:text-white"
                />
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="w-full"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Limpiar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Solicitudes Finalizadas ({requests.length})
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
                <span className="ml-3 text-gray-600 dark:text-slate-400">Cargando solicitudes...</span>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-darkmode-700 rounded-full flex items-center justify-center">
                  <Archive className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No hay solicitudes finalizadas
                </h3>
                <p className="text-gray-600 dark:text-slate-400">
                  No se encontraron solicitudes finalizadas en el período seleccionado.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {requests.map((request) => (
                  <AuditRequestCard
                    key={request.audit_request_id}
                    auditRequest={request}
                    onView={handleView}
                    onEdit={() => {}} // No edit functionality for completed requests
                  />
                ))}
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
          itemLabel="solicitudes finalizadas"
        />
      </div>
    </BaseLayout>
  );
}; 