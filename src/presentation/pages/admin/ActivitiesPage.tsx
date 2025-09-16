import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Filter,
  Eye,
  Calendar,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  Activity as ActivityIcon,
  XCircle,
  FileText,
  Building,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Download,
  RefreshCw,
  Smartphone,
  Globe,
  Server,
  Database,
  Shield,
  Settings
} from 'lucide-react';
import BaseLayout from '../../../shared/components/layout/BaseLayout';
import { useAuth } from '../../contexts/AuthContext';
import { ActivityService, type ActivityLog, type ActivityFilters, type UserSuggestion } from '../../../infrastructure/services/activity.service';
import { useToast } from '../../../shared/components/ui/ToastContainer';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import AutoCompleteInput, { type AutoCompleteOption } from '../../../shared/components/ui/AutoCompleteInput';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { useCache } from '../../../shared/hooks/useCache';

interface ActivityDetail {
  activity: ActivityLog;
  isVisible: boolean;
}

const ActivitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();

  // Cache optimizado para consultas
  const cache = useCache<{ activities: ActivityLog[], total: number }>({ 
    ttl: 2 * 60 * 1000, // 2 minutos 
    maxSize: 50 
  });

  // States
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedActivity, setSelectedActivity] = useState<ActivityDetail | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Filtros optimizados
  const [filters, setFilters] = useState<ActivityFilters>({
    search: '',
    entityType: '',
    action: '',
    dateFrom: '',
    dateTo: '',
    userEmail: '',
    userName: ''
  });

  // Estados para autocompletado
  const [entityTypes, setEntityTypes] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);

  // Debounce para búsqueda de texto
  const debouncedFilters = useDebounce(filters, 500);

  // Función optimizada para cargar actividades
  const loadActivities = useCallback(async (useCache = true) => {
    try {
      setLoading(true);
      
      // Generar clave de cache
      const cacheKey = cache.generateKey('activities', {
        page: currentPage,
        limit: pageSize,
        ...debouncedFilters
      });

      // Intentar obtener del cache primero
      if (useCache) {
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
          setActivities(cachedData.activities);
          setTotalCount(cachedData.total);
          setLoading(false);
          return;
        }
      }

      // Si no está en cache, hacer petición al API
      const response = await ActivityService.searchWithFilters(
        debouncedFilters,
        currentPage,
        pageSize
      );
      
      setActivities(response.activities || []);
      setTotalCount(response.total || 0);
      
      // Guardar en cache
      cache.set(cacheKey, {
        activities: response.activities || [],
        total: response.total || 0
      });
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading activities:', error);
      showError('Error', 'No se pudieron cargar las actividades');
      setActivities([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedFilters, cache, showError]);

  // Cargar datos iniciales y cuando cambien filtros o página
  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // Cargar opciones de autocompletado
  useEffect(() => {
    const loadAutoCompleteData = async () => {
      try {
        const [entityTypesData, actionsData] = await Promise.all([
          ActivityService.getEntityTypeSuggestions(),
          ActivityService.getActionSuggestions()
        ]);
        
        setEntityTypes(entityTypesData);
        setActions(actionsData);
      } catch (error) {
        console.error('Error loading autocomplete data:', error);
      }
    };

    loadAutoCompleteData();
  }, []);

  // Auto refresh cada 30 segundos (solo si está en la primera página sin filtros)
  useEffect(() => {
    const hasActiveFilters = Object.values(debouncedFilters).some(value => value && value !== '');
    
    if (currentPage === 1 && !hasActiveFilters && !showFilters) {
      const interval = setInterval(() => {
        loadActivities(false); // No usar cache para auto-refresh
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [currentPage, debouncedFilters, showFilters, loadActivities]);

  // Función para buscar usuarios
  const searchUsers = useCallback(async (search: string): Promise<AutoCompleteOption[]> => {
    try {
      const users = await ActivityService.getUserSuggestions(search);
      return users.map(user => ({
        value: user.userEmail,
        label: user.userName,
        subtitle: user.userEmail
      }));
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }, []);

  // Manejar cambios de filtros
  const handleFilterChange = useCallback((key: keyof ActivityFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset a la primera página
    
    // Invalidar cache cuando cambien los filtros
    cache.invalidate('activities');
  }, [cache]);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      entityType: '',
      action: '',
      dateFrom: '',
      dateTo: '',
      userEmail: '',
      userName: ''
    });
    setCurrentPage(1);
    cache.invalidate('activities');
  }, [cache]);

  // Refresh manual
  const handleRefresh = useCallback(() => {
    cache.invalidate('activities');
    loadActivities(false);
    showSuccess('Éxito', 'Actividades actualizadas');
  }, [loadActivities, cache, showSuccess]);

  // Funciones de utilidad
  const getActivityIcon = (entityType: string, action: string) => {
    if (action.toLowerCase().includes('login')) return User;
    if (entityType === 'medical_order') return FileText;
    if (entityType === 'effector_request') return Building;
    if (entityType === 'user') return User;
    if (entityType === 'admin') return Shield;
    if (action.toLowerCase().includes('create')) return CheckCircle;
    if (action.toLowerCase().includes('update')) return Settings;
    if (action.toLowerCase().includes('delete')) return XCircle;
    return ActivityIcon;
  };

  const getActivityColor = (entityType: string, action: string) => {
    if (action.toLowerCase().includes('login')) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
    if (action.toLowerCase().includes('create')) return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    if (action.toLowerCase().includes('update')) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    if (action.toLowerCase().includes('delete')) return 'text-red-600 bg-red-100 dark:bg-red-900/20';
    if (action.toLowerCase().includes('error')) return 'text-red-600 bg-red-100 dark:bg-red-900/20';
    return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
  };

  const formatRelativeTime = (timestamp: string) => {
    if (!timestamp) return 'Fecha no disponible';
    
    const now = new Date();
    const activityTime = new Date(timestamp);
    
    // Verificar que la fecha sea válida
    if (isNaN(activityTime.getTime())) return 'Fecha inválida';
    
    const diffInSeconds = Math.floor((now.getTime() - activityTime.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Hace unos segundos';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
  };

  const formatMetadata = (metadata: any) => {
    if (!metadata) return null;

    const metadataEntries = Object.entries(metadata).filter(([key, value]) => 
      value !== null && value !== undefined && value !== '' && key !== 'user_agent'
    );

    if (metadataEntries.length === 0) return null;

    return metadataEntries.map(([key, value]) => (
      <div key={key} className="flex justify-between py-1 border-b border-gray-100 dark:border-darkmode-400 last:border-b-0">
        <span className="text-xs font-medium text-gray-600 dark:text-slate-400 capitalize">
          {key.replace(/_/g, ' ')}:
        </span>
        <span className="text-xs text-gray-900 dark:text-white ml-2 truncate max-w-[200px]">
          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
        </span>
      </div>
    ));
  };

  const handleActivityClick = (activity: ActivityLog) => {
    setSelectedActivity({
      activity,
      isVisible: true
    });
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <BaseLayout title="Actividades del Sistema">
      <div className="space-y-6">
        {/* Header optimizado */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Actividades del Sistema
              </h1>
              <p className="text-purple-100">
                Monitor de actividades y auditoría del sistema • Cache: {cache.size} entradas
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
              <div className="text-center sm:text-right">
                <p className="text-purple-100 text-sm">
                  Última actualización: {formatRelativeTime(lastUpdate.toISOString())}
                </p>
                <p className="text-purple-200 text-xs mt-1">
                  {totalCount} actividades registradas
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Filtros optimizados */}
        <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filtros de búsqueda
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Limpiar
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-darkmode-700 dark:hover:bg-darkmode-800 rounded-lg"
                >
                  <Filter className="w-4 h-4 mr-1" />
                  {showFilters ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Búsqueda de texto con debounce */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Buscar
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar en acciones, entidades, usuarios..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-darkmode-400 rounded-lg bg-white dark:bg-darkmode-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Autocompletado de usuarios */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Usuario
                  </label>
                  <AutoCompleteInput
                    value={filters.userEmail || ''}
                    onChange={(value) => handleFilterChange('userEmail', value)}
                    onSearch={searchUsers}
                    placeholder="Buscar por usuario..."
                    minSearchLength={2}
                    debounceMs={300}
                  />
                </div>

                {/* Tipo de Entidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Tipo de Entidad
                  </label>
                  <select
                    value={filters.entityType}
                    onChange={(e) => handleFilterChange('entityType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-400 rounded-lg bg-white dark:bg-darkmode-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Todas las entidades</option>
                    {entityTypes.map(type => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo de Acción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Acción
                  </label>
                  <select
                    value={filters.action}
                    onChange={(e) => handleFilterChange('action', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-400 rounded-lg bg-white dark:bg-darkmode-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Todas las acciones</option>
                    {actions.map(action => (
                      <option key={action} value={action}>
                        {action}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fecha desde */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Fecha desde
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-400 rounded-lg bg-white dark:bg-darkmode-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Fecha hasta */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Fecha hasta
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-400 rounded-lg bg-white dark:bg-darkmode-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Indicador de filtros activos */}
              {Object.values(filters).some(value => value && value !== '') && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    <Filter className="inline w-4 h-4 mr-1" />
                    Filtros activos aplicados • {loading ? 'Buscando...' : `${totalCount} resultados`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tabla de actividades */}
        <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Registro de Actividades
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-slate-400">
                <span>Página {currentPage} de {totalPages}</span>
                <span>({totalCount} total)</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <ActivityIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No hay actividades
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                No se encontraron actividades con los filtros aplicados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-darkmode-400">
                <thead className="bg-gray-50 dark:bg-darkmode-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Actividad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Entidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      IP
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-darkmode-600 divide-y divide-gray-200 dark:divide-darkmode-400">
                  {activities.map((activity) => {
                    const formatted = ActivityService.formatActivityForUI(activity);
                    const IconComponent = getActivityIcon(activity.entityType || '', activity.action || '');
                    const colorClass = getActivityColor(activity.entityType || '', activity.action || '');
                    
                    return (
                      <tr 
                        key={activity.logId}
                        className="hover:bg-gray-50 dark:hover:bg-darkmode-700 transition-colors cursor-pointer"
                        onClick={() => handleActivityClick(activity)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`p-2 rounded-full mr-3 ${colorClass}`}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatted.action}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-slate-400">
                                {activity.entityId && `ID: ${activity.entityId.slice(0, 8)}...`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {activity.userInfo?.nombre || 'Usuario desconocido'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-slate-400">
                            {activity.userInfo?.email || activity.userId?.slice(0, 8)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            {activity.entityType?.replace('_', ' ') || 'Sistema'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <div>{activity.timestamp ? new Date(activity.timestamp).toLocaleDateString() : '-'}</div>
                          <div className="text-xs text-gray-500 dark:text-slate-400">
                            {activity.timestamp ? new Date(activity.timestamp).toLocaleTimeString() : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                          {activity.ipAddress || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActivityClick(activity);
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-darkmode-400">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-slate-300">
                  Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, totalCount)} de {totalCount} actividades
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-darkmode-400 rounded-md text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-darkmode-700 hover:bg-gray-50 dark:hover:bg-darkmode-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            pageNum === currentPage
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 dark:text-slate-300 bg-white dark:bg-darkmode-700 border border-gray-300 dark:border-darkmode-400 hover:bg-gray-50 dark:hover:bg-darkmode-800'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-darkmode-400 rounded-md text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-darkmode-700 hover:bg-gray-50 dark:hover:bg-darkmode-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal de detalle */}
        {selectedActivity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-darkmode-400">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Detalle de Actividad
                  </h3>
                  <button
                    onClick={() => setSelectedActivity(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="space-y-6">
                  {/* Información básica */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-slate-400">Acción</label>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {selectedActivity.activity.action}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-slate-400">Tipo de Entidad</label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedActivity.activity.entityType?.replace('_', ' ') || 'Sistema'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-slate-400">ID de Entidad</label>
                      <p className="text-gray-900 dark:text-white font-mono text-sm">
                        {selectedActivity.activity.entityId || '-'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-slate-400">Fecha y Hora</label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedActivity.activity.timestamp ? new Date(selectedActivity.activity.timestamp).toLocaleString() : 'Fecha no disponible'}
                      </p>
                    </div>
                  </div>

                  {/* Información del usuario */}
                  <div className="border-t border-gray-200 dark:border-darkmode-400 pt-4">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                      Información del Usuario
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-slate-400">Nombre</label>
                        <p className="text-gray-900 dark:text-white">
                          {selectedActivity.activity.userInfo?.nombre || 'Usuario desconocido'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-slate-400">Email</label>
                        <p className="text-gray-900 dark:text-white">
                          {selectedActivity.activity.userInfo?.email || '-'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-slate-400">ID de Usuario</label>
                        <p className="text-gray-900 dark:text-white font-mono text-sm">
                          {selectedActivity.activity.userId || '-'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-slate-400">Dirección IP</label>
                        <p className="text-gray-900 dark:text-white">
                          {selectedActivity.activity.ipAddress || '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Metadatos */}
                  {selectedActivity.activity.metadata && Object.keys(selectedActivity.activity.metadata).length > 0 && (
                    <div className="border-t border-gray-200 dark:border-darkmode-400 pt-4">
                      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                        Metadatos
                      </h4>
                      <div className="bg-gray-50 dark:bg-darkmode-700 rounded-lg p-4">
                        {formatMetadata(selectedActivity.activity.metadata)}
                      </div>
                    </div>
                  )}

                  {/* User Agent */}
                  {selectedActivity.activity.metadata?.user_agent && (
                    <div className="border-t border-gray-200 dark:border-darkmode-400 pt-4">
                      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                        Información del Navegador
                      </h4>
                      <div className="bg-gray-50 dark:bg-darkmode-700 rounded-lg p-4">
                        <p className="text-sm text-gray-600 dark:text-slate-400 break-all">
                          {selectedActivity.activity.metadata.user_agent}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default ActivitiesPage; 