import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Quotation, QuotationFilters } from '../../../domain/models';
import BaseLayout from '../../../shared/components/layout/BaseLayout';
import { QuotationCard } from '../../../shared/components/audit';
import { Search, Download, Filter, RefreshCw } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import { Pagination } from '../../../shared/components/ui/Pagination';
import { useAuditor } from '../../../shared/hooks/useAuditor';

export const PendingQuotationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { loadPendingQuotations: loadQuotations, approveQuotation, rejectQuotation, loading } = useAuditor();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  });
  const [filters, setFilters] = useState<QuotationFilters>({
    status: '',
    provider_id: '',
    date_from: '',
    date_to: '',
    patient_name: '',
    medical_order_id: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [auditModal, setAuditModal] = useState<{
    visible: boolean;
    quotation: Quotation | null;
    action: 'approve' | 'reject' | null;
  }>({
    visible: false,
    quotation: null,
    action: null
  });

  useEffect(() => {
    loadPendingQuotations();
  }, []);

  const loadPendingQuotations = async (page = pagination.page, limit = pagination.limit) => {
    try {
      // Llamada al servicio real con paginación
      const result = await loadQuotations({
        ...filters,
        page,
        limit
      });
      
      setQuotations(result.data);
      setPagination({
        page: result.page || page,
        limit: result.limit || limit,
        total: result.total || 0,
        total_pages: result.total_pages || Math.ceil((result.total || 0) / (result.limit || limit))
      });
      
    } catch (error) {
      console.error('Error loading pending quotations:', error);
      setQuotations([]);
      alert(`Error al cargar cotizaciones: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleView = (id: string) => {
    navigate(`/auditor-services/quotations/${id}`);
  };

  const handleAudit = (id: string) => {
    navigate(`/auditor/audit-requests/${id}/audit`);
  };

  const handleQuickApprove = (quotation: Quotation) => {
    setAuditModal({
      visible: true,
      quotation,
      action: 'approve'
    });
  };

  const handleQuickReject = (quotation: Quotation) => {
    setAuditModal({
      visible: true,
      quotation,
      action: 'reject'
    });
  };

  const handleAuditSubmit = async (approvedCost?: number, rejectionReason?: string, notes?: string) => {
    if (!auditModal.quotation) return;

    try {
      if (auditModal.action === 'approve' && approvedCost) {
        // Validar que el costo aprobado sea un número válido
        const cost = Number(approvedCost);
        if (isNaN(cost) || cost <= 0) {
          alert('El costo aprobado debe ser un número válido mayor a 0');
          return;
        }
        
        await approveQuotation(auditModal.quotation.quotation_id, cost, notes || '');
        alert('Cotización aprobada exitosamente');
      } else if (auditModal.action === 'reject' && rejectionReason) {
        // Validar que la razón del rechazo esté presente
        if (!rejectionReason.trim()) {
          alert('Debe especificar una razón para el rechazo');
          return;
        }
        
        await rejectQuotation(auditModal.quotation.quotation_id, rejectionReason, notes || '');
        alert('Cotización rechazada exitosamente');
      }
      
      // Recargar datos
      await loadPendingQuotations();
      setAuditModal({ visible: false, quotation: null, action: null });
      
    } catch (error) {
      console.error('Error updating audit request:', error);
      
      // Mostrar mensaje de error específico
      let errorMessage = 'Error desconocido';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(`Error al ${auditModal.action === 'approve' ? 'aprobar' : 'rechazar'} cotización: ${errorMessage}`);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleFilterSubmit = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    loadPendingQuotations(1, pagination.limit);
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      provider_id: '',
      date_from: '',
      date_to: '',
      patient_name: '',
      medical_order_id: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    loadPendingQuotations(1, pagination.limit);
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
    loadPendingQuotations(page, pagination.limit);
  };

  const handlePageSizeChange = (limit: number) => {
    setPagination(prev => ({ ...prev, page: 1, limit }));
    loadPendingQuotations(1, limit);
  };

  const handleExport = () => {
    // TODO: Implementar exportación de datos
    console.log('Exporting pending quotations...');
  };

  const handleRefresh = () => {
    loadPendingQuotations();
  };

  return (
    <BaseLayout title="Cotizaciones para Auditar">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400">
          <div className="px-6 py-6 border-b border-gray-200 dark:border-darkmode-400">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Cotizaciones para Auditar
                </h1>
                <p className="text-gray-600 dark:text-slate-400 mt-1">
                  Revisa y audita las cotizaciones pendientes de aprobación
                </p>
              </div>
              <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Actualizar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
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
          {showFilters && (
            <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Orden Médica
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por orden médica..."
                      value={filters.medical_order_id}
                      onChange={(e) => handleFilterChange('medical_order_id', e.target.value)}
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
                    value={filters.provider_id}
                    onChange={(e) => handleFilterChange('provider_id', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-darkmode-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-darkmode-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Paciente
                  </label>
                  <input
                    type="text"
                    placeholder="Filtrar por paciente"
                    value={filters.patient_name}
                    onChange={(e) => handleFilterChange('patient_name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-darkmode-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-darkmode-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estado
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-darkmode-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-darkmode-700 dark:text-white"
                  >
                    <option value="">Todos los estados</option>
                    <option value="pending">Pendiente</option>
                    <option value="sent">Enviada</option>
                    <option value="approved">Aprobada</option>
                    <option value="rejected">Rechazada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Desde
                  </label>
                  <input
                    type="date"
                    value={filters.date_from}
                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-darkmode-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-darkmode-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hasta
                  </label>
                  <input
                    type="date"
                    value={filters.date_to}
                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-darkmode-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-darkmode-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  Limpiar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleFilterSubmit}
                >
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        ) : quotations.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quotations.map((quotation) => (
                <div key={quotation.quotation_id} className="relative">
                  <QuotationCard
                    quotation={quotation}
                    onView={handleView}
                    onAudit={handleAudit}
                    onQuickApprove={handleQuickApprove}
                    onQuickReject={handleQuickReject}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.total_pages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              itemLabel="cotizaciones"
            />
          </>
        ) : (
          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No hay cotizaciones pendientes
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Todas las cotizaciones han sido auditadas o no hay cotizaciones pendientes.
            </p>
          </div>
        )}

        {/* Quick Audit Modal */}
        {auditModal.visible && auditModal.quotation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-darkmode-600 rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">
                {auditModal.action === 'approve' ? 'Aprobar' : 'Rechazar'} Cotización
              </h3>
              
              <div className="mb-4 p-3 bg-gray-50 dark:bg-darkmode-700 rounded">
                <p className="text-sm">
                  <strong>Paciente:</strong> {auditModal.quotation.patient_name}
                </p>
                <p className="text-sm">
                  <strong>Costo:</strong> ${auditModal.quotation.total_cost.toLocaleString()}
                </p>
              </div>

              {auditModal.action === 'approve' ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Costo Aprobado
                  </label>
                  <input
                    type="number"
                    defaultValue={auditModal.quotation.total_cost}
                    id="approved-cost"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-400 rounded-md dark:bg-darkmode-700 dark:text-white"
                  />
                </div>
              ) : (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Razón del Rechazo
                  </label>
                  <textarea
                    id="rejection-reason"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-400 rounded-md dark:bg-darkmode-700 dark:text-white"
                    placeholder="Especifique la razón del rechazo..."
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Notas del Auditor
                </label>
                <textarea
                  id="auditor-notes"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-400 rounded-md dark:bg-darkmode-700 dark:text-white"
                  placeholder="Notas adicionales..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setAuditModal({ visible: false, quotation: null, action: null })}
                  className="px-4 py-2 border border-gray-300 dark:border-darkmode-400 rounded-md hover:bg-gray-50 dark:hover:bg-darkmode-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    const approvedCost = auditModal.action === 'approve' 
                      ? Number((document.getElementById('approved-cost') as HTMLInputElement)?.value)
                      : undefined;
                    const rejectionReason = auditModal.action === 'reject'
                      ? (document.getElementById('rejection-reason') as HTMLTextAreaElement)?.value
                      : undefined;
                    const notes = (document.getElementById('auditor-notes') as HTMLTextAreaElement)?.value;
                    
                    handleAuditSubmit(approvedCost, rejectionReason, notes);
                  }}
                  className={`px-4 py-2 rounded-md text-white ${
                    auditModal.action === 'approve' 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {auditModal.action === 'approve' ? 'Aprobar' : 'Rechazar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseLayout>
  );
}; 