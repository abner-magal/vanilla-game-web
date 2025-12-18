#!/usr/bin/env node

/**
 * Quick Test Runner
 * 
 * Simple entry point to run tests from the tests directory.
 * 
 * Usage:
 *   node run.js              # Run all modular tests
 *   node run.js property     # Run property tests
 *   node run.js validation   # Run validation tests
 *   node run.js integration  # Run integration tests
 *   node run.js legacy       # Run legacy (non-migrated) tests
 *   node run.js all          # Run all including legacy
 */

const TestRunner = require('./runners/index.js');

const category = process.argv[2] || 'all';

// If 'all' is specified, run modular tests only (not legacy)
// Use 'legacy' to run old tests, or specific category names

const runner = new TestRunner();

console.log(`
╔════════════════════════════════════════════════════════════╗
║                    BN GAMES TEST SUITE                     ║
╠════════════════════════════════════════════════════════════╣
║  Modular test structure with shared utilities              ║
║                                                            ║
║  Categories:                                               ║
║    property    - Property-based tests                      ║
║    validation  - Validation tests                          ║
║    integration - Integration tests                         ║
║    legacy      - Non-migrated original tests               ║
║    all         - All categories (default)                  ║
╚════════════════════════════════════════════════════════════╝
`);

runner.run(category).then(results => {
  process.exit(results.failed > 0 ? 1 : 0);
}).catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
