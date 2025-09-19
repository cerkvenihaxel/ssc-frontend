import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  Calendar,
  User,
  Building,
  DollarSign,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Brain,
  Phone,
  Mail,
  MapPin,
  Users,
  TrendingUp,
  Download,
  Shield,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import { useToast } from '../../../../shared/components/ui/ToastContainer';
import { useAuth } from '../../../contexts/AuthContext';
import { useObfuscation } from '../../../../shared/contexts/ObfuscationContext';
import AuthorizeEffectorRequestModal from '../../../../shared/components/modals/AuthorizeEffectorRequestModal';

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
  delivery_address?: string;
  created_at: string;
  updated_at: string;
  effector_info?: {
    effector_name: string;
    effector_type: string;
    contact_name?: string;
    contact_phone?: string;
    contact_email?: string;
    address?: {
      calle: string;
      ciudad: string;
      numero: string;
      provincia: string;
      codigo_postal: string;
    } | string;
  };
  items?: Array<{
    item_id: string;
    article_name: string;
    article_code?: string;
    quantity: number;
    unit_price?: number;
    estimated_total_price?: number;
    medical_justification?: string;
    therapeutic_indication?: string;
    monthly_consumption?: number;
    patient_quantity?: number;
  }>;
  institution_department?: string;
  requesting_doctor?: string;
  medical_area?: string;
  clinical_justification?: string;
  estimated_beneficiaries?: number;
  urgency_justification?: string;
  epidemiological_context?: string;
  ai_analysis_result?: {
    recommendation: string;
    approval_recommendation: boolean;
    confidence_score: number;
    risk_level: string;
    analysis_summary: string;
    detailed_analysis: any;
  };
  ai_analyzed_at?: string;
  authorization_type?: string;
  requires_ai_analysis?: boolean;
}

const EffectorRequestDetailsAdminPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const { obfuscatedApiClient } = useObfuscation();

  const [request, setRequest] = useState<EffectorRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authorizing, setAuthorizing] = useState(false);

  // Cargar detalles del pedido
  const loadRequestDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await obfuscatedApiClient.get(`/v1/effector-requests/${id}`);
      setRequest((response as any));
    } catch (error) {
      console.error('Error loading request details:', error);
      showError('Error', 'No se pudieron cargar los detalles del pedido');
      navigate('/admin/effector-requests/list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequestDetails();
  }, [id]);

  // Eliminar pedido
  const handleDelete = async () => {
    if (!request || !confirm(`¿Está seguro de que desea eliminar el pedido "${request.title}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      setDeleting(true);
      await obfuscatedApiClient.delete(`/v1/effector-requests/${request.request_id}`);
      showSuccess('Éxito', 'Pedido eliminado exitosamente');
      navigate('/admin/effector-requests/list');
    } catch (error: any) {
      console.error('Error deleting request:', error);
      showError('Error', error.response?.data?.message || 'Error al eliminar el pedido');
    } finally {
      setDeleting(false);
    }
  };

  // Verificar si el usuario puede autorizar
  const canAuthorize = () => {
    if (!user) return false;
    // Admin (roleId: 1) o Auditor (roleId: 4) pueden autorizar
    return user.role.id === 1 || user.role.id === 4 || user.role.name === 'Administrador' || user.role.name === 'Auditor';
  };

  // Verificar si el pedido puede ser autorizado
  const canBeAuthorized = () => {
    if (!request) return false;
    // Solo pedidos pendientes pueden ser autorizados
    return request.state?.state_name === 'PENDIENTE';
  };

  // Aprobar pedido
  const handleApprove = async (requestId: string, notes?: string) => {
    try {
      setAuthorizing(true);
      await obfuscatedApiClient.post(`/v1/effector-requests/${requestId}/approve`, {
        decision: 'approved',
        comments: notes || '',
        approvedBy: user?.userId
      });
      showSuccess('Éxito', 'Pedido aprobado exitosamente');
      await loadRequestDetails(); // Recargar detalles
    } catch (error: any) {
      console.error('Error approving request:', error);
      showError('Error', error.response?.data?.message || 'Error al aprobar el pedido');
    } finally {
      setAuthorizing(false);
    }
  };

  // Rechazar pedido
  const handleReject = async (requestId: string, reason: string, notes?: string) => {
    try {
      setAuthorizing(true);
      await obfuscatedApiClient.post(`/v1/effector-requests/${requestId}/approve`, {
        decision: 'rejected',
        rejectionReason: reason,
        comments: notes || '',
        approvedBy: user?.userId
      });
      showSuccess('Éxito', 'Pedido rechazado exitosamente');
      await loadRequestDetails(); // Recargar detalles
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      showError('Error', error.response?.data?.message || 'Error al rechazar el pedido');
    } finally {
      setAuthorizing(false);
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

  // Formatear moneda
  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Formatear fecha
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatear dirección
  const formatAddress = (address?: { calle: string; ciudad: string; numero: string; provincia: string; codigo_postal: string; } | string) => {
    if (!address) return 'No especificada';
    
    if (typeof address === 'string') {
      return address;
    }
    
    const parts = [];
    if (address.calle && address.numero) {
      parts.push(`${address.calle} ${address.numero}`);
    } else if (address.calle) {
      parts.push(address.calle);
    }
    
    if (address.ciudad) {
      parts.push(address.ciudad);
    }
    
    if (address.provincia) {
      parts.push(address.provincia);
    }
    
    if (address.codigo_postal) {
      parts.push(`CP ${address.codigo_postal}`);
    }
    
    return parts.join(', ') || 'Dirección incompleta';
  };

  if (loading) {
    return (
      <BaseLayout title="Cargando...">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Cargando detalles del pedido...
          </span>
        </div>
      </BaseLayout>
    );
  }

  if (!request) {
    return (
      <BaseLayout title="Pedido no encontrado">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Pedido no encontrado
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            El pedido solicitado no existe o ha sido eliminado.
          </p>
          <div className="mt-6">
            <Link to="/admin/effector-requests/list">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a la Lista
              </Button>
            </Link>
          </div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title={`Pedido: ${request.title}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/admin/effector-requests/list">
              <Button variant="outline-secondary" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {request.title}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                Pedido #{request.request_number} • Creado el {formatDate(request.created_at)}
              </p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-3">
            {/* Botones de Autorización - Solo para Admin y Auditor */}
            {canAuthorize() && canBeAuthorized() && (
              <>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => setShowAuthModal(true)}
                  disabled={authorizing}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Autorizar Pedido
                </Button>
              </>
            )}

            <Button variant="outline-primary" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline-primary" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Imprimir
            </Button>

            {/* Botones de edición y eliminación */}
            <Link to={`/admin/effector-requests/${request.request_id}/edit`}>
              <Button variant="primary" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </Link>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-600 border-red-300 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </div>

        {/* Estado y Prioridad */}
        <div className="flex flex-wrap gap-3">
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStateColor(request.state?.state_name || 'PENDIENTE')}`}>
            {getStateIcon(request.state?.state_name || 'PENDIENTE')}
            {request.state?.state_name || 'PENDIENTE'}
          </span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(request.priority)}`}>
            Prioridad: {request.priority}
          </span>
          {request.ai_analysis_result && (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
              <Brain className="w-4 h-4" />
              Analizado por IA
            </span>
          )}
          {request.total_estimated_amount && request.total_estimated_amount > 500000 && (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
              <AlertCircle className="w-4 h-4" />
              Alto Valor
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información General */}
            <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Información General
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Título
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {request.title}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Número de Pedido
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {request.request_number}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fecha de Entrega Solicitada
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {request.delivery_date ? new Date(request.delivery_date).toLocaleDateString() : 'No especificada'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Valor Total Estimado
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white font-semibold">
                    {formatCurrency(request.total_estimated_amount)}
                  </p>
                </div>
              </div>
              {request.delivery_address && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Dirección de Entrega
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white flex items-start">
                    <MapPin className="w-4 h-4 mr-1 mt-0.5" />
                    {request.delivery_address}
                  </p>
                </div>
              )}
              {request.description && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Descripción
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {request.description}
                  </p>
                </div>
              )}
            </div>

            {/* Información Médica */}
            <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Información Médica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Médico Solicitante
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {request.requesting_doctor || 'No especificado'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Área Médica
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {request.medical_area || 'No especificada'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Departamento
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {request.institution_department || 'No especificado'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Beneficiarios Estimados
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {request.estimated_beneficiaries || 'No especificado'}
                  </p>
                </div>
              </div>
              {request.clinical_justification && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Justificación Clínica
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {request.clinical_justification}
                  </p>
                </div>
              )}
              {request.urgency_justification && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Justificación de Urgencia
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {request.urgency_justification}
                  </p>
                </div>
              )}
            </div>

            {/* Items del Pedido */}
            <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Items del Pedido ({request.items?.length || 0})
              </h3>
              {request.items && request.items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                    <thead className="bg-gray-50 dark:bg-darkmode-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Artículo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Cantidad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Precio Unit.
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Justificación
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-darkmode-600 divide-y divide-gray-200 dark:divide-gray-600">
                      {request.items.map((item, index) => (
                        <tr key={item.item_id || index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {item.article_name}
                              </div>
                              {item.article_code && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  Código: {item.article_code}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.quantity.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(item.estimated_total_price)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {item.medical_justification || 'Sin justificación específica'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No hay items en este pedido
                </p>
              )}
            </div>

            {/* Análisis de IA */}
            {request.ai_analysis_result && (
              <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-blue-500" />
                  Análisis de Inteligencia Artificial
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {Math.round(request.ai_analysis_result.confidence_score * 100)}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Confianza</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        request.ai_analysis_result.approval_recommendation 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {request.ai_analysis_result.approval_recommendation ? 'APROBAR' : 'RECHAZAR'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Recomendación</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        request.ai_analysis_result.risk_level === 'BAJO' 
                          ? 'text-green-600 dark:text-green-400'
                          : request.ai_analysis_result.risk_level === 'MEDIO'
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {request.ai_analysis_result.risk_level}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Riesgo</div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Resumen del Análisis
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {request.ai_analysis_result.analysis_summary}
                    </p>
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Analizado el {formatDate(request.ai_analyzed_at!)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Información del Efector */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Información del Efector
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nombre
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {request.effector_info?.effector_name || 'No especificado'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tipo
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {request.effector_info?.effector_type || 'No especificado'}
                  </p>
                </div>
                {request.effector_info?.contact_name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Contacto
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {request.effector_info.contact_name}
                    </p>
                  </div>
                )}
                {request.effector_info?.contact_phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Teléfono
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {request.effector_info.contact_phone}
                    </p>
                  </div>
                )}
                {request.effector_info?.contact_email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {request.effector_info.contact_email}
                    </p>
                  </div>
                )}
                {request.effector_info?.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Dirección
                    </label>
                                          <p className="mt-1 text-sm text-gray-900 dark:text-white flex items-start">
                        <MapPin className="w-4 h-4 mr-1 mt-0.5" />
                        {formatAddress(request.effector_info.address)}
                      </p>
                  </div>
                )}
              </div>
            </div>

            {/* Metadatos */}
            <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Metadatos
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Creado
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {formatDate(request.created_at)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Última Actualización
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {formatDate(request.updated_at)}
                  </p>
                </div>
                {request.authorization_type && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tipo de Autorización
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {request.authorization_type}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Autorización */}
      {request && (
        <AuthorizeEffectorRequestModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          request={request}
          onApprove={handleApprove}
          onReject={handleReject}
          loading={authorizing}
        />
      )}
    </BaseLayout>
  );
};

export default EffectorRequestDetailsAdminPage; 