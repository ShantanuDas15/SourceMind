import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Health check
  checkHealth: async () => {
    const response = await apiClient.get('/api/health');
    return response.data;
  },

  // Evaluate
  evaluate: async (question: string, answer: string, sessionId: string): Promise<{ faithfulness: number; answer_relevancy: number }> => {
    const response = await apiClient.post('/api/evaluate', {
      question,
      answer,
      session_id: sessionId,
    });
    return response.data;
  },

  // Ingest Web/YouTube URL
  ingestUrl: async (url: string, sessionId: string) => {
    const response = await apiClient.post('/api/ingest', { url, session_id: sessionId });
    return response.data;
  },

  // Ingest PDF file
  ingestPdf: async (file: File, sessionId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(`/api/ingest/pdf?session_id=${encodeURIComponent(sessionId)}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Generate Chat Title
  generateTitle: async (query: string) => {
    const encodedQuery = encodeURIComponent(query);
    const response = await apiClient.get(`/api/title?q=${encodedQuery}`);
    return response.data;
  }
};
