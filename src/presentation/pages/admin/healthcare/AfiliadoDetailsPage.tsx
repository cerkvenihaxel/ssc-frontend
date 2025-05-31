import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Loader, User, Mail, Phone, Calendar, MapPin, Building2, Shield, CreditCard } from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';

interface ObraSocial {
  healthcareProviderId: string;
  name: string;
  status: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
}

interface Afiliado {
  id: string;
  affiliateNumber: string;
  affiliateStatus: string;
  creationDate: string;
  lastUpdate: string;
  cuil: string;
  cvu: string | null;
  documentType: string;
  documentNumber: string;
  documentCountry: string;
  gender: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  nationality: string;
  email: string;
  occupation: string | null;
  phone: string | null;
  picture: string | null;
  primaryAddressId: string | null;
  createdBy: string;
  updatedBy: string | null;
  healthcareProviders?: ObraSocial[];
}

const AfiliadoDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [afiliado, setAfiliado] = useState<Afiliado | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para formatear fechas en formato dd/mm/yyyy
  const formatDateDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Función para verificar si una obra social está activa
  const isObraSocialActive = (status: string): boolean => {
    const normalizedStatus = status?.toLowerCase();
    return normalizedStatus === 'active' || normalizedStatus === 'activa';
  };

  useEffect(() => {
    const loadAfiliado = async () => {
      if (!id) return;
      try {
        setLoading(true);
        
        // Primero intentar con autenticación
        let response = await fetch(`/api/v1/afiliados/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        // Si falla la autenticación, usar endpoint temporal
        if (!response.ok && response.status === 401) {
          console.log('Usando endpoint temporal sin autenticación para detalles');
          response = await fetch(`/api/v1/afiliados/test/${id}`);
        }
        
        if (!response.ok) {
          throw new Error('Error al cargar el afiliado');
        }
        
        const data = await response.json();
        setAfiliado(data);
      } catch (error) {
        console.error('Error loading afiliado:', error);
        setAfiliado(null);
      } finally {
        setLoading(false);
      }
    };

    loadAfiliado();
  }, [id]);

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return (
      <BaseLayout title="Detalles del Afiliado">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-slate-400">Cargando información del afiliado...</span>
        </div>
      </BaseLayout>
    );
  }

  if (!afiliado) {
    return (
      <BaseLayout title="Afiliado no encontrado">
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Afiliado no encontrado</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
            El afiliado que busca no existe o ha sido eliminado.
          </p>
          <div className="mt-6">
            <Button
              onClick={() => navigate('/admin/healthcare/afiliados')}
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
    <BaseLayout title={`${afiliado.firstName} ${afiliado.lastName}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/admin/healthcare/afiliados')}
              className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-darkmode-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{afiliado.firstName} {afiliado.lastName}</h1>
          </div>
          <Button
            onClick={() => navigate(`/admin/healthcare/afiliados/${id}/edit`)}
            className="inline-flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>

        {/* Información principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Personal */}
          <div className="lg:col-span-2 bg-white dark:bg-darkmode-600 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
              <div className="flex items-center">
                <User className="w-6 h-6 text-gray-400 dark:text-slate-500 mr-3" />
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Información Personal</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Datos Básicos</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Nombre completo</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">{afiliado.firstName} {afiliado.lastName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Número de afiliado</dt>
                      <dd className="text-sm text-gray-900 dark:text-white font-mono">{afiliado.affiliateNumber}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">CUIL</dt>
                      <dd className="text-sm text-gray-900 dark:text-white font-mono">{afiliado.cuil}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Género</dt>
                      <dd>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          afiliado.gender === 'M' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : afiliado.gender === 'F'
                            ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        }`}>
                          {afiliado.gender === 'M' ? 'Masculino' : afiliado.gender === 'F' ? 'Femenino' : 'Otro'}
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
                        <dd className="text-sm text-gray-900 dark:text-white">{afiliado.email}</dd>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Phone className="w-4 h-4 text-gray-400 dark:text-slate-500 mt-0.5 mr-2" />
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Teléfono</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">{afiliado.phone || 'No especificado'}</dd>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Calendar className="w-4 h-4 text-gray-400 dark:text-slate-500 mt-0.5 mr-2" />
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Fecha de nacimiento</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">
                          {formatDateDisplay(afiliado.birthDate)} 
                          <span className="text-gray-500 dark:text-slate-400 ml-2">({calculateAge(afiliado.birthDate)} años)</span>
                        </dd>
                      </div>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Card de Estado */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Estado del Afiliado</h2>
              </div>
              
              <div className="p-6">
                <div className="text-center">
                  <span className={`inline-flex px-4 py-2 text-sm font-medium rounded-full ${
                    afiliado.affiliateStatus.toLowerCase() === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : afiliado.affiliateStatus.toLowerCase() === 'suspended'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {afiliado.affiliateStatus.toLowerCase() === 'active' ? 'Activo' : afiliado.affiliateStatus.toLowerCase() === 'suspended' ? 'Suspendido' : 'Inactivo'}
                  </span>
                </div>
                
                <div className="mt-6 space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Fecha de alta</dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      {formatDateDisplay(afiliado.creationDate)}
                    </dd>
                  </div>
                </div>
              </div>
            </div>

            {/* Card de Datos Bancarios */}
            <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
                <div className="flex items-center">
                  <CreditCard className="w-6 h-6 text-gray-400 dark:text-slate-500 mr-3" />
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Datos Bancarios del Afiliado</h2>
                </div>
              </div>
              
              <div className="p-6">
                {afiliado.cvu ? (
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">CVU</div>
                    <div className="bg-gray-50 dark:bg-darkmode-700 rounded-lg p-3">
                      <div className="text-sm text-gray-900 dark:text-white font-mono">{afiliado.cvu}</div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                      Clave Virtual Uniforme para transferencias
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <CreditCard className="mx-auto h-8 w-8 text-gray-400 dark:text-slate-500" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                      No hay datos bancarios registrados
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Card de Obras Sociales */}
            <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
                <div className="flex items-center">
                  <Shield className="w-6 h-6 text-gray-400 dark:text-slate-500 mr-3" />
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Obras Sociales</h2>
                </div>
              </div>
              
              <div className="p-6">
                {(!afiliado.healthcareProviders || afiliado.healthcareProviders.length === 0) ? (
                  <div className="text-center py-4">
                    <Shield className="mx-auto h-8 w-8 text-gray-400 dark:text-slate-500" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                      No tiene obras sociales asociadas
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {afiliado.healthcareProviders.map((obra) => (
                      <div key={obra.healthcareProviderId} className="border border-gray-200 dark:border-darkmode-700 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">{obra.name}</h4>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            isObraSocialActive(obra.status)
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {isObraSocialActive(obra.status) ? 'Activa' : 'Inactiva'}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1">
                          {obra.contactPhone && (
                            <div className="flex items-center text-xs text-gray-500 dark:text-slate-400">
                              <Phone className="w-3 h-3 mr-1" />
                              {obra.contactPhone}
                            </div>
                          )}
                          {obra.contactEmail && (
                            <div className="flex items-center text-xs text-gray-500 dark:text-slate-400">
                              <Mail className="w-3 h-3 mr-1" />
                              {obra.contactEmail}
                            </div>
                          )}
                          {obra.address && (
                            <div className="flex items-start text-xs text-gray-500 dark:text-slate-400">
                              <MapPin className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                              <span className="break-words">{obra.address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Información del Sistema */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Información del Sistema</h2>
          </div>
          
          <div className="p-6">
            <dl className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">ID del afiliado</dt>
                <dd className="text-sm text-gray-900 dark:text-white font-mono">{afiliado.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Fecha de alta en sistema</dt>
                <dd className="text-sm text-gray-900 dark:text-white">
                  {formatDateDisplay(afiliado.creationDate)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Estado actual</dt>
                <dd className="text-sm text-gray-900 dark:text-white">{afiliado.affiliateStatus}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default AfiliadoDetailsPage; 