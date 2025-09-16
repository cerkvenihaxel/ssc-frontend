import { useState, useCallback } from 'react';
import { effectorRequestsService } from '../../infrastructure/services/effector-requests.service';

// Local type definitions to avoid import issues
export interface EffectorRequest {
  request_id: string;
  effector_id: string;
  request_number: string;
  title: string;
  description?: string;
  state_id: string;
  state: EffectorRequestState;
  priority: 'BAJA' | 'NORMAL' | 'ALTA' | 'URGENTE';
  available_for_quotation: boolean;
  specialties: string[];
  delivery_date?: string;
  delivery_address?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  total_estimated_amount?: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
  items: EffectorRequestItem[];
  attachments: EffectorRequestAttachment[];
}

interface EffectorRequestState {
  state_id: string;
  state_name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface EffectorRequestItem {
  item_id: string;
  request_id: string;
  category_id: string;
  item_name: string;
  item_description?: string;
  requested_quantity: number;
  unit_of_measure: string;
  estimated_unit_cost?: number;
  total_estimated_cost?: number;
  urgency_level: 'BAJA' | 'NORMAL' | 'ALTA' | 'URGENTE';
  technical_specifications?: string;
  brand_preference?: string;
  model_preference?: string;
  observations?: string;
  created_at: string;
  updated_at: string;
}

interface EffectorRequestAttachment {
  attachment_id: string;
  request_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size?: number;
  uploaded_by: string;
  uploaded_at: string;
}

interface CreateEffectorRequestDto {
  effector_id?: string;
  title: string;
  description?: string;
  priority: 'BAJA' | 'NORMAL' | 'ALTA' | 'URGENTE';
  specialties: string[];
  delivery_date?: string;
  delivery_address?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  items: Omit<EffectorRequestItem, 'item_id' | 'request_id' | 'created_at' | 'updated_at'>[];
}

interface UpdateEffectorRequestDto {
  title?: string;
  description?: string;
  priority?: 'BAJA' | 'NORMAL' | 'ALTA' | 'URGENTE';
  specialties?: string[];
  delivery_date?: string;
  delivery_address?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  items?: Omit<EffectorRequestItem, 'item_id' | 'request_id' | 'created_at' | 'updated_at'>[];
}

interface UpdateRequestStateDto {
  state_id: string;
  notes?: string;
}

interface ApproveEffectorRequestDto {
  decision: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';
  notes?: string;
  approved_items?: string[];
  rejected_items?: { item_id: string; reason: string; }[];
}

interface EffectorRequestQueryParams {
  effectorId?: string;
  state?: string;
  priority?: string;
  page?: number;
  limit?: number;
}

interface PaginatedResponse<T> {
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

interface EffectorRequestStatistics {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  in_review_requests: number;
  total_estimated_amount: number;
  average_processing_time: number;
  requests_by_priority: {
    BAJA: number;
    NORMAL: number;
    ALTA: number;
    URGENTE: number;
  };
  recent_activity: {
    type: string;
    description: string;
    created_at: string;
  }[];
}

export const useEffectorRequests = () => {
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

  // CRUD Operations
  const getEffectorRequests = useCallback(async (params: EffectorRequestQueryParams = {}): Promise<PaginatedResponse<EffectorRequest>> => {
    return handleRequest(() => effectorRequestsService.getEffectorRequests(params));
  }, [handleRequest]);

  const getEffectorRequestById = useCallback(async (requestId: string): Promise<EffectorRequest> => {
    return handleRequest(() => effectorRequestsService.getEffectorRequestById(requestId));
  }, [handleRequest]);

  const createEffectorRequest = useCallback(async (data: CreateEffectorRequestDto): Promise<EffectorRequest> => {
    return handleRequest(() => effectorRequestsService.createEffectorRequest(data));
  }, [handleRequest]);

  const updateEffectorRequest = useCallback(async (requestId: string, data: UpdateEffectorRequestDto): Promise<EffectorRequest> => {
    return handleRequest(() => effectorRequestsService.updateEffectorRequest(requestId, data));
  }, [handleRequest]);

  const deleteEffectorRequest = useCallback(async (requestId: string): Promise<void> => {
    return handleRequest(() => effectorRequestsService.deleteEffectorRequest(requestId));
  }, [handleRequest]);

  // State Management
  const updateRequestState = useCallback(async (requestId: string, data: UpdateRequestStateDto): Promise<EffectorRequest> => {
    return handleRequest(() => effectorRequestsService.updateRequestState(requestId, data));
  }, [handleRequest]);

  const approveRequest = useCallback(async (requestId: string, data: ApproveEffectorRequestDto): Promise<EffectorRequest> => {
    return handleRequest(() => effectorRequestsService.approveRequest(requestId, data));
  }, [handleRequest]);

  const rejectRequest = useCallback(async (requestId: string, reason: string, notes?: string): Promise<EffectorRequest> => {
    return handleRequest(() => effectorRequestsService.rejectRequest(requestId, reason, notes));
  }, [handleRequest]);

  const quickApproveRequest = useCallback(async (requestId: string, notes?: string): Promise<EffectorRequest> => {
    return handleRequest(() => effectorRequestsService.quickApproveRequest(requestId, notes));
  }, [handleRequest]);

  const quickRejectRequest = useCallback(async (requestId: string, reason: string): Promise<EffectorRequest> => {
    return handleRequest(() => effectorRequestsService.quickRejectRequest(requestId, reason));
  }, [handleRequest]);

  // File Upload
  const uploadAttachments = useCallback(async (requestId: string, files: File[]): Promise<{ message: string; files: any[] }> => {
    return handleRequest(() => effectorRequestsService.uploadAttachments(requestId, files));
  }, [handleRequest]);

  // AI Analysis
  const analyzeWithAI = useCallback(async (requestId: string): Promise<any> => {
    return handleRequest(() => effectorRequestsService.analyzeWithAI(requestId));
  }, [handleRequest]);

  // Admin-specific operations
  const getRequestsRequiringReview = useCallback(async (): Promise<EffectorRequest[]> => {
    return handleRequest(() => effectorRequestsService.getRequestsRequiringReview());
  }, [handleRequest]);

  const getRequestStatistics = useCallback(async (): Promise<EffectorRequestStatistics> => {
    return handleRequest(() => effectorRequestsService.getRequestStatistics());
  }, [handleRequest]);

  // Filter operations
  const getRequestsByPriority = useCallback(async (priority: string): Promise<EffectorRequest[]> => {
    return handleRequest(() => effectorRequestsService.getRequestsByPriority(priority));
  }, [handleRequest]);

  const getRequestsByEffector = useCallback(async (effectorId: string): Promise<EffectorRequest[]> => {
    return handleRequest(() => effectorRequestsService.getRequestsByEffector(effectorId));
  }, [handleRequest]);

  const getRequestsByState = useCallback(async (state: string): Promise<EffectorRequest[]> => {
    return handleRequest(() => effectorRequestsService.getRequestsByState(state));
  }, [handleRequest]);

  return {
    loading,
    error,
    clearError: () => setError(null),
    
    // CRUD Operations
    getEffectorRequests,
    getEffectorRequestById,
    createEffectorRequest,
    updateEffectorRequest,
    deleteEffectorRequest,
    
    // State Management
    updateRequestState,
    approveRequest,
    rejectRequest,
    quickApproveRequest,
    quickRejectRequest,
    
    // File Upload
    uploadAttachments,
    
    // AI Analysis
    analyzeWithAI,
    
    // Admin Operations
    getRequestsRequiringReview,
    getRequestStatistics,
    
    // Filter Operations
    getRequestsByPriority,
    getRequestsByEffector,
    getRequestsByState,
  };
};