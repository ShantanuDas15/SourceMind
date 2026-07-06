import { useIngestStore } from '../stores/ingestStore';
import { ingestUrl, ingestPdf } from '../api/ingest';
import { Source } from '../types';

export function useIngest(sessionId: string) {
  const store = useIngestStore();
  
  return {
    sources: store.sourcesBySession[sessionId] || [],
    status: store.status,
    errorMessage: store.errorMessage,
    isPanelOpen: store.isPanelOpen,
    setPanelOpen: store.setPanelOpen,
    addSource: (source: Omit<Source, 'timestamp'>) => store.addSource(sessionId, source),
    removeSource: (id: string) => store.removeSource(sessionId, id),
    setStatus: store.setStatus,
    
    submitUrl: async (url: string) => {
      store.setStatus('ingesting');
      try {
        const result = await ingestUrl(url, sessionId);
        store.addSource(sessionId, {
          id: result.data.source_id,
          name: url,
          type: 'web',
        });
        store.setStatus('success');
        return result;
      } catch (error: any) {
        const message = error.response?.data?.detail || error.message || 'Failed to ingest URL';
        store.setStatus('error', message);
        throw error;
      }
    },
    
    submitPdf: async (file: File) => {
      store.setStatus('ingesting');
      try {
        const result = await ingestPdf(file, sessionId);
        store.addSource(sessionId, {
          id: result.data.source_id,
          name: file.name,
          type: 'pdf',
        });
        store.setStatus('success');
        return result;
      } catch (error: any) {
        const message = error.response?.data?.detail || error.message || 'Failed to ingest PDF';
        store.setStatus('error', message);
        throw error;
      }
    }
  };
}
