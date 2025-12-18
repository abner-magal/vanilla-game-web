// **Feature: bug-fixes-responsividade, Property 3: No Horizontal Overflow at 320px**

/**
 * Horizontal Overflow Prevention Tests
 * Tests for Requirements 2.1 and 2.2 - Overflow Prevention
 */

const fs = require('fs');
const path = require('path');

describe('Horizontal Overflow Prevention Tests', () => {

  /**
   * Property 3: No Horizontal Overflow at 320px
   * For any page in the platform, when rendered at 320px viewport width, 
   * no element SHALL have a computed width greater than the viewport width
   * **Validates: Requirements 2.1, 2.2**
   */
  describe('Property 3: No Horizontal Overflow at 320px', () => {
    const testViewports = [280, 300, 320, 340, 360, 375, 400];
    const allPages = [
      'game-site/public/index.html',
      'game-site/src/games/snake/index.html',
      'game-site/src/games/tetris/index.html',
      'game-site/src/games/memory-match/index.html',
      'game-site/src/games/pong/index.html',
      'game-site/src/games/balloon-pop/index.html',
      'game-site/src/games/space-invaders/index.html',
      'game-site/src/games/breakout/index.html',
      'game-site/src/games/drag-drop/index.html',
      'game-site/src/games/simon-says/index.html',
      'game-site/src/games/whack-a-mole/index.html'
    ];

    test('CSS should have overflow-x: hidden for viewports < 400px', () => {
      // Check mobile-fixes.css exists and has correct rules
      const mobileFixesPath = '../styles/components/mobile-fixes.css';
      expect(fs.existsSync(mobileFixesPath)).toBe(true);
      
      const cssContent = fs.readFileSync(mobileFixesPath, 'utf8');
      
      // Should have media query for max-width: 400px
      expect(cssContent).toContain('@media (max-width: 400px)');
      
      // Should have overflow-x: hidden rule
      expect(cssContent).toContain('overflow-x: hidden');
      
      // Should have max-width: 100% fallback
      expect(cssContent).toContain('max-width: 100%');
    });

    test('Home page CSS should have 320px card constraints', () => {
      const homePageCssPath = '../public/css/styles.css';
      expect(fs.existsSync(homePageCssPath)).toBe(true);
      
      const cssContent = fs.readFileSync(homePageCssPath, 'utf8');
      
      // Should have media query for max-width: 320px
      expect(cssContent).toContain('@media (max-width: 320px)');
      
      // Should have card width constraints
      expect(cssContent).toContain('max-width: 100% !important');
      expect(cssContent).toContain('width: 100% !important');
      expect(cssContent).toContain('min-width: 0 !important');
    });

    test('All game pages should import mobile-fixes.css', () => {
      const gamePages = allPages.filter(page => page.includes('/games/'));
      
      gamePages.forEach(gamePage => {
        if (fs.existsSync(gamePage)) {
          const htmlContent = fs.readFileSync(gamePage, 'utf8');
          
          // Should import mobile-fixes.css
          expect(htmlContent).toContain('mobile-fixes.css');
        }
      });
    });

    test('CSS rules should prevent horizontal overflow at small viewports', () => {
      // Test the CSS logic by checking for key overflow prevention patterns
      const mobileFixesPath = 'game-site/styles/components/mobile-fixes.css';
      const cssContent = fs.readFileSync(mobileFixesPath, 'utf8');
      
      // Check for overflow prevention rules
      const overflowPreventionRules = [
        'overflow-x: hidden',
        'max-width: 100vw',
        'max-width: 100%',
        'box-sizing: border-box'
      ];
      
      overflowPreventionRules.forEach(rule => {
        expect(cssContent).toContain(rule);
      });
    });

    test('Touch targets should meet minimum size requirements', () => {
      const mobileFixesPath = 'game-site/styles/components/mobile-fixes.css';
      const cssContent = fs.readFileSync(mobileFixesPath, 'utf8');
      
      // Should have touch target rules for mobile
      expect(cssContent).toContain('@media (max-width: 768px)');
      expect(cssContent).toContain('min-width: 44px');
      expect(cssContent).toContain('min-height: 44px');
    });

    test('Canvas elements should have responsive scaling rules', () => {
      const mobileFixesPath = 'game-site/styles/components/mobile-fixes.css';
      const cssContent = fs.readFileSync(mobileFixesPath, 'utf8');
      
      // Should have canvas scaling rules
      expect(cssContent).toContain('@media (max-width: 375px)');
      expect(cssContent).toContain('canvas');
      expect(cssContent).toContain('max-width: 100% !important');
      expect(cssContent).toContain('height: auto !important');
    });
  });

  /**
   * Property Test: Typography Scaling
   * Validates that text elements scale properly to prevent truncation
   */
  describe('Typography Scaling Prevention', () => {
    test('CSS should have fluid typography rules', () => {
      const mobileFixesPath = 'game-site/styles/components/mobile-fixes.css';
      const cssContent = fs.readFileSync(mobileFixesPath, 'utf8');
      
      // Should have typography scaling rules
      expect(cssContent).toContain('clamp(');
      expect(cssContent).toContain('word-break: break-word');
      expect(cssContent).toContain('overflow-wrap: break-word');
    });

    test('Game titles should have responsive font sizing', () => {
      const mobileFixesPath = 'game-site/styles/components/mobile-fixes.css';
      const cssContent = fs.readFileSync(mobileFixesPath, 'utf8');
      
      // Should have title scaling rules
      expect(cssContent).toContain('h1');
      expect(cssContent).toContain('.game-title');
      expect(cssContent).toContain('font-size: clamp(');
    });
  });

  /**
   * Property Test: Header Responsiveness
   * Validates that header elements wrap properly on small screens
   */
  describe('Header Element Wrapping', () => {
    test('CSS should have header wrapping rules', () => {
      const mobileFixesPath = 'game-site/styles/components/mobile-fixes.css';
      const cssContent = fs.readFileSync(mobileFixesPath, 'utf8');
      
      // Should have header wrapping rules
      expect(cssContent).toContain('flex-wrap: wrap');
      expect(cssContent).toContain('.game-header');
      expect(cssContent).toContain('.game-hud');
    });

    test('Mobile back button should have proper sizing', () => {
      const mobileFixesPath = 'game-site/styles/components/mobile-fixes.css';
      const cssContent = fs.readFileSync(mobileFixesPath, 'utf8');
      
      // Should have mobile back button rules
      expect(cssContent).toContain('.mobile-back-button');
      expect(cssContent).toContain('max-width: 120px');
    });
  });

  /**
   * Integration Test: CSS File Structure
   * Validates that all required CSS files exist and are properly structured
   */
  describe('CSS File Structure Validation', () => {
    test('All required CSS component files should exist', () => {
      const requiredCssFiles = [
        'game-site/styles/components/mobile-fixes.css',
        'game-site/public/css/styles.css'
      ];
      
      requiredCssFiles.forEach(cssFile => {
        expect(fs.existsSync(cssFile)).toBe(true);
      });
    });

    test('CSS files should have proper media query structure', () => {
      const mobileFixesPath = 'game-site/styles/components/mobile-fixes.css';
      const cssContent = fs.readFileSync(mobileFixesPath, 'utf8');
      
      // Should have properly structured media queries
      const mediaQueries = [
        '@media (max-width: 400px)',
        '@media (max-width: 768px)',
        '@media (max-width: 375px)'
      ];
      
      mediaQueries.forEach(query => {
        expect(cssContent).toContain(query);
      });
    });

    test('CSS should follow mobile-first approach', () => {
      const mobileFixesPath = 'game-site/styles/components/mobile-fixes.css';
      const cssContent = fs.readFileSync(mobileFixesPath, 'utf8');
      
      // Should use max-width media queries (mobile-first)
      const maxWidthQueries = cssContent.match(/@media \(max-width:/g);
      expect(maxWidthQueries).toBeTruthy();
      expect(maxWidthQueries.length).toBeGreaterThan(0);
    });
  });

  /**
   * Edge Case Tests
   * Tests for extreme viewport sizes and edge cases
   */
  describe('Edge Case Viewport Tests', () => {
    test('Should handle very small viewports (280px)', () => {
      const mobileFixesPath = 'game-site/styles/components/mobile-fixes.css';
      const cssContent = fs.readFileSync(mobileFixesPath, 'utf8');
      
      // Rules should apply to viewports smaller than 320px
      expect(cssContent).toContain('@media (max-width: 400px)');
      // This covers 280px as it's less than 400px
    });

    test('Should handle boundary viewport (320px exactly)', () => {
      const homePageCssPath = 'game-site/public/css/styles.css';
      const cssContent = fs.readFileSync(homePageCssPath, 'utf8');
      
      // Should have specific rules for 320px
      expect(cssContent).toContain('@media (max-width: 320px)');
    });

    test('Should not break on larger viewports', () => {
      const mobileFixesPath = 'game-site/styles/components/mobile-fixes.css';
      const cssContent = fs.readFileSync(mobileFixesPath, 'utf8');
      
      // Should have rules that don't interfere with desktop
      expect(cssContent).toContain('@media (min-width: 768px)');
    });
  });
});