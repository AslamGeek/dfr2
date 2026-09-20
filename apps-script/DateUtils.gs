/**
 * Date and Time utilities for Google Apps Script.
 * Strictly uses Asia/Kolkata timezone.
 */

var TIMEZONE_KOLKATA = 'Asia/Kolkata';

/**
 * Returns today's date in Asia/Kolkata as YYYY-MM-DD.
 */
function getKolkataToday_() {
  return Utilities.formatDate(new Date(), TIMEZONE_KOLKATA, 'yyyy-MM-dd');
}

/**
 * Formats YYYY-MM-DD into DD-MM-YYYY.
 */
function formatDisplayDate_(dateKey) {
  if (!dateKey || typeof dateKey !== 'string') return '';
  var parts = dateKey.split('-');
  if (parts.length !== 3) return dateKey;
  return parts[2] + '-' + parts[1] + '-' + parts[0];
}

/**
 * Extracts month key (YYYY-MM) from dateKey (YYYY-MM-DD).
 */
function getMonthKeyFromDateKey_(dateKey) {
  if (!dateKey || dateKey.length < 7) {
    return getKolkataToday_().substring(0, 7);
  }
  return dateKey.substring(0, 7);
}

/**
 * Reporting week logic:
 * - Days 1–7: 1st week
 * - Days 8–14: 2nd week
 * - Days 15–21: 3rd week
 * - Days 22–end: 4th week
 */
function getReportingWeek_(dateKey) {
  var parts = dateKey.split('-');
  var day = parts.length === 3 ? parseInt(parts[2], 10) : 1;

  if (day >= 1 && day <= 7) {
    return { weekNumber: 1, weekOrdinal: '1st', startDay: 1, endDay: 7 };
  } else if (day >= 8 && day <= 14) {
    return { weekNumber: 2, weekOrdinal: '2nd', startDay: 8, endDay: 14 };
  } else if (day >= 15 && day <= 21) {
    return { weekNumber: 3, weekOrdinal: '3rd', startDay: 15, endDay: 21 };
  } else {
    return { weekNumber: 4, weekOrdinal: '4th', startDay: 22, endDay: 31 };
  }
}
