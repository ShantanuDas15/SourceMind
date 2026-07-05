import { apiClient } from './client';

const base = '/api/query';

export const getHistory = async (sessionId: string) => {
  const { data } = await apiClient.get(`${base}/${sessionId}`);
  return data;
};

export const saveHistory = async (sessionId: string, messages: any[]) => {
  const { data } = await apiClient.post(base, { session_id: sessionId, messages });
  return data;
};

export const clearHistory = async (sessionId: string) => {
  const { data } = await apiClient.delete(`${base}/${sessionId}`);
  return data;
};
