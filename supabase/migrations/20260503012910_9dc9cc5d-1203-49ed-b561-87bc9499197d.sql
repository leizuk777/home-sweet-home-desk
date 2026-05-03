
-- Clients table
CREATE TABLE public.clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  stage TEXT NOT NULL DEFAULT 'lead',
  budget TEXT,
  type TEXT,
  notes TEXT,
  source TEXT,
  avatar TEXT,
  last_contact TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Properties table
CREATE TABLE public.properties (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES public.clients(id) ON DELETE SET NULL,
  address TEXT NOT NULL,
  city TEXT,
  price NUMERIC,
  beds INTEGER,
  baths NUMERIC,
  sqft INTEGER,
  status TEXT NOT NULL DEFAULT 'active',
  image TEXT,
  listed_date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activities table
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  client_id TEXT REFERENCES public.clients(id) ON DELETE SET NULL,
  property_id TEXT REFERENCES public.properties(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Public shared access policies (no login)
CREATE POLICY "Anyone can view clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Anyone can insert clients" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update clients" ON public.clients FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete clients" ON public.clients FOR DELETE USING (true);

CREATE POLICY "Anyone can view properties" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Anyone can insert properties" ON public.properties FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update properties" ON public.properties FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete properties" ON public.properties FOR DELETE USING (true);

CREATE POLICY "Anyone can view activities" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Anyone can insert activities" ON public.activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update activities" ON public.activities FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete activities" ON public.activities FOR DELETE USING (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
