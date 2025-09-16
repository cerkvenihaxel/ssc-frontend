import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Building, User, Mail, Phone, MapPin, Calendar, Shield } from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import { useToast } from '../../../../shared/components/ui/ToastContainer';
import { useAdmin } from '../../../hooks/useAdmin';
import type { AdminEffector } from '../../../../infrastructure/repositories/HttpAdminRepository';

const EffectorDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { getEffectorById, deleteEffector } = useAdmin();

  const [effector, setEffector] = useState<AdminEffector | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const loadEffector = async () => {
    if (!id) {
      showError('Error', 'ID de efector no válido');
      navigate('/admin/users/effectors');
      return;
    }

    setLoading(true);
    try {
      const data = await getEffectorById(id);
      if (data) {
        setEffector(data);
      }
    } catch (error: any) {
      console.error('Error loading effector:', error);
      
      if (error.status === 404) {
        showError('Efector no encontrado', 'El efector solicitado no existe o ha sido eliminado');
        navigate('/admin/users/effectors');
      } else {
        showError('Error', 'No se pudo cargar la información del efector');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEffector();
  }, [id]);

  const handleDelete = async () => {
    if (!effector) return;

    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar al efector ${effector.effector_info?.effector_name || effector.nombre}? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteEffector(effector.user_id);
      showSuccess('Efector eliminado', 'El efector ha sido eliminado correctamente');
      navigate('/admin/users/effectors');
    } catch (error: any) {
      console.error('Error deleting effector:', error);
      
      let errorTitle = 'Error al eliminar';
      let errorMessage = 'No se pudo eliminar el efector';
      
      if (error.status === 404) {
        errorTitle = 'Efector no encontrado';
        errorMessage = 'El efector ya no existe o ha sido eliminado previamente.';
      } else if (error.status === 403) {
        errorTitle = 'Acceso denegado';
        errorMessage = 'No tienes permisos suficientes para eliminar este efector.';
      } else if (error.status === 0) {
        errorTitle = 'Error de conexión';
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      }
      
      showError(errorTitle, errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
          <Shield className="w-3 h-3 mr-1" />
          Activo
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
          <Shield className="w-3 h-3 mr-1" />
          Inactivo
        </span>
      );
    }
  };

  if (loading) {
    return (
      <BaseLayout title="Cargando...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </BaseLayout>
    );
  }

  if (!effector) {
    return (
      <BaseLayout title="Efector no encontrado">
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Efector no encontrado
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            El efector solicitado no existe o ha sido eliminado.
          </p>
          <div className="mt-6">
            <Button
              variant="primary"
              onClick={() => navigate('/admin/users/effectors')}
            >
              Volver a Efectores
            </Button>
          </div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title={`Efector: ${effector.effector_info?.effector_name || effector.nombre}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline-primary"
              onClick={() => navigate('/admin/users/effectors')}
              className="flex items-center"
              disabled={deleting}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {effector.effector_info?.effector_name || effector.nombre}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                Información detallada del efector
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline-primary"
              onClick={() => navigate(`/admin/users/effectors/${effector.user_id}/edit`)}
              className="flex items-center"
              disabled={deleting}
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información Básica */}
          <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
            <div className="flex items-center mb-6">
              <User className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Información Básica
              </h3>
            </div>

            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Email</dt>
                <dd className="mt-1 flex items-center text-sm text-gray-900 dark:text-white">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  {effector.email}
                  {effector.email_verified ? (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      Verificado
                    </span>
                  ) : (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                      No verificado
                    </span>
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Nombre completo</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{effector.nombre}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Rol</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{effector.role.role_name}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Estado</dt>
                <dd className="mt-1">{getStatusBadge(effector.status)}</dd>
              </div>
            </dl>
          </div>

          {/* Información del Efector */}
          <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
            <div className="flex items-center mb-6">
              <Building className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Información del Efector
              </h3>
            </div>

            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Nombre del Efector</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {effector.effector_info?.effector_name || 'No especificado'}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Tipo de Efector</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {effector.effector_info?.effector_type || 'No especificado'}
                </dd>
              </div>

              {effector.effector_info?.cuit && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">CUIT</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {effector.effector_info.cuit}
                  </dd>
                </div>
              )}

              {effector.effector_info?.contact_name && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Persona de Contacto</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {effector.effector_info.contact_name}
                  </dd>
                </div>
              )}

              {effector.effector_info?.contact_phone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Teléfono</dt>
                  <dd className="mt-1 flex items-center text-sm text-gray-900 dark:text-white">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {effector.effector_info.contact_phone}
                  </dd>
                </div>
              )}

              {effector.effector_info?.contact_email && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Email de Contacto</dt>
                  <dd className="mt-1 flex items-center text-sm text-gray-900 dark:text-white">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    {effector.effector_info.contact_email}
                  </dd>
                </div>
              )}

              {effector.effector_info?.address && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Dirección</dt>
                  <dd className="mt-1 flex items-start text-sm text-gray-900 dark:text-white">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      {effector.effector_info.address.calle} {effector.effector_info.address.numero}<br />
                      {effector.effector_info.address.ciudad}, {effector.effector_info.address.provincia}<br />
                      CP: {effector.effector_info.address.codigo_postal}
                    </div>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Información del Sistema */}
        <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
          <div className="flex items-center mb-6">
            <Calendar className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Información del Sistema
            </h3>
          </div>

          <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Fecha de Creación</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {formatDate(effector.created_at)}
              </dd>
            </div>

            {effector.updated_at && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Última Actualización</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {formatDate(effector.updated_at)}
                </dd>
              </div>
            )}

            {effector.last_login && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Último Acceso</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {formatDate(effector.last_login)}
                </dd>
              </div>
            )}

            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Estado del Email</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {effector.email_verified ? 'Verificado' : 'No verificado'}
              </dd>
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
            {(!effector.healthcareProviders || effector.healthcareProviders.length === 0) ? (
              <div className="text-center py-4">
                <Shield className="mx-auto h-8 w-8 text-gray-400 dark:text-slate-500" />
                <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                  No tiene obras sociales asociadas
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {effector.healthcareProviders.map((obra) => (
                  <div key={obra.healthcareProviderId} className="border border-gray-200 dark:border-darkmode-700 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{obra.name}</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        obra.status?.toLowerCase() === 'active' || obra.status?.toLowerCase() === 'activa'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {obra.status?.toLowerCase() === 'active' || obra.status?.toLowerCase() === 'activa' ? 'Activa' : 'Inactiva'}
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

export default EffectorDetailsPage; 