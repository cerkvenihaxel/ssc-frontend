import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getAvailableRoutesForRole, sortRoutesByOrder } from '../../../shared/config/routeConfig';
import BaseLayout from '../../../shared/components/layout/BaseLayout';

export const DebugSidebarPage: React.FC = () => {
  const { user } = useAuth();

  const roleName = user?.role.name || 'Administrador';
  const routes = getAvailableRoutesForRole(roleName);
  const sortedRoutes = sortRoutesByOrder(routes);

  return (
    <BaseLayout title="Debug Sidebar">
      <div className="space-y-6">
        <div className="bg-white dark:bg-darkmode-600 rounded-xl shadow-sm border border-gray-200 dark:border-darkmode-400 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Información de Debug del Sidebar
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Información del Usuario
              </h3>
              <div className="bg-gray-50 dark:bg-darkmode-700 p-4 rounded-lg">
                <p><strong>Nombre:</strong> {user?.nombre}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Rol:</strong> {user?.role.name}</p>
                <p><strong>Rol ID:</strong> {user?.role.id}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Rutas Disponibles para el Rol: "{roleName}"
              </h3>
              <div className="bg-gray-50 dark:bg-darkmode-700 p-4 rounded-lg">
                <p><strong>Total de rutas:</strong> {sortedRoutes.length}</p>
                <div className="mt-2">
                  {sortedRoutes.map((route, index) => (
                    <div key={index} className="mb-2 p-2 bg-white dark:bg-darkmode-600 rounded border">
                      <p><strong>Ruta:</strong> {route.path}</p>
                      <p><strong>Título:</strong> {route.title}</p>
                      <p><strong>Icono:</strong> {route.icon}</p>
                      <p><strong>Orden:</strong> {route.order}</p>
                      {route.children && (
                        <div className="ml-4 mt-2">
                          <p><strong>Subrutas ({route.children.length}):</strong></p>
                          {route.children.map((child, childIndex) => (
                            <div key={childIndex} className="ml-4 p-1 bg-gray-100 dark:bg-darkmode-500 rounded">
                              <p>• {child.title} ({child.path})</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Configuración de ROUTE_CONFIG
              </h3>
              <div className="bg-gray-50 dark:bg-darkmode-700 p-4 rounded-lg">
                <p><strong>Roles disponibles:</strong></p>
                <ul className="list-disc list-inside ml-4">
                  <li>Administrador</li>
                  <li>Auditor</li>
                  <li>Proveedor</li>
                  <li>Efector</li>
                  <li>Médico</li>
                  <li>Afiliado</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Verificar Servicios Auditores
              </h3>
              <div className="bg-gray-50 dark:bg-darkmode-700 p-4 rounded-lg">
                {sortedRoutes.find(route => route.path === '/auditor-services') ? (
                  <div className="text-green-600 dark:text-green-400">
                    ✅ Sección "Servicios Auditores" encontrada en las rutas
                    <div className="mt-2 ml-4">
                      {sortedRoutes.find(route => route.path === '/auditor-services')?.children?.map((child, index) => (
                        <div key={index} className="text-sm">
                          • {child.title} ({child.path})
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-red-600 dark:text-red-400">
                    ❌ Sección "Servicios Auditores" NO encontrada en las rutas
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}; 