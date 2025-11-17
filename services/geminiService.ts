import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { Message, Scenario, Metric, Evaluation } from '../types';

const evaluationSchema = {
  type: Type.OBJECT,
  properties: {
    overallScore: {
      type: Type.INTEGER,
      description: "Una puntuación de rendimiento general para el agente de 1 a 100."
    },
    performanceSummary: {
      type: Type.STRING,
      description: "Un resumen conciso de un párrafo sobre el rendimiento del agente."
    },
    feedbackPoints: {
      type: Type.ARRAY,
      description: "Una lista de 2-3 puntos de retroalimentación específicos y accionables para mejorar.",
      items: {
        type: Type.STRING
      }
    },
    rating: {
        type: Type.OBJECT,
        properties: {
            empathy: { type: Type.INTEGER, description: "Calificación de la empatía del agente de 1 a 10." },
            problemSolving: { type: Type.INTEGER, description: "Calificación de las habilidades de resolución de problemas del agente de 1 a 10." },
            professionalism: { type: Type.INTEGER, description: "Calificación del profesionalismo del agente de 1 a 10." },
        },
        required: ["empathy", "problemSolving", "professionalism"]
    }
  },
  required: ["overallScore", "performanceSummary", "feedbackPoints", "rating"]
};

export const createChatSession = (scenario: Scenario, apiKey: string): Chat => {
  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = `Eres un simulador de chatbot de soporte al cliente. Tu rol es actuar como un cliente con un problema y personalidad específicos. No reveles que eres una IA. Participa en una conversación realista con un agente de servicio al cliente que está entrenando.

Tu Personaje: ${scenario.personality}
Tu Problema: ${scenario.problem}

Tu objetivo es poner a prueba las habilidades del agente. Si son de ayuda, puedes calmarte. Si no son de ayuda, puedes frustrarte más. Mantén tus respuestas concisas y naturales.`;

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
    },
  });
};

export const startConversation = async (chat: Chat, agentName: string): Promise<string> => {
    // This is a special first message to kick off the roleplay.
    // We are telling the AI (customer) that the agent (user) is ready.
    const response = await chat.sendMessage({
        message: `La simulación ha comenzado. Soy el agente. Por favor, inicia la conversación con tu problema.`
    });
    return response.text;
};


export const sendMessage = async (chat: Chat, message: string): Promise<string> => {
    const response = await chat.sendMessage({ message });
    return response.text;
};

export const evaluateConversation = async (
  chatHistory: Message[],
  metrics: Metric[],
  apiKey: string
): Promise<Evaluation | null> => {
  const ai = new GoogleGenAI({ apiKey });
  const historyText = chatHistory.map(m => `${m.sender === 'user' ? 'Agente' : 'Cliente'}: ${m.text}`).join('\n');
  const metricsText = JSON.stringify(metrics, null, 2);

  const prompt = `
    Analiza la siguiente conversación entre un agente de servicio al cliente y un cliente.
    Considera también las métricas de rendimiento del agente proporcionadas.

    **Transcripción de la Conversación:**
    ${historyText}

    **Métricas de Rendimiento del Agente:**
    (wpm: palabras por minuto, responseTime: segundos, deletions: número de retrocesos/borrados)
    ${metricsText}

    Basado en toda esta información, evalúa el rendimiento del agente.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: evaluationSchema,
      },
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as Evaluation;
  } catch (error) {
    console.error("Error al evaluar la conversación:", error);
    return null;
  }
};
