import React from 'react';
import { Link } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom';
import { IdObfuscator } from '../../utils/idObfuscator';

interface ObfuscatedLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
  id?: string;
  method?: 'base64' | 'encrypt' | 'checksum' | 'timeBased';
  paramName?: string;
  children: React.ReactNode;
}

/**
 * Componente Link que automáticamente ofusca IDs en las rutas
 * 
 * @example
 * ```tsx
 * <ObfuscatedLink to="/users/:id" id={userId} method="checksum">
 *   Ver usuario
 * </ObfuscatedLink>
 * ```
 */
export const ObfuscatedLink: React.FC<ObfuscatedLinkProps> = ({
  to,
  id,
  method = 'checksum',
  paramName = 'id',
  children,
  ...linkProps
}) => {
  const processedTo = React.useMemo(() => {
    if (!id) {
      return to;
    }

    const obfuscatedId = IdObfuscator.smartObfuscate(id, { method });
    return to.replace(`:${paramName}`, obfuscatedId);
  }, [to, id, method, paramName]);

  return (
    <Link to={processedTo} {...linkProps}>
      {children}
    </Link>
  );
};

/**
 * Componente para mostrar rutas ofuscadas como texto (útil para debugging)
 */
export const ObfuscatedRouteDisplay: React.FC<{
  to: string;
  id?: string;
  method?: 'base64' | 'encrypt' | 'checksum' | 'timeBased';
  paramName?: string;
  showOriginal?: boolean;
}> = ({
  to,
  id,
  method = 'checksum',
  paramName = 'id',
  showOriginal = false
}) => {
  const processedTo = React.useMemo(() => {
    if (!id) {
      return to;
    }

    const obfuscatedId = IdObfuscator.smartObfuscate(id, { method });
    return to.replace(`:${paramName}`, obfuscatedId);
  }, [to, id, method, paramName]);

  if (showOriginal && id) {
    return (
      <div className="font-mono text-xs">
        <div className="text-gray-500">Original: {to.replace(`:${paramName}`, id)}</div>
        <div className="text-blue-600">Ofuscado: {processedTo}</div>
      </div>
    );
  }

  return <span className="font-mono text-xs text-gray-600">{processedTo}</span>;
};

export default ObfuscatedLink; 