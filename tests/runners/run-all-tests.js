/**
 * Comprehensive Test Runner for BN Games Bug Fixes
 * 
 * Runs all tests created for the responsiveness bug fixes spec.
 * Provides a complete overview of the project's test coverage.
 */

const SimpleNavigationTest = require('./simple-navigation.test.js');
const SimpleResponsiveTest = require('./simple-responsive.test.js');
const MemoryMatchInterfaceTest = require('./memory-match-interface.test.js');
const TitleVisibilityTest = require('./title-visibility.test.js');
const CanvasAspectRatioTest = require('./canvas-aspect-ratio.test.js');

class ComprehensiveTestRunner {
  constructor() {
    this.allResults = [];
    this.testSuites = [
      { name: 'Navigation Consistency', class: SimpleNavigationTest },
      { name: 'Responsive Design', class: SimpleResponsiveTest },
      { name: 'Memory Match Interface', class: MemoryMatchInterfaceTest },
      { name: 'Title Visibility', class: TitleVisibilityTest },
      { name: 'Canvas Aspect Ratio', class: CanvasAspectRatioTest }
    ];
  }

  log(message, type = 'info') {
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'header' ? '🎯' : 'ℹ️';
    console.log(`${prefix} ${message}`);
  }

  async runAllTests() {
    this.log('🧪 Running Comprehensive BN Games Test Suite...\n', 'header');
    
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;

    for (const suite of this.testSuites) {
      this.log(`\n📋 Running ${suite.name} Tests`, 'header');
      this.log('═'.repeat(50));
      
      try {
        const tester = new suite.class();
        const results = tester.runTests();
        
        this.allResults.push({
          suiteName: suite.name,
          ...results
        });

        totalTests += results.total;
        totalPassed += results.passed;
        totalFailed += results.failed;

      } catch (error) {
        this.log(`Error running ${suite.name} tests: ${error.message}`, 'error');
        totalFailed++;
      }
    }

    this.printFinalSummary(totalTests, totalPassed, totalFailed);
    return { totalTests, totalPassed, totalFailed, suiteResults: this.allResults };
  }

  printFinalSummary(totalTests, totalPassed, totalFailed) {
    this.log('\n' + '═'.repeat(60), 'header');
    this.log('🎯 FINAL TEST SUMMARY - BN GAMES BUG FIXES', 'header');
    this.log('═'.repeat(60), 'header');
    
    this.log(`📊 Overall Results:`);
    this.log(`   Total Tests: ${totalTests}`);
    this.log(`   ✅ Passed: ${totalPassed}`);
    this.log(`   ❌ Failed: ${totalFailed}`);
    this.log(`   Success Rate: ${totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0}%`);

    this.log('\n📋 Test Suite Breakdown:');
    for (const result of this.allResults) {
      const status = result.failed === 0 ? '✅' : '❌';
      this.log(`   ${status} ${result.suiteName}: ${result.passed}/${result.total} (${result.successRate}%)`);
    }

    if (totalFailed === 0) {
      this.log('\n🎉 ALL TESTS PASSED! BN Games is ready for production.', 'success');
      this.log('✨ Responsiveness bug fixes have been successfully implemented and validated.', 'success');
    } else {
      this.log(`\n⚠️ ${totalFailed} test(s) failed. Please review the details above.`, 'error');
    }

    this.log('\n🔍 Test Coverage Areas:');
    this.log('   • Navigation consistency across all games');
    this.log('   • Horizontal overflow prevention on mobile');
    this.log('   • Memory Match interface standardization');
    this.log('   • Title visibility and responsive typography');
    this.log('   • Canvas aspect ratio preservation');
    this.log('   • Touch target minimum sizes');
    this.log('   • Mobile-first responsive design');

    this.log('\n📱 Validated Viewports:');
    this.log('   • 320px (smallest mobile)');
    this.log('   • 375px (mobile)');
    this.log('   • 400px (mobile breakpoint)');
    this.log('   • 768px (tablet)');
    this.log('   • Desktop (1024px+)');
  }
}

// Run tests if called directly
if (require.main === module) {
  const runner = new ComprehensiveTestRunner();
  runner.runAllTests().then(results => {
    process.exit(results.totalFailed > 0 ? 1 : 0);
  }).catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = ComprehensiveTestRunner;