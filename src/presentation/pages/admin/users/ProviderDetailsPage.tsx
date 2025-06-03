import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Phone, Building, Calendar, 
  Shield, Edit, Trash2, UserCheck, UserX, MapPin,
  CreditCard, Briefcase, Award, Eye, FileText, Plus, Stethoscope
} from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import LoadingSpinner from '../../../../shared/components/ui/LoadingSpinner';
import { useToast } from '../../../../shared/components/ui/ToastContainer';
import { useAdmin } from '../../../hooks/useAdmin';
import { getSpecialtyIcon, getSpecialtyColorClasses, renderSpecialtyIcon } from '../../../../shared/utils/specialtyIcons';
import type { AdminUser, Especialidad } from '../../../../infrastructure/repositories/HttpAdminRepository';
import { useObfuscation } from '../../../../shared/contexts/ObfuscationContext';

interface ProviderDetails extends AdminUser {
  updated_at?: string;
  last_login?: string;
  email_verified?: boolean;
  // Información específica de proveedor
  provider_info?: {
    provider_name: string;
    provider_type: string;
    cuit: string;
    contact_name: string;
    contact_phone: string;
    contact_email: string;
  };
  // Especialidades directas del proveedor
  specialties?: string[]; // IDs de especialidades
}

const ProviderDetailsPage: React.FC = () => {
  // Usar useParams directo - el obfuscatedApiClient se encarga automáticamente de la desofuscación
  const { id } = useParams<{ id: string }>();
  const { obfuscateUrl } = useObfuscation();

  console.log('[ProviderDetailsPage] Raw ID from params:', id);
  console.log('[ProviderDetailsPage] ID is UUID?:', id ? /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id) : false);

  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();
  const { getProviderById, updateProvider, deleteProvider, getAllEspecialidades, getProviderDetailsById, loading: adminLoading } = useAdmin();

  const [provider, setProvider] = useState<ProviderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);

  useEffect(() => {
    if (id) {
      console.log('[ProviderDetailsPage] Starting to load provider details for ID:', id);
      loadProviderDetails();
      loadEspecialidades();
    } else {
      navigate('/admin/users/providers');
    }
  }, [id]);

  const loadProviderDetails = async () => {
    setLoading(true);
    try {
      console.log('[ProviderDetailsPage] Calling getProviderById with ID:', id);
      
      // Intentar ambos endpoints para comparar
      const [providerData, directProviderData] = await Promise.allSettled([
        getProviderById(id!),
        getProviderDetailsById(id!)
      ]);

      console.log('Admin user endpoint result:', providerData);
      console.log('Direct provider endpoint result:', directProviderData);

      // Usar los datos del endpoint que tenga mejor información
      let finalProviderData = null;

      if (providerData.status === 'fulfilled' && providerData.value) {
        finalProviderData = providerData.value;
        console.log('Using admin user endpoint data');
      }

      // Si el endpoint directo también funciona, combinar la información
      if (directProviderData.status === 'fulfilled' && directProviderData.value) {
        console.log('Direct provider data structure:', JSON.stringify(directProviderData.value, null, 2));
        
        if (finalProviderData) {
          // Combinar ambas respuestas, dando prioridad a las especialidades del endpoint directo
          finalProviderData = {
            ...finalProviderData,
            specialties: (directProviderData.value as any).specialties || (finalProviderData as any).specialties
          };
        } else {
          finalProviderData = directProviderData.value;
        }
      }

      if (finalProviderData) {
        console.log('Provider data keys:', Object.keys(finalProviderData));
        console.log('Specialties found:', (finalProviderData as any).specialties);
      }
      
      if (finalProviderData) {
        // Adaptar los datos de AdminUser a ProviderDetails
        const providerDetails: ProviderDetails = {
          ...finalProviderData,
          updated_at: finalProviderData.created_at, // Fallback si no hay updated_at
          email_verified: false, // Valor por defecto
          status: finalProviderData.status || 'active',
          // Especialidades del proveedor (directo o desde provider_info)
          specialties: (finalProviderData as any).specialties || (finalProviderData as any).provider_info?.specialties || [],
          // Intentar extraer provider_info de diferentes ubicaciones posibles
          provider_info: (finalProviderData as any).provider_info || {
            provider_name: (finalProviderData as any).provider_name || 'No especificado',
            provider_type: (finalProviderData as any).provider_type || 'No especificado',
            cuit: (finalProviderData as any).cuit || 'No especificado',
            contact_name: (finalProviderData as any).contact_name || 'No especificado',
            contact_phone: (finalProviderData as any).contact_phone || 'No especificado',
            contact_email: (finalProviderData as any).contact_email || 'No especificado'
          }
        };
        console.log('Processed provider details:', providerDetails);
        console.log('Provider specialties:', providerDetails.specialties);
        setProvider(providerDetails);
      }
    } catch (error) {
      console.error('Error loading provider details:', error);
      showError('Error', 'No se pudieron cargar los detalles del proveedor');
    } finally {
      setLoading(false);
    }
  };

  const loadEspecialidades = async () => {
    try {
      const especialidadesData = await getAllEspecialidades();
      if (especialidadesData) {
        setEspecialidades(especialidadesData);
      }
    } catch (error) {
      console.error('Error loading especialidades:', error);
    }
  };

  const handleToggleStatus = async () => {
    if (!provider) return;
    
    const newStatus = provider.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'activar' : 'desactivar';
    
    if (!window.confirm(`¿Estás seguro de que quieres ${action} este proveedor?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const result = await updateProvider(id!, { status: newStatus });
      if (result) {
        setProvider({ ...provider, status: newStatus });
        showSuccess('Estado actualizado', `Proveedor ${action}do correctamente`);
      }
    } catch (error: any) {
      console.error('Error updating provider status:', error);
      
      let errorTitle = 'Error al cambiar estado';
      let errorMessage = `No se pudo ${action} el proveedor`;
      
      if (error.status === 404) {
        errorTitle = 'Proveedor no encontrado';
        errorMessage = 'El proveedor que intentas modificar no existe o fue eliminado.';
      } else if (error.status === 403) {
        errorTitle = 'Acceso denegado';
        errorMessage = 'No tienes permisos suficientes para cambiar el estado del proveedor.';
      } else if (error.status === 0) {
        errorTitle = 'Error de conexión';
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      showError(errorTitle, errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProvider = async () => {
    if (!provider) return;
    
    if (!window.confirm('¿Estás seguro de que quieres eliminar este proveedor? Esta acción no se puede deshacer.')) {
      return;
    }

    setActionLoading(true);
    try {
      await deleteProvider(id!);
      showSuccess('Proveedor eliminado', 'El proveedor ha sido eliminado correctamente');
      navigate('/admin/users/providers');
    } catch (error: any) {
      console.error('Error deleting provider:', error);
      
      let errorTitle = 'Error al eliminar';
      let errorMessage = 'No se pudo eliminar el proveedor';
      
      if (error.status === 404) {
        errorTitle = 'Proveedor no encontrado';
        errorMessage = 'El proveedor que intentas eliminar no existe o ya fue eliminado.';
      } else if (error.status === 403) {
        errorTitle = 'Acceso denegado';
        errorMessage = 'No tienes permisos suficientes para eliminar proveedores.';
      } else if (error.status === 409) {
        errorTitle = 'No se puede eliminar';
        errorMessage = 'El proveedor tiene datos asociados que impiden su eliminación. Contacta al administrador.';
      } else if (error.status === 0) {
        errorTitle = 'Error de conexión';
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      showError(errorTitle, errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const classes = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    return status === 'active' 
      ? `${classes} bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200`
      : `${classes} bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200`;
  };

  const getRoleBadge = (roleName: string) => {
    const classes = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    return `${classes} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200`;
  };

  const handleEditNavigation = () => {
    if (id) {
      navigate(`/admin/users/providers/${id}/edit`);
    }
  };

  if (loading) {
    return (
      <BaseLayout title="Detalles del Proveedor">
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </BaseLayout>
    );
  }

  if (!provider) {
    return (
      <BaseLayout title="Proveedor no encontrado">
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-slate-400 mb-4">
            No se pudo encontrar el proveedor solicitado
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/admin/users/providers')}
          >
            Volver a la lista
          </Button>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title={`Proveedor: ${provider.nombre || 'Sin nombre'}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline-primary"
              onClick={() => navigate('/admin/users/providers')}
              className="flex items-center"
              disabled={actionLoading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {provider.nombre || 'Sin nombre'}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                Detalles completos del proveedor
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline-primary"
              onClick={handleEditNavigation}
              className="flex items-center"
              disabled={actionLoading || !id}
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            
            <Button
              variant={provider.status === 'active' ? 'warning' : 'success'}
              onClick={handleToggleStatus}
              className="flex items-center"
              disabled={actionLoading}
            >
              {provider.status === 'active' ? (
                <>
                  <UserX className="w-4 h-4 mr-2" />
                  Desactivar
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Activar
                </>
              )}
            </Button>
            
            <Button
              variant="danger"
              onClick={handleDeleteProvider}
              className="flex items-center"
              disabled={actionLoading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
          <div className="flex items-center mb-6">
            <User className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Información Básica
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Email
              </label>
              <div className="flex items-center text-sm text-gray-900 dark:text-white">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                {provider.email || 'No especificado'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Rol
              </label>
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-gray-400" />
                <span className={getRoleBadge(provider.role?.role_name || 'Sin usuario asociado')}>
                  {provider.role?.role_name || 'Sin usuario asociado'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Estado
              </label>
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-2 text-gray-400" />
                <span className={getStatusBadge(provider.status || 'active')}>
                  {(provider.status || 'active') === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Fecha de Creación
              </label>
              <div className="flex items-center text-sm text-gray-900 dark:text-white">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                {new Date(provider.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Última Actualización
              </label>
              <div className="flex items-center text-sm text-gray-900 dark:text-white">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                {provider.updated_at ? new Date(provider.updated_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'No disponible'}
              </div>
            </div>
          </div>
        </div>

        {/* Provider Information */}
        {provider.provider_info && (
          <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
            <div className="flex items-center mb-6">
              <Building className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Información del Proveedor
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Nombre del Proveedor
                </label>
                <div className="text-sm text-gray-900 dark:text-white">
                  {provider.provider_info.provider_name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Tipo de Proveedor
                </label>
                <div className="text-sm text-gray-900 dark:text-white">
                  {provider.provider_info.provider_type}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  CUIT
                </label>
                <div className="flex items-center text-sm text-gray-900 dark:text-white">
                  <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                  {provider.provider_info.cuit}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Contacto
                </label>
                <div className="text-sm text-gray-900 dark:text-white">
                  {provider.provider_info.contact_name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Teléfono
                </label>
                <div className="flex items-center text-sm text-gray-900 dark:text-white">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  {provider.provider_info.contact_phone}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Email de Contacto
                </label>
                <div className="flex items-center text-sm text-gray-900 dark:text-white">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  {provider.provider_info.contact_email}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Especialidades del Proveedor */}
        <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
          <div className="flex items-center mb-6">
            <FileText className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Especialidades del Proveedor
            </h3>
          </div>

          <div className="space-y-4">
            {provider.specialties && provider.specialties.length > 0 ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Especialidades Registradas ({provider.specialties.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {provider.specialties.map(especialidadId => {
                    const especialidad = especialidades.find(e => e.especialidadId === especialidadId);
                    return especialidad ? (
                      <span
                        key={especialidadId}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getSpecialtyColorClasses(especialidad.nombre)}`}
                      >
                        {renderSpecialtyIcon(especialidad.nombre)}
                        {especialidad.nombre}
                      </span>
                    ) : (
                      <span
                        key={especialidadId}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200"
                      >
                        Especialidad no encontrada (ID: {especialidadId})
                      </span>
                    );
                  })}
                </div>
                <div className="text-sm text-gray-500 dark:text-slate-400 mt-2">
                  <p>
                    Las especialidades indican los tipos de servicios médicos que puede proveer este proveedor.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Stethoscope className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  Sin especialidades asignadas
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  Este proveedor no tiene especialidades médicas registradas.
                </p>
                <div className="mt-4">
                  <Button
                    variant="outline-primary"
                    onClick={() => navigate(`/admin/users/providers/${id}/edit`)}
                    className="inline-flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Especialidades
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Email Verification Status */}
        <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Estado de Verificación
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                Estado de verificación del email del proveedor
              </p>
            </div>
            <div className="flex items-center">
              <span className={provider.email_verified 
                ? "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                : "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200"
              }>
                {provider.email_verified ? 'Email Verificado' : 'Email Pendiente de Verificación'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default ProviderDetailsPage; 