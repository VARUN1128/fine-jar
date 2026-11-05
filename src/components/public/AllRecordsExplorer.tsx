import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, X } from 'lucide-react';
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

  const filteredEntries = useMemo(() => {
    return entriesWithPerson.filter((entry) => {
      if (searchName.trim()) {
        const q = searchName.toLowerCase();
        if (!entry.person_name.toLowerCase().includes(q)) return false;
      }
      if (selectedPersonId && entry.person_id !== selectedPersonId) {
        return false;
      }
      if (specificDate && entry.late_date !== specificDate) {
        return false;
      }
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
    exportToCSV(`FineTrack_Cyberpunk_Matrix_Export`, rows);
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Filter Control Matrix */}
      <div className="bg-[#090e0b] p-4 sm:p-5 border border-[#304c3b]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-[#304c3b] gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#38ff8e]" />
            <h3 className="font-display text-sm font-bold uppercase text-[#f8fffa] tracking-wider">
              RECORDS_FILTER_ENGINE
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-[#ff65d8] border border-[#ff65d8] hover:bg-[#ff65d8] hover:text-[#020303] uppercase"
              >
                <X className="w-3 h-3" />
                <span>RESET_FILTERS</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={filteredEntries.length === 0}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-[#38ff8e] bg-[#020303] border border-[#304c3b] hover:border-[#38ff8e] disabled:opacity-40 uppercase"
            >
              <Download className="w-3 h-3 text-[#38ff8e]" />
              <span>EXPORT_CSV</span>
            </button>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          <div>
            <label className="block text-[10px] font-bold text-[#c2cbc5] uppercase mb-1">NAME_QUERY</label>
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#c2cbc5]" />
              <input
                type="text"
                placeholder="SEARCH_MEMBER..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full pl-7 pr-2 py-1 text-xs bg-[#020303] border border-[#304c3b] focus:border-[#38ff8e] text-[#f8fffa] outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#c2cbc5] uppercase mb-1">MEMBER_IDENTITY</label>
            <select
              value={selectedPersonId}
              onChange={(e) => setSelectedPersonId(e.target.value)}
              className="w-full px-2 py-1 text-xs bg-[#020303] border border-[#304c3b] focus:border-[#38ff8e] text-[#f8fffa] outline-hidden"
            >
              <option value="">ALL_MEMBERS</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#c2cbc5] uppercase mb-1">DATE_MATCH</label>
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
              className="w-full px-2 py-1 text-xs bg-[#020303] border border-[#304c3b] focus:border-[#38ff8e] text-[#f8fffa] outline-hidden cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#c2cbc5] uppercase mb-1">ORDER_SEQUENCE</label>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full px-2 py-1 text-xs bg-[#020303] border border-[#304c3b] focus:border-[#38ff8e] text-[#f8fffa] outline-hidden"
            >
              <option value="newest">DATE_DESCENDING (NEWEST)</option>
              <option value="oldest">DATE_ASCENDING (OLDEST)</option>
              <option value="duration_high">DURATION_DESCENDING (MAX)</option>
              <option value="duration_low">DURATION_ASCENDING (MIN)</option>
            </select>
          </div>
        </div>

        {/* Date Range Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-[#304c3b]">
          <div>
            <label className="block text-[10px] font-bold text-[#c2cbc5] uppercase mb-1">RANGE_START_DATE</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (e.target.value) setSpecificDate('');
              }}
              className="w-full px-2 py-1 text-xs bg-[#020303] border border-[#304c3b] focus:border-[#38ff8e] text-[#f8fffa] outline-hidden cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#c2cbc5] uppercase mb-1">RANGE_END_DATE</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                if (e.target.value) setSpecificDate('');
              }}
              className="w-full px-2 py-1 text-xs bg-[#020303] border border-[#304c3b] focus:border-[#38ff8e] text-[#f8fffa] outline-hidden cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-[#090e0b] border border-[#304c3b]">
        <div className="p-3 border-b border-[#304c3b] flex items-center justify-between bg-[#020303]/50">
          <div className="flex items-center gap-2">
            <h4 className="font-display text-xs font-bold uppercase text-[#f8fffa]">
              FILTERED_RECORD_SET
            </h4>
            <Badge variant="default" size="sm">
              {filteredEntries.length} MATCHES
            </Badge>
          </div>
          <span className="text-[10px] text-[#c2cbc5] uppercase">
            SUM_FINE: <strong className="text-[#38ff8e]">{formatRupee(filteredEntries.length * 100)}</strong>
          </span>
        </div>

        {filteredEntries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#020303] text-[#c2cbc5] font-bold uppercase text-[10px] border-b border-[#304c3b]">
                <tr>
                  <th className="py-2.5 px-3 border-r border-[#304c3b]">MEMBER</th>
                  <th className="py-2.5 px-3 border-r border-[#304c3b]">CALENDAR_DATE</th>
                  <th className="py-2.5 px-3 border-r border-[#304c3b]">DELAY_RECORD</th>
                  <th className="py-2.5 px-3 border-r border-[#304c3b]">LEVY</th>
                  <th className="py-2.5 px-3 border-r border-[#304c3b]">REMARKS</th>
                  <th className="py-2.5 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#304c3b] text-[#f8fffa]">
                {filteredEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-[#020303] transition-none cursor-pointer group"
                    onClick={() => {
                      const p = personSummaries.find((x) => x.person_id === entry.person_id);
                      if (p) onSelectPerson(p);
                    }}
                  >
                    <td className="py-2.5 px-3 font-bold border-r border-[#304c3b] flex items-center gap-2">
                      <div className="w-5 h-5 bg-[#020303] border border-[#304c3b] group-hover:border-[#38ff8e] text-[#38ff8e] flex items-center justify-center font-bold text-[9px] uppercase">
                        {entry.person_name.charAt(0)}
                      </div>
                      <span className="group-hover:text-[#38ff8e]">
                        {entry.person_name}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 border-r border-[#304c3b] whitespace-nowrap text-[#d3dbd5]">
                      {formatDate(entry.late_date)}
                    </td>

                    <td className="py-2.5 px-3 border-r border-[#304c3b] whitespace-nowrap text-[#ff65d8] font-bold">
                      +{formatDuration(entry.late_hours, entry.late_minutes)}
                    </td>

                    <td className="py-2.5 px-3 font-bold text-[#38ff8e] border-r border-[#304c3b] whitespace-nowrap">
                      ₹100.00
                    </td>

                    <td className="py-2.5 px-3 text-[#c2cbc5] max-w-xs truncate border-r border-[#304c3b]">
                      {entry.remarks || <span className="text-[#304c3b]">[NULL]</span>}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <span className="text-[10px] font-bold text-[#38ff8e] group-hover:underline uppercase">
                        INSPECT
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-[#c2cbc5] text-xs">
            [NULL_MATCH] NO LATE ENTRIES MATCH FILTER CRITERIA.
          </div>
        )}
      </div>
    </div>
  );
};
