/**
 * Title Visibility Test
 * 
 * Tests that game titles are properly visible and not truncated on mobile devices.
 * Validates that mobile-fixes.css has proper responsive typography rules.
 * 
 * Validates Requirements: 5.1
 */

const fs = require('fs');
const path = require('path');

class TitleVisibilityTest {
  constructor() {
    this.testResults = [];
    this.mobileFixes = path.join(__dirname, '../styles/components/mobile-fixes.css');
    this.gamesDir = path.join(__dirname, '../src/games');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} ${message}`);
  }

  addResult(testName, passed, message) {
    this.testResults.push({ testName, passed, message });
    this.log(`${testName}: ${message}`, passed ? 'success' : 'error');
  }

  /**
   * Property 6: Title Text Visibility
   * Tests that titles have responsive typography rules to prevent truncation
   */
  testTitleVisibility() {
    this.log('\n📋 Property 6: Title Text Visibility');

    try {
      // Test 1: Mobile fixes CSS exists
      if (!fs.existsSync(this.mobileFixes)) {
        this.addResult(
          'Mobile fixes CSS exists',
          false,
          'mobile-fixes.css file not found'
        );
        return;
      }

      const cssContent = fs.readFileSync(this.mobileFixes, 'utf8');

      // Test 2: Has responsive typography section
      const hasResponsiveTypography = cssContent.includes('Tipografia Responsiva') &&
                                      cssContent.includes('Prevenção de Truncamento');
      this.addResult(
        'Responsive typography section',
        hasResponsiveTypography,
        hasResponsiveTypography ? 'Responsive typography section found in mobile-fixes.css' : 'Responsive typography section missing'
      );

      // Test 3: Has clamp() function for titles
      const hasClampFunction = cssContent.includes('clamp(') &&
                               cssContent.includes('font-size: clamp(');
      this.addResult(
        'Clamp function for responsive sizing',
        hasClampFunction,
        hasClampFunction ? 'Clamp function found for responsive font sizing' : 'Clamp function missing for titles'
      );

      // Test 4: Has title selectors (h1, .game-title, .overlay-content h1)
      const hasTitleSelectors = cssContent.includes('h1,') &&
                                cssContent.includes('.game-title') &&
                                cssContent.includes('.overlay-content h1');
      this.addResult(
        'Title selectors present',
        hasTitleSelectors,
        hasTitleSelectors ? 'Title selectors (h1, .game-title, .overlay-content h1) found' : 'Title selectors missing'
      );

      // Test 5: Has word-break and hyphens rules
      const hasWordBreaking = cssContent.includes('word-break: break-word') &&
                              cssContent.includes('hyphens: auto');
      this.addResult(
        'Word breaking rules',
        hasWordBreaking,
        hasWordBreaking ? 'Word breaking and hyphenation rules found' : 'Word breaking rules missing'
      );

      // Test 6: Has mobile media query (@media (max-width: 400px))
      const hasMobileMediaQuery = cssContent.includes('@media (max-width: 400px)');
      this.addResult(
        'Mobile media query',
        hasMobileMediaQuery,
        hasMobileMediaQuery ? 'Mobile media query (400px) found' : 'Mobile media query missing'
      );

      // Test 7: Check Space Invaders specifically
      const spaceInvadersPath = path.join(this.gamesDir, 'space-invaders/index.html');
      if (fs.existsSync(spaceInvadersPath)) {
        const spaceInvadersHTML = fs.readFileSync(spaceInvadersPath, 'utf8');
        
        const hasSpaceInvadersTitle = spaceInvadersHTML.includes('SPACE INVADERS');
        const importsMobileFixes = spaceInvadersHTML.includes('mobile-fixes.css');
        
        this.addResult(
          'Space Invaders title present',
          hasSpaceInvadersTitle,
          hasSpaceInvadersTitle ? 'Space Invaders title found in overlay' : 'Space Invaders title missing'
        );
        
        this.addResult(
          'Space Invaders imports mobile fixes',
          importsMobileFixes,
          importsMobileFixes ? 'Space Invaders imports mobile-fixes.css' : 'Space Invaders missing mobile-fixes.css import'
        );
      }

      // Test 8: Check other games with long titles
      const gamesWithLongTitles = ['memory-match', 'space-invaders', 'whack-a-mole'];
      let gamesWithMobileFixes = 0;
      
      for (const game of gamesWithLongTitles) {
        const gamePath = path.join(this.gamesDir, game, 'index.html');
        if (fs.existsSync(gamePath)) {
          const gameHTML = fs.readFileSync(gamePath, 'utf8');
          if (gameHTML.includes('mobile-fixes.css')) {
            gamesWithMobileFixes++;
          }
        }
      }
      
      const allGamesHaveMobileFixes = gamesWithMobileFixes === gamesWithLongTitles.length;
      this.addResult(
        'Games with long titles import mobile fixes',
        allGamesHaveMobileFixes,
        allGamesHaveMobileFixes ? 
          `All ${gamesWithLongTitles.length} games with long titles import mobile-fixes.css` : 
          `Only ${gamesWithMobileFixes}/${gamesWithLongTitles.length} games import mobile-fixes.css`
      );

      // Test 9: Has line-height rules for better readability
      const hasLineHeight = cssContent.includes('line-height:');
      this.addResult(
        'Line height rules',
        hasLineHeight,
        hasLineHeight ? 'Line height rules found for better readability' : 'Line height rules missing'
      );

    } catch (error) {
      this.addResult(
        'Title visibility test',
        false,
        `Error testing title visibility: ${error.message}`
      );
    }
  }

  /**
   * Run all title visibility tests
   */
  runTests() {
    this.log('🧪 Running Title Visibility Tests...\n');
    
    this.testTitleVisibility();
    
    return this.getResults();
  }

  /**
   * Get test results summary
   */
  getResults() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(result => result.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

    this.log('\n==================================================');
    this.log('📊 Title Visibility Test Summary:');
    this.log(`   Total: ${totalTests}`);
    this.log(`   ✅ Passed: ${passedTests}`);
    this.log(`   ❌ Failed: ${failedTests}`);
    this.log(`   Success Rate: ${successRate}%`);

    if (failedTests === 0) {
      this.log('\n🎉 All title visibility tests passed!');
    } else {
      this.log('\n⚠️ Some title visibility tests failed. Check the details above.');
    }

    return {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      successRate,
      results: this.testResults
    };
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new TitleVisibilityTest();
  const results = tester.runTests();
  process.exit(results.failed > 0 ? 1 : 0);
}

module.exports = TitleVisibilityTest;