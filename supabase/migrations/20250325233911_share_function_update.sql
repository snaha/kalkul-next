CREATE OR REPLACE FUNCTION public.investment_readonly_view(link_id text)
 RETURNS SETOF investment_view_type
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
    SELECT investment.id, investment.apy, investment.entry_fee, investment.exit_fee, investment.management_fee, investment.exit_fee_type, investment.management_fee_type, investment.entry_fee_type, investment.name, investment.success_fee, investment.created_at, investment.last_edited_at
    FROM investment
    JOIN portfolio ON portfolio.id=investment.portfolio_id
    WHERE portfolio.link=link_id
  $function$
;

CREATE OR REPLACE FUNCTION public.transaction_readonly_view(link_id text)
 RETURNS SETOF transaction_view_type
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
    SELECT transaction.id, transaction.type, transaction.amount, transaction.label, transaction.date, transaction.repeat, transaction.repeat_unit, transaction.end_date, transaction.created_at, transaction.last_edited_at
    FROM transaction
    JOIN investment ON investment.id=transaction.investment_id
    JOIN portfolio ON investment.portfolio_id=portfolio.id
    WHERE portfolio.link=link_id
  $function$
;
