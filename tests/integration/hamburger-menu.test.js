/**
 * Unit Tests for Hamburger Menu - Mobile Navigation
 * Pure JavaScript - Zero Dependencies
 * 
 * Tests:
 * - 4.1: Menu visibility toggle
 * - 4.2: Menu closes when clicking outside
 * - 4.3: Menu closes when clicking nav link
 * 
 * Run with: node game-site/tests/hamburger-menu.test.js
 * 
 * **Feature: bn-games-bug-fixes, Requirement 4: Hamburger Menu Mobile**
 * **Validates: Requirements 4.1, 4.2, 4.3**
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
// MOCK DOM IMPLEMENTATION
// ============================================================

class MockElement {
  constructor(tagName, id = null) {
    this.tagName = tagName;
    this.id = id;
    this.classList = new MockClassList();
    this.attributes = {};
    this.children = [];
    this.parentElement = null;
    this.eventListeners = {};
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  getAttribute(name) {
    return this.attributes[name] || null;
  }

  addEventListener(event, handler) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(handler);
  }

  removeEventListener(event, handler) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(h => h !== handler);
    }
  }

  dispatchEvent(event) {
    const handlers = this.eventListeners[event.type] || [];
    handlers.forEach(handler => handler(event));
  }

  contains(element) {
    if (element === this) return true;
    return this.children.some(child => child.contains(element));
  }

  appendChild(child) {
    child.parentElement = this;
    this.children.push(child);
  }

  querySelectorAll(selector) {
    // Simple implementation for .nav-link
    if (selector === '.nav-link') {
      return this.children.filter(c => c.classList.contains('nav-link'));
    }
    return [];
  }

  focus() {
    // Mock focus
  }
}

class MockClassList {
  constructor() {
    this.classes = new Set();
  }

  add(className) {
    this.classes.add(className);
  }

  remove(className) {
    this.classes.delete(className);
  }

  toggle(className) {
    if (this.classes.has(className)) {
      this.classes.delete(className);
      return false;
    } else {
      this.classes.add(className);
      return true;
    }
  }

  contains(className) {
    return this.classes.has(className);
  }
}

// ============================================================
// HAMBURGER MENU LOGIC (Extracted for testing)
// ============================================================

class HamburgerMenuController {
  constructor(hamburgerBtn, navLinks) {
    this.hamburgerBtn = hamburgerBtn;
    this.navLinks = navLinks;
    this.isOpen = false;
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.navLinks.classList.add('active');
    this.hamburgerBtn.classList.add('active');
    this.hamburgerBtn.setAttribute('aria-expanded', 'true');
    this.isOpen = true;
  }

  close() {
    this.navLinks.classList.remove('active');
    this.hamburgerBtn.classList.remove('active');
    this.hamburgerBtn.setAttribute('aria-expanded', 'false');
    this.isOpen = false;
  }

  handleOutsideClick(target) {
    if (this.isOpen && 
        !this.navLinks.contains(target) && 
        !this.hamburgerBtn.contains(target)) {
      this.close();
    }
  }

  handleNavLinkClick() {
    this.close();
  }

  handleEscapeKey() {
    if (this.isOpen) {
      this.close();
    }
  }
}

// ============================================================
// TEST SUITE 4.1: Menu Visibility Toggle
// ============================================================

describe('4.1 Hamburger Menu - Visibility Toggle', () => {
  it('menu starts closed', () => {
    const hamburgerBtn = new MockElement('button', 'hamburgerBtn');
    const navLinks = new MockElement('div', 'navLinks');
    const controller = new HamburgerMenuController(hamburgerBtn, navLinks);

    assertEqual(controller.isOpen, false, 'Menu starts closed');
    assertEqual(navLinks.classList.contains('active'), false, 'navLinks does not have active class');
    assertEqual(hamburgerBtn.classList.contains('active'), false, 'hamburgerBtn does not have active class');
  });

  it('toggle opens closed menu', () => {
    const hamburgerBtn = new MockElement('button', 'hamburgerBtn');
    const navLinks = new MockElement('div', 'navLinks');
    const controller = new HamburgerMenuController(hamburgerBtn, navLinks);

    controller.toggle();

    assertEqual(controller.isOpen, true, 'Menu is open after toggle');
    assertEqual(navLinks.classList.contains('active'), true, 'navLinks has active class');
    assertEqual(hamburgerBtn.classList.contains('active'), true, 'hamburgerBtn has active class');
    assertEqual(hamburgerBtn.getAttribute('aria-expanded'), 'true', 'aria-expanded is true');
  });

  it('toggle closes open menu', () => {
    const hamburgerBtn = new MockElement('button', 'hamburgerBtn');
    const navLinks = new MockElement('div', 'navLinks');
    const controller = new HamburgerMenuController(hamburgerBtn, navLinks);

    controller.open();
    controller.toggle();

    assertEqual(controller.isOpen, false, 'Menu is closed after second toggle');
    assertEqual(navLinks.classList.contains('active'), false, 'navLinks does not have active class');
    assertEqual(hamburgerBtn.classList.contains('active'), false, 'hamburgerBtn does not have active class');
    assertEqual(hamburgerBtn.getAttribute('aria-expanded'), 'false', 'aria-expanded is false');
  });

  it('multiple toggles work correctly', () => {
    const hamburgerBtn = new MockElement('button', 'hamburgerBtn');
    const navLinks = new MockElement('div', 'navLinks');
    const controller = new HamburgerMenuController(hamburgerBtn, navLinks);

    // Toggle 5 times
    for (let i = 0; i < 5; i++) {
      controller.toggle();
    }

    // After odd number of toggles, should be open
    assertEqual(controller.isOpen, true, 'Menu is open after 5 toggles');
    
    controller.toggle();
    assertEqual(controller.isOpen, false, 'Menu is closed after 6 toggles');
  });
});

// ============================================================
// TEST SUITE 4.2: Close Menu When Clicking Outside
// ============================================================

describe('4.2 Hamburger Menu - Close on Outside Click', () => {
  it('clicking outside closes open menu', () => {
    const hamburgerBtn = new MockElement('button', 'hamburgerBtn');
    const navLinks = new MockElement('div', 'navLinks');
    const outsideElement = new MockElement('div', 'outside');
    const controller = new HamburgerMenuController(hamburgerBtn, navLinks);

    controller.open();
    assertEqual(controller.isOpen, true, 'Menu is open before outside click');

    controller.handleOutsideClick(outsideElement);
    assertEqual(controller.isOpen, false, 'Menu is closed after outside click');
  });

  it('clicking inside menu does not close it', () => {
    const hamburgerBtn = new MockElement('button', 'hamburgerBtn');
    const navLinks = new MockElement('div', 'navLinks');
    const insideElement = new MockElement('a', 'link');
    navLinks.appendChild(insideElement);
    const controller = new HamburgerMenuController(hamburgerBtn, navLinks);

    controller.open();
    controller.handleOutsideClick(insideElement);

    assertEqual(controller.isOpen, true, 'Menu stays open when clicking inside');
  });

  it('clicking hamburger button does not close menu via outside handler', () => {
    const hamburgerBtn = new MockElement('button', 'hamburgerBtn');
    const navLinks = new MockElement('div', 'navLinks');
    const controller = new HamburgerMenuController(hamburgerBtn, navLinks);

    controller.open();
    controller.handleOutsideClick(hamburgerBtn);

    assertEqual(controller.isOpen, true, 'Menu stays open when clicking hamburger');
  });

  it('outside click on closed menu does nothing', () => {
    const hamburgerBtn = new MockElement('button', 'hamburgerBtn');
    const navLinks = new MockElement('div', 'navLinks');
    const outsideElement = new MockElement('div', 'outside');
    const controller = new HamburgerMenuController(hamburgerBtn, navLinks);

    controller.handleOutsideClick(outsideElement);
    assertEqual(controller.isOpen, false, 'Menu stays closed');
    assertEqual(navLinks.classList.contains('active'), false, 'No active class added');
  });
});

// ============================================================
// TEST SUITE 4.3: Close Menu When Clicking Nav Link
// ============================================================

describe('4.3 Hamburger Menu - Close on Nav Link Click', () => {
  it('clicking nav link closes menu', () => {
    const hamburgerBtn = new MockElement('button', 'hamburgerBtn');
    const navLinks = new MockElement('div', 'navLinks');
    const controller = new HamburgerMenuController(hamburgerBtn, navLinks);

    controller.open();
    assertEqual(controller.isOpen, true, 'Menu is open before nav link click');

    controller.handleNavLinkClick();
    assertEqual(controller.isOpen, false, 'Menu is closed after nav link click');
  });

  it('escape key closes menu', () => {
    const hamburgerBtn = new MockElement('button', 'hamburgerBtn');
    const navLinks = new MockElement('div', 'navLinks');
    const controller = new HamburgerMenuController(hamburgerBtn, navLinks);

    controller.open();
    controller.handleEscapeKey();

    assertEqual(controller.isOpen, false, 'Menu is closed after escape key');
  });

  it('escape key on closed menu does nothing', () => {
    const hamburgerBtn = new MockElement('button', 'hamburgerBtn');
    const navLinks = new MockElement('div', 'navLinks');
    const controller = new HamburgerMenuController(hamburgerBtn, navLinks);

    controller.handleEscapeKey();
    assertEqual(controller.isOpen, false, 'Menu stays closed');
  });
});

// ============================================================
// TEST SUITE: Accessibility
// ============================================================

describe('4.4 Hamburger Menu - Accessibility', () => {
  it('aria-expanded is correctly set on open', () => {
    const hamburgerBtn = new MockElement('button', 'hamburgerBtn');
    const navLinks = new MockElement('div', 'navLinks');
    const controller = new HamburgerMenuController(hamburgerBtn, navLinks);

    controller.open();
    assertEqual(hamburgerBtn.getAttribute('aria-expanded'), 'true', 'aria-expanded is true when open');
  });

  it('aria-expanded is correctly set on close', () => {
    const hamburgerBtn = new MockElement('button', 'hamburgerBtn');
    const navLinks = new MockElement('div', 'navLinks');
    const controller = new HamburgerMenuController(hamburgerBtn, navLinks);

    controller.open();
    controller.close();
    assertEqual(hamburgerBtn.getAttribute('aria-expanded'), 'false', 'aria-expanded is false when closed');
  });
});

// ============================================================
// FINAL REPORT
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('📊 HAMBURGER MENU UNIT TEST RESULTS');
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
  console.log('\n🎉 All hamburger menu tests passed!');
  process.exit(0);
}
