import { apiClient } from './client';

export const ingestUrl = async (url: string, sessionId: string) => {
  const { data } = await apiClient.post('/api/ingest', { url, session_id: sessionId });
  return data;
};

export const ingestPdf = async (file: File, sessionId: string) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post(`/api/ingest/pdf?session_id=${encodeURIComponent(sessionId)}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
