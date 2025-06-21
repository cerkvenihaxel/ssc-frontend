import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Bot, 
  User, 
  FileText,
  AlertCircle,
  Eye,
  Activity,
  Calendar,
  CreditCard,
  Package,
  Stethoscope,
  TrendingUp
} from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import LoadingSpinner from '../../../../shared/components/ui/LoadingSpinner';
import { useObfuscation } from '../../../../shared/contexts/ObfuscationContext';

// Interfaces
interface MedicalOrderItem {
  id: string;
  articleId: string;
  articleName: string;
  articleCode: string;
  articleDescription?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  justification: string;
  authorizationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  aiRecommendation?: {
    status: 'APPROVED' | 'REJECTED' | 'NEEDS_REVIEW';
    confidence: number;
    reasoning: string;
  };
}

interface MedicalOrder {
  id: string;
  orderNumber: string;
  affiliateId: string;
  affiliateName: string;
  affiliateNumber: string;
  healthcareProvider: string;
  requesterType: 'ADMIN' | 'DOCTOR' | 'AUDITOR';
  requesterName: string;
  state: 'DRAFT' | 'PENDING' | 'AUTHORIZED' | 'PARTIALLY_AUTHORIZED' | 'REJECTED' | 'IN_PREPARATION' | 'READY' | 'DELIVERED' | 'COMPLETED';
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'CRITICAL';
  authorizationType: 'MANUAL' | 'AI' | 'HYBRID';
  medicalJustification: string;
  observations?: string;
  totalAmount: number;
  approvedAmount?: number;
  rejectedAmount?: number;
  items: MedicalOrderItem[];
  aiAnalysis?: {
    status: 'APPROVED' | 'REJECTED' | 'NEEDS_REVIEW';
    confidence: number;
    reasoning: string;
    analyzedAt: string;
  };
  authorizationHistory: {
    id: string;
    action: 'CREATED' | 'AI_ANALYZED' | 'AUTHORIZED' | 'REJECTED' | 'MODIFIED';
    performedBy: string;
    performedAt: string;
    notes?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

const MedicalOrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { obfuscatedApiClient } = useObfuscation();
  const [order, setOrder] = useState<MedicalOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authorizing, setAuthorizing] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [authorizationHistory, setAuthorizationHistory] = useState<any[]>([]);

  // Funciones auxiliares para mapear datos del backend al frontend
  const mapBackendStateToFrontend = (backendState: string, stateId?: number): MedicalOrder['state'] => {
    // Si tenemos el ID del estado, usamos esa información más precisa
    if (stateId) {
      const stateIdMap: Record<number, MedicalOrder['state']> = {
        1: 'DRAFT',           // Borrador
        2: 'PENDING',         // Pendiente  
        3: 'PENDING',         // En Revisión (también se muestra como Pendiente pero con indicador especial)
        4: 'AUTHORIZED',      // Aprobado
        5: 'REJECTED',        // Rechazado
        6: 'PARTIALLY_AUTHORIZED', // Parcialmente Aprobado
        7: 'IN_PREPARATION',  // En Proceso
        8: 'COMPLETED',       // Completado
        9: 'REJECTED'         // Cancelado (se muestra como rechazado)
      };
      return stateIdMap[stateId] || 'PENDING';
    }
    
    // Fallback al mapeo anterior por authorization_status
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

  const mapBackendAuthTypeToFrontend = (backendType: string): MedicalOrder['authorizationType'] => {
    const authMap: Record<string, MedicalOrder['authorizationType']> = {
      'manual': 'MANUAL',
      'automatic': 'AI',
      'hybrid': 'HYBRID'
    };
    return authMap[backendType] || 'MANUAL';
  };

  // Cargar datos del pedido
  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Llamada real a la API
      const response = await obfuscatedApiClient.get(`/medical-orders/${id}`) as any;
      
      // Transformar datos del backend al formato frontend
      const transformedOrder: MedicalOrder = {
        id: response.orderId,
        orderNumber: response.orderNumber,
        affiliateId: response.affiliateId,
        affiliateName: response.affiliateName || 'Afiliado',
        affiliateNumber: response.affiliateNumber || 'N/A',
        healthcareProvider: response.healthcareProviderName || 'Obra Social',
        requesterType: response.requesterType.toUpperCase() as MedicalOrder['requesterType'],
        requesterName: response.requesterName || 'Usuario',
        state: mapBackendStateToFrontend(response.authorizationStatus, response.state?.id),
        urgencyLevel: mapBackendUrgencyToFrontend(response.urgency?.name || 'Normal'),
        authorizationType: mapBackendAuthTypeToFrontend(response.authorizationType),
        medicalJustification: response.medicalJustification || '',
        observations: response.description || '',
        totalAmount: response.estimatedCost || 0,
        approvedAmount: response.approvedCost || 0,
        rejectedAmount: 0, // Calcular si es necesario
                  items: (response.items || []).map((item: any) => ({
            id: item.itemId,
            articleId: item.itemId,
            articleName: item.itemName,
            articleCode: item.itemCode,
            articleDescription: item.itemDescription,
            quantity: item.requestedQuantity,
            unitPrice: parseFloat(item.estimatedUnitCost || '0'),
            totalPrice: item.requestedQuantity * parseFloat(item.estimatedUnitCost || '0'),
            justification: item.medicalJustification || '',
            authorizationStatus: item.itemStatus === 'approved' ? 'APPROVED' : 
                               item.itemStatus === 'rejected' ? 'REJECTED' : 'PENDING',
            aiRecommendation: item.aiAnalysis ? {
              status: item.aiAnalysis.decision === 'approved' ? 'APPROVED' : 
                     item.aiAnalysis.decision === 'rejected' ? 'REJECTED' : 'NEEDS_REVIEW',
              confidence: item.aiAnalysis.confidence || 0,
              reasoning: item.aiAnalysis.reasoning || 'No AI analysis for this item'
            } : undefined
          })),
        aiAnalysis: response.aiAnalysisResult ? {
          status: response.authorizationStatus === 'approved' ? 'APPROVED' : 
                 response.authorizationStatus === 'rejected' ? 'REJECTED' : 'NEEDS_REVIEW',
          confidence: response.aiConfidenceScore || 0,
          reasoning: response.aiAnalysisResult?.reasoning || '',
          analyzedAt: response.aiAnalyzedAt || new Date().toISOString()
        } : undefined,
        authorizationHistory: [], // Se carga por separado
        createdAt: response.createdAt,
        updatedAt: response.updatedAt
      };

      setOrder(transformedOrder);
      
      // Cargar historial de autorizaciones por separado
      await loadAuthorizationHistory();
    } catch (err: any) {
      console.error('Error loading medical order:', err);
      setError('Error al cargar el pedido médico. Verifique que el ID sea correcto.');
    } finally {
      setLoading(false);
    }
  };

  const loadAuthorizationHistory = async () => {
    try {
      const historyResponse = await obfuscatedApiClient.get(`/medical-orders/${id}/authorization-history`) as any[];
      setAuthorizationHistory(historyResponse);
    } catch (err: any) {
      console.error('Error loading authorization history:', err);
      // No es crítico, solo loggeamos el error
    }
  };

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id, obfuscatedApiClient]);

  const handleDelete = async () => {
    if (!order) return;
    
    if (confirm(`¿Está seguro de que desea eliminar el pedido ${order.orderNumber}?`)) {
      try {
        // Llamada real a la API para eliminar
        await obfuscatedApiClient.delete(`/medical-orders/${order.id}`);
        alert('Pedido eliminado exitosamente');
        navigate('/admin/medical-orders');
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Error al eliminar el pedido');
      }
    }
  };

  const handleAuthorize = async (approve: boolean) => {
    if (!order) return;
    
    try {
      setAuthorizing(true);
      
      // Llamada real a la API para autorizar/rechazar
      const authData = {
        decision: approve ? 'approved' : 'rejected',
        notes: approve ? 'Pedido autorizado manualmente' : 'Pedido rechazado manualmente'
      };
      
      const response = await obfuscatedApiClient.post(`/medical-orders/${order.id}/authorize`, authData);
      
      console.log(`✅ Pedido ${approve ? 'autorizado' : 'rechazado'}:`, response);
      
      // Recargar completamente los datos del pedido desde el backend
      await loadOrder();
      
      alert(`Pedido ${approve ? 'autorizado' : 'rechazado'} exitosamente. Los datos se han actualizado.`);
    } catch (error) {
      console.error('Error authorizing order:', error);
      alert('Error al procesar la autorización');
    } finally {
      setAuthorizing(false);
    }
  };

  const handleAiAnalysis = async () => {
    if (!order) return;
    
    try {
      setAiAnalyzing(true);
      
      // Llamada real a la API para análisis de IA
      const response = await obfuscatedApiClient.post(`/medical-orders/${order.id}/ai-authorize`) as any;
      
      console.log('✅ Análisis de IA completado:', response);
      
      // Recargar completamente los datos del pedido desde el backend
      // para asegurar que tenemos la información más actualizada
      await loadOrder();
      
      alert('Análisis de IA completado exitosamente. Los datos se han actualizado.');
    } catch (error) {
      console.error('Error analyzing with AI:', error);
      alert('Error al procesar el análisis de IA');
    } finally {
      setAiAnalyzing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'DRAFT': { label: 'Borrador', color: 'bg-gray-100 text-gray-800', icon: FileText },
      'PENDING': { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'AUTHORIZED': { label: 'Autorizado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'PARTIALLY_AUTHORIZED': { label: 'Parcialmente Autorizado', color: 'bg-blue-100 text-blue-800', icon: Activity },
      'REJECTED': { label: 'Rechazado', color: 'bg-red-100 text-red-800', icon: XCircle },
      'IN_PREPARATION': { label: 'En Preparación', color: 'bg-purple-100 text-purple-800', icon: Activity },
      'READY': { label: 'Listo', color: 'bg-indigo-100 text-indigo-800', icon: CheckCircle },
      'DELIVERED': { label: 'Entregado', color: 'bg-teal-100 text-teal-800', icon: CheckCircle },
      'COMPLETED': { label: 'Completado', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-2" />
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getItemStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING': { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'APPROVED': { label: 'Aprobado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'REJECTED': { label: 'Rechazado', color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
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

  if (loading) {
    return (
      <BaseLayout title="Detalles del Pedido">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </BaseLayout>
    );
  }

  if (error || !order) {
    return (
      <BaseLayout title="Detalles del Pedido">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Error al cargar el pedido
          </h3>
          <p className="text-gray-500 dark:text-slate-400 mb-4">
            {error || 'No se pudo encontrar el pedido solicitado'}
          </p>
          <Link to="/admin/medical-orders">
            <Button variant="outline-secondary">Volver a Pedidos</Button>
          </Link>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title={`Pedido ${order.orderNumber}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/admin/medical-orders"
              className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Pedidos
            </Link>
          </div>
          
          <div className="flex items-center space-x-3">
            {order.state === 'PENDING' && (
              <>
                <Button
                  onClick={handleAiAnalysis}
                  disabled={aiAnalyzing}
                  variant="outline-primary"
                  className="inline-flex items-center"
                >
                  {aiAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                      Analizando...
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4 mr-2" />
                      Análisis IA
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => handleAuthorize(false)}
                  disabled={authorizing}
                  variant="outline-secondary"
                  className="text-red-600 hover:text-red-800"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rechazar
                </Button>
                
                <Button
                  onClick={() => handleAuthorize(true)}
                  disabled={authorizing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {authorizing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Autorizar
                    </>
                  )}
                </Button>
              </>
            )}

            {/* Botón de corrección para pedidos rechazados o parcialmente aprobados */}
            {(order.state === 'REJECTED' || order.state === 'PARTIALLY_AUTHORIZED') && (
              <Link to={`/admin/medical-orders/${order.id}/correct`}>
                <Button variant="outline-primary" className="inline-flex items-center">
                  <Edit className="w-4 h-4 mr-2" />
                  Corregir Pedido
                </Button>
              </Link>
            )}
            
            <Link to={`/admin/medical-orders/${order.id}/edit`}>
              <Button variant="outline-secondary" className="inline-flex items-center">
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </Link>
            
            <Button
              onClick={handleDelete}
              variant="outline-secondary"
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>

        {/* Información Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {order.orderNumber}
                  </h1>
                  <p className="text-gray-500 dark:text-slate-400">
                    Creado el {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(order.state)}
                  {getUrgencyBadge(order.urgencyLevel)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">
                    Información del Afiliado
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 dark:text-white">
                        {order.affiliateName}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 dark:text-white">
                        {order.affiliateNumber}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Stethoscope className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 dark:text-white">
                        {order.healthcareProvider}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">
                    Información del Solicitante
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 dark:text-white">
                        {order.requesterName}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Package className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 dark:text-white capitalize">
                        {order.requesterType.toLowerCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">
                  Justificación Médica
                </h3>
                <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-darkmode-700 rounded-lg p-4">
                  {order.medicalJustification}
                </p>
              </div>

              {order.observations && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">
                    Observaciones
                  </h3>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-darkmode-700 rounded-lg p-4">
                    {order.observations}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Resumen Financiero */}
            <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Resumen Financiero
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-slate-400">Total Solicitado:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
                {order.approvedAmount && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-slate-400">Monto Aprobado:</span>
                    <span className="font-medium text-green-600">
                      {formatPrice(order.approvedAmount)}
                    </span>
                  </div>
                )}
                {order.rejectedAmount && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-slate-400">Monto Rechazado:</span>
                    <span className="font-medium text-red-600">
                      {formatPrice(order.rejectedAmount)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Análisis de IA */}
            {order.aiAnalysis && (
              <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Análisis de IA
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-slate-400">Estado:</span>
                    <span className={`text-sm font-medium ${
                      order.aiAnalysis.status === 'APPROVED' ? 'text-green-600' :
                      order.aiAnalysis.status === 'REJECTED' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {order.aiAnalysis.status === 'APPROVED' ? 'Aprobado' :
                       order.aiAnalysis.status === 'REJECTED' ? 'Rechazado' :
                       'Requiere Revisión'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-slate-400">Confianza:</span>
                    <span className="text-sm font-medium">
                      {Math.round(order.aiAnalysis.confidence * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-darkmode-400 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${order.aiAnalysis.confidence * 100}%` }}
                    ></div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-gray-700 dark:text-slate-300">
                      {order.aiAnalysis.reasoning}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">
                    Analizado el {formatDate(order.aiAnalysis.analyzedAt)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Artículos del Pedido */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Artículos del Pedido ({order.items.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-darkmode-400">
              <thead className="bg-gray-50 dark:bg-darkmode-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Artículo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Precio Unitario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-darkmode-600 divide-y divide-gray-200 dark:divide-darkmode-400">
                {order.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-darkmode-700">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.articleName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">
                          {item.articleCode}
                        </div>
                        {item.articleDescription && (
                          <div className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                            {item.articleDescription}
                          </div>
                        )}
                        {item.justification && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 mt-2 bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                            <strong>Justificación:</strong> {item.justification}
                          </div>
                        )}
                        {item.aiRecommendation && (
                          <div className="text-xs mt-2 rounded p-3 border-l-4 border-orange-400 bg-orange-50 dark:bg-orange-900/20">
                            <div className="flex items-start space-x-2">
                              <div className="flex-shrink-0">
                                {item.aiRecommendation.status === 'APPROVED' ? (
                                  <svg className="w-4 h-4 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                  </svg>
                                ) : item.aiRecommendation.status === 'REJECTED' ? (
                                  <svg className="w-4 h-4 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4 text-orange-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                  </svg>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className={`font-medium ${
                                  item.aiRecommendation.status === 'APPROVED' ? 'text-green-800 dark:text-green-200' :
                                  item.aiRecommendation.status === 'REJECTED' ? 'text-red-800 dark:text-red-200' :
                                  'text-orange-800 dark:text-orange-200'
                                }`}>
                                  {item.aiRecommendation.status === 'APPROVED' ? '✅ Aprobado por IA' :
                                   item.aiRecommendation.status === 'REJECTED' ? '❌ Rechazado por IA' :
                                   '⚠️ Requiere Revisión'}
                                  {item.aiRecommendation.confidence > 0 && (
                                    <span className="ml-2 text-xs opacity-75">
                                      ({Math.round(item.aiRecommendation.confidence * 100)}% confianza)
                                    </span>
                                  )}
                                </div>
                                <div className={`mt-1 ${
                                  item.aiRecommendation.status === 'APPROVED' ? 'text-green-700 dark:text-green-300' :
                                  item.aiRecommendation.status === 'REJECTED' ? 'text-red-700 dark:text-red-300' :
                                  'text-orange-700 dark:text-orange-300'
                                }`}>
                                  {item.aiRecommendation.reasoning}
                                </div>
                                {item.aiRecommendation.status === 'REJECTED' && (
                                  <div className="text-blue-600 dark:text-blue-400 text-xs mt-2 bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                                    💡 <strong>Sugerencia:</strong> Considere medicamentos apropiados para "{order.medicalJustification}" como analgésicos, antiinflamatorios o expectorantes según corresponda.
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatPrice(item.unitPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {formatPrice(item.totalPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getItemStatusBadge(item.authorizationStatus)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Historial de Autorizaciones */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Historial de Autorizaciones
            </h3>
          </div>
          
          <div className="p-6">
            <div className="flow-root">
              <ul className="-mb-8">
                {authorizationHistory.map((event, eventIdx) => (
                  <li key={event.id}>
                    <div className="relative pb-8">
                      {eventIdx !== authorizationHistory.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-darkmode-400" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-darkmode-600 ${
                            event.action === 'CREATED' ? 'bg-gray-400' :
                            event.action === 'AI_ANALYZED' ? 'bg-purple-500' :
                            event.action === 'AUTHORIZED' ? 'bg-green-500' :
                            event.action === 'REJECTED' ? 'bg-red-500' :
                            'bg-blue-500'
                          }`}>
                            {event.action === 'CREATED' && <FileText className="h-4 w-4 text-white" />}
                            {event.action === 'AI_ANALYZED' && <Bot className="h-4 w-4 text-white" />}
                            {event.action === 'AUTHORIZED' && <CheckCircle className="h-4 w-4 text-white" />}
                            {event.action === 'REJECTED' && <XCircle className="h-4 w-4 text-white" />}
                            {event.action === 'MODIFIED' && <Edit className="h-4 w-4 text-white" />}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-slate-400">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {event.performedBy}
                              </span>{' '}
                              {event.action === 'CREATED' && 'creó el pedido'}
                              {event.action === 'AI_ANALYZED' && 'analizó con IA'}
                              {event.action === 'AUTHORIZED' && 'autorizó el pedido'}
                              {event.action === 'REJECTED' && 'rechazó el pedido'}
                              {event.action === 'MODIFIED' && 'modificó el pedido'}
                            </p>
                            {event.notes && (
                              <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">
                                {event.notes}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-slate-400">
                            <time dateTime={event.performedAt}>
                              {formatDate(event.performedAt)}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default MedicalOrderDetailsPage; 