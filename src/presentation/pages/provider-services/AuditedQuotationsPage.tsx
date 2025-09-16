import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BaseLayout from '../../../shared/components/layout/BaseLayout';
import { useProviderServices } from '../../hooks/useProviderServices';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  Search
} from 'lucide-react';

interface AuditedQuotation {
  quotation_id: string;
  quotation_number: string;
  provider_name: string;
  request_number: string;
  request_title: string;
  request_type: 'medical' | 'effector';
  total_amount: number;
  created_at: string;
  audit_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PARTIAL';
  audit_decision?: string;
  audit_notes?: string;
  audited_at?: string;
  audited_by?: string;
}

const AuditedQuotationsPage: React.FC = () => {
  const { getAuditedQuotations } = useProviderServices();
  
  const [quotations, setQuotations] = useState<AuditedQuotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadAuditedQuotations();
  }, [page, statusFilter]);

  const loadAuditedQuotations = async () => {
    try {
      setLoading(true);
      const response = await getAuditedQuotations({
        page,
        limit: 10,
        audit_result: statusFilter
      });
      
      setQuotations(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setError(null);
    } catch (err) {
      setError('Error al cargar las cotizaciones auditadas');
      console.error('Error loading audited quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = searchTerm === '' || 
      quotation.quotation_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.provider_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.request_title.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      'APPROVED': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'REJECTED': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      'PARTIAL': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
    };

    const labels = {
      'PENDING': 'Pendiente',
      'APPROVED': 'Aprobada',
      'REJECTED': 'Rechazada',
      'PARTIAL': 'Parcial'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
      }`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'PARTIAL':
        return <AlertTriangle className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      'medical': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'effector': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
    };

    const labels = {
      'medical': 'Médico',
      'effector': 'Efector'
    };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
      }`}>
        {labels[type as keyof typeof labels] || type}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
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

  return (
    <BaseLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cotizaciones Auditadas
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestiona y revisa las cotizaciones enviadas por proveedores
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Buscar
              </label>
                             <div className="relative">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <input
                  type="text"
                  placeholder="Buscar cotizaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado de Auditoría
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Todos los Estados</option>
                <option value="PENDING">Pendientes</option>
                <option value="APPROVED">Aprobadas</option>
                <option value="REJECTED">Rechazadas</option>
                <option value="PARTIAL">Parciales</option>
              </select>
            </div>

            {/* Stats */}
            <div className="flex items-end">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredQuotations.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quotations Table */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500 dark:text-gray-400">Cargando cotizaciones...</p>
            </div>
                     ) : error ? (
             <div className="p-8 text-center">
               <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
               <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                 Error al cargar
               </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{error}</p>
              <div className="mt-6">
                <button
                  onClick={loadAuditedQuotations}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Reintentar
                </button>
              </div>
            </div>
                     ) : filteredQuotations.length === 0 ? (
             <div className="p-8 text-center">
               <Clock className="mx-auto h-12 w-12 text-gray-400" />
               <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                 No hay cotizaciones
               </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                No se encontraron cotizaciones que coincidan con tus criterios.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cotización
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Proveedor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Pedido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Auditoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredQuotations.map((quotation) => (
                    <tr key={quotation.quotation_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {quotation.quotation_number}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(quotation.created_at)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {quotation.provider_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {quotation.request_number}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                            {getTypeBadge(quotation.request_type)}
                            <span className="truncate max-w-xs">{quotation.request_title}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(quotation.total_amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(quotation.audit_status)}
                          {getStatusBadge(quotation.audit_status)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {quotation.audited_at ? (
                          <div>
                            <div className="text-sm text-gray-900 dark:text-white">
                              {quotation.audited_by || 'Sistema'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(quotation.audited_at)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Sin auditar
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                                                     <Link
                             to={`/admin/provider-services/audit-quotation/${quotation.quotation_id}`}
                             className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
                           >
                             <Eye className="w-4 h-4 mr-1" />
                             {quotation.audit_status === 'PENDING' ? 'Auditar' : 'Ver'}
                           </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Página {page} de {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default AuditedQuotationsPage;
