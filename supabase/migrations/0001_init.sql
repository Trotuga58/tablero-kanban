-- Tableros y tareas. Cada usuario solo ve y modifica lo suyo (Row Level Security).

create table public.boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  created_at timestamptz not null default now()
);

create type public.task_status as enum ('todo', 'doing', 'done');

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  status public.task_status not null default 'todo',
  position double precision not null default 0,
  created_at timestamptz not null default now()
);

create index boards_user_id_idx on public.boards (user_id, created_at);
create index tasks_board_status_position_idx on public.tasks (board_id, status, position);

alter table public.boards enable row level security;
alter table public.tasks enable row level security;

create policy "boards: dueño" on public.boards
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- La tarea debe ser del usuario y pertenecer a un tablero suyo.
create policy "tasks: dueño" on public.tasks
  for all using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.boards b where b.id = board_id and b.user_id = auth.uid())
  );

-- Permisos para la API de datos (necesarios si el proyecto no expone tablas nuevas automáticamente).
-- RLS sigue limitando cada fila a su dueño.
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.boards, public.tasks to authenticated;
