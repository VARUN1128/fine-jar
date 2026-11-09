import React, { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, Users, IndianRupee, Timer, CheckCircle, CheckCircle2 } from 'lucide-react';
import { useFineTrack } from '@/context/FineTrackContext';
import { useAuth } from '@/context/AuthContext';
import { formatDate, formatDuration, formatRupee, getTodayDateString } from '@/lib/utils';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { PersonSummary } from '@/types/database';

interface DailyLateTrackerProps {
  onSelectPerson: (person: PersonSummary) => void;
}

export const DailyLateTracker: React.FC<DailyLateTrackerProps> = ({ onSelectPerson }) => {
  const { entriesWithPerson, personSummaries, togglePaymentStatus } = useFineTrack();
  const { isAdmin } = useAuth();

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return getTodayDateString();
  });

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

  const dayEntries = useMemo(() => {
    return entriesWithPerson.filter((entry) => entry.late_date === selectedDate);
  }, [entriesWithPerson, selectedDate]);

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
    <div className="space-y-4 font-mono">
      {/* Date Selector Header Plate */}
      <div className="bg-[#090e0b] p-4 sm:p-6 border border-[#304c3b]">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#020303] border border-[#38ff8e] flex items-center justify-center text-[#38ff8e]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#38ff8e]" />
                <h2 className="font-display text-lg font-bold uppercase text-[#f8fffa] tracking-wide">
                  DAILY LATE TRACKER
                </h2>
              </div>
              <p className="text-[11px] text-[#c2cbc5] uppercase">
                TARGET_DATE: {formatDate(selectedDate)} // CALENDAR_DISCIPLINE_AUDIT
              </p>
            </div>
          </div>

          {/* Interactive Date Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => shiftDate(-1)}
              title="Previous Day"
              className="p-2 bg-[#020303] border border-[#304c3b] hover:border-[#38ff8e] text-[#f8fffa] hover:text-[#38ff8e]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 text-xs font-mono font-bold bg-[#020303] border border-[#304c3b] focus:border-[#38ff8e] text-[#f8fffa] outline-hidden cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={() => shiftDate(1)}
              title="Next Day"
              className="p-2 bg-[#020303] border border-[#304c3b] hover:border-[#38ff8e] text-[#f8fffa] hover:text-[#38ff8e]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={setToday}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider ${
                selectedDate === getTodayDateString()
                  ? 'bg-[#38ff8e] text-[#020303] border border-[#38ff8e]'
                  : 'bg-[#020303] text-[#d3dbd5] border border-[#304c3b] hover:border-[#38ff8e]'
              }`}
            >
              TODAY
            </button>
          </div>
        </div>

        {/* Selected Date Facts Matrix */}
        <div className="mt-4 pt-4 border-t border-[#304c3b] grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <div className="flex items-center justify-between p-3 bg-[#020303] border border-[#304c3b]">
            <span className="text-[11px] text-[#c2cbc5] uppercase">MEMBERS_LATE:</span>
            <span className="text-base font-bold text-[#f8fffa]">{totalPeopleLate}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#020303] border border-[#304c3b]">
            <span className="text-[11px] text-[#c2cbc5] uppercase">FINES_LEVIED:</span>
            <span className="text-base font-bold text-[#ff65d8]">{formatRupee(totalFineGenerated)}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#020303] border border-[#304c3b]">
            <span className="text-[11px] text-[#c2cbc5] uppercase">TOTAL_DELAY_SUM:</span>
            <span className="text-base font-bold text-[#65f8ff]">{totalDurationStr}</span>
          </div>
        </div>
      </div>

      {/* Date Table */}
      <div className="bg-[#090e0b] border border-[#304c3b]">
        <div className="p-4 border-b border-[#304c3b] flex items-center justify-between bg-[#020303]/50">
          <div>
            <h3 className="font-display text-sm font-bold uppercase text-[#f8fffa]">
              ATTENDANCE_RECORDS // {formatDate(selectedDate)}
            </h3>
            <p className="text-[10px] text-[#c2cbc5] uppercase mt-0.5">
              CLICK RECORD TO OPEN DOSSIER
            </p>
          </div>
          {dayEntries.length > 0 && (
            <Badge variant="danger">
              {dayEntries.length} LOGGED
            </Badge>
          )}
        </div>

        {dayEntries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-[#304c3b] bg-[#020303] text-[#c2cbc5] text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-2.5 px-4 border-r border-[#304c3b]">MEMBER_IDENTITY</th>
                  <th className="py-2.5 px-4 border-r border-[#304c3b]">TARDINESS_OFFSET</th>
                  <th className="py-2.5 px-4 border-r border-[#304c3b]">PENALTY</th>
                  <th className="py-2.5 px-4 border-r border-[#304c3b]">PAYMENT</th>
                  <th className="py-2.5 px-4 border-r border-[#304c3b]">INCIDENT_NOTES</th>
                  <th className="py-2.5 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#304c3b] text-xs">
                {dayEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    onClick={() => handleRowClick(entry.person_id)}
                    className="hover:bg-[#020303] transition-none cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-bold text-[#f8fffa] flex items-center gap-2 border-r border-[#304c3b]">
                      <div className="w-6 h-6 bg-[#020303] border border-[#304c3b] group-hover:border-[#38ff8e] text-[#38ff8e] flex items-center justify-center text-[10px] font-bold">
                        {entry.person_name.charAt(0)}
                      </div>
                      <span className="group-hover:text-[#38ff8e]">
                        {entry.person_name}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[#ff65d8] font-bold border-r border-[#304c3b]">
                      +{formatDuration(entry.late_hours, entry.late_minutes)}
                    </td>

                    <td className="py-3 px-4 font-bold text-[#38ff8e] border-r border-[#304c3b]">
                      {formatRupee(entry.fine_amount || 100)}
                    </td>

                    <td className="py-3 px-4 border-r border-[#304c3b] whitespace-nowrap">
                      {entry.is_paid ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#38ff8e]">
                          <CheckCircle2 className="w-3 h-3 text-[#38ff8e]" />
                          <span>PAID ✓</span>
                        </span>
                      ) : isAdmin ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePaymentStatus(entry.id, true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold uppercase bg-[#38ff8e] text-[#020303] hover:bg-transparent hover:text-[#38ff8e] border border-[#38ff8e] clip-corner-diagonal cursor-pointer"
                          title="Click to mark as paid"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>MARK PAID</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-[#ff65d8] uppercase">
                          PENDING
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-[#d3dbd5] max-w-xs truncate border-r border-[#304c3b]">
                      {entry.remarks || <span className="text-[#304c3b]">[NULL]</span>}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="text-[10px] uppercase font-bold text-[#38ff8e] group-hover:underline">
                        DOSSIER &rarr;
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
              title="NO LATE ENTRIES RECORDED FOR THIS DATE."
              message={`Zero recorded infractions on ${formatDate(selectedDate)}. Standard discipline maintained.`}
              icon={CheckCircle}
            />
          </div>
        )}
      </div>
    </div>
  );
};
