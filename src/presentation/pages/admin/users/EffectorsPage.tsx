import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Edit, Trash2, UserCheck, UserX, Building } from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import { useToast } from '../../../../shared/components/ui/ToastContainer';
import { useAdmin } from '../../../hooks/useAdmin';
import type { AdminEffector } from '../../../../infrastructure/repositories/HttpAdminRepository';

const EffectorsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { getAllEffectors, deleteEffector } = useAdmin();

  const [effectors, setEffectors] = useState<AdminEffector[]>([]);
  const [filteredEffectors, setFilteredEffectors] = useState<AdminEffector[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadEffectors = async () => {
    setLoading(true);
    try {
      const response = await getAllEffectors(currentPage, itemsPerPage);
      if (response?.effectors) {
        setEffectors(response.effectors);
        setTotal(response.total);
      }
    } catch (error) {
      console.error('Error loading effectors:', error);
      showError('Error', 'No se pudieron cargar los efectores');
    } finally {
      setLoading(false);
    }
  };

  const filterEffectors = () => {
    let filtered = effectors;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(effector =>
        effector.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        effector.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        effector.effector_info?.effector_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        effector.effector_info?.effector_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        effector.effector_info?.cuit?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(effector => effector.status === statusFilter);
    }

    setFilteredEffectors(filtered);
  };

  useEffect(() => {
    loadEffectors();
  }, [currentPage]);

  useEffect(() => {
    filterEffectors();
  }, [effectors, searchTerm, statusFilter]);

  const handleDelete = async (effector: AdminEffector) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar al efector ${effector.nombre}?`)) {
      return;
    }

    try {
      await deleteEffector(effector.user_id);
      showSuccess('Efector eliminado', 'El efector ha sido eliminado correctamente');
      loadEffectors();
    } catch (error) {
      console.error('Error deleting effector:', error);
      showError('Error', 'No se pudo eliminar el efector');
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active'
      ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && effectors.length === 0) {
    return (
      <BaseLayout title="Gestión de Efectores">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Gestión de Efectores">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Efectores
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              Gestiona todos los efectores del sistema
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline-primary"
              onClick={() => navigate('/admin/users/effectors/create')}
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Efector
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Building className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Activos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {effectors.filter(e => e.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <UserX className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Inactivos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {effectors.filter(e => e.status === 'inactive').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Filter className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Filtrados</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredEffectors.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar efectores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg 
                         bg-white dark:bg-darkmode-800 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg 
                         bg-white dark:bg-darkmode-800 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline-primary"
                onClick={loadEffectors}
                disabled={loading}
                className="flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </div>
        </div>

        {/* Effectors Table */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-darkmode-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Efector
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    CUIT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Fecha de Creación
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-darkmode-600 divide-y divide-gray-200 dark:divide-slate-700">
                {filteredEffectors.map((effector) => (
                  <tr key={effector.user_id} className="hover:bg-gray-50 dark:hover:bg-darkmode-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                              {effector.nombre.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {effector.effector_info?.effector_name || effector.nombre}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-slate-400">
                            {effector.nombre}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{effector.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {effector.effector_info?.effector_type || 'No especificado'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {effector.effector_info?.cuit || 'No especificado'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(effector.status)}>
                        {effector.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(effector.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate(`/admin/users/effectors/${effector.user_id}`)}
                          className="flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate(`/admin/users/effectors/${effector.user_id}/edit`)}
                          className="flex items-center"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(effector)}
                          className="flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEffectors.length === 0 && !loading && (
            <div className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No hay efectores
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No se encontraron efectores que coincidan con los filtros aplicados.'
                  : 'Comienza agregando un nuevo efector.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <div className="mt-6">
                  <Button
                    variant="primary"
                    onClick={() => navigate('/admin/users/effectors/create')}
                    className="flex items-center mx-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Efector
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </BaseLayout>
  );
};

export default EffectorsPage; 