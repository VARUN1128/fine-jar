import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { useFineTrack } from '@/context/FineTrackContext';
import { LateEntryWithPerson } from '@/types/database';
import { getTodayDateString } from '@/lib/utils';
import { calculateEntryFineForDate } from '@/utils/fineCalculation';
import { Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';

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
  }, [entryToEdit, defaultPersonId, people, isOpen]);

  const isDuplicate = !entryToEdit && lateEntries.some(
    (e) => e.person_id === personId && e.late_date === lateDate
  );

  const { occurrence, fineAmount } = calculateEntryFineForDate(
    lateEntries,
    personId,
    lateDate,
    entryToEdit?.id
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!personId) {
      setErrorMsg('MEMBER_SELECTION_REQUIRED');
      return;
    }
    if (!lateDate) {
      setErrorMsg('CALENDAR_DATE_REQUIRED');
      return;
    }
    if (hours === 0 && minutes === 0) {
      setErrorMsg('DURATION_MUST_EXCEED_ZERO');
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
        setSuccessMsg('RECORD_MODIFIED_SUCCESSFULLY');
        setTimeout(() => onClose(), 800);
      } else {
        setErrorMsg(res.error || 'FAILED_TO_UPDATE_RECORD');
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
        setSuccessMsg(`TARDINESS_LOGGED // ₹${fineAmount} LEVIED`);
        setTimeout(() => onClose(), 800);
      } else {
        setErrorMsg(res.error || 'FAILED_TO_COMMIT_ENTRY');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={entryToEdit ? 'MODIFY_LATE_ENTRY' : 'RECORD_LATE_ATTENDANCE'}
      description="Record member tardiness. Progressive monthly rate: ₹100 for 1st day, ₹200 for 2nd day, up to ₹500/day max."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-mono">
        {errorMsg && (
          <div className="flex items-start gap-2 p-2.5 bg-[#020303] border border-[#ff65d8] text-[#ff65d8] text-xs">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span className="font-bold">{errorMsg}</span>
          </div>
        )}

        {isDuplicate && !errorMsg && (
          <div className="flex items-start gap-2 p-2.5 bg-[#020303] border border-[#65f8ff] text-[#65f8ff] text-xs">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>
              <strong>CONSTRAINT_LOCK:</strong> Member already recorded late on this date.
              Database unique constraint blocks duplicate submissions.
            </span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-2.5 bg-[#020303] border border-[#38ff8e] text-[#38ff8e] text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

        {/* Person Selector */}
        <div>
          <label className="block text-[10px] font-bold text-[#c2cbc5] uppercase mb-1">
            MEMBER_IDENTITY <span className="text-[#ff65d8]">*</span>
          </label>
          {entryToEdit ? (
            <input
              type="text"
              readOnly
              disabled
              value={entryToEdit.person_name}
              className="w-full px-2.5 py-1.5 text-xs bg-[#020303] border border-[#304c3b] text-[#c2cbc5] cursor-not-allowed font-bold"
            />
          ) : people.length === 0 ? (
            <div className="p-2.5 bg-[#020303] border border-[#ff65d8] text-[#ff65d8] text-xs">
              No members registered. Register member first via <strong>MEMBERS_DIRECTORY</strong>.
            </div>
          ) : (
            <select
              required
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-[#020303] border border-[#304c3b] focus:border-[#38ff8e] text-[#f8fffa] outline-hidden font-mono"
            >
              <option value="">-- SELECT MEMBER --</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} {!p.is_active ? '[INACTIVE]' : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Date Selector */}
        <div>
          <label className="block text-[10px] font-bold text-[#c2cbc5] uppercase mb-1">
            CALENDAR_DATE <span className="text-[#ff65d8]">*</span>
          </label>
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#c2cbc5]" />
            <input
              type="date"
              required
              value={lateDate}
              onChange={(e) => setLateDate(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 text-xs bg-[#020303] border border-[#304c3b] focus:border-[#38ff8e] text-[#f8fffa] outline-hidden cursor-pointer"
            />
          </div>
        </div>

        {/* Late Duration: Hours & Minutes */}
        <div>
          <label className="block text-[10px] font-bold text-[#c2cbc5] uppercase mb-1">
            DURATION_OFFSET (HOURS & MINUTES) <span className="text-[#ff65d8]">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="12"
                value={hours}
                onChange={(e) => setHours(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-2 py-1 text-xs bg-[#020303] border border-[#304c3b] focus:border-[#38ff8e] text-[#f8fffa] text-center font-bold outline-hidden"
              />
              <span className="text-[10px] text-[#c2cbc5]">HRS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) =>
                  setMinutes(Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)))
                }
                className="w-full px-2 py-1 text-xs bg-[#020303] border border-[#304c3b] focus:border-[#38ff8e] text-[#f8fffa] text-center font-bold outline-hidden"
              />
              <span className="text-[10px] text-[#c2cbc5]">MIN</span>
            </div>
          </div>
        </div>

        {/* Fine Display Box */}
        <div className="p-3 bg-[#020303] border border-[#38ff8e] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#38ff8e] uppercase block">
              PROGRESSIVE MONTHLY LEVY (DAY #{occurrence} IN MONTH)
            </span>
            <p className="text-[9px] text-[#c2cbc5]">
              {occurrence === 1 && '1st late day in month: ₹100'}
              {occurrence === 2 && '2nd late day in month: ₹200'}
              {occurrence === 3 && '3rd late day in month: ₹300'}
              {occurrence === 4 && '4th late day in month: ₹400'}
              {occurrence >= 5 && `${occurrence}th late day in month: ₹500 (capped at ₹500/day)`}
            </p>
          </div>
          <span className="text-base font-black text-[#38ff8e]">₹{fineAmount}.00</span>
        </div>

        {/* Remarks Input */}
        <div>
          <label className="block text-[10px] font-bold text-[#c2cbc5] uppercase mb-1">
            INCIDENT_NOTES (OPTIONAL)
          </label>
          <textarea
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Transit delay, hardware fault, etc."
            className="w-full px-2.5 py-1 text-xs bg-[#020303] border border-[#304c3b] focus:border-[#38ff8e] text-[#f8fffa] outline-hidden"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#304c3b]">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-mono font-bold uppercase text-[#c2cbc5] bg-transparent border border-[#304c3b] hover:bg-[#304c3b]"
          >
            CANCEL
          </button>
          <button
            type="submit"
            disabled={loading || isDuplicate || people.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-mono font-bold uppercase text-[#020303] bg-[#38ff8e] border border-[#38ff8e] hover:bg-transparent hover:text-[#38ff8e] disabled:opacity-40 clip-corner-diagonal"
          >
            {loading ? (
              <span className="w-3 h-3 border-2 border-[#020303] border-t-transparent animate-spin" />
            ) : null}
            <span>{entryToEdit ? 'UPDATE_RECORD' : `COMMIT_RECORD (₹${fineAmount})`}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
