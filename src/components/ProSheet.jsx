'use client';

import styles from './ProSheet.module.css';

const PRO_FEATURES = ['전체 레벨·Day 무제한 학습', '테스트 무제한 이용'];

export default function ProSheet({ open, onClose }) {
  if (!open) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.sheetHandle} />
        <h2 className={styles.sheetTitle}>Pro 플랜</h2>
        <p className={styles.desc}>Pro로 전환하면 다음 기능을 이용할 수 있어요.</p>

        <ul className={styles.featureList}>
          {PRO_FEATURES.map((feature) => (
            <li key={feature} className={styles.featureItem}>
              <span className={styles.featureCheck}>✓</span>
              {feature}
            </li>
          ))}
        </ul>

        <button className={styles.upgradeButton} disabled>
          Pro로 전환하기 (준비 중)
        </button>
      </div>
    </div>
  );
}
