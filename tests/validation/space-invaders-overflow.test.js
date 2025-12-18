#!/usr/bin/env node

/**
 * Validation Test: Space Invaders Horizontal Overflow
 * 
 * Tests specific viewport widths (375px iPhone, 320px minimum) for horizontal overflow
 * **Validates: Requirements 4.1, 4.3**
 */

const TestHarness = require('../utils/test-harness');
const { getGamePaths, readFileSafe, fileExists } = require('../utils/file-helpers');
const { 
  hasMediaQuery, 
  CSS_PATTERNS, 
  calculateEffectiveMaxWidth,
  checkGameBoardStyles,
  hasReadableClampValues,
  checkOverlayStyles
} = require('../utils/css-patterns');
const { checkCssImports, HTML_PATTERNS } = require('../utils/html-patterns');
const config = require('../config');

const harness = new TestHarness('Space Invaders Overflow Validation');

function run() {
  console.log('🚀 Starting Space Invaders Overflow Validation Tests...');
  console.log('Testing specific viewports: 375px (iPhone) and 320px (minimum)');

  const paths = getGamePaths('space-invaders');

  // Test 1: Files exist
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
  // REQUIREMENT 4.1: Test at 375px (iPhone viewport)
  // ============================================================

  console.log('\n📱 Testing at 375px viewport (iPhone)...');

  harness.log('Test 2: Media query covers 375px viewport');
  harness.assert(
    hasMediaQuery(cssContent, 768),
    'CSS has @media (max-width: 768px) which covers 375px viewport'
  );

  const boardStyles = checkGameBoardStyles(cssContent);

  harness.log('Test 3: Game board has max-width constraint at 375px');
  harness.assert(boardStyles.hasMaxWidthCalc, 'Game board has max-width: calc(100vw - Xrem)');

  harness.log('Test 4: Game board width is 100% at 375px');
  harness.assert(boardStyles.hasWidth100, 'Game board has width: 100% !important');

  harness.log('Test 5: Effective max-width at 375px is within viewport');
  const maxWidth375 = calculateEffectiveMaxWidth(cssContent, 375);
  if (maxWidth375) {
    harness.assert(
      maxWidth375 > 0 && maxWidth375 <= 375,
      `Effective max-width at 375px is ${maxWidth375}px (within viewport)`
    );
  }

  harness.log('Test 6: Aspect ratio maintains proportions at 375px');
  harness.assert(boardStyles.hasAspectRatio, 'Game board has aspect-ratio');

  harness.log('Test 7: Height is auto at 375px');
  harness.assert(boardStyles.hasHeightAuto, 'Game board has height: auto !important');

  // ============================================================
  // REQUIREMENT 4.3: Test at 320px (minimum viewport)
  // ============================================================

  console.log('\n📱 Testing at 320px viewport (minimum)...');

  harness.log('Test 8: Media query covers 320px viewport');
  harness.assert(
    hasMediaQuery(cssContent, 480),
    'CSS has @media (max-width: 480px) which covers 320px viewport'
  );

  harness.log('Test 9: Effective max-width at 320px is within viewport');
  const maxWidth320 = calculateEffectiveMaxWidth(cssContent, 320);
  if (maxWidth320) {
    harness.assert(
      maxWidth320 > 0 && maxWidth320 <= 320,
      `Effective max-width at 320px is ${maxWidth320}px (within viewport)`
    );
  }

  // ============================================================
  // OVERLAY AND HUD TESTS
  // ============================================================

  console.log('\n🎨 Testing overlays and HUD...');

  const overlayStyles = checkOverlayStyles(cssContent);

  harness.log('Test 10: Overlay content scales at 375px');
  harness.assert(overlayStyles.hasClampTypography, 'Overlay content uses clamp() for fluid typography');

  harness.log('Test 11: Overlay buttons fit at 375px');
  const hasButtonSizing = /\.overlay-content\s+button[\s\S]*?font-size\s*:\s*clamp\(/m.test(cssContent);
  harness.assert(hasButtonSizing, 'Buttons have responsive sizing with clamp()');

  harness.log('Test 12: HUD elements stack at 375px');
  harness.assert(CSS_PATTERNS.flexColumn.test(cssContent), 'HUD uses flex-direction: column');

  harness.log('Test 13: All text remains readable');
  harness.assert(
    hasReadableClampValues(cssContent, config.MIN_FONT_SIZES.SMALL_TEXT),
    'All clamp() minimum values are >= 0.75rem for readability'
  );

  // ============================================================
  // INTEGRATION TESTS
  // ============================================================

  console.log('\n🔗 Integration tests...');

  const cssImports = checkCssImports(htmlContent);

  harness.log('Test 14: HTML imports mobile-fixes.css');
  harness.assert(cssImports.hasMobileFixes, 'HTML imports mobile-fixes.css');

  harness.log('Test 15: HTML imports game-responsive.css');
  harness.assert(cssImports.hasGameResponsive, 'HTML imports game-responsive.css');

  harness.log('Test 16: Game board element exists in HTML');
  harness.assert(HTML_PATTERNS.gameBoard.test(htmlContent), 'HTML contains game-board element');

  harness.log('Test 17: Overlay elements exist in HTML');
  const hasOverlay = /overlay-screen|start-screen|game-over-screen/.test(htmlContent);
  harness.assert(hasOverlay, 'HTML contains overlay screen elements');

  // Print report
  harness.printReport({
    feature: 'Space Invaders Overflow Validation',
    requirements: 'Requirements 4.1, 4.3'
  });

  return harness.getSummary();
}

// Run if called directly
if (require.main === module) {
  const result = run();
  process.exit(result.failed > 0 ? 1 : 0);
}

module.exports = run;
