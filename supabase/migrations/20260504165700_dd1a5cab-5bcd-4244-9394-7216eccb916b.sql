ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS mls_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_properties_mls_id ON public.properties(mls_id);