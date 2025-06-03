# Módulo de Depósito - Frontend Admin

Este módulo contiene las páginas de administración para gestionar artículos del depósito.

## Páginas Implementadas

### 1. ArticulosPage
**Ruta:** `/admin/deposito/articulos`

Página principal que muestra la lista de todos los artículos con:
- **Estadísticas:** Total de artículos, en stock, sin stock, precio promedio
- **Filtros avanzados:** Por proveedor, stock, rango de precios, búsqueda
- **Tabla paginada** con información de artículos
- **Acciones:** Ver, editar, eliminar artículos
- **Formato de precios** en pesos argentinos (ARS)
- **Badges de stock** con códigos de color (sin stock, stock bajo, en stock)

### 2. ArticuloCreatePage
**Ruta:** `/admin/deposito/articulos/create`

Formulario para crear nuevos artículos con:
- **Información básica:** Proveedor, código, nombre, descripción, presentación
- **Gestión de stock:** Stock inicial opcional
- **Precios:** Precio principal, precio de compra/venta con IVA
- **Grupos:** Asociación con múltiples grupos de artículos
- **Validaciones:** Campos requeridos, formatos numéricos
- **Datos adicionales:** ID de marca, información comercial

### 3. ArticuloDetailsPage
**Ruta:** `/admin/deposito/articulos/:id`

Vista detallada de un artículo que incluye:
- **Información completa** del artículo
- **Datos del proveedor** asociado
- **Grupos** a los que pertenece
- **Historial de precios** con última actualización
- **Estado del stock** con badge visual
- **Información del sistema** (fechas, IDs)

### 4. ArticuloEditPage
**Ruta:** `/admin/deposito/articulos/:id/edit`

Formulario de edición que permite:
- **Modificar** todos los campos del artículo
- **Gestionar asociaciones** con grupos
- **Actualizar precios** (automáticamente actualiza lastPriceUpdate)
- **Cambiar stock** y otros datos comerciales
- **Validaciones** y manejo de errores

## Características Técnicas

### Gestión de Estado
- **React Hooks** para estado local
- **useEffect** para carga de datos
- **Estados de loading** para UX mejorada
- **Manejo de errores** con mensajes informativos

### Integraciones API
- **Artículos:** `/api/v1/deposito/articulos`
- **Proveedores:** `/api/v1/proveedores`
- **Grupos:** `/api/v1/deposito/grupos`
- **Autenticación:** Bearer token en localStorage

### Componentes Utilizados
- **BaseLayout:** Layout principal del admin
- **Button:** Botones con variantes y estados
- **Input:** Campos de entrada con validación
- **Iconos:** Lucide React para iconografía
- **Navegación:** React Router para SPA

### Funcionalidades Avanzadas

#### Filtros y Búsqueda
- **Búsqueda en tiempo real** por nombre, código, descripción
- **Filtro por proveedor** con dropdown
- **Filtro por stock** (todos, en stock, sin stock)
- **Filtro por rango de precios** (bajo, medio, alto)

#### Gestión de Grupos
- **Selección múltiple** de grupos
- **Visualización de grupos** con badges
- **Agregar/quitar grupos** dinámicamente
- **Carga asíncrona** de grupos disponibles

#### Formateo y Visualización
- **Precios en formato monetario** argentino
- **Fechas localizadas** en español
- **Estados visuales** con códigos de color
- **Responsive design** para diferentes pantallas

## Patrones de Diseño

### Arquitectura
- **Separación de responsabilidades** (UI, lógica, datos)
- **Componentes reutilizables** del design system
- **Consistencia visual** con otras páginas admin
- **Patrones establecidos** del módulo healthcare

### UX/UI
- **Loading states** durante operaciones asíncronas
- **Confirmaciones** para acciones destructivas
- **Breadcrumbs** con navegación clara
- **Mensajes de error** informativos
- **Estados vacíos** con call-to-actions

## Integración con el Sistema

### Dependencias del Backend
- **API de Depósito** completamente implementada
- **Autenticación** con JWT tokens
- **Gestión de errores** HTTP estándar
- **Validaciones** en ambos extremos

### Rutas de Navegación
```typescript
// Rutas principales
/admin/deposito/articulos              // Lista de artículos
/admin/deposito/articulos/create       // Crear artículo
/admin/deposito/articulos/:id          // Ver detalles
/admin/deposito/articulos/:id/edit     // Editar artículo
```

### Permisos y Roles
- **Administradores:** Acceso completo CRUD
- **Autenticación requerida** para todas las operaciones
- **Validación de tokens** en cada request

## Próximos Pasos

### Funcionalidades Pendientes
- **Gestión de grupos de artículos** (CRUD completo)
- **Reportes y analytics** de inventario
- **Importación/exportación** de artículos
- **Historial de cambios** de precios y stock

### Mejoras Técnicas
- **Optimización de renders** con React.memo
- **Cache de datos** con React Query
- **Tipos TypeScript** más estrictos
- **Testing** con Jest y React Testing Library

### Integraciones Futuras
- **Sistema de efectores** para pedidos
- **Alertas de stock bajo** automatizadas
- **Sincronización** con sistemas externos
- **Auditoría** de cambios y accesos 