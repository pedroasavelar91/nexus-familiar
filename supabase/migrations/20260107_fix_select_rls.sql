-- Create a secure function to get a user's family IDs
-- SECURITY DEFINER allows it to run with higher privileges, bypassing RLS recursion issues
CREATE OR REPLACE FUNCTION public.get_user_family_ids(lookup_user_id UUID)
RETURNS TABLE (family_id UUID)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT family_id 
  FROM public.family_members 
  WHERE user_id = lookup_user_id;
$$;

-- Drop the potentially recursive SELECT policy
DROP POLICY IF EXISTS "Users can view family members" ON public.family_members;

-- Create the new non-recursive SELECT policy
CREATE POLICY "Users can view family members" ON public.family_members
  FOR SELECT
  USING (
    family_id IN (SELECT family_id FROM public.get_user_family_ids(auth.uid()))
    OR
    user_id = auth.uid()
  );
