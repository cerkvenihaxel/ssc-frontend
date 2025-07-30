# 🛡️ ESPECIFICACIÓN API - MÓDULO DE AUDITORÍA

## 📋 TOKEN 1: ESTRUCTURA BASE

### Endpoints Base
```
GET    /api/auditor/pending-quotations     - Cotizaciones pendientes de auditoría
GET    /api/auditor/completed-requests     - Solicitudes finalizadas
GET    /api/auditor/quotations/{id}        - Detalle de cotización
POST   /api/auditor/audit-requests         - Crear solicitud de auditoría
PUT    /api/auditor/audit-requests/{id}    - Actualizar solicitud de auditoría
GET    /api/auditor/audit-requests/{id}    - Detalle de solicitud de auditoría
GET    /api/auditor/statistics             - Estadísticas de auditoría
```

### Headers Requeridos
```
Authorization: Bearer {token}
Content-Type: application/json
```

---

## 📋 TOKEN 2: ESTRUCTURAS DE DATOS

### Quotation (Cotización)
```json
{
  "quotation_id": "string",
  "medical_order_id": "string",
  "provider_id": "string",
  "provider_name": "string",
  "patient_name": "string",
  "total_cost": "number",
  "delivery_days": "number",
  "items_count": "number",
  "status": "pending|sent|approved|rejected|completed",
  "created_at": "ISO 8601 date string",
  "updated_at": "ISO 8601 date string",
  "items": [
    {
      "item_id": "string",
      "name": "string",
      "description": "string|null",
      "quantity": "number",
      "unit_cost": "number",
      "total_cost": "number",
      "category": "string|null"
    }
  ],
  "medical_order": {
    "medical_order_id": "string",
    "patient_name": "string",
    "doctor_name": "string|null",
    "specialty": "string|null",
    "urgency": "low|medium|high",
    "created_at": "ISO 8601 date string"
  }
}
```

### QuotationFilters (Filtros)
```json
{
  "status": "string|null",
  "provider_id": "string|null",
  "date_from": "YYYY-MM-DD|null",
  "date_to": "YYYY-MM-DD|null",
  "patient_name": "string|null",
  "medical_order_id": "string|null",
  "page": "number (default: 1)",
  "limit": "number (default: 10)"
}
```

### QuotationResponse (Respuesta paginada)
```json
{
  "data": "Quotation[]",
  "total": "number",
  "page": "number",
  "limit": "number",
  "total_pages": "number"
}
```

### AuditRequest (Solicitud de Auditoría)
```json
{
  "audit_request_id": "string",
  "quotation_id": "string",
  "medical_order_id": "string",
  "provider_id": "string",
  "audit_status": "pending|in_progress|approved|rejected|completed",
  "auditor_notes": "string|null",
  "rejection_reason": "string|null",
  "original_order_cost": "number|null",
  "quoted_cost": "number",
  "approved_cost": "number|null",
  "audit_criteria": {
    "price_reasonable": "boolean",
    "quality_adequate": "boolean",
    "delivery_time_acceptable": "boolean",
    "provider_reliable": "boolean",
    "documentation_complete": "boolean"
  },
  "audit_type": "manual|ai|hybrid",
  "auditor_id": "string|null",
  "audited_at": "ISO 8601 date string|null",
  "completed_at": "ISO 8601 date string|null",
  "created_at": "ISO 8601 date string",
  "updated_at": "ISO 8601 date string"
}
```

---

## 📋 TOKEN 3: ENDPOINTS DETALLADOS

### 1. GET /api/auditor/pending-quotations
**Descripción**: Obtener cotizaciones pendientes de auditoría

**Query Parameters**:
- `status` (opcional): Filtrar por estado
- `provider_id` (opcional): Filtrar por proveedor
- `date_from` (opcional): Fecha desde (YYYY-MM-DD)
- `date_to` (opcional): Fecha hasta (YYYY-MM-DD)
- `patient_name` (opcional): Filtrar por nombre de paciente
- `medical_order_id` (opcional): Filtrar por orden médica
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)

**Response**:
```json
{
  "success": true,
  "data": {
    "data": "Quotation[]",
    "total": 25,
    "page": 1,
    "limit": 10,
    "total_pages": 3
  }
}
```

### 2. GET /api/auditor/completed-requests
**Descripción**: Obtener solicitudes finalizadas

**Query Parameters**: Mismos que pending-quotations

**Response**: Misma estructura que pending-quotations

### 3. GET /api/auditor/quotations/{id}
**Descripción**: Obtener detalle de una cotización específica

**Path Parameters**:
- `id`: ID de la cotización

**Response**:
```json
{
  "success": true,
  "data": "Quotation"
}
```

### 4. POST /api/auditor/audit-requests
**Descripción**: Crear una nueva solicitud de auditoría

**Request Body**:
```json
{
  "quotation_id": "string",
  "medical_order_id": "string",
  "provider_id": "string",
  "audit_type": "manual|ai|hybrid",
  "auditor_notes": "string|null"
}
```

**Response**:
```json
{
  "success": true,
  "data": "AuditRequest"
}
```

### 5. PUT /api/auditor/audit-requests/{id}
**Descripción**: Actualizar una solicitud de auditoría (aprobar/rechazar)

**Path Parameters**:
- `id`: ID de la solicitud de auditoría

**Request Body**:
```json
{
  "audit_status": "approved|rejected|completed",
  "auditor_notes": "string|null",
  "rejection_reason": "string|null",
  "approved_cost": "number|null",
  "audit_criteria": {
    "price_reasonable": "boolean",
    "quality_adequate": "boolean",
    "delivery_time_acceptable": "boolean",
    "provider_reliable": "boolean",
    "documentation_complete": "boolean"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": "AuditRequest"
}
```

### 5.1 PUT /api/auditor/quotations/{id}/audit
**Descripción**: Auditar una cotización específica (aprobar/rechazar)

**Path Parameters**:
- `id`: ID de la cotización

**Request Body**:
```json
{
  "audit_status": "approved|rejected|completed",
  "auditor_notes": "string|null",
  "rejection_reason": "string|null",
  "approved_cost": "number|null",
  "audit_criteria": {
    "price_reasonable": "boolean",
    "quality_adequate": "boolean",
    "delivery_time_acceptable": "boolean",
    "provider_reliable": "boolean",
    "documentation_complete": "boolean"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": "AuditRequest"
}
```

### 6. GET /api/auditor/audit-requests/{id}
**Descripción**: Obtener detalle de una solicitud de auditoría

**Path Parameters**:
- `id`: ID de la solicitud de auditoría

**Response**:
```json
{
  "success": true,
  "data": "AuditRequest"
}
```

### 7. GET /api/auditor/statistics
**Descripción**: Obtener estadísticas de auditoría

**Response**:
```json
{
  "success": true,
  "data": {
    "total_requests": "number",
    "pending_requests": "number",
    "in_progress_requests": "number",
    "approved_requests": "number",
    "rejected_requests": "number",
    "completed_requests": "number",
    "average_processing_time": "number",
    "cost_savings": "number",
    "monthly_trends": [
      {
        "month": "string",
        "requests": "number",
        "approved": "number",
        "rejected": "number"
      }
    ]
  }
}
```

---

## 📋 TOKEN 4: CÓDIGOS DE ERROR

### Errores HTTP
```
400 - Bad Request: Datos de entrada inválidos
401 - Unauthorized: Token inválido o expirado
403 - Forbidden: Sin permisos para acceder al recurso
404 - Not Found: Recurso no encontrado
422 - Unprocessable Entity: Validación fallida
500 - Internal Server Error: Error interno del servidor
```

### Estructura de Error
```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": "object|null"
  }
}
```

### Códigos de Error Específicos
```
AUDIT_001 - Cotización no encontrada
AUDIT_002 - Solicitud de auditoría no encontrada
AUDIT_003 - Sin permisos para auditar
AUDIT_004 - Cotización ya auditada
AUDIT_005 - Datos de auditoría inválidos
AUDIT_006 - Error al procesar auditoría
```

---

## 📋 TOKEN 5: VALIDACIONES

### Validaciones de Entrada
1. **Quotation ID**: Debe existir en la base de datos
2. **Medical Order ID**: Debe existir y estar relacionado
3. **Provider ID**: Debe existir y ser válido
4. **Audit Status**: Solo valores permitidos
5. **Approved Cost**: Debe ser positivo si se proporciona
6. **Dates**: Formato ISO 8601 válido
7. **Audit Criteria**: Todos los campos booleanos requeridos

### Reglas de Negocio
1. Solo auditores pueden aprobar/rechazar cotizaciones
2. Una cotización solo puede ser auditada una vez
3. El costo aprobado no puede ser mayor al cotizado
4. Se requiere motivo de rechazo para rechazar
5. Las auditorías se registran con timestamp y auditor

---

## 📋 TOKEN 6: PERMISOS Y AUTORIZACIÓN

### Roles Requeridos
- `auditor`: Acceso completo al módulo
- `admin`: Acceso completo al módulo
- `provider`: Solo lectura de sus propias cotizaciones

### Permisos Específicos
```
VIEW_AUDIT_REQUESTS     - Ver solicitudes de auditoría
CREATE_AUDIT_REQUESTS   - Crear solicitudes de auditoría
UPDATE_AUDIT_REQUESTS   - Aprobar/rechazar cotizaciones
VIEW_AUDIT_STATISTICS   - Ver estadísticas
```

---

## 📋 TOKEN 7: IMPLEMENTACIÓN FRONTEND

### Cambios Necesarios en el Frontend

1. **Remover Mock Data**: Eliminar datos de prueba
2. **Actualizar URLs**: Cambiar a endpoints reales
3. **Manejo de Errores**: Implementar try-catch
4. **Loading States**: Mostrar spinners durante requests
5. **Validaciones**: Validar datos antes de enviar
6. **Notificaciones**: Mostrar feedback al usuario

### Ejemplo de Implementación
```typescript
// Antes (Mock)
const loadPendingQuotations = async () => {
  setQuotations(mockData);
};

// Después (Real API)
const loadPendingQuotations = async () => {
  try {
    setLoading(true);
    const response = await auditorService.getPendingQuotations(filters);
    setQuotations(response.data);
  } catch (error) {
    console.error('Error:', error);
    // Mostrar notificación de error
  } finally {
    setLoading(false);
  }
};
```

---

## 📋 TOKEN 8: TESTING

### Casos de Prueba
1. **Obtener cotizaciones pendientes** - Sin filtros
2. **Obtener cotizaciones pendientes** - Con filtros
3. **Obtener detalle de cotización** - ID válido
4. **Obtener detalle de cotización** - ID inválido
5. **Aprobar cotización** - Datos válidos
6. **Rechazar cotización** - Con motivo
7. **Rechazar cotización** - Sin motivo (debe fallar)
8. **Acceso sin permisos** - Debe retornar 403

### Datos de Prueba
```json
{
  "test_quotation_id": "Q001",
  "test_medical_order_id": "MO-2025-000018",
  "test_provider_id": "P001",
  "test_auditor_id": "A001"
}
```

---

## 🚀 IMPLEMENTACIÓN PRIORITARIA

### Fase 1 (Crítico)
1. GET /api/auditor/pending-quotations
2. GET /api/auditor/quotations/{id}
3. PUT /api/auditor/quotations/{id}/audit

### Fase 2 (Importante)
1. GET /api/auditor/completed-requests
2. GET /api/auditor/statistics
3. POST /api/auditor/audit-requests

### Fase 3 (Opcional)
1. Filtros avanzados
2. Exportación de datos
3. Notificaciones en tiempo real 