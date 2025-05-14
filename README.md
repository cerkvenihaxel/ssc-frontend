# SISCON - Sistema de Gestión de Pedidos de Medicamentos
## Ministerio de Salud Pública - Frontend

Este proyecto constituye el frontend del sistema de gestión, seguimiento y análisis de pedidos de medicamentos para SISCON, desarrollado en convenio con el Ministerio de Salud Pública.

## Descripción

El sistema permite la gestión integral de:
- Pedidos de medicamentos unitarios
- Pedidos masivos de medicamentos
- Seguimiento en tiempo real del estado de los pedidos
- Consultas y auditorías detalladas
- Análisis de datos y reportes

## Tecnologías Principales

- React 18
- TypeScript
- Vite
- ESLint para control de calidad de código

## Configuración del Proyecto

### Requisitos Previos
- Node.js (versión 18 o superior)
- npm o yarn

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build
```

## Configuración de ESLint

El proyecto utiliza una configuración extendida de ESLint para asegurar la calidad del código:

```js
export default tseslint.config({
  extends: [
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

## Plugins Adicionales

El proyecto puede utilizar plugins específicos para React:
- eslint-plugin-react-x
- eslint-plugin-react-dom

## Licencia y Derechos

© 2025 Global Médica S.A. Todos los derechos reservados.

Este software es propiedad de Global Médica S.A. y ha sido desarrollado en convenio con el Ministerio de Salud Pública. No se permite su uso, modificación o distribución sin autorización expresa por escrito.

## Contacto

Para soporte técnico o consultas, contactar a Global Médica S.A.
