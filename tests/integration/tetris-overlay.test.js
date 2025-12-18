// Smoke test: validate Tetris overlays/buttons exist in index.html
// Run with: node specs/bn-games-improvements/tests/tetris-overlay.test.js

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const htmlPath = path.resolve(__dirname, '../src/games/tetris/index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

function expectContains(snippet, msg) {
  assert(
    html.includes(snippet),
    `Expected to find ${msg} (${snippet})`
  );
}

expectContains('id="start-overlay"', 'start overlay element');
expectContains('id="pause-overlay"', 'pause overlay element');
expectContains('id="btn-start"', 'start button');
expectContains('id="btn-resume"', 'resume button');

console.log('✅ Tetris overlay smoke test passed. Elements present.');
