/**
 * Timezone utility for managing clinic appointments across US timezones
 */

// Map US states to IANA timezone identifiers
const STATE_TIMEZONE_MAP = {
  // Eastern Time
  'CT': 'America/Chicago',    // Connecticut
  'DE': 'America/New_York',   // Delaware
  'FL': 'America/New_York',   // Florida (most of state)
  'GA': 'America/New_York',   // Georgia
  'MA': 'America/New_York',   // Massachusetts
  'MD': 'America/New_York',   // Maryland
  'ME': 'America/New_York',   // Maine
  'NC': 'America/New_York',   // North Carolina
  'NH': 'America/New_York',   // New Hampshire
  'NJ': 'America/New_York',   // New Jersey
  'NY': 'America/New_York',   // New York
  'OH': 'America/New_York',   // Ohio
  'PA': 'America/New_York',   // Pennsylvania
  'RI': 'America/New_York',   // Rhode Island
  'SC': 'America/New_York',   // South Carolina
  'VA': 'America/New_York',   // Virginia
  'VT': 'America/New_York',   // Vermont
  'WV': 'America/New_York',   // West Virginia
  
  // Central Time
  'AL': 'America/Chicago',    // Alabama
  'AR': 'America/Chicago',    // Arkansas
  'IL': 'America/Chicago',    // Illinois
  'IN': 'America/Chicago',    // Indiana (most of state)
  'IA': 'America/Chicago',    // Iowa
  'KS': 'America/Chicago',    // Kansas (most of state)
  'LA': 'America/Chicago',    // Louisiana
  'MI': 'America/Chicago',    // Michigan (most of state)
  'MN': 'America/Chicago',    // Minnesota
  'MO': 'America/Chicago',    // Missouri
  'MS': 'America/Chicago',    // Mississippi
  'TN': 'America/Chicago',    // Tennessee
  'TX': 'America/Chicago',    // Texas (most of state)
  'WI': 'America/Chicago',    // Wisconsin
  
  // Mountain Time
  'AZ': 'America/Phoenix',    // Arizona (no DST)
  'CO': 'America/Denver',     // Colorado
  'MT': 'America/Denver',     // Montana
  'ND': 'America/Denver',     // North Dakota (west part)
  'NM': 'America/Denver',     // New Mexico
  'UT': 'America/Denver',     // Utah
  'WY': 'America/Denver',     // Wyoming
  'ID': 'America/Denver',     // Idaho (most of state)
  
  // Pacific Time
  'CA': 'America/Los_Angeles', // California
  'NV': 'America/Los_Angeles', // Nevada (most of state)
  'OR': 'America/Los_Angeles', // Oregon (most of state)
  'WA': 'America/Los_Angeles', // Washington
  
  // Alaska
  'AK': 'America/Anchorage',   // Alaska
  
  // Hawaii
  'HI': 'Pacific/Honolulu',    // Hawaii
};

/**
 * Get the IANA timezone identifier for a given US state
 * @param {string} state - Two-letter state code (e.g., 'CA', 'NY')
 * @returns {string} IANA timezone identifier
 */
const getTimezoneForState = (state) => {
  const timezone = STATE_TIMEZONE_MAP[state];
  if (!timezone) {
    throw new Error(`Unknown state: ${state}`);
  }
  return timezone;
};

/**
 * Convert a date/time from UTC to clinic's local timezone
 * @param {Date|string} utcDate - UTC date to convert
 * @param {string} timezone - IANA timezone identifier
 * @returns {Date} Date adjusted to clinic timezone (still as Date object but with offset applied)
 */
const convertUTCToClinicTime = (utcDate, timezone) => {
  const date = new Date(utcDate);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  
  const parts = formatter.formatToParts(date);
  const partsObject = {};
  parts.forEach(({ type, value }) => {
    partsObject[type] = value;
  });
  
  return new Date(
    `${partsObject.year}-${partsObject.month}-${partsObject.day}T${partsObject.hour}:${partsObject.minute}:${partsObject.second}`
  );
};

/**
 * Convert a date/time from clinic's local timezone to UTC
 * @param {Date|string} localDate - Local clinic date to convert
 * @param {string} timezone - IANA timezone identifier
 * @returns {Date} UTC date
 */
const convertClinicTimeToUTC = (localDate, timezone) => {
  const date = new Date(localDate);
  
  // Get the UTC representation and the local representation
  const utcFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  
  const localFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  
  const utcParts = {};
  utcFormatter.formatToParts(date).forEach(({ type, value }) => {
    utcParts[type] = value;
  });
  
  const localParts = {};
  localFormatter.formatToParts(date).forEach(({ type, value }) => {
    localParts[type] = value;
  });
  
  // Calculate the offset
  const utcTime = new Date(`${utcParts.year}-${utcParts.month}-${utcParts.day}T${utcParts.hour}:${utcParts.minute}:${utcParts.second}Z`).getTime();
  const localTime = new Date(`${localParts.year}-${localParts.month}-${localParts.day}T${localParts.hour}:${localParts.minute}:${localParts.second}Z`).getTime();
  
  const offset = localTime - utcTime;
  return new Date(date.getTime() - offset);
};

/**
 * Get clinic hours in the clinic's timezone as UTC dates for a given date
 * @param {Date|string} clinicDate - Date in clinic's local timezone
 * @param {string} timezone - IANA timezone identifier
 * @param {number} openHour - Opening hour (0-23) in clinic's local time
 * @param {number} closeHour - Closing hour (0-23) in clinic's local time
 * @returns {object} { startOfDay: Date, endOfDay: Date } in UTC
 */
const getClinicHoursUTC = (clinicDate, timezone, openHour = 8, closeHour = 17) => {
  const date = new Date(clinicDate);
  
  // Create local time at clinic open and close
  const openTimeLocal = new Date(date);
  openTimeLocal.setHours(openHour, 0, 0, 0);
  
  const closeTimeLocal = new Date(date);
  closeTimeLocal.setHours(closeHour, 0, 0, 0);
  
  // Convert to UTC
  const openTimeUTC = convertClinicTimeToUTC(openTimeLocal, timezone);
  const closeTimeUTC = convertClinicTimeToUTC(closeTimeLocal, timezone);
  
  return {
    startOfDay: openTimeUTC,
    endOfDay: closeTimeUTC,
  };
};

module.exports = {
  STATE_TIMEZONE_MAP,
  getTimezoneForState,
  convertUTCToClinicTime,
  convertClinicTimeToUTC,
  getClinicHoursUTC,
};
