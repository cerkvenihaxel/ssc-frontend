import { useState, useCallback } from 'react';
import { ApiClient } from '../../infrastructure/http/ApiClient';

interface AvailableRequestsParams {
  type?: 'medical' | 'effector' | 'all';
  specialty?: string;
  priority?: string;
  page?: number;
  limit?: number;
}

interface ProviderQuotation {
  id: string;
  provider_id: string;
  request_id: string;
  request_type: 'medical' | 'effector';
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'PENDING_REVIEW';
  total_amount: number;
  delivery_days: number;
  notes?: string;
  items: QuotationItem[];
  created_at: string;
  updated_at: string;
  audit_status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PARTIAL';
  audit_notes?: string;
  audited_at?: string;
  audited_by?: string;
}

interface QuotationItem {
  id: string;
  request_item_id: string;
  item_name: string;
  requested_quantity: number;
  quoted_quantity: number;
  unit_price: number;
  total_price: number;
  availability: 'AVAILABLE' | 'PARTIAL' | 'NOT_AVAILABLE';
  notes?: string;
  audit_decision?: 'APPROVED' | 'REJECTED' | 'FLAGGED';
  audit_notes?: string;
}

interface CreateQuotationData {
  request_id: string;
  request_type: 'medical' | 'effector';
  delivery_days: number;
  notes?: string;
  items: {
    request_item_id: string;
    quoted_quantity: number;
    unit_price: number;
    availability: 'AVAILABLE' | 'PARTIAL' | 'NOT_AVAILABLE';
    notes?: string;
  }[];
}

interface UpdateQuotationData {
  delivery_days?: number;
  notes?: string;
  items?: {
    id?: string;
    request_item_id: string;
    quoted_quantity: number;
    unit_price: number;
    availability: 'AVAILABLE' | 'PARTIAL' | 'NOT_AVAILABLE';
    notes?: string;
  }[];
}

interface AuditQuotationData {
  decision: 'APPROVE' | 'REJECT' | 'PARTIAL';
  notes?: string;
  item_decisions?: {
    quotation_item_id: string;
    decision: 'APPROVED' | 'REJECTED' | 'FLAGGED';
    notes?: string;
  }[];
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

interface DashboardStats {
  total_quotations: number;
  pending_quotations: number;
  approved_quotations: number;
  rejected_quotations: number;
  total_amount: number;
  avg_response_time: number;
  success_rate: number;
  recent_activity: {
    type: 'QUOTATION_CREATED' | 'QUOTATION_APPROVED' | 'QUOTATION_REJECTED';
    description: string;
    created_at: string;
  }[];
}

export const useProviderServices = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = new ApiClient();

  // Obtener solicitudes disponibles para cotizar
  const getAvailableRequests = useCallback(async (params: AvailableRequestsParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (params.type && params.type !== 'all') queryParams.append('type', params.type);
      if (params.specialty) queryParams.append('specialty', params.specialty);
      if (params.priority) queryParams.append('priority', params.priority);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const response = await api.get<PaginatedResponse<any>>(`/provider-quotations/available-requests?${queryParams}`);
      return response;
    } catch (error: any) {
      setError(error.message || 'Error al cargar solicitudes');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nueva cotización
  const createQuotation = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/provider-quotations', data);
      return response;
    } catch (error: any) {
      setError(error.message || 'Error al crear cotización');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener mis cotizaciones
  const getMyQuotations = useCallback(async (params: any = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status) queryParams.append('status', params.status);

      const response = await api.get<PaginatedResponse<any>>(`/provider-quotations/my-quotations?${queryParams}`);
      return response;
    } catch (error: any) {
      setError(error.message || 'Error al cargar cotizaciones');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener detalle de una cotización
  const getQuotationDetails = useCallback(async (quotationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/provider-quotations/${quotationId}`);
      return response;
    } catch (error: any) {
      setError(error.message || 'Error al cargar detalle de cotización');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar cotización
  const updateQuotation = useCallback(async (quotationId: string, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/provider-quotations/${quotationId}`, data);
      return response;
    } catch (error: any) {
      setError(error.message || 'Error al actualizar cotización');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar cotización
  const deleteQuotation = useCallback(async (quotationId: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/provider-quotations/${quotationId}`);
      return true;
    } catch (error: any) {
      setError(error.message || 'Error al eliminar cotización');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener cotizaciones auditadas
  const getAuditedQuotations = useCallback(async (params: any = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.audit_result) queryParams.append('audit_result', params.audit_result);
      if (params.auditor_id) queryParams.append('auditor_id', params.auditor_id);

      const response = await api.get<PaginatedResponse<any>>(`/provider-quotations/audited-quotations?${queryParams}`);
      return response;
    } catch (error: any) {
      setError(error.message || 'Error al cargar cotizaciones auditadas');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auditar cotización manualmente
  const auditQuotation = useCallback(async (quotationId: string, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/provider-quotations/${quotationId}/audit`, data);
      return response;
    } catch (error: any) {
      setError(error.message || 'Error al auditar cotización');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auditar cotización con IA
  const auditQuotationWithAI = useCallback(async (quotationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/provider-quotations/${quotationId}/ai-audit`);
      return response;
    } catch (error: any) {
      setError(error.message || 'Error al auditar cotización con IA');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener estadísticas del dashboard
  const getDashboardStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/provider-quotations/stats/dashboard');
      return response;
    } catch (error: any) {
      setError(error.message || 'Error al cargar estadísticas');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener detalles de una solicitud para cotizar
  const getRequestDetails = useCallback(async (requestId: string, requestType: 'medical' | 'effector') => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = requestType === 'medical' 
        ? `/medical-orders/${requestId}`
        : `/effector-requests/${requestId}`;
      
      const response = await api.get(endpoint);
      return response;
    } catch (error: any) {
      setError(error.message || 'Error al cargar detalles de la solicitud');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener detalle de una solicitud específica (desde el endpoint dedicado)
  const getRequestDetail = useCallback(async (requestId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/provider-quotations/request/${requestId}`);
      return response;
    } catch (error: any) {
      setError(error.message || 'Error al cargar detalle de la solicitud');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getAvailableRequests,
    createQuotation,
    getMyQuotations,
    getQuotationDetails,
    updateQuotation,
    deleteQuotation,
    getAuditedQuotations,
    auditQuotation,
    auditQuotationWithAI,
    getDashboardStats,
    getRequestDetails,
    getRequestDetail,
  };
}; 