import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  FolderOpen, 
  Calendar, 
  FileText,
  Hash,
  Loader
} from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import { useObfuscation } from '../../../../shared/contexts/ObfuscationContext';

interface GrupoArticulo {
  grupoId: string;
  nombre: string;
  descripcion: string | null;
  createdAt: string;
  updatedAt: string;
}

const GrupoDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [grupo, setGrupo] = useState<GrupoArticulo | null>(null);

  const { obfuscatedApiClient, obfuscateUrl } = useObfuscation();

  // Cargar datos del grupo
  useEffect(() => {
    const loadGrupo = async () => {
      if (!id) return;
      try {
        console.log('🔍 Cargando grupo con ID:', id);
        const data = await obfuscatedApiClient.get<GrupoArticulo>(`/v1/deposito/grupos/${id}`);
        console.log('📁 Grupo cargado:', data);
        setGrupo(data);
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

  const handleDeleteGrupo = async () => {
    if (!grupo) return;
    
    const confirmMessage = `¿Estás seguro de que deseas eliminar el grupo "${grupo.nombre}"?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setDeleting(true);
      await obfuscatedApiClient.delete(`/v1/deposito/grupos/${grupo.grupoId}`);
      console.log('✅ Grupo eliminado exitosamente');
      navigate('/admin/deposito/grupos');
    } catch (error: any) {
      console.error('❌ Error deleting grupo:', error);
      if (error.response?.status === 404) {
        alert('El grupo no fue encontrado. Puede haber sido eliminado previamente.');
        navigate('/admin/deposito/grupos');
      } else {
        alert('Error al eliminar el grupo. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setDeleting(false);
    }
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

  if (loading) {
    return (
      <BaseLayout title="Detalles del Grupo">
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
    <BaseLayout title={`Grupo: ${grupo.nombre}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/admin/deposito/grupos')}
              className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-darkmode-700 rounded-lg transition-colors"
              title="Volver a la lista"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <FolderOpen className="w-6 h-6 mr-3 text-blue-600" />
                {grupo.nombre}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                Detalles del grupo de artículos
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Link
              to={obfuscateUrl(`/admin/deposito/grupos/${grupo.grupoId}/edit`)}
              className="inline-flex items-center px-4 py-2 border border-yellow-300 dark:border-yellow-600 text-sm font-medium rounded-md text-yellow-700 dark:text-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Link>
            <Button
              variant="danger"
              onClick={handleDeleteGrupo}
              disabled={deleting}
              className="flex items-center"
            >
              {deleting ? (
                <Loader className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </div>

        {/* Información principal */}
        <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Información del Grupo
            </h3>
          </div>
          <div className="px-6 py-4">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 flex items-center">
                  <Hash className="w-4 h-4 mr-2" />
                  ID del Grupo
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono">
                  {grupo.grupoId}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 flex items-center">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Nombre
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white font-semibold">
                  {grupo.nombre}
                </dd>
              </div>

              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Descripción
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {grupo.descripcion || (
                    <span className="text-gray-400 italic">Sin descripción</span>
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Fecha de Creación
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {formatDate(grupo.createdAt)}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Última Actualización
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {formatDate(grupo.updatedAt)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default GrupoDetailsPage; 