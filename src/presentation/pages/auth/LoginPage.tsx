import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail } from 'lucide-react';
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

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

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-theme-1 to-theme-2 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow-xl p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-success/10">
                <Mail className="h-6 w-6 text-success" />
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                Revisa tu email
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                Hemos enviado un enlace de acceso a:
              </p>
              <p className="mt-1 text-sm font-medium text-primary">
                {getValues('email')}
              </p>
              <p className="mt-4 text-sm text-gray-600 dark:text-slate-400">
                Haz clic en el enlace del email para acceder al sistema.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-theme-1 to-theme-2 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white dark:bg-darkmode-600 rounded-lg shadow-xl p-8">
          <div>
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                Vada Health
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                Ingresa tu email para acceder
              </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
                  className="w-full"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Enviando...' : 'Enviar enlace de acceso'}
                </Button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Te enviaremos un enlace seguro para acceder sin contraseña
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 