alter table "public"."portfolio" add column "link" text;

CREATE UNIQUE INDEX portfolio_link_key ON public.portfolio USING btree (link);

alter table "public"."portfolio" add constraint "portfolio_link_key" UNIQUE using index "portfolio_link_key";

set check_function_bodies = off;

create type "public"."client_view_type" as ("id" bigint, "name" character varying, "birth_date" date, "advisor" uuid, "created_at" timestamp with time zone);

CREATE OR REPLACE FUNCTION public.client_readonly_view(link_id text)
 RETURNS SETOF client_view_type
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
    SELECT client.id, client.name, client.birth_date, client.advisor, client.created_at
    FROM client
    JOIN portfolio ON portfolio.client=client.id
    WHERE portfolio.link=link_id
  $function$
;

create type "public"."investment_view_type" as ("id" bigint, "apy" numeric, "entry_fee" numeric, "exit_fee" numeric, "management_fee" numeric, "exit_fee_type" text, "management_fee_type" text, "entry_fee_type" text, "name" text, "success_fee" numeric, "created_at" timestamp with time zone, "last_edited_at" timestamp with time zone);

CREATE OR REPLACE FUNCTION public.investment_readonly_view(link_id text)
 RETURNS SETOF investment_view_type
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
    SELECT investment.id, investment.apy, investment.entry_fee, investment.exit_fee, investment.management_fee, investment.exit_fee_type, investment.management_fee_type, investment.entry_fee_type, investment.name, investment.success_fee, investment.created_at, investment.last_edited_at
    FROM investment
    JOIN portfolio ON portfolio.id=investment.portfolio
    WHERE portfolio.link=link_id
  $function$
;

create type "public"."portfolio_view_type" as ("id" bigint, "name" text, "start_date" date, "end_date" date, "inflation_rate" numeric, "currency" text, "link" text, "created_at" timestamp with time zone, "last_edited_at" timestamp with time zone);

CREATE OR REPLACE FUNCTION public.portfolio_readonly_view(link_id text)
 RETURNS SETOF portfolio_view_type
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
    SELECT id, name, start_date, end_date, inflation_rate, currency, link, created_at, last_edited_at
    FROM portfolio
    WHERE link=link_id
  $function$
;

create type "public"."transaction_view_type" as ("id" bigint, "type" text, "amount" numeric, "label" text, "date" timestamp with time zone, "repeat" bigint, "repeat_unit" text, "end_date" timestamp with time zone, "created_at" timestamp with time zone, "last_edited_at" timestamp with time zone);

CREATE OR REPLACE FUNCTION public.transaction_readonly_view(link_id text)
 RETURNS SETOF transaction_view_type
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
    SELECT transaction.id, transaction.type, transaction.amount, transaction.label, transaction.date, transaction.repeat, transaction.repeat_unit, transaction.end_date, transaction.created_at, transaction.last_edited_at
    FROM transaction
    JOIN investment ON investment.id=transaction.investment_id
    JOIN portfolio ON investment.portfolio=portfolio.id
    WHERE portfolio.link=link_id
  $function$
;



