#!/usr/bin/env node

/**
 * Unit Tests for games.json Count and Uniqueness Validation
 * Pure JavaScript - Zero Dependencies
 * 
 * **Validates: Requirements 3.1, 3.3, 4.3**
 * 
 * Run with: node game-site/tests/games-count.test.js
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
// UNIT TESTS: Games Count and Uniqueness
// **Validates: Requirements 3.1, 3.3, 4.3**
// ============================================================

describe('Games Count Validation', () => {
  
  it('games.json SHALL contain exactly 10 game entries', () => {
    const EXPECTED_COUNT = 10;
    
    assertEqual(
      gamesData.length,
      EXPECTED_COUNT,
      `games.json contains exactly ${EXPECTED_COUNT} games`
    );
  });

  it('games.json SHALL not be empty', () => {
    assert(
      gamesData.length > 0,
      'games.json is not empty'
    );
  });

  it('games.json SHALL be a valid array', () => {
    assert(
      Array.isArray(gamesData),
      'games.json contains a valid array'
    );
  });
});

describe('Game ID Uniqueness Validation', () => {
  
  it('all game IDs SHALL be unique', () => {
    const ids = gamesData.map(game => game.id);
    const uniqueIds = new Set(ids);
    
    assertEqual(
      uniqueIds.size,
      ids.length,
      `All ${ids.length} game IDs are unique`
    );
    
    // Additional check: report any duplicates found
    if (uniqueIds.size !== ids.length) {
      const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
      console.error(`  Duplicate IDs found: ${JSON.stringify([...new Set(duplicates)])}`);
    }
  });

  it('all game IDs SHALL be non-empty strings', () => {
    gamesData.forEach((game, index) => {
      assert(
        typeof game.id === 'string' && game.id.length > 0,
        `Game at index ${index}: ID is a non-empty string`
      );
    });
  });

  it('all game IDs SHALL follow kebab-case format', () => {
    const KEBAB_CASE_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    
    gamesData.forEach(game => {
      assert(
        KEBAB_CASE_PATTERN.test(game.id),
        `Game "${game.id}": ID follows kebab-case format`
      );
    });
  });
});

describe('Game Title Uniqueness Validation', () => {
  
  it('all game titles SHALL be unique', () => {
    const titles = gamesData.map(game => game.title);
    const uniqueTitles = new Set(titles);
    
    assertEqual(
      uniqueTitles.size,
      titles.length,
      `All ${titles.length} game titles are unique`
    );
    
    // Additional check: report any duplicates found
    if (uniqueTitles.size !== titles.length) {
      const duplicates = titles.filter((title, index) => titles.indexOf(title) !== index);
      console.error(`  Duplicate titles found: ${JSON.stringify([...new Set(duplicates)])}`);
    }
  });

  it('all game titles SHALL be non-empty strings', () => {
    gamesData.forEach((game, index) => {
      assert(
        typeof game.title === 'string' && game.title.length > 0,
        `Game at index ${index}: title is a non-empty string`
      );
    });
  });
});

describe('Game Path Uniqueness Validation', () => {
  
  it('all game paths SHALL be unique', () => {
    const paths = gamesData.map(game => game.path);
    const uniquePaths = new Set(paths);
    
    assertEqual(
      uniquePaths.size,
      paths.length,
      `All ${paths.length} game paths are unique`
    );
    
    // Additional check: report any duplicates found
    if (uniquePaths.size !== paths.length) {
      const duplicates = paths.filter((path, index) => paths.indexOf(path) !== index);
      console.error(`  Duplicate paths found: ${JSON.stringify([...new Set(duplicates)])}`);
    }
  });

  it('all game paths SHALL be non-empty strings', () => {
    gamesData.forEach((game, index) => {
      assert(
        typeof game.path === 'string' && game.path.length > 0,
        `Game at index ${index}: path is a non-empty string`
      );
    });
  });
});

// ============================================================
// FINAL REPORT
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('📊 UNIT TEST RESULTS - Games Count and Uniqueness');
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
  console.log('\n🎉 All unit tests passed!');
  process.exit(0);
}