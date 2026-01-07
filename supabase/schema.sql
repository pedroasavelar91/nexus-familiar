-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. FAMILIES & AUTH (Core)
-- Users are managed by Supabase Auth (auth.users)

CREATE TABLE public.families (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  invite_code TEXT UNIQUE DEFAULT UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))
);

CREATE TABLE public.family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id), -- Nullable for "pet" or manual members
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'pet')),
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Ensure one user is not in the same family twice (unless using different emails/member profiles? No, strictly one mapping per user-family mostly)
  UNIQUE(family_id, user_id) 
);

CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  current_family_id UUID REFERENCES public.families(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.join_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by UUID REFERENCES auth.users(id),
  UNIQUE(family_id, user_id)
);

-- 2. TASKS (Tarefas)
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  -- Assignee can be a specific member name (simple string) or linked to family_member_id.
  -- Using string to match current frontend simplicity, but ideally should be ID.
  assignee TEXT NOT NULL, 
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  due_date DATE NOT NULL,
  recurring BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 3. PANTRY (Despensa)
CREATE TABLE public.pantry_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- dairy, fruits, proteins, etc.
  current_amount NUMERIC NOT NULL DEFAULT 0,
  ideal_amount NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  expiration_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. SHOPPING LIST (Lista de Compras)
CREATE TABLE public.shopping_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  pantry_item_id UUID REFERENCES public.pantry_items(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. RECIPES & MEAL PLANS (Alimentacao)
CREATE TABLE public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  prep_time TEXT,
  servings INTEGER,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  instructions TEXT,
  image_url TEXT,
  ingredients JSONB DEFAULT '[]'::JSONB, -- Array of {name, amount, unit}
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE public.meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meals JSONB DEFAULT '[]'::JSONB, -- Array of Meal objects
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(family_id, date) -- One plan record per day per family (or allowed multiple?)
);

-- 6. HEALTH (Saude)
-- Shared structure or separate? Separate is cleaner for SQL querying.

CREATE TABLE public.vaccines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  member_name TEXT NOT NULL, -- Linking by name as used in frontend
  date_administered DATE NOT NULL,
  next_dose_date DATE,
  status TEXT CHECK (status IN ('uptodate', 'pending', 'overdue')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  member_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  next_dose_time TEXT, -- "08:00"
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.health_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialty TEXT,
  phone TEXT,
  type TEXT CHECK (type IN ('doctor', 'clinic', 'emergency')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. FINANCE (Financas)
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  date DATE NOT NULL,
  icon TEXT, -- Emoji or icon name
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);


CREATE TABLE public.bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'paid', 'overdue')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.financial_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  type TEXT CHECK (type IN ('investment', 'savings')),
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- FUNCTIONS & TRIGGERS --

-- Helper to check if user belongs to family
CREATE OR REPLACE FUNCTION public.user_in_family(p_family_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members 
    WHERE family_id = p_family_id 
    AND (user_id = auth.uid() OR (user_id IS NULL AND 1=0)) -- Only authenticated users maps
  );
$$;

-- Helper to get my family IDs (usually just one)
CREATE OR REPLACE FUNCTION public.get_my_family_ids()
RETURNS SETOF UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT family_id FROM public.family_members WHERE user_id = auth.uid();
$$;

-- Trigger to create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ROW LEVEL SECURITY (RLS) --

-- Enable RLS on all tables
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_assets ENABLE ROW LEVEL SECURITY;

-- 1. Families RLS
CREATE POLICY "Users can create families" ON public.families FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can view their families" ON public.families FOR SELECT USING (
  id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can update family" ON public.families FOR UPDATE USING (
  id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid() AND role = 'admin')
);

-- 2. Tasks RLS
CREATE POLICY "Family members can view tasks" ON public.tasks FOR SELECT USING (
  family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid())
);
CREATE POLICY "Family members can create tasks" ON public.tasks FOR INSERT WITH CHECK (
  family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid())
);
CREATE POLICY "Family members can update tasks" ON public.tasks FOR UPDATE USING (
  family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid())
);
CREATE POLICY "Family members can delete tasks" ON public.tasks FOR DELETE USING (
  family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid())
);

-- 3. Pantry RLS
CREATE POLICY "Family members can view pantry" ON public.pantry_items FOR SELECT USING (family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid()));
CREATE POLICY "Family members can manage pantry" ON public.pantry_items FOR ALL USING (family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid()));

-- 4. Shopping List RLS
CREATE POLICY "Family members can view list" ON public.shopping_items FOR SELECT USING (family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid()));
CREATE POLICY "Family members can manage list" ON public.shopping_items FOR ALL USING (family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid()));

-- 5. Recipes & Meal Plan RLS
CREATE POLICY "Family members can view recipes" ON public.recipes FOR SELECT USING (family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid()));
CREATE POLICY "Family members can manage recipes" ON public.recipes FOR ALL USING (family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid()));
CREATE POLICY "Family members can view meal plans" ON public.meal_plans FOR SELECT USING (family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid()));
CREATE POLICY "Family members can manage meal plans" ON public.meal_plans FOR ALL USING (family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid()));

-- 6. Health RLS
CREATE POLICY "Family members can view vaccines" ON public.vaccines FOR SELECT USING (family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid()));
CREATE POLICY "Family members can manage vaccines" ON public.vaccines FOR ALL USING (family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid()));
CREATE POLICY "Family members can view medications" ON public.medications FOR SELECT USING (family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid()));
CREATE POLICY "Family members can manage medications" ON public.medications FOR ALL USING (family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid()));
CREATE POLICY "Family members can view contacts" ON public.health_contacts FOR SELECT USING (family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid()));
CREATE POLICY "Family members can manage contacts" ON public.health_contacts FOR ALL USING (family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid()));

-- 7. Finance RLS
CREATE POLICY "Family members can view transactions" ON public.transactions FOR SELECT USING (family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid()));
CREATE POLICY "Family members can manage transactions" ON public.transactions FOR ALL USING (family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid()));
CREATE POLICY "Family members can view bills" ON public.bills FOR SELECT USING (family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid()));
CREATE POLICY "Family members can manage bills" ON public.bills FOR ALL USING (family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid()));

CREATE POLICY "Family members can view assets" ON public.financial_assets FOR SELECT USING (family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid()));
CREATE POLICY "Family members can manage assets" ON public.financial_assets FOR ALL USING (family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid()));

-- 8. Profiles & Core RLS
-- Reuse existing profile policies or define concise ones
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Family Members RLS
CREATE POLICY "Users can view family members" ON public.family_members FOR SELECT USING (
  family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid()) OR user_id = auth.uid()
);
-- Additional policies for join requests usually needed too.
