-- sql/02_feature_expansion.sql

create extension if not exists "pgcrypto";

-- =========================================================
-- Presupuestos
-- =========================================================

alter table budgets
add column if not exists alert_triggered boolean not null default false;

-- =========================================================
-- Función y triggers para updated_at
-- =========================================================

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_users_updated_at on users;

create trigger trg_users_updated_at
before update on users
for each row
execute function set_updated_at();



-- =========================================================
-- Tokens revocados para logout real con JWT propio
-- =========================================================

create table if not exists revoked_tokens (
  id uuid primary key default gen_random_uuid(),
  jti text not null unique,
  user_id uuid not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- =========================================================
-- Historial de XP
-- =========================================================

create table if not exists xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  source_type text not null check (
    source_type in (
      'transaction',
      'goal_created',
      'goal_completed',
      'mission',
      'budget'
    )
  ),
  source_id uuid,
  xp_amount int not null check (xp_amount > 0),
  description text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- Misiones y progreso de misiones por usuario
-- =========================================================

create table if not exists missions (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  description text not null,
  frequency text not null check (frequency in ('daily', 'weekly')),
  xp_reward int not null check (xp_reward > 0),
  condition_type text not null,
  target_value int not null default 1 check (target_value > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists user_missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  mission_id uuid not null references missions(id) on delete cascade,
  status text not null default 'active' check (
    status in ('active', 'completed', 'claimed')
  ),
  progress int not null default 0 check (progress >= 0),
  assigned_at timestamptz not null default now(),
  expires_at timestamptz not null,
  completed_at timestamptz,
  claimed_at timestamptz,
  unique(user_id, mission_id, expires_at)
);

-- =========================================================
-- Logros y logros desbloqueados por usuario
-- =========================================================

create table if not exists achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  description text not null,
  icon text not null,
  criteria_key text not null,
  criteria_value int not null check (criteria_value > 0),
  created_at timestamptz not null default now()
);

create table if not exists user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  achievement_id uuid not null references achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique(user_id, achievement_id)
);

-- =========================================================
-- Amistades para ranking entre amigos
-- =========================================================

create table if not exists friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references users(id) on delete cascade,
  receiver_id uuid not null references users(id) on delete cascade,
  status text not null default 'pending' check (
    status in ('pending', 'accepted', 'rejected')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(requester_id, receiver_id),
  check (requester_id <> receiver_id)
);

drop trigger if exists trg_friendships_updated_at on friendships;

create trigger trg_friendships_updated_at
before update on friendships
for each row
execute function set_updated_at();

-- =========================================================
-- Índices para mejorar consultas frecuentes
-- =========================================================

create index if not exists idx_transactions_user_date
on transactions(user_id, date desc);

create index if not exists idx_notifications_user_read
on notifications(user_id, read_status, created_at desc);

create index if not exists idx_xp_events_user_created
on xp_events(user_id, created_at desc);

create index if not exists idx_user_missions_user_status
on user_missions(user_id, status, expires_at);

create index if not exists idx_friendships_requester
on friendships(requester_id, status);

create index if not exists idx_friendships_receiver
on friendships(receiver_id, status);