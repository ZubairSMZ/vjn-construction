
-- SITES
CREATE TABLE public.sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','on_hold','complete')),
  progress INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sites TO authenticated;
GRANT ALL ON public.sites TO service_role;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated read sites" ON public.sites FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated insert sites" ON public.sites FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "owner or admin update sites" ON public.sites FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (auth.uid() = created_by OR private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "owner or admin delete sites" ON public.sites FOR DELETE TO authenticated
  USING (auth.uid() = created_by OR private.has_role(auth.uid(), 'admin'::app_role));

-- DAILY ENTRIES
CREATE TABLE public.daily_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  supervisor TEXT NOT NULL DEFAULT '',
  skilled INT NOT NULL DEFAULT 0,
  unskilled INT NOT NULL DEFAULT 0,
  labor_total INT NOT NULL DEFAULT 0,
  percent INT NOT NULL DEFAULT 0 CHECK (percent >= 0 AND percent <= 100),
  progress_note TEXT NOT NULL DEFAULT '',
  remarks TEXT DEFAULT '',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_entries TO authenticated;
GRANT ALL ON public.daily_entries TO service_role;
ALTER TABLE public.daily_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated read entries" ON public.daily_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated insert entries" ON public.daily_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "owner or admin update entries" ON public.daily_entries FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (auth.uid() = created_by OR private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "owner or admin delete entries" ON public.daily_entries FOR DELETE TO authenticated
  USING (auth.uid() = created_by OR private.has_role(auth.uid(), 'admin'::app_role));

-- MATERIAL USAGE
CREATE TABLE public.material_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  material TEXT NOT NULL,
  qty NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'Bag',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.material_usage TO authenticated;
GRANT ALL ON public.material_usage TO service_role;
ALTER TABLE public.material_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated read usage" ON public.material_usage FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated insert usage" ON public.material_usage FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "owner or admin update usage" ON public.material_usage FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (auth.uid() = created_by OR private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "owner or admin delete usage" ON public.material_usage FOR DELETE TO authenticated
  USING (auth.uid() = created_by OR private.has_role(auth.uid(), 'admin'::app_role));

-- MATERIAL PURCHASES
CREATE TABLE public.material_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  material TEXT NOT NULL,
  qty NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'Bag',
  supplier TEXT NOT NULL DEFAULT '',
  cost NUMERIC NOT NULL DEFAULT 0,
  invoice TEXT NOT NULL DEFAULT '',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.material_purchases TO authenticated;
GRANT ALL ON public.material_purchases TO service_role;
ALTER TABLE public.material_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated read purchases" ON public.material_purchases FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated insert purchases" ON public.material_purchases FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "owner or admin update purchases" ON public.material_purchases FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (auth.uid() = created_by OR private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "owner or admin delete purchases" ON public.material_purchases FOR DELETE TO authenticated
  USING (auth.uid() = created_by OR private.has_role(auth.uid(), 'admin'::app_role));

-- EXPENSES
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'Misc',
  description TEXT NOT NULL DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0,
  method TEXT NOT NULL DEFAULT 'Cash',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT ALL ON public.expenses TO service_role;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated read expenses" ON public.expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated insert expenses" ON public.expenses FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "owner or admin update expenses" ON public.expenses FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (auth.uid() = created_by OR private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "owner or admin delete expenses" ON public.expenses FOR DELETE TO authenticated
  USING (auth.uid() = created_by OR private.has_role(auth.uid(), 'admin'::app_role));

-- ACTIVITY LOG
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL,
  target TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.activity_log TO authenticated;
GRANT ALL ON public.activity_log TO service_role;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated read activity" ON public.activity_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated insert activity" ON public.activity_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_sites_updated BEFORE UPDATE ON public.sites FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_entries_updated BEFORE UPDATE ON public.daily_entries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_usage_updated BEFORE UPDATE ON public.material_usage FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_purchases_updated BEFORE UPDATE ON public.material_purchases FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_expenses_updated BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.sites;
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.material_usage;
ALTER PUBLICATION supabase_realtime ADD TABLE public.material_purchases;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;
