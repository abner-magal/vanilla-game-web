/**
 * Test Harness - Shared Testing Utilities
 * Pure JavaScript - Zero Dependencies
 * 
 * Provides common testing functions used across all test files.
 * Import this module to avoid code duplication.
 */

class TestHarness {
  constructor(suiteName = 'Test Suite') {
    this.suiteName = suiteName;
    this.passed = 0;
    this.failed = 0;
    this.results = [];
  }

  /**
   * Assert a condition is true
   * @param {boolean} condition - Condition to test
   * @param {string} message - Description of the test
   */
  assert(condition, message) {
    if (condition) {
      this.passed++;
      this.results.push({ status: '✅', message });
    } else {
      this.failed++;
      this.results.push({ status: '❌', message });
      console.error(`❌ FAIL: ${message}`);
    }
  }

  /**
   * Assert two values are equal
   * @param {*} actual - Actual value
   * @param {*} expected - Expected value
   * @param {string} message - Description of the test
   */
  assertEqual(actual, expected, message) {
    const isEqual = actual === expected;
    if (!isEqual) {
      console.error(`  Expected: ${JSON.stringify(expected)}`);
      console.error(`  Actual:   ${JSON.stringify(actual)}`);
    }
    this.assert(isEqual, message);
  }

  /**
   * Assert two arrays are equal
   * @param {Array} actual - Actual array
   * @param {Array} expected - Expected array
   * @param {string} message - Description of the test
   */
  assertArrayEqual(actual, expected, message) {
    const isEqual = JSON.stringify(actual) === JSON.stringify(expected);
    if (!isEqual) {
      console.error(`  Expected: ${JSON.stringify(expected)}`);
      console.error(`  Actual:   ${JSON.stringify(actual)}`);
    }
    this.assert(isEqual, message);
  }

  /**
   * Assert a value is truthy
   * @param {*} value - Value to test
   * @param {string} message - Description of the test
   */
  assertTruthy(value, message) {
    this.assert(!!value, message);
  }

  /**
   * Assert a value is falsy
   * @param {*} value - Value to test
   * @param {string} message - Description of the test
   */
  assertFalsy(value, message) {
    this.assert(!value, message);
  }

  /**
   * Describe a test suite
   * @param {string} suite - Suite name
   * @param {Function} fn - Test function
   */
  describe(suite, fn) {
    console.log(`\n📦 ${suite}`);
    fn();
  }

  /**
   * Run a single test
   * @param {string} testName - Test name
   * @param {Function} fn - Test function
   */
  it(testName, fn) {
    try {
      fn();
    } catch (err) {
      this.failed++;
      this.results.push({ status: '❌', message: testName });
      console.error(`❌ FAIL: ${testName}`);
      console.error(`  Error: ${err.message}`);
    }
  }

  /**
   * Log a test step
   * @param {string} message - Message to log
   */
  log(message) {
    console.log(`\n🧪 ${message}`);
  }

  /**
   * Get test results summary
   * @returns {Object} Results summary
   */
  getSummary() {
    return {
      suiteName: this.suiteName,
      passed: this.passed,
      failed: this.failed,
      total: this.passed + this.failed,
      successRate: this.passed + this.failed > 0 
        ? Math.round((this.passed / (this.passed + this.failed)) * 100) 
        : 0,
      results: this.results
    };
  }

  /**
   * Print final report
   * @param {Object} options - Report options
   */
  printReport(options = {}) {
    const { showHints = true, feature = '', requirements = '' } = options;

    console.log('\n' + '='.repeat(60));
    console.log(`📊 TEST RESULTS - ${this.suiteName}`);
    if (feature) console.log(`**Feature: ${feature}**`);
    if (requirements) console.log(`**Validates: ${requirements}**`);
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📈 Total:  ${this.passed + this.failed}`);
    console.log('='.repeat(60));

    if (this.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.filter(r => r.status === '❌').forEach(r => {
        console.log(`  ${r.status} ${r.message}`);
      });
    } else {
      console.log(`\n🎉 All ${this.suiteName} tests passed!`);
    }

    return this.failed === 0;
  }

  /**
   * Reset the harness for reuse
   */
  reset() {
    this.passed = 0;
    this.failed = 0;
    this.results = [];
  }
}

module.exports = TestHarness;
