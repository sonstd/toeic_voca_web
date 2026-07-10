'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { hasTestedToday } from '@/lib/testSessions';
import { isDayUnlocked } from '@/lib/planLimits';
import ProSheet from './ProSheet';
import styles from './TestSetup.module.css';

const SELECTION_KEY = 'vocab-test-selection';

export default function TestSetup({ levels, onRequestLogin }) {
  const router = useRouter();
  const { user, plan, planLoading } = useAuth();
  const [selected, setSelected] = useState({}); // `${level}:${day}` -> true
  const [proOpen, setProOpen] = useState(false);
  const [testedToday, setTestedToday] = useState(false);

  useEffect(() => {
    if (!user || planLoading || plan === 'pro') return;
    const supabase = createClient();
    hasTestedToday(supabase).then(setTestedToday);
  }, [user, plan, planLoading]);

  const selectedCount = Object.keys(selected).length;

  const unlockedDaysFor = (level, totalDays) => {
    const days = Array.from({ length: totalDays }, (_, i) => i + 1);
    return days.filter((day) => isDayUnlocked(level, day, plan));
  };

  const toggleDay = (level, day) => {
    if (!isDayUnlocked(level, day, plan)) {
      setProOpen(true);
      return;
    }
    const key = `${level}:${day}`;
    setSelected((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = true;
      return next;
    });
  };

  const isLevelFullySelected = (level, totalDays) => {
    const unlockedDays = unlockedDaysFor(level, totalDays);
    return unlockedDays.length > 0 && unlockedDays.every((day) => selected[`${level}:${day}`]);
  };

  const toggleAllForLevel = (level, totalDays) => {
    const fullySelected = isLevelFullySelected(level, totalDays);
    const unlockedDays = unlockedDaysFor(level, totalDays);
    setSelected((prev) => {
      const next = { ...prev };
      for (const day of unlockedDays) {
        const key = `${level}:${day}`;
        if (fullySelected) delete next[key];
        else next[key] = true;
      }
      return next;
    });
  };

  const handleStart = () => {
    const selection = Object.keys(selected).map((key) => {
      const [level, day] = key.split(':');
      return { level, day: Number(day) };
    });
    if (!selection.length) return;
    sessionStorage.setItem(SELECTION_KEY, JSON.stringify(selection));
    router.push('/test/session');
  };

  if (!user) {
    return (
      <div className={styles.loginNotice}>
        <p className={styles.loginNoticeText}>로그인하고 테스트를 시작해보세요.</p>
        <button className={styles.loginNoticeBtn} onClick={onRequestLogin}>
          로그인하기
        </button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {levels.map(({ key: level, label, totalDays }) => {
        const days = Array.from({ length: totalDays }, (_, i) => i + 1);
        const fullySelected = isLevelFullySelected(level, totalDays);
        return (
          <div key={level} className={styles.levelGroup}>
            <div className={styles.levelHeader}>
              <span className={styles.levelLabel}>{label}</span>
              <button
                className={styles.selectAllBtn}
                onClick={() => toggleAllForLevel(level, totalDays)}
              >
                {fullySelected ? '전체 해제' : '전체 선택'}
              </button>
            </div>
            <div className={styles.dayGrid}>
              {days.map((day) => {
                const unlocked = isDayUnlocked(level, day, plan);
                const active = !!selected[`${level}:${day}`];
                return (
                  <button
                    key={day}
                    className={`${styles.dayChip} ${active ? styles.dayChipActive : ''} ${!unlocked ? styles.dayChipLocked : ''}`}
                    onClick={() => toggleDay(level, day)}
                  >
                    {unlocked ? day : '🔒'}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className={styles.startBar}>
        {plan !== 'pro' && testedToday ? (
          <div className={styles.limitNotice}>
            <span className={styles.limitNoticeText}>오늘의 무료 테스트를 모두 사용했어요.</span>
            <button className={styles.limitNoticeBtn} onClick={() => setProOpen(true)}>
              Pro 살펴보기
            </button>
          </div>
        ) : (
          <button
            className={styles.startButton}
            disabled={selectedCount === 0}
            onClick={handleStart}
          >
            테스트 시작하기 ({selectedCount}일 선택됨)
          </button>
        )}
      </div>

      <ProSheet open={proOpen} onClose={() => setProOpen(false)} />
    </div>
  );
}
