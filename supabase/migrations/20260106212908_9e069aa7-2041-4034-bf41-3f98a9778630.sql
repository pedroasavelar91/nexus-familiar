-- Add invite_code to families for lookup
ALTER TABLE public.families 
ADD COLUMN invite_code TEXT UNIQUE DEFAULT UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));

-- Create join_requests table
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

-- Enable RLS
ALTER TABLE public.join_requests ENABLE ROW LEVEL SECURITY;

-- Policies for join_requests

-- Anyone can view their own requests
CREATE POLICY "Users can view their own requests"
ON public.join_requests FOR SELECT
USING (auth.uid() = user_id);

-- Family admins can view requests for their family
CREATE POLICY "Family admins can view family requests"
ON public.join_requests FOR SELECT
USING (public.is_family_admin(auth.uid(), family_id));

-- Anyone can create a request
CREATE POLICY "Users can create join requests"
ON public.join_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Family admins can update requests (approve/reject)
CREATE POLICY "Family admins can update requests"
ON public.join_requests FOR UPDATE
USING (public.is_family_admin(auth.uid(), family_id));

-- Users can delete their own pending requests
CREATE POLICY "Users can cancel their requests"
ON public.join_requests FOR DELETE
USING (auth.uid() = user_id AND status = 'pending');

-- Allow anyone to lookup family by invite_code (for searching)
CREATE POLICY "Anyone can search families by invite code"
ON public.families FOR SELECT
USING (true);

-- Drop the old restrictive policy and recreate
DROP POLICY IF EXISTS "Users can view families they belong to" ON public.families;