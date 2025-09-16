import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Building,
  Brain
} from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';
import { useToast } from '../../../../shared/components/ui/ToastContainer';
import { useAuth } from '../../../contexts/AuthContext';
import { useObfuscation } from '../../../../shared/contexts/ObfuscationContext';

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
  effector_info?: {
    effector_name: string;
    effector_type: string;
    contact_name?: string;
    contact_phone?: string;
  };
  items?: Array<{
    item_id: string;
    article_name: string;
    quantity: number;
    estimated_total_price?: number;
  }>;
  institution_department?: string;
  requesting_doctor?: string;
  medical_area?: string;
  clinical_justification?: string;
  estimated_beneficiaries?: number;
  ai_analysis_result?: any;
  ai_analyzed_at?: string;
}

interface Filters {
  search: string;
  priority: string;
  state: string;
  dateFrom: string;
  dateTo: string;
}

const EffectorRequestListAdminPage: React.FC = () => {
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

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'BAJA': { label: 'Baja', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      'NORMAL': { label: 'Normal', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      'ALTA': { label: 'Alta', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      'URGENTE': { label: 'Urgente', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    };
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.NORMAL;
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getStateBadge = (state?: { state_name: string }) => {
    if (!state) return null;
    
    const stateConfig = {
      'PENDIENTE': { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Clock },
      'APROBADO': { label: 'Aprobado', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle },
      'RECHAZADO': { label: 'Rechazado', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: XCircle },
      'CANCELADO': { label: 'Cancelado', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', icon: XCircle },
      'EN_COTIZACION': { label: 'En Cotización', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: FileText },
      'COTIZADO': { label: 'Cotizado', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200', icon: FileText },
      'ADJUDICADO': { label: 'Adjudicado', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: CheckCircle },
    };
    
    const config = stateConfig[state.state_name as keyof typeof stateConfig] || stateConfig.PENDIENTE;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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

  // Eliminar pedido
  const handleDelete = async (requestId: string, title: string) => {
    if (!confirm(`¿Está seguro de que desea eliminar el pedido "${title}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      setLoading(true);
      await obfuscatedApiClient.delete(`/v1/effector-requests/${requestId}`);
      showSuccess('Éxito', 'Pedido eliminado exitosamente');
      loadRequests();
    } catch (error: any) {
      console.error('Error deleting request:', error);
      showError('Error', error.response?.data?.message || 'Error al eliminar el pedido');
    } finally {
      setLoading(false);
    }
  };

  // Analizar pedido con IA
  const handleAIAnalyze = async (requestId: string) => {
    try {
      await obfuscatedApiClient.post(`/v1/effector-requests/${requestId}/ai-analyze`);
      showSuccess('Éxito', 'Análisis de IA iniciado correctamente');
      loadRequests(); // Recargar la lista para ver el resultado
    } catch (error: any) {
      console.error('Error analyzing request with AI:', error);
      showError('Error', error.response?.data?.message || 'No se pudo iniciar el análisis de IA');
    }
  };

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

  return (
    <BaseLayout title="Gestión de Pedidos de Efectores">
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de Pedidos de Efectores
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              Administre todos los pedidos médicos institucionales ({requests.length} pedidos)
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Link to="/admin/effector-requests">
              <Button variant="outline-primary">
                <Clock className="w-4 h-4 mr-2" />
                Revisar Pendientes
              </Button>
            </Link>
            <Link to="/admin/effector-requests/create">
              <Button className="inline-flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Crear Pedido
              </Button>
            </Link>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white dark:bg-darkmode-600 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                      Total Pedidos
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.total || 0}
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
                      {stats.pendiente || 0}
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
                      Aprobados
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.aprobado || 0}
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
                  <AlertCircle className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                      Urgentes
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.urgentRequests || 0}
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
                  <DollarSign className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                      Valor Total
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      ${(stats.totalAmount || 0).toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Filtros
            </h3>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Buscar por título, número, efector, médico..."
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
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

        {/* Requests Table */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-darkmode-400">
              <thead className="bg-gray-50 dark:bg-darkmode-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Pedido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Efector
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Items
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
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-500 dark:text-slate-400">Cargando pedidos...</span>
                      </div>
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                      <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">No hay pedidos</h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        No se encontraron pedidos de efectores con los filtros aplicados.
                      </p>
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.request_id} className="hover:bg-gray-50 dark:hover:bg-darkmode-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {request.request_number}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-slate-400 truncate max-w-48">
                            {request.title}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                            Creado: {formatDate(request.created_at)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {request.effector_info?.effector_name || 'Sin información'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-slate-400">
                            {request.effector_info?.effector_type || 'Tipo no especificado'}
                          </div>
                          {request.effector_info?.contact_name && (
                            <div className="text-xs text-gray-400 dark:text-slate-500">
                              {request.effector_info.contact_name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(request.priority)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStateBadge(request.state)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(request.total_estimated_amount)}
                        </div>
                        {request.ai_analysis_result && (
                          <div className="flex items-center text-xs text-purple-600 dark:text-purple-400">
                            <Brain className="w-3 h-3 mr-1" />
                            IA Analizado
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {request.items?.length || 0} items
                        </div>
                        {request.items && request.items.length > 0 && (
                          <div className="text-xs text-gray-500 dark:text-slate-400">
                            {request.items.slice(0, 2).map(item => item.article_name).join(', ')}
                            {request.items.length > 2 && ` y ${request.items.length - 2} más`}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatDate(request.created_at)}
                        </div>
                        {request.delivery_date && (
                          <div className="text-xs text-gray-500 dark:text-slate-400">
                            Entrega: {new Date(request.delivery_date).toLocaleDateString('es-AR')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link to={`/admin/effector-requests/${request.request_id}`}>
                            <Button variant="outline-primary" size="sm" className="p-1">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link to={`/admin/effector-requests/${request.request_id}/edit`}>
                            <Button variant="outline-primary" size="sm" className="p-1">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          {!request.ai_analysis_result && request.state?.state_name !== 'APROBADO' && request.state?.state_name !== 'RECHAZADO' && (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleAIAnalyze(request.request_id)}
                              className="p-1 text-purple-600 border-purple-300 hover:border-purple-400"
                              title="Analizar con IA"
                            >
                              <Brain className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleDelete(request.request_id, request.title)}
                            className="p-1 text-red-600 border-red-300 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Eliminar pedido"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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

export default EffectorRequestListAdminPage; 