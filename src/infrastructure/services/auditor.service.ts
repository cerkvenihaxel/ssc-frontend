import { ApiClient } from '../http/ApiClient';

export interface QuotationForAudit {
  quotation_id: string;
  request_id: string;
  request_type: 'medical' | 'effector';
  request_number: string;
  request_title: string;
  provider_id: string;
  provider_name: string;
  quotation_number: string;
  status: 'pending' | 'sent' | 'approved' | 'rejected' | 'completed';
  total_amount: number;
  delivery_time_days?: number;
  delivery_terms?: string;
  payment_terms?: string;
  warranty_terms?: string;
  observations?: string;
  valid_until?: string;
  available_for_audit: boolean;
  created_at: string;
  updated_at: string;
  items: QuotationItemForAudit[];
  attachments: QuotationAttachment[];
  patient_info?: {
    affiliate_name: string;
    affiliate_number: string;
    healthcare_provider: string;
  };
  medical_order_info?: {
    urgency_level: string;
    medical_justification: string;
    diagnosis?: string;
  };
}

export interface QuotationItemForAudit {
  quotation_item_id: string;
  request_item_id: string;
  item_name: string;
  item_description?: string;
  requested_quantity: number;
  quoted_quantity: number;
  unit_price: number;
  total_price: number;
  delivery_time_days?: number;
  observations?: string;
  created_at: string;
}

export interface QuotationAttachment {
  attachment_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size?: number;
  uploaded_by: string;
  uploaded_at: string;
}

export interface AuditRequest {
  audit_request_id: string;
  quotation_id: string;
  medical_order_id?: string;
  provider_id: string;
  audit_status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'completed';
  auditor_notes?: string;
  rejection_reason?: string;
  original_order_cost?: number;
  quoted_cost?: number;
  approved_cost?: number;
  item_comparison?: any;
  audit_criteria?: any;
  audit_type: 'manual' | 'ai' | 'hybrid';
  auditor_id?: string;
  audited_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export interface CreateAuditRequestDto {
  quotation_id: string;
  medical_order_id?: string;
  provider_id: string;
  audit_type: 'manual' | 'ai' | 'hybrid';
  initial_notes?: string;
}

export interface UpdateAuditRequestDto {
  audit_status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'completed';
  auditor_notes?: string;
  rejection_reason?: string;
  approved_cost?: number;
  item_comparison?: any;
  audit_criteria?: any;
}

export interface AuditQuotationDto {
  decision: 'APPROVE' | 'REJECT' | 'PARTIAL';
  notes?: string;
  approved_cost?: number;
  item_decisions?: {
    quotation_item_id: string;
    decision: 'APPROVED' | 'REJECTED' | 'FLAGGED';
    approved_quantity?: number;
    approved_unit_price?: number;
    notes?: string;
  }[];
}

export interface AuditQueryParams {
  status?: string;
  provider_id?: string;
  date_from?: string;
  date_to?: string;
  patient_name?: string;
  medical_order_id?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AuditStatistics {
  total_quotations_audited: number;
  pending_quotations: number;
  approved_quotations: number;
  rejected_quotations: number;
  partial_quotations: number;
  average_audit_time: number;
  approval_rate: number;
  total_audited_amount: number;
  total_approved_amount: number;
  cost_savings: number;
  auditor_performance: {
    auditor_id: string;
    auditor_name: string;
    quotations_audited: number;
    approval_rate: number;
    average_time: number;
  }[];
  monthly_trends: {
    month: string;
    quotations_audited: number;
    approval_rate: number;
    cost_savings: number;
  }[];
}

export class AuditorService {
  private api: ApiClient;

  constructor() {
    this.api = new ApiClient();
  }

  // Quotations for Audit
  async getPendingQuotations(params: AuditQueryParams = {}): Promise<PaginatedResponse<QuotationForAudit>> {
    const queryParams = new URLSearchParams();
    
    if (params.status) queryParams.append('status', params.status);
    if (params.provider_id) queryParams.append('provider_id', params.provider_id);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.patient_name) queryParams.append('patient_name', params.patient_name);
    if (params.medical_order_id) queryParams.append('medical_order_id', params.medical_order_id);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const url = `/auditor/pending-quotations${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.api.get<PaginatedResponse<QuotationForAudit>>(url);
  }

  async getQuotationDetail(quotationId: string): Promise<QuotationForAudit> {
    return this.api.get<QuotationForAudit>(`/auditor/quotations/${quotationId}`);
  }

  async getCompletedRequests(params: AuditQueryParams = {}): Promise<PaginatedResponse<QuotationForAudit>> {
    const queryParams = new URLSearchParams();
    
    if (params.status) queryParams.append('status', params.status);
    if (params.provider_id) queryParams.append('provider_id', params.provider_id);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.patient_name) queryParams.append('patient_name', params.patient_name);
    if (params.medical_order_id) queryParams.append('medical_order_id', params.medical_order_id);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const url = `/auditor/completed-requests${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.api.get<PaginatedResponse<QuotationForAudit>>(url);
  }

  // Deprecated endpoints (for backward compatibility)
  async getPendingAuditRequests(params: { providerId?: string; page?: number; limit?: number }): Promise<PaginatedResponse<AuditRequest>> {
    const queryParams = new URLSearchParams();
    
    if (params.providerId) queryParams.append('providerId', params.providerId);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const url = `/auditor/pending-requests${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.api.get<PaginatedResponse<AuditRequest>>(url);
  }

  async getAuditedRequests(params: { status?: string; auditorId?: string; page?: number; limit?: number }): Promise<PaginatedResponse<AuditRequest>> {
    const queryParams = new URLSearchParams();
    
    if (params.status) queryParams.append('status', params.status);
    if (params.auditorId) queryParams.append('auditorId', params.auditorId);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const url = `/auditor/audited-requests${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.api.get<PaginatedResponse<AuditRequest>>(url);
  }

  // Audit Request Management
  async createAuditRequest(data: CreateAuditRequestDto): Promise<AuditRequest> {
    return this.api.post<AuditRequest>('/auditor/audit-requests', data);
  }

  async updateAuditRequest(auditRequestId: string, data: UpdateAuditRequestDto): Promise<AuditRequest> {
    return this.api.put<AuditRequest>(`/auditor/audit-requests/${auditRequestId}`, data);
  }

  async getAuditRequestDetail(auditRequestId: string): Promise<AuditRequest> {
    return this.api.get<AuditRequest>(`/auditor/audit-requests/${auditRequestId}`);
  }

  // Direct Quotation Auditing
  async auditQuotation(quotationId: string, data: AuditQuotationDto): Promise<QuotationForAudit> {
    return this.api.put<QuotationForAudit>(`/auditor/quotations/${quotationId}/audit`, data);
  }

  // Statistics
  async getAuditStatistics(): Promise<AuditStatistics> {
    return this.api.get<AuditStatistics>('/auditor/statistics');
  }

  // Specialized queries for dashboard
  async getMyAuditStatistics(auditorId: string): Promise<{
    total_audited: number;
    pending_audits: number;
    approval_rate: number;
    average_audit_time: number;
    recent_activity: {
      quotation_id: string;
      action: string;
      date: string;
      patient_name?: string;
    }[];
  }> {
    return this.api.get(`/auditor/statistics?auditorId=${auditorId}`);
  }

  // Quick actions
  async quickApprove(quotationId: string, notes?: string): Promise<QuotationForAudit> {
    return this.auditQuotation(quotationId, {
      decision: 'APPROVE',
      notes: notes || 'Aprobado mediante acción rápida'
    });
  }

  async quickReject(quotationId: string, reason: string): Promise<QuotationForAudit> {
    return this.auditQuotation(quotationId, {
      decision: 'REJECT',
      notes: reason
    });
  }

  // Bulk operations
  async bulkAuditQuotations(quotationIds: string[], decision: 'APPROVE' | 'REJECT', notes?: string): Promise<{
    successful: string[];
    failed: { quotationId: string; error: string }[];
  }> {
    const results = await Promise.allSettled(
      quotationIds.map(id => this.auditQuotation(id, { decision, notes }))
    );

    const successful: string[] = [];
    const failed: { quotationId: string; error: string }[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successful.push(quotationIds[index]);
      } else {
        failed.push({
          quotationId: quotationIds[index],
          error: result.reason.message || 'Error desconocido'
        });
      }
    });

    return { successful, failed };
  }

  // AI-assisted auditing
  async getAISuggestions(quotationId: string): Promise<{
    suggested_decision: 'APPROVE' | 'REJECT' | 'PARTIAL';
    confidence_score: number;
    reasoning: string;
    risk_factors: string[];
    cost_analysis: {
      market_comparison: number;
      cost_efficiency: number;
      recommendations: string[];
    };
    item_suggestions: {
      quotation_item_id: string;
      suggested_decision: 'APPROVED' | 'REJECTED' | 'FLAGGED';
      reasoning: string;
    }[];
  }> {
    return this.api.get(`/auditor/quotations/${quotationId}/ai-suggestions`);
  }
}

export const auditorService = new AuditorService();