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
      setErrorMsg('IDENTIFIER_CANNOT_BE_BLANK');
      return;
    }

    setLoading(true);

    if (personToEdit) {
      const res = await updatePerson(personToEdit.id, fullName, isActive);
      setLoading(false);
      if (res.success) {
        setSuccessMsg('ENTITY_UPDATED_SUCCESSFULLY');
        setTimeout(() => onClose(), 800);
      } else {
        setErrorMsg(res.error || 'UPDATE_OPERATION_FAILED');
      }
    } else {
      const res = await addPerson(fullName);
      setLoading(false);
      if (res.success) {
        setSuccessMsg('MEMBER_REGISTERED_SUCCESSFULLY');
        setFullName('');
        setTimeout(() => onClose(), 800);
      } else {
        setErrorMsg(res.error || 'REGISTRATION_OPERATION_FAILED');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={personToEdit ? 'MODIFY_MEMBER_ENTITY' : 'REGISTER_MEMBER_ENTITY'}
      description="Register identity into PostgreSQL tracking database."
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-mono">
        {errorMsg && (
          <div className="flex items-start gap-2 p-2.5 bg-[#020303] border border-[#ff65d8] text-[#ff65d8] text-xs">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span className="font-bold">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-2.5 bg-[#020303] border border-[#38ff8e] text-[#38ff8e] text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold text-[#c2cbc5] uppercase mb-1">
            FULL_LEGAL_NAME <span className="text-[#ff65d8]">*</span>
          </label>
          <div className="relative">
            <User className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#c2cbc5]" />
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#020303] border border-[#304c3b] focus:border-[#38ff8e] text-[#f8fffa] font-mono outline-hidden"
            />
          </div>
        </div>

        {personToEdit && (
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#d3dbd5]">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-3.5 h-3.5 text-[#38ff8e] bg-[#020303] border border-[#304c3b] rounded-none focus:ring-[#38ff8e]"
              />
              <span className="uppercase text-[11px] font-bold">
                ENTITY_ACTIVE_STATUS
              </span>
            </label>
          </div>
        )}

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
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-mono font-bold uppercase text-[#020303] bg-[#38ff8e] border border-[#38ff8e] hover:bg-transparent hover:text-[#38ff8e] disabled:opacity-40 clip-corner-diagonal"
          >
            {loading ? (
              <span className="w-3 h-3 border-2 border-[#020303] border-t-transparent animate-spin" />
            ) : null}
            <span>{personToEdit ? 'SAVE_CHANGES' : 'COMMIT_REGISTRATION'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
