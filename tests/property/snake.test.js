/**
 * Property Tests for Snake Game - BN Games Bug Fixes
 * Pure JavaScript - Zero Dependencies
 * 
 * Tests:
 * - Property 4: Snake Safe Initialization
 * - Property 5: Snake Collision Timing
 * 
 * **Feature: bn-games-bug-fixes, Property 4: Snake Safe Initialization**
 * **Feature: bn-games-bug-fixes, Property 5: Snake Collision Timing**
 * 
 * Run with: node game-site/tests/snake-property.test.js
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
// SNAKE GAME LOGIC (extracted for testing)
// ============================================================

/**
 * SnakeGameLogic - Pure logic extracted from SnakeGame for testing
 * This allows us to test the game logic without DOM dependencies
 */
class SnakeGameLogic {
  constructor(gridSize = 20) {
    this.gridSize = gridSize;
    this.snake = [];
    this.direction = { x: 0, y: 0 };
    this.nextDirection = { x: 0, y: 0 };
    this.gameStarted = false;
    this.isPlaying = false;
    this.isGameOver = false;
  }

  /**
   * Initialize snake at safe center position
   * Matches the implementation in SnakeGame.startGame()
   */
  startGame() {
    // Calculate safe center position (at least 2 cells from borders)
    const centerX = Math.floor(this.gridSize / 2);
    const centerY = Math.floor(this.gridSize / 2);

    // Initialize snake with 3 horizontal segments at center
    this.snake = [
      { x: centerX, y: centerY },       // Head
      { x: centerX - 1, y: centerY },   // Body segment 1
      { x: centerX - 2, y: centerY }    // Body segment 2 (tail)
    ];

    this.direction = { x: 0, y: 0 }; // No movement until player input
    this.nextDirection = { x: 0, y: 0 };
    this.gameStarted = false;
    this.isPlaying = true;
    this.isGameOver = false;
  }

  /**
   * Handle player input (arrow keys)
   * Matches the implementation in SnakeGame.handleSwipe()
   */
  handleInput(key) {
    if (!this.isPlaying || this.isGameOver) return;

    let newDirection = null;

    switch (key) {
      case 'ArrowUp':
        if (this.direction.y !== 1) newDirection = { x: 0, y: -1 };
        break;
      case 'ArrowDown':
        if (this.direction.y !== -1) newDirection = { x: 0, y: 1 };
        break;
      case 'ArrowLeft':
        if (this.direction.x !== 1) newDirection = { x: -1, y: 0 };
        break;
      case 'ArrowRight':
        if (this.direction.x !== -1) newDirection = { x: 1, y: 0 };
        break;
    }

    if (newDirection) {
      this.nextDirection = newDirection;

      // Start the game on first valid input
      if (!this.gameStarted) {
        this.gameStarted = true;
        this.direction = newDirection;
      }
    }
  }

  /**
   * Check if position is safe (at least minDistance from borders)
   */
  isPositionSafe(x, y, minDistance = 2) {
    return (
      x >= minDistance + 1 &&
      x <= this.gridSize - minDistance &&
      y >= minDistance + 1 &&
      y <= this.gridSize - minDistance
    );
  }

  /**
   * Check wall collision
   */
  checkWallCollision(head) {
    return (
      head.x < 1 ||
      head.x > this.gridSize ||
      head.y < 1 ||
      head.y > this.gridSize
    );
  }

  /**
   * Check self collision
   */
  checkSelfCollision(head) {
    return this.snake.some(
      (segment) => segment.x === head.x && segment.y === head.y
    );
  }

  /**
   * Move the snake one step
   * Matches the implementation in SnakeGame.move()
   */
  move() {
    if (!this.gameStarted || !this.isPlaying || this.isGameOver) return;

    // Update direction
    if (
      this.direction.x + this.nextDirection.x !== 0 ||
      this.direction.y + this.nextDirection.y !== 0
    ) {
      this.direction = this.nextDirection;
    }

    const head = { ...this.snake[0] };
    head.x += this.direction.x;
    head.y += this.direction.y;

    // Wall Collision
    if (this.checkWallCollision(head)) {
      this.isGameOver = true;
      this.isPlaying = false;
      return;
    }

    // Self Collision
    if (this.checkSelfCollision(head)) {
      this.isGameOver = true;
      this.isPlaying = false;
      return;
    }

    this.snake.unshift(head);
    this.snake.pop(); // Remove tail (no food eaten in this test)
  }

  /**
   * Get the head position
   */
  getHead() {
    return this.snake[0];
  }
}

// ============================================================
// PROPERTY TEST UTILITIES
// ============================================================

/**
 * Simple random number generator for property testing
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random grid sizes for testing
 */
function randomGridSize() {
  // Grid sizes between 10 and 30 (reasonable game sizes)
  return randomInt(10, 30);
}

/**
 * Generate random valid direction
 */
function randomDirection() {
  const directions = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  return directions[randomInt(0, 3)];
}

/**
 * Generate a sequence of random valid moves (no 180-degree turns)
 */
function generateValidMoveSequence(length, startDirection) {
  const moves = [];
  let currentDir = startDirection;
  
  const opposites = {
    'ArrowUp': 'ArrowDown',
    'ArrowDown': 'ArrowUp',
    'ArrowLeft': 'ArrowRight',
    'ArrowRight': 'ArrowLeft'
  };

  for (let i = 0; i < length; i++) {
    // Get valid directions (not opposite of current)
    const validDirs = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
      .filter(d => d !== opposites[currentDir]);
    
    const nextDir = validDirs[randomInt(0, validDirs.length - 1)];
    moves.push(nextDir);
    currentDir = nextDir;
  }

  return moves;
}

// ============================================================
// PROPERTY 4: Snake Safe Initialization
// **Feature: bn-games-bug-fixes, Property 4: Snake Safe Initialization**
// **Validates: Requirements 2.1**
// ============================================================

describe('Property 4: Snake Safe Initialization', () => {
  const NUM_RUNS = 100;

  it(`*For any* grid size, initial snake position is at least 2 cells from borders (${NUM_RUNS} runs)`, () => {
    for (let run = 0; run < NUM_RUNS; run++) {
      const gridSize = randomGridSize();
      const game = new SnakeGameLogic(gridSize);
      game.startGame();

      // Check all snake segments are safe distance from borders
      game.snake.forEach((segment, index) => {
        const isSafe = game.isPositionSafe(segment.x, segment.y, 2);
        assert(
          isSafe,
          `Run ${run + 1}: Grid ${gridSize}x${gridSize}, Segment ${index} at (${segment.x}, ${segment.y}) is safe`
        );
      });
    }
  });

  it(`*For any* initialization, snake has exactly 3 segments`, () => {
    for (let run = 0; run < NUM_RUNS; run++) {
      const gridSize = randomGridSize();
      const game = new SnakeGameLogic(gridSize);
      game.startGame();

      assertEqual(
        game.snake.length,
        3,
        `Run ${run + 1}: Grid ${gridSize}x${gridSize}, Snake has 3 segments`
      );
    }
  });

  it(`*For any* initialization, snake segments are horizontally aligned`, () => {
    for (let run = 0; run < NUM_RUNS; run++) {
      const gridSize = randomGridSize();
      const game = new SnakeGameLogic(gridSize);
      game.startGame();

      const headY = game.snake[0].y;
      const allSameY = game.snake.every(segment => segment.y === headY);
      
      assert(
        allSameY,
        `Run ${run + 1}: Grid ${gridSize}x${gridSize}, All segments at y=${headY}`
      );
    }
  });

  it(`*For any* initialization, snake segments are contiguous`, () => {
    for (let run = 0; run < NUM_RUNS; run++) {
      const gridSize = randomGridSize();
      const game = new SnakeGameLogic(gridSize);
      game.startGame();

      // Check each segment is adjacent to the next
      for (let i = 0; i < game.snake.length - 1; i++) {
        const current = game.snake[i];
        const next = game.snake[i + 1];
        const dx = Math.abs(current.x - next.x);
        const dy = Math.abs(current.y - next.y);
        const isAdjacent = (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
        
        assert(
          isAdjacent,
          `Run ${run + 1}: Segments ${i} and ${i + 1} are adjacent`
        );
      }
    }
  });

  it(`*For any* initialization, gameStarted flag is false`, () => {
    for (let run = 0; run < NUM_RUNS; run++) {
      const gridSize = randomGridSize();
      const game = new SnakeGameLogic(gridSize);
      game.startGame();

      assertEqual(
        game.gameStarted,
        false,
        `Run ${run + 1}: gameStarted is false after startGame()`
      );
    }
  });

  it(`*For any* initialization, direction is zero (no movement)`, () => {
    for (let run = 0; run < NUM_RUNS; run++) {
      const gridSize = randomGridSize();
      const game = new SnakeGameLogic(gridSize);
      game.startGame();

      assertEqual(
        game.direction.x,
        0,
        `Run ${run + 1}: direction.x is 0`
      );
      assertEqual(
        game.direction.y,
        0,
        `Run ${run + 1}: direction.y is 0`
      );
    }
  });
});

// ============================================================
// PROPERTY 5: Snake Collision Timing
// **Feature: bn-games-bug-fixes, Property 5: Snake Collision Timing**
// **Validates: Requirements 2.3, 2.4**
// ============================================================

describe('Property 5: Snake Collision Timing', () => {
  const NUM_RUNS = 100;

  it(`*For any* game state before first input, move() does not cause game over`, () => {
    for (let run = 0; run < NUM_RUNS; run++) {
      const gridSize = randomGridSize();
      const game = new SnakeGameLogic(gridSize);
      game.startGame();

      // Try to move multiple times without input
      for (let i = 0; i < 10; i++) {
        game.move();
      }

      assert(
        !game.isGameOver,
        `Run ${run + 1}: No game over before first input`
      );
      assert(
        game.isPlaying,
        `Run ${run + 1}: Game still playing before first input`
      );
    }
  });

  it(`*For any* first valid input, gameStarted becomes true`, () => {
    for (let run = 0; run < NUM_RUNS; run++) {
      const gridSize = randomGridSize();
      const game = new SnakeGameLogic(gridSize);
      game.startGame();

      const direction = randomDirection();
      game.handleInput(direction);

      assertEqual(
        game.gameStarted,
        true,
        `Run ${run + 1}: gameStarted is true after input "${direction}"`
      );
    }
  });

  it(`*For any* sequence of valid moves (no wall collision), game remains active`, () => {
    for (let run = 0; run < NUM_RUNS; run++) {
      const gridSize = 20; // Fixed size for predictable testing
      const game = new SnakeGameLogic(gridSize);
      game.startGame();

      // Start with a safe direction (right, since snake is horizontal)
      game.handleInput('ArrowRight');

      // Generate a short sequence of moves that won't hit walls
      // With grid 20x20 and starting at center (10,10), we have room for ~7 moves in any direction
      const numMoves = randomInt(1, 5);
      const moves = generateValidMoveSequence(numMoves, 'ArrowRight');

      let gameOverDuringValidMoves = false;
      for (const move of moves) {
        game.handleInput(move);
        game.move();
        
        if (game.isGameOver) {
          // Check if this was actually a valid move (not hitting wall)
          const head = game.getHead();
          if (!game.checkWallCollision(head)) {
            gameOverDuringValidMoves = true;
          }
          break;
        }
      }

      // If game ended during valid moves, that's a bug
      // (Note: self-collision is possible with longer snakes, but our snake is only 3 segments)
      if (gameOverDuringValidMoves) {
        assert(false, `Run ${run + 1}: Game over during valid moves`);
      } else {
        assert(true, `Run ${run + 1}: Game active after ${moves.length} valid moves`);
      }
    }
  });

  it(`*For any* game state, snake remains visible (has segments) until game over`, () => {
    for (let run = 0; run < NUM_RUNS; run++) {
      const gridSize = 20;
      const game = new SnakeGameLogic(gridSize);
      game.startGame();

      // Start moving
      game.handleInput('ArrowRight');

      // Make several moves
      for (let i = 0; i < 5; i++) {
        game.move();
        
        // Snake should always have segments while playing
        if (game.isPlaying) {
          assert(
            game.snake.length > 0,
            `Run ${run + 1}, Move ${i + 1}: Snake has segments while playing`
          );
        }
      }
    }
  });

  it(`*For any* game state, collision detection only happens after gameStarted`, () => {
    for (let run = 0; run < NUM_RUNS; run++) {
      const gridSize = randomGridSize();
      const game = new SnakeGameLogic(gridSize);
      game.startGame();

      // Before any input, gameStarted should be false
      assertEqual(game.gameStarted, false, `Run ${run + 1}: gameStarted false initially`);

      // Multiple move attempts should not trigger game over
      for (let i = 0; i < 5; i++) {
        game.move();
      }
      
      assert(!game.isGameOver, `Run ${run + 1}: No game over before gameStarted`);

      // After input, gameStarted should be true
      game.handleInput('ArrowRight');
      assertEqual(game.gameStarted, true, `Run ${run + 1}: gameStarted true after input`);
    }
  });
});

// ============================================================
// FINAL REPORT
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('📊 SNAKE PROPERTY TEST RESULTS');
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
  console.log('\n🎉 All snake property tests passed!');
  process.exit(0);
}
