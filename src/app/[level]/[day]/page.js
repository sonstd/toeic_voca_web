import { notFound } from 'next/navigation';
import { isValidLevel, getTotalDays, getLevelLabel, getWords, parseDayParam } from '@/lib/words';
import WordLearning from '@/components/WordLearning';

export default async function DayPage({ params }) {
  const { level, day } = await params;
  if (!isValidLevel(level)) notFound();

  const dayNum = parseDayParam(day);
  const totalDays = getTotalDays(level);
  if (!dayNum || dayNum < 1 || dayNum > totalDays) notFound();

  const words = await getWords(level, dayNum);
  if (!words) notFound();

  return (
    <WordLearning
      level={level}
      levelLabel={getLevelLabel(level)}
      day={dayNum}
      totalDays={totalDays}
      initialWords={words}
    />
  );
}