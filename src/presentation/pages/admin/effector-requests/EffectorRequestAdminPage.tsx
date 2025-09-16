import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  DollarSign,
  Package,
  Building,
  Users,
  Brain,
  FileText,
  MessageSquare,
  Clock
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

interface ApprovalModal {
  isOpen: boolean;
  request?: EffectorRequest;
  decision: 'approved' | 'rejected' | 'partial' | 'needs_review';
}

const EffectorRequestAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const { obfuscatedApiClient } = useObfuscation();

  const [requests, setRequests] = useState<EffectorRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [approvalModal, setApprovalModal] = useState<ApprovalModal>({
    isOpen: false,
    decision: 'approved'
  });
  const [approvalData, setApprovalData] = useState({
    comments: '',
    rejectionReason: '',
    administrativeNotes: '',
    requiresMedicalReview: false,
    requiresEconomicReview: false
  });

  // Cargar pedidos pendientes de revisión
  const loadRequests = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (priorityFilter) queryParams.append('priority', priorityFilter);
      if (stateFilter) queryParams.append('state', stateFilter);

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
  }, [searchTerm, priorityFilter, stateFilter]);

  // Analizar con IA
  const analyzeWithAI = async (requestId: string) => {
    try {
      setLoading(true);
      await obfuscatedApiClient.post(`/v1/effector-requests/${requestId}/ai-analyze`);
      showSuccess('Éxito', 'Análisis de IA completado');
      loadRequests();
    } catch (error: any) {
      console.error('Error analyzing with AI:', error);
      showError('Error', error.response?.data?.message || 'Error en el análisis de IA');
    } finally {
      setLoading(false);
    }
  };

  // Aprobar/Rechazar pedido
  const handleApproval = async () => {
    if (!approvalModal.request) return;

    try {
      setLoading(true);
      
      const approvalPayload = {
        decision: approvalModal.decision,
        approval_comments: approvalData.comments,
        rejection_reason: approvalData.rejectionReason,
        administrative_notes: approvalData.administrativeNotes,
        requires_medical_review: approvalData.requiresMedicalReview,
        requires_economic_review: approvalData.requiresEconomicReview,
        approved_by_name: user?.nombre,
        approved_by_role: user?.role?.name
      };

      await obfuscatedApiClient.post(
        `/v1/effector-requests/${approvalModal.request.request_id}/approve`,
        approvalPayload
      );

      const action = approvalModal.decision === 'approved' ? 'aprobado' : 
                    approvalModal.decision === 'rejected' ? 'rechazado' : 'procesado';
      
      showSuccess('Éxito', `Pedido ${action} exitosamente`);
      setApprovalModal({ isOpen: false, decision: 'approved' });
      setApprovalData({
        comments: '',
        rejectionReason: '',
        administrativeNotes: '',
        requiresMedicalReview: false,
        requiresEconomicReview: false
      });
      loadRequests();
    } catch (error: any) {
      console.error('Error processing approval:', error);
      showError('Error', error.response?.data?.message || 'Error al procesar la decisión');
    } finally {
      setLoading(false);
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
    <BaseLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de Pedidos de Efectores
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Revise y apruebe pedidos médicos institucionales
            </p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
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
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Urgentes
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stats.urgentRequests || 0}
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

        {/* Filtros */}
        <div className="bg-white dark:bg-darkmode-800 rounded-lg p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filtros y Búsqueda
            </h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por título, número, efector, médico..."
                  className="pl-10"
                />
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prioridad
                  </label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
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
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                             bg-white dark:bg-darkmode-700 text-gray-900 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Todos los estados</option>
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="APROBADO">Aprobado</option>
                    <option value="RECHAZADO">Rechazado</option>
                    <option value="EN_COTIZACION">En Cotización</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSearchTerm('');
                      setPriorityFilter('');
                      setStateFilter('');
                    }}
                    className="w-full"
                  >
                    Limpiar Filtros
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Pedidos */}
        <div className="bg-white dark:bg-darkmode-800 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pedidos para Revisión ({requests.length})
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
                No hay pedidos para revisar
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Todos los pedidos han sido procesados
              </p>
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
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStateColor(request.state?.state_name || 'PENDIENTE')}`}>
                          {request.state?.state_name || 'PENDIENTE'}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                          {request.priority}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Efector:</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {request.effector_info?.effector_name || 'No especificado'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {request.effector_info?.effector_type}
                          </p>
                        </div>

                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Departamento:</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {request.institution_department || 'No especificado'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {request.requesting_doctor || 'Sin médico asignado'}
                          </p>
                        </div>

                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Artículos:</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {request.items?.length || 0} items
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {request.estimated_beneficiaries || 0} beneficiarios
                          </p>
                        </div>

                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Valor:</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            ${(request.total_estimated_amount || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {request.clinical_justification && (
                        <div className="mb-3">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Justificación clínica:</span>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                            {request.clinical_justification}
                          </p>
                        </div>
                      )}

                      {/* Análisis de IA */}
                      {request.ai_analysis_result && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                Análisis de IA: {request.ai_analysis_result.decision?.toUpperCase()} 
                                (Confianza: {Math.round((request.ai_analysis_result.confidence || 0) * 100)}%)
                              </p>
                              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                {request.ai_analysis_result.reasoning}
                              </p>
                              {request.ai_analysis_result.riskFactors?.length > 0 && (
                                <div className="mt-2">
                                  <span className="text-xs text-blue-600 dark:text-blue-400">Factores de riesgo:</span>
                                  <p className="text-xs text-blue-700 dark:text-blue-300">
                                    {request.ai_analysis_result.riskFactors.join(', ')}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Alertas especiales */}
                      {request.total_estimated_amount && request.total_estimated_amount > 500000 && (
                        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                              Pedido de alto valor - Requiere autorización especial
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/admin/effector-requests/${request.request_id}`)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Ver Detalles
                        </Button>

                        {!request.ai_analysis_result && request.state?.state_name === 'PENDIENTE' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => analyzeWithAI(request.request_id)}
                            disabled={loading}
                            className="flex items-center gap-1"
                          >
                            <Brain className="w-4 h-4" />
                            Analizar IA
                          </Button>
                        )}
                      </div>

                      {request.state?.state_name === 'PENDIENTE' && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => setApprovalModal({
                              isOpen: true,
                              request,
                              decision: 'approved'
                            })}
                            className="flex items-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Aprobar
                          </Button>

                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setApprovalModal({
                              isOpen: true,
                              request,
                              decision: 'rejected'
                            })}
                            className="flex items-center gap-1"
                          >
                            <XCircle className="w-4 h-4" />
                            Rechazar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de Aprobación/Rechazo */}
        {approvalModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-darkmode-800 rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {approvalModal.decision === 'approved' ? 'Aprobar Pedido' : 'Rechazar Pedido'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {approvalModal.decision === 'approved' ? 'Comentarios de aprobación' : 'Motivo del rechazo'}
                  </label>
                  <textarea
                    value={approvalModal.decision === 'approved' ? approvalData.comments : approvalData.rejectionReason}
                    onChange={(e) => setApprovalData(prev => ({
                      ...prev,
                      [approvalModal.decision === 'approved' ? 'comments' : 'rejectionReason']: e.target.value
                    }))}
                    placeholder={approvalModal.decision === 'approved' 
                      ? 'Comentarios adicionales...' 
                      : 'Especifique el motivo del rechazo...'}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                             bg-white dark:bg-darkmode-700 text-gray-900 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notas administrativas
                  </label>
                  <textarea
                    value={approvalData.administrativeNotes}
                    onChange={(e) => setApprovalData(prev => ({ ...prev, administrativeNotes: e.target.value }))}
                    placeholder="Notas para el expediente..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                             bg-white dark:bg-darkmode-700 text-gray-900 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="requiresMedicalReview"
                      checked={approvalData.requiresMedicalReview}
                      onChange={(e) => setApprovalData(prev => ({ ...prev, requiresMedicalReview: e.target.checked }))}
                      className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="requiresMedicalReview" className="text-sm text-gray-700 dark:text-gray-300">
                      Requiere revisión médica adicional
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="requiresEconomicReview"
                      checked={approvalData.requiresEconomicReview}
                      onChange={(e) => setApprovalData(prev => ({ ...prev, requiresEconomicReview: e.target.checked }))}
                      className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="requiresEconomicReview" className="text-sm text-gray-700 dark:text-gray-300">
                      Requiere revisión económica
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setApprovalModal({ isOpen: false, decision: 'approved' });
                    setApprovalData({
                      comments: '',
                      rejectionReason: '',
                      administrativeNotes: '',
                      requiresMedicalReview: false,
                      requiresEconomicReview: false
                    });
                  }}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  variant={approvalModal.decision === 'approved' ? 'success' : 'danger'}
                  onClick={handleApproval}
                  disabled={loading || (!approvalData.comments && !approvalData.rejectionReason)}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : approvalModal.decision === 'approved' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  {loading ? 'Procesando...' : (approvalModal.decision === 'approved' ? 'Aprobar' : 'Rechazar')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default EffectorRequestAdminPage; 