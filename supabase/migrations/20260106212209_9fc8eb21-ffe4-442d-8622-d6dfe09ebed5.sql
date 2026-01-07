-- Create families table
CREATE TABLE public.families (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Create family_members table to link users to families
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

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  current_family_id UUID REFERENCES public.families(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Function to get user's family IDs
CREATE OR REPLACE FUNCTION public.get_user_family_ids(p_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT family_id FROM public.family_members WHERE user_id = p_user_id
$$;

-- Function to check if user is family admin
CREATE OR REPLACE FUNCTION public.is_family_admin(p_user_id UUID, p_family_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members 
    WHERE user_id = p_user_id 
    AND family_id = p_family_id 
    AND role = 'admin'
  )
$$;

-- Families policies
CREATE POLICY "Users can view families they belong to"
ON public.families FOR SELECT
USING (id IN (SELECT public.get_user_family_ids(auth.uid())));

CREATE POLICY "Users can create families"
ON public.families FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Family admins can update their family"
ON public.families FOR UPDATE
USING (public.is_family_admin(auth.uid(), id));

CREATE POLICY "Family admins can delete their family"
ON public.families FOR DELETE
USING (public.is_family_admin(auth.uid(), id));

-- Family members policies
CREATE POLICY "Users can view members of their families"
ON public.family_members FOR SELECT
USING (family_id IN (SELECT public.get_user_family_ids(auth.uid())));

CREATE POLICY "Family admins can add members"
ON public.family_members FOR INSERT
WITH CHECK (
  public.is_family_admin(auth.uid(), family_id) 
  OR (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.family_members WHERE family_id = family_members.family_id))
);

CREATE POLICY "Family admins can update members"
ON public.family_members FOR UPDATE
USING (public.is_family_admin(auth.uid(), family_id));

CREATE POLICY "Family admins can delete members"
ON public.family_members FOR DELETE
USING (public.is_family_admin(auth.uid(), family_id));

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();