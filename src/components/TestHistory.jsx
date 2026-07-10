'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { fetchTestSessions } from '@/lib/testSessions';
import styles from './TestHistory.module.css';

function summarizeSelection(selection, levels) {
  const counts = {};
  for (const { level } of selection) {
    counts[level] = (counts[level] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([level, count]) => {
      const label = levels.find((l) => l.key === level)?.label ?? level;
      return `${label} ${count}일`;
    })
    .join(' · ');
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TestHistory({ levels, onRequestLogin }) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState(null); // null = 로딩중

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const supabase = createClient();
    fetchTestSessions(supabase)
      .then((data) => {
        if (!cancelled) setSessions(data);
      })
      .catch(() => {
        if (!cancelled) setSessions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) {
    return (
      <div className={styles.loginNotice}>
        <p className={styles.loginNoticeText}>로그인하고 테스트 기록을 확인해보세요.</p>
        <button className={styles.loginNoticeBtn} onClick={onRequestLogin}>
          로그인하기
        </button>
      </div>
    );
  }

  if (sessions === null) {
    return <p className={styles.statusText}>기록을 불러오는 중...</p>;
  }

  if (sessions.length === 0) {
    return <p className={styles.statusText}>아직 테스트 기록이 없어요.</p>;
  }

  return (
    <div className={styles.list}>
      {sessions.map((s) => (
        <div key={s.id} className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.date}>{formatDate(s.created_at)}</span>
            <span className={styles.score}>
              {s.known_count} / {s.total_count}
            </span>
          </div>
          <p className={styles.summary}>{summarizeSelection(s.selection, levels)}</p>
        </div>
      ))}
    </div>
  );
}
