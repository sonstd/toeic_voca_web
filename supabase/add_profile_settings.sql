-- Supabase SQL Editor에서 한 번 실행하세요.
-- 로그인 사용자의 테마/단어 순서 설정을 profiles에 저장합니다.

alter table public.profiles
  add column if not exists theme text not null default 'light' check (theme in ('light', 'dark')),
  add column if not exists shuffle boolean not null default false;
