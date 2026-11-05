import React from 'react';
import { Modal } from '@/components/common/Modal';
import { PersonSummary, LateEntry } from '@/types/database';
import { useFineTrack } from '@/context/FineTrackContext';
import { formatDate, formatDuration, formatRupee, exportToCSV } from '@/lib/utils';
import { Badge } from '@/components/common/Badge';
import { Clock, Calendar, IndianRupee, Download, CheckCircle, AlertCircle } from 'lucide-react';

interface PersonHistoryModalProps {
  person: PersonSummary | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PersonHistoryModal: React.FC<PersonHistoryModalProps> = ({
  person,
  isOpen,
  onClose,
}) => {
  const { lateEntries } = useFineTrack();

  if (!person) return null;

  // Filter and sort entries for this person (newest first)
  const historyEntries: LateEntry[] = lateEntries
    .filter((e) => e.person_id === person.person_id)
    .sort((a, b) => b.late_date.localeCompare(a.late_date));

  const totalMinutes = historyEntries.reduce(
    (sum, e) => sum + (e.late_hours * 60 + e.late_minutes),
    0
  );

  const handleExportCSV = () => {
    const rows = historyEntries.map((e) => ({
      'Person Name': person.full_name,
      'Date': formatDate(e.late_date),
      'Raw Date': e.late_date,
      'Hours Late': e.late_hours,
      'Minutes Late': e.late_minutes,
      'Total Duration': formatDuration(e.late_hours, e.late_minutes),
      'Fine Amount': e.fine_amount || 100,
      'Paid Status': e.is_paid ? 'Paid' : 'Unpaid',
      'Remarks': e.remarks || '',
    }));
    exportToCSV(`FineTrack_${person.full_name.replace(/\s+/g, '_')}_History`, rows);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Late Attendance History: ${person.full_name}`}
      description="Detailed historical record of all late days, durations, and accumulated fines."
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Quick summary stats banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium">Total Late Days</span>
              <p className="text-base font-bold text-slate-900">{person.total_late_days}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium">Accumulated Fine</span>
              <p className="text-base font-bold text-slate-900">{formatRupee(person.total_fine)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-100 text-sky-700 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium">Total Late Time</span>
              <p className="text-base font-bold text-slate-900">
                {formatDuration(Math.floor(totalMinutes / 60), totalMinutes % 60)}
              </p>
            </div>
          </div>
        </div>

        {/* History Table or Empty State */}
        {historyEntries.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Recorded Entries ({historyEntries.length})
              </h4>
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto max-h-80 border border-slate-200/80 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Duration</th>
                    <th className="py-2.5 px-4">Fine</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {historyEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {formatDate(entry.late_date)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/40 font-medium">
                          {formatDuration(entry.late_hours, entry.late_minutes)}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        <Badge variant="danger" size="sm">
                          {formatRupee(entry.fine_amount || 100)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {entry.is_paid ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-full">
                            <AlertCircle className="w-3 h-3 text-rose-500" />
                            Unpaid
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                        {entry.remarks || <span className="text-slate-300 italic">None</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-sm">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-800">Spotless Attendance!</p>
            <p className="text-xs text-slate-500 mt-1">This person has no recorded late days.</p>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
