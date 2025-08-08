# End-to-End Tests

This directory contains Playwright end-to-end tests for the Kalkul application.

## Setup

Playwright is already configured and installed. To run tests:

```bash
# Run all tests
pnpm test:integration

# Run tests in headed mode (with browser UI)
pnpm exec playwright test --headed

# Run specific test file
pnpm exec playwright test tests/auth.test.ts

# Run tests in debug mode
pnpm exec playwright test --debug
```

## Test Structure

- `auth.test.ts` - Authentication and login tests
- `signup.test.ts` - User registration tests
- `navigation.test.ts` - Basic navigation and page loading tests
- `fixtures/auth.ts` - Authentication test fixtures and helpers
- `utils/test-data.ts` - Test data generators

## Environment Variables

For tests that require actual authentication, set these environment variables:

```bash
TEST_USER_EMAIL=your-test-user@example.com
TEST_USER_PASSWORD=your-test-password
```

## Test Database

For full integration tests, you may need to:

1. Set up a test database instance
2. Run database migrations
3. Seed test data

See the main README.md for database setup instructions.

## Writing New Tests

1. Create test files with `.test.ts` suffix
2. Use the existing patterns and utilities
3. Focus on user workflows and critical paths
4. Mock external APIs when needed
5. Use test data generators for consistent data
