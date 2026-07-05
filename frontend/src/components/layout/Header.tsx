import { Moon, Sun, BarChart2 } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { useEvalStore } from '../../stores/evalStore';

export function Header() {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const setDashboardOpen = useEvalStore((state) => state.setDashboardOpen);

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800/60 z-10 flex-shrink-0 transition-colors">
      <div className="flex items-center">
        <h1 className="text-lg font-bold text-slate-700 dark:text-slate-200">
          Research Assistant
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-500 text-[11px] font-bold uppercase tracking-wider border border-transparent dark:border-emerald-900/50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Groq Llama 3.3 Connected
        </div>
        
        <button 
          onClick={() => setDashboardOpen(true)}
          title="Open Evaluation Dashboard"
          className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
        >
          <BarChart2 className="w-4 h-4" />
        </button>

        <button 
          onClick={toggleTheme}
          className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
