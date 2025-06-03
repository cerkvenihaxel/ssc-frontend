import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './presentation/contexts/AuthContext';
import { ToastProvider } from './shared/components/ui/ToastContainer';
import { ObfuscationProvider } from './shared/contexts/ObfuscationContext';
import { ObfuscatedRouter } from './shared/components/routing/ObfuscatedRouter';
import ProtectedRoute from './shared/components/layout/ProtectedRoute';
import { PERMISSIONS } from './domain/constants/permissions';

// Auth pages
import LoginPage from './presentation/pages/auth/LoginPage';
import MagicLinkVerifyPage from './presentation/pages/auth/MagicLinkVerifyPage';
import UnauthorizedPage from './presentation/pages/UnauthorizedPage';
import RedirectToUserHome from './presentation/pages/RedirectToUserHome';

// Admin pages
import AdminDashboard from './presentation/pages/admin/AdminDashboard';
import UserListPage from './presentation/pages/admin/users/UserListPage';
import CreateUserPage from './presentation/pages/admin/users/CreateUserPage';
import UserDetailsPage from './presentation/pages/admin/users/UserDetailsPage';
import EditUserPage from './presentation/pages/admin/users/EditUserPage';
import UserStatsPage from './presentation/pages/admin/users/UserStatsPage';
import ProvidersPage from './presentation/pages/admin/users/ProvidersPage';
import CreateProviderPage from './presentation/pages/admin/users/CreateProviderPage';
import RequestListPage from './presentation/pages/admin/requests/RequestListPage';
import AnalyticsPage from './presentation/pages/admin/analytics/AnalyticsPage';
import SettingsPage from './presentation/pages/admin/settings/SettingsPage';
import ProviderDetailsPage from './presentation/pages/admin/users/ProviderDetailsPage';
import ProviderEditPage from './presentation/pages/admin/users/ProviderEditPage';
import AuditorsPage from './presentation/pages/admin/users/AuditorsPage';
import AuditorDetailsPage from './presentation/pages/admin/users/AuditorDetailsPage';
import AuditorEditPage from './presentation/pages/admin/users/AuditorEditPage';
import AuditorCreatePage from './presentation/pages/admin/users/AuditorCreatePage';
import EffectorsPage from './presentation/pages/admin/users/EffectorsPage';
import EffectorDetailsPage from './presentation/pages/admin/users/EffectorDetailsPage';
import EffectorEditPage from './presentation/pages/admin/users/EffectorEditPage';
import EffectorCreatePage from './presentation/pages/admin/users/EffectorCreatePage';
import EspecialidadesPage from './presentation/pages/admin/healthcare/EspecialidadesPage';
import EspecialidadCreatePage from './presentation/pages/admin/healthcare/EspecialidadCreatePage';
import EspecialidadDetailsPage from './presentation/pages/admin/healthcare/EspecialidadDetailsPage';
import EspecialidadEditPage from './presentation/pages/admin/healthcare/EspecialidadEditPage';
import ObrasSocialesPage from './presentation/pages/admin/healthcare/ObrasSocialesPage';
import ObraSocialCreatePage from './presentation/pages/admin/healthcare/ObraSocialCreatePage';
import ObraSocialDetailsPage from './presentation/pages/admin/healthcare/ObraSocialDetailsPage';
import ObraSocialEditPage from './presentation/pages/admin/healthcare/ObraSocialEditPage';
import AfiliadosPage from './presentation/pages/admin/healthcare/AfiliadosPage';
import AfiliadoCreatePage from './presentation/pages/admin/healthcare/AfiliadoCreatePage';
import AfiliadoDetailsPage from './presentation/pages/admin/healthcare/AfiliadoDetailsPage';
import AfiliadoEditPage from './presentation/pages/admin/healthcare/AfiliadoEditPage';
import MedicosPage from './presentation/pages/admin/healthcare/MedicosPage';
import MedicoCreatePage from './presentation/pages/admin/healthcare/MedicoCreatePage';
import MedicoDetailsPage from './presentation/pages/admin/healthcare/MedicoDetailsPage';
import MedicoEditPage from './presentation/pages/admin/healthcare/MedicoEditPage';

// Depósito pages
import ArticulosPage from './presentation/pages/admin/deposito/ArticulosPage';
import ArticuloCreatePage from './presentation/pages/admin/deposito/ArticuloCreatePage';
import ArticuloDetailsPage from './presentation/pages/admin/deposito/ArticuloDetailsPage';
import ArticuloEditPage from './presentation/pages/admin/deposito/ArticuloEditPage';
import GruposPage from './presentation/pages/admin/deposito/GruposPage';
import GrupoCreatePage from './presentation/pages/admin/deposito/GrupoCreatePage';
import GrupoDetailsPage from './presentation/pages/admin/deposito/GrupoDetailsPage';
import GrupoEditPage from './presentation/pages/admin/deposito/GrupoEditPage';

// Placeholder components for other roles
const AuditorDashboard = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Auditor</h1>
      <p className="text-gray-600">Panel de auditoría - En desarrollo</p>
    </div>
  </div>
);

const EffectorDashboard = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Efector</h1>
      <p className="text-gray-600">Panel de efectores - En desarrollo</p>
    </div>
  </div>
);

const ProveedorDashboard = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Proveedor</h1>
      <p className="text-gray-600">Panel de proveedores - En desarrollo</p>
    </div>
  </div>
);

const MedicoDashboard = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Médico</h1>
      <p className="text-gray-600">Panel médico - En desarrollo</p>
    </div>
  </div>
);

const AfiliadoDashboard = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Afiliado</h1>
      <p className="text-gray-600">Panel de afiliados - En desarrollo</p>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <ObfuscationProvider>
          <Router>
            <ObfuscatedRouter>
              <div className="App">
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/auth/verify" element={<MagicLinkVerifyPage />} />
                  <Route path="/unauthorized" element={<UnauthorizedPage />} />

                  {/* Protected routes - Admin */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute requiredPermission={PERMISSIONS.ADMIN_ACCESS}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute requiredPermission={PERMISSIONS.ADMIN_ACCESS}>
                        <UserListPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users/create"
                    element={
                      <ProtectedRoute requiredPermission={PERMISSIONS.CREATE_USERS}>
                        <CreateUserPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users/stats"
                    element={
                      <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_ANALYTICS}>
                        <UserStatsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users/providers"
                    element={
                      <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_ALL_USERS}>
                        <ProvidersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users/providers/create"
                    element={
                      <ProtectedRoute requiredPermission={PERMISSIONS.CREATE_USERS}>
                        <CreateProviderPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users/providers/:id"
                    element={
                      <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_ALL_USERS}>
                        <ProviderDetailsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users/providers/:id/edit"
                    element={
                      <ProtectedRoute requiredPermission={PERMISSIONS.UPDATE_USERS}>
                        <ProviderEditPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users/auditors"
                    element={
                      <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_ALL_USERS}>
                        <AuditorsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users/auditors/create"
                    element={
                      <ProtectedRoute requiredPermission={PERMISSIONS.CREATE_USERS}>
                        <AuditorCreatePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users/auditors/:id"
                    element={
                      <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_ALL_USERS}>
                        <AuditorDetailsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users/auditors/:id/edit"
                    element={
                      <ProtectedRoute requiredPermission={PERMISSIONS.UPDATE_USERS}>
                        <AuditorEditPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users/effectors"
                    element={
                      <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_ALL_USERS}>
                        <EffectorsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users/effectors/create"
                    element={
                      <ProtectedRoute requiredPermission={PERMISSIONS.CREATE_USERS}>
                        <EffectorCreatePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users/effectors/:id"
                    element={
                      <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_ALL_USERS}>
                        <EffectorDetailsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users/effectors/:id/edit"
                    element={
                      <ProtectedRoute requiredPermission={PERMISSIONS.UPDATE_USERS}>
                        <EffectorEditPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users/:id"
                    element={
                      <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_ALL_USERS}>
                        <UserDetailsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users/:id/edit"
                    element={
                      <ProtectedRoute requiredPermission={PERMISSIONS.UPDATE_USERS}>
                        <EditUserPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/requests"
                    element={
                      <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_ALL_REQUESTS}>
                        <RequestListPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/analytics"
                    element={
                      <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_ANALYTICS}>
                        <AnalyticsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/settings"
                    element={
                      <ProtectedRoute requiredPermission={PERMISSIONS.ADMIN_ACCESS}>
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected routes - Auditor */}
                  <Route
                    path="/auditor/requests"
                    element={
                      <ProtectedRoute requiredPermission={PERMISSIONS.AUDIT_REQUESTS}>
                        <AuditorDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected routes - Efector */}
                  <Route
                    path="/efector/requests"
                    element={
                      <ProtectedRoute requiredPermission={PERMISSIONS.CREATE_REQUESTS}>
                        <EffectorDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected routes - Proveedor */}
                  <Route
                    path="/proveedor/quotations"
                    element={
                      <ProtectedRoute requiredPermission={PERMISSIONS.CREATE_QUOTATIONS}>
                        <ProveedorDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected routes - Médico */}
                  <Route
                    path="/medico/solicitudes"
                    element={
                      <ProtectedRoute requiredPermission={PERMISSIONS.CREATE_REQUESTS}>
                        <MedicoDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected routes - Afiliado */}
                  <Route
                    path="/afiliado/profile"
                    element={
                      <ProtectedRoute>
                        <AfiliadoDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Healthcare Management Routes - Especialidades */}
                  <Route path="/admin/healthcare/especialidades" element={<EspecialidadesPage />} />
                  <Route path="/admin/healthcare/especialidades/create" element={<EspecialidadCreatePage />} />
                  <Route path="/admin/healthcare/especialidades/:id" element={<EspecialidadDetailsPage />} />
                  <Route path="/admin/healthcare/especialidades/:id/edit" element={<EspecialidadEditPage />} />

                  {/* Healthcare Management Routes - Obras Sociales */}
                  <Route path="/admin/healthcare/obras-sociales" element={<ObrasSocialesPage />} />
                  <Route path="/admin/healthcare/obras-sociales/create" element={<ObraSocialCreatePage />} />
                  <Route path="/admin/healthcare/obras-sociales/:id" element={<ObraSocialDetailsPage />} />
                  <Route path="/admin/healthcare/obras-sociales/:id/edit" element={<ObraSocialEditPage />} />

                  {/* Healthcare Management Routes - Afiliados */}
                  <Route path="/admin/healthcare/afiliados" element={<AfiliadosPage />} />
                  <Route path="/admin/healthcare/afiliados/create" element={<AfiliadoCreatePage />} />
                  <Route path="/admin/healthcare/afiliados/:id" element={<AfiliadoDetailsPage />} />
                  <Route path="/admin/healthcare/afiliados/:id/edit" element={<AfiliadoEditPage />} />

                  {/* Healthcare Management Routes - Médicos */}
                  <Route path="/admin/healthcare/medicos" element={<MedicosPage />} />
                  <Route path="/admin/healthcare/medicos/create" element={<MedicoCreatePage />} />
                  <Route path="/admin/healthcare/medicos/:id" element={<MedicoDetailsPage />} />
                  <Route path="/admin/healthcare/medicos/:id/edit" element={<MedicoEditPage />} />

                  {/* Depósito pages */}
                  <Route path="/admin/deposito/articulos" element={<ArticulosPage />} />
                  <Route path="/admin/deposito/articulos/create" element={<ArticuloCreatePage />} />
                  <Route path="/admin/deposito/articulos/:id" element={<ArticuloDetailsPage />} />
                  <Route path="/admin/deposito/articulos/:id/edit" element={<ArticuloEditPage />} />
                  <Route path="/admin/deposito/grupos" element={<GruposPage />} />
                  <Route path="/admin/deposito/grupos/create" element={<GrupoCreatePage />} />
                  <Route path="/admin/deposito/grupos/:id" element={<GrupoDetailsPage />} />
                  <Route path="/admin/deposito/grupos/:id/edit" element={<GrupoEditPage />} />

                  {/* Default route - redirect to user's home */}
                  <Route path="/" element={<RedirectToUserHome />} />

                  {/* Catch all route */}
                  <Route path="*" element={<RedirectToUserHome />} />
                </Routes>
              </div>
            </ObfuscatedRouter>
          </Router>
        </ObfuscationProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
