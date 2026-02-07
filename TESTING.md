# Testing Guide

This project includes comprehensive testing coverage using modern testing tools and BDD (Behavior-Driven Development) patterns.

## Testing Stack

- **Vitest v2.1.8** - Fast unit and integration testing
- **React Testing Library v16.1.0** - Component testing
- **Playwright v1.50.1** - E2E testing
- **MSW v2.7.0** - API mocking
- **Testing Library User Event v14.5.2** - User interaction simulation

## Test Structure

```
src/__tests__/
├── unit/                    # Unit tests
│   ├── components/          # Component tests
│   ├── services/           # Service layer tests
│   └── utils/              # Utility function tests
├── integration/            # Integration tests
│   ├── api/               # API route tests
│   └── actions/           # Server Actions tests
├── e2e/                   # End-to-end tests (Playwright)
├── fixtures/              # Test data fixtures
└── helpers/               # Test utilities
```

## Running Tests

### All Tests
```bash
npm test                    # Run all Vitest tests in watch mode
npm run test:all           # Run both Vitest and Playwright tests
npm run test:ci            # Run tests with coverage for CI/CD
```

### Unit Tests
```bash
npm run test:unit          # Run unit tests only
npm run test:watch         # Run tests in watch mode
```

### Integration Tests
```bash
npm run test:integration   # Run integration tests only
```

### E2E Tests
```bash
npm run test:e2e          # Run Playwright E2E tests
```

### Coverage
```bash
npm run test:coverage     # Generate coverage report
```

## Writing Tests

### Unit Test Example (BDD Pattern)

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  describe('Given a specific context', () => {
    it('should behave in a certain way', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = myFunction(input);

      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Component Test Example

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<MyComponent onClick={handleClick} />);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Flow', () => {
  test('should complete user journey', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Login');
    await expect(page).toHaveURL('/login');
  });
});
```

## Test Coverage Requirements

- **Minimum Coverage**: 80% for branches, functions, lines, and statements
- **Priority Areas**: Business logic, authentication, API routes, critical user flows

## Best Practices

1. **Follow BDD Pattern**: Use descriptive `describe` blocks with "Given/When/Then" structure
2. **Arrange-Act-Assert**: Structure test code clearly
3. **Test Behavior, Not Implementation**: Focus on what the code does, not how
4. **Use Meaningful Test Names**: Tests should read like documentation
5. **Avoid Test Interdependence**: Each test should run independently
6. **Mock External Dependencies**: Use mocks for Firebase, Stripe, external APIs
7. **Keep Tests Fast**: Unit tests should run in milliseconds

## Mocking

### Next.js Navigation
Already mocked globally in `vitest.setup.ts`

### Firebase Auth
Already mocked globally in `vitest.setup.ts`

### Custom Mocks
```typescript
vi.mock('@/lib/my-module', () => ({
  myFunction: vi.fn(() => 'mocked value'),
}));
```

## Test Fixtures

Use test fixtures from `src/__tests__/fixtures/` for consistent test data:

```typescript
import { mockUsers } from '@/__tests__/fixtures/users';

const testUser = mockUsers.regularUser;
```

## Debugging Tests

### Vitest UI
```bash
npm run test -- --ui
```

### Debug in VS Code
Add breakpoints and use the VS Code debugger with the Jest/Vitest extension.

### Playwright Debug
```bash
npx playwright test --debug
```

## Continuous Integration

Tests automatically run on:
- Pull requests
- Pushes to main branch
- Before deployment

## Current Test Status

✅ Unit Tests: **15 passed** (validation, components)
✅ Integration Tests: **1 passed** (health check)
✅ E2E Tests: **Ready** (Playwright configured)

## Next Steps

1. Add more component tests as you build UI
2. Add API route tests for authentication
3. Add E2E tests for critical user journeys
4. Set up test coverage reporting in CI/CD
5. Add visual regression testing (optional)

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
