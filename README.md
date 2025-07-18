# Kalkul

Financial portfolio management application built with SvelteKit and TypeScript.

## Tech Stack

- **Frontend**: SvelteKit 2.16+ with Svelte 5 (runes)
- **Language**: TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL)
- **Testing**: Vitest + Playwright
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
pnpm test:unit        # Run unit tests
pnpm test:integration # Run e2e tests
```

## Database Commands

```bash
pnpm supabase start/stop/status        # Manage local Supabase
pnpm supabase db reset                 # Reset database with migrations
pnpm supabase migration new <name>     # Create new migration
pnpm supabase gen types --lang=typescript --local > src/lib/typesdb.ts  # Generate types
```

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

## Conventions

- Use conventional commits (`feat:`, `fix:`, `docs:`, etc.)
- Financial calculations must use Decimal.js for precision
- All dates handled through `@snaha/kalkul-maths/date` utilities
- Run `pnpm check` before committing
