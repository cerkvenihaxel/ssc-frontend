export interface Quotation {
  quotation_id: string; // uuid en backend
  medical_order_id: string; // uuid en backend
  provider_id: string; // uuid en backend
  provider_name: string;
  patient_name: string;
  total_cost: number;
  delivery_days: number;
  items_count: number;
  status: 'pending' | 'sent' | 'approved' | 'rejected' | 'completed';
  created_at: string; // ISO 8601 date string en backend
  updated_at: string; // ISO 8601 date string en backend
  items: QuotationItem[];
  medical_order: MedicalOrderInfo;
}

export interface QuotationItem {
  item_id: string; // uuid en backend
  name: string;
  description: string | null;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  category: string | null;
}

export interface MedicalOrderInfo {
  medical_order_id: string; // uuid en backend
  patient_name: string;
  doctor_name: string | null;
  specialty: string[]; // Array de strings en backend, no string único
  urgency: 'low' | 'medium' | 'high';
  created_at: string; // ISO 8601 date string en backend
}

export interface QuotationFilters {
  status?: string;
  provider_id?: string;
  date_from?: string; // YYYY-MM-DD format
  date_to?: string; // YYYY-MM-DD format
  patient_name?: string;
  medical_order_id?: string;
  page?: number;
  limit?: number;
}

export interface QuotationResponse {
  data: Quotation[];
  total: number;
  page: number;
  limit: number;
  total_pages: number; // Agregado según documentación
} 