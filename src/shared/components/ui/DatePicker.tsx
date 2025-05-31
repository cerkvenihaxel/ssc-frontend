import React from 'react';
import { Calendar } from 'lucide-react';

interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  error,
  helperText,
  className = '',
  value = '',
  onChange,
  ...props
}) => {
  const baseClasses = `
    disabled:bg-slate-100 disabled:cursor-not-allowed 
    dark:disabled:bg-darkmode-800/50 dark:disabled:border-transparent
    [&[readonly]]:bg-slate-100 [&[readonly]]:cursor-not-allowed 
    [&[readonly]]:dark:bg-darkmode-800/50 [&[readonly]]:dark:border-transparent
    transition duration-200 ease-in-out w-full text-sm border-slate-200 shadow-sm rounded-md 
    placeholder:text-slate-400/90 focus:ring-4 focus:ring-primary focus:ring-opacity-20 
    focus:border-primary focus:border-opacity-40 dark:bg-darkmode-800 dark:border-transparent 
    dark:focus:ring-slate-700 dark:focus:ring-opacity-50 dark:placeholder:text-slate-500/80
    pl-12 py-3 px-4
  `;
  
  const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/\D/g, ''); // Solo números
    
    // Formatear automáticamente con barras
    if (inputValue.length >= 2) {
      inputValue = inputValue.substring(0, 2) + '/' + inputValue.substring(2);
    }
    if (inputValue.length >= 5) {
      inputValue = inputValue.substring(0, 5) + '/' + inputValue.substring(5, 9);
    }
    
    // Limitar a 10 caracteres (dd/mm/yyyy)
    if (inputValue.length > 10) {
      inputValue = inputValue.substring(0, 10);
    }
    
    // Crear evento sintético con el valor formateado
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: inputValue
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    if (onChange) {
      onChange(syntheticEvent);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute flex items-center justify-center w-10 h-full border rounded-l bg-slate-100 text-slate-500 dark:bg-darkmode-700 dark:border-darkmode-800 dark:text-slate-400">
          <Calendar className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="dd/mm/yyyy"
          value={value}
          onChange={handleInputChange}
          className={`${baseClasses} ${errorClasses} ${className}`}
          {...props}
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
    </div>
  );
};

export default DatePicker; 