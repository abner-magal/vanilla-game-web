#!/usr/bin/env node

/**
 * Main Test Runner
 * 
 * Runs all tests and provides a comprehensive report.
 * 
 * Usage:
 *   node game-site/tests/runners/index.js [category]
 * 
 * Categories:
 *   all        - Run all tests (default)
 *   property   - Run property tests only
 *   validation - Run validation tests only
 *   integration - Run integration tests only
 */

const path = require('path');
const fs = require('fs');

const CATEGORIES = {
  property: [
    '../property/game-board-fits-viewport.test.js',
    '../property/overlay-content-visibility.test.js',
    '../property/unique-entries.test.js',
    '../property/navbar-consistency.test.js',
    '../property/no-orphan-folders.test.js',
    '../property/games-json-paths.test.js'
  ],
  validation: [
    '../validation/space-invaders-overflow.test.js',
    '../validation/games-count.test.js'
  ],
  integration: [
    '../integration/navigation.test.js'
  ],
  // Legacy tests (original files, not yet migrated)
  legacy: [
    '../whack-a-mole-truncation.property.test.js',
    '../space-invaders-overflow.property.test.js',
    '../category-filter.property.test.js',
    '../debounce-property.test.js',
    '../drag-drop-pieces.property.test.js',
    '../balloon-pop-property.test.js',
    '../snake-property.test.js',
    '../text-truncation-validation.test.js',
    '../whack-a-mole-size.test.js',
    '../css-static.test.js',
    '../games-portuguese-descriptions.test.js',
    '../canvas-aspect-ratio.test.js',
    '../title-visibility.test.js',
    '../responsive-overflow.test.js',
    '../mobile-spacing.test.js',
    '../hamburger-menu.test.js',
    '../mobile-back-button.test.js',
    '../memory-match-interface.test.js',
    '../breakout-overlay.test.js',
    '../tetris-overlay.test.js',
    '../orphan-folders.test.js'
  ]
};

class TestRunner {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      categories: {}
    };
  }

  log(message, type = 'info') {
    const prefix = {
      error: '❌',
      success: '✅',
      header: '🎯',
      info: 'ℹ️',
      warning: '⚠️'
    }[type] || 'ℹ️';
    console.log(`${prefix} ${message}`);
  }

  async runTestFile(filePath) {
    const absolutePath = path.resolve(__dirname, filePath);
    
    if (!fs.existsSync(absolutePath)) {
      this.log(`Test file not found: ${filePath}`, 'warning');
      return { passed: 0, failed: 0, skipped: 1, filesPassed: 0, filesFailed: 0, filesSkipped: 1 };
    }

    try {
      // Clear require cache to ensure fresh run
      delete require.cache[require.resolve(absolutePath)];
      
      // Run the test file
      const testModule = require(absolutePath);
      
      // If the module exports a run function, call it
      let result;
      if (typeof testModule === 'function') {
        result = await testModule();
      } else if (typeof testModule.run === 'function') {
        result = await testModule.run();
      } else {
        result = { passed: 1, failed: 0, skipped: 0 };
      }
      
      // Add file-level tracking
      result.filesPassed = result.failed === 0 ? 1 : 0;
      result.filesFailed = result.failed > 0 ? 1 : 0;
      result.filesSkipped = 0;
      
      return result;
    } catch (error) {
      this.log(`Error running ${filePath}: ${error.message}`, 'error');
      return { passed: 0, failed: 1, skipped: 0, filesPassed: 0, filesFailed: 1, filesSkipped: 0 };
    }
  }

  async runCategory(category, files) {
    this.log(`\n${'═'.repeat(60)}`, 'header');
    this.log(`Running ${category.toUpperCase()} tests`, 'header');
    this.log(`${'═'.repeat(60)}`, 'header');

    const categoryResults = {
      files: files.length,
      filesPassed: 0,
      filesFailed: 0,
      filesSkipped: 0,
      assertions: 0,
      assertionsPassed: 0,
      assertionsFailed: 0
    };

    for (const file of files) {
      const result = await this.runTestFile(file);
      categoryResults.filesPassed += result.filesPassed || 0;
      categoryResults.filesFailed += result.filesFailed || 0;
      categoryResults.filesSkipped += result.filesSkipped || 0;
      categoryResults.assertions += (result.passed || 0) + (result.failed || 0);
      categoryResults.assertionsPassed += result.passed || 0;
      categoryResults.assertionsFailed += result.failed || 0;
    }

    this.results.categories[category] = categoryResults;
    this.results.total += categoryResults.files;
    this.results.passed += categoryResults.filesPassed;
    this.results.failed += categoryResults.filesFailed;
    this.results.skipped += categoryResults.filesSkipped;

    return categoryResults;
  }

  async run(category = 'all') {
    console.log('\n🧪 BN Games Test Runner\n');
    console.log(`Running: ${category === 'all' ? 'All Tests' : category + ' tests'}`);
    console.log(`Date: ${new Date().toISOString()}\n`);

    const categoriesToRun = category === 'all' 
      ? Object.keys(CATEGORIES) 
      : [category];

    for (const cat of categoriesToRun) {
      if (CATEGORIES[cat]) {
        await this.runCategory(cat, CATEGORIES[cat]);
      } else {
        this.log(`Unknown category: ${cat}`, 'warning');
      }
    }

    this.printSummary();
    return this.results;
  }

  printSummary() {
    console.log('\n' + '═'.repeat(60));
    console.log('📊 FINAL TEST SUMMARY');
    console.log('═'.repeat(60));
    
    console.log(`\n📋 Results by Category:`);
    let totalAssertions = 0;
    let passedAssertions = 0;
    
    for (const [cat, results] of Object.entries(this.results.categories)) {
      const status = results.filesFailed === 0 ? '✅' : '❌';
      const filesInfo = `${results.filesPassed}/${results.files} files`;
      const assertInfo = `${results.assertionsPassed}/${results.assertions} assertions`;
      console.log(`   ${status} ${cat}: ${filesInfo} (${assertInfo})`);
      totalAssertions += results.assertions || 0;
      passedAssertions += results.assertionsPassed || 0;
    }

    console.log(`\n📈 Overall Results:`);
    console.log(`   Test Files: ${this.results.total}`);
    console.log(`   ✅ Files Passed: ${this.results.passed}`);
    console.log(`   ❌ Files Failed: ${this.results.failed}`);
    console.log(`   ⏭️ Files Skipped: ${this.results.skipped}`);
    console.log(`   📊 Assertions: ${passedAssertions}/${totalAssertions} passed`);
    
    const successRate = this.results.total > 0 
      ? Math.round((this.results.passed / this.results.total) * 100) 
      : 0;
    console.log(`   Success Rate: ${successRate}%`);

    if (this.results.failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED!');
    } else {
      console.log(`\n⚠️ ${this.results.failed} test(s) failed.`);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const category = process.argv[2] || 'all';
  const runner = new TestRunner();
  
  runner.run(category).then(results => {
    process.exit(results.failed > 0 ? 1 : 0);
  }).catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = TestRunner;
