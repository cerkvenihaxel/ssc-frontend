import CryptoJS from 'crypto-js';

// Clave secreta para el cifrado (en producción debería venir de variables de entorno)
const SECRET_KEY = (typeof process !== 'undefined' && process.env?.REACT_APP_OBFUSCATION_KEY) || 'default-secret-key-change-in-production';

/**
 * Utilidad para ofuscar IDs/UUIDs en las URLs
 * Proporciona múltiples métodos de ofuscación para mejorar la seguridad
 */
export class IdObfuscator {
  
  /**
   * Método 1: Codificación Base64 simple
   * - Oculta el formato UUID pero es fácilmente reversible
   * - Bueno para ofuscación básica
   */
  static encodeBase64(id: string): string {
    try {
      return btoa(id).replace(/[+/=]/g, (match: string) => {
        switch (match) {
          case '+': return '-';
          case '/': return '_';
          case '=': return '';
          default: return match;
        }
      });
    } catch (error) {
      console.error('Error encoding ID:', error);
      return id;
    }
  }

  static decodeBase64(encodedId: string): string {
    try {
      // Restaurar caracteres Base64
      let restored = encodedId.replace(/[-_]/g, (match: string) => {
        return match === '-' ? '+' : '/';
      });
      
      // Agregar padding si es necesario
      while (restored.length % 4) {
        restored += '=';
      }
      
      return atob(restored);
    } catch (error) {
      console.error('Error decoding ID:', error);
      return encodedId;
    }
  }

  /**
   * Método 2: Cifrado AES simple
   * - Más seguro que Base64
   * - Requiere clave secreta
   */
  static encrypt(id: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(id, SECRET_KEY).toString();
      // Hacer URL-safe
      return encrypted.replace(/[+/=]/g, (match: string) => {
        switch (match) {
          case '+': return '-';
          case '/': return '_';
          case '=': return '.';
          default: return match;
        }
      });
    } catch (error) {
      console.error('Error encrypting ID:', error);
      return this.encodeBase64(id); // Fallback a Base64
    }
  }

  static decrypt(encryptedId: string): string {
    try {
      console.log(`[IdObfuscator] Attempting to decrypt: ${encryptedId.substring(0, 20)}...`);
      
      // Restaurar formato original
      const restored = encryptedId.replace(/[-_.]/g, (match: string) => {
        switch (match) {
          case '-': return '+';
          case '_': return '/';
          case '.': return '=';
          default: return match;
        }
      });
      
      console.log(`[IdObfuscator] Restored format: ${restored.substring(0, 20)}...`);
      
      const decrypted = CryptoJS.AES.decrypt(restored, SECRET_KEY);
      const result = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!result) {
        console.warn(`[IdObfuscator] Decryption returned empty result for: ${encryptedId.substring(0, 20)}...`);
        throw new Error('Decryption failed - empty result');
      }
      
      console.log(`[IdObfuscator] Successfully decrypted to: ${result}`);
      return result;
    } catch (error) {
      console.error(`[IdObfuscator] Error decrypting ID "${encryptedId.substring(0, 20)}...":`, error);
      console.log(`[IdObfuscator] Falling back to Base64 decode for: ${encryptedId.substring(0, 20)}...`);
      return this.decodeBase64(encryptedId); // Fallback a Base64
    }
  }

  /**
   * Método 3: Hash reversible con timestamp
   * - Incluye timestamp para mayor seguridad
   * - Útil para tokens temporales
   */
  static createTimeBasedHash(id: string, expirationMinutes: number = 60): string {
    try {
      const expiration = Date.now() + (expirationMinutes * 60 * 1000);
      const payload = `${id}|${expiration}`;
      return this.encrypt(payload);
    } catch (error) {
      console.error('Error creating time-based hash:', error);
      return this.encodeBase64(id);
    }
  }

  static decodeTimeBasedHash(hash: string): { id: string; isValid: boolean } {
    try {
      const payload = this.decrypt(hash);
      const [id, expirationStr] = payload.split('|');
      const expiration = parseInt(expirationStr);
      
      if (Date.now() > expiration) {
        return { id, isValid: false };
      }
      
      return { id, isValid: true };
    } catch (error) {
      console.error('Error decoding time-based hash:', error);
      return { id: hash, isValid: false };
    }
  }

  /**
   * Método 4: Ofuscación con checksuma para integridad
   * - Incluye checksum para verificar integridad
   * - Detecta manipulación de URLs
   */
  static obfuscateWithChecksum(id: string): string {
    try {
      const checksum = CryptoJS.MD5(id + SECRET_KEY).toString().substring(0, 8);
      const payload = `${id}|${checksum}`;
      return this.encrypt(payload);
    } catch (error) {
      console.error('Error obfuscating with checksum:', error);
      return this.encodeBase64(id);
    }
  }

  static deobfuscateWithChecksum(obfuscatedId: string): { id: string; isValid: boolean } {
    try {
      console.log(`[IdObfuscator] Attempting checksum deobfuscation for: ${obfuscatedId.substring(0, 20)}...`);
      
      const payload = this.decrypt(obfuscatedId);
      console.log(`[IdObfuscator] Decrypted payload: ${payload}`);
      
      const [id, providedChecksum] = payload.split('|');
      
      if (!id || !providedChecksum) {
        console.warn(`[IdObfuscator] Invalid payload format - missing id or checksum: "${payload}"`);
        return { id: obfuscatedId, isValid: false };
      }
      
      const expectedChecksum = CryptoJS.MD5(id + SECRET_KEY).toString().substring(0, 8);
      console.log(`[IdObfuscator] Provided checksum: ${providedChecksum}, Expected: ${expectedChecksum}`);
      
      if (providedChecksum !== expectedChecksum) {
        console.warn(`[IdObfuscator] Checksum mismatch for ID: ${id}`);
        return { id, isValid: false };
      }
      
      console.log(`[IdObfuscator] Successfully deobfuscated with valid checksum: ${id}`);
      return { id, isValid: true };
    } catch (error) {
      console.error(`[IdObfuscator] Error deobfuscating with checksum "${obfuscatedId.substring(0, 20)}...":`, error);
      return { id: obfuscatedId, isValid: false };
    }
  }

  /**
   * Método principal recomendado: Combina cifrado + checksum
   * - Más seguro para uso en producción
   * - Incluye validación de integridad
   */
  static obfuscate(id: string, options: { 
    method?: 'base64' | 'encrypt' | 'checksum' | 'timeBased';
    expirationMinutes?: number;
  } = {}): string {
    const { method = 'checksum', expirationMinutes = 60 } = options;
    
    switch (method) {
      case 'base64':
        return this.encodeBase64(id);
      case 'encrypt':
        return this.encrypt(id);
      case 'timeBased':
        return this.createTimeBasedHash(id, expirationMinutes);
      case 'checksum':
      default:
        return this.obfuscateWithChecksum(id);
    }
  }

  static deobfuscate(obfuscatedId: string, options: {
    method?: 'base64' | 'encrypt' | 'checksum' | 'timeBased';
  } = {}): { id: string; isValid: boolean } {
    const { method = 'checksum' } = options;
    
    switch (method) {
      case 'base64':
        return { id: this.decodeBase64(obfuscatedId), isValid: true };
      case 'encrypt':
        return { id: this.decrypt(obfuscatedId), isValid: true };
      case 'timeBased':
        return this.decodeTimeBasedHash(obfuscatedId);
      case 'checksum':
      default:
        return this.deobfuscateWithChecksum(obfuscatedId);
    }
  }

  /**
   * Utilidad para validar si un string parece ser un UUID
   */
  static isUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  /**
   * Ofuscar automáticamente solo si el ID parece ser un UUID
   */
  static smartObfuscate(id: string, options?: { method?: 'base64' | 'encrypt' | 'checksum' | 'timeBased' }): string {
    if (this.isUUID(id)) {
      return this.obfuscate(id, options);
    }
    return id; // No ofuscar si no es UUID
  }

  static smartDeobfuscate(possiblyObfuscatedId: string, options?: { method?: 'base64' | 'encrypt' | 'checksum' | 'timeBased' }): { id: string; isValid: boolean; wasObfuscated: boolean } {
    console.log(`[IdObfuscator] smartDeobfuscate called with: ${possiblyObfuscatedId.substring(0, 20)}...`);
    
    // Si ya parece ser un UUID, no fue ofuscado
    if (this.isUUID(possiblyObfuscatedId)) {
      console.log(`[IdObfuscator] Input is already a UUID: ${possiblyObfuscatedId}`);
      return { id: possiblyObfuscatedId, isValid: true, wasObfuscated: false };
    }
    
    // Intentar deofuscar
    console.log(`[IdObfuscator] Attempting to deobfuscate with method: ${options?.method || 'checksum'}`);
    const result = this.deobfuscate(possiblyObfuscatedId, options);
    
    console.log(`[IdObfuscator] Deobfuscation result:`, {
      originalId: possiblyObfuscatedId.substring(0, 20) + '...',
      resultId: result.id,
      isValid: result.isValid,
      wasObfuscated: true
    });
    
    return { ...result, wasObfuscated: true };
  }

  /**
   * Función de test para verificar el sistema de ofuscación
   */
  static testObfuscation(): void {
    console.log('=== IdObfuscator Test Suite ===');
    
    const testUUID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    console.log(`Original UUID: ${testUUID}`);
    
    // Test cada método
    const methods: Array<'base64' | 'encrypt' | 'checksum' | 'timeBased'> = ['base64', 'encrypt', 'checksum', 'timeBased'];
    
    methods.forEach(method => {
      console.log(`\n--- Testing method: ${method} ---`);
      
      try {
        // Ofuscar
        const obfuscated = this.obfuscate(testUUID, { method });
        console.log(`Obfuscated: ${obfuscated}`);
        
        // Desofuscar
        const deobfuscated = this.deobfuscate(obfuscated, { method });
        console.log(`Deobfuscated:`, deobfuscated);
        
        // Test smartDeobfuscate
        const smartResult = this.smartDeobfuscate(obfuscated, { method });
        console.log(`Smart deobfuscated:`, smartResult);
        
        // Verificar resultado
        const success = deobfuscated.id === testUUID && deobfuscated.isValid;
        console.log(`✅ Method ${method}: ${success ? 'PASSED' : 'FAILED'}`);
        
        if (!success) {
          console.error(`❌ Expected: ${testUUID}, Got: ${deobfuscated.id}, Valid: ${deobfuscated.isValid}`);
        }
        
      } catch (error) {
        console.error(`❌ Method ${method} FAILED with error:`, error);
      }
    });
    
    console.log('\n=== Test Suite Complete ===');
  }

  /**
   * Test específico para un ID problemático
   */
  static testSpecificId(problematicId: string, method: 'base64' | 'encrypt' | 'checksum' | 'timeBased' = 'checksum'): void {
    console.log(`=== Testing Specific ID: ${problematicId.substring(0, 20)}... ===`);
    
    try {
      const result = this.smartDeobfuscate(problematicId, { method });
      console.log('Result:', result);
      
      if (result.wasObfuscated && result.isValid && this.isUUID(result.id)) {
        console.log('✅ Successfully deobfuscated to valid UUID:', result.id);
      } else {
        console.log('❌ Failed to deobfuscate to valid UUID');
        console.log('Details:', {
          wasObfuscated: result.wasObfuscated,
          isValid: result.isValid,
          isUUID: this.isUUID(result.id),
          resultId: result.id
        });
      }
    } catch (error) {
      console.error('❌ Error during test:', error);
    }
  }
}

// Hooks personalizados para React Router
export const useObfuscatedParams = () => {
  return {
    obfuscateId: (id: string) => IdObfuscator.smartObfuscate(id),
    deobfuscateId: (obfuscatedId: string) => IdObfuscator.smartDeobfuscate(obfuscatedId),
  };
};

// Helper para generar rutas ofuscadas
export const createObfuscatedRoute = (basePath: string, id: string): string => {
  const obfuscatedId = IdObfuscator.smartObfuscate(id);
  return `${basePath}/${obfuscatedId}`;
};

// Helper para parsear rutas ofuscadas
export const parseObfuscatedRoute = (obfuscatedId: string): { id: string; isValid: boolean } => {
  const result = IdObfuscator.smartDeobfuscate(obfuscatedId);
  return { id: result.id, isValid: result.isValid };
};

// Exponer globalmente para debugging en desarrollo
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).IdObfuscator = IdObfuscator;
  console.log('🔧 IdObfuscator exposed globally for debugging. Use IdObfuscator.testObfuscation() to run tests.');
} 