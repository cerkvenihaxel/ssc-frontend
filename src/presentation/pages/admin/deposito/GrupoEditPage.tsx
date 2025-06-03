import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader, FolderOpen } from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';
import { useObfuscation } from '../../../../shared/contexts/ObfuscationContext';

interface GrupoArticulo {
  grupoId: string;
  nombre: string;
  descripcion: string | null;
  createdAt: string;
  updatedAt: string;
}

const GrupoEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [grupo, setGrupo] = useState<GrupoArticulo | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  const { obfuscatedApiClient } = useObfuscation();

  // Cargar datos del grupo
  useEffect(() => {
    const loadGrupo = async () => {
      if (!id) return;
      try {
        console.log('🔍 Cargando grupo con ID:', id);
        const data = await obfuscatedApiClient.get<GrupoArticulo>(`/v1/deposito/grupos/${id}`);
        console.log('📁 Grupo cargado:', data);
        
        setGrupo(data);
        setFormData({
          nombre: data.nombre,
          descripcion: data.descripcion || ''
        });
      } catch (error) {
        console.error('❌ Error loading grupo:', error);
        alert('Error al cargar el grupo. Por favor, inténtalo de nuevo.');
        navigate('/admin/deposito/grupos');
      } finally {
        setLoading(false);
      }
    };

    loadGrupo();
  }, [id, obfuscatedApiClient, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    try {
      setSaving(true);
      
      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || undefined
      };
      
      console.log('💾 Actualizando grupo:', payload);
      const updatedGrupo = await obfuscatedApiClient.put(`/v1/deposito/grupos/${id}`, payload);
      console.log('✅ Grupo actualizado exitosamente:', updatedGrupo);

      navigate('/admin/deposito/grupos');
    } catch (error: any) {
      console.error('❌ Error updating grupo:', error);
      
      // Manejo de errores específicos
      if (error.response?.status === 409) {
        alert(`Ya existe un grupo con el nombre "${formData.nombre}". Por favor, elige un nombre diferente.`);
      } else if (error.response?.status === 404) {
        alert('El grupo no fue encontrado. Puede haber sido eliminado.');
        navigate('/admin/deposito/grupos');
      } else {
        alert('Error al actualizar el grupo. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hasChanges = grupo && (
    formData.nombre !== grupo.nombre ||
    formData.descripcion !== (grupo.descripcion || '')
  );

  if (loading) {
    return (
      <BaseLayout title="Editar Grupo de Artículos">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-slate-400">Cargando información del grupo...</span>
        </div>
      </BaseLayout>
    );
  }

  if (!grupo) {
    return (
      <BaseLayout title="Grupo no encontrado">
        <div className="text-center py-12">
          <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Grupo no encontrado</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            El grupo que estás buscando no existe o ha sido eliminado.
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate('/admin/deposito/grupos')}>
              Volver a la lista
            </Button>
          </div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Editar Grupo de Artículos">
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Editar Grupo de Artículos</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              Modificar la información del grupo "{grupo.nombre}"
            </p>
          </div>
        </div>

        {/* Información del sistema */}
        <div className="bg-gray-50 dark:bg-darkmode-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Información del sistema
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-slate-400">
            <div>
              <span className="font-medium">ID:</span> {grupo.grupoId}
            </div>
            <div>
              <span className="font-medium">Creado:</span> {formatDate(grupo.createdAt)}
            </div>
            <div className="md:col-span-2">
              <span className="font-medium">Última actualización:</span> {formatDate(grupo.updatedAt)}
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <FolderOpen className="w-5 h-5 mr-2" />
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

            {/* Indicador de cambios */}
            {hasChanges && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Tienes cambios sin guardar
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                      <p>Asegúrate de guardar los cambios antes de salir de esta página.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-darkmode-700">
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => navigate('/admin/deposito/grupos')}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving || !formData.nombre.trim() || !hasChanges}
                className="flex items-center"
              >
                {saving ? (
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? 'Guardando...' : 'Guardar Cambios'}
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
                <FolderOpen className="h-5 w-5 text-gray-400 mr-3" />
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

export default GrupoEditPage; 