import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle, Calendar } from 'lucide-react';

interface MedicalOrderItem {
  id: string;
  categoryId: string;
  itemType: 'medication' | 'equipment' | 'supply';
  itemName: string;
  itemCode?: string;
  itemDescription?: string;
  requestedQuantity: number;
  unitOfMeasure: string;
  brand?: string;
  presentation?: string;
  concentration?: string;
  administrationRoute?: string;
  medicalJustification?: string;
  estimatedUnitCost?: number;
}

interface MedicalOrderFormData {
  affiliateId: string;
  healthcareProviderId: string;
  urgencyId: number;
  title: string;
  description?: string;
  medicalJustification: string;
  diagnosis?: string;
  treatmentPlan?: string;
  estimatedDurationDays?: number;
  hasAttachments: boolean;
  estimatedCost?: number;
  authorizationType: 'manual' | 'automatic' | 'hybrid';
  items: MedicalOrderItem[];
}

const MedicalOrderCreatePage: React.FC = () => {
  const [formData, setFormData] = useState<MedicalOrderFormData>({
    affiliateId: '',
    healthcareProviderId: '',
    urgencyId: 2,
    title: '',
    description: '',
    medicalJustification: '',
    diagnosis: '',
    treatmentPlan: '',
    estimatedDurationDays: 7,
    hasAttachments: false,
    estimatedCost: 0,
    authorizationType: 'automatic',
    items: []
  });

  const [loading, setLoading] = useState(false);

  const mockAffiliates = [
    { id: '1', name: 'Juan Pérez', number: 'AF001', healthcareProvider: 'OSDE' },
    { id: '2', name: 'María García', number: 'AF002', healthcareProvider: 'Swiss Medical' },
    { id: '3', name: 'Carlos López', number: 'AF003', healthcareProvider: 'Galeno' }
  ];

  const urgencyLevels = [
    { id: 1, name: 'Baja', color: 'bg-green-100 text-green-800' },
    { id: 2, name: 'Normal', color: 'bg-blue-100 text-blue-800' },
    { id: 3, name: 'Alta', color: 'bg-yellow-100 text-yellow-800' },
    { id: 4, name: 'Urgente', color: 'bg-orange-100 text-orange-800' },
    { id: 5, name: 'Crítica', color: 'bg-red-100 text-red-800' }
  ];

  const addItem = () => {
    const newItem: MedicalOrderItem = {
      id: Date.now().toString(),
      categoryId: '1',
      itemType: 'medication',
      itemName: '',
      requestedQuantity: 1,
      unitOfMeasure: 'unidad',
      medicalJustification: ''
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const updateItem = (itemId: string, field: keyof MedicalOrderItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const calculateTotalCost = () => {
    return formData.items.reduce((total, item) => {
      return total + (item.estimatedUnitCost || 0) * item.requestedQuantity;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        ...formData,
        estimatedCost: calculateTotalCost()
      };

      console.log('Creando pedido médico:', orderData);
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Pedido médico creado exitosamente');
      
      setFormData({
        affiliateId: '',
        healthcareProviderId: '',
        urgencyId: 2,
        title: '',
        description: '',
        medicalJustification: '',
        diagnosis: '',
        treatmentPlan: '',
        estimatedDurationDays: 7,
        hasAttachments: false,
        estimatedCost: 0,
        authorizationType: 'automatic',
        items: []
      });
    } catch (error) {
      console.error('Error creating medical order:', error);
      alert('Error al crear el pedido médico');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Crear Pedido Médico</h1>
        <p className="text-gray-600">Complete los datos para crear un nuevo pedido médico</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Paciente</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Afiliado
              </label>
              <select
                value={formData.affiliateId}
                onChange={(e) => setFormData(prev => ({ ...prev, affiliateId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Seleccionar afiliado</option>
                {mockAffiliates.map(affiliate => (
                  <option key={affiliate.id} value={affiliate.id}>
                    {affiliate.name} - {affiliate.number} ({affiliate.healthcareProvider})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel de Urgencia
              </label>
              <select
                value={formData.urgencyId}
                onChange={(e) => setFormData(prev => ({ ...prev, urgencyId: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {urgencyLevels.map(level => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Pedido</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título del Pedido
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Medicación para tratamiento de fractura de costilla"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnóstico
              </label>
              <input
                type="text"
                value={formData.diagnosis || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Fractura de costilla 7ma"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración del Tratamiento (días)
              </label>
              <input
                type="number"
                value={formData.estimatedDurationDays || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedDurationDays: parseInt(e.target.value) || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="365"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Justificación Médica
              </label>
              <textarea
                value={formData.medicalJustification}
                onChange={(e) => setFormData(prev => ({ ...prev, medicalJustification: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Justificación médica detallada para el pedido"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan de Tratamiento
              </label>
              <textarea
                value={formData.treatmentPlan || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, treatmentPlan: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                placeholder="Descripción del plan de tratamiento"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Autorización
              </label>
              <select
                value={formData.authorizationType}
                onChange={(e) => setFormData(prev => ({ ...prev, authorizationType: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="automatic">Automática (IA)</option>
                <option value="manual">Manual</option>
                <option value="hybrid">Híbrida</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasAttachments"
                checked={formData.hasAttachments}
                onChange={(e) => setFormData(prev => ({ ...prev, hasAttachments: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="hasAttachments" className="ml-2 block text-sm text-gray-900">
                Tiene archivos adjuntos
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Items del Pedido</h2>
            <button
              type="button"
              onClick={addItem}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Agregar Item
            </button>
          </div>

          {formData.items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No hay items agregados al pedido</p>
              <p className="text-sm">Haga clic en "Agregar Item" para comenzar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium text-gray-900">Item #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Item
                      </label>
                      <select
                        value={item.itemType}
                        onChange={(e) => updateItem(item.id, 'itemType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="medication">Medicamento</option>
                        <option value="equipment">Equipo Médico</option>
                        <option value="supply">Suministro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Item
                      </label>
                      <input
                        type="text"
                        value={item.itemName}
                        onChange={(e) => updateItem(item.id, 'itemName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: Paracetamol 500mg"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cantidad Solicitada
                      </label>
                      <input
                        type="number"
                        value={item.requestedQuantity}
                        onChange={(e) => updateItem(item.id, 'requestedQuantity', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unidad de Medida
                      </label>
                      <input
                        type="text"
                        value={item.unitOfMeasure}
                        onChange={(e) => updateItem(item.id, 'unitOfMeasure', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: unidad, ml, mg"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Costo Unitario Estimado
                      </label>
                      <input
                        type="number"
                        value={item.estimatedUnitCost || ''}
                        onChange={(e) => updateItem(item.id, 'estimatedUnitCost', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código
                      </label>
                      <input
                        type="text"
                        value={item.itemCode || ''}
                        onChange={(e) => updateItem(item.id, 'itemCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Código del item"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Justificación Médica del Item
                      </label>
                      <textarea
                        value={item.medicalJustification || ''}
                        onChange={(e) => updateItem(item.id, 'medicalJustification', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={2}
                        placeholder="Justificación específica para este item"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Pedido</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{formData.items.length}</div>
              <div className="text-sm text-gray-600">Items solicitados</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ${calculateTotalCost().toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Costo total estimado</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                urgencyLevels.find(l => l.id === formData.urgencyId)?.color || 'bg-gray-100 text-gray-800'
              }`}>
                {urgencyLevels.find(l => l.id === formData.urgencyId)?.name || 'Normal'}
              </div>
              <div className="text-sm text-gray-600 mt-1">Nivel de urgencia</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            onClick={() => window.history.back()}
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={loading || formData.items.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creando...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4" />
                Crear Pedido Médico
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MedicalOrderCreatePage; 