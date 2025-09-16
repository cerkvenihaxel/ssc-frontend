import React, { useState } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';

interface EffectorRequest {
  request_id: string;
  request_number: string;
  title: string;
  description?: string;
  priority: 'BAJA' | 'NORMAL' | 'ALTA' | 'URGENTE';
  total_estimated_amount?: number;
  items?: Array<{
    item_id: string;
    article_name: string;
    quantity: number;
    estimated_total_price?: number;
  }>;
}

interface AuthorizeEffectorRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: EffectorRequest;
  onApprove: (requestId: string, notes?: string) => Promise<void>;
  onReject: (requestId: string, reason: string, notes?: string) => Promise<void>;
  loading?: boolean;
}

const AuthorizeEffectorRequestModal: React.FC<AuthorizeEffectorRequestModalProps> = ({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject,
  loading = false
}) => {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!isOpen) return null;

  const handleActionSelect = (selectedAction: 'approve' | 'reject') => {
    setAction(selectedAction);
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    if (!action) return;

    try {
      if (action === 'approve') {
        await onApprove(request.request_id, notes || undefined);
      } else {
        if (!rejectionReason.trim()) {
          alert('Por favor ingrese el motivo del rechazo');
          return;
        }
        await onReject(request.request_id, rejectionReason, notes || undefined);
      }
      handleClose();
    } catch (error) {
      console.error('Error al procesar la autorización:', error);
    }
  };

  const handleClose = () => {
    setAction(null);
    setNotes('');
    setRejectionReason('');
    setShowConfirmation(false);
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-darkmode-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {showConfirmation 
              ? (action === 'approve' ? 'Confirmar Aprobación' : 'Confirmar Rechazo')
              : 'Autorizar Pedido de Efector'
            }
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showConfirmation ? (
            <>
              {/* Request Details */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Detalles del Pedido
                </h3>
                
                <div className="bg-gray-50 dark:bg-darkmode-700 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Número:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {request.request_number}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Prioridad:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {request.priority}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Título:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {request.title}
                    </p>
                  </div>
                  
                  {request.description && (
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Descripción:</span>
                      <p className="text-gray-900 dark:text-white">
                        {request.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Items:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {request.items?.length || 0} artículos
                      </p>
                    </div>
                    {request.total_estimated_amount && (
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Valor Total:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(request.total_estimated_amount)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* High Value Warning */}
              {request.total_estimated_amount && request.total_estimated_amount > 500000 && (
                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Pedido de Alto Valor
                      </h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Este pedido supera los $500,000. Revise cuidadosamente antes de autorizar.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  variant="success"
                  onClick={() => handleActionSelect('approve')}
                  className="flex-1 flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  <CheckCircle className="w-5 h-5" />
                  Aprobar Pedido
                </Button>
                
                <Button
                  variant="danger"
                  onClick={() => handleActionSelect('reject')}
                  className="flex-1 flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  <XCircle className="w-5 h-5" />
                  Rechazar Pedido
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Confirmation Form */}
              <div className="mb-6">
                <div className={`flex items-center gap-3 p-4 rounded-lg mb-4 ${
                  action === 'approve' 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                  {action === 'approve' ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                  <div>
                    <h3 className={`font-medium ${
                      action === 'approve' 
                        ? 'text-green-800 dark:text-green-200' 
                        : 'text-red-800 dark:text-red-200'
                    }`}>
                      {action === 'approve' ? 'Aprobar Pedido' : 'Rechazar Pedido'}
                    </h3>
                    <p className={`text-sm ${
                      action === 'approve' 
                        ? 'text-green-700 dark:text-green-300' 
                        : 'text-red-700 dark:text-red-300'
                    }`}>
                      {action === 'approve' 
                        ? 'Este pedido será aprobado y pasará al estado de cotización.'
                        : 'Este pedido será rechazado y el efector deberá revisarlo.'
                      }
                    </p>
                  </div>
                </div>

                {action === 'reject' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Motivo del Rechazo *
                    </label>
                    <select
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                               bg-white dark:bg-darkmode-700 text-gray-900 dark:text-white
                               focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    >
                      <option value="">Seleccione un motivo</option>
                      <option value="documentacion_incompleta">Documentación incompleta</option>
                      <option value="presupuesto_insuficiente">Presupuesto insuficiente</option>
                      <option value="articulos_no_autorizados">Artículos no autorizados</option>
                      <option value="informacion_incorrecta">Información incorrecta</option>
                      <option value="duplicado">Pedido duplicado</option>
                      <option value="fuera_de_politicas">Fuera de políticas institucionales</option>
                      <option value="otro">Otro motivo</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {action === 'approve' ? 'Notas de Aprobación (Opcional)' : 'Notas Adicionales (Opcional)'}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                             bg-white dark:bg-darkmode-700 text-gray-900 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder={action === 'approve' 
                      ? 'Agregue cualquier observación sobre la aprobación...'
                      : 'Agregue información adicional sobre el rechazo...'
                    }
                  />
                </div>
              </div>

              {/* Confirmation Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1"
                  disabled={loading}
                >
                  Atrás
                </Button>
                
                <Button
                  variant={action === 'approve' ? 'success' : 'danger'}
                  onClick={handleConfirm}
                  className="flex-1"
                  disabled={loading || (action === 'reject' && !rejectionReason.trim())}
                >
                  {loading ? 'Procesando...' : 
                    action === 'approve' ? 'Confirmar Aprobación' : 'Confirmar Rechazo'
                  }
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorizeEffectorRequestModal;