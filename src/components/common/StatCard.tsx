import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'indigo' | 'lime' | 'orange';
  trend?: string;
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  trend,
  badge,
}) => {
  const signalColors = {
    default: 'text-[#38ff8e] border-[#304c3b] hover:border-[#38ff8e]',
    danger: 'text-[#ff65d8] border-[#304c3b] hover:border-[#ff65d8]',
    orange: 'text-[#ff65d8] border-[#304c3b] hover:border-[#ff65d8]',
    warning: 'text-[#65f8ff] border-[#304c3b] hover:border-[#65f8ff]',
    success: 'text-[#38ff8e] border-[#304c3b] hover:border-[#38ff8e]',
    lime: 'text-[#38ff8e] border-[#304c3b] hover:border-[#38ff8e]',
    indigo: 'text-[#65f8ff] border-[#304c3b] hover:border-[#65f8ff]',
  };

  const signalStyle = signalColors[variant] || signalColors.default;

  return (
    <div
      className={cn(
        'relative bg-[#090e0b] p-4 sm:p-5 border border-[#304c3b] group select-none font-mono transition-none',
        signalStyle
      )}
    >
      {/* Micro registration corner indicator */}
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#65f8ff]/40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#304c3b] pointer-events-none" />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#38ff8e]" />
            <p className="text-[11px] font-mono font-semibold tracking-wider text-[#c2cbc5] uppercase">
              {title}
            </p>
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <h4 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#f8fffa]">
              {value}
            </h4>
            {badge && (
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 bg-[#020303] text-[#65f8ff] border border-[#304c3b]">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-[#c2cbc5] font-mono pt-0.5">{subtitle}</p>
          )}
          {trend && (
            <p className="text-[11px] font-mono text-[#38ff8e] flex items-center gap-1 mt-1">
              {trend}
            </p>
          )}
        </div>
        <div className="p-2 border border-[#304c3b] bg-[#020303] text-[#38ff8e] group-hover:border-[#38ff8e] group-hover:bg-[#38ff8e] group-hover:text-[#020303]">
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
