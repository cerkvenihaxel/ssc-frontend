import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Mail, Building, Phone, Key } from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';
import LoadingSpinner from '../../../../shared/components/ui/LoadingSpinner';
import { useToast } from '../../../../shared/components/ui/ToastContainer';
import { useAdmin } from '../../../hooks/useAdmin';
import type { AdminUser, UpdateUserRequest } from '../../../../infrastructure/repositories/HttpAdminRepository';

interface EditUserForm {
  email: string;
  nombre: string;
  password?: string;
  status: 'active' | 'inactive';
  // Campos específicos por rol (readonly en edición)
  role_info?: {
    provider_name?: string;
    provider_type?: string;
    effector_name?: string;
    effector_type?: string;
    cuit?: string;
    contact_name?: string;
    contact_phone?: string;
    contact_email?: string;
  };
}

const EditUserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();
  const { getUserById, updateUser, loading: adminLoading } = useAdmin();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState<EditUserForm>({
    email: '',
    nombre: '',
    status: 'active'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);

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
        setUser(userData);
        setFormData({
          email: userData.email,
          nombre: userData.nombre,
          status: (userData.status || 'active') as 'active' | 'inactive',
          role_info: {
            // Estos campos serán solo de lectura
          }
        });
      }
    } catch (error) {
      console.error('Error loading user details:', error);
      showError('Error', 'No se pudieron cargar los detalles del usuario');
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showWarning('Formulario incompleto', 'Por favor, corrige los errores antes de continuar');
      return;
    }

    setSaving(true);
    try {
      const updateData: UpdateUserRequest = {
        email: formData.email,
        nombre: formData.nombre,
        status: formData.status
      };

      // Solo incluir password si se especificó
      if (formData.password?.trim()) {
        updateData.password = formData.password;
      }

      const result = await updateUser(id!, updateData);
      
      if (result) {
        showSuccess(
          'Usuario actualizado', 
          'Los cambios se han guardado correctamente'
        );
        setIsDirty(false);
        
        // Actualizar los datos locales
        setUser(result);
        setFormData(prev => ({
          ...prev,
          password: '' // Limpiar password después de guardar
        }));
        setShowPasswordField(false);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showError('Error al actualizar', 'No se pudieron guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof EditUserForm, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: field === 'status' ? value as 'active' | 'inactive' : value 
    }));
    setIsDirty(true);
    
    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm(
        'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?'
      );
      if (!confirmed) return;
    }
    navigate(`/admin/users/${id}`);
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
      <BaseLayout title="Editando Usuario">
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
    <BaseLayout title={`Editar: ${user.nombre}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline-primary"
            onClick={handleCancel}
            className="flex items-center"
            disabled={saving}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Editar Usuario
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              Modifica la información del usuario
            </p>
          </div>
        </div>

        {/* Current Role Info (Read-only) */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Rol Actual
              </h3>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                El rol del usuario no se puede modificar desde esta pantalla
              </p>
            </div>
            <span className={getRoleBadge(user.role.role_name)}>
              {user.role.role_name}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
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
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="usuario@ejemplo.com"
                    className="pl-10"
                    error={errors.email}
                    disabled={saving}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Nombre Completo *
                </label>
                <Input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  placeholder="Nombre completo del usuario"
                  error={errors.nombre}
                  disabled={saving}
                />
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nombre}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Estado *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  disabled={saving}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-400 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-darkmode-800 dark:text-white"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                    Contraseña
                  </label>
                  {!showPasswordField && (
                    <Button
                      type="button"
                      variant="outline-primary"
                      size="sm"
                      onClick={() => setShowPasswordField(true)}
                      disabled={saving}
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Cambiar Contraseña
                    </Button>
                  )}
                </div>
                
                {showPasswordField && (
                  <div className="space-y-2">
                    <Input
                      type="password"
                      value={formData.password || ''}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Nueva contraseña (opcional)"
                      error={errors.password}
                      disabled={saving}
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                    )}
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                          setShowPasswordField(false);
                          setFormData(prev => ({ ...prev, password: '' }));
                          if (errors.password) {
                            setErrors(prev => ({ ...prev, password: '' }));
                          }
                        }}
                        disabled={saving}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
                
                {!showPasswordField && (
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    Haz clic en "Cambiar Contraseña" para modificar la contraseña
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* User Info (Read-only) */}
          <div className="bg-gray-50 dark:bg-darkmode-700 shadow rounded-lg p-6">
            <div className="flex items-center mb-6">
              <Building className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Información del {user.role.role_name}
              </h3>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Building className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Información específica del rol
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <p>
                      La información específica del {user.role.role_name.toLowerCase()} (como CUIT, dirección, etc.) 
                      se gestiona desde módulos especializados y no puede editarse desde esta pantalla.
                    </p>
                    <p className="mt-2">
                      Para modificar esa información, contacta al administrador del sistema.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Usuario ID
                </label>
                <div className="text-sm text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-darkmode-800 px-3 py-2 rounded">
                  {user.user_id}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Fecha de Creación
                </label>
                <div className="text-sm text-gray-900 dark:text-white">
                  {new Date(user.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Estado Actual
                </label>
                <span className={getStatusBadge(user.status || 'active')}>
                  {(user.status || 'active') === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-slate-400">
                * Campos requeridos
                {isDirty && (
                  <span className="ml-2 text-yellow-600 dark:text-yellow-400">
                    • Cambios sin guardar
                  </span>
                )}
              </div>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline-primary"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving || !isDirty}
                  className="inline-flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </BaseLayout>
  );
};

export default EditUserPage; 