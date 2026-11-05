import React from 'react';
import { LucideIcon, Terminal } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'NULL_RECORD_SET',
  message,
  icon: Icon = Terminal,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center border border-dashed border-[#304c3b] bg-[#020303]/60 font-mono">
      <div className="p-3 bg-[#090e0b] border border-[#304c3b] mb-3 text-[#38ff8e]">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="font-display text-sm font-bold text-[#f8fffa] uppercase tracking-wide">
        {title}
      </h4>
      <p className="text-xs text-[#c2cbc5] max-w-sm mt-1 mb-4 leading-relaxed font-mono">
        {message}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-bold uppercase text-[#020303] bg-[#38ff8e] border border-[#38ff8e] hover:bg-transparent hover:text-[#38ff8e]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
