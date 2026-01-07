-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view members of their families" ON public.family_members;
DROP POLICY IF EXISTS "Family admins can add members" ON public.family_members;
DROP POLICY IF EXISTS "Family admins can update members" ON public.family_members;
DROP POLICY IF EXISTS "Family admins can delete members" ON public.family_members;

-- Drop old function
DROP FUNCTION IF EXISTS public.get_user_family_ids(UUID);

-- Create a function that checks if user belongs to a family (without querying family_members directly in policy)
CREATE OR REPLACE FUNCTION public.user_belongs_to_family(p_user_id UUID, p_family_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members 
    WHERE user_id = p_user_id AND family_id = p_family_id
  )
$$;

-- Create a function to get family_id for a user
CREATE OR REPLACE FUNCTION public.get_user_family_id(p_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT family_id FROM public.family_members WHERE user_id = p_user_id LIMIT 1
$$;

-- Recreate family_members policies using security definer functions
CREATE POLICY "Users can view members of their families"
ON public.family_members FOR SELECT
USING (public.user_belongs_to_family(auth.uid(), family_id));

CREATE POLICY "Users can insert themselves as first member"
ON public.family_members FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  OR public.is_family_admin(auth.uid(), family_id)
);

CREATE POLICY "Family admins can update members"
ON public.family_members FOR UPDATE
USING (public.is_family_admin(auth.uid(), family_id));

CREATE POLICY "Family admins can delete members"
ON public.family_members FOR DELETE
USING (public.is_family_admin(auth.uid(), family_id));