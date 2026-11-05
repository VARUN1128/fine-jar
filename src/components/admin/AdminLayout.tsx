import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  LogOut,
  ArrowLeft,
  ShieldCheck,
  PlusCircle,
  Menu,
  X,
  Terminal,
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
    { id: 'overview', label: 'TELEMETRY_OVERVIEW', icon: LayoutDashboard },
    { id: 'records', label: 'LATE_RECORDS_MATRIX', icon: ClipboardList },
    { id: 'people', label: 'MEMBERS_DIRECTORY', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#020303] text-[#d3dbd5] flex flex-col md:flex-row font-mono">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#090e0b] text-[#f8fffa] p-3 flex items-center justify-between border-b border-[#304c3b]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#38ff8e]" />
          <span className="font-display font-bold text-xs uppercase tracking-wider">
            FINETRACK // ADMIN
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1 border border-[#304c3b] text-[#f8fffa]"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Cyberpunk Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-[#090e0b] border-r border-[#304c3b] flex flex-col justify-between p-4 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-5">
          {/* Brand & Terminal Header */}
          <div>
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#304c3b]">
              <div className="w-8 h-8 bg-[#020303] border border-[#38ff8e] text-[#38ff8e] flex items-center justify-center font-bold">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-display text-sm font-bold text-[#f8fffa] uppercase tracking-wide">
                  FINETRACK_ADMIN
                </h1>
                <div className="flex items-center gap-1.5 text-[10px] text-[#38ff8e]">
                  <span className="w-1.5 h-1.5 bg-[#38ff8e] animate-pulse" />
                  <span>SESSION_ENCRYPTED</span>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsMarkLateOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-mono font-bold uppercase text-[#020303] bg-[#38ff8e] border border-[#38ff8e] hover:bg-transparent hover:text-[#38ff8e] clip-corner-diagonal"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>RECORD_LATE (₹100)</span>
              </button>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#c2cbc5] px-2 block">
              // SUBSYSTEMS
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
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider text-left border ${
                    isActive
                      ? 'bg-[#38ff8e] text-[#020303] border-[#38ff8e]'
                      : 'text-[#d3dbd5] bg-transparent border-transparent hover:border-[#304c3b] hover:bg-[#020303] hover:text-[#38ff8e]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#304c3b] space-y-2">
          <div className="p-2 bg-[#020303] border border-[#304c3b]">
            <p className="text-[9px] text-[#c2cbc5] uppercase">OPERATOR_ID</p>
            <p className="text-[11px] font-bold text-[#f8fffa] truncate font-mono">
              {user?.email || 'fine@gmail.com'}
            </p>
          </div>

          <button
            type="button"
            onClick={onBackToPublic}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-bold uppercase text-[#c2cbc5] hover:text-[#f8fffa] border border-[#304c3b] hover:border-[#65f8ff]"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#65f8ff]" />
            <span>PUBLIC_DASHBOARD</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-bold uppercase text-[#ff65d8] border border-[#304c3b] hover:border-[#ff65d8] hover:bg-[#ff65d8]/10"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>TERMINATE_SESSION</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area with Green Signal Rail */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full cyber-rail pl-6 sm:pl-8">
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
