import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Loader } from 'lucide-react';
import { useAdmin } from '../../../hooks/useAdmin';
import type { Especialidad } from '../../../../infrastructure/repositories/HttpAdminRepository';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';

const EspecialidadDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEspecialidadById } = useAdmin();
  const [especialidad, setEspecialidad] = useState<Especialidad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEspecialidad = async () => {
      if (!id) return;
      try {
        const data = await getEspecialidadById(id);
        setEspecialidad(data);
      } catch (error) {
        console.error('Error loading especialidad:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEspecialidad();
  }, [id, getEspecialidadById]);

  if (loading) {
    return (
      <BaseLayout title="Detalles de Especialidad">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </BaseLayout>
    );
  }

  if (!especialidad) {
    return (
      <BaseLayout title="Especialidad no encontrada">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Especialidad no encontrada</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
            La especialidad que busca no existe o ha sido eliminada.
          </p>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title={`Especialidad: ${especialidad.nombre}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/admin/healthcare/especialidades')}
              className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-darkmode-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{especialidad.nombre}</h1>
          </div>
          <Button
            onClick={() => navigate(`/admin/healthcare/especialidades/${id}/edit`)}
            className="inline-flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>

        {/* Detalles */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Información Básica</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Nombre</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">{especialidad.nombre}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Código</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">{especialidad.codigo || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Estado</dt>
                  <dd>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      especialidad.activa
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {especialidad.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Descripción</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">{especialidad.descripcion || 'Sin descripción'}</dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Información del Sistema</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Creada</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {new Date(especialidad.createdAt).toLocaleDateString('es-ES')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Última actualización</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {new Date(especialidad.updatedAt).toLocaleDateString('es-ES')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default EspecialidadDetailsPage; 