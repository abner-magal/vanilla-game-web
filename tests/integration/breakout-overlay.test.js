// Unit test: validate Breakout overlay initialization and visibility
// Run with: node game-site/tests/breakout-overlay.test.js

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const htmlPath = path.resolve(__dirname, '../src/games/breakout/index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

function expectContains(snippet, msg) {
  assert(
    html.includes(snippet),
    `Expected to find ${msg} (${snippet})`
  );
}

// Test 1: Verify start-screen overlay exists
expectContains('id="start-screen"', 'start-screen overlay element');

// Test 2: Verify start-screen has active class initially
expectContains('id="start-screen" class="overlay-screen overlay-responsive active"', 'start-screen with active class');

// Test 3: Verify Initialize button exists
expectContains('id="btn-start"', 'Initialize button');

// Test 4: Verify Initialize button is inside start-screen
const startScreenMatch = html.match(/<div id="start-screen"[\s\S]*?<\/div>\s*<\/div>/);
assert(startScreenMatch, 'start-screen overlay structure found');
const startScreenContent = startScreenMatch[0];
assert(startScreenContent.includes('id="btn-start"'), 'Initialize button is inside start-screen');
assert(startScreenContent.includes('Initialize'), 'Initialize button has correct text');

// Test 5: Verify game-over-screen overlay exists
expectContains('id="game-over-screen"', 'game-over-screen overlay element');

// Test 6: Verify canvas exists
expectContains('id="gameCanvas"', 'canvas element');

// Test 7: Verify game-board container exists
expectContains('id="game-board"', 'game-board container');

console.log('✅ Breakout overlay unit tests passed. All elements present and correctly structured.');
