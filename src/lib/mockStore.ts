import { Person, LateEntry } from '@/types/database';
import { recalculateAllFines } from '@/utils/fineCalculation';

const PEOPLE_STORAGE_KEY = 'finetrack_people_data';
const ENTRIES_STORAGE_KEY = 'finetrack_entries_data';

export const INITIAL_PEOPLE: Person[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    full_name: 'Rahul',
    is_active: true,
    created_at: '2026-10-01T09:00:00Z',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    full_name: 'Akhil',
    is_active: true,
    created_at: '2026-10-01T09:00:00Z',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    full_name: 'Arjun',
    is_active: true,
    created_at: '2026-10-01T09:00:00Z',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    full_name: 'Pooja',
    is_active: true,
    created_at: '2026-10-05T09:00:00Z',
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    full_name: 'Devendra',
    is_active: true,
    created_at: '2026-10-10T09:00:00Z',
  },
];

export const INITIAL_ENTRIES: LateEntry[] = [
  // 05 November 2026 (Today) - Exact Prompt Example
  {
    id: 'entry-nov05-rahul',
    person_id: '11111111-1111-1111-1111-111111111111', // Rahul
    late_date: '2026-11-05',
    late_hours: 0,
    late_minutes: 25,
    fine_amount: 100,
    is_paid: false,
    remarks: 'Metro transit delay',
    created_at: '2026-11-05T09:25:00Z',
  },
  {
    id: 'entry-nov05-akhil',
    person_id: '22222222-2222-2222-2222-222222222222', // Akhil
    late_date: '2026-11-05',
    late_hours: 0,
    late_minutes: 15,
    fine_amount: 100,
    is_paid: false,
    remarks: 'Traffic congestion at junction',
    created_at: '2026-11-05T09:15:00Z',
  },
  {
    id: 'entry-nov05-arjun',
    person_id: '33333333-3333-3333-3333-333333333333', // Arjun
    late_date: '2026-11-05',
    late_hours: 0,
    late_minutes: 45,
    fine_amount: 100,
    is_paid: false,
    remarks: 'Vehicle tyre puncture',
    created_at: '2026-11-05T09:45:00Z',
  },

  // Past Entries so Rahul has 4 days (₹400), Akhil has 2 days (₹200), Arjun has 5 days (₹500)
  // Rahul: 3 past entries + today = 4 days (₹400)
  {
    id: 'entry-nov03-rahul',
    person_id: '11111111-1111-1111-1111-111111111111',
    late_date: '2026-11-03',
    late_hours: 0,
    late_minutes: 30,
    fine_amount: 100,
    is_paid: true,
    remarks: 'Rain delay',
    created_at: '2026-11-03T09:30:00Z',
  },
  {
    id: 'entry-nov01-rahul',
    person_id: '11111111-1111-1111-1111-111111111111',
    late_date: '2026-11-01',
    late_hours: 0,
    late_minutes: 20,
    fine_amount: 100,
    is_paid: false,
    remarks: 'Bus breakdown',
    created_at: '2026-11-01T09:20:00Z',
  },
  {
    id: 'entry-oct28-rahul',
    person_id: '11111111-1111-1111-1111-111111111111',
    late_date: '2026-10-28',
    late_hours: 0,
    late_minutes: 15,
    fine_amount: 100,
    is_paid: false,
    remarks: 'Late commute',
    created_at: '2026-10-28T09:15:00Z',
  },

  // Akhil: 1 past entry + today = 2 days (₹200)
  {
    id: 'entry-nov02-akhil',
    person_id: '22222222-2222-2222-2222-222222222222',
    late_date: '2026-11-02',
    late_hours: 0,
    late_minutes: 20,
    fine_amount: 100,
    is_paid: true,
    remarks: 'Road repair blockage',
    created_at: '2026-11-02T09:20:00Z',
  },

  // Arjun: 4 past entries + today = 5 days (₹500)
  {
    id: 'entry-nov04-arjun',
    person_id: '33333333-3333-3333-3333-333333333333',
    late_date: '2026-11-04',
    late_hours: 1,
    late_minutes: 10,
    fine_amount: 100,
    is_paid: false,
    remarks: 'Medical checkup',
    created_at: '2026-11-04T10:10:00Z',
  },
  {
    id: 'entry-nov02-arjun',
    person_id: '33333333-3333-3333-3333-333333333333',
    late_date: '2026-11-02',
    late_hours: 0,
    late_minutes: 35,
    fine_amount: 100,
    is_paid: false,
    remarks: 'Highway accident jam',
    created_at: '2026-11-02T09:35:00Z',
  },
  {
    id: 'entry-oct30-arjun',
    person_id: '33333333-3333-3333-3333-333333333333',
    late_date: '2026-10-30',
    late_hours: 0,
    late_minutes: 40,
    fine_amount: 100,
    is_paid: false,
    remarks: 'Train signal delay',
    created_at: '2026-10-30T09:40:00Z',
  },
  {
    id: 'entry-oct25-arjun',
    person_id: '33333333-3333-3333-3333-333333333333',
    late_date: '2026-10-25',
    late_hours: 0,
    late_minutes: 25,
    fine_amount: 100,
    is_paid: false,
    remarks: 'Personal delay',
    created_at: '2026-10-25T09:25:00Z',
  },
];

export function getStoredPeople(): Person[] {
  try {
    const raw = localStorage.getItem(PEOPLE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PEOPLE_STORAGE_KEY, JSON.stringify(INITIAL_PEOPLE));
      return INITIAL_PEOPLE;
    }
    const parsed = JSON.parse(raw);
    if (parsed.length === 0) {
      localStorage.setItem(PEOPLE_STORAGE_KEY, JSON.stringify(INITIAL_PEOPLE));
      return INITIAL_PEOPLE;
    }
    return parsed;
  } catch (e) {
    return INITIAL_PEOPLE;
  }
}

export function saveStoredPeople(people: Person[]) {
  localStorage.setItem(PEOPLE_STORAGE_KEY, JSON.stringify(people));
}

export function getStoredEntries(): LateEntry[] {
  try {
    const raw = localStorage.getItem(ENTRIES_STORAGE_KEY);
    if (!raw) {
      const computed = recalculateAllFines(INITIAL_ENTRIES);
      localStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(computed));
      return computed;
    }
    const parsed: LateEntry[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const computed = recalculateAllFines<LateEntry>(INITIAL_ENTRIES);
      localStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(computed));
      return computed;
    }
    const recalced = recalculateAllFines<LateEntry>(parsed);
    return recalced;
  } catch (e) {
    return recalculateAllFines<LateEntry>(INITIAL_ENTRIES);
  }
}

export function saveStoredEntries(entries: LateEntry[]) {
  localStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(entries));
}
