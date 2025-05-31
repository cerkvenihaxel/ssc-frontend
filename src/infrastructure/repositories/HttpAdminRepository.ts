import { ApiClient } from '../http/ApiClient';
import type { ObraSocial } from './HttpObraSocialRepository';

export interface AdminUser {
  user_id: string;
  email: string;
  nombre: string;
  role: {
    role_id: number;
    role_name: string;
  };
  status?: 'active' | 'inactive';
  created_at: string;
}

export interface AdminUserStats {
  total: number;
  by_role: Record<string, number>;
  message?: string;
}

export interface AdminProvider {
  providerId: string;
  providerName: string;
  providerType: string;
  cuit: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  status: string;
  creationDate: string;
  lastUpdate: string;
}

export interface CreateProviderRequest {
  email: string;
  nombre: string;
  role: string;
  provider_name: string;
  provider_type: string;
  cuit: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  status: string;
  specialties?: string[];
  healthcare_providers?: string[];
}

export interface CreateEffectorRequest {
  email: string;
  nombre: string;
  role: string;
  effector_name: string;
  effector_type: string;
  cuit: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  status: string;
  healthcare_providers?: string[];
  address?: {
    calle: string;
    numero: string;
    ciudad: string;
    provincia: string;
    codigo_postal: string;
  };
}

export interface CreateAuditorRequest {
  email: string;
  nombre: string;
  role: string;
  first_name: string;
  last_name: string;
  phone: string;
  department?: string;
  employee_id?: string;
  permissions?: string[];
  healthcare_providers?: string[];
}

export interface AdminAuditor {
  user_id: string;
  email: string;
  nombre: string;
  role: {
    role_id: number;
    role_name: string;
  };
  status: string;
  created_at: string;
  updated_at?: string;
  last_login?: string;
  email_verified?: boolean;
  auditor_info?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    department?: string;
    employee_id?: string;
    permissions?: string[];
    healthcare_providers?: string[];
  };
  healthcareProviders?: ObraSocial[];
}

export interface AuditorsResponse {
  auditors: AdminAuditor[];
  total: number;
}

export interface AdminEffector {
  user_id: string;
  email: string;
  nombre: string;
  role: {
    role_id: number;
    role_name: string;
  };
  status: string;
  created_at: string;
  updated_at?: string;
  last_login?: string;
  email_verified?: boolean;
  effector_info?: {
    effector_name?: string;
    effector_type?: string;
    cuit?: string;
    contact_name?: string;
    contact_phone?: string;
    contact_email?: string;
    healthcare_providers?: string[];
    address?: {
      calle: string;
      numero: string;
      ciudad: string;
      provincia: string;
      codigo_postal: string;
    };
  };
  healthcareProviders?: ObraSocial[];
}

export interface EffectorsResponse {
  effectors: AdminEffector[];
  total: number;
}

export interface UpdateUserRequest {
  email?: string;
  nombre?: string;
  password?: string;
  status?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  department?: string;
  employee_id?: string;
  permissions?: string[];
  healthcare_providers?: string[];
  provider_name?: string;
  provider_type?: string;
  cuit?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  specialties?: string[];
  effector_name?: string;
  effector_type?: string;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  message?: string;
}

export interface ProvidersResponse {
  providers: AdminProvider[];
  total: number;
}

export interface Especialidad {
  especialidadId: string;
  nombre: string;
  codigo?: string;
  descripcion?: string;
  activa: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEspecialidadRequest {
  nombre: string;
  descripcion: string;
}

export interface UpdateEspecialidadRequest {
  nombre?: string;
  descripcion?: string;
}

export class HttpAdminRepository {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  // Gestión de usuarios
  async getAllUsers(page: number = 1, limit: number = 10, role?: string): Promise<AdminUsersResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (role) {
      params.append('role', role);
    }

    return this.apiClient.get<AdminUsersResponse>(`/v1/admin/users?${params.toString()}`);
  }

  async getUserStats(): Promise<AdminUserStats> {
    return this.apiClient.get<AdminUserStats>('/v1/admin/users/stats');
  }

  async getUserById(id: string): Promise<AdminUser> {
    return this.apiClient.get<AdminUser>(`/v1/admin/users/${id}`);
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<AdminUser> {
    return this.apiClient.put<AdminUser>(`/v1/admin/users/${id}`, data);
  }

  async updateUserPermissions(id: string, permissions: string[]): Promise<AdminUser> {
    return this.apiClient.patch<AdminUser>(`/v1/admin/users/${id}/permissions`, { permissions });
  }

  async bulkUpdateUsers(userIds: string[], updates: Partial<UpdateUserRequest>): Promise<{ success: boolean; message: string }> {
    return this.apiClient.patch<{ success: boolean; message: string }>('/v1/admin/users/bulk-update', {
      userIds,
      updates
    });
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    return this.apiClient.delete<{ message: string }>(`/v1/admin/users/${id}`);
  }

  // Gestión de proveedores
  async getAllProviders(): Promise<ProvidersResponse> {
    return this.apiClient.get<ProvidersResponse>('/v1/admin/users/providers');
  }

  async getProviderById(id: string): Promise<AdminUser> {
    return this.apiClient.get<AdminUser>(`/v1/admin/users/providers/${id}`);
  }

  // Método para obtener información completa del proveedor incluyendo especialidades
  async getProviderDetailsById(id: string): Promise<any> {
    return this.apiClient.get<any>(`/v1/proveedores/${id}`);
  }

  async updateProvider(id: string, data: UpdateUserRequest): Promise<AdminUser> {
    return this.apiClient.put<AdminUser>(`/v1/admin/users/providers/${id}`, data);
  }

  async deleteProvider(id: string): Promise<{ message: string }> {
    return this.apiClient.delete<{ message: string }>(`/v1/admin/users/providers/${id}`);
  }

  async createProvider(data: CreateProviderRequest): Promise<AdminProvider> {
    return this.apiClient.post<AdminProvider>('/v1/admin/users/providers', data);
  }

  // Gestión de efectores
  async getAllEffectors(page: number = 1, limit: number = 10): Promise<EffectorsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    return this.apiClient.get<EffectorsResponse>(`/v1/admin/users/effectors?${params.toString()}`);
  }

  async getEffectorById(id: string): Promise<AdminEffector> {
    return this.apiClient.get<AdminEffector>(`/v1/admin/users/effectors/${id}`);
  }

  async createEffector(data: CreateEffectorRequest): Promise<AdminUser> {
    return this.apiClient.post<AdminUser>('/v1/admin/users/effectors', data);
  }

  async updateEffector(id: string, data: UpdateUserRequest): Promise<AdminEffector> {
    return this.apiClient.put<AdminEffector>(`/v1/admin/users/effectors/${id}`, data);
  }

  async deleteEffector(id: string): Promise<{ message: string }> {
    return this.apiClient.delete<{ message: string }>(`/v1/admin/users/effectors/${id}`);
  }

  // Gestión de auditores
  async getAllAuditors(page: number = 1, limit: number = 10): Promise<AuditorsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    return this.apiClient.get<AuditorsResponse>(`/v1/admin/users/auditors?${params.toString()}`);
  }

  async getAuditorById(id: string): Promise<AdminAuditor> {
    return this.apiClient.get<AdminAuditor>(`/v1/admin/users/auditors/${id}`);
  }

  async createAuditor(data: CreateAuditorRequest): Promise<AdminAuditor> {
    return this.apiClient.post<AdminAuditor>('/v1/admin/users/auditors', data);
  }

  async updateAuditor(id: string, data: UpdateUserRequest): Promise<AdminAuditor> {
    return this.apiClient.put<AdminAuditor>(`/v1/admin/users/auditors/${id}`, data);
  }

  async deleteAuditor(id: string): Promise<{ message: string }> {
    return this.apiClient.delete<{ message: string }>(`/v1/admin/users/auditors/${id}`);
  }

  // ==================== ESPECIALIDADES ====================

  async getAllEspecialidades(): Promise<Especialidad[]> {
    const response = await this.apiClient.get<{ especialidades: Especialidad[] }>('/v1/admin/especialidades');
    return response.especialidades;
  }

  async getEspecialidadById(id: string): Promise<Especialidad> {
    return this.apiClient.get<Especialidad>(`/v1/admin/especialidades/${id}`);
  }

  async createEspecialidad(data: Omit<Especialidad, 'especialidadId' | 'createdAt' | 'updatedAt'>): Promise<Especialidad> {
    return this.apiClient.post<Especialidad>('/v1/admin/especialidades', data);
  }

  async updateEspecialidad(id: string, data: Partial<Omit<Especialidad, 'especialidadId' | 'createdAt' | 'updatedAt'>>): Promise<Especialidad> {
    return this.apiClient.put<Especialidad>(`/v1/admin/especialidades/${id}`, data);
  }

  async activateEspecialidad(id: string): Promise<{ message: string }> {
    return this.apiClient.patch<{ message: string }>(`/v1/admin/especialidades/${id}/activate`);
  }

  async deactivateEspecialidad(id: string): Promise<{ message: string }> {
    return this.apiClient.patch<{ message: string }>(`/v1/admin/especialidades/${id}/deactivate`);
  }

  async deleteEspecialidad(id: string): Promise<{ message: string }> {
    return this.apiClient.delete<{ message: string }>(`/v1/admin/especialidades/${id}`);
  }
} 