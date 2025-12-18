// Static CSS sanity check for game-responsive.css
// Ensures file exists, non-empty, no @import, and balanced braces.

const fs = require('node:fs');
const path = require('node:path');

const targetPath = path.join(__dirname, '..', 'styles', 'components', 'game-responsive.css');

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function hasBalancedBraces(text) {
  let balance = 0;
  for (const ch of text) {
    if (ch === '{') balance += 1;
    if (ch === '}') balance -= 1;
    if (balance < 0) return false;
  }
  return balance === 0;
}

function main() {
  if (!fs.existsSync(targetPath)) {
    fail(`File not found: ${targetPath}`);
    return;
  }

  const content = fs.readFileSync(targetPath, 'utf8');
  assert(content.trim().length > 0, 'CSS file is empty');
  assert(!content.includes('@import'), 'CSS must not use @import');
  assert(content.includes('.game-shell'), 'Missing .game-shell class');
  assert(hasBalancedBraces(content), 'Unbalanced braces detected');

  if (process.exitCode === undefined) {
    console.log('CSS static test passed.');
  }
}

main();
