import { useRef, KeyboardEvent } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { Send, StopCircle } from 'lucide-react';
export function ChatInput() {
  const { currentInput, setCurrentInput, isStreaming, setStreaming, submitQuery } = useChatStore();
  const activeSessionId = useWorkspaceStore((state) => state.activeSessionId);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentInput(e.target.value);
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!currentInput.trim() || isStreaming) return;

    const query = currentInput.trim();
    setCurrentInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    submitQuery(activeSessionId, query);
  };

  return (
    <div className="p-4 md:p-6 bg-white dark:bg-slate-950 shrink-0 pb-8 transition-colors">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end gap-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-purple-500/30 rounded-[2rem] p-1.5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] focus-within:border-slate-300 dark:focus-within:border-purple-500/70 focus-within:shadow-[0_4px_25px_-4px_rgba(0,0,0,0.08)] dark:focus-within:shadow-[0_0_25px_-5px_rgba(124,58,237,0.15)] transition-all">
          <textarea
            ref={textareaRef}
            value={currentInput}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your sources..."
            className="flex-1 max-h-[200px] bg-transparent text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 px-5 py-3.5 resize-none focus:outline-none leading-relaxed text-[15px]"
            rows={1}
            disabled={isStreaming}
            maxLength={2000}
          />
          <button
            onClick={isStreaming ? () => setStreaming(false) : handleSubmit}
            disabled={!currentInput.trim() && !isStreaming}
            className={`p-3 rounded-full flex-shrink-0 transition-all m-1 ${
              isStreaming 
                ? 'bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50' 
                : currentInput.trim() 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105' 
                  : 'bg-transparent text-slate-300 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            {isStreaming ? <StopCircle className="w-5 h-5" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <div className="flex justify-between items-center mt-3 px-4">
          <span className="w-12"></span>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium text-center flex-1">AI can make mistakes. Verify important information with the original sources.</p>
          <p className={`text-[10px] font-medium w-12 text-right ${currentInput.length >= 2000 ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>
            {currentInput.length}/2000
          </p>
        </div>
      </div>
    </div>
  );
}
