import React, { useState } from 'react';
import { Eye, EyeOff, Shield, ShieldOff, Settings, Info } from 'lucide-react';
import { useObfuscation } from '../../contexts/ObfuscationContext';
import Button from './Button';

interface ObfuscationControlsProps {
  showDebugInfo?: boolean;
  position?: 'fixed' | 'relative';
  className?: string;
}

/**
 * Componente de control de ofuscación para desarrollo y debugging
 */
export const ObfuscationControls: React.FC<ObfuscationControlsProps> = ({
  showDebugInfo = false,
  position = 'fixed',
  className = ''
}) => {
  const { 
    isEnabled, 
    setEnabled, 
    config, 
    updateConfig,
    obfuscateUrl,
    deobfuscateUrl,
    isObfuscated 
  } = useObfuscation();
  
  const [showDetails, setShowDetails] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const currentUrl = window.location.pathname;
  const isCurrentObfuscated = isObfuscated(currentUrl);
  const realUrl = deobfuscateUrl(currentUrl);
  const obfuscatedUrl = obfuscateUrl(currentUrl);

  const baseClasses = position === 'fixed' 
    ? 'fixed bottom-4 right-4 z-50' 
    : 'relative';

  return (
    <div className={`${baseClasses} ${className}`}>
      <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow-lg border border-gray-200 dark:border-darkmode-400 p-4 min-w-80">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {isEnabled ? (
              <Shield className="w-5 h-5 text-green-600" />
            ) : (
              <ShieldOff className="w-5 h-5 text-red-600" />
            )}
            <span className="font-medium text-gray-900 dark:text-white">
              Ofuscación {isEnabled ? 'Activa' : 'Desactivada'}
            </span>
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-darkmode-700 rounded"
              title="Mostrar detalles"
            >
              <Info className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-darkmode-700 rounded"
              title="Configuración"
            >
              <Settings className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Toggle Button */}
        <div className="mb-3">
          <Button
            onClick={() => setEnabled(!isEnabled)}
            variant={isEnabled ? 'danger' : 'success'}
            size="sm"
            className="w-full"
          >
            {isEnabled ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Desactivar Ofuscación
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Activar Ofuscación
              </>
            )}
          </Button>
        </div>

        {/* Current URL Status */}
        <div className="text-xs text-gray-600 dark:text-slate-400 space-y-1">
          <div className="flex items-center justify-between">
            <span>URL actual:</span>
            <span className={isCurrentObfuscated ? 'text-green-600' : 'text-gray-500'}>
              {isCurrentObfuscated ? 'Ofuscada' : 'Normal'}
            </span>
          </div>
          
          {isEnabled && (
            <div className="font-mono text-xs bg-gray-50 dark:bg-darkmode-700 p-2 rounded break-all">
              <div className="text-gray-500">Mostrada:</div>
              <div className="text-blue-600">{obfuscatedUrl}</div>
              <div className="text-gray-500 mt-1">Real:</div>
              <div className="text-green-600">{realUrl}</div>
            </div>
          )}
        </div>

        {/* Debug Info */}
        {showDetails && showDebugInfo && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-darkmode-400">
            <div className="text-xs space-y-2">
              <div>
                <span className="font-medium">Método:</span> {config.method}
              </div>
              <div>
                <span className="font-medium">Endpoints monitoreados:</span>
                <div className="font-mono text-xs bg-gray-50 dark:bg-darkmode-700 p-2 rounded mt-1">
                  {config.endpoints.patterns.map((pattern, i) => (
                    <div key={i} className="text-gray-600 dark:text-slate-400">
                      {pattern}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Configuration */}
        {showConfig && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-darkmode-400">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Método de Ofuscación
                </label>
                <select
                  value={config.method}
                  onChange={(e) => updateConfig({ 
                    method: e.target.value as 'base64' | 'encrypt' | 'checksum' | 'timeBased'
                  })}
                  className="w-full text-xs px-2 py-1 border border-gray-300 dark:border-darkmode-400 rounded dark:bg-darkmode-800 dark:text-white"
                >
                  <option value="base64">Base64</option>
                  <option value="encrypt">Encriptación</option>
                  <option value="checksum">Checksum</option>
                  <option value="timeBased">Basado en tiempo</option>
                </select>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => updateConfig({ enabled: true })}
                  variant="outline-primary"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  Aplicar
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline-secondary"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  Recargar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Version minimalista para producción
 */
export const ObfuscationStatus: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isEnabled } = useObfuscation();
  
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {isEnabled ? (
        <Shield className="w-4 h-4 text-green-600" />
      ) : (
        <ShieldOff className="w-4 h-4 text-gray-400" />
      )}
      <span className="text-xs text-gray-500">
        {isEnabled ? 'Seguro' : 'Dev'}
      </span>
    </div>
  );
};

export default ObfuscationControls; 