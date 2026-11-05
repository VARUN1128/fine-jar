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
    exportToCSV(`FineTrack_Dossier_${person.full_name.replace(/\s+/g, '_')}`, rows);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`DOSSIER // ${person.full_name}`}
      description="Historical tardiness infractions, duration logs, and cumulative penalty calculation."
      maxWidth="2xl"
    >
      <div className="space-y-4 font-mono">
        {/* Facts Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-[#020303] border border-[#304c3b]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#090e0b] border border-[#304c3b] text-[#38ff8e]">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] text-[#c2cbc5] uppercase block">TOTAL_LATE_DAYS</span>
              <p className="text-sm font-bold text-[#f8fffa]">{person.total_late_days}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#090e0b] border border-[#304c3b] text-[#ff65d8]">
              <IndianRupee className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] text-[#c2cbc5] uppercase block">TOTAL_PENALTY</span>
              <p className="text-sm font-bold text-[#ff65d8]">{formatRupee(person.total_fine)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#090e0b] border border-[#304c3b] text-[#65f8ff]">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] text-[#c2cbc5] uppercase block">DELAY_TIME_SUM</span>
              <p className="text-sm font-bold text-[#65f8ff]">
                {formatDuration(Math.floor(totalMinutes / 60), totalMinutes % 60)}
              </p>
            </div>
          </div>
        </div>

        {/* History Table */}
        {historyEntries.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[11px] font-bold text-[#f8fffa] uppercase tracking-wider">
                LOGGED_EVENTS ({historyEntries.length})
              </h4>
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-[#38ff8e] bg-[#020303] border border-[#304c3b] hover:border-[#38ff8e] uppercase"
              >
                <Download className="w-3 h-3 text-[#38ff8e]" />
                <span>EXPORT_CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto max-h-72 border border-[#304c3b]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-[#020303] text-[#c2cbc5] uppercase font-bold text-[10px] border-b border-[#304c3b]">
                  <tr>
                    <th className="py-2 px-3 border-r border-[#304c3b]">EVENT_DATE</th>
                    <th className="py-2 px-3 border-r border-[#304c3b]">OFFSET</th>
                    <th className="py-2 px-3 border-r border-[#304c3b]">LEVY</th>
                    <th className="py-2 px-3 border-r border-[#304c3b]">STATUS</th>
                    <th className="py-2 px-3">NOTES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#304c3b] text-[#f8fffa] text-xs">
                  {historyEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-[#020303]">
                      <td className="py-2 px-3 font-bold border-r border-[#304c3b] whitespace-nowrap">
                        {formatDate(entry.late_date)}
                      </td>
                      <td className="py-2 px-3 border-r border-[#304c3b] whitespace-nowrap text-[#ff65d8]">
                        +{formatDuration(entry.late_hours, entry.late_minutes)}
                      </td>
                      <td className="py-2 px-3 font-bold text-[#38ff8e] border-r border-[#304c3b] whitespace-nowrap">
                        ₹100.00
                      </td>
                      <td className="py-2 px-3 border-r border-[#304c3b] whitespace-nowrap">
                        {entry.is_paid ? (
                          <span className="text-[10px] text-[#38ff8e] uppercase font-bold">
                            COLLECTED
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#ff65d8] uppercase font-bold">
                            PENDING
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-[#c2cbc5] max-w-xs truncate">
                        {entry.remarks || <span className="text-[#304c3b]">[NULL]</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-[#c2cbc5] text-xs bg-[#020303] border border-[#304c3b]">
            <CheckCircle className="w-6 h-6 text-[#38ff8e] mx-auto mb-1.5" />
            <p className="font-bold text-[#f8fffa] uppercase">DISCIPLINE RECORD UNBLEMISHED</p>
            <p className="text-[11px] text-[#c2cbc5] mt-0.5">Zero tardiness events logged for this identity.</p>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1 text-xs font-mono font-bold uppercase text-[#d3dbd5] bg-transparent border border-[#304c3b] hover:bg-[#304c3b]"
          >
            DISMISS
          </button>
        </div>
      </div>
    </Modal>
  );
};
