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

interface UserDetails extends AdminUser {
  updated_at?: string;
  last_login?: string;
  email_verified?: boolean;
  // Información específica por rol
  provider_info?: {
    provider_name: string;
    provider_type: string;
    cuit: string;
    contact_name: string;
    contact_phone: string;
    contact_email: string;
  };
  effector_info?: {
    effector_name: string;
    effector_type: string;
    cuit?: string;
    contact_name?: string;
    contact_phone?: string;
    contact_email?: string;
    address?: any;
  };
  auditor_info?: {
    first_name: string;
    last_name: string;
    phone: string;
    department?: string;
    employee_id?: string;
    permissions?: string[];
  };
  medico_info?: {
    matricula: string;
    especialidad_id: string;
    first_name: string;
    last_name: string;
    phone: string;
    picture?: string;
    healthcare_providers?: string[];
  };
}

const UserDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();
  const { getUserById, updateUser, deleteUser, loading: adminLoading } = useAdmin();

  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadUserDetails();
    }
  }, [id]);

  const loadUserDetails = async () => {
    setLoading(true);
    try {
      const userData = await getUserById(id!);
      if (userData) {
        // Adaptar los datos de AdminUser a UserDetails
        const userDetails: UserDetails = {
          ...userData,
          updated_at: userData.created_at, // Fallback si no hay updated_at
          email_verified: false, // Valor por defecto
          status: userData.status || 'active'
        };
        setUser(userDetails);
      }
    } catch (error) {
      console.error('Error loading user details:', error);
      showError('Error', 'No se pudieron cargar los detalles del usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'activar' : 'desactivar';
    
    if (!window.confirm(`¿Estás seguro de que quieres ${action} este usuario?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const result = await updateUser(user.user_id, { status: newStatus });
      if (result) {
        setUser({ ...user, status: newStatus });
        showSuccess('Estado actualizado', `Usuario ${action}do correctamente`);
      }
    } catch (error) {
      showError('Error', `No se pudo ${action} el usuario`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    setActionLoading(true);
    try {
      await deleteUser(user.user_id);
      showSuccess('Usuario eliminado', 'El usuario ha sido eliminado correctamente');
      navigate('/admin/users');
    } catch (error) {
      showError('Error', 'No se pudo eliminar el usuario');
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
    const roleColors = {
      'Administrador': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200',
      'Auditor': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
      'Efector': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
      'Proveedor': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
      'Médico': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-200',
      'Afiliado': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200',
    };
    return `${classes} ${roleColors[roleName as keyof typeof roleColors] || roleColors['Afiliado']}`;
  };

  if (loading) {
    return (
      <BaseLayout title="Detalles del Usuario">
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </BaseLayout>
    );
  }

  if (!user) {
    return (
      <BaseLayout title="Usuario no encontrado">
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-slate-400 mb-4">
            No se pudo encontrar el usuario solicitado
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/admin/users')}
          >
            Volver a la lista
          </Button>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title={`Usuario: ${user.nombre}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline-primary"
              onClick={() => navigate('/admin/users')}
              className="flex items-center"
              disabled={actionLoading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.nombre}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                Detalles completos del usuario
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline-primary"
              onClick={() => navigate(`/admin/users/${user.user_id}/edit`)}
              className="flex items-center"
              disabled={actionLoading}
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            
            <Button
              variant={user.status === 'active' ? 'warning' : 'success'}
              onClick={handleToggleStatus}
              className="flex items-center"
              disabled={actionLoading}
            >
              {user.status === 'active' ? (
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
              onClick={handleDeleteUser}
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
                {user.email}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Rol
              </label>
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-gray-400" />
                <span className={getRoleBadge(user.role.role_name)}>
                  {user.role.role_name}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Estado
              </label>
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-2 text-gray-400" />
                <span className={getStatusBadge(user.status || 'active')}>
                  {(user.status || 'active') === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Fecha de Creación
              </label>
              <div className="flex items-center text-sm text-gray-900 dark:text-white">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                {new Date(user.created_at).toLocaleDateString('es-ES', {
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
                {user.updated_at ? new Date(user.updated_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'No disponible'}
              </div>
            </div>

            {user.last_login && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Último Acceso
                </label>
                <div className="flex items-center text-sm text-gray-900 dark:text-white">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  {new Date(user.last_login).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Provider Information */}
        {user.role.role_name === 'Proveedor' && user.provider_info && (
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
                  {user.provider_info.provider_name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Tipo de Proveedor
                </label>
                <div className="text-sm text-gray-900 dark:text-white">
                  {user.provider_info.provider_type}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  CUIT
                </label>
                <div className="flex items-center text-sm text-gray-900 dark:text-white">
                  <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                  {user.provider_info.cuit}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Contacto
                </label>
                <div className="text-sm text-gray-900 dark:text-white">
                  {user.provider_info.contact_name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Teléfono
                </label>
                <div className="flex items-center text-sm text-gray-900 dark:text-white">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  {user.provider_info.contact_phone}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Email de Contacto
                </label>
                <div className="flex items-center text-sm text-gray-900 dark:text-white">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  {user.provider_info.contact_email}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Effector Information */}
        {user.role.role_name === 'Efector' && user.effector_info && (
          <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
            <div className="flex items-center mb-6">
              <Building className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Información del Efector
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Nombre del Efector
                </label>
                <div className="text-sm text-gray-900 dark:text-white">
                  {user.effector_info.effector_name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Tipo de Efector
                </label>
                <div className="text-sm text-gray-900 dark:text-white">
                  {user.effector_info.effector_type}
                </div>
              </div>

              {user.effector_info.cuit && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    CUIT
                  </label>
                  <div className="flex items-center text-sm text-gray-900 dark:text-white">
                    <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                    {user.effector_info.cuit}
                  </div>
                </div>
              )}

              {user.effector_info.contact_name && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Contacto
                  </label>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {user.effector_info.contact_name}
                  </div>
                </div>
              )}

              {user.effector_info.contact_phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Teléfono
                  </label>
                  <div className="flex items-center text-sm text-gray-900 dark:text-white">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {user.effector_info.contact_phone}
                  </div>
                </div>
              )}

              {user.effector_info.contact_email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Email de Contacto
                  </label>
                  <div className="flex items-center text-sm text-gray-900 dark:text-white">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    {user.effector_info.contact_email}
                  </div>
                </div>
              )}

              {user.effector_info.address && (
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Dirección
                  </label>
                  <div className="flex items-start text-sm text-gray-900 dark:text-white">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                    <div>
                      {user.effector_info.address.calle} {user.effector_info.address.numero}<br />
                      {user.effector_info.address.ciudad}, {user.effector_info.address.provincia}<br />
                      CP: {user.effector_info.address.codigo_postal}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Auditor Information */}
        {user.role.role_name === 'Auditor' && user.auditor_info && (
          <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
            <div className="flex items-center mb-6">
              <Award className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Información del Auditor
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Nombre
                </label>
                <div className="text-sm text-gray-900 dark:text-white">
                  {user.auditor_info.first_name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Apellido
                </label>
                <div className="text-sm text-gray-900 dark:text-white">
                  {user.auditor_info.last_name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Teléfono
                </label>
                <div className="flex items-center text-sm text-gray-900 dark:text-white">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  {user.auditor_info.phone}
                </div>
              </div>

              {user.auditor_info.department && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Departamento
                  </label>
                  <div className="flex items-center text-sm text-gray-900 dark:text-white">
                    <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                    {user.auditor_info.department}
                  </div>
                </div>
              )}

              {user.auditor_info.employee_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    ID Empleado
                  </label>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {user.auditor_info.employee_id}
                  </div>
                </div>
              )}

              {user.auditor_info.permissions && user.auditor_info.permissions.length > 0 && (
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Permisos Adicionales
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {user.auditor_info.permissions.map((permission, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Medico Information */}
        {user.role.role_name === 'Médico' && user.medico_info && (
          <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
            <div className="flex items-center mb-6">
              <Stethoscope className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Información del Médico
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Nombre
                </label>
                <div className="text-sm text-gray-900 dark:text-white">
                  {user.medico_info.first_name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Apellido
                </label>
                <div className="text-sm text-gray-900 dark:text-white">
                  {user.medico_info.last_name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Matrícula
                </label>
                <div className="flex items-center text-sm text-gray-900 dark:text-white">
                  <Award className="w-4 h-4 mr-2 text-gray-400" />
                  {user.medico_info.matricula}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Teléfono
                </label>
                <div className="flex items-center text-sm text-gray-900 dark:text-white">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  {user.medico_info.phone}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Especialidad ID
                </label>
                <div className="text-sm text-gray-900 dark:text-white">
                  {user.medico_info.especialidad_id}
                </div>
              </div>

              {user.medico_info.healthcare_providers && user.medico_info.healthcare_providers.length > 0 && (
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Obras Sociales
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {user.medico_info.healthcare_providers.map((provider, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200">
                        {provider}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
                Estado de verificación del email del usuario
              </p>
            </div>
            <div className="flex items-center">
              <span className={user.email_verified 
                ? "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                : "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200"
              }>
                {user.email_verified ? 'Email Verificado' : 'Email Pendiente de Verificación'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default UserDetailsPage; 