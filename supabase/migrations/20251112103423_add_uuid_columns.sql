-- Migration Part 1: Add UUID columns and populate them
-- This migration adds UUID columns alongside existing bigint IDs without removing any data

-- ============================================================================
-- STEP 1: Add UUID columns as Primary Keys to all tables
-- ============================================================================

-- Client table
ALTER TABLE "public"."client" ADD COLUMN "uuid_id" UUID DEFAULT gen_random_uuid() NOT NULL;

-- Portfolio table
ALTER TABLE "public"."portfolio" ADD COLUMN "uuid_id" UUID DEFAULT gen_random_uuid() NOT NULL;

-- Investment table
ALTER TABLE "public"."investment" ADD COLUMN "uuid_id" UUID DEFAULT gen_random_uuid() NOT NULL;

-- Transaction table
ALTER TABLE "public"."transaction" ADD COLUMN "uuid_id" UUID DEFAULT gen_random_uuid() NOT NULL;

-- Goal investment link table
ALTER TABLE "public"."goal_investment_link" ADD COLUMN "uuid_id" UUID DEFAULT gen_random_uuid() NOT NULL;

-- ============================================================================
-- STEP 2: Add UUID columns as Foreign Keys to all tables
-- ============================================================================

ALTER TABLE "public"."portfolio" ADD COLUMN "uuid_client" UUID;
ALTER TABLE "public"."investment" ADD COLUMN "uuid_portfolio_id" UUID;
ALTER TABLE "public"."transaction" ADD COLUMN "uuid_investment_id" UUID;
ALTER TABLE "public"."goal_investment_link" ADD COLUMN "uuid_goal_id" UUID;
ALTER TABLE "public"."goal_investment_link" ADD COLUMN "uuid_investment_id" UUID;

-- ============================================================================
-- STEP 3: Populate Foreign Key UUID columns using integer ID mappings
-- ============================================================================

-- Update portfolio.uuid_client from client.uuid_id
UPDATE "public"."portfolio" p
SET uuid_client = c.uuid_id
FROM "public"."client" c
WHERE p.client = c.id;

-- Update investment.uuid_portfolio_id from portfolio.uuid_id
UPDATE "public"."investment" i
SET uuid_portfolio_id = p.uuid_id
FROM "public"."portfolio" p
WHERE i.portfolio_id = p.id;

-- Update transaction.uuid_investment_id from investment.uuid_id
UPDATE "public"."transaction" t
SET uuid_investment_id = i.uuid_id
FROM "public"."investment" i
WHERE t.investment_id = i.id;

-- Update goal_investment_link.uuid_goal_id from investment.uuid_id
UPDATE "public"."goal_investment_link" gil
SET uuid_goal_id = i.uuid_id
FROM "public"."investment" i
WHERE gil.goal_id = i.id;

-- Update goal_investment_link.uuid_investment_id from investment.uuid_id
UPDATE "public"."goal_investment_link" gil
SET uuid_investment_id = i.uuid_id
FROM "public"."investment" i
WHERE gil.investment_id = i.id;
