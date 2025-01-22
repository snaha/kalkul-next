alter table "public"."investment" drop constraint "investment_portfolio_fkey";

alter table "public"."portfolio" drop constraint "portfolio_client_fkey";

alter table "public"."transaction" drop constraint "transaction_investment_id_fkey";

alter table "public"."transaction" drop constraint "transaction_user_id_fkey";

alter table "public"."investment" add constraint "investment_portfolio_fkey" FOREIGN KEY (portfolio) REFERENCES portfolio(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."investment" validate constraint "investment_portfolio_fkey";

alter table "public"."portfolio" add constraint "portfolio_client_fkey" FOREIGN KEY (client) REFERENCES client(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."portfolio" validate constraint "portfolio_client_fkey";

alter table "public"."transaction" add constraint "transaction_investment_id_fkey" FOREIGN KEY (investment_id) REFERENCES investment(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."transaction" validate constraint "transaction_investment_id_fkey";

alter table "public"."transaction" add constraint "transaction_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."transaction" validate constraint "transaction_user_id_fkey";



