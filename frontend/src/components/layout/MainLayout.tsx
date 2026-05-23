import { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useThemeStore } from '../../stores/themeStore';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  // Ensure the theme store initializes
  useThemeStore();

  return (
    <div className="flex h-screen w-full bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 overflow-hidden transition-colors">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        <Header />
        <main className="flex-1 relative flex flex-col min-h-0 bg-white dark:bg-slate-950 transition-colors">
          {children}
        </main>
      </div>
    </div>
  );
}
