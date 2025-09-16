import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Loader, User, Mail, Phone, Calendar, MapPin, Building2, Shield, CreditCard } from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import { useObfuscation } from '../../../../shared/contexts/ObfuscationContext';

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
  const { obfuscatedApiClient } = useObfuscation();
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
        
        // El obfuscatedApiClient se encarga automáticamente de desofuscar el ID
        console.log('🔍 Cargando detalles del afiliado con ID:', id);
        const data = await obfuscatedApiClient.get<Afiliado>(`/v1/afiliados/${id}`);
        console.log('👤 Detalles del afiliado cargados:', data);
        setAfiliado(data);
      } catch (error) {
        console.error('Error loading afiliado:', error);
        setAfiliado(null);
      } finally {
        setLoading(false);
      }
    };

    loadAfiliado();
  }, [id, obfuscatedApiClient]);

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
              onClick={() => navigate('/admin/afiliados')}
              variant="outline-primary"
            >
              Volver a la lista
            </Button>
          </div>
        </div>
      </BaseLayout>
    );
  }

  const handleEditClick = () => {
    navigate(`/admin/afiliados/${id}/edit`);
  };

  return (
    <BaseLayout title={`${afiliado.firstName} ${afiliado.lastName}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/admin/afiliados')}
              className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-darkmode-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{afiliado.firstName} {afiliado.lastName}</h1>
          </div>
          <Button
            onClick={handleEditClick}
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
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {afiliado.gender === 'M' ? 'Masculino' : afiliado.gender === 'F' ? 'Femenino' : 'Otro'}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Documentación</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Tipo de documento</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">{afiliado.documentType}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Número de documento</dt>
                      <dd className="text-sm text-gray-900 dark:text-white font-mono">{afiliado.documentNumber}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">País de emisión</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">{afiliado.documentCountry}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Nacionalidad</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">{afiliado.nationality}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Información de Nacimiento</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Fecha de nacimiento</dt>
                    <dd className="text-sm text-gray-900 dark:text-white flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {formatDateDisplay(afiliado.birthDate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Edad</dt>
                    <dd className="text-sm text-gray-900 dark:text-white">{calculateAge(afiliado.birthDate)} años</dd>
                  </div>
                </dl>
              </div>

              {afiliado.occupation && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Información Laboral</h3>
                  <dl>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Ocupación</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">{afiliado.occupation}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Estado del afiliado */}
            <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
                <div className="flex items-center">
                  <Shield className="w-6 h-6 text-gray-400 dark:text-slate-500 mr-3" />
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Estado</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Estado actual</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        afiliado.affiliateStatus === 'active' || afiliado.affiliateStatus === 'ACTIVE'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {afiliado.affiliateStatus === 'active' || afiliado.affiliateStatus === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Fecha de creación</dt>
                    <dd className="text-sm text-gray-900 dark:text-white">{formatDateDisplay(afiliado.creationDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Última actualización</dt>
                    <dd className="text-sm text-gray-900 dark:text-white">{formatDateDisplay(afiliado.lastUpdate)}</dd>
                  </div>
                  {afiliado.cvu && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">CVU</dt>
                      <dd className="text-sm text-gray-900 dark:text-white font-mono">{afiliado.cvu}</dd>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
                <div className="flex items-center">
                  <Phone className="w-6 h-6 text-gray-400 dark:text-slate-500 mr-3" />
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Contacto</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Email</dt>
                    <dd className="text-sm text-gray-900 dark:text-white flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <a 
                        href={`mailto:${afiliado.email}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {afiliado.email}
                      </a>
                    </dd>
                  </div>
                  {afiliado.phone && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Teléfono</dt>
                      <dd className="text-sm text-gray-900 dark:text-white flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <a 
                          href={`tel:${afiliado.phone}`}
                          className="hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {afiliado.phone}
                        </a>
                      </dd>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Obras sociales */}
            {afiliado.healthcareProviders && afiliado.healthcareProviders.length > 0 && (
              <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
                  <div className="flex items-center">
                    <Building2 className="w-6 h-6 text-gray-400 dark:text-slate-500 mr-3" />
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Obras Sociales</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {afiliado.healthcareProviders.map((obraSocial, index) => (
                      <div key={index} className="border border-gray-200 dark:border-darkmode-400 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{obraSocial.name}</h4>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            isObraSocialActive(obraSocial.status)
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {isObraSocialActive(obraSocial.status) ? 'Activa' : 'Inactiva'}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
                          {obraSocial.contactPhone && (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-2" />
                              {obraSocial.contactPhone}
                            </div>
                          )}
                          {obraSocial.contactEmail && (
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-2" />
                              {obraSocial.contactEmail}
                            </div>
                          )}
                          {obraSocial.address && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              {obraSocial.address}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default AfiliadoDetailsPage; 