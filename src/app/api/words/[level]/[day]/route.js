import { NextResponse } from 'next/server';
import { getWords, parseDayParam, isValidLevel } from '@/lib/words';

export async function GET(_request, { params }) {
  const { level, day } = await params;

  if (!isValidLevel(level)) {
    return NextResponse.json({ error: 'Invalid level' }, { status: 400 });
  }
  const dayNum = parseDayParam(day);
  if (!dayNum) {
    return NextResponse.json({ error: 'Invalid day' }, { status: 400 });
  }
  const words = await getWords(level, dayNum);
  if (!words) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ words });
}