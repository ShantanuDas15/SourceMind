import { create } from 'zustand';

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// Check local storage or system preference for initial state
const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('sm-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false; // Default to light mode
};

export const useThemeStore = create<ThemeState>((set) => {
  // Setup initial class on document
  const initialTheme = getInitialTheme();
  if (initialTheme) {
    document.documentElement.classList.add('dark');
  }

  return {
    isDarkMode: initialTheme,
    toggleTheme: () => set((state) => {
      const newIsDark = !state.isDarkMode;
      
      if (newIsDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('sm-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('sm-theme', 'light');
      }
      
      return { isDarkMode: newIsDark };
    }),
  };
});
