-- Update bills table to support income/expense and recurrence
ALTER TABLE public.bills 
ADD COLUMN IF NOT EXISTS type text CHECK (type IN ('income', 'expense')) DEFAULT 'expense',
ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS frequency text DEFAULT 'monthly';

-- Update financial_assets table to track investment timelines
ALTER TABLE public.financial_assets
ADD COLUMN IF NOT EXISTS start_date date DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS maturity_date date,
ADD COLUMN IF NOT EXISTS initial_amount numeric DEFAULT 0;

-- Optional: Backfill existing bills to be 'expense' (covered by default but good to be explicit for existing rows if default didn't apply retrospectively in some DBs, though postgres usually handles defaults for new rows only, existing rows need update if nulled)
UPDATE public.bills SET type = 'expense' WHERE type IS NULL;
