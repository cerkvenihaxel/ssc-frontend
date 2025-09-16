import { ApiClient } from '../http/ApiClient';

export interface MaterialDelivery {
  delivery_id: string;
  quotation_id: string;
  provider_id: string;
  request_id: string;
  request_type: 'medical' | 'effector';
  delivery_number: string;
  status: 'PENDING' | 'PREPARING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  priority: 'BAJA' | 'NORMAL' | 'ALTA' | 'URGENTE' | 'CRÍTICA';
  scheduled_date?: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  delivery_address: string;
  contact_person: string;
  contact_phone?: string;
  contact_email?: string;
  delivery_instructions?: string;
  tracking_number?: string;
  carrier_company?: string;
  carrier_contact?: string;
  total_items: number;
  delivered_items: number;
  total_value: number;
  delivery_cost?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
  items: MaterialDeliveryItem[];
  history: MaterialDeliveryHistory[];
  attachments: MaterialDeliveryAttachment[];
  quotation_info?: {
    quotation_number: string;
    provider_name: string;
    total_amount: number;
  };
  request_info?: {
    request_number: string;
    title: string;
    patient_name?: string;
    affiliate_number?: string;
    effector_name?: string;
  };
}

export interface MaterialDeliveryItem {
  delivery_item_id: string;
  delivery_id: string;
  quotation_item_id: string;
  item_name: string;
  item_description?: string;
  ordered_quantity: number;
  delivered_quantity: number;
  pending_quantity: number;
  unit_of_measure: string;
  unit_price: number;
  total_price: number;
  item_condition: 'GOOD' | 'DAMAGED' | 'MISSING' | 'INCORRECT';
  batch_number?: string;
  serial_number?: string;
  expiry_date?: string;
  manufacture_date?: string;
  quality_notes?: string;
  received_by?: string;
  received_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MaterialDeliveryHistory {
  history_id: string;
  delivery_id: string;
  action_type: 'CREATED' | 'STATUS_CHANGED' | 'ITEM_UPDATED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  previous_status?: string;
  new_status?: string;
  description: string;
  performed_by: string;
  performed_at: string;
  location?: string;
  additional_data?: any;
}

export interface MaterialDeliveryAttachment {
  attachment_id: string;
  delivery_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size?: number;
  attachment_type: 'DELIVERY_PROOF' | 'RECEIPT' | 'PHOTOS' | 'DAMAGE_REPORT' | 'OTHER';
  description?: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface CreateMaterialDeliveryDto {
  quotation_id: string;
  scheduled_date?: string;
  delivery_address: string;
  contact_person: string;
  contact_phone?: string;
  contact_email?: string;
  delivery_instructions?: string;
  carrier_company?: string;
  carrier_contact?: string;
  notes?: string;
  items: {
    quotation_item_id: string;
    delivered_quantity: number;
    batch_number?: string;
    serial_number?: string;
    expiry_date?: string;
    manufacture_date?: string;
  }[];
}

export interface UpdateMaterialDeliveryDto {
  status?: 'PENDING' | 'PREPARING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  scheduled_date?: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  delivery_address?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  delivery_instructions?: string;
  tracking_number?: string;
  carrier_company?: string;
  carrier_contact?: string;
  delivery_cost?: number;
  notes?: string;
  items?: {
    delivery_item_id?: string;
    quotation_item_id: string;
    delivered_quantity: number;
    item_condition?: 'GOOD' | 'DAMAGED' | 'MISSING' | 'INCORRECT';
    batch_number?: string;
    serial_number?: string;
    expiry_date?: string;
    manufacture_date?: string;
    quality_notes?: string;
  }[];
}

export interface ConfirmDeliveryDto {
  actual_delivery_date: string;
  received_by: string;
  items: {
    delivery_item_id: string;
    received_quantity: number;
    item_condition: 'GOOD' | 'DAMAGED' | 'MISSING' | 'INCORRECT';
    quality_notes?: string;
  }[];
  delivery_notes?: string;
  signature_image?: string; // Base64 encoded signature
}

export interface MaterialDeliveryQueryParams {
  status?: string;
  provider_id?: string;
  request_type?: 'medical' | 'effector';
  priority?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
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

export interface DeliveryStatistics {
  total_deliveries: number;
  pending_deliveries: number;
  in_transit_deliveries: number;
  delivered_deliveries: number;
  cancelled_deliveries: number;
  returned_deliveries: number;
  total_delivery_value: number;
  average_delivery_time: number;
  on_time_delivery_rate: number;
  delivery_success_rate: number;
  cost_efficiency: number;
  provider_performance: {
    provider_id: string;
    provider_name: string;
    total_deliveries: number;
    on_time_rate: number;
    success_rate: number;
    average_delivery_time: number;
  }[];
  monthly_trends: {
    month: string;
    total_deliveries: number;
    success_rate: number;
    average_delivery_time: number;
  }[];
}

export class MaterialDeliveryService {
  private api: ApiClient;

  constructor() {
    this.api = new ApiClient();
  }

  // CRUD Operations
  async getMaterialDeliveries(params: MaterialDeliveryQueryParams = {}): Promise<PaginatedResponse<MaterialDelivery>> {
    const queryParams = new URLSearchParams();
    
    if (params.status) queryParams.append('status', params.status);
    if (params.provider_id) queryParams.append('provider_id', params.provider_id);
    if (params.request_type) queryParams.append('request_type', params.request_type);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const url = `/material-delivery${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.api.get<PaginatedResponse<MaterialDelivery>>(url);
  }

  async getMaterialDeliveryById(deliveryId: string): Promise<MaterialDelivery> {
    return this.api.get<MaterialDelivery>(`/material-delivery/${deliveryId}`);
  }

  async createMaterialDelivery(data: CreateMaterialDeliveryDto): Promise<MaterialDelivery> {
    return this.api.post<MaterialDelivery>('/material-delivery', data);
  }

  async updateMaterialDelivery(deliveryId: string, data: UpdateMaterialDeliveryDto): Promise<MaterialDelivery> {
    return this.api.put<MaterialDelivery>(`/material-delivery/${deliveryId}`, data);
  }

  async deleteMaterialDelivery(deliveryId: string): Promise<void> {
    return this.api.delete<void>(`/material-delivery/${deliveryId}`);
  }

  // Status Management
  async updateDeliveryStatus(deliveryId: string, status: MaterialDelivery['status'], notes?: string): Promise<MaterialDelivery> {
    return this.api.patch<MaterialDelivery>(`/material-delivery/${deliveryId}/status`, {
      status,
      notes
    });
  }

  async confirmDelivery(deliveryId: string, data: ConfirmDeliveryDto): Promise<MaterialDelivery> {
    return this.api.post<MaterialDelivery>(`/material-delivery/${deliveryId}/confirm`, data);
  }

  async cancelDelivery(deliveryId: string, reason: string): Promise<MaterialDelivery> {
    return this.api.post<MaterialDelivery>(`/material-delivery/${deliveryId}/cancel`, {
      reason
    });
  }

  async scheduleDelivery(deliveryId: string, scheduledDate: string, notes?: string): Promise<MaterialDelivery> {
    return this.api.post<MaterialDelivery>(`/material-delivery/${deliveryId}/schedule`, {
      scheduled_date: scheduledDate,
      notes
    });
  }

  // Tracking
  async updateTracking(deliveryId: string, trackingNumber: string, carrierCompany: string): Promise<MaterialDelivery> {
    return this.api.patch<MaterialDelivery>(`/material-delivery/${deliveryId}/tracking`, {
      tracking_number: trackingNumber,
      carrier_company: carrierCompany
    });
  }

  async getDeliveryHistory(deliveryId: string): Promise<MaterialDeliveryHistory[]> {
    return this.api.get<MaterialDeliveryHistory[]>(`/material-delivery/${deliveryId}/history`);
  }

  async addDeliveryNote(deliveryId: string, note: string, actionType: MaterialDeliveryHistory['action_type'] = 'ITEM_UPDATED'): Promise<MaterialDeliveryHistory> {
    return this.api.post<MaterialDeliveryHistory>(`/material-delivery/${deliveryId}/history`, {
      action_type: actionType,
      description: note
    });
  }

  // File Management
  async uploadAttachment(deliveryId: string, file: File, attachmentType: MaterialDeliveryAttachment['attachment_type'], description?: string): Promise<MaterialDeliveryAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('attachment_type', attachmentType);
    if (description) formData.append('description', description);

    return this.api.request(`/material-delivery/${deliveryId}/attachments`, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type, let browser set it with boundary
      }
    });
  }

  async getDeliveryAttachments(deliveryId: string): Promise<MaterialDeliveryAttachment[]> {
    return this.api.get<MaterialDeliveryAttachment[]>(`/material-delivery/${deliveryId}/attachments`);
  }

  async deleteAttachment(deliveryId: string, attachmentId: string): Promise<void> {
    return this.api.delete<void>(`/material-delivery/${deliveryId}/attachments/${attachmentId}`);
  }

  // Reports and Statistics
  async getDeliveryStatistics(dateFrom?: string, dateTo?: string): Promise<DeliveryStatistics> {
    const params = new URLSearchParams();
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);

    const url = `/material-delivery/statistics${params.toString() ? '?' + params.toString() : ''}`;
    return this.api.get<DeliveryStatistics>(url);
  }

  async getProviderDeliveryStats(providerId: string, dateFrom?: string, dateTo?: string): Promise<{
    total_deliveries: number;
    on_time_deliveries: number;
    late_deliveries: number;
    cancelled_deliveries: number;
    average_delivery_time: number;
    success_rate: number;
    recent_deliveries: MaterialDelivery[];
  }> {
    const params = new URLSearchParams();
    params.append('provider_id', providerId);
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);

    const url = `/material-delivery/provider-stats?${params.toString()}`;
    return this.api.get(url);
  }

  async generateDeliveryReport(deliveryId: string): Promise<{
    report_url: string;
    expires_at: string;
  }> {
    return this.api.post(`/material-delivery/${deliveryId}/report`);
  }

  // Search and filters
  async searchDeliveries(query: string, filters?: {
    status?: string;
    provider_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<MaterialDelivery[]> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.provider_id) params.append('provider_id', filters.provider_id);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);

    const url = `/material-delivery/search?${params.toString()}`;
    return this.api.get<MaterialDelivery[]>(url);
  }

  // Quick actions
  async markAsInTransit(deliveryId: string, trackingNumber?: string, carrierCompany?: string): Promise<MaterialDelivery> {
    const data: any = { status: 'IN_TRANSIT' };
    if (trackingNumber) data.tracking_number = trackingNumber;
    if (carrierCompany) data.carrier_company = carrierCompany;

    return this.api.patch<MaterialDelivery>(`/material-delivery/${deliveryId}/status`, data);
  }

  async markAsDelivered(deliveryId: string, receivedBy: string, notes?: string): Promise<MaterialDelivery> {
    return this.api.post<MaterialDelivery>(`/material-delivery/${deliveryId}/deliver`, {
      received_by: receivedBy,
      actual_delivery_date: new Date().toISOString(),
      notes
    });
  }

  // Helper method for file uploads that preserves the request signature
  private async request<T>(endpoint: string, options: RequestInit): Promise<T> {
    const url = `${this.api.getBaseURL()}${endpoint}`;
    const token = this.api.getToken();
    
    const headers: Record<string, string> = {
      ...options.headers as Record<string, string>,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);
    
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
}

export const materialDeliveryService = new MaterialDeliveryService();