import { useState, useCallback } from 'react';
import { 
  auditorService,
  QuotationForAudit,
  AuditRequest,
  CreateAuditRequestDto,
  UpdateAuditRequestDto,
  AuditQuotationDto,
  AuditQueryParams,
  PaginatedResponse,
  AuditStatistics
} from '../../infrastructure/services/auditor.service';

export const useAuditor = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = useCallback(async <T>(
    request: () => Promise<T>
  ): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      const result = await request();
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Error en la operación';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Quotations for Audit
  const getPendingQuotations = useCallback(async (params: AuditQueryParams = {}): Promise<PaginatedResponse<QuotationForAudit>> => {
    return handleRequest(() => auditorService.getPendingQuotations(params));
  }, [handleRequest]);

  const getQuotationDetail = useCallback(async (quotationId: string): Promise<QuotationForAudit> => {
    return handleRequest(() => auditorService.getQuotationDetail(quotationId));
  }, [handleRequest]);

  const getCompletedRequests = useCallback(async (params: AuditQueryParams = {}): Promise<PaginatedResponse<QuotationForAudit>> => {
    return handleRequest(() => auditorService.getCompletedRequests(params));
  }, [handleRequest]);

  // Deprecated endpoints (for backward compatibility)
  const getPendingAuditRequests = useCallback(async (params: { providerId?: string; page?: number; limit?: number }): Promise<PaginatedResponse<AuditRequest>> => {
    return handleRequest(() => auditorService.getPendingAuditRequests(params));
  }, [handleRequest]);

  const getAuditedRequests = useCallback(async (params: { status?: string; auditorId?: string; page?: number; limit?: number }): Promise<PaginatedResponse<AuditRequest>> => {
    return handleRequest(() => auditorService.getAuditedRequests(params));
  }, [handleRequest]);

  // Audit Request Management
  const createAuditRequest = useCallback(async (data: CreateAuditRequestDto): Promise<AuditRequest> => {
    return handleRequest(() => auditorService.createAuditRequest(data));
  }, [handleRequest]);

  const updateAuditRequest = useCallback(async (auditRequestId: string, data: UpdateAuditRequestDto): Promise<AuditRequest> => {
    return handleRequest(() => auditorService.updateAuditRequest(auditRequestId, data));
  }, [handleRequest]);

  const getAuditRequestDetail = useCallback(async (auditRequestId: string): Promise<AuditRequest> => {
    return handleRequest(() => auditorService.getAuditRequestDetail(auditRequestId));
  }, [handleRequest]);

  // Direct Quotation Auditing
  const auditQuotation = useCallback(async (quotationId: string, data: AuditQuotationDto): Promise<QuotationForAudit> => {
    return handleRequest(() => auditorService.auditQuotation(quotationId, data));
  }, [handleRequest]);

  // Statistics
  const getAuditStatistics = useCallback(async (): Promise<AuditStatistics> => {
    return handleRequest(() => auditorService.getAuditStatistics());
  }, [handleRequest]);

  const getMyAuditStatistics = useCallback(async (auditorId: string): Promise<{
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
  }> => {
    return handleRequest(() => auditorService.getMyAuditStatistics(auditorId));
  }, [handleRequest]);

  // Quick actions
  const quickApprove = useCallback(async (quotationId: string, notes?: string): Promise<QuotationForAudit> => {
    return handleRequest(() => auditorService.quickApprove(quotationId, notes));
  }, [handleRequest]);

  const quickReject = useCallback(async (quotationId: string, reason: string): Promise<QuotationForAudit> => {
    return handleRequest(() => auditorService.quickReject(quotationId, reason));
  }, [handleRequest]);

  // Bulk operations
  const bulkAuditQuotations = useCallback(async (quotationIds: string[], decision: 'APPROVE' | 'REJECT', notes?: string): Promise<{
    successful: string[];
    failed: { quotationId: string; error: string }[];
  }> => {
    return handleRequest(() => auditorService.bulkAuditQuotations(quotationIds, decision, notes));
  }, [handleRequest]);

  // AI-assisted auditing
  const getAISuggestions = useCallback(async (quotationId: string): Promise<{
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
  }> => {
    return handleRequest(() => auditorService.getAISuggestions(quotationId));
  }, [handleRequest]);

  return {
    loading,
    error,
    clearError: () => setError(null),
    
    // Quotations for Audit
    getPendingQuotations,
    getQuotationDetail,
    getCompletedRequests,
    
    // Deprecated endpoints
    getPendingAuditRequests,
    getAuditedRequests,
    
    // Audit Request Management
    createAuditRequest,
    updateAuditRequest,
    getAuditRequestDetail,
    
    // Direct Quotation Auditing
    auditQuotation,
    
    // Statistics
    getAuditStatistics,
    getMyAuditStatistics,
    
    // Quick Actions
    quickApprove,
    quickReject,
    
    // Bulk Operations
    bulkAuditQuotations,
    
    // AI-assisted Auditing
    getAISuggestions,
  };
};