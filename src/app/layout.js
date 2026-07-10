import './globals.css';
import SettingsProvider from '@/components/SettingsProvider';
import AuthProvider from '@/components/AuthProvider';

export const metadata = {
  title: '토익 보카',
  description: '레벨별, 날짜별 토익 어휘 학습',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        {/*
          React 하이드레이션 이전에 동기적으로 실행되어 테마 깜빡임 방지.
          SettingsProvider의 useEffect보다 먼저 data-theme이 설정됨.
        */}
        <script dangerouslySetInnerHTML={{
          __html: `try{var s=JSON.parse(localStorage.getItem('vocab-app-settings'));if(s?.theme)document.documentElement.setAttribute('data-theme',s.theme);}catch(e){}`
        }} />
      </head>
      <body>
        <SettingsProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}