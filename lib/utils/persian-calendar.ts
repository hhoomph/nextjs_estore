/**
 * Persian Calendar Utilities
 *
 * This module provides comprehensive utilities for working with Persian (Solar Hijri) calendar
 * including date conversion, formatting, and calendar operations.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

/**
 * Persian month names in English and Persian
 */
export const PERSIAN_MONTHS = {
  en: [
    "Farvardin",
    "Ordibehesht",
    "Khordad",
    "Tir",
    "Mordad",
    "Shahrivar",
    "Mehr",
    "Aban",
    "Azar",
    "Dey",
    "Bahman",
    "Esfand",
  ],
  fa: [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ],
};

/**
 * Persian weekday names
 */
export const PERSIAN_WEEKDAYS = {
  en: [
    "Saturday",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ],
  fa: ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"],
};

/**
 * Persian numbers for calendar display
 */
const PERSIAN_NUMBERS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/**
 * Converts Gregorian date to Persian date
 * @param gregorianDate - Gregorian date
 * @returns Persian date object {year, month, day}
 */
export function gregorianToPersian(gregorianDate: Date): {
  year: number;
  month: number;
  day: number;
} {
  const gYear = gregorianDate.getFullYear();
  const gMonth = gregorianDate.getMonth() + 1;
  const gDay = gregorianDate.getDate();

  // Persian calendar calculation
  let persianYear = gYear - 621;
  let persianMonth = 0;
  let persianDay = 0;

  const gMonthDays = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const persianMonthDays = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];

  let dayOfYear = gMonthDays[gMonth - 1] + gDay;

  // Leap year calculation
  let leap = 0;
  if (gYear > 1996 && gYear % 4 === 0) {
    leap = 1;
  }

  dayOfYear += leap;

  // Find Persian year
  if (dayOfYear > 79) {
    persianYear++;
    dayOfYear -= 79;
  } else {
    dayOfYear += 286;
  }

  // Find Persian month and day
  for (let i = 0; i < 12; i++) {
    if (dayOfYear <= persianMonthDays[i]) {
      persianMonth = i + 1;
      persianDay = dayOfYear;
      break;
    }
    dayOfYear -= persianMonthDays[i];
  }

  return { year: persianYear, month: persianMonth, day: persianDay };
}

/**
 * Converts Persian date to Gregorian date
 * @param persianYear - Persian year
 * @param persianMonth - Persian month (1-12)
 * @param persianDay - Persian day
 * @returns Gregorian Date object
 */
export function persianToGregorian(
  persianYear: number,
  persianMonth: number,
  persianDay: number,
): Date {
  let gregorianYear = persianYear + 621;
  let dayOfYear = 0;

  // Add days from previous months
  const persianMonthDays = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  for (let i = 0; i < persianMonth - 1; i++) {
    dayOfYear += persianMonthDays[i];
  }
  dayOfYear += persianDay;

  // Adjust for leap years
  const leapDays =
    Math.floor((gregorianYear - 1) / 4) -
    Math.floor((gregorianYear - 1) / 100) +
    Math.floor((gregorianYear - 1) / 400);

  if (dayOfYear <= 286) {
    gregorianYear--;
    dayOfYear += 79;
  } else {
    dayOfYear -= 286;
  }

  // Find Gregorian month and day
  const gMonthDays = [
    31,
    28 +
      (gregorianYear % 4 === 0 &&
      (gregorianYear % 100 !== 0 || gregorianYear % 400 === 0)
        ? 1
        : 0),
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  let gregorianMonth = 0;
  let gregorianDay = dayOfYear;

  for (let i = 0; i < 12; i++) {
    if (gregorianDay <= gMonthDays[i]) {
      gregorianMonth = i + 1;
      break;
    }
    gregorianDay -= gMonthDays[i];
  }

  return new Date(gregorianYear, gregorianMonth - 1, gregorianDay);
}

/**
 * Formats Persian date for display
 * @param year - Persian year
 * @param month - Persian month (1-12)
 * @param day - Persian day
 * @param language - Language ('en' or 'fa')
 * @returns Formatted date string
 */
export function formatPersianDate(
  year: number,
  month: number,
  day: number,
  language: "en" | "fa" = "fa",
): string {
  if (language === "fa") {
    const persianDay = toPersianNumbers(day.toString());
    const persianYear = toPersianNumbers(year.toString());
    return `${persianDay} ${PERSIAN_MONTHS.fa[month - 1]} ${persianYear}`;
  } else {
    return `${day} ${PERSIAN_MONTHS.en[month - 1]} ${year}`;
  }
}

/**
 * Converts English numbers to Persian numbers
 * @param num - Number or string to convert
 * @returns Persian number string
 */
export function toPersianNumbers(num: string | number): string {
  const str = num.toString();
  return str.replace(/\d/g, (digit) => PERSIAN_NUMBERS[parseInt(digit)]);
}

/**
 * Gets Persian calendar data for a specific month
 * @param year - Persian year
 * @param month - Persian month (1-12)
 * @returns Calendar data with days and weekdays
 */
export function getPersianMonthCalendar(
  year: number,
  month: number,
): {
  year: number;
  month: number;
  days: Array<{
    day: number;
    gregorianDate: Date;
    isToday: boolean;
    isCurrentMonth: boolean;
  }>;
  weekdayOffset: number;
} {
  const firstDayOfMonth = persianToGregorian(year, month, 1);
  const lastDayOfMonth =
    month === 12
      ? persianToGregorian(year, month, 29 + (isPersianLeapYear(year) ? 1 : 0))
      : persianToGregorian(year, month, PERSIAN_MONTH_DAYS[month - 1]);

  const today = new Date();
  const todayPersian = gregorianToPersian(today);

  // Calculate weekday offset (0 = Saturday, 6 = Friday)
  const weekdayOffset =
    firstDayOfMonth.getDay() === 6 ? 0 : firstDayOfMonth.getDay() + 1;

  const days = [];

  // Add previous month days to fill the first week
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevMonthDays =
    prevMonth === 12
      ? 29 + (isPersianLeapYear(prevYear) ? 1 : 0)
      : PERSIAN_MONTH_DAYS[prevMonth - 1];

  for (let i = weekdayOffset - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const gregorianDate = persianToGregorian(prevYear, prevMonth, day);
    days.push({
      day,
      gregorianDate,
      isToday: false,
      isCurrentMonth: false,
    });
  }

  // Add current month days
  const currentMonthDays =
    month === 12
      ? 29 + (isPersianLeapYear(year) ? 1 : 0)
      : PERSIAN_MONTH_DAYS[month - 1];

  for (let day = 1; day <= currentMonthDays; day++) {
    const gregorianDate = persianToGregorian(year, month, day);
    days.push({
      day,
      gregorianDate,
      isToday:
        todayPersian.year === year &&
        todayPersian.month === month &&
        todayPersian.day === day,
      isCurrentMonth: true,
    });
  }

  // Add next month days to fill the last week
  const remainingCells = 42 - days.length; // 6 weeks * 7 days = 42 cells
  for (let day = 1; day <= remainingCells; day++) {
    const gregorianDate = persianToGregorian(year, month + 1, day);
    days.push({
      day,
      gregorianDate,
      isToday: false,
      isCurrentMonth: false,
    });
  }

  return {
    year,
    month,
    days,
    weekdayOffset,
  };
}

/**
 * Persian month days (non-leap year)
 */
const PERSIAN_MONTH_DAYS = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];

/**
 * Checks if a Persian year is a leap year
 * @param year - Persian year
 * @returns True if leap year
 */
export function isPersianLeapYear(year: number): boolean {
  // Persian leap year calculation
  const a = year % 33;
  return [1, 5, 9, 13, 17, 22, 26, 30].includes(a);
}

/**
 * Gets the number of days in a Persian month
 * @param year - Persian year
 * @param month - Persian month (1-12)
 * @returns Number of days in the month
 */
export function getPersianMonthDays(year: number, month: number): number {
  if (month === 12) {
    return 29 + (isPersianLeapYear(year) ? 1 : 0);
  }
  return PERSIAN_MONTH_DAYS[month - 1];
}

/**
 * Validates Persian date
 * @param year - Persian year
 * @param month - Persian month (1-12)
 * @param day - Persian day
 * @returns True if valid date
 */
export function isValidPersianDate(
  year: number,
  month: number,
  day: number,
): boolean {
  if (month < 1 || month > 12 || day < 1) return false;

  const maxDays = getPersianMonthDays(year, month);
  return day <= maxDays;
}

/**
 * Gets relative time description in Persian
 * @param date - Date to compare
 * @param language - Language ('en' or 'fa')
 * @returns Relative time string
 */
export function getPersianRelativeTime(
  date: Date,
  language: "en" | "fa" = "fa",
): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (language === "fa") {
    if (diffDays === 0) return "امروز";
    if (diffDays === 1) return "دیروز";
    if (diffDays === 2) return "پریروز";
    if (diffDays < 7) return `${toPersianNumbers(diffDays)} روز پیش`;
    if (diffDays < 30)
      return `${toPersianNumbers(Math.floor(diffDays / 7))} هفته پیش`;
    if (diffDays < 365)
      return `${toPersianNumbers(Math.floor(diffDays / 30))} ماه پیش`;
    return `${toPersianNumbers(Math.floor(diffDays / 365))} سال پیش`;
  } else {
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays === 2) return "2 days ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }
}

/**
 * Persian calendar utilities for UI components
 */
export const persianCalendarUtils = {
  /**
   * Gets month navigation options
   * @param currentYear - Current Persian year
   * @param currentMonth - Current Persian month
   * @returns Navigation options
   */
  getNavigationOptions: (currentYear: number, currentMonth: number) => ({
    prevMonth: currentMonth === 1 ? 12 : currentMonth - 1,
    prevYear: currentMonth === 1 ? currentYear - 1 : currentYear,
    nextMonth: currentMonth === 12 ? 1 : currentMonth + 1,
    nextYear: currentMonth === 12 ? currentYear + 1 : currentYear,
  }),

  /**
   * Formats time for Persian locale
   * @param date - Date object
   * @returns Formatted time string
   */
  formatTime: (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const persianHours = toPersianNumbers(hours.toString().padStart(2, "0"));
    const persianMinutes = toPersianNumbers(
      minutes.toString().padStart(2, "0"),
    );
    return `${persianHours}:${persianMinutes}`;
  },

  /**
   * Gets Persian date range for a week
   * @param startDate - Start date
   * @returns Week date range
   */
  getWeekRange: (startDate: Date) => {
    const start = gregorianToPersian(startDate);
    const end = gregorianToPersian(
      new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000),
    );
    return { start, end };
  },

  /**
   * Gets Persian holidays for a year
   * @param year - Persian year
   * @returns Array of holiday dates
   */
  getHolidays: (year: number) => [
    // Nowruz (Persian New Year)
    { month: 1, day: 1, name: { en: "Nowruz", fa: "نوروز" } },
    { month: 1, day: 2, name: { en: "Nowruz", fa: "نوروز" } },
    { month: 1, day: 3, name: { en: "Nowruz", fa: "نوروز" } },
    { month: 1, day: 4, name: { en: "Nowruz", fa: "نوروز" } },
    // Other major holidays can be added here
  ],
};
