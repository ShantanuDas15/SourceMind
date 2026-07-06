import { useSourceStore } from '../stores/sourceStore';

export function useSources() {
  const store = useSourceStore();
  
  return {
    saveSessionSources: store.saveSessionSources,
    fetchSessionSources: store.fetchSessionSources,
    clearSessionData: store.clearSessionData,
  };
}
