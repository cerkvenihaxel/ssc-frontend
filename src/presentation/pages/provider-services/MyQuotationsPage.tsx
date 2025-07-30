import React, { useState, useEffect } from 'react';
import { Search, Filter, Package, Eye, Edit3, Trash2, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import BaseLayout from '../../../shared/components/layout/BaseLayout';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import { useToast } from '../../../shared/components/ui/ToastContainer';
import { useProviderServices } from '../../hooks/useProviderServices';
import { Link } from 'react-router-dom';

interface Quotation {
  id: string;
  provider_id: string;
  request_id: string;
  request_type: 'medical' | 'effector';
  request_number: string;
  request_title: string;
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'PENDING_REVIEW';
  total_amount: number;
  delivery_days: number;
  notes?: string;
  items_count: number;
  created_at: string;
  updated_at: string;
  audit_status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PARTIAL';
  audit_notes?: string;
  audited_at?: string;
  audited_by?: string;
}

const MyQuotationsPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const { getMyQuotations, deleteQuotation, loading } = useProviderServices();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [filteredQuotations, setFilteredQuotations] = useState<Quotation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [auditStatusFilter, setAuditStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'medical' | 'effector'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadMyQuotations();
  }, [page, statusFilter, auditStatusFilter, typeFilter]);

  useEffect(() => {
    filterQuotations();
  }, [searchTerm, quotations]);

  const loadMyQuotations = async () => {
    try {
      const response = await getMyQuotations({
        status: statusFilter || undefined,
        audit_status: auditStatusFilter || undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        page,
        limit: 10
      });

      setQuotations(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error loading my quotations:', error);
      showError('Error', 'No se pudieron cargar las cotizaciones');
    }
  };

  const filterQuotations = () => {
    if (!searchTerm) {
      setFilteredQuotations(quotations);
      return;
    }

    const filtered = quotations.filter(quotation =>
      quotation.request_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredQuotations(filtered);
  };

  const handleDeleteQuotation = async (quotationId: string) => {
    const confirmed = window.confirm(
      '¿Estás seguro de que deseas eliminar esta cotización? Esta acción no se puede deshacer.'
    );

    if (confirmed) {
      try {
        await deleteQuotation(quotationId);
        showSuccess('Éxito', 'Cotización eliminada correctamente');
        loadMyQuotations();
      } catch (error) {
        console.error('Error deleting quotation:', error);
        showError('Error', 'No se pudo eliminar la cotización');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case 'DRAFT':
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300`;
      case 'SENT':
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`;
      case 'PENDING_REVIEW':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`;
      case 'APPROVED':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`;
      case 'REJECTED':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Edit3 className="w-4 h-4 text-gray-500" />;
      case 'SENT':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'PENDING_REVIEW':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAuditStatusBadge = (auditStatus?: string) => {
    if (!auditStatus) return undefined;
    
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (auditStatus) {
      case 'PENDING':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`;
      case 'APPROVED':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`;
      case 'REJECTED':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`;
      case 'PARTIAL':
        return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300`;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medical':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'effector':
        return <Package className="w-4 h-4 text-green-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      'DRAFT': 'Borrador',
      'SENT': 'Enviado',
      'PENDING_REVIEW': 'En Revisión',
      'APPROVED': 'Aprobado',
      'REJECTED': 'Rechazado'
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  const getAuditStatusText = (status?: string) => {
    if (!status) return '';
    
    const statusTexts = {
      'PENDING': 'Pendiente',
      'APPROVED': 'Aprobado',
      'REJECTED': 'Rechazado',
      'PARTIAL': 'Parcial'
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  return (
    <BaseLayout title="Mis Cotizaciones">
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Mis Cotizaciones
            </h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-slate-300">
              Gestiona todas tus cotizaciones enviadas y su estado de auditoría
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por título, número..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-darkmode-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">Todos</option>
                <option value="DRAFT">Borrador</option>
                <option value="SENT">Enviado</option>
                <option value="PENDING_REVIEW">En Revisión</option>
                <option value="APPROVED">Aprobado</option>
                <option value="REJECTED">Rechazado</option>
              </select>
            </div>

            {/* Estado Auditoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Auditoría
              </label>
              <select
                value={auditStatusFilter}
                onChange={(e) => setAuditStatusFilter(e.target.value)}
                className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-darkmode-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">Todos</option>
                <option value="PENDING">Pendiente</option>
                <option value="APPROVED">Aprobado</option>
                <option value="REJECTED">Rechazado</option>
                <option value="PARTIAL">Parcial</option>
              </select>
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Tipo
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-darkmode-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="all">Todos</option>
                <option value="medical">Pedidos Médicos</option>
                <option value="effector">Pedidos Efectores</option>
              </select>
            </div>

            {/* Botón limpiar filtros */}
            <div className="flex items-end">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setAuditStatusFilter('');
                  setTypeFilter('all');
                }}
                className="w-full"
              >
                <Filter className="w-4 h-4 mr-1" />
                Limpiar
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de cotizaciones */}
        <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-500 dark:text-slate-400">Cargando cotizaciones...</p>
            </div>
          ) : filteredQuotations.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay cotizaciones
              </h3>
              <p className="text-gray-500 dark:text-slate-400">
                No tienes cotizaciones que coincidan con los filtros seleccionados.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-slate-700">
              {filteredQuotations.map((quotation) => (
                <div key={quotation.id} className="p-6 hover:bg-gray-50 dark:hover:bg-darkmode-700 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        {getTypeIcon(quotation.request_type)}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {quotation.request_number}
                        </span>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(quotation.status)}
                          <span className={getStatusBadge(quotation.status)}>
                            {getStatusText(quotation.status)}
                          </span>
                        </div>
                        {quotation.audit_status && (
                          <span className={getAuditStatusBadge(quotation.audit_status)}>
                            Aud: {getAuditStatusText(quotation.audit_status)}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {quotation.request_title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-slate-400 mb-3">
                        <span className="font-medium text-lg text-primary-600 dark:text-primary-400">
                          {formatAmount(quotation.total_amount)}
                        </span>
                        <span>{quotation.delivery_days} días de entrega</span>
                        <span>{quotation.items_count} items</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-slate-400">
                        <span>Creado: {formatDate(quotation.created_at)}</span>
                        <span>Actualizado: {formatDate(quotation.updated_at)}</span>
                        {quotation.audited_at && (
                          <span>Auditado: {formatDate(quotation.audited_at)}</span>
                        )}
                      </div>

                      {quotation.notes && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-slate-400 line-clamp-2">
                          <strong>Notas:</strong> {quotation.notes}
                        </p>
                      )}

                      {quotation.audit_notes && (
                        <p className="mt-2 text-sm text-orange-600 dark:text-orange-400 line-clamp-2">
                          <strong>Observaciones de auditoría:</strong> {quotation.audit_notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Link to={`/provider-services/quotations/${quotation.id}/details`}>
                        <Button variant="outline-primary" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                      </Link>
                      
                      {quotation.status === 'DRAFT' && (
                        <Link to={`/provider-services/quotations/${quotation.id}/edit`}>
                          <Button variant="primary" size="sm">
                            <Edit3 className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                        </Link>
                      )}

                      {(quotation.status === 'DRAFT' || quotation.status === 'SENT') && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteQuotation(quotation.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-slate-300">
              Página {page} de {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default MyQuotationsPage; 