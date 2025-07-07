/**
 * Converts a Date object to an ISO date string (YYYY-MM-DD).
 * @param {Date} date The date to convert.
 * @returns {string} The date string in YYYY-MM-DD format.
 */
export const getISODateString = (date) => {
  if (!date || !(date instanceof Date)) {
    // console.warn('getISODateString received invalid date:', date);
    return new Date().toISOString().split('T')[0]; // Default to today if invalid
  }
  return date.toISOString().split('T')[0];
};

/**
 * Adds a specified number of days to a given date.
 * @param {Date} date The starting date.
 * @param {number} days The number of days to add.
 * @returns {Date} A new Date object with the days added.
 */
export const addDaysToDate = (date, days) => {
  if (!date || !(date instanceof Date)) {
    // console.warn('addDaysToDate received invalid date:', date);
    date = new Date(); // Default to today if invalid
  }
  if (typeof days !== 'number') {
    // console.warn('addDaysToDate received invalid days:', days);
    days = 0; // Default to 0 if invalid
  }
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Formats a date string (YYYY-MM-DD) or Date object into a more readable format.
 * Example: "March 15, 2023"
 * @param {string|Date} dateInput The date string or Date object.
 * @returns {string} Formatted date string.
 */
export const formatDateReadable = (dateInput) => {
  let date;
  if (typeof dateInput === 'string') {
    // Assuming YYYY-MM-DD. Need to handle potential timezone issues if just parsing directly.
    // Splitting and creating date ensures it's treated as local (or UTC if original string implies it)
    const parts = dateInput.split('-');
    if (parts.length === 3) {
      date = new Date(parts[0], parts[1] - 1, parts[2]); // Month is 0-indexed
    } else {
      date = new Date(dateInput); // Fallback, might be inconsistent
    }
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    return "Invalid Date";
  }

  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Gets today's date as a YYYY-MM-DD string.
 * @returns {string} Today's date string.
 */
export const getTodayISODate = () => {
    return getISODateString(new Date());
};
