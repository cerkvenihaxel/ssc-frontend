import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader, Plus, X } from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';
import DatePicker from '../../../../shared/components/ui/DatePicker';
import { useObfuscation } from '../../../../shared/contexts/ObfuscationContext';

interface Afiliado {
  id: string;
  affiliateNumber: string;
  cuil: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  affiliateStatus: string;
  documentType: string;
  documentNumber: string;
  documentCountry: string;
  nationality: string;
  healthcareProviders?: ObraSocial[];
}

interface ObraSocial {
  healthcareProviderId: string;
  name: string;
  status: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
}

// Funciones utilitarias para formatear fechas
const formatDateForDisplay = (isoDate: string): string => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatDateForAPI = (displayDate: string): string => {
  if (!displayDate) return '';
  const [day, month, year] = displayDate.split('/');
  if (!day || !month || !year || year.length !== 4) return '';
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const AfiliadoEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { obfuscatedApiClient } = useObfuscation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingObrasSociales, setLoadingObrasSociales] = useState(true);
  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([]);
  const [selectedObrasSociales, setSelectedObrasSociales] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    affiliateNumber: '',
    cuil: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: '',
    documentType: 'DNI',
    documentNumber: '',
    documentCountry: 'Argentina',
    nationality: 'Argentina',
    affiliateStatus: 'ACTIVE'
  });

  // Función para verificar si una obra social está activa
  const isObraSocialActive = (obra: ObraSocial): boolean => {
    const status = obra.status?.toLowerCase();
    return status === 'active' || status === 'activa';
  };

  // Cargar obras sociales para el select
  useEffect(() => {
    const loadObrasSociales = async () => {
      try {
        console.log('🏥 Cargando obras sociales...');
        const data = await obfuscatedApiClient.get<ObraSocial[]>('/v1/obras-sociales');
        console.log('📋 Obras sociales cargadas:', data);
        setObrasSociales(data.filter((obra: ObraSocial) => 
          isObraSocialActive(obra)
        ));
      } catch (error) {
        console.error('Error loading obras sociales:', error);
      } finally {
        setLoadingObrasSociales(false);
      }
    };

    loadObrasSociales();
  }, [obfuscatedApiClient]);

  useEffect(() => {
    const loadAfiliado = async () => {
      try {
        console.log('🔍 Cargando afiliado con ID:', id);
        const data = await obfuscatedApiClient.get<Afiliado>(`/v1/afiliados/${id}`);
        console.log('👤 Afiliado cargado:', data);
        
        setFormData({
          affiliateNumber: data.affiliateNumber,
          cuil: data.cuil,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || '',
          birthDate: data.birthDate ? formatDateForDisplay(data.birthDate) : '', // Convertir a formato dd/mm/yyyy
          gender: data.gender,
          documentType: data.documentType || 'DNI',
          documentNumber: data.documentNumber,
          documentCountry: data.documentCountry || 'Argentina',
          nationality: data.nationality || 'Argentina',
          affiliateStatus: data.affiliateStatus
        });

        // Set selected obras sociales if the afiliado has any
        if (data.healthcareProviders && data.healthcareProviders.length > 0) {
          setSelectedObrasSociales(data.healthcareProviders.map(obra => obra.healthcareProviderId));
        }
      } catch (error) {
        console.error('Error loading afiliado:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAfiliado();
  }, [id, obfuscatedApiClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    try {
      setSaving(true);
      
      const payload = {
        ...formData,
        birthDate: formatDateForAPI(formData.birthDate), // Convertir a formato ISO
        healthcareProviderIds: selectedObrasSociales
      };
      
      console.log('💾 Actualizando afiliado:', payload);
      await obfuscatedApiClient.put(`/v1/afiliados/${id}`, payload);
      console.log('✅ Afiliado actualizado exitosamente');

      navigate('/admin/healthcare/afiliados');
    } catch (error) {
      console.error('Error updating afiliado:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <BaseLayout title="Editar Afiliado">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-slate-400">Cargando información del afiliado...</span>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Editar Afiliado">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/admin/healthcare/afiliados')}
            className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-darkmode-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Editar Afiliado</h1>
        </div>

        {/* Formulario */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Número de Afiliado *
                </label>
                <Input
                  type="text"
                  required
                  value={formData.affiliateNumber}
                  onChange={(e) => setFormData({ ...formData, affiliateNumber: e.target.value })}
                  placeholder="Ej: 12345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  CUIL *
                </label>
                <Input
                  type="text"
                  required
                  value={formData.cuil}
                  onChange={(e) => setFormData({ ...formData, cuil: e.target.value })}
                  placeholder="Ej: 20-12345678-9"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Nombre *
                </label>
                <Input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Ej: Juan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Apellido *
                </label>
                <Input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Ej: Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Email *
                </label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="juan.perez@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Teléfono
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+54911234567"
                />
              </div>

              <div>
                <DatePicker
                  label="Fecha de Nacimiento *"
                  required
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Género *
                </label>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300"
                >
                  <option value="">Seleccionar género</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Número de Documento *
                </label>
                <Input
                  type="text"
                  required
                  value={formData.documentNumber}
                  onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                  placeholder="Ej: 12345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Nacionalidad
                </label>
                <Input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  placeholder="Argentina"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  País del Documento
                </label>
                <Input
                  type="text"
                  value={formData.documentCountry}
                  onChange={(e) => setFormData({ ...formData, documentCountry: e.target.value })}
                  placeholder="Argentina"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Estado
                </label>
                <select
                  value={formData.affiliateStatus}
                  onChange={(e) => setFormData({ ...formData, affiliateStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300"
                >
                  <option value="ACTIVE">Activo</option>
                  <option value="INACTIVE">Inactivo</option>
                  <option value="SUSPENDED">Suspendido</option>
                </select>
              </div>
            </div>

            {/* Sección de Obras Sociales */}
            <div className="border-t border-gray-200 dark:border-darkmode-400 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Obras Sociales</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Seleccionar Obras Sociales
                </label>
                {loadingObrasSociales ? (
                  <div className="flex items-center p-3 border border-gray-300 dark:border-darkmode-800 rounded-lg dark:bg-darkmode-800">
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    <span className="text-gray-500 dark:text-slate-400">Cargando obras sociales...</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 dark:border-darkmode-800 rounded-lg p-3 dark:bg-darkmode-800">
                    {obrasSociales.length === 0 ? (
                      <p className="text-gray-500 dark:text-slate-400 text-sm">No hay obras sociales disponibles</p>
                    ) : (
                      obrasSociales.map((obra) => (
                        <label key={obra.healthcareProviderId} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedObrasSociales.includes(obra.healthcareProviderId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedObrasSociales([...selectedObrasSociales, obra.healthcareProviderId]);
                              } else {
                                setSelectedObrasSociales(selectedObrasSociales.filter(id => id !== obra.healthcareProviderId));
                              }
                            }}
                            className="mr-2 rounded border-gray-300 dark:border-darkmode-700 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-900 dark:text-white">{obra.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                )}
                {selectedObrasSociales.length > 0 && (
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
                    {selectedObrasSociales.length} obra(s) social(es) seleccionada(s)
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => navigate('/admin/healthcare/afiliados')}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex items-center"
              >
                {saving ? (
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Guardar Cambios
              </Button>
            </div>
          </form>
        </div>
      </div>
    </BaseLayout>
  );
};

export default AfiliadoEditPage; 