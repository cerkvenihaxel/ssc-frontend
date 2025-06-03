import { useState, useCallback } from 'react';
import { HttpAdminRepository } from '../../infrastructure/repositories/HttpAdminRepository';
import type { AdminUser, AdminUserStats, AdminProvider, AdminAuditor, AdminEffector, CreateProviderRequest, CreateEffectorRequest, CreateAuditorRequest, UpdateUserRequest, ProvidersResponse, EffectorsResponse, AuditorsResponse, Especialidad } from '../../infrastructure/repositories/HttpAdminRepository';
import { useObfuscation } from '../../shared/contexts/ObfuscationContext';

export const useAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use the obfuscated API client from context
  const { obfuscatedApiClient } = useObfuscation();
  
  // Create the repository with the obfuscated client (since ObfuscatedApiClient extends ApiClient interface)
  const adminRepository = new HttpAdminRepository(obfuscatedApiClient as any);

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
  }, [obfuscatedApiClient]);

  // Usuarios
  const getAllUsers = useCallback(async (page: number = 1, limit: number = 10, role?: string) => {
    return handleRequest(() => adminRepository.getAllUsers(page, limit, role));
  }, [handleRequest, adminRepository]);

  const getUserStats = useCallback(async () => {
    return handleRequest(() => adminRepository.getUserStats());
  }, [handleRequest, adminRepository]);

  const getUserById = useCallback(async (id: string) => {
    return handleRequest(() => adminRepository.getUserById(id));
  }, [handleRequest, adminRepository]);

  const updateUser = useCallback(async (id: string, data: UpdateUserRequest) => {
    return handleRequest(() => adminRepository.updateUser(id, data));
  }, [handleRequest, adminRepository]);

  const updateUserPermissions = useCallback(async (id: string, permissions: string[]) => {
    return handleRequest(() => adminRepository.updateUserPermissions(id, permissions));
  }, [handleRequest, adminRepository]);

  const bulkUpdateUsers = useCallback(async (userIds: string[], updates: Partial<UpdateUserRequest>) => {
    return handleRequest(() => adminRepository.bulkUpdateUsers(userIds, updates));
  }, [handleRequest, adminRepository]);

  const deleteUser = useCallback(async (id: string) => {
    return handleRequest(() => adminRepository.deleteUser(id));
  }, [handleRequest, adminRepository]);

  // Proveedores
  const getAllProviders = useCallback(async () => {
    return handleRequest(() => adminRepository.getAllProviders());
  }, [handleRequest, adminRepository]);

  const getProviderById = useCallback(async (id: string) => {
    return handleRequest(() => adminRepository.getProviderById(id));
  }, [handleRequest, adminRepository]);

  const getProviderDetailsById = useCallback(async (id: string) => {
    return handleRequest(() => adminRepository.getProviderDetailsById(id));
  }, [handleRequest, adminRepository]);

  const updateProvider = useCallback(async (id: string, data: UpdateUserRequest) => {
    return handleRequest(() => adminRepository.updateProvider(id, data));
  }, [handleRequest, adminRepository]);

  const deleteProvider = useCallback(async (id: string) => {
    return handleRequest(() => adminRepository.deleteProvider(id));
  }, [handleRequest, adminRepository]);

  const createProvider = useCallback(async (data: CreateProviderRequest) => {
    return handleRequest(() => adminRepository.createProvider(data));
  }, [handleRequest, adminRepository]);

  // Efectores
  const getAllEffectors = useCallback(async (page: number = 1, limit: number = 10) => {
    return handleRequest(() => adminRepository.getAllEffectors(page, limit));
  }, [handleRequest, adminRepository]);

  const getEffectorById = useCallback(async (id: string) => {
    return handleRequest(() => adminRepository.getEffectorById(id));
  }, [handleRequest, adminRepository]);

  const createEffector = useCallback(async (data: CreateEffectorRequest) => {
    return handleRequest(() => adminRepository.createEffector(data));
  }, [handleRequest, adminRepository]);

  const updateEffector = useCallback(async (id: string, data: UpdateUserRequest) => {
    return handleRequest(() => adminRepository.updateEffector(id, data));
  }, [handleRequest, adminRepository]);

  const deleteEffector = useCallback(async (id: string) => {
    return handleRequest(() => adminRepository.deleteEffector(id));
  }, [handleRequest, adminRepository]);

  // Auditores
  const getAllAuditors = useCallback(async (page: number = 1, limit: number = 10) => {
    return handleRequest(() => adminRepository.getAllAuditors(page, limit));
  }, [handleRequest, adminRepository]);

  const getAuditorById = useCallback(async (id: string) => {
    return handleRequest(() => adminRepository.getAuditorById(id));
  }, [handleRequest, adminRepository]);

  const createAuditor = useCallback(async (data: CreateAuditorRequest) => {
    return handleRequest(() => adminRepository.createAuditor(data));
  }, [handleRequest, adminRepository]);

  const updateAuditor = useCallback(async (id: string, data: UpdateUserRequest) => {
    return handleRequest(() => adminRepository.updateAuditor(id, data));
  }, [handleRequest, adminRepository]);

  const deleteAuditor = useCallback(async (id: string) => {
    return handleRequest(() => adminRepository.deleteAuditor(id));
  }, [handleRequest, adminRepository]);

  // ==================== ESPECIALIDADES ====================

  const getAllEspecialidades = useCallback(async () => {
    return handleRequest(() => adminRepository.getAllEspecialidades());
  }, [handleRequest, adminRepository]);

  const getEspecialidadById = useCallback(async (id: string) => {
    return handleRequest(() => adminRepository.getEspecialidadById(id));
  }, [handleRequest, adminRepository]);

  const createEspecialidad = useCallback(async (data: Omit<Especialidad, 'especialidadId' | 'fechaCreacion' | 'fechaActualizacion'>) => {
    return handleRequest(() => adminRepository.createEspecialidad(data));
  }, [handleRequest, adminRepository]);

  const updateEspecialidad = useCallback(async (id: string, data: Partial<Omit<Especialidad, 'especialidadId' | 'fechaCreacion' | 'fechaActualizacion'>>) => {
    return handleRequest(() => adminRepository.updateEspecialidad(id, data));
  }, [handleRequest, adminRepository]);

  const activateEspecialidad = useCallback(async (id: string) => {
    return handleRequest(() => adminRepository.activateEspecialidad(id));
  }, [handleRequest, adminRepository]);

  const deactivateEspecialidad = useCallback(async (id: string) => {
    return handleRequest(() => adminRepository.deactivateEspecialidad(id));
  }, [handleRequest, adminRepository]);

  const deleteEspecialidad = useCallback(async (id: string) => {
    return handleRequest(() => adminRepository.deleteEspecialidad(id));
  }, [handleRequest, adminRepository]);

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