import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Quotation } from '../../../domain/models';
import BaseLayout from '../../../shared/components/layout/BaseLayout';
import { AuditorService } from '../../../application/services/AuditorService';
import { AuditorRepository } from '../../../infrastructure/repositories/AuditorRepository';
import { ApiClient } from '../../../infrastructure/http/ApiClient';
import { 
  ArrowLeft, 
  Eye, 
  FileText, 
  User, 
  DollarSign, 
  Package, 
  Building,
  Stethoscope
} from 'lucide-react';
import Button from '../../../shared/components/ui/Button';

export const QuotationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      // El ID ya viene desofuscado desde useParams, no necesitamos desofuscar la ruta completa
      loadQuotationDetail(id);
    }
  }, [id]); // Solo depender del id, no de getCurrentRealPath

  const loadQuotationDetail = async (quotationId: string) => {
    try {
      setLoading(true);
      
      // Inicializar servicios
      const apiClient = new ApiClient();
      const auditorRepository = new AuditorRepository(apiClient);
      const auditorService = new AuditorService(auditorRepository);
      
      // Llamada al servicio real
      const result = await auditorService.getQuotationDetail(quotationId);
      setQuotation(result);
      
    } catch (error) {
      console.error('Error loading quotation detail:', error);
      // Mostrar error al usuario en lugar de usar mocks
      setQuotation(null);
      // Aquí podrías mostrar una notificación de error al usuario
      alert(`Error al cargar detalle de cotización: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent':
        return 'ENVIADA';
      case 'pending':
        return 'PENDIENTE';
      case 'approved':
        return 'APROBADA';
      case 'rejected':
        return 'RECHAZADA';
      default:
        return status.toUpperCase();
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAudit = () => {
    navigate(`/auditor/audit-requests/${id}/audit`);
  };

  const handleViewMedicalOrder = () => {
    navigate(`/admin/medical-orders/${quotation?.medical_order_id}`);
  };

  if (loading) {
    return (
      <BaseLayout title="Detalle de Cotización">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </BaseLayout>
    );
  }

  if (!quotation) {
    return (
      <BaseLayout title="Cotización no encontrada">
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Cotización no encontrada
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            La cotización que buscas no existe o no tienes permisos para verla.
          </p>
          <Button onClick={() => navigate('/auditor-services/pending-quotations')}>
            Volver a Cotizaciones
          </Button>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title={`Cotización ${quotation.quotation_id}`}>
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
                    Cotización {quotation.quotation_id}
                  </h1>
                  <p className="text-gray-600 dark:text-slate-400">
                    Detalle completo de la cotización
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleViewMedicalOrder}
                  className="flex items-center"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Ver Pedido Médico
                </Button>
                <Button
                  onClick={handleAudit}
                  className="flex items-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Auditar Cotización
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Detalles de la Cotización */}
            <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Detalles de la Cotización
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Información General</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">ID Cotización:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{quotation.quotation_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Estado:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quotation.status)}`}>
                        {getStatusText(quotation.status)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Costo Total:</span>
                      <span className="text-sm font-semibold text-green-600">{formatCurrency(quotation.total_cost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Días de Entrega:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{quotation.delivery_days} días</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Cantidad de Items:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{quotation.items_count}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fechas</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Creado:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(quotation.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Actualizado:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(quotation.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Items de la Cotización */}
            <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Items de la Cotización
              </h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-darkmode-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Precio Unitario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-darkmode-600 divide-y divide-gray-200 dark:divide-gray-700">
                    {quotation.items?.map((item) => (
                      <tr key={item.item_id} className="hover:bg-gray-50 dark:hover:bg-darkmode-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {item.description || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(item.unit_cost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          {formatCurrency(item.total_cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Información del Proveedor */}
            <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Proveedor
              </h2>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Nombre:</span>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{quotation.provider_name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">ID:</span>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{quotation.provider_id}</p>
                </div>
              </div>
            </div>

            {/* Información del Paciente */}
            <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Paciente
              </h2>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Nombre:</span>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{quotation.patient_name}</p>
                </div>
              </div>
            </div>

            {/* Información del Pedido Médico */}
            {quotation.medical_order && (
              <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Stethoscope className="w-5 h-5 mr-2" />
                  Pedido Médico
                </h2>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">ID:</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{quotation.medical_order.medical_order_id}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Paciente:</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{quotation.medical_order.patient_name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Médico:</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{quotation.medical_order.doctor_name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Especialidad:</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{quotation.medical_order.specialty}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Urgencia:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(quotation.medical_order.urgency)}`}>
                      {quotation.medical_order.urgency.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Fecha:</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(quotation.medical_order.created_at)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}; 