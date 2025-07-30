import React from 'react';
import type { Quotation } from '../../../domain/models';
import { Eye, Clock, DollarSign, Package, User, Calendar, AlertTriangle, Activity } from 'lucide-react';

interface QuotationCardProps {
  quotation: Quotation;
  onView: (id: string) => void;
  onAudit?: (id: string) => void;
  onQuickApprove?: (quotation: Quotation) => void;
  onQuickReject?: (quotation: Quotation) => void;
}

export const QuotationCard: React.FC<QuotationCardProps> = ({ 
  quotation, 
  onView, 
  onAudit,
  onQuickApprove,
  onQuickReject
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
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

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'ALTA';
      case 'medium':
        return 'MEDIA';
      case 'low':
        return 'BAJA';
      default:
        return urgency.toUpperCase();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {quotation.medical_order_id}
            </h3>
            <div className="flex items-center flex-wrap gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quotation.status)}`}>
                <Activity className="w-3 h-3 mr-1" />
                {getStatusText(quotation.status)}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(quotation.medical_order.urgency)}`}>
                <AlertTriangle className="w-3 h-3 mr-1" />
                {getUrgencyText(quotation.medical_order.urgency)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Pedido médico</p>
            <p className="text-sm font-medium text-gray-900">- {quotation.patient_name}</p>
          </div>
        </div>

        {/* Cost and Details */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-green-600">
              <DollarSign className="w-4 h-4 mr-1" />
              <span className="font-semibold text-lg">
                {formatCurrency(quotation.total_cost)}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>{quotation.delivery_days} días de entrega</span>
            </div>
            <div className="flex items-center">
              <Package className="w-4 h-4 mr-2" />
              <span>{quotation.items_count} items</span>
            </div>
          </div>
        </div>

        {/* Provider Info */}
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <div className="flex items-center text-sm text-gray-700">
            <User className="w-4 h-4 mr-2" />
            <span className="font-medium">{quotation.provider_name}</span>
          </div>
        </div>

        {/* Dates */}
        <div className="mb-4 text-xs text-gray-500 space-y-1">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            <span>Creado: {formatDate(quotation.created_at)}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            <span>Actualizado: {formatDate(quotation.updated_at)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onView(quotation.quotation_id)}
            className="flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors duration-200"
          >
            <Eye className="w-4 h-4 mr-1" />
            Ver
          </button>
          {onAudit ? (
            <button
              onClick={() => onAudit(quotation.quotation_id)}
              className="flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors duration-200"
            >
              Auditar
            </button>
          ) : onQuickApprove ? (
            <button
              onClick={() => onQuickApprove(quotation)}
              className="flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors duration-200"
            >
              Aprobar
            </button>
          ) : null}
          {onQuickApprove && onAudit && (
            <button
              onClick={() => onQuickApprove(quotation)}
              className="flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors duration-200"
            >
              Aprobar
            </button>
          )}
          {onQuickReject && (
            <button
              onClick={() => onQuickReject(quotation)}
              className="flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-200"
            >
              Rechazar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 