import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Stethoscope, Mail, Phone, Calendar, Building2, Loader, MapPin, Shield, User } from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import { ApiClient } from '../../../../infrastructure/http/ApiClient';
import { HttpMedicoRepository, type Medico, type Especialidad } from '../../../../infrastructure/repositories/HttpMedicoRepository';
import { type ObraSocial } from '../../../../infrastructure/repositories/HttpObraSocialRepository';
import { getSpecialtyColorClasses, renderSpecialtyIcon } from '../../../../shared/utils/specialtyIcons';

const MedicoDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [medico, setMedico] = useState<Medico | null>(null);
  const [especialidad, setEspecialidad] = useState<Especialidad | null>(null);
  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize repository
  const apiClient = new ApiClient();
  const medicoRepository = new HttpMedicoRepository(apiClient);

  // Función para verificar si una obra social está activa
  const isObraSocialActive = (status: string): boolean => {
    const normalizedStatus = status?.toLowerCase();
    return normalizedStatus === 'active' || normalizedStatus === 'activa';
  };

  useEffect(() => {
    const loadMedicoDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Cargar datos del médico
        const medicoData = await medicoRepository.getMedicoById(id);
        setMedico(medicoData);

        // Cargar especialidad
        if (medicoData.especialidadId) {
          try {
            const especialidades = await medicoRepository.getAllEspecialidades();
            const especialidadData = especialidades.find(e => e.especialidadId === medicoData.especialidadId);
            if (especialidadData) {
              setEspecialidad(especialidadData);
            }
          } catch (err) {
            console.error('Error loading especialidad:', err);
          }
        }

        // Cargar obras sociales asociadas
        try {
          const obrasSocialesIds = await medicoRepository.getObrasSocialesAssociated(id);
          const allObrasSociales = await medicoRepository.getAllObrasSociales();
          const asociadas = allObrasSociales.filter(os => obrasSocialesIds.includes(os.healthcareProviderId));
          setObrasSociales(asociadas);
        } catch (err) {
          console.error('Error loading obras sociales:', err);
        }
      } catch (err: any) {
        console.error('Error loading medico details:', err);
        setError(err.message || 'Error al cargar los datos del médico');
      } finally {
        setLoading(false);
      }
    };

    loadMedicoDetails();
  }, [id]);

  if (loading) {
    return (
      <BaseLayout title="Detalles del Médico">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando información del médico...</span>
        </div>
      </BaseLayout>
    );
  }

  if (error || !medico) {
    return (
      <BaseLayout title="Médico no encontrado">
        <div className="text-center py-12">
          <Stethoscope className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Médico no encontrado</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
            {error || 'El médico que busca no existe o ha sido eliminado.'}
          </p>
          <div className="mt-6">
            <Button
              onClick={() => navigate('/admin/healthcare/medicos')}
              variant="outline-primary"
            >
              Volver a la lista
            </Button>
          </div>
        </div>
      </BaseLayout>
    );
  }

  const fullName = `Dr. ${medico.firstName} ${medico.lastName}`;

  return (
    <BaseLayout title={fullName}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/admin/healthcare/medicos')}
              className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-darkmode-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{fullName}</h1>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Matrícula: {medico.matricula}
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate(`/admin/healthcare/medicos/${id}/edit`)}
            className="inline-flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>

        {/* Información principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Foto y información básica */}
          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <div className="text-center">
              {medico.picture ? (
                <img
                  className="h-32 w-32 rounded-full mx-auto object-cover"
                  src={medico.picture}
                  alt={fullName}
                />
              ) : (
                <div className="h-32 w-32 rounded-full mx-auto bg-gray-300 dark:bg-darkmode-700 flex items-center justify-center">
                  <Stethoscope className="h-16 w-16 text-gray-600 dark:text-slate-400" />
                </div>
              )}
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">{fullName}</h3>
              <div className="flex justify-center mt-2">
                {especialidad?.nombre ? (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSpecialtyColorClasses(especialidad.nombre)}`}>
                    {renderSpecialtyIcon(especialidad.nombre)}
                    {especialidad.nombre}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200">
                    <Stethoscope className="w-3 h-3 mr-1" />
                    Especialidad no especificada
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm text-gray-900 dark:text-white">{medico.email}</span>
              </div>
              {medico.phone && (
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900 dark:text-white">{medico.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Información profesional */}
          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Información Profesional</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Matrícula</dt>
                <dd className="text-sm text-gray-900 dark:text-white font-mono">{medico.matricula}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Especialidad</dt>
                <dd className="mt-1">
                  {especialidad?.nombre ? (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSpecialtyColorClasses(especialidad.nombre)}`}>
                      {renderSpecialtyIcon(especialidad.nombre)}
                      {especialidad.nombre}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200">
                      <Stethoscope className="w-3 h-3 mr-1" />
                      No especificada
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Email profesional</dt>
                <dd className="text-sm text-gray-900 dark:text-white">{medico.email}</dd>
              </div>
              {medico.phone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Teléfono</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">{medico.phone}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Estado del Usuario */}
          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Estado del Usuario</h3>
            {medico.userId ? (
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Estado de la cuenta</dt>
                  <dd>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      medico.userStatus === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : medico.userStatus === 'suspended'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {medico.userStatus === 'active' ? 'Activo' : 
                       medico.userStatus === 'suspended' ? 'Suspendido' : 'Inactivo'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Email verificado</dt>
                  <dd>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      medico.userEmailVerified
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {medico.userEmailVerified ? 'Verificado' : 'No verificado'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Último acceso</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {medico.userLastLogin 
                      ? new Date(medico.userLastLogin).toLocaleDateString('es-ES', {
                          year: 'numeric', month: 'long', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })
                      : 'Nunca'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Usuario desde</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {medico.userCreatedAt 
                      ? new Date(medico.userCreatedAt).toLocaleDateString('es-ES', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })
                      : 'No disponible'}
                  </dd>
                </div>
              </dl>
            ) : (
              <div className="text-center py-4">
                <div className="h-12 w-12 rounded-full mx-auto bg-gray-300 dark:bg-darkmode-700 flex items-center justify-center mb-3">
                  <User className="h-6 w-6 text-gray-400 dark:text-slate-500" />
                </div>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  No hay usuario asociado
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Información del sistema */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Información del Sistema</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Fecha de alta</dt>
              <dd className="text-sm text-gray-900 dark:text-white">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  {new Date(medico.creationDate).toLocaleDateString('es-ES')}
                </div>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Última actualización</dt>
              <dd className="text-sm text-gray-900 dark:text-white">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  {new Date(medico.lastUpdate).toLocaleDateString('es-ES')}
                </div>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">ID del sistema</dt>
              <dd className="text-sm text-gray-900 dark:text-white font-mono">{medico.medicoId}</dd>
            </div>
          </dl>
        </div>

        {/* Obras sociales asociadas */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
            <div className="flex items-center">
              <Shield className="w-6 h-6 text-gray-400 dark:text-slate-500 mr-3" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Obras Sociales Asociadas</h2>
            </div>
          </div>
          
          <div className="p-6">
            {(!obrasSociales || obrasSociales.length === 0) ? (
              <div className="text-center py-4">
                <Shield className="mx-auto h-8 w-8 text-gray-400 dark:text-slate-500" />
                <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                  No tiene obras sociales asociadas
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {obrasSociales.map((obra) => (
                  <div key={obra.healthcareProviderId} className="border border-gray-200 dark:border-darkmode-700 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{obra.name}</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        isObraSocialActive(obra.status)
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {isObraSocialActive(obra.status) ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      {obra.contactPhone && (
                        <div className="flex items-center text-xs text-gray-500 dark:text-slate-400">
                          <Phone className="w-3 h-3 mr-1" />
                          {obra.contactPhone}
                        </div>
                      )}
                      {obra.contactEmail && (
                        <div className="flex items-center text-xs text-gray-500 dark:text-slate-400">
                          <Mail className="w-3 h-3 mr-1" />
                          {obra.contactEmail}
                        </div>
                      )}
                      {obra.address && (
                        <div className="flex items-start text-xs text-gray-500 dark:text-slate-400">
                          <MapPin className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                          <span className="break-words">{obra.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default MedicoDetailsPage; 