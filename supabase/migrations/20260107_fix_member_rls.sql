-- Fix RLS policies for family_members to allow Admin operations

-- 1. Allow Admins to UPDATE family members (Promote/Demote)
CREATE POLICY "Admins can update family members" ON public.family_members
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id 
      FROM public.family_members 
      WHERE family_id = public.family_members.family_id 
      AND role = 'admin'
    )
  );

-- 2. Allow Admins to DELETE family members
CREATE POLICY "Admins can delete family members" ON public.family_members
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id 
      FROM public.family_members 
      WHERE family_id = public.family_members.family_id 
      AND role = 'admin'
    )
  );

-- 3. Allow Admins (and Family Creators) to INSERT family members
-- This covers:
-- a) Creating a new family (User is owner of family)
-- b) Adding a new member (User is admin of family)
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
    -- Check if user is an existing admin of the family
    auth.uid() IN (
        SELECT user_id 
        FROM public.family_members 
        WHERE family_id = family_id 
        AND role = 'admin'
    )
  );
