import { useEffect, useRef } from 'react';
import { useChatStore, Message } from '../../stores/chatStore';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { StreamingMessage } from './StreamingMessage';
import { MetricsCard } from '../eval/MetricsCard';
import { Brain } from 'lucide-react';

const EMPTY_MESSAGES: Message[] = [];

export function ChatContainer() {
  const activeSessionId = useWorkspaceStore((state) => state.activeSessionId);
  const messages = useChatStore((state) => state.messagesBySession[activeSessionId] || EMPTY_MESSAGES);
  const setCurrentInput = useChatStore((state) => state.setCurrentInput);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8 space-y-8 scroll-smooth flex flex-col">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 w-full max-w-2xl mx-auto text-slate-600 dark:text-slate-400 mb-10 transition-colors">
          <div className="w-16 h-16 mb-6 rounded-2xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shadow-sm">
            <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">How can I help you research today?</h2>
          <p className="text-center text-slate-500 dark:text-slate-400 mb-10 text-[15px]">
            I can analyze your ingested documents, summarize<br />complex PDFs, or extract insights from YouTube videos.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl">
            <button
              onClick={() => setCurrentInput("Summarize the main points of our ingested documents.")}
              className="text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#111827] hover:border-purple-300 dark:hover:border-purple-500 hover:shadow-md transition-all group"
            >
              <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1 group-hover:text-purple-700 dark:group-hover:text-purple-400">Summarize documents</p>
              <p className="text-sm text-slate-400 dark:text-slate-500">Get a high-level overview</p>
            </button>
            <button
              onClick={() => setCurrentInput("What are the key technical constraints mentioned?")}
              className="text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#111827] hover:border-purple-300 dark:hover:border-purple-500 hover:shadow-md transition-all group"
            >
              <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1 group-hover:text-purple-700 dark:group-hover:text-purple-400">Find constraints</p>
              <p className="text-sm text-slate-400 dark:text-slate-500">Extract specific technical details</p>
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto w-full space-y-8 pb-10">
          {messages.map((message, index) => {
            const previousMessage = index > 0 ? messages[index - 1] : null;
            return (
              <div key={message.id} className="flex flex-col">
                <StreamingMessage message={message} />
                {message.role === 'assistant' && previousMessage && message.content && (
                  <MetricsCard 
                    messageId={message.id} 
                    question={previousMessage.content} 
                    answer={message.content}
                    sessionId={activeSessionId}
                  />
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      )}
    </div>
  );
}
