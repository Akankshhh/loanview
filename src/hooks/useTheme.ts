// src/hooks/useTheme.ts
"use client";

import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

export function useTheme(defaultTheme: Theme = 'light') {
  const [theme, setTheme] = useState<Theme>(() => {
    // This function runs only on the client, after the initial render.
    // This avoids a server-client mismatch.
    if (typeof window === 'undefined') {
      return defaultTheme;
    }
    const storedTheme = window.localStorage.getItem('loanview-theme') as Theme | null;
    if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
      return storedTheme;
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  useEffect(() => {
    // This effect synchronizes the theme state with the DOM and localStorage.
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('loanview-theme', theme);
  }, [theme]);


  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, toggleTheme, setTheme };
}
