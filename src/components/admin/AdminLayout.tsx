import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Clock,
  LogOut,
  ArrowLeft,
  ShieldCheck,
  Radio,
  PlusCircle,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFineTrack } from '@/context/FineTrackContext';
import { AdminOverview } from './AdminOverview';
import { ManagePeople } from './ManagePeople';
import { LateRecordsTable } from './LateRecordsTable';
import { MarkLateModal } from './MarkLateModal';
import { PersonModal } from './PersonModal';

interface AdminLayoutProps {
  onBackToPublic: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToPublic }) => {
  const { user, signOut } = useAuth();
  const { realtimeStatus } = useFineTrack();

  const [activeSection, setActiveSection] = useState<'overview' | 'people' | 'records'>('overview');
  const [isMarkLateOpen, setIsMarkLateOpen] = useState(false);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    onBackToPublic();
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'records', label: 'Late Records Management', icon: ClipboardList },
    { id: 'people', label: 'Manage People', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-rose-400" />
          <span className="font-bold text-sm tracking-tight">FineTrack Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-5 transition-transform duration-200 border-r border-slate-800 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Logo & Admin Status */}
          <div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-500 text-white flex items-center justify-center font-bold shadow-md shadow-rose-900/40">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-tight">FineTrack Admin</h1>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                  <span>Realtime Synchronized</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-5 pt-4 border-t border-slate-800 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsMarkLateOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Mark Late (₹100)</span>
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3">
              Navigation
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id as any);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer actions: Return to public & Logout */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <div className="px-3 py-2 bg-slate-800/70 rounded-xl mb-3">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Signed In As</p>
            <p className="text-xs font-semibold text-white truncate">
              {user?.email || 'fine@gmail.com'}
            </p>
          </div>

          <button
            type="button"
            onClick={onBackToPublic}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Public Live Dashboard</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {activeSection === 'overview' && (
          <AdminOverview
            onOpenMarkLate={() => setIsMarkLateOpen(true)}
            onOpenAddPerson={() => setIsAddPersonOpen(true)}
            onNavigateToRecords={() => setActiveSection('records')}
            onNavigateToPeople={() => setActiveSection('people')}
          />
        )}

        {activeSection === 'records' && (
          <LateRecordsTable onOpenNewLateModal={() => setIsMarkLateOpen(true)} />
        )}

        {activeSection === 'people' && <ManagePeople />}
      </main>

      {/* Modals */}
      <MarkLateModal isOpen={isMarkLateOpen} onClose={() => setIsMarkLateOpen(false)} />
      <PersonModal isOpen={isAddPersonOpen} onClose={() => setIsAddPersonOpen(false)} />
    </div>
  );
};
