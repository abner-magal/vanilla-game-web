#!/usr/bin/env node

/**
 * Property Tests for No Orphan Folders
 * Pure JavaScript - Zero Dependencies
 * 
 * **Feature: bug-fixes-memory-games, Property 4: No Orphan Folders**
 * **Validates: Requirements 3.4, 4.4**
 * 
 * Run with: node game-site/tests/no-orphan-folders.property.test.js
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
  const isEqual = JSON.stringify(actual) === JSON.stringify(expected);
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
// LOAD GAMES.JSON DATA AND FILESYSTEM INFO
// ============================================================

const GAME_SITE_ROOT = path.join(__dirname, '..');
const GAMES_JSON_PATH = path.join(GAME_SITE_ROOT, 'public', 'config', 'games.json');
const GAMES_DIR_PATH = path.join(GAME_SITE_ROOT, 'src', 'games');

let gamesData = [];
let gameFolders = [];

try {
  const jsonContent = fs.readFileSync(GAMES_JSON_PATH, 'utf8');
  gamesData = JSON.parse(jsonContent);
  console.log(`✅ Loaded ${gamesData.length} games from games.json`);
} catch (err) {
  console.error(`❌ Failed to load games.json: ${err.message}`);
  process.exit(1);
}

try {
  const entries = fs.readdirSync(GAMES_DIR_PATH, { withFileTypes: true });
  gameFolders = entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();
  console.log(`✅ Found ${gameFolders.length} folders in /src/games/: [${gameFolders.join(', ')}]`);
} catch (err) {
  console.error(`❌ Failed to read games directory: ${err.message}`);
  process.exit(1);
}

// ============================================================
// PROPERTY 4: No Orphan Folders
// **Feature: bug-fixes-memory-games, Property 4: No Orphan Folders**
// **Validates: Requirements 3.4, 4.4**
// ============================================================

describe('Property 4: No Orphan Folders', () => {
  
  property('*For any* folder in /src/games/, there should be a corresponding entry in games.json with a matching path', 100, (random) => {
    if (gameFolders.length === 0) return; // Skip if no folders
    
    // Select a random folder
    const folderName = random.sample(gameFolders);
    
    // Find corresponding game entry
    const correspondingGame = gamesData.find(game => game.id === folderName);
    
    assert(
      correspondingGame !== undefined,
      `Folder "${folderName}" has corresponding game entry in games.json`
    );
    
    if (correspondingGame) {
      // Verify the path matches expected format
      const expectedPath = `/src/games/${folderName}/index.html`;
      assertEqual(
        correspondingGame.path,
        expectedPath,
        `Game "${folderName}": path matches expected format`
      );
    }
  });

  property('*For any* game entry in games.json, there should be a corresponding folder in /src/games/', 100, (random) => {
    if (gamesData.length === 0) return; // Skip if no games
    
    // Select a random game
    const game = random.sample(gamesData);
    
    // Check if corresponding folder exists
    assert(
      gameFolders.includes(game.id),
      `Game "${game.id}" has corresponding folder in /src/games/`
    );
    
    // Verify the folder actually exists on filesystem
    const folderPath = path.join(GAMES_DIR_PATH, game.id);
    assert(
      fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory(),
      `Game "${game.id}": folder physically exists on filesystem`
    );
  });

  property('*For any* subset of folders, each should have a corresponding game entry', 100, (random) => {
    if (gameFolders.length === 0) return; // Skip if no folders
    
    // Generate random subset of folders
    const subsetSize = random.integer(1, gameFolders.length);
    const folderSubset = random.subset(gameFolders, subsetSize, subsetSize);
    
    // Check each folder in subset
    folderSubset.forEach(folderName => {
      const correspondingGame = gamesData.find(game => game.id === folderName);
      
      assert(
        correspondingGame !== undefined,
        `Folder "${folderName}" in subset has corresponding game entry`
      );
    });
  });

  property('*For any* subset of games, each should have a corresponding folder', 100, (random) => {
    if (gamesData.length === 0) return; // Skip if no games
    
    // Generate random subset of games
    const subsetSize = random.integer(1, gamesData.length);
    const gameSubset = random.subset(gamesData, subsetSize, subsetSize);
    
    // Check each game in subset
    gameSubset.forEach(game => {
      assert(
        gameFolders.includes(game.id),
        `Game "${game.id}" in subset has corresponding folder`
      );
    });
  });

  property('*For any* folder, the required files should exist (index.html, style.css, [GameName]Game.js)', 100, (random) => {
    if (gameFolders.length === 0) return; // Skip if no folders
    
    // Select a random folder
    const folderName = random.sample(gameFolders);
    const folderPath = path.join(GAMES_DIR_PATH, folderName);
    
    // Check index.html
    const indexPath = path.join(folderPath, 'index.html');
    assert(
      fs.existsSync(indexPath),
      `Folder "${folderName}": index.html exists`
    );
    
    // Check style.css
    const stylePath = path.join(folderPath, 'style.css');
    assert(
      fs.existsSync(stylePath),
      `Folder "${folderName}": style.css exists`
    );
    
    // Check [GameName]Game.js (convert kebab-case to PascalCase)
    const gameClassName = folderName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    const gameJsPath = path.join(folderPath, `${gameClassName}Game.js`);
    assert(
      fs.existsSync(gameJsPath),
      `Folder "${folderName}": ${gameClassName}Game.js exists`
    );
  });

  property('*For any* pair of (folder, game), if they have the same ID, their paths should be consistent', 100, (random) => {
    if (gamesData.length === 0 || gameFolders.length === 0) return;
    
    // Select a random game
    const game = random.sample(gamesData);
    
    // Check if there's a corresponding folder
    if (gameFolders.includes(game.id)) {
      const expectedPath = `/src/games/${game.id}/index.html`;
      
      assertEqual(
        game.path,
        expectedPath,
        `Game "${game.id}": path is consistent with folder structure`
      );
      
      // Verify the actual file exists at that path
      const actualFilePath = path.join(GAME_SITE_ROOT, game.path);
      assert(
        fs.existsSync(actualFilePath),
        `Game "${game.id}": file exists at specified path`
      );
    }
  });

  it('the complete set of folders should exactly match the complete set of game IDs', () => {
    const gameIds = gamesData.map(game => game.id).sort();
    const sortedFolders = [...gameFolders].sort();
    
    assertEqual(
      sortedFolders,
      gameIds,
      'Complete set of folders matches complete set of game IDs'
    );
  });

  it('there should be no orphan folders (folders without corresponding games.json entries)', () => {
    const gameIds = gamesData.map(game => game.id);
    const orphanFolders = gameFolders.filter(folder => !gameIds.includes(folder));
    
    assertEqual(
      orphanFolders,
      [],
      'No orphan folders exist'
    );
    
    if (orphanFolders.length > 0) {
      console.error(`  Orphan folders found: ${JSON.stringify(orphanFolders)}`);
    }
  });

  it('there should be no missing folders (games.json entries without corresponding folders)', () => {
    const gameIds = gamesData.map(game => game.id);
    const missingFolders = gameIds.filter(gameId => !gameFolders.includes(gameId));
    
    assertEqual(
      missingFolders,
      [],
      'No missing folders'
    );
    
    if (missingFolders.length > 0) {
      console.error(`  Missing folders for games: ${JSON.stringify(missingFolders)}`);
    }
  });
});

// ============================================================
// FINAL REPORT
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('📊 PROPERTY TEST RESULTS - No Orphan Folders');
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