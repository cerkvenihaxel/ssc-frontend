import { useState, useCallback } from 'react';
import { 
  materialDeliveryService,
  MaterialDelivery,
  MaterialDeliveryHistory,
  MaterialDeliveryAttachment,
  CreateMaterialDeliveryDto,
  UpdateMaterialDeliveryDto,
  ConfirmDeliveryDto,
  MaterialDeliveryQueryParams,
  PaginatedResponse,
  DeliveryStatistics
} from '../../infrastructure/services/material-delivery.service';

export const useMaterialDelivery = () => {
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
  const getMaterialDeliveries = useCallback(async (params: MaterialDeliveryQueryParams = {}): Promise<PaginatedResponse<MaterialDelivery>> => {
    return handleRequest(() => materialDeliveryService.getMaterialDeliveries(params));
  }, [handleRequest]);

  const getMaterialDeliveryById = useCallback(async (deliveryId: string): Promise<MaterialDelivery> => {
    return handleRequest(() => materialDeliveryService.getMaterialDeliveryById(deliveryId));
  }, [handleRequest]);

  const createMaterialDelivery = useCallback(async (data: CreateMaterialDeliveryDto): Promise<MaterialDelivery> => {
    return handleRequest(() => materialDeliveryService.createMaterialDelivery(data));
  }, [handleRequest]);

  const updateMaterialDelivery = useCallback(async (deliveryId: string, data: UpdateMaterialDeliveryDto): Promise<MaterialDelivery> => {
    return handleRequest(() => materialDeliveryService.updateMaterialDelivery(deliveryId, data));
  }, [handleRequest]);

  const deleteMaterialDelivery = useCallback(async (deliveryId: string): Promise<void> => {
    return handleRequest(() => materialDeliveryService.deleteMaterialDelivery(deliveryId));
  }, [handleRequest]);

  // Status Management
  const updateDeliveryStatus = useCallback(async (deliveryId: string, status: MaterialDelivery['status'], notes?: string): Promise<MaterialDelivery> => {
    return handleRequest(() => materialDeliveryService.updateDeliveryStatus(deliveryId, status, notes));
  }, [handleRequest]);

  const confirmDelivery = useCallback(async (deliveryId: string, data: ConfirmDeliveryDto): Promise<MaterialDelivery> => {
    return handleRequest(() => materialDeliveryService.confirmDelivery(deliveryId, data));
  }, [handleRequest]);

  const cancelDelivery = useCallback(async (deliveryId: string, reason: string): Promise<MaterialDelivery> => {
    return handleRequest(() => materialDeliveryService.cancelDelivery(deliveryId, reason));
  }, [handleRequest]);

  const scheduleDelivery = useCallback(async (deliveryId: string, scheduledDate: string, notes?: string): Promise<MaterialDelivery> => {
    return handleRequest(() => materialDeliveryService.scheduleDelivery(deliveryId, scheduledDate, notes));
  }, [handleRequest]);

  // Tracking
  const updateTracking = useCallback(async (deliveryId: string, trackingNumber: string, carrierCompany: string): Promise<MaterialDelivery> => {
    return handleRequest(() => materialDeliveryService.updateTracking(deliveryId, trackingNumber, carrierCompany));
  }, [handleRequest]);

  const getDeliveryHistory = useCallback(async (deliveryId: string): Promise<MaterialDeliveryHistory[]> => {
    return handleRequest(() => materialDeliveryService.getDeliveryHistory(deliveryId));
  }, [handleRequest]);

  const addDeliveryNote = useCallback(async (deliveryId: string, note: string, actionType: MaterialDeliveryHistory['action_type'] = 'ITEM_UPDATED'): Promise<MaterialDeliveryHistory> => {
    return handleRequest(() => materialDeliveryService.addDeliveryNote(deliveryId, note, actionType));
  }, [handleRequest]);

  // File Management
  const uploadAttachment = useCallback(async (deliveryId: string, file: File, attachmentType: MaterialDeliveryAttachment['attachment_type'], description?: string): Promise<MaterialDeliveryAttachment> => {
    return handleRequest(() => materialDeliveryService.uploadAttachment(deliveryId, file, attachmentType, description));
  }, [handleRequest]);

  const getDeliveryAttachments = useCallback(async (deliveryId: string): Promise<MaterialDeliveryAttachment[]> => {
    return handleRequest(() => materialDeliveryService.getDeliveryAttachments(deliveryId));
  }, [handleRequest]);

  const deleteAttachment = useCallback(async (deliveryId: string, attachmentId: string): Promise<void> => {
    return handleRequest(() => materialDeliveryService.deleteAttachment(deliveryId, attachmentId));
  }, [handleRequest]);

  // Reports and Statistics
  const getDeliveryStatistics = useCallback(async (dateFrom?: string, dateTo?: string): Promise<DeliveryStatistics> => {
    return handleRequest(() => materialDeliveryService.getDeliveryStatistics(dateFrom, dateTo));
  }, [handleRequest]);

  const getProviderDeliveryStats = useCallback(async (providerId: string, dateFrom?: string, dateTo?: string): Promise<{
    total_deliveries: number;
    on_time_deliveries: number;
    late_deliveries: number;
    cancelled_deliveries: number;
    average_delivery_time: number;
    success_rate: number;
    recent_deliveries: MaterialDelivery[];
  }> => {
    return handleRequest(() => materialDeliveryService.getProviderDeliveryStats(providerId, dateFrom, dateTo));
  }, [handleRequest]);

  const generateDeliveryReport = useCallback(async (deliveryId: string): Promise<{
    report_url: string;
    expires_at: string;
  }> => {
    return handleRequest(() => materialDeliveryService.generateDeliveryReport(deliveryId));
  }, [handleRequest]);

  // Search and filters
  const searchDeliveries = useCallback(async (query: string, filters?: {
    status?: string;
    provider_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<MaterialDelivery[]> => {
    return handleRequest(() => materialDeliveryService.searchDeliveries(query, filters));
  }, [handleRequest]);

  // Quick actions
  const markAsInTransit = useCallback(async (deliveryId: string, trackingNumber?: string, carrierCompany?: string): Promise<MaterialDelivery> => {
    return handleRequest(() => materialDeliveryService.markAsInTransit(deliveryId, trackingNumber, carrierCompany));
  }, [handleRequest]);

  const markAsDelivered = useCallback(async (deliveryId: string, receivedBy: string, notes?: string): Promise<MaterialDelivery> => {
    return handleRequest(() => materialDeliveryService.markAsDelivered(deliveryId, receivedBy, notes));
  }, [handleRequest]);

  return {
    loading,
    error,
    clearError: () => setError(null),
    
    // CRUD Operations
    getMaterialDeliveries,
    getMaterialDeliveryById,
    createMaterialDelivery,
    updateMaterialDelivery,
    deleteMaterialDelivery,
    
    // Status Management
    updateDeliveryStatus,
    confirmDelivery,
    cancelDelivery,
    scheduleDelivery,
    
    // Tracking
    updateTracking,
    getDeliveryHistory,
    addDeliveryNote,
    
    // File Management
    uploadAttachment,
    getDeliveryAttachments,
    deleteAttachment,
    
    // Reports and Statistics
    getDeliveryStatistics,
    getProviderDeliveryStats,
    generateDeliveryReport,
    
    // Search and filters
    searchDeliveries,
    
    // Quick Actions
    markAsInTransit,
    markAsDelivered,
  };
};