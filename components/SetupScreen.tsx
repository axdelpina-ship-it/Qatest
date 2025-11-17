import React, { useState } from 'react';
import type { Chat } from '@google/genai';
import { SCENARIOS } from '../constants';
import { SparklesIcon } from './icons';
import type { Message } from '../types';

interface SetupScreenProps {
  onStart: (name: string, scenarioKey: string, apiKey: string) => Promise<{ chat: Chat, initialMessage: Message} | null>;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart }) => {
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [scenarioKey, setScenarioKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async () => {
    if (!name.trim() || !scenarioKey || !apiKey.trim()) {
      setError('Por favor, completa todos los campos, incluyendo la clave de API.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      await onStart(name, apiKey, scenarioKey);
      // La transición al siguiente estado se maneja en el componente App
    } catch (e) {
      console.error("No se pudo iniciar la simulación:", e);
      setError('No se pudo iniciar la simulación. Por favor, revisa tu clave de API e inténtalo de nuevo.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-white">
      <div className="bg-blue-600 p-3 rounded-full mb-4">
        <SparklesIcon className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-3xl font-bold mb-2">Simulador de Entrenamiento de Agentes con IA</h1>
      <p className="text-gray-400 mb-8 max-w-md">
        Perfecciona tus habilidades de servicio al cliente interactuando con un cliente impulsado por IA. Elige un escenario para comenzar.
      </p>

      <div className="w-full max-w-sm space-y-4">
        <div>
          <label htmlFor="api-key-input" className="text-left block text-sm font-medium text-gray-300 mb-2">Clave de API de Gemini:</label>
          <input
            id="api-key-input"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Pega tu clave de API aquí"
            disabled={isLoading}
          />
        </div>
         <div>
          <label htmlFor="username-input" className="text-left block text-sm font-medium text-gray-300 mb-2">Tu Nombre de Agente:</label>
          <input
            id="username-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Ej: Ana Pérez"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="scenario-select" className="text-left block text-sm font-medium text-gray-300 mb-2">Elige un Escenario de Cliente:</label>
          <select
            id="scenario-select"
            value={scenarioKey}
            onChange={(e) => setScenarioKey(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white appearance-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
            disabled={isLoading}
          >
            <option value="">-- Selecciona un Escenario --</option>
            {SCENARIOS.map(s => (
              <option key={s.key} value={s.key}>{s.name} ({s.description})</option>
            ))}
          </select>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          onClick={handleStart}
          disabled={isLoading || !name.trim() || !scenarioKey || !apiKey.trim()}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Iniciando...
            </>
          ) : (
            'Iniciar Simulación'
          )}
        </button>
      </div>
    </div>
  );
};

export default SetupScreen;
