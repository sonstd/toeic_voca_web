'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWordsCache } from './WordsCacheProvider';
import { useSettings } from './SettingsProvider';
import styles from './WordLearning.module.css';

function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function WordLearning({ level, levelLabel, day, totalDays, initialWords }) {
  const router = useRouter();
  const { getCached, setInitial } = useWordsCache();
  const { shuffle } = useSettings();

  // shuffle 값을 ref로 관리 → day 변경 effect에서 클로저 문제 없이 최신값 참조
  const shuffleRef = useRef(shuffle);
  useEffect(() => { shuffleRef.current = shuffle; }, [shuffle]);

  // 현재 day의 원본(비섞인) 단어 목록
  const baseWordsRef = useRef(initialWords);

  const [displayWords, setDisplayWords] = useState(() =>
    shuffle ? shuffleArray(initialWords) : initialWords
  );
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // day가 바뀔 때: 캐시 등록 + 현재 shuffle 설정에 맞게 단어 목록 세팅
  useEffect(() => {
    setInitial(day, initialWords);
    const source = getCached(day) ?? initialWords;
    baseWordsRef.current = source;
    setDisplayWords(shuffleRef.current ? shuffleArray(source) : source);
    setIndex(0);
    setRevealed(false);
  }, [day, initialWords, setInitial, getCached]);

  // shuffle 설정이 바뀔 때: 같은 단어 목록을 재정렬 (인덱스 초기화)
  useEffect(() => {
    setDisplayWords(shuffle ? shuffleArray(baseWordsRef.current) : baseWordsRef.current);
    setIndex(0);
    setRevealed(false);
  }, [shuffle]);

  const current = displayWords[index];
  const isFirstWord = index === 0;
  const isLastWord = index === displayWords.length - 1;

  const goPrevWord = useCallback(() => {
    setRevealed(false);
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNextWord = useCallback(() => {
    setRevealed(false);
    setIndex((i) => Math.min(displayWords.length - 1, i + 1));
  }, [displayWords.length]);

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
          {index + 1} / {displayWords.length}
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