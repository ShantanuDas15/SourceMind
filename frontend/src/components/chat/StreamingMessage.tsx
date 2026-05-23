import { Streamdown } from 'streamdown';
import { Brain, User } from 'lucide-react';
import { Message } from '../../stores/chatStore';

interface StreamingMessageProps {
  message: Message;
}

export function StreamingMessage({ message }: StreamingMessageProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex gap-4 w-full ${isAssistant ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-1 ${
        isAssistant 
          ? 'bg-purple-100 dark:bg-purple-900/40' 
          : 'bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-slate-800'
      }`}>
        {isAssistant ? (
          <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        ) : (
          <User className="w-5 h-5 text-slate-500 dark:text-slate-400" />
        )}
      </div>

      {/* Message Bubble */}
      <div className={`flex flex-col max-w-[85%] ${isAssistant ? 'items-start' : 'items-end'}`}>
        <div className={`px-5 py-4 ${
          isAssistant 
            ? 'text-slate-700 dark:text-slate-300' 
            : 'bg-slate-100 dark:bg-[#111827] text-slate-800 dark:text-slate-200 rounded-2xl rounded-tr-sm border border-slate-200 dark:border-slate-800/60'
        }`}>
          <div className="prose prose-p:leading-relaxed prose-pre:p-0 max-w-none text-[15px] dark:prose-invert">
            {message.content ? (
               <Streamdown>{message.content}</Streamdown>
            ) : (
              <span className="flex gap-1 items-center h-5">
                <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
