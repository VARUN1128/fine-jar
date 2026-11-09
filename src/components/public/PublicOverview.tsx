import React from 'react';
import { Users, AlertCircle, IndianRupee, Clock, ArrowUpRight, Flame } from 'lucide-react';
import { useFineTrack } from '@/context/FineTrackContext';
import { StatCard } from '@/components/common/StatCard';
import { Badge } from '@/components/common/Badge';
import { formatRupee, formatDate, formatDuration } from '@/lib/utils';
import { PersonSummary } from '@/types/database';

interface PublicOverviewProps {
  onSelectPerson: (person: PersonSummary) => void;
}

export const PublicOverview: React.FC<PublicOverviewProps> = ({ onSelectPerson }) => {
  const {
    totalRegisteredPeople,
    totalLateEntries,
    totalFinesGenerated,
    totalOutstandingFines,
    mostLatePerson,
    entriesWithPerson,
  } = useFineTrack();

  const latestEntries = entriesWithPerson.slice(0, 5);

  return (
    <div className="space-y-4 font-mono">
      {/* 4 Core Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total Registered People"
          value={totalRegisteredPeople}
          subtitle="Active people tracked"
          icon={Users}
          variant="default"
        />

        <StatCard
          title="Total Late Entries"
          value={totalLateEntries}
          subtitle="Recorded late arrivals"
          icon={Clock}
          variant="warning"
        />

        <StatCard
          title="Total Fines Generated"
          value={formatRupee(totalFinesGenerated)}
          subtitle="Progressive monthly scale (₹100 - ₹500)"
          icon={IndianRupee}
          variant="danger"
        />

        <StatCard
          title="Total Outstanding Fines"
          value={formatRupee(totalOutstandingFines)}
          subtitle="Uncollected fine balance"
          icon={AlertCircle}
          variant="indigo"
        />
      </div>

      {/* Row: Most Late Person Spotlight + Latest Live Late Entries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Most Late Person Spotlight */}
        <div className="bg-[#090e0b] border border-[#304c3b] p-4 flex flex-col justify-between relative">
          <div className="absolute top-0 right-0 w-2 h-2 bg-[#ff65d8]" />
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-[#304c3b] mb-3">
              <span className="text-xs font-mono font-bold uppercase text-[#ff65d8] tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#ff65d8]" />
                Most Late Person
              </span>
              <Badge variant="danger" size="sm">
                Highest Count
              </Badge>
            </div>

            {mostLatePerson ? (
              <div className="space-y-3">
                <div>
                  <h3 className="font-display text-2xl font-bold uppercase text-[#f8fffa]">
                    {mostLatePerson.full_name}
                  </h3>
                  <p className="text-[11px] text-[#c2cbc5] mt-0.5">
                    Last recorded late: {formatDate(mostLatePerson.latest_late_date)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 bg-[#020303] border border-[#304c3b]">
                    <span className="text-[10px] text-[#c2cbc5] uppercase block">Late Days</span>
                    <p className="text-lg font-bold text-[#ff65d8]">
                      {mostLatePerson.total_late_days} <span className="text-xs text-[#c2cbc5]">days</span>
                    </p>
                  </div>
                  <div className="p-2.5 bg-[#020303] border border-[#304c3b]">
                    <span className="text-[10px] text-[#c2cbc5] uppercase block">Total Fine</span>
                    <p className="text-lg font-bold text-[#38ff8e]">
                      {formatRupee(mostLatePerson.total_fine)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-[#c2cbc5] text-xs">
                No late entries recorded yet.
              </div>
            )}
          </div>

          {mostLatePerson && (
            <button
              type="button"
              onClick={() => onSelectPerson(mostLatePerson)}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 py-1.5 text-xs font-mono font-bold uppercase text-[#020303] bg-[#38ff8e] border border-[#38ff8e] hover:bg-transparent hover:text-[#38ff8e] clip-corner-diagonal"
            >
              <span>View Complete Late History</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Latest Late Entries Feed */}
        <div className="lg:col-span-2 bg-[#090e0b] border border-[#304c3b] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-[#304c3b] mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#38ff8e] animate-pulse" />
                <h3 className="font-display text-xs font-bold uppercase text-[#f8fffa] tracking-wider">
                  Latest Late Entries (Live Activity)
                </h3>
              </div>
              <span className="text-[10px] text-[#38ff8e] uppercase font-mono">
                Realtime Synchronized
              </span>
            </div>

            {latestEntries.length > 0 ? (
              <div className="divide-y divide-[#304c3b]">
                {latestEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="py-2 flex items-center justify-between hover:bg-[#020303] px-2 -mx-2 transition-none cursor-pointer group"
                    onClick={() => {
                      const p = {
                        person_id: entry.person_id,
                        full_name: entry.person_name,
                        is_active: entry.person_active,
                        total_late_days: 1,
                        total_fine: entry.fine_amount || 100,
                        total_paid: entry.is_paid ? 100 : 0,
                        total_outstanding: entry.is_paid ? 0 : 100,
                        latest_late_date: entry.late_date,
                      };
                      onSelectPerson(p as any);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-[#020303] border border-[#304c3b] text-[#38ff8e] flex items-center justify-center font-bold text-xs uppercase group-hover:border-[#38ff8e]">
                        {entry.person_name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#f8fffa] group-hover:text-[#38ff8e]">
                          {entry.person_name}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-[#c2cbc5]">
                          <span>{formatDate(entry.late_date)}</span>
                          <span className="text-[#304c3b]">|</span>
                          <span className="text-[#ff65d8] font-bold">
                            {formatDuration(entry.late_hours, entry.late_minutes)} late
                          </span>
                          {entry.remarks && (
                            <>
                              <span className="text-[#304c3b]">|</span>
                              <span className="text-[#d3dbd5] italic truncate max-w-[200px]">
                                "{entry.remarks}"
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="danger" size="sm">
                        {formatRupee(entry.fine_amount || 100)} Fine
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-[#c2cbc5] text-xs">
                No recent late entries recorded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
