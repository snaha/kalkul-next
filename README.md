# Kalkul

## Deployments

- [`kalkul.app`](https://kalkul.app) - production hosted as nodejs app on DigitalOcean
- [`dev.kalkul.app`](https://dev.kalkul.app) - dev version hosted as static SPA on DigitalOcean
- `dev.kalkul.app/preview/pr-{num}` - pr preview hosted as static SPAs with hash router on DigitalOcean

## Environment vars

| Variable                   | Default value            | Description                                                                         |
| -------------------------- | ------------------------ | ----------------------------------------------------------------------------------- |
| `PUBLIC_SUPABASE_URL`      | `http://127.0.0.1:64321` | Supabase public connection URL                                                      |
| `PUBLIC_SUPABASE_ANON_KEY` | `ey...J9`                | Supabase connection key                                                             |
| `VITE_ROUTER`              |                          | Sveltekit router to use (`hash` or `pathname`)                                      |
| `VITE_BASE_URL`            |                          | Base path to which the app is deployed (no value means root `/`)                    |
| `VITE_API_URL`             |                          | URL on which API endpoints are (no value makes it )                                 |
| `VITE_ADAPTER`             |                          | Sveltekit adapter to use (`static` uses the adapter-static, otherwise adapter-node) |

# Supabase Commands and Operations

## Run supabase locally

### 1.Initialize Supabase in your project:

### 1.Start Supabase locally:

Start the Supabase local development environment with:

```bash
pnpm supabase start
```

-This command starts the local PostgreSQL database and Supabase services. You should see logs indicating that the local environment is running.

### 2.Stop Supabase locally:

-To stop the local Supabase environment, use:

```bash
pnpm supabase stop
```

### 3.Check Supabase Status

-To check the current status of the Supabase services running locally, use:

```bash
pnpm supabase status
```

-This command provides an overview of the status of various Supabase services. The output will show whether the services such as the database, API, authentication, and storage are running or not. It also includes port numbers for accessing these services.

## Creating Migrations from Local Database

### 1.Generate a new migration:

-To create a new migration based on changes made to your local database schema, run:

```bash
pnpm supabase migration new <migration_name>
```

-Replace <migration_name> with a descriptive name for your migration.

### 2. Generate a Migration Based on Schema Differences

-To create a new migration that captures the differences between your current schema and the baseline, use:

```bash
pnpm supabase db diff | pnpm supabase migration new <migration_name>
```

### 3.Apply migrations:

-Apply the newly created migration to your database using:

```bash
pnpm supabase db push
```

-This command applies the migration files to your local or remote Supabase database.

## Resetting the Database

### 1.Reset the database:

-To reset the database, first make sure your Supabase local environment is running. Then run:

```bash
pnpm supabase db reset
```

-This command will drop and recreate all tables based on your current migrations.

### 2.Seed the database:

-If you have seed data to populate the database, you can run:

```bash
pnpm supabase db seed
```

-Ensure you have a seed.sql file in your migrations directory for this to work.

## Generate types

-To generate types, use:

```bash
pnpm supabase gen types --lang=typescript --local > src/lib/typesdb.ts
```
