import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Phone, Building, Calendar, 
  Shield, Edit, Trash2, UserCheck, UserX, MapPin,
  CreditCard, Briefcase, Award, Stethoscope, Eye
} from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import LoadingSpinner from '../../../../shared/components/ui/LoadingSpinner';
import { useToast } from '../../../../shared/components/ui/ToastContainer';
import { useAdmin } from '../../../hooks/useAdmin';
import type { AdminUser } from '../../../../infrastructure/repositories/HttpAdminRepository';

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
}

const ProviderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();
  const { getProviderById, updateProvider, deleteProvider, loading: adminLoading } = useAdmin();

  const [provider, setProvider] = useState<ProviderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadProviderDetails();
    }
  }, [id]);

  const loadProviderDetails = async () => {
    setLoading(true);
    try {
      const providerData = await getProviderById(id!);
      if (providerData) {
        // Adaptar los datos de AdminUser a ProviderDetails
        const providerDetails: ProviderDetails = {
          ...providerData,
          updated_at: providerData.created_at, // Fallback si no hay updated_at
          email_verified: false, // Valor por defecto
          status: providerData.status || 'active'
        };
        setProvider(providerDetails);
      }
    } catch (error) {
      console.error('Error loading provider details:', error);
      showError('Error', 'No se pudieron cargar los detalles del proveedor');
    } finally {
      setLoading(false);
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
              onClick={() => navigate(`/admin/users/providers/${id}/edit`)}
              className="flex items-center"
              disabled={actionLoading}
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