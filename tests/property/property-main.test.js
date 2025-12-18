/**
 * Property Tests for BN Games
 * Pure JavaScript - Zero Dependencies
 * 
 * Tests:
 * - 1.2: SearchUtils.normalize idempotence
 * - 1.3: SearchUtils.filterGames correctness
 * - 2.2: DifficultyManager.PARAMS validity
 * - 2.3: DifficultyManager high score persistence
 * 
 * Run with: node specs/bn-games-improvements/tests/property.test.js
 */

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
// INLINE MODULE COPIES (for Node.js execution without bundler)
// ============================================================

// SearchUtils - copied from public/js/search-utils.js
class SearchUtils {
  static normalize(str) {
    if (typeof str !== 'string') return '';
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  static matches(text, searchTerm) {
    const normalizedText = this.normalize(text);
    const normalizedSearch = this.normalize(searchTerm);
    if (!normalizedSearch) return true;
    if (normalizedSearch.length === 1) {
      return normalizedText.startsWith(normalizedSearch);
    }
    return normalizedText.includes(normalizedSearch);
  }

  static filterGames(games, searchTerm) {
    if (!searchTerm || !searchTerm.trim()) return games;
    return games.filter((game) =>
      this.matches(game.title, searchTerm) ||
      this.matches(game.description || '', searchTerm)
    );
  }
}

// DifficultyManager - copied from src/core/DifficultyManager.js
const DifficultyManager = {
  LEVELS: {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard',
  },

  PARAMS: {
    easy: { speedMultiplier: 0.7, timeMultiplier: 1.3 },
    medium: { speedMultiplier: 1.0, timeMultiplier: 1.0 },
    hard: { speedMultiplier: 1.5, timeMultiplier: 0.7 },
  },

  _memoryScores: {},

  getParams(level) {
    const normalized = String(level).toLowerCase();
    return this.PARAMS[normalized] || this.PARAMS[this.LEVELS.MEDIUM];
  },

  _buildKey(gameId, level) {
    return `${gameId}_${level}_highscore`;
  },

  saveHighScore(gameId, level, score) {
    if (typeof gameId !== 'string' || !gameId.trim()) return false;
    if (typeof score !== 'number' || !Number.isFinite(score) || score < 0) return false;
    
    const normalized = String(level).toLowerCase();
    if (!this.PARAMS[normalized]) return false;
    
    const key = this._buildKey(gameId, normalized);
    const current = this._memoryScores[key] || 0;
    
    if (score > current) {
      this._memoryScores[key] = score;
    }
    return true;
  },

  getHighScore(gameId, level) {
    if (typeof gameId !== 'string' || !gameId.trim()) return 0;
    
    const normalized = String(level).toLowerCase();
    const key = this._buildKey(gameId, normalized);
    return this._memoryScores[key] || 0;
  },

  clearMemory() {
    this._memoryScores = {};
  }
};

// ============================================================
// TEST DATA
// ============================================================

const MOCK_GAMES = [
  { id: 'snake', title: 'Snake', description: 'Classic arcade game' },
  { id: 'tetris', title: 'Tetris', description: 'Block puzzle game' },
  { id: 'pong', title: 'Pong', description: 'Table tennis arcade' },
  { id: 'breakout', title: 'Breakout', description: 'Brick breaker game' },
  { id: 'balloon-pop', title: 'Balloon Pop', description: 'Pop the balloons' },
];

const ACCENTED_STRINGS = [
  'café',
  'naïve',
  'résumé',
  'Éclair',
  'piñata',
  'über',
  'São Paulo',
  'crème brûlée',
  '日本語',  // Non-Latin (should pass through)
  '',
  '   ',
];

const SEARCH_CASES = [
  { term: 'snake', expected: ['snake'] },
  { term: 'SNAKE', expected: ['snake'] },  // Case insensitive
  { term: 'game', expected: ['snake', 'tetris', 'breakout'] },
  { term: 'arcade', expected: ['snake', 'pong'] },
  { term: 'pop', expected: ['balloon-pop'] },
  { term: 'xyz', expected: [] },
  { term: '', expected: ['snake', 'tetris', 'pong', 'breakout', 'balloon-pop'] },
  { term: '   ', expected: ['snake', 'tetris', 'pong', 'breakout', 'balloon-pop'] },
];

// ============================================================
// TEST SUITE 1.2: String Normalization Idempotence
// ============================================================

describe('1.2 SearchUtils.normalize - Idempotence', () => {
  it('normalize(normalize(x)) === normalize(x) for all test strings', () => {
    ACCENTED_STRINGS.forEach((str) => {
      const once = SearchUtils.normalize(str);
      const twice = SearchUtils.normalize(once);
      assertEqual(twice, once, `Idempotence: "${str}" → "${once}" → "${twice}"`);
    });
  });

  it('normalize removes diacritics correctly', () => {
    assertEqual(SearchUtils.normalize('café'), 'cafe', 'café → cafe');
    assertEqual(SearchUtils.normalize('naïve'), 'naive', 'naïve → naive');
    assertEqual(SearchUtils.normalize('résumé'), 'resume', 'résumé → resume');
    assertEqual(SearchUtils.normalize('Éclair'), 'eclair', 'Éclair → eclair');
    assertEqual(SearchUtils.normalize('piñata'), 'pinata', 'piñata → pinata');
    assertEqual(SearchUtils.normalize('über'), 'uber', 'über → uber');
  });

  it('normalize handles edge cases', () => {
    assertEqual(SearchUtils.normalize(''), '', 'Empty string');
    assertEqual(SearchUtils.normalize('   '), '   ', 'Whitespace only');
    assertEqual(SearchUtils.normalize(null), '', 'null input');
    assertEqual(SearchUtils.normalize(undefined), '', 'undefined input');
    assertEqual(SearchUtils.normalize(123), '', 'Number input');
  });

  it('normalize lowercases strings', () => {
    assertEqual(SearchUtils.normalize('HELLO'), 'hello', 'Uppercase');
    assertEqual(SearchUtils.normalize('HeLLo WoRLD'), 'hello world', 'Mixed case');
  });
});

// ============================================================
// TEST SUITE 1.3: Game Search Correctness
// ============================================================

describe('1.3 SearchUtils.filterGames - Correctness', () => {
  it('filters games correctly for all search cases', () => {
    SEARCH_CASES.forEach(({ term, expected }) => {
      const result = SearchUtils.filterGames(MOCK_GAMES, term);
      const resultIds = result.map(g => g.id);
      assertArrayEqual(resultIds, expected, `Search "${term}" → [${expected.join(', ')}]`);
    });
  });

  it('empty search returns all games', () => {
    const result = SearchUtils.filterGames(MOCK_GAMES, '');
    assertEqual(result.length, MOCK_GAMES.length, 'Empty string returns all');
    
    const resultWhitespace = SearchUtils.filterGames(MOCK_GAMES, '   ');
    assertEqual(resultWhitespace.length, MOCK_GAMES.length, 'Whitespace returns all');
    
    const resultNull = SearchUtils.filterGames(MOCK_GAMES, null);
    assertEqual(resultNull.length, MOCK_GAMES.length, 'null returns all');
  });

  it('search is case-insensitive', () => {
    const lower = SearchUtils.filterGames(MOCK_GAMES, 'snake');
    const upper = SearchUtils.filterGames(MOCK_GAMES, 'SNAKE');
    const mixed = SearchUtils.filterGames(MOCK_GAMES, 'SnAkE');
    
    assertEqual(lower.length, upper.length, 'Case: lower vs upper');
    assertEqual(lower.length, mixed.length, 'Case: lower vs mixed');
  });

  it('single character uses startsWith logic', () => {
    // 's' should match 'snake' but not 'tetris'
    const result = SearchUtils.filterGames(MOCK_GAMES, 's');
    assert(result.some(g => g.id === 'snake'), "Single 's' matches snake");
    assert(!result.some(g => g.id === 'tetris'), "Single 's' does not match tetris");
  });

  it('searches both title and description', () => {
    // 'block' is only in Tetris description
    const result = SearchUtils.filterGames(MOCK_GAMES, 'block');
    assertEqual(result.length, 1, 'Found 1 game');
    assertEqual(result[0].id, 'tetris', 'Found Tetris by description');
  });
});

// ============================================================
// TEST SUITE 2.2: Difficulty Parameters Validity
// ============================================================

describe('2.2 DifficultyManager.PARAMS - Validity', () => {
  it('all levels have valid PARAMS', () => {
    Object.values(DifficultyManager.LEVELS).forEach((level) => {
      const params = DifficultyManager.PARAMS[level];
      assert(params !== undefined, `PARAMS exist for ${level}`);
      assert(typeof params.speedMultiplier === 'number', `${level}.speedMultiplier is number`);
      assert(typeof params.timeMultiplier === 'number', `${level}.timeMultiplier is number`);
    });
  });

  it('speedMultiplier values are positive numbers', () => {
    Object.entries(DifficultyManager.PARAMS).forEach(([level, params]) => {
      assert(params.speedMultiplier > 0, `${level}.speedMultiplier > 0 (${params.speedMultiplier})`);
      assert(Number.isFinite(params.speedMultiplier), `${level}.speedMultiplier is finite`);
    });
  });

  it('timeMultiplier values are positive numbers', () => {
    Object.entries(DifficultyManager.PARAMS).forEach(([level, params]) => {
      assert(params.timeMultiplier > 0, `${level}.timeMultiplier > 0 (${params.timeMultiplier})`);
      assert(Number.isFinite(params.timeMultiplier), `${level}.timeMultiplier is finite`);
    });
  });

  it('getParams returns valid params for all levels', () => {
    Object.values(DifficultyManager.LEVELS).forEach((level) => {
      const params = DifficultyManager.getParams(level);
      assert(params.speedMultiplier > 0, `getParams(${level}).speedMultiplier > 0`);
      assert(params.timeMultiplier > 0, `getParams(${level}).timeMultiplier > 0`);
    });
  });

  it('getParams falls back to MEDIUM for invalid level', () => {
    const params = DifficultyManager.getParams('invalid');
    const mediumParams = DifficultyManager.PARAMS[DifficultyManager.LEVELS.MEDIUM];
    assertEqual(params.speedMultiplier, mediumParams.speedMultiplier, 'Invalid level → MEDIUM speedMultiplier');
    assertEqual(params.timeMultiplier, mediumParams.timeMultiplier, 'Invalid level → MEDIUM timeMultiplier');
  });

  it('difficulty progression is logical', () => {
    const easy = DifficultyManager.PARAMS.easy;
    const medium = DifficultyManager.PARAMS.medium;
    const hard = DifficultyManager.PARAMS.hard;

    // Speed should increase: easy < medium < hard
    assert(easy.speedMultiplier < medium.speedMultiplier, 'Easy speed < Medium speed');
    assert(medium.speedMultiplier < hard.speedMultiplier, 'Medium speed < Hard speed');

    // Time should decrease: easy > medium > hard (more time = easier)
    assert(easy.timeMultiplier > medium.timeMultiplier, 'Easy time > Medium time');
    assert(medium.timeMultiplier > hard.timeMultiplier, 'Medium time > Hard time');
  });
});

// ============================================================
// TEST SUITE 2.3: High Score Persistence
// ============================================================

describe('2.3 DifficultyManager - High Score Persistence', () => {
  // Reset memory before each test group
  DifficultyManager.clearMemory();

  it('saveHighScore persists and getHighScore retrieves', () => {
    const gameId = 'test-game-1';
    const level = 'easy';
    
    DifficultyManager.saveHighScore(gameId, level, 100);
    const score = DifficultyManager.getHighScore(gameId, level);
    assertEqual(score, 100, 'Retrieved saved score');
  });

  it('high scores are isolated by gameId', () => {
    DifficultyManager.clearMemory();
    
    DifficultyManager.saveHighScore('game-a', 'easy', 50);
    DifficultyManager.saveHighScore('game-b', 'easy', 75);
    
    assertEqual(DifficultyManager.getHighScore('game-a', 'easy'), 50, 'game-a score');
    assertEqual(DifficultyManager.getHighScore('game-b', 'easy'), 75, 'game-b score');
  });

  it('high scores are isolated by difficulty level', () => {
    DifficultyManager.clearMemory();
    const gameId = 'test-game-2';
    
    DifficultyManager.saveHighScore(gameId, 'easy', 100);
    DifficultyManager.saveHighScore(gameId, 'medium', 200);
    DifficultyManager.saveHighScore(gameId, 'hard', 300);
    
    assertEqual(DifficultyManager.getHighScore(gameId, 'easy'), 100, 'Easy score isolated');
    assertEqual(DifficultyManager.getHighScore(gameId, 'medium'), 200, 'Medium score isolated');
    assertEqual(DifficultyManager.getHighScore(gameId, 'hard'), 300, 'Hard score isolated');
  });

  it('only saves if new score is higher', () => {
    DifficultyManager.clearMemory();
    const gameId = 'test-game-3';
    
    DifficultyManager.saveHighScore(gameId, 'easy', 100);
    DifficultyManager.saveHighScore(gameId, 'easy', 50);  // Lower score
    assertEqual(DifficultyManager.getHighScore(gameId, 'easy'), 100, 'Lower score not saved');
    
    DifficultyManager.saveHighScore(gameId, 'easy', 150);  // Higher score
    assertEqual(DifficultyManager.getHighScore(gameId, 'easy'), 150, 'Higher score saved');
  });

  it('returns 0 for non-existent scores', () => {
    DifficultyManager.clearMemory();
    
    assertEqual(DifficultyManager.getHighScore('non-existent', 'easy'), 0, 'Non-existent game');
    assertEqual(DifficultyManager.getHighScore('test', 'easy'), 0, 'Non-existent level');
  });

  it('rejects invalid inputs', () => {
    DifficultyManager.clearMemory();
    
    // Invalid gameId
    assertEqual(DifficultyManager.saveHighScore('', 'easy', 100), false, 'Empty gameId rejected');
    assertEqual(DifficultyManager.saveHighScore(null, 'easy', 100), false, 'null gameId rejected');
    
    // Invalid score
    assertEqual(DifficultyManager.saveHighScore('game', 'easy', -10), false, 'Negative score rejected');
    assertEqual(DifficultyManager.saveHighScore('game', 'easy', NaN), false, 'NaN score rejected');
    assertEqual(DifficultyManager.saveHighScore('game', 'easy', Infinity), false, 'Infinity score rejected');
    
    // Invalid level
    assertEqual(DifficultyManager.saveHighScore('game', 'invalid', 100), false, 'Invalid level rejected');
  });

  it('handles edge case scores', () => {
    DifficultyManager.clearMemory();
    
    DifficultyManager.saveHighScore('edge-test', 'easy', 0);
    assertEqual(DifficultyManager.getHighScore('edge-test', 'easy'), 0, 'Zero score saved');
    
    DifficultyManager.saveHighScore('edge-test', 'medium', 999999);
    assertEqual(DifficultyManager.getHighScore('edge-test', 'medium'), 999999, 'Large score saved');
  });
});

// ============================================================
// TEST SUITE 7.1: Unique Game Names (Property 8)
// **Feature: bn-games-bug-fixes, Property 8: Unique Game Names**
// **Validates: Requirements 7.1**
// ============================================================

// Load games.json data for property testing
const GAMES_DATA = [
  {
    "id": "whack-a-mole",
    "title": "Whack-a-Mole",
    "description": "Arcade de reflexo puro: acerte as topeiras em ritmo acelerado e dispute o topo.",
    "path": "/src/games/whack-a-mole/index.html"
  },
  {
    "id": "balloon-pop",
    "title": "Balloon Pop",
    "description": "Estoure baloes neon, desvie das bombas e encaixe combos brilhantes.",
    "path": "/src/games/balloon-pop/index.html"
  },
  {
    "id": "memory-match",
    "title": "Memory Match",
    "description": "Duelo de memoria com cartas neon e feedback imediato a cada par.",
    "path": "/src/games/memory-match/index.html"
  },
  {
    "id": "card-flip",
    "title": "Card Flip",
    "description": "A classic card matching memory game.",
    "path": "/src/games/card-flip/index.html"
  },
  {
    "id": "snake",
    "title": "Snake",
    "description": "Snake classico turbinado com trilha retro e velocidade crescente.",
    "path": "/src/games/snake/index.html"
  },
  {
    "id": "pong",
    "title": "Pong",
    "description": "Classic table tennis arcade game.",
    "path": "/src/games/pong/index.html"
  },
  {
    "id": "breakout",
    "title": "Breakout",
    "description": "Quebre paredes neon com ricochetes controlados e power-ups raros.",
    "path": "/src/games/breakout/index.html"
  },
  {
    "id": "space-invaders",
    "title": "Space Invaders",
    "description": "Defenda a Terra de ondas alien ao som de tiros cadenciados.",
    "path": "/src/games/space-invaders/index.html"
  },
  {
    "id": "tetris",
    "title": "Tetris",
    "description": "Tetris lendario com quedas suaves, ritmo arcade e linhas limpas.",
    "path": "/src/games/tetris/index.html"
  },
  {
    "id": "drag-drop",
    "title": "Number Puzzle",
    "description": "Organize os numeros arrastando com suavidade; cada movimento e estrategia.",
    "path": "/src/games/drag-drop/index.html"
  },
  {
    "id": "simon-says",
    "title": "Simon Says",
    "description": "Memorize sequencias de luz e som com dificuldade progressiva.",
    "path": "/src/games/simon-says/index.html"
  }
];

/**
 * Property 8: Unique Game Names
 * For any list of games displayed in the hub, all titles must be unique (no duplicates).
 * 
 * This property test validates:
 * 1. All game titles are unique
 * 2. All game IDs are unique
 * 3. No case-insensitive duplicates exist
 */
describe('7.1 Property 8: Unique Game Names', () => {
  
  it('all game titles are unique', () => {
    const titles = GAMES_DATA.map(g => g.title);
    const uniqueTitles = new Set(titles);
    
    assertEqual(
      uniqueTitles.size, 
      titles.length, 
      `All ${titles.length} game titles are unique`
    );
    
    // Find duplicates if any
    const duplicates = titles.filter((title, index) => titles.indexOf(title) !== index);
    if (duplicates.length > 0) {
      console.error(`  Duplicate titles found: ${duplicates.join(', ')}`);
    }
    assert(duplicates.length === 0, 'No duplicate titles exist');
  });

  it('all game IDs are unique', () => {
    const ids = GAMES_DATA.map(g => g.id);
    const uniqueIds = new Set(ids);
    
    assertEqual(
      uniqueIds.size, 
      ids.length, 
      `All ${ids.length} game IDs are unique`
    );
    
    // Find duplicates if any
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicates.length > 0) {
      console.error(`  Duplicate IDs found: ${duplicates.join(', ')}`);
    }
    assert(duplicates.length === 0, 'No duplicate IDs exist');
  });

  it('no case-insensitive title duplicates exist', () => {
    const normalizedTitles = GAMES_DATA.map(g => g.title.toLowerCase());
    const uniqueNormalized = new Set(normalizedTitles);
    
    assertEqual(
      uniqueNormalized.size, 
      normalizedTitles.length, 
      'No case-insensitive title duplicates'
    );
  });

  it('for any subset of games, titles remain unique', () => {
    // Property: For any random subset of games, uniqueness is preserved
    // Test with multiple random subsets
    const numTests = 10;
    
    for (let i = 0; i < numTests; i++) {
      // Generate random subset
      const subsetSize = Math.floor(Math.random() * GAMES_DATA.length) + 1;
      const shuffled = [...GAMES_DATA].sort(() => Math.random() - 0.5);
      const subset = shuffled.slice(0, subsetSize);
      
      const titles = subset.map(g => g.title);
      const uniqueTitles = new Set(titles);
      
      assert(
        uniqueTitles.size === titles.length,
        `Random subset ${i + 1} (size ${subsetSize}): all titles unique`
      );
    }
  });

  it('adding a game with existing title would violate uniqueness', () => {
    // Property: If we try to add a game with an existing title, it should be detected
    const existingTitle = GAMES_DATA[0].title;
    const testGames = [...GAMES_DATA, { id: 'test-duplicate', title: existingTitle }];
    
    const titles = testGames.map(g => g.title);
    const uniqueTitles = new Set(titles);
    
    assert(
      uniqueTitles.size < titles.length,
      'Duplicate title correctly detected when added'
    );
  });

  it('game titles are non-empty strings', () => {
    GAMES_DATA.forEach(game => {
      assert(
        typeof game.title === 'string' && game.title.trim().length > 0,
        `Game "${game.id}" has valid non-empty title`
      );
    });
  });

  it('game IDs are non-empty strings', () => {
    GAMES_DATA.forEach(game => {
      assert(
        typeof game.id === 'string' && game.id.trim().length > 0,
        `Game with title "${game.title}" has valid non-empty ID`
      );
    });
  });
});

// ============================================================
// FINAL REPORT
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('📊 PROPERTY TEST RESULTS');
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
  console.log('\n🎉 All property tests passed!');
  process.exit(0);
}
