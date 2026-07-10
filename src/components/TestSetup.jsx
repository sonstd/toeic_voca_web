'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { hasTestedToday } from '@/lib/testSessions';
import { isDayUnlocked } from '@/lib/planLimits';
import { getTestProgress, saveTestProgress, clearTestProgress } from '@/lib/testProgress';
import ProSheet from './ProSheet';
import styles from './TestSetup.module.css';

export default function TestSetup({ levels, onRequestLogin }) {
  const router = useRouter();
  const { user, plan, planLoading } = useAuth();
  const [selected, setSelected] = useState({}); // `${level}:${day}` -> true
  const [proOpen, setProOpen] = useState(false);
  const [testedToday, setTestedToday] = useState(false);
  const [resumeProgress, setResumeProgress] = useState(null); // { index, total } | null

  useEffect(() => {
    if (!user || planLoading || plan === 'pro') return;
    const supabase = createClient();
    hasTestedToday(supabase).then(setTestedToday);
  }, [user, plan, planLoading]);

  // 도중에 중단한 테스트가 있는지 확인
  useEffect(() => {
    if (!user) return;
    const progress = getTestProgress();
    if (progress?.words?.length && (progress.index ?? 0) < progress.words.length) {
      setResumeProgress({ index: progress.index ?? 0, total: progress.words.length });
    } else {
      setResumeProgress(null);
    }
  }, [user]);

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
    saveTestProgress({ selection, words: null, index: 0, results: [] });
    router.push('/test/session');
  };

  const handleStartNew = () => {
    clearTestProgress();
    setResumeProgress(null);
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

  if (resumeProgress) {
    return (
      <div className={styles.resumeNotice}>
        <p className={styles.resumeNoticeText}>
          이전에 진행 중이던 테스트가 있어요 ({resumeProgress.index} / {resumeProgress.total})
        </p>
        <div className={styles.resumeActions}>
          <button className={styles.resumeSecondaryBtn} onClick={handleStartNew}>
            새로 시작하기
          </button>
          <button className={styles.resumePrimaryBtn} onClick={() => router.push('/test/session')}>
            이어서 하기
          </button>
        </div>
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
