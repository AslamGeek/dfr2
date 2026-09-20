/**
 * Records CRUD operations in Google Sheets.
 */

/**
 * Fetches all daily records from the Records sheet efficiently using batch read.
 */
function getAllRecords_() {
  try {
    var sheet = getSheet_(SHEET_NAMES.RECORDS);
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();

    if (lastRow <= 1) {
      return [];
    }

    var values = sheet.getRange(2, 1, lastRow - 1, Math.max(lastCol, 9)).getValues();
    var records = [];

    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      var rawDate = row[0];
      var dateKey = '';

      if (rawDate instanceof Date) {
        dateKey = Utilities.formatDate(rawDate, TIMEZONE_KOLKATA, 'yyyy-MM-dd');
      } else if (typeof rawDate === 'string') {
        dateKey = rawDate.trim();
      }

      // Skip malformed rows safely
      if (!isValidDateKey_(dateKey)) {
        continue;
      }

      var workPlace = String(row[2] || '').trim();
      if (!isValidWorkPlace_(workPlace)) {
        workPlace = 'Proddatur';
      }

      records.push({
        dateKey: dateKey,
        workPlace: workPlace,
        doctors: normalizeNonNegativeInt_(row[3]),
        chemists: normalizeNonNegativeInt_(row[4]),
        newConversions: normalizeNonNegativeInt_(row[5]),
        pob: normalizeNonNegativeInt_(row[6]),
        createdAt: String(row[7] || ''),
        updatedAt: String(row[8] || '')
      });
    }

    return records;
  } catch (e) {
    Logger.log('Error reading all records: ' + e);
    return [];
  }
}

/**
 * Retrieves a single DailyRecord by DateKey (YYYY-MM-DD).
 */
function getRecord(dateKey) {
  if (!isValidDateKey_(dateKey)) {
    throw new Error('Invalid DateKey: ' + dateKey);
  }

  var records = getAllRecords_();
  for (var i = 0; i < records.length; i++) {
    if (records[i].dateKey === dateKey) {
      return records[i];
    }
  }

  // If no record exists for this date, return a blank template
  return {
    dateKey: dateKey,
    workPlace: 'Proddatur',
    doctors: 0,
    chemists: 0,
    newConversions: 0,
    pob: 0,
    createdAt: '',
    updatedAt: ''
  };
}

/**
 * Persists a DailyRecord by DateKey using LockService.
 * Updates existing row if present, appends if new.
 * Returns updated record, recalculated totals, and updated monthly overview.
 */
function saveRecord(recordPayload) {
  var norm = normalizeDailyRecord_(recordPayload);
  var displayDate = formatDisplayDate_(norm.dateKey);
  var nowIso = Utilities.formatDate(new Date(), 'UTC', "yyyy-MM-dd'T'HH:mm:ss'Z'");

  return withLock_(function() {
    var sheet = getSheet_(SHEET_NAMES.RECORDS);
    var lastRow = sheet.getLastRow();

    var targetRow = -1;
    var existingCreatedAt = '';

    if (lastRow > 1) {
      var dateKeys = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (var i = 0; i < dateKeys.length; i++) {
        var k = dateKeys[i][0];
        var sKey = '';
        if (k instanceof Date) {
          sKey = Utilities.formatDate(k, TIMEZONE_KOLKATA, 'yyyy-MM-dd');
        } else {
          sKey = String(k || '').trim();
        }

        if (sKey === norm.dateKey) {
          targetRow = i + 2;
          // Get existing createdAt
          existingCreatedAt = String(sheet.getRange(targetRow, 8).getValue() || '');
          break;
        }
      }
    }

    var createdAt = existingCreatedAt || nowIso;
    var updatedAt = nowIso;

    var rowValues = [
      norm.dateKey,
      displayDate,
      norm.workPlace,
      norm.doctors,
      norm.chemists,
      norm.newConversions,
      norm.pob,
      createdAt,
      updatedAt
    ];

    if (targetRow > 0) {
      // Overwrite existing row
      sheet.getRange(targetRow, 1, 1, 9).setValues([rowValues]);
    } else {
      // Append new row
      sheet.appendRow(rowValues);
    }

    norm.createdAt = createdAt;
    norm.updatedAt = updatedAt;

    // Recalculate totals and monthly overview
    var calculated = getCalculatedReportData(norm.dateKey);
    var monthKey = getMonthKeyFromDateKey_(norm.dateKey);
    var monthlyOverview = getMonthlyRecords(monthKey);

    return {
      record: norm,
      calculated: calculated,
      monthlyOverview: monthlyOverview
    };
  });
}
