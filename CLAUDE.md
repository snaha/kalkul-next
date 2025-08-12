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
   - Do not use trailing commas in the translation JSON files. Running `pnpm format` fixes the formatting of all files, including the JSON translation files.
   - Running `pnpm check-locales` returns a list of missing localizations and a list of non-used labels from the JSON translation files.

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
   - Don't use null, only when imported

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

### Pre-commit Requirements

**IMPORTANT**: Before committing any changes, you MUST run and pass:

1. `pnpm format` - Formats code with Prettier
2. `pnpm lint` - Checks code style and quality with ESLint and Prettier
3. `pnpm check` - Runs Svelte Kit sync and TypeScript type checking
4. `pnpm knip` - Finds unused files, dependencies, and exports
5. `pnpm check-locales` Checks for missing, unused or duplicate translations

All commands must pass successfully before committing. This ensures code quality and prevents CI/CD failures.
