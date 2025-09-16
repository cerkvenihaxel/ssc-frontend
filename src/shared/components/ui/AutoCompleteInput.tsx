import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

export interface AutoCompleteOption {
  value: string;
  label: string;
  subtitle?: string;
}

interface AutoCompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (search: string) => Promise<AutoCompleteOption[]>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  allowCustomValue?: boolean;
  minSearchLength?: number;
  debounceMs?: number;
  noOptionsText?: string;
  loadingText?: string;
}

const AutoCompleteInput: React.FC<AutoCompleteInputProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Buscar...',
  className = '',
  disabled = false,
  allowCustomValue = true,
  minSearchLength = 2,
  debounceMs = 300,
  noOptionsText = 'No se encontraron opciones',
  loadingText = 'Buscando...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [options, setOptions] = useState<AutoCompleteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  // Buscar opciones cuando cambie el término de búsqueda
  useEffect(() => {
    if (debouncedSearchTerm.length >= minSearchLength) {
      performSearch(debouncedSearchTerm);
    } else {
      setOptions([]);
    }
  }, [debouncedSearchTerm, minSearchLength]);

  // Actualizar el término de búsqueda cuando cambie el valor
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const performSearch = async (term: string) => {
    setLoading(true);
    try {
      const results = await onSearch(term);
      setOptions(results);
    } catch (error) {
      console.error('Error searching:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);
    setSelectedIndex(-1);
    
    if (allowCustomValue) {
      onChange(newValue);
    }
  };

  const handleOptionSelect = (option: AutoCompleteOption) => {
    setSearchTerm(option.label);
    onChange(option.value);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || options.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < options.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : options.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < options.length) {
          handleOptionSelect(options[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    onChange('');
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsOpen(true);
            if (searchTerm.length >= minSearchLength && options.length === 0) {
              performSearch(searchTerm);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-2 pr-10 border border-gray-300 dark:border-darkmode-400 
            rounded-lg bg-white dark:bg-darkmode-700 text-gray-900 dark:text-white
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {loading ? (
            <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full" />
          ) : searchTerm ? (
            <button
              type="button"
              onClick={handleClear}
              className="pointer-events-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <Search className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-darkmode-700 border border-gray-300 dark:border-darkmode-400 rounded-lg shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-slate-400">
              {loadingText}
            </div>
          ) : options.length === 0 ? (
            searchTerm.length >= minSearchLength && (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-slate-400">
                {noOptionsText}
              </div>
            )
          ) : (
            options.map((option, index) => (
              <button
                key={`${option.value}-${index}`}
                type="button"
                onClick={() => handleOptionSelect(option)}
                className={`
                  w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-darkmode-800
                  ${index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  ${index === 0 ? 'rounded-t-lg' : ''}
                  ${index === options.length - 1 ? 'rounded-b-lg' : ''}
                `}
              >
                <div className="text-sm text-gray-900 dark:text-white">
                  {option.label}
                </div>
                {option.subtitle && (
                  <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    {option.subtitle}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AutoCompleteInput; 