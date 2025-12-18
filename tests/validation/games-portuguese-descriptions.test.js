#!/usr/bin/env node

/**
 * Test for Portuguese Game Descriptions
 * Pure JavaScript - Zero Dependencies
 * 
 * **Feature: bug-fixes-qa-report, Property: All game descriptions are in Portuguese**
 * **Validates: Requirements 4.1**
 * 
 * Run with: node game-site/tests/games-portuguese-descriptions.test.js
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// MINIMAL TEST HARNESS
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
    console.error(`FAIL: ${message}`);
  }
}

function describe(suite, fn) {
  console.log(`\n📦 ${suite}`);
  fn();
}

function it(testName, fn) {
  try {
    fn();
  } catch (err) {
    failed++;
    results.push({ status: '❌', message: testName });
    console.error(`FAIL: ${testName}`);
    console.error(`  Error: ${err.message}`);
  }
}

// ============================================================
// LOAD GAMES.JSON DATA
// ============================================================

const GAME_SITE_ROOT = path.join(__dirname, '..');
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
// PORTUGUESE LANGUAGE DETECTION
// ============================================================

/**
 * Common Portuguese words and patterns to detect Portuguese text
 * This is a simple heuristic check
 */
const PORTUGUESE_INDICATORS = [
  // Common Portuguese words
  /\b(com|de|em|para|por|que|e|ou|não|sim|o|a|os|as|um|uma|uns|umas)\b/gi,
  // Portuguese-specific characters and accents
  /[àáâãäèéêëìíîïòóôõöùúûüçñ]/gi,
  // Common Portuguese verb endings
  /\b(ando|endo|indo|ondo|ado|ido|ada|ida)\b/gi,
  // Portuguese words with common patterns
  /\b(jogo|jogos|arcade|clássico|clássica|música|som|velocidade|ritmo|duelo|duelos|estratégia|memória|reflexo|ação|puzzle|quebra|estoure|organize|memorize|defenda|duelo|raquete|raquetes)\b/gi,
];

/**
 * Check if a text is likely in Portuguese
 * Returns true if multiple Portuguese indicators are found
 */
function isProbablyPortuguese(text) {
  if (!text || typeof text !== 'string') return false;
  
  let indicatorCount = 0;
  
  for (const pattern of PORTUGUESE_INDICATORS) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      indicatorCount += matches.length;
    }
  }
  
  // If we find at least 2 Portuguese indicators, consider it Portuguese
  return indicatorCount >= 2;
}

/**
 * Check if a text is likely in English
 */
function isProbablyEnglish(text) {
  if (!text || typeof text !== 'string') return false;
  
  const englishWords = /\b(the|a|an|and|or|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|could|should|may|might|must|can|classic|table|tennis|arcade|game|games|with|from|to|for|in|on|at|by|of)\b/gi;
  const matches = text.match(englishWords);
  
  return matches && matches.length >= 3;
}

// ============================================================
// TEST: All descriptions are in Portuguese
// ============================================================

describe('Portuguese Language Verification', () => {
  
  it('*For any* game entry in games.json, the description field SHALL be in Portuguese', () => {
    gamesData.forEach(game => {
      const description = game.description;
      const isPortuguese = isProbablyPortuguese(description);
      const isEnglish = isProbablyEnglish(description);
      
      // Flag if description appears to be in English
      if (isEnglish && !isPortuguese) {
        assert(
          false,
          `Game "${game.id}": description appears to be in English: "${description}"`
        );
      } else {
        assert(
          isPortuguese,
          `Game "${game.id}": description is in Portuguese: "${description}"`
        );
      }
    });
  });

  it('*For any* game entry, the description field SHALL NOT be empty', () => {
    gamesData.forEach(game => {
      const hasDescription = game.description && game.description.trim().length > 0;
      
      assert(
        hasDescription,
        `Game "${game.id}": has non-empty description`
      );
    });
  });

  it('*For any* game entry, the description field SHALL have minimum length of 20 characters', () => {
    gamesData.forEach(game => {
      const hasMinLength = game.description && game.description.trim().length >= 20;
      
      assert(
        hasMinLength,
        `Game "${game.id}": description has at least 20 characters (${game.description.length} chars)`
      );
    });
  });

  it('Pong game description SHALL be in Portuguese', () => {
    const pongGame = gamesData.find(g => g.id === 'pong');
    
    assert(
      pongGame !== undefined,
      'Pong game exists in games.json'
    );
    
    if (pongGame) {
      const isPortuguese = isProbablyPortuguese(pongGame.description);
      const isEnglish = isProbablyEnglish(pongGame.description);
      
      assert(
        isPortuguese && !isEnglish,
        `Pong description is in Portuguese: "${pongGame.description}"`
      );
    }
  });

  it('Pong game description SHALL NOT contain English words like "classic table tennis arcade game"', () => {
    const pongGame = gamesData.find(g => g.id === 'pong');
    
    if (pongGame) {
      const hasOldEnglishDescription = pongGame.description.toLowerCase().includes('classic table tennis arcade game');
      
      assert(
        !hasOldEnglishDescription,
        `Pong description has been updated from English: "${pongGame.description}"`
      );
    }
  });
});

// ============================================================
// FINAL REPORT
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('📊 TEST RESULTS - Portuguese Descriptions Verification');
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
  process.exit(1);
} else {
  console.log('\n🎉 All tests passed!');
  process.exit(0);
}
