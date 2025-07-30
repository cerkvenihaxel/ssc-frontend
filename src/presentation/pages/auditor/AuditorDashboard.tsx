import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuditStatistics } from '../../../domain/models';
import BaseLayout from '../../../shared/components/layout/BaseLayout';

export const AuditorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<AuditStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implementar carga de estadísticas
    setLoading(false);
  }, []);

  const dashboardCards = [
    {
      title: 'Solicitudes Pendientes',
      value: statistics?.pending_requests || 0,
      color: 'bg-yellow-500',
      icon: '📋',
      action: () => navigate('/auditor/pending-requests')
    },
    {
      title: 'En Progreso',
      value: statistics?.in_progress_requests || 0,
      color: 'bg-blue-500',
      icon: '⏳',
      action: () => navigate('/auditor/pending-requests')
    },
    {
      title: 'Aprobadas',
      value: statistics?.approved_requests || 0,
      color: 'bg-green-500',
      icon: '✅',
      action: () => navigate('/auditor/audited-requests')
    },
    {
      title: 'Rechazadas',
      value: statistics?.rejected_requests || 0,
      color: 'bg-red-500',
      icon: '❌',
      action: () => navigate('/auditor/audited-requests')
    }
  ];

  const quickActions = [
    {
      title: 'Ver Solicitudes Pendientes',
      description: 'Revisar solicitudes que requieren auditoría',
      icon: '📋',
      action: () => navigate('/auditor/pending-requests'),
      color: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      title: 'Historial de Auditorías',
      description: 'Ver todas las auditorías realizadas',
      icon: '📊',
      action: () => navigate('/auditor/audited-requests'),
      color: 'bg-green-50 hover:bg-green-100'
    },
    {
      title: 'Estadísticas',
      description: 'Ver reportes y métricas de auditoría',
      icon: '📈',
      action: () => navigate('/auditor/statistics'),
      color: 'bg-purple-50 hover:bg-purple-100'
    }
  ];

  return (
    <BaseLayout title="Dashboard de Auditoría">
      <div className="space-y-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard de Auditoría
            </h1>
            <p className="mt-2 text-gray-600">
              Panel de control para gestión de auditorías de cotizaciones
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardCards.map((card, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={card.action}
              >
                <div className="flex items-center">
                  <div className={`${card.color} rounded-lg p-3 text-white text-2xl`}>
                    {card.icon}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className={`${action.color} rounded-lg p-6 cursor-pointer transition-colors duration-200 border border-gray-200`}
                onClick={action.action}
              >
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">{action.icon}</span>
                  <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>
                </div>
                <p className="text-gray-600">{action.description}</p>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>No hay actividad reciente</p>
                  <p className="text-sm">Las auditorías recientes aparecerán aquí</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </BaseLayout>
  );
}; 