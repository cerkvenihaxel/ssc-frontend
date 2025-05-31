import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, User, Mail, Building, Phone, CreditCard, MapPin } from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import LoadingSpinner from '../../../../shared/components/ui/LoadingSpinner';
import { useToast } from '../../../../shared/components/ui/ToastContainer';
import { useAdmin } from '../../../hooks/useAdmin';
import type { AdminUser, UpdateUserRequest } from '../../../../infrastructure/repositories/HttpAdminRepository';

interface ProviderData extends AdminUser {
  provider_info?: {
    provider_name: string;
    provider_type: string;
    cuit: string;
    contact_name: string;
    contact_phone: string;
    contact_email: string;
  };
}

interface EditFormData {
  email: string;
  nombre: string;
  status: 'active' | 'inactive';
  provider_name: string;
  provider_type: string;
  cuit: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
}

const ProviderEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { getProviderById, updateProvider } = useAdmin();

  const [provider, setProvider] = useState<ProviderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [formData, setFormData] = useState<EditFormData>({
    email: '',
    nombre: '',
    status: 'active',
    provider_name: '',
    provider_type: '',
    cuit: '',
    contact_name: '',
    contact_phone: '',
    contact_email: ''
  });

  const [originalData, setOriginalData] = useState<EditFormData>({
    email: '',
    nombre: '',
    status: 'active',
    provider_name: '',
    provider_type: '',
    cuit: '',
    contact_name: '',
    contact_phone: '',
    contact_email: ''
  });

  useEffect(() => {
    if (id) {
      loadProviderData();
    }
  }, [id]);

  useEffect(() => {
    // Detectar cambios comparando con datos originales
    const dataChanged = 
      formData.email !== originalData.email ||
      formData.nombre !== originalData.nombre ||
      formData.status !== originalData.status ||
      formData.provider_name !== originalData.provider_name ||
      formData.provider_type !== originalData.provider_type ||
      formData.cuit !== originalData.cuit ||
      formData.contact_name !== originalData.contact_name ||
      formData.contact_phone !== originalData.contact_phone ||
      formData.contact_email !== originalData.contact_email;
    
    setHasChanges(!!dataChanged);
  }, [formData, originalData]);

  const loadProviderData = async () => {
    setLoading(true);
    try {
      const providerData = await getProviderById(id!);
      if (providerData) {
        const providerWithInfo = providerData as ProviderData;
        const initialData: EditFormData = {
          email: providerWithInfo.email || '',
          nombre: providerWithInfo.nombre || '',
          status: (providerWithInfo.status || 'active') as 'active' | 'inactive',
          provider_name: providerWithInfo.provider_info?.provider_name || '',
          provider_type: providerWithInfo.provider_info?.provider_type || '',
          cuit: providerWithInfo.provider_info?.cuit || '',
          contact_name: providerWithInfo.provider_info?.contact_name || '',
          contact_phone: providerWithInfo.provider_info?.contact_phone || '',
          contact_email: providerWithInfo.provider_info?.contact_email || ''
        };
        
        setProvider(providerWithInfo);
        setFormData(initialData);
        setOriginalData(initialData);
      }
    } catch (error) {
      console.error('Error loading provider data:', error);
      showError('Error', 'No se pudieron cargar los datos del proveedor');
      navigate('/admin/users/providers');
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

      // Campos específicos del proveedor
      if (formData.provider_name !== (originalData?.provider_name || '')) {
        updateData.provider_name = formData.provider_name;
      }
      if (formData.provider_type !== (originalData?.provider_type || '')) {
        updateData.provider_type = formData.provider_type;
      }
      if (formData.cuit !== (originalData?.cuit || '')) {
        updateData.cuit = formData.cuit;
      }
      if (formData.contact_name !== (originalData?.contact_name || '')) {
        updateData.contact_name = formData.contact_name;
      }
      if (formData.contact_phone !== (originalData?.contact_phone || '')) {
        updateData.contact_phone = formData.contact_phone;
      }
      if (formData.contact_email !== (originalData?.contact_email || '')) {
        updateData.contact_email = formData.contact_email;
      }

      const result = await updateProvider(id!, updateData);
      if (result) {
        showSuccess('Proveedor actualizado', 'Los datos del proveedor se han actualizado correctamente');
        navigate(`/admin/users/providers/${id}`);
      }
    } catch (error: any) {
      console.error('Error updating provider:', error);
      
      // Manejar diferentes tipos de errores con mensajes específicos
      let errorTitle = 'Error al actualizar';
      let errorMessage = 'No se pudo actualizar el proveedor';
      
      if (error.status === 409) {
        errorTitle = 'Conflicto de datos';
        if (error.message.includes('email')) {
          errorMessage = 'El email ingresado ya está en uso por otro usuario. Por favor, utiliza un email diferente.';
        } else if (error.message.includes('CUIT')) {
          errorMessage = 'El CUIT ingresado ya está en uso por otro proveedor. Por favor, verifica el CUIT.';
        } else {
          errorMessage = error.message || 'Los datos ingresados ya están en uso por otro registro.';
        }
      } else if (error.status === 404) {
        errorTitle = 'Proveedor no encontrado';
        errorMessage = 'El proveedor que intentas actualizar no existe o fue eliminado.';
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
    if (hasChanges) {
      if (window.confirm('¿Estás seguro de que quieres cancelar? Se perderán los cambios no guardados.')) {
        navigate(`/admin/users/providers/${id}`);
      }
    } else {
      navigate(`/admin/users/providers/${id}`);
    }
  };

  if (loading) {
    return (
      <BaseLayout title="Editando Proveedor">
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
    <BaseLayout title={`Editar Proveedor: ${provider.nombre || 'Sin nombre'}`}>
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
              {hasChanges ? 'Cancelar' : 'Volver'}
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Editar Proveedor
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                Modifica los datos del proveedor {provider.nombre || 'sin nombre'}
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
              disabled={!hasChanges || saving}
              className="flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>

        {/* Change Indicator */}
        {hasChanges && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-yellow-800 dark:text-yellow-200">
                <strong>Tienes cambios sin guardar.</strong> Recuerda guardar antes de salir.
              </div>
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
                  required
                  disabled={saving}
                />
              </div>

              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm 
                           bg-white dark:bg-darkmode-800 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                  disabled={saving}
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Estado
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm 
                           bg-white dark:bg-darkmode-800 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  disabled={saving}
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Información del Proveedor */}
          <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg p-6">
            <div className="flex items-center mb-6">
              <Building className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Información del Proveedor
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="provider_name" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  <Building className="w-4 h-4 inline mr-1" />
                  Nombre del Proveedor *
                </label>
                <input
                  type="text"
                  id="provider_name"
                  value={formData.provider_name}
                  onChange={(e) => handleInputChange('provider_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm 
                           bg-white dark:bg-darkmode-800 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                  disabled={saving}
                />
              </div>

              <div>
                <label htmlFor="provider_type" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  <Building className="w-4 h-4 inline mr-1" />
                  Tipo de Proveedor *
                </label>
                <input
                  type="text"
                  id="provider_type"
                  value={formData.provider_type}
                  onChange={(e) => handleInputChange('provider_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm 
                           bg-white dark:bg-darkmode-800 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                  disabled={saving}
                />
              </div>

              <div>
                <label htmlFor="cuit" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  <CreditCard className="w-4 h-4 inline mr-1" />
                  CUIT *
                </label>
                <input
                  type="text"
                  id="cuit"
                  value={formData.cuit}
                  onChange={(e) => handleInputChange('cuit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm 
                           bg-white dark:bg-darkmode-800 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                  disabled={saving}
                />
              </div>

              <div>
                <label htmlFor="contact_name" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Nombre del Contacto *
                </label>
                <input
                  type="text"
                  id="contact_name"
                  value={formData.contact_name}
                  onChange={(e) => handleInputChange('contact_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm 
                           bg-white dark:bg-darkmode-800 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                  disabled={saving}
                />
              </div>

              <div>
                <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Teléfono del Contacto *
                </label>
                <input
                  type="text"
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm 
                           bg-white dark:bg-darkmode-800 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                  disabled={saving}
                />
              </div>

              <div>
                <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email del Contacto *
                </label>
                <input
                  type="email"
                  id="contact_email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm 
                           bg-white dark:bg-darkmode-800 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                  disabled={saving}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </BaseLayout>
  );
};

export default ProviderEditPage; 