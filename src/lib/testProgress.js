const PROGRESS_KEY = 'vocab-test-progress';

export function getTestProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveTestProgress(progress) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {}
}

export function clearTestProgress() {
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch {}
}
