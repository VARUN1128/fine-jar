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
    <div className="space-y-4 font-mono">
      {/* Top Banner Plate */}
      <div className="bg-[#090e0b] border border-[#304c3b] p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative">
        <div className="absolute top-0 right-0 w-2 h-2 bg-[#38ff8e]" />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-[#38ff8e] font-bold">
              SYS_ADMIN_CONSOLE // LEVEL_0_ACCESS
            </span>
            <span className="text-[#304c3b]">|</span>
            <span className="text-[10px] text-[#c2cbc5]">STATION: COMMAND_NODE</span>
          </div>
          <h2 className="font-display text-2xl font-bold uppercase tracking-tight mt-1 text-[#f8fffa]">
            TELEMETRY_DASHBOARD_OVERVIEW
          </h2>
          <p className="text-xs text-[#c2cbc5] mt-1 max-w-xl leading-relaxed">
            Record member attendance exceptions (progressive monthly levy: ₹100, ₹200 up to ₹500/day), audit payment collection status, and enforce database duplicate locks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenAddPerson}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-bold uppercase text-[#f8fffa] bg-[#020303] border border-[#304c3b] hover:border-[#38ff8e] hover:text-[#38ff8e]"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#38ff8e]" />
            <span>REGISTER_MEMBER</span>
          </button>
          <button
            type="button"
            onClick={onOpenMarkLate}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-bold uppercase text-[#020303] bg-[#38ff8e] border border-[#38ff8e] hover:bg-transparent hover:text-[#38ff8e] clip-corner-diagonal"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>RECORD_LATE</span>
          </button>
        </div>
      </div>

      {/* 6 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard
          title="REGISTERED_PEOPLE"
          value={totalRegisteredPeople}
          subtitle="Active member entities"
          icon={Users}
          variant="default"
        />

        <StatCard
          title="LOGGED_LATE_ENTRIES"
          value={totalLateEntries}
          subtitle="Cumulative event count"
          icon={Clock}
          variant="warning"
        />

        <StatCard
          title="TOTAL_FINES_LEVIED"
          value={formatRupee(totalFinesGenerated)}
          subtitle="Monthly scale: ₹100 to ₹500/day"
          icon={IndianRupee}
          variant="danger"
        />

        <StatCard
          title="FINES_COLLECTED"
          value={formatRupee(totalFinesCollected)}
          subtitle="Settled fee records"
          icon={CheckCircle2}
          variant="success"
        />

        <StatCard
          title="OUTSTANDING_FINES"
          value={formatRupee(totalOutstandingFines)}
          subtitle="Pending balance due"
          icon={AlertCircle}
          variant="indigo"
        />

        <StatCard
          title="MARKED_LATE_TODAY"
          value={todayLateCount}
          subtitle={`Target: ${formatDate(todayStr)}`}
          icon={Calendar}
          variant={todayLateCount > 0 ? 'danger' : 'default'}
        />
      </div>

      {/* Today's Late Table */}
      <div className="bg-[#090e0b] border border-[#304c3b]">
        <div className="flex items-center justify-between p-3.5 border-b border-[#304c3b] bg-[#020303]/50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#38ff8e]" />
            <div>
              <h3 className="font-display text-xs font-bold uppercase text-[#f8fffa]">
                TODAY_ACTIVE_LATE_STREAM // {formatDate(todayStr)}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateToRecords}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#38ff8e] hover:underline uppercase"
          >
            <span>VIEW_ALL_RECORDS</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {todayEntries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#020303] text-[#c2cbc5] font-bold uppercase text-[10px] border-b border-[#304c3b]">
                <tr>
                  <th className="py-2 px-3 border-r border-[#304c3b]">MEMBER</th>
                  <th className="py-2 px-3 border-r border-[#304c3b]">DURATION</th>
                  <th className="py-2 px-3 border-r border-[#304c3b]">LEVY</th>
                  <th className="py-2 px-3">INCIDENT_NOTES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#304c3b] text-[#f8fffa]">
                {todayEntries.map((e) => (
                  <tr key={e.id} className="hover:bg-[#020303]">
                    <td className="py-2.5 px-3 font-bold border-r border-[#304c3b]">{e.person_name}</td>
                    <td className="py-2.5 px-3 text-[#ff65d8] font-bold border-r border-[#304c3b]">
                      +{formatDuration(e.late_hours, e.late_minutes)}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#38ff8e] border-r border-[#304c3b]">{formatRupee(e.fine_amount || 100)}</td>
                    <td className="py-2.5 px-3 text-[#c2cbc5] max-w-xs truncate">
                      {e.remarks || <span className="text-[#304c3b]">[NULL]</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-6 text-center text-[#c2cbc5] text-xs">
            [NULL_STREAM] NO LATE ENTRIES RECORDED FOR CURRENT SESSION.
          </div>
        )}
      </div>

      <AnalyticsCharts />
    </div>
  );
};
