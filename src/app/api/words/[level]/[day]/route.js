import { NextResponse } from 'next/server';
import { getWords, parseDayParam, isValidLevel } from '@/lib/words';
import { getFreeDayLimit } from '@/lib/planLimits';
import { getUserPlan } from '@/lib/getUserPlan';

export async function GET(_request, { params }) {
  const { level, day } = await params;

  if (!isValidLevel(level)) {
    return NextResponse.json({ error: 'Invalid level' }, { status: 400 });
  }
  const dayNum = parseDayParam(day);
  if (!dayNum) {
    return NextResponse.json({ error: 'Invalid day' }, { status: 400 });
  }

  if (dayNum > getFreeDayLimit(level)) {
    const plan = await getUserPlan();
    if (plan !== 'pro') {
      return NextResponse.json({ error: 'Pro plan required' }, { status: 403 });
    }
  }

  const words = await getWords(level, dayNum);
  if (!words) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ words });
}