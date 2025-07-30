import { useState, useCallback } from 'react';
import type { Quotation, QuotationFilters, QuotationResponse, AuditRequest, AuditStatistics } from '../../domain/models';
import { AuditorService } from '../../application/services/AuditorService';
import { AuditorRepository } from '../../infrastructure/repositories/AuditorRepository';
import { ApiClient } from '../../infrastructure/http/ApiClient';

interface UseAuditorReturn {
  loading: boolean;
  error: string | null;
  loadPendingQuotations: (filters?: QuotationFilters) => Promise<QuotationResponse>;
  loadCompletedRequests: (filters?: QuotationFilters) => Promise<QuotationResponse>;
  getQuotationDetail: (quotationId: string) => Promise<Quotation>;
  approveQuotation: (quotationId: string, approvedCost: number, notes?: string) => Promise<AuditRequest>;
  rejectQuotation: (quotationId: string, reason: string, notes?: string) => Promise<AuditRequest>;
  getAuditStatistics: () => Promise<AuditStatistics>;
  getAuditedRequests: (filters?: Record<string, unknown>) => Promise<{ data: AuditRequest[]; total: number; page: number; limit: number; total_pages: number }>;
  getAuditRequestDetail: (auditId: string) => Promise<AuditRequest>;
  clearError: () => void;
}

export const useAuditor = (): UseAuditorReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = useCallback(async <T>(apiFunction: () => Promise<T>): Promise<T> => {
    setLoading(true);
    setError(null);
    
    try {
      return await apiFunction();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPendingQuotations = useCallback(async (filters: QuotationFilters = {}) => {
    return await apiCall(async () => {
      const apiClient = new ApiClient();
      const auditorRepository = new AuditorRepository(apiClient);
      const auditorService = new AuditorService(auditorRepository);
      return await auditorService.getPendingQuotations(filters);
    });
  }, [apiCall]);

  const loadCompletedRequests = useCallback(async (filters: QuotationFilters = {}) => {
    return await apiCall(async () => {
      const apiClient = new ApiClient();
      const auditorRepository = new AuditorRepository(apiClient);
      const auditorService = new AuditorService(auditorRepository);
      return await auditorService.getCompletedRequests(filters);
    });
  }, [apiCall]);

  const getQuotationDetail = useCallback(async (quotationId: string) => {
    return await apiCall(async () => {
      const apiClient = new ApiClient();
      const auditorRepository = new AuditorRepository(apiClient);
      const auditorService = new AuditorService(auditorRepository);
      return await auditorService.getQuotationDetail(quotationId);
    });
  }, [apiCall]);

  const approveQuotation = useCallback(async (quotationId: string, approvedCost: number, notes: string = '') => {
    return await apiCall(async () => {
      const apiClient = new ApiClient();
      const auditorRepository = new AuditorRepository(apiClient);
      const auditorService = new AuditorService(auditorRepository);
      
      return await auditorService.approveAuditRequest(quotationId, approvedCost, notes);
    });
  }, [apiCall]);

  const rejectQuotation = useCallback(async (quotationId: string, reason: string, notes: string = '') => {
    return await apiCall(async () => {
      const apiClient = new ApiClient();
      const auditorRepository = new AuditorRepository(apiClient);
      const auditorService = new AuditorService(auditorRepository);
      
      return await auditorService.rejectAuditRequest(quotationId, reason, notes);
    });
  }, [apiCall]);

  const getAuditStatistics = useCallback(async () => {
    return await apiCall(async () => {
      const apiClient = new ApiClient();
      const auditorRepository = new AuditorRepository(apiClient);
      const auditorService = new AuditorService(auditorRepository);
      return await auditorService.getAuditStatistics();
    });
  }, [apiCall]);

  const getAuditedRequests = useCallback(async (filters: Record<string, unknown> = {}) => {
    return await apiCall(async () => {
      const apiClient = new ApiClient();
      const auditorRepository = new AuditorRepository(apiClient);
      const auditorService = new AuditorService(auditorRepository);
      const result = await auditorService.getAuditedRequests(filters);
      
      // Asegurar que el resultado tenga la estructura de paginación
      const page = (filters.page as number) || 1;
      const limit = (filters.limit as number) || 10;
      const total = result.total || result.data.length;
      const total_pages = Math.ceil(total / limit);
      
      return {
        data: result.data || [],
        total: total,
        page: page,
        limit: limit,
        total_pages: total_pages
      };
    });
  }, [apiCall]);

  const getAuditRequestDetail = useCallback(async (auditId: string) => {
    return await apiCall(async () => {
      const apiClient = new ApiClient();
      const auditorRepository = new AuditorRepository(apiClient);
      const auditorService = new AuditorService(auditorRepository);
      return await auditorService.getAuditRequestDetail(auditId);
    });
  }, [apiCall]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    loadPendingQuotations,
    loadCompletedRequests,
    getQuotationDetail,
    approveQuotation,
    rejectQuotation,
    getAuditStatistics,
    getAuditedRequests,
    getAuditRequestDetail,
    clearError
  };
}; 