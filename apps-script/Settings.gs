/**
 * Settings and MonthlyOpeningBalances management in Google Sheets.
 */

function getSettings() {
  try {
    var sheet = getSheet_(SHEET_NAMES.SETTINGS);
    var lastRow = sheet.getLastRow();

    var defaults = {
      name: 'Aslam K. S.',
      hq: 'Proddatur',
      timeZone: TIMEZONE_KOLKATA,
      pobMode: 'monthly',
      continuousPobOpeningBalance: 0,
      schemaVersion: '1.1.0'
    };

    if (lastRow <= 1) {
      return defaults;
    }

    var data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
    var map = {};
    for (var i = 0; i < data.length; i++) {
      var key = String(data[i][0] || '').trim();
      var val = data[i][1];
      if (key) {
        map[key] = val;
      }
    }

    return {
      name: String(map['Name'] || defaults.name).trim(),
      hq: String(map['HQ'] || defaults.hq).trim(),
      timeZone: TIMEZONE_KOLKATA,
      pobMode: map['PobMode'] === 'continuous' ? 'continuous' : 'monthly',
      continuousPobOpeningBalance: normalizeNonNegativeInt_(map['ContinuousPobOpeningBalance']),
      schemaVersion: String(map['SchemaVersion'] || defaults.schemaVersion)
    };
  } catch (e) {
    Logger.log('Error reading settings, returning defaults: ' + e);
    return {
      name: 'Aslam K. S.',
      hq: 'Proddatur',
      timeZone: TIMEZONE_KOLKATA,
      pobMode: 'monthly',
      continuousPobOpeningBalance: 0,
      schemaVersion: '1.1.0'
    };
  }
}

function saveSettings(settingsPayload) {
  var normalized = normalizeAppSettings_(settingsPayload);

  return withLock_(function() {
    var sheet = getSheet_(SHEET_NAMES.SETTINGS);
    var lastRow = sheet.getLastRow();

    var existingKeys = {};
    var rowsData = [];

    if (lastRow > 1) {
      rowsData = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
      for (var i = 0; i < rowsData.length; i++) {
        var k = String(rowsData[i][0] || '').trim();
        if (k) existingKeys[k] = i + 2; // row index in sheet (1-based)
      }
    }

    var targetSettings = [
      ['Name', normalized.name],
      ['HQ', normalized.hq],
      ['TimeZone', TIMEZONE_KOLKATA],
      ['PobMode', normalized.pobMode],
      ['ContinuousPobOpeningBalance', normalized.continuousPobOpeningBalance],
      ['SchemaVersion', normalized.schemaVersion]
    ];

    for (var j = 0; j < targetSettings.length; j++) {
      var keyName = targetSettings[j][0];
      var keyVal = targetSettings[j][1];

      if (existingKeys[keyName]) {
        sheet.getRange(existingKeys[keyName], 2).setValue(keyVal);
      } else {
        sheet.appendRow([keyName, keyVal]);
      }
    }

    return normalized;
  });
}

function getMonthlyOpeningBalance(monthKey) {
  if (!isValidMonthKey_(monthKey)) {
    return {
      monthKey: monthKey,
      doctorsOpening: 0,
      chemistsOpening: 0,
      pobOpening: 0
    };
  }

  try {
    var sheet = getSheet_(SHEET_NAMES.OPENING_BALANCES);
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return {
        monthKey: monthKey,
        doctorsOpening: 0,
        chemistsOpening: 0,
        pobOpening: 0
      };
    }

    var data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
    for (var i = 0; i < data.length; i++) {
      var rowMonth = String(data[i][0] || '').trim();
      if (rowMonth === monthKey) {
        return {
          monthKey: monthKey,
          doctorsOpening: normalizeNonNegativeInt_(data[i][1]),
          chemistsOpening: normalizeNonNegativeInt_(data[i][2]),
          pobOpening: normalizeNonNegativeInt_(data[i][3]),
          updatedAt: String(data[i][4] || '')
        };
      }
    }
  } catch (e) {
    Logger.log('Error reading opening balance: ' + e);
  }

  return {
    monthKey: monthKey,
    doctorsOpening: 0,
    chemistsOpening: 0,
    pobOpening: 0
  };
}

function saveMonthlyOpeningBalance(balancePayload) {
  var normalized = normalizeMonthlyOpeningBalance_(balancePayload);
  var nowIso = Utilities.formatDate(new Date(), 'UTC', "yyyy-MM-dd'T'HH:mm:ss'Z'");
  normalized.updatedAt = nowIso;

  return withLock_(function() {
    var sheet = getSheet_(SHEET_NAMES.OPENING_BALANCES);
    var lastRow = sheet.getLastRow();

    var targetRow = -1;
    if (lastRow > 1) {
      var monthCol = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (var i = 0; i < monthCol.length; i++) {
        if (String(monthCol[i][0] || '').trim() === normalized.monthKey) {
          targetRow = i + 2;
          break;
        }
      }
    }

    var rowValues = [
      normalized.monthKey,
      normalized.doctorsOpening,
      normalized.chemistsOpening,
      normalized.pobOpening,
      normalized.updatedAt
    ];

    if (targetRow > 0) {
      sheet.getRange(targetRow, 1, 1, 5).setValues([rowValues]);
    } else {
      sheet.appendRow(rowValues);
    }

    return normalized;
  });
}
