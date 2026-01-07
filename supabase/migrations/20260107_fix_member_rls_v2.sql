-- Create a secure function to check admin status
-- SECURITY DEFINER allows it to run with higher privileges, bypassing RLS recursion issues
CREATE OR REPLACE FUNCTION public.is_admin_of_family(lookup_family_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.family_members 
    WHERE family_id = lookup_family_id 
    AND user_id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- Drop potentially conflicting/recursive policies if they exist (clean slate for these operations)
DROP POLICY IF EXISTS "Admins can update family members" ON public.family_members;
DROP POLICY IF EXISTS "Admins can delete family members" ON public.family_members;
DROP POLICY IF EXISTS "Admins and Creators can insert family members" ON public.family_members;

-- 1. Allow Admins to UPDATE family members (Promote/Demote)
CREATE POLICY "Admins can update family members" ON public.family_members
  FOR UPDATE
  USING (
    public.is_admin_of_family(family_id)
  );

-- 2. Allow Admins to DELETE family members
CREATE POLICY "Admins can delete family members" ON public.family_members
  FOR DELETE
  USING (
    public.is_admin_of_family(family_id)
  );

-- 3. Allow Admins (and Family Creators) to INSERT family members
CREATE POLICY "Admins and Creators can insert family members" ON public.family_members
  FOR INSERT
  WITH CHECK (
    -- Check if user is the creator of the family (for initial setup)
    EXISTS (
        SELECT 1 FROM public.families 
        WHERE id = family_id 
        AND created_by = auth.uid()
    )
    OR
    public.is_admin_of_family(family_id)
  );
