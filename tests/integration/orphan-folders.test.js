#!/usr/bin/env node

/**
 * Unit Tests for Orphan Folders Validation
 * Pure JavaScript - Zero Dependencies
 * 
 * **Validates: Requirements 3.4, 4.4**
 * 
 * Run with: node game-site/tests/orphan-folders.test.js
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
// UNIT TESTS: Orphan Folders Validation
// **Validates: Requirements 3.4, 4.4**
// ============================================================

describe('Orphan Folders Validation', () => {
  
  it('all folders in /src/games/ SHALL have corresponding entries in games.json', () => {
    const gameIds = gamesData.map(game => game.id).sort();
    
    gameFolders.forEach(folderName => {
      assert(
        gameIds.includes(folderName),
        `Folder "${folderName}" has corresponding entry in games.json`
      );
    });
  });

  it('all games in games.json SHALL have corresponding folders in /src/games/', () => {
    const gameIds = gamesData.map(game => game.id);
    
    gameIds.forEach(gameId => {
      assert(
        gameFolders.includes(gameId),
        `Game "${gameId}" has corresponding folder in /src/games/`
      );
    });
  });

  it('the set of folder names SHALL exactly match the set of game IDs', () => {
    const gameIds = gamesData.map(game => game.id).sort();
    const sortedFolders = [...gameFolders].sort();
    
    assertEqual(
      sortedFolders,
      gameIds,
      'Folder names exactly match game IDs'
    );
  });

  it('there SHALL be no orphan folders (folders without games.json entries)', () => {
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

  it('there SHALL be no missing folders (games.json entries without folders)', () => {
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

  it('each game folder SHALL contain required files (index.html, style.css, [GameName]Game.js)', () => {
    gamesData.forEach(game => {
      const gameDir = path.join(GAMES_DIR_PATH, game.id);
      
      // Check if folder exists
      assert(
        fs.existsSync(gameDir) && fs.statSync(gameDir).isDirectory(),
        `Game "${game.id}": folder exists`
      );
      
      if (fs.existsSync(gameDir)) {
        // Check index.html
        const indexPath = path.join(gameDir, 'index.html');
        assert(
          fs.existsSync(indexPath),
          `Game "${game.id}": index.html exists`
        );
        
        // Check style.css
        const stylePath = path.join(gameDir, 'style.css');
        assert(
          fs.existsSync(stylePath),
          `Game "${game.id}": style.css exists`
        );
        
        // Check [GameName]Game.js (convert kebab-case to PascalCase)
        const gameClassName = game.id
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join('');
        const gameJsPath = path.join(gameDir, `${gameClassName}Game.js`);
        assert(
          fs.existsSync(gameJsPath),
          `Game "${game.id}": ${gameClassName}Game.js exists`
        );
      }
    });
  });

  it('no game folder SHALL contain unexpected files or directories', () => {
    const EXPECTED_FILES = ['index.html', 'style.css'];
    const ALLOWED_EXTENSIONS = ['.js', '.html', '.css', '.md', '.json'];
    
    gamesData.forEach(game => {
      const gameDir = path.join(GAMES_DIR_PATH, game.id);
      
      if (fs.existsSync(gameDir)) {
        const entries = fs.readdirSync(gameDir, { withFileTypes: true });
        
        entries.forEach(entry => {
          if (entry.isDirectory()) {
            // No subdirectories expected in game folders
            assert(
              false,
              `Game "${game.id}": unexpected subdirectory "${entry.name}"`
            );
          } else {
            // Check file extensions
            const ext = path.extname(entry.name);
            const isExpectedFile = EXPECTED_FILES.includes(entry.name);
            const hasAllowedExtension = ALLOWED_EXTENSIONS.includes(ext);
            const isGameJsFile = entry.name.endsWith('Game.js');
            
            assert(
              isExpectedFile || hasAllowedExtension || isGameJsFile,
              `Game "${game.id}": file "${entry.name}" has allowed extension or is expected file`
            );
          }
        });
      }
    });
  });
});

describe('Folder Structure Consistency', () => {
  
  it('games.json count SHALL match folder count', () => {
    assertEqual(
      gamesData.length,
      gameFolders.length,
      `games.json count (${gamesData.length}) matches folder count (${gameFolders.length})`
    );
  });

  it('all folder names SHALL follow kebab-case convention', () => {
    const KEBAB_CASE_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    
    gameFolders.forEach(folderName => {
      assert(
        KEBAB_CASE_PATTERN.test(folderName),
        `Folder "${folderName}" follows kebab-case convention`
      );
    });
  });

  it('folder names SHALL be consistent with game paths in games.json', () => {
    gamesData.forEach(game => {
      const expectedPath = `/src/games/${game.id}/index.html`;
      
      assertEqual(
        game.path,
        expectedPath,
        `Game "${game.id}": path is consistent with folder structure`
      );
    });
  });
});

// ============================================================
// FINAL REPORT
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('📊 UNIT TEST RESULTS - Orphan Folders Validation');
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