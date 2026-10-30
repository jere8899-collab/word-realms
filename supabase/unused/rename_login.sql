-- ⚠️ UNUSED, DO NOT RUN. Kept for reference only (30 Oct 2026): Jeremy decided login names do not need renaming;
-- only the in-game hero name can change. The game has no button that calls this function.
-- ☁️ Cloud Castle: let a signed-in player change their login (castle) name.
-- Why a function: Supabase Auth always emails a confirmation link for an email change (even with
-- "Confirm email" off, and with "Secure email change" off it still mails the new address), and the
-- synthetic <name>@players.wordrealms.app addresses can't receive mail, so auth.updateUser({ email })
-- is rejected ("Email address ... is invalid"). This SECURITY DEFINER function renames only the
-- caller (auth.uid()), keeps the same user_id (so all progress stays), and updates public.saves too.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
create or replace function public.rename_login(new_name text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  n text := lower(btrim(coalesce(new_name, '')));
  e text;
  last_at timestamptz;
begin
  if uid is null then
    raise exception 'not signed in' using errcode = '28000';
  end if;
  if n !~ '^[a-z0-9_]{3,20}$' then
    raise exception 'invalid name' using errcode = '22023';
  end if;
  e := n || '@players.wordrealms.app';
  if exists (select 1 from auth.users u where lower(u.email) = e and u.id = uid) then
    return n; -- already this name
  end if;
  if exists (select 1 from auth.users u where lower(u.email) = e) then
    raise exception 'name taken' using errcode = '23505';
  end if;
  select nullif(u.raw_app_meta_data ->> 'renamed_at', '')::timestamptz into last_at from auth.users u where u.id = uid;
  if last_at is not null and last_at > now() - interval '30 seconds' then
    raise exception 'rate limit: too many renames' using errcode = '53400';
  end if;
  update auth.users u set
    email = e,
    raw_user_meta_data = coalesce(u.raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('username', n),
    raw_app_meta_data = coalesce(u.raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('renamed_at', now()),
    updated_at = now()
  where u.id = uid;
  update auth.identities i set
    identity_data = coalesce(i.identity_data, '{}'::jsonb) || jsonb_build_object('email', e),
    updated_at = now()
  where i.user_id = uid and i.provider = 'email';
  update public.saves s set username = n where s.user_id = uid;
  return n;
end;
$$;
revoke all on function public.rename_login(text) from public, anon;
grant execute on function public.rename_login(text) to authenticated;
