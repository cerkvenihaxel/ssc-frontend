import { ApiClient } from '../http/ApiClient';

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

export interface EffectorRequestState {
  state_id: string;
  state_name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface EffectorRequestItem {
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

export interface EffectorRequestAttachment {
  attachment_id: string;
  request_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size?: number;
  uploaded_by: string;
  uploaded_at: string;
}

export interface CreateEffectorRequestDto {
  effector_id?: string; // Optional for admin use
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

export interface UpdateEffectorRequestDto {
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

export interface UpdateRequestStateDto {
  state_id: string;
  notes?: string;
}

export interface ApproveEffectorRequestDto {
  decision: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';
  notes?: string;
  approved_items?: string[]; // Array of item IDs
  rejected_items?: { item_id: string; reason: string; }[];
}

export interface EffectorRequestQueryParams {
  effectorId?: string;
  state?: string;
  priority?: string;
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

export interface EffectorRequestStatistics {
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

export class EffectorRequestsService {
  private api: ApiClient;

  constructor() {
    this.api = new ApiClient();
  }

  // CRUD Operations
  async getEffectorRequests(params: EffectorRequestQueryParams = {}): Promise<PaginatedResponse<EffectorRequest>> {
    const queryParams = new URLSearchParams();
    
    if (params.effectorId) queryParams.append('effectorId', params.effectorId);
    if (params.state) queryParams.append('state', params.state);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const url = `/v1/effector-requests${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.api.get<PaginatedResponse<EffectorRequest>>(url);
  }

  async getEffectorRequestById(requestId: string): Promise<EffectorRequest> {
    return this.api.get<EffectorRequest>(`/v1/effector-requests/${requestId}`);
  }

  async createEffectorRequest(data: CreateEffectorRequestDto): Promise<EffectorRequest> {
    return this.api.post<EffectorRequest>('/v1/effector-requests', data);
  }

  async updateEffectorRequest(requestId: string, data: UpdateEffectorRequestDto): Promise<EffectorRequest> {
    return this.api.put<EffectorRequest>(`/v1/effector-requests/${requestId}`, data);
  }

  async deleteEffectorRequest(requestId: string): Promise<void> {
    return this.api.delete<void>(`/v1/effector-requests/${requestId}`);
  }

  // State Management
  async updateRequestState(requestId: string, data: UpdateRequestStateDto): Promise<EffectorRequest> {
    return this.api.patch<EffectorRequest>(`/v1/effector-requests/${requestId}/state`, data);
  }

  async approveRequest(requestId: string, data: ApproveEffectorRequestDto): Promise<EffectorRequest> {
    return this.api.post<EffectorRequest>(`/v1/effector-requests/${requestId}/approve`, data);
  }

  async rejectRequest(requestId: string, reason: string, notes?: string): Promise<EffectorRequest> {
    return this.api.post<EffectorRequest>(`/v1/effector-requests/${requestId}/reject`, {
      reason,
      notes
    });
  }

  async quickApproveRequest(requestId: string, notes?: string): Promise<EffectorRequest> {
    return this.api.post<EffectorRequest>(`/v1/effector-requests/${requestId}/quick-approve`, {
      notes: notes || 'Aprobado mediante acción rápida'
    });
  }

  async quickRejectRequest(requestId: string, reason: string): Promise<EffectorRequest> {
    return this.api.post<EffectorRequest>(`/v1/effector-requests/${requestId}/quick-reject`, {
      reason
    });
  }

  // File Upload
  async uploadAttachments(requestId: string, files: File[]): Promise<{ message: string; files: any[] }> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    // For file uploads, we'll use fetch directly to handle FormData properly
    const url = `${this.api.getBaseURL()}/v1/effector-requests/${requestId}/attachments`;
    const token = this.api.getToken();
    
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData, let browser set it with boundary

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }
      throw new Error(errorData.message || `Error ${response.status}`);
    }

    return response.json();
  }

  // AI Analysis
  async analyzeWithAI(requestId: string): Promise<any> {
    return this.api.post<any>(`/v1/effector-requests/${requestId}/ai-analyze`);
  }

  // Admin-specific endpoints
  async getRequestsRequiringReview(): Promise<EffectorRequest[]> {
    return this.api.get<EffectorRequest[]>('/v1/effector-requests/admin/pending-review');
  }

  async getRequestStatistics(): Promise<EffectorRequestStatistics> {
    return this.api.get<EffectorRequestStatistics>('/v1/effector-requests/admin/statistics');
  }

  // Filter by priority
  async getRequestsByPriority(priority: string): Promise<EffectorRequest[]> {
    return this.api.get<EffectorRequest[]>(`/v1/effector-requests/priority/${priority}`);
  }

  // Get requests by effector
  async getRequestsByEffector(effectorId: string): Promise<EffectorRequest[]> {
    return this.api.get<EffectorRequest[]>(`/v1/effector-requests?effectorId=${effectorId}`);
  }

  // Get requests by state
  async getRequestsByState(state: string): Promise<EffectorRequest[]> {
    return this.api.get<EffectorRequest[]>(`/v1/effector-requests?state=${state}`);
  }

}

export const effectorRequestsService = new EffectorRequestsService();