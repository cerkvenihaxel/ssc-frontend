import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Plus, AlertCircle, Building, 
  Mail, Phone, Edit, Eye, ChevronLeft, ChevronRight 
} from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';
import LoadingSpinner from '../../../../shared/components/ui/LoadingSpinner';
import { useAdmin } from '../../../hooks/useAdmin';
import type { AdminProvider } from '../../../../infrastructure/repositories/HttpAdminRepository';

const ProvidersPage: React.FC = () => {
  const navigate = useNavigate();
  const [providers, setProviders] = useState<AdminProvider[]>([]);
  const [totalProviders, setTotalProviders] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const { getAllProviders, loading: adminLoading, error, setError } = useAdmin();

  const loadProviders = async () => {
    const result = await getAllProviders();
    if (result) {
      setProviders(result.providers);
      setTotalProviders(result.total);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  // Filtrar proveedores localmente
  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.cuit.includes(searchTerm);
    const matchesType = selectedType === 'all' || provider.providerType === selectedType;
    const matchesStatus = selectedStatus === 'all' || provider.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    if (status === 'active') {
      return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
    }
    return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
  };

  const getTypeBadge = (type: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    const typeColors = {
      'Farmacia': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Laboratorio': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Instrumental': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Tecnología': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'Servicios': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    
    return `${baseClasses} ${typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}`;
  };

  if (adminLoading && providers.length === 0) {
    return (
      <BaseLayout title="Gestión de Proveedores">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Gestión de Proveedores">
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de Proveedores
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              Administra todos los proveedores del sistema ({totalProviders} proveedores)
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={() => navigate('/admin/users/providers/create')}
              className="inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Proveedor
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error al cargar proveedores
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
                <div className="mt-3">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => {
                      setError(null);
                      loadProviders();
                    }}
                  >
                    Reintentar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                  placeholder="Buscar por nombre, email o CUIT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Tipo
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-400 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-darkmode-800 dark:text-white"
              >
                <option value="all">Todos los tipos</option>
                <option value="Farmacia">Farmacia</option>
                <option value="Laboratorio">Laboratorio</option>
                <option value="Instrumental">Instrumental</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Servicios">Servicios</option>
              </select>
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
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline-primary"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                  setSelectedStatus('all');
                }}
                className="w-full"
              >
                <Filter className="w-4 h-4 mr-2" />
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Providers Table */}
        <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg overflow-hidden">
          {adminLoading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-darkmode-600/80 flex items-center justify-center z-10">
              <LoadingSpinner size="md" />
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-darkmode-400">
              <thead className="bg-gray-50 dark:bg-darkmode-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Fecha Creación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-darkmode-600 divide-y divide-gray-200 dark:divide-darkmode-400">
                {filteredProviders.map((provider) => (
                  <tr key={provider.providerId} className="hover:bg-gray-50 dark:hover:bg-darkmode-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {provider.providerName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">
                          CUIT: {provider.cuit}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getTypeBadge(provider.providerType)}>
                        {provider.providerType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <Mail className="w-3 h-3 mr-1 text-gray-400" />
                          {provider.contactEmail}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-slate-400">
                          <Phone className="w-3 h-3 mr-1 text-gray-400" />
                          {provider.contactPhone}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">
                          {provider.contactName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(provider.status)}>
                        {provider.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                      {new Date(provider.creationDate).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => navigate(`/admin/users/providers/${provider.providerId}`)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/users/providers/${provider.providerId}/edit`)}
                          className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredProviders.length === 0 && !adminLoading && (
            <div className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No se encontraron proveedores
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                No hay proveedores que coincidan con los filtros aplicados.
              </p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-white dark:bg-darkmode-600 px-4 py-3 border-t border-gray-200 dark:border-darkmode-400 sm:px-6 rounded-lg shadow">
          <div className="text-sm text-gray-700 dark:text-slate-400">
            Mostrando {filteredProviders.length} de {totalProviders} proveedores
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default ProvidersPage; 