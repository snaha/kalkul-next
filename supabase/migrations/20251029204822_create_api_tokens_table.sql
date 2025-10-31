-- Personal Access Tokens Table
CREATE TABLE IF NOT EXISTS public.api_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  token_prefix text NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  last_used_at timestamptz,
  is_active boolean NOT NULL DEFAULT true
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS api_tokens_user_id_idx ON public.api_tokens(user_id);

-- Create index on token_hash for faster authentication
CREATE INDEX IF NOT EXISTS api_tokens_token_hash_idx ON public.api_tokens(token_hash);

-- Enable RLS
ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own tokens
CREATE POLICY "Users can read own tokens"
  ON public.api_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own tokens
CREATE POLICY "Users can create own tokens"
  ON public.api_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own tokens
CREATE POLICY "Users can update own tokens"
  ON public.api_tokens
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own tokens
CREATE POLICY "Users can delete own tokens"
  ON public.api_tokens
  FOR DELETE
  USING (auth.uid() = user_id);
