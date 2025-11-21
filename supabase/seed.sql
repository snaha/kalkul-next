-- ============================================================================
-- Kalkul Database Seed Data
-- ============================================================================
-- This file contains demo and test data for local development
-- Data includes:
-- - 2 demo advisor users (demo@kalkul.app, goals@kalkul.app)
-- - 7 clients across different scenarios (FIRE, retirement, goals, etc.)
-- - 13 portfolios with various investment strategies
-- - 34 investments (stocks, bonds, ETFs, goals, etc.)
-- - 111 transactions (deposits, withdrawals, recurring payments)
-- ============================================================================

-- ============================================================================
-- Demo Users (Advisors)
-- ============================================================================
-- Password for both users: demo123

INSERT INTO
  auth.users (
    id,
    instance_id,
    ROLE,
    aud,
    email,
    encrypted_password,
    created_at,
    updated_at,
    last_sign_in_at,
    email_confirmed_at,
    confirmation_sent_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    raw_user_meta_data
  )
VALUES
  ( -- Primary demo advisor
    '3c6a48fa-88fa-4cd9-bd0c-be4f4ac3a249',
    '00000000-0000-0000-0000-000000000000',
    'service_role',
    'authenticated',
    'demo@kalkul.app',
    crypt('demo123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '',
    '',
    '{}'::jsonb
  ),
  ( -- Goals demo advisor
    '4d7b59fb-99fb-5de0-ce5f-cf5f5bd4b350',
    '00000000-0000-0000-0000-000000000000',
    'service_role',
    'authenticated',
    'goals@kalkul.app',
    crypt('demo123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '',
    '',
    '{}'::jsonb
  );

INSERT INTO
  auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
VALUES
  ( -- Primary demo advisor identity
    '3c6a48fa-88fa-4cd9-bd0c-be4f4ac3a249',
    '3c6a48fa-88fa-4cd9-bd0c-be4f4ac3a249',
    '3c6a48fa-88fa-4cd9-bd0c-be4f4ac3a249',
    'email',
    '{"sub":"3c6a48fa-88fa-4cd9-bd0c-be4f4ac3a249","email":"demo@kalkul.app","email_verified":true}'::jsonb,
    NOW(),
    NOW(),
    NOW()
  ),
  ( -- Goals demo advisor identity
    '4d7b59fb-99fb-5de0-ce5f-cf5f5bd4b350',
    '4d7b59fb-99fb-5de0-ce5f-cf5f5bd4b350',
    '4d7b59fb-99fb-5de0-ce5f-cf5f5bd4b350',
    'email',
    '{"sub":"4d7b59fb-99fb-5de0-ce5f-cf5f5bd4b350","email":"goals@kalkul.app","email_verified":true}'::jsonb,
    NOW(),
    NOW(),
    NOW()
  );

-- ============================================================================
-- Clients
-- ============================================================================
INSERT INTO public.client (id, name, birth_date, advisor, created_at, email) VALUES
  -- Advisor: demo@kalkul.app > Client: Vanguardia Steadyworth
  ('52382c67-b8b3-4f06-9a97-77cce2f9985a'::uuid, 'Vanguardia Steadyworth', '1977-11-09'::date, '3c6a48fa-88fa-4cd9-bd0c-be4f4ac3a249'::uuid, '2024-11-26 14:03:04.068525+00'::timestamptz, 'vanguardia@kalkul.app'),
  -- Advisor: demo@kalkul.app > Client: Alexandra Carter
  ('b15202f3-f5cd-47e7-b584-24b5019df8a1'::uuid, 'Alexandra Carter', '1993-04-15'::date, '3c6a48fa-88fa-4cd9-bd0c-be4f4ac3a249'::uuid, '2025-08-14 10:00:00+00'::timestamptz, 'alex.carter@kalkul.app'),
  -- Advisor: demo@kalkul.app > Client: Elena Müller
  ('b6ce4fda-c53d-4f74-adfc-474f563da5eb'::uuid, 'Elena Müller', '1985-06-12'::date, '3c6a48fa-88fa-4cd9-bd0c-be4f4ac3a249'::uuid, '2025-08-14 12:00:00+00'::timestamptz, 'elena.mueller@kalkul.app'),
  -- Advisor: demo@kalkul.app > Client: Inflation Demo Client
  ('549890ba-1a51-4eff-b141-0609abb88ed3'::uuid, 'Inflation Demo Client', '1990-01-01'::date, '3c6a48fa-88fa-4cd9-bd0c-be4f4ac3a249'::uuid, '2025-08-23 15:00:00+00'::timestamptz, 'inflation.demo@kalkul.app'),
  -- Advisor: demo@kalkul.app > Client: Zero Crossing Demo Client
  ('6297692b-2b71-444d-8a39-2713bb02b74b'::uuid, 'Zero Crossing Demo Client', '1985-03-15'::date, '3c6a48fa-88fa-4cd9-bd0c-be4f4ac3a249'::uuid, '2025-09-24 12:00:00+00'::timestamptz, 'zero.crossing@kalkul.app'),
  -- Advisor: demo@kalkul.app > Client: Demo Manifest
  ('00cb4f75-e17c-48e5-86b2-cbe9cf8d8245'::uuid, 'Demo Manifest', '1980-02-02'::date, '3c6a48fa-88fa-4cd9-bd0c-be4f4ac3a249'::uuid, '2025-10-10 12:00:00+00'::timestamptz, 'retirement.demo@kalkul.app'),
  -- Advisor: goals@kalkul.app > Client: Goals Client
  ('f1567586-1c86-43e9-9193-64b769783522'::uuid, 'Goals Client', '1985-03-15'::date, '4d7b59fb-99fb-5de0-ce5f-cf5f5bd4b350'::uuid, '2025-10-30 10:00:00+00'::timestamptz, 'goals.client@kalkul.app');

-- ============================================================================
-- Portfolios
-- ============================================================================
INSERT INTO public.portfolio (id, name, client, start_date, end_date, inflation_rate, currency, link, created_at, last_edited_at) VALUES
  -- Client: Vanguardia Steadyworth > Portfolio: Sensible investing
  ('aa821f6e-07da-4bec-a9d8-260a3cea797c'::uuid, 'Sensible investing', '52382c67-b8b3-4f06-9a97-77cce2f9985a'::uuid, '1997-11-09'::date, '2045-11-09'::date, 0.0225::numeric, 'CZK', 'bqm1uvce58e15rflcivlqonx4', '2024-11-26 14:29:39.755166+00'::timestamptz, '2024-11-26 14:29:39.755166+00'::timestamptz),
  -- Client: Alexandra Carter > Portfolio: FIRE Plan - Retire at 50
  ('e346625b-580c-4ae4-8bf9-e371990f377a'::uuid, 'FIRE Plan - Retire at 50', 'b15202f3-f5cd-47e7-b584-24b5019df8a1'::uuid, '2025-08-14'::date, '2083-04-15'::date, 0.025::numeric, 'USD', 'carter-fire-plan-2025', '2025-08-14 10:00:00+00'::timestamptz, '2025-08-14 10:00:00+00'::timestamptz),
  -- Client: Elena Müller > Portfolio: Berlin Steady Growth Plan
  ('da822982-418c-467f-92eb-bbec62ded97c'::uuid, 'Berlin Steady Growth Plan', 'b6ce4fda-c53d-4f74-adfc-474f563da5eb'::uuid, '2025-08-14'::date, '2050-06-12'::date, 0.02::numeric, 'EUR', 'mueller-berlin-plan-2025', '2025-08-14 12:00:00+00'::timestamptz, '2025-08-14 12:00:00+00'::timestamptz),
  -- Client: Inflation Demo Client > Portfolio: Inflation Adjustment Demo Portfolio
  ('69a08c82-6e55-430c-a34f-29f148c3ef73'::uuid, 'Inflation Adjustment Demo Portfolio', '549890ba-1a51-4eff-b141-0609abb88ed3'::uuid, '2024-01-01'::date, '2044-01-01'::date, 0.03::numeric, 'USD', 'inflation-demo-portfolio-2025', '2025-08-23 15:00:00+00'::timestamptz, '2025-08-23 15:00:00+00'::timestamptz),
  -- Client: Zero Crossing Demo Client > Portfolio: Zero-Crossing Demonstration Portfolio
  ('2ae6f835-aafd-49c3-a6e8-2cfd2259a757'::uuid, 'Zero-Crossing Demonstration Portfolio', '6297692b-2b71-444d-8a39-2713bb02b74b'::uuid, '2023-01-01'::date, '2027-12-31'::date, 0.025::numeric, 'USD', 'zero-crossing-demo-2025', '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Client: Zero Crossing Demo Client > Portfolio: Zero-Crossing Demonstration Portfolio (+3 Years)
  ('62376397-44b2-4bc5-ace5-b52c6285f0f3'::uuid, 'Zero-Crossing Demonstration Portfolio (+3 Years)', '6297692b-2b71-444d-8a39-2713bb02b74b'::uuid, '2023-01-01'::date, '2030-12-31'::date, 0.025::numeric, 'USD', 'zero-crossing-demo-2025-extended', '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Client: Demo Manifest > Portfolio: Retirement Demo - 2. Single investment
  ('7f8b6375-69f6-4e6b-97d3-931814cb6ed4'::uuid, 'Retirement Demo - 2. Single investment', '00cb4f75-e17c-48e5-86b2-cbe9cf8d8245'::uuid, '2025-01-01'::date, '2065-02-02'::date, 0.025::numeric, 'EUR', 'retirement-demo-single-2025', '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Client: Demo Manifest > Portfolio: Retirement Demo - 4. Final
  ('3477d2b5-4de4-4f6b-95fa-f6c552459061'::uuid, 'Retirement Demo - 4. Final', '00cb4f75-e17c-48e5-86b2-cbe9cf8d8245'::uuid, '2025-01-01'::date, '2065-02-02'::date, 0.025::numeric, 'EUR', 'retirement-demo-2025', '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Client: Demo Manifest > Portfolio: Retirement Demo - 1. Goal only
  ('8f2ecd10-9d1c-4bbf-b762-c8522625246c'::uuid, 'Retirement Demo - 1. Goal only', '00cb4f75-e17c-48e5-86b2-cbe9cf8d8245'::uuid, '2025-01-01'::date, '2065-02-02'::date, 0.025::numeric, 'EUR', 'retirement-demo-simple-2025', '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Client: Demo Manifest > Portfolio: Retirement Demo - 5. Two Goals
  ('c7e3726c-ea98-4cf4-8f1b-ef3f3faec72d'::uuid, 'Retirement Demo - 5. Two Goals', '00cb4f75-e17c-48e5-86b2-cbe9cf8d8245'::uuid, '2025-01-01'::date, '2065-02-02'::date, 0.025::numeric, 'EUR', 'retirement-demo-two-goals-2025', '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Client: Demo Manifest > Portfolio: Retirement Demo - 3. Equal investments
  ('bae8f1d9-3219-4e6d-92f9-06a2487d2362'::uuid, 'Retirement Demo - 3. Equal investments', '00cb4f75-e17c-48e5-86b2-cbe9cf8d8245'::uuid, '2025-01-01'::date, '2065-02-02'::date, 0.025::numeric, 'EUR', 'retirement-demo-equal-2025', '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Client: Goals Client > Portfolio: Investment only portfolio
  ('3880d6d7-8fa8-4a63-9eda-80cbce223958'::uuid, 'Investment only portfolio', 'f1567586-1c86-43e9-9193-64b769783522'::uuid, '2025-10-30'::date, '2070-03-15'::date, 0.025::numeric, 'USD', 'goals-portfolio-2025', '2025-10-30 10:00:00+00'::timestamptz, '2025-10-30 10:00:00+00'::timestamptz),
  -- Client: Goals Client > Portfolio: Single goal portfolio
  ('d1f774b1-2a95-46c9-a0de-971d1096db31'::uuid, 'Single goal portfolio', 'f1567586-1c86-43e9-9193-64b769783522'::uuid, '2025-01-01'::date, '2070-03-15'::date, 0.025::numeric, 'CZK', 'goals-retirement-plan-2025', '2025-10-30 11:00:00+00'::timestamptz, '2025-10-30 11:00:00+00'::timestamptz);

-- ============================================================================
-- Investments
-- ============================================================================
INSERT INTO public.investment (
  id, name, portfolio_id, apy, entry_fee, exit_fee, success_fee, management_fee,
  exit_fee_type, management_fee_type, entry_fee_type, advanced_fees, ter, type, goal_data, created_at, last_edited_at
) VALUES
  -- Portfolio: Sensible investing > Investment: S&P
  ('0cdbcad5-11dd-42ec-83ff-0fe0e857f38d'::uuid, 'S&P', 'aa821f6e-07da-4bec-a9d8-260a3cea797c'::uuid, 14.52::numeric, 0::numeric, 0::numeric, 0::numeric, 0.03::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, NULL::numeric, NULL, NULL::jsonb, '2024-11-26 14:32:06.003862+00'::timestamptz, '2024-11-26 14:32:06.003862+00'::timestamptz),
  -- Portfolio: Sensible investing > Investment: Gold
  ('147e542a-5f21-46b3-be6f-c579acc86771'::uuid, 'Gold', 'aa821f6e-07da-4bec-a9d8-260a3cea797c'::uuid, 2.25::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, NULL::numeric, NULL, NULL::jsonb, '2024-11-26 15:26:16.334445+00'::timestamptz, '2024-11-26 15:26:16.334445+00'::timestamptz),
  -- Portfolio: Sensible investing > Investment: Real Estate fund
  ('2c182dc5-1ae7-4ba6-84be-143a293eaf70'::uuid, 'Real Estate fund', 'aa821f6e-07da-4bec-a9d8-260a3cea797c'::uuid, 6::numeric, 0::numeric, 1::numeric, 0::numeric, 1.5::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, NULL::numeric, NULL, NULL::jsonb, '2024-11-26 16:23:46.49737+00'::timestamptz, '2024-11-26 16:23:46.49737+00'::timestamptz),
  -- Portfolio: FIRE Plan - Retire at 50 > Investment: Total Stock Market ETF
  ('2697f8b6-9044-46d8-906f-3e1e011c9593'::uuid, 'Total Stock Market ETF', 'e346625b-580c-4ae4-8bf9-e371990f377a'::uuid, 7.5::numeric, 0::numeric, 0::numeric, 0::numeric, 0.75::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, NULL::numeric, NULL, NULL::jsonb, '2025-08-14 10:30:00+00'::timestamptz, '2025-08-14 10:30:00+00'::timestamptz),
  -- Portfolio: FIRE Plan - Retire at 50 > Investment: Bond Index Fund
  ('89dc158d-d5f5-44c9-9ee3-ef81a851b339'::uuid, 'Bond Index Fund', 'e346625b-580c-4ae4-8bf9-e371990f377a'::uuid, 5.2::numeric, 0::numeric, 0::numeric, 0::numeric, 0.25::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, NULL::numeric, NULL, NULL::jsonb, '2025-08-14 10:35:00+00'::timestamptz, '2025-08-14 10:35:00+00'::timestamptz),
  -- Portfolio: FIRE Plan - Retire at 50 > Investment: High-Yield Savings
  ('0c772687-9f3a-4ed5-b7a8-142de7bca89f'::uuid, 'High-Yield Savings', 'e346625b-580c-4ae4-8bf9-e371990f377a'::uuid, 4.5::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, NULL::numeric, NULL, NULL::jsonb, '2025-08-14 10:40:00+00'::timestamptz, '2025-08-14 10:40:00+00'::timestamptz),
  -- Portfolio: Berlin Steady Growth Plan > Investment: DAX ETF
  ('55b2f572-bf8b-44ee-95eb-8cad38d3ae85'::uuid, 'DAX ETF', 'da822982-418c-467f-92eb-bbec62ded97c'::uuid, 6.5::numeric, 0::numeric, 0::numeric, 0::numeric, 1.5::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, NULL::numeric, NULL, NULL::jsonb, '2025-08-14 12:30:00+00'::timestamptz, '2025-08-14 12:30:00+00'::timestamptz),
  -- Portfolio: Berlin Steady Growth Plan > Investment: German Government Bonds
  ('80cb461c-eb54-4630-aedc-67f36aef426f'::uuid, 'German Government Bonds', 'da822982-418c-467f-92eb-bbec62ded97c'::uuid, 3.2::numeric, 0::numeric, 0::numeric, 0::numeric, 0.6::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, NULL::numeric, NULL, NULL::jsonb, '2025-08-14 12:35:00+00'::timestamptz, '2025-08-14 12:35:00+00'::timestamptz),
  -- Portfolio: Berlin Steady Growth Plan > Investment: German Savings Account
  ('f06cf460-8ab7-4449-9223-e6e68bb68749'::uuid, 'German Savings Account', 'da822982-418c-467f-92eb-bbec62ded97c'::uuid, 2.5::numeric, 0::numeric, 0::numeric, 0::numeric, 0.3::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, NULL::numeric, NULL, NULL::jsonb, '2025-08-14 12:40:00+00'::timestamptz, '2025-08-14 12:40:00+00'::timestamptz),
  -- Portfolio: Berlin Steady Growth Plan > Investment: Berlin Real Estate Fund
  ('2c3a4fec-5688-498e-ac86-d95897b417f6'::uuid, 'Berlin Real Estate Fund', 'da822982-418c-467f-92eb-bbec62ded97c'::uuid, 5.8::numeric, 0::numeric, 1::numeric, 0::numeric, 2.2::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, NULL::numeric, NULL, NULL::jsonb, '2025-08-14 12:45:00+00'::timestamptz, '2025-08-14 12:45:00+00'::timestamptz),
  -- Portfolio: Inflation Adjustment Demo Portfolio > Investment: Long-term Investment - No Inflation Adjustment
  ('3d1930a1-6a8b-477c-bfe1-d47298de1d31'::uuid, 'Long-term Investment - No Inflation Adjustment', '69a08c82-6e55-430c-a34f-29f148c3ef73'::uuid, 7.0::numeric, 0::numeric, 0::numeric, 0::numeric, 0.75::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, NULL::numeric, NULL, NULL::jsonb, '2025-08-23 15:10:00+00'::timestamptz, '2025-08-23 15:10:00+00'::timestamptz),
  -- Portfolio: Inflation Adjustment Demo Portfolio > Investment: Long-term Investment - With Inflation Adjustment
  ('f1db911b-6e19-44f9-9b2f-1032c1605ea1'::uuid, 'Long-term Investment - With Inflation Adjustment', '69a08c82-6e55-430c-a34f-29f148c3ef73'::uuid, 7.0::numeric, 0::numeric, 0::numeric, 0::numeric, 0.75::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, NULL::numeric, NULL, NULL::jsonb, '2025-08-23 15:15:00+00'::timestamptz, '2025-08-23 15:15:00+00'::timestamptz),
  -- Portfolio: Zero-Crossing Demonstration Portfolio (+3 Years) > Investment: Moderate Risk Fund
  ('86861f71-3cb0-4f5f-9e09-9f9b62d97e1c'::uuid, 'Moderate Risk Fund', '62376397-44b2-4bc5-ace5-b52c6285f0f3'::uuid, 5.8::numeric, 0::numeric, 0::numeric, 0::numeric, 0.02::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, NULL::numeric, NULL, NULL::jsonb, '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Portfolio: Zero-Crossing Demonstration Portfolio > Investment: Volatile Growth Fund
  ('43573f25-429c-4fb1-9e56-eae8d28b8c22'::uuid, 'Volatile Growth Fund', '2ae6f835-aafd-49c3-a6e8-2cfd2259a757'::uuid, 6.5::numeric, 0::numeric, 0::numeric, 0::numeric, 0.015::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, NULL::numeric, NULL, NULL::jsonb, '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Portfolio: Zero-Crossing Demonstration Portfolio > Investment: Stable Bond Fund
  ('ee2395df-44d9-4b7c-a95a-7b118289b52e'::uuid, 'Stable Bond Fund', '2ae6f835-aafd-49c3-a6e8-2cfd2259a757'::uuid, 4.2::numeric, 0.5::numeric, 0::numeric, 0::numeric, 0.01::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, NULL::numeric, NULL, NULL::jsonb, '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Portfolio: Zero-Crossing Demonstration Portfolio > Investment: Moderate Risk Fund
  ('cbb335fa-ca10-4487-8ce5-7ce71b471600'::uuid, 'Moderate Risk Fund', '2ae6f835-aafd-49c3-a6e8-2cfd2259a757'::uuid, 5.8::numeric, 0::numeric, 0::numeric, 0::numeric, 0.02::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, NULL::numeric, NULL, NULL::jsonb, '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Portfolio: Zero-Crossing Demonstration Portfolio (+3 Years) > Investment: Volatile Growth Fund
  ('6ba2a9ca-dd57-4ba6-bedf-1572a4f7ff0a'::uuid, 'Volatile Growth Fund', '62376397-44b2-4bc5-ace5-b52c6285f0f3'::uuid, 6.5::numeric, 0::numeric, 0::numeric, 0::numeric, 0.015::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, NULL::numeric, NULL, NULL::jsonb, '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Portfolio: Zero-Crossing Demonstration Portfolio (+3 Years) > Investment: Stable Bond Fund
  ('fd7f6875-1903-4af8-9681-bd91dfa12491'::uuid, 'Stable Bond Fund', '62376397-44b2-4bc5-ace5-b52c6285f0f3'::uuid, 4.2::numeric, 0.5::numeric, 0::numeric, 0::numeric, 0.01::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, NULL::numeric, NULL, NULL::jsonb, '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 4. Final > Investment: Evropské akcie
  ('aa462177-142c-4ca7-811e-51dfa3091393'::uuid, 'Evropské akcie', '3477d2b5-4de4-4f6b-95fa-f6c552459061'::uuid, 7.2::numeric, 2.5::numeric, 0::numeric, 0::numeric, 0::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, 1.45::numeric, NULL, NULL::jsonb, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 4. Final > Investment: Americké akcie
  ('34a655e0-c1fd-4389-8870-e385c39e2888'::uuid, 'Americké akcie', '3477d2b5-4de4-4f6b-95fa-f6c552459061'::uuid, 8.68::numeric, 2.5::numeric, 0::numeric, 0::numeric, 0::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, 1.45::numeric, NULL, NULL::jsonb, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 4. Final > Investment: České dluhopisy
  ('6fa291ad-ec8c-455d-9580-aa61037644b4'::uuid, 'České dluhopisy', '3477d2b5-4de4-4f6b-95fa-f6c552459061'::uuid, 3.55::numeric, 1.5::numeric, 0::numeric, 0::numeric, 0::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, 0.95::numeric, NULL, NULL::jsonb, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 4. Final > Investment: Zlato
  ('f3eaa864-ef19-468f-b2b4-118e345eadf2'::uuid, 'Zlato', '3477d2b5-4de4-4f6b-95fa-f6c552459061'::uuid, 5.35::numeric, 1.0::numeric, 0::numeric, 0::numeric, 0::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, 0.7::numeric, NULL, NULL::jsonb, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 1. Goal only > Investment: Retirement Investment
  ('4cebbfa6-d1fe-41e9-bf09-4326acdfd691'::uuid, 'Retirement Investment', '8f2ecd10-9d1c-4bbf-b762-c8522625246c'::uuid, 4.5::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, 0::numeric, NULL, NULL::jsonb, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 2. Single investment > Investment: Evropské akcie
  ('5b84f53c-cf54-4688-813d-26976b70e46a'::uuid, 'Evropské akcie', '7f8b6375-69f6-4e6b-97d3-931814cb6ed4'::uuid, 7.2::numeric, 2.5::numeric, 0::numeric, 0::numeric, 0::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, 1.45::numeric, NULL, NULL::jsonb, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 5. Two Goals > Investment: České dluhopisy
  ('851ed5be-3d1d-43e6-aef9-00b7fbd2d4cb'::uuid, 'České dluhopisy', 'c7e3726c-ea98-4cf4-8f1b-ef3f3faec72d'::uuid, 3.55::numeric, 1.5::numeric, 0::numeric, 0::numeric, 0::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, 0.95::numeric, NULL, NULL::jsonb, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 5. Two Goals > Investment: Zlato
  ('c8210ce5-699c-41da-ba0b-22f63f35033e'::uuid, 'Zlato', 'c7e3726c-ea98-4cf4-8f1b-ef3f3faec72d'::uuid, 5.35::numeric, 1.0::numeric, 0::numeric, 0::numeric, 0::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, 0.7::numeric, NULL, NULL::jsonb, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 3. Equal investments > Investment: Evropské akcie
  ('c9ae320d-5a92-4d62-a81b-c540cd5a6063'::uuid, 'Evropské akcie', 'bae8f1d9-3219-4e6d-92f9-06a2487d2362'::uuid, 7.2::numeric, 2.5::numeric, 0::numeric, 0::numeric, 0::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, 1.45::numeric, NULL, NULL::jsonb, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 3. Equal investments > Investment: Americké akcie
  ('07447227-557a-4f63-81ef-4dc1de963e5a'::uuid, 'Americké akcie', 'bae8f1d9-3219-4e6d-92f9-06a2487d2362'::uuid, 8.68::numeric, 2.5::numeric, 0::numeric, 0::numeric, 0::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, 1.45::numeric, NULL, NULL::jsonb, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 3. Equal investments > Investment: České dluhopisy
  ('e59d7955-d34a-4b98-a987-0ecb9fe7917d'::uuid, 'České dluhopisy', 'bae8f1d9-3219-4e6d-92f9-06a2487d2362'::uuid, 3.55::numeric, 1.5::numeric, 0::numeric, 0::numeric, 0::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, 0.95::numeric, NULL, NULL::jsonb, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 3. Equal investments > Investment: Zlato
  ('78de3401-332c-4de5-bd8a-bb90459d690a'::uuid, 'Zlato', 'bae8f1d9-3219-4e6d-92f9-06a2487d2362'::uuid, 5.35::numeric, 1.0::numeric, 0::numeric, 0::numeric, 0::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, 0.7::numeric, NULL, NULL::jsonb, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 5. Two Goals > Investment: Evropské akcie
  ('69ea7430-5228-4fa5-b747-dbb693b79a04'::uuid, 'Evropské akcie', 'c7e3726c-ea98-4cf4-8f1b-ef3f3faec72d'::uuid, 7.2::numeric, 2.5::numeric, 0::numeric, 0::numeric, 0::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, 1.45::numeric, NULL, NULL::jsonb, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 5. Two Goals > Investment: Americké akcie
  ('d724afaf-02eb-4579-b021-20973945693f'::uuid, 'Americké akcie', 'c7e3726c-ea98-4cf4-8f1b-ef3f3faec72d'::uuid, 8.68::numeric, 2.5::numeric, 0::numeric, 0::numeric, 0::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, 1.45::numeric, NULL, NULL::jsonb, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Investment only portfolio > Investment: Global ETF Portfolio
  ('bdbd25df-15eb-4dce-80b8-058375893919'::uuid, 'Global ETF Portfolio', '3880d6d7-8fa8-4a63-9eda-80cbce223958'::uuid, 7.5::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, NULL::numeric, NULL, NULL::jsonb, '2025-10-30 10:00:00+00'::timestamptz, '2025-10-30 10:00:00+00'::timestamptz),
  -- Portfolio: Single goal portfolio > Investment: Retirement Goal
  ('25c02429-f978-4787-b538-fadc7513adbb'::uuid, 'Retirement Goal', 'd1f774b1-2a95-46c9-a0de-971d1096db31'::uuid, 5.5::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 'percentage', 'percentage', 'ongoing', false::boolean, NULL::numeric, NULL, '{"apy": 5.5, "type": "retirement", "inflation": 2.5, "budgetPeriod": "month", "depositStart": "2025-01-01", "depositPeriod": "month", "desiredBudget": 20000, "currentSavings": 350000, "retirementStart": "2050-03-15", "retirementLength": 20}'::jsonb, '2025-10-30 11:00:00+00'::timestamptz, '2025-10-30 11:00:00+00'::timestamptz);

-- ============================================================================
-- Transactions
-- ============================================================================
INSERT INTO public.transaction (
  id, investment_id, type, amount, date, end_date, label, repeat, repeat_unit,
  inflation_adjusted, created_at, last_edited_at
) VALUES
  -- Portfolio: Sensible investing > Investment: S&P > Transaction: Initial
  ('a04876b4-7fa1-406c-bab0-cc9171f7e3aa'::uuid, '0cdbcad5-11dd-42ec-83ff-0fe0e857f38d'::uuid, 'deposit', 100000::numeric, '1997-11-09 00:00:00+00'::timestamptz, NULL::timestamptz, 'Initial', NULL::bigint, NULL, false::boolean, '2024-11-26 14:33:47.871286+00'::timestamptz, '2024-11-26 14:33:47.871286+00'::timestamptz),
  -- Portfolio: Sensible investing > Investment: S&P > Transaction: Monthly contribution
  ('c3c4f054-8395-4798-871e-17dbc7d488bf'::uuid, '0cdbcad5-11dd-42ec-83ff-0fe0e857f38d'::uuid, 'deposit', 5000::numeric, '1997-12-09 00:00:00+00'::timestamptz, '2027-12-09 00:00:00+00'::timestamptz, 'Monthly contribution', 1::bigint, 'month', false::boolean, '2024-11-26 14:34:23.764254+00'::timestamptz, '2024-11-26 14:34:23.764254+00'::timestamptz),
  -- Portfolio: Sensible investing > Investment: S&P > Transaction: Retirement
  ('74d7bfe6-0b6a-44b2-bbc3-487c78b9367d'::uuid, '0cdbcad5-11dd-42ec-83ff-0fe0e857f38d'::uuid, 'withdrawal', 50000::numeric, '2037-11-09 00:00:00+00'::timestamptz, '2067-11-09 00:00:00+00'::timestamptz, 'Retirement', 1::bigint, 'month', false::boolean, '2024-11-26 14:37:03.608032+00'::timestamptz, '2024-11-26 14:37:03.608032+00'::timestamptz),
  -- Portfolio: FIRE Plan - Retire at 50 > Investment: Total Stock Market ETF > Transaction: Initial Investment
  ('949e1074-ef11-4806-9928-a29355e475a8'::uuid, '2697f8b6-9044-46d8-906f-3e1e011c9593'::uuid, 'deposit', 5000::numeric, '2025-08-14 00:00:00+00'::timestamptz, NULL::timestamptz, 'Initial Investment', NULL::bigint, NULL, false::boolean, '2025-08-14 10:45:00+00'::timestamptz, '2025-08-14 10:45:00+00'::timestamptz),
  -- Portfolio: FIRE Plan - Retire at 50 > Investment: Total Stock Market ETF > Transaction: Monthly Contribution - Pre-House
  ('acd534b5-eec9-4e88-b3bf-72c02fad60fe'::uuid, '2697f8b6-9044-46d8-906f-3e1e011c9593'::uuid, 'deposit', 1500::numeric, '2025-09-14 00:00:00+00'::timestamptz, '2027-12-14 00:00:00+00'::timestamptz, 'Monthly Contribution - Pre-House', 1::bigint, 'month', false::boolean, '2025-08-14 10:50:00+00'::timestamptz, '2025-08-14 10:50:00+00'::timestamptz),
  -- Portfolio: FIRE Plan - Retire at 50 > Investment: Total Stock Market ETF > Transaction: House Down Payment Withdrawal
  ('4965847d-2b51-482b-902f-8ac026ef0548'::uuid, '2697f8b6-9044-46d8-906f-3e1e011c9593'::uuid, 'withdrawal', 60000::numeric, '2028-01-15 00:00:00+00'::timestamptz, NULL::timestamptz, 'House Down Payment Withdrawal', NULL::bigint, NULL, false::boolean, '2025-08-14 10:55:00+00'::timestamptz, '2025-08-14 10:55:00+00'::timestamptz),
  -- Portfolio: FIRE Plan - Retire at 50 > Investment: Bond Index Fund > Transaction: Emergency Fund Start
  ('d99eb6fc-df0b-4fef-840b-a6ba1cb51fc4'::uuid, '89dc158d-d5f5-44c9-9ee3-ef81a851b339'::uuid, 'deposit', 3000::numeric, '2025-08-14 00:00:00+00'::timestamptz, NULL::timestamptz, 'Emergency Fund Start', NULL::bigint, NULL, false::boolean, '2025-08-14 11:00:00+00'::timestamptz, '2025-08-14 11:00:00+00'::timestamptz),
  -- Portfolio: FIRE Plan - Retire at 50 > Investment: Bond Index Fund > Transaction: Monthly Bond Allocation - Conservative Growth
  ('c53483b9-6aad-4bb1-bb4c-688a26fb24f0'::uuid, '89dc158d-d5f5-44c9-9ee3-ef81a851b339'::uuid, 'deposit', 1000::numeric, '2025-09-14 00:00:00+00'::timestamptz, '2043-04-14 00:00:00+00'::timestamptz, 'Monthly Bond Allocation - Conservative Growth', 1::bigint, 'month', false::boolean, '2025-08-14 11:05:00+00'::timestamptz, '2025-08-14 11:05:00+00'::timestamptz),
  -- Portfolio: FIRE Plan - Retire at 50 > Investment: High-Yield Savings > Transaction: Emergency Fund - Liquid Savings
  ('ed2ce294-811c-4996-9bc7-e0e1e9362f22'::uuid, '0c772687-9f3a-4ed5-b7a8-142de7bca89f'::uuid, 'deposit', 1000::numeric, '2025-08-14 00:00:00+00'::timestamptz, NULL::timestamptz, 'Emergency Fund - Liquid Savings', NULL::bigint, NULL, false::boolean, '2025-08-14 11:10:00+00'::timestamptz, '2025-08-14 11:10:00+00'::timestamptz),
  -- Portfolio: FIRE Plan - Retire at 50 > Investment: High-Yield Savings > Transaction: Monthly Emergency Fund Buildup
  ('fd0c2b81-6ae8-44c0-8180-1a269944a576'::uuid, '0c772687-9f3a-4ed5-b7a8-142de7bca89f'::uuid, 'deposit', 500::numeric, '2025-09-14 00:00:00+00'::timestamptz, '2043-04-15 00:00:00+00'::timestamptz, 'Monthly Emergency Fund Buildup', 1::bigint, 'month', false::boolean, '2025-08-14 11:15:00+00'::timestamptz, '2025-08-14 11:15:00+00'::timestamptz),
  -- Portfolio: FIRE Plan - Retire at 50 > Investment: Total Stock Market ETF > Transaction: Early Retirement Withdrawal - Age 50
  ('d04347df-d16b-44da-99a9-8435b055473d'::uuid, '2697f8b6-9044-46d8-906f-3e1e011c9593'::uuid, 'withdrawal', 4500::numeric, '2043-05-15 00:00:00+00'::timestamptz, '2083-04-15 00:00:00+00'::timestamptz, 'Early Retirement Withdrawal - Age 50', 1::bigint, 'month', false::boolean, '2025-08-14 11:20:00+00'::timestamptz, '2025-08-14 11:20:00+00'::timestamptz),
  -- Portfolio: FIRE Plan - Retire at 50 > Investment: Total Stock Market ETF > Transaction: Monthly Contribution - FIRE Phase
  ('d130132a-eb25-42c9-a04b-41df18be8b94'::uuid, '2697f8b6-9044-46d8-906f-3e1e011c9593'::uuid, 'deposit', 3000::numeric, '2028-02-14 00:00:00+00'::timestamptz, '2043-04-14 00:00:00+00'::timestamptz, 'Monthly Contribution - FIRE Phase', 1::bigint, 'month', false::boolean, '2025-08-14 11:25:00+00'::timestamptz, '2025-08-14 11:25:00+00'::timestamptz),
  -- Portfolio: Berlin Steady Growth Plan > Investment: DAX ETF > Transaction: Initial DAX Investment
  ('cbc0e88e-3996-479f-be49-1e76369db980'::uuid, '55b2f572-bf8b-44ee-95eb-8cad38d3ae85'::uuid, 'deposit', 10000::numeric, '2025-08-14 00:00:00+00'::timestamptz, NULL::timestamptz, 'Initial DAX Investment', NULL::bigint, NULL, false::boolean, '2025-08-14 13:00:00+00'::timestamptz, '2025-08-14 13:00:00+00'::timestamptz),
  -- Portfolio: Berlin Steady Growth Plan > Investment: DAX ETF > Transaction: Monthly DAX Accumulation
  ('bd8a07c3-8377-4e9c-9d42-b7ce6ca1aabd'::uuid, '55b2f572-bf8b-44ee-95eb-8cad38d3ae85'::uuid, 'deposit', 1500::numeric, '2025-09-14 00:00:00+00'::timestamptz, '2030-05-14 00:00:00+00'::timestamptz, 'Monthly DAX Accumulation', 1::bigint, 'month', false::boolean, '2025-08-14 13:05:00+00'::timestamptz, '2025-08-14 13:05:00+00'::timestamptz),
  -- Portfolio: Berlin Steady Growth Plan > Investment: DAX ETF > Transaction: Berlin Apartment Down Payment
  ('b39ad906-b325-4ac0-83a7-308ed4cc0606'::uuid, '55b2f572-bf8b-44ee-95eb-8cad38d3ae85'::uuid, 'withdrawal', 40000::numeric, '2030-06-15 00:00:00+00'::timestamptz, NULL::timestamptz, 'Berlin Apartment Down Payment', NULL::bigint, NULL, false::boolean, '2025-08-14 13:10:00+00'::timestamptz, '2025-08-14 13:10:00+00'::timestamptz),
  -- Portfolio: Berlin Steady Growth Plan > Investment: DAX ETF > Transaction: Post-Purchase Growth Phase
  ('419c7ded-3288-4bbf-ac65-acddb005ef82'::uuid, '55b2f572-bf8b-44ee-95eb-8cad38d3ae85'::uuid, 'deposit', 2000::numeric, '2030-07-14 00:00:00+00'::timestamptz, '2040-06-14 00:00:00+00'::timestamptz, 'Post-Purchase Growth Phase', 1::bigint, 'month', false::boolean, '2025-08-14 13:15:00+00'::timestamptz, '2025-08-14 13:15:00+00'::timestamptz),
  -- Portfolio: Berlin Steady Growth Plan > Investment: German Government Bonds > Transaction: German Bond Foundation
  ('b3d88bc4-3584-4d48-aab5-b571e533d2ab'::uuid, '80cb461c-eb54-4630-aedc-67f36aef426f'::uuid, 'deposit', 8000::numeric, '2025-08-14 00:00:00+00'::timestamptz, NULL::timestamptz, 'German Bond Foundation', NULL::bigint, NULL, false::boolean, '2025-08-14 13:20:00+00'::timestamptz, '2025-08-14 13:20:00+00'::timestamptz),
  -- Portfolio: Berlin Steady Growth Plan > Investment: German Government Bonds > Transaction: Monthly Bond Allocation
  ('3a300010-1400-417d-9f0a-c43bdf2093de'::uuid, '80cb461c-eb54-4630-aedc-67f36aef426f'::uuid, 'deposit', 700::numeric, '2025-09-14 00:00:00+00'::timestamptz, '2050-06-12 00:00:00+00'::timestamptz, 'Monthly Bond Allocation', 1::bigint, 'month', false::boolean, '2025-08-14 13:25:00+00'::timestamptz, '2025-08-14 13:25:00+00'::timestamptz),
  -- Portfolio: Berlin Steady Growth Plan > Investment: German Savings Account > Transaction: Emergency Fund Setup
  ('1661ec8b-ba61-4a67-9316-b3b589c8ce26'::uuid, 'f06cf460-8ab7-4449-9223-e6e68bb68749'::uuid, 'deposit', 5000::numeric, '2025-08-14 00:00:00+00'::timestamptz, NULL::timestamptz, 'Emergency Fund Setup', NULL::bigint, NULL, false::boolean, '2025-08-14 13:30:00+00'::timestamptz, '2025-08-14 13:30:00+00'::timestamptz),
  -- Portfolio: Berlin Steady Growth Plan > Investment: German Savings Account > Transaction: Monthly Emergency Fund
  ('2312f0af-ba23-4a5d-aa81-9b62a34d7b07'::uuid, 'f06cf460-8ab7-4449-9223-e6e68bb68749'::uuid, 'deposit', 600::numeric, '2025-09-14 00:00:00+00'::timestamptz, '2035-06-14 00:00:00+00'::timestamptz, 'Monthly Emergency Fund', 1::bigint, 'month', false::boolean, '2025-08-14 13:35:00+00'::timestamptz, '2025-08-14 13:35:00+00'::timestamptz),
  -- Portfolio: Berlin Steady Growth Plan > Investment: Berlin Real Estate Fund > Transaction: Berlin Real Estate Initial
  ('c7b32097-c2fa-41cd-94e9-ec37188f7718'::uuid, '2c3a4fec-5688-498e-ac86-d95897b417f6'::uuid, 'deposit', 6000::numeric, '2028-01-15 00:00:00+00'::timestamptz, NULL::timestamptz, 'Berlin Real Estate Initial', NULL::bigint, NULL, false::boolean, '2025-08-14 13:40:00+00'::timestamptz, '2025-08-14 13:40:00+00'::timestamptz),
  -- Portfolio: Berlin Steady Growth Plan > Investment: Berlin Real Estate Fund > Transaction: Monthly Real Estate Investment
  ('260cefaf-b483-422c-b66c-3697be603dcc'::uuid, '2c3a4fec-5688-498e-ac86-d95897b417f6'::uuid, 'deposit', 800::numeric, '2028-02-14 00:00:00+00'::timestamptz, '2048-06-14 00:00:00+00'::timestamptz, 'Monthly Real Estate Investment', 1::bigint, 'month', false::boolean, '2025-08-14 13:45:00+00'::timestamptz, '2025-08-14 13:45:00+00'::timestamptz),
  -- Portfolio: Berlin Steady Growth Plan > Investment: DAX ETF > Transaction: Child Education Fund - Berlin
  ('3779f2ca-fb6b-4776-8438-3a018917378b'::uuid, '55b2f572-bf8b-44ee-95eb-8cad38d3ae85'::uuid, 'withdrawal', 30000::numeric, '2033-01-15 00:00:00+00'::timestamptz, NULL::timestamptz, 'Child Education Fund - Berlin', NULL::bigint, NULL, false::boolean, '2025-08-14 13:50:00+00'::timestamptz, '2025-08-14 13:50:00+00'::timestamptz),
  -- Portfolio: Berlin Steady Growth Plan > Investment: DAX ETF > Transaction: German Retirement Income
  ('666c4b22-b209-4088-843f-8d9a6dd879ab'::uuid, '55b2f572-bf8b-44ee-95eb-8cad38d3ae85'::uuid, 'withdrawal', 3200::numeric, '2050-07-12 00:00:00+00'::timestamptz, '2080-06-12 00:00:00+00'::timestamptz, 'German Retirement Income', 1::bigint, 'month', false::boolean, '2025-08-14 13:55:00+00'::timestamptz, '2025-08-14 13:55:00+00'::timestamptz),
  -- Portfolio: Inflation Adjustment Demo Portfolio > Investment: Long-term Investment - No Inflation Adjustment > Transaction: Initial Investment
  ('79c05e2e-2f45-4879-b86e-e09f780ba104'::uuid, '3d1930a1-6a8b-477c-bfe1-d47298de1d31'::uuid, 'deposit', 50000::numeric, '2024-01-01 00:00:00+00'::timestamptz, NULL::timestamptz, 'Initial Investment', NULL::bigint, NULL, false::boolean, '2025-08-23 15:20:00+00'::timestamptz, '2025-08-23 15:20:00+00'::timestamptz),
  -- Portfolio: Inflation Adjustment Demo Portfolio > Investment: Long-term Investment - With Inflation Adjustment > Transaction: Initial Investment
  ('0b3e9644-f14f-4583-bcd4-738b7fbcb1d5'::uuid, 'f1db911b-6e19-44f9-9b2f-1032c1605ea1'::uuid, 'deposit', 50000::numeric, '2024-01-01 00:00:00+00'::timestamptz, NULL::timestamptz, 'Initial Investment', NULL::bigint, NULL, true::boolean, '2025-08-23 15:20:00+00'::timestamptz, '2025-08-23 15:20:00+00'::timestamptz),
  -- Portfolio: Inflation Adjustment Demo Portfolio > Investment: Long-term Investment - No Inflation Adjustment > Transaction: Monthly Contributions - Accumulation Phase
  ('357ab3e7-d597-479b-9f16-1535a90f8b18'::uuid, '3d1930a1-6a8b-477c-bfe1-d47298de1d31'::uuid, 'deposit', 2000::numeric, '2024-02-01 00:00:00+00'::timestamptz, '2034-01-01 00:00:00+00'::timestamptz, 'Monthly Contributions - Accumulation Phase', 1::bigint, 'month', false::boolean, '2025-08-23 15:25:00+00'::timestamptz, '2025-08-23 15:25:00+00'::timestamptz),
  -- Portfolio: Inflation Adjustment Demo Portfolio > Investment: Long-term Investment - With Inflation Adjustment > Transaction: Monthly Contributions - Accumulation Phase
  ('b3d64b35-6b95-42af-83d4-75d1b9d8ec08'::uuid, 'f1db911b-6e19-44f9-9b2f-1032c1605ea1'::uuid, 'deposit', 2000::numeric, '2024-02-01 00:00:00+00'::timestamptz, '2034-01-01 00:00:00+00'::timestamptz, 'Monthly Contributions - Accumulation Phase', 1::bigint, 'month', true::boolean, '2025-08-23 15:25:00+00'::timestamptz, '2025-08-23 15:25:00+00'::timestamptz),
  -- Portfolio: Inflation Adjustment Demo Portfolio > Investment: Long-term Investment - No Inflation Adjustment > Transaction: Mid-Career Bonus Investment
  ('373f8423-3347-41a4-b4e1-f467607e619d'::uuid, '3d1930a1-6a8b-477c-bfe1-d47298de1d31'::uuid, 'deposit', 25000::numeric, '2029-01-01 00:00:00+00'::timestamptz, NULL::timestamptz, 'Mid-Career Bonus Investment', NULL::bigint, NULL, false::boolean, '2025-08-23 15:30:00+00'::timestamptz, '2025-08-23 15:30:00+00'::timestamptz),
  -- Portfolio: Inflation Adjustment Demo Portfolio > Investment: Long-term Investment - With Inflation Adjustment > Transaction: Mid-Career Bonus Investment
  ('437fb99a-6dfa-4410-abb1-571ff429322c'::uuid, 'f1db911b-6e19-44f9-9b2f-1032c1605ea1'::uuid, 'deposit', 25000::numeric, '2029-01-01 00:00:00+00'::timestamptz, NULL::timestamptz, 'Mid-Career Bonus Investment', NULL::bigint, NULL, true::boolean, '2025-08-23 15:30:00+00'::timestamptz, '2025-08-23 15:30:00+00'::timestamptz),
  -- Portfolio: Inflation Adjustment Demo Portfolio > Investment: Long-term Investment - No Inflation Adjustment > Transaction: Emergency Fund Withdrawal
  ('091ef319-88ea-4cd2-9900-f9c877699f33'::uuid, '3d1930a1-6a8b-477c-bfe1-d47298de1d31'::uuid, 'withdrawal', 15000::numeric, '2032-06-15 00:00:00+00'::timestamptz, NULL::timestamptz, 'Emergency Fund Withdrawal', NULL::bigint, NULL, false::boolean, '2025-08-23 15:35:00+00'::timestamptz, '2025-08-23 15:35:00+00'::timestamptz),
  -- Portfolio: Inflation Adjustment Demo Portfolio > Investment: Long-term Investment - With Inflation Adjustment > Transaction: Emergency Fund Withdrawal
  ('fbfb8088-3d5f-42d9-9ead-294031f752d0'::uuid, 'f1db911b-6e19-44f9-9b2f-1032c1605ea1'::uuid, 'withdrawal', 15000::numeric, '2032-06-15 00:00:00+00'::timestamptz, NULL::timestamptz, 'Emergency Fund Withdrawal', NULL::bigint, NULL, true::boolean, '2025-08-23 15:35:00+00'::timestamptz, '2025-08-23 15:35:00+00'::timestamptz),
  -- Portfolio: Inflation Adjustment Demo Portfolio > Investment: Long-term Investment - No Inflation Adjustment > Transaction: Monthly Retirement Income
  ('a343325f-825f-4082-9ea1-a38d7d3256f6'::uuid, '3d1930a1-6a8b-477c-bfe1-d47298de1d31'::uuid, 'withdrawal', 2000::numeric, '2034-02-01 00:00:00+00'::timestamptz, '2044-01-01 00:00:00+00'::timestamptz, 'Monthly Retirement Income', 1::bigint, 'month', false::boolean, '2025-08-23 15:40:00+00'::timestamptz, '2025-08-23 15:40:00+00'::timestamptz),
  -- Portfolio: Inflation Adjustment Demo Portfolio > Investment: Long-term Investment - With Inflation Adjustment > Transaction: Monthly Retirement Income
  ('127673ce-1caf-4f74-94e1-9b34f4d6db97'::uuid, 'f1db911b-6e19-44f9-9b2f-1032c1605ea1'::uuid, 'withdrawal', 2000::numeric, '2034-02-01 00:00:00+00'::timestamptz, '2044-01-01 00:00:00+00'::timestamptz, 'Monthly Retirement Income', 1::bigint, 'month', true::boolean, '2025-08-23 15:40:00+00'::timestamptz, '2025-08-23 15:40:00+00'::timestamptz),
  -- Portfolio: Inflation Adjustment Demo Portfolio > Investment: Long-term Investment - No Inflation Adjustment > Transaction: Major Retirement Expense (House/Travel)
  ('e9f21a4e-3366-4cff-8c30-73ee614fb4bf'::uuid, '3d1930a1-6a8b-477c-bfe1-d47298de1d31'::uuid, 'withdrawal', 100000::numeric, '2039-01-01 00:00:00+00'::timestamptz, NULL::timestamptz, 'Major Retirement Expense (House/Travel)', NULL::bigint, NULL, false::boolean, '2025-08-23 15:45:00+00'::timestamptz, '2025-08-23 15:45:00+00'::timestamptz),
  -- Portfolio: Inflation Adjustment Demo Portfolio > Investment: Long-term Investment - With Inflation Adjustment > Transaction: Major Retirement Expense (House/Travel)
  ('a97a9710-d667-4b0e-a0bc-09a6873ff2e5'::uuid, 'f1db911b-6e19-44f9-9b2f-1032c1605ea1'::uuid, 'withdrawal', 100000::numeric, '2039-01-01 00:00:00+00'::timestamptz, NULL::timestamptz, 'Major Retirement Expense (House/Travel)', NULL::bigint, NULL, true::boolean, '2025-08-23 15:45:00+00'::timestamptz, '2025-08-23 15:45:00+00'::timestamptz),
  -- Portfolio: Zero-Crossing Demonstration Portfolio > Investment: Stable Bond Fund > Transaction: Moderate withdrawal
  ('11e4e63b-3b67-46d4-bde6-c6a5b661e405'::uuid, 'ee2395df-44d9-4b7c-a95a-7b118289b52e'::uuid, 'withdrawal', 15000::numeric, '2024-08-15 00:00:00+00'::timestamptz, NULL::timestamptz, 'Moderate withdrawal', NULL::bigint, NULL, false::boolean, '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Portfolio: Zero-Crossing Demonstration Portfolio > Investment: Volatile Growth Fund > Transaction: Initial Investment
  ('6ebd5a9d-e23f-4389-b014-8cdde1f73afb'::uuid, '43573f25-429c-4fb1-9e56-eae8d28b8c22'::uuid, 'deposit', 50000::numeric, '2023-01-01 00:00:00+00'::timestamptz, NULL::timestamptz, 'Initial Investment', NULL::bigint, NULL, false::boolean, '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Portfolio: Zero-Crossing Demonstration Portfolio > Investment: Volatile Growth Fund > Transaction: Monthly contributions
  ('f79a745b-7318-43ab-8c35-32ae9a440b9d'::uuid, '43573f25-429c-4fb1-9e56-eae8d28b8c22'::uuid, 'deposit', 5000::numeric, '2023-02-01 00:00:00+00'::timestamptz, '2024-07-01 00:00:00+00'::timestamptz, 'Monthly contributions', 1::bigint, 'month', false::boolean, '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Portfolio: Zero-Crossing Demonstration Portfolio > Investment: Volatile Growth Fund > Transaction: Emergency withdrawal
  ('2a24518a-c55d-40bf-8e3a-123bc64c5681'::uuid, '43573f25-429c-4fb1-9e56-eae8d28b8c22'::uuid, 'withdrawal', 200000::numeric, '2024-08-15 00:00:00+00'::timestamptz, NULL::timestamptz, 'Emergency withdrawal', NULL::bigint, NULL, false::boolean, '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Portfolio: Zero-Crossing Demonstration Portfolio > Investment: Volatile Growth Fund > Transaction: Recovery contributions
  ('b75d1166-1c73-4831-ae1c-3793d84491c5'::uuid, '43573f25-429c-4fb1-9e56-eae8d28b8c22'::uuid, 'deposit', 8000::numeric, '2024-09-01 00:00:00+00'::timestamptz, '2027-12-01 00:00:00+00'::timestamptz, 'Recovery contributions', 1::bigint, 'month', false::boolean, '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Portfolio: Zero-Crossing Demonstration Portfolio > Investment: Stable Bond Fund > Transaction: Initial Conservative Investment
  ('3176d17a-4b98-4466-8d9c-d993f277626f'::uuid, 'ee2395df-44d9-4b7c-a95a-7b118289b52e'::uuid, 'deposit', 25000::numeric, '2023-01-01 00:00:00+00'::timestamptz, NULL::timestamptz, 'Initial Conservative Investment', NULL::bigint, NULL, false::boolean, '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Portfolio: Zero-Crossing Demonstration Portfolio > Investment: Stable Bond Fund > Transaction: Monthly conservative contributions
  ('6ebdbecb-a855-4f08-9fe4-e2e7c2d26d7d'::uuid, 'ee2395df-44d9-4b7c-a95a-7b118289b52e'::uuid, 'deposit', 2000::numeric, '2023-02-01 00:00:00+00'::timestamptz, '2027-12-01 00:00:00+00'::timestamptz, 'Monthly conservative contributions', 1::bigint, 'month', false::boolean, '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Portfolio: Zero-Crossing Demonstration Portfolio > Investment: Stable Bond Fund > Transaction: Planned withdrawal
  ('a0d18590-cc9f-416d-956c-ee46f2eb7ba5'::uuid, 'ee2395df-44d9-4b7c-a95a-7b118289b52e'::uuid, 'withdrawal', 10000::numeric, '2025-03-01 00:00:00+00'::timestamptz, NULL::timestamptz, 'Planned withdrawal', NULL::bigint, NULL, false::boolean, '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Portfolio: Zero-Crossing Demonstration Portfolio > Investment: Moderate Risk Fund > Transaction: Initial Moderate Investment
  ('3a16a7e1-298e-43d7-9843-115ba4bcd0ee'::uuid, 'cbb335fa-ca10-4487-8ce5-7ce71b471600'::uuid, 'deposit', 40000::numeric, '2023-01-01 00:00:00+00'::timestamptz, NULL::timestamptz, 'Initial Moderate Investment', NULL::bigint, NULL, false::boolean, '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Portfolio: Zero-Crossing Demonstration Portfolio > Investment: Moderate Risk Fund > Transaction: Extended monthly contributions
  ('d9029190-efea-4202-8b4c-1414ecddb237'::uuid, 'cbb335fa-ca10-4487-8ce5-7ce71b471600'::uuid, 'deposit', 3000::numeric, '2023-02-01 00:00:00+00'::timestamptz, '2025-07-01 00:00:00+00'::timestamptz, 'Extended monthly contributions', 1::bigint, 'month', false::boolean, '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Portfolio: Zero-Crossing Demonstration Portfolio > Investment: Moderate Risk Fund > Transaction: Major expense - fund exhaustion
  ('8b884452-89d1-454f-b6c8-f2c3fc5c093c'::uuid, 'cbb335fa-ca10-4487-8ce5-7ce71b471600'::uuid, 'withdrawal', 150000::numeric, '2025-08-15 00:00:00+00'::timestamptz, NULL::timestamptz, 'Major expense - fund exhaustion', NULL::bigint, NULL, false::boolean, '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Portfolio: Zero-Crossing Demonstration Portfolio > Investment: Moderate Risk Fund > Transaction: Recovery attempts after exhaustion
  ('aace804b-416f-4f33-af18-9de597aed738'::uuid, 'cbb335fa-ca10-4487-8ce5-7ce71b471600'::uuid, 'deposit', 4000::numeric, '2025-09-01 00:00:00+00'::timestamptz, '2027-12-01 00:00:00+00'::timestamptz, 'Recovery attempts after exhaustion', 1::bigint, 'month', false::boolean, '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Portfolio: Zero-Crossing Demonstration Portfolio (+3 Years) > Investment: Volatile Growth Fund > Transaction: Initial Investment
  ('2793ecb0-dcae-42c3-940e-8dc565ac421c'::uuid, '6ba2a9ca-dd57-4ba6-bedf-1572a4f7ff0a'::uuid, 'deposit', 50000::numeric, '2023-01-01 00:00:00+00'::timestamptz, NULL::timestamptz, 'Initial Investment', NULL::bigint, NULL, false::boolean, '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Portfolio: Zero-Crossing Demonstration Portfolio (+3 Years) > Investment: Volatile Growth Fund > Transaction: Monthly contributions
  ('1af47840-32e8-484f-9e06-d254acb5b7be'::uuid, '6ba2a9ca-dd57-4ba6-bedf-1572a4f7ff0a'::uuid, 'deposit', 5000::numeric, '2023-02-01 00:00:00+00'::timestamptz, '2024-07-01 00:00:00+00'::timestamptz, 'Monthly contributions', 1::bigint, 'month', false::boolean, '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Portfolio: Zero-Crossing Demonstration Portfolio (+3 Years) > Investment: Volatile Growth Fund > Transaction: Emergency withdrawal
  ('25d6918f-2a55-42d1-9c17-b8e6c8d7477c'::uuid, '6ba2a9ca-dd57-4ba6-bedf-1572a4f7ff0a'::uuid, 'withdrawal', 200000::numeric, '2024-08-15 00:00:00+00'::timestamptz, NULL::timestamptz, 'Emergency withdrawal', NULL::bigint, NULL, false::boolean, '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Portfolio: Zero-Crossing Demonstration Portfolio (+3 Years) > Investment: Volatile Growth Fund > Transaction: Recovery contributions
  ('acab4184-e809-4030-950a-277a059e48f3'::uuid, '6ba2a9ca-dd57-4ba6-bedf-1572a4f7ff0a'::uuid, 'deposit', 8000::numeric, '2024-09-01 00:00:00+00'::timestamptz, '2027-12-01 00:00:00+00'::timestamptz, 'Recovery contributions', 1::bigint, 'month', false::boolean, '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Portfolio: Zero-Crossing Demonstration Portfolio (+3 Years) > Investment: Stable Bond Fund > Transaction: Initial Conservative Investment
  ('6f15cb38-d97d-4beb-8a8d-e83bcfa9624a'::uuid, 'fd7f6875-1903-4af8-9681-bd91dfa12491'::uuid, 'deposit', 25000::numeric, '2023-01-01 00:00:00+00'::timestamptz, NULL::timestamptz, 'Initial Conservative Investment', NULL::bigint, NULL, false::boolean, '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Portfolio: Zero-Crossing Demonstration Portfolio (+3 Years) > Investment: Stable Bond Fund > Transaction: Monthly conservative contributions
  ('9ca29f4d-4dfa-4df6-b6a9-5660dcfd5690'::uuid, 'fd7f6875-1903-4af8-9681-bd91dfa12491'::uuid, 'deposit', 2000::numeric, '2023-02-01 00:00:00+00'::timestamptz, '2027-12-01 00:00:00+00'::timestamptz, 'Monthly conservative contributions', 1::bigint, 'month', false::boolean, '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Portfolio: Zero-Crossing Demonstration Portfolio (+3 Years) > Investment: Stable Bond Fund > Transaction: Moderate withdrawal
  ('7f68fad9-94e8-4698-963a-a0456a06409c'::uuid, 'fd7f6875-1903-4af8-9681-bd91dfa12491'::uuid, 'withdrawal', 15000::numeric, '2024-08-15 00:00:00+00'::timestamptz, NULL::timestamptz, 'Moderate withdrawal', NULL::bigint, NULL, false::boolean, '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Portfolio: Zero-Crossing Demonstration Portfolio (+3 Years) > Investment: Stable Bond Fund > Transaction: Planned withdrawal
  ('4a5d0389-16a9-4b90-9a7c-d136aeae6586'::uuid, 'fd7f6875-1903-4af8-9681-bd91dfa12491'::uuid, 'withdrawal', 10000::numeric, '2025-03-01 00:00:00+00'::timestamptz, NULL::timestamptz, 'Planned withdrawal', NULL::bigint, NULL, false::boolean, '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Portfolio: Zero-Crossing Demonstration Portfolio (+3 Years) > Investment: Moderate Risk Fund > Transaction: Initial Moderate Investment
  ('2a5be096-d9a6-4d58-94f1-dc50ca5472a3'::uuid, '86861f71-3cb0-4f5f-9e09-9f9b62d97e1c'::uuid, 'deposit', 40000::numeric, '2023-01-01 00:00:00+00'::timestamptz, NULL::timestamptz, 'Initial Moderate Investment', NULL::bigint, NULL, false::boolean, '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Portfolio: Zero-Crossing Demonstration Portfolio (+3 Years) > Investment: Moderate Risk Fund > Transaction: Extended monthly contributions
  ('86366e3a-e3a0-4e5d-aaea-143d5e84530d'::uuid, '86861f71-3cb0-4f5f-9e09-9f9b62d97e1c'::uuid, 'deposit', 3000::numeric, '2023-02-01 00:00:00+00'::timestamptz, '2025-07-01 00:00:00+00'::timestamptz, 'Extended monthly contributions', 1::bigint, 'month', false::boolean, '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Portfolio: Zero-Crossing Demonstration Portfolio (+3 Years) > Investment: Moderate Risk Fund > Transaction: Major expense - fund exhaustion
  ('9b9b54b8-d8f5-4122-a325-91226382a4af'::uuid, '86861f71-3cb0-4f5f-9e09-9f9b62d97e1c'::uuid, 'withdrawal', 150000::numeric, '2025-08-15 00:00:00+00'::timestamptz, NULL::timestamptz, 'Major expense - fund exhaustion', NULL::bigint, NULL, false::boolean, '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Portfolio: Zero-Crossing Demonstration Portfolio (+3 Years) > Investment: Moderate Risk Fund > Transaction: Recovery attempts after exhaustion
  ('84257481-6c28-405a-8df6-76f542d0274c'::uuid, '86861f71-3cb0-4f5f-9e09-9f9b62d97e1c'::uuid, 'deposit', 4000::numeric, '2025-09-01 00:00:00+00'::timestamptz, '2027-12-01 00:00:00+00'::timestamptz, 'Recovery attempts after exhaustion', 1::bigint, 'month', false::boolean, '2025-09-24 12:00:00+00'::timestamptz, '2025-09-24 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 4. Final > Investment: Evropské akcie > Transaction: Initial Investment
  ('e4bf678c-b302-4e39-8c42-515cd9bb30af'::uuid, 'aa462177-142c-4ca7-811e-51dfa3091393'::uuid, 'deposit', 1688.7::numeric, '2025-01-01 00:00:00+00'::timestamptz, NULL::timestamptz, 'Initial Investment', NULL::bigint, NULL, true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 4. Final > Investment: Evropské akcie > Transaction: Monthly Contribution
  ('f68200c4-4720-49f9-87e0-2b2555fa5c65'::uuid, 'aa462177-142c-4ca7-811e-51dfa3091393'::uuid, 'deposit', 27.03::numeric, '2025-02-01 00:00:00+00'::timestamptz, '2045-02-01 00:00:00+00'::timestamptz, 'Monthly Contribution', 1::bigint, 'month', true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 4. Final > Investment: Evropské akcie > Transaction: Monthly Retirement Withdrawal
  ('d8535109-c48a-4c20-ab90-002efafbaee7'::uuid, 'aa462177-142c-4ca7-811e-51dfa3091393'::uuid, 'withdrawal', 62.5::numeric, '2045-03-01 00:00:00+00'::timestamptz, '2065-02-28 00:00:00+00'::timestamptz, 'Monthly Retirement Withdrawal', 1::bigint, 'month', true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 4. Final > Investment: Americké akcie > Transaction: Initial Investment
  ('f68c5837-be25-4c94-aa6d-50f357695829'::uuid, '34a655e0-c1fd-4389-8870-e385c39e2888'::uuid, 'deposit', 2701.92::numeric, '2025-01-01 00:00:00+00'::timestamptz, NULL::timestamptz, 'Initial Investment', NULL::bigint, NULL, true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 4. Final > Investment: Americké akcie > Transaction: Monthly Contribution
  ('499f6f72-3c13-4408-8728-81c712fc4aa5'::uuid, '34a655e0-c1fd-4389-8870-e385c39e2888'::uuid, 'deposit', 43.25::numeric, '2025-02-01 00:00:00+00'::timestamptz, '2045-02-01 00:00:00+00'::timestamptz, 'Monthly Contribution', 1::bigint, 'month', true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 4. Final > Investment: Americké akcie > Transaction: Monthly Retirement Withdrawal
  ('6f077bd0-c70a-4271-8e8d-769a16019917'::uuid, '34a655e0-c1fd-4389-8870-e385c39e2888'::uuid, 'withdrawal', 140::numeric, '2045-03-01 00:00:00+00'::timestamptz, '2065-02-28 00:00:00+00'::timestamptz, 'Monthly Retirement Withdrawal', 1::bigint, 'month', true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 4. Final > Investment: České dluhopisy > Transaction: Initial Investment
  ('796c542e-3457-4bba-9270-80352e4f391d'::uuid, '6fa291ad-ec8c-455d-9580-aa61037644b4'::uuid, 'deposit', 5741.58::numeric, '2025-01-01 00:00:00+00'::timestamptz, NULL::timestamptz, 'Initial Investment', NULL::bigint, NULL, true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 4. Final > Investment: České dluhopisy > Transaction: Monthly Contribution
  ('753c166c-be8e-4273-9cc5-04e3a6e2fd22'::uuid, '6fa291ad-ec8c-455d-9580-aa61037644b4'::uuid, 'deposit', 91.91::numeric, '2025-02-01 00:00:00+00'::timestamptz, '2045-02-01 00:00:00+00'::timestamptz, 'Monthly Contribution', 1::bigint, 'month', true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 4. Final > Investment: České dluhopisy > Transaction: Monthly Retirement Withdrawal
  ('80aadaa1-421e-4885-9279-6f2701967285'::uuid, '6fa291ad-ec8c-455d-9580-aa61037644b4'::uuid, 'withdrawal', 112.5::numeric, '2045-03-01 00:00:00+00'::timestamptz, '2065-02-28 00:00:00+00'::timestamptz, 'Monthly Retirement Withdrawal', 1::bigint, 'month', true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 4. Final > Investment: Zlato > Transaction: Initial Investment
  ('8d2f8d12-fee2-49d7-8774-09b111797937'::uuid, 'f3eaa864-ef19-468f-b2b4-118e345eadf2'::uuid, 'deposit', 1125.8::numeric, '2025-01-01 00:00:00+00'::timestamptz, NULL::timestamptz, 'Initial Investment', NULL::bigint, NULL, true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 4. Final > Investment: Zlato > Transaction: Monthly Contribution
  ('d11f2c21-5d45-468f-ab9f-bf8c2009c392'::uuid, 'f3eaa864-ef19-468f-b2b4-118e345eadf2'::uuid, 'deposit', 18.02::numeric, '2025-02-01 00:00:00+00'::timestamptz, '2045-02-01 00:00:00+00'::timestamptz, 'Monthly Contribution', 1::bigint, 'month', true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 4. Final > Investment: Zlato > Transaction: Monthly Retirement Withdrawal
  ('ccb7e96b-8836-4d7c-ae43-87fb1d6a4471'::uuid, 'f3eaa864-ef19-468f-b2b4-118e345eadf2'::uuid, 'withdrawal', 35::numeric, '2045-03-01 00:00:00+00'::timestamptz, '2065-02-28 00:00:00+00'::timestamptz, 'Monthly Retirement Withdrawal', 1::bigint, 'month', true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 1. Goal only > Investment: Retirement Investment > Transaction: Initial Investment
  ('ba0313cc-6274-4ad1-85bf-c28c8611be8f'::uuid, '4cebbfa6-d1fe-41e9-bf09-4326acdfd691'::uuid, 'deposit', 11258::numeric, '2025-01-01 00:00:00+00'::timestamptz, NULL::timestamptz, 'Initial Investment', NULL::bigint, NULL, true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 1. Goal only > Investment: Retirement Investment > Transaction: Monthly Contribution
  ('9d9fec02-4d33-4141-9da6-d321adb4bc2d'::uuid, '4cebbfa6-d1fe-41e9-bf09-4326acdfd691'::uuid, 'deposit', 180.21::numeric, '2025-02-01 00:00:00+00'::timestamptz, '2045-02-01 00:00:00+00'::timestamptz, 'Monthly Contribution', 1::bigint, 'month', true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 1. Goal only > Investment: Retirement Investment > Transaction: Monthly Retirement Withdrawal
  ('5b6de0bf-e368-4b55-a40e-0dbce064ed40'::uuid, '4cebbfa6-d1fe-41e9-bf09-4326acdfd691'::uuid, 'withdrawal', 350::numeric, '2045-03-01 00:00:00+00'::timestamptz, '2065-02-28 00:00:00+00'::timestamptz, 'Monthly Retirement Withdrawal', 1::bigint, 'month', true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 2. Single investment > Investment: Evropské akcie > Transaction: Initial Investment
  ('b7a4fe9d-3e8d-4915-8350-ddf875a661ed'::uuid, '5b84f53c-cf54-4688-813d-26976b70e46a'::uuid, 'deposit', 11258::numeric, '2025-01-01 00:00:00+00'::timestamptz, NULL::timestamptz, 'Initial Investment', NULL::bigint, NULL, true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 2. Single investment > Investment: Evropské akcie > Transaction: Monthly Contribution
  ('a0d01861-a399-45ca-9e43-2b4c6200f71f'::uuid, '5b84f53c-cf54-4688-813d-26976b70e46a'::uuid, 'deposit', 180.21::numeric, '2025-02-01 00:00:00+00'::timestamptz, '2045-02-01 00:00:00+00'::timestamptz, 'Monthly Contribution', 1::bigint, 'month', true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 2. Single investment > Investment: Evropské akcie > Transaction: Monthly Retirement Withdrawal
  ('af99c15e-aa61-47fa-9ad7-7c0dc22fdf44'::uuid, '5b84f53c-cf54-4688-813d-26976b70e46a'::uuid, 'withdrawal', 350::numeric, '2045-03-01 00:00:00+00'::timestamptz, '2065-02-28 00:00:00+00'::timestamptz, 'Monthly Retirement Withdrawal', 1::bigint, 'month', true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 3. Equal investments > Investment: Evropské akcie > Transaction: Initial Investment
  ('2341813e-a3a1-4814-b167-2e6e16a5c3d7'::uuid, 'c9ae320d-5a92-4d62-a81b-c540cd5a6063'::uuid, 'deposit', 2814.5::numeric, '2025-01-01 00:00:00+00'::timestamptz, NULL::timestamptz, 'Initial Investment', NULL::bigint, NULL, true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 3. Equal investments > Investment: Evropské akcie > Transaction: Monthly Contribution
  ('dfe6f290-42ab-4ff8-80f6-b7d18e132b9e'::uuid, 'c9ae320d-5a92-4d62-a81b-c540cd5a6063'::uuid, 'deposit', 45.05::numeric, '2025-02-01 00:00:00+00'::timestamptz, '2045-02-01 00:00:00+00'::timestamptz, 'Monthly Contribution', 1::bigint, 'month', true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 3. Equal investments > Investment: Evropské akcie > Transaction: Monthly Retirement Withdrawal
  ('89def0d0-24e6-49d9-b7ad-56fbdeb3f1d4'::uuid, 'c9ae320d-5a92-4d62-a81b-c540cd5a6063'::uuid, 'withdrawal', 95.5::numeric, '2045-03-01 00:00:00+00'::timestamptz, '2065-02-28 00:00:00+00'::timestamptz, 'Monthly Retirement Withdrawal', 1::bigint, 'month', true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 3. Equal investments > Investment: Americké akcie > Transaction: Initial Investment
  ('c4f66d4f-c710-44ad-a051-6ee8a76eb1e0'::uuid, '07447227-557a-4f63-81ef-4dc1de963e5a'::uuid, 'deposit', 2814.5::numeric, '2025-01-01 00:00:00+00'::timestamptz, NULL::timestamptz, 'Initial Investment', NULL::bigint, NULL, true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 3. Equal investments > Investment: Americké akcie > Transaction: Monthly Contribution
  ('506bde5c-aa2f-4abd-9a90-24aa706317ed'::uuid, '07447227-557a-4f63-81ef-4dc1de963e5a'::uuid, 'deposit', 45.05::numeric, '2025-02-01 00:00:00+00'::timestamptz, '2045-02-01 00:00:00+00'::timestamptz, 'Monthly Contribution', 1::bigint, 'month', true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 3. Equal investments > Investment: Americké akcie > Transaction: Monthly Retirement Withdrawal
  ('28d89ff9-ee3f-4a54-b0ee-ff81169e81e2'::uuid, '07447227-557a-4f63-81ef-4dc1de963e5a'::uuid, 'withdrawal', 138.5::numeric, '2045-03-01 00:00:00+00'::timestamptz, '2065-02-28 00:00:00+00'::timestamptz, 'Monthly Retirement Withdrawal', 1::bigint, 'month', true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 3. Equal investments > Investment: České dluhopisy > Transaction: Initial Investment
  ('939a5546-ab76-4690-9b21-ad9f049fd7b9'::uuid, 'e59d7955-d34a-4b98-a987-0ecb9fe7917d'::uuid, 'deposit', 2814.5::numeric, '2025-01-01 00:00:00+00'::timestamptz, NULL::timestamptz, 'Initial Investment', NULL::bigint, NULL, true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 3. Equal investments > Investment: České dluhopisy > Transaction: Monthly Contribution
  ('092aa267-a419-4db6-bcfa-d8d43ad88608'::uuid, 'e59d7955-d34a-4b98-a987-0ecb9fe7917d'::uuid, 'deposit', 45.05::numeric, '2025-02-01 00:00:00+00'::timestamptz, '2045-02-01 00:00:00+00'::timestamptz, 'Monthly Contribution', 1::bigint, 'month', true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 3. Equal investments > Investment: České dluhopisy > Transaction: Monthly Retirement Withdrawal
  ('04c2f2b0-3da2-46e0-a164-7382450a8552'::uuid, 'e59d7955-d34a-4b98-a987-0ecb9fe7917d'::uuid, 'withdrawal', 46.5::numeric, '2045-03-01 00:00:00+00'::timestamptz, '2065-02-28 00:00:00+00'::timestamptz, 'Monthly Retirement Withdrawal', 1::bigint, 'month', true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 3. Equal investments > Investment: Zlato > Transaction: Initial Investment
  ('20256a00-121b-492b-85f1-6412da9a4d90'::uuid, '78de3401-332c-4de5-bd8a-bb90459d690a'::uuid, 'deposit', 2814.5::numeric, '2025-01-01 00:00:00+00'::timestamptz, NULL::timestamptz, 'Initial Investment', NULL::bigint, NULL, true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 3. Equal investments > Investment: Zlato > Transaction: Monthly Contribution
  ('c8021475-cacb-48eb-ac8f-5511ec77b949'::uuid, '78de3401-332c-4de5-bd8a-bb90459d690a'::uuid, 'deposit', 45.05::numeric, '2025-02-01 00:00:00+00'::timestamptz, '2045-02-01 00:00:00+00'::timestamptz, 'Monthly Contribution', 1::bigint, 'month', true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 3. Equal investments > Investment: Zlato > Transaction: Monthly Retirement Withdrawal
  ('fddde172-072c-4bcc-b3dd-7aab5239f987'::uuid, '78de3401-332c-4de5-bd8a-bb90459d690a'::uuid, 'withdrawal', 69.5::numeric, '2045-03-01 00:00:00+00'::timestamptz, '2065-02-28 00:00:00+00'::timestamptz, 'Monthly Retirement Withdrawal', 1::bigint, 'month', true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 5. Two Goals > Investment: Evropské akcie > Transaction: Initial Investment
  ('0d1331e7-3c48-41c6-9d0f-a48ed764b56a'::uuid, '69ea7430-5228-4fa5-b747-dbb693b79a04'::uuid, 'deposit', 1688.7::numeric, '2025-01-01 00:00:00+00'::timestamptz, NULL::timestamptz, 'Initial Investment', NULL::bigint, NULL, true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 5. Two Goals > Investment: Evropské akcie > Transaction: Monthly Contribution
  ('9289bbba-48d0-432d-8afb-9f9e2f10b7e8'::uuid, '69ea7430-5228-4fa5-b747-dbb693b79a04'::uuid, 'deposit', 27.03::numeric, '2025-02-01 00:00:00+00'::timestamptz, '2045-02-01 00:00:00+00'::timestamptz, 'Monthly Contribution', 1::bigint, 'month', true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 5. Two Goals > Investment: Evropské akcie > Transaction: Monthly Retirement Withdrawal
  ('527d6dae-cffe-463d-ac05-14ebffef9aad'::uuid, '69ea7430-5228-4fa5-b747-dbb693b79a04'::uuid, 'withdrawal', 62.5::numeric, '2045-03-01 00:00:00+00'::timestamptz, '2065-02-28 00:00:00+00'::timestamptz, 'Monthly Retirement Withdrawal', 1::bigint, 'month', true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 5. Two Goals > Investment: Americké akcie > Transaction: Initial Investment
  ('fe5b840c-6f06-4378-baaf-fdd79fd8b7ef'::uuid, 'd724afaf-02eb-4579-b021-20973945693f'::uuid, 'deposit', 2701.92::numeric, '2025-01-01 00:00:00+00'::timestamptz, NULL::timestamptz, 'Initial Investment', NULL::bigint, NULL, true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 5. Two Goals > Investment: Americké akcie > Transaction: Monthly Contribution
  ('6f9efc01-27c2-4e8f-a22d-c7fe894a6468'::uuid, 'd724afaf-02eb-4579-b021-20973945693f'::uuid, 'deposit', 43.25::numeric, '2025-02-01 00:00:00+00'::timestamptz, '2045-02-01 00:00:00+00'::timestamptz, 'Monthly Contribution', 1::bigint, 'month', true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 5. Two Goals > Investment: Americké akcie > Transaction: Monthly Retirement Withdrawal
  ('330d3458-edae-43c0-873b-1823b6172c97'::uuid, 'd724afaf-02eb-4579-b021-20973945693f'::uuid, 'withdrawal', 140::numeric, '2045-03-01 00:00:00+00'::timestamptz, '2065-02-28 00:00:00+00'::timestamptz, 'Monthly Retirement Withdrawal', 1::bigint, 'month', true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 5. Two Goals > Investment: České dluhopisy > Transaction: Initial Investment
  ('b6fadd49-65ce-43c9-9de5-c000ca4940e4'::uuid, '851ed5be-3d1d-43e6-aef9-00b7fbd2d4cb'::uuid, 'deposit', 5741.58::numeric, '2025-01-01 00:00:00+00'::timestamptz, NULL::timestamptz, 'Initial Investment', NULL::bigint, NULL, true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 5. Two Goals > Investment: České dluhopisy > Transaction: Monthly Contribution
  ('48503456-b3b7-490c-bdf6-f59579558b7a'::uuid, '851ed5be-3d1d-43e6-aef9-00b7fbd2d4cb'::uuid, 'deposit', 91.91::numeric, '2025-02-01 00:00:00+00'::timestamptz, '2045-02-01 00:00:00+00'::timestamptz, 'Monthly Contribution', 1::bigint, 'month', true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 5. Two Goals > Investment: České dluhopisy > Transaction: Monthly Retirement Withdrawal
  ('21fa929d-9555-419b-8308-395d79f66d2b'::uuid, '851ed5be-3d1d-43e6-aef9-00b7fbd2d4cb'::uuid, 'withdrawal', 112.5::numeric, '2045-03-01 00:00:00+00'::timestamptz, '2065-02-28 00:00:00+00'::timestamptz, 'Monthly Retirement Withdrawal', 1::bigint, 'month', true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 5. Two Goals > Investment: Zlato > Transaction: Initial Investment
  ('ae830860-aa99-47c8-9ce9-6adebc003122'::uuid, 'c8210ce5-699c-41da-ba0b-22f63f35033e'::uuid, 'deposit', 1125.8::numeric, '2025-01-01 00:00:00+00'::timestamptz, NULL::timestamptz, 'Initial Investment', NULL::bigint, NULL, true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 5. Two Goals > Investment: Zlato > Transaction: Monthly Contribution
  ('55b7831f-ac5d-4662-bd0b-ead37efd0251'::uuid, 'c8210ce5-699c-41da-ba0b-22f63f35033e'::uuid, 'deposit', 18.02::numeric, '2025-02-01 00:00:00+00'::timestamptz, '2045-02-01 00:00:00+00'::timestamptz, 'Monthly Contribution', 1::bigint, 'month', true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 5. Two Goals > Investment: Zlato > Transaction: Monthly Retirement Withdrawal
  ('c464e24a-6a1f-4774-9161-c2293cd71bd8'::uuid, 'c8210ce5-699c-41da-ba0b-22f63f35033e'::uuid, 'withdrawal', 35::numeric, '2045-03-01 00:00:00+00'::timestamptz, '2065-02-28 00:00:00+00'::timestamptz, 'Monthly Retirement Withdrawal', 1::bigint, 'month', true::boolean, '2025-10-10 12:00:00+00'::timestamptz, '2025-10-10 12:00:00+00'::timestamptz),
  -- Portfolio: Retirement Demo - 5. Two Goals > Investment: Americké akcie > Transaction: Ben's Education Expenses
  ('26c639c3-4aac-42a8-b79c-8e039afb217b'::uuid, 'd724afaf-02eb-4579-b021-20973945693f'::uuid, 'withdrawal', 500::numeric, '2033-02-02 00:00:00+00'::timestamptz, '2036-02-01 00:00:00+00'::timestamptz, 'Ben''s Education Expenses', 1::bigint, 'month', true::boolean, '2025-10-15 10:58:22.204217+00'::timestamptz, '2025-10-15 10:58:22.204217+00'::timestamptz),
  -- Portfolio: Retirement Demo - 5. Two Goals > Investment: Americké akcie > Transaction: Ben's Education Fund - Monthly Savings
  ('8dec32f4-1fd1-433d-ae75-49b63b7c746c'::uuid, 'd724afaf-02eb-4579-b021-20973945693f'::uuid, 'deposit', 170::numeric, '2025-10-15 00:00:00+00'::timestamptz, '2033-02-14 00:00:00+00'::timestamptz, 'Ben''s Education Fund - Monthly Savings', 1::bigint, 'month', true::boolean, '2025-10-15 10:59:17.14477+00'::timestamptz, '2025-10-15 10:59:17.14477+00'::timestamptz),
  -- Portfolio: Retirement Demo - 5. Two Goals > Investment: Evropské akcie > Transaction: Ben's Education Expenses
  ('4c7e6047-fb25-4fd0-a3d8-c57f677d4e77'::uuid, '69ea7430-5228-4fa5-b747-dbb693b79a04'::uuid, 'withdrawal', 500::numeric, '2033-02-02 00:00:00+00'::timestamptz, '2036-02-01 00:00:00+00'::timestamptz, 'Ben''s Education Expenses', 1::bigint, 'month', false::boolean, '2025-10-15 11:04:35.015671+00'::timestamptz, '2025-10-15 11:04:35.015671+00'::timestamptz),
  -- Portfolio: Retirement Demo - 5. Two Goals > Investment: Evropské akcie > Transaction: Ben's Education Fund - Monthly Savings
  ('966bb678-740d-4f4b-a57b-0fbf9df89eea'::uuid, '69ea7430-5228-4fa5-b747-dbb693b79a04'::uuid, 'deposit', 160::numeric, '2025-10-15 00:00:00+00'::timestamptz, '2033-02-14 00:00:00+00'::timestamptz, 'Ben''s Education Fund - Monthly Savings', 1::bigint, 'month', false::boolean, '2025-10-15 11:05:22.602429+00'::timestamptz, '2025-10-15 11:05:22.602429+00'::timestamptz),
  -- Portfolio: Investment only portfolio > Investment: Global ETF Portfolio > Transaction: Initial Investment
  ('94ca9099-8b8a-4692-b42e-0318fb043c91'::uuid, 'bdbd25df-15eb-4dce-80b8-058375893919'::uuid, 'deposit', 10000::numeric, '2025-10-30 00:00:00+00'::timestamptz, NULL::timestamptz, 'Initial Investment', NULL::bigint, NULL, false::boolean, '2025-10-30 10:00:00+00'::timestamptz, '2025-10-30 10:00:00+00'::timestamptz),
  -- Portfolio: Investment only portfolio > Investment: Global ETF Portfolio > Transaction: Monthly Contribution
  ('43a7990e-7e93-41ee-9fe7-b453bcfc99f4'::uuid, 'bdbd25df-15eb-4dce-80b8-058375893919'::uuid, 'deposit', 500::numeric, '2025-11-01 00:00:00+00'::timestamptz, '2070-03-15 00:00:00+00'::timestamptz, 'Monthly Contribution', 1::bigint, 'month', false::boolean, '2025-10-30 10:00:00+00'::timestamptz, '2025-10-30 10:00:00+00'::timestamptz),
  -- Portfolio: Single goal portfolio > Investment: Retirement Goal > Transaction: Initial Savings
  ('69fe2062-57dc-46ce-8cc8-385fe778a828'::uuid, '25c02429-f978-4787-b538-fadc7513adbb'::uuid, 'deposit', 350000::numeric, '2025-01-01 00:00:00+00'::timestamptz, NULL::timestamptz, 'Initial Savings', NULL::bigint, NULL, true::boolean, '2025-10-30 11:00:00+00'::timestamptz, '2025-10-30 11:00:00+00'::timestamptz),
  -- Portfolio: Single goal portfolio > Investment: Retirement Goal > Transaction: Monthly Contribution
  ('53bcc909-c8a2-4200-a718-1d3b4e5913d8'::uuid, '25c02429-f978-4787-b538-fadc7513adbb'::uuid, 'deposit', 7090::numeric, '2025-02-01 00:00:00+00'::timestamptz, '2050-03-15 00:00:00+00'::timestamptz, 'Monthly Contribution', 1::bigint, 'month', true::boolean, '2025-10-30 11:00:00+00'::timestamptz, '2025-10-30 11:00:00+00'::timestamptz),
  -- Portfolio: Single goal portfolio > Investment: Retirement Goal > Transaction: Retirement Withdrawal
  ('bacb0f70-ae4f-40a8-93ba-6ca4d12a2cae'::uuid, '25c02429-f978-4787-b538-fadc7513adbb'::uuid, 'withdrawal', 20000::numeric, '2050-03-15 00:00:00+00'::timestamptz, '2070-03-15 00:00:00+00'::timestamptz, 'Retirement Withdrawal', 1::bigint, 'month', true::boolean, '2025-10-30 11:00:00+00'::timestamptz, '2025-10-30 11:00:00+00'::timestamptz);
