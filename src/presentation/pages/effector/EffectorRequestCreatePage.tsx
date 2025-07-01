import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  Search,
  AlertCircle,
  Building,
  Calendar,
  FileText,
  Package,
  DollarSign,
  Stethoscope,
  Users,
  TrendingUp
} from 'lucide-react';
import BaseLayout from '../../../shared/components/layout/BaseLayout';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import { useToast } from '../../../shared/components/ui/ToastContainer';
import { useAuth } from '../../contexts/AuthContext';
import { useObfuscation } from '../../../shared/contexts/ObfuscationContext';

interface RequestItem {
  id: string;
  article_code?: string;
  article_name: string;
  description: string;
  quantity: number;
  unit_measure?: string;
  estimated_unit_price?: number;
  estimated_total_price?: number;
  medical_justification?: string;
  therapeutic_indication?: string;
  monthly_consumption?: number;
  patient_quantity?: number;
  urgency_justification?: string;
  technical_specifications?: string;
  expiration_date?: string;
}

interface FormData {
  title: string;
  description?: string;
  priority: 'BAJA' | 'NORMAL' | 'ALTA' | 'URGENTE';
  delivery_date?: string;
  delivery_address?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  institution_department?: string;
  requesting_doctor?: string;
  medical_area?: string;
  clinical_justification?: string;
  requires_ai_analysis?: boolean;
  authorization_type?: 'manual' | 'automatic' | 'hybrid';
  estimated_beneficiaries?: number;
  epidemiological_context?: string;
  items: RequestItem[];
}

const EffectorRequestCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const { obfuscatedApiClient } = useObfuscation();

  const [loading, setLoading] = useState(false);
  const [searchingArticles, setSearchingArticles] = useState(false);
  const [articleSearchTerm, setArticleSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showArticleSearch, setShowArticleSearch] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    priority: 'NORMAL',
    delivery_date: '',
    delivery_address: '',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    institution_department: '',
    requesting_doctor: '',
    medical_area: '',
    clinical_justification: '',
    requires_ai_analysis: true,
    authorization_type: 'hybrid',
    estimated_beneficiaries: 0,
    epidemiological_context: '',
    items: []
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Buscar artículos en el depósito
  const searchArticles = async (searchTerm: string) => {
    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchingArticles(true);
    try {
      const response = await obfuscatedApiClient.get(`/v1/deposito/articulos?search=${encodeURIComponent(searchTerm)}&limit=20`);
      setSearchResults((response as any)?.data || []);
    } catch (error) {
      console.error('Error searching articles:', error);
      setSearchResults([]);
    } finally {
      setSearchingArticles(false);
    }
  };

  // Manejar búsqueda con debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (articleSearchTerm) {
        searchArticles(articleSearchTerm);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [articleSearchTerm]);

  // Agregar artículo desde búsqueda
  const addArticleFromSearch = (article: any) => {
    const newItem: RequestItem = {
      id: Date.now().toString(),
      article_code: article.codigo,
      article_name: article.nombre,
      description: article.descripcion || article.nombre,
      quantity: 1,
      unit_measure: 'unidad',
      estimated_unit_price: article.precio || 0,
      estimated_total_price: article.precio || 0,
      medical_justification: '',
      therapeutic_indication: '',
      monthly_consumption: 0,
      patient_quantity: 0,
      urgency_justification: '',
      technical_specifications: '',
      expiration_date: ''
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    setShowArticleSearch(false);
    setArticleSearchTerm('');
    setSearchResults([]);
  };

  // Agregar item manualmente
  const addManualItem = () => {
    const newItem: RequestItem = {
      id: Date.now().toString(),
      article_name: '',
      description: '',
      quantity: 1,
      unit_measure: 'unidad',
      estimated_unit_price: 0,
      estimated_total_price: 0,
      medical_justification: '',
      therapeutic_indication: '',
      monthly_consumption: 0,
      patient_quantity: 0,
      urgency_justification: ''
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  // Actualizar item
  const updateItem = (itemId: string, field: keyof RequestItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalcular precio total si cambia cantidad o precio unitario
          if (field === 'quantity' || field === 'estimated_unit_price') {
            updatedItem.estimated_total_price = 
              (updatedItem.quantity || 0) * (updatedItem.estimated_unit_price || 0);
          }
          
          return updatedItem;
        }
        return item;
      })
    }));
  };

  // Eliminar item
  const removeItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  // Calcular total estimado
  const calculateTotal = () => {
    return formData.items.reduce((total, item) => total + (item.estimated_total_price || 0), 0);
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.clinical_justification?.trim()) {
      newErrors.clinical_justification = 'La justificación clínica es requerida';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'Debe agregar al menos un artículo';
    }

    // Validar items
    formData.items.forEach((item, index) => {
      if (!item.article_name.trim()) {
        newErrors[`item_${index}_name`] = 'El nombre del artículo es requerido';
      }
      if (!item.quantity || item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'La cantidad debe ser mayor a 0';
      }
      if (!item.medical_justification?.trim()) {
        newErrors[`item_${index}_justification`] = 'La justificación médica es requerida para pedidos institucionales';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Error de validación', 'Por favor corrija los errores en el formulario');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        delivery_date: formData.delivery_date,
        delivery_address: formData.delivery_address,
        contact_person: formData.contact_person,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        institution_department: formData.institution_department,
        requesting_doctor: formData.requesting_doctor,
        medical_area: formData.medical_area,
        clinical_justification: formData.clinical_justification,
        requires_ai_analysis: formData.requires_ai_analysis,
        authorization_type: formData.authorization_type,
        ...(formData.estimated_beneficiaries && { estimated_beneficiaries: formData.estimated_beneficiaries }),
        epidemiological_context: formData.epidemiological_context,
        items: formData.items.map(item => ({
          article_code: item.article_code,
          article_name: item.article_name,
          description: item.description,
          quantity: item.quantity,
          unit_measure: item.unit_measure,
          estimated_unit_price: item.estimated_unit_price,
          estimated_total_price: item.estimated_total_price,
          medical_justification: item.medical_justification,
          therapeutic_indication: item.therapeutic_indication,
          monthly_consumption: item.monthly_consumption,
          patient_quantity: item.patient_quantity,
          urgency_justification: item.urgency_justification,
          technical_specifications: item.technical_specifications,
          expiration_date: item.expiration_date
        }))
      };

      await obfuscatedApiClient.post('/v1/effector-requests', requestData);
      
      showSuccess('Éxito', 'Pedido creado exitosamente');
      navigate('/effector/requests');
    } catch (error: any) {
      console.error('Error creating request:', error);
      
      // Manejar errores de validación
      if (error.response?.data?.message && Array.isArray(error.response.data.message)) {
        const validationErrors = error.response.data.message.join('\n• ');
        showError('Errores de validación', `• ${validationErrors}`);
      } else if (error.response?.data?.message) {
        showError('Error', error.response.data.message);
      } else {
        showError('Error', 'Error al crear el pedido');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/effector/requests')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Crear Pedido Médico Institucional
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Complete la información del pedido masivo para su institución
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información General */}
          <div className="bg-white dark:bg-darkmode-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Building className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Información General
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título del Pedido *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Pedido medicamentos para área de urgencias"
                  error={errors.title}
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción detallada del pedido..."
                  rows={3}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                           bg-white dark:bg-darkmode-700 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prioridad *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                           bg-white dark:bg-darkmode-700 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="BAJA">Baja</option>
                  <option value="NORMAL">Normal</option>
                  <option value="ALTA">Alta</option>
                  <option value="URGENTE">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de Entrega Requerida
                </label>
                <Input
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_date: e.target.value }))}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Departamento/Área Solicitante
                </label>
                <Input
                  value={formData.institution_department}
                  onChange={(e) => setFormData(prev => ({ ...prev, institution_department: e.target.value }))}
                  placeholder="Ej: Urgencias, Cardiología, Farmacia"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Médico Responsable
                </label>
                <Input
                  value={formData.requesting_doctor}
                  onChange={(e) => setFormData(prev => ({ ...prev, requesting_doctor: e.target.value }))}
                  placeholder="Dr./Dra. Nombre Apellido"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Justificación Médica */}
          <div className="bg-white dark:bg-darkmode-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Stethoscope className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Justificación Médica e Institucional
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Justificación Clínica *
                </label>
                <textarea
                  value={formData.clinical_justification}
                  onChange={(e) => setFormData(prev => ({ ...prev, clinical_justification: e.target.value }))}
                  placeholder="Detalle la justificación médica para este pedido institucional..."
                  rows={4}
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-md 
                           bg-white dark:bg-darkmode-700 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                             errors.clinical_justification 
                               ? 'border-red-300 dark:border-red-600' 
                               : 'border-gray-300 dark:border-gray-600'
                           }`}
                />
                {errors.clinical_justification && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.clinical_justification}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Área Médica
                </label>
                <Input
                  value={formData.medical_area}
                  onChange={(e) => setFormData(prev => ({ ...prev, medical_area: e.target.value }))}
                  placeholder="Ej: Medicina Interna, Cirugía, Pediatría"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Beneficiarios Estimados
                </label>
                <Input
                  type="number"
                  value={formData.estimated_beneficiaries}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_beneficiaries: e.target.value ? parseInt(e.target.value) : undefined }))}
                  placeholder="Número de pacientes beneficiarios"
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contexto Epidemiológico
                </label>
                <textarea
                  value={formData.epidemiological_context}
                  onChange={(e) => setFormData(prev => ({ ...prev, epidemiological_context: e.target.value }))}
                  placeholder="Contexto epidemiológico que justifica el pedido (opcional)..."
                  rows={3}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                           bg-white dark:bg-darkmode-700 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Artículos del Pedido */}
          <div className="bg-white dark:bg-darkmode-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Artículos del Pedido
                </h2>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowArticleSearch(!showArticleSearch)}
                  className="flex items-center gap-2"
                  disabled={loading}
                >
                  <Search className="w-4 h-4" />
                  Buscar en Depósito
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={addManualItem}
                  className="flex items-center gap-2"
                  disabled={loading}
                >
                  <Plus className="w-4 h-4" />
                  Agregar Manual
                </Button>
              </div>
            </div>

            {/* Búsqueda de Artículos */}
            {showArticleSearch && (
              <div className="mb-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-darkmode-700">
                <div className="mb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      value={articleSearchTerm}
                      onChange={(e) => setArticleSearchTerm(e.target.value)}
                      placeholder="Buscar medicamentos, insumos, equipos..."
                      disabled={loading || searchingArticles}
                      className="pl-10"
                    />
                  </div>
                </div>

                {searchingArticles && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      Buscando artículos...
                    </span>
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((article) => (
                      <div
                        key={article.id}
                        className="flex items-center justify-between p-3 bg-white dark:bg-darkmode-800 rounded border cursor-pointer hover:bg-gray-50 dark:hover:bg-darkmode-700"
                        onClick={() => addArticleFromSearch(article)}
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {article.nombre}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Código: {article.codigo} | Stock: {article.stock || 'N/A'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900 dark:text-white">
                            ${article.precio?.toLocaleString() || 'N/A'}
                          </div>
                          <Button size="sm" variant="primary">
                            Agregar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Lista de Items */}
            {errors.items && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{errors.items}</p>
              </div>
            )}

            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-darkmode-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Artículo #{index + 1}
                    </h3>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nombre del Artículo *
                      </label>
                      <Input
                        value={item.article_name}
                        onChange={(e) => updateItem(item.id, 'article_name', e.target.value)}
                        placeholder="Nombre del medicamento/insumo"
                        error={errors[`item_${index}_name`]}
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Código
                      </label>
                      <Input
                        value={item.article_code}
                        onChange={(e) => updateItem(item.id, 'article_code', e.target.value)}
                        placeholder="Código del artículo"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Cantidad *
                      </label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        error={errors[`item_${index}_quantity`]}
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Unidad de Medida
                      </label>
                      <Input
                        value={item.unit_measure}
                        onChange={(e) => updateItem(item.id, 'unit_measure', e.target.value)}
                        placeholder="unidad, mg, ml, etc."
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Precio Unitario
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.estimated_unit_price}
                        onChange={(e) => updateItem(item.id, 'estimated_unit_price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        disabled={loading}
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Justificación Médica *
                      </label>
                      <textarea
                        value={item.medical_justification}
                        onChange={(e) => updateItem(item.id, 'medical_justification', e.target.value)}
                        placeholder="Justificación médica específica para este artículo..."
                        rows={2}
                        disabled={loading}
                        className={`w-full px-3 py-2 border rounded-md 
                                 bg-white dark:bg-darkmode-700 text-gray-900 dark:text-white
                                 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                                   errors[`item_${index}_justification`] 
                                     ? 'border-red-300 dark:border-red-600' 
                                     : 'border-gray-300 dark:border-gray-600'
                                 }`}
                      />
                      {errors[`item_${index}_justification`] && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors[`item_${index}_justification`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Indicación Terapéutica
                      </label>
                      <Input
                        value={item.therapeutic_indication}
                        onChange={(e) => updateItem(item.id, 'therapeutic_indication', e.target.value)}
                        placeholder="Indicación específica"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Consumo Mensual
                      </label>
                      <Input
                        type="number"
                        value={item.monthly_consumption}
                        onChange={(e) => updateItem(item.id, 'monthly_consumption', parseInt(e.target.value) || 0)}
                        placeholder="Unidades por mes"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Cantidad de Pacientes
                      </label>
                      <Input
                        type="number"
                        value={item.patient_quantity}
                        onChange={(e) => updateItem(item.id, 'patient_quantity', parseInt(e.target.value) || 0)}
                        placeholder="Pacientes que utilizarán"
                        disabled={loading}
                      />
                    </div>

                    {item.estimated_total_price !== undefined && (
                      <div className="md:col-span-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Precio Total:
                          </span>
                          <span className="font-semibold text-lg text-gray-900 dark:text-white">
                            ${item.estimated_total_price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {formData.items.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay artículos agregados al pedido</p>
                  <p className="text-sm">Use los botones de arriba para agregar artículos</p>
                </div>
              )}
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="bg-white dark:bg-darkmode-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Información de Contacto
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Persona de Contacto
                </label>
                <Input
                  value={formData.contact_person}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                  placeholder="Nombre del responsable"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Teléfono de Contacto
                </label>
                <Input
                  value={formData.contact_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                  placeholder="+54 11 1234-5678"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email de Contacto
                </label>
                <Input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="contacto@hospital.com"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dirección de Entrega
                </label>
                <Input
                  value={formData.delivery_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_address: e.target.value }))}
                  placeholder="Dirección de entrega específica"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Configuración de Análisis */}
          <div className="bg-white dark:bg-darkmode-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Configuración de Análisis
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="requires_ai_analysis"
                  checked={formData.requires_ai_analysis}
                  onChange={(e) => setFormData(prev => ({ ...prev, requires_ai_analysis: e.target.checked }))}
                  disabled={loading}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded 
                           focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 
                           focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="requires_ai_analysis" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Solicitar análisis automatizado con IA
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Autorización Preferida
                </label>
                <select
                  value={formData.authorization_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, authorization_type: e.target.value as any }))}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                           bg-white dark:bg-darkmode-700 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="automatic">Automática (IA)</option>
                  <option value="manual">Manual (Auditor)</option>
                  <option value="hybrid">Híbrida (IA + Revisión Manual)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Resumen */}
          {formData.items.length > 0 && (
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Resumen del Pedido
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {formData.items.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Artículos
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {formData.items.reduce((sum, item) => sum + (item.quantity || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Unidades Totales
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    ${calculateTotal().toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Costo Estimado
                  </div>
                </div>
              </div>

              {calculateTotal() > 500000 && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                        Pedido de Alto Valor
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Este pedido supera los $500,000 y requerirá autorización especial del director administrativo.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-600">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/effector/requests')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || formData.items.length === 0}
              className="flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? 'Creando...' : 'Crear Pedido'}
            </Button>
          </div>
        </form>
      </div>
    </BaseLayout>
  );
};

export default EffectorRequestCreatePage; 