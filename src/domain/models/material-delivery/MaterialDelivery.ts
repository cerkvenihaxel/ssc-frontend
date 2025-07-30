export interface MaterialDelivery {
  delivery_id: string;
  medical_order_id: string;
  patient_name: string;
  provider_name: string;
  delivery_date: Date;
  delivery_status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  delivery_address: string;
  contact_phone: string;
  items_count: number;
  total_cost: number;
  tracking_number?: string;
  delivery_notes?: string;
  created_at: Date;
  updated_at: Date;
  items: DeliveryItem[];
  medical_order?: DeliveryMedicalOrderInfo;
}

export interface DeliveryItem {
  item_id: string;
  name: string;
  description?: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  category: string;
  condition: 'new' | 'refurbished' | 'used';
  serial_number?: string;
  warranty_info?: string;
}

export interface DeliveryMedicalOrderInfo {
  medical_order_id: string;
  patient_name: string;
  doctor_name?: string;
  specialty?: string;
  urgency: 'low' | 'medium' | 'high';
  created_at: Date;
}

export interface DeliveryFilters {
  status?: string;
  provider_id?: string;
  date_from?: string;
  date_to?: string;
  patient_name?: string;
  medical_order_id?: string;
  page?: number;
  limit?: number;
}

export interface DeliveryResponse {
  data: MaterialDelivery[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface DeliveryStatistics {
  total_deliveries: number;
  pending_deliveries: number;
  in_transit_deliveries: number;
  delivered_deliveries: number;
  cancelled_deliveries: number;
  average_delivery_time: number;
  total_value: number;
  monthly_trends: MonthlyDeliveryTrend[];
}

export interface MonthlyDeliveryTrend {
  month: string;
  deliveries: number;
  delivered: number;
  cancelled: number;
  total_value: number;
}

export interface DeliveryStatus {
  status: 'pending' | 'preparing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  label: string;
  description: string;
  color: string;
  icon: string;
}

export const DELIVERY_STATUSES: Record<string, DeliveryStatus> = {
  pending: {
    status: 'pending',
    label: 'Pendiente',
    description: 'Entrega pendiente de procesamiento',
    color: 'bg-yellow-100 text-yellow-800',
    icon: 'clock'
  },
  preparing: {
    status: 'preparing',
    label: 'Preparando',
    description: 'Materiales siendo preparados',
    color: 'bg-blue-100 text-blue-800',
    icon: 'package'
  },
  shipped: {
    status: 'shipped',
    label: 'Enviado',
    description: 'Materiales en tránsito',
    color: 'bg-purple-100 text-purple-800',
    icon: 'truck'
  },
  delivered: {
    status: 'delivered',
    label: 'Entregado',
    description: 'Materiales entregados al destinatario',
    color: 'bg-green-100 text-green-800',
    icon: 'check-circle'
  },
  completed: {
    status: 'completed',
    label: 'Completado',
    description: 'Entrega completada con control de calidad',
    color: 'bg-gray-100 text-gray-800',
    icon: 'shield-check'
  },
  cancelled: {
    status: 'cancelled',
    label: 'Cancelado',
    description: 'Entrega cancelada',
    color: 'bg-red-100 text-red-800',
    icon: 'x-circle'
  }
}; 