// Property Test: Tamanho da topeira proporcional ao buraco (<= 70%)
// Run with: node specs/bn-games-improvements/tests/whack-a-mole-size.test.js

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const cssPath = path.resolve(__dirname, '../src/games/whack-a-mole/style.css');
const css = fs.readFileSync(cssPath, 'utf8');

function extractPercent(selector, property) {
  const regex = new RegExp(`${selector}[^}]*${property}\\s*:\\s*(\\d+)%`, 'm');
  const match = css.match(regex);
  return match ? Number(match[1]) : null;
}

const widthPercent = extractPercent('\\.mole', 'width');
const heightPercent = extractPercent('\\.mole', 'height');
const mobileWidthPercent = extractPercent('@media (max-width: 600px)[\\s\\S]*\\.mole', 'width');
const mobileHeightPercent = extractPercent('@media (max-width: 600px)[\\s\\S]*\\.mole', 'height');

assert(widthPercent !== null && heightPercent !== null, 'Percentuais principais não encontrados no CSS');
assert(widthPercent <= 70 && heightPercent <= 70, 'A toupeira deve ocupar no máximo 70% do buraco');

if (mobileWidthPercent !== null && mobileHeightPercent !== null) {
  assert(mobileWidthPercent <= 70 && mobileHeightPercent <= 70, 'No mobile a toupeira não pode ultrapassar 70%');
}

console.log('✅ Property 6: Tamanho da topeira é proporcional (<=70%)');
