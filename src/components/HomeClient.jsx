'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSettings } from './SettingsProvider';
import styles from './HomeClient.module.css';

export default function HomeClient({ levels }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { theme, setTheme, shuffle, setShuffle } = useSettings();

  return (
    <div className={styles.wrapper}>

      <header className={styles.header}>
        <h1 className={styles.title}>토익 보카</h1>
        <button
          className={styles.settingsBtn}
          onClick={() => setSettingsOpen(true)}
          aria-label="설정 열기"
        >
          <Image src="/icons/settings.png" alt="설정" width={24} height={24} />
        </button>
      </header>

      <main className={styles.container}>
        <p className={styles.subtitle}>학습할 레벨을 선택하세요</p>
        <div className={styles.levelList}>
          {levels.map(({ key, label, totalDays }) => (
            <Link key={key} href={`/${key}`} className={styles.levelCard}>
              <span className={styles.levelName}>{label}</span>
              <span className={styles.levelMeta}>{totalDays}일 과정</span>
            </Link>
          ))}
        </div>
      </main>

      {/* 설정 바텀 시트 */}
      {settingsOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className={styles.sheet}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.sheetHandle} />
            <h2 className={styles.sheetTitle}>설정</h2>

            <div className={styles.settingsList}>
              <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                  <p className={styles.settingLabel}>테마</p>
                  <p className={styles.settingDesc}>테마 모드 선택</p>
                </div>
                <div className={styles.segmented}>
                  <button
                    className={`${styles.segBtn} ${theme === 'light' ? styles.segBtnActive : ''}`}
                    onClick={() => setTheme('light')}
                  >
                    ☀️ 라이트
                  </button>
                  <button
                    className={`${styles.segBtn} ${theme === 'dark' ? styles.segBtnActive : ''}`}
                    onClick={() => setTheme('dark')}
                  >
                    🌙 다크
                  </button>
                </div>
              </div>

              <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                  <p className={styles.settingLabel}>단어 순서</p>
                  <p className={styles.settingDesc}>Day 진입 시 단어 배열 방식 선택</p>
                </div>
                <div className={styles.segmented}>
                  <button
                    className={`${styles.segBtn} ${!shuffle ? styles.segBtnActive : ''}`}
                    onClick={() => setShuffle(false)}
                    style={{display: 'flex', justifyContent: 'center'}}
                  >
                    <Image src="/icons/fix.png" alt="설정" width={11} height={16} style={{marginRight: '4px'}}/> 고정
                  </button>
                  <button
                    className={`${styles.segBtn} ${shuffle ? styles.segBtnActive : ''}`}
                    onClick={() => setShuffle(true)}
                    style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                  >
                    <Image src="/icons/shuffle.png" alt="설정" width={14} height={14} style={{marginRight: '4px'}}/> 섞기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}