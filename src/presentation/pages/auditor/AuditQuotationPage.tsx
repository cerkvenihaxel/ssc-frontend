import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Quotation, AuditCriteria } from '../../../domain/models';
import BaseLayout from '../../../shared/components/layout/BaseLayout';
import { ArrowLeft, CheckCircle, XCircle, Brain, Loader2, Sparkles } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import { useAuditor } from '../../../shared/hooks/useAuditor';
import { useAIAuditor } from '../../../shared/hooks/useAIAuditor';
import { AIAuditorService } from '../../../application/services/AIAuditorService';

export const AuditQuotationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getQuotationDetail, approveQuotation, rejectQuotation, loading } = useAuditor();
  const { isAnalyzing, streamingText, analysisResult, error: aiError, analyzeQuotation } = useAIAuditor();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [saving, setSaving] = useState(false);
  const [auditData, setAuditData] = useState({
    audit_status: 'pending' as 'pending' | 'approved' | 'rejected',
    approved_cost: 0,
    rejection_reason: '',
    auditor_notes: '',
    audit_criteria: {
      price_reasonable: false,
      quality_adequate: false,
      delivery_time_acceptable: false,
      provider_reliable: false,
      documentation_complete: false
    }
  });

  useEffect(() => {
    if (id) {
      loadQuotationDetail();
    }
  }, [id]);

  const loadQuotationDetail = async () => {
    try {
      const result = await getQuotationDetail(id!);
      setQuotation(result);
      
      // Inicializar el costo aprobado con el costo original
      setAuditData(prev => ({
        ...prev,
        approved_cost: result.total_cost
      }));
      
    } catch (error) {
      console.error('Error loading quotation detail:', error);
      alert(`Error al cargar detalles de la cotización: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleAuditCriteriaChange = (field: keyof AuditCriteria, value: boolean | string) => {
    setAuditData(prev => ({
      ...prev,
      audit_criteria: {
        ...prev.audit_criteria,
        [field]: value
      }
    }));
  };

  const handleAIAnalysis = async (analysisType: 'approval' | 'rejection') => {
    if (!quotation) {
      alert('No hay datos de cotización disponibles');
      return;
    }

    // Validar que los datos necesarios estén presentes
    if (!quotation.patient_name || !quotation.provider_name) {
      alert('Los datos de la cotización están incompletos. No se puede realizar el análisis de IA.');
      return;
    }

    try {
      const request = {
        quotation_data: {
          patient_name: quotation.patient_name,
          provider_name: quotation.provider_name,
          total_cost: quotation.total_cost,
          delivery_days: quotation.delivery_days,
          items: quotation.items || [],
          medical_order: quotation.medical_order || {
            urgency: 'medium',
            specialty: []
          }
        },
        analysis_type: analysisType
      };

      const result = await analyzeQuotation(request);
      
      // Aplicar los resultados del análisis de IA
      setAuditData(prev => ({
        ...prev,
        auditor_notes: result.notes,
        rejection_reason: result.rejection_reason || '',
        audit_criteria: result.audit_criteria,
        approved_cost: result.approved_cost || prev.approved_cost
      }));
    } catch (error) {
      console.error('Error en análisis de IA:', error);
      alert(`Error en el análisis de IA: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleSubmit = async (action: 'approve' | 'reject') => {
    if (!quotation) return;

    // Validaciones
    if (action === 'reject' && !auditData.rejection_reason.trim()) {
      alert('Debe especificar una razón para el rechazo');
      return;
    }

    if (action === 'approve' && auditData.approved_cost <= 0) {
      alert('El costo aprobado debe ser mayor a 0');
      return;
    }

    try {
      setSaving(true);
      
      if (action === 'approve') {
        // Validar que el costo aprobado sea un número válido
        const approvedCost = Number(auditData.approved_cost);
        if (isNaN(approvedCost) || approvedCost <= 0) {
          alert('El costo aprobado debe ser un número válido mayor a 0');
          return;
        }
        
        await approveQuotation(quotation.quotation_id, approvedCost, auditData.auditor_notes || '');
        alert('Cotización aprobada exitosamente');
      } else if (action === 'reject') {
        // Validar que la razón del rechazo esté presente
        if (!auditData.rejection_reason?.trim()) {
          alert('Debe especificar una razón para el rechazo');
          return;
        }
        
        await rejectQuotation(quotation.quotation_id, auditData.rejection_reason, auditData.auditor_notes || '');
        alert('Cotización rechazada exitosamente');
      }
      
      navigate('/auditor-services/pending-quotations');
      
    } catch (error) {
      console.error('Error updating audit request:', error);
      
      // Mostrar mensaje de error específico
      let errorMessage = 'Error desconocido';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(`Error al ${action === 'approve' ? 'aprobar' : 'rechazar'} cotización: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <BaseLayout title="Auditar Cotización">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </BaseLayout>
    );
  }

  if (!quotation) {
    return (
      <BaseLayout title="Cotización no encontrada">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Cotización no encontrada
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            La cotización que buscas no existe o no tienes permisos para verla.
          </p>
          <Button onClick={() => navigate('/auditor-services/pending-quotations')}>
            Volver a la lista
          </Button>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title={`Auditar Cotización - ${quotation.patient_name}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400">
          <div className="px-6 py-6 border-b border-gray-200 dark:border-darkmode-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/auditor-services/pending-quotations')}
                  className="flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Auditar Cotización
                  </h1>
                  <p className="text-gray-600 dark:text-slate-400 mt-1">
                    Revisa y toma una decisión sobre esta cotización
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  quotation.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                  quotation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {quotation.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información de la Cotización */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Información de la Cotización
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ID Cotización
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white font-mono">
                    {quotation.quotation_id}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Paciente
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {quotation.patient_name}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Proveedor
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {quotation.provider_name}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Costo Original
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${quotation.total_cost.toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Días de Entrega
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {quotation.delivery_days} días
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Items
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {quotation.items_count} items
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha de Creación
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(quotation.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Información de la Orden Médica */}
            {quotation.medical_order && (
              <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400 p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Orden Médica
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ID Orden
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-mono">
                      {quotation.medical_order.medical_order_id}
                    </p>
                  </div>

                  {quotation.medical_order.doctor_name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Doctor
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {quotation.medical_order.doctor_name}
                      </p>
                    </div>
                  )}

                  {quotation.medical_order.specialty && quotation.medical_order.specialty.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Especialidades
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {quotation.medical_order.specialty.map((spec, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Urgencia
                    </label>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      quotation.medical_order.urgency === 'high' ? 'bg-red-100 text-red-800' :
                      quotation.medical_order.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {quotation.medical_order.urgency.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Formulario de Auditoría */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Criterios de Auditoría
              </h3>

              <div className="space-y-6">
                                 {/* Criterios de Auditoría */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="flex items-center space-x-3">
                     <input
                       type="checkbox"
                       id="price_reasonable"
                       checked={auditData.audit_criteria.price_reasonable}
                       onChange={(e) => handleAuditCriteriaChange('price_reasonable', e.target.checked)}
                       className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                     />
                     <label htmlFor="price_reasonable" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                       Precio Razonable
                     </label>
                   </div>

                   <div className="flex items-center space-x-3">
                     <input
                       type="checkbox"
                       id="quality_adequate"
                       checked={auditData.audit_criteria.quality_adequate}
                       onChange={(e) => handleAuditCriteriaChange('quality_adequate', e.target.checked)}
                       className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                     />
                     <label htmlFor="quality_adequate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                       Calidad Adecuada
                     </label>
                   </div>

                   <div className="flex items-center space-x-3">
                     <input
                       type="checkbox"
                       id="delivery_time_acceptable"
                       checked={auditData.audit_criteria.delivery_time_acceptable}
                       onChange={(e) => handleAuditCriteriaChange('delivery_time_acceptable', e.target.checked)}
                       className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                     />
                     <label htmlFor="delivery_time_acceptable" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                       Tiempo de Entrega Aceptable
                     </label>
                   </div>

                   <div className="flex items-center space-x-3">
                     <input
                       type="checkbox"
                       id="provider_reliable"
                       checked={auditData.audit_criteria.provider_reliable}
                       onChange={(e) => handleAuditCriteriaChange('provider_reliable', e.target.checked)}
                       className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                     />
                     <label htmlFor="provider_reliable" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                       Proveedor Confiable
                     </label>
                   </div>

                   <div className="flex items-center space-x-3">
                     <input
                       type="checkbox"
                       id="documentation_complete"
                       checked={auditData.audit_criteria.documentation_complete}
                       onChange={(e) => handleAuditCriteriaChange('documentation_complete', e.target.checked)}
                       className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                     />
                     <label htmlFor="documentation_complete" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                       Documentación Completa
                     </label>
                   </div>
                 </div>

                {/* Análisis Inteligente */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Brain className="w-5 h-5 mr-2 text-blue-600" />
                      Análisis Inteligente
                    </h4>
                    {isAnalyzing && (
                      <div className="flex items-center text-blue-600">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span className="text-sm">Analizando...</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-3 mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          const aiService = new AIAuditorService();
                          await aiService.verifyConfiguration();
                          alert('✅ Configuración de OpenAI correcta');
                        } catch (error) {
                          alert(`❌ Error de configuración: ${error instanceof Error ? error.message : 'Error desconocido'}`);
                        }
                      }}
                      disabled={isAnalyzing}
                      className="flex items-center text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verificar Configuración
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAIAnalysis('approval')}
                      disabled={isAnalyzing}
                      className="flex items-center text-green-600 border-green-600 hover:bg-green-50"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Análisis para Aprobación
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAIAnalysis('rejection')}
                      disabled={isAnalyzing}
                      className="flex items-center text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Análisis para Rechazo
                    </Button>
                  </div>

                  {aiError && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Error en el análisis: {aiError}
                      </p>
                    </div>
                  )}

                  {streamingText && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-2 font-medium">
                        Análisis en progreso:
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {streamingText}
                        <span className="animate-pulse">|</span>
                      </p>
                    </div>
                  )}

                  {analysisResult && !isAnalyzing && (
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                      <p className="text-sm text-green-800 dark:text-green-200 mb-2 font-medium">
                        ✓ Análisis completado
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Los resultados han sido aplicados automáticamente a los campos correspondientes.
                      </p>
                    </div>
                  )}
                </div>

                {/* Notas del Auditor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notas del Auditor
                  </label>
                  <textarea
                    value={auditData.auditor_notes}
                    onChange={(e) => setAuditData(prev => ({ ...prev, auditor_notes: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-darkmode-700 dark:text-white"
                    placeholder="Agregue notas adicionales sobre la auditoría..."
                  />
                </div>

                {/* Costo Aprobado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Costo Aprobado
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={auditData.approved_cost}
                      onChange={(e) => setAuditData(prev => ({ ...prev, approved_cost: Number(e.target.value) }))}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-darkmode-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-darkmode-700 dark:text-white"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Costo original: ${quotation.total_cost.toLocaleString()}
                  </p>
                </div>

                {/* Razón de Rechazo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Razón de Rechazo
                  </label>
                  <textarea
                    value={auditData.rejection_reason}
                    onChange={(e) => setAuditData(prev => ({ ...prev, rejection_reason: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-darkmode-700 dark:text-white"
                    placeholder="Especifique la razón del rechazo (requerido si rechaza la cotización)..."
                  />
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200 dark:border-darkmode-400">
                <Button
                  variant="outline"
                  onClick={() => navigate('/auditor-services/pending-quotations')}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleSubmit('reject')}
                  disabled={saving || !auditData.rejection_reason.trim()}
                  className="flex items-center text-red-600 border-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rechazar Cotización
                </Button>
                
                <Button
                  variant="primary"
                  onClick={() => handleSubmit('approve')}
                  disabled={saving || auditData.approved_cost <= 0}
                  className="flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprobar Cotización
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Items de la Cotización */}
        <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Items de la Cotización
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-darkmode-400">
              <thead className="bg-gray-50 dark:bg-darkmode-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Costo Unitario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Costo Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Categoría
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-darkmode-600 divide-y divide-gray-200 dark:divide-darkmode-400">
                {quotation.items.map((item) => (
                  <tr key={item.item_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                      {item.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ${item.unit_cost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                      ${item.total_cost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {item.category || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}; 