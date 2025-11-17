import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Message, Scenario, Metric } from '../types';
import { sendMessage } from '../services/geminiService';
import { SendIcon, RobotIcon, UserIcon } from './icons';
import type { Chat } from '@google/genai';

interface ChatScreenProps {
  username: string;
  scenario: Scenario;
  initialMessages: Message[];
  chatSession: Chat;
  onEndSimulation: (messages: Message[], metrics: Metric[]) => void;
}

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
    </div>
);

const ChatScreen: React.FC<ChatScreenProps> = ({ username, scenario, initialMessages, chatSession, onEndSimulation }) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  
  const responseStartTimeRef = useRef<Date | null>(null);
  const deleteCountRef = useRef<number>(0);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    responseStartTimeRef.current = new Date();
  }, [messages.length]);

  const handleSend = useCallback(async () => {
    if (userInput.trim() === '' || isTyping) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: userInput.trim(),
      sender: 'user',
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsTyping(true);

    // Calculate metrics
    if(responseStartTimeRef.current) {
        const endTime = new Date();
        const responseTimeInSeconds = (endTime.getTime() - responseStartTimeRef.current.getTime()) / 1000;
        const wordCount = userMessage.text.trim().split(/\s+/).length;
        const wpm = (wordCount / (responseTimeInSeconds / 60));

        const newMetric: Metric = {
            wpm: isFinite(wpm) ? wpm : 0,
            responseTime: responseTimeInSeconds,
            deletions: deleteCountRef.current
        };
        setMetrics(prev => [...prev, newMetric]);
    }
    deleteCountRef.current = 0; // Reset for next message

    try {
      const aiResponseText = await sendMessage(chatSession, userMessage.text);
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        text: aiResponseText,
        sender: 'ai',
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        text: "Lo siento, encontré un error. Por favor, inténtalo de nuevo.",
        sender: 'ai',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [userInput, isTyping, chatSession]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Backspace' || e.key === 'Delete') {
      deleteCountRef.current++;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="border-b border-gray-700 p-4 text-center">
        <h1 className="text-xl font-bold text-white">Simulación de Entrenamiento de Agente</h1>
        <p className="text-sm text-gray-400">Escenario: <span className="font-semibold text-gray-300">{scenario.name} - {scenario.description}</span></p>
      </header>

      <div ref={chatWindowRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
             {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0 flex items-center justify-center"><RobotIcon className="w-5 h-5 text-gray-300"/></div>}
            <div className={`max-w-lg p-3 rounded-2xl shadow-md ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-lg' : 'bg-gray-700 text-gray-200 rounded-bl-lg'}`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
             {msg.sender === 'user' && <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center"><UserIcon className="w-5 h-5 text-white"/></div>}
          </div>
        ))}
        {isTyping && (
           <div className="flex items-start gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0 flex items-center justify-center"><RobotIcon className="w-5 h-5 text-gray-300"/></div>
            <div className="max-w-lg p-3 rounded-2xl shadow-md bg-gray-700 text-gray-200 rounded-bl-lg">
                <TypingIndicator />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-end gap-2">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu respuesta..."
            className="flex-1 p-3 bg-gray-700 rounded-lg text-white resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows={2}
            disabled={isTyping}
          />
          <button onClick={handleSend} disabled={isTyping || !userInput.trim()} className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 rounded-lg text-white font-semibold transition-colors">
            <SendIcon className="w-6 h-6"/>
          </button>
        </div>
        <div className="text-center mt-3">
          <button onClick={() => onEndSimulation(messages, metrics)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors">
            Terminar Simulación y Obtener Evaluación
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;