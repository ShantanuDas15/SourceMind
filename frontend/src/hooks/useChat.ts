import { useChatStore } from '../stores/chatStore';
import { Role } from '../types';

export function useChat(sessionId: string) {
  const store = useChatStore();
  
  return {
    messages: store.messagesBySession[sessionId] || [],
    isStreaming: store.isStreaming,
    isDegraded: store.isDegraded,
    currentInput: store.currentInput,
    setCurrentInput: store.setCurrentInput,
    addMessage: (role: Role, content: string) => store.addMessage(sessionId, role, content),
    appendChunk: (chunk: string) => store.appendChunk(sessionId, chunk),
    setStreaming: store.setStreaming,
    clearChat: () => store.clearChat(sessionId),
    submitQuery: (query: string) => store.submitQuery(sessionId, query),
  };
}
