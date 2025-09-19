// Infrastructure Services
export { ApiClient } from '../http/ApiClient';

// Domain Services
export * from './medical-orders.service';
export {
  effectorRequestsService,
  type EffectorRequestFilters,
  type EffectorRequestStats
} from './effector-requests.service';
export {
  auditorService,
  type AuditRequestFilters,
  type AuditStats
} from './auditor.service';
export {
  materialDeliveryService,
  type DeliveryFilters as MaterialDeliveryFilters,
  type DeliveryStatistics as MaterialDeliveryStatistics
} from './material-delivery.service';

// Existing services
export * from './dashboard.service';
export * from './activity.service';

// Re-export service instances for easy importing
export { medicalOrdersService } from './medical-orders.service';

// Export PaginatedResponse from one source to avoid conflicts
export type { PaginatedResponse } from './effector-requests.service';