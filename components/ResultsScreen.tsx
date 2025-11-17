import React from 'react';
import type { Message, Scenario, Metric, Evaluation } from '../types';
import { SparklesIcon, StarIcon } from './icons';

interface ResultsScreenProps {
  username: string;
  scenario: Scenario;
  metrics: Metric[];
  evaluation: Evaluation;
  messages: Message[];
  onRestart: () => void;
}

const RatingStars: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex">
        {[...Array(10)].map((_, i) => (
            <StarIcon key={i} className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-600'}`} />
        ))}
    </div>
);

const ResultsScreen: React.FC<ResultsScreenProps> = ({ username, scenario, metrics, evaluation, onRestart }) => {
  const avgWpm = metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.wpm, 0) / metrics.length : 0;
  const avgResponseTime = metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length : 0;
  const totalDeletions = metrics.reduce((sum, m) => sum + m.deletions, 0);

  return (
    <div className="flex flex-col h-full text-white">
      <header className="p-4 text-center border-b border-gray-700">
        <h1 className="text-2xl font-bold">Simulación Completada</h1>
        <p className="text-gray-400">Análisis de Desempeño para el Agente <span className="font-semibold text-gray-200">{username}</span></p>
      </header>

      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: AI Evaluation */}
        <div className="md:col-span-2 bg-gray-900/50 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <SparklesIcon className="w-8 h-8 text-blue-400" />
            <h2 className="text-xl font-semibold">Evaluación de Gemini</h2>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-300 mb-1">Puntuación General</h3>
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold text-blue-400">{evaluation.overallScore}<span className="text-2xl text-gray-400">/100</span></div>
                <div className="flex-1">
                    <div className="w-full bg-gray-700 rounded-full h-4">
                        <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${evaluation.overallScore}%` }}></div>
                    </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-300 mb-2">Resumen de Desempeño</h3>
              <p className="text-gray-300 bg-gray-800 p-4 rounded-md">{evaluation.performanceSummary}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-300 mb-2">Áreas de Mejora</h3>
              <ul className="space-y-2 list-disc list-inside pl-2">
                {evaluation.feedbackPoints.map((point, i) => <li key={i} className="text-gray-300">{point}</li>)}
              </ul>
            </div>
            
            <div>
                <h3 className="font-semibold text-gray-300 mb-3">Desglose de Habilidades</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Empatía</span>
                        <RatingStars rating={evaluation.rating.empathy} />
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Resolución de Problemas</span>
                        <RatingStars rating={evaluation.rating.problemSolving} />
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Profesionalismo</span>
                        <RatingStars rating={evaluation.rating.professionalism} />
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Right Column: Metrics */}
        <div className="bg-gray-900/50 p-6 rounded-lg space-y-4">
          <h2 className="text-xl font-semibold border-b border-gray-700 pb-2 mb-4">Tus Métricas</h2>
          <div className="bg-gray-800 p-4 rounded-md">
            <p className="text-sm text-gray-400">Prom. Palabras Por Minuto</p>
            <p className="text-2xl font-semibold text-blue-300">{avgWpm.toFixed(0)} WPM</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-md">
            <p className="text-sm text-gray-400">Prom. Tiempo de Respuesta</p>
            <p className="text-2xl font-semibold text-green-300">{avgResponseTime.toFixed(1)}s</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-md">
            <p className="text-sm text-gray-400">Borrados Totales</p>
            <p className="text-2xl font-semibold text-red-300">{totalDeletions}</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-700 text-center">
        <button onClick={onRestart} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
          Iniciar Nueva Simulación
        </button>
      </div>
    </div>
  );
};

export default ResultsScreen;