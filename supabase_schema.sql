-- Run this in Supabase SQL Editor

create table ligas (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  nombre text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table jugadores (
  id uuid default gen_random_uuid() primary key,
  liga_id uuid references ligas(id) on delete cascade,
  nombre text not null,
  username text not null,
  tee text default 'azul',
  handicap int default 0,
  created_at timestamptz default now()
);

create table strokes (
  id uuid default gen_random_uuid() primary key,
  liga_id uuid references ligas(id) on delete cascade,
  de_jugador_id uuid references jugadores(id) on delete cascade,
  a_jugador_id uuid references jugadores(id) on delete cascade,
  strokes int default 0,
  unique(liga_id, de_jugador_id, a_jugador_id)
);

create table apuestas_config (
  id uuid default gen_random_uuid() primary key,
  liga_id uuid references ligas(id) on delete cascade,
  config jsonb not null default '{}',
  updated_at timestamptz default now(),
  unique(liga_id)
);

create table rondas (
  id uuid default gen_random_uuid() primary key,
  liga_id uuid references ligas(id) on delete cascade,
  fecha date default current_date,
  jugadores_ids uuid[] not null,
  apuestas_override jsonb default '{}',
  estado text default 'en_curso',
  created_at timestamptz default now()
);

create table scores (
  id uuid default gen_random_uuid() primary key,
  ronda_id uuid references rondas(id) on delete cascade,
  jugador_id uuid references jugadores(id) on delete cascade,
  hoyo int not null,
  golpes int,
  extras jsonb default '{}',
  unique(ronda_id, jugador_id, hoyo)
);

create table resultados (
  id uuid default gen_random_uuid() primary key,
  ronda_id uuid references rondas(id) on delete cascade,
  jugador_id uuid references jugadores(id) on delete cascade,
  balance numeric default 0,
  detalle jsonb default '{}'
);

-- Enable RLS but allow all for now (public app)
alter table ligas enable row level security;
alter table jugadores enable row level security;
alter table strokes enable row level security;
alter table apuestas_config enable row level security;
alter table rondas enable row level security;
alter table scores enable row level security;
alter table resultados enable row level security;

create policy "public_all" on ligas for all using (true) with check (true);
create policy "public_all" on jugadores for all using (true) with check (true);
create policy "public_all" on strokes for all using (true) with check (true);
create policy "public_all" on apuestas_config for all using (true) with check (true);
create policy "public_all" on rondas for all using (true) with check (true);
create policy "public_all" on scores for all using (true) with check (true);
create policy "public_all" on resultados for all using (true) with check (true);
