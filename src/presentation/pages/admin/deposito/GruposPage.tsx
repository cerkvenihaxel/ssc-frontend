import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Package,
  FolderOpen,
  Filter,
  Loader,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';
import { useObfuscation } from '../../../../shared/contexts/ObfuscationContext';

interface GrupoArticulo {
  grupoId: string;
  nombre: string;
  descripcion: string | null;
  createdAt: string;
  updatedAt: string;
}

interface GrupoStats {
  total: number;
  withArticles: number;
  empty: number;
}

const GruposPage: React.FC = () => {
  const [grupos, setGrupos] = useState<GrupoArticulo[]>([]);
  const [filteredGrupos, setFilteredGrupos] = useState<GrupoArticulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'with-articles' | 'empty'>('all');
  const [stats, setStats] = useState<GrupoStats>({ total: 0, withArticles: 0, empty: 0 });

  const { obfuscatedApiClient, obfuscateUrl } = useObfuscation();

  // Cargar grupos
  useEffect(() => {
    const loadGrupos = async () => {
      try {
        setLoading(true);
        
        // Cargar todos los grupos para estadísticas
        const [allGrupos, gruposWithArticles, emptyGrupos] = await Promise.all([
          obfuscatedApiClient.get<GrupoArticulo[]>('/v1/deposito/grupos'),
          obfuscatedApiClient.get<GrupoArticulo[]>('/v1/deposito/grupos?withArticles=true'),
          obfuscatedApiClient.get<GrupoArticulo[]>('/v1/deposito/grupos?withArticles=false')
        ]);

        setGrupos(allGrupos);
        setStats({
          total: allGrupos.length,
          withArticles: gruposWithArticles.length,
          empty: emptyGrupos.length
        });
      } catch (error) {
        console.error('Error loading grupos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGrupos();
  }, [obfuscatedApiClient]);

  // Filtrar grupos
  useEffect(() => {
    let filtered = grupos;

    // Filtro por tipo
    if (filterType === 'with-articles') {
      // En un escenario real, esto vendría del backend
      // Por ahora, mostramos todos ya que no tenemos información de artículos asociados
    } else if (filterType === 'empty') {
      // Similar al anterior
    }

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(grupo =>
        grupo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (grupo.descripcion && grupo.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredGrupos(filtered);
  }, [grupos, searchTerm, filterType]);

  const handleDeleteGrupo = async (grupoId: string, nombre: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el grupo "${nombre}"?`)) {
      return;
    }

    try {
      await obfuscatedApiClient.delete(`/v1/deposito/grupos/${grupoId}`);
      
      // Actualizar la lista local
      const updatedGrupos = grupos.filter(g => g.grupoId !== grupoId);
      setGrupos(updatedGrupos);
      
      // Actualizar stats
      setStats(prev => ({
        ...prev,
        total: prev.total - 1
      }));
    } catch (error) {
      console.error('Error deleting grupo:', error);
      alert('Error al eliminar el grupo. Por favor, inténtalo de nuevo.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <BaseLayout title="Grupos de Artículos">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-slate-400">Cargando grupos...</span>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Grupos de Artículos">
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Grupos de Artículos</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              Gestión de grupos para organizar artículos ({stats.total} grupos)
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={() => window.location.href = '/admin/deposito/grupos/create'}
              className="inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Grupo
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-darkmode-600 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FolderOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                      Total de Grupos
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                      {stats.total}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-darkmode-600 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                      Con Artículos
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                      {stats.withArticles}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-darkmode-600 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                      Vacíos
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                      {stats.empty}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro por tipo */}
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300"
              >
                <option value="all">Todos los grupos</option>
                <option value="with-articles">Con artículos</option>
                <option value="empty">Vacíos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de grupos */}
        <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Grupos ({filteredGrupos.length})
            </h3>
          </div>

          {filteredGrupos.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                {searchTerm || filterType !== 'all' ? 'No se encontraron grupos' : 'No hay grupos'}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                {searchTerm || filterType !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Comienza creando tu primer grupo de artículos'
                }
              </p>
              {!searchTerm && filterType === 'all' && (
                <div className="mt-6">
                  <Button
                    onClick={() => window.location.href = '/admin/deposito/grupos/create'}
                    className="inline-flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Grupo
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-darkmode-700">
                <thead className="bg-gray-50 dark:bg-darkmode-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Creado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Última actualización
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-darkmode-600 divide-y divide-gray-200 dark:divide-darkmode-700">
                  {filteredGrupos.map((grupo) => (
                    <tr key={grupo.grupoId} className="hover:bg-gray-50 dark:hover:bg-darkmode-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FolderOpen className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {grupo.nombre}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-slate-300">
                          {grupo.descripcion || (
                            <span className="text-gray-400 italic">Sin descripción</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        {formatDate(grupo.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        {formatDate(grupo.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={obfuscateUrl(`/admin/deposito/grupos/${grupo.grupoId}`)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={obfuscateUrl(`/admin/deposito/grupos/${grupo.grupoId}/edit`)}
                            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteGrupo(grupo.grupoId, grupo.nombre)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </BaseLayout>
  );
};

export default GruposPage; 