import fs from 'fs/promises';
import path from 'path';

export const LEVELS = {
  basic: { label: '기초', totalDays: 60 },
  intermediate: { label: '중급', totalDays: 30 },
  advanced: { label: '고급', totalDays: 30 },
};

export function isValidLevel(level) {
  return Object.prototype.hasOwnProperty.call(LEVELS, level);
}

export function getTotalDays(level) {
  return LEVELS[level]?.totalDays ?? 0;
}

export function getLevelLabel(level) {
  return LEVELS[level]?.label ?? level;
}

export async function getWords(level, day) {
  if (!isValidLevel(level)) return null;
  const total = getTotalDays(level);
  if (!Number.isInteger(day) || day < 1 || day > total) return null;

  const filePath = path.join(process.cwd(), 'src', 'words', level, `day${day}.json`);
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to read ${level}/day${day}.json`, e);
    return null;
  }
}

export function parseDayParam(dayParam) {
  const match = /^day(\d+)$/.exec(dayParam || '');
  return match ? parseInt(match[1], 10) : null;
}