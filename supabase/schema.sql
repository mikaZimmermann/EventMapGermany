create table if not exists public.events (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  city text not null,
  event_date date not null,
  lat double precision not null,
  lng double precision not null,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamp with time zone default now()
);

alter table public.events enable row level security;

create policy "Read events"
  on public.events
  for select
  using (true);

create policy "Insert own events"
  on public.events
  for insert
  with check (auth.uid() = created_by);
