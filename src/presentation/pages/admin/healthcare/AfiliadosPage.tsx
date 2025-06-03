import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Users,
  Activity,
  User,
  UserCheck,
  Loader
} from 'lucide-react';
import { Link } from 'react-router-dom';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';
import { useObfuscation } from '../../../../shared/contexts/ObfuscationContext';

interface Afiliado {
  id: string;
  affiliateNumber: string;
  affiliateStatus: string;
  creationDate: string;
  lastUpdate: string;
  cuil: string;
  cvu: string | null;
  documentType: string;
  documentNumber: string;
  documentCountry: string;
  gender: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  nationality: string;
  email: string;
  occupation: string | null;
  phone: string | null;
  picture: string | null;
  primaryAddressId: string | null;
  createdBy: string;
  updatedBy: string | null;
}

const AfiliadosPage: React.FC = () => {
  const { obfuscatedApiClient } = useObfuscation();
  const [afiliados, setAfiliados] = useState<Afiliado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [generoFilter, setGeneroFilter] = useState<string>('all');
  const [estadoFilter, setEstadoFilter] = useState<string>('all');

  // Cargar afiliados
  const loadAfiliados = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Cargando afiliados...');
      const data = await obfuscatedApiClient.get<Afiliado[]>('/v1/afiliados');
      console.log('📋 Afiliados cargados:', data);
      setAfiliados(data);
    } catch (err: any) {
      console.error('Error loading afiliados:', err);
      setError(err.message || 'Error al cargar los afiliados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAfiliados();
  }, []);

  // Calcular edad
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // Filtros y búsqueda
  const filteredAfiliados = afiliados.filter(afiliado => {
    const matchesSearch = 
      afiliado.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      afiliado.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      afiliado.affiliateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      afiliado.cuil.toLowerCase().includes(searchTerm.toLowerCase()) ||
      afiliado.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGenero = generoFilter === 'all' || afiliado.gender === generoFilter;
    const matchesEstado = estadoFilter === 'all' || afiliado.affiliateStatus.toLowerCase() === estadoFilter.toLowerCase();

    return matchesSearch && matchesGenero && matchesEstado;
  });

  // Estadísticas
  const stats = {
    total: afiliados.length,
    activos: afiliados.filter(a => a.affiliateStatus.toLowerCase() === 'active').length,
    masculino: afiliados.filter(a => a.gender === 'M').length,
    femenino: afiliados.filter(a => a.gender === 'F').length
  };

  // Manejar eliminación
  const handleDelete = async (id: string, firstName: string, lastName: string) => {
    if (!window.confirm(`¿Está seguro de eliminar al afiliado "${firstName} ${lastName}"?`)) {
      return;
    }

    try {
      console.log('🗑️ Eliminando afiliado:', id);
      await obfuscatedApiClient.delete(`/v1/afiliados/${id}`);
      console.log('✅ Afiliado eliminado exitosamente');
      await loadAfiliados();
    } catch (err: any) {
      console.error('Error deleting afiliado:', err);
      setError(err.message || 'Error al eliminar el afiliado');
    }
  };

  if (loading) {
    return (
      <BaseLayout title="Afiliados">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando afiliados...</span>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Afiliados">
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Afiliados</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">Gestión de afiliados del sistema ({stats.total} afiliados)</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={() => window.location.href = '/admin/healthcare/afiliados/create'}
              className="inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Afiliado
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
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
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">Activos</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{stats.activos}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">Masculino</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{stats.masculino}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-pink-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">Femenino</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{stats.femenino}</dd>
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
                  placeholder="Buscar afiliados..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro por género */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Género
              </label>
              <select
                value={generoFilter}
                onChange={(e) => setGeneroFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300 appearance-none"
              >
                <option value="all">Todos los géneros</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </select>
            </div>

            {/* Filtro por estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Estado
              </label>
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300 appearance-none"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>

            {/* Botón de refrescar */}
            <div className="flex items-end">
              <Button
                onClick={loadAfiliados}
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
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de afiliados */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-darkmode-400">
              <thead className="bg-gray-50 dark:bg-darkmode-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Afiliado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    N° Afiliado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Género/Edad
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
                {filteredAfiliados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                      <Users className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay afiliados</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                        {searchTerm || generoFilter !== 'all' || estadoFilter !== 'all'
                          ? 'No se encontraron afiliados con los filtros aplicados.'
                          : 'Comience agregando un nuevo afiliado.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredAfiliados.map((afiliado) => (
                    <tr key={afiliado.id} className="hover:bg-gray-50 dark:hover:bg-darkmode-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {afiliado.firstName} {afiliado.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-slate-400">
                            CUIL: {afiliado.cuil}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white font-mono">
                          {afiliado.affiliateNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {afiliado.gender === 'M' ? 'Masculino' : afiliado.gender === 'F' ? 'Femenino' : 'Otro'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">
                          {calculateAge(afiliado.birthDate)} años
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          afiliado.affiliateStatus.toLowerCase() === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {afiliado.affiliateStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{afiliado.email}</div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">{afiliado.phone || 'Sin teléfono'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/admin/healthcare/afiliados/${afiliado.id}`}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/healthcare/afiliados/${afiliado.id}/edit`}
                            className="text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-300 p-1 rounded hover:bg-gray-50 dark:hover:bg-darkmode-700"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(afiliado.id, afiliado.firstName, afiliado.lastName)}
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
        {filteredAfiliados.length > 0 && (
          <div className="text-sm text-gray-500 dark:text-slate-400 text-center">
            Mostrando {filteredAfiliados.length} de {afiliados.length} afiliados
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default AfiliadosPage; 