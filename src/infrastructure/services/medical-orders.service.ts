import { ApiClient } from '../http/ApiClient';

export interface MedicalOrder {
  orderId: string;
  orderNumber: string;
  requesterId: string;
  requesterType: 'admin' | 'doctor' | 'auditor';
  requesterName: string;
  affiliateId: string;
  affiliateName: string;
  affiliateNumber: string;
  healthcareProviderId?: string;
  healthcareProviderName?: string;
  stateId: number;
  urgencyId: number;
  urgency: {
    id: number;
    name: string;
    colorCode: string;
  };
  title: string;
  description?: string;
  medicalJustification: string;
  diagnosis?: string;
  treatmentPlan?: string;
  estimatedDurationDays?: number;
  items: MedicalOrderItem[];
  hasAttachments: boolean;
  estimatedCost?: number;
  approvedCost?: number;
  rejectionReason?: string;
  authorizationType?: 'manual' | 'automatic' | 'hybrid';
  authorizationStatus: 'pending' | 'approved' | 'rejected' | 'partial';
  authorizedBy?: string;
  authorizedAt?: string;
  authorizationNotes?: string;
  aiAnalysisResult?: any;
  aiConfidenceScore?: number;
  aiAnalyzedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
  totalItems: number;
  approvedItems: number;
}

export interface MedicalOrderItem {
  itemId: string;
  categoryId: string;
  itemType: 'medication' | 'equipment' | 'supply';
  itemName: string;
  itemCode?: string;
  itemDescription?: string;
  requestedQuantity: number;
  approvedQuantity?: number;
  unitOfMeasure: string;
  brand?: string;
  presentation?: string;
  concentration?: string;
  administrationRoute?: string;
  medicalJustification?: string;
  estimatedUnitCost?: number;
  itemStatus: 'pending' | 'approved' | 'rejected' | 'partial';
  rejectionReason?: string;
}

export interface CreateMedicalOrderDto {
  affiliateId: string;
  healthcareProviderId?: string;
  urgencyId: number;
  title: string;
  description?: string;
  medicalJustification: string;
  diagnosis?: string;
  treatmentPlan?: string;
  estimatedDurationDays?: number;
  items: Omit<MedicalOrderItem, 'itemId' | 'itemStatus'>[];
  hasAttachments?: boolean;
  estimatedCost?: number;
}

export interface UpdateMedicalOrderDto {
  title?: string;
  description?: string;
  medicalJustification?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  estimatedDurationDays?: number;
  items?: Omit<MedicalOrderItem, 'itemId'>[];
  estimatedCost?: number;
}

export interface AuthorizeMedicalOrderDto {
  decision: 'approve' | 'reject' | 'partial';
  notes?: string;
  itemApprovals?: {
    itemId: string;
    approved: boolean;
    approvedQuantity?: number;
    rejectionReason?: string;
  }[];
}

export interface CorrectMedicalOrderDto {
  title?: string;
  description?: string;
  medicalJustification?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  items?: Omit<MedicalOrderItem, 'itemId'>[];
  correctionNotes: string;
}

export interface MedicalOrderQueryDto {
  page?: number;
  limit?: number;
  authorizationStatus?: string;
  requesterType?: string;
  urgencyId?: number;
  affiliateId?: string;
  requesterId?: string;
  search?: string;
}

export interface MedicalOrderListResponse {
  data: MedicalOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface MedicalOrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  rejectedOrders: number;
  partialOrders: number;
  totalEstimatedCost: number;
  totalApprovedCost: number;
  averageProcessingTime: number;
  aiAutomaticApprovalRate: number;
}

export interface Affiliate {
  affiliateId: string;
  firstName: string;
  lastName: string;
  affiliateNumber: string;
  cuil: string;
  email?: string;
  healthcareProviders: {
    healthcareProviderId: string;
    name: string;
  }[];
}

export interface UrgencyType {
  id: number;
  name: string;
  colorCode: string;
  description?: string;
}

export interface MedicalCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
}

export class MedicalOrdersService {
  private api: ApiClient;

  constructor() {
    this.api = new ApiClient();
  }

  // CRUD Operations
  async getMedicalOrders(query: MedicalOrderQueryDto = {}): Promise<MedicalOrderListResponse> {
    const queryParams = new URLSearchParams();
    
    if (query.page) queryParams.append('page', query.page.toString());
    if (query.limit) queryParams.append('limit', query.limit.toString());
    if (query.authorizationStatus) queryParams.append('authorizationStatus', query.authorizationStatus);
    if (query.requesterType) queryParams.append('requesterType', query.requesterType);
    if (query.urgencyId) queryParams.append('urgencyId', query.urgencyId.toString());
    if (query.affiliateId) queryParams.append('affiliateId', query.affiliateId);
    if (query.requesterId) queryParams.append('requesterId', query.requesterId);
    if (query.search) queryParams.append('search', query.search);

    const url = `/medical-orders${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.api.get<MedicalOrderListResponse>(url);
  }

  async getMedicalOrderById(orderId: string): Promise<MedicalOrder> {
    return this.api.get<MedicalOrder>(`/medical-orders/${orderId}`);
  }

  async createMedicalOrder(data: CreateMedicalOrderDto): Promise<MedicalOrder> {
    return this.api.post<MedicalOrder>('/medical-orders', data);
  }

  async updateMedicalOrder(orderId: string, data: UpdateMedicalOrderDto): Promise<MedicalOrder> {
    return this.api.put<MedicalOrder>(`/medical-orders/${orderId}`, data);
  }

  async deleteMedicalOrder(orderId: string): Promise<void> {
    return this.api.delete<void>(`/medical-orders/${orderId}`);
  }

  // Authorization Operations
  async authorizeMedicalOrder(orderId: string, data: AuthorizeMedicalOrderDto): Promise<MedicalOrder> {
    return this.api.post<MedicalOrder>(`/medical-orders/${orderId}/authorize`, data);
  }

  async aiAuthorizeMedicalOrder(orderId: string): Promise<MedicalOrder> {
    return this.api.post<MedicalOrder>(`/medical-orders/${orderId}/ai-authorize`);
  }

  async correctMedicalOrder(orderId: string, data: CorrectMedicalOrderDto): Promise<MedicalOrder> {
    return this.api.post<MedicalOrder>(`/medical-orders/${orderId}/correct`, data);
  }

  // History and Analysis
  async getAuthorizationHistory(orderId: string): Promise<any[]> {
    return this.api.get<any[]>(`/medical-orders/${orderId}/authorization-history`);
  }

  async getAIAnalysis(orderId: string): Promise<any> {
    return this.api.get<any>(`/medical-orders/${orderId}/ai-analysis`);
  }

  async getAIAnalysisHistory(orderId: string): Promise<any[]> {
    return this.api.get<any[]>(`/medical-orders/${orderId}/ai-analysis/history`);
  }

  async getItemAIAnalysis(orderId: string, itemId: string): Promise<any> {
    return this.api.get<any>(`/medical-orders/${orderId}/items/${itemId}/ai-analysis`);
  }

  async refreshAIAnalysis(orderId: string): Promise<MedicalOrder> {
    return this.api.post<MedicalOrder>(`/medical-orders/${orderId}/refresh-ai-analysis`);
  }

  // Reference Data
  async getMedicalCategories(): Promise<MedicalCategory[]> {
    return this.api.get<MedicalCategory[]>('/medical-orders/categories/medical');
  }

  async getUrgencyTypes(): Promise<UrgencyType[]> {
    return this.api.get<UrgencyType[]>('/medical-orders/urgency-types/all');
  }

  async searchAffiliates(query: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Affiliate[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (query.search) queryParams.append('search', query.search);
    if (query.page) queryParams.append('page', query.page.toString());
    if (query.limit) queryParams.append('limit', query.limit.toString());

    const url = `/medical-orders/affiliates/search${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.api.get(url);
  }

  // Statistics
  async getDashboardStats(): Promise<MedicalOrderStatistics> {
    return this.api.get<MedicalOrderStatistics>('/medical-orders/stats/dashboard');
  }
}

export const medicalOrdersService = new MedicalOrdersService();