import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader, FolderPlus } from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';
import { useObfuscation } from '../../../../shared/contexts/ObfuscationContext';

const GrupoCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  const { obfuscatedApiClient } = useObfuscation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || undefined
      };
      
      console.log('🚀 Creando grupo:', payload);
      const newGrupo = await obfuscatedApiClient.post('/v1/deposito/grupos', payload);
      console.log('✅ Grupo creado exitosamente:', newGrupo);
      
      navigate('/admin/deposito/grupos');
    } catch (error: any) {
      console.error('❌ Error creating grupo:', error);
      
      // Manejo de errores específicos
      if (error.response?.status === 409) {
        alert(`Ya existe un grupo con el nombre "${formData.nombre}". Por favor, elige un nombre diferente.`);
      } else {
        alert('Error al crear el grupo. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <BaseLayout title="Nuevo Grupo de Artículos">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/admin/deposito/grupos')}
            className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-darkmode-700 rounded-lg transition-colors"
            title="Volver a la lista"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nuevo Grupo de Artículos</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              Crea un nuevo grupo para organizar tus artículos
            </p>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <FolderPlus className="w-5 h-5 mr-2" />
                Información del Grupo
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Nombre del grupo *
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    placeholder="Ej: Medicamentos, Insumos médicos, Equipamiento..."
                    maxLength={100}
                    className="w-full"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                    Máximo 100 caracteres. Debe ser único.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300 resize-none"
                    placeholder="Describe el propósito y contenido de este grupo de artículos..."
                    maxLength={500}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                    Opcional. Máximo 500 caracteres.
                  </p>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                💡 Consejos para crear grupos
              </h4>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Usa nombres descriptivos y únicos para facilitar la búsqueda</li>
                <li>• Los grupos te ayudan a organizar y filtrar artículos relacionados</li>
                <li>• Puedes asociar múltiples artículos a un mismo grupo</li>
                <li>• Un artículo puede pertenecer a varios grupos al mismo tiempo</li>
              </ul>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-darkmode-700">
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => navigate('/admin/deposito/grupos')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.nombre.trim()}
                className="flex items-center"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Creando...' : 'Crear Grupo'}
              </Button>
            </div>
          </form>
        </div>

        {/* Vista previa */}
        {formData.nombre && (
          <div className="bg-gray-50 dark:bg-darkmode-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Vista previa del grupo
            </h4>
            <div className="bg-white dark:bg-darkmode-600 rounded border p-3">
              <div className="flex items-center">
                <FolderPlus className="h-5 w-5 text-gray-400 mr-3" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {formData.nombre}
                  </div>
                  {formData.descripcion && (
                    <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      {formData.descripcion}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default GrupoCreatePage; 