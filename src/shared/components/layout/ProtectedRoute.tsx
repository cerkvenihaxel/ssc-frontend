import React from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../presentation/contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  requireAll?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredPermissions = [],
  requireAll = false,
}) => {
  const { user, loading, isAuthenticated, hasPermission, hasAnyPermission } = useAuth();

  console.log('🛡️ ProtectedRoute - Evaluando permisos:', {
    isAuthenticated,
    user: user ? { email: user.email, role: user.role.name } : null,
    requiredPermission,
    requiredPermissions,
    requireAll,
    userPermissions: user?.permissions
  });

  if (loading) {
    console.log('⏳ ProtectedRoute - Usuario cargando...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🚫 ProtectedRoute - Usuario no autenticado, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }

  // Check single permission
  if (requiredPermission) {
    const hasRequiredPermission = hasPermission(requiredPermission);
    console.log(`🔑 ProtectedRoute - Verificando permiso "${requiredPermission}":`, hasRequiredPermission);
    
    if (!hasRequiredPermission) {
      console.log('❌ ProtectedRoute - Permiso denegado, redirigiendo a /unauthorized');
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check multiple permissions
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? requiredPermissions.every(permission => hasPermission(permission))
      : hasAnyPermission(requiredPermissions);

    console.log(`🔑 ProtectedRoute - Verificando permisos múltiples [${requiredPermissions.join(', ')}]:`, hasRequiredPermissions);
    console.log(`📋 Modo requireAll:`, requireAll);

    if (!hasRequiredPermissions) {
      console.log('❌ ProtectedRoute - Permisos múltiples denegados, redirigiendo a /unauthorized');
      return <Navigate to="/unauthorized" replace />;
    }
  }

  console.log('✅ ProtectedRoute - Acceso autorizado, mostrando contenido');
  return <>{children}</>;
};

export default ProtectedRoute; 