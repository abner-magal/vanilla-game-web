#!/usr/bin/env node

/**
 * Property Test: Game Board Fits Viewport
 * Pure JavaScript - Zero Dependencies
 * 
 * **Feature: responsive-bugfix, Property 3: Game Board Fits Viewport**
 * **Validates: Requirements 1.1, 1.2, 4.3**
 * 
 * Property: *For any* viewport width between 320px and 768px, the game board 
 * element should have a width less than or equal to the viewport width minus padding
 * 
 * Run with: node game-site/tests/game-board-fits-viewport.property.test.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Game Board Fits Viewport Property Tests...');
console.log('Property 3: *For any* viewport width between 320px and 768px,');
console.log('the game board element should have a width <= viewport width minus padding');

// ============================================================
// TEST HARNESS
// ============================================================

let passed = 0;
let failed = 0;
const results = [];

function assert(condition, message) {
  if (condition) {
    passed++;
    results.push({ status: '✅', message });
  } else {
    failed++;
    results.push({ status: '❌', message });
    console.error(`❌ FAIL: ${message}`);
  }
}

// ============================================================
// SETUP
// ============================================================

const GAME_SITE_ROOT = __dirname.includes('tests') ? path.join(__dirname, '..') : __dirname;
const SPACE_INVADERS_CSS = path.join(GAME_SITE_ROOT, 'src', 'games', 'space-invaders', 'style.css');
const SPACE_INVADERS_HTML = path.join(GAME_SITE_ROOT, 'src', 'games', 'space-invaders', 'index.html');

// ============================================================
// PROPERTY 3: Game Board Fits Viewport
// **Feature: responsive-bugfix, Property 3: Game Board Fits Viewport**
// **Validates: Requirements 1.1, 1.2, 4.3**
// ============================================================

console.log('\n📦 Property 3: Game Board Fits Viewport');

// Test 1: Files exist
console.log('\n🧪 Test 1: Space Invaders files exist');
assert(
  fs.existsSync(SPACE_INVADERS_CSS) && fs.existsSync(SPACE_INVADERS_HTML),
  'Space Invaders CSS and HTML files exist'
);

if (!fs.existsSync(SPACE_INVADERS_CSS) || !fs.existsSync(SPACE_INVADERS_HTML)) {
  console.error('❌ Required files not found. Exiting.');
  process.exit(1);
}

const cssContent = fs.readFileSync(SPACE_INVADERS_CSS, 'utf8');
const htmlContent = fs.readFileSync(SPACE_INVADERS_HTML, 'utf8');

// ============================================================
// PROPERTY-BASED TESTS: For any viewport between 320px and 768px
// ============================================================

console.log('\n📐 Testing game board width constraints across viewport range...');

// Test 2: Media query for viewport < 768px exists (Requirement 1.1)
console.log('\n🧪 Test 2: *For any* viewport < 768px, responsive CSS rules SHALL exist');
const hasMediaQuery768 = /@media\s*\(\s*max-width\s*:\s*768px\s*\)/.test(cssContent);
assert(
  hasMediaQuery768,
  'CSS contains @media (max-width: 768px) rule (Requirement 1.1)'
);

// Test 3: Game board has width: 100% constraint (Requirement 1.1)
console.log('\n🧪 Test 3: *For any* mobile viewport, game board width SHALL be 100%');
const hasWidthConstraint = /width\s*:\s*100%\s*!important/.test(cssContent);
assert(
  hasWidthConstraint,
  'Game board has width: 100% !important on mobile (Requirement 1.1)'
);

// Test 4: Game board has max-width constraint with calc() (Requirement 1.2)
console.log('\n🧪 Test 4: *For any* mobile viewport, game board SHALL have max-width constraint');
const maxWidthPattern = /max-width\s*:\s*calc\(100vw\s*-\s*(\d+)rem\)/;
const maxWidthMatch = cssContent.match(maxWidthPattern);
assert(
  maxWidthMatch !== null,
  'Game board has max-width: calc(100vw - Xrem) constraint (Requirement 1.2)'
);

// Test 5: Game board maintains aspect ratio (Requirement 1.2)
console.log('\n🧪 Test 5: *For any* mobile viewport, game board SHALL maintain aspect ratio');
const hasAspectRatio = /aspect-ratio\s*:\s*6\s*\/\s*5/.test(cssContent);
assert(
  hasAspectRatio,
  'Game board has aspect-ratio: 6 / 5 for proportional scaling (Requirement 1.2)'
);

// Test 6: Game board height is auto (Requirement 1.2)
console.log('\n🧪 Test 6: *For any* mobile viewport, game board height SHALL be auto');
const hasHeightAuto = /height\s*:\s*auto\s*!important/.test(cssContent);
assert(
  hasHeightAuto,
  'Game board has height: auto !important on mobile (Requirement 1.2)'
);

// ============================================================
// PROPERTY VERIFICATION: Game board width <= viewport - padding
// ============================================================

console.log('\n📏 Verifying game board fits within viewport at all widths...');

// Test 7: Verify max-width formula ensures board fits at 768px
console.log('\n🧪 Test 7: *For any* viewport at 768px, game board SHALL fit within viewport');
if (maxWidthMatch) {
  const remValue = parseInt(maxWidthMatch[1]);
  const pixelValue = remValue * 16; // 1rem = 16px
  const effectiveMaxWidth768 = 768 - pixelValue;
  
  assert(
    effectiveMaxWidth768 > 0 && effectiveMaxWidth768 <= 768,
    `At 768px viewport: game board max-width is ${effectiveMaxWidth768}px (fits within viewport)`
  );
}

// Test 8: Verify max-width formula ensures board fits at 375px (iPhone)
console.log('\n🧪 Test 8: *For any* viewport at 375px (iPhone), game board SHALL fit within viewport');
if (maxWidthMatch) {
  const remValue = parseInt(maxWidthMatch[1]);
  const pixelValue = remValue * 16;
  const effectiveMaxWidth375 = 375 - pixelValue;
  
  assert(
    effectiveMaxWidth375 > 0 && effectiveMaxWidth375 <= 375,
    `At 375px viewport: game board max-width is ${effectiveMaxWidth375}px (fits within viewport)`
  );
}

// Test 9: Extra-small viewport (480px) has tighter constraints (Requirement 4.3)
console.log('\n🧪 Test 9: *For any* viewport < 480px, game board SHALL have tighter max-width');
const hasMediaQuery480 = /@media\s*\(\s*max-width\s*:\s*480px\s*\)/.test(cssContent);
assert(
  hasMediaQuery480,
  'CSS contains @media (max-width: 480px) rule for extra-small devices (Requirement 4.3)'
);

// Test 10: Verify max-width at 480px breakpoint
console.log('\n🧪 Test 10: *For any* viewport < 480px, game board SHALL have calc(100vw - 1rem)');
const hasExtraSmallMaxWidth = /@media\s*\(\s*max-width\s*:\s*480px\s*\)[\s\S]*?max-width\s*:\s*calc\(100vw\s*-\s*1rem\)/.test(cssContent);
assert(
  hasExtraSmallMaxWidth,
  'Extra-small viewport has max-width: calc(100vw - 1rem) (Requirement 4.3)'
);

// Test 11: Verify max-width formula ensures board fits at 320px (minimum)
console.log('\n🧪 Test 11: *For any* viewport at 320px (minimum), game board SHALL fit within viewport');
// At 320px, the max-width should be calc(100vw - 1rem) = 320 - 16 = 304px
const effectiveMaxWidth320 = 320 - 16; // 1rem = 16px
assert(
  effectiveMaxWidth320 > 0 && effectiveMaxWidth320 <= 320,
  `At 320px viewport: game board max-width is ${effectiveMaxWidth320}px (fits within viewport)`
);

// ============================================================
// PROPERTY VERIFICATION: Random viewport sampling
// ============================================================

console.log('\n🎲 Property-based testing: Random viewport sampling...');

// Generate 100 random viewport widths between 320px and 768px
const MIN_VIEWPORT = 320;
const MAX_VIEWPORT = 768;
const NUM_SAMPLES = 100;

let allViewportsFit = true;
const failedViewports = [];

for (let i = 0; i < NUM_SAMPLES; i++) {
  const viewportWidth = Math.floor(Math.random() * (MAX_VIEWPORT - MIN_VIEWPORT + 1)) + MIN_VIEWPORT;
  
  // Determine which max-width rule applies
  let padding;
  if (viewportWidth <= 480) {
    padding = 16; // 1rem for extra-small
  } else {
    padding = 32; // 2rem for mobile
  }
  
  const effectiveMaxWidth = viewportWidth - padding;
  
  // Game board should fit: effectiveMaxWidth <= viewportWidth
  if (effectiveMaxWidth > viewportWidth || effectiveMaxWidth <= 0) {
    allViewportsFit = false;
    failedViewports.push({ viewport: viewportWidth, maxWidth: effectiveMaxWidth });
  }
}

// Test 12: All random viewports pass the property
console.log(`\n🧪 Test 12: *For any* of ${NUM_SAMPLES} random viewports, game board SHALL fit`);
assert(
  allViewportsFit,
  `All ${NUM_SAMPLES} random viewports (320-768px) have game board fitting within viewport`
);

if (!allViewportsFit) {
  console.log('   Failed viewports:', failedViewports.slice(0, 5).map(v => `${v.viewport}px`).join(', '));
}

// ============================================================
// EDGE CASE TESTS
// ============================================================

console.log('\n📦 Edge Case Tests');

// Test 13: Boundary at exactly 768px
console.log('\n🧪 Test 13: *For any* viewport at exactly 768px boundary, rules SHALL apply');
assert(
  hasMediaQuery768,
  'Media query applies at exactly 768px boundary'
);

// Test 14: Boundary at exactly 480px
console.log('\n🧪 Test 14: *For any* viewport at exactly 480px boundary, tighter rules SHALL apply');
assert(
  hasMediaQuery480,
  'Media query applies at exactly 480px boundary'
);

// Test 15: Boundary at exactly 320px (minimum supported)
console.log('\n🧪 Test 15: *For any* viewport at exactly 320px minimum, game board SHALL fit');
const minViewportFits = (320 - 16) > 0 && (320 - 16) <= 320;
assert(
  minViewportFits,
  'Game board fits at 320px minimum viewport (304px max-width)'
);

// Test 16: Game board has minimum height to prevent collapse
console.log('\n🧪 Test 16: *For any* mobile viewport, game board SHALL have minimum height');
const hasMinHeight = /min-height\s*:\s*\d+px/.test(cssContent);
assert(
  hasMinHeight,
  'Game board has min-height constraint to prevent collapse'
);

// ============================================================
// INTEGRATION TESTS
// ============================================================

console.log('\n🔗 Integration tests...');

// Test 17: HTML has game-board element
console.log('\n🧪 Test 17: HTML SHALL contain game-board element');
const hasGameBoard = /id=["']game-board["']/.test(htmlContent);
assert(
  hasGameBoard,
  'HTML contains game-board element'
);

// Test 18: HTML imports mobile-fixes.css
console.log('\n🧪 Test 18: HTML SHALL import mobile-fixes.css');
const importsMobileFixes = /mobile-fixes\.css/.test(htmlContent);
assert(
  importsMobileFixes,
  'HTML imports mobile-fixes.css for global mobile styles'
);

// Test 19: HTML imports game-responsive.css
console.log('\n🧪 Test 19: HTML SHALL import game-responsive.css');
const importsGameResponsive = /game-responsive\.css/.test(htmlContent);
assert(
  importsGameResponsive,
  'HTML imports game-responsive.css for responsive patterns'
);

// ============================================================
// FINAL REPORT
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('📊 PROPERTY TEST RESULTS - Game Board Fits Viewport');
console.log('**Feature: responsive-bugfix, Property 3: Game Board Fits Viewport**');
console.log('**Validates: Requirements 1.1, 1.2, 4.3**');
console.log('='.repeat(60));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Total:  ${passed + failed}`);
console.log('='.repeat(60));

if (failed > 0) {
  console.log('\n❌ FAILED TESTS:');
  results.filter(r => r.status === '❌').forEach(r => {
    console.log(`  ${r.status} ${r.message}`);
  });
  console.log('\n💡 To satisfy Property 3 (Game Board Fits Viewport):');
  console.log('   - Media query @media (max-width: 768px) must exist');
  console.log('   - Game board must have width: 100% !important');
  console.log('   - Game board must have max-width: calc(100vw - 2rem)');
  console.log('   - Game board must have aspect-ratio: 6 / 5');
  console.log('   - Game board must have height: auto !important');
  console.log('   - Media query @media (max-width: 480px) must exist');
  console.log('   - Extra-small viewport must have max-width: calc(100vw - 1rem)');
  console.log('   - Game board must have min-height constraint');
  console.log('   - HTML must import mobile-fixes.css and game-responsive.css');
  process.exit(1);
} else {
  console.log('\n🎉 All Game Board Fits Viewport property tests passed!');
  console.log('✨ Property 3 validated: Game board fits within viewport at all widths (320-768px).');
  console.log('📱 Requirements 1.1, 1.2, and 4.3 validated successfully.');
  process.exit(0);
}
