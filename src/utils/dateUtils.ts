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
export const AVAILABLE_YEARS = [2023, 2024, 2025, 2026, 2027, 2028];
