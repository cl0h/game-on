# Known Issues

This document tracks known issues that need to be addressed in the game-on repository.

## CI/CD Implementation - Issues to Address

### 1. Jest Global Variables Not Defined in JSHint Configuration

**Priority:** Medium  
**Status:** Open  
**Description:**  
JSHint is reporting errors for Jest global variables (`jest`, `beforeAll`, `afterAll`, etc.) not being defined. The `.jshintrc` configuration needs to be updated to recognize Jest globals.

**Impact:**  
- Linting fails with 49 errors
- Blocks CI pipeline from passing

**Steps to Reproduce:**
```bash
npm run code:analysis
```

**Expected Result:**  
JSHint should recognize Jest globals and not report them as undefined.

**Suggested Fix:**  
Update `.jshintrc` to include Jest globals or configure JSHint to work with Jest test files.

---

### 2. Jest Test Suite Failures

**Priority:** High  
**Status:** Open  
**Description:**  
7 out of 11 test suites are failing with various errors:
- Syntax errors in test files
- Invalid test setup (e.g., `beforeAll` called with incorrect arguments)
- Parsing errors in some test files

**Impact:**  
- Tests fail in CI pipeline
- Unable to verify code quality
- Blocks PR merging

**Steps to Reproduce:**
```bash
npm test
```

**Failing Test Suites:**
1. `Tests/Functional/chat.spec.js` - Unmatched brace syntax error
2. `Tests/Functional/foosball.spec.js` - Invalid `beforeAll` usage
3. `public/js/global.spec.js` - Parsing errors with dynamic imports
4. `components/iohandler.spec.js` - Syntax error
5. And 3 more test suites

**Expected Result:**  
All test suites should pass.

**Suggested Fix:**  
- Review and fix syntax errors in test files
- Update test setup to match Jest API requirements
- Ensure dynamic imports are properly configured

---

### 3. Node.js Version in CI

**Priority:** Low  
**Status:** Open  
**Description:**  
The repository was previously configured for Node.js 9.3.0 (from `.travis.yml`). The new CI workflow uses Node.js 18.x and 20.x for better compatibility.

**Impact:**  
- May expose compatibility issues
- Tests written for older Node.js version may need updates

**Suggested Action:**  
- Verify all tests pass on Node.js 18.x and 20.x
- Update package.json engines field if necessary

---

### 4. ESLint Configuration Not Used in CI

**Priority:** Medium  
**Status:** Open  
**Description:**  
The repository has an `eslint.config.js` file, but the CI pipeline only uses JSHint for linting.

**Impact:**  
- Modern linting rules not enforced
- ESLint configuration is unused

**Suggested Fix:**  
- Decide whether to use ESLint or JSHint
- Update CI workflow to use the chosen linter
- Remove unused linter configuration

---

### 5. Coverage Check Removed from CI

**Priority:** Medium  
**Status:** Open  
**Description:**  
The original workflow included coverage checking (`npm run coverage:check`), but it was removed because it requires NYC configuration and failing tests prevent coverage generation.

**Impact:**  
- No test coverage validation in CI
- Coverage thresholds not enforced

**Suggested Fix:**  
- Fix failing tests first
- Re-enable coverage checking in CI workflow
- Ensure NYC is properly configured

---

## How to Contribute

If you'd like to fix any of these issues:
1. Create a new branch for your fix
2. Make the necessary changes
3. Ensure all tests pass locally
4. Submit a PR referencing the issue number
5. Update this document to mark the issue as resolved

---

**Last Updated:** 2024-01-21
