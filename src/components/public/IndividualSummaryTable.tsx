import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ChevronRight, User, AlertTriangle, IndianRupee, Calendar } from 'lucide-react';
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

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.full_name.toLowerCase().includes(q));
    }

    // Sorting
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
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Table Header and Controls */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Individual Fine Summary</h2>
          <p className="text-xs text-slate-500 font-medium">
            Search registered people and click on their name to view detailed history
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search person by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-800 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <span className="text-[11px] font-semibold text-slate-500 px-2 hidden sm:inline">Sort:</span>
            <button
              onClick={() => setSortBy('highest_fine')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                sortBy === 'highest_fine'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Highest Fine
            </button>
            <button
              onClick={() => setSortBy('most_days')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                sortBy === 'most_days'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Most Days
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                sortBy === 'name'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Name (A-Z)
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <th className="py-3.5 px-6">Person Name</th>
              <th className="py-3.5 px-6 text-center">Total Late Days</th>
              <th className="py-3.5 px-6">Total Fine</th>
              <th className="py-3.5 px-6">Status / Recent</th>
              <th className="py-3.5 px-6 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredAndSortedPeople.length > 0 ? (
              filteredAndSortedPeople.map((person) => (
                <tr
                  key={person.person_id}
                  onClick={() => onSelectPerson(person)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-6 font-semibold text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs uppercase group-hover:bg-rose-100 group-hover:text-rose-700 transition-colors">
                        {person.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="group-hover:text-rose-600 transition-colors font-bold">
                            {person.full_name}
                          </span>
                          {!person.is_active && (
                            <Badge variant="outline" size="sm">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-normal">
                          ID: {person.person_id.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6 text-center">
                    {person.total_late_days > 0 ? (
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
                        {person.total_late_days} {person.total_late_days === 1 ? 'day' : 'days'}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">0 days</span>
                    )}
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-base font-extrabold text-slate-900">
                        {formatRupee(person.total_fine)}
                      </span>
                      {person.total_fine > 0 && (
                        <span className="text-[10px] text-slate-400">
                          {person.total_late_days} × ₹100
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-6 text-xs text-slate-500">
                    {person.latest_late_date ? (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Last: {formatDate(person.latest_late_date)}</span>
                      </div>
                    ) : (
                      <span className="text-emerald-600 font-medium flex items-center gap-1">
                        Clean record
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-6 text-right">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 group-hover:text-rose-600 transition-colors"
                    >
                      <span>History</span>
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                  {personSummaries.length === 0
                    ? 'No registered people yet. Authorized admins can add members in the Admin Console.'
                    : `No people found matching "${searchQuery}".`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
