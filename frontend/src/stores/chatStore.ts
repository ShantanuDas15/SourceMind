import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../api/client';
import { startStream } from '../api/stream';
import { saveHistory } from '../api/query';
import { useWorkspaceStore } from './workspaceStore';
import { Message, Role } from '../types';

let activeAbortController: AbortController | null = null;

interface ChatState {
  messagesBySession: Record<string, Message[]>;
  isStreaming: boolean;
  isDegraded: boolean;
  currentInput: string;
  setCurrentInput: (input: string) => void;
  addMessage: (sessionId: string, role: Role, content: string) => void;
  appendChunk: (sessionId: string, chunk: string) => void;
  setStreaming: (isStreaming: boolean) => void;
  clearChat: (sessionId: string) => void;
  submitQuery: (sessionId: string, query: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messagesBySession: {},
      isStreaming: false,
      isDegraded: false,
      currentInput: '',
      
      setCurrentInput: (currentInput) => set({ currentInput }),
      
      addMessage: (sessionId, role, content) => set((state) => {
        const messages = state.messagesBySession[sessionId] || [];
        return {
          messagesBySession: {
            ...state.messagesBySession,
            [sessionId]: [
              ...messages,
              {
                id: `msg-${Date.now()}`,
                role,
                content,
                timestamp: Date.now(),
              }
            ]
          }
        };
      }),

      appendChunk: (sessionId, chunk) => set((state) => {
        const messages = state.messagesBySession[sessionId] || [];
        if (messages.length === 0) return state;

        const lastMessage = messages[messages.length - 1];
        
        // Only append if the last message is from the assistant
        if (lastMessage && lastMessage.role === 'assistant') {
          const updatedLastMessage = { ...lastMessage, content: lastMessage.content + chunk };
          const updatedMessages = [...messages.slice(0, -1), updatedLastMessage];
          
          return {
            messagesBySession: {
              ...state.messagesBySession,
              [sessionId]: updatedMessages
            }
          };
        }
        
        return state;
      }),

      setStreaming: (isStreaming) => {
        if (!isStreaming && activeAbortController) {
          activeAbortController.abort();
          activeAbortController = null;
        }
        set({ isStreaming });
      },

      clearChat: (sessionId) => set((state) => ({
        messagesBySession: {
          ...state.messagesBySession,
          [sessionId]: []
        },
        isStreaming: false,
        isDegraded: false
      })),

      submitQuery: async (sessionId, query) => {
        let isFirstMessage = false;

        set((state) => {
          if (state.isStreaming) return state; // Ignore if already streaming
          const messages = state.messagesBySession[sessionId] || [];
          isFirstMessage = messages.length === 0;

          return {
            isStreaming: true,
            isDegraded: false, // # ponytail: reset degraded flag on new query
            messagesBySession: {
              ...state.messagesBySession,
              [sessionId]: [
                ...messages,
                {
                  id: `msg-${Date.now()}`,
                  role: 'user',
                  content: query,
                  timestamp: Date.now(),
                }
              ]
            }
          };
        });

        // Trigger title generation if this is the first message
        if (isFirstMessage) {
          api.generateTitle(query)
            .then((res) => {
              if (res.title) {
                useWorkspaceStore.getState().updateSessionTitle(sessionId, res.title);
              }
            })
            .catch((err) => console.error("Failed to generate chat title:", err));
        }

        // Add empty assistant message placeholder
        set((state) => {
           const messages = state.messagesBySession[sessionId] || [];
           return {
             messagesBySession: {
               ...state.messagesBySession,
               [sessionId]: [
                 ...messages,
                 {
                   id: `msg-${Date.now()}`,
                   role: 'assistant',
                   content: '',
                   timestamp: Date.now(),
                 }
               ]
             }
           };
        });

        try {
          const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
          
          // Get the history, but exclude the current query and the blank assistant placeholder we just pushed
          const messages = get().messagesBySession[sessionId] || [];
          const history = messages
            .slice(0, -2) // remove the query and the blank assistant
            .filter((msg: Message) => msg.content) // # ponytail: filter empty messages without Date.now() race condition
            .map((msg: Message) => ({ role: msg.role, content: msg.content }));
          activeAbortController = new AbortController();
            
          for await (const data of startStream(`${baseURL}/api/stream`, {
            q: query,
            session_id: sessionId,
            history: history
          }, activeAbortController.signal)) {
            if (data.error) {
              set((state) => {
                const messages = state.messagesBySession[sessionId] || [];
                if (messages.length === 0) return { isStreaming: false };
                const lastMessage = messages[messages.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                  const updatedLastMessage = { ...lastMessage, content: lastMessage.content + `\n\n**Error:** ${data.error}` };
                  return { messagesBySession: { ...state.messagesBySession, [sessionId]: [...messages.slice(0, -1), updatedLastMessage] }, isStreaming: false };
                }
                return { isStreaming: false };
              });
              return;
            }
            if (data.sources) {
              set((state) => {
                const messages = state.messagesBySession[sessionId] || [];
                if (messages.length === 0) return state;
                const lastMessage = messages[messages.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                  // # ponytail: map raw sources to chunks to satisfy string[] type for evaluation
                  const chunks = data.sources.map((s: any) => s.chunk);
                  const updatedLastMessage = { ...lastMessage, contexts: chunks };
                  return { messagesBySession: { ...state.messagesBySession, [sessionId]: [...messages.slice(0, -1), updatedLastMessage] } };
                }
                return state;
              });
            }
            if (data.token) {
              set((state) => {
                const messages = state.messagesBySession[sessionId] || [];
                if (messages.length === 0) return state;
                const lastMessage = messages[messages.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                  const newContent = lastMessage.content + data.token;
                  // # ponytail: detect fallback sentinel
                  let isDegraded = state.isDegraded;
                  if (newContent.includes('⚠️ **AI service temporarily unavailable.**')) {
                    isDegraded = true;
                  }
                  const updatedLastMessage = { ...lastMessage, content: newContent };
                  return { isDegraded, messagesBySession: { ...state.messagesBySession, [sessionId]: [...messages.slice(0, -1), updatedLastMessage] } };
                }
                return state;
              });
            }
          }
          
          set({ isStreaming: false });
        } catch (error: any) {
          if (error.name === 'AbortError') return;
          console.error('Streaming error:', error);
          set((state) => {
            const messages = state.messagesBySession[sessionId] || [];
            if (messages.length === 0) return { isStreaming: false };
            
            const lastMessage = messages[messages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              let updatedContent = lastMessage.content;
              if (!updatedContent) {
                updatedContent = "**Error:** Connection to the backend failed. Ensure the server is running.";
              } else {
                updatedContent += "\n\n**Error:** Connection interrupted.";
              }
              const updatedLastMessage = { ...lastMessage, content: updatedContent };
              return { 
                messagesBySession: { ...state.messagesBySession, [sessionId]: [...messages.slice(0, -1), updatedLastMessage] },
                isStreaming: false 
              };
            }
            return { isStreaming: false };
          });
        } finally {
          set({ isStreaming: false });
          // # ponytail: sync history to backend
          const finalMessages = get().messagesBySession[sessionId] || [];
          saveHistory(sessionId, finalMessages).catch(() => {});
        }
      }
    }),
    {
      name: 'sm-chats', // unique name for localStorage
      partialize: (state) => ({ messagesBySession: state.messagesBySession }),
    }
  )
);
