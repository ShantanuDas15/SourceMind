import { useEffect, useState } from 'react';
import { apiClient } from './api/client';
import { Activity } from 'lucide-react';

function App() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await apiClient.get('/api/health');
        if (response.data.status === 'ok') {
          setStatus('connected');
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Backend connection failed:', error);
        setStatus('error');
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#242424] text-white">
      <div className="flex flex-col items-center p-8 bg-[#333] rounded-2xl shadow-xl border border-gray-700 max-w-sm w-full transition-all hover:shadow-2xl">
        <Activity 
          className={`w-16 h-16 mb-4 ${
            status === 'connected' ? 'text-green-400' : 
            status === 'error' ? 'text-red-400' : 'text-blue-400 animate-pulse'
          }`}
        />
        
        <h1 className="text-2xl font-bold mb-2">SourceMind</h1>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">Phase 1</h2>
        
        <div className="w-full bg-black/30 rounded-lg p-4 text-center">
          {status === 'loading' && (
            <p className="text-blue-300 font-medium animate-pulse">Connecting to backend...</p>
          )}
          {status === 'connected' && (
            <p className="text-green-300 font-medium flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
              Connected to Backend
            </p>
          )}
          {status === 'error' && (
            <p className="text-red-300 font-medium">Connection Failed. Is FastAPI running?</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
