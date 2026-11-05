import { Person, LateEntry } from '@/types/database';

const PEOPLE_STORAGE_KEY = 'finetrack_people_live';
const ENTRIES_STORAGE_KEY = 'finetrack_entries_live';

export const INITIAL_PEOPLE: Person[] = [];
export const INITIAL_ENTRIES: LateEntry[] = [];

export function getStoredPeople(): Person[] {
  try {
    const raw = localStorage.getItem(PEOPLE_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveStoredPeople(people: Person[]) {
  localStorage.setItem(PEOPLE_STORAGE_KEY, JSON.stringify(people));
}

export function getStoredEntries(): LateEntry[] {
  try {
    const raw = localStorage.getItem(ENTRIES_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveStoredEntries(entries: LateEntry[]) {
  localStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(entries));
}
