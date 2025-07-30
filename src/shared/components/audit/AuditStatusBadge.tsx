import React from 'react';

interface AuditStatusBadgeProps {
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'completed';
  size?: 'sm' | 'md' | 'lg';
}

export const AuditStatusBadge: React.FC<AuditStatusBadgeProps> = ({ 
  status, 
  size = 'md' 
}) => {
  const statusConfig = {
    pending: {
      label: 'Pendiente',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    in_progress: {
      label: 'En Progreso',
      className: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    approved: {
      label: 'Aprobado',
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    rejected: {
      label: 'Rechazado',
      className: 'bg-red-100 text-red-800 border-red-200'
    },
    completed: {
      label: 'Completado',
      className: 'bg-gray-100 text-gray-800 border-gray-200'
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const config = statusConfig[status];
  const sizeClass = sizeClasses[size];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className} ${sizeClass}`}>
      {config.label}
    </span>
  );
}; 