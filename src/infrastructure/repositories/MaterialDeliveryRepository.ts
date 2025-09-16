import type { ApiClient, ApiResponse } from '../http/ApiClient';
import type { 
  MaterialDelivery, 
  DeliveryFilters, 
  DeliveryResponse, 
  DeliveryStatistics 
} from '../../domain/models';

export interface MaterialDeliveryRepository {
  getDeliveries(filters: DeliveryFilters): Promise<ApiResponse<DeliveryResponse>>;
  getDeliveryDetail(deliveryId: string): Promise<ApiResponse<MaterialDelivery>>;
  getDeliveryStatistics(): Promise<ApiResponse<DeliveryStatistics>>;
  createDelivery(deliveryData: Partial<MaterialDelivery>): Promise<ApiResponse<MaterialDelivery>>;
  updateDelivery(deliveryId: string, deliveryData: Partial<MaterialDelivery>): Promise<ApiResponse<MaterialDelivery>>;
  deleteDelivery(deliveryId: string): Promise<ApiResponse<void>>;
}

export class HttpMaterialDeliveryRepository implements MaterialDeliveryRepository {
  constructor(private apiClient: ApiClient) {}

  async getDeliveries(filters: DeliveryFilters = {}): Promise<ApiResponse<DeliveryResponse>> {
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
    
    const endpoint = `/material-delivery/deliveries${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.apiClient.get(endpoint);
  }

  async getDeliveryDetail(deliveryId: string): Promise<ApiResponse<MaterialDelivery>> {
    return this.apiClient.get(`/material-delivery/deliveries/${deliveryId}`);
  }

  async getDeliveryStatistics(): Promise<ApiResponse<DeliveryStatistics>> {
    return this.apiClient.get('/material-delivery/statistics');
  }

  async createDelivery(deliveryData: Partial<MaterialDelivery>): Promise<ApiResponse<MaterialDelivery>> {
    return this.apiClient.post('/material-delivery/deliveries', deliveryData);
  }

  async updateDelivery(deliveryId: string, deliveryData: Partial<MaterialDelivery>): Promise<ApiResponse<MaterialDelivery>> {
    return this.apiClient.put(`/material-delivery/deliveries/${deliveryId}`, deliveryData);
  }

  async deleteDelivery(deliveryId: string): Promise<ApiResponse<void>> {
    return this.apiClient.delete(`/material-delivery/deliveries/${deliveryId}`);
  }
} 