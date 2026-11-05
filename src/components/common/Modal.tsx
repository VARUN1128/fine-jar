import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-mono">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#020303]/90 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          'relative w-full bg-[#090e0b] border border-[#304c3b] shadow-2xl z-10 overflow-hidden clip-corner-accent',
          maxWidthClasses[maxWidth]
        )}
      >
        {/* Top signal bar */}
        <div className="h-0.5 w-full bg-[#38ff8e]" />

        <div className="flex items-start justify-between p-4 sm:p-5 border-b border-[#304c3b] bg-[#020303]/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#38ff8e]" />
              <h3 className="font-display text-base font-bold text-[#f8fffa] uppercase tracking-wide">
                {title}
              </h3>
            </div>
            {description && (
              <p className="mt-1 text-xs text-[#c2cbc5] font-mono leading-relaxed">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 border border-[#304c3b] text-[#c2cbc5] hover:text-[#020303] hover:bg-[#38ff8e] hover:border-[#38ff8e]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6 bg-[#090e0b]">{children}</div>
      </div>
    </div>
  );
};
