// **Feature: bug-fixes-responsividade, Property 3: No Horizontal Overflow at 320px**

/**
 * Simple Responsive Overflow Prevention Tests
 * Tests for Requirements 2.1 and 2.2 - Overflow Prevention
 */

const fs = require('fs');
const path = require('path');

describe('Horizontal Overflow Prevention Tests', () => {
  /**
   * Property 3: No Horizontal Overflow at 320px
   * **Validates: Requirements 2.1, 2.2**
   */
  describe('Property 3: No Horizontal Overflow at 320px', () => {
    test('Mobile fixes CSS should exist and have overflow prevention rules', () => {
      const mobileFixesPath = path.join(__dirname, '../styles/components/mobile-fixes.css');
      
      expect(fs.existsSync(mobileFixesPath)).toBe(true);
      
      const cssContent = fs.readFileSync(mobileFixesPath, 'utf8');
      
      // Should have media query for max-width: 400px
      expect(cssContent).toContain('@media (max-width: 400px)');
      
      // Should have overflow-x: hidden rule
      expect(cssContent).toContain('overflow-x: hidden');
      
      // Should have max-width: 100% fallback
      expect(cssContent).toContain('max-width: 100%');
      
      // Should have touch target rules
      expect(cssContent).toContain('@media (max-width: 768px)');
      expect(cssContent).toContain('min-width: 44px');
      expect(cssContent).toContain('min-height: 44px');
    });

    test('Home page CSS should have 320px card constraints', () => {
      const homePageCssPath = path.join(__dirname, '../public/css/styles.css');
      
      expect(fs.existsSync(homePageCssPath)).toBe(true);
      
      const cssContent = fs.readFileSync(homePageCssPath, 'utf8');
      
      // Should have media query for max-width: 320px
      expect(cssContent).toContain('@media (max-width: 320px)');
      
      // Should have card width constraints
      expect(cssContent).toContain('max-width: 100% !important');
      expect(cssContent).toContain('width: 100% !important');
      expect(cssContent).toContain('min-width: 0 !important');
      
      // Should have game grid rules
      expect(cssContent).toContain('#gamesGrid');
    });

    test('Game pages should import mobile-fixes.css', () => {
      const gameDirectories = [
        'snake', 'tetris', 'memory-match', 'pong', 'balloon-pop'
      ];
      
      let checkedPages = 0;
      
      gameDirectories.forEach(gameDir => {
        const gamePage = path.join(__dirname, `../src/games/${gameDir}/index.html`);
        
        if (fs.existsSync(gamePage)) {
          checkedPages++;
          const htmlContent = fs.readFileSync(gamePage, 'utf8');
          
          // Should import mobile-fixes.css
          expect(htmlContent).toContain('mobile-fixes.css');
        }
      });
      
      // Should have checked at least some pages
      expect(checkedPages).toBeGreaterThan(0);
    });

    test('CSS should have responsive typography rules', () => {
      const mobileFixesPath = path.join(__dirname, '../styles/components/mobile-fixes.css');
      const cssContent = fs.readFileSync(mobileFixesPath, 'utf8');
      
      // Should have typography scaling rules
      expect(cssContent).toContain('clamp(');
      expect(cssContent).toContain('word-break: break-word');
      
      // Should have canvas scaling rules
      expect(cssContent).toContain('@media (max-width: 375px)');
      expect(cssContent).toContain('canvas');
    });
  });
});