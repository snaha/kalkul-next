-- Remove legacy security rules
drop policy "Enable insert for authenticated users only" on "public"."portfolio";
drop policy "Enable all for users based on user_id" on "public"."transaction";
drop policy "Enable insert for authenticated users only" on "public"."isin_errors";

-- Drop feedback table and related function/trigger (no longer needed)
drop trigger if exists "set_feedback_email" on "public"."feedback";
drop function if exists "public"."set_feedback_email"();
drop table if exists "public"."feedback";

-- Fix performance issue in client table policy
drop policy "advisor can select,insert,update,delete clients" on "public"."client";
create policy "advisor can select,insert,update,delete clients"
on "public"."client"
as permissive
for all
to public
using ((select auth.uid()) = advisor);

-- Enable row level security on portfolio table
alter table "public"."portfolio" enable row level security;

-- Create policy to allow all operations if auth.uid() matches the client's advisor
create policy "Enable all operations for advisor"
on "public"."portfolio"
as permissive
for all
to authenticated
using (
    (select auth.uid()) = (
        select advisor
        from client
        where client.id = portfolio.client
    )
);

-- Enable row level security on investment table
alter table "public"."investment" enable row level security;

-- Create policy to allow all operations if auth.uid() matches the client's advisor
create policy "Enable all operations for advisor"
on "public"."investment"
as permissive
for all
to authenticated
using (
    (select auth.uid()) = (
        select client.advisor
        from portfolio
        join client on portfolio.client = client.id
        where portfolio.id = investment.portfolio_id
    )
);

-- Create policy to allow all operations if auth.uid() matches the client's advisor
create policy "Enable all operations for advisor"
on "public"."transaction"
as permissive
for all
to authenticated
using (
    (select auth.uid()) = (
        select client.advisor
        from investment
        join portfolio on investment.portfolio_id = portfolio.id
        join client on portfolio.client = client.id
        where investment.id = transaction.investment_id
    )
);

-- Remove unused user_id column from transaction table
alter table "public"."transaction" drop column if exists "user_id";

-- Enable row level security on isin_errors table
alter table "public"."isin_errors" enable row level security;

-- Add indexes for foreign key columns to improve performance
create index if not exists "idx_portfolio_client" on "public"."portfolio" using btree ("client");
create index if not exists "idx_investment_portfolio_id" on "public"."investment" using btree ("portfolio_id");
create index if not exists "idx_transaction_investment_id" on "public"."transaction" using btree ("investment_id");

-- Fix search_path security issue in readonly view functions
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

-- Update transaction_view_type to include investment_id
-- First drop the function that depends on the type
DROP FUNCTION IF EXISTS public.transaction_readonly_view(text);

-- Now we can safely drop and recreate the type
DROP TYPE IF EXISTS "public"."transaction_view_type";
CREATE TYPE "public"."transaction_view_type" AS (
    "id" bigint,
    "type" text,
    "amount" numeric,
    "label" text,
    "date" timestamp with time zone,
    "repeat" bigint,
    "repeat_unit" text,
    "end_date" timestamp with time zone,
    "created_at" timestamp with time zone,
    "last_edited_at" timestamp with time zone,
    "investment_id" bigint
);

-- Recreate the function with the updated type
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

-- Fix search_path security issue in update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
begin
    new.updated_at = now();
    return new;
end;
$function$;

-- Rename clinets_pkey to clients_pkey to fix typo
ALTER INDEX "public"."clinets_pkey" RENAME TO "clients_pkey";

-- Add comment to isin_errors table
COMMENT ON TABLE "public"."isin_errors" IS 'Backend-only table for logging ISIN lookup errors';

-- Add comment to market_data_cache table
COMMENT ON TABLE "public"."market_data_cache" IS 'Backend-only table for caching market data';
