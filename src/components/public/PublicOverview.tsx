import React from 'react';
import { Users, AlertCircle, IndianRupee, Clock, ArrowUpRight, ShieldCheck, CheckCircle2, Zap, Database, Hash } from 'lucide-react';
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
      {/* Redesigned High-Signal Cyberpunk Hero Section */}
      <div className="relative bg-[#090e0b] border border-[#304c3b] overflow-hidden">
        {/* Subtle decorative edge markers */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#38ff8e]" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#65f8ff]" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#ff65d8]" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#304c3b]" />

        {/* Ambient background glow */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#38ff8e]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Headline & Description */}
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#020303] border border-[#304c3b] text-[11px]">
                <span className="w-1.5 h-1.5 bg-[#38ff8e] animate-pulse" />
                <span className="text-[#38ff8e] font-bold tracking-wider">LIVE TELEMETRY</span>
                <span className="text-[#304c3b]">/</span>
                <span className="text-[#c2cbc5]">PUBLIC DISCIPLINE DASHBOARD</span>
              </div>

              <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black uppercase text-[#f8fffa] tracking-tight leading-tight">
                Late Tracking <span className="text-[#38ff8e]">&</span> Fine Management
              </h1>

              <p className="text-xs sm:text-sm text-[#d3dbd5] leading-relaxed">
                Automated attendance discipline system. Every recorded late arrival incurs a flat fine of{' '}
                <strong className="text-[#38ff8e] font-bold">₹100</strong>, with database-level constraints strictly enforcing zero duplicate entries per person on any given date.
              </p>
            </div>

            {/* Right: Modern Telemetry Badge */}
            <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
              <div className="p-4 bg-[#020303] border border-[#304c3b] flex items-center justify-between gap-6 min-w-[240px]">
                <div>
                  <span className="text-[10px] text-[#c2cbc5] uppercase font-bold tracking-wider block">
                    STANDARD RATE
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-black text-[#38ff8e]">₹100</span>
                    <span className="text-[11px] text-[#c2cbc5]">/ LATE DAY</span>
                  </div>
                </div>
                <div className="w-9 h-9 bg-[#090e0b] border border-[#38ff8e]/50 flex items-center justify-center text-[#38ff8e]">
                  <Zap className="w-5 h-5" />
                </div>
              </div>

              <div className="px-3 py-2 bg-[#020303] border border-[#304c3b] flex items-center justify-between text-[11px]">
                <span className="text-[#c2cbc5] flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[#65f8ff]" />
                  REPLICATION
                </span>
                <span className="text-[#38ff8e] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#38ff8e] rounded-full" />
                  REALTIME
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Telemetry Facts Bar */}
          <div className="mt-6 pt-5 border-t border-[#304c3b] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 bg-[#38ff8e]" />
              <div>
                <span className="text-[10px] text-[#c2cbc5] uppercase block">FORMULA</span>
                <span className="text-xs font-bold text-[#f8fffa]">Entries × ₹100</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 bg-[#65f8ff]" />
              <div>
                <span className="text-[10px] text-[#c2cbc5] uppercase block">DUPLICATE LOCK</span>
                <span className="text-xs font-bold text-[#65f8ff]">1 Entry / Date</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 bg-[#38ff8e]" />
              <div>
                <span className="text-[10px] text-[#c2cbc5] uppercase block">SECURITY</span>
                <span className="text-xs font-bold text-[#38ff8e]">Row-Level Security</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 bg-[#ff65d8]" />
              <div>
                <span className="text-[10px] text-[#c2cbc5] uppercase block">ACCESS</span>
                <span className="text-xs font-bold text-[#ff65d8]">Public (No Login)</span>
              </div>
            </div>
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
