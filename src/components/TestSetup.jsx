'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import styles from './TestSetup.module.css';

const SELECTION_KEY = 'vocab-test-selection';

export default function TestSetup({ levels, onRequestLogin }) {
  const router = useRouter();
  const { user } = useAuth();
  const [selected, setSelected] = useState({}); // `${level}:${day}` -> true

  const selectedCount = Object.keys(selected).length;

  const toggleDay = (level, day) => {
    const key = `${level}:${day}`;
    setSelected((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = true;
      return next;
    });
  };

  const isLevelFullySelected = (level, totalDays) => {
    for (let day = 1; day <= totalDays; day++) {
      if (!selected[`${level}:${day}`]) return false;
    }
    return true;
  };

  const toggleAllForLevel = (level, totalDays) => {
    const fullySelected = isLevelFullySelected(level, totalDays);
    setSelected((prev) => {
      const next = { ...prev };
      for (let day = 1; day <= totalDays; day++) {
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
                const active = !!selected[`${level}:${day}`];
                return (
                  <button
                    key={day}
                    className={`${styles.dayChip} ${active ? styles.dayChipActive : ''}`}
                    onClick={() => toggleDay(level, day)}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className={styles.startBar}>
        <button
          className={styles.startButton}
          disabled={selectedCount === 0}
          onClick={handleStart}
        >
          테스트 시작하기 ({selectedCount}일 선택됨)
        </button>
      </div>
    </div>
  );
}
