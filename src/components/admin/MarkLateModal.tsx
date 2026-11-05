import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { useFineTrack } from '@/context/FineTrackContext';
import { LateEntryWithPerson, Person } from '@/types/database';
import { getTodayDateString, formatRupee } from '@/lib/utils';
import { Clock, Calendar, User, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

interface MarkLateModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryToEdit?: LateEntryWithPerson | null;
  defaultPersonId?: string;
}

export const MarkLateModal: React.FC<MarkLateModalProps> = ({
  isOpen,
  onClose,
  entryToEdit,
  defaultPersonId,
}) => {
  const { people, lateEntries, markLate, updateLateEntry } = useFineTrack();

  const [personId, setPersonId] = useState('');
  const [lateDate, setLateDate] = useState(getTodayDateString());
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(25);
  const [remarks, setRemarks] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (entryToEdit) {
      setPersonId(entryToEdit.person_id);
      setLateDate(entryToEdit.late_date);
      setHours(entryToEdit.late_hours);
      setMinutes(entryToEdit.late_minutes);
      setRemarks(entryToEdit.remarks || '');
    } else {
      setPersonId(defaultPersonId || (people[0]?.id ?? ''));
      setLateDate(getTodayDateString());
      setHours(0);
      setMinutes(25);
      setRemarks('');
    }
    setErrorMsg('');
    setSuccessMsg('');
    setSearchTerm('');
  }, [entryToEdit, defaultPersonId, people, isOpen]);

  // Filter active people for selector
  const selectablePeople = people.filter((p) => p.is_active || p.id === personId);

  // Filtered by search
  const filteredPeople = selectablePeople.filter((p) =>
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check duplicate status dynamically as user selects person & date
  const isDuplicate = !entryToEdit && lateEntries.some(
    (e) => e.person_id === personId && e.late_date === lateDate
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!personId) {
      setErrorMsg('Please select a person.');
      return;
    }
    if (!lateDate) {
      setErrorMsg('Please select a date.');
      return;
    }
    if (hours === 0 && minutes === 0) {
      setErrorMsg('Late duration must be at least 1 minute.');
      return;
    }

    setLoading(true);

    if (entryToEdit) {
      const res = await updateLateEntry(entryToEdit.id, {
        lateDate,
        hours,
        minutes,
        remarks,
      });
      setLoading(false);
      if (res.success) {
        setSuccessMsg('Late entry updated successfully!');
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setErrorMsg(res.error || 'Failed to update late entry.');
      }
    } else {
      const res = await markLate({
        personId,
        lateDate,
        hours,
        minutes,
        remarks,
      });
      setLoading(false);
      if (res.success) {
        setSuccessMsg('Late attendance marked successfully with ₹100 fine!');
        setTimeout(() => {
          onClose();
        }, 900);
      } else {
        setErrorMsg(res.error || 'Failed to record late entry.');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={entryToEdit ? 'Edit Late Entry' : 'Record Late Attendance'}
      description="Record late arrival. Every recorded late day generates a fixed ₹100 fine."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {isDuplicate && !errorMsg && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Warning:</strong> This person already has a recorded late entry on this date.
              Submitting will be prevented to avoid duplicates.
            </span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Person Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Select Person <span className="text-rose-500">*</span>
          </label>
          {entryToEdit ? (
            <input
              type="text"
              readOnly
              disabled
              value={entryToEdit.person_name}
              className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-700 cursor-not-allowed font-semibold"
            />
          ) : (
            <div className="space-y-1.5">
              <select
                required
                value={personId}
                onChange={(e) => setPersonId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-900 font-medium"
              >
                <option value="">-- Choose person --</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} {!p.is_active ? '(Inactive)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Date Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Date of Late Attendance <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              required
              value={lateDate}
              onChange={(e) => setLateDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-900 font-medium cursor-pointer"
            />
          </div>
        </div>

        {/* Late Duration: Hours & Minutes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Late Duration (Hours & Minutes) <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={hours}
                  onChange={(e) => setHours(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-center font-bold text-slate-900"
                />
                <span className="text-xs text-slate-500 font-medium">hrs</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) =>
                    setMinutes(Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)))
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-center font-bold text-slate-900"
                />
                <span className="text-xs text-slate-500 font-medium">mins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fine Display Card */}
        <div className="p-3.5 bg-rose-50/70 border border-rose-100 rounded-xl flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-rose-900">Fine Imposed</span>
            <p className="text-[11px] text-rose-600">
              Fixed rate: ₹100 per recorded late day
            </p>
          </div>
          <span className="text-lg font-extrabold text-rose-700">₹100</span>
        </div>

        {/* Remarks Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Remarks (Optional)
          </label>
          <textarea
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Metro delay, traffic congestion, medical emergency"
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-800"
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || isDuplicate}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            <span>{entryToEdit ? 'Save Changes' : 'Confirm & Record (₹100)'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
