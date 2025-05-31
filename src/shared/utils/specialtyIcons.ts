import { 
  Heart, 
  Brain, 
  Eye, 
  Ear,
  Baby,
  Bone,
  Pill,
  Scissors,
  Stethoscope,
  HeartHandshake,
  Activity,
  Zap,
  Shield,
  Siren,
  UserCheck,
  Microscope,
  Syringe,
  Droplets
} from 'lucide-react';
import type { ReactNode } from 'react';
import React from 'react';

// Mapeo de especialidades médicas a iconos y emojis
export interface SpecialtyIconInfo {
  icon: React.ComponentType<any>; // Componente de Lucide React
  emoji: string;
  color: {
    bg: string;
    text: string;
    darkBg: string;
    darkText: string;
  };
}

export const specialtyIconMap: Record<string, SpecialtyIconInfo> = {
  // Especialidades principales
  'cardiología': {
    icon: Heart,
    emoji: '❤️',
    color: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      darkBg: 'dark:bg-red-900/20',
      darkText: 'dark:text-red-200'
    }
  },
  'neurología': {
    icon: Brain,
    emoji: '🧠',
    color: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      darkBg: 'dark:bg-purple-900/20',
      darkText: 'dark:text-purple-200'
    }
  },
  'oftalmología': {
    icon: Eye,
    emoji: '👁️',
    color: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      darkBg: 'dark:bg-blue-900/20',
      darkText: 'dark:text-blue-200'
    }
  },
  'otorrinolaringología': {
    icon: Ear,
    emoji: '👂',
    color: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      darkBg: 'dark:bg-orange-900/20',
      darkText: 'dark:text-orange-200'
    }
  },
  'pediatría': {
    icon: Baby,
    emoji: '👶',
    color: {
      bg: 'bg-pink-100',
      text: 'text-pink-800',
      darkBg: 'dark:bg-pink-900/20',
      darkText: 'dark:text-pink-200'
    }
  },
  'traumatología': {
    icon: Bone,
    emoji: '🦴',
    color: {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      darkBg: 'dark:bg-amber-900/20',
      darkText: 'dark:text-amber-200'
    }
  },
  'ortopedia': {
    icon: Bone,
    emoji: '🦴',
    color: {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      darkBg: 'dark:bg-amber-900/20',
      darkText: 'dark:text-amber-200'
    }
  },
  'farmacología': {
    icon: Pill,
    emoji: '💊',
    color: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      darkBg: 'dark:bg-green-900/20',
      darkText: 'dark:text-green-200'
    }
  },
  'cirugía': {
    icon: Scissors,
    emoji: '✂️',
    color: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-800',
      darkBg: 'dark:bg-indigo-900/20',
      darkText: 'dark:text-indigo-200'
    }
  },
  'cirugía general': {
    icon: Scissors,
    emoji: '✂️',
    color: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-800',
      darkBg: 'dark:bg-indigo-900/20',
      darkText: 'dark:text-indigo-200'
    }
  },
  'medicina general': {
    icon: Stethoscope,
    emoji: '🩺',
    color: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      darkBg: 'dark:bg-blue-900/20',
      darkText: 'dark:text-blue-200'
    }
  },
  'medicina interna': {
    icon: Activity,
    emoji: '📈',
    color: {
      bg: 'bg-teal-100',
      text: 'text-teal-800',
      darkBg: 'dark:bg-teal-900/20',
      darkText: 'dark:text-teal-200'
    }
  },
  'psiquiatría': {
    icon: HeartHandshake,
    emoji: '🧘',
    color: {
      bg: 'bg-violet-100',
      text: 'text-violet-800',
      darkBg: 'dark:bg-violet-900/20',
      darkText: 'dark:text-violet-200'
    }
  },
  'radiología': {
    icon: Zap,
    emoji: '🔬',
    color: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      darkBg: 'dark:bg-yellow-900/20',
      darkText: 'dark:text-yellow-200'
    }
  },
  'anestesiología': {
    icon: Shield,
    emoji: '💤',
    color: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      darkBg: 'dark:bg-gray-700/20',
      darkText: 'dark:text-gray-200'
    }
  },
  'emergentología': {
    icon: Siren,
    emoji: '🚨',
    color: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      darkBg: 'dark:bg-red-900/20',
      darkText: 'dark:text-red-200'
    }
  },
  'medicina familiar': {
    icon: UserCheck,
    emoji: '👨‍👩‍👧‍👦',
    color: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-800',
      darkBg: 'dark:bg-emerald-900/20',
      darkText: 'dark:text-emerald-200'
    }
  },
  'patología': {
    icon: Microscope,
    emoji: '🔬',
    color: {
      bg: 'bg-slate-100',
      text: 'text-slate-800',
      darkBg: 'dark:bg-slate-700/20',
      darkText: 'dark:text-slate-200'
    }
  },
  'oncología': {
    icon: Activity,
    emoji: '🎗️',
    color: {
      bg: 'bg-rose-100',
      text: 'text-rose-800',
      darkBg: 'dark:bg-rose-900/20',
      darkText: 'dark:text-rose-200'
    }
  },
  'hematología': {
    icon: Droplets,
    emoji: '🩸',
    color: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      darkBg: 'dark:bg-red-900/20',
      darkText: 'dark:text-red-200'
    }
  },
  'neumología': {
    icon: Activity,
    emoji: '🫁',
    color: {
      bg: 'bg-cyan-100',
      text: 'text-cyan-800',
      darkBg: 'dark:bg-cyan-900/20',
      darkText: 'dark:text-cyan-200'
    }
  },
  'nefrología': {
    icon: Droplets,
    emoji: '🟢',
    color: {
      bg: 'bg-lime-100',
      text: 'text-lime-800',
      darkBg: 'dark:bg-lime-900/20',
      darkText: 'dark:text-lime-200'
    }
  },
  'ginecología': {
    icon: Heart,
    emoji: '🌸',
    color: {
      bg: 'bg-pink-100',
      text: 'text-pink-800',
      darkBg: 'dark:bg-pink-900/20',
      darkText: 'dark:text-pink-200'
    }
  },
  'urología': {
    icon: Droplets,
    emoji: '💧',
    color: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      darkBg: 'dark:bg-blue-900/20',
      darkText: 'dark:text-blue-200'
    }
  },
  'dermatología': {
    icon: UserCheck,
    emoji: '🧴',
    color: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      darkBg: 'dark:bg-orange-900/20',
      darkText: 'dark:text-orange-200'
    }
  }
};

// Función para obtener la información de icono de una especialidad
export const getSpecialtyIcon = (specialtyName: string): SpecialtyIconInfo => {
  // Normalizar el nombre de la especialidad (lowercase, trim)
  const normalizedName = specialtyName.toLowerCase().trim();
  
  // Buscar coincidencia exacta primero
  if (specialtyIconMap[normalizedName]) {
    return specialtyIconMap[normalizedName];
  }
  
  // Buscar coincidencias parciales
  for (const [key, value] of Object.entries(specialtyIconMap)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value;
    }
  }
  
  // Fallback: icono genérico de estetoscopio
  return {
    icon: Stethoscope,
    emoji: '🩺',
    color: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      darkBg: 'dark:bg-blue-900/20',
      darkText: 'dark:text-blue-200'
    }
  };
};

// Función para obtener las clases CSS completas de color
export const getSpecialtyColorClasses = (specialtyName: string): string => {
  const iconInfo = getSpecialtyIcon(specialtyName);
  return `${iconInfo.color.bg} ${iconInfo.color.text} ${iconInfo.color.darkBg} ${iconInfo.color.darkText}`;
};

// Función para renderizar el icono de una especialidad
export const renderSpecialtyIcon = (specialtyName: string, className: string = "w-3 h-3 mr-1"): ReactNode => {
  const iconInfo = getSpecialtyIcon(specialtyName);
  const IconComponent = iconInfo.icon;
  return React.createElement(IconComponent, { className });
}; 