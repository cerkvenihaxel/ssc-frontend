import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuditStatusBadge } from '../../../shared/components/audit/AuditStatusBadge';
import { ItemComparisonTable } from '../../../shared/components/audit/ItemComparisonTable';
import type { AuditRequest } from '../../../domain/models';
import BaseLayout from '../../../shared/components/layout/BaseLayout';
import { useAuditor } from '../../../shared/hooks/useAuditor';
import { ArrowLeft, FileText, User, Calendar, DollarSign, XCircle, Clock, CheckCircle } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';

export const AuditRequestDetailPage: React.FC = () => {
  console.log('🔍 AuditRequestDetailPage - Component rendered');
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loading } = useAuditor();
  const [auditRequest, setAuditRequest] = useState<AuditRequest | null>(null);

  useEffect(() => {
    console.log('🔍 AuditRequestDetailPage - useEffect triggered');
    console.log('🔍 AuditRequestDetailPage - id:', id);
    
    if (id) {
      // El ID ya viene desofuscado desde useParams, no necesitamos desofuscar la ruta completa
      console.log('🔍 AuditRequestDetailPage - Using ID directly from params:', id);
      loadAuditRequestDetail(id);
    }
  }, [id]); // Solo depender del id, no de getCurrentRealPath

  const loadAuditRequestDetail = async (auditId: string) => {
    console.log('🔍 AuditRequestDetailPage - loadAuditRequestDetail called with:', auditId);
    try {
      // Mock data para demostración
      const mockAuditRequest: AuditRequest = {
        audit_request_id: 'AR-2025-001',
        quotation_id: 'Q-2025-001',
        medical_order_id: 'MO-2025-000001',
        provider_id: 'P-001',
        audit_status: 'completed',
        auditor_notes: 'Cotización aprobada después de revisión detallada de costos y calidad. El proveedor cumplió con todos los criterios establecidos y ofreció un precio competitivo dentro del rango aceptable.',
        rejection_reason: undefined,
        original_order_cost: 85000,
        quoted_cost: 82000,
        approved_cost: 80000,
        audit_criteria: {
          price_reasonable: true,
          quality_adequate: true,
          delivery_time_acceptable: true,
          provider_reliable: true,
          documentation_complete: true
        },
        audit_type: 'manual',
        auditor_id: 'AUD-001',
        audited_at: '2025-01-15T10:30:00Z',
        completed_at: '2025-01-15T11:00:00Z',
        created_at: '2025-01-15T09:00:00Z',
        updated_at: '2025-01-15T11:00:00Z',
        quotation: {
          quotation_id: 'Q-2025-001',
          quotation_number: 'COT-2025-001',
          patient_name: 'María González',
          total_cost: 82000,
          status: 'completed',
          provider_name: 'Proveedor Médico ABC',
          delivery_days: 15,
          items_count: 5,
          created_at: '2025-01-10T09:00:00Z',
          updated_at: '2025-01-15T11:00:00Z',
          items: [
            {
              item_id: 'ITEM-001',
              name: 'Monitor Multiparamétrico',
              description: 'Monitor de signos vitales con pantalla táctil',
              quantity: 1,
              unit_cost: 45000,
              total_cost: 45000,
              category: 'Equipos de Monitoreo'
            },
            {
              item_id: 'ITEM-002',
              name: 'Bomba de Infusión',
              description: 'Bomba de infusión volumétrica',
              quantity: 2,
              unit_cost: 12000,
              total_cost: 24000,
              category: 'Equipos de Infusión'
            },
            {
              item_id: 'ITEM-003',
              name: 'Desfibrilador',
              description: 'Desfibrilador automático externo',
              quantity: 1,
              unit_cost: 8000,
              total_cost: 8000,
              category: 'Equipos de Emergencia'
            },
            {
              item_id: 'ITEM-004',
              name: 'Ventilador Mecánico',
              description: 'Ventilador mecánico portátil',
              quantity: 1,
              unit_cost: 5000,
              total_cost: 5000,
              category: 'Equipos de Respiración'
            }
          ],
          medical_order: {
            medical_order_id: 'MO-2025-000001',
            patient_name: 'María González',
            doctor_name: 'Dr. Carlos Mendoza',
            specialty: ['Cardiología', 'Terapia Intensiva'],
            urgency: 'medium',
            created_at: '2025-01-08T14:00:00Z'
          }
        },
        medicalOrder: {
          medical_order_id: 'MO-2025-000001',
          order_number: 'MO-2025-000001',
          patient_name: 'María González',
          urgency: 'medium',
          doctor_name: 'Dr. Carlos Mendoza',
          specialty: 'Cardiología',
          created_at: '2025-01-08T14:00:00Z',
          items: [
            {
              item_id: 'MO-ITEM-001',
              name: 'Monitor Multiparamétrico',
              description: 'Monitor de signos vitales con pantalla táctil',
              quantity: 1,
              category: 'Equipos de Monitoreo'
            },
            {
              item_id: 'MO-ITEM-002',
              name: 'Bomba de Infusión',
              description: 'Bomba de infusión volumétrica',
              quantity: 2,
              category: 'Equipos de Infusión'
            },
            {
              item_id: 'MO-ITEM-003',
              name: 'Desfibrilador',
              description: 'Desfibrilador automático externo',
              quantity: 1,
              category: 'Equipos de Emergencia'
            },
            {
              item_id: 'MO-ITEM-004',
              name: 'Ventilador Mecánico',
              description: 'Ventilador mecánico portátil',
              quantity: 1,
              category: 'Equipos de Respiración'
            }
          ]
        }
      };
      
      setAuditRequest(mockAuditRequest);
    } catch (error) {
      console.error('🔍 AuditRequestDetailPage - Error loading audit request detail:', error);
      setAuditRequest(null);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-AR');
  };

  if (loading) {
    return (
      <BaseLayout title="Cargando Auditoría">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </BaseLayout>
    );
  }

  if (!auditRequest) {
    return (
      <BaseLayout title="Auditoría no encontrada">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Auditoría no encontrada
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            La auditoría que buscas no existe o no tienes permisos para verla.
          </p>
          <div className="mb-4 p-4 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">Debug Info:</p>
            <p className="text-sm text-gray-600">ID from params: {id}</p>
            <p className="text-sm text-gray-600">Loading: {loading ? 'true' : 'false'}</p>
            <p className="text-sm text-gray-600">AuditRequest state: {auditRequest ? 'Loaded' : 'Not loaded'}</p>
          </div>
          <Button onClick={() => navigate('/auditor-services/audited-requests')}>
            Volver al historial
          </Button>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title={`Detalle de Auditoría - ${auditRequest.audit_request_id}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400">
          <div className="px-6 py-6 border-b border-gray-200 dark:border-darkmode-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/auditor-services/audited-requests')}
                  className="flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Detalle de Auditoría
                  </h1>
                  <p className="text-gray-600 dark:text-slate-400 mt-1">
                    Información completa de la auditoría y sus relaciones
                  </p>
                </div>
              </div>
              <AuditStatusBadge status={auditRequest.audit_status} size="lg" />
            </div>
          </div>
        </div>

        {/* Audit Request Info */}
        <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400">
          <div className="px-6 py-6 border-b border-gray-200 dark:border-darkmode-400">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Auditoría #{auditRequest.audit_request_id}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Cotización: {auditRequest.quotation?.quotation_number || 'Sin número'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Pedido: {auditRequest.medicalOrder?.order_number || 'Sin número'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Proveedor: {auditRequest.quotation?.provider_name || 'Sin nombre'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Creado: {formatDate(auditRequest.created_at)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-50 dark:bg-darkmode-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Costos</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Original:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(auditRequest.original_order_cost)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Cotizado:</span>
                    <span className="text-sm font-medium text-blue-600">
                      {formatCurrency(auditRequest.quoted_cost)}
                    </span>
                  </div>
                  {auditRequest.approved_cost && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Aprobado:</span>
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(auditRequest.approved_cost)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-darkmode-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Timeline</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Creado:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(auditRequest.created_at)}
                    </span>
                  </div>
                  {auditRequest.audited_at && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Auditado:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(auditRequest.audited_at)}
                      </span>
                    </div>
                  )}
                  {auditRequest.completed_at && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Completado:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(auditRequest.completed_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-darkmode-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <User className="w-5 h-5 text-purple-600" />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Auditoría</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Tipo:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {auditRequest.audit_type}
                    </span>
                  </div>
                  {auditRequest.auditor_id && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Auditor:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {auditRequest.auditor_id}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Estado:</span>
                    <AuditStatusBadge status={auditRequest.audit_status} />
                  </div>
                </div>
              </div>
            </div>

            {/* Notes and Rejection Reason */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {auditRequest.auditor_notes && (
                <div className="bg-gray-50 dark:bg-darkmode-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Notas del Auditor</h3>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white">{auditRequest.auditor_notes}</p>
                </div>
              )}

              {auditRequest.rejection_reason && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <h3 className="text-sm font-medium text-red-900 dark:text-red-400">Motivo de Rechazo</h3>
                  </div>
                  <p className="text-sm text-red-900 dark:text-red-400">{auditRequest.rejection_reason}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Item Comparison */}
        {auditRequest.item_comparison && (
          <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Comparación de Items</h3>
            </div>
            <div className="p-6">
              <ItemComparisonTable
                originalItems={auditRequest.item_comparison.original_items || []}
                quotedItems={auditRequest.item_comparison.quoted_items || []}
              />
            </div>
          </div>
        )}

        {/* Audit Criteria */}
        {auditRequest.audit_criteria && (
          <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Criterios de Auditoría</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(auditRequest.audit_criteria).map(([key, value]) => (
                  <div key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={Boolean(value)}
                      readOnly
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-900 dark:text-white capitalize">
                      {key.replace(/_/g, ' ')}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseLayout>
  );
}; 