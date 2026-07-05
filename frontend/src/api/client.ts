import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL,
  timeout: 120000, // 2 minutes for cold starts on free tiers
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

  // Generate Chat Title
  generateTitle: async (query: string) => {
    const encodedQuery = encodeURIComponent(query);
    const response = await apiClient.get(`/api/title?q=${encodedQuery}`);
    return response.data;
  }
};
