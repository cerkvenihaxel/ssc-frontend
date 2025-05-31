export interface Especialidad {
  especialidadId: string;
  nombre: string;
  descripcion: string | null;
  codigo: string | null;
  activa: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEspecialidadRequest {
  nombre: string;
  descripcion?: string;
  codigo?: string;
  activa?: boolean;
}

export interface UpdateEspecialidadRequest {
  nombre?: string;
  descripcion?: string;
  codigo?: string;
  activa?: boolean;
}

export interface EspecialidadesResponse {
  especialidades: Especialidad[];
  total: number;
} 