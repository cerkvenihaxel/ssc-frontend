import React from 'react';
import { DELIVERY_STATUSES } from '../../../domain/models';

interface DeliveryStatusBadgeProps {
  status: 'pending' | 'preparing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  size?: 'sm' | 'md' | 'lg';
}

export const DeliveryStatusBadge: React.FC<DeliveryStatusBadgeProps> = ({ 
  status, 
  size = 'md' 
}) => {
  const statusConfig = DELIVERY_STATUSES[status];
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const sizeClass = sizeClasses[size];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color} ${sizeClass}`}>
      {statusConfig.label}
    </span>
  );
}; 