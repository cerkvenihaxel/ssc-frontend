import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, User, Mail, Phone, Building, Shield, Trash2 } from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import { useToast } from '../../../../shared/components/ui/ToastContainer';
import { useAdmin } from '../../../hooks/useAdmin';
import { ApiClient } from '../../../../infrastructure/http/ApiClient';
import { HttpMedicoRepository } from '../../../../infrastructure/repositories/HttpMedicoRepository';
import { type ObraSocial } from '../../../../infrastructure/repositories/HttpObraSocialRepository';
import type { CreateAuditorRequest } from '../../../../infrastructure/repositories/HttpAdminRepository';

interface CreateFormData {
  email: string;
  nombre: string;
  first_name: string;
  last_name: string;
  phone: string;
  department: string;
  employee_id: string;
}

const AuditorCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { createAuditor } = useAdmin();

  const [creating, setCreating] = useState(false);
  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([]);
  const [selectedObrasSociales, setSelectedObrasSociales] = useState<string[]>([]);
  const [formData, setFormData] = useState<CreateFormData>({
    email: '',
    nombre: '',
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

  // Cargar obras sociales al montar el componente
  useEffect(() => {
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

    loadObrasSociales();
  }, []);

  const handleInputChange = (field: keyof CreateFormData, value: string) => {
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
    
    // Validación básica
    if (!formData.email || !formData.nombre || !formData.first_name || !formData.last_name || !formData.phone) {
      showError('Campos requeridos', 'Por favor completa todos los campos marcados como obligatorios');
      return;
    }

    setCreating(true);
    try {
      const createData: CreateAuditorRequest = {
        email: formData.email,
        nombre: formData.nombre,
        role: 'Auditor',
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        department: formData.department || undefined,
        employee_id: formData.employee_id || undefined,
        permissions: [], // Por defecto sin permisos especiales
        healthcare_providers: selectedObrasSociales // Incluir obras sociales seleccionadas
      };

      const result = await createAuditor(createData);
      if (result) {
        showSuccess('Auditor creado', `El auditor ${formData.nombre} ha sido creado correctamente`);
        navigate('/admin/users/auditors');
      }
    } catch (error: any) {
      console.error('Error creating auditor:', error);
      
      let errorTitle = 'Error al crear';
      let errorMessage = 'No se pudo crear el auditor';
      
      if (error.status === 409) {
        errorTitle = 'Conflicto de datos';
        if (error.message.includes('email')) {
          errorMessage = 'El email ingresado ya está en uso por otro usuario. Por favor, utiliza un email diferente.';
        } else if (error.message.includes('employee_id')) {
          errorMessage = 'El ID de empleado ingresado ya está en uso por otro auditor.';
        } else {
          errorMessage = error.message || 'Los datos ingresados ya están en uso por otro registro.';
        }
      } else if (error.status === 400) {
        errorTitle = 'Datos inválidos';
        errorMessage = error.message || 'Los datos ingresados no son válidos. Por favor, revisa la información.';
      } else if (error.status === 403) {
        errorTitle = 'Acceso denegado';
        errorMessage = 'No tienes permisos suficientes para crear auditores.';
      } else if (error.status === 0) {
        errorTitle = 'Error de conexión';
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      showError(errorTitle, errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/users/auditors');
  };

  const hasData = Object.values(formData).some(value => value.trim() !== '');

  return (
    <BaseLayout title="Crear Nuevo Auditor">
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
                Crear Nuevo Auditor
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                Completa los datos para crear un nuevo auditor
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline-primary"
              onClick={handleCancel}
              disabled={creating}
              className="flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={creating}
              className="flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {creating ? 'Creando...' : 'Crear Auditor'}
            </Button>
          </div>
        </div>

        {/* Información importante */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start">
            <Shield className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-blue-800 dark:text-blue-200">
                <strong>Información importante:</strong>
                <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                  <li>Se generará automáticamente una contraseña temporal que será enviada por email</li>
                  <li>El auditor recibirá un enlace de verificación en su correo electrónico</li>
                  <li>Los permisos especiales pueden asignarse después de la creación</li>
                  <li>El auditor tendrá acceso completo a las funciones de auditoría del sistema</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                />
              </div>

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

            {/* Selector de obra social */}
            <div className="flex gap-3 mb-4">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addObraSocial(e.target.value);
                    e.target.value = '';
                  }
                }}
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

            {/* Lista de obras sociales seleccionadas */}
            {selectedObrasSociales.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300">Obras sociales seleccionadas:</h4>
                {selectedObrasSociales.map((obraSocialId) => (
                  <div key={obraSocialId} className="flex items-center justify-between bg-gray-50 dark:bg-darkmode-700 p-3 rounded-lg">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {getObraSocialName(obraSocialId)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeObraSocial(obraSocialId)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {selectedObrasSociales.length === 0 && (
              <div className="text-center py-4 text-gray-500 dark:text-slate-400">
                <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay obras sociales seleccionadas</p>
                <p className="text-xs mt-1">Selecciona las obras sociales que este auditor podrá auditar</p>
              </div>
            )}
          </div>
        </form>

        {/* Confirmación de datos */}
        {hasData && (
          <div className="bg-gray-50 dark:bg-darkmode-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Resumen de los datos:
            </h4>
            <div className="text-sm text-gray-600 dark:text-slate-400 space-y-1">
              {formData.email && <div><strong>Email:</strong> {formData.email}</div>}
              {formData.nombre && <div><strong>Nombre completo:</strong> {formData.nombre}</div>}
              {formData.first_name && <div><strong>Nombre:</strong> {formData.first_name}</div>}
              {formData.last_name && <div><strong>Apellido:</strong> {formData.last_name}</div>}
              {formData.phone && <div><strong>Teléfono:</strong> {formData.phone}</div>}
              {formData.department && <div><strong>Departamento:</strong> {formData.department}</div>}
              {formData.employee_id && <div><strong>ID de Empleado:</strong> {formData.employee_id}</div>}
            </div>
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default AuditorCreatePage; 