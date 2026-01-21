import assert from 'assert';

// Expose Jest's global `expect` and Node's `assert` to keep the same public API
export const expect = global.expect;
export { assert };