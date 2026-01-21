-- Make family_id nullable to support personal transactions
ALTER TABLE public.transactions ALTER COLUMN family_id DROP NOT NULL;

-- Enable RLS for personal transactions (where family_id is null)
-- View
CREATE POLICY "Users can view personal transactions" ON public.transactions
FOR SELECT
USING (auth.uid() = created_by AND family_id IS NULL);

-- Manage (Insert, Update, Delete)
CREATE POLICY "Users can manage personal transactions" ON public.transactions
FOR ALL
USING (auth.uid() = created_by AND family_id IS NULL)
WITH CHECK (auth.uid() = created_by AND family_id IS NULL);
