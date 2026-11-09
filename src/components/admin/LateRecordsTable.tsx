import React, { useState, useMemo } from 'react';
import { Search, Download, Edit3, Trash2, CheckCircle2, Clock, X, Plus } from 'lucide-react';
import { useFineTrack } from '@/context/FineTrackContext';
import { LateEntryWithPerson } from '@/types/database';
import { formatDate, formatDuration, formatRupee, exportToCSV } from '@/lib/utils';
import { Badge } from '@/components/common/Badge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { MarkLateModal } from './MarkLateModal';

interface LateRecordsTableProps {
  onOpenNewLateModal: () => void;
}

export const LateRecordsTable: React.FC<LateRecordsTableProps> = ({ onOpenNewLateModal }) => {
  const { entriesWithPerson, people, deleteLateEntry, togglePaymentStatus } = useFineTrack();

  const [searchName, setSearchName] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [specificDate, setSpecificDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  const [editingEntry, setEditingEntry] = useState<LateEntryWithPerson | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<LateEntryWithPerson | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const filteredRecords = useMemo(() => {
    return entriesWithPerson.filter((entry) => {
      if (searchName.trim()) {
        const q = searchName.toLowerCase();
        if (!entry.person_name.toLowerCase().includes(q)) return false;
      }
      if (selectedPersonId && entry.person_id !== selectedPersonId) {
        return false;
      }
      if (specificDate && entry.late_date !== specificDate) {
        return false;
      }
      if (startDate && entry.late_date < startDate) {
        return false;
      }
      if (endDate && entry.late_date > endDate) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return b.late_date.localeCompare(a.late_date);
      return a.late_date.localeCompare(b.late_date);
    });
  }, [entriesWithPerson, searchName, selectedPersonId, specificDate, startDate, endDate, sortBy]);

  const resetFilters = () => {
    setSearchName('');
    setSelectedPersonId('');
    setSpecificDate('');
    setStartDate('');
    setEndDate('');
    setSortBy('newest');
  };

  const hasActiveFilters = Boolean(
    searchName || selectedPersonId || specificDate || startDate || endDate || sortBy !== 'newest'
  );

  const handleExportCSV = () => {
    const rows = filteredRecords.map((e) => ({
      'Person Name': e.person_name,
      'Date': formatDate(e.late_date),
      'ISO Date': e.late_date,
      'Hours': e.late_hours,
      'Minutes': e.late_minutes,
      'Duration': formatDuration(e.late_hours, e.late_minutes),
      'Fine Amount': e.fine_amount || 100,
      'Payment Status': e.is_paid ? 'Paid' : 'Unpaid',
      'Remarks': e.remarks || '',
    }));
    exportToCSV(`FineTrack_Audit_Records_Matrix`, rows);
  };

  const handleConfirmDelete = async () => {
    if (!deletingEntry) return;
    setLoadingDelete(true);
    await deleteLateEntry(deletingEntry.id);
    setLoadingDelete(false);
    setDeletingEntry(null);
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Header and Filter Controls */}
      <div className="bg-[#090e0b] p-4 sm:p-5 border border-[#304c3b]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-[#304c3b] gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#38ff8e]" />
              <h2 className="font-display text-base font-bold uppercase text-[#f8fffa] tracking-wide">
                LATE_RECORDS_AUDIT_MATRIX
              </h2>
            </div>
            <p className="text-[10px] text-[#c2cbc5] uppercase mt-0.5">
              TELEMETRY RECORDS // ROW LEVEL EDIT & CASCADE DELETION
            </p>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#ff65d8] border border-[#ff65d8] hover:bg-[#ff65d8] hover:text-[#020303] uppercase"
              >
                <X className="w-3 h-3" />
                <span>RESET</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportCSV}
              disabled={filteredRecords.length === 0}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#38ff8e] bg-[#020303] border border-[#304c3b] hover:border-[#38ff8e] disabled:opacity-40 uppercase"
            >
              <Download className="w-3 h-3 text-[#38ff8e]" />
              <span>EXPORT_CSV</span>
            </button>

            <button
              type="button"
              onClick={onOpenNewLateModal}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono font-bold uppercase text-[#020303] bg-[#38ff8e] border border-[#38ff8e] hover:bg-transparent hover:text-[#38ff8e] clip-corner-diagonal"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>RECORD_LATE</span>
            </button>
          </div>
        </div>

        {/* Matrix of Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          <div>
            <label className="block text-[10px] font-bold text-[#c2cbc5] uppercase mb-1">MEMBER_QUERY</label>
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#c2cbc5]" />
              <input
                type="text"
                placeholder="SEARCH_MEMBER..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full pl-7 pr-2 py-1 text-xs bg-[#020303] border border-[#304c3b] focus:border-[#38ff8e] text-[#f8fffa] outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#c2cbc5] uppercase mb-1">SELECT_IDENTITY</label>
            <select
              value={selectedPersonId}
              onChange={(e) => setSelectedPersonId(e.target.value)}
              className="w-full px-2 py-1 text-xs bg-[#020303] border border-[#304c3b] focus:border-[#38ff8e] text-[#f8fffa] outline-hidden"
            >
              <option value="">ALL_MEMBERS</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#c2cbc5] uppercase mb-1">CALENDAR_DATE</label>
            <input
              type="date"
              value={specificDate}
              onChange={(e) => {
                setSpecificDate(e.target.value);
                if (e.target.value) {
                  setStartDate('');
                  setEndDate('');
                }
              }}
              className="w-full px-2 py-1 text-xs bg-[#020303] border border-[#304c3b] focus:border-[#38ff8e] text-[#f8fffa] outline-hidden cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#c2cbc5] uppercase mb-1">ORDER_SEQUENCE</label>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full px-2 py-1 text-xs bg-[#020303] border border-[#304c3b] focus:border-[#38ff8e] text-[#f8fffa] outline-hidden"
            >
              <option value="newest">NEWEST_FIRST</option>
              <option value="oldest">OLDEST_FIRST</option>
            </select>
          </div>
        </div>

        {/* Date Range Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-[#304c3b]">
          <div>
            <label className="block text-[10px] font-bold text-[#c2cbc5] uppercase mb-1">RANGE_START_DATE</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (e.target.value) setSpecificDate('');
              }}
              className="w-full px-2 py-1 text-xs bg-[#020303] border border-[#304c3b] focus:border-[#38ff8e] text-[#f8fffa] outline-hidden cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#c2cbc5] uppercase mb-1">RANGE_END_DATE</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                if (e.target.value) setSpecificDate('');
              }}
              className="w-full px-2 py-1 text-xs bg-[#020303] border border-[#304c3b] focus:border-[#38ff8e] text-[#f8fffa] outline-hidden cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Late Records Table */}
      <div className="bg-[#090e0b] border border-[#304c3b]">
        <div className="p-3 border-b border-[#304c3b] flex flex-wrap items-center justify-between gap-2 bg-[#020303]/50">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-[#c2cbc5]">
              FILTERED_EVENTS: <strong className="text-[#38ff8e]">{filteredRecords.length}</strong>
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span>
              TOTAL_LEVY: <strong className="text-[#38ff8e]">{formatRupee(filteredRecords.reduce((s, e) => s + (e.fine_amount || 100), 0))}</strong>
            </span>
            <span className="text-[#304c3b]">|</span>
            <span>
              OUTSTANDING: <strong className="text-[#ff65d8]">{formatRupee(filteredRecords.filter(e => !e.is_paid).reduce((s, e) => s + (e.fine_amount || 100), 0))}</strong>
            </span>
            <span className="text-[#304c3b]">|</span>
            <span>
              COLLECTED: <strong className="text-[#38ff8e]">{formatRupee(filteredRecords.filter(e => e.is_paid).reduce((s, e) => s + (e.fine_amount || 100), 0))}</strong>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#020303] text-[#c2cbc5] font-bold uppercase text-[10px] border-b border-[#304c3b]">
              <tr>
                <th className="py-2.5 px-3 border-r border-[#304c3b]">MEMBER</th>
                <th className="py-2.5 px-3 border-r border-[#304c3b]">CALENDAR_DATE</th>
                <th className="py-2.5 px-3 border-r border-[#304c3b]">OFFSET</th>
                <th className="py-2.5 px-3 border-r border-[#304c3b]">LEVY</th>
                <th className="py-2.5 px-3 border-r border-[#304c3b]">SETTLEMENT</th>
                <th className="py-2.5 px-3 border-r border-[#304c3b]">INCIDENT_NOTES</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#304c3b] text-[#f8fffa]">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-[#020303] transition-none">
                    <td className="py-2.5 px-3 font-bold border-r border-[#304c3b] flex items-center gap-2">
                      <div className="w-5 h-5 bg-[#020303] border border-[#304c3b] text-[#38ff8e] flex items-center justify-center font-bold text-[9px] uppercase">
                        {record.person_name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-[#f8fffa]">{record.person_name}</span>
                        {!record.person_active && (
                          <span className="ml-1 text-[8px] text-[#ff65d8] border border-[#ff65d8] px-1 py-0.2">
                            INACTIVE
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 border-r border-[#304c3b] whitespace-nowrap text-[#d3dbd5]">
                      {formatDate(record.late_date)}
                    </td>

                    <td className="py-2.5 px-3 border-r border-[#304c3b] whitespace-nowrap text-[#ff65d8] font-bold">
                      +{formatDuration(record.late_hours, record.late_minutes)}
                    </td>

                    <td className="py-2.5 px-3 font-bold border-r border-[#304c3b] whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-[#38ff8e]">{formatRupee(record.fine_amount || 100)}</span>
                        <span className="text-[8px] text-[#c2cbc5]">
                          {record.fine_amount === 100 ? 'DAY #1 IN MO.' : record.fine_amount === 200 ? 'DAY #2 IN MO.' : record.fine_amount === 300 ? 'DAY #3 IN MO.' : record.fine_amount === 400 ? 'DAY #4 IN MO.' : 'DAY #5+ IN MO.'}
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 border-r border-[#304c3b] whitespace-nowrap">
                      {record.is_paid ? (
                        <button
                          type="button"
                          onClick={() => togglePaymentStatus(record.id, false)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold uppercase bg-[#020303] text-[#38ff8e] border border-[#38ff8e] hover:border-[#ff65d8] hover:text-[#ff65d8] cursor-pointer"
                          title="Click to revert to PENDING"
                        >
                          <CheckCircle2 className="w-3 h-3 text-[#38ff8e]" />
                          <span>PAID ✓</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => togglePaymentStatus(record.id, true)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold uppercase bg-[#38ff8e] text-[#020303] hover:bg-transparent hover:text-[#38ff8e] border border-[#38ff8e] clip-corner-diagonal cursor-pointer"
                          title="Mark this late entry as PAID"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>MARK PAID</span>
                        </button>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-[#c2cbc5] max-w-xs truncate border-r border-[#304c3b]">
                      {record.remarks || <span className="text-[#304c3b]">[NULL]</span>}
                    </td>

                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          title="Edit late record"
                          onClick={() => setEditingEntry(record)}
                          className="p-1 border border-[#304c3b] text-[#d3dbd5] hover:text-[#38ff8e] hover:border-[#38ff8e]"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Delete record"
                          onClick={() => setDeletingEntry(record)}
                          className="p-1 border border-[#304c3b] text-[#ff65d8] hover:bg-[#ff65d8] hover:text-[#020303]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#c2cbc5] text-xs">
                    [NULL_QUERY] NO RECORDS MATCH SELECTION CRITERIA.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <MarkLateModal
        isOpen={Boolean(editingEntry)}
        entryToEdit={editingEntry}
        onClose={() => setEditingEntry(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingEntry)}
        onClose={() => setDeletingEntry(null)}
        onConfirm={handleConfirmDelete}
        title="PURGE_LATE_RECORD"
        message={`Delete attendance penalty record for ${deletingEntry?.person_name} on ${formatDate(deletingEntry?.late_date)}? Recalculation is automatic.`}
        confirmText="CONFIRM_PURGE"
        loading={loadingDelete}
      />
    </div>
  );
};
