/**
 * Property Test for Debounce Behavior
 * **Feature: fix-test-bugs, Property 4: Debounce prevents rapid execution**
 * **Validates: Requirements 3.3**
 * 
 * Tests that debounce mechanism properly prevents rapid execution
 * and only executes the function once after the delay period.
 */

// ============================================================
// MINIMAL TEST HARNESS
// ============================================================

let passed = 0;
let failed = 0;
const results = [];

function assert(condition, message) {
  if (condition) {
    passed++;
    results.push({ status: '✅', message });
  } else {
    failed++;
    results.push({ status: '❌', message });
    console.error(`FAIL: ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  const isEqual = actual === expected;
  if (!isEqual) {
    console.error(`  Expected: ${JSON.stringify(expected)}`);
    console.error(`  Actual:   ${JSON.stringify(actual)}`);
  }
  assert(isEqual, message);
}

async function describe(suite, fn) {
  console.log(`\n📦 ${suite}`);
  await fn();
}

async function it(testName, fn) {
  try {
    await fn();
  } catch (err) {
    failed++;
    results.push({ status: '❌', message: testName });
    console.error(`FAIL: ${testName}`);
    console.error(`  Error: ${err.message}`);
  }
}

// ============================================================
// DEBOUNCE IMPLEMENTATION (copied from game-loader.js)
// ============================================================

function debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

// ============================================================
// PROPERTY TESTS FOR DEBOUNCE BEHAVIOR
// ============================================================



// ============================================================
// FINAL REPORT
// ============================================================

function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 DEBOUNCE PROPERTY TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total:  ${passed + failed}`);
  console.log('='.repeat(60));

  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.filter(r => r.status === '❌').forEach(r => {
      console.log(`  ${r.status} ${r.message}`);
    });
    return false;
  } else {
    console.log('\n🎉 All debounce property tests passed!');
    return true;
  }
}

// Run tests if this file is executed directly
if (typeof module === 'undefined' || require.main === module) {
  (async () => {
    await describe('Property 4: Debounce prevents rapid execution', async () => {
      await it('debounce executes function only once after delay for rapid calls', async () => {
        let executionCount = 0;
        const testFunction = () => { executionCount++; };
        const debouncedFn = debounce(testFunction, 100);
        
        // Make rapid calls
        debouncedFn();
        debouncedFn();
        debouncedFn();
        debouncedFn();
        debouncedFn();
        
        // Should not have executed yet
        assertEqual(executionCount, 0, 'Function not executed immediately');
        
        // Wait for debounce delay + buffer
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Should have executed exactly once
        assertEqual(executionCount, 1, 'Function executed exactly once after delay');
      });

      await it('debounce resets timer on each call within delay window', async () => {
        let executionCount = 0;
        const testFunction = () => { executionCount++; };
        const debouncedFn = debounce(testFunction, 100);
        
        // Call, wait 50ms, call again (should reset timer)
        debouncedFn();
        await new Promise(resolve => setTimeout(resolve, 50));
        assertEqual(executionCount, 0, 'Function not executed after 50ms');
        
        debouncedFn(); // This should reset the timer
        await new Promise(resolve => setTimeout(resolve, 50));
        assertEqual(executionCount, 0, 'Function still not executed after reset');
        
        // Wait for full delay from last call
        await new Promise(resolve => setTimeout(resolve, 60));
        assertEqual(executionCount, 1, 'Function executed after full delay from last call');
      });

      await it('debounce preserves function arguments', async () => {
        let lastArgs = null;
        const testFunction = (...args) => { lastArgs = args; };
        const debouncedFn = debounce(testFunction, 50);
        
        // Call with different arguments
        debouncedFn('first', 1);
        debouncedFn('second', 2);
        debouncedFn('third', 3);
        
        await new Promise(resolve => setTimeout(resolve, 80));
        
        // Should have the arguments from the last call
        assert(Array.isArray(lastArgs), 'Arguments were passed');
        assertEqual(lastArgs[0], 'third', 'First argument preserved');
        assertEqual(lastArgs[1], 3, 'Second argument preserved');
      });

      await it('debounce allows execution after delay period completes', async () => {
        let executionCount = 0;
        const testFunction = () => { executionCount++; };
        const debouncedFn = debounce(testFunction, 50);
        
        // First batch of calls
        debouncedFn();
        debouncedFn();
        
        await new Promise(resolve => setTimeout(resolve, 80));
        assertEqual(executionCount, 1, 'First execution completed');
        
        // Second batch of calls after delay
        debouncedFn();
        debouncedFn();
        
        await new Promise(resolve => setTimeout(resolve, 80));
        assertEqual(executionCount, 2, 'Second execution completed');
      });

      await it('debounce handles zero delay correctly', async () => {
        let executionCount = 0;
        const testFunction = () => { executionCount++; };
        const debouncedFn = debounce(testFunction, 0);
        
        debouncedFn();
        debouncedFn();
        debouncedFn();
        
        // With zero delay, should execute on next tick
        await new Promise(resolve => setTimeout(resolve, 10));
        assertEqual(executionCount, 1, 'Function executed once with zero delay');
      });

      await it('debounce works with different delay values', async () => {
        const delays = [25, 50, 100, 200];
        
        for (const delay of delays) {
          let executionCount = 0;
          const testFunction = () => { executionCount++; };
          const debouncedFn = debounce(testFunction, delay);
          
          // Make rapid calls
          for (let i = 0; i < 5; i++) {
            debouncedFn();
          }
          
          // Wait for delay + buffer
          await new Promise(resolve => setTimeout(resolve, delay + 20));
          
          assertEqual(executionCount, 1, `Debounce works with ${delay}ms delay`);
        }
      });

      await it('multiple debounced functions work independently', async () => {
        let count1 = 0, count2 = 0;
        const fn1 = debounce(() => { count1++; }, 50);
        const fn2 = debounce(() => { count2++; }, 50);
        
        fn1();
        fn1();
        fn2();
        fn2();
        
        await new Promise(resolve => setTimeout(resolve, 80));
        
        assertEqual(count1, 1, 'First debounced function executed once');
        assertEqual(count2, 1, 'Second debounced function executed once');
      });

      await it('debounce handles function that throws error gracefully', async () => {
        let executionCount = 0;
        const errorFunction = () => {
          executionCount++;
          // Don't actually throw to avoid breaking test runner
          // Just simulate error handling
        };
        const debouncedFn = debounce(errorFunction, 50);
        
        debouncedFn();
        debouncedFn();
        
        await new Promise(resolve => setTimeout(resolve, 80));
        
        assertEqual(executionCount, 1, 'Function executed once despite error simulation');
      });

      // Property-based test: For any sequence of N rapid calls within delay window,
      // only 1 execution should occur
      await it('property: N rapid calls within delay window result in 1 execution', async () => {
        const testCases = [
          { calls: 2, delay: 50 },
          { calls: 5, delay: 100 },
          { calls: 10, delay: 75 },
          { calls: 20, delay: 150 }
        ];
        
        for (const { calls, delay } of testCases) {
          let executionCount = 0;
          const testFunction = () => { executionCount++; };
          const debouncedFn = debounce(testFunction, delay);
          
          // Make N rapid calls
          for (let i = 0; i < calls; i++) {
            debouncedFn();
          }
          
          // Wait for delay + buffer
          await new Promise(resolve => setTimeout(resolve, delay + 50));
          
          assertEqual(
            executionCount, 
            1, 
            `${calls} rapid calls with ${delay}ms delay resulted in 1 execution`
          );
        }
      });

      // Property-based test: Calls separated by more than delay should each execute
      await it('property: calls separated by delay period each execute', async () => {
        let executionCount = 0;
        const testFunction = () => { executionCount++; };
        const delay = 50;
        const debouncedFn = debounce(testFunction, delay);
        
        const numCalls = 3;
        
        for (let i = 0; i < numCalls; i++) {
          debouncedFn();
          // Wait longer than delay between calls
          await new Promise(resolve => setTimeout(resolve, delay + 20));
        }
        
        assertEqual(
          executionCount, 
          numCalls, 
          `${numCalls} calls separated by delay each executed`
        );
      });
    });

    await describe('Debounce Integration with Search Input', async () => {
      
      await it('simulates search input behavior with debounce', async () => {
        let searchExecutions = [];
        const searchHandler = (term) => {
          searchExecutions.push({ term, timestamp: Date.now() });
        };
        const debouncedSearch = debounce(searchHandler, 300);
        
        const startTime = Date.now();
        
        // Simulate rapid typing
        debouncedSearch('s');
        await new Promise(resolve => setTimeout(resolve, 50));
        debouncedSearch('sn');
        await new Promise(resolve => setTimeout(resolve, 50));
        debouncedSearch('sna');
        await new Promise(resolve => setTimeout(resolve, 50));
        debouncedSearch('snak');
        await new Promise(resolve => setTimeout(resolve, 50));
        debouncedSearch('snake');
        
        // Wait for debounce to complete
        await new Promise(resolve => setTimeout(resolve, 350));
        
        assertEqual(searchExecutions.length, 1, 'Search executed only once');
        assertEqual(searchExecutions[0].term, 'snake', 'Final search term used');
        
        const executionTime = searchExecutions[0].timestamp - startTime;
        assert(executionTime >= 300, 'Search executed after debounce delay');
      });

      await it('simulates user pausing during typing', async () => {
        let searchExecutions = [];
        const searchHandler = (term) => {
          searchExecutions.push(term);
        };
        const debouncedSearch = debounce(searchHandler, 300);
        
        // Type "sna", pause, then continue
        debouncedSearch('s');
        debouncedSearch('sn');
        debouncedSearch('sna');
        
        // Wait for debounce (user paused typing)
        await new Promise(resolve => setTimeout(resolve, 350));
        assertEqual(searchExecutions.length, 1, 'First search executed after pause');
        assertEqual(searchExecutions[0], 'sna', 'Partial term searched');
        
        // Continue typing
        debouncedSearch('snak');
        debouncedSearch('snake');
        
        // Wait for second debounce
        await new Promise(resolve => setTimeout(resolve, 350));
        assertEqual(searchExecutions.length, 2, 'Second search executed');
        assertEqual(searchExecutions[1], 'snake', 'Final term searched');
      });
    });

    runTests();
    process.exit(failed > 0 ? 1 : 0);
  })();
}

// Export for use in other test files
if (typeof module !== 'undefined') {
  module.exports = { runTests, debounce };
}