-- Add inflation_adjusted column to transaction table
ALTER TABLE "public"."transaction" ADD COLUMN "inflation_adjusted" BOOLEAN NOT NULL DEFAULT FALSE;

-- Add comment to document the purpose of this column
COMMENT ON COLUMN "public"."transaction"."inflation_adjusted" IS 'Whether this transaction amount should be adjusted for inflation based on portfolio inflation rate';