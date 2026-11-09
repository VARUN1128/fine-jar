import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Person, LateEntry, LateEntryWithPerson, PersonSummary, DailySummary } from '@/types/database';
import { getStoredPeople, saveStoredPeople, getStoredEntries, saveStoredEntries } from '@/lib/mockStore';
import { getTodayDateString } from '@/lib/utils';
import { calculateEntryFineForDate, recalculateAllFines } from '@/utils/fineCalculation';

interface FineTrackContextType {
  people: Person[];
  lateEntries: LateEntry[];
  entriesWithPerson: LateEntryWithPerson[];
  personSummaries: PersonSummary[];
  dailySummaries: DailySummary[];
  loading: boolean;
  realtimeStatus: 'live' | 'connecting' | 'offline' | 'local_sandbox';
  
  // High-level aggregates
  totalRegisteredPeople: number;
  totalLateEntries: number;
  totalFinesGenerated: number;
  totalFinesCollected: number;
  totalOutstandingFines: number;
  todayLateCount: number;
  mostLatePerson: PersonSummary | null;
  
  // Actions
  addPerson: (fullName: string) => Promise<{ success: boolean; error?: string; person?: Person }>;
  updatePerson: (id: string, fullName: string, isActive?: boolean) => Promise<{ success: boolean; error?: string }>;
  deletePerson: (id: string) => Promise<{ success: boolean; error?: string }>;
  markLate: (params: {
    personId: string;
    lateDate: string;
    hours: number;
    minutes: number;
    remarks?: string;
  }) => Promise<{ success: boolean; error?: string; entry?: LateEntry }>;
  updateLateEntry: (id: string, params: {
    lateDate: string;
    hours: number;
    minutes: number;
    remarks?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  deleteLateEntry: (id: string) => Promise<{ success: boolean; error?: string }>;
  togglePaymentStatus: (id: string, isPaid: boolean) => Promise<{ success: boolean; error?: string }>;
  markPersonAllPaid: (personId: string) => Promise<{ success: boolean; error?: string; count?: number }>;
  refreshData: () => Promise<void>;
}

const FineTrackContext = createContext<FineTrackContextType | undefined>(undefined);

export const FineTrackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [lateEntries, setLateEntries] = useState<LateEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [realtimeStatus, setRealtimeStatus] = useState<'live' | 'connecting' | 'offline' | 'local_sandbox'>('connecting');

  // Load from Supabase or Local Mock
  const fetchData = useCallback(async () => {
    if (isSupabaseConfigured) {
      try {
        setLoading(true);
        // Fetch people
        const { data: peopleData, error: peopleError } = await supabase
          .from('people')
          .select('*')
          .order('full_name', { ascending: true });

        if (peopleError) throw peopleError;

        // Fetch late entries
        const { data: entriesData, error: entriesError } = await supabase
          .from('late_entries')
          .select('*')
          .order('late_date', { ascending: false });

        if (entriesError) throw entriesError;

        setPeople(peopleData || []);
        setLateEntries(recalculateAllFines(entriesData || []));
        setRealtimeStatus('live');
      } catch (err: any) {
        console.error('Failed to fetch data from Supabase:', err);
        setRealtimeStatus('offline');
      } finally {
        setLoading(false);
      }
    } else {
      // Local Sandbox Mode
      setPeople(getStoredPeople());
      setLateEntries(getStoredEntries());
      setRealtimeStatus('local_sandbox');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Setup Supabase Realtime Subscription
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    setRealtimeStatus('connecting');

    const channel = supabase
      .channel('finetrack-realtime-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'people' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPeople((prev) => {
              if (prev.some((p) => p.id === payload.new.id)) return prev;
              return [...prev, payload.new as Person].sort((a, b) => a.full_name.localeCompare(b.full_name));
            });
          } else if (payload.eventType === 'UPDATE') {
            setPeople((prev) =>
              prev.map((p) => (p.id === payload.new.id ? (payload.new as Person) : p))
            );
          } else if (payload.eventType === 'DELETE') {
            setPeople((prev) => prev.filter((p) => p.id === payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'late_entries' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setLateEntries((prev) => {
              if (prev.some((e) => e.id === payload.new.id)) return prev;
              return [payload.new as LateEntry, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            setLateEntries((prev) =>
              prev.map((e) => (e.id === payload.new.id ? (payload.new as LateEntry) : e))
            );
          } else if (payload.eventType === 'DELETE') {
            setLateEntries((prev) => prev.filter((e) => e.id === payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('live');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setRealtimeStatus('offline');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Joined entries with person details
  const entriesWithPerson = useMemo<LateEntryWithPerson[]>(() => {
    const peopleMap = new Map<string, Person>();
    people.forEach((p) => peopleMap.set(p.id, p));

    return lateEntries.map((entry) => {
      const person = peopleMap.get(entry.person_id);
      return {
        ...entry,
        person_name: person ? person.full_name : 'Unknown Person',
        person_active: person ? person.is_active : false,
      };
    });
  }, [people, lateEntries]);

  // Aggregates per person
  const personSummaries = useMemo<PersonSummary[]>(() => {
    const map = new Map<string, {
      total_late_days: number;
      total_fine: number;
      total_paid: number;
      total_outstanding: number;
      latest_late_date: string | null;
    }>();

    // Initialize for all people
    people.forEach((p) => {
      map.set(p.id, {
        total_late_days: 0,
        total_fine: 0,
        total_paid: 0,
        total_outstanding: 0,
        latest_late_date: null,
      });
    });

    // Accumulate from entries
    lateEntries.forEach((entry) => {
      const existing = map.get(entry.person_id);
      if (existing) {
        existing.total_late_days += 1;
        const fine = entry.fine_amount || 100;
        existing.total_fine += fine;
        if (entry.is_paid) {
          existing.total_paid += fine;
        } else {
          existing.total_outstanding += fine;
        }
        if (!existing.latest_late_date || entry.late_date > existing.latest_late_date) {
          existing.latest_late_date = entry.late_date;
        }
      }
    });

    return people.map((p) => {
      const data = map.get(p.id) || {
        total_late_days: 0,
        total_fine: 0,
        total_paid: 0,
        total_outstanding: 0,
        latest_late_date: null,
      };
      return {
        person_id: p.id,
        full_name: p.full_name,
        is_active: p.is_active,
        ...data,
      };
    });
  }, [people, lateEntries]);

  // Aggregates by day
  const dailySummaries = useMemo<DailySummary[]>(() => {
    const map = new Map<string, { entries_count: number; total_fine: number; total_minutes: number }>();

    lateEntries.forEach((entry) => {
      const existing = map.get(entry.late_date) || { entries_count: 0, total_fine: 0, total_minutes: 0 };
      existing.entries_count += 1;
      existing.total_fine += (entry.fine_amount || 100);
      existing.total_minutes += (entry.late_hours * 60 + entry.late_minutes);
      map.set(entry.late_date, existing);
    });

    return Array.from(map.entries())
      .map(([date, stats]) => ({
        date,
        ...stats,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [lateEntries]);

  // High-level statistics
  const totalRegisteredPeople = useMemo(() => people.filter(p => p.is_active).length, [people]);
  const totalLateEntries = lateEntries.length;
  const totalFinesGenerated = useMemo(
    () => lateEntries.reduce((sum, e) => sum + (e.fine_amount || 100), 0),
    [lateEntries]
  );
  const totalFinesCollected = useMemo(
    () => lateEntries.filter((e) => e.is_paid).reduce((sum, e) => sum + (e.fine_amount || 100), 0),
    [lateEntries]
  );
  const totalOutstandingFines = totalFinesGenerated - totalFinesCollected;

  const todayDateString = getTodayDateString();
  const todayLateCount = useMemo(
    () => lateEntries.filter((e) => e.late_date === todayDateString).length,
    [lateEntries, todayDateString]
  );

  const mostLatePerson = useMemo(() => {
    if (personSummaries.length === 0) return null;
    const sorted = [...personSummaries].sort((a, b) => b.total_late_days - a.total_late_days);
    return sorted[0].total_late_days > 0 ? sorted[0] : null;
  }, [personSummaries]);

  // ACTIONS

  // 1. Add Person
  const addPerson = async (fullName: string) => {
    const cleanName = fullName.trim();
    if (!cleanName) return { success: false, error: 'Full name is required' };

    // Check if name already exists (case-insensitive)
    const exists = people.some((p) => p.full_name.toLowerCase() === cleanName.toLowerCase());
    if (exists) {
      return { success: false, error: `A person named "${cleanName}" already exists.` };
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('people')
          .insert([{ full_name: cleanName, is_active: true }])
          .select()
          .single();

        if (error) throw error;
        setPeople((prev) => [...prev, data].sort((a, b) => a.full_name.localeCompare(b.full_name)));
        return { success: true, person: data };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to add person' };
      }
    } else {
      const newPerson: Person = {
        id: crypto.randomUUID ? crypto.randomUUID() : `person-${Date.now()}`,
        full_name: cleanName,
        is_active: true,
        created_at: new Date().toISOString(),
      };
      const updated = [...people, newPerson].sort((a, b) => a.full_name.localeCompare(b.full_name));
      saveStoredPeople(updated);
      setPeople(updated);
      return { success: true, person: newPerson };
    }
  };

  // 2. Update Person
  const updatePerson = async (id: string, fullName: string, isActive: boolean = true) => {
    const cleanName = fullName.trim();
    if (!cleanName) return { success: false, error: 'Full name is required' };

    // Prevent duplicate name with another person
    const exists = people.some(
      (p) => p.id !== id && p.full_name.toLowerCase() === cleanName.toLowerCase()
    );
    if (exists) {
      return { success: false, error: `Another person is already named "${cleanName}".` };
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('people')
          .update({ full_name: cleanName, is_active: isActive })
          .eq('id', id);

        if (error) throw error;
        setPeople((prev) =>
          prev.map((p) => (p.id === id ? { ...p, full_name: cleanName, is_active: isActive } : p))
        );
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to update person' };
      }
    } else {
      const updated = people.map((p) =>
        p.id === id ? { ...p, full_name: cleanName, is_active: isActive } : p
      );
      saveStoredPeople(updated);
      setPeople(updated);
      return { success: true };
    }
  };

  // 3. Delete Person
  const deletePerson = async (id: string) => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('people').delete().eq('id', id);
        if (error) throw error;
        setPeople((prev) => prev.filter((p) => p.id !== id));
        setLateEntries((prev) => prev.filter((e) => e.person_id !== id));
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to delete person' };
      }
    } else {
      const updatedPeople = people.filter((p) => p.id !== id);
      const updatedEntries = lateEntries.filter((e) => e.person_id !== id);
      saveStoredPeople(updatedPeople);
      saveStoredEntries(updatedEntries);
      setPeople(updatedPeople);
      setLateEntries(updatedEntries);
      return { success: true };
    }
  };

  // 4. Mark Late (with strict duplicate prevention for same person on same date)
  const markLate = async (params: {
    personId: string;
    lateDate: string;
    hours: number;
    minutes: number;
    remarks?: string;
  }) => {
    const { personId, lateDate, hours, minutes, remarks } = params;

    if (!personId) return { success: false, error: 'Please select a person.' };
    if (!lateDate) return { success: false, error: 'Please select a date.' };
    if (hours < 0 || minutes < 0 || (hours === 0 && minutes === 0)) {
      return { success: false, error: 'Late duration must be greater than 0 minutes.' };
    }

    // Client-side Duplicate Check
    const isDuplicate = lateEntries.some(
      (e) => e.person_id === personId && e.late_date === lateDate
    );
    if (isDuplicate) {
      const personObj = people.find((p) => p.id === personId);
      return {
        success: false,
        error: `Duplicate Entry: ${personObj?.full_name || 'This person'} has already been marked late on ${lateDate}. Each person can only have one late entry per date.`,
      };
    }

    const { fineAmount } = calculateEntryFineForDate(lateEntries, personId, lateDate);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('late_entries')
          .insert([
            {
              person_id: personId,
              late_date: lateDate,
              late_hours: hours,
              late_minutes: minutes,
              fine_amount: fineAmount,
              remarks: remarks?.trim() || null,
              is_paid: false,
            },
          ])
          .select()
          .single();

        if (error) {
          if (error.code === '23505') {
            return {
              success: false,
              error: 'Database constraint: This person already has a late record for this date.',
            };
          }
          throw error;
        }

        const recalced = recalculateAllFines([data, ...lateEntries]);
        setLateEntries(recalced);
        return { success: true, entry: data };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to record late entry' };
      }
    } else {
      const newEntry: LateEntry = {
        id: crypto.randomUUID ? crypto.randomUUID() : `entry-${Date.now()}`,
        person_id: personId,
        late_date: lateDate,
        late_hours: hours,
        late_minutes: minutes,
        fine_amount: fineAmount,
        is_paid: false,
        remarks: remarks?.trim() || null,
        created_at: new Date().toISOString(),
      };
      const updated = recalculateAllFines([newEntry, ...lateEntries]);
      saveStoredEntries(updated);
      setLateEntries(updated);
      return { success: true, entry: newEntry };
    }
  };

  // 5. Update Late Entry
  const updateLateEntry = async (
    id: string,
    params: { lateDate: string; hours: number; minutes: number; remarks?: string }
  ) => {
    const { lateDate, hours, minutes, remarks } = params;
    const currentEntry = lateEntries.find((e) => e.id === id);
    if (!currentEntry) return { success: false, error: 'Entry not found' };

    // Duplicate check if date changed
    if (currentEntry.late_date !== lateDate) {
      const duplicate = lateEntries.some(
        (e) => e.id !== id && e.person_id === currentEntry.person_id && e.late_date === lateDate
      );
      if (duplicate) {
        return {
          success: false,
          error: `Another entry already exists for this person on ${lateDate}.`,
        };
      }
    }

    const updatedList = recalculateAllFines(
      lateEntries.map((e) =>
        e.id === id
          ? { ...e, late_date: lateDate, late_hours: hours, late_minutes: minutes, remarks: remarks?.trim() || null }
          : e
      )
    );

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('late_entries')
          .update({
            late_date: lateDate,
            late_hours: hours,
            late_minutes: minutes,
            remarks: remarks?.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) throw error;
        setLateEntries(updatedList);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to update late entry' };
      }
    } else {
      saveStoredEntries(updatedList);
      setLateEntries(updatedList);
      return { success: true };
    }
  };

  // 6. Delete Late Entry (automatic recalculation of totals)
  const deleteLateEntry = async (id: string) => {
    const remaining = recalculateAllFines(lateEntries.filter((e) => e.id !== id));
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('late_entries').delete().eq('id', id);
        if (error) throw error;
        setLateEntries(remaining);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to delete late entry' };
      }
    } else {
      saveStoredEntries(remaining);
      setLateEntries(remaining);
      return { success: true };
    }
  };

  // 7. Toggle Payment Status
  const togglePaymentStatus = async (id: string, isPaid: boolean) => {
    const nowIso = isPaid ? new Date().toISOString() : null;
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('late_entries')
          .update({
            is_paid: isPaid,
            paid_at: nowIso,
          })
          .eq('id', id);

        if (error) throw error;
        setLateEntries((prev) =>
          prev.map((e) =>
            e.id === id ? { ...e, is_paid: isPaid, paid_at: nowIso } : e
          )
        );
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to update payment' };
      }
    } else {
      const updated = lateEntries.map((e) =>
        e.id === id ? { ...e, is_paid: isPaid, paid_at: nowIso } : e
      );
      saveStoredEntries(updated);
      setLateEntries(updated);
      return { success: true };
    }
  };

  // 8. Mark All Fines for a Person as Paid
  const markPersonAllPaid = async (personId: string) => {
    const unpaidEntries = lateEntries.filter((e) => e.person_id === personId && !e.is_paid);
    if (unpaidEntries.length === 0) {
      return { success: true, count: 0 };
    }

    const nowIso = new Date().toISOString();

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('late_entries')
          .update({
            is_paid: true,
            paid_at: nowIso,
          })
          .eq('person_id', personId)
          .eq('is_paid', false);

        if (error) throw error;
        setLateEntries((prev) =>
          prev.map((e) =>
            e.person_id === personId ? { ...e, is_paid: true, paid_at: nowIso } : e
          )
        );
        return { success: true, count: unpaidEntries.length };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to update payment status' };
      }
    } else {
      const updated = lateEntries.map((e) =>
        e.person_id === personId ? { ...e, is_paid: true, paid_at: nowIso } : e
      );
      saveStoredEntries(updated);
      setLateEntries(updated);
      return { success: true, count: unpaidEntries.length };
    }
  };

  return (
    <FineTrackContext.Provider
      value={{
        people,
        lateEntries,
        entriesWithPerson,
        personSummaries,
        dailySummaries,
        loading,
        realtimeStatus,
        totalRegisteredPeople,
        totalLateEntries,
        totalFinesGenerated,
        totalFinesCollected,
        totalOutstandingFines,
        todayLateCount,
        mostLatePerson,
        addPerson,
        updatePerson,
        deletePerson,
        markLate,
        updateLateEntry,
        deleteLateEntry,
        togglePaymentStatus,
        markPersonAllPaid,
        refreshData: fetchData,
      }}
    >
      {children}
    </FineTrackContext.Provider>
  );
};

export const useFineTrack = () => {
  const context = useContext(FineTrackContext);
  if (!context) {
    throw new Error('useFineTrack must be used within a FineTrackProvider');
  }
  return context;
};
