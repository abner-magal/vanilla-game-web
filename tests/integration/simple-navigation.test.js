// **Feature: bug-fixes-responsividade, Property 1: Logo Navigation Consistency**
// **Feature: bug-fixes-responsividade, Property 2: Back Button Navigation Consistency**

/**
 * Simple Navigation Consistency Tests
 * Tests for Requirements 1.1 and 1.3 - Logo and Back Button Navigation
 */

const fs = require('fs');
const path = require('path');

describe('Navigation Consistency Tests', () => {
  /**
   * Property 1: Logo Navigation Consistency
   * **Validates: Requirements 1.1**
   */
  describe('Property 1: Logo Navigation Consistency', () => {
    test('Root index.html should exist and redirect correctly', () => {
      const rootIndexPath = path.join(__dirname, '../index.html');
      
      expect(fs.existsSync(rootIndexPath)).toBe(true);
      
      const htmlContent = fs.readFileSync(rootIndexPath, 'utf8');
      
      // Check for meta refresh
      expect(htmlContent).toContain('http-equiv="refresh"');
      expect(htmlContent).toContain('url=./public/index.html');
      
      // Check for JavaScript redirect
      expect(htmlContent).toContain("window.location.href = './public/index.html'");
      
      // Check for noscript fallback
      expect(htmlContent).toContain('<noscript>');
      expect(htmlContent).toContain('href="./public/index.html"');
    });

    test('Game pages should have correct navigation links', () => {
      const snakePagePath = path.join(__dirname, '../src/games/snake/index.html');
      
      if (fs.existsSync(snakePagePath)) {
        const htmlContent = fs.readFileSync(snakePagePath, 'utf8');
        
        // Check for BN GAMES branding
        expect(htmlContent).toContain('BN');
        expect(htmlContent).toContain('GAMES');
        
        // Check for correct navigation href
        expect(htmlContent).toContain('href="../../../public/index.html"');
        
        // Check for "Voltar ao Hub" text
        expect(htmlContent).toContain('Voltar ao Hub');
        
        // Check for mobile back button
        expect(htmlContent).toContain('mobile-back-button');
      }
    });
  });

  /**
   * Property 2: Back Button Navigation Consistency
   * **Validates: Requirements 1.3**
   */
  describe('Property 2: Back Button Navigation Consistency', () => {
    test('All game pages should have consistent back navigation', () => {
      const gameDirectories = [
        'snake', 'tetris', 'memory-match', 'pong', 'balloon-pop',
        'space-invaders', 'breakout', 'drag-drop', 'simon-says', 'whack-a-mole'
      ];
      
      let checkedPages = 0;
      
      gameDirectories.forEach(gameDir => {
        const gamePage = path.join(__dirname, `../src/games/${gameDir}/index.html`);
        
        if (fs.existsSync(gamePage)) {
          checkedPages++;
          const htmlContent = fs.readFileSync(gamePage, 'utf8');
          
          // Should have "Voltar ao Hub" text
          expect(htmlContent).toContain('Voltar ao Hub');
          
          // Should have correct relative path
          expect(htmlContent).toContain('href="../../../public/index.html"');
          
          // Should have mobile back button
          expect(htmlContent).toContain('mobile-back-button');
        }
      });
      
      // Should have checked at least some pages
      expect(checkedPages).toBeGreaterThan(0);
    });
  });
});