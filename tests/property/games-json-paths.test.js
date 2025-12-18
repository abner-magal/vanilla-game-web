#!/usr/bin/env node

/**
 * Property Test: Games JSON Paths
 * 
 * **Feature: bn-games-bug-fixes, Property 6: Valid Game Paths**
 * **Validates: Requirements 6.1**
 * 
 * Property: For any game in games.json, the path should point to an existing file.
 */

const TestHarness = require('../utils/test-harness');
const { getGamesJson, getGameSiteRoot, fileExists } = require('../utils/file-helpers');
const path = require('path');

const harness = new TestHarness('Games JSON Paths');

function run() {
  console.log('🚀 Starting Games JSON Paths Property Tests...');
  console.log('Property 6: For any game in games.json, path should point to existing file');

  const games = getGamesJson();
  const root = getGameSiteRoot();

  harness.log('Test 1: Games data exists');
  harness.assert(games && games.length > 0, `games.json contains ${games?.length || 0} entries`);

  if (!games || games.length === 0) {
    return harness.getSummary();
  }

  // Test 2: All paths are valid strings
  harness.log('Test 2: *For any* game, path SHALL be a valid string');
  const allPathsValid = games.every(
    game => typeof game.path === 'string' && game.path.trim().length > 0
  );
  harness.assert(allPathsValid, 'All games have valid path strings');

  // Test 3: All paths point to existing files
  harness.log('Test 3: *For any* game, path SHALL point to existing file');
  const pathResults = [];

  for (const game of games) {
    // Normalize path - remove leading slash and adjust for file system
    let gamePath = game.path;
    if (gamePath.startsWith('/')) {
      gamePath = gamePath.substring(1);
    }
    
    const fullPath = path.join(root, gamePath);
    const exists = fileExists(fullPath);
    
    pathResults.push({
      id: game.id,
      title: game.title,
      path: game.path,
      fullPath,
      exists
    });
  }

  const existingPaths = pathResults.filter(r => r.exists).length;
  harness.assertEqual(
    existingPaths,
    games.length,
    `${existingPaths}/${games.length} game paths point to existing files`
  );

  // Test 4: All paths follow consistent format
  harness.log('Test 4: *For any* game, path SHALL follow consistent format');
  const pathPattern = /^\/src\/games\/[\w-]+\/index\.html$/;
  const consistentPaths = games.filter(g => pathPattern.test(g.path)).length;
  harness.assertEqual(
    consistentPaths,
    games.length,
    `${consistentPaths}/${games.length} paths follow /src/games/[name]/index.html format`
  );

  // Test 5: Path game name matches ID
  harness.log('Test 5: *For any* game, path game name SHALL match ID');
  let matchingIds = 0;
  
  for (const game of games) {
    const pathMatch = game.path.match(/\/src\/games\/([\w-]+)\//);
    if (pathMatch && pathMatch[1] === game.id) {
      matchingIds++;
    }
  }
  
  harness.assertEqual(
    matchingIds,
    games.length,
    `${matchingIds}/${games.length} path game names match IDs`
  );

  // Report missing files
  const missingFiles = pathResults.filter(r => !r.exists);
  if (missingFiles.length > 0) {
    console.log('\n⚠️ Games with missing files:');
    missingFiles.forEach(r => {
      console.log(`   - ${r.id}: ${r.path}`);
      console.log(`     Expected at: ${r.fullPath}`);
    });
  }

  // Report inconsistent paths
  const inconsistentPaths = games.filter(g => !pathPattern.test(g.path));
  if (inconsistentPaths.length > 0) {
    console.log('\n⚠️ Games with inconsistent path format:');
    inconsistentPaths.forEach(g => {
      console.log(`   - ${g.id}: ${g.path}`);
    });
  }

  harness.printReport({
    feature: 'bn-games-bug-fixes, Property 6',
    requirements: 'Requirements 6.1'
  });

  return harness.getSummary();
}

if (require.main === module) {
  const result = run();
  process.exit(result.failed > 0 ? 1 : 0);
}

module.exports = run;
