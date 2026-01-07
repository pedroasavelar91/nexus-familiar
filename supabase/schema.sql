-- Enable necessary extensions
-- (none explicitly requested but usually pgcrypto is good, though gen_random_uuid() is built-in in newer pg)

-- TABLES --

CREATE TABLE public.families (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  invite_code TEXT UNIQUE DEFAULT UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))
);

CREATE TABLE public.family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'pet')),
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(family_id, user_id)
);

CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  current_family_id UUID REFERENCES public.families(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.join_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by UUID,
  UNIQUE(family_id, user_id)
);

-- RLS ENABLE --
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.join_requests ENABLE ROW LEVEL SECURITY;

-- FUNCTIONS --

CREATE OR REPLACE FUNCTION public.is_family_admin(p_user_id UUID, p_family_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members 
    WHERE user_id = p_user_id 
    AND family_id = p_family_id 
    AND role = 'admin'
  )
$$;

CREATE OR REPLACE FUNCTION public.user_belongs_to_family(p_user_id UUID, p_family_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members 
    WHERE user_id = p_user_id AND family_id = p_family_id
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_family_id(p_user_id UUID)
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT family_id FROM public.family_members WHERE user_id = p_user_id LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- TRIGGERS --

-- Note: In Supabase, you might need to drop existing triggers/functions if re-running, but this script assumes a fresh run or you handle errors manually.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- POLICIES --

-- Families
-- Note: Dropping policies if they exist to avoid errors in case of re-run attempts, though usually you just run this once.
DROP POLICY IF EXISTS "Anyone can search families by invite code" ON public.families;
CREATE POLICY "Anyone can search families by invite code" ON public.families FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create families" ON public.families;
CREATE POLICY "Users can create families" ON public.families FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Family admins can update their family" ON public.families;
CREATE POLICY "Family admins can update their family" ON public.families FOR UPDATE USING (public.is_family_admin(auth.uid(), id));

DROP POLICY IF EXISTS "Family admins can delete their family" ON public.families;
CREATE POLICY "Family admins can delete their family" ON public.families FOR DELETE USING (public.is_family_admin(auth.uid(), id));

-- Family Members
DROP POLICY IF EXISTS "Users can view members of their families" ON public.family_members;
CREATE POLICY "Users can view members of their families" ON public.family_members FOR SELECT USING (public.user_belongs_to_family(auth.uid(), family_id));

DROP POLICY IF EXISTS "Users can insert themselves as first member" ON public.family_members;
CREATE POLICY "Users can insert themselves as first member" ON public.family_members FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_family_admin(auth.uid(), family_id));

DROP POLICY IF EXISTS "Family admins can update members" ON public.family_members;
CREATE POLICY "Family admins can update members" ON public.family_members FOR UPDATE USING (public.is_family_admin(auth.uid(), family_id));

DROP POLICY IF EXISTS "Family admins can delete members" ON public.family_members;
CREATE POLICY "Family admins can delete members" ON public.family_members FOR DELETE USING (public.is_family_admin(auth.uid(), family_id));

-- Profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Join Requests
DROP POLICY IF EXISTS "Users can view their own requests" ON public.join_requests;
CREATE POLICY "Users can view their own requests" ON public.join_requests FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Family admins can view family requests" ON public.join_requests;
CREATE POLICY "Family admins can view family requests" ON public.join_requests FOR SELECT USING (public.is_family_admin(auth.uid(), family_id));

DROP POLICY IF EXISTS "Users can create join requests" ON public.join_requests;
CREATE POLICY "Users can create join requests" ON public.join_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Family admins can update requests" ON public.join_requests;
CREATE POLICY "Family admins can update requests" ON public.join_requests FOR UPDATE USING (public.is_family_admin(auth.uid(), family_id));

DROP POLICY IF EXISTS "Users can cancel their requests" ON public.join_requests;
CREATE POLICY "Users can cancel their requests" ON public.join_requests FOR DELETE USING (auth.uid() = user_id AND status = 'pending');
