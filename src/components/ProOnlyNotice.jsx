import Link from 'next/link';
import styles from './ProOnlyNotice.module.css';

export default function ProOnlyNotice({ message }) {
  return (
    <main className={styles.container}>
      <p className={styles.badge}>Pro 전용</p>
      <p className={styles.message}>{message ?? '이 Day는 Pro 플랜에서만 이용할 수 있어요.'}</p>
      <Link href="/" className={styles.homeLink}>
        홈으로 돌아가기
      </Link>
    </main>
  );
}
