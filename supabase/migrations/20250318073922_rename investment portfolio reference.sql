alter table "public"."investment" drop constraint "investment_portfolio_fkey";

alter table "public"."investment" rename column "portfolio" to "portfolio_id";

alter table "public"."investment" add constraint "investment_portfolio_fkey" FOREIGN KEY (portfolio_id) REFERENCES portfolio(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."investment" validate constraint "investment_portfolio_fkey";



