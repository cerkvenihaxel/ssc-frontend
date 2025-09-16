import { useState, useCallback } from 'react';
import { 
  medicalOrdersService, 
  MedicalOrder, 
  MedicalOrderQueryDto, 
  CreateMedicalOrderDto, 
  UpdateMedicalOrderDto, 
  AuthorizeMedicalOrderDto,
  CorrectMedicalOrderDto,
  MedicalOrderListResponse,
  MedicalOrderStatistics,
  Affiliate,
  UrgencyType,
  MedicalCategory
} from '../../infrastructure/services/medical-orders.service';

export const useMedicalOrders = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = useCallback(async <T>(
    request: () => Promise<T>
  ): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      const result = await request();
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Error en la operación';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // CRUD Operations
  const getMedicalOrders = useCallback(async (query: MedicalOrderQueryDto = {}): Promise<MedicalOrderListResponse> => {
    return handleRequest(() => medicalOrdersService.getMedicalOrders(query));
  }, [handleRequest]);

  const getMedicalOrderById = useCallback(async (orderId: string): Promise<MedicalOrder> => {
    return handleRequest(() => medicalOrdersService.getMedicalOrderById(orderId));
  }, [handleRequest]);

  const createMedicalOrder = useCallback(async (data: CreateMedicalOrderDto): Promise<MedicalOrder> => {
    return handleRequest(() => medicalOrdersService.createMedicalOrder(data));
  }, [handleRequest]);

  const updateMedicalOrder = useCallback(async (orderId: string, data: UpdateMedicalOrderDto): Promise<MedicalOrder> => {
    return handleRequest(() => medicalOrdersService.updateMedicalOrder(orderId, data));
  }, [handleRequest]);

  const deleteMedicalOrder = useCallback(async (orderId: string): Promise<void> => {
    return handleRequest(() => medicalOrdersService.deleteMedicalOrder(orderId));
  }, [handleRequest]);

  // Authorization Operations
  const authorizeMedicalOrder = useCallback(async (orderId: string, data: AuthorizeMedicalOrderDto): Promise<MedicalOrder> => {
    return handleRequest(() => medicalOrdersService.authorizeMedicalOrder(orderId, data));
  }, [handleRequest]);

  const aiAuthorizeMedicalOrder = useCallback(async (orderId: string): Promise<MedicalOrder> => {
    return handleRequest(() => medicalOrdersService.aiAuthorizeMedicalOrder(orderId));
  }, [handleRequest]);

  const correctMedicalOrder = useCallback(async (orderId: string, data: CorrectMedicalOrderDto): Promise<MedicalOrder> => {
    return handleRequest(() => medicalOrdersService.correctMedicalOrder(orderId, data));
  }, [handleRequest]);

  // History and Analysis
  const getAuthorizationHistory = useCallback(async (orderId: string): Promise<any[]> => {
    return handleRequest(() => medicalOrdersService.getAuthorizationHistory(orderId));
  }, [handleRequest]);

  const getAIAnalysis = useCallback(async (orderId: string): Promise<any> => {
    return handleRequest(() => medicalOrdersService.getAIAnalysis(orderId));
  }, [handleRequest]);

  const getAIAnalysisHistory = useCallback(async (orderId: string): Promise<any[]> => {
    return handleRequest(() => medicalOrdersService.getAIAnalysisHistory(orderId));
  }, [handleRequest]);

  const getItemAIAnalysis = useCallback(async (orderId: string, itemId: string): Promise<any> => {
    return handleRequest(() => medicalOrdersService.getItemAIAnalysis(orderId, itemId));
  }, [handleRequest]);

  const refreshAIAnalysis = useCallback(async (orderId: string): Promise<MedicalOrder> => {
    return handleRequest(() => medicalOrdersService.refreshAIAnalysis(orderId));
  }, [handleRequest]);

  // Reference Data
  const getMedicalCategories = useCallback(async (): Promise<MedicalCategory[]> => {
    return handleRequest(() => medicalOrdersService.getMedicalCategories());
  }, [handleRequest]);

  const getUrgencyTypes = useCallback(async (): Promise<UrgencyType[]> => {
    return handleRequest(() => medicalOrdersService.getUrgencyTypes());
  }, [handleRequest]);

  const searchAffiliates = useCallback(async (query: {
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
  }> => {
    return handleRequest(() => medicalOrdersService.searchAffiliates(query));
  }, [handleRequest]);

  // Statistics
  const getDashboardStats = useCallback(async (): Promise<MedicalOrderStatistics> => {
    return handleRequest(() => medicalOrdersService.getDashboardStats());
  }, [handleRequest]);

  return {
    loading,
    error,
    clearError: () => setError(null),
    
    // CRUD Operations
    getMedicalOrders,
    getMedicalOrderById,
    createMedicalOrder,
    updateMedicalOrder,
    deleteMedicalOrder,
    
    // Authorization Operations
    authorizeMedicalOrder,
    aiAuthorizeMedicalOrder,
    correctMedicalOrder,
    
    // History and Analysis
    getAuthorizationHistory,
    getAIAnalysis,
    getAIAnalysisHistory,
    getItemAIAnalysis,
    refreshAIAnalysis,
    
    // Reference Data
    getMedicalCategories,
    getUrgencyTypes,
    searchAffiliates,
    
    // Statistics
    getDashboardStats,
  };
};