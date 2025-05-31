import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, User, Mail, Phone, Building, Calendar, Shield, AlertCircle, MapPin } from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import LoadingSpinner from '../../../../shared/components/ui/LoadingSpinner';
import { useToast } from '../../../../shared/components/ui/ToastContainer';
import { useAdmin } from '../../../hooks/useAdmin';
import type { AdminAuditor } from '../../../../infrastructure/repositories/HttpAdminRepository';

const AuditorDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { getAuditorById, deleteAuditor, loading } = useAdmin();

  const [auditor, setAuditor] = useState<AdminAuditor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadAuditorData();
    }
  }, [id]);

  const loadAuditorData = async () => {
    try {
      const auditorData = await getAuditorById(id!);
      setAuditor(auditorData);
    } catch (error: any) {
      console.error('Error loading auditor data:', error);
      
      let errorTitle = 'Error al cargar';
      let errorMessage = 'No se pudieron cargar los datos del auditor';
      
      if (error.status === 404) {
        errorTitle = 'Auditor no encontrado';
        errorMessage = 'El auditor que buscas no existe o fue eliminado.';
      } else if (error.status === 403) {
        errorTitle = 'Acceso denegado';
        errorMessage = 'No tienes permisos para ver este auditor.';
      } else if (error.status === 0) {
        errorTitle = 'Error de conexión';
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      showError(errorTitle, errorMessage);
      navigate('/admin/users/auditors');
    }
  };

  const handleDelete = async () => {
    if (!auditor) return;
    
    if (!window.confirm(`¿Estás seguro de que quieres eliminar al auditor ${auditor.nombre}? Esta acción no se puede deshacer.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAuditor(auditor.user_id);
      showSuccess('Auditor eliminado', `El auditor ${auditor.nombre} ha sido eliminado correctamente`);
      navigate('/admin/users/auditors');
    } catch (error: any) {
      console.error('Error deleting auditor:', error);
      
      let errorTitle = 'Error al eliminar';
      let errorMessage = 'No se pudo eliminar el auditor';
      
      if (error.status === 404) {
        errorTitle = 'Auditor no encontrado';
        errorMessage = 'El auditor que intentas eliminar no existe o ya fue eliminado.';
      } else if (error.status === 403) {
        errorTitle = 'Acceso denegado';
        errorMessage = 'No tienes permisos suficientes para eliminar este auditor.';
      } else if (error.status === 409) {
        errorTitle = 'No se puede eliminar';
        errorMessage = 'El auditor tiene información asociada que impide su eliminación.';
      } else if (error.status === 0) {
        errorTitle = 'Error de conexión';
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      showError(errorTitle, errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const classes = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";
    return status === 'active' 
      ? `${classes} bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200`
      : `${classes} bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200`;
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

  if (loading || !auditor) {
    return (
      <BaseLayout title="Cargando Auditor">
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title={`Auditor: ${auditor.nombre || 'Sin nombre'}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline-primary"
              onClick={() => navigate('/admin/users/auditors')}
              className="flex items-center"
              disabled={isDeleting}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Auditores
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {auditor.nombre || 'Sin nombre'}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                Información detallada del auditor
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline-primary"
              onClick={() => navigate(`/admin/users/auditors/${auditor.user_id}/edit`)}
              className="flex items-center"
              disabled={isDeleting}
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </div>

        {/* Status Alert */}
        {auditor.status === 'inactive' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <div className="text-red-800 dark:text-red-200">
                <strong>Auditor Inactivo:</strong> Este auditor está marcado como inactivo y no puede acceder al sistema.
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Básica */}
            <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
              <div className="flex items-center mb-6">
                <User className="w-5 h-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Información Básica
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </label>
                  <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-darkmode-800 rounded-md px-3 py-2">
                    {auditor.email || 'No especificado'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Nombre Completo
                  </label>
                  <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-darkmode-800 rounded-md px-3 py-2">
                    {auditor.nombre || 'No especificado'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    <Shield className="w-4 h-4 inline mr-1" />
                    Rol
                  </label>
                  <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-darkmode-800 rounded-md px-3 py-2">
                    {auditor.role?.role_name || 'No especificado'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Estado
                  </label>
                  <div>
                    <span className={getStatusBadge(auditor.status)}>
                      {auditor.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Información Específica del Auditor */}
            <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
              <div className="flex items-center mb-6">
                <Building className="w-5 h-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Información del Auditor
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Nombre
                  </label>
                  <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-darkmode-800 rounded-md px-3 py-2">
                    {auditor.auditor_info?.first_name || 'No especificado'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Apellido
                  </label>
                  <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-darkmode-800 rounded-md px-3 py-2">
                    {auditor.auditor_info?.last_name || 'No especificado'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Teléfono
                  </label>
                  <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-darkmode-800 rounded-md px-3 py-2">
                    {auditor.auditor_info?.phone || 'No especificado'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    <Building className="w-4 h-4 inline mr-1" />
                    Departamento
                  </label>
                  <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-darkmode-800 rounded-md px-3 py-2">
                    {auditor.auditor_info?.department || 'No especificado'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    ID de Empleado
                  </label>
                  <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-darkmode-800 rounded-md px-3 py-2">
                    {auditor.auditor_info?.employee_id || 'No especificado'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Información del Sistema */}
            <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Información del Sistema
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Fecha de Creación
                  </label>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {formatDate(auditor.created_at)}
                  </div>
                </div>

                {auditor.updated_at && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Última Actualización
                    </label>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatDate(auditor.updated_at)}
                    </div>
                  </div>
                )}

                {auditor.last_login && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Último Acceso
                    </label>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatDate(auditor.last_login)}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Email Verificado
                  </label>
                  <div className="text-sm">
                    <span className={auditor.email_verified 
                      ? "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                      : "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200"
                    }>
                      {auditor.email_verified ? 'Verificado' : 'Pendiente'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    ID de Usuario
                  </label>
                  <div className="text-xs text-gray-600 dark:text-slate-400 font-mono bg-gray-50 dark:bg-darkmode-800 rounded px-2 py-1">
                    {auditor.user_id}
                  </div>
                </div>
              </div>
            </div>

            {/* Permisos */}
            {auditor.auditor_info?.permissions && auditor.auditor_info.permissions.length > 0 && (
              <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Shield className="w-5 h-5 text-gray-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Permisos Especiales
                  </h3>
                </div>
                
                <div className="space-y-2">
                  {auditor.auditor_info.permissions.map((permission, index) => (
                    <div key={index} className="inline-flex items-center px-3 py-1 rounded-md text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 mr-2 mb-2">
                      {permission}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Acciones Rápidas */}
            <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Acciones Rápidas
              </h3>
              
              <div className="space-y-3">
                <Button
                  variant="outline-primary"
                  onClick={() => navigate(`/admin/users/auditors/${auditor.user_id}/edit`)}
                  className="w-full flex items-center justify-center"
                  disabled={isDeleting}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Auditor
                </Button>
                
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? 'Eliminando...' : 'Eliminar Auditor'}
                </Button>
              </div>
            </div>
          </div>
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
            {(!auditor.healthcareProviders || auditor.healthcareProviders.length === 0) ? (
              <div className="text-center py-4">
                <Shield className="mx-auto h-8 w-8 text-gray-400 dark:text-slate-500" />
                <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                  No tiene obras sociales asociadas
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {auditor.healthcareProviders.map((obra) => (
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

export default AuditorDetailsPage; 