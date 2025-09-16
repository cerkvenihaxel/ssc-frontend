import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, MapPin, Package, Eye, Plus, Clock, AlertCircle } from 'lucide-react';
import BaseLayout from '../../../shared/components/layout/BaseLayout';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import { useToast } from '../../../shared/components/ui/ToastContainer';
import { useProviderServices } from '../../hooks/useProviderServices';
import { Link } from 'react-router-dom';

interface AvailableRequest {
  request_id: string;
  request_number: string;
  title: string;
  description: string;
  type: 'medical' | 'effector';
  specialties: string[];
  urgency?: number;
  priority?: string;
  estimated_cost?: number;
  estimated_amount?: number;
  delivery_date?: string;
  created_at: string;
}

const AvailableRequestsPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const { getAvailableRequests, loading } = useProviderServices();
  const [requests, setRequests] = useState<AvailableRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AvailableRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'medical' | 'effector'>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadAvailableRequests();
  }, [page, typeFilter, specialtyFilter, priorityFilter]);

  useEffect(() => {
    filterRequests();
  }, [searchTerm, requests]);

  const loadAvailableRequests = async () => {
    try {
      const response = await getAvailableRequests({
        type: typeFilter,
        specialty: specialtyFilter || undefined,
        priority: priorityFilter || undefined,
        page,
        limit: 10
      });

      setRequests(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error loading available requests:', error);
      showError('Error', 'No se pudieron cargar las solicitudes disponibles');
    }
  };

  const filterRequests = () => {
    if (!searchTerm) {
      setFilteredRequests(requests);
      return;
    }

    const filtered = requests.filter(request =>
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRequests(filtered);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medical':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'effector':
        return <MapPin className="w-4 h-4 text-green-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (type) {
      case 'medical':
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`;
      case 'effector':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300`;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'URGENTE':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'ALTA':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'NORMAL':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'BAJA':
        return <Clock className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <BaseLayout title="Solicitudes a Cotizar">
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Solicitudes a Cotizar
            </h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-slate-300">
              Pedidos disponibles para cotización que coinciden con tus especialidades
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por título, número..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Tipo
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-darkmode-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="all">Todos</option>
                <option value="medical">Pedidos Médicos</option>
                <option value="effector">Pedidos Efectores</option>
              </select>
            </div>

            {/* Especialidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Especialidad
              </label>
              <Input
                type="text"
                placeholder="Filtrar por especialidad"
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
              />
            </div>

            {/* Prioridad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Prioridad
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-darkmode-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">Todas</option>
                <option value="URGENTE">Urgente</option>
                <option value="ALTA">Alta</option>
                <option value="NORMAL">Normal</option>
                <option value="BAJA">Baja</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de solicitudes */}
        <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-500 dark:text-slate-400">Cargando solicitudes...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay solicitudes disponibles
              </h3>
              <p className="text-gray-500 dark:text-slate-400">
                No se encontraron solicitudes que coincidan con tus criterios de búsqueda y especialidades.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-slate-700">
              {filteredRequests.map((request) => (
                <div key={request.request_id} className="p-6 hover:bg-gray-50 dark:hover:bg-darkmode-700 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        {getTypeIcon(request.type)}
                        <span className={getTypeBadge(request.type)}>
                          {request.type === 'medical' ? 'Pedido Médico' : 'Pedido Efector'}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {request.request_number}
                        </span>
                        {request.priority && (
                          <div className="flex items-center space-x-1">
                            {getPriorityIcon(request.priority)}
                            <span className="text-xs text-gray-500 dark:text-slate-400">
                              {request.priority}
                            </span>
                          </div>
                        )}
                      </div>

                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {request.title}
                      </h3>

                      <p className="text-sm text-gray-600 dark:text-slate-400 mb-3 line-clamp-2">
                        {request.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-slate-400">
                        <span>Creado: {formatDate(request.created_at)}</span>
                        {request.delivery_date && (
                          <span>Entrega: {formatDate(request.delivery_date)}</span>
                        )}
                        {(request.estimated_cost || request.estimated_amount) && (
                          <span>
                            Est.: {formatAmount(request.estimated_cost || request.estimated_amount || 0)}
                          </span>
                        )}
                      </div>

                      {request.specialties && request.specialties.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {request.specialties.slice(0, 3).map((specialty, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                          {request.specialties.length > 3 && (
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-full">
                              +{request.specialties.length - 3} más
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Link to={`/provider-services/request/${request.request_id}`}>
                        <Button variant="outline-primary" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                      </Link>
                      <Link to={`/provider-services/create-quotation/${request.request_id}`}>
                        <Button variant="primary" size="sm">
                          <Plus className="w-4 h-4 mr-1" />
                          Cotizar
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-slate-300">
              Página {page} de {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default AvailableRequestsPage; 