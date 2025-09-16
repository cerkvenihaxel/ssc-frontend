import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  UserCheck,
  Stethoscope,
  Activity,
  Heart,
  Loader,
  User,
  UserX
} from 'lucide-react';
import { Link } from 'react-router-dom';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';
import { ApiClient } from '../../../../infrastructure/http/ApiClient';
import { HttpMedicoRepository, type Medico, type Especialidad } from '../../../../infrastructure/repositories/HttpMedicoRepository';
import { getSpecialtyColorClasses, renderSpecialtyIcon } from '../../../../shared/utils/specialtyIcons';

const MedicosPage: React.FC = () => {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [especialidadFilter, setEspecialidadFilter] = useState<string>('all');

  // Initialize repository
  const apiClient = new ApiClient();
  const medicoRepository = new HttpMedicoRepository(apiClient);

  // Cargar médicos y especialidades
  const loadMedicos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await medicoRepository.getAllMedicos();
      setMedicos(data);
    } catch (err: any) {
      console.error('Error loading medicos:', err);
      setError(err.message || 'Error al cargar los médicos');
    }
  };

  const loadEspecialidades = async () => {
    try {
      const data = await medicoRepository.getAllEspecialidades();
      setEspecialidades(data);
    } catch (err: any) {
      console.error('Error loading especialidades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([loadMedicos(), loadEspecialidades()]);
  }, []);

  // Función para obtener nombre de especialidad
  const getEspecialidadName = (especialidadId: string) => {
    const especialidad = especialidades.find(e => e.especialidadId === especialidadId);
    return especialidad?.nombre || 'No especificada';
  };

  // Filtros y búsqueda
  const filteredMedicos = medicos.filter(medico => {
    const matchesSearch = 
      medico.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medico.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medico.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medico.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEspecialidad = especialidadFilter === 'all' || medico.especialidadId === especialidadFilter;

    return matchesSearch && matchesEspecialidad;
  });

  // Estadísticas
  const stats = {
    total: medicos.length,
    conTelefono: medicos.filter(m => m.phone).length,
    conFoto: medicos.filter(m => m.picture).length,
    especialidades: new Set(medicos.map(m => m.especialidadId)).size,
    conUsuario: medicos.filter(m => m.userId).length,
    usuariosActivos: medicos.filter(m => m.userId && m.userStatus === 'active').length,
    usuariosInactivos: medicos.filter(m => m.userId && m.userStatus !== 'active').length
  };

  // Manejar eliminación
  const handleDelete = async (id: string, firstName: string, lastName: string) => {
    if (!window.confirm(`¿Está seguro de eliminar al médico "Dr. ${firstName} ${lastName}"?`)) {
      return;
    }

    try {
      await medicoRepository.deleteMedico(id);
      await loadMedicos();
    } catch (err: any) {
      console.error('Error deleting medico:', err);
      setError(err.message || 'Error al eliminar el médico');
    }
  };

  if (loading) {
    return (
      <BaseLayout title="Médicos">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando médicos...</span>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Médicos">
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Médicos</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">Gestión de profesionales médicos del sistema ({stats.total} médicos)</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={() => window.location.href = '/admin/healthcare/medicos/create'}
              className="inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Médico
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Stethoscope className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">Total Médicos</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">Especialidades</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{stats.especialidades}</dd>
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
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">Usuarios Activos</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{stats.usuariosActivos}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserX className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">Sin Usuario/Inactivos</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{stats.total - stats.usuariosActivos}</dd>
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
                  placeholder="Buscar médicos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro por especialidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Especialidad
              </label>
              <select
                value={especialidadFilter}
                onChange={(e) => setEspecialidadFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300 appearance-none"
              >
                <option value="all">Todas las especialidades</option>
                {especialidades.map((especialidad) => (
                  <option key={especialidad.especialidadId} value={especialidad.especialidadId}>
                    {especialidad.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Botón de refrescar */}
            <div className="flex items-end">
              <Button
                onClick={loadMedicos}
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

        {/* Tabla de médicos */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-darkmode-400">
              <thead className="bg-gray-50 dark:bg-darkmode-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Médico
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Matrícula
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Especialidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Estado Usuario
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
                {filteredMedicos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                      <Stethoscope className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay médicos</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                        {searchTerm || especialidadFilter !== 'all'
                          ? 'No se encontraron médicos con los filtros aplicados.'
                          : 'Comience agregando un nuevo médico.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredMedicos.map((medico) => (
                    <tr key={medico.medicoId} className="hover:bg-gray-50 dark:hover:bg-darkmode-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {medico.picture ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={medico.picture}
                              alt={`Dr. ${medico.firstName} ${medico.lastName}`}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <Stethoscope className="h-6 w-6 text-gray-600" />
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              Dr. {medico.firstName} {medico.lastName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-slate-400">
                              {medico.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white font-mono">
                          {medico.matricula}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getSpecialtyColorClasses(getEspecialidadName(medico.especialidadId))}`}>
                          {renderSpecialtyIcon(getEspecialidadName(medico.especialidadId))}
                          {getEspecialidadName(medico.especialidadId)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {medico.userId ? (
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                              medico.userStatus === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : medico.userStatus === 'suspended'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {medico.userStatus === 'active' ? (
                                <>
                                  <UserCheck className="w-3 h-3 mr-1" />
                                  Activo
                                </>
                              ) : medico.userStatus === 'suspended' ? (
                                <>
                                  <User className="w-3 h-3 mr-1" />
                                  Suspendido
                                </>
                              ) : (
                                <>
                                  <UserX className="w-3 h-3 mr-1" />
                                  Inactivo
                                </>
                              )}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                            <UserX className="w-3 h-3 mr-1" />
                            Sin usuario
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{medico.phone || 'No especificado'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Ver detalles */}
                          <Link
                            to={`/admin/healthcare/medicos/${medico.medicoId}`}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {/* Editar */}
                          <Link
                            to={`/admin/healthcare/medicos/${medico.medicoId}/edit`}
                            className="text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-300 p-1 rounded hover:bg-gray-50 dark:hover:bg-darkmode-700"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* Eliminar */}
                          <button
                            onClick={() => handleDelete(medico.medicoId, medico.firstName, medico.lastName)}
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
        {filteredMedicos.length > 0 && (
          <div className="text-sm text-gray-500 dark:text-slate-400 text-center">
            Mostrando {filteredMedicos.length} de {medicos.length} médicos
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default MedicosPage; 