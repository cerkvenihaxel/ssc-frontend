import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useObfuscation } from '../../contexts/ObfuscationContext';

interface ObfuscatedRouterProps {
  children: React.ReactNode;
}

/**
 * Router wrapper que maneja automáticamente la ofuscación de URLs
 * Se encarga de:
 * 1. Interceptar cambios de ruta
 * 2. Ofuscar UUIDs en URLs para mostrar al usuario
 * 3. Deofuscar URLs antes de procesar las rutas
 */
export const ObfuscatedRouter: React.FC<ObfuscatedRouterProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { obfuscateUrl, deobfuscateUrl, isObfuscated, isEnabled } = useObfuscation();

  useEffect(() => {
    if (!isEnabled) return;

    const currentPath = location.pathname;
    
    console.log(`[ObfuscatedRouter] Current path: ${currentPath}`);
    console.log(`[ObfuscatedRouter] Is obfuscated: ${isObfuscated(currentPath)}`);
    
    // Detectar UUIDs directamente en la URL
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi;
    const hasUUIDs = uuidRegex.test(currentPath);
    
    console.log(`[ObfuscatedRouter] Has UUIDs: ${hasUUIDs}`);
    
    // Si la URL actual contiene UUIDs y no está ofuscada, ofuscarla
    if (hasUUIDs && !isObfuscated(currentPath)) {
      const obfuscatedPath = obfuscateUrl(currentPath);
      console.log(`[ObfuscatedRouter] Obfuscating: ${currentPath} -> ${obfuscatedPath}`);
      
      if (obfuscatedPath !== currentPath) {
        // Reemplazar la URL en el navegador sin triggear navigation
        window.history.replaceState(
          window.history.state, 
          '', 
          obfuscatedPath + location.search + location.hash
        );
        console.log(`[ObfuscatedRouter] URL replaced in browser: ${obfuscatedPath}`);
      }
    }
  }, [location.pathname, obfuscateUrl, isObfuscated, isEnabled]);

  return <>{children}</>;
};

/**
 * Hook personalizado que intercepta las navegaciones para ofuscar automáticamente
 */
export const useObfuscatedRouter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { obfuscateUrl, deobfuscateUrl, isEnabled } = useObfuscation();

  const navigateObfuscated = (to: string, options?: { replace?: boolean; state?: any }) => {
    if (!isEnabled) {
      navigate(to, options);
      return;
    }

    const obfuscatedUrl = obfuscateUrl(to);
    console.log(`[useObfuscatedRouter] Navigating: ${to} -> ${obfuscatedUrl}`);
    navigate(obfuscatedUrl, options);
  };

  const getCurrentRealPath = (): string => {
    return isEnabled ? deobfuscateUrl(location.pathname) : location.pathname;
  };

  const getCurrentObfuscatedPath = (): string => {
    return location.pathname;
  };

  return {
    navigate: navigateObfuscated,
    location: {
      ...location,
      pathname: getCurrentRealPath(), // Devuelve siempre la ruta real para procesamiento interno
    },
    getCurrentRealPath,
    getCurrentObfuscatedPath,
    isEnabled,
  };
}; 