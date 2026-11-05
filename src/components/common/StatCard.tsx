import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'indigo';
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
  const variantStyles = {
    default: {
      iconBg: 'bg-slate-100 text-slate-800',
      border: 'border-slate-200/80',
      glow: 'group-hover:border-slate-300',
    },
    danger: {
      iconBg: 'bg-rose-50 text-rose-600',
      border: 'border-rose-100',
      glow: 'group-hover:border-rose-300',
    },
    warning: {
      iconBg: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100',
      glow: 'group-hover:border-amber-300',
    },
    success: {
      iconBg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
      glow: 'group-hover:border-emerald-300',
    },
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-600',
      border: 'border-indigo-100',
      glow: 'group-hover:border-indigo-300',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={cn(
        'group relative bg-white p-6 rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md',
        style.border,
        style.glow
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">{title}</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{value}</h4>
            {badge && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
          {trend && (
            <p className="text-xs font-medium text-emerald-600 flex items-center gap-1 mt-1">
              {trend}
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl transition-transform group-hover:scale-105', style.iconBg)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
