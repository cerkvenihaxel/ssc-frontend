import { useState, useCallback } from 'react';
import { AIAuditorService, type AuditAnalysisRequest, type AuditAnalysisResponse } from '../../application/services/AIAuditorService';

export const useAIAuditor = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AuditAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeQuotation = useCallback(async (request: AuditAnalysisRequest) => {
    setIsAnalyzing(true);
    setError(null);
    setStreamingText('');
    setAnalysisResult(null);

    try {
      const aiService = new AIAuditorService();
      const result = await aiService.analyzeQuotation(request);
      
      // Simular efecto de escritura para las notas
      await simulateTypingEffect(result.notes, setStreamingText);
      
      setAnalysisResult(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error en análisis de IA:', err);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const simulateTypingEffect = async (text: string, setText: (text: string) => void) => {
    const words = text.split(' ');
    let currentText = '';
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i];
      setText(currentText);
      
      // Pausa aleatoria entre 50ms y 150ms para simular escritura natural
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
    }
  };

  const resetAnalysis = useCallback(() => {
    setIsAnalyzing(false);
    setStreamingText('');
    setAnalysisResult(null);
    setError(null);
  }, []);

  return {
    isAnalyzing,
    streamingText,
    analysisResult,
    error,
    analyzeQuotation,
    resetAnalysis
  };
}; 