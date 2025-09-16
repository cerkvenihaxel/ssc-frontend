import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../../shared/components/ui/Button';

const UnauthorizedPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-theme-1 to-theme-2 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow-xl p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-warning/10 mb-6">
              <Shield className="h-8 w-8 text-warning" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Acceso no autorizado
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
              No tienes permisos para acceder a esta sección del sistema.
            </p>
            {user && (
              <p className="mt-4 text-sm text-gray-500 dark:text-slate-500">
                Rol actual: <span className="font-medium">{user.role.name}</span>
              </p>
            )}
            <div className="mt-6">
              <Button
                as="a"
                href={user?.defaultRoute || '/'}
                variant="primary"
                className="inline-flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inicio
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage; 