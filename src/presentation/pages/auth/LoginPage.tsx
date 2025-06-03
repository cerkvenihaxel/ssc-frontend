import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, Heart, Activity, Stethoscope, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import '../../../assets/hospital-animation.css';

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
  
  // Refs para el efecto de mouse tracking
  const containerRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  // Efecto de seguimiento del mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !backgroundRef.current || !cardRef.current) return;

      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      // Calcular la posición relativa del mouse (de -1 a 1)
      const xPos = (clientX / innerWidth) - 0.5;
      const yPos = (clientY / innerHeight) - 0.5;
      
      // Factores de intensidad muy sutiles para diferentes elementos
      const backgroundIntensity = 3;
      const cardIntensity = 2;
      const floatingIntensity = 2;
      
      // Aplicar transformaciones al fondo
      const backgroundTransform = `translate3d(${xPos * backgroundIntensity}px, ${yPos * backgroundIntensity}px, 0)`;
      backgroundRef.current.style.transform = backgroundTransform;
      
      // Aplicar transformaciones a los elementos flotantes
      const floatingEmojis = backgroundRef.current.querySelector('.floating-emojis') as HTMLElement;
      const depthParticles = backgroundRef.current.querySelector('.depth-particles') as HTMLElement;
      
      if (floatingEmojis) {
        floatingEmojis.style.transform = `translate3d(${xPos * floatingIntensity}px, ${yPos * floatingIntensity}px, 0)`;
      }
      
      if (depthParticles) {
        depthParticles.style.transform = `translate3d(${xPos * (floatingIntensity + 1)}px, ${yPos * (floatingIntensity + 1)}px, 0)`;
      }
      
      // Aplicar efecto de perspectiva muy sutil a la card
      const cardRotateY = xPos * cardIntensity;
      const cardRotateX = -yPos * cardIntensity;
      const cardTransform = `perspective(1000px) rotateY(${cardRotateY}deg) rotateX(${cardRotateX}deg) translateZ(0)`;
      cardRef.current.style.transform = cardTransform;
    };

    const handleMouseLeave = () => {
      if (!backgroundRef.current || !cardRef.current) return;
      
      // Volver a la posición original suavemente
      backgroundRef.current.style.transform = 'translate3d(0, 0, 0)';
      cardRef.current.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0)';
      
      const floatingEmojis = backgroundRef.current.querySelector('.floating-emojis') as HTMLElement;
      const depthParticles = backgroundRef.current.querySelector('.depth-particles') as HTMLElement;
      
      if (floatingEmojis) {
        floatingEmojis.style.transform = 'translate3d(0, 0, 0)';
      }
      
      if (depthParticles) {
        depthParticles.style.transform = 'translate3d(0, 0, 0)';
      }
    };

    // Agregar event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    
    // Cleanup
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
      // TODO: Mostrar toast de error
    } finally {
      setIsLoading(false);
    }
  };

  // Professional Hospital Background Component
  const ProfessionalBackground = () => (
    <div ref={backgroundRef} className="hospital-background professional-breathing">
      {/* Floating Medical Emojis with Perspective */}
      <div className="floating-emojis">
        <div className="floating-emoji">🏥</div>
        <div className="floating-emoji">⚕️</div>
        <div className="floating-emoji">🩺</div>
        <div className="floating-emoji">💊</div>
        <div className="floating-emoji">🚑</div>
        <div className="floating-emoji">🔬</div>
      </div>
      
      {/* Subtle Depth Particles */}
      <div className="depth-particles">
        <div className="depth-particle"></div>
        <div className="depth-particle"></div>
        <div className="depth-particle"></div>
        <div className="depth-particle"></div>
      </div>
    </div>
  );

  if (isSubmitted) {
    return (
      <div ref={containerRef} className="min-h-screen flex items-center justify-center relative py-12 px-4 sm:px-6 lg:px-8 mouse-tracking-container">
        <ProfessionalBackground />
        <div className="max-w-md w-full space-y-8 relative z-10">
          <div ref={cardRef} className="bg-white/95 dark:bg-darkmode-600/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-white/20 mouse-tracking-card">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-success/10 mb-6">
                <Mail className="h-8 w-8 text-success" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
                Revisa tu email
              </h2>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">
                Hemos enviado un enlace de acceso a:
              </p>
              <p className="text-sm font-medium text-primary mb-4">
                {getValues('email')}
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">
                Haz clic en el enlace del email para acceder al sistema.
              </p>
              <div className="border-t border-gray-200 dark:border-darkmode-400 pt-4">
                <p className="text-xs text-gray-500 dark:text-slate-500">
                  Sistema de Salud Digital
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen flex items-center justify-center relative py-12 px-4 sm:px-6 lg:px-8 mouse-tracking-container">
      <ProfessionalBackground />
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div ref={cardRef} className="bg-white/95 dark:bg-darkmode-600/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-white/20 mouse-tracking-card">
          <div>
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center space-x-3">
                  <Heart className="h-8 w-8 text-red-500" />
                  <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    Vada Health
                  </h1>
                  <Stethoscope className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <p className="text-gray-600 dark:text-slate-400 text-base mb-2">
                Sistema de Salud Integral
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-500">
                Ingresa tu email para acceder
              </p>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="tu@email.com"
                  error={errors.email?.message}
                  leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
                />
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Enviando...' : 'Enviar enlace de acceso'}
                </Button>
              </div>

              <div className="text-center space-y-4">
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Te enviaremos un enlace seguro para acceder sin contraseña
                </p>
                
                <div className="border-t border-gray-200 dark:border-darkmode-400 pt-4">
                  <div className="flex items-center justify-center space-x-6 text-xs text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-3 w-3 text-green-500" />
                      <span>Monitoreo 24/7</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-3 w-3 text-blue-500" />
                      <span>Datos Seguros</span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 