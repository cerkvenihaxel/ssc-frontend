import { ApiClient } from '../http/ApiClient';
import type { ObraSocial } from './HttpObraSocialRepository';

export interface Medico {
  medicoId: string;
  matricula: string;
  especialidadId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  picture: string | null;
  creationDate: string;
  lastUpdate: string;
  userId: string | null;
  userStatus: string | null;
  userEmailVerified: boolean | null;
  userLastLogin: string | null;
  userCreatedAt: string | null;
}

export interface CreateMedicoRequest {
  matricula: string;
  especialidadId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  picture?: string;
  obrasSociales?: string[];
}

export interface UpdateMedicoRequest {
  matricula?: string;
  especialidadId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  picture?: string;
}

export interface Especialidad {
  especialidadId: string;
  nombre: string;
  descripcion: string | null;
  codigo: string | null;
  activa: boolean;
  createdAt: string;
  updatedAt: string;
}

export class HttpMedicoRepository {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getAllMedicos(): Promise<Medico[]> {
    return this.apiClient.get<Medico[]>('/v1/medicos');
  }

  async getMedicoById(id: string): Promise<Medico> {
    return this.apiClient.get<Medico>(`/v1/medicos/${id}`);
  }

  async getMedicosByEspecialidad(especialidadId: string): Promise<Medico[]> {
    return this.apiClient.get<Medico[]>(`/v1/medicos/by-especialidad?especialidadId=${especialidadId}`);
  }

  async getMedicosByObraSocial(obraSocialId: string): Promise<Medico[]> {
    return this.apiClient.get<Medico[]>(`/v1/medicos/by-obra-social?obraSocialId=${obraSocialId}`);
  }

  async getObrasSocialesAssociated(medicoId: string): Promise<string[]> {
    return this.apiClient.get<string[]>(`/v1/medicos/${medicoId}/obras-sociales`);
  }

  async createMedico(data: CreateMedicoRequest): Promise<Medico> {
    return this.apiClient.post<Medico>('/v1/medicos', data);
  }

  async updateMedico(id: string, data: UpdateMedicoRequest): Promise<Medico> {
    return this.apiClient.put<Medico>(`/v1/medicos/${id}`, data);
  }

  async deleteMedico(id: string): Promise<void> {
    return this.apiClient.delete<void>(`/v1/medicos/${id}`);
  }

  async associateWithObraSocial(medicoId: string, obraSocialId: string): Promise<void> {
    return this.apiClient.post<void>(`/v1/medicos/${medicoId}/obras-sociales/${obraSocialId}`);
  }

  async dissociateFromObraSocial(medicoId: string, obraSocialId: string): Promise<void> {
    return this.apiClient.delete<void>(`/v1/medicos/${medicoId}/obras-sociales/${obraSocialId}`);
  }

  // Métodos para especialidades
  async getAllEspecialidades(): Promise<Especialidad[]> {
    return this.apiClient.get<Especialidad[]>('/v1/especialidades');
  }

  // Método para obras sociales
  async getAllObrasSociales(): Promise<ObraSocial[]> {
    return this.apiClient.get<ObraSocial[]>('/v1/obras-sociales');
  }
} 