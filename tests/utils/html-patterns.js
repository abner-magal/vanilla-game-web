/**
 * HTML Patterns - Shared HTML Testing Patterns
 * Pure JavaScript - Zero Dependencies
 * 
 * Provides common HTML regex patterns and validation functions.
 */

/**
 * Common HTML regex patterns
 */
const HTML_PATTERNS = {
  // IDs
  gameBoard: /id=["']game-board["']/,
  gameContainer: /id=["']game-container["']/,
  startScreen: /id=["']start-screen["']/,
  pauseScreen: /id=["']pause-screen["']/,
  gameOverScreen: /id=["']game-over-screen["']/,
  btnStart: /id=["']btn-start["']/,
  btnResume: /id=["']btn-resume["']/,
  btnRestart: /id=["']btn-restart["']/,
  finalScore: /id=["']final-score["']/,
  
  // Classes
  overlayScreen: /class=["'][^"']*overlay-screen[^"']*["']/g,
  overlayContent: /class=["'][^"']*overlay-content[^"']*["']/g,
  overlayResponsive: /overlay-responsive/g,
  
  // CSS imports
  mobileFixes: /mobile-fixes\.css/,
  gameResponsive: /game-responsive\.css/,
  
  // Navigation
  backToHub: /Voltar\s*(ao\s*)?Hub|Back\s*to\s*Hub/i,
  logoLink: /BN\s*GAMES/i,
  
  // HUD elements
  hud: /hud|score|lives/i,
  
  // Navbar
  navbar: /<nav[^>]*>/i
};

/**
 * Check if HTML has an element with specific ID
 * @param {string} html - HTML content
 * @param {string} id - Element ID
 * @returns {boolean} True if element exists
 */
function hasElementById(html, id) {
  const pattern = new RegExp(`id=["']${id}["']`);
  return pattern.test(html);
}

/**
 * Check if HTML has an element with specific class
 * @param {string} html - HTML content
 * @param {string} className - Class name
 * @returns {boolean} True if element exists
 */
function hasElementByClass(html, className) {
  const pattern = new RegExp(`class=["'][^"']*${className}[^"']*["']`);
  return pattern.test(html);
}

/**
 * Count occurrences of a class in HTML
 * @param {string} html - HTML content
 * @param {string} className - Class name
 * @returns {number} Number of occurrences
 */
function countClassOccurrences(html, className) {
  const pattern = new RegExp(`class=["'][^"']*${className}[^"']*["']`, 'g');
  const matches = html.match(pattern);
  return matches ? matches.length : 0;
}

/**
 * Check if HTML imports a CSS file
 * @param {string} html - HTML content
 * @param {string} cssFile - CSS filename
 * @returns {boolean} True if CSS is imported
 */
function importsCssFile(html, cssFile) {
  const pattern = new RegExp(cssFile.replace('.', '\\.'));
  return pattern.test(html);
}

/**
 * Check if HTML has all required overlay elements
 * @param {string} html - HTML content
 * @returns {Object} Object with boolean flags for each element
 */
function checkOverlayElements(html) {
  return {
    hasStartScreen: HTML_PATTERNS.startScreen.test(html),
    hasPauseScreen: HTML_PATTERNS.pauseScreen.test(html),
    hasGameOverScreen: HTML_PATTERNS.gameOverScreen.test(html),
    hasBtnStart: HTML_PATTERNS.btnStart.test(html),
    hasBtnResume: HTML_PATTERNS.btnResume.test(html),
    hasBtnRestart: HTML_PATTERNS.btnRestart.test(html),
    hasFinalScore: HTML_PATTERNS.finalScore.test(html)
  };
}

/**
 * Check if HTML has navigation elements
 * @param {string} html - HTML content
 * @returns {Object} Object with boolean flags for each element
 */
function checkNavigationElements(html) {
  return {
    hasNavbar: HTML_PATTERNS.navbar.test(html),
    hasBackToHub: HTML_PATTERNS.backToHub.test(html),
    hasLogo: HTML_PATTERNS.logoLink.test(html)
  };
}

/**
 * Check if HTML has required CSS imports
 * @param {string} html - HTML content
 * @returns {Object} Object with boolean flags for each import
 */
function checkCssImports(html) {
  return {
    hasMobileFixes: HTML_PATTERNS.mobileFixes.test(html),
    hasGameResponsive: HTML_PATTERNS.gameResponsive.test(html)
  };
}

/**
 * Extract all IDs from HTML
 * @param {string} html - HTML content
 * @returns {string[]} Array of IDs
 */
function extractAllIds(html) {
  const pattern = /id=["']([^"']+)["']/g;
  const matches = [...html.matchAll(pattern)];
  return matches.map(m => m[1]);
}

/**
 * Extract all classes from HTML
 * @param {string} html - HTML content
 * @returns {string[]} Array of unique class names
 */
function extractAllClasses(html) {
  const pattern = /class=["']([^"']+)["']/g;
  const matches = [...html.matchAll(pattern)];
  const allClasses = matches.flatMap(m => m[1].split(/\s+/));
  return [...new Set(allClasses)];
}

module.exports = {
  HTML_PATTERNS,
  hasElementById,
  hasElementByClass,
  countClassOccurrences,
  importsCssFile,
  checkOverlayElements,
  checkNavigationElements,
  checkCssImports,
  extractAllIds,
  extractAllClasses
};
