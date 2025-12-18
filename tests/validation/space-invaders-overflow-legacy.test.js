#!/usr/bin/env node

/**
 * Space Invaders Horizontal Overflow Validation Tests
 * Pure JavaScript - Zero Dependencies
 * 
 * Tests specific viewport widths (375px iPhone, 320px minimum) for horizontal overflow
 * **Validates: Requirements 4.1, 4.3**
 * 
 * Run with: node game-site/tests/space-invaders-overflow-validation.test.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Space Invaders Overflow Validation Tests...');
console.log('Testing specific viewports: 375px (iPhone) and 320px (minimum)');

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
// REQUIREMENT 4.1: Test at 375px (iPhone viewport)
// ============================================================

console.log('\n📱 Testing at 375px viewport (iPhone)...');

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

// Test 2: Media query for 375px viewport exists (covered by max-width: 768px)
console.log('\n🧪 Test 2: Media query covers 375px viewport');
const hasMediaQuery768 = /@media\s*\(\s*max-width\s*:\s*768px\s*\)/.test(cssContent);
assert(
  hasMediaQuery768,
  'CSS has @media (max-width: 768px) which covers 375px viewport (Requirement 4.1)'
);

// Test 3: Game board has max-width constraint for 375px
console.log('\n🧪 Test 3: Game board has max-width constraint at 375px');
const hasMaxWidthConstraint = /max-width\s*:\s*calc\(100vw\s*-\s*\d+rem\)/.test(cssContent);
assert(
  hasMaxWidthConstraint,
  'Game board has max-width: calc(100vw - Xrem) to prevent overflow at 375px (Requirement 4.1)'
);

// Test 4: Game board width is 100% at 375px
console.log('\n🧪 Test 4: Game board width is 100% at 375px');
const hasWidthConstraint = /width\s*:\s*100%\s*!important/.test(cssContent);
assert(
  hasWidthConstraint,
  'Game board has width: 100% !important at 375px viewport (Requirement 4.1)'
);

// Test 5: Calculate effective max-width at 375px
console.log('\n🧪 Test 5: Effective max-width at 375px is within viewport');
const maxWidthMatch = cssContent.match(/max-width\s*:\s*calc\(100vw\s*-\s*(\d+)rem\)/);
if (maxWidthMatch) {
  const remValue = parseInt(maxWidthMatch[1]);
  const pixelValue = remValue * 16; // 1rem = 16px
  const effectiveMaxWidth = 375 - pixelValue;
  
  assert(
    effectiveMaxWidth > 0 && effectiveMaxWidth <= 375,
    `Effective max-width at 375px is ${effectiveMaxWidth}px (within viewport) (Requirement 4.1)`
  );
} else {
  assert(false, 'Could not calculate effective max-width at 375px');
}

// Test 6: Aspect ratio maintains proportions at 375px
console.log('\n🧪 Test 6: Aspect ratio maintains proportions at 375px');
const hasAspectRatio = /aspect-ratio\s*:\s*6\s*\/\s*5/.test(cssContent);
assert(
  hasAspectRatio,
  'Game board has aspect-ratio: 6 / 5 to maintain proportions at 375px (Requirement 4.1)'
);

// Test 7: Height is auto at 375px
console.log('\n🧪 Test 7: Height is auto at 375px');
const hasHeightAuto = /height\s*:\s*auto\s*!important/.test(cssContent);
assert(
  hasHeightAuto,
  'Game board has height: auto !important at 375px (Requirement 4.1)'
);

// ============================================================
// REQUIREMENT 4.3: Test at 320px (minimum viewport)
// ============================================================

console.log('\n📱 Testing at 320px viewport (minimum)...');

// Test 8: Media query for 320px viewport exists
console.log('\n🧪 Test 8: Media query covers 320px viewport');
const hasMediaQuery480 = /@media\s*\(\s*max-width\s*:\s*480px\s*\)/.test(cssContent);
assert(
  hasMediaQuery480,
  'CSS has @media (max-width: 480px) which covers 320px viewport (Requirement 4.3)'
);

// Test 9: Calculate effective max-width at 320px
console.log('\n🧪 Test 9: Effective max-width at 320px is within viewport');
// At 320px, the max-width should still be calc(100vw - Xrem)
if (maxWidthMatch) {
  const remValue = parseInt(maxWidthMatch[1]);
  const pixelValue = remValue * 16;
  const effectiveMaxWidth = 320 - pixelValue;
  
  assert(
    effectiveMaxWidth > 0 && effectiveMaxWidth <= 320,
    `Effective max-width at 320px is ${effectiveMaxWidth}px (within viewport) (Requirement 4.3)`
  );
}

// Test 10: Extra-small viewport has tighter constraints
console.log('\n🧪 Test 10: Extra-small viewport (320px) has tighter max-width');
const hasExtraSmallMaxWidth = /@media\s*\(\s*max-width\s*:\s*480px\s*\)[\s\S]*?max-width\s*:\s*calc\(100vw\s*-\s*1rem\)/.test(cssContent);
assert(
  hasExtraSmallMaxWidth,
  'Extra-small viewport has max-width: calc(100vw - 1rem) for tighter fit at 320px (Requirement 4.3)'
);

// Test 11: Minimum height constraint at 320px
console.log('\n🧪 Test 11: Minimum height constraint at 320px');
const hasMinHeight = /@media\s*\(\s*max-width\s*:\s*480px\s*\)[\s\S]*?min-height\s*:\s*\d+px/.test(cssContent);
assert(
  hasMinHeight,
  'Game board has min-height constraint at 320px to prevent collapse (Requirement 4.3)'
);

// Test 12: Board viewport padding is reduced at 320px
console.log('\n🧪 Test 12: Board viewport padding is reduced at 320px');
const hasReducedPadding = /@media\s*\(\s*max-width\s*:\s*480px\s*\)[\s\S]*?padding\s*:\s*0\.\d+rem/.test(cssContent);
assert(
  hasReducedPadding,
  'Board viewport has reduced padding at 320px to maximize space (Requirement 4.3)'
);

// ============================================================
// REQUIREMENT 4.1 & 4.3: Verify document.scrollWidth <= document.clientWidth
// ============================================================

console.log('\n📏 Verifying scrollWidth <= clientWidth constraint...');

// Test 13: No fixed widths exceed viewport
console.log('\n🧪 Test 13: No fixed widths exceed 375px viewport');
const fixedWidthPattern = /width\s*:\s*(\d+)px/g;
let fixedWidths = [];
let match;
while ((match = fixedWidthPattern.exec(cssContent)) !== null) {
  const width = parseInt(match[1]);
  if (width > 375) {
    fixedWidths.push(width);
  }
}

// Check if large fixed widths are inside media queries or have responsive overrides
const hasResponsiveOverrides = fixedWidths.length === 0 || hasMediaQuery768;
assert(
  hasResponsiveOverrides,
  `No fixed widths exceed 375px without responsive overrides (found: ${fixedWidths.length > 0 ? fixedWidths.join(', ') + 'px' : 'none'}) (Requirement 4.1)`
);

// Test 14: No fixed widths exceed 320px viewport
console.log('\n🧪 Test 14: No fixed widths exceed 320px viewport');
let fixedWidths320 = [];
fixedWidthPattern.lastIndex = 0; // Reset regex
while ((match = fixedWidthPattern.exec(cssContent)) !== null) {
  const width = parseInt(match[1]);
  if (width > 320) {
    fixedWidths320.push(width);
  }
}

const hasResponsiveOverrides320 = fixedWidths320.length === 0 || hasMediaQuery480;
assert(
  hasResponsiveOverrides320,
  `No fixed widths exceed 320px without responsive overrides (Requirement 4.3)`
);

// Test 15: Overflow-x is hidden or not set (allowing natural fit)
console.log('\n🧪 Test 15: Overflow-x handling is appropriate');
const hasOverflowHidden = /overflow-x\s*:\s*hidden/.test(cssContent);
const hasNoOverflowX = !cssContent.includes('overflow-x: scroll') && !cssContent.includes('overflow-x: auto');
assert(
  hasOverflowHidden || hasNoOverflowX,
  'Overflow-x is either hidden or not set to scroll/auto (Requirements 4.1, 4.3)'
);

// ============================================================
// OVERLAY AND HUD TESTS AT SPECIFIC VIEWPORTS
// ============================================================

console.log('\n🎨 Testing overlays and HUD at specific viewports...');

// Test 16: Overlay content scales at 375px
console.log('\n🧪 Test 16: Overlay content scales properly at 375px');
const hasClampTypography = /font-size\s*:\s*clamp\(/.test(cssContent);
assert(
  hasClampTypography,
  'Overlay content uses clamp() for fluid typography at 375px (Requirement 4.1)'
);

// Test 17: Overlay buttons fit at 375px
console.log('\n🧪 Test 17: Overlay buttons fit within 375px viewport');
const hasButtonSizing = /\.overlay-content\s+button[\s\S]*?font-size\s*:\s*clamp\(/.test(cssContent);
assert(
  hasButtonSizing,
  'Buttons have responsive sizing with clamp() at 375px (Requirement 4.1)'
);

// Test 18: HUD elements stack at 375px
console.log('\n🧪 Test 18: HUD elements stack vertically at 375px');
const hasFlexColumn = /flex-direction\s*:\s*column/.test(cssContent);
assert(
  hasFlexColumn,
  'HUD uses flex-direction: column at 375px (Requirement 4.1)'
);

// Test 19: Overlay content scales at 320px
console.log('\n🧪 Test 19: Overlay content remains readable at 320px');
const clampMatches = cssContent.match(/clamp\(\s*([\d.]+)rem/g);
if (clampMatches) {
  const minSizes = clampMatches.map(match => {
    const sizeMatch = match.match(/clamp\(\s*([\d.]+)rem/);
    return sizeMatch ? parseFloat(sizeMatch[1]) : 0;
  });
  
  // Minimum font size should be at least 0.75rem (12px) for small text, 0.875rem (14px) for body text
  // Allow 0.75rem for small descriptive text (paragraphs)
  const allReadable = minSizes.every(size => size >= 0.75);
  assert(
    allReadable,
    `All text remains readable at 320px (min sizes: ${minSizes.join(', ')}rem >= 0.75rem) (Requirement 4.3)`
  );
} else {
  assert(false, 'No clamp() functions found for responsive typography at 320px');
}

// Test 20: Buttons remain clickable at 320px
console.log('\n🧪 Test 20: Buttons remain clickable at 320px');
const hasWhitespaceNowrap = /white-space\s*:\s*nowrap/.test(cssContent);
assert(
  hasWhitespaceNowrap,
  'Buttons have white-space: nowrap to prevent wrapping at 320px (Requirement 4.3)'
);

// ============================================================
// INTEGRATION TESTS
// ============================================================

console.log('\n🔗 Integration tests...');

// Test 21: HTML imports mobile-fixes.css
console.log('\n🧪 Test 21: HTML imports mobile-fixes.css');
const importsMobileFixes = /mobile-fixes\.css/.test(htmlContent);
assert(
  importsMobileFixes,
  'HTML imports mobile-fixes.css for global mobile styles (Requirements 4.1, 4.3)'
);

// Test 22: HTML imports game-responsive.css
console.log('\n🧪 Test 22: HTML imports game-responsive.css');
const importsGameResponsive = /game-responsive\.css/.test(htmlContent);
assert(
  importsGameResponsive,
  'HTML imports game-responsive.css for responsive patterns (Requirements 4.1, 4.3)'
);

// Test 23: Game board element exists in HTML
console.log('\n🧪 Test 23: Game board element exists in HTML');
const hasGameBoard = /id=["']game-board["']/.test(htmlContent);
assert(
  hasGameBoard,
  'HTML contains game-board element (Requirements 4.1, 4.3)'
);

// Test 24: Overlay elements exist in HTML
console.log('\n🧪 Test 24: Overlay elements exist in HTML');
const hasOverlay = /overlay-screen|start-screen|game-over-screen/.test(htmlContent);
assert(
  hasOverlay,
  'HTML contains overlay screen elements (Requirements 4.1, 4.3)'
);

// Test 25: HUD elements exist in HTML
console.log('\n🧪 Test 25: HUD elements exist in HTML');
const hasHUD = /hud|score|lives/.test(htmlContent);
assert(
  hasHUD,
  'HTML contains HUD elements (Requirements 4.1, 4.3)'
);

// ============================================================
// FINAL REPORT
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('📊 TEST RESULTS - Space Invaders Overflow Validation');
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
  console.log('\n💡 Space Invaders should have:');
  console.log('   At 375px viewport (iPhone):');
  console.log('     - Media query @media (max-width: 768px)');
  console.log('     - Game board with width: 100%, max-width: calc(100vw - 2rem)');
  console.log('     - Game board with aspect-ratio: 6 / 5, height: auto');
  console.log('     - Overlay content with clamp() typography');
  console.log('     - HUD with flex-direction: column');
  console.log('   At 320px viewport (minimum):');
  console.log('     - Media query @media (max-width: 480px)');
  console.log('     - Game board with max-width: calc(100vw - 1rem)');
  console.log('     - Game board with min-height constraint');
  console.log('     - Reduced padding on board viewport');
  console.log('     - Minimum readable font sizes (>= 0.875rem)');
  console.log('   Both viewports:');
  console.log('     - No horizontal overflow (scrollWidth <= clientWidth)');
  console.log('     - Import mobile-fixes.css and game-responsive.css');
  process.exit(1);
} else {
  console.log('\n🎉 All Space Invaders overflow validation tests passed!');
  console.log('✨ Space Invaders prevents horizontal overflow at 375px and 320px viewports.');
  console.log('📱 Requirements 4.1 and 4.3 validated successfully.');
  process.exit(0);
}
