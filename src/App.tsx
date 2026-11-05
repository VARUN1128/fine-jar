import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFineTrack } from '@/context/FineTrackContext';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { PublicOverview } from '@/components/public/PublicOverview';
import { DailyLateTracker } from '@/components/public/DailyLateTracker';
import { IndividualSummaryTable } from '@/components/public/IndividualSummaryTable';
import { AllRecordsExplorer } from '@/components/public/AllRecordsExplorer';
import { AnalyticsCharts } from '@/components/public/AnalyticsCharts';
import { PersonHistoryModal } from '@/components/public/PersonHistoryModal';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminLoginModal } from '@/components/auth/AdminLoginModal';
import { PersonSummary } from '@/types/database';
import { Terminal } from 'lucide-react';

export const App: React.FC = () => {
  const { isAdmin } = useAuth();
  const { loading: dataLoading } = useFineTrack();

  const [currentView, setCurrentView] = useState<'public' | 'admin'>('public');
  const [activeTab, setActiveTab] = useState<'daily' | 'summary' | 'all' | 'analytics'>('daily');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedPersonForHistory, setSelectedPersonForHistory] = useState<PersonSummary | null>(null);

  const handleAdminAccess = () => {
    if (isAdmin) {
      setCurrentView('admin');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setCurrentView('admin');
  };

  if (currentView === 'admin' && isAdmin) {
    return <AdminLayout onBackToPublic={() => setCurrentView('public')} />;
  }

  return (
    <div className="min-h-screen bg-[#020303] text-[#d3dbd5] flex flex-col justify-between selection:bg-[#38ff8e] selection:text-[#020303] font-mono">
      <div>
        {/* Public Top Navbar */}
        <PublicNavbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onNavigateToAdmin={handleAdminAccess}
        />

        {/* Main Content with Green Signal Rail */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          <div className="cyber-rail pl-4 sm:pl-6 space-y-6">
            {/* Public Overview & Metrics */}
            <PublicOverview onSelectPerson={(person) => setSelectedPersonForHistory(person)} />

            {/* Active Tab View */}
            <div className="pt-2">
              {activeTab === 'daily' && (
                <DailyLateTracker onSelectPerson={(person) => setSelectedPersonForHistory(person)} />
              )}

              {activeTab === 'summary' && (
                <IndividualSummaryTable onSelectPerson={(person) => setSelectedPersonForHistory(person)} />
              )}

              {activeTab === 'all' && (
                <AllRecordsExplorer onSelectPerson={(person) => setSelectedPersonForHistory(person)} />
              )}

              {activeTab === 'analytics' && <AnalyticsCharts />}
            </div>
          </div>

          {/* Large Electric Green Statement */}
          <div className="mt-12 p-6 sm:p-8 bg-[#090e0b] border border-[#304c3b] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-2 bg-[#65f8ff]" />
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#ff65d8]" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-[10px] text-[#65f8ff] uppercase tracking-wider mb-1">
                  // DISCIPLINE_DIRECTIVE_09
                </p>
                <h3 className="font-display text-xl sm:text-2xl font-black text-[#38ff8e] uppercase tracking-tight">
                  PUNCTUALITY IS NON-NEGOTIABLE. SIGNAL OVER NOISE.
                </h3>
                <p className="text-xs text-[#c2cbc5] mt-1">
                  Enforcing standardized operational rigor for modern builders. Flat ₹100 levy recorded dynamically with 0ms replication.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAdminAccess}
                className="px-4 py-2 text-xs font-mono font-bold uppercase text-[#020303] bg-[#38ff8e] border border-[#38ff8e] hover:bg-transparent hover:text-[#38ff8e] clip-corner-diagonal shrink-0"
              >
                ADMIN_ACCESS_GATE
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Global Person History Modal */}
      <PersonHistoryModal
        isOpen={Boolean(selectedPersonForHistory)}
        person={selectedPersonForHistory}
        onClose={() => setSelectedPersonForHistory(null)}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Compact Directory Footer */}
      <footer className="mt-12 bg-[#090e0b] border-t border-[#304c3b] py-6 text-xs text-[#c2cbc5] font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#38ff8e]" />
            <span className="font-bold text-[#f8fffa] uppercase">FINETRACK // SYS_VERSION_2.0</span>
            <span className="text-[#304c3b]">|</span>
            <span className="text-[11px] text-[#c2cbc5]">CYBERPUNK TELEMETRY INTERFACE</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span>POSTGRESQL_RLS: <strong className="text-[#38ff8e]">ACTIVE</strong></span>
            <span className="text-[#304c3b]">/</span>
            <span>LEVY: <strong className="text-[#ff65d8]">₹100.00 / DAY</strong></span>
            <span className="text-[#304c3b]">/</span>
            <button
              onClick={handleAdminAccess}
              className="text-[#38ff8e] hover:underline uppercase font-bold"
            >
              [ADMIN_PORTAL]
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default App;
