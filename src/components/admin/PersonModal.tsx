import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { useFineTrack } from '@/context/FineTrackContext';
import { Person } from '@/types/database';
import { User, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  personToEdit?: Person | null;
}

export const PersonModal: React.FC<PersonModalProps> = ({
  isOpen,
  onClose,
  personToEdit,
}) => {
  const { addPerson, updatePerson } = useFineTrack();
  const [fullName, setFullName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (personToEdit) {
      setFullName(personToEdit.full_name);
      setIsActive(personToEdit.is_active);
    } else {
      setFullName('');
      setIsActive(true);
    }
    setErrorMsg('');
    setSuccessMsg('');
  }, [personToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Full name cannot be empty.');
      return;
    }

    setLoading(true);

    if (personToEdit) {
      const res = await updatePerson(personToEdit.id, fullName, isActive);
      setLoading(false);
      if (res.success) {
        setSuccessMsg('Person updated successfully!');
        setTimeout(() => onClose(), 800);
      } else {
        setErrorMsg(res.error || 'Failed to update person.');
      }
    } else {
      const res = await addPerson(fullName);
      setLoading(false);
      if (res.success) {
        setSuccessMsg('Person added successfully!');
        setFullName('');
        setTimeout(() => onClose(), 800);
      } else {
        setErrorMsg(res.error || 'Failed to add person.');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={personToEdit ? 'Edit Person Details' : 'Add New Person'}
      description="Register people to track attendance and fine records."
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-900 font-medium"
            />
          </div>
        </div>

        {personToEdit && (
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
              />
              <span className="text-xs font-medium text-slate-700">
                Active Member (Uncheck to deactivate)
              </span>
            </label>
          </div>
        )}

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
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-xl transition-all shadow-sm"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            <span>{personToEdit ? 'Save Changes' : 'Add Person'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
