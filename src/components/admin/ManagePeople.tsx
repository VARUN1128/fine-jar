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

  // Combine people with their summary stats
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
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">People Management</h2>
          <p className="text-xs text-slate-500 font-medium">
            Register, edit, deactivate, or delete team members and inspect their late stats
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-60 pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-800"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm"
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <span>Add New Person</span>
          </button>
        </div>
      </div>

      {/* People Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50/70 text-slate-500 font-semibold uppercase border-b border-slate-100">
              <tr>
                <th className="py-3 px-6">Person</th>
                <th className="py-3 px-6">Unique ID</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6 text-center">Late Days</th>
                <th className="py-3 px-6">Cumulative Fine</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {combinedPeopleList.length > 0 ? (
                combinedPeopleList.map((person) => (
                  <tr key={person.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Person */}
                    <td className="py-3.5 px-6 font-semibold text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs uppercase">
                        {person.full_name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">{person.full_name}</span>
                        <div className="text-[10px] text-slate-400">
                          Joined {formatDate(person.created_at)}
                        </div>
                      </div>
                    </td>

                    {/* ID */}
                    <td className="py-3.5 px-6 font-mono text-[11px] text-slate-400">
                      {person.id.slice(0, 8)}...
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-6 text-center">
                      {person.is_active ? (
                        <Badge variant="success" size="sm">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" size="sm">
                          Inactive
                        </Badge>
                      )}
                    </td>

                    {/* Late Days */}
                    <td className="py-3.5 px-6 text-center">
                      {person.total_late_days > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/50">
                          {person.total_late_days} {person.total_late_days === 1 ? 'day' : 'days'}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>

                    {/* Cumulative Fine */}
                    <td className="py-3.5 px-6 font-bold text-slate-900">
                      {formatRupee(person.total_fine)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Quick Mark Late */}
                        <button
                          type="button"
                          title="Record Late for this person"
                          onClick={() => setMarkLatePersonId(person.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>

                        {/* View History */}
                        <button
                          type="button"
                          title="View Attendance History"
                          onClick={() => {
                            const summary = personSummaries.find((s) => s.person_id === person.id);
                            if (summary) setViewingHistoryPerson(summary);
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <History className="w-4 h-4" />
                        </button>

                        {/* Edit Name */}
                        <button
                          type="button"
                          title="Edit Name"
                          onClick={() => setEditingPerson(person)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Toggle Active / Inactive */}
                        <button
                          type="button"
                          title={person.is_active ? 'Deactivate Person' : 'Activate Person'}
                          onClick={() => handleToggleActive(person)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            person.is_active
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          <Power className="w-4 h-4" />
                        </button>

                        {/* Delete Person */}
                        <button
                          type="button"
                          title="Delete Person"
                          onClick={() => setDeletingPerson(person)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    No people found matching "{searchQuery}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Person Modal */}
      <PersonModal
        isOpen={isAddModalOpen || Boolean(editingPerson)}
        personToEdit={editingPerson}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingPerson(null);
        }}
      />

      {/* Quick Mark Late Modal for a specific person */}
      <MarkLateModal
        isOpen={Boolean(markLatePersonId)}
        onClose={() => setMarkLatePersonId(null)}
        defaultPersonId={markLatePersonId || undefined}
      />

      {/* Confirmation Dialog for Deletion */}
      <ConfirmDialog
        isOpen={Boolean(deletingPerson)}
        onClose={() => setDeletingPerson(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Person"
        message={`Are you sure you want to delete ${deletingPerson?.full_name}? This will also remove all associated late entries and recalculate cumulative fines.`}
        confirmText="Confirm Delete"
        loading={loadingAction}
      />

      {/* Complete Late History Modal */}
      <PersonHistoryModal
        isOpen={Boolean(viewingHistoryPerson)}
        person={viewingHistoryPerson}
        onClose={() => setViewingHistoryPerson(null)}
      />
    </div>
  );
};
