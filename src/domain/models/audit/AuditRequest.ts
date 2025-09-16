export interface AuditRequest {
  audit_request_id: string;
  quotation_id: string;
  medical_order_id: string;
  provider_id: string;
  audit_status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'completed';
  auditor_notes?: string;
  rejection_reason?: string;
  original_order_cost?: number;
  quoted_cost?: number;
  approved_cost?: number;
  item_comparison?: any;
  audit_criteria?: AuditCriteria;
  audit_type: 'manual' | 'ai' | 'hybrid';
  auditor_id?: string;
  audited_at?: string; // Changed from Date to string (ISO 8601)
  completed_at?: string; // Changed from Date to string (ISO 8601)
  created_at: string; // Changed from Date to string (ISO 8601)
  updated_at: string; // Changed from Date to string (ISO 8601)
  created_by?: string;
  updated_by?: string;
  quotation?: any;
  medicalOrder?: any; // Changed from medical_order to medicalOrder to match API
}

export interface AuditStatistics {
  total_requests: number;
  pending_requests: number;
  in_progress_requests: number;
  approved_requests: number;
  rejected_requests: number;
  completed_requests: number;
  average_processing_time: number;
  cost_savings: number;
  monthly_trends: {
    month: string;
    requests: number;
    approved: number;
    rejected: number;
  }[];
}

export interface AuditCriteria {
  price_reasonable: boolean;
  quality_adequate: boolean;
  delivery_time_acceptable: boolean;
  provider_reliable: boolean;
  documentation_complete: boolean;
} 