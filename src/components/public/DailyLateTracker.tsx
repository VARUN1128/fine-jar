import React, { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, Users, IndianRupee, Timer, CheckCircle, Search } from 'lucide-react';
import { useFineTrack } from '@/context/FineTrackContext';
import { formatDate, formatDuration, formatRupee, getTodayDateString } from '@/lib/utils';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { PersonSummary } from '@/types/database';

interface DailyLateTrackerProps {
  onSelectPerson: (person: PersonSummary) => void;
}

export const DailyLateTracker: React.FC<DailyLateTrackerProps> = ({ onSelectPerson }) => {
  const { entriesWithPerson, personSummaries } = useFineTrack();

  // Selected date defaults to today or the latest recorded date if today has none
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return getTodayDateString();
  });

  // Shift date helper (-1 or +1 day)
  const shiftDate = (deltaDays: number) => {
    const parts = selectedDate.split('-');
    const cur = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    cur.setDate(cur.getDate() + deltaDays);
    const year = cur.getFullYear();
    const month = String(cur.getMonth() + 1).padStart(2, '0');
    const day = String(cur.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
  };

  const setToday = () => {
    setSelectedDate(getTodayDateString());
  };

  // Filter entries for selectedDate
  const dayEntries = useMemo(() => {
    return entriesWithPerson.filter((entry) => entry.late_date === selectedDate);
  }, [entriesWithPerson, selectedDate]);

  // Daily statistics
  const totalPeopleLate = dayEntries.length;
  const totalFineGenerated = dayEntries.reduce((sum, e) => sum + (e.fine_amount || 100), 0);
  const totalMinutes = dayEntries.reduce(
    (sum, e) => sum + (e.late_hours * 60 + e.late_minutes),
    0
  );
  const totalDurationStr = formatDuration(Math.floor(totalMinutes / 60), totalMinutes % 60);

  const handleRowClick = (personId: string) => {
    const person = personSummaries.find((p) => p.person_id === personId);
    if (person) {
      onSelectPerson(person);
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Selector Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <Calendar className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Daily Late Tracker</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Track everyone who arrived late on a specific date
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Date Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => shiftDate(-1)}
              title="Previous Day"
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="relative flex-1 sm:w-48">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-center transition-all cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={() => shiftDate(1)}
              title="Next Day"
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={setToday}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                selectedDate === getTodayDateString()
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Today
            </button>
          </div>
        </div>

        {/* Selected Date Summary Metrics */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
            <div className="p-2.5 bg-rose-100 text-rose-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Late People</span>
              <p className="text-lg font-bold text-slate-900">{totalPeopleLate}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Fine Generated</span>
              <p className="text-lg font-bold text-slate-900">{formatRupee(totalFineGenerated)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
            <div className="p-2.5 bg-sky-100 text-sky-700 rounded-lg">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Total Delay</span>
              <p className="text-lg font-bold text-slate-900">{totalDurationStr}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Table or Empty State */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Late Attendance on {formatDate(selectedDate)}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any row to inspect complete attendance history
            </p>
          </div>
          {dayEntries.length > 0 && (
            <Badge variant="danger">
              {dayEntries.length} Recorded
            </Badge>
          )}
        </div>

        {dayEntries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-6">Late Duration</th>
                  <th className="py-3 px-6">Fine</th>
                  <th className="py-3 px-6">Remarks</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {dayEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    onClick={() => handleRowClick(entry.person_id)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-6 font-semibold text-slate-900 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 group-hover:bg-rose-100 group-hover:text-rose-700 flex items-center justify-center font-bold text-xs uppercase transition-colors">
                        {entry.person_name.charAt(0)}
                      </div>
                      <div>
                        <span className="group-hover:text-rose-600 transition-colors">
                          {entry.person_name}
                        </span>
                        {!entry.person_active && (
                          <span className="ml-2 text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-600 font-medium">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200/50 text-xs">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        {formatDuration(entry.late_hours, entry.late_minutes)}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-bold text-slate-900">
                      <Badge variant="danger" size="md">
                        ₹100
                      </Badge>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-500 max-w-xs truncate">
                      {entry.remarks ? (
                        <span>{entry.remarks}</span>
                      ) : (
                        <span className="text-slate-300 italic">No remarks</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900 underline underline-offset-2">
                        View History &rarr;
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              title="No late entries recorded for this date."
              message={`Great news! No members were recorded late on ${formatDate(selectedDate)}.`}
              icon={CheckCircle}
            />
          </div>
        )}
      </div>
    </div>
  );
};
