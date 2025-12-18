/**
 * Memory Match Interface Elements Test
 * 
 * Tests that Memory Match game has all required interface elements
 * according to the BN Games design system standards.
 * 
 * Validates Requirements: 3.1, 3.2, 3.3, 3.4
 */

const fs = require('fs');
const path = require('path');

class MemoryMatchInterfaceTest {
  constructor() {
    this.testResults = [];
    this.memoryMatchPath = path.join(__dirname, '../src/games/memory-match/index.html');
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
   * Property 4: Memory Match Standard Interface Elements
   * Tests that Memory Match has all required interface components
   */
  testMemoryMatchInterfaceElements() {
    this.log('\n📋 Property 4: Memory Match Standard Interface Elements');

    try {
      // Test 1: Memory Match HTML file exists
      if (!fs.existsSync(this.memoryMatchPath)) {
        this.addResult(
          'Memory Match HTML exists',
          false,
          'Memory Match index.html file not found'
        );
        return;
      }

      const htmlContent = fs.readFileSync(this.memoryMatchPath, 'utf8');

      // Test 2: Has mobile back button
      const hasMobileBackButton = htmlContent.includes('mobile-back-button') &&
                                  htmlContent.includes('arrow_back') &&
                                  htmlContent.includes('Hub');
      this.addResult(
        'Mobile back button present',
        hasMobileBackButton,
        hasMobileBackButton ? 'Mobile back button found with correct structure' : 'Mobile back button missing or incomplete'
      );

      // Test 3: Has navbar with logo and back link
      const hasNavbar = htmlContent.includes('<nav') &&
                        htmlContent.includes('Voltar ao Hub') &&
                        htmlContent.includes('BN<span class="text-brand-500">GAMES</span>');
      this.addResult(
        'Navbar with logo present',
        hasNavbar,
        hasNavbar ? 'Navbar with BN GAMES logo and back link found' : 'Navbar missing or incomplete'
      );

      // Test 4: Has volume control component
      const hasVolumeControl = htmlContent.includes('volume-control') &&
                               htmlContent.includes('VolumeControl.js');
      this.addResult(
        'Volume control component',
        hasVolumeControl,
        hasVolumeControl ? 'Volume control component found' : 'Volume control component missing'
      );

      // Test 5: Has pause button
      const hasPauseButton = htmlContent.includes('btn-pause') &&
                             htmlContent.includes('pause') &&
                             htmlContent.includes('material-symbols-outlined');
      this.addResult(
        'Pause button present',
        hasPauseButton,
        hasPauseButton ? 'Pause button with Material Icons found' : 'Pause button missing or incomplete'
      );

      // Test 6: Has game title and subtitle
      const hasGameTitle = htmlContent.includes('MEMORY MATCH') &&
                           htmlContent.includes('Encontre os Pares');
      this.addResult(
        'Game title and subtitle',
        hasGameTitle,
        hasGameTitle ? 'Game title "MEMORY MATCH" and subtitle found' : 'Game title or subtitle missing'
      );

      // Test 7: Has HUD with score elements
      const hasHUD = htmlContent.includes('Moves') &&
                     htmlContent.includes('Timer') &&
                     htmlContent.includes('Best Time') &&
                     htmlContent.includes('id="score"') &&
                     htmlContent.includes('id="timer"') &&
                     htmlContent.includes('id="high-score"');
      this.addResult(
        'HUD with score elements',
        hasHUD,
        hasHUD ? 'HUD with Moves, Timer, and Best Time found' : 'HUD elements missing or incomplete'
      );

      // Test 8: Has dark theme classes
      const hasDarkTheme = htmlContent.includes('bg-dark-bg') &&
                           htmlContent.includes('text-slate-200') &&
                           htmlContent.includes('brand-500') &&
                           htmlContent.includes('brand-400');
      this.addResult(
        'Dark theme styling',
        hasDarkTheme,
        hasDarkTheme ? 'Dark theme classes and brand colors found' : 'Dark theme styling missing'
      );

      // Test 9: Has game overlays (start and game over)
      const hasOverlays = htmlContent.includes('start-screen') &&
                          htmlContent.includes('game-over-screen') &&
                          htmlContent.includes('overlay-screen') &&
                          htmlContent.includes('START GAME') &&
                          htmlContent.includes('TRY AGAIN');
      this.addResult(
        'Game overlays present',
        hasOverlays,
        hasOverlays ? 'Start screen and game over overlays found' : 'Game overlays missing or incomplete'
      );

      // Test 10: Has game board container
      const hasGameBoard = htmlContent.includes('game-board') &&
                           htmlContent.includes('game-container') &&
                           htmlContent.includes('game-shell');
      this.addResult(
        'Game board structure',
        hasGameBoard,
        hasGameBoard ? 'Game board and container structure found' : 'Game board structure missing'
      );

      // Test 11: Has required CSS imports
      const requiredCSS = [
        'mobile-fixes.css',
        'game-responsive.css',
        'volume-control.css',
        'mobile-back-button.css'
      ];
      
      const missingCSS = requiredCSS.filter(css => !htmlContent.includes(css));
      const hasAllCSS = missingCSS.length === 0;
      
      this.addResult(
        'Required CSS imports',
        hasAllCSS,
        hasAllCSS ? 'All required CSS files imported' : `Missing CSS: ${missingCSS.join(', ')}`
      );

      // Test 12: Has core game scripts
      const requiredScripts = [
        'GameEngine.js',
        'InputManager.js',
        'AudioManager.js',
        'VolumeControl.js',
        'MemoryMatchGame.js'
      ];
      
      const missingScripts = requiredScripts.filter(script => !htmlContent.includes(script));
      const hasAllScripts = missingScripts.length === 0;
      
      this.addResult(
        'Core game scripts',
        hasAllScripts,
        hasAllScripts ? 'All core game scripts imported' : `Missing scripts: ${missingScripts.join(', ')}`
      );

    } catch (error) {
      this.addResult(
        'Memory Match interface test',
        false,
        `Error testing Memory Match interface: ${error.message}`
      );
    }
  }

  /**
   * Run all Memory Match interface tests
   */
  runTests() {
    this.log('🧪 Running Memory Match Interface Tests...\n');
    
    this.testMemoryMatchInterfaceElements();
    
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
    this.log('📊 Memory Match Interface Test Summary:');
    this.log(`   Total: ${totalTests}`);
    this.log(`   ✅ Passed: ${passedTests}`);
    this.log(`   ❌ Failed: ${failedTests}`);
    this.log(`   Success Rate: ${successRate}%`);

    if (failedTests === 0) {
      this.log('\n🎉 All Memory Match interface tests passed!');
    } else {
      this.log('\n⚠️ Some Memory Match interface tests failed. Check the details above.');
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
  const tester = new MemoryMatchInterfaceTest();
  const results = tester.runTests();
  process.exit(results.failed > 0 ? 1 : 0);
}

module.exports = MemoryMatchInterfaceTest;