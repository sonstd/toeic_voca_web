'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWordsCache } from './WordsCacheProvider';
import styles from './WordLearning.module.css';

export default function WordLearning({ level, levelLabel, day, totalDays, initialWords }) {
  const router = useRouter();
  const { getCached, setInitial } = useWordsCache();

  // 서버에서 받아온 첫 데이터를 캐시에 등록 (이후 백그라운드 prefetch가 중복으로 다시 받지 않도록)
  useEffect(() => {
    setInitial(day, initialWords);
  }, [day, initialWords, setInitial]);

  const words = getCached(day) ?? initialWords;

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // day가 바뀌면(이전/다음 Day로 이동) 단어 위치 초기화
  useEffect(() => {
    setIndex(0);
    setRevealed(false);
  }, [day]);

  const current = words[index];
  const isFirstWord = index === 0;
  const isLastWord = index === words.length - 1;

  const goPrevWord = useCallback(() => {
    setRevealed(false);
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNextWord = useCallback(() => {
    setRevealed(false);
    setIndex((i) => Math.min(words.length - 1, i + 1));
  }, [words.length]);

  const goPrevDay = () => day > 1 && router.push(`/${level}/day${day - 1}`);
  const goNextDay = () => day < totalDays && router.push(`/${level}/day${day + 1}`);

  if (!current) {
    return <main className={styles.container}>단어 데이터를 찾을 수 없습니다.</main>;
  }

  return (
    <main className={styles.container}>
      <header className={styles.topbar}>
        <button className={styles.backButton} onClick={() => router.back()} aria-label="뒤로 가기">
          ←
        </button>
        <div className={styles.levelDayInfo}>
          <span className={styles.levelLabel}>{levelLabel}</span>
          <span className={styles.dayLabel}>Day {day}</span>
        </div>
        <span className={styles.progress}>
          {index + 1} / {words.length}
        </span>
      </header>

      <section className={styles.card}>
        <p className={styles.eng}>{current.eng}</p>

        {revealed && (
          <div className={styles.revealArea}>
            <p className={styles.kor}>{current.kor}</p>
          </div>
        )}

        <button className={styles.revealButton} onClick={() => setRevealed((r) => !r)}>
          {revealed ? '가리기' : '뜻 확인'}
        </button>
      </section>

      <nav className={styles.wordNav}>
        <button onClick={goPrevWord} disabled={isFirstWord} className={styles.navButton}>
          ← 이전 단어
        </button>
        <button onClick={goNextWord} disabled={isLastWord} className={styles.navButton}>
          다음 단어 →
        </button>
      </nav>

      <nav className={styles.dayNav}>
        <button onClick={goPrevDay} disabled={day <= 1} className={styles.dayNavButton}>
          ← 이전 Day
        </button>
        <button onClick={goNextDay} disabled={day >= totalDays} className={styles.dayNavButton}>
          다음 Day →
        </button>
      </nav>
    </main>
  );
}