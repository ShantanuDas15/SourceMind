import { useIngestStore, Source } from '../../stores/ingestStore';
import { useChatStore, Message } from '../../stores/chatStore';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { Database, Link, FileText, Video, Plus, Brain, MessageSquare, Trash2, X } from 'lucide-react';

const EMPTY_SOURCES: Source[] = [];
const EMPTY_MESSAGES: Message[] = [];

export function Sidebar() {
  const { sessions, activeSessionId, createSession, setActiveSession, deleteSession } = useWorkspaceStore();
  const sources = useIngestStore((state) => state.sourcesBySession[activeSessionId] || EMPTY_SOURCES);
  const setPanelOpen = useIngestStore((state) => state.setPanelOpen);
  const removeSource = useIngestStore((state) => state.removeSource);
  const clearChat = useChatStore((state) => state.clearChat);
  const messages = useChatStore((state) => state.messagesBySession[activeSessionId] || EMPTY_MESSAGES);

  const getIcon = (type: string) => {
    switch (type) {
      case 'web': return <Link className="w-4 h-4 text-blue-500" />;
      case 'pdf': return <FileText className="w-4 h-4 text-red-500" />;
      case 'youtube': return <Video className="w-4 h-4 text-red-500" />;
      default: return <Database className="w-4 h-4 text-gray-500" />;
    }
  };

  const sortedSessions = Object.values(sessions).sort((a, b) => b.updatedAt - a.updatedAt);

  const handleNewChat = () => {
    // Prevent creating a new chat if the current active session is already empty
    if (messages.length === 0 && sources.length === 0) {
      return;
    }
    createSession();
  };

  return (
    <aside className="w-72 h-full border-r border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#111827] flex flex-col z-20 flex-shrink-0 transition-colors">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 mb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-600 dark:text-purple-500" />
          <h1 className="text-xl font-bold tracking-tight text-purple-700 dark:text-purple-400">
            SourceMind
          </h1>
        </div>
      </div>

      <div className="px-4 mb-4 flex-shrink-0">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-6 pb-6">
        {/* Chat History Section */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2">
            Recent Chats
          </h2>
          <div className="space-y-1">
            {sortedSessions.map((session) => (
              <div 
                key={session.id}
                onClick={() => setActiveSession(session.id)}
                className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors cursor-pointer group relative ${
                  activeSessionId === session.id 
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/50 text-purple-900 dark:text-purple-300' 
                    : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-[#1e293b] text-slate-600 dark:text-slate-400'
                }`}
              >
                <MessageSquare className={`w-4 h-4 flex-shrink-0 ${activeSessionId === session.id ? 'text-purple-600 dark:text-purple-400' : ''}`} />
                <span className="text-sm font-medium truncate flex-1">{session.title}</span>
                
                {Object.keys(sessions).length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all absolute right-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Knowledge Base Section */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-3.5 h-3.5" />
              Knowledge Base
            </h2>
            <button 
              onClick={() => setPanelOpen(true)}
              className="p-1 rounded-md text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors" 
              title="Add Source"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            {sources.map((source) => (
              <div 
                key={source.id} 
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group relative"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm">
                  {getIcon(source.type)}
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {source.name}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    {new Date(source.timestamp).toISOString().split('T')[0]}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSource(activeSessionId, source.id);
                  }}
                  className="absolute right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  title="Remove Source"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {sources.length === 0 && (
              <div className="text-center p-4 text-sm text-slate-400 dark:text-slate-500">
                No sources in this chat.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800/60">
        <button 
          onClick={() => clearChat(activeSessionId)}
          disabled={messages.length === 0}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-semibold transition-colors ${
            messages.length === 0 
              ? 'border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 bg-transparent cursor-not-allowed' 
              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          Clear Chat
        </button>
      </div>
    </aside>
  );
}
