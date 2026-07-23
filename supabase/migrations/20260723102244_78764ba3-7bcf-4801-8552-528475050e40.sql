ALTER TABLE public.daily_entries
  ADD COLUMN IF NOT EXISTS workers jsonb NOT NULL DEFAULT '{}'::jsonb,
  ALTER COLUMN skilled SET DEFAULT 0,
  ALTER COLUMN unskilled SET DEFAULT 0,
  ALTER COLUMN labor_total SET DEFAULT 0;