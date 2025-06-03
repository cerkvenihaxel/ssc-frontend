import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Package, 
  TrendingUp, 
  Calendar, 
  Building2, 
  Loader, 
  Tag,
  DollarSign,
  Warehouse,
  Info
} from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
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
  contactEmail: string;
  contactPhone: string;
  contactName: string;
}

interface GrupoArticulo {
  grupoId: string;
  nombre: string;
  descripcion: string | null;
}

const ArticuloDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { obfuscatedApiClient } = useObfuscation();
  const [articulo, setArticulo] = useState<Articulo | null>(null);
  const [proveedor, setProveedor] = useState<Proveedor | null>(null);
  const [grupos, setGrupos] = useState<GrupoArticulo[]>([]);
  const [loading, setLoading] = useState(true);

  const formatDateDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPrice = (precio: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(precio);
  };

  useEffect(() => {
    const loadArticuloDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        
        console.log('🔍 Cargando artículo con ID:', id);
        const articuloData = await obfuscatedApiClient.get<Articulo>(`/v1/deposito/articulos/${id}`);
        console.log('📦 Artículo cargado:', articuloData);
        setArticulo(articuloData);

        if (articuloData.providerId) {
          try {
            console.log('🏢 Cargando proveedor con ID:', articuloData.providerId);
            const proveedorData = await obfuscatedApiClient.get<Proveedor>(`/v1/proveedores/${articuloData.providerId}`);
            console.log('🏢 Proveedor cargado:', proveedorData);
            setProveedor(proveedorData);
          } catch (proveedorError) {
            console.error('⚠️ Error cargando proveedor:', proveedorError);
          }
        }

        if (articuloData.grupos && articuloData.grupos.length > 0) {
          try {
            console.log('🏷️ Cargando grupos:', articuloData.grupos);
            const gruposData = await obfuscatedApiClient.get<GrupoArticulo[]>('/v1/deposito/grupos');
            console.log('📋 Todos los grupos disponibles:', gruposData);
            const gruposAsociados = gruposData.filter((grupo: GrupoArticulo) => 
              articuloData.grupos?.includes(grupo.grupoId)
            );
            console.log('✅ Grupos asociados encontrados:', gruposAsociados);
            setGrupos(gruposAsociados);
          } catch (error) {
            console.error('❌ Error loading grupos:', error);
          }
        } else {
          console.log('ℹ️ El artículo no tiene grupos asociados');
        }
      } catch (error) {
        console.error('❌ Error loading articulo details:', error);
        setArticulo(null);
      } finally {
        setLoading(false);
      }
    };

    loadArticuloDetails();
  }, [id, obfuscatedApiClient]);

  const getStockStatus = (stock: number | null) => {
    if (!stock || stock === 0) {
      return {
        text: 'Sin stock',
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      };
    } else if (stock <= 10) {
      return {
        text: `Stock bajo (${stock})`,
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      };
    } else {
      return {
        text: `En stock (${stock})`,
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      };
    }
  };

  if (loading) {
    return (
      <BaseLayout title="Detalles del Artículo">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-slate-400">Cargando información del artículo...</span>
        </div>
      </BaseLayout>
    );
  }

  if (!articulo) {
    return (
      <BaseLayout title="Artículo no encontrado">
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Artículo no encontrado</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
            El artículo que busca no existe o ha sido eliminado.
          </p>
          <div className="mt-6">
            <Button
              onClick={() => navigate('/admin/deposito/articulos')}
              variant="outline-primary"
            >
              Volver a la lista
            </Button>
          </div>
        </div>
      </BaseLayout>
    );
  }

  const stockStatus = getStockStatus(articulo.stock);

  const handleEditClick = () => {
    navigate(`/admin/deposito/articulos/${id}/edit`);
  };

  return (
    <BaseLayout title={`${articulo.nombre}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/admin/deposito/articulos')}
              className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-darkmode-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{articulo.nombre}</h1>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Código: {articulo.codigo}
              </p>
            </div>
          </div>
          <Button
            onClick={handleEditClick}
            className="inline-flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-darkmode-600 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
              <div className="flex items-center">
                <Package className="w-6 h-6 text-gray-400 dark:text-slate-500 mr-3" />
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Información del Artículo</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Datos Básicos</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Nombre</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">{articulo.nombre}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Código</dt>
                      <dd className="text-sm text-gray-900 dark:text-white font-mono">{articulo.codigo}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Presentación</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">
                        {articulo.presentacion || 'No especificada'}
                      </dd>
                    </div>
                    {articulo.descripcion && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Descripción</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">{articulo.descripcion}</dd>
                      </div>
                    )}
                  </dl>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Información Comercial</h3>
                  <dl className="space-y-3">
                    <div className="flex items-start">
                      <DollarSign className="w-4 h-4 text-gray-400 dark:text-slate-500 mt-0.5 mr-2" />
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Precio</dt>
                        <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatPrice(articulo.precio)}
                        </dd>
                        {articulo.lastPriceUpdate && (
                          <dd className="text-xs text-gray-500 dark:text-slate-400">
                            Última actualización: {formatDateDisplay(articulo.lastPriceUpdate.toString())}
                          </dd>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Warehouse className="w-4 h-4 text-gray-400 dark:text-slate-500 mt-0.5 mr-2" />
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Stock</dt>
                        <dd className="mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.className}`}>
                            {stockStatus.text}
                          </span>
                        </dd>
                      </div>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
                <div className="flex items-center">
                  <Building2 className="w-6 h-6 text-gray-400 dark:text-slate-500 mr-3" />
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Proveedor</h2>
                </div>
              </div>
              
              <div className="p-6">
                {proveedor ? (
                  <div className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Nombre</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">{proveedor.providerName}</dd>
                    </div>
                    {proveedor.contactEmail && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Email</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">{proveedor.contactEmail}</dd>
                      </div>
                    )}
                    {proveedor.contactPhone && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Teléfono</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">{proveedor.contactPhone}</dd>
                      </div>
                    )}
                    {proveedor.contactName && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Contacto</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">{proveedor.contactName}</dd>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Building2 className="mx-auto h-8 w-8 text-gray-400 dark:text-slate-500" />
                    <p className="mt-2 text-sm text-gray-900 dark:text-white font-medium">
                      {articulo?.providerId ? 'Cargando información del proveedor...' : 'Sin proveedor asignado'}
                    </p>
                    {articulo?.providerId && (
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                        ID: {articulo.providerId}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
                <div className="flex items-center">
                  <Tag className="w-6 h-6 text-gray-400 dark:text-slate-500 mr-3" />
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Grupos</h2>
                </div>
              </div>
              
              <div className="p-6">
                {grupos.length > 0 ? (
                  <div className="space-y-3">
                    {grupos.map((grupo) => (
                      <div key={grupo.grupoId} className="border border-gray-200 dark:border-darkmode-700 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{grupo.nombre}</h4>
                        {grupo.descripcion && (
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                            {grupo.descripcion}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Tag className="mx-auto h-8 w-8 text-gray-400 dark:text-slate-500" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                      No pertenece a ningún grupo
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
            <div className="flex items-center">
              <Info className="w-6 h-6 text-gray-400 dark:text-slate-500 mr-3" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Información del Sistema</h2>
            </div>
          </div>
          
          <div className="p-6">
            <dl className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">ID del artículo</dt>
                <dd className="text-sm text-gray-900 dark:text-white font-mono">{articulo.articuloId}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Fecha de creación</dt>
                <dd className="text-sm text-gray-900 dark:text-white">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    {formatDateDisplay(articulo.createdAt)}
                  </div>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Última actualización</dt>
                <dd className="text-sm text-gray-900 dark:text-white">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    {formatDateDisplay(articulo.updatedAt)}
                  </div>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default ArticuloDetailsPage; 