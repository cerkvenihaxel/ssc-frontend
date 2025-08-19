import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Mail, 
  Heart, 
  Activity, 
  Stethoscope, 
  Shield, 
  Zap,
  Lock,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';

interface LoginFormData {
  email: string;
}

const loginSchema = yup.object({
  email: yup
    .string()
    .email('Ingrese un email válido')
    .required('El email es requerido'),
});

const LoginPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  
  // Refs para el efecto de parallax suave
  const containerRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  // Efecto de parallax suave
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!backgroundRef.current) return;

      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const xPos = (clientX / innerWidth) - 0.5;
      const yPos = (clientY / innerHeight) - 0.5;
      
      const intensity = 10;
      backgroundRef.current.style.transform = `translate3d(${xPos * intensity}px, ${yPos * intensity}px, 0)`;
    };

    const handleMouseLeave = () => {
      if (!backgroundRef.current) return;
      backgroundRef.current.style.transform = 'translate3d(0, 0, 0)';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await login(data.email);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error al solicitar magic link:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Componente del fondo médico profesional
  const MedicalBackground = () => (
    <div className="fixed inset-0 overflow-hidden">
      {/* Gradiente principal */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-darkmode-900 dark:via-darkmode-800 dark:to-darkmode-900"></div>
      
      {/* Patrón de cuadrícula médica */}
      <div 
        ref={backgroundRef}
        className="absolute inset-0 opacity-30 dark:opacity-20 transition-transform duration-500 ease-out"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25px 25px, rgba(59, 130, 246, 0.1) 2px, transparent 0),
            radial-gradient(circle at 75px 75px, rgba(16, 185, 129, 0.1) 1px, transparent 0)
          `,
          backgroundSize: '100px 100px'
        }}
      ></div>
      
      {/* Elementos médicos flotantes */}
      <div className="absolute inset-0">
        {/* Iconos médicos flotantes */}
        <div className="absolute top-20 left-10 animate-float-1">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Stethoscope className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        <div className="absolute top-40 right-16 animate-float-2">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Heart className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
        
        <div className="absolute bottom-32 left-20 animate-float-3">
          <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Activity className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        
        <div className="absolute bottom-20 right-10 animate-float-1">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        
        <div className="absolute top-1/3 left-1/4 animate-float-2">
          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </div>
      
      {/* Efectos de luz */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-green-400/10 dark:bg-green-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
    </div>
  );

  if (isSubmitted) {
    return (
      <div ref={containerRef} className="min-h-screen flex items-center justify-center relative py-12 px-4 sm:px-6 lg:px-8">
        <MedicalBackground />
        
        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="bg-white/90 dark:bg-darkmode-600/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-darkmode-400/20 p-8 relative overflow-hidden">
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-green-400/20 to-transparent rounded-bl-full"></div>
            
            <div className="text-center relative">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 mb-6 shadow-lg">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                ¡Revisa tu email!
              </h2>
              
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-slate-400">
                  Hemos enviado un enlace seguro de acceso a:
                </p>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <p className="font-semibold text-blue-900 dark:text-blue-200">
                    {getValues('email')}
                  </p>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Haz clic en el enlace del email para acceder al Sistema de Salud Digital de forma segura.
                </p>
                
                <div className="flex items-center justify-center space-x-6 pt-4 border-t border-gray-200 dark:border-darkmode-400">
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-slate-400">
                    <Lock className="h-3 w-3 text-green-500" />
                    <span>Enlace Cifrado</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-slate-400">
                    <Zap className="h-3 w-3 text-yellow-500" />
                    <span>Acceso Rápido</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen flex items-center justify-center relative py-12 px-4 sm:px-6 lg:px-8">
      <MedicalBackground />
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="bg-white/90 dark:bg-darkmode-600/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-darkmode-400/20 p-8 relative overflow-hidden transform transition-all duration-300 hover:shadow-3xl hover:scale-[1.01]">
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-green-400/20 to-transparent rounded-tr-full"></div>
          
          <div className="relative">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Plus className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                VadaSoft
              </h1>
              <p className="text-lg text-gray-600 dark:text-slate-400 mb-1">
                Sistema de Salud Digital
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-500">
                Gestión Integral de Servicios Médicos
              </p>
            </div>
            

            
            {/* Formulario */}
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Email de acceso
                </label>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="medico@hospital.com"
                  error={errors.email?.message}
                  leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
                  className="text-base"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02] focus:ring-4 focus:ring-blue-500/25"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Enviando enlace seguro...' : 'Acceder al Sistema'}
              </Button>

              {/* Información de seguridad */}
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Recibirás un enlace seguro para acceder sin contraseña
                  </p>
                </div>
                
                <div className="border-t border-gray-200 dark:border-darkmode-400 pt-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center space-y-1">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span className="text-xs text-gray-500 dark:text-slate-400">Seguro</span>
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                      <Activity className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-gray-500 dark:text-slate-400">24/7</span>
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-xs text-gray-500 dark:text-slate-400">Rápido</span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* CSS personalizado para animaciones */}
      <style>{`
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(3deg); }
        }
        .animate-float-1 { animation: float-1 6s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 8s ease-in-out infinite; }
        .animate-float-3 { animation: float-3 7s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default LoginPage; 