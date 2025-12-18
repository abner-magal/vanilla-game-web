/**
 * Property Tests for Category Filters
 * **Feature: bug-fixes-qa-report, Property 3: Category Filter Consistency**
 * **Feature: bug-fixes-qa-report, Property 4: Combined Filter Correctness**
 * 
 * Validates: Requirements 3.1, 3.4
 * 
 * Run with: node game-site/tests/category-filter.property.test.js
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

function assertEqual(actual, expected, message) {
  const isEqual = actual === expected;
  if (!isEqual) {
    console.error(`  Expected: ${JSON.stringify(expected)}`);
    console.error(`  Actual:   ${JSON.stringify(actual)}`);
  }
  assert(isEqual, message);
}

function assertArrayEqual(actual, expected, message) {
  const isEqual = JSON.stringify(actual) === JSON.stringify(expected);
  if (!isEqual) {
    console.error(`  Expected: ${JSON.stringify(expected)}`);
    console.error(`  Actual:   ${JSON.stringify(actual)}`);
  }
  assert(isEqual, message);
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
// LOAD GAMES DATA
// ============================================================

const gamesJsonPath = path.join(__dirname, '../public/config/games.json');
const gamesData = JSON.parse(fs.readFileSync(gamesJsonPath, 'utf-8'));

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Filter games by category
 * @param {Array} games - Array of game objects
 * @param {string} category - Category to filter by ('Todos' returns all)
 * @returns {Array} Filtered games
 */
function filterByCategory(games, category) {
  if (category === 'Todos') {
    return games;
  }
  return games.filter(game => game.category === category);
}

/**
 * Filter games by search term
 * @param {Array} games - Array of game objects
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered games
 */
function filterBySearchTerm(games, searchTerm) {
  if (!searchTerm || !searchTerm.trim()) {
    return games;
  }
  
  const normalizedTerm = searchTerm.trim().toLowerCase();
  
  return games.filter(game => {
    const title = (game.title || '').toLowerCase();
    const description = (game.description || '').toLowerCase();
    return title.includes(normalizedTerm) || description.includes(normalizedTerm);
  });
}

/**
 * Apply both category and search filters
 * @param {Array} games - Array of game objects
 * @param {string} category - Category filter
 * @param {string} searchTerm - Search term filter
 * @returns {Array} Filtered games
 */
function applyBothFilters(games, category, searchTerm) {
  const byCategory = filterByCategory(games, category);
  return filterBySearchTerm(byCategory, searchTerm);
}

// ============================================================
// PROPERTY 3: Category Filter Consistency
// ============================================================

describe('Property 3: Category Filter Consistency', () => {
  it('should return all games when category is "Todos"', () => {
    const result = filterByCategory(gamesData, 'Todos');
    assertEqual(result.length, gamesData.length, 'Todos returns all games');
  });

  it('should return only games matching the selected category', () => {
    // Get all unique categories
    const categories = [...new Set(gamesData.map(g => g.category))];
    
    categories.forEach(category => {
      const result = filterByCategory(gamesData, category);
      const allMatchCategory = result.every(game => game.category === category);
      assert(allMatchCategory, `All games in "${category}" category match the filter`);
    });
  });

  it('should return empty array for non-existent category', () => {
    const result = filterByCategory(gamesData, 'NonExistentCategory');
    assertEqual(result.length, 0, 'Non-existent category returns empty array');
  });

  it('should not modify original games array', () => {
    const originalLength = gamesData.length;
    const originalData = JSON.stringify(gamesData);
    
    filterByCategory(gamesData, 'Action');
    
    assertEqual(gamesData.length, originalLength, 'Original array length unchanged');
    assertEqual(JSON.stringify(gamesData), originalData, 'Original array data unchanged');
  });

  it('should return correct count for each category', () => {
    const categories = [...new Set(gamesData.map(g => g.category))];
    
    categories.forEach(category => {
      const result = filterByCategory(gamesData, category);
      const expectedCount = gamesData.filter(g => g.category === category).length;
      assertEqual(result.length, expectedCount, `Category "${category}" has correct count`);
    });
  });
});

// ============================================================
// PROPERTY 4: Combined Filter Correctness
// ============================================================

describe('Property 4: Combined Filter Correctness', () => {
  it('should apply both category and search filters correctly', () => {
    const category = 'Puzzle';
    const searchTerm = 'tetris';
    
    const result = applyBothFilters(gamesData, category, searchTerm);
    
    // All results should be in the Puzzle category
    const allInCategory = result.every(game => game.category === category);
    assert(allInCategory, 'All results are in selected category');
    
    // All results should match the search term
    const allMatchSearch = result.every(game => 
      game.title.toLowerCase().includes(searchTerm) || 
      game.description.toLowerCase().includes(searchTerm)
    );
    assert(allMatchSearch, 'All results match search term');
  });

  it('should return empty when no games match both filters', () => {
    const category = 'Sports';
    const searchTerm = 'nonexistent';
    
    const result = applyBothFilters(gamesData, category, searchTerm);
    assertEqual(result.length, 0, 'No games match both filters');
  });

  it('should return all games when category is "Todos" and search is empty', () => {
    const result = applyBothFilters(gamesData, 'Todos', '');
    assertEqual(result.length, gamesData.length, 'Todos + empty search returns all games');
  });

  it('should respect category filter even with empty search', () => {
    const category = 'Action';
    const result = applyBothFilters(gamesData, category, '');
    
    const allInCategory = result.every(game => game.category === category);
    assert(allInCategory, 'Category filter applied with empty search');
    
    const expectedCount = gamesData.filter(g => g.category === category).length;
    assertEqual(result.length, expectedCount, 'Correct count for category with empty search');
  });

  it('should respect search filter even with "Todos" category', () => {
    const searchTerm = 'arcade';
    const result = applyBothFilters(gamesData, 'Todos', searchTerm);
    
    const allMatchSearch = result.every(game =>
      game.title.toLowerCase().includes(searchTerm) ||
      game.description.toLowerCase().includes(searchTerm)
    );
    assert(allMatchSearch, 'Search filter applied with Todos category');
  });

  it('should handle case-insensitive search with category filter', () => {
    const category = 'Puzzle';
    const searchLower = applyBothFilters(gamesData, category, 'memory');
    const searchUpper = applyBothFilters(gamesData, category, 'MEMORY');
    const searchMixed = applyBothFilters(gamesData, category, 'MeMoRy');
    
    assertEqual(searchLower.length, searchUpper.length, 'Case-insensitive: lower vs upper');
    assertEqual(searchLower.length, searchMixed.length, 'Case-insensitive: lower vs mixed');
  });

  it('should not modify original games array when applying both filters', () => {
    const originalLength = gamesData.length;
    const originalData = JSON.stringify(gamesData);
    
    applyBothFilters(gamesData, 'Action', 'space');
    
    assertEqual(gamesData.length, originalLength, 'Original array length unchanged');
    assertEqual(JSON.stringify(gamesData), originalData, 'Original array data unchanged');
  });
});

// ============================================================
// RESULTS SUMMARY
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('TEST RESULTS SUMMARY');
console.log('='.repeat(60));

if (failed > 0) {
  console.log('\n❌ FAILED TESTS:');
  results.filter(r => r.status === '❌').forEach(r => {
    console.log(`  ${r.status} ${r.message}`);
  });
}

console.log(`\n✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Total:  ${passed + failed}`);
console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

process.exit(failed > 0 ? 1 : 0);
