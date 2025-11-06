# Goals Implementation Plan

## Overview

This document outlines an iterative approach to introduce the goal mechanism from the demo into the production portfolio page.

## Customer-Facing Milestones

This section groups the technical PRs into achievable user-facing milestones that can be communicated to customers:

### Milestone 1: Basic Retirement Goals 🎯 ✅ COMPLETED

**Status**: ✅ Completed

**What Users Can Now Do:**

Users with goals feature enabled can now:

- Create retirement goals using the retirement calculator with customizable parameters (savings, deposits, retirement budget)
- Preview retirement projections before saving
- See saved goals in a dedicated Goals tab with visual cards
- View automatic transaction schedules (deposits and withdrawals) generated from goal parameters on the portfolio graph
- Track goal progress over time with inflation-adjusted values
- Switch between Goals and Investments views to see different portfolio perspectives

**Tasks Completed**:

- [Task 1](#task-1-database-schema--goals-tab-ui): Database Schema & Goals Tab UI ✅
- [Task 2](#task-2-goal-calculator--preview): Goal Calculator & Preview ✅
- [Task 3](#task-3-display-goals-in-sidebar): Display Goals in Sidebar ✅
- [Task 4](#task-4-generate-transactions-for-goals-and-display-on-graph): Generate Transactions for Goals and Display on Graph ✅

---

### Milestone 2: Connect Real Investments to Goals 💰

**What users get**: Link actual investments to goals and see how they contribute

**Tasks included**:

- [Task 5](#task-5-transfer-transaction-type): Transfer Transaction Type
- [Task 6](#task-6-link-investments-to-goals-with-simple-rebalancing): Link Investments to Goals with Simple Rebalancing

**Customer message**: _"Connect your real investments to your retirement goals. Kalkul will show you how your portfolio is allocated across your goals and automatically rebalance yearly to maintain your target allocation."_

**Features**:

- Transfer funds between investments
- Link existing or new investments to goals
- Automatic yearly rebalancing
- See which investments fund which goals

---

### Milestone 3: Flexible Goal Management 🎨

**What users get**: Full control over goals with manual adjustments

**Tasks included**:

- [Task 8](#task-8-manual-transactions-for-goals): Manual Transactions for Goals
- [Task 9](#task-9-multiple-goal-types): Multiple Goal Types
- [Task 10](#task-10-goal-editing--management): Goal Editing & Management

**Customer message**: _"Take full control of your financial goals. Add one-time deposits or withdrawals, plan for your children's education, and easily update your goals as life changes."_

**Features**:

- Add manual transactions to goals
- Education goal calculator
- Edit and duplicate goals
- Delete goals with confirmation
- Goal calculator remembers your edits

---

### Milestone 4: Reusable Investment Templates 📚

**What users get**: Build a personal library of investments to reuse across portfolios

**Tasks included**:

- [Task 14](#task-14-personal-investment-library): Personal Investment Library

**Customer message**: _"Create your personal investment library. Save your favorite ETFs, funds, and stocks once, then reuse them across all your portfolios in seconds."_

**Features**:

- Personal investment library
- Save investment templates with fees and APY
- Quick portfolio setup from library
- Edit library from settings

---

### Milestone 5: Additional Goal Types 🏠

**What users get**: More calculators for different life goals

**Tasks included**:

- [Task 11](#task-11-additional-goal-calculators): Additional Goal Calculators

**Customer message**: _"Plan for any major life goal. Whether you're saving for a house down payment or any other significant purchase, Kalkul helps you create a savings plan with automatic inflation adjustments."_

**Features**:

- House buying calculator
- Large purchase calculator (generic)
- Multiple active goals
- Goal type selector

---

### Milestone 6: Advanced Rebalancing & Lifecycle Investing 🔄

**What users get**: Professional-grade portfolio management features

**Tasks included**:

- [Task 12](#task-12-advanced-rebalancing-options): Advanced Rebalancing Options
- [Task 13](#task-13-time-based-rebalancing-periods): Time-Based Rebalancing Periods

**Customer message**: _"Invest like a pro with advanced rebalancing strategies. Set different asset allocations for different life phases, choose rebalancing frequency, and let Kalkul manage the details."_

**Features**:

- Multiple rebalancing strategies (fixed, dynamic)
- Custom rebalancing intervals (monthly, quarterly, yearly)
- Time-based allocation periods (accumulation, withdrawal phases)
- Automatic cash buffer allocation
- Rebalancing conditions and exclusions

---

### Milestone 7: Transaction Execution Plan 📋

**What users get**: Clear action plan for portfolio management

**Tasks included**:

- [Task 15](#task-15-transaction-execution-plan-export): Transaction Execution Plan Export

**Customer message**: _"Never miss a transaction with your personalized execution plan. Export a clear schedule showing exactly when and how much to invest, with all your goals aggregated for easy execution."_

**Features**:

- Timeline view of all transactions
- Aggregated amounts when investments shared across goals
- Inflation-adjusted values
- Export to CSV or PDF
- Monthly/quarterly summaries

---

### Milestone 8: Extended Goal Calculators 🧮

**What users get**: Comprehensive calculators for diverse financial goals

**Tasks included**:

- [Task 16](#task-16-additional-calculator-implementations): Additional Calculator Implementations

**Customer message**: _"Plan for every major financial milestone. From buying real estate and paying off debt to building an emergency fund or launching a business - Kalkul has the calculator you need."_

**Features**:

**Real Estate**:

- Home Purchase calculator (down payment + closing costs planning)
- Rental Property Investment (with post-purchase cash flow vs mortgage tracking)
- Home Renovation savings planner

**Debt Management**:

- Debt Payoff calculator (target date with required monthly payment)
- Mortgage Acceleration planner (early payoff with fee consideration)

**Lifestyle**:

- Emergency Fund builder (based on monthly expenses, 3-6 months coverage)
- Sabbatical/Career Break planner (expense coverage during break)

**Business**:

- Startup Capital savings plan

---

## Current State

### Demo Implementation

- Goals stored in `demoStore.goals[]` with types (`retirement`, `education`)
- Goals have:
  - `calculationInput`: retirement/education calculation parameters
  - `linkedInvestments[]`: array of `{investmentId, percentage}`
  - `currency`: goal currency
  - `customDepositAmount`: optional override
- Goals generate transactions automatically via `goalToTransactions()`
- Two-tab UI: "Goals" tab vs "Investments" tab
- Flow: Calculator → Preview → Portfolio with goals sidebar → Balance investments

### Production Implementation

- Investments are standalone entities in `investment` table
- No goal concept exists
- Users manually create investments and transactions

## Proposed Approach: Goals as Special Investments

### Core Concept

Store goals as investments with:

- `goal_data` column (new): JSONB field for structured goal-specific data
  - Contains `type` field to identify goal type: `'retirement'`, `'education'`, `'house'`, etc.
  - If `goal_data` exists, the investment is a goal; otherwise it's a regular investment
  - The investment `type` column remains user-editable (e.g., 'ETF', 'Mutual Fund')

### Why This Approach?

**Advantages:**

1. ✅ Minimal schema changes (add 1 JSONB column)
2. ✅ Leverages existing investment infrastructure
3. ✅ Goals can have transactions like investments
4. ✅ Clear separation: presence of `goal_data` indicates it's a goal
5. ✅ Can link real investments to goals via join table
6. ✅ Natural fit in existing UI/UX patterns

**Disadvantages:**

- ⚠️ Mixing two concepts in one table
- ⚠️ Need careful handling of goal-specific fields
- ⚠️ `apy` field used differently (calculated vs user input)

### Alternative: Separate `goal` Table

**Not recommended** because:

- ❌ Creates parallel structure to investments
- ❌ Duplicate code for transactions, graph display, etc.
- ❌ Complex joins between goals and investments
- ❌ More maintenance burden

## Database Schema Changes

### Investment Table Changes

```sql
-- Add goal_data column
ALTER TABLE investment
ADD COLUMN goal_data JSONB;

-- Add check constraint: if goal_data exists, it must have type
ALTER TABLE investment
ADD CONSTRAINT investment_goal_data_check
CHECK (
  goal_data IS NULL OR
  (goal_data IS NOT NULL AND goal_data->>'type' IS NOT NULL)
);
```

### New Table: goal_investment_link

```sql
CREATE TABLE goal_investment_link (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  goal_id BIGINT NOT NULL REFERENCES investment(id) ON DELETE CASCADE,
  investment_id BIGINT NOT NULL REFERENCES investment(id) ON DELETE CASCADE,
  percentage NUMERIC NULL CHECK (percentage IS NULL OR (percentage >= 0 AND percentage <= 1)),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(goal_id, investment_id),
  CHECK (goal_id != investment_id)
);

-- NULL percentage means auto-calculate (equal split among all linked investments)
-- Non-NULL percentage means manually set by user (stored as 0-1, e.g., 0.6 for 60%)

CREATE INDEX idx_goal_investment_link_goal ON goal_investment_link(goal_id);
CREATE INDEX idx_goal_investment_link_investment ON goal_investment_link(investment_id);
```

## TypeScript Types

```typescript
// Retirement Goal Data
type RetirementGoalData = {
	type: 'retirement'
	depositStart: string // ISO date
	depositFrequency: 'month' | 'year'
	currentSavings: number
	customDepositAmount?: number
	retirementStart: string // ISO date
	retirementLength: number // years
	desiredBudget: number
	budgetFrequency: 'month' | 'year'
	apy: number // percentage
	inflation: number // percentage
}

// Education Goal Data
type EducationGoalData = {
	type: 'education'
	childName?: string
	childBirthDate?: string // ISO date
	depositStart: string // ISO date
	depositFrequency: 'month' | 'year'
	currentSavings: number
	customDepositAmount?: number
	educationStart: string // ISO date
	educationDuration: number // years
	desiredBudget: number
	budgetFrequency: 'month' | 'year'
	apy: number // percentage
	inflation: number // percentage
}

// Goal Investment Link
type GoalInvestmentLink = {
	id: number
	goal_id: number
	investment_id: number
	percentage: number | undefined // undefined = auto-calculated (equal split), number = manually set (0-1, e.g., 0.6 for 60%)
	created_at: string
}

// Union type for goals
type GoalData = RetirementGoalData | EducationGoalData

type Goal = Investment & {
	goal_data: GoalData
}

// Specific goal types
type RetirementGoal = Investment & {
	goal_data: RetirementGoalData
}

type EducationGoal = Investment & {
	goal_data: EducationGoalData
}
```

## Feature Flag

Goals feature will be controlled by a constant in code to enable progressive rollout:

```typescript
// Add to src/lib/feature-flags.ts (or similar)
export const GOALS_ENABLED_FOR_EMAILS = [
	'demo@kalkul.app',
	// Add more emails as we roll out
]

// Helper function
export function isGoalsEnabledForEmail(email: string): boolean {
	// If array is empty, feature is disabled for everyone
	// If array has emails, feature is enabled only for those emails
	// To enable for all users, remove this feature flag check entirely
	return GOALS_ENABLED_FOR_EMAILS.includes(email)
}
```

## Iterative Task Sequence

### Task 1: Database Schema & Goals Tab UI ✅ COMPLETED

**GitHub Issue**: [#1042](https://github.com/snaha-net/kalkul.app/issues/1042) - Introduce goal as investment

**Goal**: Foundation + empty goals tab (feature flagged)

**Status**: ✅ Completed

**Changes Implemented:**

- ✅ Added `goal_data` JSONB column to `investment` table (contains `type` to identify goal type)
- ✅ Created `goal_investment_link` table with RLS policies
- ✅ Created database migration file `supabase/migrations/20251101091418_goals_schema.sql`
- ✅ Updated TypeScript types in `src/lib/types.ts`:
  - `RetirementGoalData` with `type: 'retirement'`
  - `EducationGoalData` with `type: 'education'`
  - `Goal`, `RetirementGoal`, `EducationGoal` types
  - `GoalInvestmentLink` type
  - Made `Investment.goal_data` optional for backward compatibility
- ✅ Added RLS policy for `goal_investment_link` table (follows existing pattern via client.advisor)
- ✅ Added Goals/Investments tab bar to portfolio page (`src/routes/(app)/client/[id]/portfolio/[portfolio_id]/+page.svelte`)
- ✅ Created `src/lib/components/goals-sidebar.svelte` component
- ✅ Created `src/lib/components/goal-card.svelte` component (skeleton for Task 2)
- ✅ Added feature flag system in `src/lib/feature-flags.ts`:
  - `GOALS_ENABLED_FOR_EMAILS` array
  - `isGoalsEnabledForEmail()` function
  - Enabled for: `goals@kalkul.app`
- ✅ Implemented filter logic using `$derived`:
  - Goals: `goal_data !== undefined && goal_data !== null`
  - Regular investments: `goal_data === undefined || goal_data === null`
- ✅ Added seed data:
  - Goals account (goals@kalkul.app) with two portfolios:
    - Portfolio 101: "Investment only portfolio" with regular investment
    - Portfolio 102: "Single goal portfolio" with retirement goal
- ✅ Generated database types with `pnpm supabase gen types`

**Files Created:**

- `supabase/migrations/20251101091418_goals_schema.sql`
- `src/lib/feature-flags.ts`
- `src/lib/components/goals-sidebar.svelte`
- `src/lib/components/goal-card.svelte`

**Files Modified:**

- `src/lib/types.ts` - Added goal type definitions
- `src/lib/typesdb.ts` - Regenerated from database schema
- `src/routes/(app)/client/[id]/portfolio/[portfolio_id]/+page.svelte` - Added tabs and filtering
- `supabase/seed.sql` - Added goals account and test data
- `src/lib/locales/en.json` - Added `page.goals.title` and `page.goals.linkedInvestments`
- `src/lib/locales/cs.json` - Added `page.goals.title` and `page.goals.linkedInvestments`
- `src/lib/adapters/supabase/index.ts` - Type cast fix for `investmentStore`

**Test Data Added:**

- Goals account: `goals@kalkul.app` (password: `demo123`)
  - Client ID: 100
  - Portfolio 101: "Investment only portfolio" (regular investment for testing)
  - Portfolio 102: "Single goal portfolio" with retirement goal:
    - Investment ID: 1002 with `goal_data.type = 'retirement'`
    - Initial savings: 350,000 CZK (inflation adjusted)
    - Monthly contributions: 7,090 CZK (inflation adjusted)
    - Retirement start: 2050-03-15 (age 65)
    - Desired budget: 20,000 CZK/month for 20 years (inflation adjusted)
    - APY: 5.5%, Inflation: 2.5%

**Testing Results:**

- ✅ Migration runs successfully
- ✅ Goals tab appears only for flagged users (goals@kalkul.app)
- ✅ Tab switching works between Goals and Investments
- ✅ TypeScript check passes (0 errors, 0 warnings)
- ✅ Linting passes
- ✅ Database reset works correctly

**User Value:**

- Feature-flagged users (goals@kalkul.app) see Goals tab
- Goals tab shows skeleton goal cards (ready for Task 2 implementation)
- Other users see no changes (feature hidden)
- Test data exists in database for goals@kalkul.app account
- Foundation ready for Task 2 (Goal Calculator)

---

### Task 2: Goal Calculator & Preview ✅ COMPLETED

**GitHub Issues**:

- [#1043](https://github.com/snaha-net/kalkul.app/issues/1043) - Add retirement calculator
- [#1045](https://github.com/snaha-net/kalkul.app/issues/1045) - Add calculator selector page

**Goal**: Users can calculate and save retirement goals

**Status**: ✅ Completed

**Changes Implemented:**

- ✅ Moved retirement calculation logic from `src/lib/demo/maths/retirement-calc.ts` to `src/lib/@snaha/kalkul-calculators/retirement/retirement.ts`
  - Maintains all existing calculation functions: `calculateWhatYouNeed()`, `calculateWhatYouHave()`, `calculateRequiredDeposit()`, `generateYears()`
  - All 20 unit tests pass after migration
- ✅ Created production retirement calculator component (`src/lib/components/goals-retirement-calculator.svelte`)
  - Adapted from demo version, removed demo-specific code (keyboard shortcuts, demoStore)
  - Uses real client data and portfolio currency
  - Accepts `onCalculate` callback for navigation
- ✅ Created production retirement preview component (`src/lib/components/goals-retirement-preview.svelte`)
  - Shows "What You Need" vs "What You Have" charts
  - Allows deposit amount adjustment
  - Calls `saveGoal` callback to create goal in database
- ✅ Added routes to `src/lib/routes.ts`:
  - `RETIREMENT_GOAL_CALCULATOR(clientId, portfolioId)`
  - `RETIREMENT_GOAL_PREVIEW(clientId, portfolioId)`
- ✅ Created route pages:
  - `/client/[id]/portfolio/[portfolio_id]/goals/retirement/calculator/+page@(app).svelte`
  - `/client/[id]/portfolio/[portfolio_id]/goals/retirement/preview/+page@(app).svelte`
- ✅ Created temporary state store (`src/lib/stores/goal-calculator.svelte.ts`) to pass data between calculator and preview
- ✅ Added goal adapter methods to `src/lib/adapters/supabase/index.ts`:
  - `addGoal(goal)` - Creates investment with `goal_data`
  - `updateGoal(goal)` - Updates goal data
  - Added methods to Adapter interface in `src/lib/adapters/index.ts`
- ✅ Enabled "Add goal" button in `src/lib/components/goals-sidebar.svelte`
  - Navigates to retirement calculator
  - Button now functional (was disabled in Task 1)
- ✅ Updated portfolio page to wire up `addGoal` callback with navigation
- ✅ Implemented automatic transaction generation:
  - Created `src/lib/@snaha/kalkul-calculators/retirement/goal-transactions.ts` with `retirementGoalToTransactions()`
  - Generates 3 types of transactions from goal data:
    1. **Initial Savings** - One-time deposit of current savings (if > 0, inflation-adjusted)
    2. **Regular Deposits** - Recurring deposits until retirement (if > 0, inflation-adjusted)
    3. **Retirement Withdrawals** - Recurring withdrawals during retirement (if > 0, inflation-adjusted)
  - Transactions skip creation if amount is 0 (prevents unnecessary $0 transactions)
  - Uses localized labels from `demo.transactions.*` keys
  - 8 comprehensive unit tests covering all edge cases
- ✅ Fixed navigation redirect issue (await `goto()` before clearing store to prevent $effect race condition)
- ✅ Implemented delete goal functionality:
  - Added delete modal to `goal-card.svelte`
  - Uses existing `DeleteModal` component
  - Added localization strings to both `en.json` and `cs.json`:
    - `component.goalCard.deleteGoalWarning`
    - `component.goalCard.deleteGoalWarningTitle`
  - Deletes goal (investment) using `adapter.deleteInvestment()`

**Files Created:**

- `src/lib/@snaha/kalkul-calculators/retirement/retirement.ts` (moved from demo)
- `src/lib/@snaha/kalkul-calculators/retirement/retirement.test.ts` (moved from demo)
- `src/lib/@snaha/kalkul-calculators/retirement/goal-transactions.ts`
- `src/lib/@snaha/kalkul-calculators/retirement/goal-transactions.test.ts`
- `src/lib/components/goals-retirement-calculator.svelte`
- `src/lib/components/goals-retirement-preview.svelte`
- `src/lib/stores/goal-calculator.svelte.ts`
- `src/routes/(app)/client/[id]/portfolio/[portfolio_id]/goals/retirement/calculator/+page@(app).svelte`
- `src/routes/(app)/client/[id]/portfolio/[portfolio_id]/goals/retirement/preview/+page@(app).svelte`

**Files Modified:**

- `src/lib/routes.ts` - Added retirement goal routes
- `src/lib/adapters/supabase/index.ts` - Added `addGoal()` and `updateGoal()` methods
- `src/lib/adapters/index.ts` - Added goal methods to Adapter interface
- `src/lib/components/goals-sidebar.svelte` - Enabled "Add goal" button
- `src/lib/components/goal-card.svelte` - Added delete functionality with modal
- `src/routes/(app)/client/[id]/portfolio/[portfolio_id]/+page.svelte` - Wired up addGoal callback
- `src/lib/demo/components/retirement-calculator.svelte` - Updated calculator import path
- `src/lib/demo/components/retirement-preview.svelte` - No changes needed (demo version, not renamed)
- `src/lib/demo/stores/demo.svelte.ts` - Updated import path
- `src/routes/(app)/demo/portfolio/retirement/preview/+page@(app).svelte` - Updated import path
- `src/lib/locales/en.json` - Added delete goal warning strings
- `src/lib/locales/cs.json` - Added delete goal warning strings (Czech translations)

**Files Deleted:**

- `src/lib/demo/maths/retirement-calc.ts` (moved to @snaha/kalkul-calculators)
- `src/lib/demo/maths/retirement-calc.test.ts` (moved to @snaha/kalkul-calculators)

**Testing Results:**

- ✅ Calculator produces correct deposit amounts
- ✅ Preview charts display "What You Need" vs "What You Have" correctly
- ✅ Goal saves to database with complete `goal_data` structure
- ✅ Goal appears in Goals tab after creation
- ✅ Transactions auto-generate (3 types: initial savings, recurring deposits, withdrawals)
- ✅ All 20 retirement calculation tests pass
- ✅ All 8 goal transaction generation tests pass
- ✅ Demo still works with updated import paths
- ✅ TypeScript check passes (0 errors, 0 warnings)
- ✅ ESLint passes
- ✅ Knip passes (only expected unused types for future tasks)
- ✅ Navigation redirects correctly after goal creation
- ✅ Delete goal modal appears and deletes correctly
- ✅ Zero-amount transactions are skipped (no $0 recurring deposits or withdrawals)

**User Value:**

- Users can create retirement goals through calculator
- Visual preview shows if savings plan is on track
- Goals save to database with all calculation parameters
- Transactions automatically created (initial, recurring deposits, withdrawals)
- Goals appear in Goals tab and can be deleted
- Clear "What You Need" vs "What You Have" visualization
- Deposit amount can be adjusted before saving
- Navigation flow: Portfolio → Calculator → Preview → Portfolio (with new goal)

**Implementation Notes:**

- Used temporary store (`goalCalculatorStore`) to pass data between calculator and preview pages
- Store is cleared after navigation to prevent stale data
- Transactions use localized labels from existing demo translation keys
- Goals are stored as investments with `goal_data` JSONB column
- APY from calculator is stored in investment's `apy` field
- All fee fields set to 0/null for goals (not applicable)
- Transaction generation skips $0 amounts to keep transaction list clean
- Delete functionality follows same pattern as investment deletion
- **All transactions are inflation-adjusted** (including initial savings) for consistent growth calculations

---

### Task 3: Display Goals in Sidebar ✅ COMPLETED

**GitHub Issue**: [#1056](https://github.com/snaha-net/kalkul.app/issues/1056) - Add data colors to goals

**Goal**: Users can see their saved goals with visual representation in graph

**Status**: ✅ Completed

**Changes Implemented:**

- ✅ `goal-card.svelte` displays in sidebar with goal information
- ✅ Goals load from database and show in Goals tab
- ✅ Goal information displayed (name from investment)
- ✅ Delete functionality works
- ✅ **Goal-specific colors added to graph visualization:**
  - Assigned unique colors to each goal (reversed from `SERIES_COLORS` array)
  - Goals use colors from end of color array to distinguish from investments
  - Graph properly displays goal transactions in goal's color
- ✅ **Separate portfolio simulations for goals and investments** (performance optimization)
  - Separate `goalsSimulation` and `investmentsSimulation` stores
  - Avoids recalculation on tab switch
  - Each simulation calculates independently when data changes
- ✅ **Tab switching implementation:**
  - Goals default to active tab when feature is enabled for user
  - Tab selection controls which simulation data is displayed
  - Correct transactions and investments shown per tab
- ✅ **Empty state handling:**
  - `hasAnyInvestments` checks both goals and investments when feature enabled
  - Shows empty page only when truly empty

**Files Modified:**

- `src/lib/components/goal-card.svelte` - Added reversed color indexing
- `src/routes/(app)/client/[id]/portfolio/[portfolio_id]/+page.svelte` - Separate simulations, tab switching, filtered transactions
- `src/lib/feature-flags.ts` - Removed `demo@kalkul.app` from goals feature flag

**Testing Results:**

- ✅ Multiple goals show with distinct colors
- ✅ Goal colors appear in graph (reversed from investments)
- ✅ Tab switching works correctly between Goals and Investments
- ✅ Separate simulations prevent unnecessary recalculation
- ✅ Goal cards display appropriately
- ✅ Empty state appears only when no goals and no investments exist
- ✅ Performance optimized - simulations only recalculate when their specific data changes

**User Value:**

- Visual goal tracking in portfolio graph
- See saved goals alongside investments
- Identify goal-related transactions by color (goals use reversed color scheme)
- Track progress toward goals visually
- Fast tab switching without recalculating simulations
- Clear separation between goal-based and investment-based portfolio views

---

### Task 4: Generate Transactions for Goals and Display on Graph ✅ COMPLETED

**Goal**: Automatically generate and visualize transactions from goal data

**Status**: ✅ Completed

**Changes Implemented:**

- ✅ Created `goal-transactions.ts` calculator in `src/lib/@snaha/kalkul-calculators/retirement/`
- ✅ Implemented `calculateGoalTransactions()` function to generate deposit/withdrawal transactions from goal data
- ✅ Goal transactions display on portfolio graph with goal-based grouping
- ✅ Goal transactions colored by goal (using reversed color scheme from investments)
- ✅ Calculator generates transactions based on:
  - Initial savings (one-time deposit)
  - Regular deposits (monthly/yearly until retirement)
  - Retirement withdrawals (monthly/yearly during retirement period)
  - All transactions respect inflation adjustment settings

**Files Created:**

- `src/lib/@snaha/kalkul-calculators/retirement/goal-transactions.ts` - Goal transaction generation logic
- `src/lib/@snaha/kalkul-calculators/retirement/goal-transactions.test.ts` - Tests for transaction generation

**Files Modified:**

- `src/routes/(app)/client/[id]/portfolio/[portfolio_id]/+page.svelte` - Display goal transactions on graph
- `src/lib/stores/goal-calculator.svelte.ts` - Calculate goal transactions iteratively

**Testing Results:**

- ✅ Transactions generate correctly from goal data
- ✅ Graph displays goal transactions in goal's color
- ✅ Inflation-adjusted transactions calculated properly
- ✅ Regular deposits and retirement withdrawals appear on timeline
- ✅ Goal simulations run with generated transactions

**User Value:**

- Automatic transaction planning from goal parameters
- Visual representation of savings and withdrawal schedule
- See exact monthly/yearly contributions needed
- Track goal progress over time on graph

---

### Task 5: Transfer Transaction Type

**GitHub Issues**:

- [#299](https://github.com/snaha-net/kalkul.app/issues/299) - Add `Transfer` transaction type
- [#1049](https://github.com/snaha-net/kalkul.app/issues/1049) - Making transactions between investments

**Goal**: Support moving funds between investments

**Changes:**

- Add `transfer` transaction type to database
- Add `target_investment_id` field to transactions (nullable, for transfers)
- Update transaction form to support transfer type
- Validate transfer transactions (withdrawal from source, deposit to target)
- Update graph calculations to handle transfers

**User Value:**

- Move funds between investments without leaving portfolio
- Track rebalancing activities

**Testing:**

- Transfer transactions create paired deposit/withdrawal
- Graph calculations handle transfers correctly
- Transfer preserves total portfolio value

---

### Task 6: Link Investments to Goals with Simple Rebalancing

**GitHub Issues**:

- [#1052](https://github.com/snaha-net/kalkul.app/issues/1052) - Add/remove investment from goal's balance
- [#1053](https://github.com/snaha-net/kalkul.app/issues/1053) - Adding 'existing' investment to a goal

**Goal**: Users can allocate investments to goals with automatic rebalancing

**Changes:**

- Add "Balance Investments" page (from demo `balance-investments/[goal_index]`)
- UI to select investments and set percentages (fixed percentage strategy)
- **Allow selecting existing portfolio investments** (not just creating new ones)
  - **Flow for linking existing investments:**
    1. In "Balance Investments" page, show two options: "Create New Investment" and "Link Existing Investment"
    2. When choosing "Link Existing", show list of all portfolio investments not yet linked to this goal
    3. Select investment(s) from list
    4. Set percentage allocation for each
    5. Transactions from goal calculators will flow to the linked investment (no duplication)
- When adding existing investment, transactions go to same investment (no duplication)
- Save/update links in `goal_investment_link` table with `rebalancing_strategy` field
- Show linked investments in goal card
- Add adapter methods for link CRUD
- **Distribute goal calculator transactions to linked investments:**
  - Take goal's generated transactions (deposits/withdrawals from Task 4)
  - Split them across linked investments based on allocation percentages
  - Create actual investment transactions for each linked investment
  - Example: 10,000 CZK monthly deposit with 60% stocks / 40% bonds creates two transactions
- **Generate yearly rebalancing transactions** using transfer type
- Add `rebalancing_interval` to goal_data (default: 'year')
- Auto-generate transfer transactions to maintain target percentages

**User Value:**

- Connect real investments to goals
- Reuse existing investments across goals
- Allocate portfolio to different goals
- Automatic yearly rebalancing to maintain allocations
- Clear flow for linking vs creating investments

**Testing:**

- Can select existing investments
- Can create new investments
- Links save correctly
- Percentages validate
- Yearly rebalancing transactions generate correctly
- Transfers maintain target allocations
- Shared investments aggregate transactions correctly

---

### Task 7: Display Investment Transactions in Goals View

**GitHub Issue**: [#1047](https://github.com/snaha-net/kalkul.app/issues/1047) - Show transactions that are not assigned to a goal in 'Goals' view

**Goal**: Show investment transactions alongside goals for complete portfolio view

**Changes:**

- Show investment transactions in Goals view (transactions not linked to any goal)
- Display investment transactions in sidebar alongside goal cards
- Visual distinction between goal transactions and investment transactions
- Ensure total portfolio value matches between Goals/Investments views
- Investment transactions use standard investment colors

**User Value:**

- See all portfolio activity even in Goals view
- Understand complete portfolio picture
- Identify which transactions are from regular investments vs goals
- Portfolio value consistency across tabs

**Testing:**

- Investment transactions appear in Goals view
- Investment transactions visible in sidebar
- Graph displays both goal and investment transactions
- Portfolio value consistent across Goals/Investments views
- Clear visual distinction between transaction sources

---

### Task 8: Manual Transactions for Goals

**GitHub Issue**: [#1048](https://github.com/snaha-net/kalkul.app/issues/1048) - Add 'manual' transaction to a goal (not coming from calculator)

**Goal**: Allow users to add manual transactions to goals

**Changes:**

- Add ability to create manual transactions for a goal (regular transaction creation)
- Display distinction between automatic (in `automatic_transaction_ids` array) and manual transactions
- When recalculating goal:
  - Delete transactions with IDs in `automatic_transaction_ids` array
  - Regenerate automatic transactions and update array
  - Preserve all other transactions (manual)
- Show manual transactions in goal card separately or with visual indicator
- Manual transactions can be linked to goals but are not tracked in automatic array

**User Value:**

- Flexibility to add one-off deposits/withdrawals to goals
- Preserve custom transactions when updating goal calculations
- Clear distinction between calculator-generated and user-added transactions

**Testing:**

- Manual transactions persist when goal is recalculated
- Automatic transactions update correctly
- Manual transactions not in automatic_transaction_ids array
- Clear visual distinction between transaction types

---

### Task 9: Multiple Goal Types

**GitHub Issue**: [#1044](https://github.com/snaha-net/kalkul.app/issues/1044) - Add kids education calculator

**Goal**: Support education goals alongside retirement

**Changes:**

- Add education goal calculator
- Use same calculation logic with education-specific fields
- Update UI to handle different goal types
- Add goal type selector

**User Value:**

- Plan for children's education expenses
- Multiple goal types

**Testing:**

- Education calculator works correctly
- Different goal types display correctly
- Calculations are accurate

---

### Task 10: Goal Editing & Management

**Goal**: Full CRUD operations on goals

**Changes:**

- Edit goal details and recalculate (preserve manual transactions)
- Delete goals (cascade to linked investments)
- Duplicate goals
- Goal card actions menu
- Option to restart calculator from edited values

**User Value:**

- Flexible goal management
- Easy goal modifications

**Testing:**

- Edit updates correctly
- Delete cascades properly
- Duplicate creates independent copy
- Manual transactions preserved on recalculation

---

### Task 11: Additional Goal Calculators

**Goal**: Support more goal types beyond retirement and education

**Changes:**

- Add house buying goal calculator
  - Target purchase date
  - Down payment amount
  - Current savings
  - Inflation-adjusted calculations
- Add large purchase goal calculator (generic)
  - Flexible for any major purchase
  - Target amount and date
  - Regular savings plan
- Update goal type selector UI
- Reuse calculation logic where possible

**User Value:**

- Plan for home purchase
- Save for major life events
- Comprehensive financial planning

**Testing:**

- House calculator works correctly
- Large purchase calculator works correctly
- Goal type selector shows all options
- All goal types display properly in portfolio

---

### Task 12: Advanced Rebalancing Options

**GitHub Issue**: [#1050](https://github.com/snaha-net/kalkul.app/issues/1050) - Rebalancing options for investments under a goal

**Goal**: Multiple rebalancing strategies and intervals

**Changes:**

- Extend `rebalancing_interval` options (monthly, quarterly, yearly)
- **Strategy 1: Fixed percentage** (current behavior from Task 5)
  - Rebalance through transfer transactions at specified intervals
- **Strategy 2: Dynamic adjustment** - auto-adjust transaction amounts to maintain goal percentages over time
  - Instead of transfers, adjust ongoing deposit amounts to naturally rebalance
  - Useful for rebalancing through deposits rather than transfers
- **Rebalancing through deposits AND transfers:**
  - Support rebalancing via regular deposits (adjusting amounts)
  - Support rebalancing via transfer transactions (moving funds between investments)
  - Example use case: Rebalance every 3 months, but only for investments held for 3+ years
- UI to select rebalancing strategy and interval
- Add visual indicator when dynamic percentages differ from target
- Add 2-3% automatic cash allocation to goals (0% APY, no fees)
- Rebalancing conditions:
  - Minimum investment age (e.g., only rebalance investments held for 3+ years)
  - Minimum amount threshold
  - Exclusion list (investments to skip)

**User Value:**

- Flexible rebalancing intervals (monthly, quarterly, yearly)
- Multiple allocation strategies (fixed vs dynamic)
- Rebalance through deposits or transfers
- Cash buffer for goals
- Fine-grained rebalancing control with conditions

**Testing:**

- Different intervals work correctly
- Dynamic adjustment calculates correctly
- Cash allocation appears automatically
- Conditions properly filter investments
- Minimum investment age condition works
- Rebalancing through deposits vs transfers both work

---

### Task 13: Time-Based Rebalancing Periods

**GitHub Issue**: [#1051](https://github.com/snaha-net/kalkul.app/issues/1051) - Multiple balances for goal investments over time

**Goal**: Different investment allocations for different goal phases

**Changes:**

- Add `goal_rebalancing_period` table (goal_id, start_date, end_date, period_name)
- Link investment allocations to periods (add `period_id` to `goal_investment_link`)
- UI with chart markers to define time periods (snap to key dates)
- Allow different investment mix per period
- **Different strategies for accumulation and withdrawal periods:**
  - **Accumulation phase**: Typically more aggressive allocation (higher equity %, higher APY)
    - Focus on growth investments
    - Can tolerate more volatility
    - Example: 80% stocks, 20% bonds during working years
  - **Withdrawal phase**: Typically more conservative allocation (lower volatility, capital preservation)
    - Focus on stable income and capital preservation
    - Lower risk tolerance
    - Example: 40% stocks, 60% bonds during retirement
  - UI should make it easy to define these common lifecycle patterns
- Default period covers full goal timeline
- New periods start blank (must define investments)
- Show periods as expandable subsections in goal card
- Generate rebalancing transactions specific to each period
- Period transitions automatically adjust investment allocations

**User Value:**

- Lifecycle investing strategies
- Age-appropriate risk adjustment
- Different allocations for accumulation vs withdrawal phases
- Automatic strategy adjustment as goals progress through life phases

**Testing:**

- Multiple periods can be defined
- Investment allocations specific to each period
- Transitions between periods work correctly
- Chart markers snap to key dates
- Rebalancing respects period boundaries
- Accumulation vs withdrawal periods have appropriate defaults

---

### Task 14: Personal Investment Library

**GitHub Issues**:

- [#1054](https://github.com/snaha-net/kalkul.app/issues/1054) - Personal 'Investments library'
- [#1031](https://github.com/snaha-net/kalkul.app/issues/1031) - Templates for investments

**Goal**: Reusable investment templates across portfolios

**Changes:**

- Add `investment_library` table (user_id, name, apy, fees structure, etc.)
- UI to manage library: add, edit, delete investment templates
- When creating investment, option to "Add from Library" or "Create New"
- Templates store: name, type, apy, entry_fee, exit_fee, management_fee, ter, advanced_fees settings
- Library entries are user-specific (not shared across users)
- When using library investment, copy values to portfolio investment (not a reference)
- Library management page (accessible from user settings or portfolio page)

**User Value:**

- Reuse common investments across portfolios
- Faster portfolio setup
- Consistent investment parameters
- Replacement for ISIN import for now

**Testing:**

- Can create library entries
- Can edit library entries
- Can use library to create investments
- Library entries are user-specific
- Copying from library works correctly

---

### Task 15: Transaction Execution Plan Export

**GitHub Issue**: [#1055](https://github.com/snaha-net/kalkul.app/issues/1055) - Transactions execution plan

**Goal**: Exportable transaction schedule with aggregated amounts

**Changes:**

- Generate transaction execution plan view
- Show cumulative transaction amounts per investment over time
- Include inflation-adjusted values
- Aggregate amounts when investment used across multiple goals
- Display changing amounts for dynamic rebalancing
- Export options: CSV, PDF
- Timeline view showing when to execute each transaction
- Group by investment with total amounts per period

**User Value:**

- Clear action plan for portfolio management
- See total amounts to invest per period
- Account for inflation in planning
- Simplified execution for multi-goal portfolios

**Testing:**

- Execution plan calculates correctly
- Inflation adjustments accurate
- Multi-goal aggregation works
- Export formats generate correctly
- Timeline displays all required transactions

---

### Task 16: Additional Calculator Implementations

**Goal**: Support comprehensive range of financial calculators

**Changes:**

**Real Estate Calculators:**

1. **Home Purchase Calculator**

   - Inputs: home price, down payment %, closing costs, purchase date
   - Calculate required savings with inflation adjustment
   - Show timeline for reaching down payment goal

2. **Rental Property Investment**

   - Phase 1: Save for property (property price, down payment, acquisition costs)
   - Phase 2 (post-purchase): Track cash flow
     - Monthly rent income
     - Expenses (property tax, insurance, maintenance)
     - Mortgage payment details
     - Show rental income vs mortgage/expenses over time

3. **Home Renovation**
   - Inputs: project cost, target start date
   - Simple savings plan with inflation

**Debt Management Calculators:**

1. **Debt Payoff Calculator**

   - Inputs: current balance, interest rate, target payoff date
   - Calculate required monthly payment
   - Show interest paid over time
   - Option for extra payments

2. **Mortgage Payoff Acceleration**
   - Inputs: remaining balance, interest rate, current payment, target payoff date
   - Include early payoff fee consideration
   - Compare standard vs accelerated payoff
   - Show interest savings

**Lifestyle Calculators:**

1. **Emergency Fund**

   - Inputs: monthly expenses, target months of coverage (default 3-6)
   - Calculate total target amount
   - Savings plan to reach target

2. **Large Purchase Goal** (already in Task 10, expand)

   - Generic calculator for car, wedding, vacation, etc.
   - Inputs: target amount, target date, current savings

3. **Sabbatical / Career Break**
   - Inputs: break length, monthly expenses during break, start date
   - Calculate total needed amount
   - Savings timeline

**Business Calculators:**

1. **Startup Capital**
   - Inputs: required capital, launch date
   - Savings plan with milestones
   - Optional: runway calculation (monthly burn rate)

**TypeScript Types to Add:**

```typescript
// Home Purchase Goal
type HomePurchaseGoalData = {
	type: 'home_purchase'
	homePrice: number
	downPaymentPercent: number
	closingCosts: number
	purchaseDate: string // ISO date
	depositStart: string
	depositFrequency: 'month' | 'year'
	currentSavings: number
	apy: number
	inflation: number
}

// Rental Property Goal
type RentalPropertyGoalData = {
	type: 'rental_property'
	propertyPrice: number
	downPayment: number
	acquisitionCosts: number
	purchaseDate: string
	monthlyRent?: number // Optional, for post-purchase phase
	monthlyExpenses?: number
	mortgagePayment?: number
	depositStart: string
	depositFrequency: 'month' | 'year'
	currentSavings: number
	apy: number
	inflation: number
}

// Home Renovation Goal
type HomeRenovationGoalData = {
	type: 'home_renovation'
	projectCost: number
	projectStartDate: string
	depositStart: string
	depositFrequency: 'month' | 'year'
	currentSavings: number
	apy: number
	inflation: number
}

// Debt Payoff Goal
type DebtPayoffGoalData = {
	type: 'debt_payoff'
	currentBalance: number
	interestRate: number
	targetPayoffDate: string
	minimumPayment?: number
}

// Mortgage Acceleration Goal
type MortgageAccelerationGoalData = {
	type: 'mortgage_acceleration'
	remainingBalance: number
	interestRate: number
	currentPayment: number
	targetPayoffDate: string
	earlyPayoffFee?: number
}

// Emergency Fund Goal
type EmergencyFundGoalData = {
	type: 'emergency_fund'
	monthlyExpenses: number
	targetMonthsCoverage: number // e.g., 3, 6, 12
	depositStart: string
	depositFrequency: 'month' | 'year'
	currentSavings: number
	apy: number
}

// Sabbatical Goal
type SabbaticalGoalData = {
	type: 'sabbatical'
	breakLengthMonths: number
	monthlyExpenses: number
	startDate: string
	depositStart: string
	depositFrequency: 'month' | 'year'
	currentSavings: number
	apy: number
	inflation: number
}

// Startup Capital Goal
type StartupCapitalGoalData = {
	type: 'startup_capital'
	requiredCapital: number
	launchDate: string
	depositStart: string
	depositFrequency: 'month' | 'year'
	currentSavings: number
	apy: number
	inflation: number
	monthlyBurnRate?: number // Optional for runway calculation
}

// Large Purchase Goal (already exists in Task 10, document here)
type LargePurchaseGoalData = {
	type: 'large_purchase'
	purchaseType?: string // e.g., 'car', 'wedding', 'vacation'
	targetAmount: number
	targetDate: string
	depositStart: string
	depositFrequency: 'month' | 'year'
	currentSavings: number
	apy: number
	inflation: number
}
```

**User Value:**

- Comprehensive financial planning across all life areas
- Specialized calculators for specific use cases
- Debt reduction planning
- Real estate investment tracking
- Business launch planning

**Testing:**

- Each calculator produces correct amounts
- All calculators integrate with goal system
- Post-purchase tracking works for rental property
- Interest calculations accurate for debt payoff
- Expense-based calculations work for emergency fund

**Notes:**

- This task represents future expansion - calculator list is exploratory
- Prioritize based on user demand
- Some calculators may be split into separate tasks
- Rental property post-purchase tracking may need additional UI considerations

---

## Data Structure Example

```typescript
// Example: Retirement goal stored as investment
{
  id: 42,
  portfolio_id: 1,
  name: "Retirement at 65",
  type: "ETF",  // User-editable investment type
  apy: 5.5,  // Calculated from goal inputs
  goal_data: {
    type: "retirement",  // Identifies this as a retirement goal
    depositStart: "2025-01-01",
    retirementStart: "2055-01-01",
    retirementLength: 20,
    desiredBudget: 50000,
    budgetFrequency: "year",
    currentSavings: 10000,
    inflation: 2.5,
    depositFrequency: "month",
    customDepositAmount: 2500
  },
  created_at: "2025-01-15T10:00:00Z",
  last_edited_at: "2025-01-15T10:00:00Z",
  // Regular investment fields unused for goals
  advanced_fees: false,
  entry_fee: null,
  exit_fee: null,
  // ...
}

// Links to real investments
goal_investment_link: [
  { goal_id: 42, investment_id: 1, percentage: 60 },  // 60% from S&P 500
  { goal_id: 42, investment_id: 2, percentage: 40 },  // 40% from Bonds
]
```

## Design Decisions

1. **Goals appear in Goals tab only**

   - Goals are separate from investments in the UI
   - Keep investments tab clean and focused on direct investments
   - Goals tab shows goal-specific information and linked investments

2. **APY handling for goals**

   - Store calculated APY in existing `investment.apy` field
   - Maintains consistency with investment structure
   - Goal calculations determine the APY value

3. **Investments can be linked to multiple goals**

   - A single investment can serve multiple goals simultaneously
   - Percentage split tracks how each investment is allocated across goals
   - Allows flexible portfolio allocation strategies

4. **Investment percentage allocation**

   - UI prevents creating invalid percentage allocations (must sum to 100%)
   - If somehow percentages don't sum to 100%, allow but show warning
   - Primary enforcement through UI validation, not strict database constraints

5. **Goal transactions are not directly editable**
   - Automatic transactions (tracked in `automatic_transaction_ids`) are regenerated from goal data
   - Manual transactions can be added but are kept separate
   - Editing happens through calculator, not individual transaction editing

## Migration Strategy

### For Existing Users

- No impact until they create their first goal
- Existing investments remain unchanged
- Goals are opt-in feature

### For Demo Users

- Demo continues to use `demoStore` with in-memory state
- Can gradually migrate demo to use same structure as production

## Success Metrics

- Users can create retirement goals
- Users can link investments to goals
- Goal-based transactions generate correctly
- Graph displays goal progress
- No performance degradation

## Future Considerations

### Core Features

- Goal templates library
- Multi-client goal sharing
- Goal recommendations based on age/income
- Integration with real account balances
- Goal achievement notifications

### Calculator Expansion (Ongoing)

- **Continuous calculator ideation**: Regularly brainstorm and evaluate new calculator types based on:
  - User requests and feedback
  - Common financial planning scenarios
  - Market research on competitor offerings
  - Financial planning best practices
- **Calculator list is exploratory**: The list in Task 15/Milestone 8 represents ideas, not commitments
  - Prioritize based on user demand and data
  - Some calculators may be combined or split
  - Some may never be implemented
- **Advanced calculator features**:
  - Rental property post-purchase tracking (Phase 2):
    - Track actual rental income vs projections
    - Monitor expenses vs mortgage payments
    - Show ROI and cash flow over time
    - May require additional UI/reporting beyond standard goal tracking
  - Retirement calculator enhancements:
    - Social security integration
    - Pension calculations
    - Healthcare cost planning
    - Multiple income sources in retirement
  - Debt consolidation calculator (combine multiple debts)
  - Investment comparison tool (compare different goal strategies)

### Implementation Notes

- Before implementing any new calculator from Task 15:
  1. Validate user demand
  2. Research calculation methodology
  3. Consider if it fits the goal model or needs special handling
  4. Design calculator-specific UI/UX
  5. Create specification document for complex calculators (e.g., rental property Phase 2)
