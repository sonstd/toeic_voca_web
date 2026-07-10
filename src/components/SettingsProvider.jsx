'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import { createClient } from '@/lib/supabase/client';

const SettingsContext = createContext(null);

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

const STORAGE_KEY = 'vocab-app-settings';
const DEFAULT_SETTINGS = { theme: 'light', shuffle: false };

// 비로그인 사용자: 이번 세션에서만 유지 (브라우저를 닫았다 열면 기본값으로 복귀)
function loadSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

function saveSession(s) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

export default function SettingsProvider({ children }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // 비로그인: 세션 스토리지에서 불러와 적용
  useEffect(() => {
    if (user) return;
    const saved = loadSession();
    setSettings(saved);
    applyTheme(saved.theme);
  }, [user]);

  // 로그인: 계정(profiles)에 저장된 설정을 불러와 적용
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const supabase = createClient();

    supabase
      .from('profiles')
      .select('theme, shuffle')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (cancelled) return;
        const next = {
          theme: data?.theme ?? DEFAULT_SETTINGS.theme,
          shuffle: data?.shuffle ?? DEFAULT_SETTINGS.shuffle,
        };
        setSettings(next);
        applyTheme(next.theme);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  // 로그인 시엔 계정에, 비로그인 시엔 세션 스토리지에 저장
  const persist = useCallback((next) => {
    if (user) {
      const supabase = createClient();
      supabase.from('profiles').update({ theme: next.theme, shuffle: next.shuffle }).eq('id', user.id).then(() => {});
    } else {
      saveSession(next);
    }
  }, [user]);

  const setTheme = useCallback((theme) => {
    setSettings((prev) => {
      const next = { ...prev, theme };
      applyTheme(theme);
      persist(next);
      return next;
    });
  }, [persist]);

  const setShuffle = useCallback((shuffle) => {
    setSettings((prev) => {
      const next = { ...prev, shuffle };
      persist(next);
      return next;
    });
  }, [persist]);

  return (
    <SettingsContext.Provider value={{ ...settings, setTheme, setShuffle }}>
      {children}
    </SettingsContext.Provider>
  );
}
