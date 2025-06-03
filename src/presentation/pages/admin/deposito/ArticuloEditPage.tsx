import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader, Plus, X } from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';
import { useObfuscation } from '../../../../shared/contexts/ObfuscationContext';

interface Articulo {
  articuloId: string;
  providerId: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  presentacion: string | null;
  precio: number;
  stock: number | null;
  lastPriceUpdate: Date | null;
  createdAt: string;
  updatedAt: string;
  grupos?: string[];
}

interface Proveedor {
  providerId: string;
  providerName: string;
  status: string;
}

interface GrupoArticulo {
  grupoId: string;
  nombre: string;
  descripcion: string | null;
}

const ArticuloEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { obfuscatedApiClient } = useObfuscation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingProveedores, setLoadingProveedores] = useState(true);
  const [loadingGrupos, setLoadingGrupos] = useState(true);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [grupos, setGrupos] = useState<GrupoArticulo[]>([]);
  const [selectedGrupos, setSelectedGrupos] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    providerId: '',
    codigo: '',
    nombre: '',
    descripcion: '',
    presentacion: '',
    precio: '',
    stock: '',
    idMarca: '',
    precioComSiva: '',
    precioVtaSiva: ''
  });

  // Función para verificar si un proveedor está activo
  const isProveedorActive = (proveedor: Proveedor): boolean => {
    const status = proveedor.status?.toLowerCase();
    return status === 'active' || status === 'activo';
  };

  // Cargar proveedores para el select
  useEffect(() => {
    const loadProveedores = async () => {
      try {
        const data = await obfuscatedApiClient.get<Proveedor[]>('/v1/proveedores');
        setProveedores(data.filter(isProveedorActive));
      } catch (error) {
        console.error('Error loading proveedores:', error);
      } finally {
        setLoadingProveedores(false);
      }
    };

    loadProveedores();
  }, []);

  // Cargar grupos para el select
  useEffect(() => {
    const loadGrupos = async () => {
      try {
        const data = await obfuscatedApiClient.get<GrupoArticulo[]>('/v1/deposito/grupos');
        setGrupos(data);
      } catch (error) {
        console.error('Error loading grupos:', error);
      } finally {
        setLoadingGrupos(false);
      }
    };

    loadGrupos();
  }, []);

  // Cargar datos del artículo
  useEffect(() => {
    const loadArticulo = async () => {
      if (!id) return;
      try {
        console.log('🔍 Cargando artículo con ID:', id);
        const data = await obfuscatedApiClient.get<Articulo>(`/v1/deposito/articulos/${id}`);
        console.log('📦 Artículo cargado:', data);
        
        setFormData({
          providerId: data.providerId,
          codigo: data.codigo,
          nombre: data.nombre,
          descripcion: data.descripcion || '',
          presentacion: data.presentacion || '',
          precio: data.precio.toString(),
          stock: data.stock?.toString() || '0',
          idMarca: '', // Este dato viene de la tabla articulos_detalles
          precioComSiva: '', // Este dato viene de la tabla articulos_detalles
          precioVtaSiva: '' // Este dato viene de la tabla articulos_detalles
        });

        if (data.grupos && data.grupos.length > 0) {
          setSelectedGrupos(data.grupos);
        }
      } catch (error) {
        console.error('❌ Error loading articulo:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArticulo();
  }, [id, obfuscatedApiClient]);

  const addGrupo = (grupoId: string) => {
    if (!selectedGrupos.includes(grupoId)) {
      setSelectedGrupos([...selectedGrupos, grupoId]);
    }
  };

  const removeGrupo = (grupoId: string) => {
    setSelectedGrupos(selectedGrupos.filter(id => id !== grupoId));
  };

  const getGrupoName = (id: string) => {
    const grupo = grupos.find(g => g.grupoId === id);
    return grupo?.nombre || 'Desconocido';
  };

  // Función para obtener el nombre del proveedor seleccionado
  const getSelectedProveedorName = () => {
    if (!formData.providerId) return 'Sin proveedor seleccionado';
    const proveedor = proveedores.find(p => p.providerId === formData.providerId);
    return proveedor?.providerName || 'Proveedor no encontrado';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    try {
      setSaving(true);
      
      const payload = {
        ...formData,
        precio: parseFloat(formData.precio) || 0,
        stock: parseInt(formData.stock) || 0,
        gruposIds: selectedGrupos
      };
      
      console.log('💾 Actualizando artículo:', payload);
      await obfuscatedApiClient.put(`/v1/deposito/articulos/${id}`, payload);
      console.log('✅ Artículo actualizado exitosamente');

      navigate('/admin/deposito/articulos');
    } catch (error) {
      console.error('❌ Error updating articulo:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <BaseLayout title="Editar Artículo">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-slate-400">Cargando información del artículo...</span>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Editar Artículo">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/admin/deposito/articulos')}
            className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-darkmode-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Editar Artículo</h1>
        </div>

        {/* Formulario */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Información Básica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Proveedor *
                  </label>
                  {loadingProveedores ? (
                    <div className="flex items-center p-3 border border-gray-300 dark:border-darkmode-800 rounded-lg dark:bg-darkmode-800">
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      <span className="text-gray-500 dark:text-slate-400">Cargando proveedores...</span>
                    </div>
                  ) : (
                    <div>
                      <select
                        required
                        value={formData.providerId}
                        onChange={(e) => setFormData({ ...formData, providerId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300"
                      >
                        <option value="">Seleccionar proveedor</option>
                        {proveedores.map((proveedor) => (
                          <option key={proveedor.providerId} value={proveedor.providerId}>
                            {proveedor.providerName}
                          </option>
                        ))}
                      </select>
                      {formData.providerId && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                          Proveedor seleccionado: <span className="font-medium">{getSelectedProveedorName()}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Código *
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    placeholder="Ej: MED001"
                    maxLength={20}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Nombre *
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Paracetamol 500mg"
                    maxLength={255}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300"
                    placeholder="Descripción detallada del artículo..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Presentación
                  </label>
                  <Input
                    type="text"
                    value={formData.presentacion}
                    onChange={(e) => setFormData({ ...formData, presentacion: e.target.value })}
                    placeholder="Ej: Caja x 20 comprimidos"
                    maxLength={255}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Stock
                  </label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="Ej: 100"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Información de precios */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Información de Precios</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Precio *
                  </label>
                  <Input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    placeholder="Ej: 1250.50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Precio de compra (con IVA)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precioComSiva}
                    onChange={(e) => setFormData({ ...formData, precioComSiva: e.target.value })}
                    placeholder="Ej: 1000.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Precio de venta (con IVA)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precioVtaSiva}
                    onChange={(e) => setFormData({ ...formData, precioVtaSiva: e.target.value })}
                    placeholder="Ej: 1250.50"
                  />
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Información Adicional</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    ID de la marca
                  </label>
                  <Input
                    type="number"
                    value={formData.idMarca}
                    onChange={(e) => setFormData({ ...formData, idMarca: e.target.value })}
                    placeholder="Ej: 1"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Grupos */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Grupos de Artículos</h3>
              
              {/* Grupos seleccionados */}
              {selectedGrupos.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Grupos asociados:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedGrupos.map((grupoId) => (
                      <span
                        key={grupoId}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {getGrupoName(grupoId)}
                        <button
                          type="button"
                          onClick={() => removeGrupo(grupoId)}
                          className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Selector de grupos */}
              {loadingGrupos ? (
                <div className="flex items-center p-3 border border-gray-300 dark:border-darkmode-800 rounded-lg dark:bg-darkmode-800">
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-gray-500 dark:text-slate-400">Cargando grupos...</span>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Agregar grupo
                  </label>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        addGrupo(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300"
                  >
                    <option value="">Seleccionar grupo para agregar</option>
                    {grupos
                      .filter(grupo => !selectedGrupos.includes(grupo.grupoId))
                      .map((grupo) => (
                        <option key={grupo.grupoId} value={grupo.grupoId}>
                          {grupo.nombre}
                        </option>
                      ))}
                  </select>
                  {grupos.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
                      No hay grupos disponibles.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => navigate('/admin/deposito/articulos')}
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

export default ArticuloEditPage; 