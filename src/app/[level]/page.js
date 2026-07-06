import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isValidLevel, getTotalDays, getLevelLabel } from '@/lib/words';
import styles from './level.module.css';

export default async function LevelPage({ params }) {
  const { level } = await params;
  if (!isValidLevel(level)) notFound();

  const totalDays = getTotalDays(level);
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <main className={styles.container}>
      <Link href="/" className={styles.backLink}>← 레벨 선택으로</Link>
      <h1 className={styles.title}>{getLevelLabel(level)} 단계</h1>
      <p className={styles.subtitle}>학습할 Day를 선택하세요</p>
      <div className={styles.grid}>
        {days.map((day) => (
          <Link key={day} href={`/${level}/day${day}`} className={styles.dayCard}>
            Day {day}
          </Link>
        ))}
      </div>
    </main>
  );
}