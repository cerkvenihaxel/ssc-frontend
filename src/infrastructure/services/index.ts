// Infrastructure Services
export { ApiClient } from '../http/ApiClient';

// Domain Services
export * from './medical-orders.service';
export * from './effector-requests.service';
export * from './auditor.service';
export * from './material-delivery.service';

// Existing services
export * from './dashboard.service';
export * from './activity.service';

// Re-export service instances for easy importing
export { medicalOrdersService } from './medical-orders.service';
export { effectorRequestsService } from './effector-requests.service';
export { auditorService } from './auditor.service';
export { materialDeliveryService } from './material-delivery.service';