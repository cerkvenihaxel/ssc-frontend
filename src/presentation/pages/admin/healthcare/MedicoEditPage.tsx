import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader, X, Plus } from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';
import { ApiClient } from '../../../../infrastructure/http/ApiClient';
import { HttpMedicoRepository, type Medico, type Especialidad, type UpdateMedicoRequest } from '../../../../infrastructure/repositories/HttpMedicoRepository';
import { type ObraSocial } from '../../../../infrastructure/repositories/HttpObraSocialRepository';

const MedicoEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingEspecialidades, setLoadingEspecialidades] = useState(true);
  const [loadingObrasSociales, setLoadingObrasSociales] = useState(true);
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
    const loadEspecialidades = async () => {
      try {
        const data = await medicoRepository.getAllEspecialidades();
        // Filtrar solo especialidades activas
        setEspecialidades(data.filter(especialidad => especialidad.activa));
      } catch (error) {
        console.error('Error loading especialidades:', error);
      } finally {
        setLoadingEspecialidades(false);
      }
    };

    const loadObrasSociales = async () => {
      try {
        const data = await medicoRepository.getAllObrasSociales();
        // Filtrar solo obras sociales activas
        setObrasSociales(data.filter(isObraSocialActive));
      } catch (error) {
        console.error('Error loading obras sociales:', error);
      } finally {
        setLoadingObrasSociales(false);
      }
    };

    loadEspecialidades();
    loadObrasSociales();
  }, []);

  // Cargar datos del médico
  useEffect(() => {
    const loadMedico = async () => {
      if (!id) return;
      try {
        const data = await medicoRepository.getMedicoById(id);
        setFormData({
          matricula: data.matricula,
          especialidadId: data.especialidadId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || '',
          picture: data.picture || ''
        });

        // Cargar obras sociales asociadas
        const obrasSocialesIds = await medicoRepository.getObrasSocialesAssociated(id);
        setSelectedObrasSociales(obrasSocialesIds);

      } catch (error) {
        console.error('Error loading medico:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMedico();
  }, [id]);

  const handleAddObraSocial = (obraSocialId: string) => {
    if (!selectedObrasSociales.includes(obraSocialId)) {
      setSelectedObrasSociales([...selectedObrasSociales, obraSocialId]);
    }
  };

  const handleRemoveObraSocial = (obraSocialId: string) => {
    setSelectedObrasSociales(selectedObrasSociales.filter(osId => osId !== obraSocialId));
  };

  const getObraSocialName = (obraSocialId: string) => {
    const obra = obrasSociales.find(o => o.healthcareProviderId === obraSocialId);
    return obra?.name || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    try {
      setSaving(true);
      
      // Actualizar datos básicos del médico
      const updateRequest: UpdateMedicoRequest = formData;
      await medicoRepository.updateMedico(id, updateRequest);

      // Obtener obras sociales actuales
      const currentObrasSociales = await medicoRepository.getObrasSocialesAssociated(id);

      // Agregar nuevas asociaciones
      const toAdd = selectedObrasSociales.filter(osId => !currentObrasSociales.includes(osId));
      for (const obraSocialId of toAdd) {
        await medicoRepository.associateWithObraSocial(id, obraSocialId);
      }

      // Eliminar asociaciones
      const toRemove = currentObrasSociales.filter(osId => !selectedObrasSociales.includes(osId));
      for (const obraSocialId of toRemove) {
        await medicoRepository.dissociateFromObraSocial(id, obraSocialId);
      }

      navigate('/admin/healthcare/medicos');
    } catch (error) {
      console.error('Error updating medico:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <BaseLayout title="Editar Médico">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-slate-400">Cargando información del médico...</span>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Editar Médico">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/admin/healthcare/medicos')}
            className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-darkmode-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Editar Médico</h1>
        </div>

        {/* Formulario */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Profesional */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Información Profesional</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  {loadingEspecialidades ? (
                    <div className="flex items-center p-3 border border-gray-300 dark:border-darkmode-800 rounded-lg dark:bg-darkmode-800">
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      <span className="text-gray-500 dark:text-slate-400">Cargando especialidades...</span>
                    </div>
                  ) : (
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
                  )}
                </div>
              </div>
            </div>

            {/* Información Personal */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    Foto (URL)
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

            {/* Obras Sociales */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Obras Sociales</h3>
              
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
                          onClick={() => handleRemoveObraSocial(obraSocialId)}
                          className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Selector de obras sociales */}
              {loadingObrasSociales ? (
                <div className="flex items-center p-3 border border-gray-300 dark:border-darkmode-800 rounded-lg dark:bg-darkmode-800">
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-gray-500 dark:text-slate-400">Cargando obras sociales...</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select
                    value=""
                    onChange={(e) => handleAddObraSocial(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300"
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
              )}
            </div>

            {/* Botones */}
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

export default MedicoEditPage; 