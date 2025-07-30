# 🚀 GUÍA DE IMPLEMENTACIÓN BACKEND - MÓDULO DE AUDITORÍA

## 📋 RESUMEN EJECUTIVO

Este documento proporciona las especificaciones técnicas detalladas para implementar las APIs del módulo de auditoría en el backend. El frontend ya está preparado y espera estas rutas específicas para funcionar correctamente.

## 🎯 ENDPOINTS CRÍTICOS (FASE 1)

### 1. GET /api/auditor/pending-quotations
**Prioridad**: CRÍTICA
**Estado Frontend**: ✅ IMPLEMENTADO
**Descripción**: Obtener cotizaciones pendientes de auditoría

**Query Parameters**:
```
status (opcional): string
provider_id (opcional): string  
date_from (opcional): YYYY-MM-DD
date_to (opcional): YYYY-MM-DD
patient_name (opcional): string
medical_order_id (opcional): string
page (opcional): number (default: 1)
limit (opcional): number (default: 10)
```

**Response Esperado**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "quotation_id": "Q001",
        "medical_order_id": "MO-2025-000018",
        "provider_id": "P001",
        "provider_name": "Proveedor A",
        "patient_name": "Juancito Mercedes",
        "total_cost": 81000,
        "delivery_days": 5,
        "items_count": 3,
        "status": "sent",
        "created_at": "2025-07-30T16:37:00Z",
        "updated_at": "2025-07-30T16:37:00Z",
        "items": [
          {
            "item_id": "I001",
            "name": "Material Médico A",
            "description": "Material médico especializado",
            "quantity": 2,
            "unit_cost": 25000,
            "total_cost": 50000,
            "category": "Materiales"
          }
        ],
        "medical_order": {
          "medical_order_id": "MO-2025-000018",
          "patient_name": "Juancito Mercedes",
          "doctor_name": "Dr. García",
          "specialty": "Cardiología",
          "urgency": "high",
          "created_at": "2025-07-25T10:00:00Z"
        }
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "total_pages": 3
  }
}
```

### 2. GET /api/auditor/quotations/{id}
**Prioridad**: CRÍTICA
**Estado Frontend**: ✅ IMPLEMENTADO
**Descripción**: Obtener detalle de una cotización específica

**Path Parameters**:
```
id: string (ID de la cotización)
```

**Response Esperado**:
```json
{
  "success": true,
  "data": {
    "quotation_id": "Q001",
    "medical_order_id": "MO-2025-000018",
    "provider_id": "P001",
    "provider_name": "Proveedor A",
    "patient_name": "Juancito Mercedes",
    "total_cost": 81000,
    "delivery_days": 5,
    "items_count": 3,
    "status": "sent",
    "created_at": "2025-07-30T16:37:00Z",
    "updated_at": "2025-07-30T16:37:00Z",
    "items": [...],
    "medical_order": {...}
  }
}
```

### 3. PUT /api/auditor/audit-requests/{id}
**Prioridad**: CRÍTICA
**Estado Frontend**: ✅ IMPLEMENTADO
**Descripción**: Aprobar o rechazar una cotización

**Path Parameters**:
```
id: string (ID de la cotización)
```

**Request Body**:
```json
{
  "audit_status": "approved|rejected",
  "approved_cost": "number|null",
  "auditor_notes": "string|null",
  "rejection_reason": "string|null",
  "audit_criteria": {
    "price_reasonable": "boolean",
    "quality_adequate": "boolean", 
    "delivery_time_acceptable": "boolean",
    "provider_reliable": "boolean",
    "documentation_complete": "boolean"
  }
}
```

**Response Esperado**:
```json
{
  "success": true,
  "data": {
    "audit_request_id": "AR001",
    "quotation_id": "Q001",
    "audit_status": "approved",
    "approved_cost": 81000,
    "auditor_notes": "Cotización aprobada",
    "audited_at": "2025-01-15T10:30:00Z"
  }
}
```

## 🔧 ENDPOINTS SECUNDARIOS (FASE 2)

### 4. GET /api/auditor/completed-requests
**Prioridad**: IMPORTANTE
**Estado Frontend**: ✅ IMPLEMENTADO
**Descripción**: Obtener solicitudes finalizadas

**Query Parameters**: Mismos que pending-quotations
**Response**: Misma estructura que pending-quotations

### 5. GET /api/auditor/statistics
**Prioridad**: IMPORTANTE
**Estado Frontend**: ✅ IMPLEMENTADO
**Descripción**: Obtener estadísticas de auditoría

**Response Esperado**:
```json
{
  "success": true,
  "data": {
    "total_requests": 150,
    "pending_requests": 25,
    "approved_requests": 100,
    "rejected_requests": 25,
    "average_processing_time": 2.5,
    "cost_savings": 1500000
  }
}
```

## 🗄️ ESTRUCTURA DE BASE DE DATOS

### Tabla: quotations
```sql
CREATE TABLE quotations (
  quotation_id VARCHAR(50) PRIMARY KEY,
  medical_order_id VARCHAR(50) NOT NULL,
  provider_id VARCHAR(50) NOT NULL,
  provider_name VARCHAR(255) NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  total_cost DECIMAL(15,2) NOT NULL,
  delivery_days INT NOT NULL,
  items_count INT NOT NULL,
  status ENUM('pending', 'sent', 'approved', 'rejected', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (medical_order_id) REFERENCES medical_orders(medical_order_id),
  FOREIGN KEY (provider_id) REFERENCES providers(provider_id)
);
```

### Tabla: quotation_items
```sql
CREATE TABLE quotation_items (
  item_id VARCHAR(50) PRIMARY KEY,
  quotation_id VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity INT NOT NULL,
  unit_cost DECIMAL(15,2) NOT NULL,
  total_cost DECIMAL(15,2) NOT NULL,
  category VARCHAR(100),
  
  FOREIGN KEY (quotation_id) REFERENCES quotations(quotation_id)
);
```

### Tabla: audit_requests
```sql
CREATE TABLE audit_requests (
  audit_request_id VARCHAR(50) PRIMARY KEY,
  quotation_id VARCHAR(50) NOT NULL,
  medical_order_id VARCHAR(50) NOT NULL,
  provider_id VARCHAR(50) NOT NULL,
  audit_status ENUM('pending', 'in_progress', 'approved', 'rejected', 'completed') DEFAULT 'pending',
  auditor_notes TEXT,
  rejection_reason TEXT,
  original_order_cost DECIMAL(15,2),
  quoted_cost DECIMAL(15,2) NOT NULL,
  approved_cost DECIMAL(15,2),
  audit_type ENUM('manual', 'ai', 'hybrid') DEFAULT 'manual',
  auditor_id VARCHAR(50),
  audited_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (quotation_id) REFERENCES quotations(quotation_id),
  FOREIGN KEY (medical_order_id) REFERENCES medical_orders(medical_order_id),
  FOREIGN KEY (provider_id) REFERENCES providers(provider_id),
  FOREIGN KEY (auditor_id) REFERENCES users(user_id)
);
```

### Tabla: audit_criteria
```sql
CREATE TABLE audit_criteria (
  audit_request_id VARCHAR(50) PRIMARY KEY,
  price_reasonable BOOLEAN DEFAULT FALSE,
  quality_adequate BOOLEAN DEFAULT FALSE,
  delivery_time_acceptable BOOLEAN DEFAULT FALSE,
  provider_reliable BOOLEAN DEFAULT FALSE,
  documentation_complete BOOLEAN DEFAULT FALSE,
  
  FOREIGN KEY (audit_request_id) REFERENCES audit_requests(audit_request_id)
);
```

## 🔐 AUTENTICACIÓN Y AUTORIZACIÓN

### Headers Requeridos
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

### Permisos Requeridos
- `VIEW_AUDIT_REQUESTS`: Ver solicitudes de auditoría
- `UPDATE_AUDIT_REQUESTS`: Aprobar/rechazar cotizaciones
- `VIEW_AUDIT_STATISTICS`: Ver estadísticas

### Roles con Acceso
- `auditor`: Acceso completo
- `admin`: Acceso completo
- `provider`: Solo lectura de sus cotizaciones

## ⚠️ VALIDACIONES CRÍTICAS

### 1. Validaciones de Entrada
```javascript
// Ejemplo de validaciones
const validateQuotationFilters = (filters) => {
  if (filters.date_from && !isValidDate(filters.date_from)) {
    throw new Error('date_from debe ser una fecha válida (YYYY-MM-DD)');
  }
  if (filters.date_to && !isValidDate(filters.date_to)) {
    throw new Error('date_to debe ser una fecha válida (YYYY-MM-DD)');
  }
  if (filters.page && (filters.page < 1 || !Number.isInteger(filters.page))) {
    throw new Error('page debe ser un número entero mayor a 0');
  }
  if (filters.limit && (filters.limit < 1 || filters.limit > 100)) {
    throw new Error('limit debe estar entre 1 y 100');
  }
};
```

### 2. Reglas de Negocio
```javascript
// Solo auditores pueden aprobar/rechazar
if (user.role !== 'auditor' && user.role !== 'admin') {
  throw new Error('Sin permisos para auditar cotizaciones');
}

// Una cotización solo puede ser auditada una vez
const existingAudit = await getAuditRequest(quotationId);
if (existingAudit && existingAudit.audit_status !== 'pending') {
  throw new Error('Cotización ya auditada');
}

// Se requiere motivo de rechazo
if (audit_status === 'rejected' && !rejection_reason) {
  throw new Error('Se requiere motivo de rechazo');
}
```

## 🧪 DATOS DE PRUEBA

### Cotizaciones de Prueba
```json
{
  "quotation_id": "Q001",
  "medical_order_id": "MO-2025-000018",
  "provider_id": "P001",
  "provider_name": "Proveedor A",
  "patient_name": "Juancito Mercedes",
  "total_cost": 81000,
  "delivery_days": 5,
  "items_count": 3,
  "status": "sent"
}
```

```json
{
  "quotation_id": "Q002", 
  "medical_order_id": "MO-2025-000014",
  "provider_id": "P002",
  "provider_name": "Proveedor B",
  "patient_name": "Juancito Mercedes",
  "total_cost": 135000,
  "delivery_days": 7,
  "items_count": 4,
  "status": "sent"
}
```

## 🚨 CÓDIGOS DE ERROR

### Errores HTTP
```
400 - Bad Request: Datos de entrada inválidos
401 - Unauthorized: Token inválido o expirado
403 - Forbidden: Sin permisos para acceder al recurso
404 - Not Found: Cotización no encontrada
422 - Unprocessable Entity: Validación fallida
500 - Internal Server Error: Error interno del servidor
```

### Estructura de Error
```json
{
  "success": false,
  "error": {
    "code": "AUDIT_001",
    "message": "Cotización no encontrada",
    "details": null
  }
}
```

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Fase 1 (Crítico)
- [ ] Crear tablas de base de datos
- [ ] Implementar GET /api/auditor/pending-quotations
- [ ] Implementar GET /api/auditor/quotations/{id}
- [ ] Implementar PUT /api/auditor/audit-requests/{id}
- [ ] Configurar autenticación y autorización
- [ ] Implementar validaciones básicas
- [ ] Crear datos de prueba

### Fase 2 (Importante)
- [ ] Implementar GET /api/auditor/completed-requests
- [ ] Implementar GET /api/auditor/statistics
- [ ] Implementar filtros avanzados
- [ ] Agregar logging y monitoreo

### Fase 3 (Opcional)
- [ ] Implementar notificaciones en tiempo real
- [ ] Agregar exportación de datos
- [ ] Implementar auditoría de cambios
- [ ] Optimizar consultas de base de datos

## 🔗 INTEGRACIÓN CON FRONTEND

### Estado Actual del Frontend
- ✅ PendingQuotationsPage: Lista cotizaciones pendientes
- ✅ QuotationDetailPage: Muestra detalle de cotización
- ✅ AuditQuotationPage: Formulario de auditoría
- ✅ Navegación y rutas configuradas
- ✅ Manejo de errores implementado
- ✅ Loading states configurados

### Próximos Pasos
1. **Backend**: Implementar endpoints críticos
2. **Testing**: Probar integración end-to-end
3. **Frontend**: Remover fallbacks de mock data
4. **Producción**: Desplegar y monitorear

## 📞 CONTACTO

Para consultas sobre la implementación:
- **Frontend**: Ya implementado y listo
- **Backend**: Pendiente de implementación según esta guía
- **Integración**: Probar con datos de prueba proporcionados

---

**⚠️ IMPORTANTE**: El frontend está completamente funcional y espera estas APIs específicas. Cualquier cambio en la estructura de respuesta requerirá actualizaciones en el frontend. 