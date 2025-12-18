/**
 * Canvas Aspect Ratio Test
 * 
 * Tests that game canvases preserve their aspect ratio and scale properly on mobile devices.
 * Validates that games have proper responsive canvas handling.
 * 
 * Validates Requirements: 6.2, 6.3
 */

const fs = require('fs');
const path = require('path');

class CanvasAspectRatioTest {
  constructor() {
    this.testResults = [];
    this.gamesDir = path.join(__dirname, '../src/games');
    this.canvasGames = ['pong', 'snake', 'tetris', 'breakout', 'space-invaders'];
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
   * Property 7: Canvas Aspect Ratio Preservation
   * Tests that canvases have proper responsive scaling and aspect ratio preservation
   */
  testCanvasAspectRatio() {
    this.log('\n📋 Property 7: Canvas Aspect Ratio Preservation');

    try {
      let gamesWithCanvas = 0;
      let gamesWithResponsiveCanvas = 0;
      let gamesWithAspectRatio = 0;
      let gamesWithResizeHandling = 0;

      for (const game of this.canvasGames) {
        const gamePath = path.join(this.gamesDir, game);
        const htmlPath = path.join(gamePath, 'index.html');
        const jsPath = path.join(gamePath, `${game.charAt(0).toUpperCase() + game.slice(1)}Game.js`);
        const cssPath = path.join(gamePath, 'style.css');

        if (!fs.existsSync(htmlPath)) continue;

        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        // Test 1: Has canvas element
        if (htmlContent.includes('<canvas')) {
          gamesWithCanvas++;

          // Test 2: Canvas has responsive classes or wrapper
          const hasResponsiveCanvas = htmlContent.includes('w-full') ||
                                      htmlContent.includes('max-width') ||
                                      htmlContent.includes('aspect-') ||
                                      htmlContent.includes('canvas-wrapper');
          if (hasResponsiveCanvas) {
            gamesWithResponsiveCanvas++;
          }

          // Test 3: Has aspect ratio preservation
          const hasAspectRatio = htmlContent.includes('aspect-[') ||
                                 htmlContent.includes('aspect-ratio') ||
                                 (fs.existsSync(cssPath) && 
                                  fs.readFileSync(cssPath, 'utf8').includes('aspect-ratio'));
          if (hasAspectRatio) {
            gamesWithAspectRatio++;
          }

          // Test 4: JavaScript has resize handling
          if (fs.existsSync(jsPath)) {
            const jsContent = fs.readFileSync(jsPath, 'utf8');
            const hasResizeHandling = jsContent.includes('resize') ||
                                      jsContent.includes('handleResize') ||
                                      jsContent.includes('addEventListener') && jsContent.includes('resize');
            if (hasResizeHandling) {
              gamesWithResizeHandling++;
            }
          }
        }
      }

      // Test results
      this.addResult(
        'Games with canvas elements',
        gamesWithCanvas >= 2,
        `${gamesWithCanvas}/${this.canvasGames.length} games have canvas elements`
      );

      this.addResult(
        'Games with responsive canvas',
        gamesWithResponsiveCanvas >= 2,
        `${gamesWithResponsiveCanvas}/${gamesWithCanvas} canvas games have responsive styling`
      );

      this.addResult(
        'Games with aspect ratio preservation',
        gamesWithAspectRatio >= 1,
        `${gamesWithAspectRatio}/${gamesWithCanvas} canvas games preserve aspect ratio`
      );

      this.addResult(
        'Games with resize handling',
        gamesWithResizeHandling >= 2,
        `${gamesWithResizeHandling}/${gamesWithCanvas} canvas games have resize handling in JavaScript`
      );

      // Test 5: Specific Pong test (since it was mentioned in requirements)
      const pongPath = path.join(this.gamesDir, 'pong/index.html');
      if (fs.existsSync(pongPath)) {
        const pongHTML = fs.readFileSync(pongPath, 'utf8');
        const pongJSPath = path.join(this.gamesDir, 'pong/PongGame.js');
        
        const pongHasAspectRatio = pongHTML.includes('aspect-[3/2]');
        const pongHasCanvasWrapper = pongHTML.includes('canvas-wrapper');
        
        let pongHasResizeHandler = false;
        if (fs.existsSync(pongJSPath)) {
          const pongJS = fs.readFileSync(pongJSPath, 'utf8');
          pongHasResizeHandler = pongJS.includes('handleResize') && 
                                 pongJS.includes('addEventListener') && 
                                 pongJS.includes('resize');
        }

        this.addResult(
          'Pong has aspect ratio preservation',
          pongHasAspectRatio,
          pongHasAspectRatio ? 'Pong canvas has aspect-[3/2] class' : 'Pong canvas missing aspect ratio class'
        );

        this.addResult(
          'Pong has canvas wrapper',
          pongHasCanvasWrapper,
          pongHasCanvasWrapper ? 'Pong has canvas-wrapper for responsive scaling' : 'Pong missing canvas wrapper'
        );

        this.addResult(
          'Pong has resize handler',
          pongHasResizeHandler,
          pongHasResizeHandler ? 'Pong JavaScript has proper resize handling' : 'Pong missing resize handler'
        );
      }

      // Test 6: Mobile fixes CSS has canvas rules
      const mobileFixes = path.join(__dirname, '../styles/components/mobile-fixes.css');
      if (fs.existsSync(mobileFixes)) {
        const cssContent = fs.readFileSync(mobileFixes, 'utf8');
        
        const hasCanvasRules = cssContent.includes('canvas {') &&
                               cssContent.includes('max-width: 100%') &&
                               cssContent.includes('height: auto');
        
        this.addResult(
          'Mobile fixes has canvas rules',
          hasCanvasRules,
          hasCanvasRules ? 'mobile-fixes.css has responsive canvas rules' : 'mobile-fixes.css missing canvas rules'
        );

        const hasGameBoardRules = cssContent.includes('#game-board') ||
                                  cssContent.includes('.game-board');
        
        this.addResult(
          'Mobile fixes has game board rules',
          hasGameBoardRules,
          hasGameBoardRules ? 'mobile-fixes.css has game board responsive rules' : 'mobile-fixes.css missing game board rules'
        );
      }

    } catch (error) {
      this.addResult(
        'Canvas aspect ratio test',
        false,
        `Error testing canvas aspect ratio: ${error.message}`
      );
    }
  }

  /**
   * Run all canvas aspect ratio tests
   */
  runTests() {
    this.log('🧪 Running Canvas Aspect Ratio Tests...\n');
    
    this.testCanvasAspectRatio();
    
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
    this.log('📊 Canvas Aspect Ratio Test Summary:');
    this.log(`   Total: ${totalTests}`);
    this.log(`   ✅ Passed: ${passedTests}`);
    this.log(`   ❌ Failed: ${failedTests}`);
    this.log(`   Success Rate: ${successRate}%`);

    if (failedTests === 0) {
      this.log('\n🎉 All canvas aspect ratio tests passed!');
    } else {
      this.log('\n⚠️ Some canvas aspect ratio tests failed. Check the details above.');
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
  const tester = new CanvasAspectRatioTest();
  const results = tester.runTests();
  process.exit(results.failed > 0 ? 1 : 0);
}

module.exports = CanvasAspectRatioTest;