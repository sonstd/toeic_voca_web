'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const SettingsContext = createContext(null);

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

const STORAGE_KEY = 'vocab-app-settings';
const DEFAULT_SETTINGS = { theme: 'light', shuffle: false };

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

function save(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

export default function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // 마운트 시 localStorage에서 불러와 DOM에 반영
  useEffect(() => {
    const saved = load();
    setSettings(saved);
    document.documentElement.setAttribute('data-theme', saved.theme);
  }, []);

  // 테마 변경: 상태 갱신 + DOM 즉시 반영 + 저장
  const setTheme = useCallback((theme) => {
    setSettings((prev) => {
      const next = { ...prev, theme };
      save(next);
      document.documentElement.setAttribute('data-theme', theme);
      return next;
    });
  }, []);

  // 셔플 변경: 상태 갱신 + 저장
  const setShuffle = useCallback((shuffle) => {
    setSettings((prev) => {
      const next = { ...prev, shuffle };
      save(next);
      return next;
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ ...settings, setTheme, setShuffle }}>
      {children}
    </SettingsContext.Provider>
  );
}