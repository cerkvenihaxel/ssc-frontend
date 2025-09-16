import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { ApiClient } from '../../infrastructure/http/ApiClient';
import { ObfuscatedApiClient } from '../../infrastructure/http/ObfuscatedApiClient';
import type { GlobalObfuscationConfig } from '../../infrastructure/http/ObfuscatedApiClient';
import { IdObfuscator } from '../utils/idObfuscator';

interface ObfuscationContextType {
  obfuscatedApiClient: ObfuscatedApiClient;
  originalApiClient: ApiClient;
  config: GlobalObfuscationConfig;
  // Método para ofuscar URLs para uso en navegación
  obfuscateUrl: (url: string) => string;
  // Método para deofuscar URLs
  deobfuscateUrl: (url: string) => string;
  // Método para actualizar configuración
  updateConfig: (config: Partial<GlobalObfuscationConfig>) => void;
  // Método para verificar si una URL está ofuscada
  isObfuscated: (url: string) => boolean;
  // Estado de la ofuscación
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

const ObfuscationContext = createContext<ObfuscationContextType | undefined>(undefined);

interface ObfuscationProviderProps {
  children: React.ReactNode;
  initialConfig?: Partial<GlobalObfuscationConfig>;
}

export const ObfuscationProvider: React.FC<ObfuscationProviderProps> = ({ 
  children, 
  initialConfig = {} 
}) => {
  const [isEnabled, setIsEnabledState] = useState(true); // Empezar habilitado por defecto
  
  // Crear cliente API original
  const originalApiClient = useMemo(() => new ApiClient(), []);
  
  // Configuración con valores por defecto
  const [config, setConfig] = useState<GlobalObfuscationConfig>(() => {
    const defaultConfig = {
      enabled: true,
      method: 'checksum' as const,
      endpoints: {
        patterns: [
          '/v1/admin/users/:id',
          '/v1/admin/users/providers/:id',
          '/v1/admin/users/effectors/:id',
          '/v1/admin/users/auditors/:id',
          '/v1/proveedores/:id',
          '/v1/effectors/:id',
          '/v1/auditors/:id',
          '/v1/especialidades/:id'
        ],
        exclude: ['/login', '/auth', '/v1/auth']
      },
      idParameters: ['id']
    };
    const mergedConfig = { ...defaultConfig, ...initialConfig };
    console.log('[ObfuscationProvider] Initial config:', mergedConfig);
    return mergedConfig;
  });

  // Crear cliente API ofuscado con configuración actualizada
  const obfuscatedApiClient = useMemo(() => {
    console.log('[ObfuscationProvider] Creating obfuscated client with config:', config);
    return new ObfuscatedApiClient(originalApiClient, config);
  }, [originalApiClient, config]);

  const obfuscateUrl = (url: string): string => {
    if (!isEnabled) {
      console.log(`[ObfuscationProvider] Obfuscation disabled, returning original URL: ${url}`);
      return url;
    }
    const result = obfuscatedApiClient.createObfuscatedUrl(url);
    console.log(`[ObfuscationProvider] obfuscateUrl: ${url} -> ${result}`);
    return result;
  };

  const deobfuscateUrl = (url: string): string => {
    const result = obfuscatedApiClient.getRealUrl(url);
    console.log(`[ObfuscationProvider] deobfuscateUrl: ${url} -> ${result}`);
    return result;
  };

  const updateConfig = (newConfig: Partial<GlobalObfuscationConfig>): void => {
    console.log('[ObfuscationProvider] Updating config:', newConfig);
    setConfig(prev => {
      const updated = { ...prev, ...newConfig };
      console.log('[ObfuscationProvider] New config:', updated);
      return updated;
    });
    obfuscatedApiClient.updateConfig(newConfig);
  };

  const isObfuscated = (url: string): boolean => {
    // Verificar si la URL contiene IDs ofuscados en lugar de UUIDs
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi;
    const hasUUIDs = uuidRegex.test(url);
    const result = !hasUUIDs && (url.includes('_') || url.includes('-') || url.includes('+'));
    console.log(`[ObfuscationProvider] isObfuscated check for ${url}: hasUUIDs=${hasUUIDs}, result=${result}`);
    return result;
  };

  // Log del estado actual
  useEffect(() => {
    console.log('[ObfuscationProvider] State changed:', {
      isEnabled,
      config,
      hasObfuscatedClient: !!obfuscatedApiClient
    });
  }, [isEnabled, config, obfuscatedApiClient]);

  const setEnabled = (enabled: boolean): void => {
    console.log(`[ObfuscationProvider] Setting enabled: ${enabled}`);
    setIsEnabledState(enabled);
    updateConfig({ enabled });
  };

  const contextValue: ObfuscationContextType = {
    obfuscatedApiClient,
    originalApiClient,
    config,
    obfuscateUrl,
    deobfuscateUrl,
    updateConfig,
    isObfuscated,
    isEnabled,
    setEnabled,
  };

  return (
    <ObfuscationContext.Provider value={contextValue}>
      {children}
    </ObfuscationContext.Provider>
  );
};

export const useObfuscation = (): ObfuscationContextType => {
  const context = useContext(ObfuscationContext);
  if (!context) {
    throw new Error('useObfuscation must be used within an ObfuscationProvider');
  }
  return context;
};

// Hook personalizado para obtener el cliente API ofuscado
export const useObfuscatedApi = () => {
  const { obfuscatedApiClient } = useObfuscation();
  return obfuscatedApiClient;
};

// Hook personalizado para navegación ofuscada
export const useObfuscatedNavigation = () => {
  const { obfuscateUrl, deobfuscateUrl, isObfuscated } = useObfuscation();
  
  const navigate = (url: string) => {
    const obfuscatedUrl = obfuscateUrl(url);
    window.history.pushState({}, '', obfuscatedUrl);
  };

  const getCurrentRealUrl = (): string => {
    return deobfuscateUrl(window.location.pathname);
  };

  const getCurrentObfuscatedUrl = (): string => {
    return window.location.pathname;
  };

  return {
    navigate,
    obfuscateUrl,
    deobfuscateUrl,
    isObfuscated,
    getCurrentRealUrl,
    getCurrentObfuscatedUrl,
  };
}; 