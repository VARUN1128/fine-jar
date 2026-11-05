import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'CONFIRM_PURGE',
  cancelText = 'CANCEL',
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-4 font-mono">
        <div className="flex items-start gap-3 p-3 bg-[#020303] border border-[#ff65d8] text-[#f8fffa]">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-[#ff65d8] mt-0.5" />
          <p className="text-xs leading-relaxed text-[#d3dbd5]">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#304c3b]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-3.5 py-1.5 text-xs font-mono uppercase font-semibold text-[#d3dbd5] bg-transparent border border-[#304c3b] hover:bg-[#304c3b] hover:text-[#f8fffa]"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-mono uppercase font-bold text-[#020303] bg-[#ff65d8] border border-[#ff65d8] hover:bg-transparent hover:text-[#ff65d8] disabled:opacity-50"
          >
            {loading ? (
              <span className="w-3 h-3 border-2 border-[#020303] border-t-transparent animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
