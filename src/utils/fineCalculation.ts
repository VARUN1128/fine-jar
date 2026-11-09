/**
 * Progressive Fine Calculation Utility
 *
 * Rules:
 * - 1st late entry of a person in a calendar month: ₹100
 * - 2nd late entry in the month: ₹200
 * - 3rd late entry in the month: ₹300
 * - 4th late entry in the month: ₹400
 * - 5th late entry in the month: ₹500
 * - 6th or more late entries in the month: ₹500 (capped at ₹500 per late day)
 * - Counter resets at the start of each calendar month (YYYY-MM).
 */

export interface EntryWithDate {
  id: string;
  person_id: string;
  late_date: string;
  fine_amount?: number;
}

/**
 * Returns the progressive fine amount given the 1-based occurrence number in the month.
 */
export function getFineForOccurrence(occurrenceInMonth: number): number {
  if (occurrenceInMonth <= 1) return 100;
  return Math.min(occurrenceInMonth * 100, 500);
}

/**
 * Returns the YYYY-MM month string from a date string.
 */
export function getYearMonth(dateString: string): string {
  if (!dateString) return '';
  return dateString.slice(0, 7);
}

/**
 * Calculates the occurrence number and fine for a person on a specific date,
 * based on all existing entries for that person in that calendar month.
 */
export function calculateEntryFineForDate(
  entries: EntryWithDate[],
  personId: string,
  targetDate: string,
  excludeEntryId?: string
): { occurrence: number; fineAmount: number } {
  if (!personId || !targetDate) {
    return { occurrence: 1, fineAmount: 100 };
  }

  const targetMonth = getYearMonth(targetDate);

  // Filter entries for this person in the same month
  const monthEntries = entries.filter(
    (e) =>
      e.person_id === personId &&
      getYearMonth(e.late_date) === targetMonth &&
      e.id !== excludeEntryId
  );

  // Count entries that are on or before the targetDate
  const priorOrSameDateCount = monthEntries.filter((e) => e.late_date < targetDate).length;
  const occurrence = priorOrSameDateCount + 1;
  const fineAmount = getFineForOccurrence(occurrence);

  return { occurrence, fineAmount };
}

/**
 * Recalculates and assigns the correct progressive fine amount for all entries.
 * Entries are grouped by (person_id, YYYY-MM) and sorted chronologically ascending by late_date.
 */
export function recalculateAllFines<T extends EntryWithDate>(entries: T[]): T[] {
  const groups = new Map<string, T[]>();

  entries.forEach((entry) => {
    const key = `${entry.person_id}_${getYearMonth(entry.late_date)}`;
    const group = groups.get(key) || [];
    group.push(entry);
    groups.set(key, group);
  });

  const fineMap = new Map<string, number>();

  groups.forEach((groupEntries) => {
    // Sort chronologically ascending
    const sorted = [...groupEntries].sort((a, b) => a.late_date.localeCompare(b.late_date));
    sorted.forEach((entry, index) => {
      const occurrence = index + 1;
      fineMap.set(entry.id, getFineForOccurrence(occurrence));
    });
  });

  return entries.map((entry) => ({
    ...entry,
    fine_amount: fineMap.get(entry.id) ?? getFineForOccurrence(1),
  })) as T[];
}
