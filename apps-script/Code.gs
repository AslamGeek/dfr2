/**
 * Google Apps Script Web App Entry Point & Public API.
 * Daily Field-Work Report Application
 * Representative: Aslam K. S. (HQ: Proddatur)
 */

/**
 * Web App HTTP GET handler.
 * Serves the compiled React frontend through HtmlService.
 */
function doGet(e) {
  var htmlOutput = HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Daily Field-Work Report - Aslam K. S.')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

  return htmlOutput;
}

/**
 * Aggregated initial request for fast mobile boot.
 * Returns settings, today's record, calculated cumulative values, and current monthly overview in ONE round trip.
 */
function getInitialAppData() {
  try {
    var today = getKolkataToday_();
    var settings = getSettings();
    var todayRecord = getRecord(today);
    var calculatedData = getCalculatedReportData(today);
    var currentMonthKey = getMonthKeyFromDateKey_(today);
    var monthlyOverview = getMonthlyRecords(currentMonthKey);

    return {
      serverToday: today,
      settings: settings,
      todayRecord: todayRecord,
      calculatedData: calculatedData,
      monthlyOverview: monthlyOverview,
      isBackendGas: true
    };
  } catch (err) {
    Logger.log('Error in getInitialAppData: ' + err);
    throw new Error('Failed to load initial application data: ' + err.message);
  }
}
