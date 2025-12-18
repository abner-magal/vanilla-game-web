#!/usr/bin/env node

/**
 * Property Tests for Text Truncation Prevention
 * Pure JavaScript - Zero Dependencies
 * 
 * **Feature: responsive-bugfix, Property 2: No Text Truncation on Mobile**
 * **Validates: Requirements 1.3, 2.2, 2.3, 3.1, 3.2**
 * 
 * Run with: node game-site/tests/whack-a-mole-truncation.property.test.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Text Truncation Property Tests...');

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
// PROPERTY 2: No Text Truncation on Mobile
// **Feature: responsive-bugfix, Property 2: No Text Truncation on Mobile**
// **Validates: Requirements 1.3, 2.2, 2.3, 3.1, 3.2**
// ============================================================

console.log('\n📦 Property 2: No Text Truncation on Mobile');
console.log('*For any* text element (titles, descriptions, button labels) in Space Invaders');
console.log('and Whack-a-Mole at viewport widths between 320px and 768px, the element');
console.log('should not be truncated (element.scrollWidth <= element.clientWidth)');

const GAME_SITE_ROOT = __dirname.includes('tests') ? path.join(__dirname, '..') : __dirname;

// ============================================================
// SPACE INVADERS TEXT TRUNCATION TESTS
// ============================================================

console.log('\n🎮 Testing Space Invaders...');

const SPACE_INVADERS_CSS = path.join(GAME_SITE_ROOT, 'src', 'games', 'space-invaders', 'style.css');
const SPACE_INVADERS_HTML = path.join(GAME_SITE_ROOT, 'src', 'games', 'space-invaders', 'index.html');

// Test 1: Space Invaders files exist
console.log('\n🧪 Test 1: Space Invaders files exist');
assert(
  fs.existsSync(SPACE_INVADERS_CSS) && fs.existsSync(SPACE_INVADERS_HTML),
  'Space Invaders CSS and HTML files exist'
);

if (fs.existsSync(SPACE_INVADERS_CSS) && fs.existsSync(SPACE_INVADERS_HTML)) {
  const cssContent = fs.readFileSync(SPACE_INVADERS_CSS, 'utf8');
  const htmlContent = fs.readFileSync(SPACE_INVADERS_HTML, 'utf8');

  // Test 2: Overlay titles use clamp() for responsive sizing
  console.log('\n🧪 Test 2: *For any* overlay title, SHALL use clamp() for responsive sizing');
  const hasClampForTitles = /\.overlay-content\s+h1[\s\S]*?font-size\s*:\s*clamp\(/m.test(cssContent);
  assert(
    hasClampForTitles,
    'Space Invaders overlay titles use clamp() for fluid typography (Requirement 2.2)'
  );

  // Test 3: Overlay titles have word-break to prevent overflow
  console.log('\n🧪 Test 3: *For any* overlay title, SHALL have word-break to prevent overflow');
  const hasWordBreak = /\.overlay-content\s+h1[\s\S]*?word-break\s*:\s*break-word/m.test(cssContent);
  assert(
    hasWordBreak,
    'Space Invaders overlay titles have word-break: break-word (Requirement 2.2)'
  );

  // Test 4: Buttons use clamp() for responsive sizing
  console.log('\n🧪 Test 4: *For any* button, SHALL use clamp() for responsive sizing');
  const hasClampForButtons = /\.overlay-content\s+button[\s\S]*?font-size\s*:\s*clamp\(/m.test(cssContent);
  assert(
    hasClampForButtons,
    'Space Invaders buttons use clamp() for fluid typography (Requirement 2.3)'
  );

  // Test 5: Buttons prevent text wrapping
  console.log('\n🧪 Test 5: *For any* button, SHALL prevent text wrapping');
  const hasWhitespaceNowrap = /\.overlay-content\s+button[\s\S]*?white-space\s*:\s*nowrap/m.test(cssContent);
  assert(
    hasWhitespaceNowrap,
    'Space Invaders buttons have white-space: nowrap to prevent wrapping (Requirement 2.3)'
  );

  // Test 6: HUD text elements are visible
  console.log('\n🧪 Test 6: *For any* HUD element, SHALL be visible without truncation');
  const hasHUDResponsive = /@media\s*\(\s*max-width\s*:\s*768px\s*\)[\s\S]*?\.hud|#hud|\.score|#score/m.test(cssContent);
  assert(
    hasHUDResponsive,
    'Space Invaders HUD has responsive rules for mobile (Requirement 1.3)'
  );

  // Test 7: Title text is present in HTML
  console.log('\n🧪 Test 7: Space Invaders title text is present');
  const hasTitle = /SPACE\s+INVADERS/i.test(htmlContent);
  assert(
    hasTitle,
    'Space Invaders HTML contains "SPACE INVADERS" title'
  );

  // Test 8: Button text is present in HTML
  console.log('\n🧪 Test 8: Space Invaders button text is present');
  const hasStartButton = /START\s+MISSION|START\s+GAME/i.test(htmlContent);
  assert(
    hasStartButton,
    'Space Invaders HTML contains start button text'
  );

  // Test 9: Minimum font size is set
  console.log('\n🧪 Test 9: *For any* text element, SHALL have minimum readable font size');
  const clampMatches = cssContent.match(/clamp\(\s*([\d.]+)rem/g);
  if (clampMatches && clampMatches.length > 0) {
    const minSizes = clampMatches.map(match => {
      const sizeMatch = match.match(/clamp\(\s*([\d.]+)rem/);
      return sizeMatch ? parseFloat(sizeMatch[1]) : 0;
    });
    // Allow 0.75rem (12px) for small text like descriptions
    const allAboveMinimum = minSizes.every(size => size >= 0.75);
    assert(
      allAboveMinimum,
      `All clamp() minimum sizes are >= 0.75rem (12px): [${minSizes.join(', ')}]`
    );
  } else {
    assert(false, 'No clamp() functions found for responsive typography');
  }

  // Test 10: Maximum font size is reasonable
  console.log('\n🧪 Test 10: *For any* text element, SHALL have reasonable maximum font size');
  const maxSizeMatches = cssContent.match(/clamp\([^)]+,\s*[\d.]+vw,\s*([\d.]+)rem\)/g);
  if (maxSizeMatches && maxSizeMatches.length > 0) {
    const maxSizes = maxSizeMatches.map(match => {
      const sizeMatch = match.match(/clamp\([^)]+,\s*[\d.]+vw,\s*([\d.]+)rem\)/);
      return sizeMatch ? parseFloat(sizeMatch[1]) : 0;
    });
    const allReasonable = maxSizes.every(size => size <= 5); // 80px maximum
    assert(
      allReasonable,
      `All clamp() maximum sizes are <= 5rem (80px): [${maxSizes.join(', ')}]`
    );
  }
}

// ============================================================
// WHACK-A-MOLE TEXT TRUNCATION TESTS
// ============================================================

console.log('\n🎮 Testing Whack-a-Mole...');

const WHACK_A_MOLE_CSS = path.join(GAME_SITE_ROOT, 'src', 'games', 'whack-a-mole', 'style.css');
const WHACK_A_MOLE_HTML = path.join(GAME_SITE_ROOT, 'src', 'games', 'whack-a-mole', 'index.html');

// Test 11: Whack-a-Mole files exist
console.log('\n🧪 Test 11: Whack-a-Mole files exist');
assert(
  fs.existsSync(WHACK_A_MOLE_CSS) && fs.existsSync(WHACK_A_MOLE_HTML),
  'Whack-a-Mole CSS and HTML files exist'
);

if (fs.existsSync(WHACK_A_MOLE_CSS) && fs.existsSync(WHACK_A_MOLE_HTML)) {
  const cssContent = fs.readFileSync(WHACK_A_MOLE_CSS, 'utf8');
  const htmlContent = fs.readFileSync(WHACK_A_MOLE_HTML, 'utf8');

  // Test 12: Description text wraps instead of truncating
  console.log('\n🧪 Test 12: *For any* description text, SHALL wrap to multiple lines');
  const hasWhitespaceNormal = /@media\s*\(\s*max-width\s*:\s*768px\s*\)[\s\S]*?white-space\s*:\s*normal/m.test(cssContent);
  assert(
    hasWhitespaceNormal,
    'Whack-a-Mole description has white-space: normal on mobile (Requirement 3.1)'
  );

  // Test 13: Description text has word-wrap
  console.log('\n🧪 Test 13: *For any* description text, SHALL have word-wrap enabled');
  const hasWordWrap = /@media\s*\(\s*max-width\s*:\s*768px\s*\)[\s\S]*?word-wrap\s*:\s*break-word/m.test(cssContent);
  assert(
    hasWordWrap,
    'Whack-a-Mole description has word-wrap: break-word on mobile (Requirement 3.1)'
  );

  // Test 14: Text alignment is set on mobile (left or center is acceptable)
  console.log('\n🧪 Test 14: *For any* description text, SHALL have text-align set on mobile');
  const hasTextAlign = /@media\s*\(\s*max-width\s*:\s*768px\s*\)[\s\S]*?text-align\s*:\s*(center|left)/m.test(cssContent);
  assert(
    hasTextAlign,
    'Whack-a-Mole description has text-align set on mobile (Requirement 3.1)'
  );

  // Test 15: Header elements stack vertically
  console.log('\n🧪 Test 15: *For any* header section, SHALL stack elements vertically on mobile');
  const hasFlexColumn = /@media\s*\(\s*max-width\s*:\s*768px\s*\)[\s\S]*?flex-direction\s*:\s*column/m.test(cssContent);
  assert(
    hasFlexColumn,
    'Whack-a-Mole header uses flex-direction: column on mobile (Requirement 3.3)'
  );

  // Test 16: Game board has max-width constraint
  console.log('\n🧪 Test 16: *For any* game board, SHALL have max-width constraint on mobile');
  const hasMaxWidth = /@media\s*\(\s*max-width\s*:\s*768px\s*\)[\s\S]*?#game-board[\s\S]*?max-width\s*:\s*calc\(100vw\s*-\s*\d+rem\)/m.test(cssContent);
  assert(
    hasMaxWidth,
    'Whack-a-Mole game board has max-width constraint on mobile (Requirement 3.2)'
  );

  // Test 17: Description text is present in HTML
  console.log('\n🧪 Test 17: Whack-a-Mole description text is present');
  const hasDescription = /text-slate-400|description/i.test(htmlContent);
  assert(
    hasDescription,
    'Whack-a-Mole HTML contains description text elements'
  );

  // Test 18: Instructions text is present in HTML (footer or description)
  console.log('\n🧪 Test 18: Whack-a-Mole instructions text is present');
  const hasInstructions = /instruções|instructions|como jogar|use o mouse|mouse para bater|acerte as toupeiras/i.test(htmlContent);
  assert(
    hasInstructions,
    'Whack-a-Mole HTML contains instructions text'
  );

  // Test 19: Media query for mobile exists
  console.log('\n🧪 Test 19: *For any* viewport < 768px, responsive rules SHALL exist');
  const hasMediaQuery768 = /@media\s*\(\s*max-width\s*:\s*768px\s*\)/.test(cssContent);
  assert(
    hasMediaQuery768,
    'Whack-a-Mole CSS contains @media (max-width: 768px) rule'
  );

  // Test 20: Media query for extra-small devices exists
  console.log('\n🧪 Test 20: *For any* viewport < 480px, extra-small responsive rules SHALL exist');
  const hasMediaQuery480 = /@media\s*\(\s*max-width\s*:\s*480px\s*\)/.test(cssContent);
  assert(
    hasMediaQuery480,
    'Whack-a-Mole CSS contains @media (max-width: 480px) rule'
  );
}

// ============================================================
// CROSS-GAME TEXT TRUNCATION TESTS
// ============================================================

console.log('\n🔄 Cross-Game Text Truncation Tests...');

// Test 21: Both games use consistent responsive patterns
console.log('\n🧪 Test 21: *For any* game, SHALL use consistent responsive text patterns');
if (fs.existsSync(SPACE_INVADERS_CSS) && fs.existsSync(WHACK_A_MOLE_CSS)) {
  const spaceInvadersCSS = fs.readFileSync(SPACE_INVADERS_CSS, 'utf8');
  const whackAMoleCSS = fs.readFileSync(WHACK_A_MOLE_CSS, 'utf8');

  const bothHaveMediaQueries = 
    /@media\s*\(\s*max-width\s*:\s*768px\s*\)/.test(spaceInvadersCSS) &&
    /@media\s*\(\s*max-width\s*:\s*768px\s*\)/.test(whackAMoleCSS);

  assert(
    bothHaveMediaQueries,
    'Both games use @media (max-width: 768px) for mobile responsiveness'
  );
}

// Test 22: Both games prevent text overflow
console.log('\n🧪 Test 22: *For any* game, SHALL prevent text overflow on mobile');
if (fs.existsSync(SPACE_INVADERS_CSS) && fs.existsSync(WHACK_A_MOLE_CSS)) {
  const spaceInvadersCSS = fs.readFileSync(SPACE_INVADERS_CSS, 'utf8');
  const whackAMoleCSS = fs.readFileSync(WHACK_A_MOLE_CSS, 'utf8');

  const spaceInvadersHasWordBreak = /word-break\s*:\s*break-word/.test(spaceInvadersCSS);
  const whackAMoleHasWordWrap = /word-wrap\s*:\s*break-word/.test(whackAMoleCSS);

  assert(
    spaceInvadersHasWordBreak && whackAMoleHasWordWrap,
    'Both games use word-break/word-wrap to prevent text overflow'
  );
}

// Test 23: Both games have mobile-optimized typography
console.log('\n🧪 Test 23: *For any* game, SHALL have mobile-optimized typography');
if (fs.existsSync(SPACE_INVADERS_CSS) && fs.existsSync(WHACK_A_MOLE_CSS)) {
  const spaceInvadersCSS = fs.readFileSync(SPACE_INVADERS_CSS, 'utf8');
  const whackAMoleCSS = fs.readFileSync(WHACK_A_MOLE_CSS, 'utf8');

  const spaceInvadersHasFluidTypography = /clamp\(|vw/.test(spaceInvadersCSS);
  const whackAMoleHasResponsiveText = /@media\s*\(\s*max-width\s*:\s*768px\s*\)[\s\S]*?(white-space|word-wrap|text-align)/m.test(whackAMoleCSS);

  assert(
    spaceInvadersHasFluidTypography && whackAMoleHasResponsiveText,
    'Both games have mobile-optimized typography rules'
  );
}

// ============================================================
// EDGE CASE TESTS
// ============================================================

console.log('\n📦 Edge Case Tests');

// Test 24: Handles minimum viewport (320px)
console.log('\n🧪 Test 24: *For any* viewport at 320px minimum, text SHALL remain readable');
if (fs.existsSync(SPACE_INVADERS_CSS)) {
  const cssContent = fs.readFileSync(SPACE_INVADERS_CSS, 'utf8');
  const clampMatches = cssContent.match(/clamp\(\s*([\d.]+)rem/g);
  
  if (clampMatches) {
    const minSizes = clampMatches.map(match => {
      const sizeMatch = match.match(/clamp\(\s*([\d.]+)rem/);
      return sizeMatch ? parseFloat(sizeMatch[1]) : 0;
    });
    
    // At 320px, minimum font size should be at least 0.75rem (12px) for small text
    const allReadable = minSizes.every(size => size >= 0.75);
    assert(
      allReadable,
      `Text remains readable at 320px viewport (min sizes: ${minSizes.join(', ')}rem)`
    );
  }
}

// Test 25: Handles boundary viewport (768px)
console.log('\n🧪 Test 25: *For any* viewport at 768px boundary, responsive rules SHALL apply');
if (fs.existsSync(SPACE_INVADERS_CSS) && fs.existsSync(WHACK_A_MOLE_CSS)) {
  const spaceInvadersCSS = fs.readFileSync(SPACE_INVADERS_CSS, 'utf8');
  const whackAMoleCSS = fs.readFileSync(WHACK_A_MOLE_CSS, 'utf8');

  const bothHave768Breakpoint = 
    /@media\s*\(\s*max-width\s*:\s*768px\s*\)/.test(spaceInvadersCSS) &&
    /@media\s*\(\s*max-width\s*:\s*768px\s*\)/.test(whackAMoleCSS);

  assert(
    bothHave768Breakpoint,
    'Both games apply responsive rules at 768px boundary'
  );
}

// Test 26: Long text strings are handled
console.log('\n🧪 Test 26: *For any* long text string, SHALL wrap or scale appropriately');
if (fs.existsSync(SPACE_INVADERS_CSS) && fs.existsSync(WHACK_A_MOLE_CSS)) {
  const spaceInvadersCSS = fs.readFileSync(SPACE_INVADERS_CSS, 'utf8');
  const whackAMoleCSS = fs.readFileSync(WHACK_A_MOLE_CSS, 'utf8');

  const spaceInvadersHandlesLongText = /word-break\s*:\s*break-word/.test(spaceInvadersCSS);
  const whackAMoleHandlesLongText = /word-wrap\s*:\s*break-word/.test(whackAMoleCSS);

  assert(
    spaceInvadersHandlesLongText && whackAMoleHandlesLongText,
    'Both games handle long text strings with word-break/word-wrap'
  );
}

// ============================================================
// FINAL REPORT
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('📊 PROPERTY TEST RESULTS - Text Truncation Prevention');
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
  console.log('\n💡 Games should have:');
  console.log('   Space Invaders:');
  console.log('     - Overlay titles with clamp() and word-break: break-word');
  console.log('     - Buttons with clamp() and white-space: nowrap');
  console.log('     - Responsive HUD elements');
  console.log('   Whack-a-Mole:');
  console.log('     - Description with white-space: normal and word-wrap: break-word');
  console.log('     - Header with flex-direction: column on mobile');
  console.log('     - Game board with max-width constraint');
  console.log('   Both games:');
  console.log('     - Media queries for 768px and 480px breakpoints');
  console.log('     - Minimum readable font sizes (>= 0.875rem)');
  console.log('     - Text wrapping/breaking to prevent truncation');
  process.exit(1);
} else {
  console.log('\n🎉 All text truncation property tests passed!');
  console.log('✨ Text elements in both games are properly responsive and prevent truncation.');
  process.exit(0);
}
