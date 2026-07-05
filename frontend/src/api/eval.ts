import { apiClient } from './client';

export const evaluate = async (question: string, answer: string, sessionId: string, contexts?: string[]) => {
  const { data } = await apiClient.post('/api/evaluate', {
    question,
    answer,
    session_id: sessionId,
    contexts
  });
  return data;
};
