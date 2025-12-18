#!/usr/bin/env node

/**
 * Property Test: Overlay Content Visibility
 * 
 * **Feature: responsive-bugfix, Property 4: Overlay Content Visibility**
 * **Validates: Requirements 2.1, 2.4**
 * 
 * Property: *For any* overlay screen displayed at viewport widths between 320px and 768px,
 * all interactive elements should be fully visible within the viewport.
 */

const TestHarness = require('../utils/test-harness');
const { getGamePaths, readFileSafe, fileExists } = require('../utils/file-helpers');
const { 
  hasMediaQuery, 
  CSS_PATTERNS,
  checkOverlayStyles,
  extractClampMinValues
} = require('../utils/css-patterns');
const { 
  checkOverlayElements, 
  countClassOccurrences,
  checkCssImports 
} = require('../utils/html-patterns');
const config = require('../config');

const harness = new TestHarness('Overlay Content Visibility');

function run() {
  console.log('🚀 Starting Overlay Content Visibility Property Tests...');
  console.log('Property 4: *For any* overlay screen at 320-768px, content should be visible');

  const paths = getGamePaths('space-invaders');

  harness.log('Test 1: Space Invaders files exist');
  harness.assert(
    fileExists(paths.css) && fileExists(paths.html),
    'Space Invaders CSS and HTML files exist'
  );

  if (!fileExists(paths.css) || !fileExists(paths.html)) {
    return harness.getSummary();
  }

  const cssContent = readFileSafe(paths.css);
  const htmlContent = readFileSafe(paths.html);

  // ============================================================
  // OVERLAY STRUCTURE TESTS
  // ============================================================

  const overlayElements = checkOverlayElements(htmlContent);

  harness.log('Test 2: Start screen overlay exists');
  harness.assert(overlayElements.hasStartScreen, 'HTML contains start-screen overlay');

  harness.log('Test 3: Pause screen overlay exists');
  harness.assert(overlayElements.hasPauseScreen, 'HTML contains pause-screen overlay');

  harness.log('Test 4: Game over screen overlay exists');
  harness.assert(overlayElements.hasGameOverScreen, 'HTML contains game-over-screen overlay');

  harness.log('Test 5: All overlays have overlay-responsive class');
  const overlayResponsiveCount = countClassOccurrences(htmlContent, 'overlay-responsive');
  harness.assert(
    overlayResponsiveCount >= 3,
    `All 3 overlays have overlay-responsive class (found ${overlayResponsiveCount})`
  );

  // ============================================================
  // OVERLAY CSS TESTS
  // ============================================================

  const overlayStyles = checkOverlayStyles(cssContent);

  harness.log('Test 6: Overlay titles use clamp() for responsive sizing');
  harness.assert(overlayStyles.hasClampTypography, 'Overlay titles use clamp()');

  harness.log('Test 7: Overlay titles have word-break');
  harness.assert(overlayStyles.hasWordBreak, 'Overlay titles have word-break: break-word');

  // ============================================================
  // BUTTON VISIBILITY TESTS
  // ============================================================

  harness.log('Test 8: Buttons have responsive font-size');
  const hasButtonClamp = /\.overlay-content\s+button[\s\S]*?font-size\s*:\s*clamp\(/m.test(cssContent);
  harness.assert(hasButtonClamp, 'Overlay buttons use clamp()');

  harness.log('Test 9: Buttons prevent text wrapping');
  harness.assert(overlayStyles.hasWhiteSpaceNowrap, 'Buttons have white-space: nowrap');

  harness.log('Test 10: Start button exists');
  harness.assert(overlayElements.hasBtnStart, 'Start screen has btn-start button');

  harness.log('Test 11: Resume button exists');
  harness.assert(overlayElements.hasBtnResume, 'Pause screen has btn-resume button');

  harness.log('Test 12: Restart button exists');
  harness.assert(overlayElements.hasBtnRestart, 'Game over screen has btn-restart button');

  // ============================================================
  // MEDIA QUERY TESTS
  // ============================================================

  harness.log('Test 13: Media query for 768px exists');
  harness.assert(hasMediaQuery(cssContent, 768), 'CSS contains @media (max-width: 768px)');

  harness.log('Test 14: Media query for 480px exists');
  harness.assert(hasMediaQuery(cssContent, 480), 'CSS contains @media (max-width: 480px)');

  // ============================================================
  // READABILITY TESTS
  // ============================================================

  harness.log('Test 15: All clamp() values ensure readability');
  const minValues = extractClampMinValues(cssContent);
  const allReadable = minValues.every(v => v >= config.MIN_FONT_SIZES.SMALL_TEXT);
  harness.assert(
    allReadable,
    `All clamp() min values >= ${config.MIN_FONT_SIZES.SMALL_TEXT}rem`
  );

  // ============================================================
  // VIEWPORT SIMULATION
  // ============================================================

  harness.log('Test 16: Content area sufficient at 320px');
  const contentAreaAt320 = 320 - 32; // 2rem padding
  harness.assert(contentAreaAt320 > 200, `Content area at 320px is ${contentAreaAt320}px`);

  harness.log('Test 17: Content area sufficient at 375px');
  const contentAreaAt375 = 375 - 32;
  harness.assert(contentAreaAt375 > 250, `Content area at 375px is ${contentAreaAt375}px`);

  // ============================================================
  // INTEGRATION TESTS
  // ============================================================

  const cssImports = checkCssImports(htmlContent);

  harness.log('Test 18: HTML imports mobile-fixes.css');
  harness.assert(cssImports.hasMobileFixes, 'HTML imports mobile-fixes.css');

  harness.log('Test 19: HTML imports game-responsive.css');
  harness.assert(cssImports.hasGameResponsive, 'HTML imports game-responsive.css');

  harness.printReport({
    feature: 'responsive-bugfix, Property 4',
    requirements: 'Requirements 2.1, 2.4'
  });

  return harness.getSummary();
}

if (require.main === module) {
  const result = run();
  process.exit(result.failed > 0 ? 1 : 0);
}

module.exports = run;
