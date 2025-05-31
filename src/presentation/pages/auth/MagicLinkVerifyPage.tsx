import React, { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';

const MagicLinkVerifyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const { verifyMagicLink, user } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    
    // Debug: mostrar información del token
    console.log('🔍 DEBUG - Token recibido:', token);
    console.log('🔍 DEBUG - URL completa:', window.location.href);
    console.log('🔍 DEBUG - SearchParams:', Object.fromEntries(searchParams.entries()));
    
    setDebugInfo(`Token: ${token?.substring(0, 20)}...`);
    
    if (!token) {
      setStatus('error');
      setErrorMessage('Token de verificación no encontrado en la URL');
      console.error('❌ No se encontró token en la URL');
      return;
    }

    const verify = async () => {
      try {
        console.log('🚀 Enviando token para verificación...');
        const result = await verifyMagicLink(token);
        console.log('✅ Verificación exitosa:', result);
        setStatus('success');
      } catch (error) {
        console.error('❌ Error en verificación:', error);
        setStatus('error');
        
        // Mejorar el manejo de errores
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
          setErrorMessage(String(error.message));
        } else {
          setErrorMessage('Error desconocido al verificar el enlace');
        }
      }
    };

    verify();
  }, [searchParams, verifyMagicLink]);

  // Redirect to user's default route after successful verification
  if (status === 'success' && user) {
    console.log('🎯 Redirigiendo a:', user.defaultRoute);
    return <Navigate to={user.defaultRoute} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-theme-1 to-theme-2 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow-xl p-8">
          <div className="text-center">
            {status === 'loading' && (
              <>
                <LoadingSpinner size="lg" className="mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Verificando acceso...
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                  Por favor espera mientras verificamos tu enlace de acceso.
                </p>
                <p className="mt-4 text-xs text-gray-500 dark:text-slate-500">
                  {debugInfo}
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-success/10 mb-6">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  ¡Acceso verificado!
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                  Redirigiendo al sistema...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-danger/10 mb-6">
                  <XCircle className="h-8 w-8 text-danger" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Error de verificación
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                  {errorMessage}
                </p>
                <p className="mt-4 text-xs text-gray-500 dark:text-slate-500 break-all">
                  Debug: {debugInfo}
                </p>
                <div className="mt-6 space-y-2">
                  <a
                    href="/login"
                    className="block text-primary hover:text-primary/80 font-medium"
                  >
                    Volver al inicio de sesión
                  </a>
                  <button
                    onClick={() => window.location.reload()}
                    className="block text-sm text-gray-500 hover:text-gray-700 mx-auto"
                  >
                    Intentar nuevamente
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MagicLinkVerifyPage; 