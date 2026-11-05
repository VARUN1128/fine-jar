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
import { TrendingUp, BarChart3 } from 'lucide-react';

export const AnalyticsCharts: React.FC = () => {
  const { dailySummaries, personSummaries } = useFineTrack();

  const timelineData = [...dailySummaries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14)
    .map((item) => ({
      date: formatDate(item.date).split(' ').slice(0, 2).join(' '),
      fullDate: formatDate(item.date),
      lateCount: item.entries_count,
      fines: item.total_fine,
      minutes: item.total_minutes,
    }));

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
    <div className="space-y-4 font-mono">
      {/* Daily Late Trend Chart */}
      <div className="bg-[#090e0b] p-4 sm:p-5 border border-[#304c3b]">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#304c3b]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#38ff8e]" />
            <div>
              <h3 className="font-display text-sm font-bold uppercase text-[#f8fffa] tracking-wide">
                TELEMETRY // DAILY_TARDINESS_VELOCITY
              </h3>
              <p className="text-[10px] text-[#c2cbc5] uppercase">
                TEMPORAL FREQUENCY OF ATTENDANCE ANOMALIES
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-[#020303] text-[#38ff8e] border border-[#304c3b] uppercase">
            SAMPLE_WINDOW: 14_DAYS
          </span>
        </div>

        {timelineData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cyberGreenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38ff8e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#38ff8e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#304c3b" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: '#304c3b' }}
                  tick={{ fill: '#c2cbc5', fontSize: 10, fontFamily: 'monospace' }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={{ stroke: '#304c3b' }}
                  tick={{ fill: '#c2cbc5', fontSize: 10, fontFamily: 'monospace' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#020303] text-[#f8fffa] p-2.5 border border-[#38ff8e] text-xs font-mono space-y-1">
                          <p className="font-bold text-[#38ff8e]">{data.fullDate}</p>
                          <p className="text-[#f8fffa]">TARDY_COUNT: {data.lateCount}</p>
                          <p className="text-[#ff65d8]">LEVIED: {formatRupee(data.fines)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="lateCount"
                  stroke="#38ff8e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#cyberGreenGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-[#c2cbc5] text-xs">
            [NULL_TIMELINE] INSUFFICIENT HISTORICAL POINTS FOR TREND RENDER.
          </div>
        )}
      </div>

      {/* Top Late People */}
      <div className="bg-[#090e0b] p-4 sm:p-5 border border-[#304c3b]">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#304c3b]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#65f8ff]" />
            <div>
              <h3 className="font-display text-sm font-bold uppercase text-[#f8fffa] tracking-wide">
                RANK_INDEX // MAXIMUM_LATE_COUNT
              </h3>
              <p className="text-[10px] text-[#c2cbc5] uppercase">
                MEMBERS WITH HIGHEST FREQUENCY OF ATTENDANCE OFFSETS
              </p>
            </div>
          </div>
        </div>

        {topPersonsData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPersonsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#304c3b" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={{ stroke: '#304c3b' }}
                  tick={{ fill: '#c2cbc5', fontSize: 10, fontFamily: 'monospace' }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={{ stroke: '#304c3b' }}
                  tick={{ fill: '#c2cbc5', fontSize: 10, fontFamily: 'monospace' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#020303] text-[#f8fffa] p-2.5 border border-[#65f8ff] text-xs font-mono space-y-1">
                          <p className="font-bold text-[#65f8ff]">{data.name}</p>
                          <p className="text-[#f8fffa]">TARDY_DAYS: {data.lateDays}</p>
                          <p className="text-[#38ff8e]">ACCUMULATED_FINE: {formatRupee(data.fine)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="lateDays" fill="#38ff8e" radius={[0, 0, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-[#c2cbc5] text-xs">
            [NULL_DATA] ZERO ATTENDANCE VIOLATIONS REGISTERED.
          </div>
        )}
      </div>
    </div>
  );
};
