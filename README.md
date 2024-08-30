# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

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
