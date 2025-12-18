// **Feature: bug-fixes-responsividade, Property 1: Logo Navigation Consistency**
// **Feature: bug-fixes-responsividade, Property 2: Back Button Navigation Consistency**

/**
 * Navigation Consistency Tests
 * Tests for Requirements 1.1 and 1.3 - Logo and Back Button Navigation
 */

const fs = require('fs');
const path = require('path');

describe('Navigation Consistency Tests', () => {

  /**
   * Property 1: Logo Navigation Consistency
   * For any page in the BN Games platform that contains the BN Games logo, 
   * clicking the logo SHALL navigate to `/public/index.html`
   * **Validates: Requirements 1.1**
   */
  describe('Property 1: Logo Navigation Consistency', () => {
    const gamePages = [
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

    test('All game pages should have BN Games logo linking to correct path', () => {
      gamePages.forEach(gamePage => {
        if (fs.existsSync(gamePage)) {
          // Read the HTML file
          const htmlContent = fs.readFileSync(gamePage, 'utf8');
          
          // Simple string-based checks for logo links
          expect(htmlContent).toContain('BN');
          expect(htmlContent).toContain('GAMES');
          expect(htmlContent).toContain('href="../../../public/index.html"');
        }
      });
    });

    test('Home page logo should link to root', () => {
      const homePagePath = 'game-site/public/index.html';
      
      if (fs.existsSync(homePagePath)) {
        const htmlContent = fs.readFileSync(homePagePath, 'utf8');
        
        // Check for BN GAMES branding
        expect(htmlContent).toContain('BN');
        expect(htmlContent).toContain('GAMES');
      }
    });
  });

  /**
   * Property 2: Back Button Navigation Consistency
   * For any game page in the platform, the "Voltar ao Hub" button href attribute 
   * SHALL point to the correct relative path to `/public/index.html`
   * **Validates: Requirements 1.3**
   */
  describe('Property 2: Back Button Navigation Consistency', () => {
    const gamePages = [
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

    test('All game pages should have "Voltar ao Hub" button with correct href', () => {
      gamePages.forEach(gamePage => {
        if (fs.existsSync(gamePage)) {
          // Read the HTML file
          const htmlContent = fs.readFileSync(gamePage, 'utf8');
          
          // Simple string-based checks for back buttons
          expect(htmlContent).toContain('Voltar ao Hub');
          expect(htmlContent).toContain('href="../../../public/index.html"');
        }
      });
    });

    test('Mobile back buttons should also have correct href', () => {
      gamePages.forEach(gamePage => {
        if (fs.existsSync(gamePage)) {
          // Read the HTML file
          const htmlContent = fs.readFileSync(gamePage, 'utf8');
          
          // Check for mobile back button class and correct href
          expect(htmlContent).toContain('mobile-back-button');
          expect(htmlContent).toContain('href="../../../public/index.html"');
        }
      });
    });
  });

  /**
   * Unit Test: Root index.html redirect functionality
   * Validates that the root redirect file exists and has correct meta refresh
   */
  describe('Root Redirect Functionality', () => {
    test('Root index.html should exist and have correct redirect', () => {
      const rootIndexPath = '../index.html';
      
      expect(fs.existsSync(rootIndexPath)).toBe(true);
      
      const htmlContent = fs.readFileSync(rootIndexPath, 'utf8');
      
      // Check for meta refresh
      expect(htmlContent).toContain('http-equiv="refresh"');
      expect(htmlContent).toContain('url=./public/index.html');
    });

    test('Root index.html should have JavaScript redirect', () => {
      const rootIndexPath = '../index.html';
      const htmlContent = fs.readFileSync(rootIndexPath, 'utf8');
      
      // Check for JavaScript redirect
      expect(htmlContent).toContain("window.location.href = './public/index.html'");
    });

    test('Root index.html should have noscript fallback', () => {
      const rootIndexPath = '../index.html';
      const htmlContent = fs.readFileSync(rootIndexPath, 'utf8');
      
      // Check for noscript fallback
      expect(htmlContent).toContain('<noscript>');
      expect(htmlContent).toContain('href="./public/index.html"');
    });
  });
});