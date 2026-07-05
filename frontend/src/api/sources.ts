import { apiClient } from './client';

const base = '/api/sources';

export const getSources = async (sessionId: string) => {
  const { data } = await apiClient.get(`${base}/${sessionId}`);
  return data;
};

export const saveSources = async (sessionId: string, sources: any[]) => {
  const { data } = await apiClient.post(base, { session_id: sessionId, sources });
  return data;
};

export const clearSources = async (sessionId: string) => {
  const { data } = await apiClient.delete(`${base}/${sessionId}`);
  return data;
};
