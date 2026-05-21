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
 * Correctly handles ISO strings without timezone suffix (interprets as clinic local time)
 * @param {Date|string} localDate - Local clinic date to convert
 * @param {string} timezone - IANA timezone identifier
 * @returns {Date} UTC date
 */
const convertClinicTimeToUTC = (localDate, timezone) => {
  let dateStr;
  
  // If it's a string without timezone, parse it as clinic local time components
  if (typeof localDate === 'string' && !localDate.endsWith('Z') && !localDate.includes('+')) {
    dateStr = localDate;
  } else {
    const date = new Date(localDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    dateStr = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }
  
  // Parse the local time components
  const [datePart, timePart] = dateStr.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes, seconds = 0] = timePart.split(':').map(Number);
  
  // Create a temporary date assuming the components are in the clinic's timezone
  // We'll use a reference date and calculate the offset
  const tempDate = new Date(year, month - 1, day, hours, minutes, seconds);
  
  // Get what time this temporary date represents in UTC
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
  
  // Get what time this temporary date represents in the clinic's timezone
  const clinicFormatter = new Intl.DateTimeFormat('en-US', {
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
  utcFormatter.formatToParts(tempDate).forEach(({ type, value }) => {
    utcParts[type] = value;
  });
  
  const clinicParts = {};
  clinicFormatter.formatToParts(tempDate).forEach(({ type, value }) => {
    clinicParts[type] = value;
  });
  
  // Create dates from the formatted strings to calculate offset
  const utcTime = new Date(`${utcParts.year}-${utcParts.month}-${utcParts.day}T${utcParts.hour}:${utcParts.minute}:${utcParts.second}Z`).getTime();
  const clinicTime = new Date(`${clinicParts.year}-${clinicParts.month}-${clinicParts.day}T${clinicParts.hour}:${clinicParts.minute}:${clinicParts.second}Z`).getTime();
  
  // The offset is the difference between what the temp date represents in each timezone
  const offset = utcTime - clinicTime;
  
  // Apply the offset to convert clinic local time to UTC
  return new Date(tempDate.getTime() + offset);
};

/**
 * Get clinic hours in the clinic's timezone as UTC dates for a given date
 * @param {Date|string} clinicDate - Date in clinic's local timezone
 * @param {string} timezone - IANA timezone identifier
 * @param {number} openHour - Opening hour (0-23) in clinic's local time
 * @param {number} closeHour - Closing hour (0-23) in clinic's local time
 * @param {number} closeMinute - Closing minute (0-59) in clinic's local time
 * @returns {object} { startOfDay: Date, endOfDay: Date } in UTC
 */
const getClinicHoursUTC = (clinicDate, timezone, openHour = 8, closeHour = 17, closeMinute = 0) => {
  const date = new Date(clinicDate);
  
  // Create local time at clinic open and close
  const openTimeLocal = new Date(date);
  openTimeLocal.setHours(openHour, 0, 0, 0);
  
  const closeTimeLocal = new Date(date);
  closeTimeLocal.setHours(closeHour, closeMinute, 0, 0);
  
  // Convert to UTC
  const openTimeUTC = convertClinicTimeToUTC(openTimeLocal, timezone);
  const closeTimeUTC = convertClinicTimeToUTC(closeTimeLocal, timezone);
  
  return {
    startOfDay: openTimeUTC,
    endOfDay: closeTimeUTC,
  };
};

/**
 * Format a local clinic time as an ISO string without timezone conversion
 * @param {Date} localDate - Date representing clinic's local time
 * @returns {string} ISO format string without Z suffix (e.g., "2024-05-11T10:00:00")
 */
const formatClinicLocalTime = (localDate) => {
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  const hours = String(localDate.getHours()).padStart(2, '0');
  const minutes = String(localDate.getMinutes()).padStart(2, '0');
  const seconds = String(localDate.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

module.exports = {
  STATE_TIMEZONE_MAP,
  getTimezoneForState,
  convertUTCToClinicTime,
  convertClinicTimeToUTC,
  getClinicHoursUTC,
  formatClinicLocalTime,
};
