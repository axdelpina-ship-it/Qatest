import React, { useState, useCallback } from 'react';
import type { Message, Scenario, Metric, Evaluation } from './types';
import SetupScreen from './components/SetupScreen';
import ChatScreen from './components/ChatScreen';
import ResultsScreen from './components/ResultsScreen';
import { SCENARIOS } from './constants';
import { createChatSession, startConversation, evaluateConversation } from './services/geminiService';
import type { Chat } from '@google/genai';

type AppState = 'setup' | 'chatting' | 'evaluating' | 'results';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('setup');
  const [username, setUsername] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);

  const handleStartSimulation = useCallback(async (name: string, scenarioKey: string, key: string): Promise<{ chat: Chat, initialMessage: Message} | null> => {
    const selectedScenario = SCENARIOS.find(s => s.key === scenarioKey);
    if (selectedScenario) {
      const chat = createChatSession(selectedScenario, key);
      const firstAiMessageText = await startConversation(chat, name);
      const initialMessage: Message = {
        id: crypto.randomUUID(),
        text: firstAiMessageText,
        sender: 'ai',
      };
      
      setUsername(name);
      setApiKey(key);
      setScenario(selectedScenario);
      setChatSession(chat);
      setMessages([initialMessage]);
      setMetrics([]);
      setEvaluation(null);
      setAppState('chatting');
      return { chat, initialMessage };
    }
    return null;
  }, []);

  const handleEndSimulation = useCallback(async (finalMessages: Message[], finalMetrics: Metric[]) => {
    setAppState('evaluating');
    const result = await evaluateConversation(finalMessages, finalMetrics, apiKey);
    setEvaluation(result);
    setMessages(finalMessages);
    setMetrics(finalMetrics);
    setAppState('results');
  }, [apiKey]);

  const handleRestart = useCallback(() => {
    setAppState('setup');
    setUsername('');
    setApiKey('');
    setScenario(null);
    setMessages([]);
    setMetrics([]);
    setEvaluation(null);
    setChatSession(null);
  }, []);

  const renderContent = () => {
    switch (appState) {
      case 'chatting':
        return scenario && chatSession ? (
          <ChatScreen
            username={username}
            scenario={scenario}
            initialMessages={messages}
            chatSession={chatSession}
            onEndSimulation={handleEndSimulation}
          />
        ) : null;
      case 'evaluating':
      case 'results':
        return scenario && evaluation ? (
          <ResultsScreen
            username={username}
            scenario={scenario}
            metrics={metrics}
            evaluation={evaluation}
            messages={messages}
            onRestart={handleRestart}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg">Gemini está evaluando tu desempeño...</p>
          </div>
        );
      case 'setup':
      default:
        return <SetupScreen onStart={handleStartSimulation} />;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-900">
      <div className="w-full max-w-4xl bg-gray-800 rounded-2xl shadow-2xl flex flex-col" style={{ height: '90vh' }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
