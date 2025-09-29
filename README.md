# Kalkul

Financial portfolio management application built with SvelteKit and TypeScript.

## Tech Stack

- **Frontend**: SvelteKit 2.16+ with Svelte 5 (runes)
- **Language**: TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL)
- **Testing**: Vitest (unit) + Playwright (component & e2e)
- **Node**: >=22, **pnpm**: >=10

## Quick Start

```bash
# Install dependencies
pnpm install

# Start local Supabase
pnpm supabase start

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

## Database Commands

### Local Development

```bash
pnpm supabase start           # Start local Supabase instance
pnpm supabase stop            # Stop local Supabase instance
pnpm supabase status          # Check Supabase service status
```

### Database Management

```bash
pnpm supabase db reset        # Reset database and apply all migrations
pnpm supabase db push         # Push local schema changes to database
pnpm supabase db diff         # Show differences between migrations and database
```

### Migrations

```bash
pnpm supabase migration new <name>     # Create new migration file
pnpm supabase migration list            # List all migrations
pnpm supabase migration up              # Apply pending migrations
```

### Type Generation

Generate TypeScript types after schema changes:

```bash
# Generate types from local database (recommended)
pnpm supabase:gen-types

# Alternative: Generate from project ID
supabase gen types --lang=typescript --project-id=<project-id> > src/lib/typesdb.ts
```

**Workflow for schema changes:**

1. Create migration: `pnpm supabase migration new <descriptive-name>`
2. Edit migration file in `supabase/migrations/`
3. Apply migrations: `pnpm supabase db reset`
4. Generate types: `pnpm supabase:gen-types`
5. Verify types compile: `pnpm check`

## Project Structure

- `src/lib/@snaha/kalkul-maths/` - Financial calculation engine with precise decimal arithmetic
- `src/lib/stores/` - Svelte 5 runes-based state management
- `src/lib/components/` - Reusable Svelte components
- `src/routes/(app)/` - Main application routes
- `src/routes/api/` - API endpoints
- `supabase/migrations/` - Database schema

## Deployments

- [`kalkul.app`](https://kalkul.app) - Production (Node.js)
- [`dev.kalkul.app`](https://dev.kalkul.app) - Development (Static SPA)
- `dev.kalkul.app/preview/pr-{num}` - PR previews (Static SPA with hash routing)

## Environment Variables

| Variable                   | Default                  | Description                        |
| -------------------------- | ------------------------ | ---------------------------------- |
| `PUBLIC_SUPABASE_URL`      | `http://127.0.0.1:64321` | Supabase URL                       |
| `PUBLIC_SUPABASE_ANON_KEY` | Local dev key            | Supabase anon key                  |
| `VITE_ROUTER`              |                          | Router type (`hash` or `pathname`) |
| `VITE_BASE_URL`            |                          | Base path for deployment           |
| `VITE_API_URL`             |                          | API endpoints URL                  |
| `VITE_ADAPTER`             |                          | Adapter (`static` or `node`)       |
| `CORS_ALLOWED_ORIGIN`      |                          | CORS allowed origin                |

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

## Sending the newsletter

There is a script for sending newsletters. It expects `RESEND_API_KEY` and `RESEND_AUDIENCE_ID` environment variables to be set correctly before invoking the command.

Usage:

```sh
pnpm send-newsletter <newsletter-template-name> <email-subject>
```

The `newsletter-template-name` is one of the templates from `src/lib/email/templates`, the `email-subject` is the subject of the newsletter. Currently we send only to Czech audience, so use the Czech localized subject.

The output looks like this if there were no errors:

```sh
{ data: { id: 'ebd0cb46-4fb9-4c12-9b8d-1111da31abf7' } }
```
