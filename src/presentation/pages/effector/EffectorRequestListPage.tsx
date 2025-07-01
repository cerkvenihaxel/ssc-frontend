import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  Calendar,
  DollarSign,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Building
} from 'lucide-react';
import BaseLayout from '../../../shared/components/layout/BaseLayout';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import { useToast } from '../../../shared/components/ui/ToastContainer';
import { useAuth } from '../../contexts/AuthContext';
import { useObfuscation } from '../../../shared/contexts/ObfuscationContext';

interface EffectorRequest {
  request_id: string;
  request_number: string;
  title: string;
  description?: string;
  priority: 'BAJA' | 'NORMAL' | 'ALTA' | 'URGENTE';
  state?: {
    state_id: string;
    state_name: string;
    description?: string;
  };
  total_estimated_amount?: number;
  delivery_date?: string;
  created_at: string;
  updated_at: string;
  items?: Array<{
    item_id: string;
    article_name: string;
    quantity: number;
    estimated_total_price?: number;
  }>;
  institution_department?: string;
  requesting_doctor?: string;
  medical_area?: string;
}

interface Filters {
  search: string;
  priority: string;
  state: string;
  dateFrom: string;
  dateTo: string;
}

const EffectorRequestListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const { obfuscatedApiClient } = useObfuscation();

  const [requests, setRequests] = useState<EffectorRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    search: '',
    priority: '',
    state: '',
    dateFrom: '',
    dateTo: ''
  });

  // Cargar pedidos
  const loadRequests = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.state) queryParams.append('state', filters.state);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);

      const response = await obfuscatedApiClient.get(
        `/v1/effector-requests?${queryParams.toString()}`
      );
      
      setRequests((response as any) || []);
      
      // Cargar estadísticas
      const statsResponse = await obfuscatedApiClient.get('/v1/effector-requests/admin/statistics');
      setStats((statsResponse as any) || {});
    } catch (error) {
      console.error('Error loading requests:', error);
      showError('Error', 'No se pudieron cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [filters]);

  // Obtener color del estado
  const getStateColor = (stateName: string) => {
    const colors = {
      'PENDIENTE': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      'APROBADO': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'RECHAZADO': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      'CANCELADO': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
      'EN_COTIZACION': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'COTIZADO': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      'ADJUDICADO': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300'
    };
    return colors[stateName as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Obtener ícono del estado
  const getStateIcon = (stateName: string) => {
    const icons = {
      'PENDIENTE': <Clock className="w-4 h-4" />,
      'APROBADO': <CheckCircle className="w-4 h-4" />,
      'RECHAZADO': <XCircle className="w-4 h-4" />,
      'CANCELADO': <XCircle className="w-4 h-4" />,
      'EN_COTIZACION': <TrendingUp className="w-4 h-4" />,
      'COTIZADO': <FileText className="w-4 h-4" />,
      'ADJUDICADO': <CheckCircle className="w-4 h-4" />
    };
    return icons[stateName as keyof typeof icons] || <Clock className="w-4 h-4" />;
  };

  // Obtener color de prioridad
  const getPriorityColor = (priority: string) => {
    const colors = {
      'BAJA': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
      'NORMAL': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'ALTA': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      'URGENTE': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Eliminar pedido
  const handleDelete = async (requestId: string) => {
    if (!confirm('¿Está seguro de que desea eliminar este pedido?')) {
      return;
    }

    try {
      await obfuscatedApiClient.delete(`/v1/effector-requests/${requestId}`);
      showSuccess('Éxito', 'Pedido eliminado exitosamente');
      loadRequests();
    } catch (error: any) {
      console.error('Error deleting request:', error);
      showError('Error', error.response?.data?.message || 'Error al eliminar el pedido');
    }
  };

  return (
    <BaseLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Mis Pedidos Médicos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestione los pedidos de medicamentos e insumos de su institución
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/effector/requests/create')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Pedido
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-darkmode-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Pedidos
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stats.total || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-darkmode-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pendientes
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stats.pendiente || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-darkmode-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Aprobados
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stats.aprobado || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-darkmode-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Valor Total
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  ${(stats.totalAmount || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white dark:bg-darkmode-800 rounded-lg p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Buscar y Filtrar
            </h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Buscar por título, número de pedido, médico..."
                  className="pl-10"
                />
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prioridad
                  </label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                             bg-white dark:bg-darkmode-700 text-gray-900 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Todas las prioridades</option>
                    <option value="BAJA">Baja</option>
                    <option value="NORMAL">Normal</option>
                    <option value="ALTA">Alta</option>
                    <option value="URGENTE">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estado
                  </label>
                  <select
                    value={filters.state}
                    onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                             bg-white dark:bg-darkmode-700 text-gray-900 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Todos los estados</option>
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="APROBADO">Aprobado</option>
                    <option value="RECHAZADO">Rechazado</option>
                    <option value="EN_COTIZACION">En Cotización</option>
                    <option value="COTIZADO">Cotizado</option>
                    <option value="ADJUDICADO">Adjudicado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha Desde
                  </label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha Hasta
                  </label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Pedidos */}
        <div className="bg-white dark:bg-darkmode-800 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pedidos ({requests.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">
                Cargando pedidos...
              </span>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay pedidos
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Comience creando su primer pedido médico institucional
              </p>
              <Button
                variant="primary"
                onClick={() => navigate('/effector/requests/create')}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Crear Primer Pedido
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-600">
              {requests.map((request) => (
                <div
                  key={request.request_id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-darkmode-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {request.title}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStateColor(request.state?.state_name || 'PENDIENTE')}`}>
                          {getStateIcon(request.state?.state_name || 'PENDIENTE')}
                          {request.state?.state_name || 'PENDIENTE'}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                          {request.priority}
                        </span>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {request.description || 'Sin descripción'}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Número:</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {request.request_number}
                          </p>
                        </div>

                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Departamento:</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {request.institution_department || 'No especificado'}
                          </p>
                        </div>

                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Médico:</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {request.requesting_doctor || 'No especificado'}
                          </p>
                        </div>

                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Artículos:</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {request.items?.length || 0} items
                          </p>
                        </div>

                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Valor:</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            ${(request.total_estimated_amount || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Creado: {new Date(request.created_at).toLocaleDateString()}
                        </div>
                        {request.delivery_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Entrega: {new Date(request.delivery_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {request.total_estimated_amount && request.total_estimated_amount > 500000 && (
                        <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm text-yellow-800 dark:text-yellow-200">
                              Pedido de alto valor - Requiere autorización especial
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/effector/requests/${request.request_id}`)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </Button>
                      
                      {(request.state?.state_name === 'PENDIENTE' || request.state?.state_name === 'RECHAZADO') && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/effector/requests/${request.request_id}/edit`)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </Button>
                      )}

                      {(request.state?.state_name === 'PENDIENTE' || request.state?.state_name === 'RECHAZADO') && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(request.request_id)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
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
      </div>
    </BaseLayout>
  );
};

export default EffectorRequestListPage; 