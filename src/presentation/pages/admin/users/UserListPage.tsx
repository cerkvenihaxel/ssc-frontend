import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, UserCheck, UserX, AlertCircle } from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';
import LoadingSpinner from '../../../../shared/components/ui/LoadingSpinner';
import { useAdmin } from '../../../hooks/useAdmin';
import type { AdminUser } from '../../../../infrastructure/repositories/HttpAdminRepository';

const UserListPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [limit] = useState(10);

  const { 
    loading, 
    error, 
    setError,
    getAllUsers, 
    deleteUser, 
    updateUser 
  } = useAdmin();

  // Cargar usuarios desde la API
  const loadUsers = async () => {
    const role = selectedRole === 'all' ? undefined : selectedRole;
    const result = await getAllUsers(currentPage, limit, role);
    
    if (result) {
      setUsers(result.users);
      setTotalUsers(result.total);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [currentPage, selectedRole]);

  // Filtrar usuarios localmente por búsqueda (la API no tiene search)
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleToggleUserStatus = async (userId: string) => {
    const user = users.find(u => u.user_id === userId);
    if (!user) return;

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const result = await updateUser(userId, { status: newStatus });
    
    if (result) {
      setUsers(users.map(u => 
        u.user_id === userId 
          ? { ...u, status: newStatus }
          : u
      ));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }

    const result = await deleteUser(userId);
    if (result) {
      setUsers(users.filter(u => u.user_id !== userId));
      setTotalUsers(prev => prev - 1);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    if (status === 'active') {
      return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
    }
    return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
  };

  const getRoleBadge = (roleName: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    const roleColors = {
      'Administrador': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Auditor': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Efector': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Proveedor': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Médico': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'Afiliado': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    
    return `${baseClasses} ${roleColors[roleName as keyof typeof roleColors] || roleColors.Afiliado}`;
  };

  const totalPages = Math.ceil(totalUsers / limit);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading && users.length === 0) {
    return (
      <BaseLayout title="Gestión de Usuarios">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Gestión de Usuarios">
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de Usuarios
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              Administra todos los usuarios del sistema ({totalUsers} usuarios)
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={() => window.location.href = '/admin/users/create'}
              className="inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Usuario
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
                  Error al cargar usuarios
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
                      loadUsers();
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
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Rol
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-400 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-darkmode-800 dark:text-white"
              >
                <option value="all">Todos los roles</option>
                <option value="Administrador">Administrador</option>
                <option value="Auditor">Auditor</option>
                <option value="Efector">Efector</option>
                <option value="Proveedor">Proveedor</option>
                <option value="Médico">Médico</option>
                <option value="Afiliado">Afiliado</option>
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
                  setSelectedRole('all');
                  setSelectedStatus('all');
                  setCurrentPage(1);
                }}
                className="w-full"
              >
                <Filter className="w-4 h-4 mr-2" />
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-darkmode-600/80 flex items-center justify-center z-10">
              <LoadingSpinner size="md" />
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-darkmode-400">
              <thead className="bg-gray-50 dark:bg-darkmode-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Rol
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
                {filteredUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50 dark:hover:bg-darkmode-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.nombre}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getRoleBadge(user.role.role_name)}>
                        {user.role.role_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(user.status || 'active')}>
                        {(user.status || 'active') === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                      {new Date(user.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => window.location.href = `/admin/users/${user.user_id}`}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.location.href = `/admin/users/${user.user_id}/edit`}
                          className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(user.user_id)}
                          className={(user.status || 'active') === 'active' 
                            ? "text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            : "text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          }
                          title={(user.status || 'active') === 'active' ? 'Desactivar' : 'Activar'}
                          disabled={loading}
                        >
                          {(user.status || 'active') === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.user_id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Eliminar"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-slate-400">
                No se encontraron usuarios que coincidan con los filtros.
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="bg-white dark:bg-darkmode-600 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-darkmode-400 sm:px-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button 
              variant="outline-primary" 
              onClick={handlePreviousPage}
              disabled={currentPage <= 1 || loading}
            >
              Anterior
            </Button>
            <Button 
              variant="outline-primary" 
              onClick={handleNextPage}
              disabled={currentPage >= totalPages || loading}
            >
              Siguiente
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-slate-400">
                Mostrando página <span className="font-medium">{currentPage}</span> de{' '}
                <span className="font-medium">{totalPages}</span> ({totalUsers} usuarios en total)
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage <= 1 || loading}
                >
                  Anterior
                </Button>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="ml-3"
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages || loading}
                >
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

export default UserListPage; 