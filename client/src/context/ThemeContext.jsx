import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

function initialTheme() {
  try {
    const stored = localStorage.getItem('lifeflow-theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // storage unavailable — fall through to system preference
  }
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('lifeflow-theme', theme);
    } catch {
      // storage unavailable — theme still applies for the session
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
