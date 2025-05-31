import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2, UserCheck, UserX, Filter, Download } from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import LoadingSpinner from '../../../../shared/components/ui/LoadingSpinner';
import { useToast } from '../../../../shared/components/ui/ToastContainer';
import { useAdmin } from '../../../hooks/useAdmin';
import type { AdminAuditor } from '../../../../infrastructure/repositories/HttpAdminRepository';

const AuditorsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { getAllAuditors, deleteAuditor, loading } = useAdmin();

  const [auditors, setAuditors] = useState<AdminAuditor[]>([]);
  const [filteredAuditors, setFilteredAuditors] = useState<AdminAuditor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    loadAuditors();
  }, [currentPage]);

  useEffect(() => {
    filterAuditors();
  }, [auditors, searchTerm, statusFilter]);

  const loadAuditors = async () => {
    try {
      const response = await getAllAuditors(currentPage, itemsPerPage);
      if (response) {
        setAuditors(response.auditors || []);
        setTotal(response.total || 0);
        setTotalPages(Math.ceil((response.total || 0) / itemsPerPage));
      }
    } catch (error) {
      console.error('Error loading auditors:', error);
      showError('Error', 'No se pudieron cargar los auditores');
    }
  };

  const filterAuditors = () => {
    let filtered = [...auditors];

    // Filtro por búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(auditor =>
        auditor.email.toLowerCase().includes(searchLower) ||
        auditor.nombre.toLowerCase().includes(searchLower) ||
        (auditor.auditor_info?.first_name && auditor.auditor_info.first_name.toLowerCase().includes(searchLower)) ||
        (auditor.auditor_info?.last_name && auditor.auditor_info.last_name.toLowerCase().includes(searchLower)) ||
        (auditor.auditor_info?.department && auditor.auditor_info.department.toLowerCase().includes(searchLower))
      );
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(auditor => auditor.status === statusFilter);
    }

    setFilteredAuditors(filtered);
  };

  const handleDelete = async (auditor: AdminAuditor) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar al auditor ${auditor.nombre}?`)) {
      return;
    }

    try {
      await deleteAuditor(auditor.user_id);
      showSuccess('Auditor eliminado', `El auditor ${auditor.nombre} ha sido eliminado correctamente`);
      loadAuditors();
    } catch (error) {
      showError('Error', 'No se pudo eliminar el auditor');
    }
  };

  const getStatusBadge = (status: string) => {
    const classes = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    return status === 'active' 
      ? `${classes} bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200`
      : `${classes} bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && auditors.length === 0) {
    return (
      <BaseLayout title="Cargando Auditores">
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Gestión de Auditores">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Auditores
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              Gestiona todos los auditores del sistema
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline-primary"
              onClick={() => navigate('/admin/users/auditors/create')}
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Auditor
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <UserCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
                  {auditors.filter(a => a.status === 'active').length}
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
                  {auditors.filter(a => a.status === 'inactive').length}
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredAuditors.length}</p>
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
                placeholder="Buscar auditores..."
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
                variant="outline"
                onClick={loadAuditors}
                disabled={loading}
                className="flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </div>
        </div>

        {/* Auditors Table */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-darkmode-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Auditor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Departamento
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
                {filteredAuditors.map((auditor) => (
                  <tr key={auditor.user_id} className="hover:bg-gray-50 dark:hover:bg-darkmode-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                              {auditor.nombre.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {auditor.nombre}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-slate-400">
                            {auditor.auditor_info?.employee_id || 'Sin ID empleado'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{auditor.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {auditor.auditor_info?.department || 'No especificado'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(auditor.status)}>
                        {auditor.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(auditor.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/users/auditors/${auditor.user_id}`)}
                          className="flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/users/auditors/${auditor.user_id}/edit`)}
                          className="flex items-center"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(auditor)}
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

          {filteredAuditors.length === 0 && (
            <div className="text-center py-12">
              <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                {searchTerm || statusFilter !== 'all' ? 'No se encontraron auditores' : 'No hay auditores'}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Intenta cambiar los filtros de búsqueda'
                  : 'Comienza creando un nuevo auditor'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <div className="mt-6">
                  <Button
                    variant="primary"
                    onClick={() => navigate('/admin/users/auditors/create')}
                    className="flex items-center mx-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Auditor
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-slate-300">
                Mostrando <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> a{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, total)}
                </span> de{' '}
                <span className="font-medium">{total}</span> auditores
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || loading}
                >
                  Anterior
                </Button>
                
                <span className="text-sm text-gray-700 dark:text-slate-300">
                  Página {currentPage} de {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || loading}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default AuditorsPage; 