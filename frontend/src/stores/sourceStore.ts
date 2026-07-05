import { create } from 'zustand';
import { getSources, saveSources, clearSources } from '../api/sources';
import { clearHistory } from '../api/query';

interface SourceStore {
  saveSessionSources: (sessionId: string, sources: any[]) => Promise<void>;
  fetchSessionSources: (sessionId: string) => Promise<any[]>;
  clearSessionData: (sessionId: string) => Promise<void>;
}

// # ponytail: headless store just for side-effects, state is in ingestStore/chatStore
export const useSourceStore = create<SourceStore>()((set) => ({
  saveSessionSources: async (sessionId, sources) => {
    try {
      await saveSources(sessionId, sources);
    } catch (e) {
      console.error(e);
    }
  },
  fetchSessionSources: async (sessionId) => {
    try {
      return await getSources(sessionId);
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  clearSessionData: async (sessionId) => {
    try {
      // clear sources and history when session is deleted
      await Promise.all([clearSources(sessionId), clearHistory(sessionId)]);
    } catch (e) {
      console.error(e);
    }
  }
}));
