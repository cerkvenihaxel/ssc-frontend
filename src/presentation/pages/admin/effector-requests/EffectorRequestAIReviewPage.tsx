import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Brain,
  Search, 
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  DollarSign,
  Package,
  Building,
  Activity,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';
import { useToast } from '../../../../shared/components/ui/ToastContainer';
import { useAuth } from '../../../contexts/AuthContext';
import { useObfuscation } from '../../../../shared/contexts/ObfuscationContext';

interface EffectorRequest {
  request_id: string;
  request_number: string;
  title: string;
  priority: 'BAJA' | 'NORMAL' | 'ALTA' | 'URGENTE';
  total_estimated_amount?: number;
  created_at: string;
  effector_info?: {
    effector_name: string;
    effector_type: string;
  };
  items_count?: number;
  ai_analysis_result?: {
    recommendation: string;
    approval_recommendation: boolean;
    confidence_score: number;
    risk_level: 'BAJO' | 'MEDIO' | 'ALTO';
    analysis_summary: string;
    detailed_analysis: any;
  };
  ai_analyzed_at?: string;
  state?: {
    state_name: string;
  };
}

interface Filters {
  search: string;
  risk_level: string;
  recommendation: string;
  confidence_min: number;
}

const EffectorRequestAIReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const { obfuscatedApiClient } = useObfuscation();

  const [requests, setRequests] = useState<EffectorRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    search: '',
    risk_level: '',
    recommendation: '',
    confidence_min: 0
  });

  // Cargar pedidos con análisis de IA
  const loadAIAnalyzedRequests = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('has_ai_analysis', 'true');
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.risk_level) queryParams.append('risk_level', filters.risk_level);
      if (filters.recommendation) queryParams.append('recommendation', filters.recommendation);
      if (filters.confidence_min > 0) queryParams.append('confidence_min', filters.confidence_min.toString());

      const response = await obfuscatedApiClient.get(
        `/v1/effector-requests?${queryParams.toString()}`
      );
      
      setRequests((response as any) || []);
      
      // Cargar estadísticas de IA
      const statsResponse = await obfuscatedApiClient.get('/v1/effector-requests/ai-analysis/stats');
      setStats((statsResponse as any) || {});
    } catch (error) {
      console.error('Error loading AI analyzed requests:', error);
      showError('Error', 'No se pudieron cargar los pedidos analizados por IA');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAIAnalyzedRequests();
  }, [filters]);

  // Reanalizar con IA
  const handleReanalyze = async (requestId: string) => {
    try {
      setLoading(true);
      await obfuscatedApiClient.post(`/v1/effector-requests/${requestId}/ai-analyze`);
      showSuccess('Éxito', 'Análisis de IA actualizado exitosamente');
      loadAIAnalyzedRequests();
    } catch (error: any) {
      console.error('Error reanalyzing request:', error);
      showError('Error', error.response?.data?.message || 'Error al reanalizar el pedido');
    } finally {
      setLoading(false);
    }
  };

  // Obtener color de recomendación
  const getRecommendationColor = (approval: boolean) => {
    return approval 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
  };

  // Obtener ícono de recomendación
  const getRecommendationIcon = (approval: boolean) => {
    return approval ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />;
  };

  // Obtener color de nivel de riesgo
  const getRiskLevelColor = (level: string) => {
    const colors = {
      'BAJO': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'MEDIO': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      'ALTO': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Obtener color de confianza
  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 dark:text-green-400';
    if (score >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <BaseLayout title="Revisión IA - Pedidos de Efectores">
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Brain className="w-8 h-8 mr-3 text-blue-500" />
              Revisión de Análisis IA
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              Revisar y gestionar análisis automáticos de pedidos de efectores ({requests.length} pedidos analizados)
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button variant="outline-primary" size="sm" onClick={loadAIAnalyzedRequests}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Link to="/admin/effector-requests/list">
              <Button variant="outline-primary" size="sm">
                <Package className="w-4 h-4 mr-2" />
                Ver Todos
              </Button>
            </Link>
          </div>
        </div>

        {/* Estadísticas de IA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white dark:bg-darkmode-600 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Brain className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                      Analizados por IA
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.total_analyzed || 0}
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
                      Recomendados
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.recommended_for_approval || 0}
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
                      No Recomendados
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.not_recommended || 0}
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
                  <AlertTriangle className="h-6 w-6 text-orange-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                      Alto Riesgo
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.high_risk || 0}
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
                  <TrendingUp className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                      Confianza Promedio
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {Math.round((stats.average_confidence || 0) * 100)}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Filtros de Análisis IA
            </h3>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Buscar por título, número, efector..."
                  className="pl-10"
                />
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nivel de Riesgo
                  </label>
                  <select
                    value={filters.risk_level}
                    onChange={(e) => setFilters(prev => ({ ...prev, risk_level: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                             bg-white dark:bg-darkmode-700 text-gray-900 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todos los niveles</option>
                    <option value="BAJO">Bajo</option>
                    <option value="MEDIO">Medio</option>
                    <option value="ALTO">Alto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recomendación IA
                  </label>
                  <select
                    value={filters.recommendation}
                    onChange={(e) => setFilters(prev => ({ ...prev, recommendation: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                             bg-white dark:bg-darkmode-700 text-gray-900 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todas las recomendaciones</option>
                    <option value="true">Aprobar</option>
                    <option value="false">Rechazar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confianza Mínima (%)
                  </label>
                  <Input
                    type="number"
                    value={filters.confidence_min}
                    onChange={(e) => setFilters(prev => ({ ...prev, confidence_min: parseInt(e.target.value) || 0 }))}
                    min="0"
                    max="100"
                    placeholder="0"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setFilters({ search: '', risk_level: '', recommendation: '', confidence_min: 0 })}
                    className="w-full"
                  >
                    Limpiar Filtros
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Pedidos Analizados */}
        <div className="bg-white dark:bg-darkmode-600 shadow overflow-hidden sm:rounded-md">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">
                Cargando análisis de IA...
              </span>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No hay pedidos analizados
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                Los pedidos aparecerán aquí una vez que sean analizados por IA.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-600">
              {requests.map((request) => (
                <div key={request.request_id} className="p-6 hover:bg-gray-50 dark:hover:bg-darkmode-700">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {request.title}
                        </p>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getRecommendationColor(request.ai_analysis_result?.approval_recommendation || false)}`}>
                          {getRecommendationIcon(request.ai_analysis_result?.approval_recommendation || false)}
                          {request.ai_analysis_result?.approval_recommendation ? 'APROBAR' : 'RECHAZAR'}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelColor(request.ai_analysis_result?.risk_level || 'MEDIO')}`}>
                          {request.ai_analysis_result?.risk_level || 'MEDIO'} RIESGO
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-slate-400 mb-3">
                        <div>
                          <span className="font-medium">Efector:</span> {request.effector_info?.effector_name || 'No especificado'}
                        </div>
                        <div>
                          <span className="font-medium">Número:</span> {request.request_number}
                        </div>
                        <div>
                          <span className="font-medium">Valor:</span> ${(request.total_estimated_amount || 0).toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Analizado:</span> {new Date(request.ai_analyzed_at!).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Análisis de IA */}
                      <div className="bg-gray-50 dark:bg-darkmode-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className={`text-2xl font-bold ${getConfidenceColor(request.ai_analysis_result?.confidence_score || 0)}`}>
                                {Math.round((request.ai_analysis_result?.confidence_score || 0) * 100)}%
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Confianza</div>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900 dark:text-white font-medium mb-1">
                                Resumen del Análisis:
                              </p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {request.ai_analysis_result?.analysis_summary || 'Sin análisis disponible'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleReanalyze(request.request_id)}
                        disabled={loading}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Link to={`/admin/effector-requests/${request.request_id}/details`}>
                        <Button variant="outline-primary" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link to={`/admin/effector-requests`}>
                        <Button variant="primary" size="sm">
                          <ArrowUpRight className="w-4 h-4 mr-1" />
                          Revisar
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </BaseLayout>
  );
};

export default EffectorRequestAIReviewPage; 