
import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { Message, Scenario, Metric, Evaluation } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const evaluationSchema = {
  type: Type.OBJECT,
  properties: {
    overallScore: {
      type: Type.INTEGER,
      description: "An overall performance score for the agent from 1 to 100."
    },
    performanceSummary: {
      type: Type.STRING,
      description: "A concise, one-paragraph summary of the agent's performance."
    },
    feedbackPoints: {
      type: Type.ARRAY,
      description: "A list of 2-3 specific, actionable feedback points for improvement.",
      items: {
        type: Type.STRING
      }
    },
    rating: {
        type: Type.OBJECT,
        properties: {
            empathy: { type: Type.INTEGER, description: "Rating for agent's empathy from 1 to 10." },
            problemSolving: { type: Type.INTEGER, description: "Rating for agent's problem solving skills from 1 to 10." },
            professionalism: { type: Type.INTEGER, description: "Rating for agent's professionalism from 1 to 10." },
        },
        required: ["empathy", "problemSolving", "professionalism"]
    }
  },
  required: ["overallScore", "performanceSummary", "feedbackPoints", "rating"]
};

export const createChatSession = (scenario: Scenario): Chat => {
  const systemInstruction = `You are a customer support chatbot simulator. Your role is to act as a customer with a specific problem and personality. Do not reveal that you are an AI. Engage in a realistic conversation with a customer service agent who is training.

Your Persona: ${scenario.personality}
Your Problem: ${scenario.problem}

Your goal is to test the agent's skills. If they are helpful, you can become calmer. If they are unhelpful, you can become more frustrated. Keep your responses concise and natural.`;

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
    },
  });
};

export const startConversation = async (chat: Chat, agentName: string): Promise<string> => {
    const response = await chat.sendMessage({
        message: `Hello, my name is ${agentName}. Let's start the simulation. Please begin with your first message.`
    });
    return response.text;
};


export const sendMessage = async (chat: Chat, message: string): Promise<string> => {
    const response = await chat.sendMessage({ message });
    return response.text;
};

export const evaluateConversation = async (
  chatHistory: Message[],
  metrics: Metric[]
): Promise<Evaluation | null> => {
  const historyText = chatHistory.map(m => `${m.sender === 'user' ? 'Agent' : 'Customer'}: ${m.text}`).join('\n');
  const metricsText = JSON.stringify(metrics, null, 2);

  const prompt = `
    Analyze the following conversation between a customer service agent and a customer.
    Also consider the agent's performance metrics provided.

    **Conversation Transcript:**
    ${historyText}

    **Agent Performance Metrics:**
    (wpm: words per minute, responseTime: seconds, deletions: number of backspaces/deletes)
    ${metricsText}

    Based on all this information, evaluate the agent's performance.
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
    console.error("Error evaluating conversation:", error);
    return null;
  }
};
