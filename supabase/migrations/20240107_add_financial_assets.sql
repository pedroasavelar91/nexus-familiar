-- Create financial_assets table
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
ALTER TABLE public.financial_assets ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies
CREATE POLICY "Family members can view assets" ON public.financial_assets 
FOR SELECT USING (
  family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid())
);

CREATE POLICY "Family members can manage assets" ON public.financial_assets 
FOR ALL USING (
  family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid())
);
