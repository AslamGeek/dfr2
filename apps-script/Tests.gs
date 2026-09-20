/**
 * Automated Verification & Unit Test Suite for Google Apps Script Backend.
 * Can be run from the Apps Script editor via runAllBackendTests().
 */

function runAllBackendTests() {
  Logger.log('========================================');
  Logger.log('STARTING BACKEND BUSINESS LOGIC TESTS');
  Logger.log('========================================');

  var passed = 0;
  var failed = 0;

  function assertEqual(actual, expected, testName) {
    if (JSON.stringify(actual) === JSON.stringify(expected)) {
      passed++;
      Logger.log('PASS: ' + testName);
    } else {
      failed++;
      Logger.log('FAIL: ' + testName + ' | Expected: ' + JSON.stringify(expected) + ', Actual: ' + JSON.stringify(actual));
    }
  }

  function assertTrue(condition, testName) {
    if (condition) {
      passed++;
      Logger.log('PASS: ' + testName);
    } else {
      failed++;
      Logger.log('FAIL: ' + testName + ' | Expected truthy, got falsy');
    }
  }

  // 1. Test Date Validation
  assertEqual(isValidDateKey_('2026-09-19'), true, 'Valid DateKey');
  assertEqual(isValidDateKey_('invalid-date'), false, 'Invalid DateKey string');
  assertEqual(isValidDateKey_(''), false, 'Empty DateKey');

  // 2. Test Month Validation
  assertEqual(isValidMonthKey_('2026-09'), true, 'Valid MonthKey');
  assertEqual(isValidMonthKey_('2026-9'), false, 'Invalid MonthKey format');

  // 3. Test WorkPlace Validation
  assertEqual(isValidWorkPlace_('Proddatur'), true, 'Valid WorkPlace: Proddatur');
  assertEqual(isValidWorkPlace_('Jammalamadugu'), true, 'Valid WorkPlace: Jammalamadugu');
  assertEqual(isValidWorkPlace_('Kamalapuram / Yerraguntla'), true, 'Valid WorkPlace: Kamalapuram / Yerraguntla');
  assertEqual(isValidWorkPlace_('Mydukuru /GV Satram'), true, 'Valid WorkPlace: Mydukuru /GV Satram');
  assertEqual(isValidWorkPlace_('Porumamilla /Kalasapaadu'), true, 'Valid WorkPlace: Porumamilla /Kalasapaadu');
  assertEqual(isValidWorkPlace_('Unknown City'), false, 'Invalid WorkPlace rejected');

  // 4. Test Reporting Week Boundaries
  // Days 1-7 -> 1st week
  assertEqual(getReportingWeek_('2026-09-01').weekOrdinal, '1st', 'Day 1 is 1st week');
  assertEqual(getReportingWeek_('2026-09-07').weekOrdinal, '1st', 'Day 7 is 1st week');
  // Days 8-14 -> 2nd week
  assertEqual(getReportingWeek_('2026-09-08').weekOrdinal, '2nd', 'Day 8 is 2nd week');
  assertEqual(getReportingWeek_('2026-09-14').weekOrdinal, '2nd', 'Day 14 is 2nd week');
  // Days 15-21 -> 3rd week
  assertEqual(getReportingWeek_('2026-09-15').weekOrdinal, '3rd', 'Day 15 is 3rd week');
  assertEqual(getReportingWeek_('2026-09-21').weekOrdinal, '3rd', 'Day 21 is 3rd week');
  // Days 22-end -> 4th week (No 5th week!)
  assertEqual(getReportingWeek_('2026-09-22').weekOrdinal, '4th', 'Day 22 is 4th week');
  assertEqual(getReportingWeek_('2026-09-28').weekOrdinal, '4th', 'Day 28 is 4th week');
  assertEqual(getReportingWeek_('2026-09-30').weekOrdinal, '4th', 'Day 30 is 4th week');
  assertEqual(getReportingWeek_('2026-08-31').weekOrdinal, '4th', 'Day 31 is 4th week (no 5th week)');

  // 5. Test Malformed Input Normalization
  assertEqual(normalizeNonNegativeInt_('-5'), 0, 'Negative string normalizes to 0');
  assertEqual(normalizeNonNegativeInt_(-10), 0, 'Negative number normalizes to 0');
  assertEqual(normalizeNonNegativeInt_(''), 0, 'Empty string normalizes to 0');
  assertEqual(normalizeNonNegativeInt_('1,500'), 1500, 'Comma formatted string normalizes correctly');
  assertEqual(normalizeNonNegativeInt_(null), 0, 'Null normalizes to 0');
  assertEqual(normalizeNonNegativeInt_(undefined), 0, 'Undefined normalizes to 0');

  // 6. Test Settings Normalization
  var normSettings = normalizeAppSettings_({
    name: '  Aslam K. S.  ',
    hq: '  Proddatur  ',
    pobMode: 'continuous',
    continuousPobOpeningBalance: 5000
  });
  assertEqual(normSettings.name, 'Aslam K. S.', 'Settings name trimmed');
  assertEqual(normSettings.hq, 'Proddatur', 'Settings HQ trimmed');
  assertEqual(normSettings.continuousPobOpeningBalance, 5000, 'Continuous POB balance set');

  Logger.log('========================================');
  Logger.log('TEST SUMMARY: ' + passed + ' PASSED, ' + failed + ' FAILED');
  Logger.log('========================================');

  return {
    passed: passed,
    failed: failed,
    success: failed === 0
  };
}
