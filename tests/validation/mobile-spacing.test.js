// Mobile Spacing CSS Test
// Validates that mobile spacing styles are properly defined
// Requirements: 6.1, 6.2, 6.3

const fs = require('node:fs');
const path = require('node:path');

const targetPath = path.join(__dirname, '..', 'public', 'css', 'styles.css');

let exitCode = 0;

function fail(message) {
    console.error(`FAIL: ${message}`);
    exitCode = 1;
}

function pass(message) {
    console.log(`PASS: ${message}`);
}

function assert(condition, message) {
    if (condition) {
        pass(message);
    } else {
        fail(message);
    }
}

function main() {
    console.log('=== Mobile Spacing CSS Test ===\n');
    
    // Check file exists
    if (!fs.existsSync(targetPath)) {
        fail(`CSS file not found: ${targetPath}`);
        process.exitCode = 1;
        return;
    }
    
    const content = fs.readFileSync(targetPath, 'utf8');
    
    // Test 1: Check for mobile media query (max-width: 767px)
    const hasMobileMediaQuery = content.includes('@media (max-width: 767px)');
    assert(hasMobileMediaQuery, 'Has mobile media query for viewport < 768px');
    
    // Test 2: Check for games grid gap of 16px
    const hasGap16px = content.includes('gap: 16px');
    assert(hasGap16px, 'Has 16px gap defined for games grid');
    
    // Test 3: Check for lateral padding of 12px
    const hasLateralPadding = content.includes('padding-left: 12px') && 
                              content.includes('padding-right: 12px');
    assert(hasLateralPadding, 'Has 12px lateral padding for mobile');
    
    // Test 4: Check for iPhone SE breakpoint (375px)
    const hasIPhoneSEBreakpoint = content.includes('@media (max-width: 375px)');
    assert(hasIPhoneSEBreakpoint, 'Has breakpoint for iPhone SE (375px)');
    
    // Test 5: Check for iPhone Plus breakpoint (414px)
    const hasIPhonePlusBreakpoint = content.includes('@media (max-width: 414px)');
    assert(hasIPhonePlusBreakpoint, 'Has breakpoint for iPhone Plus (414px)');
    
    // Test 6: Check for #gamesGrid selector in mobile styles
    const hasGamesGridSelector = content.includes('#gamesGrid');
    assert(hasGamesGridSelector, 'Has #gamesGrid selector for mobile styles');
    
    // Test 7: Check for #games section selector
    const hasGamesSectionSelector = content.includes('#games');
    assert(hasGamesSectionSelector, 'Has #games section selector');
    
    // Test 8: Verify requirements comment is present
    const hasRequirementsComment = content.includes('Requirements: 6.1, 6.2, 6.3');
    assert(hasRequirementsComment, 'Has requirements reference comment');
    
    console.log('\n=== Test Summary ===');
    if (exitCode === 0) {
        console.log('All mobile spacing tests passed!');
    } else {
        console.log('Some tests failed. Please review the CSS.');
    }
    
    process.exitCode = exitCode;
}

main();
