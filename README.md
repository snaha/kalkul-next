# Kalkul

Financial portfolio management application built with SvelteKit and TypeScript.

## Tech Stack

- **Frontend**: SvelteKit 2.16+ with Svelte 5 (runes)
- **Language**: TypeScript (strict mode)
- **Storage**: localStorage (local-first SPA)
- **Testing**: Vitest (unit) + Playwright (component & e2e)
- **Node**: >=22, **pnpm**: >=10

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## Development Commands

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm preview          # Preview production build

pnpm check            # TypeScript type checking
pnpm lint             # Run linting
pnpm format           # Auto-format code

pnpm test             # Run all tests
pnpm test:unit        # Run unit tests (Vitest)
pnpm test:ct          # Run component tests (Playwright)
pnpm test:integration # Run e2e tests (Playwright)
```

## Project Structure

- `src/lib/@snaha/kalkul-maths/` - Financial calculation engine with precise decimal arithmetic
- `src/lib/stores/` - Svelte 5 runes-based state management
- `src/lib/components/` - Reusable Svelte components
- `src/routes/(app)/` - Main application routes

## Deployments

- [`next.kalkul.app`](https://next.kalkul.app) - Production (Static SPA on GitHub Pages)
- `next.kalkul.app/pr-{num}` - PR previews (Static SPA)

## Environment Variables

| Variable        | Default | Description                        |
| --------------- | ------- | ---------------------------------- |
| `VITE_ROUTER`   |         | Router type (`hash` or `pathname`) |
| `VITE_BASE_URL` |         | Base path for deployment           |

## Testing

### Test Types

1. **Unit Tests** (`pnpm test:unit`) - Vitest

   - Business logic, utilities, and stores
   - Fast execution, no browser required
   - Files: `*.test.ts`

2. **Component Tests** (`pnpm test:ct`) - Playwright Component Testing

   - Individual component behavior and user interactions
   - Real browser environment with cross-browser testing (Chrome, Firefox, Safari)
   - Files: `*.ct.spec.ts`

3. **E2E Tests** (`pnpm test:integration`) - Playwright
   - Full application workflows
   - Files: `tests/*.test.ts`

### Component Testing Examples

Component tests are ideal for testing complex UI components like the formatted number input:

```typescript
// src/lib/components/ui/input/formatted-number/formatted-number-input.ct.spec.ts
test('should format numbers correctly', async ({ mount }) => {
	const component = await mount(FormattedNumberInput, {
		props: { value: 1234.56, locale: 'en-US' },
	})
	const input = component.locator('input')
	await expect(input).toHaveValue('1,234.56')
})
```

### Testing Best Practices

- Use hardcoded expected values instead of regex patterns in assertions
- Test cross-browser compatibility for user interaction components
- Use `--reporter=list` to avoid HTML server for faster CI runs
- Financial calculations must have comprehensive test coverage

## Conventions

- Use conventional commits (`feat:`, `fix:`, `docs:`, etc.)
- Financial calculations must use Decimal.js for precision
- All dates handled through `@snaha/kalkul-maths/date` utilities
- Run `pnpm check` before committing
