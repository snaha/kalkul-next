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
  ),
  (
    '2',
    'alex.carter@kalkul.app',
    '2025-08-14 10:00:00.000000+00',
    'Alexandra Carter',
    '1993-04-15',
    '3c6a48fa-88fa-4cd9-bd0c-be4f4ac3a249'
  ),
  (
    '3',
    'elena.mueller@kalkul.app',
    '2025-08-14 12:00:00.000000+00',
    'Elena Müller',
    '1985-06-12',
    '3c6a48fa-88fa-4cd9-bd0c-be4f4ac3a249'
  ),
  (
    '4',
    'inflation.demo@kalkul.app',
    '2025-08-23 15:00:00.000000+00',
    'Inflation Demo Client',
    '1990-01-01',
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
  ),
  (
    '2',
    '2025-08-14 10:00:00.000000+00',
    'FIRE Plan - Retire at 50',
    '2025-08-14 10:00:00.000000+00',
    '2025-08-14',
    '2083-04-15',
    '0.025',
    '2',
    'USD',
    'carter-fire-plan-2025'
  ),
  (
    '3',
    '2025-08-14 12:00:00.000000+00',
    'Berlin Steady Growth Plan',
    '2025-08-14 12:00:00.000000+00',
    '2025-08-14',
    '2050-06-12',
    '0.02',
    '3',
    'EUR',
    'mueller-berlin-plan-2025'
  ),
  (
    '4',
    '2025-08-23 15:00:00.000000+00',
    'Inflation Adjustment Demo Portfolio',
    '2025-08-23 15:00:00.000000+00',
    '2024-01-01',
    '2044-01-01',
    '0.03',
    '4',
    'USD',
    'inflation-demo-portfolio-2025'
  );

INSERT INTO
  "public"."investment" (
    "id",
    "created_at",
    "last_edited_at",
    "portfolio_id",
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
  ),
  (
    '4',
    '2025-08-14 10:30:00.000000+00',
    '2025-08-14 10:30:00.000000+00',
    '2',
    '7.5',
    '0',
    '0',
    '0',
    '0.75',
    'percentage',
    'percentage',
    'ongoing',
    'Total Stock Market ETF'
  ),
  (
    '5',
    '2025-08-14 10:35:00.000000+00',
    '2025-08-14 10:35:00.000000+00',
    '2',
    '5.2',
    '0',
    '0',
    '0',
    '0.25',
    'percentage',
    'percentage',
    'ongoing',
    'Bond Index Fund'
  ),
  (
    '6',
    '2025-08-14 10:40:00.000000+00',
    '2025-08-14 10:40:00.000000+00',
    '2',
    '4.5',
    '0',
    '0',
    '0',
    '0',
    'percentage',
    'percentage',
    'ongoing',
    'High-Yield Savings'
  ),
  (
    '7',
    '2025-08-14 12:30:00.000000+00',
    '2025-08-14 12:30:00.000000+00',
    '3',
    '6.5',
    '0',
    '0',
    '0',
    '1.5',
    'percentage',
    'percentage',
    'ongoing',
    'DAX ETF'
  ),
  (
    '8',
    '2025-08-14 12:35:00.000000+00',
    '2025-08-14 12:35:00.000000+00',
    '3',
    '3.2',
    '0',
    '0',
    '0',
    '0.6',
    'percentage',
    'percentage',
    'ongoing',
    'German Government Bonds'
  ),
  (
    '9',
    '2025-08-14 12:40:00.000000+00',
    '2025-08-14 12:40:00.000000+00',
    '3',
    '2.5',
    '0',
    '0',
    '0',
    '0.3',
    'percentage',
    'percentage',
    'ongoing',
    'German Savings Account'
  ),
  (
    '10',
    '2025-08-14 12:45:00.000000+00',
    '2025-08-14 12:45:00.000000+00',
    '3',
    '5.8',
    '0',
    '1',
    '0',
    '2.2',
    'percentage',
    'percentage',
    'ongoing',
    'Berlin Real Estate Fund'
  ),
  (
    '11',
    '2025-08-23 15:10:00.000000+00',
    '2025-08-23 15:10:00.000000+00',
    '4',
    '7.0',
    '0',
    '0',
    '0',
    '0.75',
    'percentage',
    'percentage',
    'ongoing',
    'Long-term Investment - No Inflation Adjustment'
  ),
  (
    '12',
    '2025-08-23 15:15:00.000000+00',
    '2025-08-23 15:15:00.000000+00',
    '4',
    '7.0',
    '0',
    '0',
    '0',
    '0.75',
    'percentage',
    'percentage',
    'ongoing',
    'Long-term Investment - With Inflation Adjustment'
  );

INSERT INTO
  "public"."transaction" (
    "id",
    "created_at",
    "amount",
    "date",
    "end_date",
    "investment_id",
    "label",
    "repeat",
    "repeat_unit",
    "type",
    "last_edited_at",
    "inflation_adjusted"
  )
VALUES
  (
    '1',
    '2024-11-26 14:33:47.871286+00',
    '100000',
    '1997-11-09 00:00:00+00',
    null,
    '1',
    'Initial',
    null,
    null,
    'deposit',
    '2024-11-26 14:33:47.871286+00',
    false
  ),
  (
    '2',
    '2024-11-26 14:34:23.764254+00',
    '5000',
    '1997-12-09 00:00:00+00',
    '2027-12-09 00:00:00+00',
    '1',
    'Monthly contribution',
    '1',
    'month',
    'deposit',
    '2024-11-26 14:34:23.764254+00',
    false
  ),
  (
    '3',
    '2024-11-26 14:37:03.608032+00',
    '50000',
    '2037-11-09 00:00:00+00',
    '2067-11-09 00:00:00+00',
    '1',
    'Retirement',
    '1',
    'month',
    'withdrawal',
    '2024-11-26 14:37:03.608032+00',
    false
  ),
  (
    '4',
    '2025-08-14 10:45:00.000000+00',
    '5000',
    '2025-08-14 00:00:00+00',
    null,
    '4',
    'Initial Investment',
    null,
    null,
    'deposit',
    '2025-08-14 10:45:00.000000+00',
    false
  ),
  (
    '5',
    '2025-08-14 10:50:00.000000+00',
    '1500',
    '2025-09-14 00:00:00+00',
    '2027-12-14 00:00:00+00',
    '4',
    'Monthly Contribution - Pre-House',
    '1',
    'month',
    'deposit',
    '2025-08-14 10:50:00.000000+00',
    false
  ),
  (
    '6',
    '2025-08-14 10:55:00.000000+00',
    '60000',
    '2028-01-15 00:00:00+00',
    null,
    '4',
    'House Down Payment Withdrawal',
    null,
    null,
    'withdrawal',
    '2025-08-14 10:55:00.000000+00',
    false
  ),
  (
    '7',
    '2025-08-14 11:25:00.000000+00',
    '3000',
    '2028-02-14 00:00:00+00',
    '2043-04-14 00:00:00+00',
    '4',
    'Monthly Contribution - FIRE Phase',
    '1',
    'month',
    'deposit',
    '2025-08-14 11:25:00.000000+00',
    false
  ),
  (
    '11',
    '2025-08-14 11:00:00.000000+00',
    '3000',
    '2025-08-14 00:00:00+00',
    null,
    '5',
    'Emergency Fund Start',
    null,
    null,
    'deposit',
    '2025-08-14 11:00:00.000000+00',
    false
  ),
  (
    '12',
    '2025-08-14 11:05:00.000000+00',
    '1000',
    '2025-09-14 00:00:00+00',
    '2043-04-14 00:00:00+00',
    '5',
    'Monthly Bond Allocation - Conservative Growth',
    '1',
    'month',
    'deposit',
    '2025-08-14 11:05:00.000000+00',
    false
  ),
  (
    '13',
    '2025-08-14 11:10:00.000000+00',
    '1000',
    '2025-08-14 00:00:00+00',
    null,
    '6',
    'Emergency Fund - Liquid Savings',
    null,
    null,
    'deposit',
    '2025-08-14 11:10:00.000000+00',
    false
  ),
  (
    '14',
    '2025-08-14 11:15:00.000000+00',
    '500',
    '2025-09-14 00:00:00+00',
    '2043-04-15 00:00:00+00',
    '6',
    'Monthly Emergency Fund Buildup',
    '1',
    'month',
    'deposit',
    '2025-08-14 11:15:00.000000+00',
    false
  ),
  (
    '15',
    '2025-08-14 11:20:00.000000+00',
    '4500',
    '2043-05-15 00:00:00+00',
    '2083-04-15 00:00:00+00',
    '4',
    'Early Retirement Withdrawal - Age 50',
    '1',
    'month',
    'withdrawal',
    '2025-08-14 11:20:00.000000+00',
    false
  ),
  (
    '16',
    '2025-08-14 13:00:00.000000+00',
    '10000',
    '2025-08-14 00:00:00+00',
    null,
    '7',
    'Initial DAX Investment',
    null,
    null,
    'deposit',
    '2025-08-14 13:00:00.000000+00',
    false
  ),
  (
    '17',
    '2025-08-14 13:05:00.000000+00',
    '1500',
    '2025-09-14 00:00:00+00',
    '2030-05-14 00:00:00+00',
    '7',
    'Monthly DAX Accumulation',
    '1',
    'month',
    'deposit',
    '2025-08-14 13:05:00.000000+00',
    false
  ),
  (
    '18',
    '2025-08-14 13:10:00.000000+00',
    '40000',
    '2030-06-15 00:00:00+00',
    null,
    '7',
    'Berlin Apartment Down Payment',
    null,
    null,
    'withdrawal',
    '2025-08-14 13:10:00.000000+00',
    false
  ),
  (
    '19',
    '2025-08-14 13:15:00.000000+00',
    '2000',
    '2030-07-14 00:00:00+00',
    '2040-06-14 00:00:00+00',
    '7',
    'Post-Purchase Growth Phase',
    '1',
    'month',
    'deposit',
    '2025-08-14 13:15:00.000000+00',
    false
  ),
  (
    '20',
    '2025-08-14 13:20:00.000000+00',
    '8000',
    '2025-08-14 00:00:00+00',
    null,
    '8',
    'German Bond Foundation',
    null,
    null,
    'deposit',
    '2025-08-14 13:20:00.000000+00',
    false
  ),
  (
    '21',
    '2025-08-14 13:25:00.000000+00',
    '700',
    '2025-09-14 00:00:00+00',
    '2050-06-12 00:00:00+00',
    '8',
    'Monthly Bond Allocation',
    '1',
    'month',
    'deposit',
    '2025-08-14 13:25:00.000000+00',
    false
  ),
  (
    '22',
    '2025-08-14 13:30:00.000000+00',
    '5000',
    '2025-08-14 00:00:00+00',
    null,
    '9',
    'Emergency Fund Setup',
    null,
    null,
    'deposit',
    '2025-08-14 13:30:00.000000+00',
    false
  ),
  (
    '23',
    '2025-08-14 13:35:00.000000+00',
    '600',
    '2025-09-14 00:00:00+00',
    '2035-06-14 00:00:00+00',
    '9',
    'Monthly Emergency Fund',
    '1',
    'month',
    'deposit',
    '2025-08-14 13:35:00.000000+00',
    false
  ),
  (
    '24',
    '2025-08-14 13:40:00.000000+00',
    '6000',
    '2028-01-15 00:00:00+00',
    null,
    '10',
    'Berlin Real Estate Initial',
    null,
    null,
    'deposit',
    '2025-08-14 13:40:00.000000+00',
    false
  ),
  (
    '25',
    '2025-08-14 13:45:00.000000+00',
    '800',
    '2028-02-14 00:00:00+00',
    '2048-06-14 00:00:00+00',
    '10',
    'Monthly Real Estate Investment',
    '1',
    'month',
    'deposit',
    '2025-08-14 13:45:00.000000+00',
    false
  ),
  (
    '26',
    '2025-08-14 13:50:00.000000+00',
    '30000',
    '2033-01-15 00:00:00+00',
    null,
    '7',
    'Child Education Fund - Berlin',
    null,
    null,
    'withdrawal',
    '2025-08-14 13:50:00.000000+00',
    false
  ),
  (
    '27',
    '2025-08-14 13:55:00.000000+00',
    '3200',
    '2050-07-12 00:00:00+00',
    '2080-06-12 00:00:00+00',
    '7',
    'German Retirement Income',
    '1',
    'month',
    'withdrawal',
    '2025-08-14 13:55:00.000000+00',
    false
  ),
  -- Demo transactions for inflation adjustment showcase - Perfect Matching Pairs
  -- Both investments get identical transactions at identical times, only inflation_adjusted differs
  
  -- Initial Investments (Portfolio Start Date)
  (
    '28',
    '2025-08-23 15:20:00.000000+00',
    '50000',
    '2024-01-01 00:00:00+00',
    null,
    '11',
    'Initial Investment',
    null,
    null,
    'deposit',
    '2025-08-23 15:20:00.000000+00',
    false
  ),
  (
    '29',
    '2025-08-23 15:20:00.000000+00',
    '50000',
    '2024-01-01 00:00:00+00',
    null,
    '12',
    'Initial Investment',
    null,
    null,
    'deposit',
    '2025-08-23 15:20:00.000000+00',
    true
  ),
  
  -- Monthly Contributions for 10 Years (Accumulation Phase)
  (
    '30',
    '2025-08-23 15:25:00.000000+00',
    '2000',
    '2024-02-01 00:00:00+00',
    '2034-01-01 00:00:00+00',
    '11',
    'Monthly Contributions - Accumulation Phase',
    '1',
    'month',
    'deposit',
    '2025-08-23 15:25:00.000000+00',
    false
  ),
  (
    '31',
    '2025-08-23 15:25:00.000000+00',
    '2000',
    '2024-02-01 00:00:00+00',
    '2034-01-01 00:00:00+00',
    '12',
    'Monthly Contributions - Accumulation Phase',
    '1',
    'month',
    'deposit',
    '2025-08-23 15:25:00.000000+00',
    true
  ),
  
  -- Mid-term Lump Sum Additions
  (
    '32',
    '2025-08-23 15:30:00.000000+00',
    '25000',
    '2029-01-01 00:00:00+00',
    null,
    '11',
    'Mid-Career Bonus Investment',
    null,
    null,
    'deposit',
    '2025-08-23 15:30:00.000000+00',
    false
  ),
  (
    '33',
    '2025-08-23 15:30:00.000000+00',
    '25000',
    '2029-01-01 00:00:00+00',
    null,
    '12',
    'Mid-Career Bonus Investment',
    null,
    null,
    'deposit',
    '2025-08-23 15:30:00.000000+00',
    true
  ),
  
  -- Emergency Withdrawal
  (
    '34',
    '2025-08-23 15:35:00.000000+00',
    '15000',
    '2032-06-15 00:00:00+00',
    null,
    '11',
    'Emergency Fund Withdrawal',
    null,
    null,
    'withdrawal',
    '2025-08-23 15:35:00.000000+00',
    false
  ),
  (
    '35',
    '2025-08-23 15:35:00.000000+00',
    '15000',
    '2032-06-15 00:00:00+00',
    null,
    '12',
    'Emergency Fund Withdrawal',
    null,
    null,
    'withdrawal',
    '2025-08-23 15:35:00.000000+00',
    true
  ),
  
  -- Retirement Phase - Monthly Withdrawals
  (
    '36',
    '2025-08-23 15:40:00.000000+00',
    '2000',
    '2034-02-01 00:00:00+00',
    '2044-01-01 00:00:00+00',
    '11',
    'Monthly Retirement Income',
    '1',
    'month',
    'withdrawal',
    '2025-08-23 15:40:00.000000+00',
    false
  ),
  (
    '37',
    '2025-08-23 15:40:00.000000+00',
    '2000',
    '2034-02-01 00:00:00+00',
    '2044-01-01 00:00:00+00',
    '12',
    'Monthly Retirement Income',
    '1',
    'month',
    'withdrawal',
    '2025-08-23 15:40:00.000000+00',
    true
  ),
  
  -- Large Retirement Lump Sum
  (
    '38',
    '2025-08-23 15:45:00.000000+00',
    '100000',
    '2039-01-01 00:00:00+00',
    null,
    '11',
    'Major Retirement Expense (House/Travel)',
    null,
    null,
    'withdrawal',
    '2025-08-23 15:45:00.000000+00',
    false
  ),
  (
    '39',
    '2025-08-23 15:45:00.000000+00',
    '100000',
    '2039-01-01 00:00:00+00',
    null,
    '12',
    'Major Retirement Expense (House/Travel)',
    null,
    null,
    'withdrawal',
    '2025-08-23 15:45:00.000000+00',
    true
  );

-- Zero-Crossing Demo Client and Portfolio
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
    '5',
    'zero.crossing@kalkul.app',
    '2025-09-24 12:00:00.000000+00',
    'Zero Crossing Demo Client',
    '1985-03-15',
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
    '5',
    '2025-09-24 12:00:00.000000+00',
    'Zero-Crossing Demonstration Portfolio',
    '2025-09-24 12:00:00.000000+00',
    '2023-01-01',
    '2027-12-31',
    '0.025',
    '5',
    'USD',
    'zero-crossing-demo-2025'
  );

INSERT INTO
  "public"."investment" (
    "id",
    "created_at",
    "last_edited_at",
    "portfolio_id",
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
    '13',
    '2025-09-24 12:00:00.000000+00',
    '2025-09-24 12:00:00.000000+00',
    '5',
    '6.5',
    '0',
    '0',
    '0',
    '0.015',
    'percentage',
    'percentage',
    'ongoing',
    'Volatile Growth Fund'
  );

INSERT INTO
  "public"."transaction" (
    "id",
    "created_at",
    "amount",
    "date",
    "end_date",
    "investment_id",
    "label",
    "repeat",
    "repeat_unit",
    "type",
    "last_edited_at",
    "inflation_adjusted"
  )
VALUES
  -- Initial investment builds up portfolio value
  (
    '1001',
    '2025-09-24 12:00:00.000000+00',
    '50000',
    '2023-01-01 00:00:00+00',
    null,
    '13',
    'Initial Investment',
    null,
    null,
    'deposit',
    '2025-09-24 12:00:00.000000+00',
    false
  ),
  -- Monthly contributions for 18 months
  (
    '1002',
    '2025-09-24 12:00:00.000000+00',
    '5000',
    '2023-02-01 00:00:00+00',
    '2024-07-01 00:00:00+00',
    '13',
    'Monthly contributions',
    '1',
    'month',
    'deposit',
    '2025-09-24 12:00:00.000000+00',
    false
  ),
  -- Large emergency withdrawal that pushes portfolio negative
  (
    '1003',
    '2025-09-24 12:00:00.000000+00',
    '200000',
    '2024-08-15 00:00:00+00',
    null,
    '13',
    'Emergency withdrawal',
    null,
    null,
    'withdrawal',
    '2025-09-24 12:00:00.000000+00',
    false
  ),
  -- Recovery contributions showing portfolio climbing back
  (
    '1004',
    '2025-09-24 12:00:00.000000+00',
    '8000',
    '2024-09-01 00:00:00+00',
    '2027-12-01 00:00:00+00',
    '13',
    'Recovery contributions',
    '1',
    'month',
    'deposit',
    '2025-09-24 12:00:00.000000+00',
    false
  );

-- Add a second investment to demonstrate contrast (this one stays positive)
INSERT INTO
  "public"."investment" (
    "id",
    "created_at",
    "last_edited_at",
    "portfolio_id",
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
    '14',
    '2025-09-24 12:00:00.000000+00',
    '2025-09-24 12:00:00.000000+00',
    '5',
    '4.2',
    '0.5',
    '0',
    '0',
    '0.01',
    'percentage',
    'percentage',
    'ongoing',
    'Stable Bond Fund'
  ),
  -- Add a third investment that exhausts later than the first one
  (
    '15',
    '2025-09-24 12:00:00.000000+00',
    '2025-09-24 12:00:00.000000+00',
    '5',
    '5.8',
    '0',
    '0',
    '0',
    '0.02',
    'percentage',
    'percentage',
    'ongoing',
    'Moderate Risk Fund'
  );

INSERT INTO
  "public"."transaction" (
    "id",
    "created_at",
    "amount",
    "date",
    "end_date",
    "investment_id",
    "label",
    "repeat",
    "repeat_unit",
    "type",
    "last_edited_at",
    "inflation_adjusted"
  )
VALUES
  -- Conservative initial investment
  (
    '2001',
    '2025-09-24 12:00:00.000000+00',
    '25000',
    '2023-01-01 00:00:00+00',
    null,
    '14',
    'Initial Conservative Investment',
    null,
    null,
    'deposit',
    '2025-09-24 12:00:00.000000+00',
    false
  ),
  -- Steady monthly contributions
  (
    '2002',
    '2025-09-24 12:00:00.000000+00',
    '2000',
    '2023-02-01 00:00:00+00',
    '2027-12-01 00:00:00+00',
    '14',
    'Monthly conservative contributions',
    '1',
    'month',
    'deposit',
    '2025-09-24 12:00:00.000000+00',
    false
  ),
  -- Moderate withdrawal that doesn't exhaust funds
  (
    '2003',
    '2025-09-24 12:00:00.000000+00',
    '15000',
    '2024-08-15 00:00:00+00',
    null,
    '14',
    'Moderate withdrawal',
    null,
    null,
    'withdrawal',
    '2025-09-24 12:00:00.000000+00',
    false
  ),
  -- Additional withdrawal later that's still within limits
  (
    '2004',
    '2025-09-24 12:00:00.000000+00',
    '10000',
    '2025-03-01 00:00:00+00',
    null,
    '14',
    'Planned withdrawal',
    null,
    null,
    'withdrawal',
    '2025-09-24 12:00:00.000000+00',
    false
  ),

  -- Transactions for the third investment (Moderate Risk Fund) that exhausts later
  -- Initial investment
  (
    '3001',
    '2025-09-24 12:00:00.000000+00',
    '40000',
    '2023-01-01 00:00:00+00',
    null,
    '15',
    'Initial Moderate Investment',
    null,
    null,
    'deposit',
    '2025-09-24 12:00:00.000000+00',
    false
  ),
  -- Monthly contributions for 30 months (longer buildup than first investment)
  (
    '3002',
    '2025-09-24 12:00:00.000000+00',
    '3000',
    '2023-02-01 00:00:00+00',
    '2025-07-01 00:00:00+00',
    '15',
    'Extended monthly contributions',
    '1',
    'month',
    'deposit',
    '2025-09-24 12:00:00.000000+00',
    false
  ),
  -- Large withdrawal that exhausts the fund around August 2025 (13 months after first error)
  (
    '3003',
    '2025-09-24 12:00:00.000000+00',
    '150000',
    '2025-08-15 00:00:00+00',
    null,
    '15',
    'Major expense - fund exhaustion',
    null,
    null,
    'withdrawal',
    '2025-09-24 12:00:00.000000+00',
    false
  ),
  -- Recovery attempts showing continued negative balance
  (
    '3004',
    '2025-09-24 12:00:00.000000+00',
    '4000',
    '2025-09-01 00:00:00+00',
    '2027-12-01 00:00:00+00',
    '15',
    'Recovery attempts after exhaustion',
    '1',
    'month',
    'deposit',
    '2025-09-24 12:00:00.000000+00',
    false
  );

-- Duplicate Zero-Crossing Portfolio with 3-year extension (+3 Years)
INSERT INTO "public"."portfolio" (
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
SELECT
  '6',
  "created_at",
  "name" || ' (+3 Years)',
  "last_edited_at",
  "start_date",
  '2030-12-31',
  "inflation_rate",
  "client",
  "currency",
  "link" || '-extended'
FROM "public"."portfolio"
WHERE "id" = '5';

-- Duplicate investments for extended portfolio
INSERT INTO "public"."investment" (
  "id",
  "created_at",
  "last_edited_at",
  "portfolio_id",
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
SELECT
  '16',
  "created_at",
  "last_edited_at",
  '6',
  "apy",
  "entry_fee",
  "exit_fee",
  "success_fee",
  "management_fee",
  "exit_fee_type",
  "management_fee_type",
  "entry_fee_type",
  "name"
FROM "public"."investment"
WHERE "id" = '13';

INSERT INTO "public"."investment" (
  "id",
  "created_at",
  "last_edited_at",
  "portfolio_id",
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
SELECT
  '17',
  "created_at",
  "last_edited_at",
  '6',
  "apy",
  "entry_fee",
  "exit_fee",
  "success_fee",
  "management_fee",
  "exit_fee_type",
  "management_fee_type",
  "entry_fee_type",
  "name"
FROM "public"."investment"
WHERE "id" = '14';

INSERT INTO "public"."investment" (
  "id",
  "created_at",
  "last_edited_at",
  "portfolio_id",
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
SELECT
  '18',
  "created_at",
  "last_edited_at",
  '6',
  "apy",
  "entry_fee",
  "exit_fee",
  "success_fee",
  "management_fee",
  "exit_fee_type",
  "management_fee_type",
  "entry_fee_type",
  "name"
FROM "public"."investment"
WHERE "id" = '15';

-- Transactions for extended portfolio
INSERT INTO "public"."transaction" (
  "id",
  "created_at",
  "amount",
  "date",
  "end_date",
  "investment_id",
  "label",
  "repeat",
  "repeat_unit",
  "type",
  "last_edited_at",
  "inflation_adjusted"
)
SELECT
  '4001',
  "created_at",
  "amount",
  "date",
  "end_date",
  '16',
  "label",
  "repeat",
  "repeat_unit",
  "type",
  "last_edited_at",
  "inflation_adjusted"
FROM "public"."transaction"
WHERE "id" = '1001';

INSERT INTO "public"."transaction" (
  "id",
  "created_at",
  "amount",
  "date",
  "end_date",
  "investment_id",
  "label",
  "repeat",
  "repeat_unit",
  "type",
  "last_edited_at",
  "inflation_adjusted"
)
SELECT
  '4002',
  "created_at",
  "amount",
  "date",
  "end_date",
  '16',
  "label",
  "repeat",
  "repeat_unit",
  "type",
  "last_edited_at",
  "inflation_adjusted"
FROM "public"."transaction"
WHERE "id" = '1002';

INSERT INTO "public"."transaction" (
  "id",
  "created_at",
  "amount",
  "date",
  "end_date",
  "investment_id",
  "label",
  "repeat",
  "repeat_unit",
  "type",
  "last_edited_at",
  "inflation_adjusted"
)
SELECT
  '4003',
  "created_at",
  "amount",
  "date",
  "end_date",
  '16',
  "label",
  "repeat",
  "repeat_unit",
  "type",
  "last_edited_at",
  "inflation_adjusted"
FROM "public"."transaction"
WHERE "id" = '1003';

INSERT INTO "public"."transaction" (
  "id",
  "created_at",
  "amount",
  "date",
  "end_date",
  "investment_id",
  "label",
  "repeat",
  "repeat_unit",
  "type",
  "last_edited_at",
  "inflation_adjusted"
)
SELECT
  '4004',
  "created_at",
  "amount",
  "date",
  "end_date",
  '16',
  "label",
  "repeat",
  "repeat_unit",
  "type",
  "last_edited_at",
  "inflation_adjusted"
FROM "public"."transaction"
WHERE "id" = '1004';

INSERT INTO "public"."transaction" (
  "id",
  "created_at",
  "amount",
  "date",
  "end_date",
  "investment_id",
  "label",
  "repeat",
  "repeat_unit",
  "type",
  "last_edited_at",
  "inflation_adjusted"
)
SELECT
  '5001',
  "created_at",
  "amount",
  "date",
  "end_date",
  '17',
  "label",
  "repeat",
  "repeat_unit",
  "type",
  "last_edited_at",
  "inflation_adjusted"
FROM "public"."transaction"
WHERE "id" = '2001';

INSERT INTO "public"."transaction" (
  "id",
  "created_at",
  "amount",
  "date",
  "end_date",
  "investment_id",
  "label",
  "repeat",
  "repeat_unit",
  "type",
  "last_edited_at",
  "inflation_adjusted"
)
SELECT
  '5002',
  "created_at",
  "amount",
  "date",
  "end_date",
  '17',
  "label",
  "repeat",
  "repeat_unit",
  "type",
  "last_edited_at",
  "inflation_adjusted"
FROM "public"."transaction"
WHERE "id" = '2002';

INSERT INTO "public"."transaction" (
  "id",
  "created_at",
  "amount",
  "date",
  "end_date",
  "investment_id",
  "label",
  "repeat",
  "repeat_unit",
  "type",
  "last_edited_at",
  "inflation_adjusted"
)
SELECT
  '5003',
  "created_at",
  "amount",
  "date",
  "end_date",
  '17',
  "label",
  "repeat",
  "repeat_unit",
  "type",
  "last_edited_at",
  "inflation_adjusted"
FROM "public"."transaction"
WHERE "id" = '2003';

INSERT INTO "public"."transaction" (
  "id",
  "created_at",
  "amount",
  "date",
  "end_date",
  "investment_id",
  "label",
  "repeat",
  "repeat_unit",
  "type",
  "last_edited_at",
  "inflation_adjusted"
)
SELECT
  '5004',
  "created_at",
  "amount",
  "date",
  "end_date",
  '17',
  "label",
  "repeat",
  "repeat_unit",
  "type",
  "last_edited_at",
  "inflation_adjusted"
FROM "public"."transaction"
WHERE "id" = '2004';

INSERT INTO "public"."transaction" (
  "id",
  "created_at",
  "amount",
  "date",
  "end_date",
  "investment_id",
  "label",
  "repeat",
  "repeat_unit",
  "type",
  "last_edited_at",
  "inflation_adjusted"
)
SELECT
  '6001',
  "created_at",
  "amount",
  "date",
  "end_date",
  '18',
  "label",
  "repeat",
  "repeat_unit",
  "type",
  "last_edited_at",
  "inflation_adjusted"
FROM "public"."transaction"
WHERE "id" = '3001';

INSERT INTO "public"."transaction" (
  "id",
  "created_at",
  "amount",
  "date",
  "end_date",
  "investment_id",
  "label",
  "repeat",
  "repeat_unit",
  "type",
  "last_edited_at",
  "inflation_adjusted"
)
SELECT
  '6002',
  "created_at",
  "amount",
  "date",
  "end_date",
  '18',
  "label",
  "repeat",
  "repeat_unit",
  "type",
  "last_edited_at",
  "inflation_adjusted"
FROM "public"."transaction"
WHERE "id" = '3002';

INSERT INTO "public"."transaction" (
  "id",
  "created_at",
  "amount",
  "date",
  "end_date",
  "investment_id",
  "label",
  "repeat",
  "repeat_unit",
  "type",
  "last_edited_at",
  "inflation_adjusted"
)
SELECT
  '6003',
  "created_at",
  "amount",
  "date",
  "end_date",
  '18',
  "label",
  "repeat",
  "repeat_unit",
  "type",
  "last_edited_at",
  "inflation_adjusted"
FROM "public"."transaction"
WHERE "id" = '3003';

INSERT INTO "public"."transaction" (
  "id",
  "created_at",
  "amount",
  "date",
  "end_date",
  "investment_id",
  "label",
  "repeat",
  "repeat_unit",
  "type",
  "last_edited_at",
  "inflation_adjusted"
)
SELECT
  '6004',
  "created_at",
  "amount",
  "date",
  "end_date",
  '18',
  "label",
  "repeat",
  "repeat_unit",
  "type",
  "last_edited_at",
  "inflation_adjusted"
FROM "public"."transaction"
WHERE "id" = '3004';

-- Reset sequences to ensure proper ID generation
DO $$
BEGIN
  PERFORM setval('client_id_seq', (SELECT COALESCE(MAX(id), 0) FROM client) + 1, false);
  PERFORM setval('portfolio_id_seq', (SELECT COALESCE(MAX(id), 0) FROM portfolio) + 1, false);
  PERFORM setval('investment_id_seq', (SELECT COALESCE(MAX(id), 0) FROM investment) + 1, false);
  PERFORM setval('transaction_id_seq', (SELECT COALESCE(MAX(id), 0) FROM transaction) + 1, false);
END $$;
