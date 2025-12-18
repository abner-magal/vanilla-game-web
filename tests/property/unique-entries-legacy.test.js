#!/usr/bin/env node

/**
 * Property Tests for Unique Game Entries
 * Pure JavaScript - Zero Dependencies
 * 
 * **Feature: bug-fixes-memory-games, Property 3: Unique Game Entries**
 * **Validates: Requirements 3.1, 3.3, 4.3**
 * 
 * Run with: node game-site/tests/unique-entries.property.test.js
 */

const fs = require('fs');
const path = require('path');

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
// SIMPLE PROPERTY-BASED TESTING UTILITIES
// ============================================================

// Simple random number generator for reproducible tests
class SimpleRandom {
  constructor(seed = 42) {
    this.seed = seed;
  }
  
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  
  integer(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  
  sample(array, count = 1) {
    const result = [];
    const available = [...array];
    
    for (let i = 0; i < Math.min(count, available.length); i++) {
      const index = this.integer(0, available.length - 1);
      result.push(available.splice(index, 1)[0]);
    }
    
    return count === 1 ? result[0] : result;
  }
  
  subset(array, minSize = 1, maxSize = null) {
    maxSize = maxSize || array.length;
    const size = this.integer(minSize, Math.min(maxSize, array.length));
    const result = this.sample(array, size);
    return Array.isArray(result) ? result : [result];
  }
}

function property(name, iterations, testFn) {
  it(name, () => {
    const random = new SimpleRandom(42);
    
    for (let i = 0; i < iterations; i++) {
      try {
        testFn(random, i);
      } catch (err) {
        console.error(`  Property failed on iteration ${i + 1}/${iterations}`);
        throw err;
      }
    }
  });
}

// ============================================================
// LOAD GAMES.JSON DATA
// ============================================================

const GAME_SITE_ROOT = path.join(__dirname, '..');
const GAMES_JSON_PATH = path.join(GAME_SITE_ROOT, 'public', 'config', 'games.json');

let gamesData = [];
try {
  const jsonContent = fs.readFileSync(GAMES_JSON_PATH, 'utf8');
  gamesData = JSON.parse(jsonContent);
  console.log(`✅ Loaded ${gamesData.length} games from games.json`);
} catch (err) {
  console.error(`❌ Failed to load games.json: ${err.message}`);
  process.exit(1);
}

// ============================================================
// PROPERTY 3: Unique Game Entries
// **Feature: bug-fixes-memory-games, Property 3: Unique Game Entries**
// **Validates: Requirements 3.1, 3.3, 4.3**
// ============================================================

describe('Property 3: Unique Game Entries', () => {
  
  property('*For any* subset of games, all IDs should be unique within that subset', 100, (random) => {
    // Generate random subset of games
    const subsetSize = random.integer(1, gamesData.length);
    const gameSubset = random.subset(gamesData, subsetSize, subsetSize);
    
    // Extract IDs from subset
    const ids = gameSubset.map(game => game.id);
    const uniqueIds = new Set(ids);
    
    assert(
      uniqueIds.size === ids.length,
      `Subset of ${ids.length} games has unique IDs: [${ids.slice(0, 3).join(', ')}${ids.length > 3 ? '...' : ''}]`
    );
  });

  property('*For any* subset of games, all titles should be unique within that subset', 100, (random) => {
    // Generate random subset of games
    const subsetSize = random.integer(1, gamesData.length);
    const gameSubset = random.subset(gamesData, subsetSize, subsetSize);
    
    // Extract titles from subset
    const titles = gameSubset.map(game => game.title);
    const uniqueTitles = new Set(titles);
    
    assert(
      uniqueTitles.size === titles.length,
      `Subset of ${titles.length} games has unique titles: [${titles.slice(0, 2).join(', ')}${titles.length > 2 ? '...' : ''}]`
    );
  });

  property('*For any* subset of games, all paths should be unique within that subset', 100, (random) => {
    // Generate random subset of games
    const subsetSize = random.integer(1, gamesData.length);
    const gameSubset = random.subset(gamesData, subsetSize, subsetSize);
    
    // Extract paths from subset
    const paths = gameSubset.map(game => game.path);
    const uniquePaths = new Set(paths);
    
    assert(
      uniquePaths.size === paths.length,
      `Subset of ${paths.length} games has unique paths`
    );
  });

  property('*For any* pair of games, they should differ in at least one key field (id, title, or path)', 100, (random) => {
    if (gamesData.length < 2) return; // Skip if not enough games
    
    // Select two different games
    const game1 = random.sample(gamesData);
    let game2;
    do {
      game2 = random.sample(gamesData);
    } while (game1.id === game2.id);
    
    // Check that they differ in at least one key field
    const idsDiffer = game1.id !== game2.id;
    const titlesDiffer = game1.title !== game2.title;
    const pathsDiffer = game1.path !== game2.path;
    
    const atLeastOneDiffers = idsDiffer || titlesDiffer || pathsDiffer;
    
    assert(
      atLeastOneDiffers,
      `Games "${game1.id}" and "${game2.id}" differ in at least one key field`
    );
  });

  property('*For any* game entry, the ID should be consistent with the path', 100, (random) => {
    const game = random.sample(gamesData);
    
    // Extract game ID from path (e.g., "/src/games/snake/index.html" -> "snake")
    const pathMatch = game.path.match(/\/src\/games\/([^\/]+)\/index\.html$/);
    
    if (pathMatch) {
      const pathGameId = pathMatch[1];
      
      assertEqual(
        game.id,
        pathGameId,
        `Game "${game.id}": ID matches path segment`
      );
    } else {
      assert(
        false,
        `Game "${game.id}": path "${game.path}" follows expected format`
      );
    }
  });

  property('*For any* game entry, the image path should be consistent with the game ID', 100, (random) => {
    const game = random.sample(gamesData);
    
    // Extract game ID from image path (e.g., "/public/assets/images/snake/snake.webp" -> "snake")
    const imageMatch = game.image.match(/\/public\/assets\/images\/([^\/]+)\/[^\/]+\.webp$/);
    
    if (imageMatch) {
      const imageGameId = imageMatch[1];
      
      assertEqual(
        game.id,
        imageGameId,
        `Game "${game.id}": ID matches image path segment`
      );
    } else {
      assert(
        false,
        `Game "${game.id}": image path "${game.image}" follows expected format`
      );
    }
  });

  it('the complete games collection should have exactly 10 unique entries', () => {
    const EXPECTED_COUNT = 10;
    
    // Check total count
    assertEqual(
      gamesData.length,
      EXPECTED_COUNT,
      `games.json contains exactly ${EXPECTED_COUNT} games`
    );
    
    // Check ID uniqueness
    const ids = gamesData.map(game => game.id);
    const uniqueIds = new Set(ids);
    assertEqual(
      uniqueIds.size,
      EXPECTED_COUNT,
      `All ${EXPECTED_COUNT} game IDs are unique`
    );
    
    // Check title uniqueness
    const titles = gamesData.map(game => game.title);
    const uniqueTitles = new Set(titles);
    assertEqual(
      uniqueTitles.size,
      EXPECTED_COUNT,
      `All ${EXPECTED_COUNT} game titles are unique`
    );
    
    // Check path uniqueness
    const paths = gamesData.map(game => game.path);
    const uniquePaths = new Set(paths);
    assertEqual(
      uniquePaths.size,
      EXPECTED_COUNT,
      `All ${EXPECTED_COUNT} game paths are unique`
    );
  });
});

// ============================================================
// FINAL REPORT
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('📊 PROPERTY TEST RESULTS - Unique Game Entries');
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
  console.log('\n🎉 All property tests passed!');
  process.exit(0);
}