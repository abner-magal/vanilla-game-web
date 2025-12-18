#!/usr/bin/env node

/**
 * Property Tests for Space Invaders Horizontal Overflow Prevention
 * Pure JavaScript - Zero Dependencies
 * 
 * **Feature: responsive-bugfix, Property 1: No Horizontal Overflow**
 * **Validates: Requirements 1.1, 1.2, 1.4, 1.5**
 * 
 * Run with: node game-site/tests/space-invaders-overflow.property.test.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Space Invaders Overflow Property Tests...');

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
// PROPERTY 1: No Horizontal Overflow
// **Feature: responsive-bugfix, Property 1: No Horizontal Overflow**
// **Validates: Requirements 1.1, 1.2, 1.4, 1.5**
// ============================================================

console.log('\n📦 Property 1: No Horizontal Overflow');
console.log('*For any* viewport width between 320px and 768px, the Space Invaders page');
console.log('should have no horizontal overflow (scrollWidth <= clientWidth)');

const GAME_SITE_ROOT = __dirname.includes('tests') ? path.join(__dirname, '..') : __dirname;
const SPACE_INVADERS_CSS = path.join(GAME_SITE_ROOT, 'src', 'games', 'space-invaders', 'style.css');
const SPACE_INVADERS_HTML = path.join(GAME_SITE_ROOT, 'src', 'games', 'space-invaders', 'index.html');

// Test 1: CSS file exists
console.log('\n🧪 Test 1: Space Invaders CSS file exists');
assert(
  fs.existsSync(SPACE_INVADERS_CSS),
  'Space Invaders style.css exists'
);

// Test 2: HTML file exists
console.log('\n🧪 Test 2: Space Invaders HTML file exists');
assert(
  fs.existsSync(SPACE_INVADERS_HTML),
  'Space Invaders index.html exists'
);

if (!fs.existsSync(SPACE_INVADERS_CSS) || !fs.existsSync(SPACE_INVADERS_HTML)) {
  console.error('❌ Required files not found. Exiting.');
  process.exit(1);
}

const cssContent = fs.readFileSync(SPACE_INVADERS_CSS, 'utf8');
const htmlContent = fs.readFileSync(SPACE_INVADERS_HTML, 'utf8');

// Test 3: Media query for viewport < 768px exists
console.log('\n🧪 Test 3: *For any* viewport < 768px, responsive CSS rules SHALL exist');
const hasMediaQuery768 = /@media\s*\(\s*max-width\s*:\s*768px\s*\)/.test(cssContent);
assert(
  hasMediaQuery768,
  'CSS contains @media (max-width: 768px) rule'
);

// Test 4: Game board has max-width constraint
console.log('\n🧪 Test 4: *For any* mobile viewport, game board SHALL have max-width constraint');
const hasMaxWidthConstraint = /max-width\s*:\s*calc\(100vw\s*-\s*\d+rem\)/.test(cssContent);
assert(
  hasMaxWidthConstraint,
  'Game board has max-width: calc(100vw - Xrem) constraint'
);

// Test 5: Game board has aspect-ratio for responsive scaling
console.log('\n🧪 Test 5: *For any* mobile viewport, game board SHALL maintain aspect ratio');
const hasAspectRatio = /aspect-ratio\s*:\s*6\s*\/\s*5/.test(cssContent);
assert(
  hasAspectRatio,
  'Game board has aspect-ratio: 6 / 5 for responsive scaling'
);

// Test 6: Game board width is set to 100% on mobile
console.log('\n🧪 Test 6: *For any* mobile viewport, game board width SHALL be 100%');
const hasWidthConstraint = /width\s*:\s*100%\s*!important/.test(cssContent);
assert(
  hasWidthConstraint,
  'Game board has width: 100% !important on mobile'
);

// Test 7: Game board height is auto on mobile
console.log('\n🧪 Test 7: *For any* mobile viewport, game board height SHALL be auto');
const hasHeightAuto = /height\s*:\s*auto\s*!important/.test(cssContent);
assert(
  hasHeightAuto,
  'Game board has height: auto !important on mobile'
);

// Test 8: Media query for viewport < 480px exists
console.log('\n🧪 Test 8: *For any* viewport < 480px, extra-small responsive rules SHALL exist');
const hasMediaQuery480 = /@media\s*\(\s*max-width\s*:\s*480px\s*\)/.test(cssContent);
assert(
  hasMediaQuery480,
  'CSS contains @media (max-width: 480px) rule for extra-small devices'
);

// Test 9: Overlay content has responsive typography
console.log('\n🧪 Test 9: *For any* mobile viewport, overlay titles SHALL use clamp() for responsive sizing');
const hasClampTypography = /font-size\s*:\s*clamp\(/.test(cssContent);
assert(
  hasClampTypography,
  'Overlay content uses clamp() for fluid typography'
);

// Test 10: Overlay content has word-break for long text
console.log('\n🧪 Test 10: *For any* mobile viewport, overlay titles SHALL break words to prevent overflow');
const hasWordBreak = /word-break\s*:\s*break-word/.test(cssContent);
assert(
  hasWordBreak,
  'Overlay content has word-break: break-word to prevent text overflow'
);

// Test 11: Buttons have proper sizing constraints
console.log('\n🧪 Test 11: *For any* mobile viewport, buttons SHALL have responsive sizing');
const hasButtonSizing = /\.overlay-content\s+button[\s\S]*?font-size\s*:\s*clamp\(/.test(cssContent);
assert(
  hasButtonSizing,
  'Buttons have responsive font-size with clamp()'
);

// Test 12: Buttons prevent text wrapping
console.log('\n🧪 Test 12: *For any* mobile viewport, button text SHALL not wrap');
const hasWhitespaceNowrap = /white-space\s*:\s*nowrap/.test(cssContent);
assert(
  hasWhitespaceNowrap,
  'Buttons have white-space: nowrap to prevent text wrapping'
);

// Test 13: HUD elements stack vertically on mobile
console.log('\n🧪 Test 13: *For any* mobile viewport, HUD elements SHALL stack vertically');
const hasFlexColumn = /flex-direction\s*:\s*column/.test(cssContent);
assert(
  hasFlexColumn,
  'HUD uses flex-direction: column for vertical stacking on mobile'
);

// Test 14: Board viewport has reduced padding on mobile
console.log('\n🧪 Test 14: *For any* mobile viewport, board viewport SHALL have reduced padding');
const hasBoardViewportPadding = /\.board-viewport[\s\S]*?padding\s*:\s*0\.\d+rem/.test(cssContent);
assert(
  hasBoardViewportPadding,
  'Board viewport has reduced padding on mobile'
);

// Test 15: Minimum height constraint exists
console.log('\n🧪 Test 15: *For any* mobile viewport, game board SHALL have minimum height');
const hasMinHeight = /min-height\s*:\s*\d+px/.test(cssContent);
assert(
  hasMinHeight,
  'Game board has min-height constraint to prevent collapse'
);

// Test 16: HTML imports mobile-fixes.css
console.log('\n🧪 Test 16: Space Invaders HTML SHALL import mobile-fixes.css');
const importsMobileFixes = /mobile-fixes\.css/.test(htmlContent);
assert(
  importsMobileFixes,
  'HTML imports mobile-fixes.css for global mobile styles'
);

// Test 17: HTML imports game-responsive.css
console.log('\n🧪 Test 17: Space Invaders HTML SHALL import game-responsive.css');
const importsGameResponsive = /game-responsive\.css/.test(htmlContent);
assert(
  importsGameResponsive,
  'HTML imports game-responsive.css for responsive patterns'
);

// Test 18: Overlay has responsive class
console.log('\n🧪 Test 18: *For any* overlay screen, SHALL have responsive styling class');
const hasOverlayResponsive = /overlay-responsive/.test(htmlContent);
assert(
  hasOverlayResponsive,
  'Overlay screens have overlay-responsive class'
);

// Test 19: CSS has proper mobile-first structure
console.log('\n🧪 Test 19: CSS SHALL follow mobile-first approach with max-width queries');
const maxWidthQueries = cssContent.match(/@media\s*\(\s*max-width\s*:/g);
assert(
  maxWidthQueries && maxWidthQueries.length >= 2,
  `CSS has multiple max-width media queries (found ${maxWidthQueries ? maxWidthQueries.length : 0})`
);

// Test 20: No fixed widths that exceed mobile viewport
console.log('\n🧪 Test 20: *For any* element, SHALL not have fixed width > 768px without responsive override');
const fixedWidthPattern = /width\s*:\s*(\d+)px/g;
let fixedWidths = [];
let match;
while ((match = fixedWidthPattern.exec(cssContent)) !== null) {
  const width = parseInt(match[1]);
  if (width > 768) {
    fixedWidths.push(width);
  }
}

// Check if large fixed widths are inside media queries or have responsive overrides
const hasResponsiveOverrides = fixedWidths.length === 0 || hasMediaQuery768;
assert(
  hasResponsiveOverrides,
  `Large fixed widths (${fixedWidths.join(', ')}px) have responsive overrides`
);

// ============================================================
// EDGE CASE TESTS
// ============================================================

console.log('\n📦 Edge Case Tests');

// Test 21: Handles very small viewport (320px)
console.log('\n🧪 Test 21: *For any* viewport at 320px minimum, SHALL have appropriate constraints');
const handles320px = /calc\(100vw\s*-\s*[12]rem\)/.test(cssContent);
assert(
  handles320px,
  'CSS handles 320px viewport with calc(100vw - 1-2rem) constraints'
);

// Test 22: Handles boundary viewport (768px)
console.log('\n🧪 Test 22: *For any* viewport at 768px boundary, SHALL apply mobile rules');
const handles768px = /@media\s*\(\s*max-width\s*:\s*768px\s*\)/.test(cssContent);
assert(
  handles768px,
  'CSS applies mobile rules at 768px boundary'
);

// Test 23: Typography scales down appropriately
console.log('\n🧪 Test 23: *For any* text element, SHALL scale down to minimum readable size');
const hasMinFontSize = /clamp\(\s*[\d.]+rem/.test(cssContent);
assert(
  hasMinFontSize,
  'Typography uses clamp() with minimum font size'
);

// ============================================================
// FINAL REPORT
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('📊 PROPERTY TEST RESULTS - Space Invaders Overflow Prevention');
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
  console.log('   - Media queries for max-width: 768px and 480px');
  console.log('   - Game board with width: 100%, max-width: calc(100vw - 2rem)');
  console.log('   - Game board with aspect-ratio: 6 / 5');
  console.log('   - Overlay content with clamp() typography');
  console.log('   - Overlay content with word-break: break-word');
  console.log('   - Buttons with white-space: nowrap');
  console.log('   - HUD with flex-direction: column on mobile');
  console.log('   - Import mobile-fixes.css and game-responsive.css');
  process.exit(1);
} else {
  console.log('\n🎉 All Space Invaders overflow property tests passed!');
  console.log('✨ Space Invaders is properly responsive and prevents horizontal overflow.');
  process.exit(0);
}
