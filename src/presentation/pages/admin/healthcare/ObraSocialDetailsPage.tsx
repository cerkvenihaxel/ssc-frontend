import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Loader, Building2, Mail, Phone, MapPin } from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import { ApiClient } from '../../../../infrastructure/http/ApiClient';
import { HttpObraSocialRepository, type ObraSocial } from '../../../../infrastructure/repositories/HttpObraSocialRepository';

const ObraSocialDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [obraSocial, setObraSocial] = useState<ObraSocial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize repository
  const apiClient = new ApiClient();
  const obraSocialRepository = new HttpObraSocialRepository(apiClient);

  useEffect(() => {
    const loadObraSocial = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await obraSocialRepository.getObraSocialById(id);
        setObraSocial(data);
      } catch (err: any) {
        console.error('Error loading obra social:', err);
        setError(err.message || 'Error al cargar los datos de la obra social');
      } finally {
        setLoading(false);
      }
    };

    loadObraSocial();
  }, [id]);

  if (loading) {
    return (
      <BaseLayout title="Detalles de la Obra Social">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-slate-400">Cargando información de la obra social...</span>
        </div>
      </BaseLayout>
    );
  }

  if (!obraSocial) {
    return (
      <BaseLayout title="Obra Social no encontrada">
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Obra Social no encontrada</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
            La obra social que busca no existe o ha sido eliminada.
          </p>
          <div className="mt-6">
            <Button
              onClick={() => navigate('/admin/healthcare/obras-sociales')}
              variant="outline-primary"
            >
              Volver a la lista
            </Button>
          </div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title={obraSocial.name}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/admin/healthcare/obras-sociales')}
              className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-darkmode-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{obraSocial.name}</h1>
          </div>
          <Button
            onClick={() => navigate(`/admin/healthcare/obras-sociales/${id}/edit`)}
            className="inline-flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>

        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
            <div className="flex items-center">
              <Building2 className="w-6 h-6 text-gray-400 dark:text-slate-500 mr-3" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Información General</h2>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Datos Básicos</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Nombre</dt>
                    <dd className="text-sm text-gray-900 dark:text-white">{obraSocial.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">ID</dt>
                    <dd className="text-sm text-gray-900 dark:text-white font-mono">{obraSocial.healthcareProviderId}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Estado</dt>
                    <dd>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        obraSocial.status === 'ACTIVA'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {obraSocial.status === 'ACTIVA' ? 'Activa' : 'Inactiva'}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Información de Contacto</h3>
                <dl className="space-y-3">
                  <div className="flex items-start">
                    <Mail className="w-4 h-4 text-gray-400 dark:text-slate-500 mt-0.5 mr-2" />
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Email</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">{obraSocial.contactEmail || 'No especificado'}</dd>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="w-4 h-4 text-gray-400 dark:text-slate-500 mt-0.5 mr-2" />
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Teléfono</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">{obraSocial.contactPhone || 'No especificado'}</dd>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 text-gray-400 dark:text-slate-500 mt-0.5 mr-2" />
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Dirección</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">{obraSocial.address || 'No especificada'}</dd>
                    </div>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Información del Sistema</h2>
          </div>
          
          <div className="p-6">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Fecha de creación</dt>
                <dd className="text-sm text-gray-900 dark:text-white">
                  {new Date(obraSocial.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Última actualización</dt>
                <dd className="text-sm text-gray-900 dark:text-white">
                  {new Date(obraSocial.updatedAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default ObraSocialDetailsPage; 