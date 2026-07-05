export type Role = 'user' | 'assistant';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  contexts?: string[];
}

export type SourceType = 'web' | 'pdf' | 'youtube';

export interface Source {
  id: string;
  // # ponytail: combine frontend 'name' and backend 'url' to solve divergence without breaking UI
  name?: string; 
  url?: string;
  type: SourceType;
  timestamp: number;
}

export interface EvalResult {
  faithfulness: number;
  answer_relevancy: number;
  isEvaluating: boolean;
  error?: string;
}
