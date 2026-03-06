import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useThemeStore } from '@/stores/useThemeStore';

const ThemeContext = createContext<{ theme: 'light' | 'dark'; toggle: () => void }>({
  theme: 'dark',
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, toggle } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
