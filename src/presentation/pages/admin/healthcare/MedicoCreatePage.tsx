import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader, Plus, Trash2 } from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';
import { ApiClient } from '../../../../infrastructure/http/ApiClient';
import { HttpMedicoRepository, type Especialidad, type CreateMedicoRequest } from '../../../../infrastructure/repositories/HttpMedicoRepository';
import { type ObraSocial } from '../../../../infrastructure/repositories/HttpObraSocialRepository';
import { getSpecialtyColorClasses, renderSpecialtyIcon } from '../../../../shared/utils/specialtyIcons';

const MedicoCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([]);
  const [selectedObrasSociales, setSelectedObrasSociales] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    matricula: '',
    especialidadId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    picture: ''
  });

  // Initialize repository
  const apiClient = new ApiClient();
  const medicoRepository = new HttpMedicoRepository(apiClient);

  // Función para verificar si una obra social está activa
  const isObraSocialActive = (obra: ObraSocial): boolean => {
    const status = obra.status?.toLowerCase();
    return status === 'active' || status === 'activa';
  };

  // Cargar especialidades y obras sociales
  useEffect(() => {
    const loadData = async () => {
      try {
        const [especialidadesData, obrasSocialesData] = await Promise.all([
          medicoRepository.getAllEspecialidades(),
          medicoRepository.getAllObrasSociales()
        ]);

        // Filtrar solo especialidades activas
        setEspecialidades(especialidadesData.filter(especialidad => especialidad.activa));
        
        // Filtrar solo obras sociales activas
        setObrasSociales(obrasSocialesData.filter(isObraSocialActive));
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Crear médico con obras sociales
      const createRequest: CreateMedicoRequest = {
        ...formData,
        obrasSociales: selectedObrasSociales
      };

      await medicoRepository.createMedico(createRequest);
      navigate('/admin/healthcare/medicos');
    } catch (error) {
      console.error('Error creating medico:', error);
    } finally {
      setLoading(false);
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

  return (
    <BaseLayout title="Nuevo Médico">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/admin/healthcare/medicos')}
            className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-darkmode-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nuevo Médico</h1>
        </div>

        {/* Formulario */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información profesional */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Información Profesional</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Matrícula *
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.matricula}
                    onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                    placeholder="Ej: 12345"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Especialidad *
                  </label>
                  <select
                    required
                    value={formData.especialidadId}
                    onChange={(e) => setFormData({ ...formData, especialidadId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300"
                  >
                    <option value="">Seleccionar especialidad</option>
                    {especialidades.map((especialidad) => (
                      <option key={especialidad.especialidadId} value={especialidad.especialidadId}>
                        {especialidad.nombre}
                      </option>
                    ))}
                  </select>
                  
                  {/* Mostrar especialidad seleccionada con icono */}
                  {formData.especialidadId && (
                    <div className="mt-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Especialidad seleccionada:</span>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSpecialtyColorClasses(especialidades.find(e => e.especialidadId === formData.especialidadId)?.nombre || '')}`}>
                          {renderSpecialtyIcon(especialidades.find(e => e.especialidadId === formData.especialidadId)?.nombre || '')}
                          {especialidades.find(e => e.especialidadId === formData.especialidadId)?.nombre || 'No encontrada'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Información personal */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Nombre *
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Juan"
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
                    placeholder="Pérez"
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    URL de la foto
                  </label>
                  <Input
                    type="url"
                    value={formData.picture}
                    onChange={(e) => setFormData({ ...formData, picture: e.target.value })}
                    placeholder="https://ejemplo.com/foto.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Obras sociales */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Obras Sociales</h3>
              
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
                      <span className="inline-flex items-center text-sm text-gray-900 dark:text-white">
                        <Plus className="w-4 h-4 mr-2 text-green-600" />
                        {getObraSocialName(obraSocialId)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeObraSocial(obraSocialId)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Eliminar obra social"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => navigate('/admin/healthcare/medicos')}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Crear Médico
              </Button>
            </div>
          </form>
        </div>
      </div>
    </BaseLayout>
  );
};

export default MedicoCreatePage; 