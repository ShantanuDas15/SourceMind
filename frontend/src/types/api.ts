import { Message } from './index';

export interface StreamPayload {
  q: string;
  session_id: string;
  history: Pick<Message, 'role' | 'content'>[];
}

export interface IngestResponse {
  status: string;
  message: string;
  data: {
    source_id: string;
    chunks_stored: number;
    url?: string;
    filename?: string;
  };
}

export interface EvalPayload {
  question: string;
  answer: string;
  session_id: string;
  contexts?: string[];
}
