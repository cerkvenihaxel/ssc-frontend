import { useState, useEffect, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live en milisegundos (default: 5 minutos)
  maxSize?: number; // Tamaño máximo del cache (default: 100)
}

/**
 * Hook personalizado para cache local con TTL
 */
export function useCache<T>(options: CacheOptions = {}) {
  const { ttl = 5 * 60 * 1000, maxSize = 100 } = options; // 5 minutos por defecto
  const [cache, setCache] = useState<Map<string, CacheEntry<T>>>(new Map());

  // Función para generar clave de cache
  const generateKey = useCallback((prefix: string, params: Record<string, any>): string => {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${JSON.stringify(params[key])}`)
      .join('&');
    return `${prefix}?${sortedParams}`;
  }, []);

  // Función para obtener datos del cache
  const get = useCallback((key: string): T | null => {
    const entry = cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      // Entrada expirada, eliminar del cache
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(key);
        return newCache;
      });
      return null;
    }

    return entry.data;
  }, [cache]);

  // Función para guardar datos en el cache
  const set = useCallback((key: string, data: T): void => {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl
    };

    setCache(prev => {
      const newCache = new Map(prev);
      
      // Si el cache está lleno, eliminar la entrada más antigua
      if (newCache.size >= maxSize) {
        let oldestKey = '';
        let oldestTimestamp = Infinity;
        
        for (const [cacheKey, cacheEntry] of newCache.entries()) {
          if (cacheEntry.timestamp < oldestTimestamp) {
            oldestTimestamp = cacheEntry.timestamp;
            oldestKey = cacheKey;
          }
        }
        
        if (oldestKey) {
          newCache.delete(oldestKey);
        }
      }
      
      newCache.set(key, entry);
      return newCache;
    });
  }, [ttl, maxSize]);

  // Función para invalidar cache
  const invalidate = useCallback((keyPattern?: string): void => {
    if (!keyPattern) {
      setCache(new Map());
      return;
    }

    setCache(prev => {
      const newCache = new Map();
      for (const [key, entry] of prev.entries()) {
        if (!key.includes(keyPattern)) {
          newCache.set(key, entry);
        }
      }
      return newCache;
    });
  }, []);

  // Función para verificar si existe en cache
  const has = useCallback((key: string): boolean => {
    const entry = cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now > entry.expiresAt) {
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(key);
        return newCache;
      });
      return false;
    }

    return true;
  }, [cache]);

  // Limpiar entradas expiradas periódicamente
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setCache(prev => {
        const newCache = new Map();
        for (const [key, entry] of prev.entries()) {
          if (now <= entry.expiresAt) {
            newCache.set(key, entry);
          }
        }
        return newCache;
      });
    }, 60000); // Limpiar cada minuto

    return () => clearInterval(cleanupInterval);
  }, []);

  return {
    get,
    set,
    has,
    invalidate,
    generateKey,
    size: cache.size
  };
} 