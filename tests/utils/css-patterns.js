/**
 * CSS Patterns - Shared CSS Testing Patterns
 * Pure JavaScript - Zero Dependencies
 * 
 * Provides common CSS regex patterns and validation functions.
 */

/**
 * Common CSS regex patterns
 */
const CSS_PATTERNS = {
  // Media queries
  mediaQuery768: /@media\s*\(\s*max-width\s*:\s*768px\s*\)/,
  mediaQuery480: /@media\s*\(\s*max-width\s*:\s*480px\s*\)/,
  mediaQuery400: /@media\s*\(\s*max-width\s*:\s*400px\s*\)/,
  
  // Width constraints
  width100: /width\s*:\s*100%\s*!important/,
  maxWidthCalc: /max-width\s*:\s*calc\(100vw\s*-\s*(\d+)rem\)/,
  maxWidth100: /max-width\s*:\s*100%/,
  
  // Height constraints
  heightAuto: /height\s*:\s*auto\s*!important/,
  minHeight: /min-height\s*:\s*\d+px/,
  
  // Aspect ratio
  aspectRatio: /aspect-ratio\s*:\s*(\d+)\s*\/\s*(\d+)/,
  
  // Typography
  clampFontSize: /font-size\s*:\s*clamp\(/,
  clampValue: /clamp\(\s*([\d.]+)rem/g,
  wordBreak: /word-break\s*:\s*break-word/,
  wordWrap: /word-wrap\s*:\s*break-word/,
  whiteSpaceNormal: /white-space\s*:\s*normal/,
  whiteSpaceNowrap: /white-space\s*:\s*nowrap/,
  
  // Flexbox
  flexColumn: /flex-direction\s*:\s*column/,
  flexCenter: /align-items\s*:\s*center[\s\S]*?justify-content\s*:\s*center/,
  
  // Positioning
  insetZero: /inset\s*:\s*0/,
  textAlignCenter: /text-align\s*:\s*center/,
  
  // Overflow
  overflowHidden: /overflow-x\s*:\s*hidden/,
  
  // Fixed widths
  fixedWidth: /width\s*:\s*(\d+)px/g,
  
  // Padding
  paddingRem: /padding\s*:\s*[\d.]+rem\s+[\d.]+rem/,
  reducedPadding: /padding\s*:\s*0\.\d+rem/
};

/**
 * Check if CSS has a media query
 * @param {string} css - CSS content
 * @param {number} maxWidth - Max width value
 * @returns {boolean} True if media query exists
 */
function hasMediaQuery(css, maxWidth) {
  const pattern = new RegExp(`@media\\s*\\(\\s*max-width\\s*:\\s*${maxWidth}px\\s*\\)`);
  return pattern.test(css);
}

/**
 * Extract clamp minimum values from CSS
 * @param {string} css - CSS content
 * @returns {number[]} Array of minimum rem values
 */
function extractClampMinValues(css) {
  const matches = [...css.matchAll(CSS_PATTERNS.clampValue)];
  return matches.map(m => parseFloat(m[1]));
}

/**
 * Check if all clamp values meet minimum readability
 * @param {string} css - CSS content
 * @param {number} minRem - Minimum rem value (default 0.75)
 * @returns {boolean} True if all values are readable
 */
function hasReadableClampValues(css, minRem = 0.75) {
  const values = extractClampMinValues(css);
  return values.length === 0 || values.every(v => v >= minRem);
}

/**
 * Extract fixed width values from CSS
 * @param {string} css - CSS content
 * @returns {number[]} Array of fixed width pixel values
 */
function extractFixedWidths(css) {
  const matches = [...css.matchAll(CSS_PATTERNS.fixedWidth)];
  return matches.map(m => parseInt(m[1]));
}

/**
 * Check if CSS has responsive overlay styles
 * @param {string} css - CSS content
 * @returns {Object} Object with boolean flags for each style
 */
function checkOverlayStyles(css) {
  return {
    hasClampTypography: CSS_PATTERNS.clampFontSize.test(css),
    hasWordBreak: CSS_PATTERNS.wordBreak.test(css),
    hasWhiteSpaceNowrap: CSS_PATTERNS.whiteSpaceNowrap.test(css),
    hasFlexCenter: CSS_PATTERNS.flexCenter.test(css),
    hasInsetZero: CSS_PATTERNS.insetZero.test(css),
    hasTextAlignCenter: CSS_PATTERNS.textAlignCenter.test(css)
  };
}

/**
 * Check if CSS has responsive game board styles
 * @param {string} css - CSS content
 * @returns {Object} Object with boolean flags for each style
 */
function checkGameBoardStyles(css) {
  return {
    hasWidth100: CSS_PATTERNS.width100.test(css),
    hasMaxWidthCalc: CSS_PATTERNS.maxWidthCalc.test(css),
    hasHeightAuto: CSS_PATTERNS.heightAuto.test(css),
    hasAspectRatio: CSS_PATTERNS.aspectRatio.test(css),
    hasMinHeight: CSS_PATTERNS.minHeight.test(css)
  };
}

/**
 * Calculate effective max-width at a viewport
 * @param {string} css - CSS content
 * @param {number} viewportWidth - Viewport width in pixels
 * @returns {number|null} Effective max-width or null if not calculable
 */
function calculateEffectiveMaxWidth(css, viewportWidth) {
  const match = css.match(CSS_PATTERNS.maxWidthCalc);
  if (match) {
    const remValue = parseInt(match[1]);
    const pixelValue = remValue * 16; // 1rem = 16px
    return viewportWidth - pixelValue;
  }
  return null;
}

module.exports = {
  CSS_PATTERNS,
  hasMediaQuery,
  extractClampMinValues,
  hasReadableClampValues,
  extractFixedWidths,
  checkOverlayStyles,
  checkGameBoardStyles,
  calculateEffectiveMaxWidth
};
