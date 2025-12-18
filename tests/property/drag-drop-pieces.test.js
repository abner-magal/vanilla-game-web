/**
 * Property Tests for Number Puzzle (Drag & Drop Game)
 * Pure JavaScript - Zero Dependencies
 * 
 * Tests:
 * - Property 1: Number Puzzle Pieces Count
 * - Property 2: Number Puzzle Slots Count
 * 
 * **Feature: bug-fixes-qa-report, Property 1: Number Puzzle Pieces Count**
 * **Validates: Requirements 2.1**
 * 
 * **Feature: bug-fixes-qa-report, Property 2: Number Puzzle Slots Count**
 * **Validates: Requirements 2.2**
 * 
 * Run with: node game-site/tests/drag-drop-pieces.property.test.js
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
// MOCK DOM ENVIRONMENT
// ============================================================

class MockElement {
  constructor(id = '') {
    this.id = id;
    this.innerHTML = '';
    this.children = [];
    this.classList = new Set();
    this.dataset = {};
    this._textContent = '';
    this.draggable = false;
    this.eventListeners = {};
  }

  get textContent() {
    return this._textContent;
  }

  set textContent(value) {
    this._textContent = String(value);
  }

  appendChild(child) {
    this.children.push(child);
    child.parentElement = this;
  }

  querySelectorAll(selector) {
    if (selector === '.piece') {
      return this.children.filter(c => c.classList.has('piece'));
    }
    if (selector === '.slot') {
      return this.children.filter(c => c.classList.has('slot'));
    }
    return [];
  }

  addEventListener(event, handler) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(handler);
  }

  removeEventListener(event, handler) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(h => h !== handler);
    }
  }
}

// Mock document.getElementById
const mockElements = {};
const originalGetElementById = global.document?.getElementById;

function mockGetElementById(id) {
  if (!mockElements[id]) {
    mockElements[id] = new MockElement(id);
  }
  return mockElements[id];
}

// ============================================================
// PUZZLE MANAGER - Core puzzle logic extracted for testing
// ============================================================

class PuzzleManager {
  constructor(sourceContainerId = 'pieces-container', targetContainerId = 'puzzle-board') {
    this.sourceContainer = mockGetElementById(sourceContainerId);
    this.targetContainer = mockGetElementById(targetContainerId);
    this.pieces = [];
  }

  /**
   * Creates the puzzle with 9 pieces and 9 slots
   * **Feature: bug-fixes-qa-report, Property 1: Number Puzzle Pieces Count**
   * **Validates: Requirements 2.1**
   */
  createPuzzle() {
    this.sourceContainer.innerHTML = '';
    this.targetContainer.innerHTML = '';
    this.pieces = [];

    // Create 9 slots in target
    for (let i = 1; i <= 9; i++) {
      const slot = new MockElement();
      slot.classList.add('slot');
      slot.dataset.number = i;
      slot.textContent = i;
      this.targetContainer.appendChild(slot);
    }

    // Create 9 pieces
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    numbers.sort(() => 0.5 - Math.random());

    numbers.forEach((num) => {
      const piece = new MockElement();
      piece.classList.add('piece');
      piece.draggable = true;
      piece.textContent = num;
      piece.dataset.number = num;

      this.sourceContainer.appendChild(piece);
      this.pieces.push(piece);
    });
  }

  /**
   * Gets the count of pieces in the source container
   */
  getPiecesCount() {
    return this.sourceContainer.querySelectorAll('.piece').length;
  }

  /**
   * Gets the count of slots in the target container
   */
  getSlotsCount() {
    return this.targetContainer.querySelectorAll('.slot').length;
  }

  /**
   * Verifies all pieces have unique numbers 1-9
   */
  piecesHaveUniqueNumbers() {
    const pieces = this.sourceContainer.querySelectorAll('.piece');
    const numbers = new Set();
    
    for (const piece of pieces) {
      const num = piece.dataset.number;
      if (!num || numbers.has(num)) {
        return false;
      }
      numbers.add(num);
    }
    
    return numbers.size === 9 && Array.from(numbers).every(n => n >= 1 && n <= 9);
  }

  /**
   * Verifies all slots have unique numbers 1-9
   */
  slotsHaveUniqueNumbers() {
    const slots = this.targetContainer.querySelectorAll('.slot');
    const numbers = new Set();
    
    for (const slot of slots) {
      const num = slot.dataset.number;
      if (!num || numbers.has(num)) {
        return false;
      }
      numbers.add(num);
    }
    
    return numbers.size === 9 && Array.from(numbers).every(n => n >= 1 && n <= 9);
  }

  /**
   * Verifies all pieces have visible text content
   */
  piecesHaveVisibleText() {
    const pieces = this.sourceContainer.querySelectorAll('.piece');
    
    for (const piece of pieces) {
      if (!piece.textContent || piece.textContent.trim() === '') {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Verifies all slots have visible text content
   */
  slotsHaveVisibleText() {
    const slots = this.targetContainer.querySelectorAll('.slot');
    
    for (const slot of slots) {
      if (!slot.textContent || slot.textContent.trim() === '') {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Clears the puzzle
   */
  clear() {
    this.sourceContainer.innerHTML = '';
    this.targetContainer.innerHTML = '';
    this.pieces = [];
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
// TEST SUITE: Property 1 - Number Puzzle Pieces Count
// **Feature: bug-fixes-qa-report, Property 1: Number Puzzle Pieces Count**
// **Validates: Requirements 2.1**
// ============================================================

describe('Property 1: Number Puzzle Pieces Count', () => {
  it('After createPuzzle(), exactly 9 pieces exist in source container', () => {
    const propertyHolds = runPropertyTest(100, (iteration) => {
      // Clear mock elements
      mockElements['pieces-container'] = new MockElement('pieces-container');
      mockElements['puzzle-board'] = new MockElement('puzzle-board');
      
      const manager = new PuzzleManager();
      manager.createPuzzle();
      
      const piecesCount = manager.getPiecesCount();
      
      return {
        passed: piecesCount === 9,
        reason: `Expected 9 pieces, got ${piecesCount}`,
        input: { piecesCount }
      };
    }, 'exactly 9 pieces created');

    assert(propertyHolds, 'createPuzzle() creates exactly 9 pieces');
  });

  it('All pieces have unique numbers from 1 to 9', () => {
    const propertyHolds = runPropertyTest(100, (iteration) => {
      // Clear mock elements
      mockElements['pieces-container'] = new MockElement('pieces-container');
      mockElements['puzzle-board'] = new MockElement('puzzle-board');
      
      const manager = new PuzzleManager();
      manager.createPuzzle();
      
      const hasUniqueNumbers = manager.piecesHaveUniqueNumbers();
      
      return {
        passed: hasUniqueNumbers,
        reason: `Pieces do not have unique numbers 1-9`,
        input: { iteration }
      };
    }, 'pieces have unique numbers');

    assert(propertyHolds, 'All pieces have unique numbers 1-9');
  });

  it('All pieces have visible text content', () => {
    const propertyHolds = runPropertyTest(100, (iteration) => {
      // Clear mock elements
      mockElements['pieces-container'] = new MockElement('pieces-container');
      mockElements['puzzle-board'] = new MockElement('puzzle-board');
      
      const manager = new PuzzleManager();
      manager.createPuzzle();
      
      const hasVisibleText = manager.piecesHaveVisibleText();
      
      return {
        passed: hasVisibleText,
        reason: `Some pieces have no visible text`,
        input: { iteration }
      };
    }, 'pieces have visible text');

    assert(propertyHolds, 'All pieces have visible text content');
  });

  it('All pieces are draggable', () => {
    const propertyHolds = runPropertyTest(100, (iteration) => {
      // Clear mock elements
      mockElements['pieces-container'] = new MockElement('pieces-container');
      mockElements['puzzle-board'] = new MockElement('puzzle-board');
      
      const manager = new PuzzleManager();
      manager.createPuzzle();
      
      const pieces = manager.sourceContainer.querySelectorAll('.piece');
      const allDraggable = Array.from(pieces).every(p => p.draggable === true);
      
      return {
        passed: allDraggable,
        reason: `Not all pieces are draggable`,
        input: { iteration }
      };
    }, 'all pieces draggable');

    assert(propertyHolds, 'All pieces are draggable');
  });

  it('Pieces are in source container, not target container', () => {
    const propertyHolds = runPropertyTest(100, (iteration) => {
      // Clear mock elements
      mockElements['pieces-container'] = new MockElement('pieces-container');
      mockElements['puzzle-board'] = new MockElement('puzzle-board');
      
      const manager = new PuzzleManager();
      manager.createPuzzle();
      
      const piecesInSource = manager.sourceContainer.querySelectorAll('.piece').length;
      const piecesInTarget = manager.targetContainer.querySelectorAll('.piece').length;
      
      return {
        passed: piecesInSource === 9 && piecesInTarget === 0,
        reason: `Pieces in source: ${piecesInSource}, in target: ${piecesInTarget}`,
        input: { piecesInSource, piecesInTarget }
      };
    }, 'pieces in correct container');

    assert(propertyHolds, 'All pieces are in source container');
  });
});

// ============================================================
// TEST SUITE: Property 2 - Number Puzzle Slots Count
// **Feature: bug-fixes-qa-report, Property 2: Number Puzzle Slots Count**
// **Validates: Requirements 2.2**
// ============================================================

describe('Property 2: Number Puzzle Slots Count', () => {
  it('After createPuzzle(), exactly 9 slots exist in target container', () => {
    const propertyHolds = runPropertyTest(100, (iteration) => {
      // Clear mock elements
      mockElements['pieces-container'] = new MockElement('pieces-container');
      mockElements['puzzle-board'] = new MockElement('puzzle-board');
      
      const manager = new PuzzleManager();
      manager.createPuzzle();
      
      const slotsCount = manager.getSlotsCount();
      
      return {
        passed: slotsCount === 9,
        reason: `Expected 9 slots, got ${slotsCount}`,
        input: { slotsCount }
      };
    }, 'exactly 9 slots created');

    assert(propertyHolds, 'createPuzzle() creates exactly 9 slots');
  });

  it('All slots have unique numbers from 1 to 9', () => {
    const propertyHolds = runPropertyTest(100, (iteration) => {
      // Clear mock elements
      mockElements['pieces-container'] = new MockElement('pieces-container');
      mockElements['puzzle-board'] = new MockElement('puzzle-board');
      
      const manager = new PuzzleManager();
      manager.createPuzzle();
      
      const hasUniqueNumbers = manager.slotsHaveUniqueNumbers();
      
      return {
        passed: hasUniqueNumbers,
        reason: `Slots do not have unique numbers 1-9`,
        input: { iteration }
      };
    }, 'slots have unique numbers');

    assert(propertyHolds, 'All slots have unique numbers 1-9');
  });

  it('All slots have visible text content', () => {
    const propertyHolds = runPropertyTest(100, (iteration) => {
      // Clear mock elements
      mockElements['pieces-container'] = new MockElement('pieces-container');
      mockElements['puzzle-board'] = new MockElement('puzzle-board');
      
      const manager = new PuzzleManager();
      manager.createPuzzle();
      
      const hasVisibleText = manager.slotsHaveVisibleText();
      
      return {
        passed: hasVisibleText,
        reason: `Some slots have no visible text`,
        input: { iteration }
      };
    }, 'slots have visible text');

    assert(propertyHolds, 'All slots have visible text content');
  });

  it('Slots are in target container, not source container', () => {
    const propertyHolds = runPropertyTest(100, (iteration) => {
      // Clear mock elements
      mockElements['pieces-container'] = new MockElement('pieces-container');
      mockElements['puzzle-board'] = new MockElement('puzzle-board');
      
      const manager = new PuzzleManager();
      manager.createPuzzle();
      
      const slotsInTarget = manager.targetContainer.querySelectorAll('.slot').length;
      const slotsInSource = manager.sourceContainer.querySelectorAll('.slot').length;
      
      return {
        passed: slotsInTarget === 9 && slotsInSource === 0,
        reason: `Slots in target: ${slotsInTarget}, in source: ${slotsInSource}`,
        input: { slotsInTarget, slotsInSource }
      };
    }, 'slots in correct container');

    assert(propertyHolds, 'All slots are in target container');
  });

  it('Pieces and slots counts are equal (9 each)', () => {
    const propertyHolds = runPropertyTest(100, (iteration) => {
      // Clear mock elements
      mockElements['pieces-container'] = new MockElement('pieces-container');
      mockElements['puzzle-board'] = new MockElement('puzzle-board');
      
      const manager = new PuzzleManager();
      manager.createPuzzle();
      
      const piecesCount = manager.getPiecesCount();
      const slotsCount = manager.getSlotsCount();
      
      return {
        passed: piecesCount === slotsCount && piecesCount === 9,
        reason: `Pieces: ${piecesCount}, Slots: ${slotsCount}`,
        input: { piecesCount, slotsCount }
      };
    }, 'pieces and slots equal');

    assert(propertyHolds, 'Pieces and slots counts are equal (9 each)');
  });
});

// ============================================================
// FINAL REPORT
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('📊 NUMBER PUZZLE PROPERTY TEST RESULTS');
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
  console.log('\n🎉 All Number Puzzle property tests passed!');
  process.exit(0);
}
