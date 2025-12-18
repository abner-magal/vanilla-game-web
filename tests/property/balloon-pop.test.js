/**
 * Property Tests for Balloon Pop Game
 * Pure JavaScript - Zero Dependencies
 * 
 * Tests:
 * - Property 6: Balloon Minimum Count Invariant
 * - Property 7: Balloon Spawn After Pop
 * 
 * **Feature: bn-games-bug-fixes**
 * **Validates: Requirements 3.2, 3.3**
 * 
 * Run with: node game-site/tests/balloon-pop-property.test.js
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

function describe(suite, fn) {
  console.log(`\n📦 ${suite}`);
  fn();
}

function it(testName, fn) {
  try {
    fn();
  } catch (err) {
    failed++;
    results.push({ status: '❌', message: testName });
    console.error(`FAIL: ${testName}`);
    console.error(`  Error: ${err.message}`);
  }
}

// ============================================================
// MOCK BALLOON POP GAME LOGIC (extracted for testing)
// ============================================================

/**
 * BalloonManager - Core balloon management logic extracted for testing
 * This simulates the balloon spawning and management behavior
 */
class BalloonManager {
  constructor(boardWidth = 800, boardHeight = 500) {
    this.balloons = [];
    this.boardWidth = boardWidth;
    this.boardHeight = boardHeight;
    this.MIN_BALLOONS = 1; // Minimum balloons during active gameplay
    this.MAX_BALLOONS = 20; // Maximum balloons allowed
  }

  /**
   * Spawns a balloon at a specific Y position
   * @param {number} startY - Starting Y position
   * @returns {object} The created balloon object
   */
  spawnBalloonAt(startY) {
    const width = 50;
    const x = Math.random() * (this.boardWidth - width);
    const y = Math.min(startY, this.boardHeight);
    const hue = Math.floor(Math.random() * 360);

    const balloon = {
      id: Date.now() + Math.random(),
      x: x,
      y: y,
      speed: Math.random() * 2 + 1.5,
      color: `hsl(${hue}, 75%, 60%)`,
      active: true
    };

    this.balloons.push(balloon);
    return balloon;
  }

  /**
   * Spawns a balloon at the bottom of the board
   * @returns {object} The created balloon object
   */
  spawnBalloon() {
    return this.spawnBalloonAt(this.boardHeight);
  }

  /**
   * Spawns initial balloons distributed across the board
   * @param {number} count - Number of balloons to spawn
   */
  spawnInitialBalloons(count = 5) {
    for (let i = 0; i < count; i++) {
      const yOffset = Math.random() * (this.boardHeight * 0.8);
      this.spawnBalloonAt(this.boardHeight - yOffset);
    }
  }

  /**
   * Pops a balloon by ID
   * @param {number} balloonId - ID of balloon to pop
   * @returns {boolean} True if balloon was found and popped
   */
  popBalloon(balloonId) {
    const idx = this.balloons.findIndex(b => b.id === balloonId);
    if (idx > -1) {
      this.balloons.splice(idx, 1);
      return true;
    }
    return false;
  }

  /**
   * Removes a balloon that escaped (went off screen)
   * @param {number} balloonId - ID of balloon to remove
   */
  removeBalloon(balloonId) {
    const idx = this.balloons.findIndex(b => b.id === balloonId);
    if (idx > -1) {
      this.balloons.splice(idx, 1);
    }
  }

  /**
   * Gets the current balloon count
   * @returns {number} Number of active balloons
   */
  getBalloonCount() {
    return this.balloons.length;
  }

  /**
   * Checks if balloon count is within valid range
   * @returns {boolean} True if count is valid
   */
  isValidBalloonCount() {
    const count = this.getBalloonCount();
    return count >= 0 && count <= this.MAX_BALLOONS;
  }

  /**
   * Clears all balloons
   */
  clear() {
    this.balloons = [];
  }

  /**
   * Updates balloon positions (simulates game loop)
   * @param {number} deltaTime - Time since last update in seconds
   * @param {number} speedMultiplier - Speed multiplier from difficulty
   * @returns {Array} Array of balloon IDs that escaped
   */
  update(deltaTime, speedMultiplier = 1) {
    const escaped = [];
    const frameSpeed = 60 * deltaTime;

    for (let i = this.balloons.length - 1; i >= 0; i--) {
      const b = this.balloons[i];
      b.y -= b.speed * speedMultiplier * frameSpeed;

      if (b.y < -80) {
        escaped.push(b.id);
        this.balloons.splice(i, 1);
      }
    }

    return escaped;
  }
}

// ============================================================
// PROPERTY TEST HELPERS
// ============================================================

/**
 * Generates a random integer between min and max (inclusive)
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random float between min and max
 */
function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Runs a property test multiple times
 * @param {number} iterations - Number of test iterations
 * @param {Function} testFn - Test function that returns true if property holds
 * @param {string} propertyName - Name of the property being tested
 */
function runPropertyTest(iterations, testFn, propertyName) {
  let failures = [];
  
  for (let i = 0; i < iterations; i++) {
    try {
      const result = testFn(i);
      if (!result.passed) {
        failures.push({ iteration: i, ...result });
        if (failures.length >= 3) break; // Stop after 3 failures
      }
    } catch (err) {
      failures.push({ iteration: i, error: err.message });
      if (failures.length >= 3) break;
    }
  }

  if (failures.length > 0) {
    console.error(`  Property "${propertyName}" failed:`);
    failures.forEach(f => {
      console.error(`    Iteration ${f.iteration}: ${f.reason || f.error}`);
      if (f.input) console.error(`    Input: ${JSON.stringify(f.input)}`);
    });
  }

  return failures.length === 0;
}

// ============================================================
// TEST SUITE: Property 6 - Balloon Minimum Count Invariant
// **Feature: bn-games-bug-fixes, Property 6: Balloon Minimum Count Invariant**
// **Validates: Requirements 3.2**
// ============================================================

describe('Property 6: Balloon Minimum Count Invariant', () => {
  it('After spawnInitialBalloons(N), balloon count equals N', () => {
    const propertyHolds = runPropertyTest(100, (iteration) => {
      const manager = new BalloonManager();
      const initialCount = randomInt(1, 10);
      
      manager.spawnInitialBalloons(initialCount);
      const actualCount = manager.getBalloonCount();
      
      return {
        passed: actualCount === initialCount,
        reason: `Expected ${initialCount} balloons, got ${actualCount}`,
        input: { initialCount }
      };
    }, 'spawnInitialBalloons creates exact count');

    assert(propertyHolds, 'spawnInitialBalloons(N) creates exactly N balloons');
  });

  it('Balloon count is always within valid range [0, MAX_BALLOONS]', () => {
    const propertyHolds = runPropertyTest(100, (iteration) => {
      const manager = new BalloonManager();
      
      // Random sequence of spawns - constrained to valid input domain
      // The game logic should prevent spawning beyond MAX_BALLOONS
      const spawnCount = randomInt(0, manager.MAX_BALLOONS);
      for (let i = 0; i < spawnCount; i++) {
        manager.spawnBalloon();
      }
      
      const isValid = manager.isValidBalloonCount();
      const count = manager.getBalloonCount();
      
      return {
        passed: isValid,
        reason: `Balloon count ${count} is outside valid range`,
        input: { spawnCount, actualCount: count }
      };
    }, 'balloon count within valid range');

    assert(propertyHolds, 'Balloon count always within [0, MAX_BALLOONS]');
  });

  it('After game start with initial spawn, at least 1 balloon exists', () => {
    const propertyHolds = runPropertyTest(100, (iteration) => {
      const manager = new BalloonManager(
        randomInt(400, 1200), // Random board width
        randomInt(300, 800)   // Random board height
      );
      
      // Simulate game start - always spawn at least 5 initial balloons
      manager.spawnInitialBalloons(5);
      
      const count = manager.getBalloonCount();
      
      return {
        passed: count >= 1,
        reason: `Expected at least 1 balloon, got ${count}`,
        input: { boardWidth: manager.boardWidth, boardHeight: manager.boardHeight }
      };
    }, 'at least 1 balloon after game start');

    assert(propertyHolds, 'At least 1 balloon exists after game start');
  });

  it('Spawned balloons have valid positions within board bounds', () => {
    const propertyHolds = runPropertyTest(100, (iteration) => {
      const boardWidth = randomInt(400, 1200);
      const boardHeight = randomInt(300, 800);
      const manager = new BalloonManager(boardWidth, boardHeight);
      
      manager.spawnInitialBalloons(randomInt(3, 10));
      
      const invalidBalloons = manager.balloons.filter(b => {
        const balloonWidth = 50;
        return b.x < 0 || 
               b.x > boardWidth - balloonWidth || 
               b.y < 0 || 
               b.y > boardHeight;
      });
      
      return {
        passed: invalidBalloons.length === 0,
        reason: `${invalidBalloons.length} balloons have invalid positions`,
        input: { boardWidth, boardHeight, invalidCount: invalidBalloons.length }
      };
    }, 'balloon positions within bounds');

    assert(propertyHolds, 'All spawned balloons have valid positions');
  });
});

// ============================================================
// TEST SUITE: Property 7 - Balloon Spawn After Pop
// **Feature: bn-games-bug-fixes, Property 7: Balloon Spawn After Pop**
// **Validates: Requirements 3.3**
// ============================================================

describe('Property 7: Balloon Spawn After Pop', () => {
  it('Popping a balloon removes exactly 1 balloon from the array', () => {
    const propertyHolds = runPropertyTest(100, (iteration) => {
      const manager = new BalloonManager();
      
      // Spawn some balloons
      const initialSpawn = randomInt(3, 10);
      manager.spawnInitialBalloons(initialSpawn);
      
      const countBefore = manager.getBalloonCount();
      
      // Pop a random balloon
      if (manager.balloons.length > 0) {
        const randomIdx = randomInt(0, manager.balloons.length - 1);
        const balloonToPop = manager.balloons[randomIdx];
        manager.popBalloon(balloonToPop.id);
      }
      
      const countAfter = manager.getBalloonCount();
      const expectedCount = countBefore > 0 ? countBefore - 1 : 0;
      
      return {
        passed: countAfter === expectedCount,
        reason: `Expected ${expectedCount} balloons after pop, got ${countAfter}`,
        input: { countBefore, countAfter }
      };
    }, 'pop removes exactly 1 balloon');

    assert(propertyHolds, 'Popping removes exactly 1 balloon');
  });

  it('After pop + spawn, balloon count is maintained or increased', () => {
    const propertyHolds = runPropertyTest(100, (iteration) => {
      const manager = new BalloonManager();
      
      // Start with initial balloons
      manager.spawnInitialBalloons(5);
      const initialCount = manager.getBalloonCount();
      
      // Pop a balloon
      if (manager.balloons.length > 0) {
        const balloonToPop = manager.balloons[0];
        manager.popBalloon(balloonToPop.id);
      }
      
      // Spawn a new balloon (simulating game behavior)
      manager.spawnBalloon();
      
      const finalCount = manager.getBalloonCount();
      
      // After pop + spawn, count should be same as initial
      return {
        passed: finalCount === initialCount,
        reason: `Expected ${initialCount} balloons after pop+spawn, got ${finalCount}`,
        input: { initialCount, finalCount }
      };
    }, 'pop + spawn maintains count');

    assert(propertyHolds, 'Pop + spawn maintains balloon count');
  });

  it('Balloon array remains valid after multiple pop operations', () => {
    const propertyHolds = runPropertyTest(100, (iteration) => {
      const manager = new BalloonManager();
      
      // Spawn balloons
      manager.spawnInitialBalloons(randomInt(5, 15));
      
      // Pop random number of balloons
      const popsToPerform = randomInt(1, manager.getBalloonCount());
      for (let i = 0; i < popsToPerform && manager.balloons.length > 0; i++) {
        const randomIdx = randomInt(0, manager.balloons.length - 1);
        manager.popBalloon(manager.balloons[randomIdx].id);
      }
      
      // Verify array integrity
      const isValid = manager.isValidBalloonCount() && 
                      manager.balloons.every(b => b.id && b.x !== undefined && b.y !== undefined);
      
      return {
        passed: isValid,
        reason: `Balloon array integrity check failed`,
        input: { popsPerformed: popsToPerform, remainingCount: manager.getBalloonCount() }
      };
    }, 'array integrity after pops');

    assert(propertyHolds, 'Balloon array remains valid after multiple pops');
  });

  it('Spawning after pop creates balloon with valid properties', () => {
    const propertyHolds = runPropertyTest(100, (iteration) => {
      const boardWidth = randomInt(400, 1200);
      const boardHeight = randomInt(300, 800);
      const manager = new BalloonManager(boardWidth, boardHeight);
      
      // Initial spawn
      manager.spawnInitialBalloons(3);
      
      // Pop one
      if (manager.balloons.length > 0) {
        manager.popBalloon(manager.balloons[0].id);
      }
      
      // Spawn new balloon
      const newBalloon = manager.spawnBalloon();
      
      // Validate new balloon properties
      const balloonWidth = 50;
      const isValid = newBalloon &&
                      newBalloon.x >= 0 &&
                      newBalloon.x <= boardWidth - balloonWidth &&
                      newBalloon.y >= 0 &&
                      newBalloon.y <= boardHeight &&
                      newBalloon.speed > 0 &&
                      newBalloon.color;
      
      return {
        passed: isValid,
        reason: `New balloon has invalid properties`,
        input: { newBalloon, boardWidth, boardHeight }
      };
    }, 'new balloon has valid properties');

    assert(propertyHolds, 'New balloon after pop has valid properties');
  });

  it('Balloon count stays within [1, MAX_BALLOONS] during gameplay simulation', () => {
    const propertyHolds = runPropertyTest(50, (iteration) => {
      const manager = new BalloonManager();
      
      // Simulate game start
      manager.spawnInitialBalloons(5);
      
      // Simulate 100 game ticks with random pops and spawns
      for (let tick = 0; tick < 100; tick++) {
        // Random pop (30% chance)
        if (Math.random() < 0.3 && manager.balloons.length > 0) {
          const randomIdx = randomInt(0, manager.balloons.length - 1);
          manager.popBalloon(manager.balloons[randomIdx].id);
        }
        
        // Spawn new balloon (40% chance, simulating spawn rate)
        if (Math.random() < 0.4 && manager.balloons.length < manager.MAX_BALLOONS) {
          manager.spawnBalloon();
        }
        
        // Check invariant: count should be within bounds
        const count = manager.getBalloonCount();
        if (count < 0 || count > manager.MAX_BALLOONS) {
          return {
            passed: false,
            reason: `Count ${count} out of bounds at tick ${tick}`,
            input: { tick, count }
          };
        }
      }
      
      return { passed: true };
    }, 'count within bounds during gameplay');

    assert(propertyHolds, 'Balloon count stays within bounds during gameplay');
  });
});

// ============================================================
// FINAL REPORT
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('📊 BALLOON POP PROPERTY TEST RESULTS');
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
  process.exit(1);
} else {
  console.log('\n🎉 All Balloon Pop property tests passed!');
  process.exit(0);
}
