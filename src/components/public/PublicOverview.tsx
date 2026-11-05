import React from 'react';
import { Users, AlertCircle, IndianRupee, Clock, ArrowUpRight, ShieldAlert, Cpu } from 'lucide-react';
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
    <div className="space-y-6 font-mono">
      {/* Top Section with Signal Object & Large Uppercase Title */}
      <div className="relative p-6 sm:p-8 bg-[#090e0b] border border-[#304c3b]">
        {/* Registration corner accents */}
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#65f8ff]" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#ff65d8]" />

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 text-[11px] text-[#65f8ff] tracking-wider uppercase">
              <span className="w-2 h-2 bg-[#38ff8e]" />
              <span>SUBSYSTEM.FINETRACK // PROTOCOL_01</span>
              <span className="text-[#304c3b]">/</span>
              <span className="text-[#c2cbc5]">STATION: PUBLIC_OBSERVER</span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black uppercase text-[#f8fffa] tracking-tight leading-none">
              LATE TRACKING // FINE MANAGEMENT
            </h1>

            <p className="text-xs sm:text-sm text-[#d3dbd5] font-mono leading-relaxed max-w-2xl">
              Deterministic attendance discipline telemetry. Every recorded tardiness generates a non-negotiable flat fine of <strong className="text-[#38ff8e]">₹100</strong>. PostgreSQL database constraints enforce absolute zero duplicate entries per member per calendar date.
            </p>
          </div>

          {/* Compact Geometric Signal Object */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="w-24 h-24 border border-[#304c3b] bg-[#020303] relative p-2 flex flex-col justify-between">
              <div className="flex justify-between items-center text-[9px] text-[#38ff8e]">
                <span>SIG_01</span>
                <span className="w-1.5 h-1.5 bg-[#ff65d8]" />
              </div>
              <div className="grid grid-cols-3 gap-1">
                <div className="h-2 bg-[#38ff8e]" />
                <div className="h-2 bg-[#65f8ff]" />
                <div className="h-2 bg-[#38ff8e]" />
                <div className="h-2 bg-[#304c3b]" />
                <div className="h-2 bg-[#38ff8e]" />
                <div className="h-2 bg-[#ff65d8]" />
              </div>
              <div className="text-[8px] text-[#c2cbc5] tracking-tighter">
                TELEMETRY_LIVE
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#c2cbc5]">FINE_STANDARD:</span>
              <span className="block text-sm font-bold text-[#38ff8e]">₹100.00 / DAY</span>
            </div>
          </div>
        </div>

        {/* Tightly Ruled Facts Row */}
        <div className="mt-6 pt-4 border-t border-[#304c3b] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2 bg-[#020303] border border-[#304c3b]">
            <span className="text-[10px] text-[#c2cbc5] block uppercase">CALCULATION</span>
            <span className="font-bold text-[#f8fffa]">N × ₹100 CONSTANT</span>
          </div>
          <div className="p-2 bg-[#020303] border border-[#304c3b]">
            <span className="text-[10px] text-[#c2cbc5] block uppercase">INTEGRITY_CHECK</span>
            <span className="font-bold text-[#65f8ff]">UNIQUE(UID, DATE)</span>
          </div>
          <div className="p-2 bg-[#020303] border border-[#304c3b]">
            <span className="text-[10px] text-[#c2cbc5] block uppercase">SECURITY_MODEL</span>
            <span className="font-bold text-[#38ff8e]">POSTGRES_RLS</span>
          </div>
          <div className="p-2 bg-[#020303] border border-[#304c3b]">
            <span className="text-[10px] text-[#c2cbc5] block uppercase">SYNC_LATENCY</span>
            <span className="font-bold text-[#ff65d8]">0ms REPLICATION</span>
          </div>
        </div>
      </div>

      {/* Metric Telemetry Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="REGISTERED_MEMBERS"
          value={totalRegisteredPeople}
          subtitle="Monitored identity records"
          icon={Users}
          variant="default"
        />

        <StatCard
          title="LOGGED_LATE_ENTRIES"
          value={totalLateEntries}
          subtitle="Tardiness log entries"
          icon={Clock}
          variant="warning"
        />

        <StatCard
          title="TOTAL_FINES_LEVIED"
          value={formatRupee(totalFinesGenerated)}
          subtitle="Formula: entries × ₹100"
          icon={IndianRupee}
          variant="danger"
        />

        <StatCard
          title="OUTSTANDING_FINES"
          value={formatRupee(totalOutstandingFines)}
          subtitle="Uncollected balance total"
          icon={AlertCircle}
          variant="indigo"
        />
      </div>

      {/* Split Section: Most Late Record Spotlight & Live Signal Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Most Late Person Record */}
        <div className="bg-[#090e0b] border border-[#304c3b] p-5 flex flex-col justify-between relative">
          <div className="absolute top-0 right-0 w-2 h-2 bg-[#ff65d8]" />
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#304c3b] mb-4">
              <span className="text-xs font-mono font-bold uppercase text-[#ff65d8] tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#ff65d8]" />
                MAX_TARDINESS_INDEX
              </span>
              <Badge variant="danger" size="sm">
                PRIMARY_TARGET
              </Badge>
            </div>

            {mostLatePerson ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-display text-2xl font-bold uppercase text-[#f8fffa]">
                    {mostLatePerson.full_name}
                  </h3>
                  <p className="text-[11px] text-[#c2cbc5] mt-0.5">
                    REC_DATE: {formatDate(mostLatePerson.latest_late_date)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-3 bg-[#020303] border border-[#304c3b]">
                    <span className="text-[10px] text-[#c2cbc5] uppercase">LATE_DAYS</span>
                    <p className="text-xl font-bold text-[#ff65d8]">
                      {mostLatePerson.total_late_days} <span className="text-xs text-[#c2cbc5]">DAYS</span>
                    </p>
                  </div>
                  <div className="p-3 bg-[#020303] border border-[#304c3b]">
                    <span className="text-[10px] text-[#c2cbc5] uppercase">SUM_FINES</span>
                    <p className="text-xl font-bold text-[#38ff8e]">
                      {formatRupee(mostLatePerson.total_fine)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-[#c2cbc5] text-xs">
                [NULL_EXCEPTIONS] ALL MEMBERS RECORDED ON TIME.
              </div>
            )}
          </div>

          {mostLatePerson && (
            <button
              type="button"
              onClick={() => onSelectPerson(mostLatePerson)}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 py-2 text-xs font-mono font-bold uppercase text-[#020303] bg-[#38ff8e] border border-[#38ff8e] hover:bg-transparent hover:text-[#38ff8e] clip-corner-diagonal"
            >
              <span>ACCESS_FULL_DOSSIER</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Realtime Late Stream */}
        <div className="lg:col-span-2 bg-[#090e0b] border border-[#304c3b] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#304c3b] mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#38ff8e] animate-pulse" />
                <h3 className="font-display text-sm font-bold uppercase text-[#f8fffa] tracking-wider">
                  TELEMETRY_LOG // REALTIME_ENTRIES
                </h3>
              </div>
              <span className="text-[10px] text-[#65f8ff] uppercase font-mono">
                BROADCAST: SYNCED
              </span>
            </div>

            {latestEntries.length > 0 ? (
              <div className="divide-y divide-[#304c3b]">
                {latestEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="py-2.5 flex items-center justify-between hover:bg-[#020303] px-2 -mx-2 transition-none cursor-pointer group"
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
                          <span className="text-[#ff65d8]">
                            +{formatDuration(entry.late_hours, entry.late_minutes)}
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
                        ₹100 FINE
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-[#c2cbc5] text-xs">
                [EMPTY_FEED] NO RECENT LATE EVENTS RECORDED.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
