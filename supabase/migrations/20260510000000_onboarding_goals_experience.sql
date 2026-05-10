alter table public.profiles
  add column if not exists goals text[];

alter table public.profiles
  add column if not exists experience text;
