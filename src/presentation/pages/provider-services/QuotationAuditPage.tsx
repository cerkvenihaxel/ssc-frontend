import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  DollarSign,
  Calendar,
  User,
  Clock
} from 'lucide-react';
import { useProviderServices } from '../../hooks/useProviderServices';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import BaseLayout from '../../../shared/components/layout/BaseLayout';

interface QuotationAudit {
  quotation_id: string;
  quotation_number: string;
  provider_name: string;
  request_number: string;
  request_title: string;
  request_type: 'medical' | 'effector';
  total_amount: number;
  delivery_time_days: number;
  delivery_terms?: string;
  payment_terms?: string;
  warranty_terms?: string;
  observations?: string;
  valid_until: string;
  created_at: string;
  status: string;
  audit_status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PARTIAL';
  audit_notes?: string;
  audited_at?: string;
  audited_by?: string;
  items: QuotationAuditItem[];
}

interface QuotationAuditItem {
  quotation_item_id: string;
  request_item_id: string;
  item_name: string;
  requested_quantity: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  observations?: string;
  audit_decision?: 'APPROVED' | 'REJECTED' | 'FLAGGED';
  audit_notes?: string;
}

const QuotationAuditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getQuotationDetails, auditQuotation, auditQuotationWithAI } = useProviderServices();
  
  const [quotation, setQuotation] = useState<QuotationAudit | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Audit form state
  const [auditDecision, setAuditDecision] = useState<'APPROVE' | 'REJECT' | 'PARTIAL'>('APPROVE');
  const [auditNotes, setAuditNotes] = useState('');
  const [itemDecisions, setItemDecisions] = useState<{[key: string]: {
    decision: 'APPROVED' | 'REJECTED' | 'FLAGGED';
    notes: string;
  }}>({});

  useEffect(() => {
    if (id) {
      loadQuotationDetails();
    }
  }, [id]);

  const loadQuotationDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await getQuotationDetails(id) as QuotationAudit;
      setQuotation(data);
      
      // Initialize item decisions
      const initialDecisions: {[key: string]: {decision: 'APPROVED' | 'REJECTED' | 'FLAGGED'; notes: string}} = {};
      data.items?.forEach((item: QuotationAuditItem) => {
        initialDecisions[item.quotation_item_id] = {
          decision: item.audit_decision || 'APPROVED',
          notes: item.audit_notes || ''
        };
      });
      setItemDecisions(initialDecisions);
      
    } catch (err) {
      setError('Error al cargar los detalles de la cotización');
      console.error('Error loading quotation details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleItemDecisionChange = (itemId: string, decision: 'APPROVED' | 'REJECTED' | 'FLAGGED') => {
    setItemDecisions(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        decision
      }
    }));
  };

  const handleItemNotesChange = (itemId: string, notes: string) => {
    setItemDecisions(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        notes
      }
    }));
  };

  const handleAuditSubmit = async (decision: 'APPROVE' | 'REJECT' | 'PARTIAL') => {
    if (!id) return;

    try {
      setSubmitting(true);
      setError(null);

      const auditData = {
        decision,
        notes: auditNotes,
        item_decisions: Object.entries(itemDecisions).map(([quotation_item_id, data]) => ({
          quotation_item_id,
          decision: data.decision,
          notes: data.notes
        }))
      };

      await auditQuotation(id, auditData);
      
      // Redirect back to audited quotations
      navigate('/admin/provider-services/audited-quotations', {
        state: { message: `Cotización ${decision === 'APPROVE' ? 'aprobada' : decision === 'REJECT' ? 'rechazada' : 'parcialmente aprobada'} exitosamente` }
      });
      
    } catch (err: any) {
      setError(err.message || 'Error al auditar la cotización');
      console.error('Error auditing quotation:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAIAudit = async () => {
    if (!id) return;

    try {
      setSubmitting(true);
      setError(null);

      await auditQuotationWithAI(id);
      
      // Update the quotation with AI results
      await loadQuotationDetails();
      
    } catch (err: any) {
      setError(err.message || 'Error al realizar auditoría con IA');
      console.error('Error with AI audit:', err);
    } finally {
      setSubmitting(false);
    }
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'PARTIAL': 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
      }`}>
        {status}
      </span>
    );
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'FLAGGED':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <BaseLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </BaseLayout>
    );
  }

  if (error && !quotation) {
    return (
      <BaseLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              {error}
            </h3>
            <div className="mt-6">
              <button
                onClick={() => navigate('/admin/provider-services/audited-quotations')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <ArrowLeft className="-ml-1 mr-2 h-5 w-5" />
                Volver a Auditorías
              </button>
            </div>
          </div>
        </div>
      </BaseLayout>
    );
  }

  if (!quotation) {
    return (
      <BaseLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Cotización no encontrada
            </h3>
          </div>
        </div>
      </BaseLayout>
    );
  }

  const isAlreadyAudited = quotation.audit_status && quotation.audit_status !== 'PENDING';

  return (
    <BaseLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/provider-services/audited-quotations')}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver a Auditorías
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Auditoría de Cotización
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {quotation.quotation_number} - {quotation.provider_name}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {getStatusBadge(quotation.audit_status || 'PENDING')}
              {!isAlreadyAudited && (
                <button
                  onClick={handleAIAudit}
                  disabled={submitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  🤖 Auditoría IA
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información de la Cotización */}
          <div className="lg:col-span-2 space-y-6">
            {/* Detalles Generales */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Detalles de la Cotización
                </h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Número de Cotización
                    </label>
                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                      {quotation.quotation_number}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Proveedor
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {quotation.provider_name}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Pedido Relacionado
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {quotation.request_number} - {quotation.request_title}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Monto Total
                    </label>
                    <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrency(quotation.total_amount)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tiempo de Entrega
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {quotation.delivery_time_days} días
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Válida Hasta
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {formatDate(quotation.valid_until)}
                    </p>
                  </div>
                </div>

                {quotation.delivery_terms && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Términos de Entrega
                    </label>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {quotation.delivery_terms}
                    </p>
                  </div>
                )}

                {quotation.payment_terms && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Términos de Pago
                    </label>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {quotation.payment_terms}
                    </p>
                  </div>
                )}

                {quotation.warranty_terms && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Términos de Garantía
                    </label>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {quotation.warranty_terms}
                    </p>
                  </div>
                )}

                {quotation.observations && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Observaciones
                    </label>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {quotation.observations}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Artículos Cotizados */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Artículos Cotizados ({quotation.items?.length || 0})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Artículo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Precio Unit.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total
                      </th>
                      {!isAlreadyAudited && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Decisión
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {quotation.items?.map((item) => (
                      <tr key={item.quotation_item_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.item_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Solicitado: {item.requested_quantity}
                            </p>
                            {item.observations && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {item.observations}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {formatCurrency(item.unit_price)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(item.total_price)}
                          </span>
                        </td>
                        {!isAlreadyAudited && (
                          <td className="px-6 py-4">
                            <select
                              value={itemDecisions[item.quotation_item_id]?.decision || 'APPROVED'}
                              onChange={(e) => handleItemDecisionChange(
                                item.quotation_item_id,
                                e.target.value as 'APPROVED' | 'REJECTED' | 'FLAGGED'
                              )}
                              className="text-sm rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                              <option value="APPROVED">Aprobar</option>
                              <option value="FLAGGED">Marcar</option>
                              <option value="REJECTED">Rechazar</option>
                            </select>
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {getDecisionIcon(item.audit_decision || itemDecisions[item.quotation_item_id]?.decision || 'PENDING')}
                            <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                              {item.audit_decision || itemDecisions[item.quotation_item_id]?.decision || 'PENDING'}
                            </span>
                          </div>
                          {!isAlreadyAudited && (
                            <textarea
                              value={itemDecisions[item.quotation_item_id]?.notes || ''}
                              onChange={(e) => handleItemNotesChange(item.quotation_item_id, e.target.value)}
                              placeholder="Notas del auditor..."
                              className="mt-1 w-full text-xs rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                              rows={2}
                            />
                          )}
                          {item.audit_notes && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {item.audit_notes}
                            </p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Panel de Auditoría */}
          <div>
            {isAlreadyAudited ? (
              /* Información de Auditoría Completada */
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Auditoría Completada
                  </h3>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Estado
                    </label>
                    <div className="mt-1">
                      {getStatusBadge(quotation.audit_status!)}
                    </div>
                  </div>
                  
                  {quotation.audited_by && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Auditado por
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {quotation.audited_by}
                      </p>
                    </div>
                  )}
                  
                  {quotation.audited_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Fecha de Auditoría
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {formatDate(quotation.audited_at)}
                      </p>
                    </div>
                  )}
                  
                  {quotation.audit_notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Notas de Auditoría
                      </label>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {quotation.audit_notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Formulario de Auditoría */
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Realizar Auditoría
                  </h3>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Decisión General
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="APPROVE"
                          checked={auditDecision === 'APPROVE'}
                          onChange={(e) => setAuditDecision(e.target.value as 'APPROVE')}
                          className="mr-2"
                        />
                        <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm">Aprobar Completamente</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="PARTIAL"
                          checked={auditDecision === 'PARTIAL'}
                          onChange={(e) => setAuditDecision(e.target.value as 'PARTIAL')}
                          className="mr-2"
                        />
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm">Aprobación Parcial</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="REJECT"
                          checked={auditDecision === 'REJECT'}
                          onChange={(e) => setAuditDecision(e.target.value as 'REJECT')}
                          className="mr-2"
                        />
                        <XCircle className="w-4 h-4 text-red-500 mr-1" />
                        <span className="text-sm">Rechazar</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="auditNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Notas de Auditoría
                    </label>
                    <textarea
                      id="auditNotes"
                      rows={4}
                      value={auditNotes}
                      onChange={(e) => setAuditNotes(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Comentarios y observaciones de la auditoría..."
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                      <div className="flex">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                            Error
                          </h3>
                          <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                            {error}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleAuditSubmit(auditDecision)}
                      disabled={submitting}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="-ml-1 mr-2 h-4 w-4" />
                          Confirmar Auditoría
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Información Adicional */}
            <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Información Adicional
                </h3>
              </div>
              <div className="px-6 py-4 space-y-3">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Creada</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(quotation.created_at)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Proveedor</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {quotation.provider_name}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Tipo de Pedido</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {quotation.request_type === 'medical' ? 'Pedido Médico' : 'Pedido de Efector'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default QuotationAuditPage; 