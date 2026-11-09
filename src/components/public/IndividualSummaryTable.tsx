import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, Calendar } from 'lucide-react';
import { useFineTrack } from '@/context/FineTrackContext';
import { PersonSummary } from '@/types/database';
import { formatRupee, formatDate } from '@/lib/utils';
import { Badge } from '@/components/common/Badge';

interface IndividualSummaryTableProps {
  onSelectPerson: (person: PersonSummary) => void;
}

export const IndividualSummaryTable: React.FC<IndividualSummaryTableProps> = ({ onSelectPerson }) => {
  const { personSummaries } = useFineTrack();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'highest_fine' | 'most_days' | 'name'>('highest_fine');

  const filteredAndSortedPeople = useMemo(() => {
    let list = [...personSummaries];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.full_name.toLowerCase().includes(q));
    }

    if (sortBy === 'highest_fine') {
      list.sort((a, b) => b.total_fine - a.total_fine || b.total_late_days - a.total_late_days);
    } else if (sortBy === 'most_days') {
      list.sort((a, b) => b.total_late_days - a.total_late_days || b.total_fine - a.total_fine);
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.full_name.localeCompare(b.full_name));
    }

    return list;
  }, [personSummaries, searchQuery, sortBy]);

  return (
    <div className="bg-[#090e0b] border border-[#304c3b] font-mono">
      {/* Table Header and Controls */}
      <div className="p-4 sm:p-5 border-b border-[#304c3b] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#020303]/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#38ff8e]" />
            <h2 className="font-display text-base font-bold uppercase text-[#f8fffa] tracking-wide">
              INDIVIDUAL_FINE_DIRECTORY
            </h2>
          </div>
          <p className="text-[10px] text-[#c2cbc5] uppercase mt-0.5">
            MEMBER DIRECTORY // AGGREGATED TELEMETRY ACCUMULATION
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#c2cbc5]" />
            <input
              type="text"
              placeholder="SEARCH_BY_NAME..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-56 pl-8 pr-3 py-1 text-xs bg-[#020303] border border-[#304c3b] focus:border-[#38ff8e] text-[#f8fffa] outline-hidden placeholder:text-[#304c3b]"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center border border-[#304c3b] bg-[#020303]">
            <span className="text-[10px] text-[#c2cbc5] px-2 hidden sm:inline uppercase">SORT:</span>
            <button
              onClick={() => setSortBy('highest_fine')}
              className={`px-2 py-1 text-[11px] font-mono uppercase font-bold ${
                sortBy === 'highest_fine'
                  ? 'bg-[#38ff8e] text-[#020303]'
                  : 'text-[#d3dbd5] hover:text-[#38ff8e]'
              }`}
            >
              MAX_FINE
            </button>
            <button
              onClick={() => setSortBy('most_days')}
              className={`px-2 py-1 text-[11px] font-mono uppercase font-bold border-l border-[#304c3b] ${
                sortBy === 'most_days'
                  ? 'bg-[#38ff8e] text-[#020303]'
                  : 'text-[#d3dbd5] hover:text-[#38ff8e]'
              }`}
            >
              MAX_DAYS
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-2 py-1 text-[11px] font-mono uppercase font-bold border-l border-[#304c3b] ${
                sortBy === 'name'
                  ? 'bg-[#38ff8e] text-[#020303]'
                  : 'text-[#d3dbd5] hover:text-[#38ff8e]'
              }`}
            >
              A-Z
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#304c3b] bg-[#020303] text-[#c2cbc5] text-[10px] uppercase font-bold tracking-wider">
              <th className="py-2.5 px-4 border-r border-[#304c3b]">MEMBER_IDENTITY</th>
              <th className="py-2.5 px-4 text-center border-r border-[#304c3b]">LATE_DAYS_TOTAL</th>
              <th className="py-2.5 px-4 border-r border-[#304c3b]">ACCUMULATED_FINE</th>
              <th className="py-2.5 px-4 border-r border-[#304c3b]">LATEST_EVENT</th>
              <th className="py-2.5 px-4 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#304c3b]">
            {filteredAndSortedPeople.length > 0 ? (
              filteredAndSortedPeople.map((person) => (
                <tr
                  key={person.person_id}
                  onClick={() => onSelectPerson(person)}
                  className="hover:bg-[#020303] transition-none cursor-pointer group"
                >
                  <td className="py-3 px-4 font-bold text-[#f8fffa] border-r border-[#304c3b]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 bg-[#020303] border border-[#304c3b] group-hover:border-[#38ff8e] text-[#38ff8e] flex items-center justify-center font-bold text-[10px] uppercase">
                        {person.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="group-hover:text-[#38ff8e]">
                            {person.full_name}
                          </span>
                          {!person.is_active && (
                            <Badge variant="outline" size="sm">
                              DEACTIVATED
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-[#c2cbc5] font-mono">
                          ID: {person.person_id.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-center border-r border-[#304c3b]">
                    {person.total_late_days > 0 ? (
                      <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold bg-[#020303] text-[#ff65d8] border border-[#ff65d8]">
                        {person.total_late_days} DAYS
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#304c3b]">0 DAYS</span>
                    )}
                  </td>

                  <td className="py-3 px-4 border-r border-[#304c3b]">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-[#38ff8e]">
                        {formatRupee(person.total_fine)}
                      </span>
                      {person.total_fine > 0 && (
                        <span className="text-[9px] text-[#c2cbc5]">
                          {person.total_outstanding > 0 ? (
                            <span className="text-[#ff65d8] font-bold">₹{person.total_outstanding} UNPAID</span>
                          ) : (
                            <span className="text-[#38ff8e] font-bold">ALL PAID ✓</span>
                          )}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-[11px] text-[#d3dbd5] border-r border-[#304c3b]">
                    {person.latest_late_date ? (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-[#38ff8e]" />
                        <span>{formatDate(person.latest_late_date)}</span>
                      </div>
                    ) : (
                      <span className="text-[#38ff8e] font-bold">
                        PUNCTUAL
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#38ff8e] group-hover:underline uppercase"
                    >
                      <span>DOSSIER</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[#c2cbc5] text-xs">
                  {personSummaries.length === 0
                    ? '[NULL_DIRECTORY] NO MEMBERS CURRENTLY REGISTERED.'
                    : `[NOT_FOUND] NO MEMBERS MATCH QUERY "${searchQuery}".`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
