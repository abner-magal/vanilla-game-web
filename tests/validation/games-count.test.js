#!/usr/bin/env node

/**
 * Validation Test: Games Count
 * 
 * Validates that the expected number of games exist.
 * **Validates: Requirements 7.1**
 */

const TestHarness = require('../utils/test-harness');
const { getGamesJson, getAllGameDirs } = require('../utils/file-helpers');
const config = require('../config');

const harness = new TestHarness('Games Count Validation');

function run() {
  console.log('🚀 Starting Games Count Validation Tests...');

  const games = getGamesJson();
  const gameDirs = getAllGameDirs();
  const expectedGames = config.GAMES;

  // Test 1: Games JSON has expected count
  harness.log('Test 1: games.json has expected number of entries');
  harness.assertEqual(
    games?.length || 0,
    expectedGames.length,
    `games.json has ${expectedGames.length} entries`
  );

  // Test 2: Game directories match expected count
  harness.log('Test 2: Game directories match expected count');
  harness.assertEqual(
    gameDirs.length,
    expectedGames.length,
    `Found ${expectedGames.length} game directories`
  );

  // Test 3: All expected games exist in JSON
  harness.log('Test 3: All expected games exist in games.json');
  const gameIds = new Set(games?.map(g => g.id) || []);
  const missingFromJson = expectedGames.filter(id => !gameIds.has(id));
  
  harness.assertEqual(
    missingFromJson.length,
    0,
    `All ${expectedGames.length} expected games in games.json`
  );

  if (missingFromJson.length > 0) {
    console.log('   Missing from games.json:', missingFromJson.join(', '));
  }

  // Test 4: All expected games have directories
  harness.log('Test 4: All expected games have directories');
  const dirSet = new Set(gameDirs);
  const missingDirs = expectedGames.filter(id => !dirSet.has(id));
  
  harness.assertEqual(
    missingDirs.length,
    0,
    `All ${expectedGames.length} expected games have directories`
  );

  if (missingDirs.length > 0) {
    console.log('   Missing directories:', missingDirs.join(', '));
  }

  // Test 5: No extra games in JSON
  harness.log('Test 5: No unexpected games in games.json');
  const expectedSet = new Set(expectedGames);
  const extraInJson = (games || []).filter(g => !expectedSet.has(g.id));
  
  harness.assertEqual(
    extraInJson.length,
    0,
    'No unexpected games in games.json'
  );

  if (extraInJson.length > 0) {
    console.log('   Extra games:', extraInJson.map(g => g.id).join(', '));
  }

  // Test 6: No extra directories
  harness.log('Test 6: No unexpected game directories');
  const extraDirs = gameDirs.filter(dir => !expectedSet.has(dir));
  
  harness.assertEqual(
    extraDirs.length,
    0,
    'No unexpected game directories'
  );

  if (extraDirs.length > 0) {
    console.log('   Extra directories:', extraDirs.join(', '));
  }

  harness.printReport({
    feature: 'Games Count Validation',
    requirements: 'Requirements 7.1'
  });

  return harness.getSummary();
}

if (require.main === module) {
  const result = run();
  process.exit(result.failed > 0 ? 1 : 0);
}

module.exports = run;
