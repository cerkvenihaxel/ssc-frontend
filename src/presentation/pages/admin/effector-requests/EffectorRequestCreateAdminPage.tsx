import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { 
  ArrowLeft,
  Plus,
  Search,
  X,
  Save,
  AlertCircle,
  Calendar,
  DollarSign,
  Package,
  Building,
  User,
  FileText,
  Upload,
  Minus
} from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';
import { useToast } from '../../../../shared/components/ui/ToastContainer';
import { useAuth } from '../../../contexts/AuthContext';
import { useObfuscation } from '../../../../shared/contexts/ObfuscationContext';

interface Article {
  articuloId: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  presentacion?: string;
  stock?: number;
  grupoId?: string;
  grupoNombre?: string;
}

interface Effector {
  user_id: string;
  nombre: string;
  email: string;
  cuil?: string;
  telefono?: string;
  direccion?: string;
  localidad?: string;
  provincia?: string;
}

interface RequestItem {
  id: string;
  article_id?: string;
  article_name: string;
  article_code?: string;
  description: string;
  quantity: number;
  unit_measure?: string;
  technical_specifications?: string;
  justification?: string;
  estimated_unit_price?: number;
  estimated_total_price?: number;
}

interface FormData {
  effector_id: string;
  title: string;
  description: string;
  priority: 'BAJA' | 'NORMAL' | 'ALTA' | 'URGENTE';
  delivery_date: string;
  delivery_address: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  institution_department: string;
  institutional_justification: string;
  estimated_beneficiaries?: number;
  urgency_context: string;
  items: RequestItem[];
  attachments: File[];
}

const initialFormData: FormData = {
  effector_id: '',
  title: '',
  description: '',
  priority: 'NORMAL',
  delivery_date: '',
  delivery_address: '',
  contact_person: '',
  contact_phone: '',
  contact_email: '',
  institution_department: '',
  institutional_justification: '',
  estimated_beneficiaries: undefined,
  urgency_context: '',
  items: [],
  attachments: []
};

const EffectorRequestCreateAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const { obfuscatedApiClient } = useObfuscation();

  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [searchingArticles, setSearchingArticles] = useState(false);
  const [articleSearchTerm, setArticleSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [showArticleSearch, setShowArticleSearch] = useState(false);
  const [effectores, setEffectores] = useState<Effector[]>([]);
  const [selectedEffector, setSelectedEffector] = useState<Effector | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      await loadEffectores();
      if (isEditing && id) {
        await loadRequestData(id);
      }
    };
    
    loadInitialData();
  }, [id, isEditing]);

  const loadEffectores = async () => {
    try {
      const response = await obfuscatedApiClient.get('/v1/admin/users/effectors') as any;
      // El backend devuelve { effectors: [], total: number }
      const effectores = response.effectors || [];
      setEffectores(effectores);
    } catch (error) {
      console.error('Error loading effectores:', error);
      showError('Error', 'Error al cargar los efectores');
    }
  };

  const loadRequestData = async (requestId: string) => {
    try {
      setInitialLoading(true);
      const data = await obfuscatedApiClient.get(`/v1/effector-requests/${requestId}`) as any;
      
      // Mapear los datos del pedido al formato del formulario
      const mappedData: FormData = {
        effector_id: data.effector_id || '',
        title: data.title || '',
        description: data.description || '',
        priority: data.priority || 'NORMAL',
        delivery_date: data.delivery_date ? data.delivery_date.split('T')[0] : '',
        delivery_address: data.delivery_address || '',
        contact_person: data.contact_person || '',
        contact_phone: data.contact_phone || '',
        contact_email: data.contact_email || '',
        institution_department: data.institution_department || '',
        institutional_justification: data.institutional_justification || '',
        estimated_beneficiaries: data.estimated_beneficiaries,
        urgency_context: data.urgency_context || '',
        items: data.items?.map((item: any) => ({
          id: item.item_id || Date.now().toString(),
          article_id: item.article_id,
          article_name: item.article_name,
          article_code: item.article_code,
          description: item.description || item.article_name,
          quantity: item.quantity || 1,
          unit_measure: item.unit_measure || '',
          technical_specifications: item.technical_specifications || '',
          justification: item.justification || ''
        })) || [],
        attachments: [] // Los archivos no se pueden cargar para editar
      };

      setFormData(mappedData);
      
      // Buscar y establecer el efector seleccionado
      if (data.effector_id) {
        const effector = effectores.find(e => e.user_id === data.effector_id);
        if (effector) {
          setSelectedEffector(effector);
        }
      }
      
    } catch (error) {
      console.error('Error loading request data:', error);
      showError('Error', 'Error al cargar los datos del pedido');
      navigate('/admin/effector-requests/list');
    } finally {
      setInitialLoading(false);
    }
  };

  // Buscar artículos del depósito
  const searchArticles = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchingArticles(true);
    try {
      const data = await obfuscatedApiClient.get<Article[]>(
        `/v1/deposito/articulos?searchTerm=${encodeURIComponent(searchTerm)}&limit=20`
      );
      setSearchResults(data);
      setShowArticleSearch(true);
    } catch (error) {
      console.error('Error searching articles:', error);
      showError('Error', 'Error al buscar artículos');
    } finally {
      setSearchingArticles(false);
    }
  };

  // Debounce para búsqueda de artículos
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (articleSearchTerm) {
        searchArticles(articleSearchTerm);
      } else {
        setShowArticleSearch(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [articleSearchTerm]);

  // Agregar artículo del depósito al pedido
  const addArticleToRequest = (article: Article) => {
    const existingItem = formData.items.find(item => item.article_id === article.articuloId);
    
    if (existingItem) {
      showError('Error', 'Este artículo ya está en el pedido');
      return;
    }

    const newItem: RequestItem = {
      id: Date.now().toString(),
      article_id: article.articuloId,
      article_name: article.nombre,
      article_code: article.codigo,
      description: article.descripcion || article.nombre,
      quantity: 1,
      unit_measure: article.presentacion || '',
      technical_specifications: '',
      justification: ''
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    setArticleSearchTerm('');
    setSearchResults([]);
    setShowArticleSearch(false);
    showSuccess('Éxito', `Artículo "${article.nombre}" agregado al pedido`);
  };

  // Agregar artículo manual (no del depósito)
  const addManualItem = () => {
    const newItem: RequestItem = {
      id: Date.now().toString(),
      article_name: '',
      description: '',
      quantity: 1,
      unit_measure: '',
      technical_specifications: '',
      justification: ''
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  // Actualizar item del pedido
  const updateRequestItem = (itemId: string, field: keyof RequestItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
  };

  // Eliminar item del pedido
  const removeRequestItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  // Manejar selección de efector
  const handleEffectorChange = (effectorId: string) => {
    const effector = effectores.find(e => e.user_id === effectorId);
    setSelectedEffector(effector || null);
    
    // Auto-completar datos del efector
    if (effector) {
      setFormData(prev => ({
        ...prev,
        effector_id: effectorId,
        contact_person: effector.nombre,
        contact_phone: effector.telefono || '',
        contact_email: effector.email,
        delivery_address: effector.direccion || ''
      }));
    }
  };

  // Manejar archivos adjuntos
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                         'application/msword', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                         'application/vnd.ms-excel', 'image/jpeg', 'image/jpg', 'image/png'];
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB
    });

    if (validFiles.length !== files.length) {
      showError('Error', 'Algunos archivos no son válidos. Solo se permiten PDF, Word, Excel e imágenes hasta 10MB');
    }

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles]
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  // Validar formulario
  const validateForm = () => {
    if (!formData.effector_id) {
      showError('Error', 'Debe seleccionar un efector');
      return false;
    }
    if (!formData.title.trim()) {
      showError('Error', 'El título es requerido');
      return false;
    }
    if (formData.items.length === 0) {
      showError('Error', 'Debe agregar al menos un artículo');
      return false;
    }
    
    for (const item of formData.items) {
      if (!item.article_name.trim() || !item.description.trim() || item.quantity <= 0) {
        showError('Error', 'Todos los artículos deben tener nombre, descripción y cantidad válida');
        return false;
      }
    }
    
    return true;
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Preparar datos como JSON
      const submitData = {
        effector_id: formData.effector_id,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        delivery_date: formData.delivery_date,
        delivery_address: formData.delivery_address,
        contact_person: formData.contact_person,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        institution_department: formData.institution_department,
        institutional_justification: formData.institutional_justification,
        ...(formData.estimated_beneficiaries && { estimated_beneficiaries: formData.estimated_beneficiaries }),
        urgency_context: formData.urgency_context,
        items: formData.items.map(item => ({
          article_id: item.article_id,
          article_code: item.article_code,
          article_name: item.article_name,
          description: item.description,
          quantity: item.quantity,
          unit_measure: item.unit_measure,
          technical_specifications: item.technical_specifications,
          justification: item.justification,
          estimated_unit_price: item.estimated_unit_price || 0,
          estimated_total_price: item.estimated_total_price || (item.estimated_unit_price || 0) * item.quantity
        }))
      };

      let createdRequest: any;
      if (isEditing && id) {
        createdRequest = await obfuscatedApiClient.put(`/v1/effector-requests/${id}`, submitData);
        showSuccess('Éxito', 'Pedido de efector actualizado exitosamente');
      } else {
        createdRequest = await obfuscatedApiClient.post('/v1/effector-requests', submitData);
        showSuccess('Éxito', 'Pedido de efector creado exitosamente');
      }

      // Si hay archivos adjuntos, subirlos por separado
      if (formData.attachments.length > 0 && createdRequest) {
        try {
          const requestId = createdRequest.request_id || id;
          const fileFormData = new FormData();
          
          formData.attachments.forEach((file) => {
            fileFormData.append('files', file);
          });

          await obfuscatedApiClient.post(`/v1/effector-requests/${requestId}/attachments`, fileFormData);
          console.log('Archivos adjuntos subidos exitosamente');
        } catch (fileError) {
          console.error('Error uploading attachments:', fileError);
          showError('Advertencia', 'El pedido se creó pero hubo un error al subir los archivos adjuntos');
        }
      }

      navigate('/admin/effector-requests/list');
    } catch (error: any) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} effector request:`, error);
      
      // Manejar errores de validación
      if (error.response?.data?.message && Array.isArray(error.response.data.message)) {
        const validationErrors = error.response.data.message.join('\n• ');
        showError('Errores de validación', `• ${validationErrors}`);
      } else if (error.response?.data?.message) {
        showError('Error', error.response.data.message);
      } else {
        showError('Error', `Error al ${isEditing ? 'actualizar' : 'crear'} el pedido`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <BaseLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Cargando datos del pedido...
          </span>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/admin/effector-requests/list">
              <Button variant="outline-secondary" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Editar Pedido de Efector' : 'Crear Pedido de Efector'}
              </h1>
              <p className="text-gray-600">
                {isEditing ? 'Modifique los datos del pedido' : 'Complete los datos para crear un nuevo pedido'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información del Efector */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Building className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Información del Efector</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Efector *
                </label>
                <select
                  value={formData.effector_id}
                  onChange={(e) => handleEffectorChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar efector...</option>
                  {effectores.map((effector) => (
                    <option key={effector.user_id} value={effector.user_id}>
                      {effector.nombre} - {effector.email}
                    </option>
                  ))}
                </select>
              </div>

              {selectedEffector && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Datos del Efector</h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Nombre:</strong> {selectedEffector.nombre}</p>
                    <p><strong>Email:</strong> {selectedEffector.email}</p>
                    {selectedEffector.telefono && <p><strong>Teléfono:</strong> {selectedEffector.telefono}</p>}
                    {selectedEffector.direccion && <p><strong>Dirección:</strong> {selectedEffector.direccion}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información del Pedido */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Información del Pedido</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Título del Pedido *"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ej: Pedido de insumos médicos para área de emergencias"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descripción detallada del pedido..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridad
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="BAJA">Baja</option>
                  <option value="NORMAL">Normal</option>
                  <option value="ALTA">Alta</option>
                  <option value="URGENTE">Urgente</option>
                </select>
              </div>

              <div>
                <Input
                  label="Fecha de Entrega Deseada"
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => setFormData({...formData, delivery_date: e.target.value})}
                />
              </div>

              <div>
                <Input
                  label="Departamento/Área"
                  value={formData.institution_department}
                  onChange={(e) => setFormData({...formData, institution_department: e.target.value})}
                  placeholder="Ej: Emergencias, Clínica Médica, etc."
                />
              </div>

              <div>
                <Input
                  label="Beneficiarios Estimados"
                  type="number"
                  value={formData.estimated_beneficiaries || ''}
                  onChange={(e) => setFormData({...formData, estimated_beneficiaries: e.target.value ? parseInt(e.target.value) : undefined})}
                  placeholder="Número de personas beneficiarias"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Justificación Institucional
                </label>
                <textarea
                  value={formData.institutional_justification}
                  onChange={(e) => setFormData({...formData, institutional_justification: e.target.value})}
                  placeholder="Justificación médica o institucional del pedido..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Contexto de Urgencia"
                  value={formData.urgency_context}
                  onChange={(e) => setFormData({...formData, urgency_context: e.target.value})}
                  placeholder="Ej: Situación epidemiológica, emergencia sanitaria, etc."
                />
              </div>
            </div>
          </div>

          {/* Información de Contacto y Entrega */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-2 mb-4">
              <User className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Información de Contacto y Entrega</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Persona de Contacto"
                value={formData.contact_person}
                onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                placeholder="Nombre del responsable"
              />

              <Input
                label="Teléfono"
                value={formData.contact_phone}
                onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                placeholder="Teléfono de contacto"
              />

              <Input
                label="Email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                placeholder="Email de contacto"
              />

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección de Entrega
                </label>
                <textarea
                  value={formData.delivery_address}
                  onChange={(e) => setFormData({...formData, delivery_address: e.target.value})}
                  placeholder="Dirección completa para la entrega..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Artículos del Pedido */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-900">Artículos del Pedido</h2>
              </div>
              <Button
                type="button"
                variant="outline-primary"
                size="sm"
                onClick={addManualItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Manual
              </Button>
            </div>

            {/* Búsqueda de Artículos del Depósito */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar en Depósito
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={articleSearchTerm}
                  onChange={(e) => setArticleSearchTerm(e.target.value)}
                  placeholder="Buscar artículos por código o nombre..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchingArticles && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>

              {/* Resultados de búsqueda */}
              {showArticleSearch && searchResults.length > 0 && (
                <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md bg-white shadow-lg">
                  {searchResults.map((article) => (
                    <div
                      key={article.articuloId}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => addArticleToRequest(article)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {article.codigo} - {article.nombre}
                          </div>
                          {article.descripcion && (
                            <div className="text-sm text-gray-600">{article.descripcion}</div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            {article.grupoNombre && `Grupo: ${article.grupoNombre}`}
                            {article.stock !== undefined && ` • Stock: ${article.stock}`}
                          </div>
                        </div>
                        <Plus className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showArticleSearch && searchResults.length === 0 && articleSearchTerm && !searchingArticles && (
                <div className="mt-2 p-3 text-center text-gray-500 border border-gray-200 rounded-md">
                  No se encontraron artículos
                </div>
              )}
            </div>

            {/* Lista de Artículos en el Pedido */}
            {formData.items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No hay artículos en el pedido</p>
                <p className="text-sm">Busque en el depósito o agregue manualmente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.items.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-gray-900">
                          {item.article_code ? `${item.article_code} - ` : ''}{item.article_name || 'Nuevo artículo'}
                        </span>
                        {item.article_id && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            Del depósito
                          </span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => removeRequestItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Input
                          label="Nombre del Artículo *"
                          value={item.article_name}
                          onChange={(e) => updateRequestItem(item.id, 'article_name', e.target.value)}
                          placeholder="Nombre del artículo"
                          required
                        />
                      </div>

                      <div>
                        <Input
                          label="Cantidad *"
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const newQuantity = parseInt(e.target.value) || 1;
                            updateRequestItem(item.id, 'quantity', newQuantity);
                            // Recalcular precio total si existe precio unitario
                            if (item.estimated_unit_price) {
                              updateRequestItem(item.id, 'estimated_total_price', item.estimated_unit_price * newQuantity);
                            }
                          }}
                          required
                        />
                      </div>

                      <div>
                        <Input
                          label="Precio Unitario Estimado"
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.estimated_unit_price || ''}
                          onChange={(e) => {
                            const unitPrice = parseFloat(e.target.value) || 0;
                            updateRequestItem(item.id, 'estimated_unit_price', unitPrice);
                            updateRequestItem(item.id, 'estimated_total_price', unitPrice * item.quantity);
                          }}
                          placeholder="Precio por unidad en ARS"
                        />
                      </div>

                      <div>
                        <Input
                          label="Precio Total Estimado"
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.estimated_total_price || ''}
                          onChange={(e) => updateRequestItem(item.id, 'estimated_total_price', parseFloat(e.target.value) || 0)}
                          placeholder="Precio total en ARS"
                        />
                      </div>

                      <div>
                        <Input
                          label="Unidad de Medida"
                          value={item.unit_measure || ''}
                          onChange={(e) => updateRequestItem(item.id, 'unit_measure', e.target.value)}
                          placeholder="Ej: Unidad, Caja, Litro"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Descripción *
                        </label>
                        <textarea
                          value={item.description}
                          onChange={(e) => updateRequestItem(item.id, 'description', e.target.value)}
                          placeholder="Descripción detallada del artículo..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Especificaciones Técnicas
                        </label>
                        <textarea
                          value={item.technical_specifications || ''}
                          onChange={(e) => updateRequestItem(item.id, 'technical_specifications', e.target.value)}
                          placeholder="Especificaciones técnicas, marca preferida, etc."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Justificación
                        </label>
                        <textarea
                          value={item.justification || ''}
                          onChange={(e) => updateRequestItem(item.id, 'justification', e.target.value)}
                          placeholder="Justificación de la necesidad..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Archivos Adjuntos */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Upload className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Archivos Adjuntos</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Seleccionar Archivos
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, Word, Excel, imágenes. Máximo 10MB por archivo.
                </p>
              </div>

              {formData.attachments.length > 0 && (
                <div className="space-y-2">
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>
                                             <Button
                         type="button"
                         variant="outline-secondary"
                         size="sm"
                         onClick={() => removeAttachment(index)}
                         className="text-red-600"
                       >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end space-x-4">
                         <Link to="/admin/effector-requests/list">
               <Button type="button" variant="outline-secondary">
                 Cancelar
               </Button>
             </Link>
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Actualizar Pedido' : 'Crear Pedido'}
            </Button>
          </div>
        </form>
      </div>
    </BaseLayout>
  );
};

export default EffectorRequestCreateAdminPage; 