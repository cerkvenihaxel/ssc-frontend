import React from 'react';
import { AuditStatusBadge } from './AuditStatusBadge';
import type { AuditRequest } from '../../../domain/models';

interface AuditRequestCardProps {
  auditRequest: AuditRequest;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}

export const AuditRequestCard: React.FC<AuditRequestCardProps> = ({
  auditRequest,
  onView,
  onEdit
}) => {
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {auditRequest.quotation?.quotation_number || 'Sin número'}
          </h3>
          <p className="text-sm text-gray-600">
            Pedido: {auditRequest.medical_order?.order_number || 'Sin número'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Creado: {formatDate(auditRequest.created_at)}
          </p>
        </div>
        <AuditStatusBadge status={auditRequest.audit_status} />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm font-medium text-gray-700">Costo Original</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(auditRequest.original_order_cost)}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Costo Cotizado</p>
          <p className="text-lg font-semibold text-blue-600">
            {formatCurrency(auditRequest.quoted_cost)}
          </p>
        </div>
      </div>

      {auditRequest.audit_status === 'approved' && auditRequest.approved_cost && (
        <div className="mb-4 p-3 bg-green-50 rounded-md">
          <p className="text-sm font-medium text-green-800">Costo Aprobado</p>
          <p className="text-lg font-semibold text-green-900">
            {formatCurrency(auditRequest.approved_cost)}
          </p>
        </div>
      )}

      {auditRequest.audit_status === 'rejected' && auditRequest.rejection_reason && (
        <div className="mb-4 p-3 bg-red-50 rounded-md">
          <p className="text-sm font-medium text-red-800">Motivo de Rechazo</p>
          <p className="text-sm text-red-700">{auditRequest.rejection_reason}</p>
        </div>
      )}
      
      <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
        <button
          onClick={() => onView(auditRequest.audit_request_id)}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors duration-200"
        >
          Ver Detalle
        </button>
        {auditRequest.audit_status === 'pending' && (
          <button
            onClick={() => onEdit(auditRequest.audit_request_id)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Auditar
          </button>
        )}
      </div>
    </div>
  );
}; 