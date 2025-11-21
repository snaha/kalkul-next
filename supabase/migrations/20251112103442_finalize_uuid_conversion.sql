-- Migration Part 2: Finalize UUID conversion by removing old integer columns
-- This migration drops old integer IDs and renames UUID columns to their final names

-- ============================================================================
-- STEP 1: Drop RLS policies that depend on columns we'll be dropping
-- ============================================================================

DROP POLICY IF EXISTS "Enable all operations for advisor" ON "public"."portfolio";
DROP POLICY IF EXISTS "Enable all operations for advisor" ON "public"."investment";
DROP POLICY IF EXISTS "Enable all operations for advisor" ON "public"."transaction";
DROP POLICY IF EXISTS "Enable all operations for advisor" ON "public"."goal_investment_link";

-- ============================================================================
-- STEP 2: Drop old foreign key constraints
-- ============================================================================

ALTER TABLE "public"."portfolio" DROP CONSTRAINT "portfolio_client_fkey";
ALTER TABLE "public"."investment" DROP CONSTRAINT "investment_portfolio_fkey";
ALTER TABLE "public"."transaction" DROP CONSTRAINT "transaction_investment_id_fkey";
ALTER TABLE "public"."goal_investment_link" DROP CONSTRAINT "goal_investment_link_goal_id_fkey";
ALTER TABLE "public"."goal_investment_link" DROP CONSTRAINT "goal_investment_link_investment_id_fkey";

-- ============================================================================
-- STEP 3: Drop old primary key constraints and indexes
-- ============================================================================

ALTER TABLE "public"."client" DROP CONSTRAINT "clients_pkey";
ALTER TABLE "public"."portfolio" DROP CONSTRAINT "portfolio_pkey";
ALTER TABLE "public"."investment" DROP CONSTRAINT "investment_pkey";
ALTER TABLE "public"."transaction" DROP CONSTRAINT "transaction_pkey";
ALTER TABLE "public"."goal_investment_link" DROP CONSTRAINT "goal_investment_link_pkey";

-- ============================================================================
-- STEP 4: Drop old integer ID columns
-- ============================================================================

ALTER TABLE "public"."goal_investment_link" DROP COLUMN "goal_id";
ALTER TABLE "public"."goal_investment_link" DROP COLUMN "investment_id";
ALTER TABLE "public"."transaction" DROP COLUMN "investment_id";
ALTER TABLE "public"."investment" DROP COLUMN "portfolio_id";
ALTER TABLE "public"."portfolio" DROP COLUMN "client";
ALTER TABLE "public"."goal_investment_link" DROP COLUMN "id";
ALTER TABLE "public"."transaction" DROP COLUMN "id";
ALTER TABLE "public"."investment" DROP COLUMN "id";
ALTER TABLE "public"."portfolio" DROP COLUMN "id";
ALTER TABLE "public"."client" DROP COLUMN "id";

-- ============================================================================
-- STEP 5: Rename UUID columns to final names
-- ============================================================================

ALTER TABLE "public"."client" RENAME COLUMN "uuid_id" TO "id";
ALTER TABLE "public"."portfolio" RENAME COLUMN "uuid_id" TO "id";
ALTER TABLE "public"."portfolio" RENAME COLUMN "uuid_client" TO "client";
ALTER TABLE "public"."investment" RENAME COLUMN "uuid_id" TO "id";
ALTER TABLE "public"."investment" RENAME COLUMN "uuid_portfolio_id" TO "portfolio_id";
ALTER TABLE "public"."transaction" RENAME COLUMN "uuid_id" TO "id";
ALTER TABLE "public"."transaction" RENAME COLUMN "uuid_investment_id" TO "investment_id";
ALTER TABLE "public"."goal_investment_link" RENAME COLUMN "uuid_id" TO "id";
ALTER TABLE "public"."goal_investment_link" RENAME COLUMN "uuid_goal_id" TO "goal_id";
ALTER TABLE "public"."goal_investment_link" RENAME COLUMN "uuid_investment_id" TO "investment_id";

-- ============================================================================
-- STEP 6: Set NOT NULL constraints on foreign keys
-- ============================================================================

ALTER TABLE "public"."portfolio" ALTER COLUMN "client" SET NOT NULL;
ALTER TABLE "public"."investment" ALTER COLUMN "portfolio_id" SET NOT NULL;
ALTER TABLE "public"."transaction" ALTER COLUMN "investment_id" SET NOT NULL;
ALTER TABLE "public"."goal_investment_link" ALTER COLUMN "goal_id" SET NOT NULL;
ALTER TABLE "public"."goal_investment_link" ALTER COLUMN "investment_id" SET NOT NULL;

-- ============================================================================
-- STEP 7: Create new primary key constraints
-- ============================================================================

ALTER TABLE "public"."client" ADD CONSTRAINT "client_pkey" PRIMARY KEY ("id");
ALTER TABLE "public"."portfolio" ADD CONSTRAINT "portfolio_pkey" PRIMARY KEY ("id");
ALTER TABLE "public"."investment" ADD CONSTRAINT "investment_pkey" PRIMARY KEY ("id");
ALTER TABLE "public"."transaction" ADD CONSTRAINT "transaction_pkey" PRIMARY KEY ("id");
ALTER TABLE "public"."goal_investment_link" ADD CONSTRAINT "goal_investment_link_pkey" PRIMARY KEY ("id");

-- ============================================================================
-- STEP 8: Create new foreign key constraints
-- ============================================================================

ALTER TABLE "public"."portfolio"
  ADD CONSTRAINT "portfolio_client_fkey"
  FOREIGN KEY (client) REFERENCES "public"."client"(id)
  ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."investment"
  ADD CONSTRAINT "investment_portfolio_fkey"
  FOREIGN KEY (portfolio_id) REFERENCES "public"."portfolio"(id)
  ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."transaction"
  ADD CONSTRAINT "transaction_investment_id_fkey"
  FOREIGN KEY (investment_id) REFERENCES "public"."investment"(id)
  ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."goal_investment_link"
  ADD CONSTRAINT "goal_investment_link_goal_id_fkey"
  FOREIGN KEY (goal_id) REFERENCES "public"."investment"(id)
  ON DELETE CASCADE;

ALTER TABLE "public"."goal_investment_link"
  ADD CONSTRAINT "goal_investment_link_investment_id_fkey"
  FOREIGN KEY (investment_id) REFERENCES "public"."investment"(id)
  ON DELETE CASCADE;

-- ============================================================================
-- STEP 9: Recreate unique constraints
-- ============================================================================

-- Recreate unique constraint for goal_investment_link
ALTER TABLE "public"."goal_investment_link"
  ADD CONSTRAINT "goal_investment_link_goal_id_investment_id_key"
  UNIQUE (goal_id, investment_id);

-- ============================================================================
-- STEP 10: Recreate indexes
-- ============================================================================

-- Create indexes on goal_investment_link
CREATE INDEX "idx_goal_investment_link_goal" ON "public"."goal_investment_link"("goal_id");
CREATE INDEX "idx_goal_investment_link_investment" ON "public"."goal_investment_link"("investment_id");

-- Create foreign key indexes for performance (from RLS migration)
CREATE INDEX "idx_portfolio_client" ON "public"."portfolio"("client");
CREATE INDEX "idx_investment_portfolio_id" ON "public"."investment"("portfolio_id");
CREATE INDEX "idx_transaction_investment_id" ON "public"."transaction"("investment_id");

-- ============================================================================
-- STEP 11: Update view functions and types for UUID
-- ============================================================================

-- Drop old view functions (they depend on the old types)
DROP FUNCTION IF EXISTS public.client_readonly_view(text);
DROP FUNCTION IF EXISTS public.investment_readonly_view(text);
DROP FUNCTION IF EXISTS public.portfolio_readonly_view(text);
DROP FUNCTION IF EXISTS public.transaction_readonly_view(text);

-- Drop old custom types
DROP TYPE IF EXISTS public.client_view_type;
DROP TYPE IF EXISTS public.investment_view_type;
DROP TYPE IF EXISTS public.portfolio_view_type;
DROP TYPE IF EXISTS public.transaction_view_type;

-- Create new custom types with UUID
CREATE TYPE "public"."client_view_type" AS (
  "id" uuid,
  "name" character varying,
  "birth_date" date,
  "advisor" uuid,
  "created_at" timestamp with time zone
);

CREATE TYPE "public"."investment_view_type" AS (
  "id" uuid,
  "apy" numeric,
  "entry_fee" numeric,
  "exit_fee" numeric,
  "management_fee" numeric,
  "exit_fee_type" text,
  "management_fee_type" text,
  "entry_fee_type" text,
  "name" text,
  "success_fee" numeric,
  "created_at" timestamp with time zone,
  "last_edited_at" timestamp with time zone
);

CREATE TYPE "public"."portfolio_view_type" AS (
  "id" uuid,
  "name" text,
  "start_date" date,
  "end_date" date,
  "inflation_rate" numeric,
  "currency" text,
  "link" text,
  "created_at" timestamp with time zone,
  "last_edited_at" timestamp with time zone
);

CREATE TYPE "public"."transaction_view_type" AS (
  "id" uuid,
  "type" text,
  "amount" numeric,
  "label" text,
  "date" timestamp with time zone,
  "repeat" bigint,
  "repeat_unit" text,
  "end_date" timestamp with time zone,
  "created_at" timestamp with time zone,
  "last_edited_at" timestamp with time zone,
  "investment_id" uuid
);

-- Create new view functions with UUID
CREATE OR REPLACE FUNCTION public.client_readonly_view(link_id text)
RETURNS SETOF client_view_type
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT client.id, client.name, client.birth_date, client.advisor, client.created_at
  FROM public.client
  JOIN public.portfolio ON portfolio.client=client.id
  WHERE portfolio.link=link_id
$function$;

CREATE OR REPLACE FUNCTION public.investment_readonly_view(link_id text)
RETURNS SETOF investment_view_type
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT investment.id, investment.apy, investment.entry_fee, investment.exit_fee, investment.management_fee, investment.exit_fee_type, investment.management_fee_type, investment.entry_fee_type, investment.name, investment.success_fee, investment.created_at, investment.last_edited_at
  FROM public.investment
  JOIN public.portfolio ON portfolio.id=investment.portfolio_id
  WHERE portfolio.link=link_id
$function$;

CREATE OR REPLACE FUNCTION public.portfolio_readonly_view(link_id text)
RETURNS SETOF portfolio_view_type
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT id, name, start_date, end_date, inflation_rate, currency, link, created_at, last_edited_at
  FROM public.portfolio
  WHERE link=link_id
$function$;

CREATE OR REPLACE FUNCTION public.transaction_readonly_view(link_id text)
RETURNS SETOF transaction_view_type
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT transaction.id, transaction.type, transaction.amount, transaction.label, transaction.date, transaction.repeat, transaction.repeat_unit, transaction.end_date, transaction.created_at, transaction.last_edited_at, transaction.investment_id
  FROM public.transaction
  JOIN public.investment ON investment.id=transaction.investment_id
  JOIN public.portfolio ON investment.portfolio_id=portfolio.id
  WHERE portfolio.link=link_id
$function$;

-- ============================================================================
-- STEP 12: Recreate RLS policies with UUID columns
-- ============================================================================

-- Portfolio RLS policy
CREATE POLICY "Enable all operations for advisor"
ON "public"."portfolio"
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
  (SELECT auth.uid()) = (
    SELECT advisor
    FROM public.client
    WHERE client.id = portfolio.client
  )
);

-- Investment RLS policy
CREATE POLICY "Enable all operations for advisor"
ON "public"."investment"
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
  (SELECT auth.uid()) = (
    SELECT client.advisor
    FROM public.portfolio
    JOIN public.client ON portfolio.client = client.id
    WHERE portfolio.id = investment.portfolio_id
  )
);

-- Transaction RLS policy
CREATE POLICY "Enable all operations for advisor"
ON "public"."transaction"
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
  (SELECT auth.uid()) = (
    SELECT client.advisor
    FROM public.investment
    JOIN public.portfolio ON investment.portfolio_id = portfolio.id
    JOIN public.client ON portfolio.client = client.id
    WHERE investment.id = transaction.investment_id
  )
);

-- Goal investment link RLS policy
CREATE POLICY "Enable all operations for advisor"
ON "public"."goal_investment_link"
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
  (SELECT auth.uid()) = (
    SELECT client.advisor
    FROM public.investment
    JOIN public.portfolio ON investment.portfolio_id = portfolio.id
    JOIN public.client ON portfolio.client = client.id
    WHERE investment.id = goal_investment_link.goal_id
  )
);
