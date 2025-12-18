#!/usr/bin/env node

/**
 * Property Test: Unique Game Entries
 * 
 * **Feature: bn-games-bug-fixes, Property 8: Unique Game Names**
 * **Validates: Requirements 7.1**
 * 
 * Property: For any list of games displayed in the hub, all titles and IDs must be unique.
 */

const TestHarness = require('../utils/test-harness');
const { getGamesJson } = require('../utils/file-helpers');

const harness = new TestHarness('Unique Game Entries');

function run() {
  console.log('🚀 Starting Unique Game Entries Property Tests...');
  console.log('Property 8: For any list of games, all titles and IDs must be unique');

  const games = getGamesJson();

  // Test 1: Games data exists
  harness.log('Test 1: Games data exists');
  harness.assert(games && games.length > 0, 'games.json contains game entries');

  if (!games || games.length === 0) {
    console.error('❌ No games data found. Exiting.');
    return harness.getSummary();
  }

  // Test 2: All game titles are unique
  harness.log('Test 2: All game titles are unique');
  const titles = games.map(g => g.title);
  const uniqueTitles = new Set(titles);
  harness.assertEqual(
    uniqueTitles.size,
    titles.length,
    `All ${titles.length} game titles are unique`
  );

  // Test 3: All game IDs are unique
  harness.log('Test 3: All game IDs are unique');
  const ids = games.map(g => g.id);
  const uniqueIds = new Set(ids);
  harness.assertEqual(
    uniqueIds.size,
    ids.length,
    `All ${ids.length} game IDs are unique`
  );

  // Test 4: No case-insensitive title duplicates
  harness.log('Test 4: No case-insensitive title duplicates exist');
  const normalizedTitles = games.map(g => g.title.toLowerCase());
  const uniqueNormalized = new Set(normalizedTitles);
  harness.assertEqual(
    uniqueNormalized.size,
    normalizedTitles.length,
    'No case-insensitive title duplicates'
  );

  // Test 5: Random subset property test
  harness.log('Test 5: For any subset of games, titles remain unique');
  const numTests = 10;
  let allSubsetsUnique = true;

  for (let i = 0; i < numTests; i++) {
    const subsetSize = Math.floor(Math.random() * games.length) + 1;
    const shuffled = [...games].sort(() => Math.random() - 0.5);
    const subset = shuffled.slice(0, subsetSize);
    
    const subsetTitles = subset.map(g => g.title);
    const uniqueSubsetTitles = new Set(subsetTitles);
    
    if (uniqueSubsetTitles.size !== subsetTitles.length) {
      allSubsetsUnique = false;
      break;
    }
  }

  harness.assert(allSubsetsUnique, `All ${numTests} random subsets have unique titles`);

  // Test 6: Duplicate detection works
  harness.log('Test 6: Adding a game with existing title would violate uniqueness');
  const existingTitle = games[0].title;
  const testGames = [...games, { id: 'test-duplicate', title: existingTitle }];
  const testTitles = testGames.map(g => g.title);
  const uniqueTestTitles = new Set(testTitles);
  harness.assert(
    uniqueTestTitles.size < testTitles.length,
    'Duplicate title correctly detected when added'
  );

  // Test 7: Game titles are non-empty strings
  harness.log('Test 7: Game titles are non-empty strings');
  const allTitlesValid = games.every(
    game => typeof game.title === 'string' && game.title.trim().length > 0
  );
  harness.assert(allTitlesValid, 'All games have valid non-empty titles');

  // Test 8: Game IDs are non-empty strings
  harness.log('Test 8: Game IDs are non-empty strings');
  const allIdsValid = games.every(
    game => typeof game.id === 'string' && game.id.trim().length > 0
  );
  harness.assert(allIdsValid, 'All games have valid non-empty IDs');

  // Print report
  harness.printReport({
    feature: 'bn-games-bug-fixes, Property 8',
    requirements: 'Requirements 7.1'
  });

  return harness.getSummary();
}

// Run if called directly
if (require.main === module) {
  const result = run();
  process.exit(result.failed > 0 ? 1 : 0);
}

module.exports = run;
