export interface AuditAnalysisRequest {
  quotation_data: {
    patient_name: string;
    provider_name: string;
    total_cost: number;
    delivery_days: number;
    items: Array<{
      name: string;
      description: string | null;
      quantity: number;
      unit_cost: number;
      total_cost: number;
      category: string | null;
    }>;
    medical_order: {
      urgency: 'low' | 'medium' | 'high';
      specialty: string[];
    };
  };
  analysis_type: 'approval' | 'rejection';
}

export interface AuditAnalysisResponse {
  notes: string;
  rejection_reason?: string;
  audit_criteria: {
    price_reasonable: boolean;
    quality_adequate: boolean;
    delivery_time_acceptable: boolean;
    provider_reliable: boolean;
    documentation_complete: boolean;
  };
  approved_cost?: number;
}

export class AIAuditorService {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!this.apiKey) {
      throw new Error('OpenAI API key not found in environment variables. Please add VITE_OPENAI_API_KEY to your .env file');
    }
    if (this.apiKey === 'your_openai_api_key_here' || this.apiKey === 'sk-tu_clave_de_api_aqui') {
      throw new Error('Please replace the placeholder API key with your actual OpenAI API key in the .env file');
    }
    if (!this.apiKey.startsWith('sk-')) {
      throw new Error('Invalid OpenAI API key format. API keys should start with "sk-"');
    }
  }

  // Método para verificar la configuración
  async verifyConfiguration(): Promise<boolean> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (response.ok) {
        return true;
      } else if (response.status === 401) {
        throw new Error('API key inválida o expirada. Verifica tu clave de OpenAI');
      } else {
        throw new Error(`Error de configuración: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error verificando configuración:', error);
      throw error;
    }
  }

  async analyzeQuotation(request: AuditAnalysisRequest): Promise<AuditAnalysisResponse> {
    try {
      // Validar que los datos necesarios estén presentes
      if (!request.quotation_data || !request.quotation_data.patient_name) {
        throw new Error('Datos de cotización incompletos o inválidos');
      }

      const prompt = this.buildPrompt(request);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `Eres un auditor médico experto en costos médicos y cotizaciones. Tu trabajo es analizar cotizaciones médicas y proporcionar recomendaciones profesionales basadas en criterios de calidad, precio, tiempo de entrega y confiabilidad del proveedor.

Debes responder en formato JSON con la siguiente estructura:
{
  "notes": "Notas detalladas del auditor en español",
  "rejection_reason": "Razón del rechazo si aplica (solo si se rechaza)",
  "audit_criteria": {
    "price_reasonable": true/false,
    "quality_adequate": true/false,
    "delivery_time_acceptable": true/false,
    "provider_reliable": true/false,
    "documentation_complete": true/false
  },
  "approved_cost": número_aprobado_si_aplica
}

Criterios de evaluación:
- Precio razonable: Comparar con precios de mercado y presupuesto
- Calidad adecuada: Verificar especificaciones y marcas
- Tiempo de entrega aceptable: Considerar urgencia del caso
- Proveedor confiable: Evaluar historial y reputación
- Documentación completa: Verificar que todos los items estén bien especificados`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response content from OpenAI');
      }

      // Parse the JSON response
      const analysis = JSON.parse(content);
      
      return {
        notes: analysis.notes,
        rejection_reason: analysis.rejection_reason,
        audit_criteria: analysis.audit_criteria,
        approved_cost: analysis.approved_cost
      };
    } catch (error) {
      console.error('Error analyzing quotation with AI:', error);
      throw new Error('Error al analizar la cotización con IA');
    }
  }

  private buildPrompt(request: AuditAnalysisRequest): string {
    const { quotation_data, analysis_type } = request;
    
    let prompt = `Analiza la siguiente cotización médica para ${analysis_type === 'approval' ? 'aprobación' : 'rechazo'}:

**Información del Paciente:**
- Nombre: ${quotation_data.patient_name || 'No especificado'}
- Urgencia: ${quotation_data.medical_order.urgency || 'No especificada'}
- Especialidad: ${quotation_data.medical_order.specialty ? quotation_data.medical_order.specialty.join(', ') : 'No especificada'}

**Información del Proveedor:**
- Proveedor: ${quotation_data.provider_name || 'No especificado'}

**Costos:**
- Costo total: $${(quotation_data.total_cost || 0).toLocaleString()}
- Días de entrega: ${quotation_data.delivery_days || 0} días

**Items solicitados:**
`;

    quotation_data.items.forEach((item, index) => {
      prompt += `${index + 1}. ${item.name || 'Item sin nombre'}
   - Descripción: ${item.description || 'No especificada'}
   - Cantidad: ${item.quantity || 0}
   - Costo unitario: $${(item.unit_cost || 0).toLocaleString()}
   - Costo total: $${(item.total_cost || 0).toLocaleString()}
   - Categoría: ${item.category || 'No especificada'}
`;
    });

    prompt += `

Por favor, proporciona un análisis detallado como auditor médico experto. Considera:
- Si los precios son razonables para el mercado
- Si la calidad de los productos es adecuada
- Si el tiempo de entrega es aceptable para la urgencia del caso
- Si el proveedor es confiable
- Si la documentación está completa

Responde en formato JSON como se especificó en las instrucciones del sistema.`;

    return prompt;
  }
} 