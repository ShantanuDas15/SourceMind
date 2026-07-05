import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SourceType = 'web' | 'pdf' | 'youtube';

export interface Source {
  id: string;
  name: string;
  type: SourceType;
  timestamp: number;
}

interface IngestState {
  sourcesBySession: Record<string, Source[]>;
  status: 'idle' | 'ingesting' | 'success' | 'error';
  errorMessage: string | null;
  isPanelOpen: boolean;
  addSource: (sessionId: string, source: Omit<Source, 'timestamp'>) => void;
  removeSource: (sessionId: string, id: string) => void;
  setStatus: (status: IngestState['status'], errorMessage?: string | null) => void;
  setPanelOpen: (isOpen: boolean) => void;
}

export const useIngestStore = create<IngestState>()(
  persist(
    (set) => ({
      sourcesBySession: {},
      status: 'idle',
      errorMessage: null,
      isPanelOpen: false,

      addSource: (sessionId, source) => set((state) => {
        const sources = state.sourcesBySession[sessionId] || [];
        return {
          sourcesBySession: {
            ...state.sourcesBySession,
            [sessionId]: [
              {
                ...source,
                timestamp: Date.now(),
              },
              ...sources,
            ]
          }
        };
      }),

      removeSource: (sessionId, id) => set((state) => {
        const sources = state.sourcesBySession[sessionId] || [];
        return {
          sourcesBySession: {
            ...state.sourcesBySession,
            [sessionId]: sources.filter((s) => s.id !== id)
          }
        };
      }),

      setStatus: (status, errorMessage = null) => set({ status, errorMessage }),
      setPanelOpen: (isOpen) => set({ isPanelOpen: isOpen }),
    }),
    {
      name: 'sm-sources',
      partialize: (state) => ({ sourcesBySession: state.sourcesBySession }),
    }
  )
);
