// Infrastructure Services
export { ApiClient } from '../http/ApiClient';

// Domain Services
export * from './medical-orders.service';
export {
  effectorRequestsService,
  type EffectorRequestStatistics,
  type EffectorRequestQueryParams
} from './effector-requests.service';
export {
  auditorService,
  type AuditStatistics,
  type AuditQueryParams
} from './auditor.service';
export {
  materialDeliveryService,
  type DeliveryStatistics,
  type MaterialDeliveryQueryParams
} from './material-delivery.service';

// Existing services
export * from './dashboard.service';
export * from './activity.service';

// Re-export service instances for easy importing
export { medicalOrdersService } from './medical-orders.service';

// Export PaginatedResponse from one source to avoid conflicts
export type { PaginatedResponse } from './effector-requests.service';