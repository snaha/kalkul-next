drop function if exists "public"."get_client_email"(link_id text);

alter table "public"."client" alter column "email" set data type text using "email"::text;

alter table "public"."feedback" alter column "email" set data type text using "email"::text;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.set_feedback_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$declare
  client_email text;
  link_id text;
begin

  if NEW.email is not null then
    return NEW;
  end if;

  link_id := (regexp_matches(NEW.pathname, '^/view/(.*)$'))[1];

  select client.email 
  into client_email
  from client
  join portfolio on portfolio.client = client.id
  where portfolio.link = link_id
  limit 1;

  NEW.email := client_email;

  return NEW;
end;$function$
;

CREATE TRIGGER set_feedback_email BEFORE INSERT ON public.feedback FOR EACH ROW EXECUTE FUNCTION set_feedback_email();



