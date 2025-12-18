#!/usr/bin/env node

/**
 * Property Test: Navbar Consistency
 * 
 * **Feature: bn-games-bug-fixes, Property 5: Navbar Consistency**
 * **Validates: Requirements 5.1, 5.2**
 * 
 * Property: For any game page, the navbar should contain consistent elements.
 */

const TestHarness = require('../utils/test-harness');
const { getGamePaths, readFileSafe, fileExists, getAllGameDirs } = require('../utils/file-helpers');
const { checkNavigationElements } = require('../utils/html-patterns');

const harness = new TestHarness('Navbar Consistency');

function run() {
  console.log('🚀 Starting Navbar Consistency Property Tests...');
  console.log('Property 5: For any game page, navbar should have consistent elements');

  const gameDirs = getAllGameDirs();

  harness.log('Test 1: Game directories found');
  harness.assert(gameDirs.length > 0, `Found ${gameDirs.length} game directories`);

  if (gameDirs.length === 0) {
    return harness.getSummary();
  }

  const navbarResults = [];

  for (const gameDir of gameDirs) {
    const paths = getGamePaths(gameDir);
    
    if (!fileExists(paths.html)) {
      navbarResults.push({ game: gameDir, hasNavbar: false, hasBackLink: false, hasLogo: false });
      continue;
    }

    const htmlContent = readFileSafe(paths.html);
    const navElements = checkNavigationElements(htmlContent);
    
    navbarResults.push({
      game: gameDir,
      hasNavbar: navElements.hasNavbar,
      hasBackLink: navElements.hasBackToHub,
      hasLogo: navElements.hasLogo
    });
  }

  // Test 2: All games have navbar
  harness.log('Test 2: *For any* game, navbar element SHALL exist');
  const gamesWithNavbar = navbarResults.filter(r => r.hasNavbar).length;
  harness.assertEqual(gamesWithNavbar, gameDirs.length, `All ${gameDirs.length} games have navbar`);

  // Test 3: All games have back link
  harness.log('Test 3: *For any* game, back to hub link SHALL exist');
  const gamesWithBackLink = navbarResults.filter(r => r.hasBackLink).length;
  harness.assertEqual(gamesWithBackLink, gameDirs.length, `All ${gameDirs.length} games have back link`);

  // Test 4: All games have logo
  harness.log('Test 4: *For any* game, BN GAMES logo SHALL exist');
  const gamesWithLogo = navbarResults.filter(r => r.hasLogo).length;
  harness.assertEqual(gamesWithLogo, gameDirs.length, `All ${gameDirs.length} games have logo`);

  // Test 5: Consistency check - all or none
  harness.log('Test 5: Navbar elements are consistent across all games');
  const allHaveNavbar = gamesWithNavbar === gameDirs.length;
  const allHaveBackLink = gamesWithBackLink === gameDirs.length;
  const allHaveLogo = gamesWithLogo === gameDirs.length;
  
  harness.assert(
    allHaveNavbar && allHaveBackLink && allHaveLogo,
    'All games have consistent navbar elements'
  );

  // Report games missing elements
  const gamesWithIssues = navbarResults.filter(
    r => !r.hasNavbar || !r.hasBackLink || !r.hasLogo
  );

  if (gamesWithIssues.length > 0) {
    console.log('\n⚠️ Games with missing navbar elements:');
    gamesWithIssues.forEach(r => {
      const missing = [];
      if (!r.hasNavbar) missing.push('navbar');
      if (!r.hasBackLink) missing.push('back link');
      if (!r.hasLogo) missing.push('logo');
      console.log(`   - ${r.game}: missing ${missing.join(', ')}`);
    });
  }

  harness.printReport({
    feature: 'bn-games-bug-fixes, Property 5',
    requirements: 'Requirements 5.1, 5.2'
  });

  return harness.getSummary();
}

if (require.main === module) {
  const result = run();
  process.exit(result.failed > 0 ? 1 : 0);
}

module.exports = run;
