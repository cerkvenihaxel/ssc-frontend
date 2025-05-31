import { useState, useCallback } from 'react';
import { HttpAdminRepository } from '../../infrastructure/repositories/HttpAdminRepository';
import type { AdminUser, AdminUserStats, AdminProvider, AdminAuditor, AdminEffector, CreateProviderRequest, CreateEffectorRequest, CreateAuditorRequest, UpdateUserRequest, ProvidersResponse, EffectorsResponse, AuditorsResponse, Especialidad } from '../../infrastructure/repositories/HttpAdminRepository';
import { ApiClient } from '../../infrastructure/http/ApiClient';

const apiClient = new ApiClient();
const adminRepository = new HttpAdminRepository(apiClient);

export const useAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = useCallback(async <T>(
    request: () => Promise<T>
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await request();
      return result;
    } catch (err: any) {
      console.error('Admin request error:', err);
      setError(err.message || 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Usuarios
  const getAllUsers = useCallback(async (page: number = 1, limit: number = 10, role?: string) => {
    return handleRequest(() => adminRepository.getAllUsers(page, limit, role));
  }, [handleRequest]);

  const getUserStats = useCallback(async () => {
    return handleRequest(() => adminRepository.getUserStats());
  }, [handleRequest]);

  const getUserById = useCallback(async (id: string) => {
    return handleRequest(() => adminRepository.getUserById(id));
  }, [handleRequest]);

  const updateUser = useCallback(async (id: string, data: UpdateUserRequest) => {
    return handleRequest(() => adminRepository.updateUser(id, data));
  }, [handleRequest]);

  const updateUserPermissions = useCallback(async (id: string, permissions: string[]) => {
    return handleRequest(() => adminRepository.updateUserPermissions(id, permissions));
  }, [handleRequest]);

  const bulkUpdateUsers = useCallback(async (userIds: string[], updates: Partial<UpdateUserRequest>) => {
    return handleRequest(() => adminRepository.bulkUpdateUsers(userIds, updates));
  }, [handleRequest]);

  const deleteUser = useCallback(async (id: string) => {
    return handleRequest(() => adminRepository.deleteUser(id));
  }, [handleRequest]);

  // Proveedores
  const getAllProviders = useCallback(async () => {
    return handleRequest(() => adminRepository.getAllProviders());
  }, [handleRequest]);

  const getProviderById = useCallback(async (id: string) => {
    return handleRequest(() => adminRepository.getProviderById(id));
  }, [handleRequest]);

  const getProviderDetailsById = useCallback(async (id: string) => {
    return handleRequest(() => adminRepository.getProviderDetailsById(id));
  }, [handleRequest]);

  const updateProvider = useCallback(async (id: string, data: UpdateUserRequest) => {
    return handleRequest(() => adminRepository.updateProvider(id, data));
  }, [handleRequest]);

  const deleteProvider = useCallback(async (id: string) => {
    return handleRequest(() => adminRepository.deleteProvider(id));
  }, [handleRequest]);

  const createProvider = useCallback(async (data: CreateProviderRequest) => {
    return handleRequest(() => adminRepository.createProvider(data));
  }, [handleRequest]);

  // Efectores
  const getAllEffectors = useCallback(async (page: number = 1, limit: number = 10) => {
    return handleRequest(() => adminRepository.getAllEffectors(page, limit));
  }, [handleRequest]);

  const getEffectorById = useCallback(async (id: string) => {
    return handleRequest(() => adminRepository.getEffectorById(id));
  }, [handleRequest]);

  const createEffector = useCallback(async (data: CreateEffectorRequest) => {
    return handleRequest(() => adminRepository.createEffector(data));
  }, [handleRequest]);

  const updateEffector = useCallback(async (id: string, data: UpdateUserRequest) => {
    return handleRequest(() => adminRepository.updateEffector(id, data));
  }, [handleRequest]);

  const deleteEffector = useCallback(async (id: string) => {
    return handleRequest(() => adminRepository.deleteEffector(id));
  }, [handleRequest]);

  // Auditores
  const getAllAuditors = useCallback(async (page: number = 1, limit: number = 10) => {
    return handleRequest(() => adminRepository.getAllAuditors(page, limit));
  }, [handleRequest]);

  const getAuditorById = useCallback(async (id: string) => {
    return handleRequest(() => adminRepository.getAuditorById(id));
  }, [handleRequest]);

  const createAuditor = useCallback(async (data: CreateAuditorRequest) => {
    return handleRequest(() => adminRepository.createAuditor(data));
  }, [handleRequest]);

  const updateAuditor = useCallback(async (id: string, data: UpdateUserRequest) => {
    return handleRequest(() => adminRepository.updateAuditor(id, data));
  }, [handleRequest]);

  const deleteAuditor = useCallback(async (id: string) => {
    return handleRequest(() => adminRepository.deleteAuditor(id));
  }, [handleRequest]);

  // ==================== ESPECIALIDADES ====================

  const getAllEspecialidades = useCallback(async () => {
    return handleRequest(() => adminRepository.getAllEspecialidades());
  }, [handleRequest]);

  const getEspecialidadById = useCallback(async (id: string) => {
    return handleRequest(() => adminRepository.getEspecialidadById(id));
  }, [handleRequest]);

  const createEspecialidad = useCallback(async (data: Omit<Especialidad, 'especialidadId' | 'fechaCreacion' | 'fechaActualizacion'>) => {
    return handleRequest(() => adminRepository.createEspecialidad(data));
  }, [handleRequest]);

  const updateEspecialidad = useCallback(async (id: string, data: Partial<Omit<Especialidad, 'especialidadId' | 'fechaCreacion' | 'fechaActualizacion'>>) => {
    return handleRequest(() => adminRepository.updateEspecialidad(id, data));
  }, [handleRequest]);

  const activateEspecialidad = useCallback(async (id: string) => {
    return handleRequest(() => adminRepository.activateEspecialidad(id));
  }, [handleRequest]);

  const deactivateEspecialidad = useCallback(async (id: string) => {
    return handleRequest(() => adminRepository.deactivateEspecialidad(id));
  }, [handleRequest]);

  const deleteEspecialidad = useCallback(async (id: string) => {
    return handleRequest(() => adminRepository.deleteEspecialidad(id));
  }, [handleRequest]);

  return {
    loading,
    error,
    setError,
    // Usuarios
    getAllUsers,
    getUserStats,
    getUserById,
    updateUser,
    updateUserPermissions,
    bulkUpdateUsers,
    deleteUser,
    // Proveedores
    getAllProviders,
    getProviderById,
    getProviderDetailsById,
    updateProvider,
    deleteProvider,
    createProvider,
    // Efectores
    getAllEffectors,
    getEffectorById,
    createEffector,
    updateEffector,
    deleteEffector,
    // Auditores
    getAllAuditors,
    getAuditorById,
    createAuditor,
    updateAuditor,
    deleteAuditor,
    // Especialidades
    getAllEspecialidades,
    getEspecialidadById,
    createEspecialidad,
    updateEspecialidad,
    activateEspecialidad,
    deactivateEspecialidad,
    deleteEspecialidad,
  };
}; 