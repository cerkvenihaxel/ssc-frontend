import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2, AlertCircle, FileText, Clock, CheckCircle, XCircle, Activity, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';
import LoadingSpinner from '../../../../shared/components/ui/LoadingSpinner';
import { useAuth } from '../../../contexts/AuthContext';
import { useObfuscation } from '../../../../shared/contexts/ObfuscationContext';

// Tipos para pedidos médicos
interface MedicalOrder {
  id: string;
  orderNumber: string;
  affiliateId: string;
  affiliateName: string;
  healthcareProvider: string;
  requesterType: 'ADMIN' | 'DOCTOR' | 'AUDITOR';
  requesterName: string;
  state: 'DRAFT' | 'PENDING' | 'AUTHORIZED' | 'PARTIALLY_AUTHORIZED' | 'REJECTED' | 'IN_PREPARATION' | 'READY' | 'DELIVERED' | 'COMPLETED';
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'CRITICAL';
  totalAmount: number;
  justification: string;
  aiAnalysis?: {
    status: 'APPROVED' | 'REJECTED' | 'NEEDS_REVIEW';
    confidence: number;
    reasoning: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface MedicalOrderStats {
  total: number;
  pending: number;
  authorized: number;
  rejected: number;
  totalAmount: number;
}

const MedicalOrderListPage: React.FC = () => {
  const [orders, setOrders] = useState<MedicalOrder[]>([]);
  const [stats, setStats] = useState<MedicalOrderStats>({
    total: 0,
    pending: 0,
    authorized: 0,
    rejected: 0,
    totalAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [requesterFilter, setRequesterFilter] = useState('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  const { hasPermission } = useAuth();
  const { obfuscatedApiClient } = useObfuscation();

  // Cargar pedidos médicos desde el API
  useEffect(() => {
    const loadMedicalOrders = async () => {
      setLoading(true);
      try {
        const response = await obfuscatedApiClient.get('/medical-orders?page=1&limit=50') as {
          data: any[];
          pagination?: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
          };
          stats?: any;
        };
        
        // Transformar datos del API al formato esperado por el frontend
        const transformedOrders: MedicalOrder[] = response.data.map((order: any) => ({
          id: order.orderId,
          orderNumber: order.orderNumber,
          affiliateId: order.affiliateId,
          affiliateName: order.affiliateName,
          healthcareProvider: order.healthcareProviderName,
          requesterType: order.requesterType.toUpperCase(),
          requesterName: order.requesterName,
          state: mapBackendStateToFrontend(order.authorizationStatus),
          urgencyLevel: mapBackendUrgencyToFrontend(order.urgency?.name),
          totalAmount: order.estimatedCost || 0,
          justification: order.medicalJustification,
          aiAnalysis: order.aiAnalysisResult ? {
            status: order.authorizationStatus === 'approved' ? 'APPROVED' : 
                   order.authorizationStatus === 'rejected' ? 'REJECTED' : 'NEEDS_REVIEW',
            confidence: order.aiConfidenceScore || 0,
            reasoning: order.aiAnalysisResult?.reasoning || ''
          } : undefined,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        }));

        setOrders(transformedOrders);
        
        // Calcular estadísticas
        setStats({
          total: response.pagination?.total || transformedOrders.length,
          pending: transformedOrders.filter(o => o.state === 'PENDING').length,
          authorized: transformedOrders.filter(o => o.state === 'AUTHORIZED').length,
          rejected: transformedOrders.filter(o => o.state === 'REJECTED').length,
          totalAmount: transformedOrders.reduce((sum, o) => sum + o.totalAmount, 0)
        });
        
      } catch (error) {
        console.error('Error cargando pedidos médicos:', error);
        // Mostrar mensaje de error al usuario
        setOrders([]);
        setStats({
          total: 0,
          pending: 0,
          authorized: 0,
          rejected: 0,
          totalAmount: 0
        });
      } finally {
        setLoading(false);
      }
    };

    loadMedicalOrders();
  }, []);

  // Funciones auxiliares para mapear datos del backend al frontend
  const mapBackendStateToFrontend = (backendState: string): MedicalOrder['state'] => {
    const stateMap: Record<string, MedicalOrder['state']> = {
      'pending': 'PENDING',
      'approved': 'AUTHORIZED',
      'rejected': 'REJECTED',
      'partial': 'PARTIALLY_AUTHORIZED',
      'draft': 'DRAFT'
    };
    return stateMap[backendState] || 'PENDING';
  };

  const mapBackendUrgencyToFrontend = (backendUrgency: string): MedicalOrder['urgencyLevel'] => {
    const urgencyMap: Record<string, MedicalOrder['urgencyLevel']> = {
      'Baja': 'LOW',
      'Normal': 'MEDIUM',
      'Alta': 'HIGH',
      'Urgente': 'URGENT',
      'Crítica': 'CRITICAL'
    };
    return urgencyMap[backendUrgency] || 'MEDIUM';
  };

  // Filtros aplicados
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.affiliateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.requesterName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.state === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || order.urgencyLevel === urgencyFilter;
    const matchesRequester = requesterFilter === 'all' || order.requesterType === requesterFilter;
    
    return matchesSearch && matchesStatus && matchesUrgency && matchesRequester;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'DRAFT': { label: 'Borrador', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', icon: FileText },
      'PENDING': { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Clock },
      'AUTHORIZED': { label: 'Autorizado', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle },
      'PARTIALLY_AUTHORIZED': { label: 'Parcialmente Autorizado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Activity },
      'REJECTED': { label: 'Rechazado', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: XCircle },
      'IN_PREPARATION': { label: 'En Preparación', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: Activity },
      'READY': { label: 'Listo', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200', icon: CheckCircle },
      'DELIVERED': { label: 'Entregado', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200', icon: CheckCircle },
      'COMPLETED': { label: 'Completado', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200', icon: CheckCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    const urgencyConfig = {
      'LOW': { label: 'Baja', color: 'bg-green-100 text-green-800' },
      'MEDIUM': { label: 'Media', color: 'bg-yellow-100 text-yellow-800' },
      'HIGH': { label: 'Alta', color: 'bg-orange-100 text-orange-800' },
      'URGENT': { label: 'Urgente', color: 'bg-red-100 text-red-800' },
      'CRITICAL': { label: 'Crítica', color: 'bg-red-200 text-red-900' }
    };
    
    const config = urgencyConfig[urgency as keyof typeof urgencyConfig] || urgencyConfig.LOW;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getRequesterBadge = (requester: string) => {
    const requesterConfig = {
      'ADMIN': { label: 'Administrador', color: 'bg-purple-100 text-purple-800' },
      'DOCTOR': { label: 'Médico', color: 'bg-blue-100 text-blue-800' },
      'AUDITOR': { label: 'Auditor', color: 'bg-green-100 text-green-800' }
    };
    
    const config = requesterConfig[requester as keyof typeof requesterConfig] || requesterConfig.ADMIN;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
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

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm('¿Está seguro de que desea eliminar este pedido médico?')) {
      try {
        setLoading(true);
        await obfuscatedApiClient.delete(`/medical-orders/${orderId}`);
        
        // Actualizar la lista local después de eliminar
        setOrders(orders.filter(order => order.id !== orderId));
        
        // Actualizar estadísticas
        setStats(prev => ({
          ...prev,
          total: prev.total - 1
        }));
        
        // Opcionalmente, recargar la lista completa para asegurar consistencia
        // await loadMedicalOrders();
        
      } catch (error) {
        console.error('Error al eliminar pedido:', error);
        setError('Error al eliminar el pedido médico. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <BaseLayout title="Pedidos Médicos">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Pedidos Médicos">
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Pedidos Médicos
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              Lista de todos los pedidos médicos ({stats.total} pedidos)
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Link to="/admin/medical-orders/create">
              <Button className="inline-flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Crear Pedido
              </Button>
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error al cargar pedidos
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white dark:bg-darkmode-600 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                      Total Pedidos
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.total}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-darkmode-600 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                      Pendientes
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.pending}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-darkmode-600 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                      Autorizados
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.authorized}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-darkmode-600 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircle className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                      Rechazados
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.rejected}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-darkmode-600 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                      Monto Total
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {formatCurrency(stats.totalAmount)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar pedidos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300"
              >
                <option value="all">Todos</option>
                <option value="DRAFT">Borrador</option>
                <option value="PENDING">Pendiente</option>
                <option value="AUTHORIZED">Autorizado</option>
                <option value="REJECTED">Rechazado</option>
                <option value="COMPLETED">Completado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Urgencia
              </label>
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300"
              >
                <option value="all">Todas</option>
                <option value="LOW">Baja</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente</option>
                <option value="CRITICAL">Crítica</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Solicitante
              </label>
              <select
                value={requesterFilter}
                onChange={(e) => setRequesterFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300"
              >
                <option value="all">Todos</option>
                <option value="ADMIN">Administrador</option>
                <option value="DOCTOR">Médico</option>
                <option value="AUDITOR">Auditor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Fecha Desde
              </label>
              <Input
                type="date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Fecha Hasta
              </label>
              <Input
                type="date"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-darkmode-400">
              <thead className="bg-gray-50 dark:bg-darkmode-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Pedido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Afiliado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Solicitante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Urgencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-darkmode-600 divide-y divide-gray-200 dark:divide-darkmode-400">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay pedidos</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                        No se encontraron pedidos médicos con los filtros aplicados.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-darkmode-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.orderNumber}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-slate-400">
                            {order.healthcareProvider}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {order.affiliateName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900 dark:text-white">
                            {order.requesterName}
                          </div>
                          <div className="mt-1">
                            {getRequesterBadge(order.requesterType)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.state)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getUrgencyBadge(order.urgencyLevel)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(order.totalAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/admin/medical-orders/${order.id}`}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/medical-orders/${order.id}/edit`}
                            className="text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-300 p-1 rounded hover:bg-gray-50 dark:hover:bg-darkmode-700"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default MedicalOrderListPage; 