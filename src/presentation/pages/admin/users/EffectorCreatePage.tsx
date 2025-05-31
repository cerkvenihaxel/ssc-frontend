import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Mail, Building, Phone, MapPin, Info } from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';
import { useToast } from '../../../../shared/components/ui/ToastContainer';
import { useAdmin } from '../../../hooks/useAdmin';

interface CreateFormData {
  email: string;
  nombre: string;
  effector_name: string;
  effector_type: string;
  cuit: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  // Dirección
  calle: string;
  numero: string;
  ciudad: string;
  provincia: string;
  codigo_postal: string;
}

const EffectorCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { createEffector } = useAdmin();

  const [formData, setFormData] = useState<CreateFormData>({
    email: '',
    nombre: '',
    effector_name: '',
    effector_type: '',
    cuit: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    calle: '',
    numero: '',
    ciudad: '',
    provincia: '',
    codigo_postal: ''
  });
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del usuario es requerido';
    }

    if (!formData.effector_name.trim()) {
      newErrors.effector_name = 'El nombre del efector es requerido';
    }

    if (!formData.effector_type.trim()) {
      newErrors.effector_type = 'El tipo de efector es requerido';
    }

    if (formData.cuit) {
      if (!/^\d{2}-\d{8}-\d{1}$/.test(formData.cuit)) {
        newErrors.cuit = 'El formato del CUIT debe ser XX-XXXXXXXX-X';
      }
    }

    if (formData.contact_email) {
      if (!/\S+@\S+\.\S+/.test(formData.contact_email)) {
        newErrors.contact_email = 'El formato del email de contacto no es válido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CreateFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      showError('Errores en el formulario', 'Por favor, corrige los errores antes de crear el efector');
      return;
    }

    setCreating(true);
    try {
      // Preparar datos para envío
      const createData = {
        email: formData.email,
        nombre: formData.nombre,
        role: 'Efector',
        effector_name: formData.effector_name,
        effector_type: formData.effector_type,
        cuit: formData.cuit,
        contact_name: formData.contact_name || formData.nombre,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email || formData.email,
        status: 'active',
        address: {
          calle: formData.calle,
          numero: formData.numero,
          ciudad: formData.ciudad,
          provincia: formData.provincia,
          codigo_postal: formData.codigo_postal
        }
      };

      const result = await createEffector(createData);
      
      if (result) {
        showSuccess(
          'Efector creado exitosamente', 
          `El efector ${formData.effector_name} ha sido creado correctamente. Se generó una contraseña temporal que será enviada por email.`
        );
        
        setIsDirty(false);
        
        // Redirigir a la lista de efectores después de un breve delay
        setTimeout(() => {
          navigate('/admin/users/effectors');
        }, 1500);
      }
      
    } catch (error: any) {
      console.error('Error creating effector:', error);
      
      let errorTitle = 'Error al crear efector';
      let errorMessage = 'No se pudo crear el efector';
      
      if (error.status === 409) {
        errorTitle = 'Conflicto de datos';
        if (error.message?.includes('email')) {
          errorMessage = 'El email ya está en uso por otro usuario';
        } else if (error.message?.includes('cuit')) {
          errorMessage = 'El CUIT ya está en uso por otro efector';
        } else {
          errorMessage = 'Los datos ingresados ya están en uso';
        }
      } else if (error.status === 400) {
        errorTitle = 'Datos inválidos';
        errorMessage = error.message || 'Verifica que todos los datos estén correctos';
      } else if (error.status === 403) {
        errorTitle = 'Acceso denegado';
        errorMessage = 'No tienes permisos para crear efectores';
      } else if (error.status === 0) {
        errorTitle = 'Error de conexión';
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      }
      
      showError(errorTitle, errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm(
        'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir sin guardar?'
      );
      if (!confirmed) return;
    }
    navigate('/admin/users/effectors');
  };

  return (
    <BaseLayout title="Crear Nuevo Efector">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline-primary"
              onClick={handleCancel}
              className="flex items-center"
              disabled={creating}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Crear Nuevo Efector
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                Completa los datos para crear un nuevo efector en el sistema
                {isDirty && (
                  <span className="ml-2 text-yellow-600 dark:text-yellow-400">
                    • Información ingresada
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline-primary"
              onClick={handleCancel}
              disabled={creating}
            >
              Cancelar
            </Button>
            
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={creating || !isDirty}
              className="flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {creating ? 'Creando...' : 'Crear Efector'}
            </Button>
          </div>
        </div>

        {/* Info Panel */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start">
            <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
                Información sobre la creación de efectores
              </h3>
              <div className="text-blue-800 dark:text-blue-300 space-y-2 text-sm">
                <p>
                  • Se generará automáticamente una contraseña temporal que será enviada al email del efector
                </p>
                <p>
                  • El efector deberá verificar su email antes de poder acceder al sistema
                </p>
                <p>
                  • La información de contacto puede ser diferente a la del usuario principal
                </p>
                <p>
                  • Los campos marcados con (*) son obligatorios
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Información Básica */}
          <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
            <div className="flex items-center mb-6">
              <User className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Información Básica
                {(errors.email || errors.nombre) && (
                  <span className="ml-2 text-red-500 text-sm">• Hay errores en esta sección</span>
                )}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Email del Usuario *
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
                    disabled={creating}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                  Email para acceder al sistema
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Nombre del Usuario *
                </label>
                <Input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  placeholder="Nombre completo del usuario"
                  error={errors.nombre}
                  disabled={creating}
                />
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nombre}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                  Nombre del usuario en el sistema
                </p>
              </div>
            </div>
          </div>

          {/* Información del Efector */}
          <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
            <div className="flex items-center mb-6">
              <Building className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Información del Efector
                {(errors.effector_name || errors.effector_type || errors.cuit) && (
                  <span className="ml-2 text-red-500 text-sm">• Hay errores en esta sección</span>
                )}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Nombre del Efector *
                </label>
                <Input
                  type="text"
                  value={formData.effector_name}
                  onChange={(e) => handleInputChange('effector_name', e.target.value)}
                  placeholder="Ej: Hospital Central"
                  error={errors.effector_name}
                  disabled={creating}
                />
                {errors.effector_name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.effector_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Tipo de Efector *
                </label>
                <select
                  value={formData.effector_type}
                  onChange={(e) => handleInputChange('effector_type', e.target.value)}
                  disabled={creating}
                  className={`w-full px-3 py-2 border rounded-md 
                             bg-white dark:bg-darkmode-800 text-gray-900 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                               errors.effector_type 
                                 ? 'border-red-300 dark:border-red-600' 
                                 : 'border-gray-300 dark:border-darkmode-400'
                             }`}
                >
                  <option value="">Selecciona el tipo</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Clínica">Clínica</option>
                  <option value="Centro de Salud">Centro de Salud</option>
                  <option value="Consultorio">Consultorio</option>
                  <option value="Laboratorio">Laboratorio</option>
                  <option value="Centro de Diagnóstico">Centro de Diagnóstico</option>
                </select>
                {errors.effector_type && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.effector_type}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  CUIT
                </label>
                <Input
                  type="text"
                  value={formData.cuit}
                  onChange={(e) => handleInputChange('cuit', e.target.value)}
                  placeholder="XX-XXXXXXXX-X"
                  error={errors.cuit}
                  disabled={creating}
                />
                {errors.cuit && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cuit}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                  Opcional - Formato: XX-XXXXXXXX-X
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Persona de Contacto
                </label>
                <Input
                  type="text"
                  value={formData.contact_name}
                  onChange={(e) => handleInputChange('contact_name', e.target.value)}
                  placeholder="Nombre de la persona de contacto"
                  disabled={creating}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                  Si se deja vacío, se usará el nombre del usuario
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Teléfono de Contacto
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                    placeholder="+54 11 1234-5678"
                    className="pl-10"
                    disabled={creating}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Email de Contacto
                </label>
                <Input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  placeholder="contacto@efector.com"
                  error={errors.contact_email}
                  disabled={creating}
                />
                {errors.contact_email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.contact_email}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                  Si se deja vacío, se usará el email del usuario
                </p>
              </div>
            </div>
          </div>

          {/* Dirección */}
          <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
            <div className="flex items-center mb-6">
              <MapPin className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Dirección (Opcional)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Calle
                </label>
                <Input
                  type="text"
                  value={formData.calle}
                  onChange={(e) => handleInputChange('calle', e.target.value)}
                  placeholder="Nombre de la calle"
                  disabled={creating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Número
                </label>
                <Input
                  type="text"
                  value={formData.numero}
                  onChange={(e) => handleInputChange('numero', e.target.value)}
                  placeholder="Número"
                  disabled={creating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Ciudad
                </label>
                <Input
                  type="text"
                  value={formData.ciudad}
                  onChange={(e) => handleInputChange('ciudad', e.target.value)}
                  placeholder="Ciudad"
                  disabled={creating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Provincia
                </label>
                <Input
                  type="text"
                  value={formData.provincia}
                  onChange={(e) => handleInputChange('provincia', e.target.value)}
                  placeholder="Provincia"
                  disabled={creating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Código Postal
                </label>
                <Input
                  type="text"
                  value={formData.codigo_postal}
                  onChange={(e) => handleInputChange('codigo_postal', e.target.value)}
                  placeholder="CP"
                  disabled={creating}
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          {isDirty && (
            <div className="bg-gray-50 dark:bg-darkmode-700 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Resumen de la información
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600 dark:text-slate-400">Usuario:</span>
                  <p className="text-gray-900 dark:text-white">{formData.nombre || 'No especificado'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-slate-400">Email:</span>
                  <p className="text-gray-900 dark:text-white">{formData.email || 'No especificado'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-slate-400">Efector:</span>
                  <p className="text-gray-900 dark:text-white">{formData.effector_name || 'No especificado'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-slate-400">Tipo:</span>
                  <p className="text-gray-900 dark:text-white">{formData.effector_type || 'No especificado'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </BaseLayout>
  );
};

export default EffectorCreatePage; 