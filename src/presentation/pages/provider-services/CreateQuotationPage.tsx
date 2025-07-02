import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { useProviderServices } from '../../hooks/useProviderServices';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import BaseLayout from '../../../shared/components/layout/BaseLayout';

interface RequestItem {
  item_id: string;
  item_name: string;
  description?: string;
  requested_quantity: number;
  unit?: string;
  estimated_unit_cost?: number;
}

interface QuotationItem {
  request_item_id: string;
  item_name: string;
  requested_quantity: number;
  unit?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  observations?: string;
}

interface RequestDetail {
  request_id: string;
  request_number: string;
  title: string;
  description: string;
  type: 'medical' | 'effector';
  items: RequestItem[];
}

const CreateQuotationPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { getRequestDetail, createQuotation } = useProviderServices();
  
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Datos de la cotización
  const [deliveryTimeDays, setDeliveryTimeDays] = useState<number>(30);
  const [deliveryTerms, setDeliveryTerms] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [warrantyTerms, setWarrantyTerms] = useState('');
  const [observations, setObservations] = useState('');
  const [validUntil, setValidUntil] = useState('');

  useEffect(() => {
    if (requestId) {
      loadRequestDetail();
    }
  }, [requestId]);

  useEffect(() => {
    // Set default valid until date (30 days from now)
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    setValidUntil(defaultDate.toISOString().split('T')[0]);
  }, []);

  const loadRequestDetail = async () => {
    if (!requestId) return;
    
    try {
      setLoading(true);
      const data = await getRequestDetail(requestId) as RequestDetail;
      setRequest(data);
      
      // Initialize quotation items with request items
      const initialItems: QuotationItem[] = data.items.map((item: RequestItem) => ({
        request_item_id: item.item_id,
        item_name: item.item_name,
        requested_quantity: item.requested_quantity,
        unit: item.unit,
        quantity: item.requested_quantity,
        unit_price: item.estimated_unit_cost || 0,
        total_price: (item.estimated_unit_cost || 0) * item.requested_quantity,
        observations: ''
      }));
      
      setQuotationItems(initialItems);
    } catch (err) {
      setError('Error al cargar el detalle del pedido');
      console.error('Error loading request detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuotationItem = (index: number, field: keyof QuotationItem, value: any) => {
    const updatedItems = [...quotationItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    
    // Recalculate total price if quantity or unit_price changed
    if (field === 'quantity' || field === 'unit_price') {
      updatedItems[index].total_price = updatedItems[index].quantity * updatedItems[index].unit_price;
    }
    
    setQuotationItems(updatedItems);
  };

  const removeQuotationItem = (index: number) => {
    setQuotationItems(quotationItems.filter((_, i) => i !== index));
  };

  const addQuotationItem = () => {
    if (!request) return;
    
    // Find items not yet quoted
    const quotedItemIds = quotationItems.map(item => item.request_item_id);
    const availableItems = request.items.filter(item => !quotedItemIds.includes(item.item_id));
    
    if (availableItems.length > 0) {
      const newItem = availableItems[0];
      const quotationItem: QuotationItem = {
        request_item_id: newItem.item_id,
        item_name: newItem.item_name,
        requested_quantity: newItem.requested_quantity,
        unit: newItem.unit,
        quantity: newItem.requested_quantity,
        unit_price: newItem.estimated_unit_cost || 0,
        total_price: (newItem.estimated_unit_cost || 0) * newItem.requested_quantity,
        observations: ''
      };
      
      setQuotationItems([...quotationItems, quotationItem]);
    }
  };

  const calculateTotalAmount = () => {
    return quotationItems.reduce((sum, item) => sum + item.total_price, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requestId || quotationItems.length === 0) {
      setError('Debe incluir al menos un artículo en la cotización');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const quotationData = {
        request_id: requestId,
        delivery_time_days: deliveryTimeDays,
        delivery_terms: deliveryTerms,
        payment_terms: paymentTerms,
        warranty_terms: warrantyTerms,
        observations,
        valid_until: validUntil,
        items: quotationItems.map(item => ({
          request_item_id: item.request_item_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          observations: item.observations
        }))
      };

      await createQuotation(quotationData);
      
      // Success - redirect to my quotations
      navigate('/provider-services/my-quotations', {
        state: { message: 'Cotización creada exitosamente' }
      });
      
    } catch (err: any) {
      setError(err.message || 'Error al crear la cotización');
      console.error('Error creating quotation:', err);
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

  if (loading) {
    return (
      <BaseLayout title="Cargando...">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </BaseLayout>
    );
  }

  if (error && !request) {
    return (
      <BaseLayout title="Error">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              {error}
            </h3>
            <div className="mt-6">
              <button
                onClick={() => navigate('/provider-services/available-requests')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <ArrowLeft className="-ml-1 mr-2 h-5 w-5" />
                Volver a Solicitudes
              </button>
            </div>
          </div>
        </div>
      </BaseLayout>
    );
  }

  const canAddMoreItems = request && quotationItems.length < request.items.length;

  return (
    <BaseLayout title={`Crear Cotización - ${request?.request_number}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/provider-services/request/${requestId}`)}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver al Detalle
          </button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Crear Cotización
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Pedido: {request?.request_number} - {request?.title}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Request Summary */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Resumen del Pedido
              </h3>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Número de Pedido
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white font-semibold">
                    {request?.request_number}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tipo
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {request?.type === 'medical' ? 'Pedido Médico' : 'Pedido de Efector'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total de Artículos
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {request?.items.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quotation Items */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Artículos a Cotizar ({quotationItems.length})
              </h3>
              {canAddMoreItems && (
                <button
                  type="button"
                  onClick={addQuotationItem}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar Artículo
                </button>
              )}
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
                      Precio Unitario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Observaciones
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {quotationItems.map((item, index) => (
                    <tr key={item.request_item_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.item_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Solicitado: {item.requested_quantity} {item.unit || ''}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="0"
                          max={item.requested_quantity}
                          value={item.quantity}
                          onChange={(e) => updateQuotationItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                        />
                        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                          {item.unit || ''}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateQuotationItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(item.total_price)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={item.observations || ''}
                          onChange={(e) => updateQuotationItem(index, 'observations', e.target.value)}
                          className="w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                          placeholder="Opcional"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => removeQuotationItem(index)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {quotationItems.length === 0 && (
              <div className="px-6 py-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  Sin artículos
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Agregue artículos para crear la cotización.
                </p>
              </div>
            )}

            {/* Total */}
            {quotationItems.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900 dark:text-white">
                    Total de la Cotización:
                  </span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(calculateTotalAmount())}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quotation Details */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Términos y Condiciones
              </h3>
            </div>
            <div className="px-6 py-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="deliveryTimeDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tiempo de Entrega (días)
                  </label>
                  <input
                    type="number"
                    id="deliveryTimeDays"
                    min="1"
                    value={deliveryTimeDays}
                    onChange={(e) => setDeliveryTimeDays(parseInt(e.target.value) || 1)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Válida Hasta
                  </label>
                  <input
                    type="date"
                    id="validUntil"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="deliveryTerms" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Términos de Entrega
                </label>
                <textarea
                  id="deliveryTerms"
                  rows={3}
                  value={deliveryTerms}
                  onChange={(e) => setDeliveryTerms(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Ej: Entrega en domicilio, horario de 9:00 a 17:00"
                />
              </div>

              <div>
                <label htmlFor="paymentTerms" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Términos de Pago
                </label>
                <textarea
                  id="paymentTerms"
                  rows={3}
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Ej: 30% anticipo, 70% contra entrega"
                />
              </div>

              <div>
                <label htmlFor="warrantyTerms" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Términos de Garantía
                </label>
                <textarea
                  id="warrantyTerms"
                  rows={3}
                  value={warrantyTerms}
                  onChange={(e) => setWarrantyTerms(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Ej: Garantía de 12 meses por defectos de fabricación"
                />
              </div>

              <div>
                <label htmlFor="observations" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Observaciones Generales
                </label>
                <textarea
                  id="observations"
                  rows={3}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Observaciones adicionales de la cotización"
                />
              </div>
            </div>
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
          <div className="flex items-center justify-end space-x-4 bg-white dark:bg-gray-800 px-6 py-4 shadow rounded-lg">
            <button
              type="button"
              onClick={() => navigate(`/provider-services/request/${requestId}`)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || quotationItems.length === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <CheckCircle className="-ml-1 mr-2 h-5 w-5" />
                  Crear Cotización
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </BaseLayout>
  );
};

export default CreateQuotationPage; 