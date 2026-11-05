import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, Download, RefreshCw, X } from 'lucide-react';
import { useFineTrack } from '@/context/FineTrackContext';
import { formatDate, formatDuration, formatRupee, exportToCSV } from '@/lib/utils';
import { Badge } from '@/components/common/Badge';
import { PersonSummary } from '@/types/database';

interface AllRecordsExplorerProps {
  onSelectPerson: (person: PersonSummary) => void;
}

export const AllRecordsExplorer: React.FC<AllRecordsExplorerProps> = ({ onSelectPerson }) => {
  const { entriesWithPerson, people, personSummaries } = useFineTrack();

  const [searchName, setSearchName] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [specificDate, setSpecificDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'duration_high' | 'duration_low'>('newest');

  // Filter logic combining all filters correctly
  const filteredEntries = useMemo(() => {
    return entriesWithPerson.filter((entry) => {
      // 1. Search name
      if (searchName.trim()) {
        const q = searchName.toLowerCase();
        if (!entry.person_name.toLowerCase().includes(q)) return false;
      }

      // 2. Person dropdown
      if (selectedPersonId && entry.person_id !== selectedPersonId) {
        return false;
      }

      // 3. Specific date
      if (specificDate && entry.late_date !== specificDate) {
        return false;
      }

      // 4. Date range (start & end)
      if (startDate && entry.late_date < startDate) {
        return false;
      }
      if (endDate && entry.late_date > endDate) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return b.late_date.localeCompare(a.late_date);
      if (sortBy === 'oldest') return a.late_date.localeCompare(b.late_date);
      const minutesA = a.late_hours * 60 + a.late_minutes;
      const minutesB = b.late_hours * 60 + b.late_minutes;
      if (sortBy === 'duration_high') return minutesB - minutesA;
      if (sortBy === 'duration_low') return minutesA - minutesB;
      return 0;
    });
  }, [entriesWithPerson, searchName, selectedPersonId, specificDate, startDate, endDate, sortBy]);

  const resetFilters = () => {
    setSearchName('');
    setSelectedPersonId('');
    setSpecificDate('');
    setStartDate('');
    setEndDate('');
    setSortBy('newest');
  };

  const hasActiveFilters = Boolean(
    searchName || selectedPersonId || specificDate || startDate || endDate || sortBy !== 'newest'
  );

  const handleExportCSV = () => {
    const rows = filteredEntries.map((e) => ({
      'Person Name': e.person_name,
      'Date': formatDate(e.late_date),
      'ISO Date': e.late_date,
      'Hours Late': e.late_hours,
      'Minutes Late': e.late_minutes,
      'Duration': formatDuration(e.late_hours, e.late_minutes),
      'Fine Amount': e.fine_amount || 100,
      'Paid Status': e.is_paid ? 'Paid' : 'Unpaid',
      'Remarks': e.remarks || '',
    }));
    exportToCSV(`FineTrack_Records_Export`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Filter Control Center */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Filter className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Records & Filter Engine</h3>
              <p className="text-xs text-slate-500">
                Filter by date, date range, person name, or duration with live sorting
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={filteredEntries.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 rounded-lg transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {/* Search by Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Search Name</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Rahul"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
            </div>
          </div>

          {/* Person Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Select Person</label>
            <select
              value={selectedPersonId}
              onChange={(e) => setSelectedPersonId(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-800 cursor-pointer"
            >
              <option value="">All People</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Specific Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Specific Date</label>
            <input
              type="date"
              value={specificDate}
              onChange={(e) => {
                setSpecificDate(e.target.value);
                if (e.target.value) {
                  setStartDate('');
                  setEndDate('');
                }
              }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 cursor-pointer"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-800 cursor-pointer"
            >
              <option value="newest">Date: Newest First</option>
              <option value="oldest">Date: Oldest First</option>
              <option value="duration_high">Duration: Highest</option>
              <option value="duration_low">Duration: Lowest</option>
            </select>
          </div>
        </div>

        {/* Date Range Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Range: From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (e.target.value) setSpecificDate('');
              }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Range: To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                if (e.target.value) setSpecificDate('');
              }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900">
              Matching Records
            </h4>
            <Badge variant="default" size="sm">
              {filteredEntries.length} found
            </Badge>
          </div>
          <span className="text-xs text-slate-500">
            Total Fine in selection: <strong className="text-slate-900">{formatRupee(filteredEntries.length * 100)}</strong>
          </span>
        </div>

        {filteredEntries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50/70 text-slate-500 font-semibold uppercase border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">Person</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Late Duration</th>
                  <th className="py-3 px-6">Fine</th>
                  <th className="py-3 px-6">Remarks</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => {
                      const p = personSummaries.find((x) => x.person_id === entry.person_id);
                      if (p) onSelectPerson(p);
                    }}
                  >
                    <td className="py-3.5 px-6 font-semibold text-slate-900 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 group-hover:bg-rose-100 group-hover:text-rose-700 flex items-center justify-center font-bold text-[11px] uppercase transition-colors">
                        {entry.person_name.charAt(0)}
                      </div>
                      <span className="group-hover:text-rose-600 transition-colors">
                        {entry.person_name}
                      </span>
                    </td>

                    <td className="py-3.5 px-6 font-medium text-slate-700 whitespace-nowrap">
                      {formatDate(entry.late_date)}
                    </td>

                    <td className="py-3.5 px-6 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/50 font-medium">
                        {formatDuration(entry.late_hours, entry.late_minutes)}
                      </span>
                    </td>

                    <td className="py-3.5 px-6 font-bold text-slate-900 whitespace-nowrap">
                      <Badge variant="danger" size="sm">
                        ₹100
                      </Badge>
                    </td>

                    <td className="py-3.5 px-6 text-slate-500 max-w-xs truncate">
                      {entry.remarks || <span className="text-slate-300 italic">None</span>}
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      <span className="text-[11px] font-semibold text-slate-500 group-hover:text-slate-900 underline">
                        View History
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            No late entries match your selected criteria.
          </div>
        )}
      </div>
    </div>
  );
};
