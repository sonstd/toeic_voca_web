'use client';

import { createContext, useCallback, useContext, useEffect } from 'react';

// ── 모듈 스코프 싱글턴 ──────────────────────────────────────────
// 컴포넌트가 언마운트/리마운트되어도 이 Map은 탭이 살아있는 한 유지됩니다.
const globalCache = new Map();          // `${level}:${day}` → words[]
const prefetchStarted = new Set();      // 이미 prefetch를 시작한 level 추적
// ────────────────────────────────────────────────────────────────

function getCacheKey(level, day) {
  return `${level}:${day}`;
}

const WordsCacheContext = createContext(null);

export function useWordsCache() {
  const ctx = useContext(WordsCacheContext);
  if (!ctx) throw new Error('useWordsCache must be used within WordsCacheProvider');
  return ctx;
}

export default function WordsCacheProvider({ level, totalDays, children }) {
  const setInitial = useCallback((day, words) => {
    const key = getCacheKey(level, day);
    if (!globalCache.has(key)) {
      globalCache.set(key, words);
    }
  }, [level]);

  const getCached = useCallback((day) => {
    return globalCache.get(getCacheKey(level, day)) ?? null;
  }, [level]);

  useEffect(() => {
    // 이미 이 레벨에 대해 prefetch를 시작했다면 다시 시작하지 않음
    if (prefetchStarted.has(level)) return;
    prefetchStarted.add(level);

    let cancelled = false;

    async function prefetchAll() {
      for (let day = 1; day <= totalDays; day++) {
        if (cancelled) return;

        const key = getCacheKey(level, day);
        if (globalCache.has(key)) continue; // 이미 캐시에 있으면 스킵

        try {
          const res = await fetch(`/api/words/${level}/day${day}`);
          if (res.ok) {
            const data = await res.json();
            if (!cancelled && data.words) {
              globalCache.set(key, data.words);
            }
          }
        } catch {
          // 백그라운드 prefetch 실패는 조용히 무시
        }

        await new Promise((r) => setTimeout(r, 30));
      }
    }

    let handle;
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      handle = window.requestIdleCallback(prefetchAll);
    } else {
      handle = setTimeout(prefetchAll, 200);
    }

    return () => {
      cancelled = true;
      // prefetchStarted에서 제거하지 않음 → 재마운트 시 prefetch 재시작 방지
      if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(handle);
      } else {
        clearTimeout(handle);
      }
    };
  }, [level, totalDays]);

  return (
    <WordsCacheContext.Provider value={{ level, totalDays, getCached, setInitial }}>
      {children}
    </WordsCacheContext.Provider>
  );
}