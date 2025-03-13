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
    email_change
  )
VALUES
  (
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
    ''
  );

INSERT INTO
  auth.identities (
    id,
    provider_id,
    provider,
    user_id,
    identity_data,
    last_sign_in_at,
    created_at,
    updated_at
  )
VALUES
  (
    (SELECT id FROM auth.users WHERE email = 'demo@kalkul.app'),
    (SELECT id FROM auth.users WHERE email = 'demo@kalkul.app'),
    'email',
    (SELECT id FROM auth.users WHERE email = 'demo@kalkul.app'),
    json_build_object('sub', (SELECT id FROM auth.users WHERE email = 'demo@kalkul.app')),
    NOW(),
    NOW(),
    NOW()
  );

INSERT INTO
  "public"."client" (
    "id",
    "email",
    "created_at",
    "name",
    "birth_date",
    "advisor"
  )
VALUES
  (
    '1',
    'vanguardia@kalkul.app',
    '2024-11-26 14:03:04.068525+00',
    'Vanguardia Steadyworth',
    '1977-11-09',
    '3c6a48fa-88fa-4cd9-bd0c-be4f4ac3a249'
  );

INSERT INTO
  "public"."portfolio" (
    "id",
    "created_at",
    "name",
    "last_edited_at",
    "start_date",
    "end_date",
    "inflation_rate",
    "client",
    "currency",
    "link"
  )
VALUES
  (
    '1',
    '2024-11-26 14:29:39.755166+00',
    'Sensible investing',
    '2024-11-26 14:29:39.755166+00',
    '1997-11-09',
    '2045-11-09',
    '0.0225',
    '1',
    'CZK',
    'bqm1uvce58e15rflcivlqonx4'
  );

INSERT INTO
  "public"."investment" (
    "id",
    "created_at",
    "last_edited_at",
    "portfolio",
    "apy",
    "entry_fee",
    "exit_fee",
    "success_fee",
    "management_fee",
    "exit_fee_type",
    "management_fee_type",
    "entry_fee_type",
    "name"
  )
VALUES
  (
    '1',
    '2024-11-26 14:32:06.003862+00',
    '2024-11-26 14:32:06.003862+00',
    '1',
    '14.52',
    '0',
    '0',
    '0',
    '0.03',
    'percentage',
    'percentage',
    'ongoing',
    'S&P'
  ),
  (
    '2',
    '2024-11-26 15:26:16.334445+00',
    '2024-11-26 15:26:16.334445+00',
    '1',
    '2.25',
    '0',
    '0',
    '0',
    '0',
    'percentage',
    'percentage',
    'ongoing',
    'Gold'
  ),
  (
    '3',
    '2024-11-26 16:23:46.49737+00',
    '2024-11-26 16:23:46.49737+00',
    '1',
    '6',
    '0',
    '1',
    '0',
    '1.5',
    'percentage',
    'percentage',
    'ongoing',
    'Real Estate fund'
  );

INSERT INTO
  "public"."transaction" (
    "id",
    "created_at",
    "user_id",
    "amount",
    "date",
    "end_date",
    "investment_id",
    "label",
    "repeat",
    "repeat_unit",
    "type",
    "last_edited_at"
  )
VALUES
  (
    '1',
    '2024-11-26 14:33:47.871286+00',
    '3c6a48fa-88fa-4cd9-bd0c-be4f4ac3a249',
    '100000',
    '1997-11-09 00:00:00+00',
    null,
    '1',
    'Initial',
    null,
    null,
    'deposit',
    '2024-11-26 14:33:47.871286+00'
  ),
  (
    '2',
    '2024-11-26 14:34:23.764254+00',
    '3c6a48fa-88fa-4cd9-bd0c-be4f4ac3a249',
    '5000',
    '1997-12-09 00:00:00+00',
    '2027-12-09 00:00:00+00',
    '1',
    'Monthly contribution',
    '1',
    'month',
    'deposit',
    '2024-11-26 14:34:23.764254+00'
  ),
  (
    '3',
    '2024-11-26 14:37:03.608032+00',
    '3c6a48fa-88fa-4cd9-bd0c-be4f4ac3a249',
    '50000',
    '2037-11-09 00:00:00+00',
    '2067-11-09 00:00:00+00',
    '1',
    'Retirement',
    '1',
    'month',
    'withdrawal',
    '2024-11-26 14:37:03.608032+00'
  );

SELECT setval('client_id_seq', (SELECT MAX(id) FROM client) + 1, false);
SELECT setval('portfolio_id_seq', (SELECT MAX(id) FROM portfolio) + 1, false);
SELECT setval('investment_id_seq', (SELECT MAX(id) FROM investment) + 1, false);
SELECT setval('transaction_id_seq', (SELECT MAX(id) FROM transaction) + 1, false);
