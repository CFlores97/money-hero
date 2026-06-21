

-- =========================================================
-- Misiones iniciales
-- =========================================================

insert into missions (
  title,
  description,
  frequency,
  xp_reward,
  condition_type,
  target_value
)
values
  (
    'Registra un gasto',
    'Ingresa al menos un gasto hoy.',
    'daily',
    10,
    'register_expense',
    1
  ),
  (
    'Registra actividad',
    'Realiza una accion financiera esta semana.',
    'weekly',
    20,
    'financial_activity',
    3
  )
on conflict do nothing;

-- =========================================================
-- Logros iniciales
-- =========================================================

insert into achievements (
  title,
  description,
  icon,
  criteria_key,
  criteria_value
)
values
  (
    'Primer paso',
    'Registra tu primera transaccion.',
    'first-transaction',
    'transactions_count',
    1
  ),
  (
    'Constancia de hierro',
    'Manten una racha de 7 dias.',
    'fire-streak',
    'streak_days',
    7
  ),
  (
    'Ahorrador inicial',
    'Completa una meta de ahorro.',
    'goal-complete',
    'goals_completed',
    1
  )
on conflict (title) do nothing;