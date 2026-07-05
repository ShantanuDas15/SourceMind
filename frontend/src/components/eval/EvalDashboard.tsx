import { X, BarChart2 } from 'lucide-react';
import { useEvalStore } from '../../stores/evalStore';
import { MetricsHistory } from './MetricsHistory';

export function EvalDashboard() {
  const { isDashboardOpen, setDashboardOpen } = useEvalStore();

  if (!isDashboardOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm p-4 transition-colors">
      <div className="bg-white dark:bg-[#0B0F19] w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl dark:shadow-purple-900/10 border border-transparent dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
        <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Evaluation Dashboard</h3>
          </div>
          <button
            onClick={() => setDashboardOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-0 flex-1 min-h-[300px]">
          <MetricsHistory />
        </div>
      </div>
    </div>
  );
}
