#!/usr/bin/env node

/**
 * Property Tests for games.json Path Validation
 * Pure JavaScript - Zero Dependencies
 * 
 * **Feature: fix-test-bugs, Property 1: All game paths resolve to existing files**
 * **Feature: fix-test-bugs, Property 2: Path format consistency**
 * **Validates: Requirements 1.1, 1.3, 2.1, 2.3, 4.1**
 * 
 * Run with: node game-site/tests/games-json-paths.property.test.js
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
// PROPERTY 1: All game paths resolve to existing files
// **Feature: fix-test-bugs, Property 1: All game paths resolve to existing files**
// **Validates: Requirements 1.1, 1.3, 4.1**
// ============================================================

describe('Property 1: All game paths resolve to existing files', () => {
  
  it('*For any* game entry in games.json, the path field SHALL point to an existing index.html file', () => {
    gamesData.forEach(game => {
      // Convert path like "/src/games/snake/index.html" to absolute path
      const gamePath = path.join(GAME_SITE_ROOT, game.path);
      const exists = fs.existsSync(gamePath);
      
      assert(
        exists,
        `Game "${game.id}": path "${game.path}" exists`
      );
    });
  });

  it('*For any* game entry in games.json, the image field SHALL point to an existing image file', () => {
    gamesData.forEach(game => {
      // Convert path like "/public/assets/images/snake/snake.webp" to absolute path
      const imagePath = path.join(GAME_SITE_ROOT, game.image);
      const exists = fs.existsSync(imagePath);
      
      assert(
        exists,
        `Game "${game.id}": image "${game.image}" exists`
      );
    });
  });

  it('*For any* game entry, the game directory SHALL contain required files (index.html, style.css, [GameName]Game.js)', () => {
    gamesData.forEach(game => {
      const gameDir = path.join(GAME_SITE_ROOT, 'src', 'games', game.id);
      
      // Check index.html exists
      const indexPath = path.join(gameDir, 'index.html');
      assert(
        fs.existsSync(indexPath),
        `Game "${game.id}": index.html exists`
      );
      
      // Check style.css exists
      const stylePath = path.join(gameDir, 'style.css');
      assert(
        fs.existsSync(stylePath),
        `Game "${game.id}": style.css exists`
      );
      
      // Check [GameName]Game.js exists (convert kebab-case to PascalCase)
      const gameClassName = game.id
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      const gameJsPath = path.join(gameDir, `${gameClassName}Game.js`);
      assert(
        fs.existsSync(gameJsPath),
        `Game "${game.id}": ${gameClassName}Game.js exists`
      );
    });
  });

  it('no game entry SHALL reference a non-existent game directory', () => {
    gamesData.forEach(game => {
      const gameDir = path.join(GAME_SITE_ROOT, 'src', 'games', game.id);
      const exists = fs.existsSync(gameDir) && fs.statSync(gameDir).isDirectory();
      
      assert(
        exists,
        `Game "${game.id}": directory src/games/${game.id}/ exists`
      );
    });
  });
});

// ============================================================
// PROPERTY 2: Path format consistency
// **Feature: fix-test-bugs, Property 2: Path format consistency**
// **Validates: Requirements 2.1, 2.3**
// ============================================================

describe('Property 2: Path format consistency', () => {
  
  const GAME_PATH_PATTERN = /^\/src\/games\/[a-z0-9-]+\/index\.html$/;
  const IMAGE_PATH_PATTERN = /^\/public\/assets\/images\/[a-z0-9-]+\/[a-z0-9-]+\.webp$/;
  const GAME_ID_PATTERN = /^[a-z0-9-]+$/;

  it('*For any* game entry, the path field SHALL follow the pattern /src/games/[game-id]/index.html', () => {
    gamesData.forEach(game => {
      const matches = GAME_PATH_PATTERN.test(game.path);
      
      assert(
        matches,
        `Game "${game.id}": path "${game.path}" matches pattern /src/games/[game-id]/index.html`
      );
    });
  });

  it('*For any* game entry, the path field SHALL contain the game id', () => {
    gamesData.forEach(game => {
      const expectedPath = `/src/games/${game.id}/index.html`;
      
      assertEqual(
        game.path,
        expectedPath,
        `Game "${game.id}": path matches expected format`
      );
    });
  });

  it('*For any* game entry, the image field SHALL follow the pattern /public/assets/images/[game-id]/[name].webp', () => {
    gamesData.forEach(game => {
      const matches = IMAGE_PATH_PATTERN.test(game.image);
      
      assert(
        matches,
        `Game "${game.id}": image "${game.image}" matches pattern /public/assets/images/[game-id]/[name].webp`
      );
    });
  });

  it('*For any* game entry, the id field SHALL be kebab-case (lowercase with hyphens)', () => {
    gamesData.forEach(game => {
      const matches = GAME_ID_PATTERN.test(game.id);
      
      assert(
        matches,
        `Game "${game.id}": id is valid kebab-case`
      );
    });
  });

  it('*For any* game entry, all required fields SHALL be present', () => {
    const requiredFields = ['id', 'title', 'description', 'path', 'image', 'icon', 'category', 'rating', 'players', 'tags'];
    
    gamesData.forEach(game => {
      requiredFields.forEach(field => {
        assert(
          game.hasOwnProperty(field),
          `Game "${game.id}": has required field "${field}"`
        );
      });
    });
  });

  it('*For any* game entry, the id SHALL be unique', () => {
    const ids = gamesData.map(g => g.id);
    const uniqueIds = new Set(ids);
    
    assertEqual(
      uniqueIds.size,
      ids.length,
      `All ${ids.length} game IDs are unique`
    );
  });

  it('*For any* game entry, the title SHALL be unique', () => {
    const titles = gamesData.map(g => g.title);
    const uniqueTitles = new Set(titles);
    
    assertEqual(
      uniqueTitles.size,
      titles.length,
      `All ${titles.length} game titles are unique`
    );
  });
});

// ============================================================
// FINAL REPORT
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('📊 PROPERTY TEST RESULTS - games.json Path Validation');
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
