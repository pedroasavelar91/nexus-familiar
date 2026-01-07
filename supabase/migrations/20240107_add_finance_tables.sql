-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  date DATE NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create bills table
CREATE TABLE IF NOT EXISTS public.bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'paid', 'overdue')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create financial_assets table (in case it wasn't created yet)
CREATE TABLE IF NOT EXISTS public.financial_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  type TEXT CHECK (type IN ('investment', 'savings')),
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_assets ENABLE ROW LEVEL SECURITY;

-- Helper to safely create policies
DO $$ 
BEGIN
    -- Transactions policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Family members can view transactions') THEN
        CREATE POLICY "Family members can view transactions" ON public.transactions FOR SELECT USING (family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid()));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Family members can manage transactions') THEN
        CREATE POLICY "Family members can manage transactions" ON public.transactions FOR ALL USING (family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid()));
    END IF;

    -- Bills policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bills' AND policyname = 'Family members can view bills') THEN
        CREATE POLICY "Family members can view bills" ON public.bills FOR SELECT USING (family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid()));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bills' AND policyname = 'Family members can manage bills') THEN
        CREATE POLICY "Family members can manage bills" ON public.bills FOR ALL USING (family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid()));
    END IF;

    -- Financial Assets policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'financial_assets' AND policyname = 'Family members can view assets') THEN
        CREATE POLICY "Family members can view assets" ON public.financial_assets FOR SELECT USING (family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid()));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'financial_assets' AND policyname = 'Family members can manage assets') THEN
        CREATE POLICY "Family members can manage assets" ON public.financial_assets FOR ALL USING (family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid()));
    END IF;
END $$;
