/**
 * Google Spreadsheet connection and initialization helpers.
 */

var SHEET_NAMES = {
  RECORDS: 'Records',
  SETTINGS: 'Settings',
  OPENING_BALANCES: 'MonthlyOpeningBalances'
};

var RECORDS_HEADERS = [
  'DateKey',
  'ReportDate',
  'WorkPlace',
  'Doctors',
  'Chemists',
  'NewConversions',
  'POB',
  'CreatedAt',
  'UpdatedAt'
];

var SETTINGS_HEADERS = ['Key', 'Value'];

var OPENING_BALANCES_HEADERS = [
  'MonthKey',
  'DoctorsOpening',
  'ChemistsOpening',
  'PobOpening',
  'UpdatedAt'
];

/**
 * Retrieves the bound or configured Google Spreadsheet.
 */
function getSpreadsheet_() {
  var props = PropertiesService.getScriptProperties();
  var configuredId = props.getProperty('SPREADSHEET_ID');

  if (configuredId) {
    try {
      return SpreadsheetApp.openById(configuredId);
    } catch (e) {
      Logger.log('Could not open spreadsheet by ID: ' + configuredId + '. Error: ' + e);
    }
  }

  // Fallback to active spreadsheet if container-bound
  try {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) {
      return active;
    }
  } catch (e) {
    Logger.log('No active spreadsheet container: ' + e);
  }

  throw new Error(
    'Spreadsheet not configured. Please set SPREADSHEET_ID in Apps Script Script Properties, or run from a bound spreadsheet.'
  );
}

/**
 * Gets a sheet by name. Automatically creates and formats headers if it doesn't exist yet.
 */
function getSheet_(sheetName) {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    if (sheetName === SHEET_NAMES.RECORDS) {
      sheet = ensureSheet_(SHEET_NAMES.RECORDS, RECORDS_HEADERS);
    } else if (sheetName === SHEET_NAMES.SETTINGS) {
      sheet = ensureSheet_(SHEET_NAMES.SETTINGS, SETTINGS_HEADERS);
    } else if (sheetName === SHEET_NAMES.OPENING_BALANCES) {
      sheet = ensureSheet_(SHEET_NAMES.OPENING_BALANCES, OPENING_BALANCES_HEADERS);
    } else {
      sheet = ss.insertSheet(sheetName);
    }
  }
  return sheet;
}

/**
 * Ensures a sheet exists with the given header row.
 * Idempotent: does not overwrite data or create duplicate headers.
 */
function ensureSheet_(sheetName, headers) {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();

  if (lastRow === 0 || lastCol === 0) {
    // Empty sheet: insert headers
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  } else {
    // Check if headers match
    var existingHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var needsHeaders = false;
    if (existingHeaders.length < headers.length) {
      needsHeaders = true;
    } else {
      for (var i = 0; i < headers.length; i++) {
        if (String(existingHeaders[i]).trim() !== headers[i]) {
          needsHeaders = true;
          break;
        }
      }
    }
    if (needsHeaders && lastRow === 1) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
    }
  }

  return sheet;
}

/**
 * Executes a callback inside a concurrency lock.
 */
function withLock_(fn, timeoutMs) {
  var timeout = timeoutMs || 10000;
  var lock = LockService.getScriptLock();
  var acquired = false;

  try {
    acquired = lock.tryLock(timeout);
    if (!acquired) {
      throw new Error('Database is busy (lock timeout). Please retry in a moment.');
    }
    return fn();
  } finally {
    if (acquired) {
      try {
        lock.releaseLock();
      } catch (e) {
        Logger.log('Error releasing lock: ' + e);
      }
    }
  }
}

/**
 * One-time idempotent initialization of the Google Sheet structure.
 */
function initializeApp() {
  return withLock_(function() {
    Logger.log('Starting initializeApp...');

    // 1. Ensure Records Sheet
    ensureSheet_(SHEET_NAMES.RECORDS, RECORDS_HEADERS);

    // 2. Ensure Settings Sheet
    var settingsSheet = ensureSheet_(SHEET_NAMES.SETTINGS, SETTINGS_HEADERS);

    // Populate default settings if missing
    var currentSettings = getSettings();
    if (!currentSettings || !currentSettings.name) {
      saveSettings({
        name: 'Aslam K. S.',
        hq: 'Proddatur',
        timeZone: TIMEZONE_KOLKATA,
        pobMode: 'monthly',
        continuousPobOpeningBalance: 0,
        schemaVersion: '1.1.0'
      });
    }

    // 3. Ensure MonthlyOpeningBalances Sheet
    ensureSheet_(SHEET_NAMES.OPENING_BALANCES, OPENING_BALANCES_HEADERS);

    Logger.log('initializeApp completed successfully.');
    return { success: true, message: 'Initialization completed successfully.' };
  }, 15000);
}
