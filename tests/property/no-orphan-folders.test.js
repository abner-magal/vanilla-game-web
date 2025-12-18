#!/usr/bin/env node

/**
 * Property Test: No Orphan Folders
 * 
 * **Feature: bn-games-bug-fixes, Property 7: No Orphan Folders**
 * **Validates: Requirements 7.1**
 * 
 * Property: For any folder in src/games/, there should be a corresponding entry in games.json.
 */

const TestHarness = require('../utils/test-harness');
const { getAllGameDirs, getGamesJson } = require('../utils/file-helpers');

const harness = new TestHarness('No Orphan Folders');

function run() {
  console.log('🚀 Starting No Orphan Folders Property Tests...');
  console.log('Property 7: For any folder in src/games/, there should be an entry in games.json');

  const gameDirs = getAllGameDirs();
  const games = getGamesJson();

  harness.log('Test 1: Game directories exist');
  harness.assert(gameDirs.length > 0, `Found ${gameDirs.length} game directories`);

  harness.log('Test 2: Games JSON exists');
  harness.assert(games && games.length > 0, `games.json contains ${games?.length || 0} entries`);

  if (gameDirs.length === 0 || !games) {
    return harness.getSummary();
  }

  // Get IDs from games.json
  const gameIds = new Set(games.map(g => g.id));

  // Test 3: All folders have corresponding entries
  harness.log('Test 3: *For any* folder, corresponding games.json entry SHALL exist');
  const orphanFolders = gameDirs.filter(dir => !gameIds.has(dir));
  
  harness.assertEqual(
    orphanFolders.length,
    0,
    `${gameDirs.length - orphanFolders.length}/${gameDirs.length} folders have entries`
  );

  // Test 4: All entries have corresponding folders
  harness.log('Test 4: *For any* games.json entry, corresponding folder SHALL exist');
  const gameDirSet = new Set(gameDirs);
  const orphanEntries = games.filter(g => !gameDirSet.has(g.id));
  
  harness.assertEqual(
    orphanEntries.length,
    0,
    `${games.length - orphanEntries.length}/${games.length} entries have folders`
  );

  // Test 5: Bidirectional consistency
  harness.log('Test 5: Folders and entries are bidirectionally consistent');
  harness.assert(
    orphanFolders.length === 0 && orphanEntries.length === 0,
    'No orphan folders or entries exist'
  );

  // Report orphans
  if (orphanFolders.length > 0) {
    console.log('\n⚠️ Orphan folders (no games.json entry):');
    orphanFolders.forEach(dir => {
      console.log(`   - src/games/${dir}/`);
    });
  }

  if (orphanEntries.length > 0) {
    console.log('\n⚠️ Orphan entries (no folder):');
    orphanEntries.forEach(g => {
      console.log(`   - ${g.id}: "${g.title}"`);
    });
  }

  // Test 6: Count matches
  harness.log('Test 6: Folder count matches entry count');
  harness.assertEqual(
    gameDirs.length,
    games.length,
    `Folders (${gameDirs.length}) match entries (${games.length})`
  );

  harness.printReport({
    feature: 'bn-games-bug-fixes, Property 7',
    requirements: 'Requirements 7.1'
  });

  return harness.getSummary();
}

if (require.main === module) {
  const result = run();
  process.exit(result.failed > 0 ? 1 : 0);
}

module.exports = run;
