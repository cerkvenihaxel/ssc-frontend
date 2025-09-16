import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MaterialDelivery, DeliveryFilters } from '../../../domain/models';
import BaseLayout from '../../../shared/components/layout/BaseLayout';
import { Search, Download, Package } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import { Pagination } from '../../../shared/components/ui/Pagination';

export const MaterialDeliveryListPage: React.FC = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<MaterialDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  });
  const [filters, setFilters] = useState<DeliveryFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async (page = pagination.page, limit = pagination.limit) => {
    try {
      setLoading(true);
      
      // Mock data para demostración
      const mockDeliveries: MaterialDelivery[] = [
        {
          delivery_id: 'DEL-2025-001',
          medical_order_id: 'MO-2025-000001',
          patient_name: 'María González',
          provider_name: 'Proveedor Médico ABC',
          delivery_date: new Date('2025-01-15T14:30:00Z'),
          delivery_status: 'delivered',
          total_cost: 82000,
          items_count: 5,
          tracking_number: 'TRK-001-2025',
          delivery_address: 'Hospital General, Sala 301',
          delivery_notes: 'Entrega completada sin inconvenientes',
          contact_phone: '+54 11 1234-5678',
          created_at: new Date('2025-01-10T09:00:00Z'),
          updated_at: new Date('2025-01-15T14:30:00Z'),
          items: []
        },
        {
          delivery_id: 'DEL-2025-002',
          medical_order_id: 'MO-2025-000002',
          patient_name: 'Carlos Rodríguez',
          provider_name: 'Suministros Médicos XYZ',
          delivery_date: new Date('2025-01-14T16:45:00Z'),
          delivery_status: 'delivered',
          total_cost: 115000,
          items_count: 8,
          tracking_number: 'TRK-002-2025',
          delivery_address: 'Clínica Privada, Piso 2',
          delivery_notes: 'Material de emergencia entregado con prioridad',
          contact_phone: '+54 11 2345-6789',
          created_at: new Date('2025-01-09T10:00:00Z'),
          updated_at: new Date('2025-01-14T16:45:00Z'),
          items: []
        },
        {
          delivery_id: 'DEL-2025-003',
          medical_order_id: 'MO-2025-000003',
          patient_name: 'Ana Martínez',
          provider_name: 'Equipos Médicos Pro',
          delivery_date: new Date('2025-01-13T11:20:00Z'),
          delivery_status: 'in_transit',
          total_cost: 98000,
          items_count: 6,
          tracking_number: 'TRK-003-2025',
          delivery_address: 'Centro Médico Norte',
          delivery_notes: 'En tránsito, estimado de llegada: 2 horas',
          contact_phone: '+54 11 3456-7890',
          created_at: new Date('2025-01-08T14:00:00Z'),
          updated_at: new Date('2025-01-13T09:30:00Z'),
          items: []
        },
        {
          delivery_id: 'DEL-2025-004',
          medical_order_id: 'MO-2025-000004',
          patient_name: 'Luis Pérez',
          provider_name: 'Proveedor Médico ABC',
          delivery_date: new Date('2025-01-12T13:15:00Z'),
          delivery_status: 'delivered',
          total_cost: 72000,
          items_count: 4,
          tracking_number: 'TRK-004-2025',
          delivery_address: 'Hospital Regional Sur',
          delivery_notes: 'Entrega realizada en horario programado',
          contact_phone: '+54 11 4567-8901',
          created_at: new Date('2025-01-07T11:00:00Z'),
          updated_at: new Date('2025-01-12T13:15:00Z'),
          items: []
        },
        {
          delivery_id: 'DEL-2025-005',
          medical_order_id: 'MO-2025-000005',
          patient_name: 'Sofía López',
          provider_name: 'Suministros Médicos XYZ',
          delivery_date: new Date('2025-01-11T08:30:00Z'),
          delivery_status: 'delivered',
          total_cost: 145000,
          items_count: 10,
          tracking_number: 'TRK-005-2025',
          delivery_address: 'Clínica Especializada',
          delivery_notes: 'Material de terapia intensiva entregado',
          contact_phone: '+54 11 5678-9012',
          created_at: new Date('2025-01-06T07:00:00Z'),
          updated_at: new Date('2025-01-11T08:30:00Z'),
          items: []
        },
        {
          delivery_id: 'DEL-2025-006',
          medical_order_id: 'MO-2025-000006',
          patient_name: 'Roberto Silva',
          provider_name: 'Equipos Médicos Pro',
          delivery_date: new Date('2025-01-10T15:45:00Z'),
          delivery_status: 'pending',
          total_cost: 65000,
          items_count: 3,
          tracking_number: 'TRK-006-2025',
          delivery_address: 'Hospital Municipal',
          delivery_notes: 'Pendiente de confirmación de disponibilidad',
          contact_phone: '+54 11 6789-0123',
          created_at: new Date('2025-01-05T16:00:00Z'),
          updated_at: new Date('2025-01-10T12:00:00Z'),
          items: []
        },
        {
          delivery_id: 'DEL-2025-007',
          medical_order_id: 'MO-2025-000007',
          patient_name: 'Carmen Ruiz',
          provider_name: 'Proveedor Médico ABC',
          delivery_date: new Date('2025-01-09T12:00:00Z'),
          delivery_status: 'delivered',
          total_cost: 105000,
          items_count: 7,
          tracking_number: 'TRK-007-2025',
          delivery_address: 'Centro de Salud Este',
          delivery_notes: 'Entrega con descuento por volumen aplicado',
          contact_phone: '+54 11 7890-1234',
          created_at: new Date('2025-01-04T13:00:00Z'),
          updated_at: new Date('2025-01-09T12:00:00Z'),
          items: []
        },
        {
          delivery_id: 'DEL-2025-008',
          medical_order_id: 'MO-2025-000008',
          patient_name: 'Diego Morales',
          provider_name: 'Suministros Médicos XYZ',
          delivery_date: new Date('2025-01-08T10:30:00Z'),
          delivery_status: 'cancelled',
          total_cost: 88000,
          items_count: 6,
          tracking_number: 'TRK-008-2025',
          delivery_address: 'Laboratorio Central',
          delivery_notes: 'Cancelado por solicitud del cliente',
          contact_phone: '+54 11 8901-2345',
          created_at: new Date('2025-01-03T15:00:00Z'),
          updated_at: new Date('2025-01-08T09:00:00Z'),
          items: []
        },
        {
          delivery_id: 'DEL-2025-009',
          medical_order_id: 'MO-2025-000009',
          patient_name: 'Elena Vargas',
          provider_name: 'Equipos Médicos Pro',
          delivery_date: new Date('2025-01-07T14:20:00Z'),
          delivery_status: 'in_transit',
          total_cost: 75000,
          items_count: 5,
          tracking_number: 'TRK-009-2025',
          delivery_address: 'Hospital Universitario',
          delivery_notes: 'En ruta, estimado de llegada: 1 hora',
          contact_phone: '+54 11 9012-3456',
          created_at: new Date('2025-01-02T10:00:00Z'),
          updated_at: new Date('2025-01-07T13:00:00Z'),
          items: []
        },
        {
          delivery_id: 'DEL-2025-010',
          medical_order_id: 'MO-2025-000010',
          patient_name: 'Fernando Torres',
          provider_name: 'Proveedor Médico ABC',
          delivery_date: new Date('2025-01-06T16:00:00Z'),
          delivery_status: 'delivered',
          total_cost: 175000,
          items_count: 12,
          tracking_number: 'TRK-010-2025',
          delivery_address: 'Unidad de Terapia Intensiva',
          delivery_notes: 'Equipamiento de emergencia entregado',
          contact_phone: '+54 11 0123-4567',
          created_at: new Date('2025-01-01T08:00:00Z'),
          updated_at: new Date('2025-01-06T16:00:00Z'),
          items: []
        }
      ];

      // Simular paginación
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = mockDeliveries.slice(startIndex, endIndex);
      
      setDeliveries(paginatedData);
      setPagination({
        page: page,
        limit: limit,
        total: mockDeliveries.length,
        total_pages: Math.ceil(mockDeliveries.length / limit)
      });
    } catch (error) {
      console.error('Error loading deliveries:', error);
      setDeliveries([]);
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        total_pages: 1
      });
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
      month: 'short',
      year: 'numeric'
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

  const handleView = (id: string) => {
    navigate(`/material-delivery/${id}`);
  };

  const handleCreate = () => {
    navigate('/material-delivery/create');
  };

  const handleExport = () => {
    // TODO: Implementar exportación
    console.log('Exportando entregas...');
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
    loadDeliveries(page, pagination.limit);
  };

  const handlePageSizeChange = (limit: number) => {
    setPagination(prev => ({ ...prev, page: 1, limit }));
    loadDeliveries(1, limit);
  };

  const filteredDeliveries = deliveries.filter(delivery =>
    delivery.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.medical_order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.delivery_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <BaseLayout title="Material Entregado">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400">
          <div className="px-6 py-6 border-b border-gray-200 dark:border-darkmode-400">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Material Entregado
                </h1>
                <p className="text-gray-600 dark:text-slate-400">
                  Gestiona las entregas de materiales médicos
                </p>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                <Button
                  onClick={handleCreate}
                  className="flex items-center"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Nueva Entrega
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar por paciente, orden médica o ID de entrega..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
                className="px-3 py-2 border border-gray-300 dark:border-darkmode-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-darkmode-700 dark:text-white"
              >
                <option value="">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="in_transit">En Tránsito</option>
                <option value="delivered">Entregado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-darkmode-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Entrega
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Paciente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Proveedor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fecha Entrega
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Costo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-darkmode-600 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredDeliveries.map((delivery) => (
                    <tr key={delivery.delivery_id} className="hover:bg-gray-50 dark:hover:bg-darkmode-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {delivery.delivery_id}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {delivery.medical_order_id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {delivery.patient_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {delivery.provider_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.delivery_status)}`}>
                          {getStatusText(delivery.delivery_status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatDate(delivery.delivery_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatCurrency(delivery.total_cost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {delivery.items_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(delivery.delivery_id)}
                        >
                          Ver
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Empty State */}
        {!loading && filteredDeliveries.length === 0 && (
          <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400 p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No se encontraron entregas
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              No hay entregas que coincidan con los filtros aplicados.
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredDeliveries.length > 0 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.total_pages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            itemLabel="entregas"
          />
        )}
      </div>
    </BaseLayout>
  );
}; 