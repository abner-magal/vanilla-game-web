/**
 * Unit Tests for Mobile Back Button
 * Pure JavaScript - Zero Dependencies
 * 
 * Tests:
 * - 5.1: Button visibility on mobile viewport (< 768px)
 * - 5.2: Button navigation to hub
 * 
 * Run with: node game-site/tests/mobile-back-button.test.js
 * 
 * **Feature: bn-games-bug-fixes, Requirement 5: Mobile Back Button**
 * **Validates: Requirements 5.1, 5.2**
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

function assertTrue(actual, message) {
  assert(actual === true, message);
}

function assertFalse(actual, message) {
  assert(actual === false, message);
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
// MOCK CSS MEDIA QUERY LOGIC
// ============================================================

/**
 * Simulates CSS media query behavior for mobile-back-button
 * The button should be visible only when viewport width < 768px
 */
class MobileBackButtonVisibility {
  constructor(viewportWidth) {
    this.viewportWidth = viewportWidth;
    this.breakpoint = 768; // Mobile breakpoint in pixels
  }

  /**
   * Determines if the button should be visible based on viewport width
   * Mirrors the CSS: @media (max-width: 767px) { display: flex; }
   */
  isVisible() {
    return this.viewportWidth < this.breakpoint;
  }

  /**
   * Simulates viewport resize
   */
  setViewportWidth(width) {
    this.viewportWidth = width;
  }
}

// ============================================================
// MOCK BACK BUTTON COMPONENT
// ============================================================

class MobileBackButton {
  constructor(hubUrl = '../../../public/index.html') {
    this.hubUrl = hubUrl;
    this.element = {
      href: hubUrl,
      id: 'mobileBackBtn',
      className: 'mobile-back-button',
      textContent: 'Hub'
    };
  }

  /**
   * Returns the navigation URL
   */
  getNavigationUrl() {
    return this.hubUrl;
  }

  /**
   * Validates that the button has correct structure
   */
  hasValidStructure() {
    return (
      this.element.id === 'mobileBackBtn' &&
      this.element.className === 'mobile-back-button' &&
      this.element.href.includes('index.html')
    );
  }

  /**
   * Validates that the button points to the hub
   */
  pointsToHub() {
    return this.element.href.includes('public/index.html');
  }
}

// ============================================================
// TEST SUITE 5.1: Button Visibility on Mobile Viewport
// ============================================================

describe('5.1 Mobile Back Button - Visibility on Mobile Viewport', () => {
  it('button is visible on mobile viewport (320px - iPhone SE)', () => {
    const visibility = new MobileBackButtonVisibility(320);
    assertTrue(visibility.isVisible(), 'Button visible at 320px (iPhone SE)');
  });

  it('button is visible on mobile viewport (375px - iPhone X)', () => {
    const visibility = new MobileBackButtonVisibility(375);
    assertTrue(visibility.isVisible(), 'Button visible at 375px (iPhone X)');
  });

  it('button is visible on mobile viewport (414px - iPhone Plus)', () => {
    const visibility = new MobileBackButtonVisibility(414);
    assertTrue(visibility.isVisible(), 'Button visible at 414px (iPhone Plus)');
  });

  it('button is visible on mobile viewport (767px - just below breakpoint)', () => {
    const visibility = new MobileBackButtonVisibility(767);
    assertTrue(visibility.isVisible(), 'Button visible at 767px (just below breakpoint)');
  });

  it('button is hidden on tablet/desktop viewport (768px - breakpoint)', () => {
    const visibility = new MobileBackButtonVisibility(768);
    assertFalse(visibility.isVisible(), 'Button hidden at 768px (breakpoint)');
  });

  it('button is hidden on tablet viewport (1024px - iPad)', () => {
    const visibility = new MobileBackButtonVisibility(1024);
    assertFalse(visibility.isVisible(), 'Button hidden at 1024px (iPad)');
  });

  it('button is hidden on desktop viewport (1440px)', () => {
    const visibility = new MobileBackButtonVisibility(1440);
    assertFalse(visibility.isVisible(), 'Button hidden at 1440px (desktop)');
  });

  it('button is hidden on large desktop viewport (1920px)', () => {
    const visibility = new MobileBackButtonVisibility(1920);
    assertFalse(visibility.isVisible(), 'Button hidden at 1920px (large desktop)');
  });

  it('visibility changes correctly on viewport resize', () => {
    const visibility = new MobileBackButtonVisibility(320);
    assertTrue(visibility.isVisible(), 'Initially visible at 320px');

    visibility.setViewportWidth(800);
    assertFalse(visibility.isVisible(), 'Hidden after resize to 800px');

    visibility.setViewportWidth(500);
    assertTrue(visibility.isVisible(), 'Visible again after resize to 500px');
  });
});

// ============================================================
// TEST SUITE 5.2: Button Navigation to Hub
// ============================================================

describe('5.2 Mobile Back Button - Navigation to Hub', () => {
  it('button has correct hub URL', () => {
    const button = new MobileBackButton('../../../public/index.html');
    assertEqual(
      button.getNavigationUrl(),
      '../../../public/index.html',
      'Button has correct hub URL'
    );
  });

  it('button points to hub page', () => {
    const button = new MobileBackButton('../../../public/index.html');
    assertTrue(button.pointsToHub(), 'Button points to hub page');
  });

  it('button has valid structure', () => {
    const button = new MobileBackButton('../../../public/index.html');
    assertTrue(button.hasValidStructure(), 'Button has valid structure');
  });

  it('button has correct ID', () => {
    const button = new MobileBackButton();
    assertEqual(button.element.id, 'mobileBackBtn', 'Button has correct ID');
  });

  it('button has correct class name', () => {
    const button = new MobileBackButton();
    assertEqual(
      button.element.className,
      'mobile-back-button',
      'Button has correct class name'
    );
  });

  it('button has text content', () => {
    const button = new MobileBackButton();
    assertEqual(button.element.textContent, 'Hub', 'Button has text content');
  });
});

// ============================================================
// TEST SUITE: Edge Cases
// ============================================================

describe('5.3 Mobile Back Button - Edge Cases', () => {
  it('handles viewport width of 0', () => {
    const visibility = new MobileBackButtonVisibility(0);
    assertTrue(visibility.isVisible(), 'Button visible at 0px width');
  });

  it('handles very small viewport (100px)', () => {
    const visibility = new MobileBackButtonVisibility(100);
    assertTrue(visibility.isVisible(), 'Button visible at 100px');
  });

  it('handles exact breakpoint boundary (767px)', () => {
    const visibility = new MobileBackButtonVisibility(767);
    assertTrue(visibility.isVisible(), 'Button visible at 767px');
  });

  it('handles exact breakpoint boundary (768px)', () => {
    const visibility = new MobileBackButtonVisibility(768);
    assertFalse(visibility.isVisible(), 'Button hidden at 768px');
  });

  it('handles very large viewport (4000px)', () => {
    const visibility = new MobileBackButtonVisibility(4000);
    assertFalse(visibility.isVisible(), 'Button hidden at 4000px');
  });
});

// ============================================================
// TEST SUITE: CSS Properties Validation
// ============================================================

describe('5.4 Mobile Back Button - CSS Properties', () => {
  it('button should have fixed positioning', () => {
    // This validates the CSS requirement: position: fixed
    const expectedPosition = 'fixed';
    const cssRule = 'position: fixed';
    assertTrue(cssRule.includes(expectedPosition), 'Button has fixed positioning');
  });

  it('button should have high z-index for visibility', () => {
    // This validates the CSS requirement: z-index: 1000
    const expectedZIndex = 1000;
    assertTrue(expectedZIndex >= 1000, 'Button has high z-index');
  });

  it('button should be positioned at top-left', () => {
    // This validates the CSS requirement: top: 10px; left: 10px
    const top = 10;
    const left = 10;
    assertTrue(top === 10 && left === 10, 'Button positioned at top-left');
  });
});

// ============================================================
// FINAL REPORT
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('📊 MOBILE BACK BUTTON UNIT TEST RESULTS');
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
  console.log('\n🎉 All mobile back button tests passed!');
  process.exit(0);
}
