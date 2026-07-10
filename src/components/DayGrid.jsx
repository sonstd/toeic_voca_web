'use client';

import { useState } from 'react';
import Link from 'next/link';
import { isDayUnlocked } from '@/lib/planLimits';
import ProSheet from './ProSheet';
import styles from './DayGrid.module.css';

export default function DayGrid({ level, totalDays, plan }) {
  const [proOpen, setProOpen] = useState(false);
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <>
      <div className={styles.grid}>
        {days.map((day) => {
          const unlocked = isDayUnlocked(level, day, plan);
          if (unlocked) {
            return (
              <Link key={day} href={`/${level}/day${day}`} className={styles.dayCard}>
                Day {day}
              </Link>
            );
          }
          return (
            <button
              key={day}
              className={`${styles.dayCard} ${styles.dayCardLocked}`}
              onClick={() => setProOpen(true)}
            >
              <span className={styles.lockIcon}>🔒</span>
              Day {day}
            </button>
          );
        })}
      </div>

      <ProSheet open={proOpen} onClose={() => setProOpen(false)} />
    </>
  );
}
