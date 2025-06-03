import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Loader,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
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

const ArticulosPage: React.FC = () => {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [proveedorFilter, setProveedorFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [priceRangeFilter, setPriceRangeFilter] = useState<string>('all');

  // Use the obfuscated API client from context
  const { obfuscatedApiClient } = useObfuscation();

  // Cargar artículos
  const loadArticulos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('searchTerm', searchTerm);
      if (proveedorFilter !== 'all') params.append('providerId', proveedorFilter);
      if (stockFilter === 'in_stock') params.append('inStock', 'true');
      else if (stockFilter === 'out_of_stock') params.append('inStock', 'false');
      
      const endpoint = `/v1/deposito/articulos?${params.toString()}`;
      const data = await obfuscatedApiClient.get<Articulo[]>(endpoint);
      setArticulos(data);
    } catch (err: any) {
      console.error('Error loading articulos:', err);
      setError(err.message || 'Error al cargar los artículos');
    } finally {
      setLoading(false);
    }
  };

  // Cargar proveedores para el filtro
  const loadProveedores = async () => {
    try {
      const data = await obfuscatedApiClient.get<Proveedor[]>('/v1/proveedores');
      setProveedores(data);
    } catch (error) {
      console.error('Error loading proveedores:', error);
    }
  };

  useEffect(() => {
    loadProveedores();
  }, []);

  useEffect(() => {
    loadArticulos();
  }, [searchTerm, proveedorFilter, stockFilter]);

  // Filtros locales adicionales
  const filteredArticulos = articulos.filter(articulo => {
    if (priceRangeFilter !== 'all') {
      const precio = articulo.precio;
      switch (priceRangeFilter) {
        case 'low':
          if (precio >= 1000) return false;
          break;
        case 'medium':
          if (precio < 1000 || precio >= 5000) return false;
          break;
        case 'high':
          if (precio < 5000) return false;
          break;
      }
    }
    return true;
  });

  // Estadísticas
  const stats = {
    total: articulos.length,
    inStock: articulos.filter(a => a.stock && a.stock > 0).length,
    outOfStock: articulos.filter(a => !a.stock || a.stock === 0).length,
    avgPrice: articulos.length > 0 ? articulos.reduce((sum, a) => sum + a.precio, 0) / articulos.length : 0
  };

  // Manejar eliminación
  const handleDelete = async (id: string, nombre: string) => {
    if (!window.confirm(`¿Está seguro de eliminar el artículo "${nombre}"?`)) {
      return;
    }

    try {
      await obfuscatedApiClient.delete(`/v1/deposito/articulos/${id}`);
      await loadArticulos();
    } catch (err: any) {
      console.error('Error deleting articulo:', err);
      setError(err.message || 'Error al eliminar el artículo');
    }
  };

  const formatPrice = (precio: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(precio);
  };

  const getStockBadge = (stock: number | null) => {
    if (!stock || stock === 0) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          Sin stock
        </span>
      );
    } else if (stock <= 10) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          Stock bajo ({stock})
        </span>
      );
    } else {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          En stock ({stock})
        </span>
      );
    }
  };

  // Función para obtener el nombre del proveedor
  const getProveedorName = (providerId: string) => {
    const proveedor = proveedores.find(p => p.providerId === providerId);
    return proveedor?.providerName || 'Sin proveedor';
  };

  if (loading) {
    return (
      <BaseLayout title="Artículos de Depósito">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-slate-400">Cargando artículos...</span>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Artículos de Depósito">
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Artículos de Depósito</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              Gestión de artículos del depósito ({stats.total} artículos)
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={() => window.location.href = '/admin/deposito/articulos/create'}
              className="inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Artículo
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">Total Artículos</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">En Stock</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{stats.inStock}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">Sin Stock</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{stats.outOfStock}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">Precio Promedio</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {formatPrice(stats.avgPrice)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar artículos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro por proveedor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Proveedor
              </label>
              <select
                value={proveedorFilter}
                onChange={(e) => setProveedorFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300"
              >
                <option value="all">Todos los proveedores</option>
                {proveedores.map((proveedor) => (
                  <option key={proveedor.providerId} value={proveedor.providerId}>
                    {proveedor.providerName}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Stock
              </label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300"
              >
                <option value="all">Todos</option>
                <option value="in_stock">En stock</option>
                <option value="out_of_stock">Sin stock</option>
              </select>
            </div>

            {/* Filtro por rango de precios */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Precio
              </label>
              <select
                value={priceRangeFilter}
                onChange={(e) => setPriceRangeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300"
              >
                <option value="all">Todos los precios</option>
                <option value="low">Hasta $1,000</option>
                <option value="medium">$1,000 - $5,000</option>
                <option value="high">Más de $5,000</option>
              </select>
            </div>

            {/* Botón de refrescar */}
            <div className="flex items-end">
              <Button
                onClick={loadArticulos}
                disabled={loading}
                variant="outline-primary"
                className="w-full"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Refrescar'
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mensajes de error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de artículos */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-darkmode-400">
              <thead className="bg-gray-50 dark:bg-darkmode-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Artículo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Presentación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-darkmode-600 divide-y divide-gray-200 dark:divide-darkmode-400">
                {filteredArticulos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                      <Package className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay artículos</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                        {searchTerm || proveedorFilter !== 'all' || stockFilter !== 'all' || priceRangeFilter !== 'all'
                          ? 'No se encontraron artículos con los filtros aplicados.'
                          : 'Comience agregando un nuevo artículo.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredArticulos.map((articulo) => (
                    <tr key={articulo.articuloId} className="hover:bg-gray-50 dark:hover:bg-darkmode-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {articulo.nombre}
                          </div>
                          {articulo.descripcion && (
                            <div className="text-sm text-gray-500 dark:text-slate-400 truncate max-w-xs">
                              {articulo.descripcion}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white font-mono">
                          {articulo.codigo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatPrice(articulo.precio)}
                        </div>
                        {articulo.lastPriceUpdate && (
                          <div className="text-xs text-gray-500 dark:text-slate-400">
                            Actualizado: {new Date(articulo.lastPriceUpdate).toLocaleDateString('es-ES')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStockBadge(articulo.stock)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {articulo.presentacion || 'No especificada'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {getProveedorName(articulo.providerId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/admin/deposito/articulos/${articulo.articuloId}`}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/deposito/articulos/${articulo.articuloId}/edit`}
                            className="text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-300 p-1 rounded hover:bg-gray-50 dark:hover:bg-darkmode-700"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(articulo.articuloId, articulo.nombre)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumen de resultados */}
        {filteredArticulos.length > 0 && (
          <div className="text-sm text-gray-500 dark:text-slate-400 text-center">
            Mostrando {filteredArticulos.length} de {articulos.length} artículos
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default ArticulosPage; 