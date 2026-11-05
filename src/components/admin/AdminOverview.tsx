import React from 'react';
import {
  Users,
  Clock,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Calendar,
  UserPlus,
  PlusCircle,
  ArrowUpRight,
} from 'lucide-react';
import { useFineTrack } from '@/context/FineTrackContext';
import { StatCard } from '@/components/common/StatCard';
import { formatRupee, formatDate, formatDuration, getTodayDateString } from '@/lib/utils';
import { Badge } from '@/components/common/Badge';
import { AnalyticsCharts } from '@/components/public/AnalyticsCharts';

interface AdminOverviewProps {
  onOpenMarkLate: () => void;
  onOpenAddPerson: () => void;
  onNavigateToRecords: () => void;
  onNavigateToPeople: () => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  onOpenMarkLate,
  onOpenAddPerson,
  onNavigateToRecords,
  onNavigateToPeople,
}) => {
  const {
    totalRegisteredPeople,
    totalLateEntries,
    totalFinesGenerated,
    totalFinesCollected,
    totalOutstandingFines,
    todayLateCount,
    entriesWithPerson,
  } = useFineTrack();

  const todayStr = getTodayDateString();
  const todayEntries = entriesWithPerson.filter((e) => e.late_date === todayStr);

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-rose-400 font-bold">
            Administrative Control Center
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight mt-1 text-white">
            FineTrack Overview
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Manage attendance policies, record late entries (₹100 fixed fine), monitor collections, and enforce zero-duplicate accuracy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onOpenAddPerson}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-sm"
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>Add Person</span>
          </button>
          <button
            type="button"
            onClick={onOpenMarkLate}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Mark Late (₹100)</span>
          </button>
        </div>
      </div>

      {/* 6 Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* 1. Total Registered People */}
        <StatCard
          title="Total Registered People"
          value={totalRegisteredPeople}
          subtitle="Active members in database"
          icon={Users}
          variant="default"
        />

        {/* 2. Total Late Entries */}
        <StatCard
          title="Total Late Entries"
          value={totalLateEntries}
          subtitle="Cumulative late instances"
          icon={Clock}
          variant="warning"
        />

        {/* 3. Total Fines Generated */}
        <StatCard
          title="Total Fines Generated"
          value={formatRupee(totalFinesGenerated)}
          subtitle="Calculated at ₹100 / day"
          icon={IndianRupee}
          variant="danger"
        />

        {/* 4. Total Fines Collected */}
        <StatCard
          title="Total Fines Collected"
          value={formatRupee(totalFinesCollected)}
          subtitle="Paid fine collections"
          icon={CheckCircle2}
          variant="success"
        />

        {/* 5. Total Outstanding Fines */}
        <StatCard
          title="Total Outstanding Fines"
          value={formatRupee(totalOutstandingFines)}
          subtitle="Remaining uncollected balance"
          icon={AlertCircle}
          variant="indigo"
        />

        {/* 6. Marked Late Today */}
        <StatCard
          title="Marked Late Today"
          value={todayLateCount}
          subtitle={`Attendance date: ${formatDate(todayStr)}`}
          icon={Calendar}
          variant={todayLateCount > 0 ? 'danger' : 'default'}
        />
      </div>

      {/* Today's Late Attendance Quick View */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Calendar className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Marked Late Today ({formatDate(todayStr)})
              </h3>
              <p className="text-xs text-slate-500">Live attendees marked late for today's session</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateToRecords}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline"
          >
            <span>View All Records</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {todayEntries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50/70 text-slate-500 font-semibold uppercase border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-4">Name</th>
                  <th className="py-2.5 px-4">Duration</th>
                  <th className="py-2.5 px-4">Fine</th>
                  <th className="py-2.5 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {todayEntries.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-semibold text-slate-900">{e.person_name}</td>
                    <td className="py-3 px-4 text-amber-800 font-medium">
                      {formatDuration(e.late_hours, e.late_minutes)}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">₹100</td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {e.remarks || <span className="text-slate-300 italic">None</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs">
            No late entries recorded for today yet.
          </div>
        )}
      </div>

      {/* Analytics Visualization */}
      <AnalyticsCharts />
    </div>
  );
};
