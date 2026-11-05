import { Person, LateEntry } from '@/types/database';

const PEOPLE_STORAGE_KEY = 'finetrack_people_mock';
const ENTRIES_STORAGE_KEY = 'finetrack_entries_mock';

export const INITIAL_PEOPLE: Person[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    full_name: 'Rahul Sharma',
    is_active: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    full_name: 'Akhil Verma',
    is_active: true,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    full_name: 'Arjun Patel',
    is_active: true,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    full_name: 'Pooja Nair',
    is_active: true,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    full_name: 'Devendra Reddy',
    is_active: true,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

// Helper to get formatted date string for today and past days
function getDateOffset(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const INITIAL_ENTRIES: LateEntry[] = [
  // Today's entries
  {
    id: 'entry-1',
    person_id: '11111111-1111-1111-1111-111111111111', // Rahul
    late_date: getDateOffset(0),
    late_hours: 0,
    late_minutes: 25,
    fine_amount: 100,
    is_paid: false,
    remarks: 'Metro line delayed due to technical issue',
    created_at: new Date().toISOString(),
  },
  {
    id: 'entry-2',
    person_id: '22222222-2222-2222-2222-222222222222', // Akhil
    late_date: getDateOffset(0),
    late_hours: 0,
    late_minutes: 15,
    fine_amount: 100,
    is_paid: false,
    remarks: 'Heavy traffic near main circle',
    created_at: new Date().toISOString(),
  },
  {
    id: 'entry-3',
    person_id: '33333333-3333-3333-3333-333333333333', // Arjun
    late_date: getDateOffset(0),
    late_hours: 0,
    late_minutes: 45,
    fine_amount: 100,
    is_paid: false,
    remarks: 'Vehicle flat tyre on highway',
    created_at: new Date().toISOString(),
  },
  // Past days entries for multi-day demonstration
  {
    id: 'entry-4',
    person_id: '11111111-1111-1111-1111-111111111111', // Rahul
    late_date: getDateOffset(1),
    late_hours: 0,
    late_minutes: 30,
    fine_amount: 100,
    is_paid: true,
    remarks: 'Heavy rain in morning',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'entry-5',
    person_id: '33333333-3333-3333-3333-333333333333', // Arjun
    late_date: getDateOffset(2),
    late_hours: 1,
    late_minutes: 10,
    fine_amount: 100,
    is_paid: false,
    remarks: 'Medical appointment',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'entry-6',
    person_id: '11111111-1111-1111-1111-111111111111', // Rahul
    late_date: getDateOffset(3),
    late_hours: 0,
    late_minutes: 20,
    fine_amount: 100,
    is_paid: false,
    remarks: 'Bus breakdown',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'entry-7',
    person_id: '33333333-3333-3333-3333-333333333333', // Arjun
    late_date: getDateOffset(4),
    late_hours: 0,
    late_minutes: 35,
    fine_amount: 100,
    is_paid: false,
    remarks: 'Overturned truck traffic jam',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'entry-8',
    person_id: '11111111-1111-1111-1111-111111111111', // Rahul
    late_date: getDateOffset(5),
    late_hours: 0,
    late_minutes: 15,
    fine_amount: 100,
    is_paid: false,
    remarks: 'Late commute',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'entry-9',
    person_id: '22222222-2222-2222-2222-222222222222', // Akhil
    late_date: getDateOffset(6),
    late_hours: 0,
    late_minutes: 20,
    fine_amount: 100,
    is_paid: true,
    remarks: 'Late alarm',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'entry-10',
    person_id: '33333333-3333-3333-3333-333333333333', // Arjun
    late_date: getDateOffset(7),
    late_hours: 0,
    late_minutes: 40,
    fine_amount: 100,
    is_paid: false,
    remarks: 'Road maintenance diversion',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'entry-11',
    person_id: '33333333-3333-3333-3333-333333333333', // Arjun
    late_date: getDateOffset(8),
    late_hours: 0,
    late_minutes: 15,
    fine_amount: 100,
    is_paid: false,
    remarks: 'Train delay',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
];

export function getStoredPeople(): Person[] {
  try {
    const raw = localStorage.getItem(PEOPLE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PEOPLE_STORAGE_KEY, JSON.stringify(INITIAL_PEOPLE));
      return INITIAL_PEOPLE;
    }
    return JSON.parse(raw);
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
      localStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(INITIAL_ENTRIES));
      return INITIAL_ENTRIES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_ENTRIES;
  }
}

export function saveStoredEntries(entries: LateEntry[]) {
  localStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(entries));
}
