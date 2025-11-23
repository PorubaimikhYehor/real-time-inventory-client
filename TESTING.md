# Testing Guide

## Running Tests

```bash
npm run test:client
```

This will launch Karma with both Electron and Firefox browsers running the test suite.

## Test Coverage

- **Total Specs**: 128
- **Core Services**: 60 specs
- **Feature Services**: 44 specs
- **Guards/Interceptors**: 24 specs  
- **Components**: 2 specs (basic smoke tests)

## Known Issues

### Firefox localStorage Spy Issue (6 failing tests)

**Status**: 122/128 tests pass in Firefox (95.3%), 128/128 pass in Electron (100%)

**Issue**: Six `authInterceptor` tests fail in Firefox due to Jasmine spy detection:
- `should add Authorization header when token exists`
- `should retrieve token from access_token key in localStorage`
- `should clear tokens and redirect to login on 401 error`
- `should work with POST requests`
- `should work with PUT requests`
- `should work with DELETE requests`

**Root Cause**: When the interceptor runs inside `TestBed.runInInjectionContext()`, the spied `window.localStorage.getItem()` is not being tracked by Jasmine in Firefox, even though the spy is correctly configured and the method returns the expected values. This appears to be a Firefox-specific issue with how localStorage is accessed in the bundled test code.

**Evidence**:
- Tests fail with: `Expected spy getItem to have been called but it was never called`
- Authorization header is `null` instead of `'Bearer test-token'`
- **Same tests pass in Electron browser**
- Spy setup is correct: `spyOn(window.localStorage, 'getItem').and.returnValue(token)`
- Interceptor code uses: `window.localStorage.getItem('access_token')`

**Workaround**: Use Electron for authInterceptor test validation, or manually test the interceptor behavior in a running application.

## Test Structure

### Test Utilities (`src/testing/`)

- `mock-http-client.ts` - MockHttpClient for HTTP testing
- `mock-notification-service.ts` - MockNotificationService for snackbar testing
- `mock-auth-service.ts` - AuthService with signal-based state
- `mock-router.ts` - MockRouter with navigate spy and reset() method
- `mock-mat-dialog.ts` - MockMatDialogRef for dialog testing
- `test-data-factories.ts` - Factory functions for creating test data
- `index.ts` - Barrel exports for clean imports

All test utilities are available via the `@testing/*` path alias.

### Running Tests by Category

```bash
# Run specific test file
npm run test:client -- --include='**/auth.service.spec.ts'

# Run tests matching pattern
npm run test:client -- --include='**/core/**/*.spec.ts'
```

## Browser Configuration

Tests run in:
- **Electron** (headless, fast)
- **Firefox** (headless)

Both browsers can be viewed at http://localhost:9876/ during test runs.

## Test Best Practices

1. **Always use test utilities** from `@testing/*` for mocks
2. **Reset spies** in beforeEach using `mockRouter.reset()`
3. **Configure MockHttpClient responses** before making requests
4. **Use done callbacks** for async tests
5. **Check TestBed errors** if seeing "Injector destroyed" messages
