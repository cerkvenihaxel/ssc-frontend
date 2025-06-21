import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown, User, X, Loader } from 'lucide-react';
import { useObfuscation } from '../../contexts/ObfuscationContext';

interface Affiliate {
  affiliateId: string;
  firstName: string;
  lastName: string;
  affiliateNumber: string;
  cuil: string;
  email: string;
  healthcareProviders: {
    healthcareProviderId: string;
    name: string;
  }[];
}

interface AffiliateSearchSelectProps {
  value: string;
  onChange: (affiliateId: string, affiliate: Affiliate | null) => void;
  onHealthcareProvidersChange?: (providers: { healthcareProviderId: string; name: string }[]) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const AffiliateSearchSelect: React.FC<AffiliateSearchSelectProps> = ({
  value,
  onChange,
  onHealthcareProvidersChange,
  placeholder = "Buscar afiliado...",
  required = false,
  disabled = false,
  className = ""
}) => {
  const { obfuscatedApiClient } = useObfuscation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const searchAffiliates = async (search: string, pageNum: number = 1) => {
     try {
       setLoading(true);
       
       // Construir URL con parámetros de consulta
       const searchParams = new URLSearchParams({
         search: search.trim(),
         page: pageNum.toString(),
         limit: '10'
       });
       
       const response = await obfuscatedApiClient.get<{
         data: Affiliate[];
         pagination: {
           page: number;
           limit: number;
           total: number;
           totalPages: number;
           hasNext: boolean;
           hasPrev: boolean;
         };
       }>(`/medical-orders/affiliates/search?${searchParams.toString()}`);

       if (pageNum === 1) {
         setAffiliates(response.data);
       } else {
         setAffiliates(prev => [...prev, ...response.data]);
       }
       
       setPage(pageNum);
       setHasMore(response.pagination.hasNext);
       setTotal(response.pagination.total);
       
     } catch (error) {
       console.error('Error searching affiliates:', error);
       setAffiliates([]);
       setHasMore(false);
       setTotal(0);
     } finally {
       setLoading(false);
     }
   };

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (searchTerm.trim().length >= 2 || searchTerm.trim().length === 0) {
        searchAffiliates(searchTerm, 1);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadMoreAffiliates = () => {
    if (!loading && hasMore) {
      searchAffiliates(searchTerm, page + 1);
    }
  };

  const handleSelect = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setSearchTerm(`${affiliate.firstName} ${affiliate.lastName} - ${affiliate.affiliateNumber}`);
    setIsOpen(false);
    onChange(affiliate.affiliateId, affiliate);
    
    // Notificar proveedores de salud disponibles
    if (onHealthcareProvidersChange) {
      onHealthcareProvidersChange(affiliate.healthcareProviders);
    }
  };

  const handleClear = () => {
    setSelectedAffiliate(null);
    setSearchTerm('');
    setAffiliates([]);
    onChange('', null);
    
    if (onHealthcareProvidersChange) {
      onHealthcareProvidersChange([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    
    if (!isOpen) {
      setIsOpen(true);
    }
    
    // Si el usuario borra el input, limpiar la selección
    if (newValue === '' && selectedAffiliate) {
      handleClear();
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (searchTerm.trim().length >= 2) {
      searchAffiliates(searchTerm, 1);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 dark:border-darkmode-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-darkmode-800 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        
        {selectedAffiliate && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        
        <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-darkmode-800 border border-gray-200 dark:border-darkmode-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading && affiliates.length === 0 && (
            <div className="px-4 py-3 flex items-center justify-center text-gray-500 dark:text-slate-400">
              <Loader className="h-4 w-4 animate-spin mr-2" />
              Buscando afiliados...
            </div>
          )}
          
          {!loading && searchTerm.trim().length > 0 && searchTerm.trim().length < 2 && (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400">
              Ingrese al menos 2 caracteres para buscar
            </div>
          )}
          
          {!loading && affiliates.length === 0 && searchTerm.trim().length >= 2 && (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400">
              No se encontraron afiliados
            </div>
          )}
          
          {affiliates.map((affiliate) => (
            <button
              key={affiliate.affiliateId}
              type="button"
              onClick={() => handleSelect(affiliate)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-darkmode-700 border-b border-gray-100 dark:border-darkmode-600 last:border-b-0"
            >
              <div className="flex items-center">
                <User className="h-4 w-4 text-gray-400 mr-3" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {affiliate.firstName} {affiliate.lastName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-slate-400">
                    {affiliate.affiliateNumber} • CUIL: {affiliate.cuil}
                  </div>
                  {affiliate.healthcareProviders.length > 0 && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Obras sociales: {affiliate.healthcareProviders.map(hp => hp.name).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
          
          {hasMore && (
            <button
              type="button"
              onClick={loadMoreAffiliates}
              disabled={loading}
              className="w-full px-4 py-3 text-center text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-darkmode-700 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  Cargando más...
                </span>
              ) : (
                `Cargar más (${affiliates.length} de ${total})`
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AffiliateSearchSelect; 