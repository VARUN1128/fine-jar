import React, { useState, useMemo } from 'react';
import { Search, UserPlus, Edit3, Trash2, Power, History, PlusCircle } from 'lucide-react';
import { useFineTrack } from '@/context/FineTrackContext';
import { Person, PersonSummary } from '@/types/database';
import { formatRupee, formatDate } from '@/lib/utils';
import { Badge } from '@/components/common/Badge';
import { PersonModal } from './PersonModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { PersonHistoryModal } from '@/components/public/PersonHistoryModal';
import { MarkLateModal } from './MarkLateModal';

export const ManagePeople: React.FC = () => {
  const { people, personSummaries, deletePerson, updatePerson } = useFineTrack();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [deletingPerson, setDeletingPerson] = useState<Person | null>(null);
  const [viewingHistoryPerson, setViewingHistoryPerson] = useState<PersonSummary | null>(null);
  const [markLatePersonId, setMarkLatePersonId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  const combinedPeopleList = useMemo(() => {
    return people
      .filter((p) => p.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
      .map((p) => {
        const summary = personSummaries.find((s) => s.person_id === p.id);
        return {
          ...p,
          total_late_days: summary?.total_late_days || 0,
          total_fine: summary?.total_fine || 0,
          latest_late_date: summary?.latest_late_date || null,
        };
      });
  }, [people, personSummaries, searchQuery]);

  const handleToggleActive = async (person: Person) => {
    await updatePerson(person.id, person.full_name, !person.is_active);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPerson) return;
    setLoadingAction(true);
    await deletePerson(deletingPerson.id);
    setLoadingAction(false);
    setDeletingPerson(null);
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Header and Controls */}
      <div className="bg-[#090e0b] p-4 sm:p-5 border border-[#304c3b] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#38ff8e]" />
            <h2 className="font-display text-base font-bold uppercase text-[#f8fffa] tracking-wide">
              MEMBERS_DIRECTORY_MANAGEMENT
            </h2>
          </div>
          <p className="text-[10px] text-[#c2cbc5] uppercase mt-0.5">
            IDENTITY REGISTRATION // ENTITY STATUS DEACTIVATION // PENALTY AUDITING
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#c2cbc5]" />
            <input
              type="text"
              placeholder="SEARCH_NAME..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-56 pl-8 pr-3 py-1.5 text-xs bg-[#020303] border border-[#304c3b] focus:border-[#38ff8e] text-[#f8fffa] outline-hidden"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 text-xs font-mono font-bold uppercase text-[#020303] bg-[#38ff8e] border border-[#38ff8e] hover:bg-transparent hover:text-[#38ff8e] clip-corner-diagonal"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>REGISTER_MEMBER</span>
          </button>
        </div>
      </div>

      {/* People Table */}
      <div className="bg-[#090e0b] border border-[#304c3b]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#020303] text-[#c2cbc5] font-bold uppercase text-[10px] border-b border-[#304c3b]">
              <tr>
                <th className="py-2.5 px-4 border-r border-[#304c3b]">MEMBER_IDENTITY</th>
                <th className="py-2.5 px-4 border-r border-[#304c3b]">SYSTEM_UUID</th>
                <th className="py-2.5 px-4 text-center border-r border-[#304c3b]">STATUS</th>
                <th className="py-2.5 px-4 text-center border-r border-[#304c3b]">LATE_DAYS</th>
                <th className="py-2.5 px-4 border-r border-[#304c3b]">CUMULATIVE_LEVY</th>
                <th className="py-2.5 px-4 text-right">CONTROLS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#304c3b] text-[#f8fffa]">
              {combinedPeopleList.length > 0 ? (
                combinedPeopleList.map((person) => (
                  <tr key={person.id} className="hover:bg-[#020303] transition-none">
                    <td className="py-2.5 px-4 font-bold border-r border-[#304c3b] flex items-center gap-2.5">
                      <div className="w-6 h-6 bg-[#020303] border border-[#304c3b] text-[#38ff8e] flex items-center justify-center text-[10px] font-bold uppercase">
                        {person.full_name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-[#f8fffa]">{person.full_name}</span>
                        <div className="text-[9px] text-[#c2cbc5]">
                          REGISTERED: {formatDate(person.created_at)}
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-4 font-mono text-[10px] text-[#65f8ff] border-r border-[#304c3b]">
                      {person.id.slice(0, 8)}...
                    </td>

                    <td className="py-2.5 px-4 text-center border-r border-[#304c3b]">
                      {person.is_active ? (
                        <Badge variant="success" size="sm">
                          ACTIVE
                        </Badge>
                      ) : (
                        <Badge variant="outline" size="sm">
                          DEACTIVATED
                        </Badge>
                      )}
                    </td>

                    <td className="py-2.5 px-4 text-center border-r border-[#304c3b]">
                      {person.total_late_days > 0 ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold bg-[#020303] text-[#ff65d8] border border-[#ff65d8]">
                          {person.total_late_days} DAYS
                        </span>
                      ) : (
                        <span className="text-[#304c3b]">0</span>
                      )}
                    </td>

                    <td className="py-2.5 px-4 font-bold text-[#38ff8e] border-r border-[#304c3b]">
                      {formatRupee(person.total_fine)}
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          title="Record late entry"
                          onClick={() => setMarkLatePersonId(person.id)}
                          className="p-1 border border-[#304c3b] text-[#38ff8e] hover:bg-[#38ff8e] hover:text-[#020303]"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          title="View history"
                          onClick={() => {
                            const summary = personSummaries.find((s) => s.person_id === person.id);
                            if (summary) setViewingHistoryPerson(summary);
                          }}
                          className="p-1 border border-[#304c3b] text-[#65f8ff] hover:bg-[#65f8ff] hover:text-[#020303]"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          title="Edit member name"
                          onClick={() => setEditingPerson(person)}
                          className="p-1 border border-[#304c3b] text-[#d3dbd5] hover:bg-[#d3dbd5] hover:text-[#020303]"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          title={person.is_active ? 'Deactivate member' : 'Activate member'}
                          onClick={() => handleToggleActive(person)}
                          className={`p-1 border ${
                            person.is_active
                              ? 'border-[#304c3b] text-[#c2cbc5] hover:text-[#ff65d8] hover:border-[#ff65d8]'
                              : 'border-[#38ff8e] text-[#38ff8e] hover:bg-[#38ff8e] hover:text-[#020303]'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          title="Purge member record"
                          onClick={() => setDeletingPerson(person)}
                          className="p-1 border border-[#304c3b] text-[#ff65d8] hover:bg-[#ff65d8] hover:text-[#020303]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#c2cbc5] text-xs">
                    [EMPTY_RECORD_SET] NO MEMBERS REGISTERED.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PersonModal
        isOpen={isAddModalOpen || Boolean(editingPerson)}
        personToEdit={editingPerson}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingPerson(null);
        }}
      />

      <MarkLateModal
        isOpen={Boolean(markLatePersonId)}
        onClose={() => setMarkLatePersonId(null)}
        defaultPersonId={markLatePersonId || undefined}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingPerson)}
        onClose={() => setDeletingPerson(null)}
        onConfirm={handleConfirmDelete}
        title="PURGE_MEMBER_ENTITY"
        message={`Confirm deletion of ${deletingPerson?.full_name}? All associated attendance records will cascade delete and recalculate totals.`}
        confirmText="CONFIRM_PURGE"
        loading={loadingAction}
      />

      <PersonHistoryModal
        isOpen={Boolean(viewingHistoryPerson)}
        person={viewingHistoryPerson}
        onClose={() => setViewingHistoryPerson(null)}
      />
    </div>
  );
};
