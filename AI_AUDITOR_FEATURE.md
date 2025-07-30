# 🤖 Funcionalidad de Análisis Inteligente - Auditoría Médica

## 📋 Descripción

Esta funcionalidad permite a los auditores médicos utilizar inteligencia artificial para analizar cotizaciones médicas y generar recomendaciones profesionales automáticamente.

## 🚀 Características

### ✨ Análisis Automático
- **Análisis para Aprobación**: Genera notas de auditoría y criterios para aprobar cotizaciones
- **Análisis para Rechazo**: Proporciona razones de rechazo y criterios para rechazar cotizaciones
- **Efecto de Escritura**: Simula la escritura en tiempo real como ChatGPT

### 🎯 Criterios de Evaluación
La IA evalúa los siguientes criterios:
- **Precio Razonable**: Compara con precios de mercado y presupuesto
- **Calidad Adecuada**: Verifica especificaciones y marcas
- **Tiempo de Entrega Aceptable**: Considera la urgencia del caso
- **Proveedor Confiable**: Evalúa historial y reputación
- **Documentación Completa**: Verifica que todos los items estén bien especificados

## 🔧 Configuración

### 1. Variable de Entorno
Agregar la clave de API de OpenAI al archivo `.env`:

```env
VITE_OPENAI_API_KEY=tu_clave_de_api_aqui
```

### 2. Obtener Clave de API
1. Crear una cuenta en [OpenAI](https://platform.openai.com/)
2. Generar una clave de API en la sección de API Keys
3. Copiar la clave y agregarla al archivo `.env`

## 📱 Uso

### En la Página de Auditoría
1. Navegar a `/auditor/audit-requests/{id}/audit`
2. Encontrar la sección "Análisis Inteligente"
3. Hacer clic en:
   - **"Análisis para Aprobación"** para generar recomendaciones de aprobación
   - **"Análisis para Rechazo"** para generar razones de rechazo

### Resultados Automáticos
La IA automáticamente:
- Completa las **Notas del Auditor**
- Marca los **Criterios de Auditoría** correspondientes
- Sugiere un **Costo Aprobado** (si aplica)
- Proporciona **Razón de Rechazo** (si aplica)

## 🏗️ Arquitectura

### Servicios
- `AIAuditorService`: Maneja las llamadas a la API de OpenAI
- `useAIAuditor`: Hook personalizado para el estado y lógica de IA

### Componentes
- Sección de análisis inteligente en `AuditQuotationPage`
- Efecto de escritura en tiempo real
- Indicadores de estado (cargando, error, completado)

## 🔒 Seguridad

- La clave de API se maneja solo en el frontend
- No se almacena en localStorage o sessionStorage
- Se recomienda usar variables de entorno en producción

## 🐛 Solución de Problemas

### Error: "OpenAI API key not found"
- Verificar que `VITE_OPENAI_API_KEY` esté definida en `.env`
- Reiniciar el servidor de desarrollo

### Error: "OpenAI API error"
- Verificar que la clave de API sea válida
- Comprobar el saldo de la cuenta de OpenAI
- Verificar la conectividad a internet

### Análisis no funciona
- Verificar que la cotización tenga todos los datos necesarios
- Comprobar que el formato de los datos sea correcto
- Revisar la consola del navegador para errores

## 📊 Ejemplo de Respuesta

```json
{
  "notes": "Análisis detallado de la cotización médica...",
  "rejection_reason": "Precio excede el presupuesto máximo permitido",
  "audit_criteria": {
    "price_reasonable": false,
    "quality_adequate": true,
    "delivery_time_acceptable": true,
    "provider_reliable": true,
    "documentation_complete": true
  },
  "approved_cost": 75000
}
```

## 🔄 Flujo de Trabajo

1. **Cargar Cotización**: Se cargan los datos de la cotización
2. **Análisis de IA**: El usuario solicita análisis inteligente
3. **Procesamiento**: La IA analiza los datos y genera recomendaciones
4. **Aplicación**: Los resultados se aplican automáticamente a los campos
5. **Revisión**: El auditor puede modificar los resultados si es necesario
6. **Decisión Final**: Se aprueba o rechaza la cotización

## 🎨 UI/UX

- **Diseño Moderno**: Gradiente azul-púrpura para la sección de IA
- **Indicadores Visuales**: Spinners, iconos y estados de carga
- **Feedback Inmediato**: Mensajes de error y éxito
- **Efecto de Escritura**: Simula la escritura en tiempo real
- **Responsive**: Funciona en dispositivos móviles y desktop 