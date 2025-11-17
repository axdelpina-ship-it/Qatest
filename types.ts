
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export type ScenarioKey = 'molesto' | 'ansioso' | 'confundido' | 'exigente';

export interface Scenario {
  key: ScenarioKey;
  name: string;
  description: string;
  personality: string;
  problem: string;
}

export interface Metric {
  wpm: number;
  responseTime: number;
  deletions: number;
}

export interface Evaluation {
  overallScore: number;
  performanceSummary: string;
  feedbackPoints: string[];
  rating: {
    empathy: number;
    problemSolving: number;
    professionalism: number;
  };
}
