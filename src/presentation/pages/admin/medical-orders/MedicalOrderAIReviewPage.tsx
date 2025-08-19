import React, { useState, useEffect } from 'react';
import { Bot, RefreshCw, CheckCircle, XCircle, AlertTriangle, Eye, TrendingUp, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';
import LoadingSpinner from '../../../../shared/components/ui/LoadingSpinner';

interface AIAnalysisOrder {
  id: string;
  orderNumber: string;
  affiliateName: string;
  requesterName: string;
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'CRITICAL';
  createdAt: string;
  aiAnalysis: {
    status: 'APPROVED' | 'REJECTED' | 'NEEDS_REVIEW';
    confidence: number;
    reasoning: string;
    analyzedAt: string;
    riskFactors: string[];
    recommendations: string[];
  };
}

interface AIReviewStats {
  totalAnalyzed: number;
  approved: number;
  rejected: number;
  needsReview: number;
  averageConfidence: number;
}

const MedicalOrderAIReviewPage: React.FC = () => {
  const [orders, setOrders] = useState<AIAnalysisOrder[]>([]);
  const [stats, setStats] = useState<AIReviewStats>({
    totalAnalyzed: 0,
    approved: 0,
    rejected: 0,
    needsReview: 0,
    averageConfidence: 0,
  });
  const [loading, setLoading] = useState(true);
  const [analyzingAll, setAnalyzingAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confidenceFilter, setConfidenceFilter] = useState('all');

  // Cargar datos de análisis de IA
  useEffect(() => {
    const loadAIAnalysisData = async () => {
      try {
        setLoading(true);
        // Simular carga de datos
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockOrders: AIAnalysisOrder[] = [
          {
            id: '1',
            orderNumber: 'ORD-2024-001',
            affiliateName: 'Juan Pérez',
            requesterName: 'Dr. Ana García',
            urgencyLevel: 'HIGH',
            createdAt: '2024-01-15T10:30:00Z',
            aiAnalysis: {
              status: 'NEEDS_REVIEW',
              confidence: 0.75,
              reasoning: 'Cantidad de clips dentro del rango normal para fractura de costillas, pero el costo de drenajes es elevado.',
              analyzedAt: '2024-01-15T10:35:00Z',
              riskFactors: [
                'Cantidad excesiva de drenajes torácicos',
                'Costo superior al promedio para este tipo de procedimiento'
              ],
              recommendations: [
                'Revisar justificación para 8 drenajes torácicos',
                'Considerar reducir cantidad a 2-3 drenajes',
                'Verificar protocolos hospitalarios'
              ]
            }
          },
          {
            id: '2',
            orderNumber: 'ORD-2024-002',
            affiliateName: 'María González',
            requesterName: 'Dr. Carlos Ruiz',
            urgencyLevel: 'MEDIUM',
            createdAt: '2024-01-14T14:20:00Z',
            aiAnalysis: {
              status: 'APPROVED',
              confidence: 0.92,
              reasoning: 'Medicamentos estándar para diabetes tipo 2. Cantidades apropiadas según peso y edad del paciente.',
              analyzedAt: '2024-01-14T14:25:00Z',
              riskFactors: [],
              recommendations: [
                'Monitorear glucemia post-tratamiento',
                'Considerar ajustes de dosis según respuesta'
              ]
            }
          },
          {
            id: '3',
            orderNumber: 'ORD-2024-003',
            affiliateName: 'Pedro Martínez',
            requesterName: 'Lic. Laura Fernández',
            urgencyLevel: 'LOW',
            createdAt: '2024-01-13T09:15:00Z',
            aiAnalysis: {
              status: 'REJECTED',
              confidence: 0.88,
              reasoning: 'Equipo médico de alto costo sin justificación médica adecuada. No hay indicación clara para el uso especializado.',
              analyzedAt: '2024-01-13T09:20:00Z',
              riskFactors: [
                'Costo excesivo sin justificación específica',
                'Equipamiento no estándar para la condición',
                'Urgencia baja incompatible con costo'
              ],
              recommendations: [
                'Solicitar justificación médica detallada',
                'Considerar alternativas más económicas',
                'Revisar protocolos de autorización'
              ]
            }
          },
          {
            id: '4',
            orderNumber: 'ORD-2024-004',
            affiliateName: 'Ana Rodríguez',
            requesterName: 'Dr. Miguel Torres',
            urgencyLevel: 'URGENT',
            createdAt: '2024-01-12T16:45:00Z',
            aiAnalysis: {
              status: 'NEEDS_REVIEW',
              confidence: 0.68,
              reasoning: 'Procedimiento de alta complejidad con múltiples artículos. Requiere validación por especialista.',
              analyzedAt: '2024-01-12T16:50:00Z',
              riskFactors: [
                'Confianza de IA por debajo del umbral',
                'Múltiples categorías de artículos',
                'Procedimiento de alta complejidad'
              ],
              recommendations: [
                'Revisión por especialista en cirugía cardiovascular',
                'Validar protocolo quirúrgico',
                'Confirmar disponibilidad de equipo especializado'
              ]
            }
          }
        ];

        setOrders(mockOrders);
        
        // Calcular estadísticas
        const totalAnalyzed = mockOrders.length;
        const approved = mockOrders.filter(o => o.aiAnalysis.status === 'APPROVED').length;
        const rejected = mockOrders.filter(o => o.aiAnalysis.status === 'REJECTED').length;
        const needsReview = mockOrders.filter(o => o.aiAnalysis.status === 'NEEDS_REVIEW').length;
        const averageConfidence = mockOrders.reduce((sum, o) => sum + o.aiAnalysis.confidence, 0) / totalAnalyzed;

        setStats({
          totalAnalyzed,
          approved,
          rejected,
          needsReview,
          averageConfidence,
        });

      } catch (error) {
        console.error('Error loading AI analysis data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAIAnalysisData();
  }, []);

  // Filtros aplicados
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.affiliateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.requesterName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.aiAnalysis.status === statusFilter;
    
    const matchesConfidence = confidenceFilter === 'all' ||
      (confidenceFilter === 'high' && order.aiAnalysis.confidence >= 0.8) ||
      (confidenceFilter === 'medium' && order.aiAnalysis.confidence >= 0.6 && order.aiAnalysis.confidence < 0.8) ||
      (confidenceFilter === 'low' && order.aiAnalysis.confidence < 0.6);
    
    return matchesSearch && matchesStatus && matchesConfidence;
  });

  const handleReanalyzeAll = async () => {
    setAnalyzingAll(true);
    try {
      // Simular re-análisis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Actualizar análisis
      setOrders(prev => prev.map(order => ({
        ...order,
        aiAnalysis: {
          ...order.aiAnalysis,
          confidence: Math.min(1, order.aiAnalysis.confidence + 0.1),
          analyzedAt: new Date().toISOString()
        }
      })));
      
      alert('Re-análisis completado exitosamente');
    } catch (error) {
      console.error('Error reanalyzing orders:', error);
      alert('Error al re-analizar pedidos');
    } finally {
      setAnalyzingAll(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'APPROVED': { label: 'Aprobado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'REJECTED': { label: 'Rechazado', color: 'bg-red-100 text-red-800', icon: XCircle },
      'NEEDS_REVIEW': { label: 'Requiere Revisión', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.NEEDS_REVIEW;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getConfidenceBadge = (confidence: number) => {
    const percentage = Math.round(confidence * 100);
    let color = 'bg-red-100 text-red-800';
    
    if (confidence >= 0.8) color = 'bg-green-100 text-green-800';
    else if (confidence >= 0.6) color = 'bg-yellow-100 text-yellow-800';
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {percentage}%
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <BaseLayout title="Revisión de IA">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Revisión de IA">
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Revisión de IA - Pedidos Médicos
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              Análisis automático y recomendaciones de inteligencia artificial
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={handleReanalyzeAll}
              disabled={analyzingAll}
              className="inline-flex items-center"
            >
              {analyzingAll ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Re-analizando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Re-analizar Todo
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <div className="bg-white dark:bg-darkmode-600 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Bot className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                      Analizados
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.totalAnalyzed}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-darkmode-600 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                      Aprobados
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.approved}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-darkmode-600 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircle className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                      Rechazados
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.rejected}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-darkmode-600 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                      Requieren Revisión
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.needsReview}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-darkmode-600 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                      Confianza Promedio
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {Math.round(stats.averageConfidence * 100)}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-darkmode-600 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                      Confianza Promedio
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {Math.round(stats.averageConfidence * 100)}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Bot className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar análisis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Estado del Análisis
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300"
              >
                <option value="all">Todos</option>
                <option value="APPROVED">Aprobados</option>
                <option value="REJECTED">Rechazados</option>
                <option value="NEEDS_REVIEW">Requieren Revisión</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Nivel de Confianza
              </label>
              <select
                value={confidenceFilter}
                onChange={(e) => setConfidenceFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300"
              >
                <option value="all">Todos</option>
                <option value="high">Alta (≥80%)</option>
                <option value="medium">Media (60-79%)</option>
                <option value="low">Baja (&lt;60%)</option>
              </select>
            </div>

            <div className="flex items-end">
              <Link to="/admin/medical-orders" className="w-full">
                <Button variant="outline" className="w-full">
                  Ver Todos los Pedidos
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* AI Analysis Table */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-darkmode-400">
              <thead className="bg-gray-50 dark:bg-darkmode-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Pedido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Estado IA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Confianza
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Recomendaciones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Analizado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-darkmode-600 divide-y divide-gray-200 dark:divide-darkmode-400">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                      <Bot className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay análisis</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                        No se encontraron análisis de IA con los filtros aplicados.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-darkmode-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.orderNumber}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-slate-400">
                            {order.affiliateName}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-slate-500">
                            {order.requesterName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.aiAnalysis.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getConfidenceBadge(order.aiAnalysis.confidence)}
                      </td>
                                              <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {order.aiAnalysis.recommendations.length > 0 ? (
                              <div className="space-y-1">
                                {order.aiAnalysis.recommendations.slice(0, 2).map((rec, index) => (
                                  <div key={index} className="text-xs text-blue-600 dark:text-blue-400">
                                    • {rec}
                                  </div>
                                ))}
                                {order.aiAnalysis.recommendations.length > 2 && (
                                  <div className="text-xs text-gray-500 dark:text-slate-400">
                                    +{order.aiAnalysis.recommendations.length - 2} más...
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500 dark:text-slate-400">Sin recomendaciones</span>
                            )}
                          </div>
                        </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatDate(order.aiAnalysis.analyzedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/admin/medical-orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default MedicalOrderAIReviewPage; 