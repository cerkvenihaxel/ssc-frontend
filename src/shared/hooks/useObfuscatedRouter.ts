import { useNavigate, useParams } from 'react-router-dom';
import { useMemo, useCallback } from 'react';
import { IdObfuscator, parseObfuscatedRoute } from '../utils/idObfuscator';

export interface ObfuscatedRouterOptions {
  method?: 'base64' | 'encrypt' | 'checksum' | 'timeBased';
  paramName?: string;
  onInvalidId?: (obfuscatedId: string, error: any) => void;
}

/**
 * Hook personalizado para manejar rutas con IDs ofuscados
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { id, isValidId, navigateWithId } = useObfuscatedRouter();
 *   
 *   const handleNavigateToDetails = (userId: string) => {
 *     navigateWithId(`/users/${userId}/details`, userId);
 *   };
 *   
 *   if (!isValidId) {
 *     return <div>ID inválido</div>;
 *   }
 *   
 *   return <div>Usuario ID: {id}</div>;
 * };
 * ```
 */
export const useObfuscatedRouter = (options: ObfuscatedRouterOptions = {}) => {
  const navigate = useNavigate();
  const params = useParams();
  const {
    method = 'checksum',
    paramName = 'id',
    onInvalidId
  } = options;

  // Extraer y deofuscar el ID del parámetro de ruta
  const { id, isValidId, wasObfuscated } = useMemo(() => {
    const obfuscatedId = params[paramName];
    
    if (!obfuscatedId) {
      return { id: null, isValidId: false, wasObfuscated: false };
    }

    try {
      const result = IdObfuscator.smartDeobfuscate(obfuscatedId, { method });
      
      if (!result.isValid && onInvalidId) {
        onInvalidId(obfuscatedId, new Error('Invalid obfuscated ID'));
      }
      
      return {
        id: result.id,
        isValidId: result.isValid,
        wasObfuscated: result.wasObfuscated
      };
    } catch (error) {
      console.error('Error deobfuscating ID:', error);
      if (onInvalidId) {
        onInvalidId(obfuscatedId, error);
      }
      return { id: obfuscatedId, isValidId: false, wasObfuscated: false };
    }
  }, [params, paramName, method, onInvalidId]);

  // Función para navegar con ID ofuscado
  const navigateWithId = useCallback((basePath: string, targetId: string, navigateOptions?: any) => {
    const obfuscatedId = IdObfuscator.smartObfuscate(targetId, { method });
    const path = basePath.replace(`:${paramName}`, obfuscatedId);
    navigate(path, navigateOptions);
  }, [navigate, method, paramName]);

  // Función para generar rutas ofuscadas sin navegar
  const generateObfuscatedRoute = useCallback((basePath: string, targetId: string): string => {
    const obfuscatedId = IdObfuscator.smartObfuscate(targetId, { method });
    return basePath.replace(`:${paramName}`, obfuscatedId);
  }, [method, paramName]);

  // Función para ofuscar un ID manualmente
  const obfuscateId = useCallback((targetId: string): string => {
    return IdObfuscator.smartObfuscate(targetId, { method });
  }, [method]);

  // Función para deofuscar un ID manualmente
  const deobfuscateId = useCallback((obfuscatedId: string): { id: string; isValid: boolean } => {
    const result = IdObfuscator.smartDeobfuscate(obfuscatedId, { method });
    return { id: result.id, isValid: result.isValid };
  }, [method]);

  return {
    // ID deofuscado actual
    id,
    // Si el ID es válido
    isValidId,
    // Si el ID fue ofuscado originalmente
    wasObfuscated,
    // Función para navegar con ofuscación automática
    navigateWithId,
    // Función para generar rutas ofuscadas
    generateObfuscatedRoute,
    // Funciones de utilidad
    obfuscateId,
    deobfuscateId,
    // Datos raw
    rawParams: params
  };
};

/**
 * Hook para validación estricta de IDs obfuscados
 * Lanza errores si el ID no es válido
 */
export const useStrictObfuscatedId = (options: ObfuscatedRouterOptions = {}) => {
  const { paramName = 'id' } = options;
  const result = useObfuscatedRouter(options);

  if (!result.id || !result.isValidId) {
    throw new Error(`Invalid or missing ${paramName} parameter`);
  }

  return {
    ...result,
    id: result.id as string // Type assertion since we validated it's not null
  };
};

/**
 * Hook para manejar múltiples parámetros obfuscados
 */
export const useMultipleObfuscatedParams = (paramConfig: Record<string, ObfuscatedRouterOptions>) => {
  const params = useParams();
  const navigate = useNavigate();

  const results = useMemo(() => {
    const output: Record<string, { id: string | null; isValid: boolean; wasObfuscated: boolean }> = {};

    Object.entries(paramConfig).forEach(([paramName, config]) => {
      const obfuscatedId = params[paramName];
      
      if (!obfuscatedId) {
        output[paramName] = { id: null, isValid: false, wasObfuscated: false };
        return;
      }

      try {
        const result = IdObfuscator.smartDeobfuscate(obfuscatedId, config);
        output[paramName] = {
          id: result.id,
          isValid: result.isValid,
          wasObfuscated: result.wasObfuscated
        };
      } catch (error) {
        console.error(`Error deobfuscating ${paramName}:`, error);
        output[paramName] = { id: obfuscatedId, isValid: false, wasObfuscated: false };
      }
    });

    return output;
  }, [params, paramConfig]);

  const navigateWithIds = useCallback((path: string, ids: Record<string, string>, navigateOptions?: any) => {
    let finalPath = path;
    
    Object.entries(ids).forEach(([paramName, id]) => {
      const config = paramConfig[paramName] || {};
      const obfuscatedId = IdObfuscator.smartObfuscate(id, config);
      finalPath = finalPath.replace(`:${paramName}`, obfuscatedId);
    });
    
    navigate(finalPath, navigateOptions);
  }, [navigate, paramConfig]);

  return {
    params: results,
    navigateWithIds,
    allValid: Object.values(results).every(r => r.isValid)
  };
}; 