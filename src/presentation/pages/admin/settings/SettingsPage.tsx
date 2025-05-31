import React, { useState } from 'react';
import { Settings, Shield, Bell, Mail, Database, Users, Save, Eye, EyeOff } from 'lucide-react';
import BaseLayout from '../../../../shared/components/layout/BaseLayout';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';
import { useToast } from '../../../../shared/components/ui/ToastContainer';

interface SettingsForm {
  // General Settings
  systemName: string;
  systemDescription: string;
  adminEmail: string;
  supportEmail: string;
  timezone: string;
  language: string;
  
  // Security Settings
  passwordMinLength: number;
  passwordRequireSpecial: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireUppercase: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  
  // Email Settings
  emailHost: string;
  emailPort: string;
  emailUsername: string;
  emailPassword: string;
  emailFromName: string;
  emailFromAddress: string;
  
  // Notifications
  emailNotifications: boolean;
  requestNotifications: boolean;
  userNotifications: boolean;
  systemNotifications: boolean;
  
  // API Settings
  apiRateLimit: number;
  apiTimeout: number;
  enableApiLogs: boolean;
}

const SettingsPage: React.FC = () => {
  const { showSuccess, showError, showWarning } = useToast();
  
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [emailTesting, setEmailTesting] = useState(false);
  
  const [settings, setSettings] = useState<SettingsForm>({
    // General Settings
    systemName: 'Vada Health',
    systemDescription: 'Sistema de Servicios de Salud',
    adminEmail: 'admin@ssc.com',
    supportEmail: 'soporte@ssc.com',
    timezone: 'America/Argentina/Buenos_Aires',
    language: 'es',
    
    // Security Settings
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    
    // Email Settings
    emailHost: 'smtp.gmail.com',
    emailPort: '587',
    emailUsername: '',
    emailPassword: '',
    emailFromName: 'Vada Health',
    emailFromAddress: 'noreply@ssc.com',
    
    // Notifications
    emailNotifications: true,
    requestNotifications: true,
    userNotifications: true,
    systemNotifications: true,
    
    // API Settings
    apiRateLimit: 1000,
    apiTimeout: 30,
    enableApiLogs: true,
  });

  const validateSettings = (): boolean => {
    // Basic validation
    if (!settings.systemName.trim()) {
      showWarning('Validación', 'El nombre del sistema es requerido');
      setActiveTab('general');
      return false;
    }
    
    if (!settings.adminEmail.trim() || !/\S+@\S+\.\S+/.test(settings.adminEmail)) {
      showWarning('Validación', 'El email del administrador debe ser válido');
      setActiveTab('general');
      return false;
    }

    if (settings.passwordMinLength < 6 || settings.passwordMinLength > 50) {
      showWarning('Validación', 'La longitud mínima de contraseña debe estar entre 6 y 50 caracteres');
      setActiveTab('security');
      return false;
    }

    if (settings.sessionTimeout < 5 || settings.sessionTimeout > 1440) {
      showWarning('Validación', 'El tiempo de sesión debe estar entre 5 y 1440 minutos');
      setActiveTab('security');
      return false;
    }

    if (settings.emailHost.trim() && !settings.emailUsername.trim()) {
      showWarning('Validación', 'Si especificas un servidor SMTP, debes incluir un usuario');
      setActiveTab('email');
      return false;
    }

    if (settings.apiRateLimit < 100 || settings.apiRateLimit > 10000) {
      showWarning('Validación', 'El límite de API debe estar entre 100 y 10000 peticiones por minuto');
      setActiveTab('api');
      return false;
    }

    return true;
  };

  const handleInputChange = (field: keyof SettingsForm, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSettings()) {
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate potential errors (5% chance)
      if (Math.random() < 0.05) {
        throw new Error('Error de conexión con el servidor');
      }
      
      showSuccess(
        'Configuración guardada', 
        'Los cambios se han aplicado correctamente'
      );
      setIsDirty(false);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error inesperado al guardar la configuración';
      
      showError('Error al guardar', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!settings.emailHost.trim() || !settings.emailUsername.trim()) {
      showWarning('Email incompleto', 'Configura el servidor SMTP antes de probar');
      return;
    }

    setEmailTesting(true);
    try {
      // Simulate email test
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate test result
      if (Math.random() < 0.8) {
        showSuccess(
          'Email de prueba enviado', 
          'Revisa tu bandeja de entrada'
        );
      } else {
        throw new Error('Error de autenticación SMTP');
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error al enviar email de prueba';
      
      showError('Error en prueba de email', errorMessage);
    } finally {
      setEmailTesting(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'security', name: 'Seguridad', icon: Shield },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
    { id: 'api', name: 'API', icon: Database },
  ];

  return (
    <BaseLayout title="Configuración del Sistema">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Configuración del Sistema
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              Administra la configuración general del sistema
              {isDirty && (
                <span className="ml-2 text-yellow-600 dark:text-yellow-400">
                  • Cambios sin guardar
                </span>
              )}
            </p>
          </div>
          
          {isDirty && (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    disabled={loading}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-darkmode-700'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit}>
              <div className="bg-white dark:bg-darkmode-600 shadow rounded-lg">
                {/* General Settings */}
                {activeTab === 'general' && (
                  <div className="p-6">
                    <div className="flex items-center mb-6">
                      <Settings className="w-5 h-5 text-gray-400 mr-2" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Configuración General
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                          Nombre del Sistema *
                        </label>
                        <Input
                          type="text"
                          value={settings.systemName}
                          onChange={(e) => handleInputChange('systemName', e.target.value)}
                          placeholder="Vada Health"
                          disabled={loading}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                          Email del Administrador *
                        </label>
                        <Input
                          type="email"
                          value={settings.adminEmail}
                          onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                          placeholder="admin@ejemplo.com"
                          disabled={loading}
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                          Descripción del Sistema
                        </label>
                        <textarea
                          value={settings.systemDescription}
                          onChange={(e) => handleInputChange('systemDescription', e.target.value)}
                          placeholder="Descripción del sistema..."
                          rows={3}
                          disabled={loading}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-400 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-darkmode-800 dark:text-white disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                          Email de Soporte
                        </label>
                        <Input
                          type="email"
                          value={settings.supportEmail}
                          onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                          placeholder="soporte@ejemplo.com"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                          Zona Horaria
                        </label>
                        <select
                          value={settings.timezone}
                          onChange={(e) => handleInputChange('timezone', e.target.value)}
                          disabled={loading}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-400 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-darkmode-800 dark:text-white disabled:opacity-50"
                        >
                          <option value="America/Argentina/Buenos_Aires">Buenos Aires (UTC-3)</option>
                          <option value="America/Sao_Paulo">São Paulo (UTC-3)</option>
                          <option value="America/Santiago">Santiago (UTC-3)</option>
                          <option value="UTC">UTC (UTC+0)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                          Idioma
                        </label>
                        <select
                          value={settings.language}
                          onChange={(e) => handleInputChange('language', e.target.value)}
                          disabled={loading}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-darkmode-400 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-darkmode-800 dark:text-white disabled:opacity-50"
                        >
                          <option value="es">Español</option>
                          <option value="en">English</option>
                          <option value="pt">Português</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                  <div className="p-6">
                    <div className="flex items-center mb-6">
                      <Shield className="w-5 h-5 text-gray-400 mr-2" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Configuración de Seguridad
                      </h3>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                          Políticas de Contraseña
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                              Longitud Mínima (6-50)
                            </label>
                            <Input
                              type="number"
                              value={settings.passwordMinLength}
                              onChange={(e) => handleInputChange('passwordMinLength', parseInt(e.target.value) || 8)}
                              min={6}
                              max={50}
                              disabled={loading}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                              Intentos Máximos de Login (3-10)
                            </label>
                            <Input
                              type="number"
                              value={settings.maxLoginAttempts}
                              onChange={(e) => handleInputChange('maxLoginAttempts', parseInt(e.target.value) || 5)}
                              min={3}
                              max={10}
                              disabled={loading}
                            />
                          </div>
                        </div>

                        <div className="mt-4 space-y-3">
                          {[
                            { key: 'passwordRequireSpecial', label: 'Requerir caracteres especiales' },
                            { key: 'passwordRequireNumbers', label: 'Requerir números' },
                            { key: 'passwordRequireUppercase', label: 'Requerir mayúsculas' },
                          ].map((option) => (
                            <div key={option.key} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={settings[option.key as keyof SettingsForm] as boolean}
                                onChange={(e) => handleInputChange(option.key as keyof SettingsForm, e.target.checked)}
                                disabled={loading}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded disabled:opacity-50"
                              />
                              <label className="ml-2 text-sm text-gray-700 dark:text-slate-300">
                                {option.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                          Sesiones
                        </h4>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                            Tiempo de Expiración de Sesión (5-1440 minutos)
                          </label>
                          <Input
                            type="number"
                            value={settings.sessionTimeout}
                            onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value) || 30)}
                            min={5}
                            max={1440}
                            disabled={loading}
                          />
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                            Las sesiones expirarán después de este tiempo de inactividad
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Email Settings */}
                {activeTab === 'email' && (
                  <div className="p-6">
                    <div className="flex items-center mb-6">
                      <Mail className="w-5 h-5 text-gray-400 mr-2" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Configuración de Email
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                          Servidor SMTP
                        </label>
                        <Input
                          type="text"
                          value={settings.emailHost}
                          onChange={(e) => handleInputChange('emailHost', e.target.value)}
                          placeholder="smtp.gmail.com"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                          Puerto
                        </label>
                        <Input
                          type="text"
                          value={settings.emailPort}
                          onChange={(e) => handleInputChange('emailPort', e.target.value)}
                          placeholder="587"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                          Usuario
                        </label>
                        <Input
                          type="text"
                          value={settings.emailUsername}
                          onChange={(e) => handleInputChange('emailUsername', e.target.value)}
                          placeholder="usuario@gmail.com"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                          Contraseña
                        </label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={settings.emailPassword}
                            onChange={(e) => handleInputChange('emailPassword', e.target.value)}
                            placeholder="Contraseña de aplicación"
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={loading}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                          Nombre del Remitente
                        </label>
                        <Input
                          type="text"
                          value={settings.emailFromName}
                          onChange={(e) => handleInputChange('emailFromName', e.target.value)}
                          placeholder="Vada Health"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                          Email del Remitente
                        </label>
                        <Input
                          type="email"
                          value={settings.emailFromAddress}
                          onChange={(e) => handleInputChange('emailFromAddress', e.target.value)}
                          placeholder="noreply@ssc.com"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <Button
                        type="button"
                        variant="outline-primary"
                        onClick={handleTestEmail}
                        disabled={loading || emailTesting || !settings.emailHost.trim()}
                        className="inline-flex items-center"
                      >
                        {emailTesting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                            Enviando prueba...
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4 mr-2" />
                            Enviar Email de Prueba
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Notifications Settings */}
                {activeTab === 'notifications' && (
                  <div className="p-6">
                    <div className="flex items-center mb-6">
                      <Bell className="w-5 h-5 text-gray-400 mr-2" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Configuración de Notificaciones
                      </h3>
                    </div>

                    <div className="space-y-6">
                      {[
                        { key: 'emailNotifications', label: 'Notificaciones por Email', description: 'Enviar notificaciones generales por email' },
                        { key: 'requestNotifications', label: 'Notificaciones de Pedidos', description: 'Notificar sobre nuevos pedidos y cambios de estado' },
                        { key: 'userNotifications', label: 'Notificaciones de Usuarios', description: 'Notificar sobre registro y cambios de usuarios' },
                        { key: 'systemNotifications', label: 'Notificaciones del Sistema', description: 'Notificar sobre errores y mantenimiento del sistema' },
                      ].map((notification) => (
                        <div key={notification.key} className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              type="checkbox"
                              checked={settings[notification.key as keyof SettingsForm] as boolean}
                              onChange={(e) => handleInputChange(notification.key as keyof SettingsForm, e.target.checked)}
                              disabled={loading}
                              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded disabled:opacity-50"
                            />
                          </div>
                          <div className="ml-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                              {notification.label}
                            </label>
                            <p className="text-xs text-gray-500 dark:text-slate-400">
                              {notification.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* API Settings */}
                {activeTab === 'api' && (
                  <div className="p-6">
                    <div className="flex items-center mb-6">
                      <Database className="w-5 h-5 text-gray-400 mr-2" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Configuración de API
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                          Límite de Peticiones (100-10000 por minuto)
                        </label>
                        <Input
                          type="number"
                          value={settings.apiRateLimit}
                          onChange={(e) => handleInputChange('apiRateLimit', parseInt(e.target.value) || 1000)}
                          min={100}
                          max={10000}
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                          Timeout (5-300 segundos)
                        </label>
                        <Input
                          type="number"
                          value={settings.apiTimeout}
                          onChange={(e) => handleInputChange('apiTimeout', parseInt(e.target.value) || 30)}
                          min={5}
                          max={300}
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.enableApiLogs}
                          onChange={(e) => handleInputChange('enableApiLogs', e.target.checked)}
                          disabled={loading}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded disabled:opacity-50"
                        />
                        <label className="ml-2 text-sm text-gray-700 dark:text-slate-300">
                          Habilitar Logs de API
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                        Registrar todas las peticiones a la API para auditoría
                      </p>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-darkmode-700 border-t border-gray-200 dark:border-darkmode-400 rounded-b-lg">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      * Campos requeridos
                    </div>
                    <Button
                      type="submit"
                      disabled={loading || !isDirty}
                      className="inline-flex items-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Guardar Configuración
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default SettingsPage; 