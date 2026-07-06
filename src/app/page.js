import { LEVELS } from '@/lib/words';
import HomeClient from '@/components/HomeClient';

// LEVELS는 서버에서 정적으로 읽어 클라이언트에 직렬화하여 전달
export default function HomePage() {
  const levels = Object.entries(LEVELS).map(([key, { label, totalDays }]) => ({
    key,
    label,
    totalDays,
  }));

  return <HomeClient levels={levels} />;
}