#!/usr/bin/env node

/**
 * Integration Test: Navigation Consistency
 * 
 * Tests navigation elements across all games for consistency.
 * **Validates: Requirements 5.1, 5.2**
 */

const TestHarness = require('../utils/test-harness');
const { getGamePaths, readFileSafe, fileExists, getAllGameDirs } = require('../utils/file-helpers');
const { checkNavigationElements, HTML_PATTERNS } = require('../utils/html-patterns');
const config = require('../config');

const harness = new TestHarness('Navigation Consistency');

function run() {
  console.log('🚀 Starting Navigation Consistency Tests...');
  console.log('Testing navigation elements across all games');

  const gameDirs = getAllGameDirs();

  harness.log('Test 1: Game directories exist');
  harness.assert(gameDirs.length > 0, `Found ${gameDirs.length} game directories`);

  if (gameDirs.length === 0) {
    return harness.getSummary();
  }

  let gamesWithNavbar = 0;
  let gamesWithBackLink = 0;
  let gamesWithLogo = 0;
  const gamesWithIssues = [];

  for (const gameDir of gameDirs) {
    const paths = getGamePaths(gameDir);
    
    if (!fileExists(paths.html)) {
      gamesWithIssues.push({ game: gameDir, issue: 'HTML file not found' });
      continue;
    }

    const htmlContent = readFileSafe(paths.html);
    const navElements = checkNavigationElements(htmlContent);

    if (navElements.hasNavbar) gamesWithNavbar++;
    if (navElements.hasBackToHub) gamesWithBackLink++;
    if (navElements.hasLogo) gamesWithLogo++;

    if (!navElements.hasNavbar || !navElements.hasBackToHub) {
      gamesWithIssues.push({
        game: gameDir,
        issue: !navElements.hasNavbar ? 'Missing navbar' : 'Missing back link'
      });
    }
  }

  // Test 2: All games have navbar
  harness.log('Test 2: All games have navbar element');
  harness.assertEqual(
    gamesWithNavbar,
    gameDirs.length,
    `${gamesWithNavbar}/${gameDirs.length} games have navbar`
  );

  // Test 3: All games have back to hub link
  harness.log('Test 3: All games have "Voltar ao Hub" link');
  harness.assertEqual(
    gamesWithBackLink,
    gameDirs.length,
    `${gamesWithBackLink}/${gameDirs.length} games have back link`
  );

  // Test 4: All games have logo
  harness.log('Test 4: All games have BN GAMES logo');
  harness.assertEqual(
    gamesWithLogo,
    gameDirs.length,
    `${gamesWithLogo}/${gameDirs.length} games have logo`
  );

  // Test 5: Report games with issues
  if (gamesWithIssues.length > 0) {
    console.log('\n⚠️ Games with navigation issues:');
    gamesWithIssues.forEach(({ game, issue }) => {
      console.log(`   - ${game}: ${issue}`);
    });
  }

  harness.log('Test 5: No games have navigation issues');
  harness.assertEqual(
    gamesWithIssues.length,
    0,
    `${gamesWithIssues.length} games have navigation issues`
  );

  // Test 6: Navigation links point to correct URL
  harness.log('Test 6: Navigation links point to hub');
  let correctLinks = 0;
  
  for (const gameDir of gameDirs) {
    const paths = getGamePaths(gameDir);
    if (!fileExists(paths.html)) continue;
    
    const htmlContent = readFileSafe(paths.html);
    // Check for links to public/index.html or /public/ or similar
    const hasCorrectLink = /href=["'][^"']*(?:public\/index\.html|\/public\/|\.\.\/\.\.\/public)["']/i.test(htmlContent);
    if (hasCorrectLink) correctLinks++;
  }

  harness.assert(
    correctLinks >= gameDirs.length * 0.8, // At least 80% have correct links
    `${correctLinks}/${gameDirs.length} games have correct hub links`
  );

  // Print report
  harness.printReport({
    feature: 'Navigation Consistency',
    requirements: 'Requirements 5.1, 5.2'
  });

  return harness.getSummary();
}

// Run if called directly
if (require.main === module) {
  const result = run();
  process.exit(result.failed > 0 ? 1 : 0);
}

module.exports = run;
