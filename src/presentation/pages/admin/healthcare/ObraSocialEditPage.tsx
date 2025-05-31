import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader } from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';
import { ApiClient } from '../../../../infrastructure/http/ApiClient';
import { HttpObraSocialRepository, type UpdateObraSocialRequest } from '../../../../infrastructure/repositories/HttpObraSocialRepository';

const ObraSocialEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    status: '',
    contactEmail: '',
    contactPhone: '',
    address: ''
  });

  // Initialize repository
  const apiClient = new ApiClient();
  const obraSocialRepository = new HttpObraSocialRepository(apiClient);

  useEffect(() => {
    const loadObraSocial = async () => {
      if (!id) return;
      try {
        const data = await obraSocialRepository.getObraSocialById(id);
        setFormData({
          name: data.name,
          status: data.status,
          contactEmail: data.contactEmail || '',
          contactPhone: data.contactPhone || '',
          address: data.address || ''
        });
      } catch (error) {
        console.error('Error loading obra social:', error);
      } finally {
        setLoading(false);
      }
    };

    loadObraSocial();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    try {
      setSaving(true);
      
      const updateRequest: UpdateObraSocialRequest = {
        name: formData.name,
        status: formData.status,
        contactEmail: formData.contactEmail || undefined,
        contactPhone: formData.contactPhone || undefined,
        address: formData.address || undefined
      };

      await obraSocialRepository.updateObraSocial(id, updateRequest);
      navigate('/admin/healthcare/obras-sociales');
    } catch (error) {
      console.error('Error updating obra social:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <BaseLayout title="Editar Obra Social">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-slate-400">Cargando información de la obra social...</span>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Editar Obra Social">
      <div className="space-y-6">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/admin/healthcare/obras-sociales')}
            className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-darkmode-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Editar Obra Social</h1>
        </div>

        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Nombre *
                </label>
                <Input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: OSDE"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Estado *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300"
                >
                  <option value="">Seleccionar estado</option>
                  <option value="ACTIVA">Activa</option>
                  <option value="INACTIVA">Inactiva</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="contacto@obrasocial.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Teléfono
                </label>
                <Input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="+54911234567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Dirección
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300"
                placeholder="Dirección completa de la obra social..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => navigate('/admin/healthcare/obras-sociales')}
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

export default ObraSocialEditPage; 