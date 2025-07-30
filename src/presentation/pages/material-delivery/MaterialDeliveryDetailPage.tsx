import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { MaterialDelivery } from '../../../domain/models';
import BaseLayout from '../../../shared/components/layout/BaseLayout';
import { ArrowLeft, Package, User, Calendar, DollarSign, MapPin, Phone, Truck, CheckCircle, Clock, XCircle, FileText, Building } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';

export const MaterialDeliveryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState<MaterialDelivery | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadDeliveryDetail();
    }
  }, [id]);

  const loadDeliveryDetail = async () => {
    try {
      setLoading(true);
      
      // Mock data para demostración
      const mockDelivery: MaterialDelivery = {
        delivery_id: 'DEL-2025-001',
        medical_order_id: 'MO-2025-000001',
        patient_name: 'María González',
        provider_name: 'Proveedor Médico ABC',
        delivery_date: new Date('2025-01-15T14:30:00Z'),
        delivery_status: 'delivered',
        total_cost: 82000,
        items_count: 5,
        tracking_number: 'TRK-001-2025',
        delivery_address: 'Hospital General, Sala 301, Av. San Martín 1234, CABA',
        delivery_notes: 'Entrega completada sin inconvenientes. El material fue recibido por el personal de enfermería y verificado según protocolo.',
        contact_phone: '+54 11 1234-5678',
        created_at: new Date('2025-01-10T09:00:00Z'),
        updated_at: new Date('2025-01-15T14:30:00Z'),
        items: [
          {
            item_id: 'ITEM-001',
            name: 'Monitor Multiparamétrico',
            description: 'Monitor de signos vitales con pantalla táctil, marca Philips',
            quantity: 1,
            unit_cost: 45000,
            total_cost: 45000,
            category: 'Equipos de Monitoreo',
            condition: 'new',
            serial_number: 'SN-MON-2025-001',
            warranty_info: 'Garantía de 2 años con servicio técnico incluido'
          },
          {
            item_id: 'ITEM-002',
            name: 'Bomba de Infusión',
            description: 'Bomba de infusión volumétrica, modelo Baxter',
            quantity: 2,
            unit_cost: 12000,
            total_cost: 24000,
            category: 'Equipos de Infusión',
            condition: 'new',
            serial_number: 'SN-BOM-2025-001',
            warranty_info: 'Garantía de 1 año'
          },
          {
            item_id: 'ITEM-003',
            name: 'Desfibrilador',
            description: 'Desfibrilador automático externo, marca Zoll',
            quantity: 1,
            unit_cost: 8000,
            total_cost: 8000,
            category: 'Equipos de Emergencia',
            condition: 'new',
            serial_number: 'SN-DES-2025-001',
            warranty_info: 'Garantía de 3 años'
          },
          {
            item_id: 'ITEM-004',
            name: 'Ventilador Mecánico',
            description: 'Ventilador mecánico portátil, modelo Dräger',
            quantity: 1,
            unit_cost: 5000,
            total_cost: 5000,
            category: 'Equipos de Respiración',
            condition: 'new',
            serial_number: 'SN-VEN-2025-001',
            warranty_info: 'Garantía de 2 años'
          }
        ],
        medical_order: {
          medical_order_id: 'MO-2025-000001',
          patient_name: 'María González',
          doctor_name: 'Dr. Carlos Mendoza',
          specialty: 'Cardiología',
          urgency: 'medium',
          created_at: new Date('2025-01-08T14:00:00Z')
        }
      };
      
      setDelivery(mockDelivery);
    } catch (error) {
      console.error('Error loading delivery detail:', error);
      setDelivery(null);
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
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'PENDIENTE';
      case 'in_transit':
        return 'EN TRÁNSITO';
      case 'delivered':
        return 'ENTREGADO';
      case 'cancelled':
        return 'CANCELADO';
      default:
        return status.toUpperCase();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5" />;
      case 'in_transit':
        return <Truck className="w-5 h-5" />;
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'bg-green-100 text-green-800';
      case 'refurbished':
        return 'bg-blue-100 text-blue-800';
      case 'used':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'NUEVO';
      case 'refurbished':
        return 'REACONDICIONADO';
      case 'used':
        return 'USADO';
      default:
        return condition.toUpperCase();
    }
  };

  const handleViewMedicalOrder = () => {
    navigate(`/admin/medical-orders/${delivery?.medical_order_id}`);
  };

  if (loading) {
    return (
      <BaseLayout title="Cargando Entrega">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </BaseLayout>
    );
  }

  if (!delivery) {
    return (
      <BaseLayout title="Entrega no encontrada">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Entrega no encontrada
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            La entrega que buscas no existe o no tienes permisos para verla.
          </p>
          <Button onClick={() => navigate('/material-delivery')}>
            Volver al listado
          </Button>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title={`Entrega ${delivery.delivery_id}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400">
          <div className="px-6 py-6 border-b border-gray-200 dark:border-darkmode-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/material-delivery')}
                  className="flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Entrega {delivery.delivery_id}
                  </h1>
                  <p className="text-gray-600 dark:text-slate-400">
                    Detalles de la entrega de materiales médicos
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(delivery.delivery_status)}`}>
                  {getStatusIcon(delivery.delivery_status)}
                  <span className="ml-2">{getStatusText(delivery.delivery_status)}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Detalles de la Entrega */}
            <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Información de la Entrega
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">ID de Entrega</p>
                      <p className="font-medium text-gray-900 dark:text-white">{delivery.delivery_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Orden Médica</p>
                      <p className="font-medium text-gray-900 dark:text-white">{delivery.medical_order_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Paciente</p>
                      <p className="font-medium text-gray-900 dark:text-white">{delivery.patient_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Proveedor</p>
                      <p className="font-medium text-gray-900 dark:text-white">{delivery.provider_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de Entrega</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(delivery.delivery_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Costo Total</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(delivery.total_cost)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dirección de Entrega */}
            <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Dirección de Entrega
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Dirección</p>
                    <p className="text-gray-600 dark:text-gray-400">{delivery.delivery_address}</p>
                  </div>
                </div>
                {delivery.contact_phone && (
                  <div className="flex items-center space-x-3 mt-4">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Teléfono de Contacto</p>
                      <p className="text-gray-600 dark:text-gray-400">{delivery.contact_phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Items Entregados */}
            <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Items Entregados ({delivery.items.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-darkmode-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Costo Unitario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-darkmode-600 divide-y divide-gray-200 dark:divide-gray-700">
                    {delivery.items.map((item) => (
                      <tr key={item.item_id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {item.description}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              {item.category}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(item.unit_cost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(item.total_cost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.condition === 'new' ? 'bg-green-100 text-green-800' :
                            item.condition === 'refurbished' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.condition === 'new' ? 'NUEVO' :
                             item.condition === 'refurbished' ? 'REACONDICIONADO' :
                             'USADO'}
                          </span>
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
            {/* Información de Seguimiento */}
            <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Información de Seguimiento
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {delivery.tracking_number && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Número de Seguimiento</p>
                    <p className="font-medium text-gray-900 dark:text-white">{delivery.tracking_number}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Items Entregados</p>
                  <p className="font-medium text-gray-900 dark:text-white">{delivery.items_count}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de Creación</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(delivery.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Última Actualización</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(delivery.updated_at)}</p>
                </div>
              </div>
            </div>

            {/* Notas de Entrega */}
            {delivery.delivery_notes && (
              <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Notas de Entrega
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-400">
                    {delivery.delivery_notes}
                  </p>
                </div>
              </div>
            )}

            {/* Información de la Orden Médica */}
            {delivery.medical_order && (
              <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Orden Médica
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Paciente</p>
                    <p className="font-medium text-gray-900 dark:text-white">{delivery.medical_order.patient_name}</p>
                  </div>
                  {delivery.medical_order.doctor_name && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Médico</p>
                      <p className="font-medium text-gray-900 dark:text-white">{delivery.medical_order.doctor_name}</p>
                    </div>
                  )}
                  {delivery.medical_order.specialty && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Especialidad</p>
                      <p className="font-medium text-gray-900 dark:text-white">{delivery.medical_order.specialty}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Urgencia</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      delivery.medical_order.urgency === 'high' ? 'bg-red-100 text-red-800' :
                      delivery.medical_order.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {delivery.medical_order.urgency === 'high' ? 'ALTA' :
                       delivery.medical_order.urgency === 'medium' ? 'MEDIA' :
                       'BAJA'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de Creación</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(delivery.medical_order.created_at)}</p>
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