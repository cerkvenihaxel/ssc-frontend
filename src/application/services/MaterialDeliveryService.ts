import type { MaterialDeliveryRepository } from '../../infrastructure/repositories/MaterialDeliveryRepository';
import type { 
  MaterialDelivery, 
  DeliveryFilters, 
  DeliveryResponse, 
  DeliveryStatistics 
} from '../../domain/models';

export class MaterialDeliveryService {
  constructor(private materialDeliveryRepository: MaterialDeliveryRepository) {}

  async getDeliveries(filters: DeliveryFilters = {}): Promise<DeliveryResponse> {
    try {
      const response = await this.materialDeliveryRepository.getDeliveries(filters);
      return {
        data: response.data || [],
        total: response.total || 0,
        page: response.page || 1,
        limit: response.limit || 10,
        total_pages: response.total_pages || 1
      };
    } catch (error) {
      console.error('Error getting deliveries:', error);
      throw new Error('Error al obtener entregas de materiales');
    }
  }

  async getDeliveryDetail(deliveryId: string): Promise<MaterialDelivery> {
    try {
      const response = await this.materialDeliveryRepository.getDeliveryDetail(deliveryId);
      return response.data;
    } catch (error) {
      console.error('Error getting delivery detail:', error);
      throw new Error('Error al obtener detalle de entrega');
    }
  }

  async getDeliveryStatistics(): Promise<DeliveryStatistics> {
    try {
      const response = await this.materialDeliveryRepository.getDeliveryStatistics();
      return response.data;
    } catch (error) {
      console.error('Error getting delivery statistics:', error);
      throw new Error('Error al obtener estadísticas de entregas');
    }
  }

  async createDelivery(deliveryData: Partial<MaterialDelivery>): Promise<MaterialDelivery> {
    try {
      const response = await this.materialDeliveryRepository.createDelivery(deliveryData);
      return response.data;
    } catch (error) {
      console.error('Error creating delivery:', error);
      throw new Error('Error al crear entrega de material');
    }
  }

  async updateDelivery(deliveryId: string, deliveryData: Partial<MaterialDelivery>): Promise<MaterialDelivery> {
    try {
      const response = await this.materialDeliveryRepository.updateDelivery(deliveryId, deliveryData);
      return response.data;
    } catch (error) {
      console.error('Error updating delivery:', error);
      throw new Error('Error al actualizar entrega de material');
    }
  }

  async deleteDelivery(deliveryId: string): Promise<void> {
    try {
      await this.materialDeliveryRepository.deleteDelivery(deliveryId);
    } catch (error) {
      console.error('Error deleting delivery:', error);
      throw new Error('Error al eliminar entrega de material');
    }
  }
} 