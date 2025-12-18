#!/usr/bin/env node

/**
 * Simple Node.js test runner for Whack-a-Mole tests
 * Run with: node run-tests.js
 */

// Load the test file
const fs = require('fs');
const path = require('path');

// Read and execute the test file
const testCode = fs.readFileSync(path.join(__dirname, 'WhackAMoleGame.test.js'), 'utf8');

// Execute the test code in this context
eval(testCode);

// Run all tests
console.log('\n');
runAllTests();
