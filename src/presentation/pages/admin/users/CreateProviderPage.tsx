import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Building, Mail, Phone, FileText, User, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';
import { useToast } from '../../../../shared/components/ui/ToastContainer';
import { useAdmin } from '../../../hooks/useAdmin';
import { getSpecialtyColorClasses, renderSpecialtyIcon } from '../../../../shared/utils/specialtyIcons';
import type { CreateProviderRequest, Especialidad } from '../../../../infrastructure/repositories/HttpAdminRepository';

interface CreateProviderForm {
  email: string;
  nombre: string;
  provider_name: string;
  provider_type: string;
  cuit: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  status: string;
  specialties: string[];
  healthcare_providers: string[];
}

const CreateProviderPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { loading, createProvider, getAllEspecialidades } = useAdmin();

  const [formData, setFormData] = useState<CreateProviderForm>({
    email: '',
    nombre: '',
    provider_name: '',
    provider_type: 'Farmacia',
    cuit: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    status: 'active',
    specialties: [],
    healthcare_providers: []
  });

  const [errors, setErrors] = useState<Partial<CreateProviderForm>>({});
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [loadingEspecialidades, setLoadingEspecialidades] = useState(false);

  // Cargar especialidades al montar el componente
  useEffect(() => {
    loadEspecialidades();
  }, []);

  const loadEspecialidades = async () => {
    setLoadingEspecialidades(true);
    try {
      const especialidadesData = await getAllEspecialidades();
      if (especialidadesData) {
        setEspecialidades(especialidadesData.filter(esp => esp.activa));
      }
    } catch (error) {
      console.error('Error loading especialidades:', error);
      showError('Error', 'No se pudieron cargar las especialidades');
    } finally {
      setLoadingEspecialidades(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateProviderForm> = {};

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.nombre) {
      newErrors.nombre = 'El nombre del usuario es requerido';
    }

    if (!formData.provider_name) {
      newErrors.provider_name = 'El nombre del proveedor es requerido';
    }

    if (!formData.cuit) {
      newErrors.cuit = 'El CUIT es requerido';
    } else if (!/^\d{2}-\d{8}-\d$/.test(formData.cuit)) {
      newErrors.cuit = 'El CUIT debe tener formato XX-XXXXXXXX-X';
    }

    if (!formData.contact_name) {
      newErrors.contact_name = 'El nombre de contacto es requerido';
    }

    if (!formData.contact_phone) {
      newErrors.contact_phone = 'El teléfono de contacto es requerido';
    } else if (!/^\+54\d{10,11}$/.test(formData.contact_phone)) {
      newErrors.contact_phone = 'El teléfono debe tener formato +54XXXXXXXXX';
    }

    if (!formData.contact_email) {
      newErrors.contact_email = 'El email de contacto es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'El email de contacto no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CreateProviderForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleAddEspecialidad = (especialidadId: string) => {
    if (!formData.specialties.includes(especialidadId)) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, especialidadId]
      }));
    }
  };

  const handleRemoveEspecialidad = (especialidadId: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(id => id !== especialidadId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Error de validación', 'Por favor corrige los errores en el formulario');
      return;
    }

    const providerData: CreateProviderRequest = {
      ...formData,
      role: 'Proveedor'
    };

    const result = await createProvider(providerData);
    
    if (result) {
      showSuccess('Proveedor creado', 'El proveedor ha sido creado exitosamente');
      navigate('/admin/users/providers');
    } else {
      showError('Error', 'No se pudo crear el proveedor');
    }
  };

  return (
    <BaseLayout title="Crear Proveedor">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline-primary"
              onClick={() => navigate('/admin/users/providers')}
              className="inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Crear Nuevo Proveedor
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                Complete la información del proveedor y usuario asociado
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Information */}
          <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <User className="w-5 h-5 mr-2" />
                Información del Usuario
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email del Usuario *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                  placeholder="usuario@ejemplo.com"
                />
                <Input
                  label="Nombre del Usuario *"
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  error={errors.nombre}
                  placeholder="Nombre completo del usuario"
                />
              </div>
            </div>
          </div>

          {/* Provider Information */}
          <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Información del Proveedor
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre del Proveedor *"
                  type="text"
                  value={formData.provider_name}
                  onChange={(e) => handleInputChange('provider_name', e.target.value)}
                  error={errors.provider_name}
                  placeholder="Farmacia Central S.A."
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Tipo de Proveedor *
                  </label>
                  <select
                    value={formData.provider_type}
                    onChange={(e) => handleInputChange('provider_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-400 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-darkmode-800 dark:text-white"
                  >
                    <option value="Farmacia">Farmacia</option>
                    <option value="Laboratorio">Laboratorio</option>
                    <option value="Instrumental">Instrumental Médico</option>
                    <option value="Tecnología">Tecnología Médica</option>
                    <option value="Servicios">Servicios Médicos</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="CUIT *"
                  type="text"
                  value={formData.cuit}
                  onChange={(e) => handleInputChange('cuit', e.target.value)}
                  error={errors.cuit}
                  placeholder="20-12345678-9"
                  helperText="Formato: XX-XXXXXXXX-X"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Estado *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-400 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-darkmode-800 dark:text-white"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Información de Contacto
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre de Contacto *"
                  type="text"
                  value={formData.contact_name}
                  onChange={(e) => handleInputChange('contact_name', e.target.value)}
                  error={errors.contact_name}
                  placeholder="Juan Pérez"
                />
                <Input
                  label="Teléfono de Contacto *"
                  type="text"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  error={errors.contact_phone}
                  placeholder="+54911234567"
                  helperText="Formato: +54XXXXXXXXX"
                />
              </div>
              
              <Input
                label="Email de Contacto *"
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                error={errors.contact_email}
                placeholder="contacto@proveedor.com"
              />
            </div>
          </div>

          {/* Especialidades */}
          <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Especialidades del Proveedor
                <span className="ml-2 text-sm text-gray-500 dark:text-slate-400">(Opcional)</span>
              </h3>
            </div>
            <div className="p-6">
              {loadingEspecialidades ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                  <span className="ml-2 text-sm text-gray-600 dark:text-slate-400">Cargando especialidades...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Especialidades seleccionadas */}
                  {formData.specialties.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Especialidades Seleccionadas
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {formData.specialties.map(especialidadId => {
                          const especialidad = especialidades.find(e => e.especialidadId === especialidadId);
                          return especialidad ? (
                            <span
                              key={especialidadId}
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getSpecialtyColorClasses(especialidad.nombre)}`}
                            >
                              {renderSpecialtyIcon(especialidad.nombre)}
                              {especialidad.nombre}
                              <button
                                type="button"
                                onClick={() => handleRemoveEspecialidad(especialidadId)}
                                disabled={loading}
                                className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-opacity-20 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Selector de especialidades */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Agregar Especialidad
                    </label>
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddEspecialidad(e.target.value);
                          e.target.value = ''; // Reset the select
                        }
                      }}
                      disabled={loading || loadingEspecialidades}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-400 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-darkmode-800 dark:text-white"
                    >
                      <option value="">Selecciona una especialidad para agregar</option>
                      {especialidades
                        .filter(esp => !formData.specialties.includes(esp.especialidadId))
                        .map(especialidad => (
                          <option key={especialidad.especialidadId} value={especialidad.especialidadId}>
                            {especialidad.nombre}
                            {especialidad.descripcion && ` - ${especialidad.descripcion}`}
                          </option>
                        ))
                      }
                    </select>
                  </div>

                  {especialidades.length === 0 && (
                    <div className="text-center py-4 text-gray-500 dark:text-slate-400">
                      <p>No hay especialidades disponibles</p>
                    </div>
                  )}

                  <div className="text-sm text-gray-500 dark:text-slate-400">
                    <p>
                      <strong>Nota:</strong> Las especialidades ayudan a identificar qué tipo de servicios médicos 
                      puede proveer este proveedor. Puedes seleccionar múltiples especialidades si es necesario.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline-primary"
              onClick={() => navigate('/admin/users/providers')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="inline-flex items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Crear Proveedor
            </Button>
          </div>
        </form>
      </div>
    </BaseLayout>
  );
};

export default CreateProviderPage; 