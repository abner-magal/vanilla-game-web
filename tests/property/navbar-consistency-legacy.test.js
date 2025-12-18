#!/usr/bin/env node

/**
 * Property Tests for Navbar Consistency Validation
 * Pure JavaScript - Zero Dependencies
 * 
 * **Feature: bug-fixes-memory-games, Property 2: Navbar Consistency**
 * **Validates: Requirements 2.1, 2.2**
 * 
 * Run with: node game-site/tests/navbar-consistency.property.test.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Navbar Consistency Property Tests...');

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
// LOAD GAMES DATA
// ============================================================

const GAME_SITE_ROOT = __dirname.includes('tests') ? path.join(__dirname, '..') : __dirname;
const GAMES_JSON_PATH = path.join(GAME_SITE_ROOT, 'public', 'config', 'games.json');

let gamesData = [];
try {
  const jsonContent = fs.readFileSync(GAMES_JSON_PATH, 'utf8');
  gamesData = JSON.parse(jsonContent);
  console.log(`✅ Loaded ${gamesData.length} games from games.json`);
} catch (err) {
  console.error(`❌ Failed to load games.json: ${err.message}`);
  process.exit(1);
}

// ============================================================
// PROPERTY 2: Navbar Consistency Tests
// **Feature: bug-fixes-memory-games, Property 2: Navbar Consistency**
// **Validates: Requirements 2.1, 2.2**
// ============================================================

console.log('\n📦 Property 2: Navbar Consistency');

// Test 1: "Voltar ao Hub" link presence
console.log('\n🧪 *For any* game HTML file, the navbar SHALL contain a "Voltar ao Hub" link');
gamesData.forEach(game => {
  const gamePath = path.join(GAME_SITE_ROOT, game.path);
  
  if (fs.existsSync(gamePath)) {
    const htmlContent = fs.readFileSync(gamePath, 'utf8');
    const hasVoltarAoHub = /Voltar ao Hub/i.test(htmlContent);
    
    assert(
      hasVoltarAoHub,
      `Game "${game.id}": navbar contains "Voltar ao Hub" link`
    );
  } else {
    assert(false, `Game "${game.id}": HTML file not found at ${game.path}`);
  }
});

// Test 2: "Voltar ao Hub" link points to Hub
console.log('\n🧪 *For any* game HTML file, the "Voltar ao Hub" link SHALL point to the Hub page');
gamesData.forEach(game => {
  const gamePath = path.join(GAME_SITE_ROOT, game.path);
  
  if (fs.existsSync(gamePath)) {
    const htmlContent = fs.readFileSync(gamePath, 'utf8');
    
    // Check if "Voltar ao Hub" link points to public/index.html
    const linkPattern = /<a[^>]*href\s*=\s*["']([^"']*public\/index\.html[^"']*)["'][^>]*>.*?Voltar ao Hub.*?<\/a>/is;
    const hasCorrectLink = linkPattern.test(htmlContent);
    
    assert(
      hasCorrectLink,
      `Game "${game.id}": "Voltar ao Hub" link points to Hub page (public/index.html)`
    );
  }
});

// Test 3: BN Games logo presence
console.log('\n🧪 *For any* game HTML file, the navbar SHALL contain the BN Games logo');
gamesData.forEach(game => {
  const gamePath = path.join(GAME_SITE_ROOT, game.path);
  
  if (fs.existsSync(gamePath)) {
    const htmlContent = fs.readFileSync(gamePath, 'utf8');
    const hasBNGamesLogo = /BN.*?GAMES/i.test(htmlContent);
    
    assert(
      hasBNGamesLogo,
      `Game "${game.id}": navbar contains BN Games logo`
    );
  } else {
    assert(false, `Game "${game.id}": HTML file not found at ${game.path}`);
  }
});

// Test 4: Navbar structure
console.log('\n🧪 *For any* game HTML file, the navbar SHALL be properly structured');
gamesData.forEach(game => {
  const gamePath = path.join(GAME_SITE_ROOT, game.path);
  
  if (fs.existsSync(gamePath)) {
    const htmlContent = fs.readFileSync(gamePath, 'utf8');
    
    // Check for navbar element
    const hasNavbar = /<nav[^>]*>/i.test(htmlContent);
    assert(
      hasNavbar,
      `Game "${game.id}": contains <nav> element`
    );
    
    // Check for glass effect class
    const hasGlassEffect = /class[^>]*glass/i.test(htmlContent);
    assert(
      hasGlassEffect,
      `Game "${game.id}": navbar uses glass effect styling`
    );
    
    // Check for flex layout
    const hasFlexLayout = /flex.*justify-between/s.test(htmlContent);
    assert(
      hasFlexLayout,
      `Game "${game.id}": navbar uses proper flex layout`
    );
    
    // Check for arrow_back icon
    const hasBackIcon = /arrow_back/i.test(htmlContent);
    assert(
      hasBackIcon,
      `Game "${game.id}": includes arrow_back icon`
    );
  }
});

// Test 5: Mobile back button
console.log('\n🧪 *For any* game HTML file, SHALL contain mobile back button');
gamesData.forEach(game => {
  const gamePath = path.join(GAME_SITE_ROOT, game.path);
  
  if (fs.existsSync(gamePath)) {
    const htmlContent = fs.readFileSync(gamePath, 'utf8');
    
    const hasMobileBackBtn = /mobile-back-button/i.test(htmlContent);
    assert(
      hasMobileBackBtn,
      `Game "${game.id}": contains mobile back button`
    );
  }
});

// ============================================================
// FINAL REPORT
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('📊 PROPERTY TEST RESULTS - Navbar Consistency Validation');
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
  console.log('\n💡 All games should have consistent navbar elements:');
  console.log('   - "Voltar ao Hub" link pointing to ../../../public/index.html');
  console.log('   - BN Games logo text');
  console.log('   - <nav> element with glass effect');
  console.log('   - Flex layout with justify-between');
  console.log('   - arrow_back icon');
  console.log('   - Mobile back button');
  process.exit(1);
} else {
  console.log('\n🎉 All navbar consistency property tests passed!');
  console.log('✨ All games have consistent navigation elements as required.');
  process.exit(0);
}