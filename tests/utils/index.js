/**
 * Test Utilities Index
 * 
 * Central export point for all test utilities.
 * Import from here to get all utilities in one place.
 */

const TestHarness = require('./test-harness');
const fileHelpers = require('./file-helpers');
const cssPatterns = require('./css-patterns');
const htmlPatterns = require('./html-patterns');

module.exports = {
  TestHarness,
  ...fileHelpers,
  ...cssPatterns,
  ...htmlPatterns
};
