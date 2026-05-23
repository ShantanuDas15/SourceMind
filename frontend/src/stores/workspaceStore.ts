import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Session {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

interface WorkspaceState {
  sessions: Record<string, Session>;
  activeSessionId: string;
  createSession: () => string;
  setActiveSession: (id: string) => void;
  updateSessionTitle: (id: string, title: string) => void;
  deleteSession: (id: string) => void;
}

const generateId = () => `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => {
      // Create an initial default session
      const defaultId = generateId();
      const initialSession: Session = {
        id: defaultId,
        title: "New Research Chat",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      return {
        sessions: { [defaultId]: initialSession },
        activeSessionId: defaultId,

        createSession: () => {
          const newId = generateId();
          const newSession: Session = {
            id: newId,
            title: "New Research Chat",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          
          set((state) => ({
            sessions: { ...state.sessions, [newId]: newSession },
            activeSessionId: newId,
          }));
          return newId;
        },

        setActiveSession: (id: string) => {
          if (get().sessions[id]) {
            set({ activeSessionId: id });
          }
        },

        updateSessionTitle: (id: string, title: string) => {
          set((state) => {
            const session = state.sessions[id];
            if (!session) return state;
            return {
              sessions: {
                ...state.sessions,
                [id]: { ...session, title, updatedAt: Date.now() }
              }
            };
          });
        },

        deleteSession: (id: string) => {
          set((state) => {
            const newSessions = { ...state.sessions };
            delete newSessions[id];
            
            // If we deleted the active session, switch to another one
            let newActiveId = state.activeSessionId;
            if (state.activeSessionId === id) {
              const remainingIds = Object.keys(newSessions);
              if (remainingIds.length > 0) {
                // Sort by most recently updated
                remainingIds.sort((a, b) => newSessions[b].updatedAt - newSessions[a].updatedAt);
                newActiveId = remainingIds[0];
              } else {
                // If we deleted the last session, create a new one automatically
                const newId = generateId();
                newSessions[newId] = {
                  id: newId,
                  title: "New Research Chat",
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                };
                newActiveId = newId;
              }
            }
            
            return { sessions: newSessions, activeSessionId: newActiveId };
          });
        },
      };
    },
    {
      name: 'sm-workspaces',
    }
  )
);
