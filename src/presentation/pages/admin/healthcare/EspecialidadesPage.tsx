import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Power, 
  PowerOff,
  CheckCircle,
  AlertCircle,
  Activity,
  Users,
  Loader
} from 'lucide-react';
import { useAdmin } from '../../../hooks/useAdmin';
import { Link } from 'react-router-dom';
import type { Especialidad } from '../../../../infrastructure/repositories/HttpAdminRepository';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';

interface EspecialidadesPageProps {}

const EspecialidadesPage: React.FC<EspecialidadesPageProps> = () => {
  // Estados
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Hook de administración
  const { 
    getAllEspecialidades,
    activateEspecialidad,
    deactivateEspecialidad,
    deleteEspecialidad
  } = useAdmin();

  // Cargar especialidades
  const loadEspecialidades = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllEspecialidades();
      setEspecialidades(data || []);
    } catch (err: any) {
      console.error('Error loading especialidades:', err);
      setError(err.message || 'Error al cargar las especialidades');
    } finally {
      setLoading(false);
    }
  };

  // Efectos
  useEffect(() => {
    loadEspecialidades();
  }, []);

  // Filtros y búsqueda
  const filteredEspecialidades = especialidades.filter(especialidad => {
    const matchesSearch = 
      especialidad.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (especialidad.codigo && especialidad.codigo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (especialidad.descripcion && especialidad.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && especialidad.activa) ||
      (statusFilter === 'inactive' && !especialidad.activa);

    return matchesSearch && matchesStatus;
  });

  // Estadísticas
  const stats = {
    total: especialidades.length,
    active: especialidades.filter(e => e.activa).length,
    inactive: especialidades.filter(e => !e.activa).length
  };

  // Manejar activación/desactivación
  const handleToggleStatus = async (especialidadId: string, currentStatus: boolean) => {
    try {
      setActionLoading(especialidadId);
      
      if (currentStatus) {
        await deactivateEspecialidad(especialidadId);
      } else {
        await activateEspecialidad(especialidadId);
      }
      
      await loadEspecialidades();
    } catch (err: any) {
      console.error('Error toggling status:', err);
      setError(err.message || 'Error al cambiar el estado');
    } finally {
      setActionLoading(null);
    }
  };

  // Manejar eliminación
  const handleDelete = async (especialidadId: string, nombre: string) => {
    if (!window.confirm(`¿Está seguro de eliminar la especialidad "${nombre}"?`)) {
      return;
    }

    try {
      setActionLoading(especialidadId);
      await deleteEspecialidad(especialidadId);
      await loadEspecialidades();
    } catch (err: any) {
      console.error('Error deleting especialidad:', err);
      setError(err.message || 'Error al eliminar la especialidad');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <BaseLayout title="Especialidades Médicas">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando especialidades...</span>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Especialidades Médicas">
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Especialidades Médicas</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">Gestión de especialidades médicas del sistema ({stats.total} especialidades)</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={() => window.location.href = '/admin/healthcare/especialidades/create'}
              className="inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Especialidad
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">Total Especialidades</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">Activas</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{stats.active}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">Inactivas</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{stats.inactive}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar especialidades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro por estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300 appearance-none"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Solo activas</option>
                <option value="inactive">Solo inactivas</option>
              </select>
            </div>

            {/* Botón de refrescar */}
            <div className="flex items-end">
              <Button
                onClick={loadEspecialidades}
                disabled={loading}
                variant="outline-primary"
                className="w-full"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Refrescar'
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mensajes de error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</div>
                <div className="mt-3">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => {
                      setError(null);
                      loadEspecialidades();
                    }}
                  >
                    Reintentar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de especialidades */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-darkmode-400">
              <thead className="bg-gray-50 dark:bg-darkmode-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Especialidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Creada
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-darkmode-600 divide-y divide-gray-200 dark:divide-darkmode-400">
                {filteredEspecialidades.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                      <Activity className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay especialidades</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                        {searchTerm || statusFilter !== 'all' 
                          ? 'No se encontraron especialidades con los filtros aplicados.' 
                          : 'Comience agregando una nueva especialidad.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredEspecialidades.map((especialidad) => (
                    <tr key={especialidad.especialidadId} className="hover:bg-gray-50 dark:hover:bg-darkmode-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {especialidad.nombre}
                          </div>
                          {especialidad.descripcion && (
                            <div className="text-sm text-gray-500 dark:text-slate-400 truncate max-w-xs">
                              {especialidad.descripcion}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {especialidad.codigo || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          especialidad.activa
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {especialidad.activa ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        {new Date(especialidad.createdAt).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Ver detalles */}
                          <Link
                            to={`/admin/healthcare/especialidades/${especialidad.especialidadId}`}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {/* Editar */}
                          <Link
                            to={`/admin/healthcare/especialidades/${especialidad.especialidadId}/edit`}
                            className="text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-300 p-1 rounded hover:bg-gray-50 dark:hover:bg-darkmode-700"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* Activar/Desactivar */}
                          <button
                            onClick={() => handleToggleStatus(especialidad.especialidadId, especialidad.activa)}
                            disabled={actionLoading === especialidad.especialidadId}
                            className={`p-1 rounded transition-colors ${
                              especialidad.activa
                                ? 'text-red-600 hover:text-red-900 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20'
                                : 'text-green-600 hover:text-green-900 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20'
                            }`}
                            title={especialidad.activa ? 'Desactivar' : 'Activar'}
                          >
                            {actionLoading === especialidad.especialidadId ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : especialidad.activa ? (
                              <PowerOff className="w-4 h-4" />
                            ) : (
                              <Power className="w-4 h-4" />
                            )}
                          </button>

                          {/* Eliminar */}
                          <button
                            onClick={() => handleDelete(especialidad.especialidadId, especialidad.nombre)}
                            disabled={actionLoading === especialidad.especialidadId}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Eliminar"
                          >
                            {actionLoading === especialidad.especialidadId ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumen de resultados */}
        {filteredEspecialidades.length > 0 && (
          <div className="text-sm text-gray-500 dark:text-slate-400 text-center">
            Mostrando {filteredEspecialidades.length} de {especialidades.length} especialidades
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default EspecialidadesPage; 