#!/usr/bin/env node

/**
 * Property Test: Game Board Fits Viewport
 * 
 * **Feature: responsive-bugfix, Property 3: Game Board Fits Viewport**
 * **Validates: Requirements 1.1, 1.2, 4.3**
 * 
 * Property: *For any* viewport width between 320px and 768px, the game board 
 * element should have a width less than or equal to the viewport width minus padding
 */

const TestHarness = require('../utils/test-harness');
const { getGamePaths, readFileSafe, fileExists } = require('../utils/file-helpers');
const { 
  hasMediaQuery, 
  CSS_PATTERNS, 
  calculateEffectiveMaxWidth,
  checkGameBoardStyles 
} = require('../utils/css-patterns');
const { HTML_PATTERNS, checkCssImports } = require('../utils/html-patterns');
const config = require('../config');

const harness = new TestHarness('Game Board Fits Viewport');

function run() {
  console.log('🚀 Starting Game Board Fits Viewport Property Tests...');
  console.log('Property 3: *For any* viewport width between 320px and 768px,');
  console.log('the game board element should have a width <= viewport width minus padding');

  const paths = getGamePaths('space-invaders');
  
  // Test 1: Files exist
  harness.log('Test 1: Space Invaders files exist');
  harness.assert(
    fileExists(paths.css) && fileExists(paths.html),
    'Space Invaders CSS and HTML files exist'
  );

  if (!fileExists(paths.css) || !fileExists(paths.html)) {
    console.error('❌ Required files not found. Exiting.');
    return { passed: 0, failed: 1 };
  }

  const cssContent = readFileSafe(paths.css);
  const htmlContent = readFileSafe(paths.html);

  // Test 2: Media query for viewport < 768px exists
  harness.log('Test 2: *For any* viewport < 768px, responsive CSS rules SHALL exist');
  harness.assert(
    hasMediaQuery(cssContent, 768),
    'CSS contains @media (max-width: 768px) rule (Requirement 1.1)'
  );

  // Test 3: Game board styles
  const boardStyles = checkGameBoardStyles(cssContent);
  
  harness.log('Test 3: *For any* mobile viewport, game board width SHALL be 100%');
  harness.assert(boardStyles.hasWidth100, 'Game board has width: 100% !important on mobile');

  harness.log('Test 4: *For any* mobile viewport, game board SHALL have max-width constraint');
  harness.assert(boardStyles.hasMaxWidthCalc, 'Game board has max-width: calc(100vw - Xrem)');

  harness.log('Test 5: *For any* mobile viewport, game board SHALL maintain aspect ratio');
  harness.assert(boardStyles.hasAspectRatio, 'Game board has aspect-ratio for proportional scaling');

  harness.log('Test 6: *For any* mobile viewport, game board height SHALL be auto');
  harness.assert(boardStyles.hasHeightAuto, 'Game board has height: auto !important');

  // Test 7-8: Verify max-width at specific viewports
  harness.log('Test 7: *For any* viewport at 768px, game board SHALL fit within viewport');
  const maxWidth768 = calculateEffectiveMaxWidth(cssContent, 768);
  if (maxWidth768) {
    harness.assert(
      maxWidth768 > 0 && maxWidth768 <= 768,
      `At 768px viewport: game board max-width is ${maxWidth768}px (fits within viewport)`
    );
  }

  harness.log('Test 8: *For any* viewport at 375px (iPhone), game board SHALL fit within viewport');
  const maxWidth375 = calculateEffectiveMaxWidth(cssContent, 375);
  if (maxWidth375) {
    harness.assert(
      maxWidth375 > 0 && maxWidth375 <= 375,
      `At 375px viewport: game board max-width is ${maxWidth375}px (fits within viewport)`
    );
  }

  // Test 9-10: Extra-small viewport
  harness.log('Test 9: *For any* viewport < 480px, game board SHALL have tighter max-width');
  harness.assert(hasMediaQuery(cssContent, 480), 'CSS contains @media (max-width: 480px) rule');

  // Test 11: Random viewport sampling
  harness.log('Test 10: Property-based testing: Random viewport sampling');
  const { MIN, TABLET } = config.VIEWPORTS;
  const NUM_SAMPLES = 100;
  let allViewportsFit = true;

  for (let i = 0; i < NUM_SAMPLES; i++) {
    const viewportWidth = Math.floor(Math.random() * (TABLET - MIN + 1)) + MIN;
    const padding = viewportWidth <= 480 ? 16 : 32;
    const effectiveMaxWidth = viewportWidth - padding;
    
    if (effectiveMaxWidth > viewportWidth || effectiveMaxWidth <= 0) {
      allViewportsFit = false;
      break;
    }
  }

  harness.assert(
    allViewportsFit,
    `All ${NUM_SAMPLES} random viewports (320-768px) have game board fitting within viewport`
  );

  // Test 12: HTML has game-board element
  harness.log('Test 11: HTML SHALL contain game-board element');
  harness.assert(HTML_PATTERNS.gameBoard.test(htmlContent), 'HTML contains game-board element');

  // Test 13: HTML imports required CSS
  const cssImports = checkCssImports(htmlContent);
  harness.log('Test 12: HTML SHALL import mobile-fixes.css');
  harness.assert(cssImports.hasMobileFixes, 'HTML imports mobile-fixes.css');

  harness.log('Test 13: HTML SHALL import game-responsive.css');
  harness.assert(cssImports.hasGameResponsive, 'HTML imports game-responsive.css');

  // Print report
  const success = harness.printReport({
    feature: 'responsive-bugfix, Property 3',
    requirements: 'Requirements 1.1, 1.2, 4.3'
  });

  return harness.getSummary();
}

// Run if called directly
if (require.main === module) {
  const result = run();
  process.exit(result.failed > 0 ? 1 : 0);
}

module.exports = run;
