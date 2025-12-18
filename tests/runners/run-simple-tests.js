#!/usr/bin/env node

/**
 * Simple Node.js test runner for Navigation and Responsive tests
 * Run with: node run-simple-tests.js
 */

const fs = require('fs');
const path = require('path');

// Simple test framework
let testCount = 0;
let passedCount = 0;
let failedCount = 0;

global.describe = function(name, fn) {
  console.log(`\n📋 ${name}`);
  fn();
};

global.test = function(name, fn) {
  testCount++;
  try {
    fn();
    passedCount++;
    console.log(`  ✅ ${name}`);
  } catch (error) {
    failedCount++;
    console.log(`  ❌ ${name}`);
    console.log(`     Error: ${error.message}`);
  }
};

global.expect = function(actual) {
  return {
    toBe: function(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, but got ${actual}`);
      }
    },
    toBeGreaterThan: function(expected) {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeTruthy: function() {
      if (!actual) {
        throw new Error(`Expected ${actual} to be truthy`);
      }
    },
    toContain: function(expected) {
      if (typeof actual === 'string' && !actual.includes(expected)) {
        throw new Error(`Expected "${actual.substring(0, 100)}..." to contain "${expected}"`);
      }
      if (Array.isArray(actual) && !actual.includes(expected)) {
        throw new Error(`Expected array to contain "${expected}"`);
      }
    }
  };
};

console.log('🧪 Running Simple Navigation and Responsive Tests...\n');

// Load and run simple navigation tests
try {
  const navigationTestCode = fs.readFileSync(path.join(__dirname, 'simple-navigation.test.js'), 'utf8');
  eval(navigationTestCode);
} catch (error) {
  console.log(`❌ Failed to load navigation tests: ${error.message}`);
}

// Load and run simple responsive tests
try {
  const responsiveTestCode = fs.readFileSync(path.join(__dirname, 'simple-responsive.test.js'), 'utf8');
  eval(responsiveTestCode);
} catch (error) {
  console.log(`❌ Failed to load responsive tests: ${error.message}`);
}

// Print summary
console.log('\n' + '='.repeat(50));
console.log(`📊 Test Summary:`);
console.log(`   Total: ${testCount}`);
console.log(`   ✅ Passed: ${passedCount}`);
console.log(`   ❌ Failed: ${failedCount}`);
console.log(`   Success Rate: ${Math.round((passedCount / testCount) * 100)}%`);

if (failedCount === 0) {
  console.log('\n🎉 All tests passed!');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please review the output above.');
  process.exit(1);
}