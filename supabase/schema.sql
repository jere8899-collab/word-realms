create table if not exists public.saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.saves enable row level security;
drop policy if exists "own save read" on public.saves;
drop policy if exists "own save insert" on public.saves;
drop policy if exists "own save update" on public.saves;
drop policy if exists "own save delete" on public.saves;
create policy "own save read" on public.saves for select to authenticated using (auth.uid() = user_id);
create policy "own save insert" on public.saves for insert to authenticated with check (auth.uid() = user_id);
create policy "own save update" on public.saves for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own save delete" on public.saves for delete to authenticated using (auth.uid() = user_id);
