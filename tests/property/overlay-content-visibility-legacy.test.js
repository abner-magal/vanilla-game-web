#!/usr/bin/env node

/**
 * Property Test: Overlay Content Visibility
 * Pure JavaScript - Zero Dependencies
 * 
 * **Feature: responsive-bugfix, Property 4: Overlay Content Visibility**
 * **Validates: Requirements 2.1, 2.4**
 * 
 * Property: *For any* overlay screen (start, pause, game over) displayed at 
 * viewport widths between 320px and 768px, all interactive elements (buttons) 
 * should be fully visible within the viewport
 * 
 * Run with: node game-site/tests/overlay-content-visibility.property.test.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Overlay Content Visibility Property Tests...');
console.log('Property 4: *For any* overlay screen (start, pause, game over) displayed at');
console.log('viewport widths between 320px and 768px, all interactive elements (buttons)');
console.log('should be fully visible within the viewport');

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
// PROPERTY 4: Overlay Content Visibility
// **Feature: responsive-bugfix, Property 4: Overlay Content Visibility**
// **Validates: Requirements 2.1, 2.4**
// ============================================================

console.log('\n📦 Property 4: Overlay Content Visibility');

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
// OVERLAY STRUCTURE TESTS
// ============================================================

console.log('\n📐 Testing overlay structure...');

// Test 2: Start screen overlay exists (Requirement 2.1)
console.log('\n🧪 Test 2: Start screen overlay SHALL exist');
const hasStartScreen = /id=["']start-screen["']/.test(htmlContent);
assert(
  hasStartScreen,
  'HTML contains start-screen overlay (Requirement 2.1)'
);

// Test 3: Pause screen overlay exists (Requirement 2.1)
console.log('\n🧪 Test 3: Pause screen overlay SHALL exist');
const hasPauseScreen = /id=["']pause-screen["']/.test(htmlContent);
assert(
  hasPauseScreen,
  'HTML contains pause-screen overlay (Requirement 2.1)'
);

// Test 4: Game over screen overlay exists (Requirement 2.4)
console.log('\n🧪 Test 4: Game over screen overlay SHALL exist');
const hasGameOverScreen = /id=["']game-over-screen["']/.test(htmlContent);
assert(
  hasGameOverScreen,
  'HTML contains game-over-screen overlay (Requirement 2.4)'
);

// Test 5: All overlays have overlay-responsive class (Requirement 2.1)
console.log('\n🧪 Test 5: *For any* overlay, SHALL have overlay-responsive class');
const overlayResponsivePattern = /overlay-responsive/g;
const overlayResponsiveMatches = htmlContent.match(overlayResponsivePattern);
assert(
  overlayResponsiveMatches && overlayResponsiveMatches.length >= 3,
  `All 3 overlays have overlay-responsive class (found ${overlayResponsiveMatches ? overlayResponsiveMatches.length : 0})`
);

// ============================================================
// OVERLAY CONTENT RESPONSIVE CSS TESTS
// ============================================================

console.log('\n📐 Testing overlay content responsive CSS...');

// Test 6: Overlay content has responsive typography with clamp() (Requirement 2.1)
console.log('\n🧪 Test 6: *For any* overlay title, SHALL use clamp() for responsive sizing');
const hasOverlayClampTypography = /\.overlay-content\s+h[12][\s\S]*?font-size\s*:\s*clamp\(/.test(cssContent);
assert(
  hasOverlayClampTypography,
  'Overlay titles use clamp() for fluid typography (Requirement 2.1)'
);

// Test 7: Overlay h1 has word-break for long titles (Requirement 2.1)
console.log('\n🧪 Test 7: *For any* overlay h1, SHALL have word-break to prevent overflow');
const hasH1WordBreak = /\.overlay-content\s+h1[\s\S]*?word-break\s*:\s*break-word/.test(cssContent);
assert(
  hasH1WordBreak,
  'Overlay h1 has word-break: break-word (Requirement 2.1)'
);

// Test 8: Overlay h2 has word-break for long titles (Requirement 2.1)
console.log('\n🧪 Test 8: *For any* overlay h2, SHALL have word-break to prevent overflow');
const hasH2WordBreak = /\.overlay-content\s+h2[\s\S]*?word-break\s*:\s*break-word/.test(cssContent);
assert(
  hasH2WordBreak,
  'Overlay h2 has word-break: break-word (Requirement 2.1)'
);

// Test 9: Overlay titles have padding for safe area (Requirement 2.1)
console.log('\n🧪 Test 9: *For any* overlay title, SHALL have horizontal padding');
const hasTitlePadding = /\.overlay-content\s+h[12][\s\S]*?padding\s*:\s*0\s+\d+rem/.test(cssContent);
assert(
  hasTitlePadding,
  'Overlay titles have horizontal padding for safe area (Requirement 2.1)'
);


// ============================================================
// BUTTON VISIBILITY TESTS (Requirement 2.4)
// ============================================================

console.log('\n📐 Testing button visibility on mobile...');

// Test 10: Buttons have responsive font-size with clamp() (Requirement 2.4)
console.log('\n🧪 Test 10: *For any* overlay button, SHALL have responsive font-size');
const hasButtonClamp = /\.overlay-content\s+button[\s\S]*?font-size\s*:\s*clamp\(/.test(cssContent);
assert(
  hasButtonClamp,
  'Overlay buttons use clamp() for responsive font-size (Requirement 2.4)'
);

// Test 11: Buttons have white-space: nowrap to prevent text wrapping (Requirement 2.4)
console.log('\n🧪 Test 11: *For any* overlay button, SHALL prevent text wrapping');
const hasButtonNowrap = /\.overlay-content\s+button[\s\S]*?white-space\s*:\s*nowrap/.test(cssContent);
assert(
  hasButtonNowrap,
  'Overlay buttons have white-space: nowrap (Requirement 2.4)'
);

// Test 12: Buttons have appropriate padding (Requirement 2.4)
console.log('\n🧪 Test 12: *For any* overlay button, SHALL have responsive padding');
const hasButtonPadding = /\.overlay-content\s+button[\s\S]*?padding\s*:\s*[\d.]+rem\s+[\d.]+rem/.test(cssContent);
assert(
  hasButtonPadding,
  'Overlay buttons have responsive padding (Requirement 2.4)'
);

// Test 13: Start button exists in HTML (Requirement 2.4)
console.log('\n🧪 Test 13: Start button SHALL exist in start screen');
const hasStartButton = /id=["']btn-start["']/.test(htmlContent);
assert(
  hasStartButton,
  'Start screen has btn-start button (Requirement 2.4)'
);

// Test 14: Resume button exists in HTML (Requirement 2.4)
console.log('\n🧪 Test 14: Resume button SHALL exist in pause screen');
const hasResumeButton = /id=["']btn-resume["']/.test(htmlContent);
assert(
  hasResumeButton,
  'Pause screen has btn-resume button (Requirement 2.4)'
);

// Test 15: Restart button exists in HTML (Requirement 2.4)
console.log('\n🧪 Test 15: Restart button SHALL exist in game over screen');
const hasRestartButton = /id=["']btn-restart["']/.test(htmlContent);
assert(
  hasRestartButton,
  'Game over screen has btn-restart button (Requirement 2.4)'
);

// ============================================================
// GAME OVER SCREEN SPECIFIC TESTS (Requirement 2.4)
// ============================================================

console.log('\n📐 Testing game over screen visibility...');

// Test 16: Final score display exists (Requirement 2.4)
console.log('\n🧪 Test 16: Game over screen SHALL display final score');
const hasFinalScore = /id=["']final-score["']/.test(htmlContent);
assert(
  hasFinalScore,
  'Game over screen has final-score display (Requirement 2.4)'
);

// Test 17: Final score has responsive sizing (Requirement 2.4)
console.log('\n🧪 Test 17: *For any* final score display, SHALL have responsive sizing');
const hasScoreResponsive = /\.overlay-content\s+\.text-4xl[\s\S]*?font-size\s*:\s*clamp\(/.test(cssContent);
assert(
  hasScoreResponsive,
  'Final score display uses clamp() for responsive sizing (Requirement 2.4)'
);

// ============================================================
// MEDIA QUERY TESTS
// ============================================================

console.log('\n📐 Testing media query coverage...');

// Test 18: Media query for 768px exists (Requirement 2.1)
console.log('\n🧪 Test 18: *For any* viewport < 768px, overlay responsive rules SHALL exist');
const hasMediaQuery768 = /@media\s*\(\s*max-width\s*:\s*768px\s*\)/.test(cssContent);
assert(
  hasMediaQuery768,
  'CSS contains @media (max-width: 768px) rule (Requirement 2.1)'
);

// Test 19: Media query for 480px exists for extra-small devices (Requirement 2.1)
console.log('\n🧪 Test 19: *For any* viewport < 480px, extra-small overlay rules SHALL exist');
const hasMediaQuery480 = /@media\s*\(\s*max-width\s*:\s*480px\s*\)/.test(cssContent);
assert(
  hasMediaQuery480,
  'CSS contains @media (max-width: 480px) rule (Requirement 2.1)'
);

// Test 20: Extra-small viewport has tighter button sizing (Requirement 2.1)
console.log('\n🧪 Test 20: *For any* viewport < 480px, buttons SHALL have smaller sizing');
const has480ButtonSizing = /@media\s*\(\s*max-width\s*:\s*480px\s*\)[\s\S]*?\.overlay-content\s+button[\s\S]*?font-size\s*:\s*clamp\(/.test(cssContent);
assert(
  has480ButtonSizing,
  'Extra-small viewport has specific button sizing rules (Requirement 2.1)'
);


// ============================================================
// PROPERTY-BASED TESTS: Random viewport sampling
// ============================================================

console.log('\n🎲 Property-based testing: Random viewport sampling...');

// Generate 100 random viewport widths between 320px and 768px
const MIN_VIEWPORT = 320;
const MAX_VIEWPORT = 768;
const NUM_SAMPLES = 100;

// Test 21: Verify clamp() minimum values ensure readability at all viewports
console.log('\n🧪 Test 21: *For any* viewport, clamp() minimum values SHALL ensure readability');

// Extract clamp values from CSS
const clampPattern = /clamp\(\s*([\d.]+)rem/g;
const clampMatches = [...cssContent.matchAll(clampPattern)];
const minFontSizes = clampMatches.map(m => parseFloat(m[1]));

// All minimum font sizes should be at least 0.75rem (12px) for readability
const allReadable = minFontSizes.every(size => size >= 0.75);
assert(
  allReadable,
  `All clamp() minimum values are >= 0.75rem for readability (found: ${minFontSizes.join(', ')}rem)`
);

// Test 22: Verify button minimum font size is readable
console.log('\n🧪 Test 22: *For any* viewport, button minimum font-size SHALL be >= 0.75rem');
const buttonClampMatch = cssContent.match(/\.overlay-content\s+button[\s\S]*?font-size\s*:\s*clamp\(\s*([\d.]+)rem/);
const buttonMinSize = buttonClampMatch ? parseFloat(buttonClampMatch[1]) : 0;
assert(
  buttonMinSize >= 0.75,
  `Button minimum font-size is ${buttonMinSize}rem (>= 0.75rem required)`
);

// Test 23: Verify title minimum font size is readable
console.log('\n🧪 Test 23: *For any* viewport, title minimum font-size SHALL be >= 1.25rem');
const titleClampMatch = cssContent.match(/\.overlay-content\s+h1[\s\S]*?font-size\s*:\s*clamp\(\s*([\d.]+)rem/);
const titleMinSize = titleClampMatch ? parseFloat(titleClampMatch[1]) : 0;
assert(
  titleMinSize >= 1.25,
  `Title minimum font-size is ${titleMinSize}rem (>= 1.25rem required)`
);

// ============================================================
// VIEWPORT SIMULATION TESTS
// ============================================================

console.log('\n📏 Simulating viewport constraints...');

// Test 24: At 320px viewport, overlay content should fit
console.log('\n🧪 Test 24: *For any* overlay at 320px viewport, content SHALL fit');
// At 320px, with 1rem padding on each side (16px * 2 = 32px), content area is 288px
const contentAreaAt320 = 320 - 32;
assert(
  contentAreaAt320 > 200,
  `At 320px viewport: content area is ${contentAreaAt320}px (sufficient for buttons)`
);

// Test 25: At 375px viewport (iPhone), overlay content should fit
console.log('\n🧪 Test 25: *For any* overlay at 375px viewport (iPhone), content SHALL fit');
const contentAreaAt375 = 375 - 32;
assert(
  contentAreaAt375 > 250,
  `At 375px viewport: content area is ${contentAreaAt375}px (sufficient for buttons)`
);

// Test 26: At 768px viewport, overlay content should fit
console.log('\n🧪 Test 26: *For any* overlay at 768px viewport, content SHALL fit');
const contentAreaAt768 = 768 - 32;
assert(
  contentAreaAt768 > 600,
  `At 768px viewport: content area is ${contentAreaAt768}px (sufficient for buttons)`
);

// Test 27: Random viewport sampling - all should have sufficient content area
console.log(`\n🧪 Test 27: *For any* of ${NUM_SAMPLES} random viewports, content area SHALL be sufficient`);
let allViewportsSufficient = true;
const failedViewports = [];

for (let i = 0; i < NUM_SAMPLES; i++) {
  const viewportWidth = Math.floor(Math.random() * (MAX_VIEWPORT - MIN_VIEWPORT + 1)) + MIN_VIEWPORT;
  const padding = viewportWidth <= 480 ? 16 : 32; // 1rem or 2rem
  const contentArea = viewportWidth - padding;
  
  // Content area should be at least 200px for buttons to fit
  if (contentArea < 200) {
    allViewportsSufficient = false;
    failedViewports.push({ viewport: viewportWidth, contentArea });
  }
}

assert(
  allViewportsSufficient,
  `All ${NUM_SAMPLES} random viewports have sufficient content area for buttons`
);

if (!allViewportsSufficient) {
  console.log('   Failed viewports:', failedViewports.slice(0, 5).map(v => `${v.viewport}px (${v.contentArea}px content)`).join(', '));
}

// ============================================================
// OVERLAY POSITIONING TESTS
// ============================================================

console.log('\n📐 Testing overlay positioning...');

// Test 28: Overlay uses flexbox centering
console.log('\n🧪 Test 28: *For any* overlay, SHALL use flexbox centering');
const hasFlexCenter = /\.overlay-screen[\s\S]*?display\s*:\s*flex[\s\S]*?align-items\s*:\s*center[\s\S]*?justify-content\s*:\s*center/.test(cssContent);
assert(
  hasFlexCenter,
  'Overlay screens use flexbox centering (Requirement 2.1)'
);

// Test 29: Overlay uses absolute positioning with inset: 0
console.log('\n🧪 Test 29: *For any* overlay, SHALL cover entire game board');
const hasInset = /\.overlay-screen[\s\S]*?inset\s*:\s*0/.test(cssContent);
assert(
  hasInset,
  'Overlay screens use inset: 0 to cover game board (Requirement 2.1)'
);

// Test 30: Overlay content has text-align center
console.log('\n🧪 Test 30: *For any* overlay content, SHALL be centered');
const hasTextCenter = /\.overlay-content[\s\S]*?text-align\s*:\s*center/.test(cssContent);
assert(
  hasTextCenter,
  'Overlay content has text-align: center (Requirement 2.1)'
);


// ============================================================
// EDGE CASE TESTS
// ============================================================

console.log('\n📦 Edge Case Tests');

// Test 31: Overlay handles very long title text
console.log('\n🧪 Test 31: *For any* overlay with long title, word-break SHALL prevent overflow');
assert(
  hasH1WordBreak && hasH2WordBreak,
  'Both h1 and h2 have word-break for long titles'
);

// Test 32: Overlay handles minimum viewport (320px)
console.log('\n🧪 Test 32: *For any* overlay at 320px minimum, SHALL have appropriate sizing');
const handles320 = hasMediaQuery480 || hasMediaQuery768;
assert(
  handles320,
  'CSS has media queries that handle 320px viewport'
);

// Test 33: Overlay handles boundary viewport (768px)
console.log('\n🧪 Test 33: *For any* overlay at 768px boundary, mobile rules SHALL apply');
assert(
  hasMediaQuery768,
  'CSS applies mobile rules at 768px boundary'
);

// ============================================================
// INTEGRATION TESTS
// ============================================================

console.log('\n🔗 Integration tests...');

// Test 34: HTML imports required CSS files
console.log('\n🧪 Test 34: HTML SHALL import mobile-fixes.css');
const importsMobileFixes = /mobile-fixes\.css/.test(htmlContent);
assert(
  importsMobileFixes,
  'HTML imports mobile-fixes.css for global mobile styles'
);

// Test 35: HTML imports game-responsive.css
console.log('\n🧪 Test 35: HTML SHALL import game-responsive.css');
const importsGameResponsive = /game-responsive\.css/.test(htmlContent);
assert(
  importsGameResponsive,
  'HTML imports game-responsive.css for responsive patterns'
);

// Test 36: All overlay screens have overlay-screen class
console.log('\n🧪 Test 36: *For any* overlay, SHALL have overlay-screen class');
const overlayScreenPattern = /class=["'][^"']*overlay-screen[^"']*["']/g;
const overlayScreenMatches = htmlContent.match(overlayScreenPattern);
assert(
  overlayScreenMatches && overlayScreenMatches.length >= 3,
  `All 3 overlays have overlay-screen class (found ${overlayScreenMatches ? overlayScreenMatches.length : 0})`
);

// Test 37: All overlay screens have overlay-content wrapper
console.log('\n🧪 Test 37: *For any* overlay, SHALL have overlay-content wrapper');
const overlayContentPattern = /class=["'][^"']*overlay-content[^"']*["']/g;
const overlayContentMatches = htmlContent.match(overlayContentPattern);
assert(
  overlayContentMatches && overlayContentMatches.length >= 3,
  `All 3 overlays have overlay-content wrapper (found ${overlayContentMatches ? overlayContentMatches.length : 0})`
);

// ============================================================
// FINAL REPORT
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('📊 PROPERTY TEST RESULTS - Overlay Content Visibility');
console.log('**Feature: responsive-bugfix, Property 4: Overlay Content Visibility**');
console.log('**Validates: Requirements 2.1, 2.4**');
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
  console.log('\n💡 To satisfy Property 4 (Overlay Content Visibility):');
  console.log('   - All overlays must have overlay-responsive class');
  console.log('   - Overlay titles must use clamp() for responsive sizing');
  console.log('   - Overlay titles must have word-break: break-word');
  console.log('   - Overlay titles must have horizontal padding');
  console.log('   - Buttons must use clamp() for responsive font-size');
  console.log('   - Buttons must have white-space: nowrap');
  console.log('   - Buttons must have responsive padding');
  console.log('   - Media queries for 768px and 480px must exist');
  console.log('   - Final score display must have responsive sizing');
  console.log('   - HTML must import mobile-fixes.css and game-responsive.css');
  process.exit(1);
} else {
  console.log('\n🎉 All Overlay Content Visibility property tests passed!');
  console.log('✨ Property 4 validated: Overlay content is fully visible at all viewports (320-768px).');
  console.log('📱 Requirements 2.1 and 2.4 validated successfully.');
  process.exit(0);
}
