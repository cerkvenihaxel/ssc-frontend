import { ApiClient } from './ApiClient';
import { IdObfuscator } from '../../shared/utils/idObfuscator';

/**
 * Configuración global para la ofuscación de APIs
 */
export interface GlobalObfuscationConfig {
  enabled: boolean;
  method: 'base64' | 'encrypt' | 'checksum' | 'timeBased';
  endpoints: {
    // Patrones de endpoints que deben ser ofuscados
    patterns: string[];
    // Endpoints específicos a excluir
    exclude: string[];
  };
  // Parámetros que contienen IDs que deben ser ofuscados
  idParameters: string[];
}

const DEFAULT_CONFIG: GlobalObfuscationConfig = {
  enabled: true,
  method: 'checksum',
  endpoints: {
    patterns: [
      // Frontend routes que contienen UUIDs
      '/admin/users/:id',
      '/admin/users/providers/:id',
      '/admin/users/effectors/:id',
      '/admin/users/auditors/:id',
      '/admin/healthcare/especialidades/:id',
      '/admin/healthcare/obras-sociales/:id',
      '/admin/healthcare/afiliados/:id',
      '/admin/healthcare/medicos/:id',
      // API routes también
      '/v1/admin/users/:id',
      '/v1/admin/users/providers/:id',
      '/v1/admin/users/effectors/:id',
      '/v1/admin/users/auditors/:id',
      '/v1/proveedores/:id',
      '/v1/medicos/:id',
      '/v1/afiliados/:id',
      '/v1/effector-requests/:id',
      '/v1/especialidades/:id',
      '/v1/obras-sociales/:id',
    ],
    exclude: [
      '/v1/auth',
      '/v1/login',
      '/v1/logout',
      '/login',
      '/auth',
      '/unauthorized'
    ]
  },
  idParameters: ['id', 'userId', 'providerId', 'effectorId', 'medicoId', 'especialidadId', 'afiliadoId']
};

/**
 * Cliente API que maneja ofuscación automática de IDs en URLs
 */
export class ObfuscatedApiClient {
  private apiClient: ApiClient;
  private config: GlobalObfuscationConfig;
  
  // Cache para mapear URLs ofuscadas a URLs reales
  private urlMappingCache = new Map<string, string>();

  constructor(apiClient: ApiClient, config: Partial<GlobalObfuscationConfig> = {}) {
    this.apiClient = apiClient;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Detecta si una URL contiene UUIDs que deben ser ofuscados
   */
  private containsUUIDs(url: string): boolean {
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi;
    return uuidRegex.test(url);
  }

  /**
   * Detecta si una URL contiene IDs obfuscados
   */
  private containsObfuscatedIds(url: string): boolean {
    // Buscar patrones que parecen IDs obfuscados (Base64-like strings)
    // Los IDs obfuscados tienden a ser strings largos con caracteres Base64 + terminaciones específicas
    const obfuscatedIdRegex = /[A-Za-z0-9+/_-]{40,}[.]{0,2}/g;
    const parts = url.split('/');
    
    return parts.some(part => {
      // Si ya es un UUID, no es obfuscado
      if (this.containsUUIDs(part)) {
        return false;
      }
      
      // Verificar si parece un ID obfuscado
      return obfuscatedIdRegex.test(part) && part.length > 20;
    });
  }

  /**
   * Verifica si un endpoint debe ser ofuscado según la configuración
   */
  private shouldObfuscateEndpoint(url: string): boolean {
    if (!this.config.enabled) return false;

    // Verificar exclusiones primero
    for (const excludePattern of this.config.endpoints.exclude) {
      if (url.includes(excludePattern)) {
        console.log(`[ObfuscatedApiClient] URL excluded: ${url} matches ${excludePattern}`);
        return false;
      }
    }

    // Verificar si contiene UUIDs o IDs obfuscados
    const hasUUIDs = this.containsUUIDs(url);
    const hasObfuscatedIds = this.containsObfuscatedIds(url);
    
    if (!hasUUIDs && !hasObfuscatedIds) {
      console.log(`[ObfuscatedApiClient] No UUIDs or obfuscated IDs found in: ${url}`);
      return false;
    }

    // Verificar patrones incluidos
    for (const pattern of this.config.endpoints.patterns) {
      // Hacer el matching más flexible - permitir subrutas también
      const regexPattern = pattern
        .replace(/:[\w]+/g, '[0-9a-f-]+|[A-Za-z0-9+/_.-]{20,}') // Reemplazar :id con patrón UUID o ofuscado
        .replace(/\//g, '\\/'); // Escapar slashes
      
      const regex = new RegExp(`^${regexPattern}(?:/.*)?$`); // Permitir subrutas
      const baseUrl = url.split('?')[0]; // Remover query params
      
      if (regex.test(baseUrl)) {
        console.log(`[ObfuscatedApiClient] URL matches pattern: ${url} -> ${pattern} (hasUUIDs: ${hasUUIDs}, hasObfuscatedIds: ${hasObfuscatedIds})`);
        return true;
      }
    }

    // Si no coincide con ningún patrón específico pero tiene UUIDs o IDs obfuscados, procesar
    console.log(`[ObfuscatedApiClient] No pattern match, but has UUIDs/obfuscated IDs: ${url} (hasUUIDs: ${hasUUIDs}, hasObfuscatedIds: ${hasObfuscatedIds})`);
    return true;
  }

  /**
   * Ofusca los UUIDs en una URL
   */
  private obfuscateUrl(originalUrl: string): string {
    if (!this.shouldObfuscateEndpoint(originalUrl)) {
      return originalUrl;
    }

    const uuidRegex = /([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/gi;
    
    const obfuscatedUrl = originalUrl.replace(uuidRegex, (uuid) => {
      return IdObfuscator.smartObfuscate(uuid, { method: this.config.method });
    });

    // Guardar mapeo para deofuscación posterior
    this.urlMappingCache.set(obfuscatedUrl, originalUrl);
    
    return obfuscatedUrl;
  }

  /**
   * Deofusca una URL para enviar la request real
   */
  private deobfuscateUrl(obfuscatedUrl: string): string {
    console.log(`[ObfuscatedApiClient] Deobfuscating URL: ${obfuscatedUrl}`);
    
    try {
      // Check cache first
      if (this.urlMappingCache.has(obfuscatedUrl)) {
        const cachedUrl = this.urlMappingCache.get(obfuscatedUrl)!;
        console.log(`[ObfuscatedApiClient] Found in cache: ${obfuscatedUrl} -> ${cachedUrl}`);
        return cachedUrl;
      }

      if (!this.shouldObfuscateEndpoint(obfuscatedUrl)) {
        console.log(`[ObfuscatedApiClient] Endpoint should not be obfuscated: ${obfuscatedUrl}`);
        return obfuscatedUrl;
      }

      // Split URL into parts and process each potential ID
      const parts = obfuscatedUrl.split('/');
      console.log(`[ObfuscatedApiClient] URL parts:`, parts);
      
      const deobfuscatedParts = parts.map((part, index) => {
        console.log(`[ObfuscatedApiClient] Processing part ${index}: "${part}"`);
        
        // Skip non-ID parts (like 'api', 'v1', etc.)
        if (!part || part.length < 8 || /^(api|v1|v2|admin|user|auth|login|logout|dashboard|activities|users|medical-orders|effector-requests)$/i.test(part)) {
          console.log(`[ObfuscatedApiClient] Part ${index} is not an ID, skipping: "${part}"`);
          return part;
        }

        // If it's already a UUID, don't deobfuscate
        if (IdObfuscator.isUUID(part)) {
          console.log(`[ObfuscatedApiClient] Part ${index} is already UUID: ${part}`);
          return part;
        }

        // Try to deobfuscate the part
        try {
          const result = IdObfuscator.smartDeobfuscate(part, { method: this.config.method });
          console.log(`[ObfuscatedApiClient] Deobfuscation result for "${part}":`, result);
          
          if (result.wasObfuscated && result.isValid && IdObfuscator.isUUID(result.id)) {
            const finalPart = result.id;
            console.log(`[ObfuscatedApiClient] Successfully deobfuscated part ${index}: "${part}" -> "${finalPart}"`);
            return finalPart;
          } else if (result.wasObfuscated && !result.isValid) {
            console.error(`[ObfuscatedApiClient] Deobfuscation failed for part ${index}: "${part}" - result invalid`);
            // Return original part to avoid breaking the URL, but log the error
            return part;
          } else {
            console.log(`[ObfuscatedApiClient] Part ${index} was not obfuscated: "${part}"`);
            return part;
          }
        } catch (error) {
          console.error(`[ObfuscatedApiClient] Error deobfuscating part ${index} "${part}":`, error);
          // Return original part to avoid breaking the URL
          return part;
        }
      });

      const finalUrl = deobfuscatedParts.join('/');
      console.log(`[ObfuscatedApiClient] Final deobfuscated URL: ${obfuscatedUrl} -> ${finalUrl}`);
      
      // Validate that we have successfully deobfuscated all necessary parts
      const hasStillObfuscatedParts = deobfuscatedParts.some(part => 
        part.length > 20 && !IdObfuscator.isUUID(part) && 
        !part.match(/^(api|v1|v2|admin|user|auth|login|logout|dashboard|activities|users|medical-orders|effector-requests)$/i)
      );
      
      if (hasStillObfuscatedParts) {
        console.error(`[ObfuscatedApiClient] WARNING: URL may still contain obfuscated parts: ${finalUrl}`);
      }
      
      return finalUrl;
    } catch (error) {
      console.error(`[ObfuscatedApiClient] Critical error in deobfuscateUrl:`, error);
      console.error(`[ObfuscatedApiClient] Returning original URL as fallback: ${obfuscatedUrl}`);
      return obfuscatedUrl;
    }
  }

  /**
   * Wrapper para GET requests
   */
  async get<T>(obfuscatedUrl: string): Promise<T> {
    const realUrl = this.deobfuscateUrl(obfuscatedUrl);
    console.log(`[ObfuscatedApiClient] GET: ${obfuscatedUrl} -> ${realUrl}`);
    return this.apiClient.get<T>(realUrl);
  }

  /**
   * Wrapper para POST requests
   */
  async post<T>(obfuscatedUrl: string, data?: any): Promise<T> {
    const realUrl = this.deobfuscateUrl(obfuscatedUrl);
    console.log(`[ObfuscatedApiClient] POST: ${obfuscatedUrl} -> ${realUrl}`);
    return this.apiClient.post<T>(realUrl, data);
  }

  /**
   * Wrapper para PUT requests
   */
  async put<T>(obfuscatedUrl: string, data?: any): Promise<T> {
    const realUrl = this.deobfuscateUrl(obfuscatedUrl);
    console.log(`[ObfuscatedApiClient] PUT: ${obfuscatedUrl} -> ${realUrl}`);
    return this.apiClient.put<T>(realUrl, data);
  }

  /**
   * Wrapper para PATCH requests
   */
  async patch<T>(obfuscatedUrl: string, data?: any): Promise<T> {
    const realUrl = this.deobfuscateUrl(obfuscatedUrl);
    console.log(`[ObfuscatedApiClient] PATCH: ${obfuscatedUrl} -> ${realUrl}`);
    return this.apiClient.patch<T>(realUrl, data);
  }

  /**
   * Wrapper para DELETE requests
   */
  async delete<T>(obfuscatedUrl: string): Promise<T> {
    const realUrl = this.deobfuscateUrl(obfuscatedUrl);
    console.log(`[ObfuscatedApiClient] DELETE: ${obfuscatedUrl} -> ${realUrl}`);
    return this.apiClient.delete<T>(realUrl);
  }

  /**
   * Método público para ofuscar URLs (para uso en componentes)
   */
  public createObfuscatedUrl(originalUrl: string): string {
    return this.obfuscateUrl(originalUrl);
  }

  /**
   * Método público para obtener la URL real desde una ofuscada
   */
  public getRealUrl(obfuscatedUrl: string): string {
    return this.deobfuscateUrl(obfuscatedUrl);
  }

  /**
   * Actualizar configuración
   */
  public updateConfig(newConfig: Partial<GlobalObfuscationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Obtener configuración actual
   */
  public getConfig(): GlobalObfuscationConfig {
    return { ...this.config };
  }

  /**
   * Limpiar cache de mapeos
   */
  public clearCache(): void {
    this.urlMappingCache.clear();
  }

  /**
   * Acceso al cliente original para casos especiales
   */
  public getOriginalClient(): ApiClient {
    return this.apiClient;
  }
} 