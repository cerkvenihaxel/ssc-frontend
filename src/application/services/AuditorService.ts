import type { AuditRequest, AuditStatistics, AuditCriteria, Quotation, QuotationFilters, QuotationResponse } from '../../domain/models';

export interface AuditFilters {
  status?: string;
  provider_id?: string;
  date_from?: Date;
  date_to?: Date;
  audit_type?: string;
}

export interface CreateAuditRequestData {
  quotation_id: string;
  medical_order_id: string;
  provider_id: string;
  audit_type: 'manual' | 'ai' | 'hybrid';
  auditor_notes?: string;
}

export interface UpdateAuditRequestData {
  audit_status?: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'completed';
  auditor_notes?: string;
  rejection_reason?: string;
  approved_cost?: number;
  audit_criteria?: AuditCriteria;
}

export class AuditorService {
  private auditorRepository: any; // Se inyectará desde el constructor

  constructor(auditorRepository: any) {
    this.auditorRepository = auditorRepository;
  }

  async getPendingAuditRequests(filters: AuditFilters = {}): Promise<{ data: AuditRequest[]; total: number }> {
    try {
      const response = await this.auditorRepository.getPendingAuditRequests(filters);
      return {
        data: response.data || [],
        total: response.total || 0
      };
    } catch (error) {
      console.error('Error getting pending audit requests:', error);
      throw new Error('Error al obtener solicitudes pendientes de auditoría');
    }
  }

  async getAuditedRequests(filters: AuditFilters = {}): Promise<{ data: AuditRequest[]; total: number }> {
    try {
      const response = await this.auditorRepository.getAuditedRequests(filters);
      
      // Si el backend devuelve datos pero no información de paginación, calcular basado en los datos
      const data = response.data?.data || response.data || [];
      const total = response.data?.total || data.length;
      
      return {
        data: data,
        total: total
      };
    } catch (error) {
      console.error('Error getting audited requests:', error);
      throw new Error('Error al obtener solicitudes auditadas');
    }
  }

  async createAuditRequest(data: CreateAuditRequestData): Promise<AuditRequest> {
    try {
      const response = await this.auditorRepository.createAuditRequest(data);
      return response.data;
    } catch (error) {
      console.error('Error creating audit request:', error);
      throw new Error('Error al crear solicitud de auditoría');
    }
  }

  async updateAuditRequest(id: string, data: UpdateAuditRequestData): Promise<AuditRequest> {
    try {
      const response = await this.auditorRepository.updateAuditRequest(id, data);
      return response.data;
    } catch (error) {
      console.error('Error updating audit request:', error);
      throw new Error('Error al actualizar solicitud de auditoría');
    }
  }

  async getAuditRequestDetail(id: string): Promise<AuditRequest> {
    try {
      console.log('🔍 AuditorService - getAuditRequestDetail called with id:', id);
      const response = await this.auditorRepository.getAuditRequestDetail(id);
      console.log('🔍 AuditorService - Repository response:', response);
      console.log('🔍 AuditorService - Response data:', response.data);
      console.log('🔍 AuditorService - Response data type:', typeof response.data);
      console.log('🔍 AuditorService - Response structure check:', {
        hasData: !!response.data,
        isObject: typeof response === 'object',
        hasAuditId: response && typeof response === 'object' && 'audit_request_id' in response
      });
      
      // Manejar ambos casos: respuesta directa o anidada
      let auditData: AuditRequest;
      
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        // Estructura anidada: { success: true, data: { ... } }
        console.log('🔍 AuditorService - Using nested data structure');
        auditData = response.data.data;
      } else if (response.data) {
        // Estructura directa: { success: true, data: { ... } } donde data es el objeto directamente
        console.log('🔍 AuditorService - Using direct data structure');
        auditData = response.data;
      } else if (response && typeof response === 'object' && 'audit_request_id' in response) {
        // La respuesta es directamente el objeto de auditoría
        console.log('🔍 AuditorService - Response is directly the audit data');
        auditData = response as AuditRequest;
      } else {
        console.log('🔍 AuditorService - No data in response, throwing error');
        throw new Error('No se encontraron datos de auditoría');
      }
      
      console.log('🔍 AuditorService - Final audit data:', auditData);
      return auditData;
    } catch (error) {
      console.error('🔍 AuditorService - Error getting audit request detail:', error);
      throw new Error('Error al obtener detalle de solicitud de auditoría');
    }
  }

  async getAuditStatistics(): Promise<AuditStatistics> {
    try {
      const response = await this.auditorRepository.getAuditStatistics();
      return response.data;
    } catch (error) {
      console.error('Error getting audit statistics:', error);
      throw new Error('Error al obtener estadísticas de auditoría');
    }
  }

  async getPendingQuotations(filters: QuotationFilters = {}): Promise<QuotationResponse> {
    try {
      const response = await this.auditorRepository.getPendingQuotations(filters);
      
      // El backend devuelve { success: true, data: { data: [...], total: ..., page: ..., limit: ..., total_pages: ... } }
      // Necesitamos extraer la estructura correcta
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return {
          data: response.data.data || [],
          total: response.data.total || 0,
          page: response.data.page || 1,
          limit: response.data.limit || 10,
          total_pages: response.data.total_pages || 1
        };
      }
      
      // Fallback para estructura directa
      return {
        data: response.data || [],
        total: response.total || 0,
        page: response.page || 1,
        limit: response.limit || 10,
        total_pages: response.total_pages || 1
      };
    } catch (error) {
      console.error('Error getting pending quotations:', error);
      // No usar mocks, propagar el error real
      throw new Error(`Error al obtener cotizaciones pendientes: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async getCompletedRequests(filters: QuotationFilters = {}): Promise<QuotationResponse> {
    try {
      const response = await this.auditorRepository.getCompletedRequests(filters);
      
      // El backend devuelve { success: true, data: { data: [...], total: ..., page: ..., limit: ..., total_pages: ... } }
      // Necesitamos extraer la estructura correcta
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return {
          data: response.data.data || [],
          total: response.data.total || 0,
          page: response.data.page || 1,
          limit: response.data.limit || 10,
          total_pages: response.data.total_pages || 1
        };
      }
      
      // Fallback para estructura directa
      return {
        data: response.data || [],
        total: response.total || 0,
        page: response.page || 1,
        limit: response.limit || 10,
        total_pages: response.total_pages || 1
      };
    } catch (error) {
      console.error('Error getting completed requests:', error);
      // No usar mocks, propagar el error real
      throw new Error(`Error al obtener solicitudes finalizadas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async getQuotationDetail(quotationId: string): Promise<Quotation> {
    try {
      const response = await this.auditorRepository.getQuotationDetail(quotationId);
      
      // El backend devuelve { success: true, data: { data: {...} } }
      // Necesitamos extraer la estructura correcta
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return response.data.data;
      }
      
      // Fallback para estructura directa
      return response.data;
    } catch (error) {
      console.error('Error getting quotation detail:', error);
      // No usar mocks, propagar el error real
      throw new Error(`Error al obtener detalle de cotización: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async approveAuditRequest(id: string, approvedCost: number, notes?: string): Promise<AuditRequest> {
    try {
      console.log('🔍 AuditorService - approveAuditRequest');
      console.log('🔍 id:', id);
      console.log('🔍 approvedCost:', approvedCost);
      console.log('🔍 notes:', notes);

      const data: UpdateAuditRequestData = {
        audit_status: 'approved',
        approved_cost: Number(approvedCost),
        auditor_notes: notes,
        audit_criteria: {
          price_reasonable: true,
          quality_adequate: true,
          delivery_time_acceptable: true,
          provider_reliable: true,
          documentation_complete: true
        }
      };

      console.log('🔍 Payload being sent:', JSON.stringify(data, null, 2));

      return await this.updateAuditRequest(id, data);
    } catch (error) {
      console.error('Error approving audit request:', error);
      throw new Error('Error al aprobar solicitud de auditoría');
    }
  }

  async rejectAuditRequest(id: string, rejectionReason: string, notes?: string): Promise<AuditRequest> {
    try {
      console.log('🔍 AuditorService - rejectAuditRequest');
      console.log('🔍 id:', id);
      console.log('🔍 rejectionReason:', rejectionReason);
      console.log('🔍 notes:', notes);

      const data: UpdateAuditRequestData = {
        audit_status: 'rejected',
        rejection_reason: rejectionReason,
        auditor_notes: notes,
        audit_criteria: {
          price_reasonable: false,
          quality_adequate: false,
          delivery_time_acceptable: false,
          provider_reliable: false,
          documentation_complete: false
        }
      };

      console.log('🔍 Payload being sent:', JSON.stringify(data, null, 2));

      return await this.updateAuditRequest(id, data);
    } catch (error) {
      console.error('Error rejecting audit request:', error);
      throw new Error('Error al rechazar solicitud de auditoría');
    }
  }

  async completeAuditRequest(id: string, notes?: string): Promise<AuditRequest> {
    try {
      const data: UpdateAuditRequestData = {
        audit_status: 'completed',
        auditor_notes: notes
      };
      return await this.updateAuditRequest(id, data);
    } catch (error) {
      console.error('Error completing audit request:', error);
      throw new Error('Error al completar solicitud de auditoría');
    }
  }
} 