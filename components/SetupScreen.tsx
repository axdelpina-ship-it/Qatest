
import React, { useState } from 'react';
import type { Chat } from '@google/genai';
import { SCENARIOS } from '../constants';
import { SparklesIcon } from './icons';
import type { Message } from '../types';
import { createChatSession, startConversation } from '../services/geminiService';

interface SetupScreenProps {
  onStart: (name: string, scenarioKey: string, chat: Chat, initialMessage: Message) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart }) => {
  const [name, setName] = useState('');
  const [scenarioKey, setScenarioKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async () => {
    if (!name.trim() || !scenarioKey) {
      setError('Please enter your name and select a scenario.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const scenario = SCENARIOS.find(s => s.key === scenarioKey);
      if (!scenario) {
        throw new Error("Invalid scenario selected");
      }
      
      const chatSession = createChatSession(scenario);
      const firstAiMessageText = await startConversation(chatSession, name);
      const initialMessage: Message = {
        id: crypto.randomUUID(),
        text: firstAiMessageText,
        sender: 'ai',
      };

      onStart(name, scenarioKey, chatSession, initialMessage);
    } catch (e) {
      console.error("Failed to start simulation:", e);
      setError('Could not start simulation. Please check your API key and try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-white">
      <div className="bg-blue-600 p-3 rounded-full mb-4">
        <SparklesIcon className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-3xl font-bold mb-2">AI Agent Training Simulator</h1>
      <p className="text-gray-400 mb-8 max-w-md">
        Hone your customer service skills by interacting with an AI-powered customer. Choose a scenario to begin.
      </p>

      <div className="w-full max-w-sm space-y-4">
        <div>
          <label htmlFor="username-input" className="text-left block text-sm font-medium text-gray-300 mb-2">Your Agent Name:</label>
          <input
            id="username-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="e.g., Jane Doe"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="scenario-select" className="text-left block text-sm font-medium text-gray-300 mb-2">Choose a Customer Scenario:</label>
          <select
            id="scenario-select"
            value={scenarioKey}
            onChange={(e) => setScenarioKey(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white appearance-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
            disabled={isLoading}
          >
            <option value="">-- Select a Scenario --</option>
            {SCENARIOS.map(s => (
              <option key={s.key} value={s.key}>{s.name} ({s.description})</option>
            ))}
          </select>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          onClick={handleStart}
          disabled={isLoading || !name.trim() || !scenarioKey}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Starting...
            </>
          ) : (
            'Start Simulation'
          )}
        </button>
      </div>
    </div>
  );
};

export default SetupScreen;
