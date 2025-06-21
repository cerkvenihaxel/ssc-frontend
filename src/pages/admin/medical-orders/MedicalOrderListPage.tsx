import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, Brain, FileText, AlertCircle, Users, DollarSign, TrendingUp, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MedicalOrder {
  orderId: string;
  orderNumber: string;
  requesterName: string;
  requesterType: 'admin' | 'doctor' | 'auditor';
  affiliateName: string;
  affiliateNumber: string;
  healthcareProviderName: string;
  title: string;
  urgency: {
    id: number;
    name: string;
    colorCode: string;
  };
  authorizationStatus: 'pending' | 'approved' | 'rejected' | 'partial';
  authorizationType: 'manual' | 'automatic' | 'hybrid';
  estimatedCost: number;
  approvedCost?: number;
  totalItems: number;
  approvedItems: number;
  createdAt: string;
  aiConfidenceScore?: number;
}

interface Statistics {
  totalOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  rejectedOrders: number;
  totalEstimatedCost: number;
  totalApprovedCost: number;
}

const MedicalOrderListPage: React.FC = () => {
  const [orders, setOrders] = useState<MedicalOrder[]>([]);
  const [stats, setStats] = useState<Statistics>({
    totalOrders: 0,
    pendingOrders: 0,
    approvedOrders: 0,
    rejectedOrders: 0,
    totalEstimatedCost: 0,
    totalApprovedCost: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [requesterTypeFilter, setRequesterTypeFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Datos mock para demostración
  const mockOrders: MedicalOrder[] = [
    {
      orderId: '1',
      orderNumber: 'MO-2024-000001',
      requesterName: 'Dr. Juan García',
      requesterType: 'doctor',
      affiliateName: 'María Rodríguez',
      affiliateNumber: 'AF001',
      healthcareProviderName: 'OSDE',
      title: 'Medicación para tratamiento de fractura de costilla',
      urgency: { id: 4, name: 'Urgente', colorCode: '#EF4444' },
      authorizationStatus: 'pending',
      authorizationType: 'automatic',
      estimatedCost: 15000,
      totalItems: 3,
      approvedItems: 0,
      createdAt: '2024-01-15T10:30:00Z',
      aiConfidenceScore: 0.85
    },
    {
      orderId: '2',
      orderNumber: 'MO-2024-000002',
      requesterName: 'Administrador Sistema',
      requesterType: 'admin',
      affiliateName: 'Carlos López',
      affiliateNumber: 'AF002',
      healthcareProviderName: 'Swiss Medical',
      title: 'Suministros médicos para cirugía menor',
      urgency: { id: 2, name: 'Normal', colorCode: '#3B82F6' },
      authorizationStatus: 'approved',
      authorizationType: 'automatic',
      estimatedCost: 25000,
      approvedCost: 23000,
      totalItems: 5,
      approvedItems: 4,
      createdAt: '2024-01-14T15:45:00Z',
      aiConfidenceScore: 0.92
    },
    {
      orderId: '3',
      orderNumber: 'MO-2024-000003',
      requesterName: 'Dr. Ana Martínez',
      requesterType: 'doctor',
      affiliateName: 'José Fernández',
      affiliateNumber: 'AF003',
      healthcareProviderName: 'Galeno',
      title: 'Equipos para terapia respiratoria',
      urgency: { id: 5, name: 'Crítica', colorCode: '#DC2626' },
      authorizationStatus: 'rejected',
      authorizationType: 'manual',
      estimatedCost: 45000,
      totalItems: 2,
      approvedItems: 0,
      createdAt: '2024-01-13T08:20:00Z'
    },
    {
      orderId: '4',
      orderNumber: 'MO-2024-000004',
      requesterName: 'Auditor Principal',
      requesterType: 'auditor',
      affiliateName: 'Elena Vargas',
      affiliateNumber: 'AF004',
      healthcareProviderName: 'OSDE',
      title: 'Medicamentos para tratamiento oncológico',
      urgency: { id: 3, name: 'Alta', colorCode: '#F59E0B' },
      authorizationStatus: 'partial',
      authorizationType: 'hybrid',
      estimatedCost: 85000,
      approvedCost: 60000,
      totalItems: 8,
      approvedItems: 5,
      createdAt: '2024-01-12T12:10:00Z',
      aiConfidenceScore: 0.78
    }
  ];

  const mockStats: Statistics = {
    totalOrders: 4,
    pendingOrders: 1,
    approvedOrders: 1,
    rejectedOrders: 1,
    totalEstimatedCost: 170000,
    totalApprovedCost: 83000
  };

  useEffect(() => {
    // Simular carga de datos
    setLoading(true);
    setTimeout(() => {
      setOrders(mockOrders);
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      partial: 'bg-blue-100 text-blue-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getRequesterTypeBadge = (type: string) => {
    const badges: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-800',
      doctor: 'bg-blue-100 text-blue-800',
      auditor: 'bg-orange-100 text-orange-800'
    };
    return badges[type] || 'bg-gray-100 text-gray-800';
  };

  const getAuthorizationTypeIcon = (type: string) => {
    switch (type) {
      case 'automatic':
        return <Brain className="h-4 w-4 text-blue-600" />;
      case 'manual':
        return <Users className="h-4 w-4 text-green-600" />;
      case 'hybrid':
        return <FileText className="h-4 w-4 text-purple-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
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
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAuthorize = async (orderId: string) => {
    // Aquí iría la lógica para autorizar manualmente
    console.log('Autorizar pedido:', orderId);
    alert('Funcionalidad de autorización manual - En desarrollo');
  };

  const handleAIAuthorize = async (orderId: string) => {
    // Aquí iría la lógica para autorización con IA
    console.log('Autorizar con IA pedido:', orderId);
    alert('Funcionalidad de autorización con IA - En desarrollo');
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.affiliateName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.authorizationStatus === statusFilter;
    const matchesRequesterType = requesterTypeFilter === 'all' || order.requesterType === requesterTypeFilter;
    const matchesUrgency = urgencyFilter === 'all' || order.urgency.id.toString() === urgencyFilter;

    return matchesSearch && matchesStatus && matchesRequesterType && matchesUrgency;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos Médicos</h1>
          <p className="text-gray-600">Gestión de pedidos médicos con autorización inteligente</p>
        </div>
        <Link
          to="/admin/medical-orders/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Pedido
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Pedidos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aprobados</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approvedOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Costo Aprobado</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalApprovedCost)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Buscar pedidos..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="approved">Aprobado</option>
              <option value="rejected">Rechazado</option>
              <option value="partial">Parcial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Solicitante</label>
            <select
              value={requesterTypeFilter}
              onChange={(e) => setRequesterTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos</option>
              <option value="admin">Administrador</option>
              <option value="doctor">Médico</option>
              <option value="auditor">Auditor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Urgencia</label>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas</option>
              <option value="1">Baja</option>
              <option value="2">Normal</option>
              <option value="3">Alta</option>
              <option value="4">Urgente</option>
              <option value="5">Crítica</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente / Obra Social
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Urgencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Autorización
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Costo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.orderId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                      <div className="text-sm text-gray-500 truncate max-w-48">{order.title}</div>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRequesterTypeBadge(order.requesterType)}`}>
                          {order.requesterType === 'admin' ? 'Admin' : 
                           order.requesterType === 'doctor' ? 'Médico' : 'Auditor'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.affiliateName}</div>
                      <div className="text-sm text-gray-500">{order.affiliateNumber}</div>
                      <div className="text-sm text-gray-500">{order.healthcareProviderName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white"
                      style={{ backgroundColor: order.urgency.colorCode }}
                    >
                      {order.urgency.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(order.authorizationStatus)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(order.authorizationStatus)}`}>
                        {order.authorizationStatus === 'pending' ? 'Pendiente' :
                         order.authorizationStatus === 'approved' ? 'Aprobado' :
                         order.authorizationStatus === 'rejected' ? 'Rechazado' : 'Parcial'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getAuthorizationTypeIcon(order.authorizationType)}
                      <span className="ml-2 text-sm text-gray-900">
                        {order.authorizationType === 'automatic' ? 'IA' :
                         order.authorizationType === 'manual' ? 'Manual' : 'Híbrida'}
                      </span>
                      {order.aiConfidenceScore && (
                        <span className="ml-1 text-xs text-gray-500">
                          ({Math.round(order.aiConfidenceScore * 100)}%)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.estimatedCost)}
                      </div>
                      {order.approvedCost && (
                        <div className="text-sm text-green-600">
                          ✓ {formatCurrency(order.approvedCost)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.approvedItems} / {order.totalItems}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(order.approvedItems / order.totalItems) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => console.log('Ver detalles:', order.orderId)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {order.authorizationStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAuthorize(order.orderId)}
                            className="text-green-600 hover:text-green-900"
                            title="Autorizar manualmente"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleAIAuthorize(order.orderId)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Autorizar con IA"
                          >
                            <Brain className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay pedidos médicos</h3>
          <p className="mt-1 text-sm text-gray-500">
            No se encontraron pedidos que coincidan con los filtros aplicados.
          </p>
        </div>
      )}
    </div>
  );
};

export default MedicalOrderListPage; 