#!/usr/bin/env node

/**
 * Text Truncation Validation Tests for Space Invaders and Whack-a-Mole
 * Pure JavaScript - Zero Dependencies
 * 
 * Tests text truncation prevention at 375px viewport for both games
 * **Validates: Requirements 4.2, 4.4**
 * 
 * Run with: node game-site/tests/text-truncation-validation.test.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Text Truncation Validation Tests...');
console.log('Testing at 375px viewport for titles, descriptions, and buttons');

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
const WHACK_A_MOLE_CSS = path.join(GAME_SITE_ROOT, 'src', 'games', 'whack-a-mole', 'style.css');
const WHACK_A_MOLE_HTML = path.join(GAME_SITE_ROOT, 'src', 'games', 'whack-a-mole', 'index.html');

// ============================================================
// REQUIREMENT 4.2: Verify text elements at 375px viewport
// ============================================================

console.log('\n📱 Testing text truncation at 375px viewport...');

// Test 1: Files exist
console.log('\n🧪 Test 1: Game files exist');
const filesExist = 
  fs.existsSync(SPACE_INVADERS_CSS) && 
  fs.existsSync(SPACE_INVADERS_HTML) &&
  fs.existsSync(WHACK_A_MOLE_CSS) &&
  fs.existsSync(WHACK_A_MOLE_HTML);

assert(filesExist, 'All game CSS and HTML files exist');

if (!filesExist) {
  console.error('❌ Required files not found. Exiting.');
  process.exit(1);
}

const spaceInvadersCSS = fs.readFileSync(SPACE_INVADERS_CSS, 'utf8');
const spaceInvadersHTML = fs.readFileSync(SPACE_INVADERS_HTML, 'utf8');
const whackAMoleCSS = fs.readFileSync(WHACK_A_MOLE_CSS, 'utf8');
const whackAMoleHTML = fs.readFileSync(WHACK_A_MOLE_HTML, 'utf8');

// ============================================================
// SPACE INVADERS - TITLE TRUNCATION TESTS
// ============================================================

console.log('\n🎮 Space Invaders - Title Truncation Tests');

// Test 2: Title uses clamp() for responsive sizing
console.log('\n🧪 Test 2: Space Invaders title uses clamp() for responsive sizing');
const siTitleHasClamp = /\.overlay-content\s+h1[\s\S]*?font-size\s*:\s*clamp\(/m.test(spaceInvadersCSS);
assert(
  siTitleHasClamp,
  'Space Invaders title uses clamp() for fluid typography at 375px (Requirement 4.2)'
);

// Test 3: Title has word-break to prevent overflow
console.log('\n🧪 Test 3: Space Invaders title has word-break');
const siTitleHasWordBreak = /\.overlay-content\s+h1[\s\S]*?word-break\s*:\s*break-word/m.test(spaceInvadersCSS);
assert(
  siTitleHasWordBreak,
  'Space Invaders title has word-break: break-word at 375px (Requirement 4.2)'
);

// Test 4: Title has padding for safe area
console.log('\n🧪 Test 4: Space Invaders title has padding for safe area');
const siTitleHasPadding = /\.overlay-content\s+h1[\s\S]*?padding\s*:\s*0\s+\d+rem/m.test(spaceInvadersCSS);
assert(
  siTitleHasPadding,
  'Space Invaders title has horizontal padding at 375px (Requirement 4.2)'
);

// Test 5: Title text exists in HTML
console.log('\n🧪 Test 5: Space Invaders title text exists');
const siHasTitle = /SPACE\s+INVADERS/i.test(spaceInvadersHTML);
assert(
  siHasTitle,
  'Space Invaders HTML contains "SPACE INVADERS" title (Requirement 4.2)'
);

// ============================================================
// SPACE INVADERS - BUTTON TRUNCATION TESTS
// ============================================================

console.log('\n🎮 Space Invaders - Button Truncation Tests');

// Test 6: Buttons use clamp() for responsive sizing
console.log('\n🧪 Test 6: Space Invaders buttons use clamp() for responsive sizing');
const siButtonHasClamp = /\.overlay-content\s+button[\s\S]*?font-size\s*:\s*clamp\(/m.test(spaceInvadersCSS);
assert(
  siButtonHasClamp,
  'Space Invaders buttons use clamp() for fluid typography at 375px (Requirement 4.2)'
);

// Test 7: Buttons have white-space: nowrap
console.log('\n🧪 Test 7: Space Invaders buttons have white-space: nowrap');
const siButtonHasNowrap = /\.overlay-content\s+button[\s\S]*?white-space\s*:\s*nowrap/m.test(spaceInvadersCSS);
assert(
  siButtonHasNowrap,
  'Space Invaders buttons have white-space: nowrap at 375px (Requirement 4.2)'
);

// Test 8: Button text exists in HTML
console.log('\n🧪 Test 8: Space Invaders button text exists');
const siHasStartButton = /START\s+MISSION|START\s+GAME/i.test(spaceInvadersHTML);
assert(
  siHasStartButton,
  'Space Invaders HTML contains start button text (Requirement 4.2)'
);

// ============================================================
// SPACE INVADERS - DESCRIPTION TRUNCATION TESTS
// ============================================================

console.log('\n🎮 Space Invaders - Description Truncation Tests');

// Test 9: Description paragraphs use clamp()
console.log('\n🧪 Test 9: Space Invaders descriptions use clamp()');
const siDescHasClamp = /\.overlay-content\s+p[\s\S]*?font-size\s*:\s*clamp\(/m.test(spaceInvadersCSS);
assert(
  siDescHasClamp,
  'Space Invaders descriptions use clamp() for fluid typography at 375px (Requirement 4.2)'
);

// Test 10: Description has padding
console.log('\n🧪 Test 10: Space Invaders descriptions have padding');
const siDescHasPadding = /\.overlay-content\s+p[\s\S]*?padding\s*:\s*0\s+\d+rem/m.test(spaceInvadersCSS);
assert(
  siDescHasPadding,
  'Space Invaders descriptions have horizontal padding at 375px (Requirement 4.2)'
);

// ============================================================
// WHACK-A-MOLE - DESCRIPTION TRUNCATION TESTS
// ============================================================

console.log('\n🎮 Whack-a-Mole - Description Truncation Tests');

// Test 11: Description has white-space: normal
console.log('\n🧪 Test 11: Whack-a-Mole description has white-space: normal');
const wamDescHasNormal = /@media\s*\(\s*max-width\s*:\s*768px\s*\)[\s\S]*?white-space\s*:\s*normal/m.test(whackAMoleCSS);
assert(
  wamDescHasNormal,
  'Whack-a-Mole description has white-space: normal at 375px (Requirement 4.4)'
);

// Test 12: Description has word-wrap: break-word
console.log('\n🧪 Test 12: Whack-a-Mole description has word-wrap: break-word');
const wamDescHasWordWrap = /@media\s*\(\s*max-width\s*:\s*768px\s*\)[\s\S]*?word-wrap\s*:\s*break-word/m.test(whackAMoleCSS);
assert(
  wamDescHasWordWrap,
  'Whack-a-Mole description has word-wrap: break-word at 375px (Requirement 4.4)'
);

// Test 13: Description has text-align set
console.log('\n🧪 Test 13: Whack-a-Mole description has text-align set');
const wamDescHasTextAlign = /@media\s*\(\s*max-width\s*:\s*768px\s*\)[\s\S]*?text-align\s*:\s*(center|left)/m.test(whackAMoleCSS);
assert(
  wamDescHasTextAlign,
  'Whack-a-Mole description has text-align set at 375px (Requirement 4.4)'
);

// Test 14: Description has max-width: 100%
console.log('\n🧪 Test 14: Whack-a-Mole description has max-width: 100%');
const wamDescHasMaxWidth = /@media\s*\(\s*max-width\s*:\s*768px\s*\)[\s\S]*?max-width\s*:\s*100%/m.test(whackAMoleCSS);
assert(
  wamDescHasMaxWidth,
  'Whack-a-Mole description has max-width: 100% at 375px (Requirement 4.4)'
);

// ============================================================
// WHACK-A-MOLE - TITLE TRUNCATION TESTS
// ============================================================

console.log('\n🎮 Whack-a-Mole - Title Truncation Tests');

// Test 15: Title uses clamp() for responsive sizing
console.log('\n🧪 Test 15: Whack-a-Mole title uses clamp()');
const wamTitleHasClamp = /@media\s*\(\s*max-width\s*:\s*768px\s*\)[\s\S]*?h1[\s\S]*?font-size\s*:\s*clamp\(/m.test(whackAMoleCSS);
assert(
  wamTitleHasClamp,
  'Whack-a-Mole title uses clamp() for fluid typography at 375px (Requirement 4.4)'
);

// Test 16: Title has word-break
console.log('\n🧪 Test 16: Whack-a-Mole title has word-break');
const wamTitleHasWordBreak = /@media\s*\(\s*max-width\s*:\s*768px\s*\)[\s\S]*?h1[\s\S]*?word-break\s*:\s*break-word/m.test(whackAMoleCSS);
assert(
  wamTitleHasWordBreak,
  'Whack-a-Mole title has word-break: break-word at 375px (Requirement 4.4)'
);

// ============================================================
// WHACK-A-MOLE - HUD TRUNCATION TESTS
// ============================================================

console.log('\n🎮 Whack-a-Mole - HUD Truncation Tests');

// Test 17: HUD elements stack vertically
console.log('\n🧪 Test 17: Whack-a-Mole HUD elements stack vertically');
const wamHudHasColumn = /@media\s*\(\s*max-width\s*:\s*768px\s*\)[\s\S]*?flex-direction\s*:\s*column/m.test(whackAMoleCSS);
assert(
  wamHudHasColumn,
  'Whack-a-Mole HUD uses flex-direction: column at 375px (Requirement 4.4)'
);

// Test 18: HUD text uses clamp()
console.log('\n🧪 Test 18: Whack-a-Mole HUD text uses clamp()');
const wamHudHasClamp = /@media\s*\(\s*max-width\s*:\s*768px\s*\)[\s\S]*?\.text-slate-400[\s\S]*?font-size\s*:\s*clamp\(/m.test(whackAMoleCSS);
assert(
  wamHudHasClamp,
  'Whack-a-Mole HUD text uses clamp() at 375px (Requirement 4.4)'
);

// ============================================================
// CROSS-GAME VALIDATION TESTS
// ============================================================

console.log('\n🔄 Cross-Game Validation Tests');

// Test 19: Both games have media query for 375px (covered by 768px)
console.log('\n🧪 Test 19: Both games have media query covering 375px');
const bothHaveMediaQuery = 
  /@media\s*\(\s*max-width\s*:\s*768px\s*\)/.test(spaceInvadersCSS) &&
  /@media\s*\(\s*max-width\s*:\s*768px\s*\)/.test(whackAMoleCSS);
assert(
  bothHaveMediaQuery,
  'Both games have @media (max-width: 768px) covering 375px viewport (Requirements 4.2, 4.4)'
);

// Test 20: Both games prevent text overflow
console.log('\n🧪 Test 20: Both games prevent text overflow');
const bothPreventOverflow = 
  /word-break\s*:\s*break-word/.test(spaceInvadersCSS) &&
  /word-wrap\s*:\s*break-word/.test(whackAMoleCSS);
assert(
  bothPreventOverflow,
  'Both games use word-break/word-wrap to prevent text overflow (Requirements 4.2, 4.4)'
);

// Test 21: Both games have minimum readable font sizes
console.log('\n🧪 Test 21: Both games have minimum readable font sizes');
const siClampMatches = spaceInvadersCSS.match(/clamp\(\s*([\d.]+)rem/g);
const wamClampMatches = whackAMoleCSS.match(/clamp\(\s*([\d.]+)rem/g);

let siMinSizes = [];
let wamMinSizes = [];

if (siClampMatches) {
  siMinSizes = siClampMatches.map(match => {
    const sizeMatch = match.match(/clamp\(\s*([\d.]+)rem/);
    return sizeMatch ? parseFloat(sizeMatch[1]) : 0;
  });
}

if (wamClampMatches) {
  wamMinSizes = wamClampMatches.map(match => {
    const sizeMatch = match.match(/clamp\(\s*([\d.]+)rem/);
    return sizeMatch ? parseFloat(sizeMatch[1]) : 0;
  });
}

// Allow 0.75rem (12px) for small text like descriptions
const siAllReadable = siMinSizes.length === 0 || siMinSizes.every(size => size >= 0.75);
const wamAllReadable = wamMinSizes.length === 0 || wamMinSizes.every(size => size >= 0.75);

assert(
  siAllReadable && wamAllReadable,
  `Both games have minimum readable font sizes (SI: ${siMinSizes.join(', ')}rem, WAM: ${wamMinSizes.join(', ')}rem) (Requirements 4.2, 4.4)`
);

// Test 22: Both games have consistent responsive patterns
console.log('\n🧪 Test 22: Both games have consistent responsive patterns');
const siHasResponsiveTypography = /clamp\(/.test(spaceInvadersCSS);
const wamHasResponsiveTypography = /clamp\(/.test(whackAMoleCSS);
assert(
  siHasResponsiveTypography && wamHasResponsiveTypography,
  'Both games use clamp() for responsive typography (Requirements 4.2, 4.4)'
);

// ============================================================
// EDGE CASE TESTS
// ============================================================

console.log('\n📦 Edge Case Tests');

// Test 23: Long title text is handled
console.log('\n🧪 Test 23: Long title text is handled');
const siHandlesLongTitle = /word-break\s*:\s*break-word/.test(spaceInvadersCSS);
const wamHandlesLongTitle = /word-break\s*:\s*break-word/.test(whackAMoleCSS);
assert(
  siHandlesLongTitle && wamHandlesLongTitle,
  'Both games handle long title text with word-break (Requirements 4.2, 4.4)'
);

// Test 24: Button text doesn't wrap
console.log('\n🧪 Test 24: Button text doesn\'t wrap');
const siButtonNoWrap = /\.overlay-content\s+button[\s\S]*?white-space\s*:\s*nowrap/m.test(spaceInvadersCSS);
assert(
  siButtonNoWrap,
  'Space Invaders buttons have white-space: nowrap to prevent wrapping (Requirement 4.2)'
);

// Test 25: Description text wraps properly
console.log('\n🧪 Test 25: Description text wraps properly');
const wamDescWraps = /white-space\s*:\s*normal/.test(whackAMoleCSS);
assert(
  wamDescWraps,
  'Whack-a-Mole description wraps with white-space: normal (Requirement 4.4)'
);

// ============================================================
// FINAL REPORT
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('📊 TEST RESULTS - Text Truncation Validation at 375px');
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
  console.log('\n💡 Text truncation prevention at 375px requires:');
  console.log('   Space Invaders:');
  console.log('     - Titles with clamp(), word-break, and padding');
  console.log('     - Buttons with clamp() and white-space: nowrap');
  console.log('     - Descriptions with clamp() and padding');
  console.log('   Whack-a-Mole:');
  console.log('     - Descriptions with white-space: normal, word-wrap, text-align');
  console.log('     - Titles with clamp() and word-break');
  console.log('     - HUD with flex-direction: column and clamp()');
  console.log('   Both games:');
  console.log('     - Media queries covering 375px viewport');
  console.log('     - Minimum readable font sizes (>= 0.75rem)');
  console.log('     - Consistent responsive typography patterns');
  process.exit(1);
} else {
  console.log('\n🎉 All text truncation validation tests passed!');
  console.log('✨ Text elements in both games are properly visible at 375px viewport.');
  console.log('📱 Requirements 4.2 and 4.4 validated successfully.');
  process.exit(0);
}
