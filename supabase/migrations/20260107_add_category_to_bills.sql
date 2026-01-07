ALTER TABLE public.bills 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'Contas';

-- Update existing records to have a default category if null
UPDATE public.bills 
SET category = 'Contas' 
WHERE category IS NULL;
