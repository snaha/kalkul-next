ALTER TABLE "public"."client" ADD COLUMN "email" character varying NOT NULL DEFAULT 'default@example.com';

ALTER TABLE "public"."client" ALTER COLUMN "email" DROP DEFAULT;
