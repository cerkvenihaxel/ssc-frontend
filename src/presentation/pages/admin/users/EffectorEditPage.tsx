import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Mail, Building, Phone, MapPin, Calendar, Shield, Trash2 } from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';
import { useToast } from '../../../../shared/components/ui/ToastContainer';
import { useAdmin } from '../../../hooks/useAdmin';
import { ApiClient } from '../../../../infrastructure/http/ApiClient';
import { HttpMedicoRepository } from '../../../../infrastructure/repositories/HttpMedicoRepository';
import { type ObraSocial } from '../../../../infrastructure/repositories/HttpObraSocialRepository';
import type { AdminEffector } from '../../../../infrastructure/repositories/HttpAdminRepository';

interface EditFormData {
  email: string;
  nombre: string;
  status: 'active' | 'inactive';
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

const EffectorEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { getEffectorById, updateEffector } = useAdmin();

  const [effector, setEffector] = useState<AdminEffector | null>(null);
  const [formData, setFormData] = useState<EditFormData>({
    email: '',
    nombre: '',
    status: 'active',
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
  const [originalData, setOriginalData] = useState<EditFormData>({} as EditFormData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  
  // Estados para obras sociales
  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([]);
  const [selectedObrasSociales, setSelectedObrasSociales] = useState<string[]>([]);
  const [originalObrasSociales, setOriginalObrasSociales] = useState<string[]>([]);

  // Initialize repository
  const apiClient = new ApiClient();
  const medicoRepository = new HttpMedicoRepository(apiClient);

  // Función para verificar si una obra social está activa
  const isObraSocialActive = (obra: ObraSocial): boolean => {
    const status = obra.status?.toLowerCase();
    return status === 'active' || status === 'activa';
  };

  // Cargar obras sociales disponibles
  const loadObrasSociales = async () => {
    try {
      const data = await medicoRepository.getAllObrasSociales();
      // Filtrar solo obras sociales activas
      setObrasSociales(data.filter(isObraSocialActive));
    } catch (error) {
      console.error('Error loading obras sociales:', error);
      showError('Error', 'No se pudieron cargar las obras sociales');
    }
  };

  const addObraSocial = (obraSocialId: string) => {
    if (!selectedObrasSociales.includes(obraSocialId)) {
      setSelectedObrasSociales([...selectedObrasSociales, obraSocialId]);
    }
  };

  const removeObraSocial = (obraSocialId: string) => {
    setSelectedObrasSociales(selectedObrasSociales.filter(id => id !== obraSocialId));
  };

  const getObraSocialName = (id: string) => {
    const obra = obrasSociales.find(o => o.healthcareProviderId === id);
    return obra?.name || 'Desconocida';
  };

  const loadEffectorData = async () => {
    setLoading(true);
    try {
      const data = await getEffectorById(id!);
      if (!data) {
        showError('Error', 'No se encontró la información del efector');
        navigate('/admin/users/effectors');
        return;
      }
      
      setEffector(data);
      
      // Mapear datos al formulario, incluyendo información de effector_info
      const effectorInfo = data.effector_info || {};
      const address = (effectorInfo.address && typeof effectorInfo.address === 'object') ? effectorInfo.address : {};
      
      const mappedData: EditFormData = {
        email: data.email || '',
        nombre: data.nombre || '',
        status: (data.status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
        effector_name: effectorInfo.effector_name || '',
        effector_type: effectorInfo.effector_type || '',
        cuit: effectorInfo.cuit || '',
        contact_name: effectorInfo.contact_name || '',
        contact_phone: effectorInfo.contact_phone || '',
        contact_email: effectorInfo.contact_email || '',
        calle: (address as any)?.calle || '',
        numero: (address as any)?.numero || '',
        ciudad: (address as any)?.ciudad || '',
        provincia: (address as any)?.provincia || '',
        codigo_postal: (address as any)?.codigo_postal || ''
      };
      
      setFormData(mappedData);
      setOriginalData(mappedData);
      
      // Cargar obras sociales asociadas
      const currentObrasSociales = data.healthcareProviders?.map(obra => obra.healthcareProviderId) || [];
      setSelectedObrasSociales(currentObrasSociales);
      setOriginalObrasSociales(currentObrasSociales);
      
      setHasChanges(false);
    } catch (error: any) {
      console.error('Error loading effector:', error);
      if (error.status === 404) {
        showError('Efector no encontrado', 'El efector solicitado no existe');
        navigate('/admin/users/effectors');
      } else {
        showError('Error', 'No se pudo cargar la información del efector');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadEffectorData();
      loadObrasSociales();
    } else {
      navigate('/admin/users/effectors');
    }
  }, [id]);

  useEffect(() => {
    // Detectar cambios comparando con datos originales
    const dataChanged = JSON.stringify(formData) !== JSON.stringify(originalData);
    
    // Verificar cambios en obras sociales
    const obrasSocialesChanged = 
      selectedObrasSociales.length !== originalObrasSociales.length ||
      selectedObrasSociales.some(id => !originalObrasSociales.includes(id));
    
    setHasChanges(dataChanged || obrasSocialesChanged);
  }, [formData, originalData, selectedObrasSociales, originalObrasSociales]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.effector_name.trim()) {
      newErrors.effector_name = 'El nombre del efector es requerido';
    }

    if (!formData.effector_type.trim()) {
      newErrors.effector_type = 'El tipo de efector es requerido';
    }

    if (formData.cuit && !/^\d{2}-\d{8}-\d{1}$/.test(formData.cuit)) {
      newErrors.cuit = 'El formato del CUIT debe ser XX-XXXXXXXX-X';
    }

    if (formData.contact_email && !/\S+@\S+\.\S+/.test(formData.contact_email)) {
      newErrors.contact_email = 'El formato del email de contacto no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof EditFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showError('Errores en el formulario', 'Por favor, corrige los errores antes de guardar');
      return;
    }

    setSaving(true);
    try {
      // Preparar datos para envío
      const updateData = {
        email: formData.email,
        nombre: formData.nombre,
        status: formData.status,
        effector_name: formData.effector_name,
        effector_type: formData.effector_type,
        cuit: formData.cuit,
        contact_name: formData.contact_name,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        healthcare_providers: selectedObrasSociales,
        address: {
          calle: formData.calle,
          numero: formData.numero,
          ciudad: formData.ciudad,
          provincia: formData.provincia,
          codigo_postal: formData.codigo_postal
        }
      };

      await updateEffector(id!, updateData);
      
      showSuccess('Efector actualizado', 'Los datos del efector han sido actualizados correctamente');
      
      // Recargar datos para refrescar la información
      await loadEffectorData();
      
    } catch (error: any) {
      console.error('Error updating effector:', error);
      
      let errorTitle = 'Error al actualizar';
      let errorMessage = 'No se pudieron guardar los cambios';
      
      if (error.status === 409) {
        errorTitle = 'Conflicto de datos';
        if (error.message?.includes('email')) {
          errorMessage = 'El email ya está en uso por otro usuario';
        } else if (error.message?.includes('cuit')) {
          errorMessage = 'El CUIT ya está en uso por otro efector';
        } else {
          errorMessage = 'Los datos ingresados están en uso por otro registro';
        }
      } else if (error.status === 404) {
        errorTitle = 'Efector no encontrado';
        errorMessage = 'El efector ya no existe o ha sido eliminado';
      } else if (error.status === 400) {
        errorTitle = 'Datos inválidos';
        errorMessage = error.message || 'Verifica que todos los datos estén correctos';
      } else if (error.status === 403) {
        errorTitle = 'Acceso denegado';
        errorMessage = 'No tienes permisos para realizar esta acción';
      } else if (error.status === 0) {
        errorTitle = 'Error de conexión';
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      }
      
      showError(errorTitle, errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmed = window.confirm(
        'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir sin guardar?'
      );
      if (!confirmed) return;
    }
    navigate('/admin/users/effectors');
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
    <BaseLayout title={`Editar Efector: ${effector.effector_info?.effector_name || effector.nombre}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
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
                Editar Efector
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                Modifica la información del efector
                {hasChanges && (
                  <span className="ml-2 text-yellow-600 dark:text-yellow-400">
                    • Cambios sin guardar
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline-primary"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancelar
            </Button>
            
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
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
                {(errors.email || errors.nombre || errors.status) && (
                  <span className="ml-2 text-red-500 text-sm">• Hay errores en esta sección</span>
                )}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Email *
                  {formData.email !== originalData.email && (
                    <span className="ml-1 text-blue-500 text-xs">• Modificado</span>
                  )}
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
                  Nombre del Usuario *
                  {formData.nombre !== originalData.nombre && (
                    <span className="ml-1 text-blue-500 text-xs">• Modificado</span>
                  )}
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Estado
                  {formData.status !== originalData.status && (
                    <span className="ml-1 text-blue-500 text-xs">• Modificado</span>
                  )}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  disabled={saving}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-400 rounded-md 
                           bg-white dark:bg-darkmode-800 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
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
                  {formData.effector_name !== originalData.effector_name && (
                    <span className="ml-1 text-blue-500 text-xs">• Modificado</span>
                  )}
                </label>
                <Input
                  type="text"
                  value={formData.effector_name}
                  onChange={(e) => handleInputChange('effector_name', e.target.value)}
                  placeholder="Ej: Hospital Central"
                  error={errors.effector_name}
                  disabled={saving}
                />
                {errors.effector_name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.effector_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Tipo de Efector *
                  {formData.effector_type !== originalData.effector_type && (
                    <span className="ml-1 text-blue-500 text-xs">• Modificado</span>
                  )}
                </label>
                <select
                  value={formData.effector_type}
                  onChange={(e) => handleInputChange('effector_type', e.target.value)}
                  disabled={saving}
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
                  {formData.cuit !== originalData.cuit && (
                    <span className="ml-1 text-blue-500 text-xs">• Modificado</span>
                  )}
                </label>
                <Input
                  type="text"
                  value={formData.cuit}
                  onChange={(e) => handleInputChange('cuit', e.target.value)}
                  placeholder="XX-XXXXXXXX-X"
                  error={errors.cuit}
                  disabled={saving}
                />
                {errors.cuit && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cuit}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Persona de Contacto
                  {formData.contact_name !== originalData.contact_name && (
                    <span className="ml-1 text-blue-500 text-xs">• Modificado</span>
                  )}
                </label>
                <Input
                  type="text"
                  value={formData.contact_name}
                  onChange={(e) => handleInputChange('contact_name', e.target.value)}
                  placeholder="Nombre de la persona de contacto"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Teléfono de Contacto
                  {formData.contact_phone !== originalData.contact_phone && (
                    <span className="ml-1 text-blue-500 text-xs">• Modificado</span>
                  )}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                    placeholder="+54 11 1234-5678"
                    className="pl-10"
                    disabled={saving}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Email de Contacto
                  {formData.contact_email !== originalData.contact_email && (
                    <span className="ml-1 text-blue-500 text-xs">• Modificado</span>
                  )}
                </label>
                <Input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  placeholder="contacto@efector.com"
                  error={errors.contact_email}
                  disabled={saving}
                />
                {errors.contact_email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.contact_email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Obras Sociales */}
          <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
            <div className="flex items-center mb-6">
              <Shield className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Obras Sociales (Opcional)
              </h3>
            </div>

            {/* Selector de obra social */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Agregar Obra Social
              </label>
              <div className="flex gap-3">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addObraSocial(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  disabled={saving}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300"
                >
                  <option value="">Seleccionar obra social para agregar</option>
                  {obrasSociales
                    .filter(obra => !selectedObrasSociales.includes(obra.healthcareProviderId))
                    .map((obra) => (
                      <option key={obra.healthcareProviderId} value={obra.healthcareProviderId}>
                        {obra.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Lista de obras sociales seleccionadas */}
            {selectedObrasSociales.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
                  Obras sociales asociadas:
                  {selectedObrasSociales.length !== originalObrasSociales.length && (
                    <span className="ml-1 text-blue-500 text-xs">• Modificado</span>
                  )}
                </h4>
                {selectedObrasSociales.map((obraSocialId) => (
                  <div key={obraSocialId} className="flex items-center justify-between bg-gray-50 dark:bg-darkmode-700 p-3 rounded-lg">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {getObraSocialName(obraSocialId)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeObraSocial(obraSocialId)}
                      disabled={saving}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Shield className="mx-auto h-8 w-8 text-gray-400 dark:text-slate-500" />
                <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                  No hay obras sociales asociadas. Las obras sociales son opcionales para los efectores.
                </p>
              </div>
            )}
          </div>

          {/* Dirección */}
          <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
            <div className="flex items-center mb-6">
              <MapPin className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Dirección
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Calle
                  {formData.calle !== originalData.calle && (
                    <span className="ml-1 text-blue-500 text-xs">• Modificado</span>
                  )}
                </label>
                <Input
                  type="text"
                  value={formData.calle}
                  onChange={(e) => handleInputChange('calle', e.target.value)}
                  placeholder="Nombre de la calle"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Número
                  {formData.numero !== originalData.numero && (
                    <span className="ml-1 text-blue-500 text-xs">• Modificado</span>
                  )}
                </label>
                <Input
                  type="text"
                  value={formData.numero}
                  onChange={(e) => handleInputChange('numero', e.target.value)}
                  placeholder="Número"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Ciudad
                  {formData.ciudad !== originalData.ciudad && (
                    <span className="ml-1 text-blue-500 text-xs">• Modificado</span>
                  )}
                </label>
                <Input
                  type="text"
                  value={formData.ciudad}
                  onChange={(e) => handleInputChange('ciudad', e.target.value)}
                  placeholder="Ciudad"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Provincia
                  {formData.provincia !== originalData.provincia && (
                    <span className="ml-1 text-blue-500 text-xs">• Modificado</span>
                  )}
                </label>
                <Input
                  type="text"
                  value={formData.provincia}
                  onChange={(e) => handleInputChange('provincia', e.target.value)}
                  placeholder="Provincia"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Código Postal
                  {formData.codigo_postal !== originalData.codigo_postal && (
                    <span className="ml-1 text-blue-500 text-xs">• Modificado</span>
                  )}
                </label>
                <Input
                  type="text"
                  value={formData.codigo_postal}
                  onChange={(e) => handleInputChange('codigo_postal', e.target.value)}
                  placeholder="CP"
                  disabled={saving}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default EffectorEditPage; 