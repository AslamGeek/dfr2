/**
 * Input validation and normalization for Apps Script backend.
 */

var ALLOWED_WORK_PLACES_GAS = [
  'Proddatur',
  'Jammalamadugu',
  'Kamalapuram / Yerraguntla',
  'Mydukuru /GV Satram',
  'Porumamilla /Kalasapaadu'
];

function isValidDateKey_(dateKey) {
  if (!dateKey || typeof dateKey !== 'string') return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(dateKey);
}

function isValidMonthKey_(monthKey) {
  if (!monthKey || typeof monthKey !== 'string') return false;
  return /^\d{4}-\d{2}$/.test(monthKey);
}

function isValidWorkPlace_(workPlace) {
  return ALLOWED_WORK_PLACES_GAS.indexOf(workPlace) !== -1;
}

function normalizeNonNegativeInt_(val) {
  if (typeof val === 'number') {
    if (isNaN(val) || !isFinite(val) || val < 0) return 0;
    return Math.floor(val);
  }
  if (typeof val === 'string') {
    var cleaned = val.replace(/,/g, '').trim();
    if (!cleaned) return 0;
    var parsed = parseInt(cleaned, 10);
    if (isNaN(parsed) || parsed < 0) return 0;
    return parsed;
  }
  return 0;
}

function normalizeDailyRecord_(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid record payload: Expected an object');
  }

  var dateKey = String(raw.dateKey || '').trim();
  if (!isValidDateKey_(dateKey)) {
    throw new Error('Invalid DateKey: Must be YYYY-MM-DD');
  }

  var workPlace = raw.workPlace;
  if (!isValidWorkPlace_(workPlace)) {
    workPlace = 'Proddatur';
  }

  return {
    dateKey: dateKey,
    workPlace: workPlace,
    doctors: normalizeNonNegativeInt_(raw.doctors),
    chemists: normalizeNonNegativeInt_(raw.chemists),
    newConversions: normalizeNonNegativeInt_(raw.newConversions),
    pob: normalizeNonNegativeInt_(raw.pob),
    createdAt: raw.createdAt || '',
    updatedAt: raw.updatedAt || ''
  };
}

function normalizeAppSettings_(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      name: 'Aslam K. S.',
      hq: 'Proddatur',
      timeZone: TIMEZONE_KOLKATA,
      pobMode: 'continuous',
      continuousPobOpeningBalance: 0,
      schemaVersion: '1.0.0'
    };
  }

  var name = String(raw.name || '').trim();
  if (!name) name = 'Aslam K. S.';

  var hq = String(raw.hq || '').trim();
  if (!hq) hq = 'Proddatur';

  var pobMode = raw.pobMode === 'continuous' ? 'continuous' : 'monthly';

  return {
    name: name,
    hq: hq,
    timeZone: TIMEZONE_KOLKATA,
    pobMode: pobMode,
    continuousPobOpeningBalance: normalizeNonNegativeInt_(raw.continuousPobOpeningBalance),
    schemaVersion: String(raw.schemaVersion || '1.1.0')
  };
}

function normalizeMonthlyOpeningBalance_(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid opening balance payload');
  }

  var monthKey = String(raw.monthKey || '').trim();
  if (!isValidMonthKey_(monthKey)) {
    throw new Error('Invalid MonthKey: Must be YYYY-MM');
  }

  return {
    monthKey: monthKey,
    doctorsOpening: normalizeNonNegativeInt_(raw.doctorsOpening),
    chemistsOpening: normalizeNonNegativeInt_(raw.chemistsOpening),
    pobOpening: normalizeNonNegativeInt_(raw.pobOpening),
    updatedAt: raw.updatedAt || ''
  };
}
