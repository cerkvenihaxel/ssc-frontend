import { ApiClient } from '../http/ApiClient';

export interface ObraSocial {
  healthcareProviderId: string;
  name: string;
  status: string;
  contactPhone: string | null;
  contactEmail: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface CreateObraSocialRequest {
  name: string;
  status: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  createdBy?: string;
}

export interface UpdateObraSocialRequest {
  name?: string;
  status?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  updatedBy?: string;
}

export class HttpObraSocialRepository {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getAllObrasSociales(): Promise<ObraSocial[]> {
    return this.apiClient.get<ObraSocial[]>('/v1/obras-sociales');
  }

  async getObraSocialById(id: string): Promise<ObraSocial> {
    return this.apiClient.get<ObraSocial>(`/v1/obras-sociales/${id}`);
  }

  async createObraSocial(data: CreateObraSocialRequest): Promise<ObraSocial> {
    return this.apiClient.post<ObraSocial>('/v1/obras-sociales', data);
  }

  async updateObraSocial(id: string, data: UpdateObraSocialRequest): Promise<ObraSocial> {
    return this.apiClient.put<ObraSocial>(`/v1/obras-sociales/${id}`, data);
  }

  async deleteObraSocial(id: string): Promise<void> {
    return this.apiClient.delete<void>(`/v1/obras-sociales/${id}`);
  }
} 