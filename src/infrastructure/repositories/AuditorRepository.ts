import type { ApiClient, ApiResponse } from '../http/ApiClient';
import type { AuditRequest, AuditStatistics, QuotationFilters, QuotationResponse, Quotation } from '../../domain/models';

export interface AuditFilters {
  status?: string;
  provider_id?: string;
  date_from?: Date;
  date_to?: Date;
  audit_type?: string;
}

export interface CreateAuditRequestData {
  quotation_id: string;
  medical_order_id: string;
  provider_id: string;
  audit_type: 'manual' | 'ai' | 'hybrid';
  auditor_notes?: string;
}

export interface UpdateAuditRequestData {
  audit_status?: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'completed';
  auditor_notes?: string;
  rejection_reason?: string;
  approved_cost?: number;
  audit_criteria?: {
    price_reasonable: boolean;
    quality_adequate: boolean;
    delivery_time_acceptable: boolean;
    provider_reliable: boolean;
    documentation_complete: boolean;
  };
}

export class AuditorRepository {
  private apiClient: ApiClient;
  
  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }
  
  async getPendingAuditRequests(filters: AuditFilters = {}): Promise<ApiResponse<{ data: AuditRequest[]; total: number }>> {
    // Construir query parameters manualmente
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.provider_id) queryParams.append('provider_id', filters.provider_id);
    if (filters.date_from) queryParams.append('date_from', filters.date_from.toISOString());
    if (filters.date_to) queryParams.append('date_to', filters.date_to.toISOString());
    if (filters.audit_type) queryParams.append('audit_type', filters.audit_type);
    
    const endpoint = `/auditor/pending-requests${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.apiClient.get(endpoint);
  }
  
  async getAuditedRequests(filters: AuditFilters = {}): Promise<ApiResponse<{ data: AuditRequest[]; total: number }>> {
    // Construir query parameters manualmente
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.provider_id) queryParams.append('provider_id', filters.provider_id);
    if (filters.date_from) queryParams.append('date_from', filters.date_from.toISOString());
    if (filters.date_to) queryParams.append('date_to', filters.date_to.toISOString());
    if (filters.audit_type) queryParams.append('audit_type', filters.audit_type);
    
    const endpoint = `/auditor/audited-requests${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.apiClient.get(endpoint);
  }
  
  async createAuditRequest(data: CreateAuditRequestData): Promise<ApiResponse<AuditRequest>> {
    return this.apiClient.post('/auditor/audit-requests', data);
  }
  
  async updateAuditRequest(id: string, data: UpdateAuditRequestData): Promise<ApiResponse<AuditRequest>> {
    console.log('🔍 AuditorRepository - updateAuditRequest');
    console.log('🔍 ID:', id);
    console.log('🔍 Data:', JSON.stringify(data, null, 2));
    
    // Usar directamente el endpoint de quotations con el quotation_id
    console.log('🔍 Usando endpoint: /auditor/quotations/${id}/audit');
    return await this.apiClient.put(`/auditor/quotations/${id}/audit`, data);
  }
  
  async getAuditRequestDetail(id: string): Promise<ApiResponse<AuditRequest>> {
    console.log('🔍 AuditorRepository - getAuditRequestDetail called with id:', id);
    console.log('🔍 AuditorRepository - Making API call to:', `/auditor/audit-requests/${id}`);
    
    try {
      const response = await this.apiClient.get(`/auditor/audit-requests/${id}`);
      console.log('🔍 AuditorRepository - API call successful, response received');
      console.log('🔍 AuditorRepository - Response type:', typeof response);
      return response as ApiResponse<AuditRequest>;
    } catch (error) {
      console.error('🔍 AuditorRepository - API call failed:', error);
      throw error;
    }
  }
  
  async getAuditStatistics(): Promise<ApiResponse<AuditStatistics>> {
    return this.apiClient.get('/auditor/statistics');
  }

  async getPendingQuotations(filters: QuotationFilters = {}): Promise<ApiResponse<QuotationResponse>> {
    // Construir query parameters manualmente
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.provider_id) queryParams.append('provider_id', filters.provider_id);
    if (filters.date_from) queryParams.append('date_from', filters.date_from);
    if (filters.date_to) queryParams.append('date_to', filters.date_to);
    if (filters.patient_name) queryParams.append('patient_name', filters.patient_name);
    if (filters.medical_order_id) queryParams.append('medical_order_id', filters.medical_order_id);
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    
    const endpoint = `/auditor/pending-quotations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.apiClient.get(endpoint);
  }

  async getCompletedRequests(filters: QuotationFilters = {}): Promise<ApiResponse<QuotationResponse>> {
    // Construir query parameters manualmente
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.provider_id) queryParams.append('provider_id', filters.provider_id);
    if (filters.date_from) queryParams.append('date_from', filters.date_from);
    if (filters.date_to) queryParams.append('date_to', filters.date_to);
    if (filters.patient_name) queryParams.append('patient_name', filters.patient_name);
    if (filters.medical_order_id) queryParams.append('medical_order_id', filters.medical_order_id);
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    
    const endpoint = `/auditor/completed-requests${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.apiClient.get(endpoint);
  }

  async getQuotationDetail(quotationId: string): Promise<ApiResponse<Quotation>> {
    return this.apiClient.get(`/auditor/quotations/${quotationId}`);
  }
} 