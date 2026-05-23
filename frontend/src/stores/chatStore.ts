import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../api/client';
import { useWorkspaceStore } from './workspaceStore';
export type Role = 'user' | 'assistant';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
}

interface ChatState {
  messagesBySession: Record<string, Message[]>;
  isStreaming: boolean;
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

      setStreaming: (isStreaming) => set({ isStreaming }),

      clearChat: (sessionId) => set((state) => ({
        messagesBySession: {
          ...state.messagesBySession,
          [sessionId]: []
        },
        isStreaming: false
      })),

      submitQuery: async (sessionId, query) => {
        let isFirstMessage = false;

        set((state) => {
          if (state.isStreaming) return state; // Ignore if already streaming
          const messages = state.messagesBySession[sessionId] || [];
          isFirstMessage = messages.length === 0;

          return {
            isStreaming: true,
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
            .filter((msg: Message) => msg.content && msg.id !== `msg-${Date.now()}`) // remove empty ones
            .slice(0, -2) // remove the query and the blank assistant
            .map((msg: Message) => ({ role: msg.role, content: msg.content }));
            
          const response = await fetch(`${baseURL}/api/stream`, {
            method: 'POST',
            headers: {
              'Accept': 'text/event-stream',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              q: query,
              session_id: sessionId,
              history: history
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const reader = response.body?.getReader();
          const decoder = new TextDecoder('utf-8');

          if (!reader) {
            throw new Error('No reader available');
          }

          let buffer = '';

          while (true) {
            const { value, done } = await reader.read();
            
            if (done) {
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            
            // Keep the last partial chunk in the buffer
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.replace('data: ', '').trim();
                
                if (dataStr === '[DONE]') {
                  set({ isStreaming: false });
                  return;
                }

                try {
                  const data = JSON.parse(dataStr);
                  
                  if (data.error) {
                    set((state) => {
                      const messages = state.messagesBySession[sessionId] || [];
                      if (messages.length === 0) return { isStreaming: false };
                      
                      const lastMessage = messages[messages.length - 1];
                      if (lastMessage && lastMessage.role === 'assistant') {
                        const updatedLastMessage = { ...lastMessage, content: lastMessage.content + `\n\n**Error:** ${data.error}` };
                        return { 
                          messagesBySession: { ...state.messagesBySession, [sessionId]: [...messages.slice(0, -1), updatedLastMessage] },
                          isStreaming: false 
                        };
                      }
                      return { isStreaming: false };
                    });
                    return;
                  }

                  if (data.token) {
                    set((state) => {
                      const messages = state.messagesBySession[sessionId] || [];
                      if (messages.length === 0) return state;
                      
                      const lastMessage = messages[messages.length - 1];
                      if (lastMessage && lastMessage.role === 'assistant') {
                        const updatedLastMessage = { ...lastMessage, content: lastMessage.content + data.token };
                        return { 
                          messagesBySession: { ...state.messagesBySession, [sessionId]: [...messages.slice(0, -1), updatedLastMessage] } 
                        };
                      }
                      return state;
                    });
                  }
                } catch (e) {
                  console.warn('Failed to parse SSE data:', dataStr);
                }
              }
            }
          }
        } catch (error) {
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
        }
      }
    }),
    {
      name: 'sm-chats', // unique name for localStorage
      partialize: (state) => ({ messagesBySession: state.messagesBySession }),
    }
  )
);
