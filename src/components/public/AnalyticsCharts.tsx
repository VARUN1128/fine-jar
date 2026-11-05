import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { useFineTrack } from '@/context/FineTrackContext';
import { formatDate, formatRupee } from '@/lib/utils';
import { TrendingUp, BarChart3, Users } from 'lucide-react';

export const AnalyticsCharts: React.FC = () => {
  const { dailySummaries, personSummaries } = useFineTrack();

  // Sort daily summaries chronologically for the trend chart
  const timelineData = [...dailySummaries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14) // Last 14 days
    .map((item) => ({
      date: formatDate(item.date).split(' ').slice(0, 2).join(' '), // e.g. "05 Nov"
      fullDate: formatDate(item.date),
      lateCount: item.entries_count,
      fines: item.total_fine,
      minutes: item.total_minutes,
    }));

  // Top 6 late persons
  const topPersonsData = [...personSummaries]
    .filter((p) => p.total_late_days > 0)
    .sort((a, b) => b.total_late_days - a.total_late_days)
    .slice(0, 6)
    .map((p) => ({
      name: p.full_name,
      lateDays: p.total_late_days,
      fine: p.total_fine,
    }));

  return (
    <div className="space-y-6">
      {/* Daily Late Trend Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <TrendingUp className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Daily Late Count & Trend
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Number of people marked late over the past recorded dates
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            Last 14 records
          </span>
        </div>

        {timelineData.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="lateGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E11D48" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#E11D48" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1">
                          <p className="font-semibold">{data.fullDate}</p>
                          <p className="text-rose-300">Late: {data.lateCount} people</p>
                          <p className="text-amber-300">Fine Generated: {formatRupee(data.fines)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="lateCount"
                  stroke="#E11D48"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#lateGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            Not enough date history to display trend.
          </div>
        )}
      </div>

      {/* Top Late People Comparison */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Top Members by Late Days
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Members with the highest accumulated late days and fines
              </p>
            </div>
          </div>
        </div>

        {topPersonsData.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPersonsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1">
                          <p className="font-semibold">{data.name}</p>
                          <p className="text-rose-300">Late Days: {data.lateDays}</p>
                          <p className="text-amber-300">Total Fine: {formatRupee(data.fine)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="lateDays" fill="#0F172A" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            No late data available yet.
          </div>
        )}
      </div>
    </div>
  );
};
