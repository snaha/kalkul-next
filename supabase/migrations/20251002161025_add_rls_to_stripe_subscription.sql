-- Enable RLS on stripe_subscription table
-- No policies are created, so regular users cannot access this table at all
-- Service role bypasses RLS automatically and can access without policies
ALTER TABLE stripe_subscription ENABLE ROW LEVEL SECURITY;
