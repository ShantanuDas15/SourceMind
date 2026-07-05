import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { AlertCircle, X, WifiOff } from 'lucide-react';

export function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await api.checkHealth();
        // # ponytail: reset dismiss state if we reconnect, to show it again if it drops later
        if (!isConnected) {
          setIsConnected(true);
          setIsDismissed(false);
        }
      } catch (error) {
        setIsConnected(false);
      }
    };

    // Check immediately, then every 30s
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [isConnected]);

  if (isConnected || isDismissed) return null;

  return (
    <div className="bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 flex items-center justify-between text-sm font-medium z-50 animate-in fade-in slide-in-from-top-4">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span>Cannot connect to the backend server. Retrying...</span>
      </div>
      <button 
        onClick={() => setIsDismissed(true)} 
        className="hover:bg-red-600/50 p-1.5 rounded-full transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
