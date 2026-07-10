'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { fetchTestSessionById } from '@/lib/testSessions';
import wordStyles from './WordLearning.module.css';
import sessionStyles from './TestSession.module.css';

export default function TestReview() {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useAuth();

  const [phase, setPhase] = useState('loading'); // loading | review | empty
  const [words, setWords] = useState([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace('/');
      return;
    }

    let cancelled = false;
    const supabase = createClient();
    fetchTestSessionById(supabase, id)
      .then((session) => {
        if (cancelled) return;
        const missed = (session.results || []).filter((r) => !r.known);
        setWords(missed);
        setPhase(missed.length ? 'review' : 'empty');
      })
      .catch(() => {
        if (!cancelled) router.replace('/');
      });

    return () => {
      cancelled = true;
    };
  }, [user, id, router]);

  const current = words[index];
  const isFirstWord = index === 0;
  const isLastWord = index === words.length - 1;

  const goPrevWord = () => {
    setRevealed(false);
    setIndex((i) => Math.max(0, i - 1));
  };

  const goNextWord = () => {
    setRevealed(false);
    setIndex((i) => Math.min(words.length - 1, i + 1));
  };

  if (phase === 'loading') {
    return (
      <main className={wordStyles.container}>
        <p className={sessionStyles.statusText}>불러오는 중...</p>
      </main>
    );
  }

  if (phase === 'empty') {
    return (
      <main className={wordStyles.container}>
        <p className={sessionStyles.statusText}>이 기록에는 몰랐던 단어가 없어요.</p>
        <button className={sessionStyles.homeButton} onClick={() => router.push('/')}>
          홈으로 돌아가기
        </button>
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
          <span className={wordStyles.levelLabel}>복습</span>
        </div>
        <span className={wordStyles.progress}>
          {index + 1} / {words.length}
        </span>
      </header>

      <section className={wordStyles.card}>
        <p className={wordStyles.eng}>{current.eng}</p>

        {revealed && (
          <div className={wordStyles.revealArea}>
            <p className={wordStyles.kor}>{current.kor}</p>
          </div>
        )}

        <button className={wordStyles.revealButton} onClick={() => setRevealed((r) => !r)}>
          {revealed ? '가리기' : '뜻 확인'}
        </button>
      </section>

      <nav className={wordStyles.wordNav}>
        <button onClick={goPrevWord} disabled={isFirstWord} className={wordStyles.navButton}>
          ← 이전 단어
        </button>
        <button onClick={goNextWord} disabled={isLastWord} className={wordStyles.navButton}>
          다음 단어 →
        </button>
      </nav>
    </main>
  );
}
