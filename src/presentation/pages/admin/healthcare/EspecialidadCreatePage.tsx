import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader } from 'lucide-react';
import { useAdmin } from '../../../hooks/useAdmin';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';

const EspecialidadCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { createEspecialidad } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    codigo: '',
    activa: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createEspecialidad(formData);
      navigate('/admin/healthcare/especialidades');
    } catch (error) {
      console.error('Error creating especialidad:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseLayout title="Nueva Especialidad">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/admin/healthcare/especialidades')}
            className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-darkmode-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nueva Especialidad</h1>
        </div>

        {/* Formulario */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Nombre *
              </label>
              <Input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Cardiología"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Código
              </label>
              <Input
                type="text"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                placeholder="Ej: CARD"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300"
                placeholder="Descripción de la especialidad..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="activa"
                checked={formData.activa}
                onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="activa" className="text-sm text-gray-700 dark:text-slate-300">
                Especialidad activa
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => navigate('/admin/healthcare/especialidades')}
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
                Crear Especialidad
              </Button>
            </div>
          </form>
        </div>
      </div>
    </BaseLayout>
  );
};

export default EspecialidadCreatePage; 