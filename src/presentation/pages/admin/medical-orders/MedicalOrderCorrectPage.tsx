import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Trash2
} from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import LoadingSpinner from '../../../../shared/components/ui/LoadingSpinner';
import { useObfuscation } from '../../../../shared/contexts/ObfuscationContext';

interface MedicalOrderItem {
  id: string;
  articleId: string;
  articleName: string;
  articleCode: string;
  articleDescription?: string;
  quantity: number;
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
  createdAt: string;
  updatedAt: string;
}

interface ItemCorrection {
  itemId: string;
  action: 'modify' | 'replace' | 'remove';
  newQuantity?: number;
  newMedicalJustification?: string;
  replacementItem?: any;
  correctionReason: string;
}

const MedicalOrderCorrectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { obfuscatedApiClient } = useObfuscation();
  const [order, setOrder] = useState<MedicalOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Estados del formulario de corrección
  const [medicalJustification, setMedicalJustification] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [correctionNotes, setCorrectionNotes] = useState('');
  const [requestNewAiAnalysis, setRequestNewAiAnalysis] = useState(true);
  const [itemCorrections, setItemCorrections] = useState<ItemCorrection[]>([]);

  // Monitorear correcciones para detectar duplicados
  useEffect(() => {
    const itemIds = itemCorrections.map(c => c.itemId);
    const uniqueIds = new Set(itemIds);
    
    if (itemIds.length !== uniqueIds.size) {
      console.warn('⚠️ Se detectaron correcciones duplicadas:', itemCorrections);
      // Remover duplicados manteniendo solo la primera ocurrencia
      const uniqueCorrections = itemCorrections.filter((correction, index, self) => 
        index === self.findIndex(c => c.itemId === correction.itemId)
      );
      setItemCorrections(uniqueCorrections);
    }
  }, [itemCorrections]);

  // Cargar datos del pedido
  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      
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
        rejectedAmount: 0,
        items: (response.items || []).map((item: any) => ({
          id: item.itemId,
          articleId: item.itemId,
          articleName: item.itemName,
          articleCode: item.itemCode,
          articleDescription: item.itemDescription,
          quantity: item.requestedQuantity,
          justification: item.medicalJustification || '',
          authorizationStatus: item.itemStatus === 'approved' ? 'APPROVED' : 
                             item.itemStatus === 'rejected' ? 'REJECTED' : 'PENDING',
          aiRecommendation: item.rejectionReason && item.itemStatus === 'partial' ? {
            status: 'NEEDS_REVIEW' as const,
            confidence: 0,
            reasoning: item.rejectionReason
          } : undefined
        })),
        aiAnalysis: response.aiAnalysisResult ? {
          status: response.authorizationStatus === 'approved' ? 'APPROVED' : 
                 response.authorizationStatus === 'rejected' ? 'REJECTED' : 'NEEDS_REVIEW',
          confidence: response.aiConfidenceScore || 0,
          reasoning: response.aiAnalysisResult?.reasoning || '',
          analyzedAt: response.aiAnalyzedAt || new Date().toISOString()
        } : undefined,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt
      };

      setOrder(transformedOrder);
      
      // Inicializar formulario con datos actuales
      setMedicalJustification(transformedOrder.medicalJustification);
      setDiagnosis('');
      setTreatmentPlan('');
      
    } catch (err: any) {
      console.error('Error loading medical order:', err);
      setError('Error al cargar el pedido médico. Verifique que el ID sea correcto.');
    } finally {
      setLoading(false);
    }
  };

  // Funciones auxiliares de mapeo
  const mapBackendStateToFrontend = (backendState: string, stateId?: number): MedicalOrder['state'] => {
    if (stateId) {
      const stateIdMap: Record<number, MedicalOrder['state']> = {
        1: 'DRAFT',
        2: 'PENDING',
        3: 'PENDING',
        4: 'AUTHORIZED',
        5: 'REJECTED',
        6: 'PARTIALLY_AUTHORIZED',
        7: 'IN_PREPARATION',
        8: 'COMPLETED',
        9: 'REJECTED'
      };
      return stateIdMap[stateId] || 'PENDING';
    }
    
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

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id, obfuscatedApiClient]);

  const handleAddItemCorrection = (itemId: string) => {
    const item = order?.items.find(i => i.id === itemId);
    if (!item) return;

    // Verificar si ya existe una corrección para este item
    const existingCorrection = itemCorrections.find(c => c.itemId === itemId);
    if (existingCorrection) {
      // Si ya existe, no agregar otra
      return;
    }

    const newCorrection: ItemCorrection = {
      itemId,
      action: 'modify',
      newQuantity: item.quantity,
      newMedicalJustification: item.justification,
      correctionReason: ''
    };

    setItemCorrections(prev => {
      const updated = [...prev, newCorrection];
      console.log('✅ Corrección agregada para item:', itemId, 'Total correcciones:', updated.length);
      return updated;
    });
  };

  const handleRemoveItemCorrection = (itemId: string) => {
    setItemCorrections(prev => {
      const filtered = prev.filter(c => c.itemId !== itemId);
      console.log('❌ Corrección removida para item:', itemId, 'Total correcciones:', filtered.length);
      return filtered;
    });
  };

  const handleUpdateItemCorrection = (itemId: string, updates: Partial<ItemCorrection>) => {
    setItemCorrections(prev => {
      const existingIndex = prev.findIndex(c => c.itemId === itemId);
      if (existingIndex === -1) {
        // Si no existe la corrección, no hacer nada
        return prev;
      }
      
      // Actualizar solo la corrección existente
      const updatedCorrections = [...prev];
      updatedCorrections[existingIndex] = { ...updatedCorrections[existingIndex], ...updates };
      return updatedCorrections;
    });
  };

  const handleSubmitCorrections = async () => {
    if (!order) return;
    
    if (!correctionNotes.trim()) {
      alert('Por favor, ingrese comentarios sobre las correcciones realizadas.');
      return;
    }

    try {
      setSubmitting(true);
      
      // Filtrar correcciones válidas y remover duplicados
      const validCorrections = itemCorrections
        .filter(c => c.correctionReason.trim())
        .filter((correction, index, self) => 
          index === self.findIndex(c => c.itemId === correction.itemId)
        );

      console.log('📋 Correcciones antes del filtrado:', itemCorrections);
      console.log('✅ Correcciones válidas después del filtrado:', validCorrections);

      const correctionData = {
        medicalJustification: medicalJustification !== order.medicalJustification ? medicalJustification : undefined,
        diagnosis: diagnosis.trim() || undefined,
        treatmentPlan: treatmentPlan.trim() || undefined,
        itemCorrections: validCorrections,
        correctionNotes: correctionNotes.trim(),
        requestNewAiAnalysis
      };

      console.log('🚀 Enviando correcciones al backend:', correctionData);
      
      const response = await obfuscatedApiClient.post(`/medical-orders/${order.id}/correct`, correctionData);
      
      console.log('✅ Correcciones aplicadas:', response);
      
      alert('Correcciones aplicadas exitosamente. El pedido ha sido actualizado.');
      navigate(`/admin/medical-orders/${order.id}`);
      
    } catch (error) {
      console.error('Error applying corrections:', error);
      alert('Error al aplicar las correcciones');
    } finally {
      setSubmitting(false);
    }
  };

  const getItemStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING': { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: ArrowLeft },
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

  if (loading) {
    return (
      <BaseLayout title="Corregir Pedido">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </BaseLayout>
    );
  }

  if (error || !order) {
    return (
      <BaseLayout title="Corregir Pedido">
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
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

  // Verificar que el pedido puede ser corregido
  if (order.state !== 'REJECTED' && order.state !== 'PARTIALLY_AUTHORIZED') {
    return (
      <BaseLayout title="Corregir Pedido">
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Pedido no puede ser corregido
          </h3>
          <p className="text-gray-500 dark:text-slate-400 mb-4">
            Solo los pedidos rechazados o parcialmente aprobados pueden ser corregidos.
          </p>
          <Link to={`/admin/medical-orders/${order.id}`}>
            <Button variant="outline-secondary">Volver al Pedido</Button>
          </Link>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title={`Corregir Pedido ${order.orderNumber}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to={`/admin/medical-orders/${order.id}`}
              className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Pedido
            </Link>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleSubmitCorrections}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Aplicando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Aplicar Correcciones
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Información del Pedido */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Información del Pedido {order.orderNumber}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Afiliado:</strong> {order.affiliateName} ({order.affiliateNumber})
            </div>
            <div>
              <strong>Obra Social:</strong> {order.healthcareProvider}
            </div>
            <div>
              <strong>Estado Actual:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                order.state === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {order.state === 'REJECTED' ? 'Rechazado' : 'Parcialmente Aprobado'}
              </span>
            </div>
            <div>
              <strong>Urgencia:</strong> {order.urgencyLevel}
            </div>
          </div>
        </div>

        {/* Análisis de IA */}
        {order.aiAnalysis && (
          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Resultado del Análisis de IA
            </h3>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Observaciones de la IA
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    {order.aiAnalysis.reasoning}
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                    Confianza: {Math.round(order.aiAnalysis.confidence * 100)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Formulario de Corrección General */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Correcciones Generales
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Justificación Médica
              </label>
              <textarea
                value={medicalJustification}
                onChange={(e) => setMedicalJustification(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 dark:border-darkmode-400 rounded-md px-3 py-2 bg-white dark:bg-darkmode-700 text-gray-900 dark:text-white"
                placeholder="Actualice la justificación médica si es necesario..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Diagnóstico (Opcional)
              </label>
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 dark:border-darkmode-400 rounded-md px-3 py-2 bg-white dark:bg-darkmode-700 text-gray-900 dark:text-white"
                placeholder="Agregue o actualice el diagnóstico..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Plan de Tratamiento (Opcional)
              </label>
              <textarea
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 dark:border-darkmode-400 rounded-md px-3 py-2 bg-white dark:bg-darkmode-700 text-gray-900 dark:text-white"
                placeholder="Agregue o actualice el plan de tratamiento..."
              />
            </div>
          </div>
        </div>

        {/* Artículos del Pedido y Correcciones */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Artículos del Pedido ({order.items.length})
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Revise los artículos y aplique correcciones según las recomendaciones de la IA
            </p>
          </div>
          
          <div className="p-6 space-y-4">
            {order.items.map((item) => {
              const hasCorrection = itemCorrections.find(c => c.itemId === item.id);
              const needsAttention = item.authorizationStatus === 'REJECTED' || item.aiRecommendation;
              
              return (
                <div key={item.id} className={`border rounded-lg p-4 ${
                  needsAttention ? 'border-red-200 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-darkmode-400'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {item.articleName}
                        </h4>
                        {getItemStatusBadge(item.authorizationStatus)}
                      </div>
                      
                      <div className="text-sm text-gray-600 dark:text-slate-400 mb-2">
                        Código: {item.articleCode} | Cantidad: {item.quantity}
                      </div>
                      
                      {item.justification && (
                        <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                          <strong>Justificación:</strong> {item.justification}
                        </div>
                      )}
                      
                      {item.aiRecommendation && (
                        <div className="bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded p-3 mb-3">
                          <div className="flex items-start space-x-2">
                            <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-orange-800 dark:text-orange-200">
                                Recomendación de IA
                              </div>
                              <div className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                                {item.aiRecommendation.reasoning}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      {!hasCorrection ? (
                        <Button
                          onClick={() => handleAddItemCorrection(item.id)}
                          variant="outline-primary"
                          size="sm"
                          disabled={itemCorrections.some(c => c.itemId === item.id)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Corregir
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleRemoveItemCorrection(item.id)}
                          variant="outline-secondary"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Formulario de corrección del item */}
                  {hasCorrection && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-darkmode-700 rounded-lg">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                        Corrección del Artículo
                      </h5>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                            Acción
                          </label>
                          <select
                            value={hasCorrection.action}
                            onChange={(e) => handleUpdateItemCorrection(item.id, { 
                              action: e.target.value as 'modify' | 'replace' | 'remove' 
                            })}
                            className="w-full border border-gray-300 dark:border-darkmode-400 rounded-md px-3 py-2 bg-white dark:bg-darkmode-600 text-gray-900 dark:text-white"
                          >
                            <option value="modify">Modificar cantidad/justificación</option>
                            <option value="remove">Eliminar artículo</option>
                          </select>
                        </div>
                        
                        {hasCorrection.action === 'modify' && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                Nueva Cantidad
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={hasCorrection.newQuantity || item.quantity}
                                onChange={(e) => handleUpdateItemCorrection(item.id, { 
                                  newQuantity: parseInt(e.target.value) || item.quantity 
                                })}
                                className="w-full border border-gray-300 dark:border-darkmode-400 rounded-md px-3 py-2 bg-white dark:bg-darkmode-600 text-gray-900 dark:text-white"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                Nueva Justificación Médica
                              </label>
                              <textarea
                                value={hasCorrection.newMedicalJustification || item.justification}
                                onChange={(e) => handleUpdateItemCorrection(item.id, { 
                                  newMedicalJustification: e.target.value 
                                })}
                                rows={2}
                                className="w-full border border-gray-300 dark:border-darkmode-400 rounded-md px-3 py-2 bg-white dark:bg-darkmode-600 text-gray-900 dark:text-white"
                                placeholder="Actualice la justificación médica para este artículo..."
                              />
                            </div>
                          </>
                        )}
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                            Razón de la Corrección *
                          </label>
                          <textarea
                            value={hasCorrection.correctionReason}
                            onChange={(e) => handleUpdateItemCorrection(item.id, { 
                              correctionReason: e.target.value 
                            })}
                            rows={2}
                            className="w-full border border-gray-300 dark:border-darkmode-400 rounded-md px-3 py-2 bg-white dark:bg-darkmode-600 text-gray-900 dark:text-white"
                            placeholder="Explique por qué se realiza esta corrección..."
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Comentarios Finales */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Comentarios sobre las Correcciones
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Resumen de Correcciones *
              </label>
              <textarea
                value={correctionNotes}
                onChange={(e) => setCorrectionNotes(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 dark:border-darkmode-400 rounded-md px-3 py-2 bg-white dark:bg-darkmode-700 text-gray-900 dark:text-white"
                placeholder="Describa las correcciones realizadas y el motivo de las mismas..."
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="requestNewAiAnalysis"
                checked={requestNewAiAnalysis}
                onChange={(e) => setRequestNewAiAnalysis(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="requestNewAiAnalysis" className="ml-2 block text-sm text-gray-900 dark:text-white">
                Solicitar nuevo análisis de IA después de aplicar las correcciones
              </label>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default MedicalOrderCorrectPage; 