import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Calendar,
  FileText,
  DollarSign,
  AlertTriangle,
  CheckCircle
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
  total_estimated_cost?: number;
  urgency?: string;
}

interface RequestDetail {
  request_id: string;
  request_number: string;
  title: string;
  description: string;
  type: 'medical' | 'effector';
  specialties: string[];
  priority?: string;
  urgency?: string;
  estimated_cost?: number;
  delivery_date?: string;
  created_at: string;
  requester_name?: string;
  items: RequestItem[];
  status: string;
}

const RequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRequestDetail } = useProviderServices();
  
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadRequestDetail();
    }
  }, [id]);

  const loadRequestDetail = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await getRequestDetail(id) as RequestDetail;
      setRequest(data);
    } catch (err) {
      setError('Error al cargar el detalle del pedido');
      console.error('Error loading request detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuotation = () => {
    navigate(`/provider-services/create-quotation/${id}`);
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

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    
    const colors = {
      'ALTA': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      'MEDIA': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      'BAJA': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
      }`}>
        {priority}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      'medical': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'effector': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
    };

    const labels = {
      'medical': 'Pedido Médico',
      'effector': 'Pedido de Efector'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
      }`}>
        {labels[type as keyof typeof labels] || type}
      </span>
    );
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

  if (error || !request) {
    return (
      <BaseLayout title="Error">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              {error || 'Pedido no encontrado'}
            </h3>
            <div className="mt-6">
              <button
                onClick={() => navigate('/provider-services/available-requests')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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

  return (
    <BaseLayout title={`Detalle - ${request.request_number}`}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate('/provider-services/available-requests')}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver a Solicitudes
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {request.request_number}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Detalle del pedido
              </p>
            </div>
            
            <button
              onClick={handleCreateQuotation}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <DollarSign className="-ml-1 mr-2 h-5 w-5" />
              Crear Cotización
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información General */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Información General
                </h3>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Título
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white font-semibold">
                      {request.title}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tipo
                    </label>
                    <div className="mt-1">
                      {getTypeBadge(request.type)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Prioridad
                    </label>
                    <div className="mt-1">
                      {getPriorityBadge(request.priority)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Estado
                    </label>
                    <div className="mt-1 flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                        {request.status}
                      </span>
                    </div>
                  </div>
                  
                  {request.estimated_cost && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Costo Estimado
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white font-semibold">
                        {formatCurrency(request.estimated_cost)}
                      </p>
                    </div>
                  )}
                  
                  {request.delivery_date && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Fecha de Entrega
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {formatDate(request.delivery_date)}
                      </p>
                    </div>
                  )}
                </div>
                
                {request.description && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Descripción
                    </label>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {request.description}
                    </p>
                  </div>
                )}
                
                {request.specialties && request.specialties.length > 0 && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Especialidades
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {request.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información Adicional */}
          <div>
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Detalles Adicionales
                </h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Creado</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(request.created_at)}
                    </p>
                  </div>
                </div>
                
                {request.requester_name && (
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Solicitante</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {request.requester_name}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ID del Pedido</p>
                    <p className="text-sm text-gray-900 dark:text-white font-mono">
                      {request.request_id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Artículos del Pedido */}
        <div>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Artículos Solicitados ({request.items?.length || 0})
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
                      Costo Estimado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total Estimado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {request.items?.map((item, index) => (
                    <tr key={item.item_id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.item_name}
                          </p>
                          {item.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {item.requested_quantity} {item.unit || ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {item.estimated_unit_cost ? formatCurrency(item.estimated_unit_cost) : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.total_estimated_cost ? formatCurrency(item.total_estimated_cost) : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {(!request.items || request.items.length === 0) && (
              <div className="px-6 py-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  Sin artículos
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Este pedido no tiene artículos especificados.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default RequestDetailPage; 