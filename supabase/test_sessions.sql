-- Supabase SQL Editor에서 한 번 실행하세요.
-- 사용자가 진행한 테스트(단어 알고있음/몰랐음) 기록을 저장하는 테이블입니다.

create table if not exists public.test_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  selection jsonb not null,   -- [{level, day}, ...] 선택했던 레벨/Day
  total_count int not null,
  known_count int not null,
  results jsonb not null      -- [{level, day, eng, kor, known}, ...] 순서대로
);

alter table public.test_sessions enable row level security;

create policy "Users can view own test sessions"
  on public.test_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own test sessions"
  on public.test_sessions for insert
  with check (auth.uid() = user_id);
