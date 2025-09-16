import React from 'react';
import { getAvailableRoutesForRole, sortRoutesByOrder } from '../../../shared/config/routeConfig';
import BaseLayout from '../../../shared/components/layout/BaseLayout';

export const TestSidebarPage: React.FC = () => {
  // Obtener directamente las rutas de administrador
  const adminRoutes = getAvailableRoutesForRole('Administrador');
  const sortedRoutes = sortRoutesByOrder(adminRoutes);

  // Buscar específicamente la ruta de Servicios Auditores
  const auditorServicesRoute = sortedRoutes.find(route => route.path === '/auditor-services');

  return (
    <BaseLayout title="Test Sidebar - Administrador">
      <div className="space-y-6">
        <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Test de Rutas de Administrador
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Total de Rutas: {sortedRoutes.length}
              </h3>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Verificación de Servicios Auditores
              </h3>
              <div className="bg-gray-50 dark:bg-darkmode-700 p-4 rounded-lg">
                {auditorServicesRoute ? (
                  <div className="text-green-600 dark:text-green-400">
                    <p className="font-bold">✅ Servicios Auditores ENCONTRADO</p>
                    <p><strong>Ruta:</strong> {auditorServicesRoute.path}</p>
                    <p><strong>Título:</strong> {auditorServicesRoute.title}</p>
                    <p><strong>Icono:</strong> {auditorServicesRoute.icon}</p>
                    <p><strong>Orden:</strong> {auditorServicesRoute.order}</p>
                    <p><strong>Subrutas:</strong> {auditorServicesRoute.children?.length || 0}</p>
                    
                    {auditorServicesRoute.children && (
                      <div className="mt-2 ml-4">
                        <p className="font-semibold">Subrutas:</p>
                        {auditorServicesRoute.children.map((child, index) => (
                          <div key={index} className="ml-4 p-2 bg-white dark:bg-darkmode-600 rounded border">
                            <p><strong>{child.title}</strong></p>
                            <p>Ruta: {child.path}</p>
                            <p>Icono: {child.icon}</p>
                            <p>Orden: {child.order}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-600 dark:text-red-400">
                    <p className="font-bold">❌ Servicios Auditores NO ENCONTRADO</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Todas las Rutas de Administrador
              </h3>
              <div className="bg-gray-50 dark:bg-darkmode-700 p-4 rounded-lg max-h-96 overflow-y-auto">
                {sortedRoutes.map((route, index) => (
                  <div key={index} className="mb-3 p-3 bg-white dark:bg-darkmode-600 rounded border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{route.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ruta: {route.path}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Orden: {route.order}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Icono: {route.icon}</p>
                        {route.children && (
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            Subrutas: {route.children.length}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {route.children && (
                      <div className="mt-2 ml-4">
                        {route.children.map((child, childIndex) => (
                          <div key={childIndex} className="p-2 bg-gray-100 dark:bg-darkmode-500 rounded text-sm">
                            <p><strong>{child.title}</strong> ({child.path})</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}; 