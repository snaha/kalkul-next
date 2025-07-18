# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

4. **Internationalization (i18n)**

   - Uses `svelte-i18n` library for translations
   - Translation files in `src/lib/locales/` (currently `cs.json` and `en.json`)
   - Nested structure for organized translations (e.g., `page.account.settings`)
   - Import with `import { _ } from 'svelte-i18n'` and use as `$_('key.path')`
   - Initialize in `src/lib/locales/index.ts` with Czech (`cs`) as default
   - Browser language auto-detected in `src/routes/+layout.ts`

   Example usage:

   ```svelte
   <script>
   	import { _ } from 'svelte-i18n'
   </script>

   <h1>{$_('page.account.settings')}</h1>
   <p>{$_('page.account.firstPaymentOn', { values: { date: '2024-01-01' } })}</p>
   ```

### Important Patterns

1. **Type Safety**

   - TypeScript strict mode is enabled
   - Always run `pnpm check` before committing
   - Use generated database types from `typesdb.ts`

2. **Testing Financial Logic**

   - Financial calculations must have unit tests
   - Use test files alongside source (`*.test.ts`)
   - Test edge cases with various decimal precisions

3. **Component Architecture**
   - Components in `src/lib/components/` are reusable
   - Route-specific components stay in route folders
   - Use composition over inheritance

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

### Deployment Context

- Production runs as Node.js app
- Development/PR previews run as static SPAs
- Environment variables control routing and adapters
- See README.md for deployment details

### Key Reminders

- Financial precision is critical - always use Decimal.js
- Follow conventional commits strictly
- Test financial calculations thoroughly
- Check TypeScript types before committing
- Reference README.md for commands and setup

### Pre-commit Requirements

**IMPORTANT**: Before committing any changes, you MUST run and pass:

1. `pnpm format` - Formats code with Prettier
2. `pnpm lint` - Checks code style and quality with ESLint and Prettier
3. `pnpm check` - Runs Svelte Kit sync and TypeScript type checking
4. `pnpm knip` - Finds unused files, dependencies, and exports

All four commands must pass successfully before committing. This ensures code quality and prevents CI/CD failures.
