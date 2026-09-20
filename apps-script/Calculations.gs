/**
 * Aggregation and cumulative calculation logic in Google Apps Script.
 */

/**
 * Calculates all cumulative and reporting totals for a given dateKey.
 * Authoritative backend implementation.
 */
function getCalculatedReportData(dateKey) {
  if (!isValidDateKey_(dateKey)) {
    throw new Error('Invalid DateKey: ' + dateKey);
  }

  var selectedMonthKey = getMonthKeyFromDateKey_(dateKey);
  var weekInfo = getReportingWeek_(dateKey);
  var targetDay = parseInt(dateKey.split('-')[2], 10);

  var settings = getSettings();
  var opening = getMonthlyOpeningBalance(selectedMonthKey);

  var doctorsOpening = opening ? opening.doctorsOpening : 0;
  var chemistsOpening = opening ? opening.chemistsOpening : 0;
  var monthlyPobOpening = opening ? opening.pobOpening : 0;
  var continuousPobOpening = settings.continuousPobOpeningBalance || 0;

  var allRecords = getAllRecords_();

  var sumDoctorsMonth = 0;
  var sumChemistsMonth = 0;
  var sumConversionsWeek = 0;
  var sumConversionsMonth = 0;
  var sumPob = 0;

  for (var i = 0; i < allRecords.length; i++) {
    var rec = allRecords[i];

    // Only consider records on or before selected date
    if (rec.dateKey > dateKey) {
      continue;
    }

    var recMonthKey = getMonthKeyFromDateKey_(rec.dateKey);
    var recDay = parseInt(rec.dateKey.split('-')[2], 10);

    // Continuous POB accumulates all historical records on or before selected date
    if (settings.pobMode === 'continuous') {
      sumPob += rec.pob;
    }

    // Monthly metrics
    if (recMonthKey === selectedMonthKey) {
      sumDoctorsMonth += rec.doctors;
      sumChemistsMonth += rec.chemists;
      sumConversionsMonth += rec.newConversions;

      if (settings.pobMode === 'monthly') {
        sumPob += rec.pob;
      }

      // Weekly conversions: only records within the current reporting week range
      if (recDay >= weekInfo.startDay && recDay <= targetDay) {
        sumConversionsWeek += rec.newConversions;
      }
    }
  }

  var cumDoctors = doctorsOpening + sumDoctorsMonth;
  var cumChemists = chemistsOpening + sumChemistsMonth;
  var cumPob =
    settings.pobMode === 'continuous'
      ? continuousPobOpening + sumPob
      : monthlyPobOpening + sumPob;

  return {
    cumDoctors: cumDoctors,
    cumChemists: cumChemists,
    weekNumber: weekInfo.weekNumber,
    weekOrdinal: weekInfo.weekOrdinal,
    weekCumConversions: sumConversionsWeek,
    monthCumConversions: sumConversionsMonth,
    cumPob: cumPob
  };
}

/**
 * Returns all records and totals for a given monthKey (YYYY-MM).
 */
function getMonthlyRecords(monthKey) {
  if (!isValidMonthKey_(monthKey)) {
    throw new Error('Invalid MonthKey: ' + monthKey);
  }

  var allRecords = getAllRecords_();
  var filtered = [];

  for (var i = 0; i < allRecords.length; i++) {
    var rec = allRecords[i];
    if (getMonthKeyFromDateKey_(rec.dateKey) === monthKey) {
      filtered.push(rec);
    }
  }

  // Sort ascending by DateKey
  filtered.sort(function(a, b) {
    return a.dateKey.localeCompare(b.dateKey);
  });

  var summaries = [];
  var totalDoctors = 0;
  var totalChemists = 0;

  for (var j = 0; j < filtered.length; j++) {
    var r = filtered[j];
    totalDoctors += r.doctors;
    totalChemists += r.chemists;

    summaries.push({
      dateKey: r.dateKey,
      reportDate: formatDisplayDate_(r.dateKey),
      workPlace: r.workPlace,
      doctors: r.doctors,
      chemists: r.chemists,
      newConversions: r.newConversions,
      pob: r.pob
    });
  }

  return {
    monthKey: monthKey,
    records: summaries,
    totalDoctors: totalDoctors,
    totalChemists: totalChemists
  };
}
