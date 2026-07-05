import { AlertTriangle } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';

export function DegradedBanner({ retryIn = 30 }: { retryIn?: number }) {
  const isDegraded = useChatStore((state) => state.isDegraded);

  if (!isDegraded) return null;

  return (
    <div className="bg-amber-500/90 backdrop-blur-sm text-white px-4 py-2 flex items-center justify-between text-sm font-medium z-40 animate-in fade-in slide-in-from-top-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" />
        <span>AI service is temporarily unavailable due to high load or API failures. Using fallback response.</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-amber-100 text-xs bg-amber-600/50 px-2 py-0.5 rounded-full">
          Recovery window: ~{retryIn}s
        </span>
      </div>
    </div>
  );
}
