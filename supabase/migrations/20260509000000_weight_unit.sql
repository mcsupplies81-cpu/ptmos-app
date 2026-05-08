alter table public.profiles
  add column if not exists weight_unit text not null default 'lbs' check (weight_unit in ('lbs', 'kg'));
