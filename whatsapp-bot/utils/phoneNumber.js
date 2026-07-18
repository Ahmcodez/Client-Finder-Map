const { parsePhoneNumberFromString } = require('libphonenumber-js');

const LOCATION_COUNTRY_MAP = {
  abudhabi: 'AE',
  ajman: 'AE',
  alberta: 'CA',
  bangladesh: 'BD',
  britain: 'GB',
  cairo: 'EG',
  calgary: 'CA',
  canada: 'CA',
  delhi: 'IN',
  dhaka: 'BD',
  dubai: 'AE',
  dubaicity: 'AE',
  egypt: 'EG',
  england: 'GB',
  glasgow: 'GB',
  greatbritain: 'GB',
  india: 'IN',
  islamabad: 'PK',
  karachi: 'PK',
  lahore: 'PK',
  lagos: 'NG',
  london: 'GB',
  manchester: 'GB',
  manila: 'PH',
  mumbai: 'IN',
  nigeria: 'NG',
  ontario: 'CA',
  pakistan: 'PK',
  philippines: 'PH',
  rawalpindi: 'PK',
  riyadh: 'SA',
  saudiarabia: 'SA',
  sharjah: 'AE',
  toronto: 'CA',
  uae: 'AE',
  uk: 'GB',
  unitedarabemirates: 'AE',
  unitedkingdom: 'GB',
  unitedstates: 'US',
  unitedstatesofamerica: 'US',
  us: 'US',
  usa: 'US',
  vancouver: 'CA',
};

const COUNTRY_CALLING_CODE_BY_ISO = {
  AE: '971',
  BD: '880',
  CA: '1',
  EG: '20',
  GB: '44',
  IN: '91',
  NG: '234',
  PH: '63',
  PK: '92',
  SA: '966',
  US: '1',
};

const KNOWN_COUNTRY_CALLING_CODES = Array.from(new Set(Object.values(COUNTRY_CALLING_CODE_BY_ISO))).sort(
  (left, right) => right.length - left.length
);

function normalizeRawPhone(value) {
  return String(value || '').trim();
}

function getDigitsOnly(value) {
  return normalizeRawPhone(value).replace(/\D/g, '');
}

function normalizeLocationLookupKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

function detectCountryFromLocation(location) {
  const normalizedLocation = normalizeLocationLookupKey(location);

  if (!normalizedLocation) {
    return null;
  }

  if (LOCATION_COUNTRY_MAP[normalizedLocation]) {
    return LOCATION_COUNTRY_MAP[normalizedLocation];
  }

  for (const [locationKey, countryCode] of Object.entries(LOCATION_COUNTRY_MAP)) {
    if (normalizedLocation.includes(locationKey)) {
      return countryCode;
    }
  }

  return null;
}

function detectKnownCountryCallingCode(digitsOnly) {
  if (!digitsOnly) {
    return '';
  }

  for (const countryCallingCode of KNOWN_COUNTRY_CALLING_CODES) {
    if (digitsOnly.startsWith(countryCallingCode)) {
      return countryCallingCode;
    }
  }

  return '';
}

function detectParsingMethod(value) {
  const rawValue = normalizeRawPhone(value);
  const digitsOnly = getDigitsOnly(rawValue);

  if (!rawValue || !digitsOnly) {
    return 'unknown';
  }

  if (rawValue.startsWith('+') || rawValue.startsWith('00')) {
    return 'international';
  }

  if (rawValue.startsWith('0')) {
    return 'local';
  }

  if (digitsOnly.length <= 10) {
    return 'local';
  }

  if (detectKnownCountryCallingCode(digitsOnly)) {
    return 'international';
  }

  return 'local';
}

function buildParseTarget(rawValue, parsingMethod) {
  if (parsingMethod !== 'international') {
    return rawValue;
  }

  if (rawValue.startsWith('+')) {
    return rawValue;
  }

  if (rawValue.startsWith('00')) {
    return `+${rawValue.slice(2)}`;
  }

  return `+${getDigitsOnly(rawValue)}`;
}

function parsePhoneNumberDetails(value, location) {
  const rawValue = normalizeRawPhone(value);
  const detectedCountry = detectCountryFromLocation(location);
  const parsingMethod = detectParsingMethod(rawValue);
  const parseTarget = buildParseTarget(rawValue, parsingMethod);

  const details = {
    originalNumber: rawValue,
    location: String(location || '').trim(),
    detectedCountry,
    parsingMethod,
    finalFormattedNumber: null,
    validationResult: false,
    error: '',
  };

  if (!rawValue) {
    details.error = 'Phone number is empty.';
    return details;
  }

  try {
    const phoneNumber =
      parsingMethod === 'international'
        ? parsePhoneNumberFromString(parseTarget)
        : parsePhoneNumberFromString(parseTarget, detectedCountry || undefined);

    if (!phoneNumber) {
      details.error =
        parsingMethod === 'local' && !detectedCountry
          ? 'Unable to detect country from location for local number.'
          : 'Unable to parse phone number.';
      return details;
    }

    details.validationResult = phoneNumber.isValid();
    details.finalFormattedNumber = details.validationResult
      ? phoneNumber.number.replace(/^\+/, '')
      : null;

    if (!details.validationResult) {
      details.error = 'Parsed phone number is invalid.';
    }

    return details;
  } catch (error) {
    details.error = error.message || 'Unexpected phone parsing error.';
    return details;
  }
}

function parsePhoneNumber(value, location) {
  const details = parsePhoneNumberDetails(value, location);

  if (!details.finalFormattedNumber) {
    return null;
  }

  try {
    const phoneNumber = parsePhoneNumberFromString(`+${details.finalFormattedNumber}`);

    if (!phoneNumber) {
      return null;
    }

    return {
      country: phoneNumber.country || null,
      countryCallingCode: phoneNumber.countryCallingCode || '',
      nationalNumber: phoneNumber.nationalNumber || '',
      number: phoneNumber.number || '',
      isPossible: phoneNumber.isPossible(),
      isValid: phoneNumber.isValid(),
      internationalFormat: phoneNumber.formatInternational(),
    };
  } catch {
    return null;
  }
}

function detectPhoneCountry(value, location) {
  return parsePhoneNumber(value, location)?.country || null;
}

function validatePhoneNumber(value, location) {
  return parsePhoneNumberDetails(value, location).validationResult;
}

function toInternationalPhoneNumber(value, location) {
  const details = parsePhoneNumberDetails(value, location);

  if (!details.finalFormattedNumber) {
    return '';
  }

  return `+${details.finalFormattedNumber}`;
}

function formatAndValidateNumber(phone, location) {
  try {
    const details = parsePhoneNumberDetails(phone, location);
    return details.validationResult ? details.finalFormattedNumber : null;
  } catch {
    return null;
  }
}

module.exports = {
  parsePhoneNumber,
  parsePhoneNumberDetails,
  detectPhoneCountry,
  detectCountryFromLocation,
  validatePhoneNumber,
  toInternationalPhoneNumber,
  formatAndValidateNumber,
};
