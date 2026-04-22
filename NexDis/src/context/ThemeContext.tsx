import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';

type ThemeMode = 'dark' | 'light';

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'nexdis.theme.mode';

function applyThemeToDom(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.add('theme-aurora');
  root.classList.toggle('dark', mode === 'dark');
  root.classList.toggle('light', mode === 'light');
}

export function ThemeProvider({children}: {children: React.ReactNode}) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  useEffect(() => {
    applyThemeToDom(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const value = useMemo<ThemeContextValue>(() => {
    return {
      mode,
      setMode: setModeState,
      toggle: () => setModeState((m) => (m === 'dark' ? 'light' : 'dark')),
    };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
