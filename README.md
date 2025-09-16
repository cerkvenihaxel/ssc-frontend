# 🏥 Vada Health - Frontend React

**Frontend React para el Sistema de Servicios de Salud (SSC)**

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.1-blue.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-purple.svg)](https://vitejs.dev/)

---

## 🚀 **Características Principales**

### 🔐 **Sistema de Autenticación**
- **Magic Links** sin contraseñas
- **JWT** con manejo automático de tokens
- **Rutas protegidas** por permisos
- **Redirección automática** según rol de usuario

### 👥 **Roles y Permisos**
- **Administrador**: Gestión completa del sistema
- **Auditor**: Auditoría de pedidos y solicitudes
- **Efector**: Creación y gestión de pedidos
- **Proveedor**: Cotizaciones y órdenes
- **Médico**: Solicitudes médicas
- **Afiliado**: Perfil y solicitudes personales

### 🎨 **UI/UX Moderno**
- **Diseño responsivo** con Tailwind CSS
- **Tema médico/sanitario** profesional
- **Componentes reutilizables** siguiendo SOLID
- **Animaciones suaves** estilo Midone
- **Modo oscuro** incluido

### 🏗️ **Arquitectura Clean Code**
- **Clean Architecture** con capas separadas
- **Principios SOLID** aplicados
- **DRY** - No repetir código
- **KISS** - Mantener simplicidad
- **Repository Pattern** para datos
- **Dependency Injection** con React Context

---

## 📋 **Prerrequisitos**

```bash
# Node.js 18+
node --version

# npm o yarn
npm --version
```

---

## 🛠️ **Instalación**

### **1. Clonar e Instalar Dependencias**
```bash
cd ssc-frontend
npm install
```

### **2. Configurar Variables de Entorno**
```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar variables según tu configuración
nano .env
```

### **3. Configurar Backend**
Asegúrate de que el backend SSC esté ejecutándose en `http://localhost:3000`

### **4. Iniciar Desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

---

## 🗂️ **Estructura del Proyecto**

```
src/
├── domain/                     # Capa de Dominio
│   ├── entities/              # Entidades de negocio
│   │   └── User.ts           # Usuario, Rol, LoginResponse
│   ├── constants/            # Constantes del dominio
│   │   └── permissions.ts    # Permisos y roles
│   └── repositories/         # Interfaces de repositorios
│       └── AuthRepository.ts # Contrato de autenticación
│
├── application/               # Capa de Aplicación
│   └── services/             # Servicios de negocio
│       └── AuthService.ts    # Lógica de autenticación
│
├── infrastructure/           # Capa de Infraestructura
│   ├── http/                # Cliente HTTP
│   │   └── ApiClient.ts     # Cliente API centralizado
│   └── repositories/        # Implementaciones
│       └── HttpAuthRepository.ts # Repo HTTP de auth
│
├── presentation/            # Capa de Presentación
│   ├── contexts/           # Contextos de React
│   │   └── AuthContext.tsx # Estado global de auth
│   └── pages/              # Páginas de la aplicación
│       ├── auth/           # Páginas de autenticación
│       ├── admin/          # Páginas de administrador
│       └── ...             # Otras páginas por rol
│
└── shared/                 # Componentes compartidos
    └── components/         # Componentes UI reutilizables
        ├── ui/            # Componentes básicos
        └── layout/        # Layouts y navegación
```

---

## 🔐 **Flujo de Autenticación**

### **1. Login con Magic Link**
```typescript
// Usuario ingresa email
await login('admin@sistema.com');
// → Se envía magic link al email
```

### **2. Verificación del Link**
```typescript
// Usuario hace clic en el link del email
// → Frontend captura token y verifica
const response = await verifyMagicLink(token);
// → Usuario autenticado y redirigido
```

### **3. Gestión Automática de Sesión**
```typescript
// Token almacenado automáticamente
// Refresh automático antes de expiración
// Logout limpia toda la sesión
```

---

## 👥 **Usuarios de Prueba**

| Email | Rol | Ruta Default |
|-------|-----|--------------|
| `admin@sistema.com` | Administrador | `/admin/dashboard` |
| `auditor@sistema.com` | Auditor | `/auditor/requests` |
| `efector@hospital.com` | Efector | `/efector/requests` |
| `medico@hospital.com` | Médico | `/medico/solicitudes` |
| `proveedor1@farmacia.com` | Proveedor | `/proveedor/quotations` |

---

## 🛡️ **Sistema de Permisos**

### **Verificar Permisos en Componentes**
```typescript
import { useAuth } from '../contexts/AuthContext';
import { PERMISSIONS } from '../domain/constants/permissions';

const MyComponent = () => {
  const { hasPermission } = useAuth();
  
  if (!hasPermission(PERMISSIONS.CREATE_USERS)) {
    return <div>Sin permisos</div>;
  }
  
  return <div>Contenido autorizado</div>;
};
```

### **Rutas Protegidas**
```typescript
<ProtectedRoute requiredPermission={PERMISSIONS.ADMIN_ACCESS}>
  <AdminDashboard />
</ProtectedRoute>
```

---

## 🎨 **Componentes UI**

### **Button**
```typescript
<Button variant="primary" size="lg" loading={isLoading}>
  Guardar
</Button>
```

### **Input**
```typescript
<Input
  label="Email"
  type="email"
  error={errors.email?.message}
  leftIcon={<Mail className="h-5 w-5" />}
/>
```

### **LoadingSpinner**
```typescript
<LoadingSpinner size="lg" />
```

---

## 📱 **Rutas Disponibles**

### **Públicas**
- `/login` - Página de inicio de sesión
- `/auth/verify` - Verificación de magic link
- `/unauthorized` - Acceso no autorizado

### **Administrador**
- `/admin/dashboard` - Dashboard principal
- `/admin/users` - Gestión de usuarios
- `/admin/requests` - Gestión de pedidos
- `/admin/analytics` - Reportes y analytics

### **Otros Roles**
- `/auditor/requests` - Panel de auditoría
- `/efector/requests` - Panel de efectores
- `/proveedor/quotations` - Panel de proveedores
- `/medico/solicitudes` - Panel médico
- `/afiliado/profile` - Panel de afiliados

---

## 🔧 **Scripts Disponibles**

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo

# Construcción
npm run build        # Construir para producción
npm run preview      # Previsualizar build de producción

# Calidad de código
npm run lint         # Ejecutar ESLint
```

---

## 🌐 **Integración con Backend**

### **Configuración de API**
```typescript
// src/infrastructure/http/ApiClient.ts
const apiClient = new ApiClient('http://localhost:3000');
```

### **Endpoints Utilizados**
- `POST /api/v1/auth/login` - Solicitar magic link
- `GET /api/v1/auth/verify` - Verificar magic link
- `GET /api/v1/auth/me` - Obtener usuario actual
- `POST /api/v1/auth/logout` - Cerrar sesión

---

## 🚀 **Deployment**

### **Build de Producción**
```bash
npm run build
```

### **Variables de Entorno de Producción**
```bash
VITE_API_BASE_URL=https://api.ssc.com
VITE_APP_NAME=Vada Health
VITE_DEV_MODE=false
```

---

## 🧪 **Testing**

```bash
# Tests unitarios (próximamente)
npm run test

# Tests e2e (próximamente)
npm run test:e2e
```

---

## 📚 **Tecnologías Utilizadas**

- **React 19.1.0** - Framework principal
- **TypeScript 5.8.3** - Tipado estático
- **Vite 6.3.5** - Build tool y dev server
- **Tailwind CSS 3.4.1** - Framework CSS
- **React Router 6.21.1** - Enrutamiento
- **React Hook Form 7.49.3** - Manejo de formularios
- **Yup 1.3.3** - Validación de esquemas
- **Lucide React 0.307.0** - Iconos
- **Dayjs 1.11.10** - Manejo de fechas

---

## 🤝 **Contribución**

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

---

## 📄 **Licencia**

Este proyecto es privado y confidencial.

---

## 📞 **Soporte**

Para soporte técnico:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/docs
- **Documentación**: Ver archivos en `/docs`

---

**✨ ¡Frontend React listo para integración con el backend SSC! ✨**
