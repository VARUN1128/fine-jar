import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, Edit3, Trash2, Calendar, CheckCircle2, Clock, X, Plus } from 'lucide-react';
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

  // Modals state
  const [editingEntry, setEditingEntry] = useState<LateEntryWithPerson | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<LateEntryWithPerson | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Filter records
  const filteredRecords = useMemo(() => {
    return entriesWithPerson.filter((entry) => {
      // 1. Search name
      if (searchName.trim()) {
        const q = searchName.toLowerCase();
        if (!entry.person_name.toLowerCase().includes(q)) return false;
      }

      // 2. Person dropdown
      if (selectedPersonId && entry.person_id !== selectedPersonId) {
        return false;
      }

      // 3. Specific date
      if (specificDate && entry.late_date !== specificDate) {
        return false;
      }

      // 4. Date range
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
    exportToCSV(`FineTrack_Late_Records_Management`, rows);
  };

  const handleConfirmDelete = async () => {
    if (!deletingEntry) return;
    setLoadingDelete(true);
    await deleteLateEntry(deletingEntry.id);
    setLoadingDelete(false);
    setDeletingEntry(null);
  };

  return (
    <div className="space-y-6">
      {/* Filter and Action Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Late Records Management</h2>
            <p className="text-xs text-slate-500 font-medium">
              Audit, edit, delete, and export attendance fine records
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportCSV}
              disabled={filteredRecords.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 rounded-lg transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={onOpenNewLateModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Mark Late</span>
            </button>
          </div>
        </div>

        {/* Filters Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {/* Search by Person Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Search Name</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search person..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
            </div>
          </div>

          {/* Filter by Person Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Filter by Person</label>
            <select
              value={selectedPersonId}
              onChange={(e) => setSelectedPersonId(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-800 cursor-pointer"
            >
              <option value="">All People</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Specific Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Filter by Date</label>
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
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 cursor-pointer"
            />
          </div>

          {/* Sort By Newest / Oldest */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Sort Order</label>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-800 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Date Range Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Range: Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (e.target.value) setSpecificDate('');
              }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Range: End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                if (e.target.value) setSpecificDate('');
              }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Late Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50/70 text-slate-500 font-semibold uppercase border-b border-slate-100">
              <tr>
                <th className="py-3 px-6">Person</th>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Late Duration</th>
                <th className="py-3 px-6">Fine</th>
                <th className="py-3 px-6">Payment</th>
                <th className="py-3 px-6">Remarks</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Person */}
                    <td className="py-3.5 px-6 font-semibold text-slate-900 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs uppercase">
                        {record.person_name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">{record.person_name}</span>
                        {!record.person_active && (
                          <span className="ml-1.5 text-[9px] text-slate-400 bg-slate-100 px-1 py-0.2 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-6 font-semibold text-slate-800 whitespace-nowrap">
                      {formatDate(record.late_date)}
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-6 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200/50 font-medium">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        {formatDuration(record.late_hours, record.late_minutes)}
                      </span>
                    </td>

                    {/* Fine */}
                    <td className="py-3.5 px-6 font-bold text-slate-900 whitespace-nowrap">
                      <Badge variant="danger" size="sm">
                        {formatRupee(record.fine_amount || 100)}
                      </Badge>
                    </td>

                    {/* Payment Toggle */}
                    <td className="py-3.5 px-6 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => togglePaymentStatus(record.id, !record.is_paid)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all ${
                          record.is_paid
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                        title="Click to toggle payment collected status"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{record.is_paid ? 'Collected' : 'Pending'}</span>
                      </button>
                    </td>

                    {/* Remarks */}
                    <td className="py-3.5 px-6 text-slate-500 max-w-xs truncate">
                      {record.remarks || <span className="text-slate-300 italic">None</span>}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          title="Edit late record"
                          onClick={() => setEditingEntry(record)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          title="Delete record"
                          onClick={() => setDeletingEntry(record)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No late records match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Entry Modal */}
      <MarkLateModal
        isOpen={Boolean(editingEntry)}
        entryToEdit={editingEntry}
        onClose={() => setEditingEntry(null)}
      />

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingEntry)}
        onClose={() => setDeletingEntry(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Late Entry"
        message={`Are you sure you want to delete the late entry for ${deletingEntry?.person_name} on ${formatDate(deletingEntry?.late_date)}? All cumulative fines and totals will be automatically recalculated.`}
        confirmText="Confirm Delete"
        loading={loadingDelete}
      />
    </div>
  );
};
