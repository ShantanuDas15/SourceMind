import { useState, useRef } from 'react';
import { useIngestStore } from '../../stores/ingestStore';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { useToastStore } from '../../stores/toastStore';
import { Link as LinkIcon, FileText, Video, Loader2, X } from 'lucide-react';
import { ingestUrl, ingestPdf } from '../../api/ingest';

export function IngestPanel() {
  const [activeTab, setActiveTab] = useState<'web' | 'pdf' | 'youtube'>('web');
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeSessionId = useWorkspaceStore((state) => state.activeSessionId);
  const { status, setStatus, errorMessage, addSource, isPanelOpen, setPanelOpen } = useIngestStore();
  const addToast = useToastStore((state) => state.addToast);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        addToast('Please select a valid PDF file.', 'error');
        return;
      }
      setSelectedFile(file);
    }
  };

  const isValidUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab !== 'pdf' && !inputValue.trim()) return;
    if (activeTab === 'pdf' && !selectedFile) return;

    // Client-side URL validation
    if (activeTab !== 'pdf') {
      const url = inputValue.trim();
      if (!isValidUrl(url)) {
        addToast('Please enter a valid URL starting with http:// or https://', 'error');
        return;
      }
      
      // # ponytail: validate youtube pattern if on youtube tab
      if (activeTab === 'youtube' && !url.includes('youtube.com/watch?v=') && !url.includes('youtu.be/')) {
        addToast('Please enter a valid YouTube video URL (youtu.be/ or youtube.com/watch?v=)', 'error');
        return;
      }
    }

    // Client-side PDF type and size validation (10MB)
    if (activeTab === 'pdf' && selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        addToast('Only PDF files are supported.', 'error');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        addToast('PDF file exceeds the 10MB size limit.', 'error');
        return;
      }
    }

    setStatus('ingesting');

    try {
      let chunksStored = 0;
      
      if (activeTab === 'pdf') {
        const res = await ingestPdf(selectedFile!, activeSessionId);
        chunksStored = res.data?.chunks_stored || 0;
        addSource(activeSessionId, { id: res.data.source_id, name: selectedFile!.name, type: 'pdf' });
      } else {
        const res = await ingestUrl(inputValue.trim(), activeSessionId);
        chunksStored = res.data?.chunks_stored || 0;
        addSource(activeSessionId, { id: res.data.source_id, name: inputValue.trim(), type: activeTab });
      }
      
      setStatus('success');
      setInputValue('');
      setSelectedFile(null);
      addToast(`Ingested successfully (${chunksStored} chunks)`, 'success');
      
      setTimeout(() => {
        setStatus('idle');
        setPanelOpen(false);
      }, 1000);
      
    } catch (error: any) {
      console.error("Ingestion failed:", error);
      const msg = error.message || "Failed to ingest source.";
      setStatus('error', msg);
      addToast(msg, 'error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  if (!isPanelOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm p-4 transition-colors">
      <div className="bg-white dark:bg-[#0B0F19] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl dark:shadow-purple-900/10 border border-transparent dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 flex items-center justify-between border-b border-transparent dark:border-slate-800/60">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Add Knowledge Source</h3>
          <button
            onClick={() => setPanelOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="flex p-1.5 bg-slate-100 dark:bg-[#1e293b]/40 rounded-xl mb-6">
            <button
              onClick={() => setActiveTab('web')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${activeTab === 'web' ? 'bg-white dark:bg-[#2a3441] text-indigo-600 dark:text-indigo-400 shadow-sm dark:ring-1 dark:ring-white/10' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >
              <LinkIcon className="w-4 h-4" /> Web
            </button>
            <button
              onClick={() => setActiveTab('pdf')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${activeTab === 'pdf' ? 'bg-white dark:bg-[#2a3441] text-indigo-600 dark:text-indigo-400 shadow-sm dark:ring-1 dark:ring-white/10' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >
              <FileText className="w-4 h-4" /> PDF
            </button>
            <button
              onClick={() => setActiveTab('youtube')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${activeTab === 'youtube' ? 'bg-white dark:bg-[#2a3441] text-indigo-600 dark:text-indigo-400 shadow-sm dark:ring-1 dark:ring-white/10' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >
              <Video className="w-4 h-4" /> YouTube
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {activeTab === 'web' ? 'Website URL' : activeTab === 'pdf' ? 'Upload Document' : 'YouTube Video URL'}
              </label>

              {activeTab === 'pdf' ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-indigo-500/50 rounded-xl p-8 text-center hover:border-indigo-400 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors cursor-pointer bg-slate-50 dark:bg-transparent"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    accept=".pdf" 
                    className="hidden" 
                  />
                  <FileText className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    {selectedFile ? selectedFile.name : 'Upload a file'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'PDF up to 10MB'}
                  </p>
                </div>
              ) : (
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-slate-400 dark:text-slate-500">
                    {activeTab === 'web' ? <LinkIcon className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  </div>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={activeTab === 'web' ? 'https://example.com/article' : 'https://youtube.com/watch?v=...'}
                    className="w-full bg-white dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-500 transition-all"
                    required
                  />
                </div>
              )}
            </div>

            {status === 'error' && errorMessage && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-900/50">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'ingesting' || (activeTab !== 'pdf' && !inputValue) || (activeTab === 'pdf' && !selectedFile)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600/30 dark:hover:bg-indigo-600/50 disabled:opacity-50 text-white dark:text-indigo-300 font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {status === 'ingesting' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : status === 'success' ? (
                'Success!'
              ) : (
                'Process & Ingest'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
