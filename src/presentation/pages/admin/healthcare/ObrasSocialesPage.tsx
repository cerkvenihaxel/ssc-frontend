import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Building2,
  Activity,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { Link } from 'react-router-dom';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';
import { ApiClient } from '../../../../infrastructure/http/ApiClient';
import { HttpObraSocialRepository, type ObraSocial } from '../../../../infrastructure/repositories/HttpObraSocialRepository';

const ObrasSocialesPage: React.FC = () => {
  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Initialize repository
  const apiClient = new ApiClient();
  const obraSocialRepository = new HttpObraSocialRepository(apiClient);

  // Cargar obras sociales
  const loadObrasSociales = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await obraSocialRepository.getAllObrasSociales();
      setObrasSociales(data);
    } catch (err: any) {
      console.error('Error loading obras sociales:', err);
      setError(err.message || 'Error al cargar las obras sociales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadObrasSociales();
  }, []);

  // Filtros y búsqueda
  const filteredObrasSociales = obrasSociales.filter(obra => {
    const matchesSearch = 
      obra.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (obra.contactEmail && obra.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || obra.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Estadísticas
  const stats = {
    total: obrasSociales.length,
    activas: obrasSociales.filter(o => o.status === 'ACTIVA').length,
    inactivas: obrasSociales.filter(o => o.status === 'INACTIVA').length,
    conEmail: obrasSociales.filter(o => o.contactEmail).length
  };

  // Manejar eliminación
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Está seguro de eliminar la obra social "${name}"?`)) {
      return;
    }

    try {
      await obraSocialRepository.deleteObraSocial(id);
      await loadObrasSociales();
    } catch (err: any) {
      console.error('Error deleting obra social:', err);
      setError(err.message || 'Error al eliminar la obra social');
    }
  };

  if (loading) {
    return (
      <BaseLayout title="Obras Sociales">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando obras sociales...</span>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Obras Sociales">
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Obras Sociales</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">Gestión de obras sociales del sistema ({stats.total} obras sociales)</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={() => window.location.href = '/admin/healthcare/obras-sociales/create'}
              className="inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Obra Social
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">Total</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">Activas</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{stats.activas}</dd>
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
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">Inactivas</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{stats.inactivas}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">Con Email</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{stats.conEmail}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar obras sociales..."
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
                <option value="ACTIVA">Activa</option>
                <option value="INACTIVA">Inactiva</option>
              </select>
            </div>

            {/* Botón de refrescar */}
            <div className="flex items-end">
              <Button
                onClick={loadObrasSociales}
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
              </div>
            </div>
          </div>
        )}

        {/* Tabla de obras sociales */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-darkmode-400">
              <thead className="bg-gray-50 dark:bg-darkmode-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Obra Social
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-darkmode-600 divide-y divide-gray-200 dark:divide-darkmode-400">
                {filteredObrasSociales.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                      <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay obras sociales</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                        {searchTerm || statusFilter !== 'all'
                          ? 'No se encontraron obras sociales con los filtros aplicados.'
                          : 'Comience agregando una nueva obra social.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredObrasSociales.map((obra) => (
                    <tr key={obra.healthcareProviderId} className="hover:bg-gray-50 dark:hover:bg-darkmode-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {obra.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-slate-400">
                            ID: {obra.healthcareProviderId}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          obra.status === 'ACTIVA'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {obra.status === 'ACTIVA' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{obra.contactEmail || 'No especificado'}</div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">{obra.contactPhone || 'No especificado'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/admin/healthcare/obras-sociales/${obra.healthcareProviderId}`}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/healthcare/obras-sociales/${obra.healthcareProviderId}/edit`}
                            className="text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-300 p-1 rounded hover:bg-gray-50 dark:hover:bg-darkmode-700"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(obra.healthcareProviderId, obra.name)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
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
        {filteredObrasSociales.length > 0 && (
          <div className="text-sm text-gray-500 dark:text-slate-400 text-center">
            Mostrando {filteredObrasSociales.length} de {obrasSociales.length} obras sociales
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default ObrasSocialesPage; 