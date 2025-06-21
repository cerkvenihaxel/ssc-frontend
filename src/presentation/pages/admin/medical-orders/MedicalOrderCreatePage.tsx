import React, { useState, useEffect } from 'react';
import { Plus, Minus, Search, AlertCircle, CheckCircle, ArrowLeft, Save, Upload, FileText, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';
import { useObfuscation } from '../../../../shared/contexts/ObfuscationContext';
import { useAuth } from '../../../contexts/AuthContext';
import AffiliateSearchSelect from '../../../../shared/components/ui/AffiliateSearchSelect';

// Interfaces
interface Articulo {
  articuloId: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  presentacion: string | null;
  precio: number;
  stock: number | null;
  providerId: string;
}

interface Affiliate {
  affiliateId: string;
  firstName: string;
  lastName: string;
  affiliateNumber: string;
  cuil: string;
  email: string;
  healthcareProviders: {
    healthcareProviderId: string;
    name: string;
  }[];
}

interface OrderItem {
  id: string;
  articleId: string;
  articleName: string;
  articleCode: string;
  articlePrice: number;
  quantity: number;
  justification: string;
  totalPrice: number;
}

interface FormData {
  affiliateId: string;
  healthcareProviderId: string;
  requesterType: 'ADMIN' | 'DOCTOR' | 'AUDITOR';
  requesterName: string;
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'CRITICAL';
  authorizationType: 'MANUAL' | 'AI' | 'HYBRID';
  medicalJustification: string;
  observations: string;
  diagnosis?: string;
  treatmentPlan?: string;
  estimatedDurationDays?: number;
  attachments: File[];
  items: OrderItem[];
}

const MedicalOrderCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { obfuscatedApiClient } = useObfuscation();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [searchingArticles, setSearchingArticles] = useState(false);
  const [articleSearchTerm, setArticleSearchTerm] = useState('');
  const [showArticleResults, setShowArticleResults] = useState(false);
  const [healthcareProviders, setHealthcareProviders] = useState<{ healthcareProviderId: string; name: string }[]>([]);
  const [selectedAffiliate, setSelectedAffiliate] = useState<any>(null);

  // Detectar tipo de usuario y autocompletar
  const getUserTypeAndName = () => {
    if (!user) return { type: 'admin' as 'ADMIN', name: '' };
    
    const roleName = user.role.name.toLowerCase();
    
    // Mapear roles a tipos de solicitante
    if (roleName.includes('admin') || roleName.includes('administrador')) {
      return { type: 'admin' as 'ADMIN', name: user.nombre };
    } else if (roleName.includes('doctor') || roleName.includes('medico') || roleName.includes('médico')) {
      return { type: 'doctor' as 'ADMIN', name: user.nombre };
    } else if (roleName.includes('auditor')) {
      return { type: 'auditor' as 'ADMIN', name: user.nombre };
    } else {
      return { type: 'admin' as 'ADMIN', name: user.nombre };
    }
  };

  const userInfo = getUserTypeAndName();

  const [formData, setFormData] = useState<FormData>({
    affiliateId: '',
    healthcareProviderId: '',
    requesterType: userInfo.type,
    requesterName: userInfo.name,
    urgencyLevel: 'MEDIUM',
    authorizationType: 'HYBRID',
    medicalJustification: '',
    observations: '',
    diagnosis: '',
    treatmentPlan: '',
    estimatedDurationDays: undefined,
    attachments: [],
    items: []
  });

  // Actualizar datos del usuario cuando cambie
  useEffect(() => {
    if (user) {
      const userInfo = getUserTypeAndName();
      setFormData(prev => ({
        ...prev,
        requesterType: userInfo.type,
        requesterName: userInfo.name
      }));
    }
  }, [user]);

  // Buscar artículos
  const searchArticles = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setArticulos([]);
      return;
    }

    try {
      setSearchingArticles(true);
      const data = await obfuscatedApiClient.get<Articulo[]>(
        `/v1/deposito/articulos?searchTerm=${encodeURIComponent(searchTerm)}&limit=20`
      );
      setArticulos(data);
      setShowArticleResults(true);
    } catch (error) {
      console.error('Error searching articles:', error);
      setArticulos([]);
    } finally {
      setSearchingArticles(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (articleSearchTerm) {
        searchArticles(articleSearchTerm);
      } else {
        setShowArticleResults(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [articleSearchTerm]);

  const addArticleToOrder = (articulo: Articulo) => {
    // Detectar la categoría del artículo
    const categoryInfo = detectArticleCategory(articulo);
    
    const newItem: OrderItem = {
      id: Date.now().toString(),
      articleId: articulo.articuloId,
      articleName: articulo.nombre,
      articleCode: articulo.codigo,
      articlePrice: articulo.precio,
      quantity: 1,
      justification: '',
      totalPrice: articulo.precio
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    setArticleSearchTerm('');
    setShowArticleResults(false);

    // Mostrar mensaje de confirmación con la categoría detectada
    const categoryNames = {
      'medication': 'Medicamento',
      'equipment': 'Equipo Médico', 
      'instrument': 'Instrumento Quirúrgico',
      'supply': 'Suministro Médico'
    };
    
    console.log(`✅ Artículo agregado: ${articulo.nombre} - Categoría detectada: ${categoryNames[categoryInfo.itemType as keyof typeof categoryNames] || categoryInfo.itemType}`);
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId
          ? { ...item, quantity, totalPrice: item.articlePrice * quantity }
          : item
      )
    }));
  };

  const updateItemJustification = (itemId: string, justification: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, justification } : item
      )
    }));
  };

  const removeItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => total + item.totalPrice, 0);
  };

  const getSelectedAffiliate = () => {
    return selectedAffiliate;
  };

  const getHealthcareProviders = () => {
    return healthcareProviders;
  };

  // Función para mapear urgencyLevel a urgencyId
  const mapUrgencyLevelToId = (level: string): number => {
    const urgencyMap: Record<string, number> = {
      'LOW': 1,
      'MEDIUM': 2,
      'HIGH': 3,
      'URGENT': 4,
      'CRITICAL': 5
    };
    return urgencyMap[level] || 2; // Default: Normal
  };

  // Función para mapear authorizationType del frontend al backend
  const mapAuthorizationType = (type: string): string => {
    const authMap: Record<string, string> = {
      'MANUAL': 'manual',
      'AI': 'automatic',
      'HYBRID': 'hybrid'
    };
    return authMap[type] || 'manual'; // Default: manual
  };

  // Función para detectar la categoría y tipo de artículo automáticamente
  const detectArticleCategory = (articulo: Articulo): { categoryId: string; itemType: string; administrationRoute: string } => {
    const codigo = articulo.codigo.toUpperCase();
    const nombre = articulo.nombre.toLowerCase();
    
    // Mapeo de categorías por UUID
    const categories = {
      medications: '64ed1c77-99cc-4a72-8d1b-764484a1f104',
      medical_equipment: '32d4e3fc-3e27-42dd-b863-84e49b1474da',
      diagnostic_equipment: 'da0eba06-5b2a-48f0-9281-f45a05ff3c83',
      surgical_instruments: 'd95fd2ed-691d-4c7f-a55d-da7908ba2ff6',
      medical_supplies: '23843bc8-fa94-4ed3-87c9-c90f7f8611e3',
      emergency_supplies: 'efcc0608-b368-4728-80a0-3350f943e90d'
    };

    // Detectar medicamentos por terminaciones comunes
    const medicationSuffixes = ['mg', 'ml', 'mcg', 'ui', 'capsulas', 'tabletas', 'comprimidos'];
    const isMedication = medicationSuffixes.some(suffix => nombre.includes(suffix)) ||
                        codigo.includes('MED') || codigo.includes('CARD') || codigo.includes('NEURO') ||
                        codigo.includes('ANTI') || codigo.includes('ANAL');

    if (isMedication) {
      return {
        categoryId: categories.medications,
        itemType: 'medication',
        administrationRoute: 'oral'
      };
    }

    // Detectar equipos de diagnóstico
    const diagnosticKeywords = ['electrocardiografo', 'electroencefalografo', 'resonador', 'tomografo', 
                               'ecografo', 'rayos x', 'scanner', 'monitor'];
    const isDiagnosticEquipment = diagnosticKeywords.some(keyword => nombre.includes(keyword)) ||
                                 codigo.includes('DIAG') || codigo.includes('ECG') || codigo.includes('EEG');

    if (isDiagnosticEquipment) {
      return {
        categoryId: categories.diagnostic_equipment,
        itemType: 'equipment',
        administrationRoute: 'external'
      };
    }

    // Detectar equipos médicos generales
    const medicalEquipmentKeywords = ['monitor', 'bomba', 'ventilador', 'desfibrilador', 'incubadora',
                                     'equipo', 'aparato', 'maquina'];
    const isMedicalEquipment = medicalEquipmentKeywords.some(keyword => nombre.includes(keyword)) ||
                              codigo.includes('EQUIP') || codigo.includes('MED');

    if (isMedicalEquipment) {
      return {
        categoryId: categories.medical_equipment,
        itemType: 'equipment',
        administrationRoute: 'external'
      };
    }

    // Detectar instrumentos quirúrgicos
    const surgicalKeywords = ['bisturi', 'pinza', 'forceps', 'tijera', 'clamp', 'separador',
                             'instrumental', 'quirurgico', 'cirugia'];
    const isSurgicalInstrument = surgicalKeywords.some(keyword => nombre.includes(keyword)) ||
                                codigo.includes('SURG') || codigo.includes('INST');

    if (isSurgicalInstrument) {
      return {
        categoryId: categories.surgical_instruments,
        itemType: 'instrument',
        administrationRoute: 'surgical'
      };
    }

    // Detectar suministros de emergencia
    const emergencyKeywords = ['emergencia', 'urgencia', 'resucitacion', 'trauma', 'shock'];
    const isEmergencySupply = emergencyKeywords.some(keyword => nombre.includes(keyword)) ||
                             codigo.includes('EMERG') || codigo.includes('URG');

    if (isEmergencySupply) {
      return {
        categoryId: categories.emergency_supplies,
        itemType: 'supply',
        administrationRoute: 'external'
      };
    }

    // Detectar suministros médicos generales
    const supplyKeywords = ['gasa', 'vendaje', 'suero', 'jeringa', 'aguja', 'cateter', 
                           'sonda', 'tubo', 'mascarilla', 'guantes'];
    const isMedicalSupply = supplyKeywords.some(keyword => nombre.includes(keyword)) ||
                           codigo.includes('SUPP') || codigo.includes('CONS');

    if (isMedicalSupply) {
      return {
        categoryId: categories.medical_supplies,
        itemType: 'supply',
        administrationRoute: 'external'
      };
    }

    // Por defecto, asumir que es un suministro médico
    return {
      categoryId: categories.medical_supplies,
      itemType: 'supply',
      administrationRoute: 'external'
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.medicalJustification.trim()) {
      alert('La justificación médica es obligatoria');
      return;
    }

    if (!formData.affiliateId) {
      alert('Debe seleccionar un afiliado');
      return;
    }

    if (!formData.healthcareProviderId) {
      alert('Debe seleccionar una obra social');
      return;
    }

    if (formData.items.length === 0) {
      alert('Debe agregar al menos un artículo al pedido');
      return;
    }

    // Validar que todos los items tengan justificación
    const itemsWithoutJustification = formData.items.filter(item => !item.justification.trim());
    if (itemsWithoutJustification.length > 0) {
      alert('Todos los artículos deben tener una justificación médica');
      return;
    }

    try {
      setLoading(true);
      
      // Transformar datos al formato que espera el backend
      const orderData = {
        affiliateId: formData.affiliateId,
        healthcareProviderId: formData.healthcareProviderId,
        urgencyId: mapUrgencyLevelToId(formData.urgencyLevel),
        title: formData.observations || `Pedido médico - ${selectedAffiliate?.firstName} ${selectedAffiliate?.lastName}` || 'Pedido médico',
        description: formData.observations || 'Pedido médico creado desde el sistema',
        medicalJustification: formData.medicalJustification,
        diagnosis: formData.diagnosis,
        treatmentPlan: formData.treatmentPlan,
        estimatedDurationDays: formData.estimatedDurationDays,
        hasAttachments: formData.attachments.length > 0,
        estimatedCost: calculateTotal(),
        authorizationType: mapAuthorizationType(formData.authorizationType),
        items: formData.items.map(item => {
          // Buscar el artículo original para detectar su categoría
          const originalArticle = articulos.find(a => a.articuloId === item.articleId);
          const categoryInfo = originalArticle ? 
            detectArticleCategory(originalArticle) : 
            {
              categoryId: '23843bc8-fa94-4ed3-87c9-c90f7f8611e3', // medical_supplies por defecto
              itemType: 'supply',
              administrationRoute: 'external'
            };

          return {
            categoryId: categoryInfo.categoryId,
            itemType: categoryInfo.itemType,
            itemName: item.articleName,
            itemCode: item.articleCode,
            itemDescription: item.articleName,
            requestedQuantity: item.quantity,
            unitOfMeasure: 'unidad',
            brand: '',
            presentation: '',
            concentration: '',
            administrationRoute: categoryInfo.administrationRoute,
            medicalJustification: item.justification || `${categoryInfo.itemType === 'medication' ? 'Medicamento' : 'Artículo'} requerido según prescripción médica`,
            estimatedUnitCost: item.articlePrice
          };
        })
      };

      console.log('Enviando pedido:', orderData);
      
      // Llamada real a la API
      const response = await obfuscatedApiClient.post('/medical-orders', orderData);
      
      console.log('Pedido creado exitosamente:', response);
      alert('Pedido médico creado exitosamente');
      navigate('/admin/medical-orders');
      
    } catch (error) {
      console.error('Error creating medical order:', error);
      alert('Error al crear el pedido médico. Verifique los datos e intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  const urgencyOptions = [
    { value: 'LOW', label: 'Baja', color: 'text-green-600' },
    { value: 'MEDIUM', label: 'Media', color: 'text-yellow-600' },
    { value: 'HIGH', label: 'Alta', color: 'text-orange-600' },
    { value: 'URGENT', label: 'Urgente', color: 'text-red-600' },
    { value: 'CRITICAL', label: 'Crítica', color: 'text-red-800' }
  ];

  const handleFileUpload = (e:React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleAffiliateChange = (affiliateId: string, affiliate: any) => {
    setSelectedAffiliate(affiliate);
    setFormData(prev => ({
      ...prev,
      affiliateId,
      healthcareProviderId: '' // Reset healthcare provider when affiliate changes
    }));
  };

  const handleHealthcareProvidersChange = (providers: { healthcareProviderId: string; name: string }[]) => {
    setHealthcareProviders(providers);
  };

  return (
    <BaseLayout title="Crear Pedido Médico">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/admin/medical-orders"
              className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Pedidos
            </Link>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Crear Nuevo Pedido Médico
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
            Complete la información del pedido y agregue los artículos necesarios
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información del Afiliado */}
          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Información del Afiliado
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Afiliado *
                </label>
                <AffiliateSearchSelect
                  value={formData.affiliateId}
                  onChange={handleAffiliateChange}
                  onHealthcareProvidersChange={handleHealthcareProvidersChange}
                  placeholder="Buscar afiliado por nombre, número o CUIL..."
                  required
                  className="w-full"
                />
                {selectedAffiliate && (
                  <div className="mt-2 text-xs text-gray-600 dark:text-slate-400">
                    CUIL: {selectedAffiliate.cuil} • Email: {selectedAffiliate.email}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Obra Social *
                </label>
                <select
                  value={formData.healthcareProviderId}
                  onChange={(e) => setFormData(prev => ({ ...prev, healthcareProviderId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300"
                  required
                  disabled={!formData.affiliateId}
                >
                  <option value="">Seleccione obra social</option>
                  {getHealthcareProviders().map(provider => (
                    <option key={provider.healthcareProviderId} value={provider.healthcareProviderId}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Información del Pedido */}
          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Detalles del Pedido
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Tipo de Solicitante *
                </label>
                <select
                  value={formData.requesterType}
                  onChange={(e) => setFormData(prev => ({ ...prev, requesterType: e.target.value as FormData['requesterType'] }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300"
                >
                  <option value="ADMIN">Administrador</option>
                  <option value="DOCTOR">Médico</option>
                  <option value="AUDITOR">Auditor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Nombre del Solicitante *
                </label>
                <Input
                  type="text"
                  value={formData.requesterName}
                  onChange={(e) => setFormData(prev => ({ ...prev, requesterName: e.target.value }))}
                  placeholder="Ej: Dr. Juan Pérez"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Nivel de Urgencia *
                </label>
                <select
                  value={formData.urgencyLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, urgencyLevel: e.target.value as FormData['urgencyLevel'] }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300"
                >
                  {urgencyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Justificación Médica *
                </label>
                <textarea
                  value={formData.medicalJustification}
                  onChange={(e) => setFormData(prev => ({ ...prev, medicalJustification: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300"
                  placeholder="Describa la condición médica y la necesidad de los artículos solicitados..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Tipo de Autorización
                </label>
                <select
                  value={formData.authorizationType}
                  onChange={(e) => setFormData(prev => ({ ...prev, authorizationType: e.target.value as FormData['authorizationType'] }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300 mb-4"
                >
                  <option value="HYBRID">Híbrida (IA + Manual)</option>
                  <option value="AI">Solo IA</option>
                  <option value="MANUAL">Solo Manual</option>
                </select>

                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Observaciones
                </label>
                <textarea
                  value={formData.observations}
                  onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300"
                  placeholder="Observaciones adicionales..."
                />
              </div>
            </div>
          </div>

          {/* Información Médica Adicional */}
          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Información Médica Adicional
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Diagnóstico
                </label>
                <textarea
                  value={formData.diagnosis}
                  onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300"
                  placeholder="Diagnóstico del paciente..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Plan de Tratamiento
                </label>
                <textarea
                  value={formData.treatmentPlan}
                  onChange={(e) => setFormData(prev => ({ ...prev, treatmentPlan: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300"
                  placeholder="Plan de tratamiento propuesto..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Duración Estimada (días)
                </label>
                <input
                  type="number"
                  value={formData.estimatedDurationDays || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    estimatedDurationDays: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300"
                  placeholder="Ej: 7"
                />
              </div>
            </div>
          </div>

          {/* Archivos Adjuntos */}
          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Archivos Adjuntos
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Subir Archivos
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-darkmode-500 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-darkmode-700 hover:bg-gray-100 dark:hover:bg-darkmode-600">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-slate-400" />
                      <p className="mb-2 text-sm text-gray-500 dark:text-slate-400">
                        <span className="font-semibold">Haga clic para subir</span> o arrastre y suelte
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        PDF, DOC, DOCX, JPG, PNG (MAX. 10MB cada uno)
                      </p>
                    </div>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Lista de archivos adjuntos */}
              {formData.attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Archivos Adjuntos ({formData.attachments.length})
                  </h4>
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-darkmode-700 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-500 dark:text-slate-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {file.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-slate-400">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Búsqueda y Agregado de Artículos */}
          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Artículos del Pedido
            </h3>

            {/* Buscador de artículos */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Buscar Artículos
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  value={articleSearchTerm}
                  onChange={(e) => setArticleSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre o código..."
                  className="pl-10"
                />
                {searchingArticles && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>

              {/* Resultados de búsqueda */}
              {showArticleResults && articulos.length > 0 && (
                <div className="mt-2 bg-white dark:bg-darkmode-700 border border-gray-300 dark:border-darkmode-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {articulos.map(articulo => {
                    const categoryInfo = detectArticleCategory(articulo);
                    const categoryColors = {
                      'medication': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                      'equipment': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                      'instrument': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
                      'supply': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                    };
                    const categoryNames = {
                      'medication': 'Medicamento',
                      'equipment': 'Equipo',
                      'instrument': 'Instrumento',
                      'supply': 'Suministro'
                    };

                    return (
                      <div
                        key={articulo.articuloId}
                        className="p-3 hover:bg-gray-50 dark:hover:bg-darkmode-600 cursor-pointer border-b border-gray-200 dark:border-darkmode-500 last:border-b-0"
                        onClick={() => addArticleToOrder(articulo)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {articulo.nombre}
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${categoryColors[categoryInfo.itemType as keyof typeof categoryColors] || categoryColors.supply}`}>
                                {categoryNames[categoryInfo.itemType as keyof typeof categoryNames] || categoryInfo.itemType}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-slate-400">
                              Código: {articulo.codigo}
                            </div>
                            {articulo.descripcion && (
                              <div className="text-sm text-gray-600 dark:text-slate-300 mt-1">
                                {articulo.descripcion}
                              </div>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {formatPrice(articulo.precio)}
                            </div>
                            {articulo.stock !== null && (
                              <div className="text-sm text-gray-500 dark:text-slate-400">
                                Stock: {articulo.stock}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Lista de artículos agregados */}
            {formData.items.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Artículos Agregados ({formData.items.length})
                </h4>
                
                {formData.items.map(item => (
                  <div key={item.id} className="border border-gray-200 dark:border-darkmode-500 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                      <div className="md:col-span-2">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {item.articleName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">
                          {item.articleCode} - {formatPrice(item.articlePrice)} c/u
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                          Cantidad
                        </label>
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="w-20 text-center"
                            min="1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatPrice(item.totalPrice)}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-800 mt-1"
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Justificación para este artículo
                      </label>
                      <Input
                        type="text"
                        value={item.justification}
                        onChange={(e) => updateItemJustification(item.id, e.target.value)}
                        placeholder="Justifique por qué se necesita este artículo..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {formData.items.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>No hay artículos agregados al pedido</p>
                <p className="text-sm">Use el buscador para agregar artículos</p>
              </div>
            )}
          </div>

          {/* Resumen del Pedido */}
          {formData.items.length > 0 && (
            <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Resumen del Pedido
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formData.items.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-slate-400">
                    Artículos
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formData.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-slate-400">
                    Cantidad Total
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatPrice(calculateTotal())}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-slate-400">
                    Costo Total
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex items-center justify-end space-x-4">
            <Link to="/admin/medical-orders">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading || formData.items.length === 0}
              className="inline-flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Crear Pedido
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </BaseLayout>
  );
};

export default MedicalOrderCreatePage; 