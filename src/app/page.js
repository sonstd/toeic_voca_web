import Link from 'next/link';
import { LEVELS } from '@/lib/words';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>토익 영단어 학습</h1>
      <p className={styles.subtitle}>레벨을 선택하세요</p>
      <div className={styles.levelList}>
        {Object.entries(LEVELS).map(([key, { label, totalDays }]) => (
          <Link key={key} href={`/${key}`} className={styles.levelCard}>
            <span className={styles.levelName}>{label}</span>
            <span className={styles.levelMeta}>{totalDays}일 과정</span>
          </Link>
        ))}
      </div>
    </main>
  );
}