import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';
import LoadingSpinner from '../../../../shared/components/ui/LoadingSpinner';

interface Request {
  id: string;
  requestNumber: string;
  effector: {
    name: string;
    type: string;
  };
  requester: {
    name: string;
    email: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  totalAmount?: number;
}

const RequestListPage: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  // Simulated data - will be replaced with API calls
  useEffect(() => {
    setTimeout(() => {
      setRequests([
        {
          id: '1',
          requestNumber: 'REQ-2024-001',
          effector: { name: 'Hospital Central', type: 'Hospital' },
          requester: { name: 'Dr. Juan Pérez', email: 'juan.perez@hospital.com' },
          status: 'pending',
          priority: 'high',
          description: 'Solicitud de insumos médicos urgentes',
          category: 'Insumos',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          totalAmount: 150000
        },
        {
          id: '2',
          requestNumber: 'REQ-2024-002',
          effector: { name: 'Clínica San José', type: 'Clínica' },
          requester: { name: 'Dr. María García', email: 'maria.garcia@clinica.com' },
          status: 'approved',
          priority: 'medium',
          description: 'Equipamiento para quirófano',
          category: 'Equipos',
          createdAt: '2024-01-14T15:30:00Z',
          updatedAt: '2024-01-15T09:00:00Z',
          totalAmount: 750000
        },
        {
          id: '3',
          requestNumber: 'REQ-2024-003',
          effector: { name: 'Centro de Salud Norte', type: 'Centro de Salud' },
          requester: { name: 'Enf. Ana López', email: 'ana.lopez@centro.com' },
          status: 'processing',
          priority: 'low',
          description: 'Medicamentos para atención primaria',
          category: 'Medicamentos',
          createdAt: '2024-01-13T11:00:00Z',
          updatedAt: '2024-01-15T08:30:00Z',
          totalAmount: 85000
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.effector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requester.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || request.priority === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleStatusChange = (requestId: string, newStatus: Request['status']) => {
    setRequests(requests.map(request => 
      request.id === requestId 
        ? { ...request, status: newStatus, updatedAt: new Date().toISOString() }
        : request
    ));
  };

  const getStatusBadge = (status: Request['status']) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    const statusConfig = {
      pending: { class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Clock },
      approved: { class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle },
      rejected: { class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: XCircle },
      processing: { class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Clock },
      completed: { class: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', icon: CheckCircle }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={`${baseClasses} ${config.class}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status === 'pending' ? 'Pendiente' :
         status === 'approved' ? 'Aprobado' :
         status === 'rejected' ? 'Rechazado' :
         status === 'processing' ? 'En Proceso' : 'Completado'}
      </span>
    );
  };

  const getPriorityBadge = (priority: Request['priority']) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    const priorityConfig = {
      low: { class: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', text: 'Baja' },
      medium: { class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', text: 'Media' },
      high: { class: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', text: 'Alta' },
      urgent: { class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', text: 'Urgente' }
    };

    const config = priorityConfig[priority];

    return (
      <span className={`${baseClasses} ${config.class}`}>
        {priority === 'urgent' && <AlertCircle className="w-3 h-3 mr-1" />}
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <BaseLayout title="Gestión de Pedidos">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Gestión de Pedidos">
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de Pedidos
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              Administra todas las solicitudes del sistema
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: requests.length, color: 'bg-blue-500' },
            { label: 'Pendientes', value: requests.filter(r => r.status === 'pending').length, color: 'bg-yellow-500' },
            { label: 'Aprobados', value: requests.filter(r => r.status === 'approved').length, color: 'bg-green-500' },
            { label: 'En Proceso', value: requests.filter(r => r.status === 'processing').length, color: 'bg-purple-500' }
          ].map((stat, index) => (
            <div key={index} className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-md`}>
                  <div className="w-6 h-6 text-white font-bold">{stat.value}</div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar por número, efector, solicitante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Estado
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-400 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-darkmode-800 dark:text-white"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="approved">Aprobado</option>
                <option value="rejected">Rechazado</option>
                <option value="processing">En Proceso</option>
                <option value="completed">Completado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Prioridad
              </label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-400 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-darkmode-800 dark:text-white"
              >
                <option value="all">Todas las prioridades</option>
                <option value="urgent">Urgente</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline-primary"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('all');
                  setSelectedPriority('all');
                }}
                className="w-full"
              >
                <Filter className="w-4 h-4 mr-2" />
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-darkmode-400">
              <thead className="bg-gray-50 dark:bg-darkmode-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Pedido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Efector / Solicitante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-darkmode-600 divide-y divide-gray-200 dark:divide-darkmode-400">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-darkmode-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {request.requestNumber}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-400 truncate max-w-xs">
                          {request.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {request.effector.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">
                          {request.requester.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(request.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {request.totalAmount ? `$${request.totalAmount.toLocaleString()}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                      {new Date(request.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => window.location.href = `/admin/requests/${request.id}`}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(request.id, 'approved')}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title="Aprobar"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(request.id, 'rejected')}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Rechazar"
                            >
                              <XCircle className="w-4 h-4" />
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
          
          {filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-slate-400">
                No se encontraron pedidos que coincidan con los filtros.
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="bg-white dark:bg-darkmode-600 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-darkmode-400 sm:px-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button variant="outline-primary">Anterior</Button>
            <Button variant="outline-primary">Siguiente</Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-slate-400">
                Mostrando <span className="font-medium">1</span> a{' '}
                <span className="font-medium">{filteredRequests.length}</span> de{' '}
                <span className="font-medium">{requests.length}</span> pedidos
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button variant="outline-primary" size="sm">
                  Anterior
                </Button>
                <Button variant="outline-primary" size="sm" className="ml-3">
                  Siguiente
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default RequestListPage; 