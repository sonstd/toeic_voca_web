import './globals.css';

export const metadata = {
  title: '토익 보카',
  description: '레벨별, 날짜별 학습',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}