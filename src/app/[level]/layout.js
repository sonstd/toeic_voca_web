import { notFound } from 'next/navigation';
import { isValidLevel, getTotalDays } from '@/lib/words';
import WordsCacheProvider from '@/components/WordsCacheProvider';

export default async function LevelLayout({ children, params }) {
  const { level } = await params;
  if (!isValidLevel(level)) notFound();

  const totalDays = getTotalDays(level);

  return (
    <WordsCacheProvider level={level} totalDays={totalDays}>
      {children}
    </WordsCacheProvider>
  );
}