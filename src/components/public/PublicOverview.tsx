import React from 'react';
import { Users, AlertCircle, IndianRupee, Clock, Award, ArrowUpRight, Flame } from 'lucide-react';
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

  // Top 5 latest late entries
  const latestEntries = entriesWithPerson.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Registered"
          value={totalRegisteredPeople}
          subtitle="Active members tracked"
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
          subtitle="₹100 per recorded late day"
          icon={IndianRupee}
          variant="danger"
        />

        <StatCard
          title="Total Outstanding"
          value={formatRupee(totalOutstandingFines)}
          subtitle="Uncollected fine balance"
          icon={AlertCircle}
          variant="indigo"
        />
      </div>

      {/* Row with Most Late Person Spotlight + Latest Live Entries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Most Late Person Card */}
        <div className="bg-gradient-to-br from-rose-50/70 via-white to-amber-50/40 p-6 rounded-2xl border border-rose-200/60 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Flame className="w-32 h-32 text-rose-500" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                  <Flame className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                  Most Late Person
                </span>
              </div>
              <Badge variant="danger" size="sm">
                Highest Count
              </Badge>
            </div>

            {mostLatePerson ? (
              <div className="space-y-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {mostLatePerson.full_name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Last recorded late: {formatDate(mostLatePerson.latest_late_date)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-white/90 rounded-xl border border-rose-100 shadow-2xs">
                    <span className="text-[11px] text-slate-500 font-medium">Late Days</span>
                    <p className="text-xl font-bold text-rose-600">
                      {mostLatePerson.total_late_days} <span className="text-xs font-normal text-slate-500">days</span>
                    </p>
                  </div>
                  <div className="p-3 bg-white/90 rounded-xl border border-rose-100 shadow-2xs">
                    <span className="text-[11px] text-slate-500 font-medium">Accumulated Fine</span>
                    <p className="text-xl font-bold text-slate-900">
                      {formatRupee(mostLatePerson.total_fine)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 text-sm">
                No late entries recorded yet. Everyone is punctual!
              </div>
            )}
          </div>

          {mostLatePerson && (
            <button
              type="button"
              onClick={() => onSelectPerson(mostLatePerson)}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-rose-700 bg-rose-100/80 hover:bg-rose-200/80 rounded-xl transition-colors"
            >
              <span>View Full Late History</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Latest Late Entries Feed */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Latest Late Entries (Live Activity)
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Live updating
              </span>
            </div>

            {latestEntries.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {latestEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 -mx-2 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs uppercase group-hover:bg-rose-100 group-hover:text-rose-700 transition-colors">
                        {entry.person_name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">
                          {entry.person_name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{formatDate(entry.late_date)}</span>
                          <span>•</span>
                          <span className="text-rose-600 font-medium">
                            {formatDuration(entry.late_hours, entry.late_minutes)} late
                          </span>
                          {entry.remarks && (
                            <>
                              <span>•</span>
                              <span className="italic truncate max-w-[160px] sm:max-w-[260px] text-slate-400">
                                "{entry.remarks}"
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="danger" size="sm">
                        ₹100 Fine
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm">
                No recent late entries.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
