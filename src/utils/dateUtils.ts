export interface WeekInfo {
  weekNumber: number;
  startDate: string; // "DD/MM/YYYY"
  endDate: string;   // "DD/MM/YYYY"
  label: string;     // "Tuần 38 (21/09/2026 - 27/09/2026)"
}

/**
 * Returns all weeks (1 to 52 or 53) for a given year following ISO-8601 calendar standard.
 * Each week begins on Monday and ends on Sunday.
 */
export function getWeeksInYear(year: number): WeekInfo[] {
  // ISO-8601: Jan 4 is always in Week 1
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() === 0 ? 7 : jan4.getDay(); // 1 (Mon) to 7 (Sun)

  // Monday of Week 1
  const monWeek1 = new Date(year, 0, 4 - (dayOfWeek - 1));

  const pad = (n: number) => String(n).padStart(2, '0');
  const formatDate = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

  const weeks: WeekInfo[] = [];

  for (let w = 1; w <= 53; w++) {
    const monday = new Date(monWeek1.getFullYear(), monWeek1.getMonth(), monWeek1.getDate() + (w - 1) * 7);
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
    const thursday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 3);

    // If Thursday of this week is in the next year, this week is Week 1 of next year
    if (thursday.getFullYear() !== year && w > 51) {
      break;
    }

    const startStr = formatDate(monday);
    const endStr = formatDate(sunday);
    weeks.push({
      weekNumber: w,
      startDate: startStr,
      endDate: endStr,
      label: `Tuần ${w} (${startStr} - ${endStr})`,
    });
  }

  return weeks;
}

/**
 * Available years for selection
 */
const dynamicYears = [2023, 2024, 2025, 2026, 2027, 2028];
const currentSystemYear = new Date().getFullYear();
if (!dynamicYears.includes(currentSystemYear)) {
  dynamicYears.push(currentSystemYear);
  dynamicYears.sort((a, b) => a - b);
}
export const AVAILABLE_YEARS = dynamicYears;

/**
 * Automatically computes current weekNumber and year in real-time according to ISO-8601 calendar standard.
 */
export function getCurrentRealtimeWeek(now: Date = new Date()): { year: number; weekNumber: number } {
  const currentYear = now.getFullYear();
  const weeks = getWeeksInYear(currentYear);
  const time = now.getTime();

  for (const w of weeks) {
    const [startD, startM, startY] = w.startDate.split('/').map(Number);
    const [endD, endM, endY] = w.endDate.split('/').map(Number);
    const start = new Date(startY, startM - 1, startD, 0, 0, 0, 0).getTime();
    const end = new Date(endY, endM - 1, endD, 23, 59, 59, 999).getTime();

    if (time >= start && time <= end) {
      return { year: currentYear, weekNumber: w.weekNumber };
    }
  }

  // Check around year boundaries
  for (const offset of [-1, 1]) {
    const adjYear = currentYear + offset;
    const adjWeeks = getWeeksInYear(adjYear);
    for (const w of adjWeeks) {
      const [startD, startM, startY] = w.startDate.split('/').map(Number);
      const [endD, endM, endY] = w.endDate.split('/').map(Number);
      const start = new Date(startY, startM - 1, startD, 0, 0, 0, 0).getTime();
      const end = new Date(endY, endM - 1, endD, 23, 59, 59, 999).getTime();
      if (time >= start && time <= end) {
        return { year: adjYear, weekNumber: w.weekNumber };
      }
    }
  }

  return { year: currentYear, weekNumber: 1 };
}

/**
 * Standard list of working days in chronological order:
 * Thứ Hai (Mon) -> Thứ Ba (Tue) -> Thứ Tư (Wed) -> Thứ Năm (Thu) -> Thứ Sáu (Fri) -> Thứ Bảy (Sat)
 */
export const DAYS_OF_WEEK_LIST = [
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
];

/**
 * Map of Vietnamese day names and common abbreviations to their 1-indexed order:
 * Thứ Hai = 1, Thứ Ba = 2, ..., Thứ Bảy = 6, Chủ Nhật = 7
 */
export const DAY_ORDER_MAP: Record<string, number> = {
  'thứ hai': 1,
  'thứ 2': 1,
  't2': 1,
  'monday': 1,
  'thứ ba': 2,
  'thứ 3': 2,
  't3': 2,
  'tuesday': 2,
  'thứ tư': 3,
  'thứ 4': 3,
  't4': 3,
  'wednesday': 3,
  'thứ năm': 4,
  'thứ 5': 4,
  't5': 4,
  'thursday': 4,
  'thứ sáu': 5,
  'thứ 6': 5,
  't6': 5,
  'friday': 5,
  'thứ bảy': 6,
  'thứ bẩy': 6,
  'thứ 7': 6,
  't7': 6,
  'saturday': 6,
  'chủ nhật': 7,
  'cn': 7,
  'sunday': 7,
};

/**
 * Returns the numerical sorting order for a given day string or date string (1 = Thứ Hai ... 7 = Chủ Nhật)
 */
export function getDayOfWeekOrder(dayOfWeek?: string, dateStr?: string): number {
  if (dayOfWeek) {
    const lower = dayOfWeek.trim().toLowerCase();
    if (DAY_ORDER_MAP[lower] !== undefined) {
      return DAY_ORDER_MAP[lower];
    }
    // Partial substring match (e.g. "thứ sáu", "thứ hai")
    for (const [key, val] of Object.entries(DAY_ORDER_MAP)) {
      if (lower.includes(key)) {
        return val;
      }
    }
  }

  // Fallback to date string (YYYY-MM-DD) if available
  if (dateStr) {
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const day = d.getDay(); // 0 is Sunday, 1 is Monday ...
        return day === 0 ? 7 : day;
      }
    } catch {
      // ignore
    }
  }

  return 99; // Unknown days placed at the end
}

/**
 * Standardizes the display name of a day of the week
 */
export function formatDayOfWeek(day?: string): string {
  if (!day) return 'Thứ Hai';
  const clean = day.trim();
  const lower = clean.toLowerCase();
  if (lower === 'thứ hai' || lower === 'thứ 2' || lower === 't2' || lower === 'monday') return 'Thứ Hai';
  if (lower === 'thứ ba' || lower === 'thứ 3' || lower === 't3' || lower === 'tuesday') return 'Thứ Ba';
  if (lower === 'thứ tư' || lower === 'thứ 4' || lower === 't4' || lower === 'wednesday') return 'Thứ Tư';
  if (lower === 'thứ năm' || lower === 'thứ 5' || lower === 't5' || lower === 'thursday') return 'Thứ Năm';
  if (lower === 'thứ sáu' || lower === 'thứ 6' || lower === 't6' || lower === 'friday') return 'Thứ Sáu';
  if (lower === 'thứ bảy' || lower === 'thứ bẩy' || lower === 'thứ 7' || lower === 't7' || lower === 'saturday') return 'Thứ Bảy';
  if (lower === 'chủ nhật' || lower === 'cn' || lower === 'sunday') return 'Chủ Nhật';
  return clean;
}

/**
 * Computes the exact ISO date (YYYY-MM-DD) for a given day in a specific week and year.
 */
export function getDateOfDayInWeek(year: number, weekNumber: number, dayOfWeek: string): string {
  const jan4 = new Date(year, 0, 4);
  const dow = jan4.getDay() === 0 ? 7 : jan4.getDay();
  const monWeek1 = new Date(year, 0, 4 - (dow - 1));
  const monday = new Date(monWeek1.getFullYear(), monWeek1.getMonth(), monWeek1.getDate() + (weekNumber - 1) * 7);

  const dayIndexMap: Record<string, number> = {
    'thứ hai': 0,
    'thứ 2': 0,
    't2': 0,
    'thứ ba': 1,
    'thứ 3': 1,
    't3': 1,
    'thứ tư': 2,
    'thứ 4': 2,
    't4': 2,
    'thứ năm': 3,
    'thứ 5': 3,
    't5': 3,
    'thứ sáu': 4,
    'thứ 6': 4,
    't6': 4,
    'thứ bảy': 5,
    'thứ bẩy': 5,
    'thứ 7': 5,
    't7': 5,
    'chủ nhật': 6,
    'cn': 6,
  };

  const cleanDay = dayOfWeek.trim().toLowerCase();
  let offset = 0;
  for (const [key, val] of Object.entries(dayIndexMap)) {
    if (cleanDay.includes(key)) {
      offset = val;
      break;
    }
  }

  const targetDate = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + offset);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${targetDate.getFullYear()}-${pad(targetDate.getMonth() + 1)}-${pad(targetDate.getDate())}`;
}

