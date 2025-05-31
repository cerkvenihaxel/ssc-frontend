import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, User, Mail, Phone, Building, Shield, Trash2 } from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import LoadingSpinner from '../../../../shared/components/ui/LoadingSpinner';
import { useToast } from '../../../../shared/components/ui/ToastContainer';
import { useAdmin } from '../../../hooks/useAdmin';
import { ApiClient } from '../../../../infrastructure/http/ApiClient';
import { HttpMedicoRepository } from '../../../../infrastructure/repositories/HttpMedicoRepository';
import { type ObraSocial } from '../../../../infrastructure/repositories/HttpObraSocialRepository';
import type { AdminAuditor, UpdateUserRequest } from '../../../../infrastructure/repositories/HttpAdminRepository';

interface AuditorData extends AdminAuditor {
  auditor_info?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    department?: string;
    employee_id?: string;
    permissions?: string[];
  };
}

interface EditFormData {
  email: string;
  nombre: string;
  status: 'active' | 'inactive';
  first_name: string;
  last_name: string;
  phone: string;
  department: string;
  employee_id: string;
}

const AuditorEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { getAuditorById, updateAuditor } = useAdmin();

  const [auditor, setAuditor] = useState<AuditorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([]);
  const [selectedObrasSociales, setSelectedObrasSociales] = useState<string[]>([]);
  const [originalObrasSociales, setOriginalObrasSociales] = useState<string[]>([]);

  const [formData, setFormData] = useState<EditFormData>({
    email: '',
    nombre: '',
    status: 'active',
    first_name: '',
    last_name: '',
    phone: '',
    department: '',
    employee_id: ''
  });

  const [originalData, setOriginalData] = useState<EditFormData>({
    email: '',
    nombre: '',
    status: 'active',
    first_name: '',
    last_name: '',
    phone: '',
    department: '',
    employee_id: ''
  });

  // Initialize repository
  const apiClient = new ApiClient();
  const medicoRepository = new HttpMedicoRepository(apiClient);

  // Función para verificar si una obra social está activa
  const isObraSocialActive = (obra: ObraSocial): boolean => {
    const status = obra.status?.toLowerCase();
    return status === 'active' || status === 'activa';
  };

  useEffect(() => {
    if (id) {
      loadAuditorData();
      loadObrasSociales();
    }
  }, [id]);

  useEffect(() => {
    // Detectar cambios comparando con datos originales
    const dataChanged = 
      formData.email !== originalData.email ||
      formData.nombre !== originalData.nombre ||
      formData.status !== originalData.status ||
      formData.first_name !== originalData.first_name ||
      formData.last_name !== originalData.last_name ||
      formData.phone !== originalData.phone ||
      formData.department !== originalData.department ||
      formData.employee_id !== originalData.employee_id;
    
    // Verificar cambios en obras sociales
    const obrasSocialesChanged = 
      selectedObrasSociales.length !== originalObrasSociales.length ||
      selectedObrasSociales.some(id => !originalObrasSociales.includes(id));
    
    setHasChanges(!!dataChanged || obrasSocialesChanged);
  }, [formData, originalData, selectedObrasSociales, originalObrasSociales]);

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

  const loadAuditorData = async () => {
    setLoading(true);
    try {
      const data = await getAuditorById(id!);
      if (!data) {
        showError('Error', 'No se encontró la información del auditor');
        navigate('/admin/users/auditors');
        return;
      }
      
      setAuditor(data);
      
      // Mapear datos al formulario, incluyendo información de auditor_info
      const auditorInfo = data.auditor_info || {};
      
      const mappedData: EditFormData = {
        email: data.email || '',
        nombre: data.nombre || '',
        status: (data.status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
        first_name: auditorInfo.first_name || '',
        last_name: auditorInfo.last_name || '',
        phone: auditorInfo.phone || '',
        department: auditorInfo.department || '',
        employee_id: auditorInfo.employee_id || ''
      };
      
      setFormData(mappedData);
      setOriginalData(mappedData);

      // Cargar obras sociales asociadas
      const currentObrasSociales = data.healthcareProviders?.map(obra => obra.healthcareProviderId) || [];
      setSelectedObrasSociales(currentObrasSociales);
      setOriginalObrasSociales(currentObrasSociales);
      
      setHasChanges(false);
    } catch (error) {
      console.error('Error loading auditor:', error);
      showError('Error', 'No se pudo cargar la información del auditor');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof EditFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasChanges) {
      showError('Sin cambios', 'No hay cambios para guardar');
      return;
    }

    setSaving(true);
    try {
      const updateData: any = {};
      
      // Campos básicos del usuario
      if (formData.email !== (originalData?.email || '')) {
        updateData.email = formData.email;
      }
      if (formData.nombre !== (originalData?.nombre || '')) {
        updateData.nombre = formData.nombre;
      }
      if (formData.status !== (originalData?.status || 'active')) {
        updateData.status = formData.status;
      }

      // Campos específicos del auditor
      if (formData.first_name !== (originalData?.first_name || '')) {
        updateData.first_name = formData.first_name;
      }
      if (formData.last_name !== (originalData?.last_name || '')) {
        updateData.last_name = formData.last_name;
      }
      if (formData.phone !== (originalData?.phone || '')) {
        updateData.phone = formData.phone;
      }
      if (formData.department !== (originalData?.department || '')) {
        updateData.department = formData.department;
      }
      if (formData.employee_id !== (originalData?.employee_id || '')) {
        updateData.employee_id = formData.employee_id;
      }

      // Incluir obras sociales si hubo cambios
      const obrasSocialesChanged = 
        selectedObrasSociales.length !== originalObrasSociales.length ||
        selectedObrasSociales.some(id => !originalObrasSociales.includes(id));
      
      if (obrasSocialesChanged) {
        updateData.healthcare_providers = selectedObrasSociales;
      }

      const result = await updateAuditor(id!, updateData);
      if (result) {
        showSuccess('Auditor actualizado', 'Los datos del auditor se han actualizado correctamente');
        navigate(`/admin/users/auditors/${id}`);
      }
    } catch (error: any) {
      console.error('Error updating auditor:', error);
      
      // Manejar diferentes tipos de errores con mensajes específicos
      let errorTitle = 'Error al actualizar';
      let errorMessage = 'No se pudo actualizar el auditor';
      
      if (error.status === 409) {
        errorTitle = 'Conflicto de datos';
        if (error.message.includes('email')) {
          errorMessage = 'El email ingresado ya está en uso por otro usuario. Por favor, utiliza un email diferente.';
        } else if (error.message.includes('employee_id')) {
          errorMessage = 'El ID de empleado ingresado ya está en uso por otro auditor.';
        } else {
          errorMessage = error.message || 'Los datos ingresados ya están en uso por otro registro.';
        }
      } else if (error.status === 404) {
        errorTitle = 'Auditor no encontrado';
        errorMessage = 'El auditor que intentas actualizar no existe o fue eliminado.';
      } else if (error.status === 400) {
        errorTitle = 'Datos inválidos';
        errorMessage = error.message || 'Los datos ingresados no son válidos. Por favor, revisa la información.';
      } else if (error.status === 403) {
        errorTitle = 'Acceso denegado';
        errorMessage = 'No tienes permisos suficientes para realizar esta operación.';
      } else if (error.status === 0) {
        errorTitle = 'Error de conexión';
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      showError(errorTitle, errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/admin/users/auditors/${id}`);
  };

  const statusOptions = [
    { value: 'active', label: 'Activo', color: 'text-green-600' },
    { value: 'inactive', label: 'Inactivo', color: 'text-red-600' }
  ];

  if (loading) {
    return (
      <BaseLayout title="Editando Auditor">
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner />
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title={`Editar Auditor: ${auditor?.nombre || 'Cargando...'}`}>
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
                Editar Auditor
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                {auditor?.nombre}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline-primary"
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={saving || !hasChanges}
              className="flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>

        {/* Indicador de cambios */}
        {hasChanges && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-amber-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-amber-800 dark:text-amber-200 text-sm font-medium">
                Tienes cambios sin guardar
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
            <div className="flex items-center mb-6">
              <User className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Información Básica
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm 
                           bg-white dark:bg-darkmode-800 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="auditor@ejemplo.com"
                  required
                  disabled={saving}
                />
              </div>

              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Nombre de usuario *
                </label>
                <input
                  type="text"
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm 
                           bg-white dark:bg-darkmode-800 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Nombre de usuario en el sistema"
                  required
                  disabled={saving}
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Estado del usuario
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm 
                           bg-white dark:bg-darkmode-800 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  disabled={saving}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Información del Auditor */}
          <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
            <div className="flex items-center mb-6">
              <Shield className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Información del Auditor
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm 
                           bg-white dark:bg-darkmode-800 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Juan"
                  required
                  disabled={saving}
                />
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Apellido *
                </label>
                <input
                  type="text"
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm 
                           bg-white dark:bg-darkmode-800 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Pérez"
                  required
                  disabled={saving}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Teléfono *
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm 
                           bg-white dark:bg-darkmode-800 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="+54911234567"
                  required
                  disabled={saving}
                />
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  <Building className="w-4 h-4 inline mr-1" />
                  Departamento
                </label>
                <input
                  type="text"
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm 
                           bg-white dark:bg-darkmode-800 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Auditoría Médica"
                  disabled={saving}
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  ID de Empleado
                </label>
                <input
                  type="text"
                  id="employee_id"
                  value={formData.employee_id}
                  onChange={(e) => handleInputChange('employee_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm 
                           bg-white dark:bg-darkmode-800 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="EMP001"
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          {/* Obras Sociales */}
          <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
            <div className="flex items-center mb-6">
              <Shield className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Obras Sociales Asociadas
              </h3>
            </div>

            {/* Obras sociales seleccionadas */}
            {selectedObrasSociales.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Obras sociales asociadas:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedObrasSociales.map((obraSocialId) => (
                    <span
                      key={obraSocialId}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {getObraSocialName(obraSocialId)}
                      <button
                        type="button"
                        onClick={() => removeObraSocial(obraSocialId)}
                        disabled={saving}
                        className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100 disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Selector de obras sociales */}
            <div className="flex gap-2">
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    addObraSocial(e.target.value);
                  }
                }}
                disabled={saving}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300 disabled:opacity-50"
              >
                <option value="">Agregar obra social</option>
                {obrasSociales
                  .filter(obra => !selectedObrasSociales.includes(obra.healthcareProviderId))
                  .map((obra) => (
                    <option key={obra.healthcareProviderId} value={obra.healthcareProviderId}>
                      {obra.name}
                    </option>
                  ))}
              </select>
            </div>

            {selectedObrasSociales.length === 0 && (
              <div className="text-center py-4 text-gray-500 dark:text-slate-400">
                <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay obras sociales asociadas</p>
                <p className="text-xs mt-1">Selecciona las obras sociales que este auditor podrá auditar</p>
              </div>
            )}
          </div>
        </form>
      </div>
    </BaseLayout>
  );
};

export default AuditorEditPage; 