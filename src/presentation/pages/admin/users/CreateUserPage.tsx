import React, { useState } from 'react';
import { ArrowLeft, Save, User, Mail, Building, Phone, FileText, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';
import { useToast } from '../../../../shared/components/ui/ToastContainer';
import { useAdmin } from '../../../hooks/useAdmin';

interface CreateUserForm {
  email: string;
  nombre: string;
  roleId: string;
  // Campos específicos para proveedores
  provider_name?: string;
  provider_type?: string;
  cuit?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  // Campos específicos para auditores
  first_name?: string;
  last_name?: string;
  phone?: string;
  department?: string;
  employee_id?: string;
  // Campos específicos para médicos
  especialidad?: string;
  matricula?: string;
  // Campos específicos para efectores
  efector_name?: string;
  efector_type?: string;
}

const CreateUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();
  const { createProvider, createEffector, createAuditor, loading: adminLoading, error: adminError } = useAdmin();
  
  const [formData, setFormData] = useState<CreateUserForm>({
    email: '',
    nombre: '',
    roleId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const roles = [
    { id: '5', name: 'Administrador', description: 'Administrador del sistema' },
    { id: '6', name: 'Auditor', description: 'Auditor del sistema' },
    { id: '7', name: 'Efector', description: 'Efector del sistema' },
    { id: '3', name: 'Proveedor', description: 'Proveedor de servicios' },
    { id: '2', name: 'Médico', description: 'Médico del sistema' },
    { id: '1', name: 'Afiliado', description: 'Afiliado del sistema' },
  ];

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

    if (!formData.roleId) {
      newErrors.roleId = 'El rol es requerido';
    }

    // Validaciones específicas por rol
    const selectedRole = roles.find(r => r.id === formData.roleId);
    if (selectedRole?.name === 'Proveedor') {
      if (!formData.provider_name?.trim()) {
        newErrors.provider_name = 'El nombre del proveedor es requerido';
      }
      if (!formData.provider_type) {
        newErrors.provider_type = 'El tipo de proveedor es requerido';
      }
      if (!formData.cuit?.trim()) {
        newErrors.cuit = 'El CUIT es requerido';
      } else if (!/^\d{2}-\d{8}-\d{1}$/.test(formData.cuit)) {
        newErrors.cuit = 'El CUIT debe tener el formato XX-XXXXXXXX-X';
      }
      if (formData.contact_email && !/\S+@\S+\.\S+/.test(formData.contact_email)) {
        newErrors.contact_email = 'El email de contacto no es válido';
      }
    }

    if (selectedRole?.name === 'Auditor') {
      if (!formData.first_name?.trim()) {
        newErrors.first_name = 'El nombre es requerido';
      }
      if (!formData.last_name?.trim()) {
        newErrors.last_name = 'El apellido es requerido';
      }
      if (!formData.phone?.trim()) {
        newErrors.phone = 'El teléfono es requerido';
      }
    }

    if (selectedRole?.name === 'Médico') {
      if (!formData.especialidad?.trim()) {
        newErrors.especialidad = 'La especialidad es requerida';
      }
      if (!formData.matricula?.trim()) {
        newErrors.matricula = 'La matrícula es requerida';
      }
    }

    if (selectedRole?.name === 'Efector') {
      if (!formData.efector_name?.trim()) {
        newErrors.efector_name = 'El nombre del efector es requerido';
      }
      if (!formData.efector_type) {
        newErrors.efector_type = 'El tipo de efector es requerido';
      }
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

    setLoading(true);
    try {
      console.log('Creating user:', formData);
      
      const selectedRole = roles.find(r => r.id === formData.roleId);
      let result = null;

      // Crear usuario según el rol seleccionado
      switch (selectedRole?.name) {
        case 'Proveedor':
          if (!formData.provider_name || !formData.cuit) {
            throw new Error('Faltan campos obligatorios para el proveedor');
          }
          
          result = await createProvider({
            email: formData.email,
            nombre: formData.nombre,
            role: 'Proveedor',
            provider_name: formData.provider_name,
            provider_type: formData.provider_type || 'SERVICIOS',
            cuit: formData.cuit,
            contact_name: formData.contact_name || formData.nombre,
            contact_phone: formData.contact_phone || '',
            contact_email: formData.contact_email || formData.email,
            status: 'active'
          });
          break;

        case 'Efector':
          if (!formData.efector_name || !formData.efector_type) {
            throw new Error('Faltan campos obligatorios para el efector');
          }
          
          result = await createEffector({
            email: formData.email,
            nombre: formData.nombre,
            role: 'Efector',
            effector_name: formData.efector_name,
            effector_type: formData.efector_type,
            cuit: formData.cuit || '',
            contact_name: formData.contact_name || formData.nombre,
            contact_phone: formData.contact_phone || '',
            contact_email: formData.contact_email || formData.email,
            status: 'active'
          });
          break;

        case 'Auditor':
          if (!formData.first_name || !formData.last_name || !formData.phone) {
            throw new Error('Faltan campos obligatorios para el auditor');
          }
          
          result = await createAuditor({
            email: formData.email,
            nombre: formData.nombre,
            role: 'Auditor',
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.phone,
            department: formData.department,
            employee_id: formData.employee_id,
            permissions: []
          });
          break;

        default:
          throw new Error(`Tipo de usuario '${selectedRole?.name}' no implementado aún`);
      }

      if (!result) {
        throw new Error('Error al crear el usuario - respuesta vacía');
      }

      // Show success message
      showSuccess(
        'Usuario creado exitosamente', 
        `El usuario ${formData.nombre} ha sido creado correctamente`
      );

      // Reset form state
      setIsDirty(false);
      
      // Redirect to user list after a short delay
      setTimeout(() => {
        navigate('/admin/users');
      }, 1500);
      
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error inesperado al crear el usuario';
      
      showError('Error al crear usuario', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateUserForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Si selecciona un rol específico, sugerir navegación a la página especializada
    if (field === 'roleId') {
      const selectedRole = roles.find(r => r.id === value);
      if (selectedRole?.name === 'Auditor') {
        const shouldRedirect = window.confirm(
          '¿Te gustaría usar el formulario especializado para crear auditores? ' +
          'Tiene campos específicos para la información del auditor.'
        );
        if (shouldRedirect) {
          navigate('/admin/users/auditors/create');
          return;
        }
      }
      if (selectedRole?.name === 'Proveedor') {
        const shouldRedirect = window.confirm(
          '¿Te gustaría usar el formulario especializado para crear proveedores? ' +
          'Tiene campos específicos para la información del proveedor.'
        );
        if (shouldRedirect) {
          navigate('/admin/users/providers/create');
          return;
        }
      }
      if (selectedRole?.name === 'Efector') {
        const shouldRedirect = window.confirm(
          '¿Te gustaría usar el formulario especializado para crear efectores? ' +
          'Tiene campos específicos para la información del efector.'
        );
        if (shouldRedirect) {
          navigate('/admin/users/effectors/create');
          return;
        }
      }
      if (selectedRole?.name === 'Médico') {
        const shouldRedirect = window.confirm(
          '¿Te gustaría usar el formulario especializado para crear médicos? ' +
          'Tiene campos específicos para la información médica.'
        );
        if (shouldRedirect) {
          navigate('/admin/healthcare/medicos/create');
          return;
        }
      }
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm(
        'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?'
      );
      if (!confirmed) return;
    }
    navigate('/admin/users');
  };

  const selectedRole = roles.find(r => r.id === formData.roleId);

  return (
    <BaseLayout title="Crear Usuario">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline-primary"
            onClick={handleCancel}
            className="flex items-center"
            disabled={loading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Crear Nuevo Usuario
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              Completa los datos para crear un nuevo usuario en el sistema
            </p>
          </div>
        </div>

        {/* Info Message */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Formularios especializados disponibles
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p>
                  Para roles específicos como Auditor, Proveedor, Efector o Médico, recomendamos usar los formularios especializados 
                  que incluyen campos adicionales específicos para cada tipo de usuario.
                </p>
                <div className="mt-2 space-x-2">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/users/auditors/create')}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline"
                  >
                    Crear Auditor
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/users/providers/create')}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline"
                  >
                    Crear Proveedor
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/users/effectors/create')}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline"
                  >
                    Crear Efector
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/healthcare/medicos/create')}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline"
                  >
                    Crear Médico
                  </button>
                </div>
              </div>
            </div>
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
                    disabled={loading}
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
                  disabled={loading}
                />
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nombre}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Rol *
                </label>
                <select
                  value={formData.roleId}
                  onChange={(e) => handleInputChange('roleId', e.target.value)}
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-darkmode-800 dark:text-white ${
                    errors.roleId 
                      ? 'border-red-300 dark:border-red-600' 
                      : 'border-gray-300 dark:border-darkmode-400'
                  }`}
                >
                  <option value="">Selecciona un rol</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name} - {role.description}
                    </option>
                  ))}
                </select>
                {errors.roleId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.roleId}</p>
                )}
              </div>
            </div>
          </div>

          {/* Role-specific fields */}
          {selectedRole?.name === 'Proveedor' && (
            <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
              <div className="flex items-center mb-6">
                <Building className="w-5 h-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Información del Proveedor
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Nombre del Proveedor *
                  </label>
                  <Input
                    type="text"
                    value={formData.provider_name || ''}
                    onChange={(e) => handleInputChange('provider_name', e.target.value)}
                    placeholder="Ej: Farmacia Central"
                    error={errors.provider_name}
                    disabled={loading}
                  />
                  {errors.provider_name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.provider_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Tipo de Proveedor *
                  </label>
                  <select
                    value={formData.provider_type || ''}
                    onChange={(e) => handleInputChange('provider_type', e.target.value)}
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-darkmode-800 dark:text-white ${
                      errors.provider_type 
                        ? 'border-red-300 dark:border-red-600' 
                        : 'border-gray-300 dark:border-darkmode-400'
                    }`}
                  >
                    <option value="">Selecciona el tipo</option>
                    <option value="Farmacia">Farmacia</option>
                    <option value="Laboratorio">Laboratorio</option>
                    <option value="Equipos Médicos">Equipos Médicos</option>
                    <option value="Insumos">Insumos</option>
                    <option value="Servicios">Servicios</option>
                  </select>
                  {errors.provider_type && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.provider_type}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    CUIT *
                  </label>
                  <Input
                    type="text"
                    value={formData.cuit || ''}
                    onChange={(e) => handleInputChange('cuit', e.target.value)}
                    placeholder="XX-XXXXXXXX-X"
                    error={errors.cuit}
                    disabled={loading}
                  />
                  {errors.cuit && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cuit}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Nombre de Contacto
                  </label>
                  <Input
                    type="text"
                    value={formData.contact_name || ''}
                    onChange={(e) => handleInputChange('contact_name', e.target.value)}
                    placeholder="Persona de contacto"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Teléfono de Contacto
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="tel"
                      value={formData.contact_phone || ''}
                      onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                      placeholder="+54 11 1234-5678"
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Email de Contacto
                  </label>
                  <Input
                    type="email"
                    value={formData.contact_email || ''}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    placeholder="contacto@proveedor.com"
                    error={errors.contact_email}
                    disabled={loading}
                  />
                  {errors.contact_email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.contact_email}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {selectedRole?.name === 'Auditor' && (
            <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
              <div className="flex items-center mb-6">
                <Shield className="w-5 h-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Información del Auditor
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Nombre *
                  </label>
                  <Input
                    type="text"
                    value={formData.first_name || ''}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    placeholder="Nombre del auditor"
                    error={errors.first_name}
                    disabled={loading}
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.first_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Apellido *
                  </label>
                  <Input
                    type="text"
                    value={formData.last_name || ''}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    placeholder="Apellido del auditor"
                    error={errors.last_name}
                    disabled={loading}
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.last_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Teléfono *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+54 11 1234-5678"
                      className="pl-10"
                      error={errors.phone}
                      disabled={loading}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Departamento
                  </label>
                  <Input
                    type="text"
                    value={formData.department || ''}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    placeholder="Ej: Auditoría Médica"
                    disabled={loading}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    ID de Empleado
                  </label>
                  <Input
                    type="text"
                    value={formData.employee_id || ''}
                    onChange={(e) => handleInputChange('employee_id', e.target.value)}
                    placeholder="Ej: AUD-001"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          )}

          {selectedRole?.name === 'Médico' && (
            <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
              <div className="flex items-center mb-6">
                <FileText className="w-5 h-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Información del Médico
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Especialidad *
                  </label>
                  <Input
                    type="text"
                    value={formData.especialidad || ''}
                    onChange={(e) => handleInputChange('especialidad', e.target.value)}
                    placeholder="Ej: Cardiología"
                    error={errors.especialidad}
                    disabled={loading}
                  />
                  {errors.especialidad && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.especialidad}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Número de Matrícula *
                  </label>
                  <Input
                    type="text"
                    value={formData.matricula || ''}
                    onChange={(e) => handleInputChange('matricula', e.target.value)}
                    placeholder="Ej: MN 12345"
                    error={errors.matricula}
                    disabled={loading}
                  />
                  {errors.matricula && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.matricula}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {selectedRole?.name === 'Efector' && (
            <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
              <div className="flex items-center mb-6">
                <Building className="w-5 h-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Información del Efector
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Nombre del Efector *
                  </label>
                  <Input
                    type="text"
                    value={formData.efector_name || ''}
                    onChange={(e) => handleInputChange('efector_name', e.target.value)}
                    placeholder="Ej: Hospital Central"
                    error={errors.efector_name}
                    disabled={loading}
                  />
                  {errors.efector_name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.efector_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Tipo de Efector *
                  </label>
                  <select
                    value={formData.efector_type || ''}
                    onChange={(e) => handleInputChange('efector_type', e.target.value)}
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-darkmode-800 dark:text-white ${
                      errors.efector_type 
                        ? 'border-red-300 dark:border-red-600' 
                        : 'border-gray-300 dark:border-darkmode-400'
                    }`}
                  >
                    <option value="">Selecciona el tipo</option>
                    <option value="Hospital">Hospital</option>
                    <option value="Clínica">Clínica</option>
                    <option value="Centro de Salud">Centro de Salud</option>
                    <option value="Consultorio">Consultorio</option>
                  </select>
                  {errors.efector_type && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.efector_type}</p>
                  )}
                </div>
              </div>
            </div>
          )}

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
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !isDirty}
                  className="inline-flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Crear Usuario
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

export default CreateUserPage; 