export interface Person {
  id: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface LateEntry {
  id: string;
  person_id: string;
  late_date: string; // YYYY-MM-DD
  late_hours: number;
  late_minutes: number;
  fine_amount: number;
  is_paid?: boolean;
  paid_at?: string | null;
  remarks?: string | null;
  created_at: string;
  updated_at?: string;
  person?: Person; // Joined relation
}

export interface LateEntryWithPerson extends LateEntry {
  person_name: string;
  person_active: boolean;
}

export interface PersonSummary {
  person_id: string;
  full_name: string;
  is_active: boolean;
  total_late_days: number;
  total_fine: number;
  total_paid: number;
  total_outstanding: number;
  latest_late_date: string | null;
}

export interface DailySummary {
  date: string;
  entries_count: number;
  total_fine: number;
  total_minutes: number;
}

export interface FilterState {
  searchQuery: string;
  selectedDate: string; // YYYY-MM-DD or empty
  startDate: string;    // YYYY-MM-DD or empty
  endDate: string;      // YYYY-MM-DD or empty
  personId: string;     // empty or UUID
  sortBy: 'newest' | 'oldest' | 'highest_fine' | 'most_days' | 'name';
}
