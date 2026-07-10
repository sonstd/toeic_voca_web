'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { shuffleArray } from '@/lib/shuffle';
import { saveTestSession, hasTestedToday } from '@/lib/testSessions';
import { isDayUnlocked } from '@/lib/planLimits';
import { getTestProgress, saveTestProgress, clearTestProgress } from '@/lib/testProgress';
import wordStyles from './WordLearning.module.css';
import styles from './TestSession.module.css';

const JUST_COMPLETED_KEY = 'vocab-test-just-completed';

export default function TestSession() {
  const router = useRouter();
  const { user, plan, planLoading } = useAuth();

  const [phase, setPhase] = useState('loading'); // loading | quiz | done | empty
  const [words, setWords] = useState([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const resultsRef = useRef([]);
  const selectionRef = useRef([]);
  const savedRef = useRef(false);

  useEffect(() => {
    if (planLoading) return; // 플랜 확인 전에는 판단을 보류 (Pro 오판 방지)

    if (!user) {
      router.replace('/');
      return;
    }

    const progress = getTestProgress();
    if (!progress || !progress.selection?.length) {
      router.replace('/');
      return;
    }

    // 이미 단어를 불러온 적 있는 이어하기: 그대로 복원하고 다시 fetch하지 않음
    if (progress.words?.length) {
      selectionRef.current = progress.selection;
      resultsRef.current = progress.results ?? [];
      setWords(progress.words);
      setIndex(progress.index ?? 0);
      setPhase('quiz');
      return;
    }

    // 새로 시작: 선택을 플랜에 맞게 필터링 후 단어 fetch
    const selection = progress.selection.filter(({ level, day }) => isDayUnlocked(level, day, plan));
    if (!selection.length) {
      router.replace('/');
      return;
    }
    selectionRef.current = selection;

    let cancelled = false;

    (async () => {
      if (plan !== 'pro') {
        const supabase = createClient();
        if (await hasTestedToday(supabase)) {
          if (!cancelled) router.replace('/');
          return;
        }
      }

      const lists = await Promise.all(
        selection.map(async ({ level, day }) => {
          try {
            const res = await fetch(`/api/words/${level}/day${day}`);
            if (!res.ok) return [];
            const data = await res.json();
            return (data.words || []).map((w) => ({ ...w, level, day }));
          } catch {
            return [];
          }
        })
      );
      if (cancelled) return;
      const combined = shuffleArray(lists.flat());
      setWords(combined);
      if (combined.length) {
        setPhase('quiz');
        saveTestProgress({ selection, words: combined, index: 0, results: [] });
      } else {
        setPhase('empty');
        clearTestProgress();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, plan, planLoading, router]);

  const current = words[index];

  const answer = (known) => {
    resultsRef.current.push({
      level: current.level,
      day: current.day,
      eng: current.eng,
      kor: current.kor,
      known,
    });
    setRevealed(false);
    const nextIndex = index + 1;
    const isDone = nextIndex >= words.length;
    if (isDone) {
      setPhase('done');
    } else {
      setIndex(nextIndex);
      saveTestProgress({
        selection: selectionRef.current,
        words,
        index: nextIndex,
        results: resultsRef.current,
      });
    }
  };

  // 완료 시 자동 저장 (테이블 미설정 등으로 실패해도 조용히 무시)
  useEffect(() => {
    if (phase !== 'done' || savedRef.current || !user) return;
    savedRef.current = true;
    const supabase = createClient();
    saveTestSession(supabase, {
      userId: user.id,
      selection: selectionRef.current,
      results: resultsRef.current,
    })
      .catch(() => {})
      .finally(() => {
        clearTestProgress();
        sessionStorage.setItem(JUST_COMPLETED_KEY, '1');
      });
  }, [phase, user]);

  if (phase === 'loading') {
    return <main className={wordStyles.container}><p className={styles.statusText}>단어를 불러오는 중...</p></main>;
  }

  if (phase === 'empty') {
    return (
      <main className={wordStyles.container}>
        <p className={styles.statusText}>선택한 Day에서 단어를 찾을 수 없습니다.</p>
        <button className={styles.homeButton} onClick={() => router.push('/')}>
          홈으로 돌아가기
        </button>
      </main>
    );
  }

  if (phase === 'done') {
    const results = resultsRef.current;
    const knownCount = results.filter((r) => r.known).length;
    const missed = results.filter((r) => !r.known);

    return (
      <main className={wordStyles.container}>
        <section className={styles.summary}>
          <h1 className={styles.summaryTitle}>테스트 완료</h1>
          <p className={styles.summaryScore}>
            {knownCount} / {results.length} 개 알고 있음
          </p>

          {missed.length > 0 && (
            <div className={styles.missedList}>
              <p className={styles.missedTitle}>몰랐던 단어</p>
              {missed.map((w, i) => (
                <div key={`${w.eng}-${i}`} className={styles.missedItem}>
                  <span className={styles.missedEng}>{w.eng}</span>
                  <span className={styles.missedKor}>{w.kor}</span>
                </div>
              ))}
            </div>
          )}

          <button className={styles.homeButton} onClick={() => router.push('/')}>
            홈으로 돌아가기
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className={wordStyles.container}>
      <header className={wordStyles.topbar}>
        <button className={wordStyles.backButton} onClick={() => router.push('/')} aria-label="나가기">
          ×
        </button>
        <div className={wordStyles.levelDayInfo}>
          <span className={wordStyles.levelLabel}>테스트</span>
        </div>
        <span className={wordStyles.progress}>
          {index + 1} / {words.length}
        </span>
      </header>

      <section className={wordStyles.card}>
        <p className={wordStyles.eng}>{current.eng}</p>

        {revealed ? (
          <>
            <div className={wordStyles.revealArea}>
              <p className={wordStyles.kor}>{current.kor}</p>
            </div>
            <div className={styles.answerButtons}>
              <button className={styles.unknownButton} onClick={() => answer(false)}>
                몰랐음
              </button>
              <button className={styles.knownButton} onClick={() => answer(true)}>
                알고 있음
              </button>
            </div>
          </>
        ) : (
          <button className={wordStyles.revealButton} onClick={() => setRevealed(true)}>
            뜻 확인
          </button>
        )}
      </section>
    </main>
  );
}
