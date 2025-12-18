/**
 * Test Configuration
 * 
 * Central configuration for all tests.
 */

module.exports = {
  // Viewport breakpoints
  VIEWPORTS: {
    MIN: 320,
    MOBILE: 375,
    SMALL_MOBILE: 400,
    TABLET: 768,
    DESKTOP: 1024
  },

  // Games list
  GAMES: [
    'whack-a-mole',
    'balloon-pop',
    'memory-match',
    'snake',
    'pong',
    'breakout',
    'space-invaders',
    'tetris',
    'drag-drop',
    'simon-says'
  ],

  // Minimum font sizes for readability
  MIN_FONT_SIZES: {
    SMALL_TEXT: 0.75,    // 12px - small descriptions
    BODY_TEXT: 0.875,    // 14px - body text
    BUTTON_TEXT: 0.875,  // 14px - buttons
    TITLE_TEXT: 1.25     // 20px - titles
  },

  // Test categories
  CATEGORIES: {
    PROPERTY: 'property',
    VALIDATION: 'validation',
    INTEGRATION: 'integration',
    UNIT: 'unit'
  },

  // Feature flags
  FEATURES: {
    RESPONSIVE_BUGFIX: 'responsive-bugfix',
    BN_GAMES_BUG_FIXES: 'bn-games-bug-fixes'
  }
};
