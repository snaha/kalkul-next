# AGENTS.md

This file provides guidance to LLM AI agents like Claude Code, Gemini and OpenAI Codex when working with code in this repository.

## ⚠️ CRITICAL PRODUCTION DATABASE SAFETY RULES

**AI assistants MUST NEVER:**

- Push migrations to production (`supabase db push --linked`)
- Modify remote/production database in any way
- Run commands with `--linked` flag that modify data (only read operations like `supabase db dump --linked` are allowed)
- Execute `psql` commands against production database URLs
- Apply schema changes to production

**AI assistants CAN:**

- Create and review migration files locally
- Test migrations with local database
- Backup production database (read-only: `supabase db dump --linked`)
- Restore backups to local database only

**Humans must manually apply all production migrations.** See the "Database Integration" section below for detailed guidelines.

## Quick Reference

See `README.md` for development commands, project structure, and conventions.

## AI-Specific Guidelines

### Understanding the Codebase

**Kalkul** is a financial portfolio management application. Key areas to understand:

1. **Financial Calculations** (`src/lib/@snaha/kalkul-maths/`)

   - Always use Decimal.js for monetary calculations
   - Never use native JavaScript numbers for financial data
   - Test extensively when modifying calculation logic

2. **State Management** (`src/lib/stores/`)

   - Uses Svelte 5 runes (`.svelte.ts` files)
   - State is reactive and type-safe
   - Follow existing patterns when adding new stores

3. **Database Integration** (`src/lib/adapters/supabase/`)

   - All database queries go through the adapter layer
   - Types are generated from database schema (`src/lib/typesdb.ts`)
   - Run `pnpm supabase gen types` after schema changes
   - **IMPORTANT**: Database schema changes go in migration files in `supabase/migrations/`, NOT in `seed.sql`
   - Use `pnpm supabase migration new <migration_name>` to create a new migration file
   - Migration files are named with timestamp prefix (e.g., `20241108093852_transactions.sql`)
   - `seed.sql` is only for seeding test/development data, not schema changes
   - Never touch remote DB directly - always use migrations
   - **IMPORTANT**: Database operations should go through the adapter layer (`src/lib/adapters/`). Avoid direct Supabase calls outside the adapter.

   **Database Migrations & Backups**:

   - **ALWAYS backup production database before applying migrations**
   - See `README.md` section "Production Database Backup & Restore" for detailed commands
   - See `docs/uuid-migration-testing.md` for step-by-step migration testing guide

   **Quick Reference - Database Operations:**

   Available databases:

   - `prod` / `production` - Production database (mdyjiyyoidizsjdfyxdm)
   - `ci` / `test` - CI test database (rftqneipeoscundnthou)
   - `local` / `dev` - Local development database

   ```bash
   # Backup database (data-only, no schema) - AI can run this
   pnpm db backup prod    # Backup production
   pnpm db backup ci      # Backup CI test
   pnpm db backup local   # Backup local

   # Restore database - AI can run this for local only
   pnpm db restore local backups/mdyjiyyoidizsjdfyxdm_data_20251118.sql

   # Apply migrations (preserves data)
   pnpm db migrate local  # Apply migrations to local (AI can run this)
   pnpm db migrate prod   # Push migrations to production (HUMAN ONLY)
   pnpm db migrate ci     # Push migrations to CI test (HUMAN ONLY)

   # Reset database (⚠️ DESTROYS ALL DATA)
   pnpm db reset local    # Full reset local DB (AI can run this)
   pnpm db reset prod     # Full reset production (HUMAN ONLY - VERY DANGEROUS)
   pnpm db reset ci       # Full reset CI test (HUMAN ONLY)
   ```

   **Note**: AI assistants CAN help with backups and local operations, but MUST NEVER push changes to production or restore to remote databases.

   **Quick Reference - Test Migrations with Production Data:**

   ```bash
   # 1. Reset local DB to main branch
   git checkout main
   pnpm db reset local

   # 2. Restore production data to local
   pnpm db restore local backups/mdyjiyyoidizsjdfyxdm_data_20251118_143000.sql

   # 3. Switch to migration branch and apply migrations
   git checkout <migration-branch>
   pnpm db migrate local

   # 4. Verify integrity
   pnpm supabase db lint
   pnpm check
   ```

   **Critical Migration Testing Rules:**

   - **ALWAYS apply migrations locally FIRST** using `pnpm db migrate local` before pushing to remote
   - `supabase db push --linked` syncs your LOCAL migration files to the remote database
   - If you push without testing locally first, you risk applying broken migrations to production
   - Use `pnpm db restore local` to restore production data (automatically clears all data including auth)
   - **MUST** restore production data BEFORE applying migrations (not after)
   - Always verify data counts match before and after migration
   - Always check foreign key relationships are intact after migration
   - Always run `pnpm supabase db lint` to verify schema integrity
   - **NEVER** push untested migrations to production or CI environments

   **Applying Migrations to Production:**

   **⚠️ CRITICAL: AI ASSISTANTS MUST NEVER APPLY MIGRATIONS TO PRODUCTION OR TOUCH REMOTE DATABASE**

   - AI assistants should ONLY help with testing migrations locally
   - AI assistants should ONLY help with creating and reviewing migration files
   - AI assistants should ONLY help with backing up databases
   - AI assistants should ONLY help with restoring to local database
   - **NEVER run**: `pnpm db:migrate prod` or `pnpm db:migrate ci` (pushes migrations to production/CI)
   - **NEVER run**: `pnpm db:reset prod` or `pnpm db:reset ci` (destroys production/CI data)
   - **NEVER run**: `pnpm db:restore prod` or `pnpm db:restore ci` (modifies remote data)
   - **NEVER run**: `supabase db push --linked` (pushes to production)
   - **NEVER run**: any command with `--linked` flag that modifies data
   - **NEVER run**: `psql` commands against production database URLs

   Humans must manually apply migrations to production:

   ```bash
   # HUMAN ONLY - AI must not execute these commands
   pnpm db:migrate prod
   # Or: supabase db push --linked
   ```

   **Never**:

   - **AI assistants must NEVER apply migrations to production database**
   - **AI assistants must NEVER push schema changes to remote database**
   - **AI assistants must NEVER run commands that modify production data**
   - Never apply untested migrations to production
   - Never skip backing up production before migrations
   - Never restore production data after applying migrations (must be before)
   - Never commit backup files with sensitive data to git

4. **Internationalization (i18n)**

   - Uses `svelte-i18n` library for translations
   - Translation files in `src/lib/locales/` (currently `cs.json` and `en.json`)
   - Nested structure for organized translations (e.g., `page.account.settings`)
   - Import with `import { _ } from 'svelte-i18n'` and use as `$_('key.path')`
   - Initialize in `src/lib/locales/index.ts` with Czech (`cs`) as default
   - Browser language auto-detected in `src/routes/+layout.ts`
   - Do not use trailing commas in the translation JSON files. Running `pnpm format` fixes the formatting of all files, including the JSON translation files.
   - Running `pnpm check-locales` returns a list of missing localizations and a list of non-used labels from the JSON translation files.
   - **IMPORTANT**: When updating localization text, ALWAYS update ALL language files (currently `cs.json` and `en.json`)
   - Never update only one language file - this creates inconsistencies between languages
   - Always maintain the same structure and parameter names across all languages

   Example usage:

   ```svelte
   <script>
   	import { _, locale } from 'svelte-i18n'
   </script>

   <h1>{$_('page.account.settings')}</h1>
   <p>{$_('page.account.firstPaymentOn', { values: { date: '2024-01-01' } })}</p>
   ```

   **Accessing current locale**: Use `$locale` directly instead of `get(locale)`

   - Example: `new Date().toLocaleDateString($locale ?? undefined)` instead of `new Date().toLocaleDateString(get(locale) || 'cs')`
   - This avoids unnecessary imports of `get` from `svelte/store` and is more reactive

### Important Patterns

1. **Type Safety**

   - TypeScript strict mode is enabled
   - Always run `pnpm check` before committing
   - Use generated database types from `typesdb.ts`
   - **CRITICAL: Never use `null` in your code** - always use `undefined` instead for optional/missing values
   - **Exceptions where `null` is allowed:**
     - When `null` comes from external libraries or APIs (e.g., DOM methods that return `null`)
     - In Supabase/SQL-related data where `null` translates to the SQL NULL type
   - When checking for missing values, use `!value` or `value === undefined`, not `value === null`
   - **ENFORCEMENT**: Before any file edit, scan your changes for the literal `null` and replace with `undefined`
   - Return types should be `T | undefined`, never `T | null`
   - Function parameters should default to `undefined`, never `null`
   - **Never use `any` type** - always use proper TypeScript types for type safety
   - Use generic types, union types, or `unknown` instead of `any` when needed
   - If you must accept any type, use `unknown` and type guards for safety

### Naming Conventions

- **File naming**: Use kebab-case for all file names (e.g., `user-profile.ts`, `email-template.svelte`)
- **Directory naming**: Use kebab-case for directory names (e.g., `email-templates/`, `user-settings/`)
- **Component naming**: Svelte components should use PascalCase for the component name but kebab-case for the file name (e.g., `UserProfile.svelte` → `user-profile.svelte`)

### Import Conventions

- **Never use dynamic imports**: Always use static imports at the top of the file
  - ✅ `import SupabaseAdapter from '$lib/adapters/supabase/index'` at the top of the file
  - ❌ `const adapter = await import('$lib/adapters/supabase/index')` inside a function
- **Omit file extensions**: Omit `.js` extensions in import statements
  - ✅ `import { Server } from '@modelcontextprotocol/sdk/server/index'`
  - ❌ `import { Server } from '@modelcontextprotocol/sdk/server/index.js'`

2. **Testing Financial Logic**

   - Financial calculations must have unit tests
   - Use test files alongside source (`*.test.ts`)
   - Test edge cases with various decimal precisions

3. **Component Architecture**

   - Components in `src/lib/components/` are reusable
   - Route-specific components stay in route folders
   - Use composition over inheritance

4. **Design System (Diete)**

   - Uses **Diete** design system for UI components
   - Design system components are located in `src/lib/components/ui/`
   - Key components include: `Typography`, `Button`, `Input`, `Dropdown`, `List`, `Vertical`, `Horizontal`, etc.
   - Full documentation available at https://diete.design
   - Always prefer Diete components over custom HTML elements for consistency
   - Use CSS custom properties (e.g., `--padding`, `--half-padding`, `--double-padding`) for spacing
   - Follow Diete patterns for layout, typography, and interactions

   **Important Layout Component Properties:**

   - `Vertical` component uses `--vertical-gap` (NOT `--gap`)
   - `Horizontal` component uses `--horizontal-gap` (NOT `--gap`)
   - Example: `<Vertical --vertical-gap="var(--padding)">` and `<Horizontal --horizontal-gap="var(--half-padding)">`
   - **Alignment properties**:
     - `Vertical`: `--vertical-align-items` and `--vertical-justify-content`
     - `Horizontal`: `--horizontal-align-items` and `--horizontal-justify-content`
     - Example: `<Vertical --vertical-align-items="start">` and `<Horizontal --horizontal-align-items="center">`
   - **Style properties**: CSS custom properties can be passed directly to components
     - Example: `<Divider --divider-color="black" />` instead of `<Divider style="--divider-color: black;" />`

   **Prefer Component Properties Over CSS:**

   - Diete components provide properties to achieve visual and behavioral changes
   - **Always use component properties first**, only resort to custom CSS if the property doesn't exist
   - Examples:
     - ✅ `<Typography font="mono">` instead of ❌ `<Typography class="monospace">` with custom CSS
     - ✅ `<Typography variant="small">` instead of ❌ `<Typography style="font-size: 0.875rem;">`
     - ✅ `<Button variant="ghost">` instead of ❌ `<Button class="ghost-button">` with custom CSS
   - This ensures consistency with the design system and reduces custom CSS maintenance

### Common Tasks

1. **Adding a New Feature**

   - Check existing patterns in similar features
   - Update types if database schema changes
   - Add tests for business logic
   - Use conventional commits

2. **Modifying Financial Calculations**

   - Review existing tests in `@snaha/kalkul-maths`
   - Always use Decimal.js
   - Consider precision and rounding implications
   - Add comprehensive test coverage

3. **Working with State**

   - Use existing stores when possible
   - Follow Svelte 5 runes patterns
   - Keep stores focused and single-purpose

4. **API Error Handling**
   - Always use `jsonError()` utility from `$lib/error` for consistent error responses
   - Import: `import { jsonError } from '$lib/error'`
   - Usage: `return jsonError('Error message', { status: 400, cause: error })`
   - Provides standardized error format and proper HTTP status codes
   - Never use `json({ error }, { status: 500 })` directly

### Deployment Context

- Production runs as Node.js app
- Development/PR previews run as static SPAs
- Environment variables control routing and adapters
- See README.md for deployment details

### Testing Strategy

**Kalkul uses a three-tier testing approach:**

1. **Unit Tests** (`pnpm test:unit` - Vitest)

   - Financial calculations and business logic
   - Utilities and helper functions
   - Store/state management
   - Files: `*.test.ts`

2. **Component Tests** (`pnpm test:ct` - Playwright)

   - UI component behavior and user interactions
   - Cross-browser compatibility (Chrome, Firefox, WebKit)
   - Real browser environment with actual rendering
   - Files: `*.ct.spec.ts`

3. **E2E Tests** (`pnpm test:integration` - Playwright)
   - Full application workflows
   - Files: `tests/*.test.ts`

**When to use Component Tests:**

- Complex UI components (formatted inputs, charts, modals)
- User interaction testing (typing, clicking, selection)
- Cross-browser behavior validation
- Visual component behavior

**Component Testing Best Practices:**

- Use hardcoded expected values: `await expect(input).toHaveValue('1,234.56')`
- Avoid regex patterns in assertions: ❌ `toMatch(/^10[0-9,]+$/)`
- Use `--reporter=list` to avoid HTML server for faster runs
- Test user flows step-by-step with proper waits

**Example Component Test:**

```typescript
test('should handle text selection replacement', async ({ mount }) => {
	const component = await mount(FormattedNumberInput, {
		props: { value: 1234, locale: 'en-US' },
	})
	const input = component.locator('input')

	await input.focus()
	await expect(input).toHaveValue('1,234')

	// Select "23" and replace with "9"
	await input.evaluate((el) => {
		;(el as HTMLInputElement).setSelectionRange(2, 4)
	})
	await input.press('9')

	await expect(input).toHaveValue('1,94') // Specific expected value
})
```

### Key Reminders

- Financial precision is critical - always use Decimal.js
- Follow conventional commits strictly
- Test financial calculations thoroughly (unit tests)
- Test UI interactions comprehensively (component tests)
- Check TypeScript types before committing
- Reference README.md for commands and setup
- Run `pnpm test:unit --run` (non-watch mode) to validate changes without blocking the terminal

### Testing Commands

**Unit Tests**: Use `pnpm test:unit run [test-file]` to run unit tests once (without watch mode)

- Example: `pnpm test:unit run graph-data.test.ts`
- `pnpm test:unit` without "run" starts watch mode and runs indefinitely

### Package Management

**Installing Packages**: Always use `pnpm add -D [package]` for development dependencies

- Example: `pnpm add -D html-to-text`
- Use `pnpm add [package]` only for runtime dependencies that users need
- Most packages for development, testing, and build tools should be dev dependencies

### Pre-commit Requirements

**IMPORTANT**: Before committing any changes, you MUST run and pass:

1. `pnpm format` - Formats code with Prettier
2. `pnpm lint` - Checks code style and quality with ESLint and Prettier
3. `pnpm check` - Runs Svelte Kit sync and TypeScript type checking
4. `pnpm knip` - Finds unused files, dependencies, and exports
5. `pnpm check-locales` - Checks for missing, unused or duplicate translations

**Quick check**: Use `pnpm check:all` to run all the above checks at once (used in CI).

All commands must pass successfully before committing. This ensures code quality and prevents CI/CD failures.

**Testing check-locales patterns**: Use `pnpm check-locales --test` to validate the hardcoded text detection patterns against test cases in `scripts/test-locales-examples.svelte`. This helps ensure the regex patterns correctly identify user-facing text that should be localized while properly excluding code snippets and technical content.

**IMPORTANT**: When running `pnpm check-locales`, you MUST fix ALL issues it finds:

- Add missing localization keys for any hardcoded user-facing text
- Remove unused localization keys from JSON files
- Update components to use the localization keys instead of hardcoded strings
- Do not leave any hardcoded text or unused keys remaining
