
ALTER TABLE public.clients
  ADD COLUMN location TEXT,
  ADD COLUMN property TEXT,
  ADD COLUMN rating INTEGER DEFAULT 0;

ALTER TABLE public.properties
  ADD COLUMN type TEXT;
